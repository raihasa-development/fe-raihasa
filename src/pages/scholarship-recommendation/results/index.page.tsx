'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiCalendar,
  FiExternalLink,
  FiAward,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiLock,
  FiInfo,
  FiBarChart2,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

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
}

type FilterStatus = 'all' | 'open' | 'closed';
type SortBy = 'match' | 'deadline' | 'name';

export default function ScholarshipResultsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<ScholarshipResult[]>([]);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('match');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | null>(null);

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('scholarship_recommendations');
    const storedSummary = localStorage.getItem('scholarship_search_summary');

    if (storedRecommendations) {
      try {
        const parsed = JSON.parse(storedRecommendations);
        setRecommendations(parsed);
      } catch (e) {
        console.error('Failed to parse recommendations:', e);
      }
    }

    if (storedSummary) {
      setSearchSummary(storedSummary);
    }

    setIsLoading(false);
  }, []);

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

  const filteredResults = useMemo(() => {
    let results = [...recommendations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.provider.toLowerCase().includes(query)
      );
    }

    if (filterStatus === 'open') {
      results = results.filter(r => isOpen(r.deadline));
    } else if (filterStatus === 'closed') {
      results = results.filter(r => !isOpen(r.deadline));
    }

    results.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.match_score || 0) - (a.match_score || 0);
      } else if (sortBy === 'deadline') {
        const daysA = getDaysUntil(a.deadline) ?? 999;
        const daysB = getDaysUntil(b.deadline) ?? 999;
        return daysA - daysB;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return results;
  }, [recommendations, filterStatus, sortBy, searchQuery]);

  const openCount = recommendations.filter(r => isOpen(r.deadline)).length;
  const closedCount = recommendations.filter(r => !isOpen(r.deadline)).length;

  const handleBackToSearch = () => {
    router.push('/scholarship-recommendation');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return !!token;
  };

  const handleViewDetail = (id: string) => {
    if (checkAuth()) {
      router.push(`/scholarship-recommendation/${id}`);
    } else {
      setSelectedScholarshipId(id);
      setShowLoginModal(true);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <Layout withNavbar withFooter>
        <SEO title="Hasil Rekomendasi | Scholra" />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center font-primary">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography className="text-gray-600 font-medium font-primary">Sedang memuat data...</Typography>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout withNavbar withFooter>
      <SEO title="Hasil Rekomendasi | Scholra" />

      <main className="min-h-screen bg-gray-50/50 pb-20 font-primary">

        {/* HERO HEADER - Professional & Clean */}
        <div className="bg-[#1B7691] pt-28 pb-32 relative overflow-hidden">
          {/* Subtle geometric pattern instead of blobs for cleaner look */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={handleBackToSearch}
              className="group flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors text-sm font-medium"
            >
              <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-all">
                <FiArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-primary">Kembali ke Pencarian</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight font-primary tracking-tight">
                  Rekomendasi Beasiswa
                </h1>
                {searchSummary && (
                  <div className="flex gap-4 items-start bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <FiInfo className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <p className="text-white/95 leading-relaxed text-sm md:text-base font-primary font-light">
                      {searchSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats - Minimalist */}
              <div className="flex gap-3">
                <div className="bg-white rounded-xl px-5 py-3 text-center min-w-[100px] shadow-sm">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-0 leading-none">{openCount}</Typography>
                  <Typography className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Dibuka</Typography>
                </div>
                <div className="bg-white/10 rounded-xl px-5 py-3 text-center min-w-[100px] border border-white/20">
                  <Typography className="text-2xl font-bold text-white mb-0 leading-none">{closedCount}</Typography>
                  <Typography className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">Ditutup</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-4 -mt-16 relative z-20">

          {/* Controls Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative group bg-gray-50 rounded-lg transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7691]/20">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1B7691] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari beasiswa..."
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-0 transition-all font-primary font-medium"
              />
            </div>

            <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-lg overflow-x-auto">
              {(['all', 'open', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${filterStatus === status
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {status === 'all' ? 'Semua' : status === 'open' ? 'Dibuka' : 'Ditutup'}
                </button>
              ))}
            </div>

            <div className="relative border-l border-gray-200 pl-2 ml-1 hidden lg:block"></div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex w-full lg:w-auto justify-between items-center gap-2 px-4 py-3 bg-white border border-gray-200 lg:border-none rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-gray-500" />
                  <span className="font-primary">Urutkan</span>
                </div>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[200px]"
                  >
                    {[
                      { value: 'match', label: 'Kecocokan Tertinggi' },
                      { value: 'deadline', label: 'Deadline Terdekat' },
                      { value: 'name', label: 'Nama A-Z' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value as SortBy); setShowFilters(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-50 ${sortBy === option.value ? 'text-[#1B7691] bg-[#1B7691]/5' : 'text-gray-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Grid */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-primary">
                Tidak ditemukan hasil
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto font-primary">
                Tidak ada beasiswa yang sesuai dengan kriteria pencarian Anda saat ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredResults.map((scholarship) => {
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
                          {/* Status Badge - Minimalist */}
                          {scholarshipOpen ? (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {isUrgent ? `Segera Tutup (${daysUntil} hari)` : 'Dibuka'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-200 text-gray-600">
                              Ditutup
                            </span>
                          )}

                          {/* Match Score - Professional Percentage */}
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
        </div>
      </main>

      {/* Login Requirement Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-primary">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <FiLock className="w-6 h-6 text-gray-400" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 font-primary">
                Akses Terbatas
              </h3>

              <p className="text-gray-500 text-sm mb-6 leading-relaxed font-primary">
                Silakan masuk atau daftar untuk melihat informasi lengkap beasiswa ini.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-3 bg-[#1B7691] text-white rounded-xl font-bold text-sm hover:bg-[#15627a] transition-colors shadow-lg shadow-blue-900/5"
                >
                  Masuk Sekarang
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3 text-gray-500 font-semibold text-sm hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
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
