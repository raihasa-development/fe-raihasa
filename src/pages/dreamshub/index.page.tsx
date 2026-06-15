'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  FiMessageCircle, FiHeart, FiUser, FiClock, FiSearch,
  FiTrendingUp, FiTarget, FiEdit3, FiFilter, FiTrash2,
  FiLock, FiUnlock, FiChevronLeft, FiChevronRight, FiActivity
} from 'react-icons/fi';
import { MdOutlinePushPin } from 'react-icons/md';

import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';
import Typography from '@/components/Typography';
import { forumApi } from '@/lib/api/forum';
import type { ForumCategory, ForumPost } from '@/types/forum';

// Use Auth Store same as Navbar
import useAuthStore from '@/store/useAuthStore';
import { getToken } from '@/lib/cookies';

interface Manifestation {
  id: string;
  manifestation: string;
  created_at: string;
  beasiswa_v3_id?: string;
  beasiswa?: { nama: string };
  account_id?: string; // Owner ID for delete permission
}

export default function DreamshubPage() {
  const router = useRouter();

  // Auth Store Logic
  const { user, isAuthenticated } = useAuthStore();
  const [userTokens, setUserTokens] = useState<number | null>(null);

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Layout overhaul additions
  const [activeTab, setActiveTab] = useState<'discuss' | 'wishes'>('discuss');
  const [scholarships, setScholarships] = useState<{ id: string; nama: string }[]>([]);
  const [newManifestationText, setNewManifestationText] = useState('');
  const [selectedScholarshipId, setSelectedScholarshipId] = useState('');
  const [isSubmittingManifestation, setIsSubmittingManifestation] = useState(false);

  const fetchManifestations = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations?page=1&limit=50`, { headers });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      const data = json.data || json;
      // Accept data if available, filter for minimal quality
      const validData = Array.isArray(data) ? data.filter(m => m.manifestation) : [];
      if (validData.length > 0) return validData;
      throw new Error('No data');
    } catch (e) {
      // Fallback Mock Data (Requested to "munculin aja")
      return [
        { id: 'm1', manifestation: 'Semoga lulus beasiswa LPDP tahun ini!', created_at: new Date().toISOString(), beasiswa: { nama: 'Beasiswa LPDP' } },
        { id: 'm2', manifestation: 'Bismillah GKS 2025 tembus', created_at: new Date().toISOString(), beasiswa: { nama: 'GKS' } },
        { id: 'm3', manifestation: 'Ingin membanggakan orang tua dengan beasiswa ke Jepang', created_at: new Date().toISOString(), beasiswa: { nama: 'MEXT' } },
        { id: 'm4', manifestation: 'Semangat pejuang beasiswa!', created_at: new Date().toISOString(), beasiswa: { nama: 'Umum' } },
        { id: 'm5', manifestation: 'One step closer to my dreams ✨', created_at: new Date().toISOString(), beasiswa: { nama: 'Chevening' } },
        { id: 'm6', manifestation: 'Lolos Erasmus+ adalah jalanku', created_at: new Date().toISOString(), beasiswa: { nama: 'Erasmus+' } },
      ];
    }
  };

  // Fetch Token Count when User is authenticated
  useEffect(() => {
    const fetchTokens = async () => {
      if (!isAuthenticated || !user?.id) {
        setUserTokens(null);
        return;
      }

      try {
        const token = getToken(); // Get fresh token from cookies
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts/tokens/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const json = await res.json();
          const count = json.data?.forum_tokens ?? json.data?.token ?? 0;
          setUserTokens(Number(count));
        }
      } catch (e) {
        // Suppress error logging for cleaner console
      }
    };
    fetchTokens();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [cats, manifs] = await Promise.all([
          forumApi.getCategories().catch(() => []),
          fetchManifestations().catch(() => [])
        ]);
        setCategories(cats);
        setManifestations(manifs as Manifestation[]);

        // Load scholarships list
        const token = getToken();
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship?limit=100`, { headers });
        if (res.ok) {
          const json = await res.json();
          setScholarships(json.data || json || []);
        }
      } catch (e) { console.error(e); }
    };
    initData();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const res = await forumApi.getPosts({
          category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10
        });
        setForumPosts(res.data);
        setTotalPages(res.metadata.totalPages);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [selectedCategory, searchQuery, page]);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleDeleteManifestazione = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus manifestasi ini?')) return;
    try {
      await forumApi.deleteManifestazione(id);
      setManifestations(prev => prev.filter(m => m.id !== id));
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus manifestasi');
    }
  };

  const handleCreateManifestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/dreamshub');
      return;
    }
    if (!newManifestationText.trim() || !selectedScholarshipId) {
      alert('Mohon isi harapan dan pilih beasiswa tujuan.');
      return;
    }

    try {
      setIsSubmittingManifestation(true);
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          beasiswa_v3_id: selectedScholarshipId,
          manifestation: newManifestationText
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Gagal menyimpan manifestasi');
      }

      setNewManifestationText('');
      setSelectedScholarshipId('');
      // Reload manifestations
      const updated = await fetchManifestations();
      setManifestations(updated);
      alert('Manifestasi Anda berhasil disimpan!');
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan manifestasi');
    } finally {
      setIsSubmittingManifestation(false);
    }
  };

  // Visible numeric page options list
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="DreamsHub - Komunitas Beasiswa" />
      <main className="min-h-screen bg-[#F8FAFC] pb-20 overflow-x-hidden">

        {/* === Compact Dashboard Header Section === */}
        <section className="bg-gradient-to-r from-[#1B7691] to-[#0F4C61] pt-32 pb-16 relative overflow-hidden rounded-b-[2rem] md:rounded-b-[3.5rem] shadow-lg">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-left">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-50 border border-white/5 inline-block mb-3">
                Ruang Kolaborasi
              </span>
              <Typography as="h1" className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                DreamsHub Community
              </Typography>
              <p className="text-xs md:text-sm text-blue-100/90 font-light leading-relaxed max-w-xl">
                Tempat bertanya, berdiskusi, Proofread dokumen, dan menanam harapan sukses beasiswa bersama Mentor.
              </p>
            </div>
            
            {activeTab === 'discuss' && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/login?redirect=/dreamshub/create');
                  } else {
                    router.push('/dreamshub/create');
                  }
                }}
                className="bg-[#FB991A] hover:bg-[#e08612] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 self-start md:self-center text-xs shrink-0"
              >
                <FiEdit3 className="w-4 h-4" /> Buat Diskusi Baru
              </button>
            )}
          </div>
        </section>

        {/* === Two-Column Grid Layout === */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 mt-10 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* === Left Column: Profile, Navigation Tabs, and Quick Filters (3 Columns) === */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* User Profile / Guest Card */}
              {isAuthenticated && user ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#1B7691] to-[#0F4C61] rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Selamat Datang</p>
                      <h3 className="font-bold text-gray-800 truncate text-sm leading-tight">{user.name || 'User'}</h3>
                    </div>
                  </div>
                  <div className="bg-blue-50/70 rounded-xl p-3 flex items-center justify-between border border-blue-100/30">
                    <span className="text-xs text-gray-600 font-semibold">Sisa Token Tanya</span>
                    <span className={`text-sm font-black ${userTokens !== null && userTokens > 0 ? 'text-[#1B7691]' : 'text-red-500'}`}>
                      {userTokens ?? '-'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 border border-gray-100">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-505 mb-4 px-2">Masuk untuk bertanya & menanam harapan sukses beasiswamu.</p>
                  <button 
                    onClick={() => router.push('/login')} 
                    className="w-full py-2.5 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl font-bold transition-all text-xs shadow-md shadow-blue-500/10"
                  >
                    Masuk Akun
                  </button>
                </div>
              )}

              {/* Navigation Tab Switchers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-3 mb-2">Navigasi Forum</p>
                <button
                  onClick={() => setActiveTab('discuss')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-bold flex items-center gap-3 ${activeTab === 'discuss' ? 'bg-[#1B7691] text-white shadow-md shadow-blue-900/10' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>Forum Diskusi</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishes')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-bold flex items-center gap-3 ${activeTab === 'wishes' ? 'bg-[#1B7691] text-white shadow-md shadow-blue-900/10' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiTarget className="w-4 h-4" />
                  <span>Manifestation Board</span>
                </button>
              </div>

              {/* Discussion Filter Categories (Discussion Tab only) */}
              {activeTab === 'discuss' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <FiFilter className="text-[#1B7691]" /> Kategori Topik
                  </h3>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs font-bold flex justify-between items-center ${selectedCategory === 'all' ? 'bg-[#1B7691]/10 text-[#1B7691]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span>Semua Topik</span>
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs font-bold flex justify-between items-center ${selectedCategory === cat.id ? 'bg-[#1B7691]/10 text-[#1B7691]' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="truncate mr-2">{cat.name}</span>
                        {cat._count && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${selectedCategory === cat.id ? 'bg-[#1B7691] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {cat._count.posts}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Right Sidebar Widget fallbacks (Pohon Harapan Tab only) */}
              {activeTab === 'wishes' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <FiActivity className="text-[#1B7691]" /> Statistik Forum
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Diskusi', value: '1.240' },
                      { label: 'Mentor Aktif', value: '24 Awardee' },
                      { label: 'Layanan Proofread', value: '185 Berhasil' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                        <span className="text-xs text-gray-400 font-semibold">{stat.label}</span>
                        <span className="text-xs font-black text-gray-800">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* === Right Column: Dynamic Content Area (9 Columns) === */}
            <div className="lg:col-span-9 space-y-6">

              {/* TAB 1: DISCUSSION BOARD */}
              {activeTab === 'discuss' && (
                <>
                  {/* Search Bar */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center focus-within:ring-2 focus-within:ring-[#1B7691]/20 focus-within:border-[#1B7691] transition-all">
                    <FiSearch className="ml-4 text-gray-400 w-5 h-5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari diskusi, topik, mentor, atau beasiswa..."
                      className="w-full p-3 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent font-medium"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>

                  {/* Active Category Tag Indicator */}
                  {selectedCategory !== 'all' && (
                    <div className="flex items-center gap-2 bg-[#1B7691]/5 text-[#1B7691] border border-[#1B7691]/10 px-4 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
                      <FiFilter className="w-3.5 h-3.5" />
                      <span>Menampilkan kategori: <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong></span>
                      <button 
                        onClick={() => setSelectedCategory('all')} 
                        className="ml-auto text-[10px] underline hover:text-[#15627a] font-bold"
                      >
                        Bersihkan Filter
                      </button>
                    </div>
                  )}

                  {/* Posts Loader Feed */}
                  {isLoading ? (
                    <div className="text-center py-24 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-gray-500 font-medium">Memuat diskusi...</p>
                    </div>
                  ) : forumPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FiMessageCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada diskusi</h3>
                      <p className="text-sm text-gray-500 mb-6">Jadilah yang pertama memulai percakapan di kategori ini!</p>
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push('/login?redirect=/dreamshub/create');
                          } else {
                            router.push('/dreamshub/create');
                          }
                        }} 
                        className="text-[#1B7691] font-bold hover:underline"
                      >
                        Buat Postingan Baru
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {forumPosts.map(post => (
                        <div
                          key={post.id}
                          onClick={() => {
                            if (!isAuthenticated) {
                              router.push(`/login?redirect=/dreamshub/${post.id}`);
                            } else {
                              router.push(`/dreamshub/${post.id}`);
                            }
                          }}
                          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#1B7691]/20 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1B7691] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex-1 min-w-0">
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-2.5">
                              <div className="w-9 h-9 bg-gradient-to-tr from-[#1B7691]/10 to-[#1B7691]/5 text-[#1B7691] rounded-full flex items-center justify-center font-black border border-[#1B7691]/10 shadow-xs shrink-0 text-xs">
                                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-gray-800 leading-tight group-hover:text-[#1B7691] transition-colors">{post.author?.name || 'Anonim'}</h4>
                                <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
                                  {formatTime(post.created_at)} • <span className="text-[#1B7691]/80">{post.category?.name || 'Umum'}</span>
                                </span>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="pl-12">
                              <h3 className="text-sm md:text-base font-extrabold text-gray-800 mb-1 leading-snug group-hover:text-[#1B7691] transition-colors">{post.title}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-light">{post.content}</p>
                            </div>
                          </div>

                          {/* Badges and Actions Panel */}
                          <div className="flex md:flex-col items-end gap-3 shrink-0 pl-12 md:pl-0 border-t md:border-t-0 border-gray-55 pt-3 md:pt-0">
                            <div className="flex gap-1.5 flex-wrap justify-end">
                              {post.is_private && (
                                <span className="text-[9px] px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100/50 rounded-full font-bold flex items-center gap-1">
                                  <FiLock className="w-2.5 h-2.5" /> Private
                                </span>
                              )}
                              {!isAuthenticated && (
                                <span className="text-[9px] px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-200/50 rounded-full font-bold flex items-center gap-1 shadow-xs">
                                  <FiLock className="w-2.5 h-2.5" /> Login to Read
                                </span>
                              )}
                              {post.is_pinned && <MdOutlinePushPin className="text-[#FB991A] w-4 h-4 shrink-0" />}
                              {post.is_locked && <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full font-bold">Locked</span>}
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold ml-auto md:ml-0">
                              <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <FiHeart className={`w-3.5 h-3.5 ${post.is_liked ? "fill-red-500 text-red-500" : ""}`} />
                                <span>{post.like_count}</span>
                              </div>
                              <div className="flex items-center gap-1 hover:text-[#1B7691] transition-colors">
                                <FiMessageCircle className="w-3.5 h-3.5" />
                                <span>{post._count?.comments || 0} Balasan</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Premium Numeric Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 py-8">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all text-gray-500 shadow-sm"
                        title="Sebelumnya"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>

                      {getPageNumbers()[0] > 1 && (
                        <>
                          <button
                            onClick={() => setPage(1)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all text-xs shadow-sm ${page === 1 ? 'bg-[#1B7691] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            1
                          </button>
                          {getPageNumbers()[0] > 2 && <span className="text-gray-400 px-1 font-bold text-xs">...</span>}
                        </>
                      )}

                      {getPageNumbers().map(p => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all text-xs shadow-sm ${page === p ? 'bg-[#1B7691] text-white shadow-md shadow-blue-500/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      ))}

                      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                        <>
                          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="text-gray-400 px-1 font-bold text-xs">...</span>}
                          <button
                            onClick={() => setPage(totalPages)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all text-xs shadow-sm ${page === totalPages ? 'bg-[#1B7691] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all text-gray-500 shadow-sm"
                        title="Selanjutnya"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: POHON HARAPAN BEASISWA (WISH TREE) */}
              {activeTab === 'wishes' && (
                <div className="space-y-6">
                  
                  {/* Interactive Header Card */}
                  <div className="bg-gradient-to-br from-[#1B7691] to-[#0F4C61] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
                    <div className="relative z-10">
                      <span className="text-[10px] bg-white/20 text-white font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider border border-white/10 inline-block mb-3">
                        Manifestation Beasiswa
                      </span>
                      <h2 className="text-xl font-extrabold mb-2">Tulis Manifestasi & Impian Beasiswamu!</h2>
                      <p className="text-xs text-blue-100 font-light leading-relaxed">
                        Tuliskan beasiswa impianmu dan manifestasimu di sini. Jadikan ruang ini sebagai wadah penyemangat bersama pejuang beasiswa lainnya.
                      </p>
                    </div>
                  </div>

                  {/* Submit a Wish Form */}
                  {isAuthenticated ? (
                    <form onSubmit={handleCreateManifestation} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-gray-800 text-xs flex items-center gap-2 uppercase tracking-wide">
                        <FiEdit3 className="text-[#1B7691] w-4 h-4" /> Buat Manifestasi Baru
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Beasiswa Sasaran
                          </label>
                          <select
                            value={selectedScholarshipId}
                            onChange={(e) => setSelectedScholarshipId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B7691]/25 transition-all cursor-pointer"
                            required
                          >
                            <option value="">-- Pilih Beasiswa Sasaran --</option>
                            {scholarships.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Manifestasi Anda
                          </label>
                          <input
                            type="text"
                            value={newManifestationText}
                            onChange={(e) => setNewManifestationText(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B7691]/25 transition-all"
                            placeholder="Tulis manifestasi beasiswamu di sini..."
                            maxLength={250}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingManifestation}
                          className="bg-[#1B7691] hover:bg-[#15627a] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <FiTarget className="w-3.5 h-3.5" />
                          <span>{isSubmittingManifestation ? 'Menyimpan...' : 'Simpan Manifestasi'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gray-50/70 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-6 z-10">
                        <FiLock className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600 font-bold mb-3">Anda harus masuk akun untuk menulis manifestasi.</p>
                        <button 
                          onClick={() => router.push('/login?redirect=/dreamshub')}
                          className="px-5 py-2.5 bg-[#1B7691] hover:bg-[#15627a] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                          Masuk Akun Sekarang
                        </button>
                      </div>
                      {/* Visual placeholder backdrop */}
                      <div className="opacity-10 pointer-events-none select-none blur-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="h-10 bg-gray-200 rounded-xl"></div>
                          <div className="h-10 bg-gray-200 rounded-xl"></div>
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded-xl ml-auto mt-4"></div>
                      </div>
                    </div>
                  )}

                  {/* Wishes Board Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manifestations.map((m, i) => {
                      const isOwner = isAuthenticated && user?.id === m.account_id;
                      
                      // Harmonized color presets for the sticky-note look
                      const colors = [
                        'bg-amber-50/50 border-amber-100/60 text-amber-900',
                        'bg-blue-50/50 border-blue-100/60 text-blue-900',
                        'bg-teal-50/50 border-teal-100/60 text-teal-900',
                        'bg-orange-50/50 border-orange-100/60 text-orange-900',
                        'bg-rose-50/50 border-rose-100/60 text-rose-900',
                        'bg-emerald-50/50 border-emerald-100/60 text-emerald-900'
                      ];
                      const colorClass = colors[i % colors.length];

                      return (
                        <div 
                          key={`${m.id}-${i}`}
                          className={`${colorClass} border p-5 rounded-2xl shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[160px] relative group overflow-hidden`}
                        >
                          {/* Delete wish button */}
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteManifestazione(m.id)}
                              className="absolute top-3 right-3 w-6 h-6 bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-100 shadow-2xs z-10"
                              title="Hapus Manifestasi"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          )}
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#1B7691]/80 block mb-2">
                              Target: {m?.beasiswa?.nama || 'Beasiswa Impian'}
                            </span>
                            <p className="text-xs font-semibold leading-relaxed italic">
                              "{m?.manifestation}"
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-2 border-t border-black/5 text-[9px] opacity-60">
                            <span className="font-semibold">
                              {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <FiTarget className="w-3.5 h-3.5 text-[#1B7691]" />
                          </div>
                        </div>
                      );
                    })}

                    {manifestations.length === 0 && (
                      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm col-span-full">
                        <p className="text-xs text-gray-500 font-medium">Belum ada manifestasi tertulis. Jadilah yang pertama menulis manifestasi Anda!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
