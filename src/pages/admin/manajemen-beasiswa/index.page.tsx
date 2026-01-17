import React, { useEffect, useState } from 'react';
import { FiSearch, FiAward, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';

export default withAuth(AdminScholarshipPage, 'admin');

function AdminScholarshipPage() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scholarship');
      setScholarships(data?.data || []); // Adjust if response structure differs, usually array
    } catch (error) {
      //   toast.error('Failed to fetch scholarships'); 
      console.log('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const filtered = Array.isArray(scholarships) ? scholarships.filter(s =>
    s.nama?.toLowerCase().includes(search.toLowerCase()) ||
    s.penyelenggara?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <AdminDashboard withSidebar>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-900'>Manajemen Beasiswa</Typography>
          <Typography variant='c1' className='text-gray-500'>Manage scholarship database.</Typography>
        </div>

        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type="text"
            placeholder="Search scholarship..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] w-full md:w-64 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b border-gray-100'>
              <tr>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Scholarship Name</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Organizer</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Type</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No scholarships found.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='p-4'>
                      <div className='font-bold text-gray-900 text-sm'>{s.nama}</div>
                    </td>
                    <td className='p-4 text-sm text-gray-600'>
                      {s.penyelenggara}
                    </td>
                    <td className='p-4'>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{s.jenis_beasiswa || s.jenis}</span>
                    </td>
                    <td className='p-4'>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${s.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className='p-4 text-right'>
                      <button className='text-xs text-[#1B7691] hover:underline'>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboard>
  );
}
