import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiSearch, FiGift, FiClock, FiSlash, FiMail, FiSend, FiUsers, FiAlertCircle } from 'react-icons/fi';
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
  Subscriptions?: {
    status: string;
    ends_at: string | null;
    Plan: { name: string };
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
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number>(0);

  // CRM & Count Overhaul States
  const [stats, setStats] = useState<{
    total: number;
    verified: number;
    unverified: number;
    memberships: { [key: string]: number };
  } | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Broadcast Promo Form States
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/auth/users/stats');
      setStats(data?.data || null);
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/pricing/admin/plans');
      const activePlans = (data?.data || []).filter((p: any) => p.is_active);
      setPlans(activePlans);
    } catch (e) {
      console.error('Failed to fetch plans', e);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          is_email_verified: verifiedFilter !== 'all' ? verifiedFilter : undefined,
          membership: membershipFilter !== 'all' ? membershipFilter : undefined,
        }
      });
      setUsers(data?.data || []);
      setTotalPages(data?.metadata?.totalPages || data?.data?.metadata?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPlans();
  }, []);

  // Fetch users whenever search, page, or filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, page, verifiedFilter, membershipFilter]);

  // Reset page to 1 and clear selected users when filters change
  useEffect(() => {
    setPage(1);
    setSelectedUserIds([]);
  }, [verifiedFilter, membershipFilter]);

  const handleFollowUpVerification = async () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
    const unverifiedUsers = selectedUsers.filter(u => !u.is_email_verified);
    
    if (unverifiedUsers.length === 0) {
      toast.error('Tidak ada user belum terverifikasi yang terpilih');
      return;
    }

    setLoading(true);
    let successCount = 0;
    for (const u of unverifiedUsers) {
      try {
        await api.post('/auth/resend-verification', { email: u.email });
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`Berhasil mengirim pengingat verifikasi ke ${successCount} user!`);
    setSelectedUserIds([]);
    setLoading(false);
    fetchUsers();
    fetchStats();
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      toast.error('Subject dan Body pesan broadcast harus diisi');
      return;
    }

    setIsBroadcasting(true);
    try {
      const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
      const emails = selectedUsers.map(u => u.email);

      await api.post('/auth/users/broadcast', {
        emails,
        subject: broadcastSubject,
        body: broadcastBody
      });

      toast.success(`Broadcast promo berhasil dikirim ke ${emails.length} user!`);
      setIsBroadcastModalOpen(false);
      setBroadcastSubject('');
      setBroadcastBody('');
      setSelectedUserIds([]);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Gagal mengirim broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const toggleVerification = async (user: User) => {
    try {
      const newStatus = !user.is_email_verified;
      await api.patch(`/auth/users/${user.id}`, { is_email_verified: newStatus });
      toast.success(`User ${newStatus ? 'Verified' : 'Unverified'}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const getUserStatus = (user: User) => {
    // Check v2 Subscription first
    const activeSub = user.Subscriptions?.find(s => 
      s.status === 'ACTIVE' && s.ends_at && new Date(s.ends_at) > new Date()
    );
    if (activeSub) {
      return (
        <span className="flex flex-col">
          <span className="text-green-600 font-bold text-xs">{activeSub.Plan.name}</span>
          <span className="text-gray-400 text-[10px]">Exp: {activeSub.ends_at ? new Date(activeSub.ends_at).toLocaleDateString('id-ID') : '-'}</span>
        </span>
      );
    }

    // Fallback to legacy UserProgram/LMS
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
          <span className="text-gray-400 text-[10px]">Exp: {lms?.end ? new Date(lms.end).toLocaleDateString('id-ID') : '-'}</span>
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

  const handleRevertToFree = async (user: User) => {
    if (!confirm(`Revert ${user.name} ke Free Member? Semua subscription aktif akan dibatalkan.`)) return;
    try {
      await api.post('/pricing/admin/subscriptions/cancel', { user_id: user.id });
      toast.success(`${user.name} berhasil di-revert ke Free Member`);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Gagal revert subscription');
    }
  };

  const openTokenModal = (user: User) => {
    setSelectedUser(user);
    setTokenAmount(0);
    setIsTokenModalOpen(true);
  };

  const openMembershipModal = (user: User) => {
    setSelectedUser(user);
    setIsMembershipModalOpen(true);
  };

  return (
    <AdminDashboard withSidebar>
      {/* Count Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B7691]">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total User</p>
              <h3 className="text-2xl font-black text-gray-800">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verifikasi Email</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">{stats.verified} Verified</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs font-semibold text-red-500">{stats.unverified} Unverified</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#FB991A]">
              <FiGift className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status Membership</p>
              <div className="text-[11px] text-gray-600 font-semibold space-y-0.5 max-h-[60px] overflow-y-auto pr-1">
                {Object.entries(stats.memberships).map(([planName, count]) => (
                  <div key={planName} className="flex justify-between items-center gap-2">
                    <span className="truncate">{planName}:</span>
                    <span className="font-bold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className='mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-900'>User Management</Typography>
          <Typography variant='c1' className='text-gray-500'>Kelola pengguna, verifikasi email, status keanggotaan, token forum, dan jalankan CRM campaign email.</Typography>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Verified Status Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 cursor-pointer w-full md:w-auto"
          >
            <option value="all">Semua Verifikasi</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>

          {/* Membership Type Filter */}
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 cursor-pointer w-full md:w-auto"
          >
            <option value="all">Semua Membership</option>
            <option value="FREE">Free Member Only</option>
            <option value="PAID">Paid Member Only</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Search bar */}
          <div className='relative w-full md:w-64'>
            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type="text"
              placeholder="Search name or email..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] w-full transition-all text-xs font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Batch CRM Actions Bar */}
      {selectedUserIds.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#1B7691]">
            <FiUsers className="w-4 h-4" />
            <span>{selectedUserIds.length} user terpilih untuk tindakan CRM</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFollowUpVerification}
              className="bg-white hover:bg-gray-50 border border-blue-200/50 text-[#1B7691] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>Follow Up Verifikasi</span>
            </button>
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="bg-[#1B7691] hover:bg-[#15627a] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <FiMail className="w-3.5 h-3.5" />
              <span>Kirim Email Broadcast / Promo</span>
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b border-gray-100'>
              <tr>
                <th className='p-4 w-10'>
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds(users.map(u => u.id));
                      } else {
                        setSelectedUserIds([]);
                      }
                    }}
                    className="rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691] cursor-pointer"
                  />
                </th>
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
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-blue-50/10' : ''}`}>
                    <td className='p-4'>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds(prev => [...prev, user.id]);
                          } else {
                            setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691] cursor-pointer"
                      />
                    </td>
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
                        onClick={() => handleRevertToFree(user)}
                        className='text-xs text-red-600 hover:text-red-700 font-medium border border-red-600/20 px-3 py-1.5 rounded-lg hover:bg-red-600/5 transition-colors flex items-center gap-1'
                        title="Revert ke Free"
                      >
                        <FiSlash /> Revert
                      </button>
                      <button
                        onClick={() => openMembershipModal(user)}
                        className='text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-600/20 px-3 py-1.5 rounded-lg hover:bg-blue-600/5 transition-colors flex items-center gap-1'
                        title="Set Membership"
                      >
                        <FiClock /> Member
                      </button>
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
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Next
          </button>
        </div>
      </div>

      {/* Broadcast Promo Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 border-b border-gray-150 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B7691]">
                <FiMail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Kirim Email Broadcast / Promo</h3>
                <p className="text-xs text-gray-500">Pesan akan dikirimkan ke {selectedUserIds.length} user terpilih.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Subject Email</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] outline-none text-xs font-medium"
                  placeholder="Ketik subjek email di sini..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Isi Pesan (Body Email)</label>
                <textarea
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] outline-none text-xs font-medium resize-none leading-relaxed"
                  placeholder="Ketik isi pesan promosi atau pemberitahuan di sini..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 mt-6">
              <button 
                onClick={() => setIsBroadcastModalOpen(false)} 
                disabled={isBroadcasting} 
                className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSendBroadcast} 
                disabled={isBroadcasting || !broadcastSubject.trim() || !broadcastBody.trim()} 
                className="px-5 py-2.5 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Mengirim...' : 'Kirim Broadcast'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
      {isTokenModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Add Tokens to {selectedUser.name}</h3>
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(Number(e.target.value))}
              className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-[#E58941]"
              placeholder="Amount"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsTokenModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleAddToken} className="px-4 py-2 bg-[#E58941] text-white rounded hover:bg-[#d37d3a]">Add Tokens</button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      <MembershipModal
        isOpen={!!isMembershipModalOpen && !!selectedUser}
        onClose={() => setIsMembershipModalOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          fetchUsers();
          fetchStats();
        }}
      />
    </AdminDashboard>
  );
}

function MembershipModal({ isOpen, onClose, user, onSuccess }: { isOpen: boolean, onClose: () => void, user: User | null, onSuccess: () => void }) {
  const [days, setDays] = useState(30);
  const [plans, setPlans] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/pricing/admin/plans').then(({ data }) => {
        const activePlans = (data?.data || []).filter((p: any) => p.is_active);
        setPlans(activePlans);
        if (activePlans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(activePlans[0].id);
        }
      }).catch(() => {
        toast.error('Gagal memuat daftar plan');
      });
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const activeSub = user.Subscriptions?.find(s =>
    s.status === 'ACTIVE' && s.ends_at && new Date(s.ends_at) > new Date()
  );

  const handleAssign = async () => {
    if (!selectedPlanId) {
      toast.error('Pilih plan terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      await api.post('/pricing/admin/subscriptions/assign', {
        user_id: user.id,
        plan_id: selectedPlanId,
        duration_days: days
      });
      toast.success(`Subscription untuk ${user.name} berhasil di-assign (${days} hari)`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Gagal assign subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Revert ${user.name} ke Free Member?`)) return;
    setCancelling(true);
    try {
      await api.post('/pricing/admin/subscriptions/cancel', { user_id: user.id });
      toast.success(`${user.name} berhasil di-revert ke Free Member`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Gagal cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <Typography variant="h4" className="font-bold mb-2">Subscription Management</Typography>
        <p className="text-sm text-gray-500 mb-4">Kelola subscription untuk <b>{user.name}</b>.</p>

        {/* Current Status */}
        {activeSub && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-bold text-green-700">Subscription Aktif</p>
            <p className="text-xs text-green-600">{activeSub.Plan.name} — Exp: {activeSub.ends_at ? new Date(activeSub.ends_at).toLocaleDateString('id-ID') : '-'}</p>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-2 text-xs text-red-600 font-medium border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Processing...' : 'Revert ke Free'}
            </button>
          </div>
        )}

        {/* Assign Membership Form */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 mb-1">Plan</label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Days)</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[30, 90, 365].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2 py-1 text-xs rounded border ${days === d ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                {d} Days
              </button>
            ))}
          </div>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Custom days..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded text-sm font-medium">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedPlanId}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Assign Membership'}
          </button>
        </div>
      </div>
    </div>
  );
}
