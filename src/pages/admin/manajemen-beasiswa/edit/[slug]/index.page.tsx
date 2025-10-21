//@ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Input from '@/components/form/Input';
import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';
import useAuthStore from '@/store/useAuthStore';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';

interface BeasiswaData {
  nama: string;
  jenis: string;
  penyelenggara: string;
  benefit: string;
  open_registration: string;
  close_registration: string;
}

interface RequirementData {
  khusus_daerah_tertentu: boolean;
  asal_daerah: string;
  status_batas_usia: boolean;
  min_umur: number | null;
  max_umur: number | null;
  status_gender_khusus: boolean;
  gender: string | null;
  jenjang: string | null;
  status_semester_khusus: boolean;
  semester_khusus: number | null;
  status_fakultas_khusus: boolean;
  status_jurusan_khusus: boolean;
  status_kebutuhan_ipk: boolean;
  min_ipk: number | null;
  status_beasiswa_double: boolean;
  status_keluarga_tidak_mampu: boolean;
  status_disabilitas: boolean;
  img_path: string | null;
  kampus_bisa_daftar: string | null;
  link_guidebook: string | null;
  link_pendaftaran: string | null;
  persyaratan: string | null;
  lainnya: string | null;
  deskripsi: string | null;
}

interface BeasiswaForm {
  beasiswa: BeasiswaData;
  requirement: RequirementData;
}

export default function EditBeasiswaPage() {
  const methods = useForm<BeasiswaForm>();
  const { handleSubmit, reset, register } = methods;
  const router = useRouter();
  const slug = useParams()?.slug;
  const token = useAuthStore((s) => s.token || s.user?.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat data');
      const json = await res.json();

      if (json.beasiswa && json.requirement) {
        reset(json);
      } else {
        showToast('Struktur data tidak valid', DANGER_TOAST);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Gagal memuat data', DANGER_TOAST);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: BeasiswaForm) => {
    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Gagal memperbarui data');
      showToast('Beasiswa berhasil diperbarui', SUCCESS_TOAST);
      router.push('/admin/manajemen-beasiswa');
    } catch (e: any) {
      showToast(e.message, DANGER_TOAST);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Memuat data...</p>;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl p-8 mx-auto space-y-8 bg-white shadow rounded-xl"
      >
        <Typography variant="h3" weight="bold" className="text-primary-blue">
          Edit Beasiswa
        </Typography>
        
        <div className="space-y-4">
          <Typography variant="h5" weight="semibold">
            Informasi Beasiswa
          </Typography>
          <Input id="beasiswa.nama" label="Nama Beasiswa" {...register('beasiswa.nama')} />
          <Input id="beasiswa.jenis" label="Jenis Beasiswa" {...register('beasiswa.jenis')} />
          <Input id="beasiswa.penyelenggara" label="Penyelenggara" {...register('beasiswa.penyelenggara')} />
          <Input id="beasiswa.benefit" label="Benefit" {...register('beasiswa.benefit')} />
          <Input
            id="beasiswa.open_registration"
            label="Tanggal Buka Pendaftaran"
            type="date"
            {...register('beasiswa.open_registration')}
          />
          <Input
            id="beasiswa.close_registration"
            label="Tanggal Tutup Pendaftaran"
            type="date"
            {...register('beasiswa.close_registration')}
          />
          <Input
            id="requirement.link_pendaftaran"
            label="Link Pendaftaran"
            {...register('requirement.link_pendaftaran')}
          />
        </div>

        <div className="pt-6 space-y-4 border-t border-gray-200">
          <Typography variant="h5" weight="semibold">
            Persyaratan Beasiswa
          </Typography>

          <Input id="requirement.asal_daerah" label="Asal Daerah" {...register('requirement.asal_daerah')} />
          <Input id="requirement.min_ipk" label="Minimal IPK" type="number" {...register('requirement.min_ipk')} />
          <Input id="requirement.jenjang" label="Jenjang Pendidikan" {...register('requirement.jenjang')} />
          <Input id="requirement.gender" label="Gender Khusus" {...register('requirement.gender')} />
          <Input id="requirement.kampus_bisa_daftar" label="Kampus yang Bisa Daftar" {...register('requirement.kampus_bisa_daftar')} />
          <Input id="requirement.persyaratan" label="Persyaratan Tambahan" {...register('requirement.persyaratan')} />
          <Input id="requirement.deskripsi" label="Deskripsi" {...register('requirement.deskripsi')} />
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button type="button" variant="unstyled" onClick={() => router.back()}>
            Kembali
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
