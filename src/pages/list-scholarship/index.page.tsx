'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
    FiArrowLeft,
    FiCalendar,
    FiExternalLink,
    FiAward,
    FiSearch,
    FiClock,
    FiLock,
    FiChevronLeft,
    FiChevronRight,
    FiStar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';
import { ApiReturn } from '@/types/api';

// Type from Calendar page
type ScholarshipData = {
    id: string;
    nama: string;
    penyelenggara: string;
    open_registration: string;
    close_registration: string;
    link_pendaftaran: string | null;
    status_batas_usia: boolean;
    jenis: string;
    jenjang: string[];
    img_path: string | null;
    benefit: string;
    is_pinned: boolean;
    is_favorite: boolean;
};

type FilterStatus = 'all' | 'open' | 'closed';

export default function ListScholarshipPage() {
    const router = useRouter();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [selectedJenjang, setSelectedJenjang] = useState<string[]>([]);
    const [selectedJenis, setSelectedJenis] = useState<string[]>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterStatus, selectedJenjang, selectedJenis]);

    // Fetch Data (All for client-side filtering + pagination)
    const { data: scholarshipResponse, isLoading } = useQuery<ApiReturn<ScholarshipData[]>>({
        queryKey: ['scholarships', 'list'],
        queryFn: async () => {
            const response = await api.get<ApiReturn<ScholarshipData[]>>('/scholarship?limit=1000');
            return response.data;
        },
    });

    const scholarships = scholarshipResponse?.data || [];

    // Helper: Date Logic
    const getDaysUntil = (deadline: string): number | null => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(deadline);
            const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
        } catch { return null; }
    };

    const isOpen = (deadline: string) => {
        const days = getDaysUntil(deadline);
        return days !== null && days >= 0;
    };

    // Extract Filters
    const allJenjang = useMemo(() => {
        const set = new Set<string>();
        scholarships.forEach(s => s.jenjang.forEach(j => set.add(j)));
        return Array.from(set).sort();
    }, [scholarships]);

    const allJenis = useMemo(() => {
        const set = new Set<string>();
        scholarships.forEach(s => set.add(s.jenis));
        return Array.from(set).sort();
    }, [scholarships]);

    // Filtering Logic
    const filteredResults = useMemo(() => {
        let results = [...scholarships];

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(s =>
                s.nama.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (filterStatus === 'open') {
            results = results.filter(s => isOpen(s.close_registration));
        } else if (filterStatus === 'closed') {
            results = results.filter(s => !isOpen(s.close_registration));
        }

        // Jenjang Filter
        if (selectedJenjang.length > 0) {
            results = results.filter(s => s.jenjang.some(j => selectedJenjang.includes(j)));
        }

        // Jenis Filter
        if (selectedJenis.length > 0) {
            results = results.filter(s => selectedJenis.includes(s.jenis));
        }

        // Sort: Favorite first, then Open first, then by deadline
        results.sort((a, b) => {
            if (a.is_favorite && !b.is_favorite) return -1;
            if (!a.is_favorite && b.is_favorite) return 1;

            const openA = isOpen(a.close_registration);
            const openB = isOpen(b.close_registration);

            if (openA && !openB) return -1;
            if (!openA && openB) return 1;

            const daysA = getDaysUntil(a.close_registration) ?? 999;
            const daysB = getDaysUntil(b.close_registration) ?? 999;
            return daysA - daysB;
        });

        return results;
    }, [scholarships, searchQuery, filterStatus, selectedJenjang, selectedJenis]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
    const paginatedResults = filteredResults.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const openCount = scholarships.filter(s => isOpen(s.close_registration)).length;
    const closedCount = scholarships.filter(s => !isOpen(s.close_registration)).length;

    // Actions
    const checkAuth = () => {
        if (typeof window === 'undefined') return false;
        const token = getToken();
        // Also check localStorage as backup if needed, but getToken handles the primary cookie
        const lsToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
        return !!(token || lsToken);
    };

    const handleViewDetail = (id: string) => {
        if (checkAuth()) {
            router.push(`/list-scholarship/${id}`);
        } else {
            setSelectedId(id);
            setShowLoginModal(true);
        }
    };

    const formattedDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    };

    if (isLoading) {
        return (
            <Layout withNavbar withFooter>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center font-primary">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Memuat beasiswa...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout withNavbar withFooter>
            <SEO title="Daftar Beasiswa | Scholra" />

            <main className="min-h-screen bg-gray-50/50 pb-20 font-primary">

                {/* HERO HEADER */}
                <div className="bg-[#1B7691] pt-28 pb-32 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-all duration-300 text-sm font-medium"
                        >
                            <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-all">
                                <FiArrowLeft className="w-4 h-4" />
                            </div>
                            <span>Kembali</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="max-w-2xl">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight font-primary tracking-tight">
                                    Jelajahi Beasiswa
                                </h1>
                                <p className="text-white/90 text-sm md:text-base leading-relaxed font-light">
                                    Temukan ribuan peluang pendidikan dari seluruh dunia. Gunakan filter untuk mencari yang sesuai denganmu.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="container mx-auto px-4 -mt-16 relative z-20">

                    {/* FILTER BAR */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* Search */}
                            <div className="lg:col-span-4 relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1B7691] transition-all duration-300" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari beasiswa..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#1B7691]/20 font-medium transition-all"
                                />
                            </div>

                            {/* Status Toggles */}
                            <div className="lg:col-span-3">
                                <div className="flex bg-gray-50 p-1 rounded-lg">
                                    {(['all', 'open', 'closed'] as const).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`flex-1 py-2 rounded-md text-xs font-bold capitalize transition-all ${filterStatus === status ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {status === 'all' ? 'Semua' : status === 'open' ? 'Dibuka' : 'Ditutup'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filters (Jenjang/Jenis) */}
                            <div className="lg:col-span-5 space-y-3">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Jenjang:</span>
                                    {allJenjang.map(j => (
                                        <button
                                            key={j}
                                            onClick={() => setSelectedJenjang(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j])}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${selectedJenjang.includes(j)
                                                ? 'bg-[#1B7691] border-[#1B7691] text-white'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {j}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Jenis:</span>
                                    {allJenis.map(j => (
                                        <button
                                            key={j}
                                            onClick={() => setSelectedJenis(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j])}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${selectedJenis.includes(j)
                                                ? 'bg-[#1B7691] border-[#1B7691] text-white'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {j}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    {filteredResults.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                            <FiSearch className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 text-xl">Tidak ada beasiswa ditemukan</h3>
                            <p className="text-base text-gray-600 mt-2">Coba ubah filter atau kata kunci pencarian.</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedJenjang([]); setSelectedJenis([]); setFilterStatus('all') }} className="mt-6 text-[#1B7691] font-bold text-sm hover:underline transition-all duration-300">
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {paginatedResults.map((s) => {
                                    const active = isOpen(s.close_registration);
                                    const daysLeft = getDaysUntil(s.close_registration);
                                    const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

                                    return (
                                        <motion.div
                                            key={s.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-md group relative overflow-hidden ${active ? 'border-gray-100 hover:border-[#1B7691]/30' : 'border-gray-100 bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                                {/* Status Strip */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${active ? (isUrgent ? 'bg-amber-500' : 'bg-[#1B7691]') : 'bg-gray-300'
                                                    }`} />

                                                <div className="flex-1 pl-4">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        {active ? (
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isUrgent ? `Segera Tutup (${daysLeft} hari)` : 'Dibuka'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                                                Ditutup
                                                            </span>
                                                        )}

                                                        {s.is_favorite && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1 border border-yellow-200">
                                                                <FiStar className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Favorit
                                                            </span>
                                                        )}

                                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                            <FiAward className="w-3 h-3" /> {s.jenis}
                                                        </span>

                                                        {s.jenjang.map(j => (
                                                            <span key={j} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                                {j}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#1B7691] transition-all duration-300 font-primary">
                                                        {s.nama}
                                                    </h3>

                                                    {/* Provider Removed per User Request */}

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <FiClock className="w-4 h-4 text-[#1B7691]" />
                                                            <span>Deadline: {formattedDate(s.close_registration)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex md:flex-col justify-end items-center gap-2 min-w-[140px]">
                                                    <button
                                                        onClick={() => handleViewDetail(s.id)}
                                                        // Disabled prop removed to allow viewing closed scholarships
                                                        className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${active
                                                            ? 'bg-[#1B7691] text-white hover:bg-[#15627a] shadow-sm hover:shadow-md'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                                            }`}
                                                    >
                                                        {active ? 'Lihat Detail' : 'Detail (Tutup)'}
                                                        <FiExternalLink className={!active ? 'opacity-50' : ''} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* PAGINATION CONTROLS */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Simple logic to show first few pages or surrounding current page
                                            // For simplicity: Showing limited range or all if small
                                            let p = i + 1;
                                            if (totalPages > 5) {
                                                if (page > 3) p = page - 2 + i;
                                                if (p > totalPages) p = p - (p - totalPages); // clamp? No, just render what fits or simplified
                                            }

                                            // Better simple pagination:
                                            // Just show current page and total
                                            return null;
                                        })}
                                        <span className="text-sm font-medium text-gray-600 px-4">
                                            Halaman {page} dari {totalPages}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* Auth Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-primary">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-sm max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-14 h-14 bg-blue-50 text-[#1B7691] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiLock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Login Diperlukan</h3>
                            <p className="text-sm text-gray-500 mb-6">Silakan login untuk mengakses detail beasiswa ini.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => router.push('/auth/login')} className="w-full py-3 bg-primary-blue text-white font-bold rounded-xl hover:bg-[#15627a] transition-all duration-300">
                                    Login Sekarang
                                </button>
                                <button onClick={() => setShowLoginModal(false)} className="w-full py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-all duration-300">
                                    Batal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
