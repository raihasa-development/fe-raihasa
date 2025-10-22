'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import {
  showToast,
  SUCCESS_TOAST,
  DANGER_TOAST,
} from '@/components/Toast';
import Typography from '@/components/Typography';
import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input'; // 🔹 gunakan komponen input kamu kalau ada

interface BeasiswaInfo {
  nama: string;
  jenis: string;
  penyelenggara: string;
  benefit: string;
  open_registration: string;
  close_registration: string;
}

interface RequirementInfo {
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

interface ScholarshipItem {
  id: string;
  beasiswa: BeasiswaInfo;
  requirement: RequirementInfo;
}

export default function BeasiswaListPage() {
  const [data, setData] = useState<ScholarshipItem[]>([]);
  const [filteredData, setFilteredData] = useState<ScholarshipItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useAuthStore((state) => state.token || state.user?.token);

  // === 🔹 Fetch Data ===
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Gagal memuat data (${res.status})`);
    const json = await res.json();
    console.log('Fetched scholarship data:', json);
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
      ? json.data
      : [];

    const validList: ScholarshipItem[] = list.map((item: any) => ({
      id: item.id || '',
      beasiswa: {
        nama: item.nama || item.beasiswa?.nama || '-',
        jenis: item.jenis || item.beasiswa?.jenis || '-',
        penyelenggara: item.penyelenggara || item.beasiswa?.penyelenggara || '-',
        benefit: item.benefit || item.beasiswa?.benefit || '-',
        open_registration: item.open_registration || item.beasiswa?.open_registration || '',
        close_registration: item.close_registration || item.beasiswa?.close_registration || '',
      },
      requirement: item.requirement || ({} as RequirementInfo),
    }));

    const uniqueList = validList.filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.beasiswa.nama === v.beasiswa.nama &&
            t.beasiswa.jenis === v.beasiswa.jenis &&
            t.beasiswa.penyelenggara === v.beasiswa.penyelenggara &&
            t.beasiswa.open_registration === v.beasiswa.open_registration &&
            t.beasiswa.close_registration === v.beasiswa.close_registration
        ) === i
    );

    setData(uniqueList);
    setFilteredData(uniqueList);
  } catch (error: any) {
    console.error(error);
    showToast(error.message || 'Gagal memuat data beasiswa', DANGER_TOAST);
  } finally {
    setLoading(false);
  }
};

  // === 🔹 Filter/Search ===
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.beasiswa.nama.toLowerCase().includes(lowerSearch) ||
        item.beasiswa.jenis.toLowerCase().includes(lowerSearch) ||
        item.beasiswa.penyelenggara.toLowerCase().includes(lowerSearch)
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  // === 🔹 Hapus Beasiswa ===
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus beasiswa ini?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Gagal menghapus data');

      showToast('Beasiswa dihapus', SUCCESS_TOAST);
      setData((prev) => prev.filter((b) => b.id !== id));
    } catch (error: any) {
      showToast(error.message, DANGER_TOAST);
    }
  };

  // === 🔹 UI ===
  if (loading) {
    return <p className="text-center text-gray-500">Memuat data...</p>;
  }

  return (
    <div className="max-w-6xl p-8 mx-auto">
      <Typography variant="h3" weight="bold" className="mb-6 text-center text-primary-blue">
        Daftar Beasiswa
      </Typography>

      <div className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
        {/* 🔹 Search Bar */}
        <input
          type="text"
          placeholder="Cari berdasarkan nama, jenis, atau penyelenggara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        />

        <Button onClick={() => router.push('/admin/manajemen-beasiswa/input')}>
          + Tambah Beasiswa
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-center text-gray-500">Tidak ada data yang cocok.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
          <table className="w-full text-sm border-collapse">
            <thead className="text-gray-700 bg-gray-100">
              <tr>
                <th className="p-3 border">Nama</th>
                <th className="p-3 border">Jenis</th>
                <th className="p-3 border">Penyelenggara</th>
                <th className="p-3 border">Periode</th>
                <th className="p-3 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="text-center border-t hover:bg-gray-50">
                  <td className="p-2 border">{item.beasiswa.nama}</td>
                  <td className="p-2 border">{item.beasiswa.jenis}</td>
                  <td className="p-2 border">{item.beasiswa.penyelenggara}</td>
                  <td className="p-2 border">
                    {new Date(item.beasiswa.open_registration).toLocaleDateString('id-ID')} –{' '}
                    {new Date(item.beasiswa.close_registration).toLocaleDateString('id-ID')}
                  </td>
                  <td className="flex items-center justify-center gap-2 p-2 border">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        router.push(`/admin/manajemen-beasiswa/edit/${item.id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleDelete(item.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
