'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiHeart, FiMapPin, FiSend } from 'react-icons/fi';

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

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const { recommendation_id } = router.query;
  
  // State for like/favorite (combined)
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(142);
  
  // State for manifestation notes
  const [manifestation, setManifestation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [scholarshipDetail, setScholarshipDetail] = useState<ScholarshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scholarship detail from backend
  useEffect(() => {
    const fetchScholarshipDetail = async () => {
      if (!recommendation_id) return;

      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const fullUrl = `${apiUrl}/scholarship/${recommendation_id}`;
        
        console.log('Fetching scholarship detail from:', fullUrl);
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Scholarship detail response:', responseData);
        
        // Handle backend response structure
        let data: ScholarshipRecommendation;
        if (responseData.code === 200 && responseData.status && responseData.data) {
          data = responseData.data;
        } else if (responseData.id) {
          // Direct data response
          data = responseData;
        } else {
          throw new Error('Invalid response format');
        }
        
        // Transform and set the data
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
      } catch (error) {
        console.error('Error fetching scholarship detail:', error);
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleManifestationSubmit = async () => {
    if (!manifestation.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setManifestation('');
  };

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

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                  isLiked 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <Typography className="text-white font-medium">{likeCount} Suka</Typography>
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
                  
                  {isSubmitted ? (
                    <div className="bg-white border-2 border-green-400 rounded-xl p-8 text-center shadow-md">
                      <Typography className="text-green-700 font-bold text-xl mb-2">
                        Manifestasi Tersimpan!
                      </Typography>
                      <Typography className="text-green-600">
                        Semoga mimpi Anda terwujud dan mendapatkan beasiswa ini.
                      </Typography>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                      <textarea        
                        value={manifestation}
                        onChange={(e) => setManifestation(e.target.value)}
                        placeholder="Tulis manifestasimu di sini... "
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
                  )}
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
