import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
    FiArrowLeft, FiAward, FiCalendar, FiSearch, FiExternalLink, FiChevronRight, FiTarget, FiInfo, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
  insights?: string[];
}

const DIMENSION_LABELS: Record<string, string> = {
    jenjang_match: 'Jenjang',
    tujuan_match: 'Tujuan Studi',
    jenis_match: 'Jenis Bantuan',
    ipk_margin: 'Ketentuan IPK',
    age_margin: 'Batas Usia',
    ekonomi_match: 'Kondisi Ekonomi',
    disabilitas_bonus: 'Disabilitas',
    agama_match: 'Afiliasi Agama',
    bahasa_match: 'Sertifikat Bahasa',
    benefit_level: 'Tingkat Benefit',
    double_penalty: 'Beasiswa Rangkap',
    deadline_urgency: 'Urgensi Pendaftaran',
    semester_match: 'Kesesuaian Semester',
    benefit_richness: 'Kelengkapan Benefit',
    kampus_match: 'Eligibilitas Kampus',
    daerah_match: 'Prioritas Daerah',
    skor_bahasa_match: 'Skor Bahasa',
};


const getDeadlineBadge = (status?: Scholarship['deadline_status'], daysLeft?: number | null) => {
    if (status === 'urgent' && typeof daysLeft === 'number') {
        return {
            text: `🔴 ${daysLeft} hari lagi`,
            className: 'text-red-600 bg-red-50 border-red-100',
        };
    }
    if (status === 'soon' && typeof daysLeft === 'number') {
        return {
            text: `🟠 ${daysLeft} hari lagi`,
            className: 'text-amber-600 bg-amber-50 border-amber-100',
        };
    }
    if (status === 'closed') {
        return {
            text: '⚫ Ditutup',
            className: 'text-gray-500 bg-gray-100 border-gray-200',
        };
    }
    return null;
};

const ScholarshipCard = ({ item, idx }: { item: Scholarship, idx: number }) => {
    const router = useRouter();
    const [showDims, setShowDims] = useState(false);
    const deadlineBadge = getDeadlineBadge(item.deadline_status, item.days_left);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative group"
        >
            {/* Top Pattern Area */}
            <div className="h-24 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-100/50 relative overflow-hidden">
                 <div className="absolute top-[-30%] right-[-10%] w-32 h-32 bg-[#1B7691]/5 rounded-full blur-2xl group-hover:bg-[#1B7691]/10 transition-all duration-500" />
                 <div className="absolute bottom-4 left-6">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#1B7691]">
                        <FiAward size={24} />
                    </div>
                 </div>
                 {/* Match Score Badge Absolute */}
                 <div className="absolute top-4 right-4">
                     <div className="px-3 py-1.5 rounded-xl bg-white shadow-sm border border-gray-100 text-[#1B7691] font-black text-xs tracking-wide flex items-center gap-1.5">
                        <FiTarget size={14} />
                        {item.match_score || 0}% Match
                    </div>
                 </div>
            </div>

            <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
                <Typography className="text-xl font-black text-gray-900 mb-1 leading-snug line-clamp-2">
                    {item.title}
                </Typography>
                {item.provider && !['unknown', 'tidak diketahui', '-', 'Unknown'].includes(item.provider.toLowerCase()) && (
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 line-clamp-1">{item.provider}</p>
                )}

                {/* Personalized Insights */}
                {item.insights && item.insights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {item.insights.map((insight, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#1B7691]/5 text-[#1B7691] text-[10px] font-bold border border-[#1B7691]/10"
                            >
                                {insight}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-between">
                            Deadline
                            {deadlineBadge && <span className={`text-[10px] px-1.5 rounded-md ${deadlineBadge.className}`}>{deadlineBadge.text}</span>}
                        </div>
                        <Typography className="text-sm font-bold text-gray-700">
                            {item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open Registration'}
                        </Typography>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <Typography className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Target</Typography>
                        <Typography className="text-sm font-bold text-gray-700 line-clamp-1">{item.eligibility || 'Sesuai Profil'}</Typography>
                    </div>
                </div>

                {item.dims && Object.keys(item.dims).length > 0 && (
                    <div className="mt-2">
                        <button 
                            onClick={() => setShowDims(!showDims)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-[#1B7691] transition-all duration-300 border-t border-gray-100"
                        >
                            {showDims ? <><FiChevronUp /> Hide Analysis Breakdown</> : <><FiChevronDown /> View Analysis Breakdown</>}
                        </button>
                        
                        <AnimatePresence>
                            {showDims && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 pb-1">
                                        {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                                            const rawScore = item.dims?.[key] ?? 0;
                                            const score = Math.max(0, Math.min(1, rawScore));
                                            const pct = Math.round(score * 100);
                                            
                                            // Optional: Hide elements with 0% that aren't relevant (or keep them to show why)
                                            if (pct === 0 && !['jenjang_match', 'ipk_margin'].includes(key)) return null;

                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[9px] font-bold text-gray-500 tracking-wide">{label}</span>
                                                        <span className="text-[9px] font-black text-[#1B7691]">{pct}%</span>
                                                    </div>
                                                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-[#1B7691] to-[#FB991A]" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex gap-3">
                <button 
                    onClick={() => router.push(`/list-scholarship/${item.id}`)}
                    className="flex-1 py-3 bg-[#1B7691] text-white rounded-xl font-bold text-sm hover:bg-[#15627a] hover:shadow-lg shadow-[#1B7691]/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    Lihat Detail
                </button>
                {item.link && item.link !== '#' && (
                    <button 
                        onClick={() => window.open(item.link, '_blank')}
                        className="w-12 h-12 bg-white border-2 border-gray-200 text-gray-500 rounded-xl flex items-center justify-center hover:border-gray-300 hover:text-gray-700 transition-all shadow-sm"
                        title="Official Website"
                    >
                        <FiExternalLink size={18} />
                    </button>
                )}
            </div>
        </motion.div>
    );
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
            <SEO title="Hasil Analisis Beasiswa | Scholra" />

            <main className="min-h-screen bg-[#FAFAFA] font-sans">
                {/* Premium Header Map */}
                <div className="bg-white border-b border-gray-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1B7691]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
                        <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                            <div className="relative z-10 w-full max-w-3xl">
                                <motion.button 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => { window.location.href = '/scholra'; }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 mb-8 border border-gray-200 cursor-pointer relative z-50 shadow-sm"
                                >
                                    <FiArrowLeft size={12} /> Kembali Uji Profil
                                </motion.button>
                                
                                <Typography className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                                    Hasil Analisis <span className="text-[#1B7691]">Kecocokanmu</span>
                                </Typography>
                                <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
                                    Kami telah menganalisis profil akademikmu dan menemukan <span className="text-[#FB991A] font-bold">{results.length}</span> beasiswa yang paling relevan untukmu.
                                </p>
                            </div>

                            <div className="w-full md:w-[360px] relative z-10">
                                <div className="relative group shadow-sm rounded-2xl overflow-hidden bg-white border border-gray-200 focus-within:border-[#1B7691] focus-within:ring-4 focus-within:ring-[#1B7691]/10 transition-all">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama beasiswa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-transparent outline-none font-bold text-gray-700 text-sm placeholder:text-gray-400 placeholder:font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B7691] rounded-full animate-spin mb-6" />
                            <Typography className="text-gray-400 font-black uppercase tracking-widest text-xs">Memuat Rekomendasi...</Typography>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            {filtered.map((item, idx) => (
                                <ScholarshipCard key={item.id} item={item} idx={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <FiSearch size={32} />
                            </div>
                            <Typography className="text-2xl font-black text-gray-900 mb-3">Tidak Ada Hasil</Typography>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Berdasarkan data profil yang kamu berikan, belum ada beasiswa aktif yang sesuai. Coba sesuaikan preferensimu (misalnya kurangi filter negara). </p>
                            <button 
                                onClick={() => { window.location.href = '/scholra'; }}
                                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all cursor-pointer"
                            >
                                Sesuaikan Preferensi
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
};

export default withAuth(ScholraResultsPage, 'optional');
