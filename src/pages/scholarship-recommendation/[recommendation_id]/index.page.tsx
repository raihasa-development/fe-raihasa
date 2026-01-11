'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiHeart, FiMapPin, FiSend, FiTrash2 } from 'react-icons/fi';

import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { ScholarshipRecommendation } from '../types/type';

interface ScholarshipDetail extends ScholarshipRecommendation {
  description?: string;
  requirements?: string[];
  benefits?: string[];
  documents?: string[];
  applicationUrl?: string;
  eligibility?: string;
}

// Add interface for manifestation
interface Manifestation {
  id: string;
  manifestation: string;
  created_at: string;
}

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const { recommendation_id } = router.query;
  
  // State for wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // State for manifestation notes
  const [manifestation, setManifestation] = useState('');
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manifestationLoading, setManifestationLoading] = useState(false);

  const [scholarshipDetail, setScholarshipDetail] = useState<ScholarshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Get auth token - CHECK @raihasa/token in cookies
  const getAuthToken = () => {
    // console.log('🔐 Getting auth token...');
    // console.log('🔐 localStorage keys:', Object.keys(localStorage));
    // console.log('🔐 document.cookie:', document.cookie);
    
    // Try localStorage first
    const localStorageKeys = ['token', 'accessToken', 'authToken', 'access_token', 'jwt', 'bearerToken', '@raihasa/token'];
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        // console.log(`🔐 ✅ Found token in localStorage with key: ${key}`);
        return value;
      }
    }
    
    // Try cookies - INCLUDING @raihasa/token
    const cookieKeys = [
      'token', 
      'accessToken', 
      'authToken', 
      'access_token', 
      'jwt', 
      'bearerToken', 
      'auth_token',
      '@raihasa/token'  // ADD THIS!
    ];
    
    for (const key of cookieKeys) {
      const value = getCookie(key);
      if (value) {
        // console.log(`🔐 ✅ Found token in cookies with key: ${key}`);
        return value;
      }
    }
    
    // console.log('🔐 ❌ Token NOT FOUND in localStorage or cookies');
    return null;
  };

  // Helper to get scholarship ID
  const getScholarshipId = () => {
    const id = scholarshipDetail?.id || recommendation_id as string;
    // console.log('📌 Scholarship ID:', id);
    return id;
  };

  // Fetch wishlist status
  const fetchWishlistStatus = async (beasiswaId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        // console.log('❌ No token, skipping wishlist check');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const url = `${apiUrl}/wishlist/check/${beasiswaId}`;
      // console.log('🔍 Fetching wishlist status from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // console.log('📡 Wishlist check response status:', response.status);
      const responseText = await response.text();
      // console.log('📡 Wishlist check response body:', responseText);
      
      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          // console.log('✅ Wishlist check result:', result);
          
          // Handle different response structures
          if (result.data && typeof result.data.isWishlisted !== 'undefined') {
            setIsWishlisted(result.data.isWishlisted);
          } else if (typeof result.isWishlisted !== 'undefined') {
            setIsWishlisted(result.isWishlisted);
          } else {
            // console.warn('⚠️ Unknown response structure:', result);
            setIsWishlisted(false);
          }
        } catch (parseError) {
          // console.error('❌ Error parsing wishlist response:', parseError);
        }
      } else {
        // console.error('❌ Wishlist check error:', response.status, responseText);
      }
    } catch (error) {
      // console.error('❌ Error fetching wishlist status:', error);
    }
  };

  // Fetch manifestations - VERIFIED ENDPOINT ✅
  const fetchManifestations = async (beasiswaId: string) => {
    try {
      setManifestationLoading(true);
      const token = getAuthToken();
      if (!token) {
        // console.log('❌ No token, skipping manifestations fetch');
        setManifestationLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const url = `${apiUrl}/manifestations?beasiswa_v3_id=${beasiswaId}`; // ✅ CORRECT
      // console.log('🔍 Fetching manifestations from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // console.log('📡 Manifestations response status:', response.status);
      const responseText = await response.text();
      // console.log('📡 Manifestations response body:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          // console.log('✅ Manifestations result:', result);
          
          // Handle different response structures
          if (Array.isArray(result.data)) {
            setManifestations(result.data);
          } else if (Array.isArray(result)) {
            setManifestations(result);
          } else {
            // console.warn('⚠️ Unknown response structure:', result);
            setManifestations([]);
          }
        } catch (parseError) {
          // console.error('❌ Error parsing manifestations response:', parseError);
          setManifestations([]);
        }
      } else {
        // console.error('❌ Manifestations fetch error:', response.status, responseText);
      }
    } catch (error) {
      // console.error('❌ Error fetching manifestations:', error);
    } finally {
      setManifestationLoading(false);
    }
  };

  // Toggle wishlist - FIXED
  const handleWishlistToggle = async () => {
    const scholarshipId = getScholarshipId();
    
    if (!scholarshipId) {
      // console.log('❌ No scholarship ID');
      alert('ID beasiswa tidak ditemukan');
      return;
    }

    try {
      setWishlistLoading(true);
      const token = getAuthToken();
      if (!token) {
        alert('Silakan login terlebih dahulu');
        // console.log('❌ No token for wishlist toggle');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      if (isWishlisted) {
        // Remove from wishlist
        const url = `${apiUrl}/wishlist/beasiswa/${scholarshipId}`;
        // console.log('🗑️ Removing from wishlist:', url);

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const responseText = await response.text();
        // console.log('📡 Remove wishlist response:', response.status, responseText);

        if (response.ok) {
          setIsWishlisted(false);
          alert('Berhasil menghapus dari wishlist');
        } else {
          // console.error('❌ Remove wishlist error:', responseText);
          alert(`Gagal menghapus dari wishlist: ${response.status}`);
        }
      } else {
        // Add to wishlist
        const url = `${apiUrl}/wishlist`;
        const payload = { beasiswaId: scholarshipId };
        // console.log('➕ Adding to wishlist:', url, payload);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        // console.log('📡 Add wishlist response:', response.status, responseText);

        if (response.ok) {
          setIsWishlisted(true);
          alert('Berhasil menambahkan ke wishlist');
        } else {
          // console.error('❌ Add wishlist error:', responseText);
          alert(`Gagal menambahkan ke wishlist: ${response.status}`);
        }
      }
    } catch (error) {
      // console.error('❌ Error toggling wishlist:', error);
      alert('Gagal mengubah wishlist. Silakan coba lagi.');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Submit manifestation - VERIFIED ENDPOINT ✅
  const handleManifestationSubmit = async () => {
    const scholarshipId = getScholarshipId();
    
    if (!manifestation.trim()) {
      // console.log('❌ No manifestation text');
      return;
    }
    
    if (!scholarshipId) {
      // console.log('❌ No scholarship ID');
      alert('ID beasiswa tidak ditemukan');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      if (!token) {
        alert('Silakan login terlebih dahulu');
        // console.log('❌ No token for manifestation submit');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const url = `${apiUrl}/manifestations`; // ✅ CORRECT
      const payload = {
        beasiswa_v3_id: scholarshipId,
        manifestation: manifestation.trim(),
      };
      
      // console.log('💬 Creating manifestation:', url, payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      // console.log('📡 Create manifestation response:', response.status, responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          // console.log('✅ Create manifestation result:', result);
          
          // Handle different response structures
          const newManifestation = result.data || result;
          setManifestations(prev => [newManifestation, ...prev]);
          setManifestation('');
          alert('Manifestasi berhasil disimpan!');
        } catch (parseError) {
          // console.error('❌ Error parsing manifestation response:', parseError);
          alert('Terjadi kesalahan saat menyimpan manifestasi');
        }
      } else {
        // console.error('❌ Create manifestation error:', responseText);
        alert(`Gagal menyimpan manifestasi: ${response.status}`);
      }
    } catch (error) {
      // console.error('❌ Error submitting manifestation:', error);
      alert('Gagal menyimpan manifestasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete manifestation - VERIFIED ENDPOINT ✅
  const handleDeleteManifestation = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus manifestasi ini?')) return;

    try {
      const token = getAuthToken();
      if (!token) {
        // console.log('❌ No token for delete manifestation');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const url = `${apiUrl}/manifestations/${id}`; // ✅ CORRECT
      // console.log('🗑️ Deleting manifestation:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      // console.log('📡 Delete manifestation response:', response.status, responseText);

      if (response.ok) {
        setManifestations(prev => prev.filter(m => m.id !== id));
        alert('Manifestasi berhasil dihapus');
      } else {
        // console.error('❌ Delete manifestation error:', responseText);
        alert(`Gagal menghapus manifestasi: ${response.status}`);
      }
    } catch (error) {
      // console.error('❌ Error deleting manifestation:', error);
      alert('Gagal menghapus manifestasi. Silakan coba lagi.');
    }
  };

  // Fetch scholarship detail from backend - REMOVE localStorage fallback
  useEffect(() => {
    const fetchScholarshipDetail = async () => {
      if (!recommendation_id) return;

      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const fullUrl = `${apiUrl}/scholarship/${recommendation_id}`;
        
        // console.log('📡 Fetching scholarship from DATABASE:', fullUrl);
        // console.log('📌 ID:', recommendation_id);
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          // console.error('❌ Backend error:', response.status, errorText);
          
          if (response.status === 404) {
            throw new Error('Beasiswa tidak ditemukan di database. Mungkin data dari AI belum disinkronkan.');
          } else if (response.status === 500) {
            throw new Error('Server error. Beasiswa dengan ID ini tidak ada di database.');
          }
          
          throw new Error(`Backend error: ${response.status}`);
        }

        const responseData = await response.json();
        // console.log('✅ Scholarship from DATABASE:', responseData);
        
        // Handle response
        let data: any;
        if (responseData.code === 200 && responseData.data) {
          data = responseData.data;
        } else if (responseData.id) {
          data = responseData;
        } else {
          throw new Error('Invalid response format');
        }
        
        // console.log('✅ Scholarship ID from DB:', data.id);
        
        // Set scholarship detail
        setScholarshipDetail({
          ...data,
          description: `Beasiswa ${data.jenis} dari ${data.penyelenggara}. Program beasiswa ini dirancang untuk mendukung mahasiswa berprestasi dalam menyelesaikan pendidikan.`,
          requirements: [
            'Mahasiswa aktif',
            `Sesuai dengan jenis: ${data.jenis}`,
            'Tidak sedang menerima beasiswa lain',
            'Memenuhi persyaratan akademik',
            'Berkomitmen menyelesaikan studi'
          ],
          benefits: [
            'Bantuan biaya pendidikan',
            'Dukungan akademik',
            'Networking dengan sesama penerima',
            'Mentoring program',
            'Sertifikat penerima beasiswa'
          ],
          documents: [
            'Transkrip nilai terbaru',
            'Surat keterangan aktif kuliah',
            'Essay motivasi',
            'CV dan portofolio',
            'Surat rekomendasi'
          ],
          applicationUrl: '#',
          eligibility: `Periode pendaftaran: ${new Date(data.open_registration).toLocaleDateString('id-ID')} - ${new Date(data.close_registration).toLocaleDateString('id-ID')}`
        });

        // Use ACTUAL database ID for wishlist and manifestations
        const scholarshipId = data.id;
        // console.log('📌 Using DATABASE ID for wishlist/manifestation:', scholarshipId);

        // Fetch wishlist and manifestations
        await Promise.all([
          fetchWishlistStatus(scholarshipId),
          fetchManifestations(scholarshipId),
        ]);
      } catch (error) {
        // console.error('❌ Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Gagal memuat detail beasiswa';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarshipDetail();
  }, [recommendation_id]);

  if (isLoading) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography>Memuat detail beasiswa...</Typography>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !scholarshipDetail) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Typography className="text-red-500 text-lg mb-4">{error || 'Beasiswa tidak ditemukan'}</Typography>
            <button
              onClick={() => router.back()}
              className="text-primary-blue hover:underline"
            >
              Kembali ke halaman sebelumnya
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if deadline has passed
  const isDeadlinePassed = new Date() > new Date(scholarshipDetail.close_registration);
  const deadlineColor = isDeadlinePassed ? 'text-red-500' : 'text-green-500';
  const deadlineStatus = isDeadlinePassed ? 'TUTUP' : 'BUKA';
  const deadlineDisplay = new Date(scholarshipDetail.close_registration).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`${scholarshipDetail.nama} - Detail Beasiswa`} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-blue to-primary-orange pt-24 pb-12">
          <div className="container mx-auto px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white mb-6 hover:text-white/80 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <Typography className="text-white">Kembali ke Rekomendasi</Typography>
            </button>

            <div className="max-w-4xl mx-auto">
              <Typography className="text-4xl md:text-5xl font-bold text-white mb-4">
                {scholarshipDetail.nama}
              </Typography>
              <Typography className="text-xl text-white/90 mb-6">
                {scholarshipDetail.penyelenggara}
              </Typography>
              
              <div className="flex flex-wrap gap-6 text-white mb-6">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  <Typography className="text-white">
                    Deadline: {deadlineDisplay}
                  </Typography>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDeadlinePassed ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}>
                    {deadlineStatus}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5" />
                  <Typography className="text-white">
                    {scholarshipDetail.jenis}
                  </Typography>
                </div>

                {scholarshipDetail.match_score && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    <Typography className="text-white">
                      Match Score: {Math.round(scholarshipDetail.match_score * 100)}%
                    </Typography>
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isWishlisted 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {wishlistLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                )}
                <Typography className="text-white font-medium">
                  {isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                </Typography>
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-primary-blue mb-4">
                    Deskripsi Beasiswa
                  </Typography>
                  <Typography className="text-gray-700 leading-relaxed">
                    {scholarshipDetail.description}
                  </Typography>
                </div>

                {/* Requirements & Benefits - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <Typography className="text-2xl font-bold text-primary-blue mb-4">
                      Syarat & Ketentuan
                    </Typography>
                    <Typography className="text-gray-600 mb-4">
                      Eligibilitas: {scholarshipDetail.eligibility}
                    </Typography>
                    <ul className="space-y-3">
                      {scholarshipDetail.requirements?.map((req, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-2 h-2 bg-primary-orange rounded-full mt-2 flex-shrink-0"></div>
                          <Typography className="text-gray-700">{req}</Typography>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <Typography className="text-2xl font-bold text-primary-blue mb-4">
                      Manfaat Beasiswa
                    </Typography>
                    <ul className="space-y-3">
                      {scholarshipDetail.benefits?.map((benefit, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-2 h-2 bg-primary-blue rounded-full mt-2 flex-shrink-0"></div>
                          <Typography className="text-gray-700">{benefit}</Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <Typography className="text-2xl font-bold text-primary-blue mb-4">
                    Dokumen yang Diperlukan
                  </Typography>
                  <ul className="space-y-3">
                    {scholarshipDetail.documents?.map((doc, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-primary-orange rounded-full mt-2 flex-shrink-0"></div>
                        <Typography className="text-gray-700">{doc}</Typography>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Manifestation Board - Highlighted */}
                <div className="bg-gradient-to-br from-primary-blue/5 to-primary-orange/5 rounded-2xl shadow-lg p-8 border-2 border-primary-blue/20">
                  <div className="text-center mb-6">
                  <Typography className="text-3xl font-bold text-primary-blue mb-2  ">
                    Manifestation Board
                  </Typography>
                  <Typography className="text-primary-orange font-semibold  ">
                    Wujudkan Mimpi Beasiswamu
                  </Typography>
                  <Typography className="text-gray-600 mt-2  ">
                    Tuliskan manifestasimu, ekspresikan tekad dan mimpimu untuk beasiswa ini!
                  </Typography>
                  </div>
                  
                  {/* Create New Manifestation */}
                  <div className="bg-white rounded-xl p-6 shadow-md space-y-4 mb-6">
                    <textarea        
                      value={manifestation}
                      onChange={(e) => setManifestation(e.target.value)}
                      placeholder="Tulis manifestasi baru di sini..."
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-none transition-colors"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <Typography className="text-sm text-gray-500">
                        {manifestation.length}/500 karakter
                      </Typography>
                      <button
                        onClick={handleManifestationSubmit}
                        disabled={!manifestation.trim() || isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-orange text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <Typography>Menyimpan...</Typography>
                          </>
                        ) : (
                          <>
                            <FiSend className="w-4 h-4" />
                            <Typography>Kirim Manifestasi</Typography>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* List of Manifestations */}
                  <div className="space-y-4">
                    <Typography className="text-xl font-bold text-primary-blue">
                      Manifestasi Saya ({manifestations.length})
                    </Typography>
                    
                    {manifestationLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : manifestations.length === 0 ? (
                      <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                        <Typography className="text-gray-500">
                          Belum ada manifestasi. Tuliskan manifestasi pertamamu!
                        </Typography>
                      </div>
                    ) : (
                      manifestations.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary-orange">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <Typography className="text-gray-700 mb-2 whitespace-pre-wrap">
                                {item.manifestation}
                              </Typography>
                              <Typography className="text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </div>
                            <button
                              onClick={() => handleDeleteManifestation(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Hapus manifestasi"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Action Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  {isDeadlinePassed ? (
                    <div className="text-center">
                      <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
                        <Typography className="text-gray-600 font-bold text-lg mb-2">
                          Pendaftaran Ditutup
                        </Typography>
                        <Typography className="text-gray-500 text-sm">
                          Deadline telah berakhir pada {deadlineDisplay}
                        </Typography>
                      </div>
                    </div>
                  ) : (
                    <ButtonLink
                      href={scholarshipDetail.applicationUrl || '#'}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Typography className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-primary-blue to-primary-orange rounded-xl hover:shadow-lg transition-all font-bold">
                        Daftar Sekarang
                      </Typography>
                    </ButtonLink>
                  )}
                </div>

                {/* Status Pendaftaran */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <Typography className="text-xl font-bold text-primary-blue mb-4">
                    Status Pendaftaran
                  </Typography>
                  <div className={`p-4 rounded-xl border-2 ${
                    isDeadlinePassed 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <Typography className={`font-bold text-center text-lg ${deadlineColor}`}>
                      {isDeadlinePassed ? 'PENDAFTARAN DITUTUP' : 'PENDAFTARAN DIBUKA'}
                    </Typography>
                    <Typography className="text-sm text-gray-600 text-center mt-2">
                      Deadline: {deadlineDisplay}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
