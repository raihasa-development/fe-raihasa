import React, { useState, useEffect } from 'react';
import { FiTag, FiPlus, FiSave, FiX, FiCheckCircle, FiUsers, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import AdminDashboard from '@/layouts/AdminDashboard';
import SEO from '@/components/SEO';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';

type PromoCode = {
    id: string;
    code: string;
    type: 'FLASH_SALE' | 'REFERRAL' | 'GENERAL';
    discount_percent: number | null;
    discount_amount: number | null;
    max_uses: number | null;
    current_uses: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    affiliate_id: string | null;
    affiliate_commission_pct: number | null;
    allowed_plan_ids?: string[];
    Affiliate?: { id: string; name: string; email: string } | null;
    _count?: { Redemptions: number };
};

type AffiliateStat = {
    id: string;
    code: string;
    type: 'FLASH_SALE' | 'REFERRAL' | 'GENERAL';
    affiliate_commission_pct: number | null;
    Affiliate?: { id: string; name: string; email: string } | null;
    _count?: { Redemptions: number };
    Redemptions?: Array<{
        discount_applied: number;
        commission_earned: number;
        redeemed_at: string;
        User?: { name: string; email: string };
    }>;
};

type AffiliateSummary = {
    id: string;
    code: string;
    affiliateName: string;
    affiliateEmail: string;
    commissionRate: number;
    uses: number;
    totalDiscount: number;
    totalCommission: number;
    lastRedeemedAt: string | null;
};

const AdminPromoManagement = () => {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [affiliateStats, setAffiliateStats] = useState<AffiliateStat[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        type: 'GENERAL' as 'FLASH_SALE' | 'REFERRAL' | 'GENERAL',
        discount_percent: 0,
        discount_amount: 0,
        max_uses: '',
        valid_from: '',
        valid_until: '',
        affiliate_commission_pct: 0,
        allowed_plan_ids: [] as string[],
    });

    useEffect(() => {
        Promise.all([fetchPromos(), fetchAffiliateStats(), fetchPlans()]).finally(() => setIsLoading(false));
    }, []);

    const fetchPromos = async () => {
        try {
            const response = await api.get('/pricing/admin/promos');
            setPromos(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch promos:', error);
        }
    };

    const fetchAffiliateStats = async () => {
        try {
            const response = await api.get('/pricing/admin/affiliates');
            setAffiliateStats(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch affiliate stats:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/pricing/admin/plans');
            setPlans(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    };

    const handleOpenModal = () => {
        setModalMode('create');
        setEditingPromoId(null);
        const now = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        setFormData({
            code: '',
            type: 'GENERAL',
            discount_percent: 0,
            discount_amount: 0,
            max_uses: '',
            valid_from: now.toISOString().slice(0, 16),
            valid_until: nextYear.toISOString().slice(0, 16),
            affiliate_commission_pct: 0,
            allowed_plan_ids: [],
        });
        setIsModalOpen(true);
    };

    const handleEditPromo = (promo: PromoCode) => {
        setModalMode('edit');
        setEditingPromoId(promo.id);

        setFormData({
            code: promo.code,
            type: promo.type,
            discount_percent: promo.discount_percent || 0,
            discount_amount: promo.discount_amount || 0,
            max_uses: promo.max_uses ? String(promo.max_uses) : '',
            valid_from: new Date(promo.valid_from).toISOString().slice(0, 16),
            valid_until: new Date(promo.valid_until).toISOString().slice(0, 16),
            affiliate_commission_pct: promo.affiliate_commission_pct || 0,
            allowed_plan_ids: promo.allowed_plan_ids || [],
        });

        setIsModalOpen(true);
    };

    const handleDeletePromo = async (promo: PromoCode) => {
        const confirmed = window.confirm(
            `Hapus kode promo ${promo.code}?\n\nJika promo sudah pernah digunakan, sistem akan menolak dan sarankan nonaktifkan saja.`,
        );
        if (!confirmed) return;

        try {
            await api.delete(`/pricing/admin/promos/${promo.id}`);
            alert('Kode promo berhasil dihapus!');
            await Promise.all([fetchPromos(), fetchAffiliateStats()]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menghapus kode promo');
            console.error(error);
        }
    };

    const handleTogglePromoActive = async (promo: PromoCode) => {
        const nextState = !promo.is_active;
        const actionLabel = nextState ? 'aktifkan' : 'nonaktifkan';
        const confirmed = window.confirm(`Yakin ingin ${actionLabel} kode promo ${promo.code}?`);
        if (!confirmed) return;

        try {
            await api.patch(`/pricing/admin/promos/${promo.id}`, { is_active: nextState });
            alert(`Kode promo berhasil di${nextState ? 'aktifkan' : 'nonaktifkan'}!`);
            await Promise.all([fetchPromos(), fetchAffiliateStats()]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal mengubah status promo');
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromoId(null);
        setModalMode('create');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                code: formData.code.toUpperCase().trim(),
                type: formData.type,
                valid_from: new Date(formData.valid_from).toISOString(),
                valid_until: new Date(formData.valid_until).toISOString(),
                allowed_plan_ids: formData.allowed_plan_ids,
            };

            if (formData.discount_percent > 0) {
                payload.discount_percent = Number(formData.discount_percent);
            }
            if (formData.discount_amount > 0) {
                payload.discount_amount = Number(formData.discount_amount);
            }
            if (formData.max_uses) {
                payload.max_uses = Number(formData.max_uses);
            }
            if (formData.type === 'REFERRAL' && formData.affiliate_commission_pct > 0) {
                payload.affiliate_commission_pct = Number(formData.affiliate_commission_pct);
            }

            if (modalMode === 'create') {
                await api.post('/pricing/admin/promos', payload);
                alert('Kode promo berhasil dibuat!');
            } else if (editingPromoId) {
                await api.patch(`/pricing/admin/promos/${editingPromoId}`, payload);
                alert('Kode promo berhasil diperbarui!');
            }

            handleCloseModal();
            await Promise.all([fetchPromos(), fetchAffiliateStats()]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menyimpan kode promo');
            console.error(error);
        }
    };

    const typeColor = (type: string) => {
        switch (type) {
            case 'FLASH_SALE': return 'bg-red-100 text-red-700';
            case 'REFERRAL': return 'bg-purple-100 text-purple-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const typeLabel = (type: string) => {
        switch (type) {
            case 'FLASH_SALE': return '⚡ Flash Sale';
            case 'REFERRAL': return '🤝 Referral';
            default: return '🎟️ General';
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const isExpired = (date: string) => new Date(date) < new Date();

    const formatNumberInput = (value: number | string) => {
        const numeric = String(value ?? '').replace(/\D/g, '');
        if (!numeric) return '';
        return Number(numeric).toLocaleString('id-ID');
    };

    const parseNumberInput = (value: string) => {
        const numeric = value.replace(/\D/g, '');
        return numeric ? Number(numeric) : 0;
    };

    const referralSummaries: AffiliateSummary[] = affiliateStats
        .filter((item) => item.type === 'REFERRAL')
        .map((item) => {
            const redemptions = item.Redemptions || [];
            const totalDiscount = redemptions.reduce((acc, row) => acc + (row.discount_applied || 0), 0);
            const totalCommission = redemptions.reduce((acc, row) => acc + (row.commission_earned || 0), 0);
            const sortedByDate = [...redemptions].sort(
                (a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime(),
            );

            return {
                id: item.id,
                code: item.code,
                affiliateName: item.Affiliate?.name || '-',
                affiliateEmail: item.Affiliate?.email || '-',
                commissionRate: item.affiliate_commission_pct || 0,
                uses: item._count?.Redemptions || redemptions.length,
                totalDiscount,
                totalCommission,
                lastRedeemedAt: sortedByDate[0]?.redeemed_at || null,
            };
        });

    const referralUsageTotal = referralSummaries.reduce((acc, item) => acc + item.uses, 0);
    const referralCommissionTotal = referralSummaries.reduce((acc, item) => acc + item.totalCommission, 0);

    return (
        <AdminDashboard withSidebar>
            <SEO title="Admin - Kelola Promo | Raihasa" />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Kode Promo</h1>
                        <p className="text-gray-500 mt-2">Buat dan monitor kode promo, flash sale, dan referral.</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-[#1B7691] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                    >
                        <FiPlus /> Buat Kode Promo
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-xl"><FiTag className="text-blue-500 w-5 h-5" /></div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{promos.length}</p>
                                <p className="text-xs text-gray-500">Total Kode Promo</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-50 rounded-xl"><FiCheckCircle className="text-green-500 w-5 h-5" /></div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{promos.filter(p => p.is_active && !isExpired(p.valid_until)).length}</p>
                                <p className="text-xs text-gray-500">Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 rounded-xl"><FiUsers className="text-purple-500 w-5 h-5" /></div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{promos.reduce((acc, p) => acc + p.current_uses, 0)}</p>
                                <p className="text-xs text-gray-500">Total Penggunaan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promo List */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Diskon</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Penggunaan</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Berlaku</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Affiliate</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading...</td></tr>
                                ) : promos.length === 0 ? (
                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">Belum ada kode promo.</td></tr>
                                ) : (
                                    promos.map(promo => (
                                        <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">{promo.code}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${typeColor(promo.type)}`}>
                                                    {typeLabel(promo.type)}
                                                </span>
                                                {promo.allowed_plan_ids && promo.allowed_plan_ids.length > 0 ? (
                                                    <div className="text-[10px] text-gray-500 mt-1.5 leading-tight">
                                                        <span className="font-semibold text-gray-600 block">Khusus paket:</span>
                                                        {promo.allowed_plan_ids.map(pid => {
                                                            const p = plans.find(pl => pl.id === pid);
                                                            return <div key={pid} className="bg-gray-50 px-1 py-0.5 rounded border border-gray-100 inline-block mr-1 mt-0.5">{p?.name || 'Loading plan...'}</div>;
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-gray-400 mt-1 font-medium italic">Semua paket</div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-gray-900">
                                                {promo.discount_percent ? `${promo.discount_percent}%` : ''}
                                                {promo.discount_amount ? formatCurrency(promo.discount_amount) : ''}
                                                {!promo.discount_percent && !promo.discount_amount ? '-' : ''}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700">
                                                <span className="font-bold">{promo.current_uses}</span>
                                                <span className="text-gray-400"> / {promo.max_uses ?? '∞'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs text-gray-500">
                                                    <div>{new Date(promo.valid_from).toLocaleDateString('id-ID')}</div>
                                                    <div className="text-gray-400">→ {new Date(promo.valid_until).toLocaleDateString('id-ID')}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {promo.Affiliate ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">{promo.Affiliate.name}</div>
                                                        <div className="text-xs text-gray-400">{promo.affiliate_commission_pct}% komisi</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {isExpired(promo.valid_until) ? (
                                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-gray-100 text-gray-500">Expired</span>
                                                ) : promo.is_active ? (
                                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-green-100 text-green-700">Active</span>
                                                ) : (
                                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-red-100 text-red-600">Inactive</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePromoActive(promo)}
                                                        className={`px-3 py-2 rounded-lg transition-colors ${promo.is_active
                                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        title={promo.is_active ? 'Nonaktifkan promo' : 'Aktifkan promo'}
                                                    >
                                                        {promo.is_active ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditPromo(promo)}
                                                        className="px-3 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                        title="Edit promo"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePromo(promo)}
                                                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        title="Delete promo"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Referral Code Usage</h2>
                            <p className="text-sm text-gray-500 mt-1">Pantau penggunaan kode referral dan total komisi affiliate.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                                {referralSummaries.length} kode referral
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                {referralUsageTotal} total penggunaan
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                {formatCurrency(referralCommissionTotal)} total komisi
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Affiliate</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Komisi</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Diskon Diberikan</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Komisi</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Terakhir Dipakai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading...</td></tr>
                                ) : referralSummaries.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-400">Belum ada usage referral.</td></tr>
                                ) : (
                                    referralSummaries.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">{row.code}</span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="font-semibold text-gray-900">{row.affiliateName}</div>
                                                <div className="text-xs text-gray-500">{row.affiliateEmail}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-700">{row.commissionRate}%</td>
                                            <td className="p-4 text-sm font-semibold text-gray-900">{row.uses}</td>
                                            <td className="p-4 text-sm text-gray-700">{formatCurrency(row.totalDiscount)}</td>
                                            <td className="p-4 text-sm font-semibold text-emerald-700">{formatCurrency(row.totalCommission)}</td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {row.lastRedeemedAt
                                                    ? new Date(row.lastRedeemedAt).toLocaleString('id-ID')
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {modalMode === 'create' ? 'Buat Kode Promo Baru' : 'Edit Kode Promo'}
                                </h3>
                                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-red-500">
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Kode Promo</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800 font-mono"
                                            placeholder="JADIBISA"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Tipe</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                        >
                                            <option value="GENERAL">General</option>
                                            <option value="FLASH_SALE">Flash Sale</option>
                                            <option value="REFERRAL">Referral</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Diskon (%)</label>
                                        <input
                                            type="number"
                                            value={formData.discount_percent}
                                            onChange={e => {
                                                const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                                setFormData({
                                                    ...formData,
                                                    discount_percent: value,
                                                    discount_amount: value > 0 ? 0 : formData.discount_amount,
                                                });
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="30"
                                            min="0"
                                            max="100"
                                            step="1"
                                            disabled={formData.discount_amount > 0}
                                        />
                                        <p className="text-[11px] text-gray-400">Rentang 0-100%</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Diskon (Rp)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatNumberInput(formData.discount_amount)}
                                            onChange={e => {
                                                const value = Math.max(0, parseNumberInput(e.target.value));
                                                setFormData({
                                                    ...formData,
                                                    discount_amount: value,
                                                    discount_percent: value > 0 ? 0 : formData.discount_percent,
                                                });
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                            disabled={formData.discount_percent > 0}
                                        />
                                        <p className="text-[11px] text-gray-400">Contoh: 250.000</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Max Uses</label>
                                        <input
                                            type="number"
                                            value={formData.max_uses}
                                            onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="∞"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                                    <p className="font-semibold mb-1">Aturan Perhitungan Diskon</p>
                                    <p>Isi salah satu: Diskon (%) atau Diskon (Rp).</p>
                                    <p>Diskon (%) dihitung dari harga plan: harga x persen / 100.</p>
                                    <p>Diskon (Rp) memotong nominal tetap, maksimal sampai harga plan.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Batasi ke Paket Tertentu (Opsional)</label>
                                    <p className="text-[11px] text-gray-400">Pilih paket mana saja yang boleh menggunakan kode ini. Jika tidak dicentang, kode promo berlaku untuk semua paket.</p>
                                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 max-h-40 overflow-y-auto space-y-2">
                                        {plans.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">Memuat data pricing plans...</p>
                                        ) : (
                                            plans.map((plan: any) => (
                                                <label key={plan.id} className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-100/55 rounded-lg transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowed_plan_ids.includes(plan.id)}
                                                        onChange={() => {
                                                            setFormData(prev => {
                                                                const ids = prev.allowed_plan_ids;
                                                                if (ids.includes(plan.id)) {
                                                                    return { ...prev, allowed_plan_ids: ids.filter(id => id !== plan.id) };
                                                                }
                                                                return { ...prev, allowed_plan_ids: [...ids, plan.id] };
                                                            });
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#1B7691] focus:ring-[#1B7691]"
                                                    />
                                                    <span className="text-xs font-semibold text-gray-800">{plan.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Berlaku Dari</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.valid_from}
                                            onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Berlaku Sampai</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.valid_until}
                                            onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800 text-sm"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'REFERRAL' && (
                                    <div className="space-y-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <label className="text-sm font-bold text-purple-700">Komisi Affiliate (%)</label>
                                        <input
                                            type="number"
                                            value={formData.affiliate_commission_pct}
                                            onChange={e => {
                                                const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                                setFormData({ ...formData, affiliate_commission_pct: value });
                                            }}
                                            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                                            placeholder="10"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-xs text-purple-500">Persentase dari harga akhir yang menjadi komisi affiliate.</p>
                                    </div>
                                )}
                            </div>

                            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl font-bold bg-[#1B7691] text-white shadow-lg shadow-blue-500/20 hover:bg-[#15627a] transition-all flex items-center gap-2"
                                >
                                    <FiSave /> {modalMode === 'create' ? 'Buat Promo' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminDashboard>
    );
};

export default withAuth(AdminPromoManagement, 'admin');
