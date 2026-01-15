'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft, FiCalendar, FiDollarSign, FiHeart, FiMapPin, FiSend,
  FiTrash2, FiClock, FiCheckCircle, FiFileText, FiAward, FiShare2
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { ScholarshipRecommendation } from '../types/type';

interface ScholarshipDetail {
  id: string;
  nama: string;
  penyelenggara: string;
  jenis: string;
  open_registration: string;
  close_registration: string;
  match_score?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  documents?: string[];
  applicationUrl?: string;
  eligibility?: string;
  link?: string;
}

interface Manifestation {
  id: string;
  manifestation: string;
  created_at: string;
}

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const { recommendation_id } = router.query;

  // State
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [manifestation, setManifestation] = useState('');
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manifestationLoading, setManifestationLoading] = useState(false);
  const [scholarshipDetail, setScholarshipDetail] = useState<ScholarshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Get auth token
  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;

    const localStorageKeys = ['token', 'accessToken', 'authToken', 'access_token', 'jwt', 'bearerToken', '@raihasa/token'];
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }

    const cookieKeys = ['token', 'accessToken', 'authToken', 'access_token', 'jwt', 'bearerToken', 'auth_token', '@raihasa/token'];
    for (const key of cookieKeys) {
      const value = getCookie(key);
      if (value) return value;
    }
    return null;
  };

  const getScholarshipId = () => {
    return scholarshipDetail?.id || recommendation_id as string;
  };

  // Date Parsing Helper (Copied from Results Page)
  const parseIndonesianDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      let date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;

      const months: { [key: string]: number } = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
      };

      const parts = dateStr.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        const year = parseInt(parts[2]);
        if (months[monthStr] !== undefined) return new Date(year, months[monthStr], day);
      }

      const slashParts = dateStr.split('/');
      if (slashParts.length === 3) return new Date(parseInt(slashParts[2]), parseInt(slashParts[1]) - 1, parseInt(slashParts[0]));

      return null;
    } catch (e) {
      return null;
    }
  };

  // Fetch Logic
  useEffect(() => {
    const fetchScholarshipDetail = async () => {
      if (!recommendation_id) return;

      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const fullUrl = `${apiUrl}/scholarship/${recommendation_id}`;

        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('Gagal mengambil data beasiswa.');

        const responseData = await response.json();
        let rawData: any;
        if (responseData.code === 200 && responseData.data) {
          rawData = responseData.data;
        } else if (responseData.id) {
          rawData = responseData;
        } else {
          throw new Error('Format data tidak valid');
        }

        // Defensive Coding & Formatting
        const providerName = rawData.penyelenggara || rawData.provider || 'Penyelenggara Tidak Diketahui';
        const scholarshipName = rawData.nama || rawData.title || 'Nama Beasiswa Tidak Tersedia';
        const scholarshipType = rawData.jenis || rawData.amount || 'Jenis Pendanaan Tidak Tersedia';

        // Parse dates safely
        const openDate = parseIndonesianDate(rawData.open_registration) || new Date();
        const closeDate = parseIndonesianDate(rawData.close_registration) || new Date();
        const formattedEligibility = `Periode Pendaftaran: ${openDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${closeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

        setScholarshipDetail({
          ...rawData,
          nama: scholarshipName,
          penyelenggara: providerName,
          jenis: scholarshipType,
          description: rawData.description || `Program ${scholarshipName} dari ${providerName} ini dirancang untuk mendukung mahasiswa berprestasi.`,
          requirements: Array.isArray(rawData.requirements) ? rawData.requirements : [
            'Mahasiswa aktif / Lulusan baru',
            'Memiliki prestasi akademik baik',
            'Tidak sedang menerima beasiswa lain (kecuali diizinkan)',
            'Sehat jasmani dan rohani'
          ],
          benefits: Array.isArray(rawData.benefits) ? rawData.benefits : [
            'Bantuan Biaya Pendidikan',
            'Uang Saku Bulanan',
            'Program Pengembangan Diri'
          ],
          documents: Array.isArray(rawData.documents) ? rawData.documents : [
            'CV / Resume Terbaru',
            'Transkrip Nilai',
            'Surat Rekomendasi'
          ],
          applicationUrl: rawData.link || rawData.applicationUrl || '#',
          eligibility: rawData.eligibility || formattedEligibility,
          open_registration: rawData.open_registration || openDate.toISOString(),
          close_registration: rawData.close_registration || closeDate.toISOString()
        });

        const scholarshipId = rawData.id;
        await Promise.all([
          fetchWishlistStatus(scholarshipId),
          fetchManifestations(scholarshipId),
        ]);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarshipDetail();
  }, [recommendation_id]);

  // Wishlist & Manifestation Handlers...
  const fetchWishlistStatus = async (beasiswaId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const res = await fetch(`${apiUrl}/wishlist/check/${beasiswaId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const result = await res.json();
        const isW = result.data?.isWishlisted ?? result.isWishlisted ?? false;
        setIsWishlisted(isW);
      }
    } catch (e) { }
  };

  const handleWishlistToggle = async () => {
    const id = getScholarshipId();
    if (!id) return;
    try {
      setWishlistLoading(true);
      const token = getAuthToken();
      if (!token) { alert('Silakan login terlebih dahulu'); return; }
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      const method = isWishlisted ? 'DELETE' : 'POST';
      const url = isWishlisted ? `${apiUrl}/wishlist/beasiswa/${id}` : `${apiUrl}/wishlist`;
      const body = isWishlisted ? undefined : JSON.stringify({ beasiswaId: id });

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        alert(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist');
      } else {
        alert('Gagal mengubah wishlist');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchManifestations = async (beasiswaId: string) => {
    try {
      setManifestationLoading(true);
      const token = getAuthToken();
      if (!token) { setManifestationLoading(false); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations?beasiswa_v3_id=${beasiswaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setManifestations(Array.isArray(result.data) ? result.data : []);
      }
    } catch (e) { } finally { setManifestationLoading(false); }
  };

  const handleManifestationSubmit = async () => {
    const id = getScholarshipId();
    if (!id || !manifestation.trim()) return;
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      if (!token) { alert('Silakan login dulu'); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ beasiswa_v3_id: id, manifestation: manifestation.trim() })
      });

      if (res.ok) {
        const result = await res.json();
        setManifestations(prev => [result.data || result, ...prev]);
        setManifestation('');
        alert('Manifestasi tersimpan!');
      } else {
        alert('Gagal menyimpan manifestasi');
      }
    } catch (e) { alert('Terjadi kesalahan'); } finally { setIsSubmitting(false); }
  };

  const handleDeleteManifestation = async (id: string) => {
    if (!confirm('Hapus manifestasi ini?')) return;
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/manifestations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setManifestations(prev => prev.filter(m => m.id !== id));
    } catch (e) { alert('Gagal menghapus'); }
  };

  // Rendering
  if (isLoading) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography className='text-gray-500 font-medium'>Memuat detail...</Typography>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !scholarshipDetail) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-4">
            <div className="bg-red-50 p-6 rounded-2xl mb-4">
              <Typography className="text-red-600 font-medium mb-2">Gagal Memuat Data</Typography>
              <Typography className="text-gray-500 text-sm">{error || 'Beasiswa tidak ditemukan'}</Typography>
            </div>
            <button onClick={() => router.back()} className="text-[#1B7691] hover:underline font-medium">
              Kembali ke hasil rekomendasi
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const closeDate = parseIndonesianDate(scholarshipDetail.close_registration) || new Date();
  const isDeadlinePassed = new Date() > closeDate;
  const deadlineDisplay = closeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`${scholarshipDetail.nama} - Detail Beasiswa`} />
      <main className="min-h-screen bg-gray-50/50 pb-20">

        {/* Modern Header */}
        <div className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] pt-28 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 relative z-10">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
              <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-all">
                <FiArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Kembali</span>
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDeadlinePassed ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-green-500/20 text-green-100 border-green-500/30'}`}>
                    {isDeadlinePassed ? 'PENDAFTARAN DITUTUP' : 'PENDAFTARAN DIBUKA'}
                  </span>
                  {scholarshipDetail.match_score && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FB991A]/20 text-[#FB991A] border border-[#FB991A]/30">
                      {Math.round(scholarshipDetail.match_score * 100)}% MATCH
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                  {scholarshipDetail.nama}
                </h1>
                <p className="text-xl text-white/80 flex items-center gap-2">
                  <FaGraduationCap className="text-[#FB991A]" />
                  {scholarshipDetail.penyelenggara}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-full transition-all border ${isWishlisted ? 'bg-white text-red-500 border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                >
                  <FiHeart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
                  <FiShare2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Deadline</span>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <FiClock className={isDeadlinePassed ? "text-red-500" : "text-[#1B7691]"} />
                    {deadlineDisplay}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Jenis Pendanaan</span>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <FiDollarSign className="text-green-500" />
                    {scholarshipDetail.jenis}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Periode</span>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                    <FiCalendar className="text-blue-500" />
                    {scholarshipDetail.eligibility?.replace('Periode Pendaftaran: ', '') || '-'}
                  </div>
                </div>
              </div>

              {/* Tabs / Sections */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiFileText className="text-[#1B7691]" /> Deskripsi Program
                    </h3>
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                      <p>{scholarshipDetail.description}</p>
                    </div>
                  </section>

                  <hr className="border-gray-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiCheckCircle className="text-[#1B7691]" /> Syarat & Ketentuan
                      </h3>
                      <ul className="space-y-3">
                        {scholarshipDetail.requirements?.map((req, i) => (
                          <li key={i} className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FB991A] mt-2 shrink-0"></div>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiAward className="text-[#1B7691]" /> Benefit Beasiswa
                      </h3>
                      <ul className="space-y-3">
                        {scholarshipDetail.benefits?.map((ben, i) => (
                          <li key={i} className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                            {ben}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <hr className="border-gray-100" />

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Dokumen yang Dibutuhkan</h3>
                    <div className="flex flex-wrap gap-2">
                      {scholarshipDetail.documents?.map((doc, i) => (
                        <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Manifestation Board Redesigned */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-sm border border-blue-100 p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#1B7691]">Manifestation Board ✨</h3>
                      <p className="text-gray-600">Tuliskan target dan afirmasimu untuk beasiswa ini.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-4 border border-blue-100 mb-6">
                    <textarea
                      value={manifestation}
                      onChange={(e) => setManifestation(e.target.value)}
                      placeholder="Tulis manifestasi positifmu disini... (Contoh: Saya pasti bisa mendapatkan beasiswa ini dan berkontribusi untuk negeri)"
                      className="w-full h-24 p-0 border-none focus:ring-0 resize-none text-gray-700 placeholder:text-gray-400"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{manifestation.length}/500</span>
                      <button
                        onClick={handleManifestationSubmit}
                        disabled={!manifestation.trim() || isSubmitting}
                        className="bg-[#1B7691] hover:bg-[#15627a] text-white px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Mengirim...' : <><FiSend /> Kirim</>}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {manifestations.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 italic bg-white/50 rounded-xl border border-dashed border-gray-200">
                        Belum ada manifestasi. Jadilah yang pertama menulis!
                      </div>
                    ) : (
                      manifestations.map((m) => (
                        <div key={m.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4 group hover:shadow-md transition-all">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 font-bold text-[#1B7691] text-lg">
                            “
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-medium leading-relaxed italic mb-2">"{m.manifestation}"</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">
                                {new Date(m.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                              <button
                                onClick={() => handleDeleteManifestation(m.id)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Action */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Siap Mendaftar?</h3>
                  <p className="text-gray-500 text-sm mb-6">Pastikan semua dokumen sudah siap sebelum melanjutkan.</p>

                  {isDeadlinePassed ? (
                    <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                      Pendaftaran Ditutup
                    </button>
                  ) : (
                    <ButtonLink
                      href={scholarshipDetail.applicationUrl || '#'}
                      variant="primary"
                      className="w-full block"
                    >
                      <div className="w-full py-4 bg-[#FB991A] hover:bg-[#e08916] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1">
                        Daftar Sekarang
                      </div>
                    </ButtonLink>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Anda akan diarahkan ke situs resmi penyelenggara.
                  </p>
                </div>

                <div className="bg-[#1B7691]/5 p-6 rounded-3xl border border-[#1B7691]/10">
                  <h4 className="font-bold text-[#1B7691] mb-2 flex items-center gap-2">
                    <FiCheckCircle /> Tips Scholra
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pelamar dengan <strong>Match Score &gt;80%</strong> memiliki peluang lolos 3x lebih besar. Pastikan essay motivasi Anda menonjolkan prestasi yang relevan.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
