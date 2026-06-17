import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiEdit2, FiSave, FiX, FiCheckCircle, FiPackage, FiPlus, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import AdminDashboard from '@/layouts/AdminDashboard';
import SEO from '@/components/SEO';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';

type PricingPlan = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    duration_days: number;
    description: string | null;
    features: string[];
    forum_tokens: number;
    allowed_schema_types: string[];
    allowed_module_ids: string[];
    is_active: boolean;
    sort_order: number;
    tag: string | null;
    is_popular: boolean;
    is_enterprise: boolean;
};

const AdminPricingManagement = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        price: 0,
        original_price: 0,
        duration_days: 30,
        description: '',
        features: '',
        forum_tokens: 0,
        allowed_schema_types: ['DALAM_NEGERI'] as string[],
        allowed_module_ids: [] as string[],
        tag: '',
        is_popular: false,
        is_enterprise: false,
        sort_order: 0,
    });

    useEffect(() => {
        fetchPlans();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/lms/modul');
            setCourses(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const formatNumberInput = (value: number | string) => {
        const numeric = String(value ?? '').replace(/\D/g, '');
        if (!numeric) return '';
        return Number(numeric).toLocaleString('id-ID');
    };

    const parseNumberInput = (value: string) => {
        const numeric = value.replace(/\D/g, '');
        return numeric ? Number(numeric) : 0;
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/pricing/admin/plans');
            const data = response.data?.data || [];
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (plan?: PricingPlan) => {
        if (plan) {
            setModalMode('edit');
            setEditingId(plan.id);
            setFormData({
                slug: plan.slug,
                name: plan.name,
                price: plan.price,
                original_price: plan.original_price || 0,
                duration_days: plan.duration_days,
                description: plan.description || '',
                features: (plan.features || []).join('\n'),
                forum_tokens: plan.forum_tokens,
                allowed_schema_types: plan.allowed_schema_types || ['DALAM_NEGERI'],
                allowed_module_ids: plan.allowed_module_ids || [],
                tag: plan.tag || '',
                is_popular: plan.is_popular,
                is_enterprise: plan.is_enterprise,
                sort_order: plan.sort_order,
            });
        } else {
            setModalMode('create');
            setEditingId(null);
            setFormData({
                slug: '',
                name: '',
                price: 0,
                original_price: 0,
                duration_days: 30,
                description: '',
                features: '',
                forum_tokens: 0,
                allowed_schema_types: ['DALAM_NEGERI'],
                allowed_module_ids: [],
                tag: '',
                is_popular: false,
                is_enterprise: false,
                sort_order: 0,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                slug: formData.slug,
                name: formData.name,
                price: Number(formData.price),
                original_price: Number(formData.original_price) || null,
                duration_days: Number(formData.duration_days),
                description: formData.description || null,
                features: formData.features.split('\n').filter((f: string) => f.trim()),
                forum_tokens: Number(formData.forum_tokens),
                allowed_schema_types: formData.allowed_schema_types,
                allowed_module_ids: formData.allowed_module_ids,
                tag: formData.tag || null,
                is_popular: formData.is_popular,
                is_enterprise: formData.is_enterprise,
                sort_order: Number(formData.sort_order),
            };

            if (modalMode === 'create') {
                await api.post('/pricing/admin/plans', payload);
                alert('Paket berhasil dibuat!');
            } else if (modalMode === 'edit' && editingId) {
                await api.patch(`/pricing/admin/plans/${editingId}`, payload);
                alert('Paket berhasil diperbarui!');
            }

            await fetchPlans();
            handleCloseModal();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menyimpan paket');
            console.error(error);
        }
    };

    const toggleActive = async (plan: PricingPlan) => {
        try {
            await api.patch(`/pricing/admin/plans/${plan.id}`, {
                is_active: !plan.is_active,
            });
            fetchPlans();
        } catch (error) {
            alert('Gagal mengubah status');
        }
    };

    const handleDeletePlan = async (plan: PricingPlan) => {
        const confirmed = window.confirm(
            `Hapus plan \"${plan.name}\"?\n\nJika plan sudah pernah dipakai user, sistem akan menolak dan sarankan nonaktifkan saja.`,
        );
        if (!confirmed) return;

        try {
            await api.delete(`/pricing/admin/plans/${plan.id}`);
            alert('Plan berhasil dihapus');
            await fetchPlans();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menghapus plan');
        }
    };

    const toggleSchemaType = (type: string) => {
        setFormData(prev => {
            const current = prev.allowed_schema_types;
            if (current.includes(type)) {
                if (current.length <= 1) return prev;
                return { ...prev, allowed_schema_types: current.filter(t => t !== type) };
            }
            return { ...prev, allowed_schema_types: [...current, type] };
        });
    };

    const toggleModuleSelection = (id: string) => {
        setFormData(prev => {
            const current = prev.allowed_module_ids;
            if (current.includes(id)) {
                return { ...prev, allowed_module_ids: current.filter(item => item !== id) };
            }
            return { ...prev, allowed_module_ids: [...current, id] };
        });
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AdminDashboard withSidebar>
            <SEO title="Admin - Manajemen Harga | Raihasa" />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pricing Plans</h1>
                        <p className="text-gray-500 mt-2">Atur paket BISA Learning v2. Perubahan langsung berlaku di halaman produk.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-[#1B7691] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                    >
                        <FiPlus /> Tambah Plan
                    </button>
                </div>

                <div className="grid gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-white rounded-3xl animate-pulse border border-gray-100" />
                        ))
                    ) : plans.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <FiPackage className="mx-auto w-10 h-10 text-gray-200 mb-4" />
                            <p className="text-gray-400">Tidak ada pricing plan ditemukan.</p>
                        </div>
                    ) : (
                        plans.map(plan => (
                            <div key={plan.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border ${plan.is_active ? 'border-gray-100' : 'border-red-100 opacity-60'} flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-300`}>
                                <div className="flex items-center gap-5 flex-1">
                                    <div className={`w-14 h-14 ${plan.is_popular ? 'bg-orange-50' : 'bg-blue-50'} rounded-2xl flex items-center justify-center ${plan.is_popular ? 'text-orange-500' : 'text-[#1B7691]'}`}>
                                        <FiDollarSign className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                                            {plan.tag && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${plan.is_popular ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {plan.tag}
                                                </span>
                                            )}
                                            {plan.is_enterprise && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-600">Enterprise</span>
                                            )}
                                            {!plan.is_active && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-600">Nonaktif</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{plan.duration_days} hari</span>
                                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">{plan.forum_tokens} token</span>
                                            {plan.allowed_schema_types.map(t => (
                                                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{t === 'DALAM_NEGERI' ? '🇮🇩 DN' : '🌍 LN'}</span>
                                            ))}
                                        </div>
                                        {plan.description && (
                                            <p className="text-xs text-gray-400 mt-1 max-w-md truncate">{plan.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="text-right">
                                        {plan.original_price && plan.original_price > plan.price && (
                                            <p className="text-xs text-gray-400 line-through">{formatCurrency(plan.original_price)}</p>
                                        )}
                                        <p className="text-2xl font-black text-[#1B7691]">
                                            {plan.is_enterprise ? 'Custom' : formatCurrency(plan.price)}
                                        </p>
                                    </div>

                                    <div className="flex border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button
                                            title={plan.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            onClick={() => toggleActive(plan)}
                                            className={`px-4 py-4 transition-colors border-r border-gray-100 ${plan.is_active ? 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-green-500 hover:text-white'}`}
                                        >
                                            {plan.is_active ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                                        </button>
                                        <button
                                            title="Edit"
                                            onClick={() => handleOpenModal(plan)}
                                            className="px-4 py-4 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                                        >
                                            <FiEdit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            title="Delete"
                                            onClick={() => handleDeletePlan(plan)}
                                            className="px-4 py-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <FiCheckCircle className="text-green-400" />
                            Catatan
                        </h2>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li>Harga yang diubah di sini langsung berlaku di halaman produk dan checkout Midtrans.</li>
                            <li><strong>allowed_schema_types</strong>: Menentukan akses konten. DN = Beasiswa Dalam Negeri, LN = Luar Negeri.</li>
                            <li><strong>forum_tokens</strong>: Jumlah token Dreamshub yang diberikan saat user membeli paket ini.</li>
                            <li>Paket Enterprise hanya tampil sebagai display — user tidak bisa checkout, harus hubungi tim.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {modalMode === 'create' ? 'Tambah Pricing Plan' : 'Edit Pricing Plan'}
                                </h3>
                                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Slug</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="basic"
                                            disabled={modalMode === 'edit'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Nama Paket</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="BISA Basic"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Harga (Rp)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            required
                                            value={formatNumberInput(formData.price)}
                                            onChange={e => setFormData({ ...formData, price: parseNumberInput(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="49000"
                                        />
                                        <p className="text-[11px] text-gray-400">Contoh: 1.500.000</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Harga Coret (Rp)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatNumberInput(formData.original_price)}
                                            onChange={e => setFormData({ ...formData, original_price: parseNumberInput(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="79000"
                                        />
                                        <p className="text-[11px] text-gray-400">Opsional, contoh: 2.499.000</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Durasi (Hari)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            required
                                            value={formData.duration_days}
                                            onWheel={e => (e.target as HTMLInputElement).blur()}
                                            onChange={e => setFormData({ ...formData, duration_days: Math.max(0, Number(e.target.value) || 0) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Forum Tokens</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={formData.forum_tokens}
                                            onWheel={e => (e.target as HTMLInputElement).blur()}
                                            onChange={e => setFormData({ ...formData, forum_tokens: Math.max(0, Number(e.target.value) || 0) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Sort Order</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={formData.sort_order}
                                            onWheel={e => (e.target as HTMLInputElement).blur()}
                                            onChange={e => setFormData({ ...formData, sort_order: Math.max(0, Number(e.target.value) || 0) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Akses Konten (schema_type)</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleSchemaType('DALAM_NEGERI')}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formData.allowed_schema_types.includes('DALAM_NEGERI') ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                        >
                                            🇮🇩 Dalam Negeri
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleSchemaType('LUAR_NEGERI')}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formData.allowed_schema_types.includes('LUAR_NEGERI') ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                        >
                                            🌍 Luar Negeri
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Akses Spesifik Beasiswa / Modul (Opsional)</label>
                                    <p className="text-[11px] text-gray-400">Jika dicentang, plan ini HANYA membuka modul-modul terpilih. Jika kosong, plan membuka skema DN/LN secara keseluruhan.</p>
                                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 max-h-48 overflow-y-auto space-y-2">
                                        {courses.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">Memuat data kursus...</p>
                                        ) : (
                                            courses.map(course => (
                                                <label key={course.id} className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-gray-100/50 rounded-lg transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowed_module_ids.includes(course.id)}
                                                        onChange={() => toggleModuleSelection(course.id)}
                                                        className="w-4 h-4 rounded mt-0.5 border-gray-300 text-[#1B7691] focus:ring-[#1B7691]"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-gray-800">{course.name}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase font-medium">{course.schema_type === 'DALAM_NEGERI' ? '🇮🇩 DN' : '🌍 LN'} • {course.categoryId || 'Uncategorized'}</span>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Deskripsi</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                        placeholder="Akses Seluruh Tutorial Beasiswa Dalam Negeri"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Features (1 per baris)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.features}
                                        onChange={e => setFormData({ ...formData, features: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800 resize-none text-sm"
                                        placeholder={"Akses Seluruh Tutorial\nExclusive E-Book\n5x Dreamshub Consultation"}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Tag Label</label>
                                        <input
                                            type="text"
                                            value={formData.tag}
                                            onChange={e => setFormData({ ...formData, tag: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] text-gray-800"
                                            placeholder="Best Starter"
                                        />
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-end gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_popular}
                                                onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Popular</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_enterprise}
                                                onChange={e => setFormData({ ...formData, is_enterprise: e.target.checked })}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Enterprise (no checkout)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
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
                                    <FiSave /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminDashboard>
    );
};

export default withAuth(AdminPricingManagement, 'admin');
