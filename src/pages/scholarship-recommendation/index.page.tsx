'use client';

import React from 'react';
import { FiCalendar, FiDollarSign, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { FaArrowRightLong } from 'react-icons/fa6';

import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

import Chatbox from './components/chatbox';
import { ScholarshipRecommendationDisplay } from './types/type';

export default function ScholarshipRecommendationPage() {
  const handleRecommendation = (newRecommendations: ScholarshipRecommendationDisplay[]) => {
    // This function is no longer needed since we redirect to result page
    // console.log('Recommendations received, redirecting...');
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
              <Typography className="font-bold text-4xl md:text-6xl text-primary-orange mb-4">
                Rekomendasi Beasiswa Berbasis AI
              </Typography>
              <Typography className="text-lg md:text-xl text-primary-blue max-w-3xl mx-auto">
                Ceritakan profil akademik Anda kepada Haira AI dan dapatkan rekomendasi beasiswa yang paling sesuai!
              </Typography>
            </div>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* Chatbox */}
              <div className="order-2 xl:order-1">
                <Chatbox onRecommendation={handleRecommendation} />
              </div>

              {/* Haira Character */}
              <div className="order-1 xl:order-2 flex flex-col items-center justify-center">
                <NextImage
                  src="/images/landing/haira-hero-desktop.png"
                  width={350}
                  height={350}
                  alt="Haira AI Assistant"
                  className="w-full max-w-[350px] h-auto"
                />
                <div className="text-center mt-6">
                  <Typography className="text-xl font-semibold text-primary-blue mb-2">
                    Kenalan dengan Haira!
                  </Typography>
                  <Typography className="text-gray-500 text-sm leading-relaxed">
                    Asisten AI yang siap membantu menemukan<br />beasiswa impian Anda
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-4xl mx-auto">
              <Typography className="text-xl font-semibold text-primary-blue text-center mb-8">
                Tips untuk Mendapatkan Rekomendasi Terbaik
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <Typography className="font-medium text-gray-900 mb-2 text-sm">
                      Berikan Informasi Lengkap
                    </Typography>
                    <Typography className="text-gray-500 text-sm leading-relaxed">
                      Sebutkan universitas, jurusan, semester, dan IPK untuk rekomendasi yang lebih akurat.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <Typography className="font-medium text-gray-900 mb-2 text-sm">
                      Ceritakan Minat Anda
                    </Typography>
                    <Typography className="text-gray-500 text-sm leading-relaxed">
                      Bagikan bidang studi atau karir yang Anda minati untuk mendapat beasiswa yang sesuai.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <Typography className="font-medium text-gray-900 mb-2 text-sm">
                      Sebutkan Prestasi
                    </Typography>
                    <Typography className="text-gray-500 text-sm leading-relaxed">
                      Ceritakan prestasi akademik atau non-akademik untuk beasiswa yang lebih kompetitif.
                    </Typography>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <Typography className="font-medium text-gray-900 mb-2 text-sm">
                      Tentukan Preferensi
                    </Typography>
                    <Typography className="text-gray-500 text-sm leading-relaxed">
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
