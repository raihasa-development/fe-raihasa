import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  FiArrowLeft, FiAward, FiCalendar, FiSearch, FiRefreshCw, FiExternalLink, FiStar, FiChevronRight, FiCheck, FiMapPin, FiTarget
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
}

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

            <main className="min-h-screen bg-[#FDFEFE] py-20 px-4 relative overflow-hidden">
                {/* Modern Organic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-20 left-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[120px]" />
                    <div className="absolute bottom-20 right-[10%] w-[30%] h-[30%] bg-orange-100 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">
                    
                    {/* Dynamic Header */}
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl">
                            <motion.button 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => router.push('/scholra')}
                                className="flex items-center gap-2 text-[#1B7691] font-black uppercase text-[10px] tracking-[0.3em] mb-6 hover:translate-x-[-4px] transition-transform"
                            >
                                <FiArrowLeft /> Back to Chat
                            </motion.button>
                            <Typography className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                                The <span className="text-[#1B7691]">Elite</span> 20
                            </Typography>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Scholra telah menyaring <span className="text-[#FB991A] font-black">200+</span> kemungkinan dan memilihkan 20 yang paling relevan dengan profilmu.
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
                                    className="w-full md:w-[350px] pl-16 pr-8 py-5 bg-white border-2 border-gray-50 rounded-3xl shadow-xl shadow-gray-200/40 outline-none focus:border-[#1B7691] transition-all font-black text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-8 border-gray-100 border-t-[#1B7691] rounded-full animate-spin mb-6" />
                            <Typography className="text-gray-400 font-black uppercase tracking-widest text-xs">Crystallizing Results...</Typography>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                                    className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl hover:shadow-[0_40px_80px_rgba(27,118,145,0.12)] transition-all duration-500 group overflow-hidden flex flex-col pt-4"
                                >
                                    <div className="px-10 py-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1B7691] group-hover:bg-[#1B7691] group-hover:text-white transition-all transform group-hover:rotate-6">
                                                <FiAward size={28} />
                                            </div>
                                            <div className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] px-4 py-2 rounded-2xl shadow-lg shadow-blue-900/10">
                                                <div className="flex items-center gap-2 text-white">
                                                    <FiTarget size={14} className="text-orange-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest">
                                                        {item.matchLabel ? `${item.matchLabel} (${item.match_score}%)` : `${item.match_score || 0}% Match`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Typography className="text-2xl font-black text-gray-900 mb-2 leading-[1.1] group-hover:text-[#1B7691] transition-colors line-clamp-3">
                                            {item.title}
                                        </Typography>
                                        {item.provider && !['unknown', 'tidak diketahui', '-', 'Unknown'].includes(item.provider.toLowerCase()) && (
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-10">{item.provider}</p>
                                        )}

                                        <div className="mt-auto space-y-4">
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
                                                    <Typography className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Eligibility</Typography>
                                                    <Typography className="text-sm font-bold text-gray-700 line-clamp-1">{item.eligibility || 'Sesuai Profil'}</Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Action Card */}
                                    <div className="p-6 bg-gray-50/50 flex gap-3 border-t border-gray-50 group-hover:bg-white transition-all">
                                        <button 
                                            onClick={() => router.push(`/list-scholarship/${item.id}`)}
                                            className="flex-1 py-5 bg-[#1B7691] text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 hover:bg-orange-500 hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            Lihat Detail <FiChevronRight size={16} />
                                        </button>
                                        {item.link && item.link !== '#' && (
                                            <button 
                                                onClick={() => window.open(item.link, '_blank')}
                                                className="w-16 h-16 bg-white border-2 border-gray-100 text-gray-400 rounded-3xl flex items-center justify-center hover:border-[#FB991A] hover:text-[#FB991A] transition-all shadow-sm"
                                                title="Official Website / Guidebook"
                                            >
                                                <FiExternalLink size={20} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
                                <FiSearch size={40} />
                            </div>
                            <Typography className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">No Elite Matches Found</Typography>
                            <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">Coba sesuaikan profilmu sedikit untuk hasil yang lebih luas.</p>
                            <button 
                                onClick={() => router.push('/scholra')}
                                className="px-12 py-5 bg-[#1B7691] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 hover:-translate-y-2 transition-all"
                            >
                                Re-run Analysis
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
};

export default withAuth(ScholraResultsPage, 'user');
