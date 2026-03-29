# Analisis Payment dan Pricing - Raih Asa (Pembaruan)

Terakhir diperbarui: 2026-03-29

## 1. Ringkasan Eksekutif

Dokumen ini merefleksikan kondisi implementasi terkini setelah stabilisasi payment dan rollout LMS free-access.

Yang sudah terimplementasi dan tervalidasi di kode:
- Stack pricing v2 aktif di Prisma dan service layer (`PricingPlan`, `Subscription`, `PaymentV2`, `PromoCode`, `PromoRedemption`).
- Checkout sudah memakai endpoint v2 dan mendukung:
   - validasi promo dari backend,
   - penawaran otomatis user baru berbasis promo code,
   - perhitungan diskon bertingkat dengan guard rails.
- Hardening webhook sudah diterapkan:
   - jalur webhook legacy diteruskan ke handler v2,
   - ada idempotency gate untuk callback berulang,
   - alur update side effect payment/subscription berbasis transaksi.
- Mitigasi race promo sudah aktif dengan pending reservation window (60 menit).
- LMS free-access sudah end-to-end (`Modules.is_free`) dengan toggle admin dan otorisasi di sisi user.

Risiko residual saat ini:
- Workflow migrasi lokal bisa drift jika file migration yang sudah pernah applied diubah lagi.
- Script deployment masih memiliki `db pull` di pre-migrate prod, yang berpotensi menimbulkan drift schema pada source file.

## 2. Kondisi Arsitektur Saat Ini

### 2.1 Status Model Data

Entitas payment/pricing v2 yang aktif:
- `PricingPlan`
- `Subscription`
- `PaymentV2`
- `PromoCode`
- `PromoRedemption`

Model akses LMS sekarang sudah mendukung free access per modul:
- `Modules.is_free` (boolean, default false)

Tabel legacy masih ada untuk kompatibilitas dan migrasi bertahap:
- `Program`
- `ProductProgram`
- `PaketLMS`
- `UserProgram`
- `Pembayaran`

### 2.2 Permukaan Route Aktif

Route inti v2 pricing/payment/admin yang aktif:
- `GET /pricing/plans`
- `GET /pricing/plans/:id`
- `POST /pricing/validate-promo`
- `POST /pricing/payments/create`
- `POST /pricing/payments/notification`
- `GET /pricing/subscription/status`
- `GET /pricing/transactions` (admin)
- `GET/POST/PATCH/DELETE /pricing/admin/plans` (admin)
- `GET/POST/PATCH/DELETE /pricing/admin/promos` (admin)
- `GET /pricing/admin/affiliates` (admin)

Perilaku route webhook legacy:
- `POST /payments/notification` dipertahankan sebagai entrypoint kompatibilitas dan diteruskan ke alur notifikasi v2.

## 3. Rollout LMS Free Access (Baru)

### 3.1 Ruang Lingkup Implementasi

Backend:
- Menambahkan `Modules.is_free` pada Prisma schema dan migration.
- Otorisasi LMS service kini mengizinkan akses jika modul ditandai free.
- API create/update modul menerima field `is_free` dari form admin.

Frontend admin:
- Form kursus admin punya checkbox free-access.
- List kursus admin menampilkan badge free.

Frontend user:
- Halaman list dan detail learning memakai `is_authorize` plus `is_free`.
- State lock sekarang berbasis modul, bukan hanya membership global.
- Chip free-access tampil pada card/detail user dan modul free diprioritaskan di urutan atas.

### 3.2 Aturan Bisnis

- Jika `is_free = true`: dapat diakses user non-member.
- Jika `is_free = false`: membutuhkan otorisasi valid (membership aktif atau jalur schema access yang diizinkan).

## 4. Rekap Pengiriman (Pekerjaan Selesai)

Payment dan promo:
- Perbaikan kompatibilitas amount checkout (`final_amount` dan fallback field legacy).
- Penambahan hardening promo CRUD dan sanitasi payload di sisi admin.
- Penambahan fitur activate/deactivate dan edit/delete promo di admin.
- Implementasi dynamic new-user promo (tidak hardcoded), plus guard anti double-apply.

Webhook dan konsistensi:
- Route webhook legacy kini bridge ke alur v2.
- Idempotency gate webhook v2 ditambahkan (mencegah side effect ganda).
- Side effect dikonsolidasikan dalam jalur transaksi.
- Race kuota promo ditekan via logika pending reservation window.

Akses kontrol dan UX:
- `/home` dan route learning kini menghormati otorisasi level modul.
- Akses direct URL non-member ke modul berbayar diblokir.
- Modul free diprioritaskan tampil lebih awal dengan chip/badge yang jelas.

Perbaikan operasional:
- Menangani mismatch runtime Prisma client (`no-engine` generation side effect).
- Memulihkan status migrasi lokal tanpa wajib reset lewat migrate resolve + deploy.

## 5. Item Terbuka dan Rekomendasi Lanjutan

1. Hapus `db pull` dari script pre-migrate production untuk mencegah schema source tertimpa.
2. Jadikan file migration immutable setelah applied di environment bersama.
3. Standarisasi proses migrasi lokal untuk menghindari drift (resolve/deploy dulu, lalu migration baru di baseline DB bersih bila perlu).
4. Tambahkan automated test untuk idempotency webhook dan race pending reservation promo.

## 6. Test Case QA Detail (Dalam File yang Sama)

### 6.1 Payment dan Checkout

TC-PAY-001: Checkout sukses dasar
- Prasyarat: user belum punya subscription aktif, plan yang dipilih aktif.
- Langkah:
   1. Buka halaman checkout dari list plan.
   2. Klik bayar dan selesaikan settlement Midtrans.
   3. Tunggu callback webhook diproses.
- Hasil yang diharapkan:
   - Status PaymentV2 menjadi `PAID`.
   - Subscription menjadi aktif dengan start/end yang benar.
   - User bisa mengakses modul premium.

TC-PAY-002: Idempotency callback duplikat
- Prasyarat: ada satu payment yang sudah selesai.
- Langkah:
   1. Replay payload notifikasi Midtrans yang sama (order ID sama) beberapa kali.
- Hasil yang diharapkan:
   - Tidak ada duplikasi extension subscription/penambahan token/redemption row.
   - Handler mengembalikan perilaku sukses/no-op untuk callback berulang.

TC-PAY-003: Guard subscription aktif
- Prasyarat: user sudah punya subscription aktif.
- Langkah:
   1. Coba buat payment baru untuk user yang sama.
- Hasil yang diharapkan:
   - API menolak dengan pesan conflict yang jelas.
   - Tidak ada subscription/payment pending baru.

TC-PAY-004: Kompatibilitas webhook legacy
- Prasyarat: server berjalan dengan dua route webhook.
- Langkah:
   1. Kirim notifikasi ke route legacy `/payments/notification`.
- Hasil yang diharapkan:
   - Request diteruskan ke jalur pemrosesan v2.
   - Hasil konsisten dengan perilaku route v2.

### 6.2 Promo dan Diskon

TC-PROMO-001: Validasi promo tambahan
- Prasyarat: promo code aktif dan kuota masih tersedia.
- Langkah:
   1. Masukkan promo di checkout.
   2. Terapkan promo.
- Hasil yang diharapkan:
   - Preview diskon tampil.
   - Final amount dihitung benar.

TC-PROMO-002: Stack auto offer + promo tambahan
- Prasyarat: akun user baru eligible dalam window offer.
- Langkah:
   1. Buka checkout dan pastikan auto offer aktif.
   2. Terapkan promo referral/general tambahan.
- Hasil yang diharapkan:
   - Diskon auto dan diskon promo tampil terpisah.
   - Final amount mematuhi batas cap dan floor.

TC-PROMO-003: Blokir kode auto-offer dipakai ulang
- Prasyarat: auto offer aktif untuk user.
- Langkah:
   1. Input kode auto-offer yang sama di field promo manual.
- Hasil yang diharapkan:
   - Validasi ditolak dengan pesan penjelasan.

TC-PROMO-004: Penanganan race max uses saat pending reservation
- Prasyarat: promo dengan `max_uses` rendah.
- Langkah:
   1. Buat payment pending konkuren memakai promo yang sama.
   2. Dorong hingga melewati batas kuota.
- Hasil yang diharapkan:
   - Attempt baru setelah batas reservation ditolak.
   - Tidak ada over-allocation di luar batas yang ditentukan.

### 6.3 LMS Free Access dan Otorisasi

TC-LMS-001: Modul free untuk non-member
- Prasyarat: modul memiliki `is_free = true`, user uji tidak punya membership aktif.
- Langkah:
   1. Buka list learning.
   2. Buka detail modul free secara langsung.
- Hasil yang diharapkan:
   - Card modul ditandai chip Free Access.
   - Halaman detail terbuka dan konten dapat diakses.

TC-LMS-002: Modul paid terkunci untuk non-member
- Prasyarat: modul memiliki `is_free = false`, user uji tidak punya membership aktif.
- Langkah:
   1. Buka modul paid dari list atau direct URL.
- Hasil yang diharapkan:
   - User melihat state lock/upsell prompt.
   - Video/konten tidak dapat diakses.

TC-LMS-003: Admin toggle free on/off
- Prasyarat: admin login, modul tersedia.
- Langkah:
   1. Buka admin courses.
   2. Toggle checkbox free lalu simpan.
   3. Buka ulang sebagai user non-member.
- Hasil yang diharapkan:
   - `is_free` tersimpan.
   - Perilaku akses berubah sesuai nilai terbaru.

TC-LMS-004: Modul free diprioritaskan di list
- Prasyarat: terdapat kombinasi modul free dan paid.
- Langkah:
   1. Muat rekomendasi home dan list learning.
- Hasil yang diharapkan:
   - Modul free muncul di urutan atas.
   - Chip terlihat jelas di UI user.

### 6.4 Operasional Admin

TC-ADM-001: Buat modul dengan flag free
- Prasyarat: role admin.
- Langkah:
   1. Buat modul dengan checkbox free aktif.
- Hasil yang diharapkan:
   - Simpan API berhasil.
   - Modul tersimpan dengan `is_free = true`.

TC-ADM-002: Ubah modul dari free ke paid
- Prasyarat: sudah ada modul free.
- Langkah:
   1. Edit modul dan nonaktifkan free.
- Hasil yang diharapkan:
   - Simpan berhasil.
   - User non-member tidak bisa lagi mengakses modul tersebut.

TC-ADM-003: Promo CRUD dan toggle status
- Prasyarat: role admin.
- Langkah:
   1. Buat promo.
   2. Edit field.
   3. Deactivate lalu reactivate.
   4. Hapus promo jika tidak diblokir constraint.
- Hasil yang diharapkan:
   - UI dan API konsisten sesuai guard rails.

## 7. Checklist Eksekusi QA (Siap Pakai)

Gunakan format berikut untuk mengeksekusi seluruh test case di atas.

Kolom yang dipakai:
- `Test ID`
- `Modul`
- `PIC QA`
- `Environment`
- `Tanggal Uji`
- `Status` (PASS/FAIL/BLOCKED)
- `Evidence` (link screenshot/video/log)
- `Bug ID` (jika FAIL)
- `Catatan`

Template tabel:

| Test ID | Modul | PIC QA | Environment | Tanggal Uji | Status | Evidence | Bug ID | Catatan |
|---|---|---|---|---|---|---|---|---|
| TC-PAY-001 | Payment |  |  |  |  |  |  |  |
| TC-PAY-002 | Payment |  |  |  |  |  |  |  |
| TC-PAY-003 | Payment |  |  |  |  |  |  |  |
| TC-PAY-004 | Payment |  |  |  |  |  |  |  |
| TC-PROMO-001 | Promo |  |  |  |  |  |  |  |
| TC-PROMO-002 | Promo |  |  |  |  |  |  |  |
| TC-PROMO-003 | Promo |  |  |  |  |  |  |  |
| TC-PROMO-004 | Promo |  |  |  |  |  |  |  |
| TC-LMS-001 | LMS |  |  |  |  |  |  |  |
| TC-LMS-002 | LMS |  |  |  |  |  |  |  |
| TC-LMS-003 | LMS |  |  |  |  |  |  |  |
| TC-LMS-004 | LMS |  |  |  |  |  |  |  |
| TC-ADM-001 | Admin |  |  |  |  |  |  |  |
| TC-ADM-002 | Admin |  |  |  |  |  |  |  |
| TC-ADM-003 | Admin |  |  |  |  |  |  |  |

## 8. Template Laporan Bug QA

Gunakan template ini ketika status test case = FAIL.

- `Bug ID`: (mis. RAIHASA-123)
- `Test ID Terkait`: (mis. TC-LMS-002)
- `Judul`: ringkas dan jelas
- `Severity`: Critical/High/Medium/Low
- `Priority`: P1/P2/P3/P4
- `Environment`: staging/production/local
- `Akun Uji`: role + kondisi akun
- `Langkah Reproduksi`:
   1. ...
   2. ...
   3. ...
- `Expected Result`: ...
- `Actual Result`: ...
- `Evidence`: link screenshot/video/network log
- `Dampak Bisnis`: ...
- `Owner`: ...
- `Status`: Open/In Progress/Ready to Retest/Closed

## 9. UAT Sign-off Ringkas

Gunakan bagian ini saat seluruh regression selesai diuji.

- `Total Test Case`: 15
- `PASS`: ...
- `FAIL`: ...
- `BLOCKED`: ...
- `Open Bug Critical/High`: ...
- `Kesimpulan Rilis`: Layak Rilis / Tunda Rilis
- `Disetujui Oleh`: ...
- `Tanggal Sign-off`: ...
