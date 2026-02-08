import React from 'react';
import { FiTarget, FiDatabase, FiZap, FiArrowRight } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';
import EnhancedChatbox from './components/enhanced-chatbox';

export default function ScholarshipRecommendationPage() {
  return (
    <Layout withNavbar withFooter>
      <SEO
        title="Scholra AI - Rekomendasi Beasiswa | Raihasa"
        description="Temukan beasiswa yang tepat untukmu dengan bantuan Scholra AI. Dapatkan rekomendasi beasiswa yang sesuai dengan profil dan kebutuhanmu."
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B7691]/10 to-[#FB991A]/10 px-4 py-2 rounded-full mb-4">
              <FiZap className="w-4 h-4 text-[#1B7691]" />
              <span className="text-sm font-semibold text-[#1B7691]">Powered by AI</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Scholra AI
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan beasiswa yang tepat untukmu dengan bantuan AI. Jawab beberapa pertanyaan
              dan dapatkan rekomendasi beasiswa yang sesuai dengan profil dan kebutuhanmu.
            </p>
          </div>

          {/* Chatbox */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <EnhancedChatbox />
          </div>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <FiTarget className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Personalized</h3>
              <p className="text-sm text-gray-500">Rekomendasi sesuai profil kamu</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <FiDatabase className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">2500+ Beasiswa</h3>
              <p className="text-sm text-gray-500">Database terlengkap di Indonesia</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <FiZap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Instan</h3>
              <p className="text-sm text-gray-500">Hasil dalam hitungan detik</p>
            </div>
          </div>

          {/* CTA Link */}
          <div className="mt-8 text-center">
            <a
              href="/bisa-learning"
              className="inline-flex items-center gap-2 text-[#1B7691] hover:text-[#0d5a6e] font-medium transition-colors"
            >
              Explore BISA Learning untuk persiapan beasiswa
              <FiArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </Layout>
  );
}
