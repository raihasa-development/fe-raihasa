'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiCalendar, FiDollarSign, FiCheckCircle, FiFilter, FiSearch, FiClock, FiLock, FiUnlock } from 'react-icons/fi';
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

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    jenis: 'all',
    provider: '',
    minMatchScore: 0,
    search: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecommendations = localStorage.getItem('scholarship_recommendations');
    if (savedRecommendations) {
      try {
        const data = JSON.parse(savedRecommendations);
        setRecommendations(data);
      } catch (error) {
        console.error('Error parsing saved recommendations:', error);
        router.push('/scholarship-recommendation');
      }
    } else {
      // If no data, redirect back to recommendation page
      router.push('/scholarship-recommendation');
    }
    setIsLoading(false);
  }, [router]);

  // Get unique providers for filter dropdown
  const uniqueProviders = useMemo(() => {
    const providers = recommendations.map(r => r.provider);
    return Array.from(new Set(providers)).sort();
  }, [recommendations]);

  // Determine scholarship status based on dates
  const getScholarshipStatus = (deadline: string, eligibility: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    
    // Extract open date from eligibility string
    const openDateMatch = eligibility.match(/Pendaftaran: (.+?) -/);
    const openDate = openDateMatch ? new Date(openDateMatch[1]) : null;

    if (deadlineDate < today) {
      return 'closed'; // Already closed
    } else if (openDate && openDate > today) {
      return 'upcoming'; // Will open in future
    } else {
      return 'open'; // Currently open
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <FiUnlock className="w-4 h-4" />;
      case 'upcoming': return <FiClock className="w-4 h-4" />;
      case 'closed': return <FiLock className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-50 border-green-200';
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'closed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Sedang Dibuka';
      case 'upcoming': return 'Akan Dibuka';
      case 'closed': return 'Ditutup';
      default: return '';
    }
  };

  const ScholarshipCard = ({ scholarship }: { scholarship: ScholarshipRecommendationDisplay }) => {
    const status = getScholarshipStatus(scholarship.deadline, scholarship.eligibility);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <Typography className="text-xl font-bold text-primary-blue leading-tight">
            {scholarship.title}
          </Typography>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(status)}
                {getStatusLabel(status)}
              </div>
            </div>
            {scholarship.match_score && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                {Math.round(scholarship.match_score * 100)}% Match
              </div>
            )}
          </div>
        </div>

        <Typography className="text-gray-600 mb-4">
          {scholarship.provider}
        </Typography>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-primary-blue w-5 h-5" />
            <Typography className="text-sm">
              <span className="font-medium">Deadline:</span> {scholarship.deadline}
            </Typography>
          </div>
          
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-primary-blue w-5 h-5" />
            <Typography className="text-sm">
              <span className="font-medium">Jenis:</span> {scholarship.amount}
            </Typography>
          </div>

          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-primary-blue w-5 h-5 mt-0.5" />
            <Typography className="text-sm">
              <span className="font-medium">Periode:</span> {scholarship.eligibility}
            </Typography>
          </div>
        </div>

        <Typography className="text-gray-700 text-sm mb-6 leading-relaxed">
          {scholarship.description}
        </Typography>

        <ButtonLink
          href={scholarship.link}
          variant="primary"
          size="sm"
          className="w-full bg-primary-blue hover:bg-primary-orange text-white rounded-xl transition-colors px-4 py-3"
        >
          <Typography className="flex items-center justify-center gap-2 text-sm font-semibold">
            Lihat Detail <FaArrowRightLong />
          </Typography>
        </ButtonLink>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography>Memuat hasil rekomendasi...</Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Hasil Rekomendasi Beasiswa AI" />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pt-24">
        {/* Header */}
        <section className="py-12 bg-gradient-to-r from-primary-blue to-primary-orange">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <Typography className="text-4xl md:text-5xl font-bold mb-4">
                Hasil Rekomendasi Beasiswa
              </Typography>
              <Typography className="text-lg md:text-xl mb-6">
                Kami menemukan {recommendations.length} beasiswa yang cocok untuk Anda!
              </Typography>
              <Button
                variant="unstyled"
                onClick={() => router.push('/scholarship-recommendation')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cari Rekomendasi Lagi
              </Button>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="unstyled"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors"
                leftIcon={FiFilter}
              >
                Filter & Pencarian
              </Button>
            </div>

            {/* Filter Panel */}
            <div className={`${showMobileFilter ? 'block' : 'hidden'} lg:block`}>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari beasiswa..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Pendaftaran</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="open">Sedang Dibuka</option>
                    <option value="upcoming">Akan Dibuka</option>
                    <option value="closed">Sudah Ditutup</option>
                  </select>
                </div>

                {/* Jenis Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Beasiswa</label>
                  <select
                    value={filters.jenis}
                    onChange={(e) => handleFilterChange('jenis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="full">Full Scholarship</option>
                    <option value="partial">Partial Scholarship</option>
                  </select>
                </div>

                {/* Provider Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Penyelenggara</label>
                  <select
                    value={filters.provider}
                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="">Semua Penyelenggara</option>
                    {uniqueProviders.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                {/* Match Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Match Score: {filters.minMatchScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={filters.minMatchScore}
                    onChange={(e) => handleFilterChange('minMatchScore', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Filters & Clear Button */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {Object.entries(filters).some(([key, value]) => 
                  (key !== 'minMatchScore' && value !== 'all' && value !== '') || 
                  (key === 'minMatchScore' && value > 0)
                ) && (
                  <>
                    <Typography className="text-sm text-gray-600 mr-2">Filter aktif:</Typography>
                    
                    {filters.status !== 'all' && (
                      <div className="flex items-center gap-1 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm">
                        <span>Status: {getStatusLabel(filters.status)}</span>
                        <IoMdCloseCircleOutline 
                          className="cursor-pointer hover:text-red-500" 
                          onClick={() => handleFilterChange('status', 'all')}
                        />
                      </div>
                    )}
                    
                    {filters.jenis !== 'all' && (
                      <div className="flex items-center gap-1 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm">
                        <span>Jenis: {filters.jenis === 'full' ? 'Full' : 'Partial'}</span>
                        <IoMdCloseCircleOutline 
                          className="cursor-pointer hover:text-red-500" 
                          onClick={() => handleFilterChange('jenis', 'all')}
                        />
                      </div>
                    )}
                    
                    {filters.provider && (
                      <div className="flex items-center gap-1 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm">
                        <span>Penyelenggara: {filters.provider}</span>
                        <IoMdCloseCircleOutline 
                          className="cursor-pointer hover:text-red-500" 
                          onClick={() => handleFilterChange('provider', '')}
                        />
                      </div>
                    )}
                    
                    {filters.minMatchScore > 0 && (
                      <div className="flex items-center gap-1 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm">
                        <span>Min. Score: {filters.minMatchScore}%</span>
                        <IoMdCloseCircleOutline 
                          className="cursor-pointer hover:text-red-500" 
                          onClick={() => handleFilterChange('minMatchScore', 0)}
                        />
                      </div>
                    )}
                    
                    {filters.search && (
                      <div className="flex items-center gap-1 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-sm">
                        <span>Pencarian: "{filters.search}"</span>
                        <IoMdCloseCircleOutline 
                          className="cursor-pointer hover:text-red-500" 
                          onClick={() => handleFilterChange('search', '')}
                        />
                      </div>
                    )}
                    
                    <Button
                      variant="unstyled"
                      onClick={clearAllFilters}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 underline"
                    >
                      Hapus Semua
                    </Button>
                  </>
                )}
              </div>

              {/* Results Count */}
              <Typography className="text-sm text-gray-600">
                Menampilkan {filteredRecommendations.length} dari {recommendations.length} beasiswa
              </Typography>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <Typography className="text-xl text-gray-500 mb-4">
                  Tidak ada beasiswa yang sesuai dengan filter Anda
                </Typography>
                <Button onClick={clearAllFilters} variant="primary">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Open Scholarships */}
                {groupedScholarships.open.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <FiUnlock className="text-green-600 w-6 h-6" />
                      <Typography className="text-2xl font-bold text-green-600">
                        Sedang Dibuka ({groupedScholarships.open.length})
                      </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedScholarships.open.map(scholarship => (
                        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Scholarships */}
                {groupedScholarships.upcoming.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <FiClock className="text-blue-600 w-6 h-6" />
                      <Typography className="text-2xl font-bold text-blue-600">
                        Akan Dibuka ({groupedScholarships.upcoming.length})
                      </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedScholarships.upcoming.map(scholarship => (
                        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Closed Scholarships */}
                {groupedScholarships.closed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <FiLock className="text-red-600 w-6 h-6" />
                      <Typography className="text-2xl font-bold text-red-600">
                        Sudah Ditutup ({groupedScholarships.closed.length})
                      </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedScholarships.closed.map(scholarship => (
                        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
