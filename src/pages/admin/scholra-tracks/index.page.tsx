import React, { useEffect, useState } from 'react';
import { FiSearch, FiUser, FiInfo } from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import clsxm from '@/lib/clsxm';

type ScholraTrack = {
  id: string;
  account_id: string | null;
  answers: any;
  results: any;
  created_at: string;
  account: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default withAuth(ScholraTracksPage, 'admin');

function ScholraTracksPage() {
  const [tracks, setTracks] = useState<ScholraTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<ScholraTrack | null>(null);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/scholra-tracks');
      setTracks(data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch Scholra tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const filteredTracks = tracks.filter(t => 
    (t.account?.name?.toLowerCase().includes(search.toLowerCase()) || 
     t.account?.email?.toLowerCase().includes(search.toLowerCase()) ||
     (!t.account_id && 'guest'.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <AdminDashboard withSidebar>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-primary'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-900'>Scholra Tracking</Typography>
          <Typography variant='c1' className='text-gray-500'>Review user-submitted profiles and the scholarships recommended to them.</Typography>
        </div>

        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type="text"
            placeholder="Search user or email..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] w-full md:w-64 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 font-primary'>
        {/* List of Tracks */}
        <div className='lg:col-span-1 space-y-4'>
          <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[70vh]'>
            <div className='p-4 bg-gray-50 border-b border-gray-100'>
              <Typography variant='c1' weight='bold' className='text-gray-500 uppercase tracking-wider'>Session Logs</Typography>
            </div>
            <div className='flex-1 overflow-y-auto divide-y divide-gray-50'>
              {loading ? (
                <div className='p-8 text-center text-gray-400'>Loading...</div>
              ) : filteredTracks.length === 0 ? (
                <div className='p-8 text-center text-gray-400'>No tracks found.</div>
              ) : (
                filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={clsxm(
                      'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                      selectedTrack?.id === track.id && 'bg-blue-50/50 border-l-4 border-[#1B7691]'
                    )}
                  >
                    <div className='flex justify-between items-start mb-1'>
                      <Typography variant='bt' weight='bold' className='text-gray-900 truncate max-w-[150px]'>
                        {track.account?.name || 'Guest User'}
                      </Typography>
                      <Typography variant='c2' className='text-gray-400 italic'>
                        {new Date(track.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </div>
                    <Typography variant='c2' className='text-gray-500 block mb-1 text-xs'>{track.account?.email || 'No email'}</Typography>
                    <Typography variant='c2' className='text-gray-400 text-[10px] uppercase font-bold tracking-tighter'>
                      {new Date(track.created_at).toLocaleDateString()}
                    </Typography>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Details View */}
        <div className='lg:col-span-2'>
          {selectedTrack ? (
            <div className='bg-white border border-gray-100 rounded-xl shadow-sm h-full flex flex-col overflow-hidden'>
               <div className='p-6 border-b border-gray-100 bg-gradient-to-r from-[#1B7691]/5 to-transparent'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-2xl bg-[#1B7691]/10 flex items-center justify-center text-[#1B7691]'>
                    <FiUser size={28} />
                  </div>
                  <div>
                    <Typography variant='h6' className='font-bold text-gray-900'>
                      {selectedTrack.account?.name || 'Guest User'}
                    </Typography>
                    <Typography variant='c1' className='text-gray-500'>{selectedTrack.account?.email || 'N/A'}</Typography>
                  </div>
                </div>
              </div>

              <div className='p-6 overflow-y-auto h-[60vh] space-y-8'>
                {/* Profile Answers */}
                <section>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-8 h-8 rounded-lg bg-orange-100 text-[#FB991A] flex items-center justify-center'>
                      <FiInfo size={16} />
                    </div>
                    <Typography variant='bt' weight='bold' className='text-gray-800 uppercase text-xs tracking-widest'>Profile Data</Typography>
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                    {Object.entries(selectedTrack.answers).map(([key, value]) => (
                      <div key={key} className='bg-gray-50 p-3 rounded-xl border border-gray-100'>
                        <Typography variant='c2' className='text-gray-400 uppercase font-bold text-[10px] block mb-1'>{key.replace(/_/g, ' ')}</Typography>
                        <Typography variant='bt' weight='semibold' className='text-gray-700 capitalize break-words'>{String(value)}</Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recommendations */}
                <section>
                   <div className='flex items-center gap-2 mb-4'>
                    <div className='w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center'>
                      <IoSparkles size={16} />
                    </div>
                    <Typography variant='bt' weight='bold' className='text-gray-800 uppercase text-xs tracking-widest'>Target Scholarships</Typography>
                  </div>
                  
                  <div className='overflow-hidden border border-gray-100 rounded-xl'>
                    <table className='w-full text-left'>
                       <thead className='bg-gray-50 border-b border-gray-100'>
                        <tr>
                          <th className='p-3 text-[10px] font-bold text-gray-500 uppercase'>Scholarship Name</th>
                          <th className='p-3 text-[10px] font-bold text-gray-500 uppercase'>Match Score</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-50'>
                        {Array.isArray(selectedTrack.results) && selectedTrack.results.map((res: any, i: number) => (
                          <tr key={res.id || i}>
                            <td className='p-3'>
                              <div className='flex items-center gap-2'>
                                <Typography variant='c1' weight='semibold' className='text-gray-800 truncate max-w-[300px]'>{res.nama || 'Untitled'}</Typography>
                              </div>
                            </td>
                            <td className='p-3'>
                              <div className={clsxm(
                                'text-[10px] font-bold px-2 py-1 rounded w-fit',
                                res.matchLabel === 'Sangat Cocok' ? 'bg-green-100 text-green-700' :
                                res.matchLabel === 'Cocok' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              )}>
                                {res.matchScore}% - {res.matchLabel}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className='bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl h-full flex items-center justify-center p-12 text-center'>
              <div>
                <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300'>
                  <FiSearch size={40} />
                </div>
                <Typography variant='bt' className='text-gray-400'>Select a tracking session from the list to view details</Typography>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminDashboard>
  );
}
