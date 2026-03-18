'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import {
  FiArrowLeft,
  FiCalendar,
  FiAward,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiX,
  FiHeart,
  FiRotateCcw,
  FiInfo,
  FiGrid,
  FiLayers,
  FiLock,
  FiStar,
  FiTrendingUp,
  FiMapPin,
  FiBarChart2
} from 'react-icons/fi';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { getToken } from '@/lib/cookies';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';
import api from '@/lib/api';

// --- Types ---
interface ScholarshipResult {
  id: string;
  title: string;
  provider: string;
  deadline: string;
  amount: string;
  requirements: string[];
  description: string;
  eligibility: string;
  link: string;
  match_score?: number;
  img_path?: string;
  jenis?: string;
}

type ViewMode = 'deck' | 'list';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

// --- Main Page Component ---
export default function ScholarshipResultsPage() {
  const router = useRouter();

  // State
  const [recommendations, setRecommendations] = useState<ScholarshipResult[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<ScholarshipResult[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('deck');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  // Load Data
  useEffect(() => {
    const storedRecommendations = localStorage.getItem('scholarship_recommendations');
    if (storedRecommendations) {
      try {
        const parsed = JSON.parse(storedRecommendations);
        setRecommendations(parsed);
        // Sort by Match Score Descending
        const sorted = [...parsed].sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0));
        setFilteredRecommendations(sorted);
      } catch (e) {
        console.error('Failed to parse recommendations:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = recommendations;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q)
      );
    }
    setFilteredRecommendations(result);
  }, [searchQuery, recommendations]);

  // --- Helpers from Copy ---
  // Check if scholarship is still open
  const isOpen = (deadline: string): boolean => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        const months: { [key: string]: number } = {
          'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
          'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
          'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
        };
        const parts = deadline.toLowerCase().split(' ');
        if (parts.length >= 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1]];
          const year = parseInt(parts[2]);
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            const parsed = new Date(year, month, day);
            return parsed >= today;
          }
        }
        return true;
      }
      return deadlineDate >= today;
    } catch {
      return true;
    }
  };

  const getDaysUntil = (deadline: string): number | null => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        const months: { [key: string]: number } = {
          'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
          'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
          'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
        };
        const parts = deadline.toLowerCase().split(' ');
        if (parts.length >= 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1]];
          const year = parseInt(parts[2]);
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            const parsed = new Date(year, month, day);
            const diff = Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
          }
        }
        return null;
      }
      const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };


  // --- Actions ---
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    const token = getToken();
    const lsToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return !!(token || lsToken);
  };

  const addToWishlist = async (id: string) => {
    if (!checkAuth()) {
      setShowLoginModal(true);
      return false; // Auth failed
    }

    try {
      await api.post('/wishlist', { beasiswaId: id });
      showToast('Disimpan ke Wishlist', SUCCESS_TOAST);
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || '';
      if (msg.includes('exist') || msg.includes('sudah')) {
        showToast('Sudah ada di Wishlist', SUCCESS_TOAST);
        return true;
      }
      showToast('Gagal menyimpan', DANGER_TOAST);
      return false;
    }
  };

  // Deck Actions
  const handleSwipe = async (id: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      const success = await addToWishlist(id);
      if (!success && !checkAuth()) {
        // Optionally pause removal? Nah, standard flow is show modal.
      }
    }
    setTimeout(() => {
      setRemovedIds(prev => [...prev, id]);
    }, 200);
  };

  const handleResetDeck = () => setRemovedIds([]);

  const handleViewDetail = (id: string) => {
    if (checkAuth()) router.push(`/scholarship-recommendation/${id}`);
    else setShowLoginModal(true);
  };

  const activeCards = useMemo(() => {
    return filteredRecommendations.filter(r => !removedIds.includes(r.id));
  }, [filteredRecommendations, removedIds]);

  // --- Render Loading ---
  if (isLoading) {
    return (
      <Layout withNavbar withFooter>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout withNavbar withFooter>
      <SEO title="Hasil Rekomendasi | Scholra" />

      <main className="min-h-screen bg-[#F8FAFC] font-primary pb-20 overflow-x-hidden">

        {/* --- Header Section --- */}
        <div className="relative pt-24 pb-10 px-4">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
          <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-orange-100/50 rounded-full blur-3xl -translate-x-1/2 -z-10" />

          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <button
                onClick={() => router.push('/scholarship-recommendation')}
                className="flex items-center gap-2 text-gray-500 hover:text-[#1B7691] transition-colors font-medium self-start"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <FiArrowLeft />
                </div>
                <span>Ulangi Tes</span>
              </button>

              {/* View Toggle */}
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex self-start md:self-auto">
                <button
                  onClick={() => setViewMode('deck')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'deck' ? 'bg-[#1B7691] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FiLayers /> Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[#1B7691] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FiGrid /> List
                </button>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {viewMode === 'deck' ? 'Jodoh Beasiswamu ✨' : 'Hasil Rekomendasi'}
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto">
                {viewMode === 'deck'
                  ? 'Geser kanan untuk simpan ke wishlist, kiri untuk lewati. Algoritma kami telah memilihkan yang terbaik.'
                  : 'Berikut adalah daftar beasiswa yang paling cocok dengan profil kamu.'}
              </p>
            </div>
          </div>
        </div>

        {/* --- DECK MODE --- */}
        <AnimatePresence mode='wait'>
          {viewMode === 'deck' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 flex flex-col items-center min-h-[600px]"
            >
              {activeCards.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-md w-full border border-gray-100">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Semua Selesai!</h2>
                  <p className="text-gray-500 mb-8">Kamu sudah melihat semua rekomendasi beasiswa untuk saat ini.</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleResetDeck} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors flex items-center gap-2">
                      <FiRotateCcw /> Ulangi
                    </button>
                    <button onClick={() => setViewMode('list')} className="px-6 py-3 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
                      <FiGrid /> Lihat List
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-[360px] md:max-w-[400px] h-[600px] flex items-center justify-center">
                  {activeCards.slice(0, 3).reverse().map((scholarship, index) => (
                    <CardItem
                      key={scholarship.id}
                      data={scholarship}
                      active={index === Math.min(activeCards.length, 3) - 1} // Top card is active
                      onSwipe={handleSwipe}
                      onDetail={() => handleViewDetail(scholarship.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- LIST MODE (Consistent View) --- */}
          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="container mx-auto px-4 max-w-4xl"
            >
              <div className="relative mb-8 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B7691] transition-colors" />
                <input
                  type="text"
                  placeholder="Cari beasiswa berdasarkan nama atau penyedia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#1B7691] focus:ring-4 focus:ring-[#1B7691]/10 transition-all font-medium text-gray-700 shadow-sm outline-none"
                />
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-400 font-medium">Tidak ada beasiswa ditemukan</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredRecommendations.map((scholarship) => {
                    const scholarshipOpen = isOpen(scholarship.deadline);
                    const daysUntil = getDaysUntil(scholarship.deadline);
                    const isUrgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

                    return (
                      <motion.div
                        key={scholarship.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md group relative overflow-hidden ${scholarshipOpen ? 'border-gray-200 hover:border-[#1B7691]/30' : 'border-gray-200 bg-gray-50'
                          }`}
                      >
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">

                          {/* Left: Indicator Strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${scholarshipOpen ? (isUrgent ? 'bg-amber-500' : 'bg-[#1B7691]') : 'bg-gray-300'
                            }`} />

                          <div className="flex-1 pl-4">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {/* Status Badge */}
                              {scholarshipOpen ? (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                  {isUrgent ? `Segera Tutup (${daysUntil} hari)` : 'Dibuka'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-200 text-gray-600">
                                  Ditutup
                                </span>
                              )}

                              {/* Match Score */}
                              {scholarship.match_score !== undefined && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${scholarship.match_score >= 0.8 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                  <FiBarChart2 className="w-3 h-3" />
                                  {Math.round(scholarship.match_score * 100)}% Cocok
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1 font-primary group-hover:text-[#1B7691] transition-colors">
                              {scholarship.title}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-5 font-primary">
                              <span className="bg-gray-100/50 px-2 py-0.5 rounded text-gray-600">{scholarship.provider}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-primary">
                              <div className="flex items-center gap-2">
                                <FiAward className="w-4 h-4 text-[#1B7691]" />
                                <span>{scholarship.amount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                <span>{scholarship.deadline}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Action */}
                          <div className="flex md:flex-col justify-center items-end gap-3 min-w-[140px]">
                            <button
                              onClick={() => handleViewDetail(scholarship.id)}
                              className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${scholarshipOpen
                                ? 'bg-[#1B7691] text-white hover:bg-[#15627a] shadow-sm hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                }`}
                              disabled={!scholarshipOpen}
                            >
                              {scholarshipOpen ? 'Detail' : 'Tutup'}
                              {scholarshipOpen && <FiArrowLeft className="rotate-180 w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Auth Modal --- */}
        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#1B7691]">
                  <FiLock size={28} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Simpan ke Wishlist?</h3>
                <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">Login terlebih dahulu untuk menyimpan beasiswa ini dan mendapatkan notifikasi deadline.</p>

                <button onClick={() => router.push('/auth/login')} className="w-full py-3.5 bg-[#1B7691] text-white font-bold rounded-xl mb-3 shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform">
                  Login Sekarang
                </button>
                <button onClick={() => setShowLoginModal(false)} className="w-full py-3.5 text-gray-500 font-bold hover:text-gray-800 transition-colors">
                  Nanti Saja
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </Layout>
  );
}

// --- Card Component (Tinder Style) ---
function CardItem({ data, active, onSwipe, onDetail }: {
  data: ScholarshipResult,
  active: boolean,
  onSwipe: (id: string, dir: 'left' | 'right') => void,
  onDetail: () => void
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Smooth color interpolation for background hint
  const bgLike = useTransform(x, [0, 150], ["rgba(255,255,255,1)", "rgba(236,253,245,1)"]); // White -> Subtle Emerald
  const bgNope = useTransform(x, [-150, 0], ["rgba(254,242,242,1)", "rgba(255,255,255,1)"]); // Subtle Rose -> White

  const background = useTransform(x, (currentX) => currentX > 0 ? bgLike.get() : bgNope.get());

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(data.id, info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        background, // Animated background color
        zIndex: active ? 10 : 0,
        position: 'absolute',
        top: 0
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{
        scale: active ? 1 : 0.95,
        opacity: active ? 1 : 0.5,
        y: active ? 0 : 30,
        transition: { type: "spring", damping: 20, stiffness: 300 }
      }}
      whileHover={{ cursor: active ? 'grab' : 'default' }}
      whileTap={{ cursor: active ? 'grabbing' : 'default' }}
      className={`w-full rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden select-none h-[580px] flex flex-col`}
    >
      {/* --- Card Header (Visual) --- */}
      <div className="h-[240px] bg-gradient-to-br from-[#0F4C75] to-[#1B7691] relative p-6 flex flex-col justify-end">
        {/* Abstract Curves */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FB991A]/20 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />

        {/* Match Badge */}
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex flex-col items-center justify-center w-16 h-16 shadow-lg">
          <span className="text-[#FB991A] font-extrabold text-lg leading-none">{data.match_score ? Math.round(data.match_score * 100) : '?'}%</span>
          <span className="text-[10px] text-white font-medium uppercase tracking-wide">Match</span>
        </div>

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-wider mb-3">
            {data.jenis || 'Beasiswa'}
          </span>
          <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2 md:text-3xl drop-shadow-sm">
            {data.title}
          </h2>
          <p className="text-white/80 font-medium text-sm mt-1 flex items-center gap-2">
            <FiAward /> {data.provider}
          </p>
        </div>
      </div>

      {/* --- Card Body --- */}
      {/* Removed bg-white to allow motion.div background to show */}
      <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden relative">
        <div className="space-y-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B7691] flex items-center justify-center text-xl shrink-0">
              <strong>Rp</strong>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pendanaan</p>
              <p className="font-bold text-gray-800 line-clamp-1">{data.amount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shrink-0">
              <FiCalendar />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deadline</p>
              <p className="font-bold text-gray-800">{new Date(data.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10 pointer-events-none" />
          <p className="text-gray-500 text-sm leading-relaxed">
            {data.description || 'Deskripsi beasiswa ini sangat sesuai dengan preferensi yang kamu masukkan. Geser kanan untuk menyimpan dan melihat detail lengkapnya nanti.'}
          </p>
        </div>

        {/* --- Action Buttons (Floating) --- */}
        <div className="grid grid-cols-3 gap-6 items-center mt-auto pt-4 relative z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onSwipe(data.id, 'left'); }}
            className="w-16 h-16 rounded-full bg-white border border-gray-200 text-red-500 shadow-lg hover:bg-red-50 hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center mx-auto"
          >
            <FiX size={28} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDetail(); }}
            className="h-12 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <FiInfo size={18} /> Detail
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSwipe(data.id, 'right'); }}
            className="w-16 h-16 rounded-full bg-[#1B7691] text-white shadow-lg shadow-blue-900/30 hover:bg-[#15627a] hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center mx-auto"
          >
            <FiHeart size={28} className="fill-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
