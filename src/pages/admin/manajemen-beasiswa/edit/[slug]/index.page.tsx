'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import Select from 'react-select';
import Input from '@/components/form/Input';
import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';
import SelectInput from '@/components/form/SelectInput';
import useAuthStore from '@/store/useAuthStore';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';
import withAuth from '@/components/hoc/withAuth';

const jenisOptions = [
  { value: 'FULL', label: 'Full Scholarship' },
  { value: 'PARTIAL', label: 'Partial Scholarship' },
];

const genderOptions = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
];

const jenjangOptions = [
  { value: 'SMA', label: 'SMA' },
  { value: 'D3', label: 'Diploma 3' },
  { value: 'S1', label: 'Sarjana (S1)' },
  { value: 'S2', label: 'Magister (S2)' },
  { value: 'S3', label: 'Doktor (S3)' },
];

export default withAuth(EditBeasiswaPage, 'admin');
function EditBeasiswaPage() {
  type FormValues = {
    nama: string;
    jenis: string;
    penyelenggara: string;
    benefit: string;
    open_registration: string;
    close_registration: string;
    khusus_daerah_tertentu: boolean;
    asal_daerah: string;
    status_batas_usia: boolean;
    min_umur: string;
    max_umur: string;
    status_gender_khusus: boolean;
    gender: string;
    jenjang: string[];
    status_semester_khusus: boolean;
    semester_khusus: string;
    status_fakultas_khusus: boolean;
    fakultas_khusus: string;
    status_jurusan_khusus: boolean;
    jurusan_khusus: string;
    status_kebutuhan_ipk: boolean;
    min_ipk: string;
    status_beasiswa_double: boolean;
    status_keluarga_tidak_mampu: boolean;
    status_disabilitas: boolean;
    img_path: string;
    kampus_bisa_daftar: string;
    link_guidebook: string;
    link_pendaftaran: string;
    persyaratan: string;
    lainnya: string;
    deskripsi: string;
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      nama: '',
      jenis: '',
      penyelenggara: '',
      benefit: '',
      open_registration: '',
      close_registration: '',
      khusus_daerah_tertentu: false,
      asal_daerah: '',
      status_batas_usia: false,
      min_umur: '',
      max_umur: '',
      status_gender_khusus: false,
      gender: '',
      jenjang: [],
      status_semester_khusus: false,
      semester_khusus: '',
      status_fakultas_khusus: false,
      fakultas_khusus: '',
      status_jurusan_khusus: false,
      jurusan_khusus: '',
      status_kebutuhan_ipk: false,
      min_ipk: '',
      status_beasiswa_double: false,
      status_keluarga_tidak_mampu: false,
      status_disabilitas: false,
      img_path: '',
      kampus_bisa_daftar: '',
      link_guidebook: '',
      link_pendaftaran: '',
      persyaratan: '',
      lainnya: '',
      deskripsi: '',
    },
  });

  const { handleSubmit, reset, watch, control, register } = methods;
  const router = useRouter();
  const { slug } = router.query;
  const token = useAuthStore((s) => s.token || s.user?.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Watch conditional fields
  const status_batas_usia = watch('status_batas_usia');
  const status_gender_khusus = watch('status_gender_khusus');
  const status_kebutuhan_ipk = watch('status_kebutuhan_ipk');
  const khusus_daerah_tertentu = watch('khusus_daerah_tertentu');
  const status_semester_khusus = watch('status_semester_khusus');
  const status_fakultas_khusus = watch('status_fakultas_khusus');
  const status_jurusan_khusus = watch('status_jurusan_khusus');

  // Fetch data beasiswa
  useEffect(() => {
    if (!slug || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Gagal memuat data beasiswa');
        const resJson = await res.json();
        // console.log('🧱 resJson:', resJson);
        // console.log('🧱 resJson.data:', resJson.data);
        // console.log('🧱 resJson.data[0]:', resJson.data?.[0]);
        const data =
          Array.isArray(resJson.data) ? resJson.data[0] : resJson.data || resJson;

        // Convert gender dari MALE/FEMALE ke L/P
        let genderValue = '';
        if (data.gender === 'MALE') genderValue = 'L';
        else if (data.gender === 'FEMALE') genderValue = 'P';

        // Reset form dengan data dari API
        reset({
          nama: data.nama || '',
          jenis: data.jenis || '',
          penyelenggara: data.penyelenggara || '',
          benefit: data.benefit || '',
          open_registration: data.open_registration
            ? new Date(data.open_registration).toISOString().split('T')[0]
            : '',
          close_registration: data.close_registration
            ? new Date(data.close_registration).toISOString().split('T')[0]
            : '',
          khusus_daerah_tertentu: data.khusus_daerah_tertentu || false,
          asal_daerah: data.asal_daerah || '',
          status_batas_usia: data.status_batas_usia || false,
          min_umur: data.min_umur?.toString() || '',
          max_umur: data.max_umur?.toString() || '',
          status_gender_khusus: data.status_gender_khusus || false,
          gender: genderValue,
          jenjang: Array.isArray(data.jenjang) ? data.jenjang : [],
          status_semester_khusus: data.status_semester_khusus || false,
          semester_khusus: data.semester_khusus?.toString() || '',
          status_fakultas_khusus: data.status_fakultas_khusus || false,
          fakultas_khusus: data.fakultas_khusus || '',
          status_jurusan_khusus: data.status_jurusan_khusus || false,
          jurusan_khusus: data.jurusan_khusus || '',
          status_kebutuhan_ipk: data.status_kebutuhan_ipk || false,
          min_ipk: data.min_ipk?.toString() || '',
          status_beasiswa_double: data.status_beasiswa_double || false,
          status_keluarga_tidak_mampu: data.status_keluarga_tidak_mampu || false,
          status_disabilitas: data.status_disabilitas || false,
          img_path: data.img_path || '',
          kampus_bisa_daftar: Array.isArray(data.kampus_bisa_daftar)
            ? data.kampus_bisa_daftar.join(', ')
            : '',
          link_guidebook: data.link_guidebook || '',
          link_pendaftaran: data.link_pendaftaran || '',
          persyaratan: Array.isArray(data.persyaratan)
            ? data.persyaratan.join(', ')
            : '',
          lainnya: Array.isArray(data.lainnya) ? data.lainnya.join(', ') : '',
          deskripsi: data.deskripsi || '',
        });
      } catch (err: any) {
        console.error(err);
        showToast(err.message, DANGER_TOAST);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token, reset]);

  const onSubmit = async (formData: any) => {
    try {
      setSaving(true);

      // Convert gender dari L/P ke MALE/FEMALE
      let gender: 'MALE' | 'FEMALE' | null = null;
      if (formData.gender === 'L') gender = 'MALE';
      else if (formData.gender === 'P') gender = 'FEMALE';

      const payload = {
        nama: formData.nama,
        jenis: formData.jenis,
        penyelenggara: formData.penyelenggara,
        benefit: formData.benefit || '',
        open_registration: new Date(formData.open_registration),
        close_registration: new Date(formData.close_registration),

        khusus_daerah_tertentu: !!formData.khusus_daerah_tertentu,
        asal_daerah: formData.asal_daerah || '',

        status_batas_usia: !!formData.status_batas_usia,
        min_umur: formData.min_umur ? Number(formData.min_umur) : null,
        max_umur: formData.max_umur ? Number(formData.max_umur) : null,

        status_gender_khusus: !!formData.status_gender_khusus,
        gender,

        jenjang: Array.isArray(formData.jenjang)
          ? formData.jenjang
          : [formData.jenjang].filter(Boolean),

        status_semester_khusus: !!formData.status_semester_khusus,
        semester_khusus: formData.semester_khusus ? Number(formData.semester_khusus) : null,

        status_fakultas_khusus: !!formData.status_fakultas_khusus,
        fakultas_khusus: formData.fakultas_khusus || '',

        status_jurusan_khusus: !!formData.status_jurusan_khusus,
        jurusan_khusus: formData.jurusan_khusus || '',

        status_kebutuhan_ipk: !!formData.status_kebutuhan_ipk,
        min_ipk: formData.min_ipk ? Number(formData.min_ipk) : null,

        status_beasiswa_double: !!formData.status_beasiswa_double,
        status_keluarga_tidak_mampu: !!formData.status_keluarga_tidak_mampu,
        status_disabilitas: !!formData.status_disabilitas,

        img_path: formData.img_path || '',
        kampus_bisa_daftar: formData.kampus_bisa_daftar
          ? formData.kampus_bisa_daftar.split(',').map((s: string) => s.trim())
          : [],
        link_guidebook: formData.link_guidebook || '',
        link_pendaftaran: formData.link_pendaftaran || '',
        persyaratan: formData.persyaratan
          ? formData.persyaratan.split(',').map((s: string) => s.trim())
          : [],
        lainnya: formData.lainnya
          ? formData.lainnya.split(',').map((s: string) => s.trim())
          : [],
        deskripsi: formData.deskripsi || '',
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal memperbarui data');
      }

      showToast('Beasiswa berhasil diperbarui', SUCCESS_TOAST);
      router.push('/admin/manajemen-beasiswa');
    } catch (err: any) {
      showToast(err.message, DANGER_TOAST);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="mt-10 text-center text-gray-500">Memuat data beasiswa...</p>
    );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col max-w-4xl gap-8 p-8 mx-auto"
      >
        <Typography
          variant="h3"
          weight="bold"
          className="py-4 text-center text-white rounded-lg shadow-md bg-primary-blue"
        >
          Edit Data Beasiswa
        </Typography>

        {/* Informasi Utama */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">
            Informasi Utama
          </Typography>
          <Input id="nama" label="Nama Beasiswa" validation={{ required: 'Nama beasiswa wajib diisi' }} />
          <SelectInput id="jenis" label="Jenis Beasiswa" validation={{ required: 'Jenis wajib dipilih' }}>
            <option value="">Pilih Jenis</option>
            {jenisOptions.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </SelectInput>
          <Input id="penyelenggara" label="Penyelenggara" validation={{ required: 'Penyelenggara wajib diisi' }} />
          <Input id="benefit" label="Benefit" />
        </section>

        {/* Periode Pendaftaran */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">
            Periode Pendaftaran
          </Typography>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              id="open_registration"
              label="Buka Pendaftaran"
              type="date"
              validation={{ required: 'Tanggal pembukaan wajib diisi' }}
            />
            <Input
              id="close_registration"
              label="Tutup Pendaftaran"
              type="date"
              validation={{ required: 'Tanggal penutupan wajib diisi' }}
            />
          </div>
        </section>

        {/* Batasan & Syarat */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">
            Batasan & Syarat
          </Typography>

          {/* Daerah */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('khusus_daerah_tertentu')} />
            <Typography variant="c1">Khusus daerah tertentu?</Typography>
          </label>
          {khusus_daerah_tertentu && <Input id="asal_daerah" label="Asal Daerah" />}

          {/* Umur */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_batas_usia')} />
            <Typography variant="c1">Batasi usia?</Typography>
          </label>
          {status_batas_usia && (
            <div className="flex flex-col gap-3 md:flex-row">
              <Input id="min_umur" label="Usia Minimum" type="number" />
              <Input id="max_umur" label="Usia Maksimum" type="number" />
            </div>
          )}

          {/* Gender */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_gender_khusus')} />
            <Typography variant="c1">Gender khusus?</Typography>
          </label>
          {status_gender_khusus && (
            <SelectInput id="gender" label="Gender">
              <option value="">Pilih Gender</option>
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </SelectInput>
          )}

          {/* IPK */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_kebutuhan_ipk')} />
            <Typography variant="c1">Butuh IPK minimum?</Typography>
          </label>
          {status_kebutuhan_ipk && (
            <Input id="min_ipk" label="Minimum IPK" type="number" step="0.01" />
          )}
        </section>

        {/* Jenjang */}
        <section className="flex flex-col gap-2 mt-4">
          <Typography variant="h5" weight="semibold" className="text-primary-blue">
            Jenjang Pendidikan
          </Typography>
          <Controller
            name="jenjang"
            control={control}
            rules={{ required: 'Pilih minimal satu jenjang' }}
            render={({ field }) => (
              <Select
                isMulti
                options={jenjangOptions}
                placeholder="Pilih Jenjang"
                value={jenjangOptions.filter((j) => field.value.includes(j.value))}
                onChange={(selected: any) =>
                  field.onChange(selected.map((opt: any) => opt.value))
                }
              />
            )}
          />
        </section>

        {/* Kondisi Tambahan */}
        <section className="flex flex-col gap-4 mt-4">
          <Typography variant="h5" weight="semibold" className="text-primary-blue">
            Kondisi Tambahan
          </Typography>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_semester_khusus')} />
            <Typography variant="c1">Semester khusus?</Typography>
          </label>
          {status_semester_khusus && (
            <Input id="semester_khusus" label="Semester (jika ada)" type="number" />
          )}

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_fakultas_khusus')} />
            <Typography variant="c1">Fakultas khusus?</Typography>
          </label>
          {status_fakultas_khusus && (
            <Input id="fakultas_khusus" label="Nama Fakultas" type="text" />
          )}

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_jurusan_khusus')} />
            <Typography variant="c1">Jurusan khusus?</Typography>
          </label>
          {status_jurusan_khusus && (
            <Input id="jurusan_khusus" label="Nama Jurusan" type="text" />
          )}

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_beasiswa_double')} />
            <Typography variant="c1">Izinkan double beasiswa?</Typography>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_keluarga_tidak_mampu')} />
            <Typography variant="c1">Khusus keluarga tidak mampu?</Typography>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_disabilitas')} />
            <Typography variant="c1">Khusus penyandang disabilitas?</Typography>
          </label>
        </section>

        {/* Link & Deskripsi */}
        <section className="flex flex-col gap-4 mt-4">
          <Input id="img_path" label="Path Gambar (opsional)" />
          <Input id="kampus_bisa_daftar" label="Kampus Bisa Daftar (pisahkan dengan koma)" />
          <Input id="persyaratan" label="Persyaratan (pisahkan dengan koma)" />
          <Input id="lainnya" label="Lainnya (pisahkan dengan koma)" />
          <Input id="link_guidebook" label="Link Guidebook" />
          <Input id="link_pendaftaran" label="Link Pendaftaran" />
          <Input id="deskripsi" label="Deskripsi" validation={{ required: 'Deskripsi wajib diisi' }} />
        </section>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="warning" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}