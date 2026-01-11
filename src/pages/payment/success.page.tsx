import 'aos/dist/aos.css';

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Aos from 'aos';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { orderId, amount } = router.query;
  const [countdown, setCountdown] = React.useState(5);

  useEffect(() => {
    Aos.init({ once: true });
  }, []);

  // Auto redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Payment Success | Raihasa" />
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className='pt-20 mt-20 lg:pt-32 lg:mt-0'>
          <div className='layout'>
            <div
              className='w-full text-center bg-gradient-to-r from-[#FB991A] to-[#C0172A] py-5 lg:py-8 shadow-header rounded-lg'
              data-aos='fade-up'
            >
              <Typography variant="h1" weight="bold" className="text-white text-shadow-xl text-2xl lg:text-5xl">
                Pembayaran Berhasil! 🎉
              </Typography>
              <Typography className="text-white mt-2 text-sm lg:text-base">
                Terima kasih atas pembelian Anda
              </Typography>
            </div>
          </div>
        </section>

        {/* Success Content */}
        <section className='py-12 lg:py-24'>
          <div className='layout'>
            <div className="max-w-3xl mx-auto">
              {/* Success Card */}
              <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl p-8 lg:p-12 text-center mb-8" data-aos="zoom-in">
                {/* Success Icon */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FiCheckCircle className="w-12 h-12 lg:w-14 lg:h-14 text-white" />
                </div>

                <Typography variant="h2" weight="bold" className="text-gray-900 mb-3">
                  Pembayaran Berhasil!
                </Typography>
                
                <Typography className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                  Selamat! Pembayaran Anda telah dikonfirmasi dan akun Anda telah diaktifkan. 
                  Anda sekarang dapat mengakses semua fitur premium.
                </Typography>

                {/* Order Details */}
                {orderId && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <Typography className="text-sm text-gray-600">Order ID</Typography>
                      <Typography weight="semibold" className="text-sm text-gray-900 font-mono">{orderId}</Typography>
                    </div>
                    {amount && (
                      <div className="flex justify-between items-center">
                        <Typography className="text-sm text-gray-600">Total Bayar</Typography>
                        <Typography weight="bold" className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#C0172A]">
                          Rp {Number(amount).toLocaleString('id-ID')}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Ke Dashboard</span>
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/scholarship-info')}
                    className="w-full sm:w-auto bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-[#FB991A] hover:text-[#FB991A] transition-all duration-300"
                  >
                    Jelajahi Beasiswa
                  </button>
                </div>

                {/* Auto Redirect Countdown */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Typography className="text-sm text-gray-600 text-center">
                    Anda akan dialihkan ke dashboard dalam <span className="font-bold text-[#FB991A]">{countdown}</span> detik...
                  </Typography>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6 lg:p-8" data-aos="fade-up" data-aos-delay="200">
                <Typography variant="h4" weight="bold" className="text-gray-900 mb-4">
                  Langkah Selanjutnya
                </Typography>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FB991A] font-bold border-2 border-[#FB991A]">
                      1
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Cek Email Anda</Typography>
                      <Typography className="text-sm text-gray-600">Invoice dan detail akses telah dikirim ke email Anda</Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FB991A] font-bold border-2 border-[#FB991A]">
                      2
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Akses Dashboard</Typography>
                      <Typography className="text-sm text-gray-600">Mulai jelajahi fitur dan konten premium Anda</Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FB991A] font-bold border-2 border-[#FB991A]">
                      3
                    </div>
                    <div>
                      <Typography weight="semibold" className="text-gray-900 mb-1">Mulai Eksplorasi</Typography>
                      <Typography className="text-sm text-gray-600">Temukan beasiswa yang sesuai dengan profilmu</Typography>
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
