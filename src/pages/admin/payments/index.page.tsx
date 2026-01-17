import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiSearch, FiDollarSign, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';

type Transaction = {
    id: string;
    order_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    total_bayar: number;
    created_at: string;
    UserProgram: {
        User: {
            name: string;
            email: string;
        };
        ProductProgram: {
            name: string;
        }
    };
};

export default withAuth(AdminPaymentsPage, 'admin');

function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<string>('');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/payments/transactions', {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    status: filterStatus || undefined
                }
            });
            setTransactions(data?.data || []);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTransactions();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, page, filterStatus]);

    const updateStatus = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return;

        try {
            await api.patch(`/payments/transactions/${id}/status`, { status });
            toast.success(`Transaction ${status}`);
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <FiCheckCircle />;
            case 'PENDING': return <FiClock />;
            case 'REJECTED': return <FiXCircle />;
            default: return <FiAlertCircle />;
        }
    };

    return (
        <AdminDashboard withSidebar>
            <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <Typography variant='h5' className='font-bold text-gray-900'>Payment Monitoring</Typography>
                    <Typography variant='c1' className='text-gray-500'>Monitor transactions and manage payment statuses.</Typography>
                </div>

                <div className='flex items-center gap-3'>
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <div className='relative'>
                        <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                            type="text"
                            placeholder="Search Order ID or User..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] w-full md:w-64 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead className='bg-gray-50 border-b border-gray-100'>
                            <tr>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Order ID</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>User</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Product</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Amount</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Status</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Date</th>
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50'>
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No transactions found.</td></tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className='hover:bg-gray-50/50 transition-colors'>
                                        <td className='p-4 font-mono text-xs text-gray-600'>{t.order_id || '-'}</td>
                                        <td className='p-4'>
                                            <div className='font-bold text-gray-900 text-sm'>{t.UserProgram?.User?.name || 'Unknown'}</div>
                                            <div className='text-xs text-gray-500'>{t.UserProgram?.User?.email}</div>
                                        </td>
                                        <td className='p-4 text-sm text-gray-700'>{t.UserProgram?.ProductProgram?.name || '-'}</td>
                                        <td className='p-4 font-medium text-gray-900'>Rp {t.total_bayar?.toLocaleString()}</td>
                                        <td className='p-4'>
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit ${statusColor(t.status)}`}>
                                                {statusIcon(t.status)} {t.status}
                                            </span>
                                        </td>
                                        <td className='p-4 text-xs text-gray-500'>
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className='p-4 text-right'>
                                            {t.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => updateStatus(t.id, 'APPROVED')}
                                                        className='text-xs text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors'
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(t.id, 'REJECTED')}
                                                        className='text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors'
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {t.status !== 'PENDING' && (
                                                <button
                                                    onClick={() => updateStatus(t.id, t.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                                                    className='text-[10px] text-gray-400 hover:text-gray-600 underline'
                                                >
                                                    Force Change
                                                </button>
                                            )}
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
        </AdminDashboard>
    );
}
