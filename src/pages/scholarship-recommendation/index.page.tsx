'use client';

import React, { useState } from 'react';
import { FiCalendar, FiDollarSign, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { FaArrowRightLong } from 'react-icons/fa6';

import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

import Chatbox from './components/chatbox';
import { ScholarshipRecommendation } from './types/type';

export default function ScholarshipRecommendationPage() {
  const [recommendations, setRecommendations] = useState<ScholarshipRecommendation[]>([]);

  const handleRecommendation = (newRecommendations: ScholarshipRecommendation[]) => {
    setRecommendations(newRecommendations);
  };

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Rekomendasi Beasiswa AI" />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              {/* <Typography className="text-[#1B7691] text-xl md:text-2xl mb-4">
                <i>Powered by Artificial Intelligence</i>
              </Typography> */}
              <Typography className="font-bold text-4xl md:text-6xl text-[#FB991A] mb-4">
                Rekomendasi Beasiswa Berbasis AI
              </Typography>
              <Typography className="text-lg md:text-xl text-[#1B7691] max-w-3xl mx-auto">
                Ceritakan profil akademik Anda kepada Haira AI dan dapatkan rekomendasi beasiswa yang paling sesuai!
              </Typography>
            </div>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Chatbox */}
              <div className="order-2 xl:order-1">
                <Chatbox onRecommendation={handleRecommendation} />
              </div>

              {/* Haira Character */}
              <div className="order-1 xl:order-2 flex flex-col items-center justify-center">
                <NextImage
                  src="/images/landing/haira-hero-desktop.png"
                  width={400}
                  height={400}
                  alt="Haira AI Assistant"
                  className="w-full max-w-[400px] h-auto"
                />
                <div className="text-center mt-4">
                  <Typography className="text-2xl font-bold text-[#1B7691] mb-2">
                    Kenalan dengan Haira!
                  </Typography>
                  <Typography className="text-gray-600">
                    Asisten AI yang siap membantu menemukan beasiswa impian Anda
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="py-12 bg-white/50">
            <div className="container mx-auto px-4">
              <Typography className="text-3xl font-bold text-[#1B7691] text-center mb-8">
                Rekomendasi Beasiswa untuk Anda
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {recommendations.map((scholarship) => (
                  <div
                    key={scholarship.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Typography className="text-xl font-bold text-[#1B7691] leading-tight">
                        {scholarship.title}
                      </Typography>
                      <div className="bg-[#FB991A]/10 text-[#FB991A] px-3 py-1 rounded-full text-sm font-medium">
                        Rekomendasi
                      </div>
                    </div>

                    <Typography className="text-gray-600 mb-4">
                      {scholarship.provider}
                    </Typography>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-[#1B7691] w-5 h-5" />
                        <Typography className="text-sm">
                          <span className="font-medium">Deadline:</span> {scholarship.deadline}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <FiDollarSign className="text-[#1B7691] w-5 h-5" />
                        <Typography className="text-sm">
                          <span className="font-medium">Nilai:</span> {scholarship.amount}
                        </Typography>
                      </div>

                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="text-[#1B7691] w-5 h-5 mt-0.5" />
                        <Typography className="text-sm">
                          <span className="font-medium">Syarat:</span> {scholarship.eligibility}
                        </Typography>
                      </div>
                    </div>

                    <Typography className="text-gray-700 text-sm mb-6 leading-relaxed">
                      {scholarship.description}
                    </Typography>

                    <div className="flex gap-3">
                      <ButtonLink
                        href={scholarship.link}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        <Typography className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B7691] rounded-xl hover:bg-[#FB991A] transition-colors">
                          Lihat Detail <FaArrowRightLong />
                        </Typography>
                      </ButtonLink>
                      
                      <button className="px-4 py-2 border-2 border-[#1B7691] text-[#1B7691] rounded-xl hover:bg-[#1B7691] hover:text-white transition-colors">
                        <FiExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tips Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <Typography className="text-2xl font-bold text-[#1B7691] text-center mb-6">
                Tips untuk Mendapatkan Rekomendasi Terbaik
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#FB991A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <Typography className="font-semibold text-[#1B7691] mb-2">
                      Berikan Informasi Lengkap
                    </Typography>
                    <Typography className="text-gray-600 text-sm">
                      Sebutkan universitas, jurusan, semester, dan IPK untuk rekomendasi yang lebih akurat.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#FB991A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <Typography className="font-semibold text-[#1B7691] mb-2">
                      Ceritakan Minat Anda
                    </Typography>
                    <Typography className="text-gray-600 text-sm">
                      Bagikan bidang studi atau karir yang Anda minati untuk mendapat beasiswa yang sesuai.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#FB991A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <Typography className="font-semibold text-[#1B7691] mb-2">
                      Sebutkan Prestasi
                    </Typography>
                    <Typography className="text-gray-600 text-sm">
                      Ceritakan prestasi akademik atau non-akademik untuk beasiswa yang lebih kompetitif.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#FB991A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <Typography className="font-semibold text-[#1B7691] mb-2">
                      Tentukan Preferensi
                    </Typography>
                    <Typography className="text-gray-600 text-sm">
                      Sebutkan jika Anda ingin beasiswa dalam negeri, luar negeri, atau keduanya.
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
