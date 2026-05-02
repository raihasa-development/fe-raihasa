import { useRouter } from 'next/router';
import React from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { orderId, reason } = router.query;

  return (
    <Layout withNavbar={false} withFooter={false}>
      <SEO title="Pembayaran Gagal | Raihasa" />
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">

        <div className="bg-white max-w-[420px] w-full rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

          {/* Failed Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiX className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h1>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Maaf, kami tidak dapat memproses transaksi Anda saat ini.
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">ID Transaksi</span>
                <span className="text-xs font-mono text-gray-600 truncate max-w-[160px]" title={orderId as string}>{orderId}</span>
              </div>
            )}

            <div className="h-px bg-gray-200 border-dashed border-t"></div>

            <div className="flex justify-between items-start pt-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Alasan</span>
              <span className="text-xs font-medium text-red-600 text-right max-w-[180px]">
                {reason || 'Pembayaran dibatalkan atau gagal'}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => router.push('/products')}
            className="w-full bg-red-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-red-700 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>

          {/* Secondary Link */}
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-all duration-300"
          >
            Kembali ke Beranda
          </button>

        </div>
      </main>
    </Layout>
  );
}
