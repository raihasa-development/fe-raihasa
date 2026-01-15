'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  FiMessageCircle, FiHeart, FiUser, FiClock, FiSearch,
  FiTrendingUp, FiTarget, FiEdit3, FiFilter
} from 'react-icons/fi';
import { MdOutlinePushPin } from 'react-icons/md';

import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';
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

  const fetchManifestations = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations?page=1&limit=20`, { headers });
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts/tokens/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const json = await res.json();
          const count = json.data?.token ?? json.data ?? json.token ?? 0;
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

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Dreamshub - Komunitas Beasiswa" />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        
        .font-poppins {
            font-family: 'Poppins', sans-serif;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
            animation-play-state: paused;
        }
      `}</style>
      <main className="min-h-screen bg-gray-50/50 pb-20 overflow-x-hidden font-poppins">

        {/* === Hero Section === */}
        <section className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] pt-32 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              DreamsHub Forum
            </h1>
            <p className="text-xl text-blue-50 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              Ruang kolaborasi untuk berbagi pengalaman, tips beasiswa, dan saling mendukung mimpi satu sama lain.
            </p>
            <button
              onClick={() => router.push('/dreamshub/create')}
              className="bg-white text-[#1B7691] px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <FiEdit3 /> Mulai Diskusi
            </button>
          </div>
        </section>

        {/* === Manifestation Marquee === */}
        {manifestations.length > 0 && (
          <div className="-mt-20 mb-12 relative z-20 w-full overflow-hidden py-4 pointer-events-none">
            <div className="pointer-events-auto w-full">
              {/* Duplicate list for seamless loop */}
              <div className="flex animate-scroll gap-6 px-4">
                {[...manifestations, ...manifestations, ...manifestations].map((m, i) => (
                  <div key={`${m.id}-${i}`} className="w-[300px] bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between h-[180px] shrink-0 hover:-translate-y-1 transition-transform cursor-default">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                        To: {m?.beasiswa?.nama || 'Beasiswa Impian'}
                      </p>
                      <p className="text-gray-800 font-medium leading-relaxed text-lg line-clamp-3 italic">
                        "{m?.manifestation}"
                      </p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs text-gray-400">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1B7691]">
                        <FiTarget />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* === Left Sidebar: Profile & Categories === */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Widget */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24 z-30">
                {isAuthenticated && user ? (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-[#1B7691] rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Selamat Datang</p>
                        <h3 className="font-bold text-gray-900 truncate">{user.name || 'User'}</h3>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between border border-blue-100">
                      <span className="text-sm text-gray-600 font-medium">Sisa Token</span>
                      <span className={`text-lg font-bold ${userTokens !== null && userTokens > 0 ? 'text-[#1B7691]' : 'text-red-500'}`}>
                        {userTokens ?? '-'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                      <FiUser className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Login untuk mulai berdiskusi</p>
                    <button onClick={() => router.push('/login')} className="w-full py-2 bg-[#1B7691] text-white rounded-lg font-bold hover:bg-[#15627a] transition-all text-sm">
                      Masuk Akun
                    </button>
                  </div>
                )}

                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiFilter className="text-[#1B7691]" /> Kategori
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex justify-between items-center ${selectedCategory === 'all' ? 'bg-[#1B7691] text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Semua Topik
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex justify-between items-center ${selectedCategory === cat.id ? 'bg-[#1B7691] text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span>{cat.name}</span>
                      {cat._count && <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{cat._count.posts}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* === Main Feed === */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center sticky top-4 z-20">
                <FiSearch className="ml-4 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari diskusi, topik, atau beasiswa..."
                  className="w-full p-3 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Posts List */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat diskusi ...</p>
                </div>
              ) : forumPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <FiMessageCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada diskusi</h3>
                  <p className="text-gray-500 mb-6">Jadilah yang pertama memulai percakapan di kategori ini!</p>
                  <button onClick={() => router.push('/dreamshub/create')} className="text-[#1B7691] font-medium hover:underline">Buat Postingan Baru</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {forumPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/dreamshub/${post.id}`)}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#1B7691]/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#1B7691] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold border border-white shadow-sm">
                            {post.author.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#1B7691] transition-colors">{post.author.name}</h4>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              {formatTime(post.created_at)} • {post.category.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {post.is_pinned && <MdOutlinePushPin className="text-[#FB991A]" />}
                          {post.is_locked && <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-md font-bold">Locked</span>}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4 pl-14">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-snug">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-2 leading-relaxed">{post.content}</p>
                      </div>

                      {/* Post Footer */}
                      <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-50 pl-14">
                        <div className="flex items-center gap-2 group-hover:text-red-500 transition-colors">
                          <FiHeart className={post.is_liked ? "fill-red-500 text-red-500" : ""} />
                          <span>{post.like_count}</span>
                        </div>
                        <div className="flex items-center gap-2 group-hover:text-[#1B7691] transition-colors">
                          <FiMessageCircle />
                          <span>{post._count.comments} Balasan</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 py-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center font-bold text-gray-700">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* === Right Sidebar: Promotion Only === */}
            <div className="lg:col-span-1 space-y-6">
              {/* Banner Widget */}
              <div className="bg-[#FB991A] rounded-3xl p-6 text-white text-center shadow-lg shadow-orange-500/20 sticky top-24">
                <FiTrendingUp className="w-8 h-8 mx-auto mb-3 text-white/90" />
                <h3 className="font-bold text-lg mb-2">Tingkatkan Peluangmu!</h3>
                <p className="text-sm text-orange-100 mb-4 px-2">Gunakan fitur rekomendasi AI untuk menemukan beasiswa yang paling cocok.</p>
                <button onClick={() => router.push('/scholarship-recommendation')} className="bg-white text-[#FB991A] px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-orange-50 w-full transition-colors">
                  Coba Review AI Sekarang
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
