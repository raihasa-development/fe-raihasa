'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import Select from 'react-select';
import { FiArrowLeft, FiSave, FiCalendar, FiInfo, FiCheckCircle, FiLink } from 'react-icons/fi';

import Input from '@/components/form/Input';
import TextArea from '@/components/form/TextArea';
import Button from '@/components/buttons/Button';
import IconButton from '@/components/buttons/IconButton';
import Typography from '@/components/Typography';
import SelectInput from '@/components/form/SelectInput';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';
import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import api from '@/lib/api';

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
  const methods = useForm({
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
      jenjang: [] as string[],
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
      is_favorite: false,
    },
  });

  const { handleSubmit, reset, watch, control, register, formState: { errors } } = methods;
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const khusus_daerah_tertentu = watch('khusus_daerah_tertentu');
  const status_batas_usia = watch('status_batas_usia');
  const status_kebutuhan_ipk = watch('status_kebutuhan_ipk');
  const status_gender_khusus = watch('status_gender_khusus');

  // Fetch data
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Use api client which handles token automatically
        const { data: resJson } = await api.get(`/scholarship/${slug}`);

        const data = Array.isArray(resJson.data) ? resJson.data[0] : resJson.data || resJson;

        let genderValue = '';
        if (data.gender === 'MALE') genderValue = 'L';
        else if (data.gender === 'FEMALE') genderValue = 'P';

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
          is_favorite: data.is_favorite || false,
        });
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.message || err.message || 'Gagal memuat data beasiswa', DANGER_TOAST);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, reset]);

  const onSubmit = async (formData: any) => {
    try {
      setSaving(true);
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
        jenjang: Array.isArray(formData.jenjang) ? formData.jenjang : [formData.jenjang].filter(Boolean),
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
        kampus_bisa_daftar: formData.kampus_bisa_daftar ? formData.kampus_bisa_daftar.split(',').map((s: string) => s.trim()) : [],
        link_guidebook: formData.link_guidebook || '',
        link_pendaftaran: formData.link_pendaftaran || '',
        persyaratan: formData.persyaratan ? formData.persyaratan.split(',').map((s: string) => s.trim()) : [],
        lainnya: formData.lainnya ? formData.lainnya.split(',').map((s: string) => s.trim()) : [],
        deskripsi: formData.deskripsi || '',
        is_favorite: !!formData.is_favorite,
      };

      await api.put(`/scholarship/${slug}`, payload);

      showToast('Beasiswa berhasil diperbarui', SUCCESS_TOAST);
      router.push('/admin/manajemen-beasiswa');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Gagal memperbarui data', DANGER_TOAST);
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) return null;

  if (loading) {
    return (
      <AdminDashboard withSidebar>
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
        </div>
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard withSidebar>
      <div className="flex items-center gap-4 mb-6">
        <IconButton
          variant='unstyled'
          icon={FiArrowLeft}
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
        />
        <div>
          <Typography variant="h5" className="font-bold text-gray-900">Edit Data Beasiswa</Typography>
          <Typography variant="c1" className="text-gray-500">Perbarui informasi beasiswa yang terdaftar.</Typography>
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
                  <Input id="nama" label="Nama Beasiswa" validation={{ required: 'Nama beasiswa wajib diisi' }} />
                </div>
                <SelectInput id="jenis" label="Jenis Pendanaan" validation={{ required: 'Jenis wajib dipilih' }}>
                  <option value="">Pilih Jenis</option>
                  {jenisOptions.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </SelectInput>
                <Input id="penyelenggara" label="Penyelenggara" validation={{ required: 'Penyelenggara wajib diisi' }} />

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
                          value={jenjangOptions.filter(j => field.value?.includes(j.value))}
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
                  <Input id="benefit" label="Benefit Singkat" />
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
                  <input type="checkbox" className="rounded text-[#1B7691] focus:ring-[#1B7691]" {...register("is_favorite")} />
                  Jadikan Beasiswa Favorit (Rekomendasi Teratas)?
                </label>
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
                  disabled={saving}
                  className="w-full justify-center bg-[#1B7691] hover:bg-[#15627a]"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSave /> Simpan Perubahan
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