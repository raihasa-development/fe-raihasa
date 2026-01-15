import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from '@/layouts/Layout';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';
import { FiCheck, FiClock, FiX, FiLoader, FiCreditCard, FiSmartphone } from 'react-icons/fi';

type ProductData = {
  id: string;
  nama: string;
  harga: number;
  harga_diskon?: number;
  deskripsi: string;
  masa_aktif: number;
};

type PaymentStatus = 'idle' | 'loading' | 'pending' | 'success' | 'failed';

export default function CheckoutPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Midtrans Snap script
  useEffect(() => {
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    if (!clientKey) {
      // console.error('❌ MIDTRANS_CLIENT_KEY not configured');
      setErrorMessage('Midtrans client key tidak dikonfigurasi');
      return;
    }

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      // console.log('✅ Snap script loaded');
      setSnapLoaded(true);
    };

    script.onerror = () => {
      // console.error('❌ Failed to load Snap script');
      setErrorMessage('Gagal memuat script pembayaran');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-checkout', productId],
    queryFn: async () => {
      if (!productId) return null;

      const response = await api.get<{ data: any[] }>('/products/lms');
      const products = response.data.data;

      const found = products.find(p => p.id === productId);
      if (!found) return null;

      return {
        id: found.id,
        nama: found.name,
        harga: found.harga,
        harga_diskon: found.harga_diskon,
        deskripsi: found.PaketLMS?.[0]?.deskripsi || '',
        masa_aktif: found.PaketLMS?.[0]?.masa_aktif || 0,
      } as ProductData;
    },
    enabled: !!productId,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const user_id = payload.user_id || payload.id || payload.sub;

      const response = await api.post('/payments/create', {
        product_id: productId,
        user_id: user_id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    },
    onSuccess: (data) => {
      // console.log('✅ Payment created:', data);
      setPaymentData(data);
      setPaymentStatus('pending');
    },
    onError: (error: any) => {
      // console.error('❌ Payment error:', error);
      setPaymentStatus('failed');
    },
  });

  // Auto-create payment on mount
  useEffect(() => {
    if (product && paymentStatus === 'idle') {
      setPaymentStatus('loading');
      createPaymentMutation.mutate();
    }
  }, [product, paymentStatus]);

  // Display price
  const displayPrice = product?.harga_diskon || product?.harga || 0;
  const hasDiscount = product?.harga_diskon && product.harga_diskon < product.harga;

  // Render loading state
  if (productLoading || !product) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FiLoader className="w-12 h-12 text-[#FB991A] animate-spin mx-auto mb-4" />
            <Typography className="text-gray-600">Memuat data produk...</Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`Checkout - ${product.nama} | Raihasa`} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <Typography variant="h1" weight="bold" className="text-3xl md:text-4xl mb-3 bg-gradient-to-r from-[#1E3A8A] to-[#C0172A] bg-clip-text text-transparent">
              Checkout Pembayaran
            </Typography>
            <Typography className="text-gray-600">
              Selesaikan pembayaran untuk mengaktifkan paket Anda
            </Typography>
          </div>

          {/* Status: Loading */}
          {paymentStatus === 'loading' && (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100" data-aos="fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLoader className="w-10 h-10 text-[#1E3A8A] animate-spin" />
              </div>
              <Typography variant="h2" weight="bold" className="text-2xl mb-3">
                Membuat Pembayaran...
              </Typography>
              <Typography className="text-gray-600">
                Mohon tunggu, kami sedang memproses pesanan Anda
              </Typography>
            </div>
          )}

          {/* Status: Pending Payment */}
          {paymentStatus === 'pending' && paymentData && (
            <div className="space-y-6" data-aos="fade-up">
              {/* Product Details Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-8 py-6">
                  <Typography variant="h2" weight="bold" className="text-2xl text-white mb-1">
                    {product.nama}
                  </Typography>
                  <Typography className="text-blue-100">
                    Paket Membership Premium
                  </Typography>
                </div>

                {/* Product Info */}
                <div className="p-8">
                  <div className="space-y-4">
                    {/* Description */}
                    {product.deskripsi && (
                      <div className="pb-4 border-b border-gray-100">
                        <Typography className="text-gray-600 leading-relaxed">
                          {product.deskripsi}
                        </Typography>
                      </div>
                    )}

                    {/* Masa Aktif */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FiClock className="w-5 h-5 text-[#1E3A8A]" />
                        </div>
                        <Typography className="text-gray-700">Durasi Langganan</Typography>
                      </div>
                      <Typography weight="bold" className="text-lg">{product.masa_aktif} Hari</Typography>
                    </div>

                    {/* Price Breakdown */}
                    {hasDiscount && (
                      <div className="flex items-center justify-between py-3">
                        <Typography className="text-gray-600">Harga Normal</Typography>
                        <Typography className="text-gray-400 line-through">
                          Rp {product.harga.toLocaleString('id-ID')}
                        </Typography>
                      </div>
                    )}

                    {hasDiscount && (
                      <div className="flex items-center justify-between py-3 bg-green-50 -mx-8 px-8 rounded-lg">
                        <Typography className="text-green-700 font-semibold">Diskon</Typography>
                        <Typography className="text-green-700 font-bold">
                          - Rp {((product.harga || 0) - (product.harga_diskon || 0)).toLocaleString('id-ID')}
                        </Typography>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between py-6 border-t-2 border-gray-200 mt-4">
                      <Typography variant="h3" weight="bold" className="text-xl text-gray-900">
                        Total Pembayaran
                      </Typography>
                      <div className="text-right">
                        <Typography variant="h2" weight="bold" className="text-3xl bg-gradient-to-r from-[#FB991A] to-[#C0172A] bg-clip-text text-transparent">
                          Rp {displayPrice.toLocaleString('id-ID')}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                    <FiCreditCard className="w-6 h-6 text-[#FB991A]" />
                  </div>
                  <div>
                    <Typography variant="h3" weight="bold" className="text-xl mb-1">
                      Metode Pembayaran
                    </Typography>
                    <Typography className="text-sm text-gray-500">
                      Pilih metode pembayaran yang Anda inginkan
                    </Typography>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // console.log('✅ Snap script loaded');
                    if (!snapLoaded) {
                      setErrorMessage('Snap belum dimuat, tunggu sebentar...');
                      return;
                    }

                    if (!paymentData.token) {
                      setErrorMessage('Token pembayaran tidak tersedia');
                      return;
                    }

                    if (typeof window.snap === 'undefined') {
                      setErrorMessage('Midtrans Snap tidak tersedia, silakan refresh halaman');
                      return;
                    }

                    // @ts-ignore
                    window.snap.pay(paymentData.token, {
                      onSuccess: (result: any) => {
                        // console.log('✅ Payment success:', result);
                        router.push(`/payment/success?orderId=${result.order_id || paymentData.order_id}`);
                      },
                      onPending: (result: any) => {
                        // console.log('⏳ Payment pending:', result);
                        setErrorMessage('Pembayaran pending, mohon selesaikan pembayaran Anda');
                      },
                      onError: (result: any) => {
                        // console.error('❌ Payment error:', result);
                        setErrorMessage('Pembayaran gagal, silakan coba lagi');
                        setPaymentStatus('failed');
                      },
                      onClose: () => {
                        // console.log('🚪 Payment popup closed');
                      },
                    });
                  }}
                  disabled={!snapLoaded}
                  className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {snapLoaded ? (
                    <>
                      <FiCreditCard className="w-6 h-6" />
                      Lanjutkan Pembayaran
                    </>
                  ) : (
                    <>
                      <FiLoader className="w-6 h-6 animate-spin" />
                      Memuat Payment Gateway...
                    </>
                  )}
                </button>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiX className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <Typography className="text-sm text-red-700">
                        {errorMessage}
                      </Typography>
                    </div>
                  </div>
                )}

                {/* Payment Methods Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <Typography weight="semibold" className="text-gray-700">
                      Pembayaran Aman & Terpercaya
                    </Typography>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <FiCreditCard className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                      <Typography className="text-xs">Kartu Kredit</Typography>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <FiSmartphone className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                      <Typography className="text-xs">E-Wallet</Typography>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <FiCheck className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                      <Typography className="text-xs">Transfer Bank</Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="text-center bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <Typography className="text-sm text-gray-500 mb-1">
                  ID Transaksi
                </Typography>
                <Typography className="font-mono font-bold text-gray-800 text-lg">
                  {paymentData.order_id || 'Memproses...'}
                </Typography>
              </div>
            </div>
          )}

          {/* Status: Success */}
          {paymentStatus === 'success' && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center" data-aos="fade-up">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-12 h-12 text-green-600" />
              </div>
              <Typography variant="h1" weight="bold" className="text-3xl mb-3 text-green-600">
                Pembayaran Berhasil!
              </Typography>
              <Typography className="text-gray-600 mb-8 max-w-md mx-auto">
                Terima kasih! Pesanan Anda telah berhasil diproses. Membership Anda sudah aktif.
              </Typography>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Ke Dashboard Saya
              </button>
            </div>
          )}

          {/* Status: Failed */}
          {paymentStatus === 'failed' && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center" data-aos="fade-up">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiX className="w-12 h-12 text-red-600" />
              </div>
              <Typography variant="h1" weight="bold" className="text-3xl mb-3 text-red-600">
                Pembayaran Gagal
              </Typography>
              <Typography className="text-gray-600 mb-8 max-w-md mx-auto">
                Maaf, terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setPaymentStatus('idle');
                    createPaymentMutation.reset();
                  }}
                  className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300"
                >
                  Kembali ke Products
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
