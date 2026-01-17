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
  jenis?: string;
};

const PRODUCT_CATALOG_FALLBACK = [
  {
    id: 'b02758b1-925f-4522-8385-79e69e3c8d86',
    nama: 'GO Plan',
    harga: 1000,
    deskripsi: 'Start your journey with essential tools',
    jenis: 'new-card', // Keep legacy slug for mapping
    masa_aktif: 3,
    features: ['Akses Video', '5x Consultation']
  },
  {
    id: 'a5edc065-212f-4ee7-afb3-8481ad577479',
    nama: 'PRO Plan',
    harga: 2000,
    deskripsi: 'Paket lengkap untuk persiapan beasiswa yang serius',
    jenis: 'ideal-plan', // Keep legacy slug for mapping
    masa_aktif: 12,
    features: ['All Features', '10x Consultation']
  }
];

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
    // Determine Snap URL based on environment
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const snapScript = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    if (!clientKey) {
      setErrorMessage('Midtrans client key tidak dikonfigurasi');
      return;
    }

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      setSnapLoaded(true);
    };

    script.onerror = () => {
      setErrorMessage('Gagal memuat script pembayaran');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-checkout', productId],
    queryFn: async () => {
      if (!productId) return null;

      let found = null;
      const productIdLower = productId.toString().toLowerCase();

      // 1. Try fetching from API
      try {
        const response = await api.get<{ data: any[] }>('/products/lms');
        const products = response.data.data;

        // Exact match
        found = products.find(p => p.id === productId);

        // Fuzzy match
        if (!found) {
          found = products.find(p => {
            const nameMatch = p.name?.toLowerCase().includes(productIdLower);
            const typeMatch = p.PaketLMS?.[0]?.name?.toLowerCase().includes(productIdLower) ||
              p.PaketLMS?.[0]?.jenis?.toLowerCase() === productIdLower;
            return nameMatch || typeMatch;
          });
        }

        // Slug mapping match against API data (if data exists but slug is used)
        if (!found) {
          if (productIdLower === 'new-card') {
            found = products.find(p => p.name?.toLowerCase().includes('go') || p.harga === 49000);
          }
          if (productIdLower === 'ideal-plan') {
            found = products.find(p => p.name?.toLowerCase().includes('pro') || p.harga === 169000);
          }
        }
      } catch (e) {
        console.error("Failed to fetch product for checkout API", e);
      }

      // 2. Fallback to Hardcoded Catalog if API failed or returned no match
      if (!found) {
        // console.warn("Using fallback catalog for", productId);
        found = PRODUCT_CATALOG_FALLBACK.find(p => p.id === productIdLower || p.jenis === productIdLower);
      }

      if (!found) return null;

      // Normalize data structure
      return {
        id: found.id,
        nama: found.name || found.nama,
        harga: found.harga,
        harga_diskon: found.harga_diskon,
        deskripsi: found.PaketLMS?.[0]?.deskripsi || found.deskripsi || '',
        masa_aktif: found.PaketLMS?.[0]?.masa_aktif || found.masa_aktif || 0,
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
        product_id: product?.id, // Use resolved real ID
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
      <main className="min-h-screen bg-[#FDFCFB] relative overflow-hidden flex items-center justify-center py-20 px-4">
        {/* Background Blobs for ambiance */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50 rounded-full blur-[80px] opacity-40 translate-y-1/3 -translate-x-1/4" />

        <div className="relative w-full max-w-lg z-10" data-aos="fade-up">
          {/* Header / Breadcrumb-ish */}
          <div className="text-center mb-8">
            <Typography variant="h1" weight="bold" className="text-3xl md:text-3xl font-poppins text-gray-900 mb-2">
              Review Pesanan
            </Typography>
            <Typography className="text-gray-500 text-sm">
              Pastikan detail paket langganan Anda sudah sesuai
            </Typography>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(251,153,26,0.15)] border border-white/50 overflow-hidden">

            {/* Loading State */}
            {paymentStatus === 'loading' && (
              <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#FB991A] to-[#DB4B24] rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-orange-200">
                  <FiLoader className="w-8 h-8 text-white animate-spin" />
                </div>
                <Typography variant="h3" weight="bold" className="text-xl text-gray-800 mb-2">
                  Memproses Pesanan
                </Typography>
                <Typography className="text-gray-500 text-sm max-w-xs mx-auto">
                  Mohon tunggu sebentar, kami sedang menyiapkan tagihan Anda...
                </Typography>
              </div>
            )}

            {/* Pending / Ready to Pay State */}
            {paymentStatus === 'pending' && paymentData && (
              <div>
                {/* Product Summary Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-8 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="inline-block py-1 px-3 rounded-full bg-orange-100/50 text-[#DB4B24] text-xs font-bold tracking-wide uppercase mb-3">
                        {product.jenis === 'basic' ? 'Basic Tier' : 'Premium Tier'}
                      </span>
                      <Typography variant="h2" weight="bold" className="text-2xl font-poppins text-gray-900 leading-tight">
                        {product.nama}
                      </Typography>
                      <Typography className="text-gray-500 text-sm mt-1">
                        Akses Membership {product.masa_aktif} Bulan
                      </Typography>
                    </div>
                    {/* Compact Price */}
                    <div className="text-right">
                      <Typography className="text-sm text-gray-400 line-through decoration-red-300">
                        {hasDiscount && `Rp ${product.harga.toLocaleString('id-ID')}`}
                      </Typography>
                    </div>
                  </div>

                  {/* Huge Price Display */}
                  <div className="mt-6 flex items-baseline">
                    <span className="text-base text-gray-500 font-medium mr-1">Total:</span>
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#FB991A] to-[#DB4B24]">
                      Rp {displayPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Features & Details */}
                <div className="px-8 py-6 bg-white">
                  <div className="space-y-4">
                    {/* Description Snippet */}
                    <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                      <div className="flex gap-3">
                        <div className="mt-1 min-w-[1.25rem]">
                          <FiCheck className="w-5 h-5 text-[#FB991A]" />
                        </div>
                        <Typography className="text-sm text-gray-600 leading-relaxed">
                          {product.deskripsi || "Akses penuh ke semua materi pembelajaran dan mentoring eksklusif."}
                        </Typography>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Masa Aktif</span>
                      </div>
                      <span className="font-semibold text-gray-700">{product.masa_aktif} Bulan</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                      <div className="flex items-center gap-2">
                        <FiSmartphone className="w-4 h-4" />
                        <span>Metode Bayar</span>
                      </div>
                      <span className="font-semibold text-gray-700">QRIS / Transfer / CC</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-8 border-t border-dashed border-gray-200 relative">
                    <div className="absolute -left-[44px] -top-3 w-6 h-6 bg-[#FDFCFB] rounded-full" />
                    <div className="absolute -right-[44px] -top-3 w-6 h-6 bg-[#FDFCFB] rounded-full" />
                  </div>

                  {/* Payment Action */}
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        if (!snapLoaded || !window.snap) {
                          setErrorMessage('Gagal memuat gateway, silakan refresh.');
                          return;
                        }
                        // @ts-ignore
                        window.snap.pay(paymentData.token, {
                          onSuccess: (result: any) => router.push(`/payment/success?orderId=${result.order_id || paymentData.order_id}&amount=${displayPrice}`),
                          onPending: () => setErrorMessage('Menunggu pembayaran...'),
                          onError: () => { setErrorMessage('Pembayaran gagal/dibatalkan.'); setPaymentStatus('failed'); },
                          onClose: () => console.log('Popup closed'),
                        });
                      }}
                      disabled={!snapLoaded}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-[#FB991A] to-[#DB4B24] rounded-xl py-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-300/40"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <div className="relative flex items-center justify-center gap-2 text-white font-bold text-lg">
                        {snapLoaded ? (
                          <>
                            <FiCreditCard className="w-5 h-5" />
                            <span>Bayar Sekarang</span>
                          </>
                        ) : (
                          <>
                            <FiLoader className="w-5 h-5 animate-spin" />
                            <span>Memuat...</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => router.push('/products')}
                      className="w-full py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Batal & Kembali
                    </button>
                  </div>

                  {/* Error Toast Inline */}
                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-pulse">
                      {errorMessage}
                    </div>
                  )}

                  {/* Secure Badge */}
                  <div className="mt-6 flex justify-center items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_midtrans.png/1200px-Logo_midtrans.png" alt="Midtrans" className="h-4" />
                    <Typography className="text-[10px] text-gray-400">Secured Payment Gateway</Typography>
                  </div>

                </div>
              </div>
            )}

            {/* Success State */}
            {paymentStatus === 'success' && (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <FiCheck className="w-10 h-10 text-green-600" />
                </div>
                <Typography variant="h2" className="text-2xl font-bold text-gray-800 mb-2">Terima Kasih!</Typography>
                <Typography className="text-gray-500 text-sm mb-8">Pembayaran berhasil. Membership Anda aktif.</Typography>
                <button onClick={() => router.push('/dashboard')} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all">
                  Ke Dashboard
                </button>
              </div>
            )}

            {/* Failed State */}
            {paymentStatus === 'failed' && (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <FiX className="w-10 h-10 text-red-600" />
                </div>
                <Typography variant="h2" className="text-2xl font-bold text-gray-800 mb-2">Gagal Memproses</Typography>
                <Typography className="text-gray-500 text-sm mb-8">Terjadi kesalahan pada transaksi.</Typography>
                <button onClick={() => { setErrorMessage(''); setPaymentStatus('idle'); createPaymentMutation.reset(); }} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                  Coba Lagi
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </Layout>
  );
}
