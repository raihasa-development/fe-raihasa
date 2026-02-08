'use client';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { FiArrowLeft, FiSave, FiCalendar, FiInfo, FiCheckCircle, FiLink } from 'react-icons/fi';

import {
  DANGER_TOAST,
  SUCCESS_TOAST,
  showToast,
} from '@/components/Toast';
import Input from '@/components/form/Input';
import TextArea from '@/components/form/TextArea';
import Button from '@/components/buttons/Button';
import IconButton from '@/components/buttons/IconButton';
import Typography from '@/components/Typography';
import useAuthStore from '@/store/useAuthStore';
import SelectInput from '@/components/form/SelectInput';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';
import AdminDashboard from '@/layouts/AdminDashboard';

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

  const { handleSubmit, register, watch, control, formState: { errors } } = methods;
  const router = useRouter();
  const token = useAuthStore((state) => state.token || state.user?.token);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const status_batas_usia = watch('status_batas_usia');
  const status_gender_khusus = watch('status_gender_khusus');
  const status_kebutuhan_ipk = watch('status_kebutuhan_ipk');
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
        jenjang: Array.isArray(formData.jenjang) ? formData.jenjang : [formData.jenjang].filter(Boolean),
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
        kampus_bisa_daftar: formData.kampus_bisa_daftar ? formData.kampus_bisa_daftar.split(',').map((s: string) => s.trim()) : [],
        link_guidebook: formData.link_guidebook || '',
        link_pendaftaran: formData.link_pendaftaran || '',
        persyaratan: formData.persyaratan ? formData.persyaratan.split(',').map((s: string) => s.trim()) : [],
        lainnya: formData.lainnya ? formData.lainnya.split(',').map((s: string) => s.trim()) : [],
        deskripsi: formData.deskripsi || '',
      };

      // console.log('Payload to be sent:', payload);

      await api.post('/scholarship', payload);

      showToast('Beasiswa berhasil disimpan', SUCCESS_TOAST);
      router.push('/admin/manajemen-beasiswa');
    } catch (err: any) {
      showToast(err.message, DANGER_TOAST);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <AdminDashboard withSidebar>
      <div className="flex items-center gap-4 mb-6">
        <IconButton
          variant='unstyled'
          icon={FiArrowLeft}
          onClick={() => router.back()}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
        />
        <div>
          <Typography variant="h5" className="font-bold text-gray-900">Input Data Beasiswa</Typography>
          <Typography variant="c1" className="text-gray-500">Tambahkan informasi lengkap beasiswa baru.</Typography>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">

          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card: Informasi Utama */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <FiInfo className="text-[#1B7691]" />
                <Typography variant="h6" className="font-bold text-gray-800">Informasi Utama</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input id="nama" label="Nama Beasiswa" placeholder="Contoh: Beasiswa Unggulan Kemendikbud" validation={{ required: 'Nama beasiswa wajib diisi' }} />
                </div>
                <SelectInput id="jenis" label="Jenis Pendanaan" validation={{ required: 'Jenis wajib dipilih' }}>
                  <option value="">Pilih Jenis</option>
                  {jenisOptions.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </SelectInput>
                <Input id="penyelenggara" label="Penyelenggara" placeholder="Contoh: Kemendikbud" validation={{ required: 'Penyelenggara wajib diisi' }} />

                <div className="md:col-span-2">
                  <div className="space-y-1">
                    <Typography variant="c1" weight="semibold" className="text-sm">Jenjang Pendidikan <span className="text-red-500">*</span></Typography>
                    <Controller
                      name="jenjang"
                      control={control}
                      rules={{ required: 'Pilih minimal satu jenjang' }}
                      render={({ field }) => (
                        <Select
                          isMulti
                          options={jenjangOptions}
                          placeholder="Pilih Jenjang..."
                          value={jenjangOptions.filter(j => field.value.includes(j.value))}
                          onChange={(selected: any) => field.onChange(selected.map((opt: any) => opt.value))}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderColor: errors.jenjang ? '#EF4444' : '#E2E8F0',
                              borderRadius: '0.5rem',
                              padding: '2px',
                              boxShadow: 'none',
                              '&:hover': { borderColor: '#CBD5E1' }
                            })
                          }}
                        />
                      )}
                    />
                    {errors.jenjang && <Typography className="text-red-500 text-xs mt-1">{String(errors.jenjang.message)}</Typography>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Input id="benefit" label="Benefit Singkat" placeholder="Contoh: Uang Saku, Biaya Kuliah" />
                </div>
              </div>
            </div>

            {/* Card: Persyaratan & Kriteria */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <FiCheckCircle className="text-[#1B7691]" />
                <Typography variant="h6" className="font-bold text-gray-800">Persyaratan & Kriteria</Typography>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-lg space-y-4 mb-4 border border-gray-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-[#1B7691]">Khusus daerah tertentu?</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691]" {...register('khusus_daerah_tertentu')} />
                </label>
                {khusus_daerah_tertentu && <Input id="asal_daerah" placeholder="Contoh: Jawa Barat, Papua" />}

                <hr className="border-gray-200/60" />

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-[#1B7691]">Batasan Usia?</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691]" {...register('status_batas_usia')} />
                </label>
                {status_batas_usia && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="min_umur" placeholder="Min" type="number" />
                    <Input id="max_umur" placeholder="Max" type="number" />
                  </div>
                )}

                <hr className="border-gray-200/60" />

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-[#1B7691]">Syarat IPK Minimum?</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691]" {...register('status_kebutuhan_ipk')} />
                </label>
                {status_kebutuhan_ipk && <Input id="min_ipk" placeholder="Contoh: 3.25" type="number" step="0.01" />}

                <hr className="border-gray-200/60" />

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 font-medium group-hover:text-[#1B7691]">Gender Khusus?</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691]" {...register('status_gender_khusus')} />
                </label>
                {status_gender_khusus && (
                  <SelectInput id="gender">
                    <option value="">Pilih Gender</option>
                    {genderOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </SelectInput>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-[#1B7691] focus:ring-[#1B7691]" {...register("status_beasiswa_double")} />
                  Izinkan Double Funding?
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-[#1B7691] focus:ring-[#1B7691]" {...register("status_keluarga_tidak_mampu")} />
                  Khusus Keluarga Tidak Mampu (SKTM)?
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-[#1B7691] focus:ring-[#1B7691]" {...register("status_disabilitas")} />
                  Prioritas Disabilitas?
                </label>
              </div>
            </div>

            {/* Card: Deskripsi & Links */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <FiLink className="text-[#1B7691]" />
                <Typography variant="h6" className="font-bold text-gray-800">Detail & Tautan</Typography>
              </div>
              <div className="space-y-4">
                <TextArea id="deskripsi" label="Deskripsi Lengkap" rows={6} placeholder="Jelaskan detail program, cakupan biaya, dan visi misi beasiswa..." validation={{ required: 'Deskripsi wajib diisi' }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="link_pendaftaran" label="Link Pendaftaran" placeholder="https://..." />
                  <Input id="link_guidebook" label="Link Guidebook / Panduan" placeholder="https://..." />
                </div>

                <Input id="img_path" label="Image URL Banner" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="lg:col-span-1 space-y-6">

            {/* Card: Jadwal */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <FiCalendar className="text-[#1B7691]" />
                <Typography variant="h6" className="font-bold text-gray-800">Jadwal</Typography>
              </div>
              <div className="space-y-4">
                <Input id="open_registration" label="Dibuka Tanggal" type="date" validation={{ required: 'Required' }} />
                <Input id="close_registration" label="Ditutup Tanggal" type="date" validation={{ required: 'Required' }} />

                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                  Pastikan tanggal sesuai dengan zona waktu WIB.
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center bg-[#1B7691] hover:bg-[#15627a]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSave /> Simpan Beasiswa
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="unstyled"
                  onClick={() => router.back()}
                  className="w-full mt-2 justify-center text-gray-500 hover:text-gray-700"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>

        </form>
      </FormProvider>
    </AdminDashboard>
  );
}
