import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
    FiArrowLeft, FiAward, FiCalendar, FiSearch, FiExternalLink, FiChevronRight, FiTarget
} from 'react-icons/fi';
import { motion } from 'framer-motion';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import withAuth from '@/components/hoc/withAuth';

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  deadline: string;
  amount: string;
  description: string;
  img_path?: string;
  match_score?: number;
  matchLabel?: string;
  eligibility?: string;
  link?: string;
    deadline_status?: 'open' | 'soon' | 'urgent' | 'closed' | 'unknown';
    days_left?: number | null;
    dims?: Record<string, number>;
}

const DIMENSION_LABELS: Record<string, string> = {
    jenjang_match: 'Kesesuaian Jenjang',
    tujuan_match: 'Kesesuaian Tujuan Negara',
    jenis_match: 'Kesesuaian Jenis Bantuan',
    ipk_margin: 'Margin IPK',
    age_margin: 'Margin Usia',
    ekonomi_match: 'Kesesuaian Kondisi Ekonomi',
    disabilitas_bonus: 'Afirmasi Disabilitas',
    agama_match: 'Kesesuaian Preferensi Lembaga',
    bahasa_match: 'Kesesuaian Sertifikat Bahasa',
    benefit_level: 'Tingkat Benefit',
    double_penalty: 'Kebijakan Beasiswa Rangkap',
};

const getDeadlineBadge = (status?: Scholarship['deadline_status'], daysLeft?: number | null) => {
    if (status === 'urgent' && typeof daysLeft === 'number') {
        return {
            text: `Deadline dekat: ${daysLeft} hari lagi`,
            className: 'bg-red-50 text-red-700 border border-red-100',
        };
    }

    if (status === 'soon' && typeof daysLeft === 'number') {
        return {
            text: `Deadline: ${daysLeft} hari lagi`,
            className: 'bg-orange-50 text-orange-700 border border-orange-100',
        };
    }

    if (status === 'closed') {
        return {
            text: 'Pendaftaran ditutup',
            className: 'bg-gray-100 text-gray-500 border border-gray-200',
        };
    }

    return null;
};

const ScholraResultsPage = () => {
    const router = useRouter();
    const [results, setResults] = useState<Scholarship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('scholarship_recommendations');
        if (stored) {
            try {
                setResults(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse Scholra results');
            }
        }
        setIsLoading(false);
    }, []);

    const filtered = useMemo(() => {
        return results.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.provider.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [results, searchQuery]);

    return (
        <Layout withNavbar withFooter>
            <SEO title="Analisis Cerdas Scholra | Raihasa" />

            <main className="min-h-screen bg-[#F7F9FB] py-14 px-4">
                <div className="container mx-auto max-w-7xl">

                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                        <div className="max-w-2xl">
                            <motion.button 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => router.push('/scholra')}
                                className="flex items-center gap-2 text-[#1B7691] font-bold uppercase text-[11px] tracking-[0.2em] mb-4"
                            >
                                <FiArrowLeft /> Kembali ke Profil
                            </motion.button>
                            <Typography className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                                Hasil <span className="text-[#1B7691]">Rekomendasi</span>
                            </Typography>
                            <p className="text-gray-600 text-base font-medium leading-relaxed">
                                Sistem telah menyaring <span className="text-[#FB991A] font-black">{results.length}</span> kandidat sesuai profilmu.
                            </p>
                        </div>

                        <div className="w-full md:w-auto">
                            <div className="relative group">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B7691] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Cari beasiswa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-[340px] pl-14 pr-6 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#1B7691] transition-all font-semibold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-8 border-gray-100 border-t-[#1B7691] rounded-full animate-spin mb-6" />
                            <Typography className="text-gray-400 font-black uppercase tracking-widest text-xs">Memuat Rekomendasi...</Typography>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filtered.map((item, idx) => {
                                const deadlineBadge = getDeadlineBadge(item.deadline_status, item.days_left);

                                return (
                                    <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    <div className="px-6 py-5 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="w-11 h-11 bg-[#1B7691]/10 rounded-xl flex items-center justify-center text-[#1B7691]">
                                                <FiAward size={20} />
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-[#1B7691] text-white text-xs font-bold tracking-wide inline-flex items-center gap-1.5">
                                                <FiTarget size={13} />
                                                {item.matchLabel ? `${item.matchLabel} (${item.match_score}%)` : `${item.match_score || 0}%`}
                                            </div>
                                        </div>

                                        <Typography className="text-xl font-black text-gray-900 mb-2 leading-snug line-clamp-3">
                                            {item.title}
                                        </Typography>
                                        {item.provider && !['unknown', 'tidak diketahui', '-', 'Unknown'].includes(item.provider.toLowerCase()) && (
                                            <p className="text-xs text-gray-500 font-semibold mb-5 line-clamp-1">{item.provider}</p>
                                        )}

                                        <div className="mt-auto space-y-4">
                                            {deadlineBadge && (
                                                <div className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-bold ${deadlineBadge.className}`}>
                                                    {deadlineBadge.text}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-blue-50/50">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B7691] shadow-sm">
                                                    <FiCalendar />
                                                </div>
                                                <div>
                                                    <Typography className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deadline</Typography>
                                                    <Typography className="text-sm font-bold text-gray-700">
                                                        {item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open Registration'}
                                                    </Typography>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl transition-colors group-hover:bg-orange-50/50">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#FB991A] shadow-sm">
                                                    <FiTarget />
                                                </div>
                                                <div>
                                                    <Typography className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kesesuaian Profil</Typography>
                                                    <Typography className="text-sm font-bold text-gray-700 line-clamp-1">{item.eligibility || 'Sesuai Profil'}</Typography>
                                                </div>
                                            </div>

                                            {item.dims && Object.keys(item.dims).length > 0 && (
                                                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                                    <Typography className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                                                        Breakdown 11 Dimensi
                                                    </Typography>
                                                    <div className="space-y-2 max-h-52 overflow-auto pr-1">
                                                        {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                                                            const rawScore = item.dims?.[key] ?? 0;
                                                            const score = Math.max(0, Math.min(1, rawScore));
                                                            const pct = Math.round(score * 100);

                                                            return (
                                                                <div key={key}>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <Typography className="text-xs font-medium text-gray-600">
                                                                            {label}
                                                                        </Typography>
                                                                        <Typography className="text-xs font-bold text-gray-700">
                                                                            {pct}%
                                                                        </Typography>
                                                                    </div>
                                                                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-[#1B7691]"
                                                                            style={{ width: `${pct}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Action Card */}
                                    <div className="p-4 bg-gray-50/60 flex gap-2 border-t border-gray-100">
                                        <button 
                                            onClick={() => router.push(`/list-scholarship/${item.id}`)}
                                            className="flex-1 py-3.5 bg-[#1B7691] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.16em] hover:bg-[#15627a] transition-all flex items-center justify-center gap-2"
                                        >
                                            Lihat Detail <FiChevronRight size={16} />
                                        </button>
                                        {item.link && item.link !== '#' && (
                                            <button 
                                                onClick={() => window.open(item.link, '_blank')}
                                                className="w-12 h-12 bg-white border border-gray-200 text-gray-500 rounded-xl flex items-center justify-center hover:border-[#1B7691] hover:text-[#1B7691] transition-all"
                                                title="Official Website / Guidebook"
                                            >
                                                <FiExternalLink size={20} />
                                            </button>
                                        )}
                                    </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-40">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
                                <FiSearch size={40} />
                            </div>
                            <Typography className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No Elite Matches Found</Typography>
                            <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">Belum ada hasil yang sesuai. Silakan perbarui profil untuk mendapatkan rekomendasi yang lebih tepat.</p>
                            <button 
                                onClick={() => router.push('/scholra')}
                                className="px-12 py-5 bg-[#1B7691] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 hover:-translate-y-2 transition-all"
                            >
                                Ulangi Analisis
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
};

export default withAuth(ScholraResultsPage, 'user');
