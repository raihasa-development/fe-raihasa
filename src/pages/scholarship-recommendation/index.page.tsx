'use client';

import React from 'react';
import { FiCalendar, FiDollarSign, FiExternalLink, FiCheckCircle, FiZap, FiTarget, FiAward, FiEdit3, FiGlobe } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';

import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

import EnhancedChatbox from './components/enhanced-chatbox';

export default function ScholarshipRecommendationPage() {
  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Scholra - Rekomendasi Beasiswa AI" />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {/* Hero Section */}
        <section className="relative pt-48 pb-16 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#1B7691]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FB991A]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1B7691]/10 to-[#FB991A]/10 rounded-full mb-6">
                <HiSparkles className="text-[#FB991A]" />
                <Typography className="text-sm font-semibold text-[#1B7691]">
                  Powered by Artificial Intelligence
                </Typography>
              </div>

              <Typography className="font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4">
                Temukan Beasiswa
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1B7691] to-[#FB991A]">
                  dengan Scholra AI
                </span>
              </Typography>

              <Typography className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Ceritakan profilmu, dan Scholra AI akan menemukan beasiswa yang paling sesuai untukmu dalam hitungan detik.
              </Typography>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto items-start">
              {/* Chatbox */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-2 xl:order-1"
              >
                <EnhancedChatbox />
              </motion.div>

              {/* Haira Character & Tips */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="order-1 xl:order-2 flex flex-col items-center xl:sticky xl:top-28"
              >
                {/* Haira Image */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B7691]/20 to-[#FB991A]/20 rounded-full blur-2xl scale-110"></div>
                  <NextImage
                    src="/images/landing/haira-hero-desktop.png"
                    width={320}
                    height={320}
                    alt="Scholra AI Assistant"
                    className="relative w-full max-w-[320px] h-auto animate-float"
                  />
                </div>

                {/* Haira Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-full flex items-center justify-center">
                      <HiSparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Typography className="font-bold text-gray-900">Scholra AI</Typography>
                      <Typography className="text-sm text-gray-500">Asisten Beasiswa Cerdas</Typography>
                    </div>
                  </div>

                  <Typography className="text-gray-600 text-sm leading-relaxed mb-6">
                    Saya akan menganalisis profilmu dan mencocokkannya dengan ratusan beasiswa yang tersedia untuk menemukan yang paling sesuai!
                  </Typography>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiZap className="w-4 h-4 text-green-600" />
                      </div>
                      <Typography className="text-sm text-gray-700">Rekomendasi dalam hitungan detik</Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiTarget className="w-4 h-4 text-blue-600" />
                      </div>
                      <Typography className="text-sm text-gray-700">Match score berdasarkan profilmu</Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiAward className="w-4 h-4 text-orange-600" />
                      </div>
                      <Typography className="text-sm text-gray-700">100+ beasiswa dalam database</Typography>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Typography className="text-sm font-semibold text-[#FB991A] uppercase tracking-wider mb-2">
                Tips & Trik
              </Typography>
              <Typography className="text-3xl md:text-4xl font-bold text-gray-900">
                Dapatkan Rekomendasi Terbaik
              </Typography>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: <FiEdit3 className="w-8 h-8 text-[#1B7691]" />,
                  title: 'Isi Data Lengkap',
                  desc: 'Semakin lengkap datamu, semakin akurat rekomendasinya'
                },
                {
                  icon: <FiTarget className="w-8 h-8 text-[#1B7691]" />,
                  title: 'Ceritakan Minatmu',
                  desc: 'Sebutkan jurusan dan bidang studi yang kamu minati'
                },
                {
                  icon: <FiAward className="w-8 h-8 text-[#1B7691]" />,
                  title: 'Bagikan Prestasi',
                  desc: 'Prestasi akademik/non-akademik bisa membuka peluang baru'
                },
                {
                  icon: <FiGlobe className="w-8 h-8 text-[#1B7691]" />,
                  title: 'Tentukan Preferensi',
                  desc: 'Pilih beasiswa dalam/luar negeri sesuai keinginan'
                }
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 group"
                >
                  <div className="flex justify-center mb-4 p-3 bg-blue-50 rounded-xl w-fit mx-auto group-hover:bg-[#1B7691]/10 transition-colors">
                    {tip.icon}
                  </div>
                  <Typography className="font-semibold text-gray-900 mb-2">{tip.title}</Typography>
                  <Typography className="text-sm text-gray-600">{tip.desc}</Typography>
                </motion.div>
              ))}

            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
