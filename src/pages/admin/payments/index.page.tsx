import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiSearch, FiDollarSign, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';

type Transaction = {
    id: string;
    midtrans_order_id: string;
    original_amount: number;
    discount_amount: number;
    final_amount: number;
    status: string;
    midtrans_status: string | null;
    paid_at: string | null;
    created_at: string;
    Subscription: {
        Plan: { name: string; slug: string };
        User: { id: string; name: string; email: string };
    };
    PromoCode: { code: string; type: string } | null;
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
            const { data } = await api.get('/pricing/transactions', {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    status: filterStatus || undefined
                }
            });
            setTransactions(data?.data || []);
        } catch (error) {
            toast.error('Gagal memuat transaksi');
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

    const statusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-700';
            case 'FAILED': return 'bg-red-100 text-red-700';
            case 'EXPIRED_PAYMENT': return 'bg-gray-100 text-gray-500';
            case 'REFUNDED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <FiCheckCircle />;
            case 'PENDING_PAYMENT': return <FiClock />;
            case 'FAILED': return <FiXCircle />;
            case 'EXPIRED_PAYMENT': return <FiAlertCircle />;
            default: return <FiDollarSign />;
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
                        <option value="">Semua Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING_PAYMENT">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="EXPIRED_PAYMENT">Expired</option>
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
                                <th className='p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Promo</th>
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
                                        <td className='p-4 font-mono text-xs text-gray-600'>{t.midtrans_order_id || '-'}</td>
                                        <td className='p-4'>
                                            <div className='font-bold text-gray-900 text-sm'>{t.Subscription?.User?.name || '-'}</div>
                                            <div className='text-xs text-gray-500'>{t.Subscription?.User?.email}</div>
                                        </td>
                                        <td className='p-4 text-sm text-gray-700'>{t.Subscription?.Plan?.name || '-'}</td>
                                        <td className='p-4'>
                                            <div className='font-medium text-gray-900'>Rp {t.final_amount?.toLocaleString('id-ID')}</div>
                                            {t.discount_amount > 0 && (
                                                <div className='text-[10px] text-green-600'>-Rp {t.discount_amount.toLocaleString('id-ID')} diskon</div>
                                            )}
                                        </td>
                                        <td className='p-4'>
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit ${statusColor(t.status)}`}>
                                                {statusIcon(t.status)} {t.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className='p-4 text-xs text-gray-500'>
                                            {t.paid_at ? new Date(t.paid_at).toLocaleDateString('id-ID') : new Date(t.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className='p-4 text-right'>
                                            {t.PromoCode && (
                                                <span className='text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium'>
                                                    {t.PromoCode.code}
                                                </span>
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
