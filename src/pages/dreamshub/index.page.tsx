'use client';

import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiHeart, FiSend, FiUser, FiClock, FiStar, FiTrendingUp, FiTarget } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import Button from '@/components/buttons/Button';

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: 'beasiswa' | 'tips' | 'pengalaman' | 'umum';
  likes: number;
  replies: number;
  timestamp: string;
}

interface Manifestation {
  id: string;
  manifestation: string;
  created_at: string;
  beasiswa_v3_id?: string;
  beasiswa?: {
    id: string;
    nama: string;
    penyelenggara: string;
    jenis: string;
  };
  likes?: number;
  isLiked?: boolean;
}

const DUMMY_FORUM_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'Sarah Wijaya',
    avatar: '👩‍🎓',
    title: 'Tips Lolos Beasiswa LPDP 2024',
    content: 'Halo teman-teman! Saya baru saja diterima LPDP. Mau share tips dan pengalaman saya selama proses seleksi...',
    category: 'tips',
    likes: 245,
    replies: 34,
    timestamp: '2 jam yang lalu'
  },
  {
    id: '2',
    author: 'Ahmad Rizki',
    avatar: '👨‍💼',
    title: 'Pertanyaan tentang Essay Motivasi',
    content: 'Guys, ada yang bisa kasih saran untuk nulis essay motivasi yang menarik? Saya masih bingung mulai dari mana...',
    category: 'beasiswa',
    likes: 128,
    replies: 45,
    timestamp: '5 jam yang lalu'
  },
  {
    id: '3',
    author: 'Putri Amanda',
    avatar: '👩‍🔬',
    title: 'Pengalaman Interview Beasiswa Fulbright',
    content: 'Sharing pengalaman interview Fulbright kemarin. Pertanyaan yang ditanya cukup tricky tapi seru!',
    category: 'pengalaman',
    likes: 312,
    replies: 56,
    timestamp: '1 hari yang lalu'
  },
  {
    id: '4',
    author: 'Budi Santoso',
    avatar: '👨‍🎓',
    title: 'Rekomendasi Beasiswa S2 Teknik',
    content: 'Ada yang punya rekomendasi beasiswa S2 untuk jurusan teknik informatika? Budget terbatas nih...',
    category: 'beasiswa',
    likes: 89,
    replies: 23,
    timestamp: '2 hari yang lalu'
  }
];

export default function DreamshubPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'beasiswa' | 'tips' | 'pengalaman' | 'umum'>('all');
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [isLoadingManifestations, setIsLoadingManifestations] = useState(false);

  // Helper to get cookie
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Get auth token
  const getAuthToken = () => {
    const localStorageKeys = ['token', 'accessToken', '@raihasa/token'];
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    
    const cookieKeys = ['token', 'accessToken', '@raihasa/token'];
    for (const key of cookieKeys) {
      const value = getCookie(key);
      if (value) return value;
    }
    
    return null;
  };

  // Fetch all manifestations (from all scholarships) - PUBLIC ACCESS
  const fetchManifestations = async () => {
    try {
      setIsLoadingManifestations(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      
      const url = `${apiUrl}/manifestations`;
      
      console.log('📡 Fetching ALL public manifestations from:', url);

      const token = getAuthToken();
      const headers: HeadersInit = token 
        ? { 'Authorization': `Bearer ${token}` }
        : {};

      const response = await fetch(url, { headers });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manifestations result:', result);
        
        const data = result.data || result;
        if (Array.isArray(data)) {
          // Filter out manifestations without scholarship info (like 'public-manifestation')
          const validManifestations = data.filter(m => m.beasiswa_v3_id && m.beasiswa_v3_id !== 'public-manifestation');
          
          const sortedData = validManifestations.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setManifestations(sortedData);
          console.log(`📊 Loaded ${sortedData.length} manifestations from scholarships`);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch manifestations:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching manifestations:', error);
    } finally {
      setIsLoadingManifestations(false);
    }
  };

  // Fetch manifestations on mount
  useEffect(() => {
    fetchManifestations();
  }, []);

  // REMOVE handleSubmitManifestation - User can't create from Dreamshub
  // They should create manifestation from scholarship detail page instead
  
  const handleRedirectToRecommendations = () => {
    alert('Buat manifestasi dari halaman detail beasiswa yang kamu inginkan!');
    window.location.href = '/scholarship-recommendation';
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beasiswa': return 'bg-blue-100 text-blue-700';
      case 'tips': return 'bg-green-100 text-green-700';
      case 'pengalaman': return 'bg-purple-100 text-purple-700';
      case 'umum': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beasiswa': return 'Beasiswa';
      case 'tips': return 'Tips & Trik';
      case 'pengalaman': return 'Pengalaman';
      case 'umum': return 'Umum';
      default: return category;
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? DUMMY_FORUM_POSTS 
    : DUMMY_FORUM_POSTS.filter(post => post.category === selectedCategory);

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Dreamshub - Komunitas Beasiswa" />
      <main className="min-h-screen bg-gray-50">
        {/* Header - Improved Layout */}
        <section className="bg-primary-blue pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Typography className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Dreamshub
              </Typography>
              <Typography className="text-lg md:text-xl text-blue-50 leading-relaxed">
                Platform kolaboratif untuk berbagi pengalaman dan mendukung sesama pencari beasiswa
              </Typography>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            
            {/* ========== MANIFESTATION BOARD SECTION ========== */}
            <div className="mb-16">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center">
                      <FiTarget className="text-2xl text-white" />
                    </div>
                    <div>
                      <Typography className="text-xl font-semibold text-gray-900">
                        Manifestation Board
                      </Typography>
                      <Typography className="text-sm text-gray-500">
                        Berbagi tekad dan inspirasi anonim
                      </Typography>
                    </div>
                  </div>
                  <button
                    onClick={handleRedirectToRecommendations}
                    className="bg-primary-blue text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Buat Manifestasi
                  </button>
                </div>

                {/* Stats - Cleaner */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <Typography className="text-2xl font-bold text-gray-900">
                      {manifestations.length}
                    </Typography>
                    <Typography className="text-sm text-gray-600">Total Manifestasi</Typography>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900 mb-1">
                      <FiTrendingUp className="text-lg" />
                      <Typography className="text-lg font-semibold">Aktif</Typography>
                    </div>
                    <Typography className="text-sm text-gray-600">Komunitas Berkembang</Typography>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900 mb-1">
                      <FiHeart className="text-lg" />
                      <Typography className="text-lg font-semibold">Support</Typography>
                    </div>
                    <Typography className="text-sm text-gray-600">Saling Mendukung</Typography>
                  </div>
                </div>
              </div>

              {/* Manifestation List - Professional */}
              {isLoadingManifestations ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-3 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <Typography className="text-gray-600">Memuat manifestasi...</Typography>
                </div>
              ) : manifestations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiTarget className="text-3xl text-gray-400" />
                  </div>
                  <Typography className="text-gray-700 font-medium mb-2">
                    Belum Ada Manifestasi
                  </Typography>
                  <Typography className="text-gray-500 text-sm">
                    Jadilah yang pertama berbagi tekad
                  </Typography>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {manifestations.slice(0, 6).map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Scholarship Badge - Clean */}
                      {item.beasiswa && (
                        <div className="mb-3">
                          <span className="inline-block bg-primary-blue text-white px-3 py-1 rounded-md text-xs font-medium">
                            {item.beasiswa.nama}
                          </span>
                        </div>
                      )}

                      <Typography className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        "{item.manifestation}"
                      </Typography>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="w-3.5 h-3.5" />
                          <span>Anonim #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          <span>{formatTimestamp(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {manifestations.length > 6 && (
                <div className="text-center mt-6">
                  <Typography className="text-sm text-gray-500">
                    Menampilkan 6 dari {manifestations.length} manifestasi
                  </Typography>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-12"></div>

            {/* ========== FORUM KONSULTASI SECTION ========== */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-orange rounded-lg flex items-center justify-center">
                      <FiMessageCircle className="text-2xl text-white" />
                    </div>
                    <div>
                      <Typography className="text-xl font-semibold text-gray-900">
                        Forum Konsultasi
                      </Typography>
                      <Typography className="text-sm text-gray-500">
                        Diskusi dan tanya jawab seputar beasiswa
                      </Typography>
                    </div>
                  </div>
                  <button className="bg-primary-orange text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    Buat Pertanyaan
                  </button>
                </div>

                {/* Category Filter - Clean */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'beasiswa', 'tips', 'pengalaman', 'umum'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary-orange text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forum Posts - Professional */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar - Replace emoji with icon */}
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-xl text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Typography className="font-semibold text-gray-900">
                            {post.author}
                          </Typography>
                          <span className={`px-3 py-1 rounded-md text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                        </div>
                        <Typography className="text-lg font-semibold text-gray-900 mb-2">
                          {post.title}
                        </Typography>
                        <Typography className="text-gray-600 mb-4 line-clamp-2">
                          {post.content}
                        </Typography>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FiHeart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiMessageCircle className="w-4 h-4" />
                            <span>{post.replies} Balasan</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiClock className="w-4 h-4" />
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Clean */}
              <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === 1
                        ? 'bg-primary-orange text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer CTA - Professional */}
            <div className="mt-16 bg-primary-blue rounded-lg p-8 text-center text-white">
              <Typography className="text-2xl font-semibold mb-3">
                Siap Memulai Perjalanan Beasiswamu?
              </Typography>
              <Typography className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Temukan beasiswa yang sesuai dengan profil dan tujuanmu
              </Typography>
              <button
                onClick={handleRedirectToRecommendations}
                className="bg-white text-primary-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cari Beasiswa Sekarang
              </button>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
