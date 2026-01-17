'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiCalendar, FiDollarSign, FiCheckCircle, FiFilter, FiSearch, FiClock, FiLock, FiUnlock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoMdCloseCircleOutline } from 'react-icons/io';

import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import Button from '@/components/buttons/Button';
import { ScholarshipRecommendationDisplay } from '../types/type';

interface FilterState {
  status: 'all' | 'open' | 'closed' | 'upcoming';
  jenis: 'all' | 'full' | 'partial';
  provider: string;
  minMatchScore: number;
  search: string;
}

export default function ScholarshipResultPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<ScholarshipRecommendationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    jenis: 'all',
    provider: '',
    minMatchScore: 0,
    search: ''
  });

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const localStorageKeys = ['token', 'accessToken', 'authToken', 'access_token', 'jwt', 'bearerToken', '@raihasa/token'];
      let token = null;

      for (const key of localStorageKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          token = value;
          break;
        }
      }

      if (!token) {
        const cookieKeys = [
          'token',
          'accessToken',
          'authToken',
          'access_token',
          'jwt',
          'bearerToken',
          'auth_token',
          '@raihasa/token'
        ];

        for (const key of cookieKeys) {
          const value = getCookie(key);
          if (value) {
            token = value;
            break;
          }
        }
      }

      setIsAuthenticated(!!token);
    };

    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecommendations = localStorage.getItem('scholarship_recommendations');
    if (savedRecommendations) {
      try {
        const data = JSON.parse(savedRecommendations);
        setRecommendations(data);
      } catch (error) {
        router.push('/scholarship-recommendation');
      }
    } else {
      router.push('/scholarship-recommendation');
    }
    setIsLoading(false);
  }, [router]);

  // Get unique providers for filter dropdown
  const uniqueProviders = useMemo(() => {
    const providers = recommendations.map(r => r.provider);
    return Array.from(new Set(providers)).sort();
  }, [recommendations]);

  // Helper to parse Indonesian date string "1 Agustus 2025" to Date object
  const parseIndonesianDate = (dateStr: string): Date | null => {
    try {
      // Try standard parsing first
      let date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;

      // Handle Indonesian months
      const months: { [key: string]: number } = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
      };

      const parts = dateStr.split(' '); 17 / 7 / 2025 - 1 / 8 / 2025
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        const year = parseInt(parts[2]);

        if (months[monthStr] !== undefined) {
          return new Date(year, months[monthStr], day);
        }
      }

      // Handle format D/M/YYYY
      const slashParts = dateStr.split('/');
      if (slashParts.length === 3) {
        // Assumes D/M/YYYY
        return new Date(parseInt(slashParts[2]), parseInt(slashParts[1]) - 1, parseInt(slashParts[0]));
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  // Determine scholarship status based on dates
  const getScholarshipStatus = (deadline: string, eligibility: string) => {
    const today = new Date();
    // Reset time to midnight for accurate date comparison
    today.setHours(0, 0, 0, 0);

    const deadlineDate = parseIndonesianDate(deadline);

    // Extract open date from eligibility string ("Pendaftaran: 17/7/2025 - ...")
    let openDate = null;
    try {
      const parts = eligibility.replace('Pendaftaran:', '').trim().split(' - ');
      if (parts.length > 0) {
        openDate = parseIndonesianDate(parts[0]);
      }
    } catch (e) {
      // Fallback
    }

    if (deadlineDate && deadlineDate < today) {
      return 'closed'; // Already closed
    } else if (openDate && openDate > today) {
      return 'upcoming'; // Will open in future
    } else {
      return 'open'; // Currently open
    }
  };

  // Helper to format date friendly
  const formatDateFriendly = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to format period
  const formatPeriod = (eligibility: string) => {
    // Remove "Pendaftaran: " prefix if exists
    return eligibility.replace('Pendaftaran:', '').trim();
  }

  // Filter and search logic
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(scholarship => {
      // Status filter
      if (filters.status !== 'all') {
        const status = getScholarshipStatus(scholarship.deadline, scholarship.eligibility);
        if (status !== filters.status) return false;
      }

      // Jenis filter
      if (filters.jenis !== 'all') {
        const isFullScholarship = scholarship.amount.toLowerCase().includes('full');
        if (filters.jenis === 'full' && !isFullScholarship) return false;
        if (filters.jenis === 'partial' && isFullScholarship) return false;
      }

      // Provider filter
      if (filters.provider && !scholarship.provider.toLowerCase().includes(filters.provider.toLowerCase())) {
        return false;
      }

      // Match score filter
      if (scholarship.match_score && (scholarship.match_score * 100) < filters.minMatchScore) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          scholarship.title.toLowerCase().includes(searchLower) ||
          scholarship.provider.toLowerCase().includes(searchLower) ||
          scholarship.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [recommendations, filters]);

  // Group scholarships by status
  const groupedScholarships = useMemo(() => {
    const groups = {
      open: [] as ScholarshipRecommendationDisplay[],
      upcoming: [] as ScholarshipRecommendationDisplay[],
      closed: [] as ScholarshipRecommendationDisplay[]
    };

    filteredRecommendations.forEach(scholarship => {
      const status = getScholarshipStatus(scholarship.deadline, scholarship.eligibility);
      groups[status].push(scholarship);
    });

    return groups;
  }, [filteredRecommendations]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      jenis: 'all',
      provider: '',
      minMatchScore: 0,
      search: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Dibuka
        </span>;
      case 'upcoming':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FiClock className="w-3 h-3" /> Segera
        </span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          <FiLock className="w-3 h-3" /> Ditutup
        </span>;
      default: return null;
    }
  };

  // Auth Modal Component
  const AuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-zoom-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoMdCloseCircleOutline size={28} />
          </button>

          <div className="text-center pt-2">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLock className="w-8 h-8 text-primary-blue" />
            </div>

            <Typography className="text-2xl font-bold text-gray-900 mb-3">
              Akses Terbatas
            </Typography>

            <Typography className="text-gray-600 mb-8 leading-relaxed">
              Ups! Untuk melihat detail lengkap, mendaftar, dan mendapatkan panduan eksklusif beasiswa ini, kamu perlu login terlebih dahulu. Gratis kok!
            </Typography>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => router.push('/login')}
                className="w-full justify-center py-3 text-lg font-semibold bg-[#1B7691] hover:bg-[#15627a] text-white hover:shadow-lg transition-all"
              >
                Login Sekarang
              </Button>
              <Button
                variant="unstyled"
                onClick={() => router.push('/register')}
                className="w-full justify-center py-3 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Belum punya akun? Daftar disini
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ScholarshipCard = ({ scholarship, index }: { scholarship: ScholarshipRecommendationDisplay; index: number }) => {
    const status = getScholarshipStatus(scholarship.deadline, scholarship.eligibility);
    const isLocked = !isAuthenticated;

    // Formatting
    const formattedDeadline = formatDateFriendly(scholarship.deadline);
    const formattedPeriod = formatPeriod(scholarship.eligibility);

    return (
      <div className="group flex flex-col h-full bg-white rounded-xl border border-gray-200 hover:border-primary-blue/40 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 pb-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              {/* Status Badge */}
              <div className="mb-3 flex items-center justify-between">
                {getStatusBadge(status)}
                {scholarship.match_score && (
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[#1B7691]">{Math.round(scholarship.match_score * 100)}%</span>
                    <span className="text-[10px] uppercase text-gray-400 font-medium tracking-wide">Kecocokan</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-primary-blue transition-colors">
                {scholarship.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                {scholarship.provider}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-5"></div>

        {/* Info Grid */}
        <div className="p-5 py-4 grid grid-cols-2 gap-y-4 gap-x-2">
          {/* Deadline */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Deadline</p>
            <div className="flex items-center gap-2">
              <FiClock className={`w-4 h-4 ${status === 'open' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${status === 'open' ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                {formattedDeadline}
              </span>
            </div>
          </div>

          {/* Funding Type */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Pendanaan</p>
            <div className="flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900 truncate">
                {scholarship.amount.includes('Full') ? 'Full Scholarship' : 'Partial Funding'}
              </span>
            </div>
          </div>

          {/* Period (Full Width) */}
          <div className="col-span-2">
            <p className="text-xs text-gray-400 mb-1">Periode Pendaftaran</p>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">
                {formattedPeriod}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Action */}
        <div className="px-5 pb-5 mt-auto flex flex-col gap-4">
          {isLocked ? (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 relative overflow-hidden">
              <p className="text-sm text-gray-400 italic blur-[2px] leading-relaxed">
                Deskripsi lengkap beasiswa ini hanya tersedia untuk pengguna yang telah terdaftar. Login untuk melihat detail.
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiLock className="text-gray-300 w-5 h-5" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed h-[40px]">
              {scholarship.description}
            </p>
          )}

          <button
            onClick={() => {
              if (isLocked) {
                setShowAuthModal(true);
              } else {
                router.push(scholarship.link);
              }
            }}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${isLocked
              ? 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              : 'bg-white border-[#1B7691] text-[#1B7691] hover:bg-[#1B7691] hover:text-white'
              }`}
          >
            {isLocked ? 'Buka Akses' : 'Lihat Detail'}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography className="text-gray-600 font-medium animate-pulse">Sedang menyiapkan rekomendasi terbaikmu...</Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Hasil Rekomendasi Beasiswa AI" />
      <AuthModal />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pt-24">
        {/* Header */}
        <section className="py-12 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center text-white">
              <Typography className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Rekomendasi Spesial Untukmu
              </Typography>
              <Typography className="text-lg md:text-xl mb-8 text-white/90 font-light">
                Scholra AI menemukan <span className="font-bold bg-white/20 px-2 py-0.5 rounded">{recommendations.length} beasiswa</span> yang cocok dengan profil kamu!
              </Typography>

              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/scholarship-recommendation')}
                  className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md text-white pl-6 pr-8 py-3.5 rounded-full transition-all duration-300 border border-white/30 flex items-center gap-3 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:border-white/60"
                >
                  <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                    <FiArrowRight className="rotate-180 w-5 h-5" />
                  </div>
                  <span className="font-semibold tracking-wide text-lg">Cari Rekomendasi Ulang</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 bg-white shadow-sm sticky top-16 z-30 backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
          <div className="container mx-auto px-4">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Button
                variant="unstyled"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="w-full flex items-center justify-between gap-2 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors text-gray-700 font-medium"
                rightIcon={FiFilter}
              >
                Filter & Pencarian
              </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${showMobileFilter ? 'block mt-4' : 'hidden'} lg:block`}>
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                {/* Search Bar - Expanded width */}
                <div className="w-full lg:flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pencarian</label>
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-orange w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari beasiswa, universitas..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Filter Options Group */}
                <div className="w-full lg:w-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="min-w-[140px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent cursor-pointer outline-none"
                    >
                      <option value="all">Semua Status</option>
                      <option value="open">Sedang Dibuka</option>
                      <option value="upcoming">Akan Dibuka</option>
                      <option value="closed">Sudah Ditutup</option>
                    </select>
                  </div>

                  {/* Jenis Filter */}
                  <div className="min-w-[140px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Jenis Pendanaan</label>
                    <select
                      value={filters.jenis}
                      onChange={(e) => handleFilterChange('jenis', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent cursor-pointer outline-none"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="full">Full Scholarship</option>
                      <option value="partial">Partial Scholarship</option>
                    </select>
                  </div>

                  {/* Match Score Filter */}
                  <div className="min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Min. Tingkat Kecocokan</span>
                      <span className="text-primary-blue font-bold">{filters.minMatchScore}%</span>
                    </label>
                    <div className="px-1 py-1.5 bg-gray-50 border border-gray-200 rounded-xl h-[46px] flex items-center px-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={filters.minMatchScore}
                        onChange={(e) => handleFilterChange('minMatchScore', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters display... (Simplified for better UX) */}
              {(filters.status !== 'all' || filters.jenis !== 'all' || filters.provider || filters.minMatchScore > 0 || filters.search) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 overflow-x-auto pb-2">
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Filter Aktif:</span>
                  <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap hover:underline">
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="text-gray-400 w-10 h-10" />
                </div>
                <Typography className="text-2xl font-bold text-gray-800 mb-2">
                  Tidak ditemukan beasiswa
                </Typography>
                <Typography className="text-gray-500 mb-8 max-w-md mx-auto">
                  Coba kurangi filter atau turunkan tingkat kecocokan minimum untuk melihat lebih banyak hasil.
                </Typography>
                <Button onClick={clearAllFilters} variant="primary" className="bg-[#1B7691] hover:bg-[#15627a]">
                  Hapus Semua Filter
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Open Scholarships */}
                {groupedScholarships.open.length > 0 && (
                  <div className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FiUnlock className="text-green-600 w-5 h-5" />
                      </div>
                      <div>
                        <Typography className="text-xl font-bold text-gray-900">
                          Sedang Dibuka
                        </Typography>
                        <p className="text-sm text-gray-500">{groupedScholarships.open.length} beasiswa tersedia untuk didaftar</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedScholarships.open.map((scholarship, index) => (
                        <ScholarshipCard key={scholarship.id} scholarship={scholarship} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Scholarships */}
                {groupedScholarships.upcoming.length > 0 && (
                  <div className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiClock className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <Typography className="text-xl font-bold text-gray-900">
                          Akan Segera Dibuka
                        </Typography>
                        <p className="text-sm text-gray-500">{groupedScholarships.upcoming.length} beasiswa akan datang</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedScholarships.upcoming.map((scholarship, idx) => {
                        const globalIndex = groupedScholarships.open.length + idx;
                        return <ScholarshipCard key={scholarship.id} scholarship={scholarship} index={globalIndex} />;
                      })}
                    </div>
                  </div>
                )}

                {/* Closed Scholarships */}
                {groupedScholarships.closed.length > 0 && (
                  <div className="opacity-75 hover:opacity-100 transition-opacity scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FiLock className="text-red-600 w-5 h-5" />
                      </div>
                      <div>
                        <Typography className="text-xl font-bold text-gray-900">
                          Pendaftaran Ditutup
                        </Typography>
                        <p className="text-sm text-gray-500">{groupedScholarships.closed.length} beasiswa telah berakhir</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedScholarships.closed.map((scholarship, idx) => {
                        const globalIndex = groupedScholarships.open.length + groupedScholarships.upcoming.length + idx;
                        return <ScholarshipCard key={scholarship.id} scholarship={scholarship} index={globalIndex} />;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login CTA at bottom if not authenticated */}
            {!isAuthenticated && recommendations.length > 0 && (
              <div className="mt-20 bg-gradient-to-r from-[#0d5a6e] to-[#1B7691] rounded-3xl p-10 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10 max-w-2xl mx-auto">
                  <FiLock className="w-12 h-12 mx-auto mb-6 text-white/80" />
                  <Typography className="text-3xl font-bold mb-4">
                    Jangan Lewatkan Kesempatan Emas Ini!
                  </Typography>
                  <Typography className="text-lg text-white/80 mb-8 leading-relaxed">
                    Masih ada banyak beasiswa high-match lainnya yang menunggu untuk kamu explore. Dapatkan akses penuh sekarang juga.
                  </Typography>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="unstyled"
                      onClick={() => router.push('/login')}
                      className="bg-white text-primary-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FiUnlock /> Buka Semua Akses
                    </Button>
                    <Button
                      variant="unstyled"
                      onClick={() => router.push('/register')}
                      className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
                    >
                      Daftar Gratis
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
