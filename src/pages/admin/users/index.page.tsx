import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiSearch, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_email_verified: boolean;
  forum_tokens: number;
  UserProgram?: {
    ProductProgram: {
      name: string;
    };
    LMS?: {
      end: string;
    }[]
  }[];
};

export default withAuth(AdminUsersPage, 'admin');

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number>(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users', {
        params: {
          page,
          limit: 10,
          search: search || undefined
        }
      });
      setUsers(data?.data || []);
      setTotalPages(data?.data?.metadata?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, page]);

  const toggleVerification = async (user: User) => {
    try {
      const newStatus = !user.is_email_verified;
      await api.patch(`/auth/users/${user.id}`, { is_email_verified: newStatus });
      toast.success(`User ${newStatus ? 'Verified' : 'Unverified'}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const getUserStatus = (user: User) => {
    const activeProgram = user.UserProgram?.find(up => {
      const lms = up.LMS?.[0];
      if (!lms?.end) return false;
      return new Date(lms.end) > new Date();
    });

    if (activeProgram) {
      const lms = activeProgram.LMS?.[0];
      return (
        <span className="flex flex-col">
          <span className="text-green-600 font-bold text-xs">{activeProgram.ProductProgram.name}</span>
          <span className="text-gray-400 text-[10px]">Exp: {lms?.end ? new Date(lms.end).toLocaleDateString() : '-'}</span>
        </span>
      );
    }
    return <span className="text-gray-400 text-xs">Free Member</span>;
  };

  const handleAddToken = async () => {
    if (!selectedUser) return;
    try {
      await api.post('/posts/tokens/add', {
        user_id: selectedUser.id,
        amount: Number(tokenAmount)
      });
      toast.success(`Added ${tokenAmount} tokens to ${selectedUser.name}`);
      setIsTokenModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add tokens');
    }
  };

  const openTokenModal = (user: User) => {
    setSelectedUser(user);
    setTokenAmount(0);
    setIsTokenModalOpen(true);
  };

  return (
    <AdminDashboard withSidebar>
      <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-900'>User Management</Typography>
          <Typography variant='c1' className='text-gray-500'>Manage users, verify emails, check memberships, and add tokens.</Typography>
        </div>

        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type="text"
            placeholder="Search name or email..."
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
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>User</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Role</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Verified</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Tokens</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Membership Status</th>
                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='p-4'>
                      <div className='font-bold text-gray-900'>{user.name}</div>
                      <div className='text-xs text-gray-500'>{user.email}</div>
                    </td>
                    <td className='p-4'>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className='p-4'>
                      {user.is_email_verified ? (
                        <span className='flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded w-fit'>
                          <FiCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className='flex items-center gap-1 text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded w-fit'>
                          <FiXCircle /> Unverified
                        </span>
                      )}
                    </td>
                    <td className='p-4 font-mono text-xs text-blue-600'>
                      {user.forum_tokens}
                    </td>
                    <td className='p-4'>
                      {getUserStatus(user)}
                    </td>
                    <td className='p-4 text-right flex justify-end gap-2'>
                      <button
                        onClick={() => openTokenModal(user)}
                        className='text-xs text-[#E58941] hover:text-[#d37d3a] font-medium border border-[#E58941]/20 px-3 py-1.5 rounded-lg hover:bg-[#E58941]/5 transition-colors flex items-center gap-1'
                        title="Add Tokens"
                      >
                        <FiGift /> Token
                      </button>
                      <button
                        onClick={() => toggleVerification(user)}
                        className='text-xs text-[#1B7691] hover:text-[#15627a] font-medium border border-[#1B7691]/20 px-3 py-1.5 rounded-lg hover:bg-[#1B7691]/5 transition-colors'
                        title="Toggle Verification"
                      >
                        {user.is_email_verified ? 'Unverify' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            // disabled={page >= totalPages}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Next
          </button>
        </div>
      </div>

      {/* Token Modal */}
      {isTokenModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Add Tokens to {selectedUser.name}</h3>
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(Number(e.target.value))}
              className="w-full border p-2 rounded mb-4"
              placeholder="Amount"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsTokenModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
              <button onClick={handleAddToken} className="px-4 py-2 bg-[#E58941] text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboard>
  );
}
