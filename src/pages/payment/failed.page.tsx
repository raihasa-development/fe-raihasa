import 'aos/dist/aos.css';

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Aos from 'aos';
import { FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { orderId, reason } = router.query;

  useEffect(() => {
    Aos.init({ once: true });
  }, []);

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Payment Failed | Raihasa" />
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className='pt-20 mt-20 lg:pt-32 lg:mt-0'>
          <div className='layout'>
            <div
              className='w-full text-center bg-gradient-to-r from-gray-600 to-gray-800 py-5 lg:py-8 shadow-header rounded-lg'
              data-aos='fade-up'
            >
              <Typography variant="h1" weight="bold" className="text-white text-shadow-xl text-2xl lg:text-5xl">
                Pembayaran Gagal
              </Typography>
              <Typography className="text-white mt-2 text-sm lg:text-base">
                Terjadi kendala pada pembayaran Anda
              </Typography>
            </div>
          </div>
        </section>

        {/* Failed Content */}
        <section className='py-12 lg:py-24'>
          <div className='layout'>
            <div className="max-w-3xl mx-auto">
              {/* Failed Card */}
              <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xl p-8 lg:p-12 text-center mb-8" data-aos="zoom-in">
                {/* Failed Icon */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiXCircle className="w-12 h-12 lg:w-14 lg:h-14 text-white" />
                </div>

                <Typography variant="h2" weight="bold" className="text-gray-900 mb-3">
                  Pembayaran Tidak Berhasil
                </Typography>
                
                <Typography className="text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
                  Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi customer support jika masalah berlanjut.
                </Typography>

                {/* Error Details */}
                {(orderId || reason) && (
                  <div className="bg-red-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                    {orderId && (
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-red-200">
                        <Typography className="text-sm text-gray-600">Order ID</Typography>
                        <Typography weight="semibold" className="text-sm text-gray-900 font-mono">{orderId}</Typography>
                      </div>
                    )}
                    {reason && (
                      <div className="flex justify-between items-start gap-4">
                        <Typography className="text-sm text-gray-600">Alasan:</Typography>
                        <Typography className="text-sm text-red-600 text-right">{reason}</Typography>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                    <span>Coba Lagi</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-[#FB991A] hover:text-[#FB991A] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                    <span>Kembali ke Home</span>
                  </button>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 lg:p-8" data-aos="fade-up" data-aos-delay="200">
                <Typography variant="h4" weight="bold" className="text-gray-900 mb-4">
                  Butuh Bantuan?
                </Typography>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Periksa Detail Pembayaran</Typography>
                      <Typography className="text-sm text-gray-600">Pastikan saldo atau limit kartu Anda mencukupi</Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Gunakan Metode Lain</Typography>
                      <Typography className="text-sm text-gray-600">Coba metode pembayaran alternatif yang tersedia</Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Hubungi Customer Support</Typography>
                      <Typography className="text-sm text-gray-600">Tim kami siap membantu Anda 24/7</Typography>
                      <a 
                        href="https://wa.me/YOUR_WHATSAPP_NUMBER" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-[#FB991A] hover:text-[#C0172A] transition-colors"
                      >
                        <span>Chat via WhatsApp</span>
                        <FiArrowLeft className="w-4 h-4 rotate-180" />
                      </a>
                    </div>
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
