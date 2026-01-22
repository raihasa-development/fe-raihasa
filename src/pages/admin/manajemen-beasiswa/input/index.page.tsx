'use client';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  DANGER_TOAST,
  SUCCESS_TOAST,
  showToast,
} from '@/components/Toast';
import Input from '@/components/form/Input';
import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';
import useAuthStore from '@/store/useAuthStore';
import SelectInput from '@/components/form/SelectInput';
import { form, input } from '@heroui/react';
import { label } from 'yet-another-react-lightbox';
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

export default withAuth(InputBeasiswaPage, 'admin');
function InputBeasiswaPage() {
  const methods = useForm({
    defaultValues: {
      nama: "",
      jenis: "",
      penyelenggara: "",
      benefit: "",
      open_registration: null,
      close_registration: null,
      khusus_daerah_tertentu: false,
      asal_daerah: "",
      status_batas_usia: false,
      min_umur: null,
      max_umur: null,
      status_gender_khusus: false,
      gender: "",
      jenjang: "",
      status_semester_khusus: false,
      semester_khusus: "",
      status_fakultas_khusus: false,
      status_jurusan_khusus: false,
      status_kebutuhan_ipk: false,
      min_ipk: null,
      status_beasiswa_double: false,
      status_keluarga_tidak_mampu: false,
      status_disabilitas: false,
      img_path: "",
      kampus_bisa_daftar: "",
      link_guidebook: "",
      link_pendaftaran: "",
      persyaratan: "",
      lainnya: "",
      deskripsi: "",
    },
  });

  const { handleSubmit, register, watch, control } = methods;
  const router = useRouter();
  const token = useAuthStore((state) => state.token || state.user?.token);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return <p className="text-center text-gray-500">Memuat data auth...</p>;

  const status_batas_usia = watch('status_batas_usia');
  const status_gender_khusus = watch('status_gender_khusus');
  const status_kebutuhan_ipk = watch('status_kebutuhan_ipk');
  const fakultasKhusus = watch("status_fakultas_khusus");
  const jurusanKhusus = watch("status_jurusan_khusus");
  const khusus_daerah_tertentu = watch('khusus_daerah_tertentu');

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);
      if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');

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
        min_umur: Number(formData.min_umur),
        max_umur: Number(formData.max_umur),

        status_gender_khusus: !!formData.status_gender_khusus,
        gender,

        jenjang: Array.isArray(formData.jenjang)
          ? formData.jenjang
          : [formData.jenjang].filter(Boolean),

        status_semester_khusus: !!formData.status_semester_khusus,
        semester_khusus: Number(formData.semester_khusus),

        status_fakultas_khusus: !!formData.status_fakultas_khusus,
        status_jurusan_khusus: !!formData.status_jurusan_khusus,

        status_kebutuhan_ipk: !!formData.status_kebutuhan_ipk,
        min_ipk: Number(formData.min_ipk),

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

      // console.log('Payload to be sent:', payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menyimpan data beasiswa');
      }

      showToast('Beasiswa berhasil disimpan', SUCCESS_TOAST);
      router.push('/admin');
    } catch (err: any) {
      showToast(err.message, DANGER_TOAST);
    } finally {
      setLoading(false);
    }

  };



  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-4xl gap-8 p-8 mx-auto">
        <Typography variant="h3" weight="bold" className="py-4 text-center text-white rounded-lg shadow-md bg-primary-blue">
          Input Data Beasiswa
        </Typography>

        {/* Informasi Utama */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">Informasi Utama</Typography>
          <Input id="nama" label="Nama Beasiswa" validation={{ required: 'Nama beasiswa wajib diisi' }} />
          <SelectInput id="jenis" label="Jenis Beasiswa" validation={{ required: 'Jenis wajib dipilih' }}>
            <option value="">Pilih Jenis</option>
            {jenisOptions.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
          </SelectInput>
          <Input id="penyelenggara" label="Penyelenggara" validation={{ required: 'Penyelenggara wajib diisi' }} />
          <Input id="benefit" label="Benefit" />
        </section>

        {/* Periode Pendaftaran */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">Periode Pendaftaran</Typography>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input id="open_registration" label="Buka Pendaftaran" type="date" validation={{ required: 'Tanggal pembukaan wajib diisi' }} />
            <Input id="close_registration" label="Tutup Pendaftaran" type="date" validation={{ required: 'Tanggal penutupan wajib diisi' }} />
          </div>
        </section>

        {/* Daerah & Batasan */}
        <section className="flex flex-col gap-4">
          <Typography variant="h5" weight="semibold" className="mt-8 text-primary-blue">Batasan & Syarat</Typography>

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
              {genderOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </SelectInput>
          )}

          {/* IPK */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('status_kebutuhan_ipk')} />
            <Typography variant="c1">Butuh IPK minimum?</Typography>
          </label>
          {status_kebutuhan_ipk && <Input id="min_ipk" label="Minimum IPK" type="number" step="0.01" />}
        </section>

        {/* Jenjang */}
        <section className="flex flex-col gap-2 mt-4">
          <Typography variant="h5" weight="semibold" className="text-primary-blue">Jenjang Pendidikan</Typography>
          <Controller
            name="jenjang"
            control={control}
            rules={{ required: 'Pilih minimal satu jenjang' }}
            render={({ field }) => (
              <Select
                isMulti
                options={jenjangOptions}
                placeholder="Pilih Jenjang"
                value={jenjangOptions.filter(j => field.value.includes(j.value))}
                onChange={(selected: any) => field.onChange(selected.map((opt: any) => opt.value))}
              />
            )}
          />
        </section>

        <section className="flex flex-col gap-4 mt-4">
          <Typography
            variant="h5"
            weight="semibold"
            className="text-primary-blue"
          >
            Kondisi Tambahan
          </Typography>

          <label>
            <input type="checkbox" {...register("status_semester_khusus")} /> Semester
            khusus?
          </label>

          {watch("status_semester_khusus") && (
            <Input
              id="semester_khusus"
              label="Semester (jika ada)"
              type="number"
              {...register("semester_khusus")}
            />
          )}

          <label>
            <input type="checkbox" {...register("status_fakultas_khusus")} /> Fakultas
            khusus?
          </label>

          {watch("status_fakultas_khusus") && (
            <Input
              id="fakultas_khusus"
              label="Nama Fakultas"
              type="text"
              {...register("status_fakultas_khusus")}
            />
          )}

          <label>
            <input type="checkbox" {...register("status_jurusan_khusus")} /> Jurusan
            khusus?
          </label>

          {watch("status_jurusan_khusus") && (
            <Input
              id="jurusan_khusus"
              label="Nama Jurusan"
              type="text"
              {...register("status_jurusan_khusus")}
            />
          )}

          <label>
            <input type="checkbox" {...register("status_beasiswa_double")} /> Izinkan
            double beasiswa?
          </label>

          <label>
            <input
              type="checkbox"
              {...register("status_keluarga_tidak_mampu")}
            />{" "}
            Khusus keluarga tidak mampu?
          </label>

          <label>
            <input type="checkbox" {...register("status_disabilitas")} /> Khusus
            penyandang disabilitas?
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

        <div className="flex flex-col justify-center gap-4 mt-6 md:flex-row">
          <Button type="button" variant="warning" onClick={() => router.back()}>Kembali</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
