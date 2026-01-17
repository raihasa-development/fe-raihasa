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
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-primary">

        <div className="bg-white max-w-[380px] w-full rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiX className="w-6 h-6 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Maaf, kami tidak dapat memproses transaksi Anda saat ini.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-4">
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">ID Transaksi</span>
                <span className="text-xs font-mono text-gray-600 truncate max-w-[150px]" title={orderId as string}>{orderId}</span>
              </div>
            )}

            <div className="h-px bg-gray-200 border-dashed border-t"></div>

            <div className="flex justify-between items-start pt-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Alasan</span>
              <span className="text-xs font-medium text-red-600 text-right max-w-[180px]">
                {reason || 'Pembayaran dibatalkan atau gagal'}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/products')}
            className="w-full bg-red-600 text-white rounded-xl py-3.5 font-medium text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Kembali ke Beranda
          </button>

        </div>
      </main>
    </Layout>
  );
}
