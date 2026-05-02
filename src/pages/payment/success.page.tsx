import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const getQueryValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const orderId = getQueryValue(router.query.orderId) || getQueryValue(router.query.order_id);
  const amount = getQueryValue(router.query.amount) || getQueryValue(router.query.gross_amount);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Memverifikasi...');
  const [retryCount, setRetryCount] = useState(0);

  // Poll LMS Data
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchLmsData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id || payload.id || payload.sub;

        if (userId) {
          const res = await api.get(`/lms/user/${userId}`);
          const lmsData = res.data?.data;

          if (lmsData?.end) {
            const date = new Date(lmsData.end);
            if (!isNaN(date.getTime())) {
              setActiveUntil(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
              setStatusText('Aktif');
              return;
            }
          }
        }
      } catch (error) {
        // Ignore
      }

      if (retryCount < 10) {
        timeoutId = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setStatusText('Sedang memproses aktivasi...');
        }, 2000);
      } else {
        setStatusText('Menunggu konfirmasi');
      }
    };

    if (router.isReady) {
      fetchLmsData();
    }

    return () => clearTimeout(timeoutId);
  }, [router.isReady, retryCount]);

  return (
    <Layout withNavbar={false} withFooter={false}>
      <SEO title="Pembayaran Berhasil | Raihasa" />
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">

        <div className="bg-white max-w-[420px] w-full rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil</h1>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            Membership Anda telah aktif. Selamat belajar!
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">ID Transaksi</span>
              <span className="text-xs font-mono text-gray-600 truncate max-w-[160px]" title={orderId}>{orderId || '-'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Total</span>
              <span className="text-sm font-bold text-gray-900">
                {amount ? `Rp ${Number(amount).toLocaleString('id-ID')}` : '-'}
              </span>
            </div>

            <div className="h-px bg-gray-200 border-dashed border-t"></div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Status</span>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-lg">
                {activeUntil ? `Aktif s.d ${activeUntil}` : statusText}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => router.push('/bisa-learning')}
            className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-black transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Mulai Belajar</span>
            <FiArrowRight className="w-4 h-4" />
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
