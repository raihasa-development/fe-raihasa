import React, { useEffect, useState } from 'react';
import { FiSearch, FiAward, FiCalendar, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import ButtonLink from '@/components/links/ButtonLink';
import IconButton from '@/components/buttons/IconButton';

export default withAuth(AdminScholarshipPage, 'admin');

function AdminScholarshipPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scholarship?limit=1000'); // Ensure fetch all for admin
      setScholarships(data?.data || []);
    } catch (error) {
      console.log('Error fetching scholarships:', error);
      toast.error('Gagal mengambil data beasiswa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah anda yakin ingin menghapus beasiswa ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      await api.delete(`/scholarship/${id}`);
      toast.success('Beasiswa berhasil dihapus');
      fetchScholarships();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus beasiswa');
    }
  };

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filtered = Array.isArray(scholarships) ? scholarships.filter(s =>
    (s.nama?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (s.penyelenggara?.toLowerCase() || '').includes(search.toLowerCase())
  ) : [];

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedResults = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <AdminDashboard withSidebar>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-900'>Manajemen Beasiswa</Typography>
          <Typography variant='c1' className='text-gray-500'>Kelola database beasiswa.</Typography>
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative'>
            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type="text"
              placeholder="Cari beasiswa..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] w-full md:w-64 transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <ButtonLink
            href='/admin/manajemen-beasiswa/input'
            variant='primary'
            className='py-2 gap-2 bg-[#1B7691] border-[#1B7691] hover:bg-[#15627a]'
          >
            <FiPlus />
            <span>Tambah</span>
          </ButtonLink>
        </div>
      </div>

      <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b border-gray-100'>
              <tr>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Nama Beasiswa</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Penyelenggara</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Jenis</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
              ) : paginatedResults.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada beasiswa ditemukan.</td></tr>
              ) : (
                paginatedResults.map((s) => (
                  <tr key={s.id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='p-4'>
                      <div className='font-bold text-gray-900 text-sm'>{s.nama}</div>
                    </td>
                    <td className='p-4 text-sm text-gray-600'>
                      {s.penyelenggara}
                    </td>
                    <td className='p-4'>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block truncate max-w-[150px]" title={s.jenis_beasiswa || s.jenis}>
                        {s.jenis_beasiswa || s.jenis}
                      </span>
                    </td>
                    <td className='p-4'>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${s.status === 'ONGOING' || s.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.status || (s.is_open ? 'Open' : 'Closed')}
                      </span>
                    </td>
                    <td className='p-4 text-right'>
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                          variant='unstyled'
                          icon={FiEdit2}
                          className='text-blue-500 hover:bg-blue-50'
                          onClick={() => router.push(`/admin/manajemen-beasiswa/edit/${s.id}`)}
                          aria-label="Edit"
                        />
                        <IconButton
                          variant='unstyled'
                          icon={FiTrash2}
                          className='text-red-500 hover:bg-red-50'
                          onClick={() => handleDelete(s.id)}
                          aria-label="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
}
