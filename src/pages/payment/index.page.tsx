import 'aos/dist/aos.css';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Aos from 'aos';
import { FiCheck, FiLock, FiClock, FiRefreshCw } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import PaymentComponent from './components/payment-component';

type ProductData = {
  id: string;
  nama?: string;
  name?: string; // Backend uses 'name' field
  harga: number;
  harga_diskon?: number;
  deskripsi: string;
  jenis: string;
  masa_aktif: number;
};

// Fallback catalog jika backend gagal
const PRODUCT_CATALOG: ProductData[] = [
  {
    id: 'new-card',
    nama: 'New Card',
    harga: 49000,
    harga_diskon: undefined,
    deskripsi: 'Perfect untuk kamu yang baru mulai perjalanan beasiswa',
    jenis: 'basic',
    masa_aktif: 3,
  },
  {
    id: 'ideal-plan', // Maps to PRO Plan
    nama: 'Ideal Plan',
    harga: 169000,
    harga_diskon: undefined,
    deskripsi: 'Paket lengkap untuk pendaftaran beasiswa (12 Bulan)',
    jenis: 'ideal',
    masa_aktif: 12,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const { productId } = router.query;

  useEffect(() => {
    Aos.init({ once: true });

    // Load Midtrans Snap script
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-_ChFuuaZr9CUeQbO';

    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch single product from backend based on productId
  const { data: selectedProduct, isLoading, error } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      if (!productId) return null;

      try {
        // Use /products/lms endpoint (note: plural 'products')
        const response = await api.get<{ data: any[] }>('/products/lms');
        const products = response.data.data;

        // console.log('📦 Raw API response from /products/lms:', products);

        // Transform backend data to match our ProductData type
        // Backend returns ProductProgram with PaketLMS array
        const transformedProducts: ProductData[] = products.map((p: any) => ({
          id: p.id,
          nama: p.name, // Backend uses 'name'
          harga: p.harga,
          harga_diskon: p.harga_diskon,
          deskripsi: p.PaketLMS?.[0]?.deskripsi || p.deskripsi || 'Paket beasiswa terbaik',
          jenis: p.PaketLMS?.[0]?.jenis || p.name?.toLowerCase() || 'standard',
          masa_aktif: p.PaketLMS?.[0]?.masa_aktif || p.masa_aktif || 0,
        }));

        // console.log('📦 Transformed products:', transformedProducts);
        const productIdLower = productId.toString().toLowerCase();

        // Try matching by jenis (basic, ideal)
        let found = transformedProducts.find(p =>
          p.jenis?.toLowerCase() === productIdLower
        );

        if (found) {
          // console.log('✅ Found by jenis:', found);
          return found;
        }

        // Try matching by id
        found = transformedProducts.find(p =>
          p.id?.toLowerCase() === productIdLower
        );

        if (found) {
          // console.log('✅ Found by id:', found);
          return found;
        }

        // Try matching by nama/name
        found = transformedProducts.find(p =>
          p.nama?.toLowerCase().includes(productIdLower) ||
          p.nama?.toLowerCase().replace(/\s+/g, '-') === productIdLower
        );

        if (found) {
          // console.log('✅ Found by nama:', found);
          return found;
        }

        // console.warn('⚠️ Product not found in API, using fallback');
        const fallbackProduct = PRODUCT_CATALOG.find(p =>
          p.jenis?.toLowerCase() === productIdLower ||
          p.id?.toLowerCase() === productIdLower
        );

        return fallbackProduct || null;
      } catch (err) {
        // console.error('❌ Error fetching product:', err);

        // Use hardcoded fallback on error
        const productIdLower = productId.toString().toLowerCase();
        const fallback = PRODUCT_CATALOG.find(p =>
          p.jenis?.toLowerCase() === productIdLower ||
          p.id?.toLowerCase() === productIdLower
        );

        // console.log('✅ Using hardcoded fallback:', fallback);
        return fallback || null;
      }
    },
    enabled: !!productId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Redirect if no productId
  useEffect(() => {
    if (!productId && !isLoading) {
      // console.log('❌ No productId, redirecting to products page');
      router.push('/products');
    }
  }, [productId, isLoading, router]);

  // Handle payment success
  const handlePaymentSuccess = (userProgramId: string) => {
    // console.log('✅ Payment successful, redirecting to dashboard');
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (isLoading) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <SEO title="Payment | Raihasa" />
        <main className="min-h-screen bg-gray-50">
          <section className='pt-32 pb-12'>
            <div className="layout">
              <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#FB991A]"></div>
                  <Typography className="text-gray-600 text-sm">Memuat detail pembayaran...</Typography>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  if (!selectedProduct) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <SEO title="Product Not Found | Raihasa" />
        <main className="min-h-screen bg-gray-50">
          <section className='pt-32 pb-12'>
            <div className="layout">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-xl mx-auto" data-aos="fade-up">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <Typography variant="h3" weight="semibold" className="text-gray-900 mb-2 text-xl">
                  Produk Tidak Ditemukan
                </Typography>
                <Typography className="text-gray-600 text-sm mb-6">
                  Produk yang Anda cari tidak tersedia atau sudah tidak aktif.
                </Typography>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-[#FB991A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#e88a15] transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Kembali ke Produk</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  // Display price (use discounted price if available)
  const displayPrice = selectedProduct.harga_diskon || selectedProduct.harga;
  const hasDiscount = selectedProduct.harga_diskon &&
    selectedProduct.harga_diskon < selectedProduct.harga;

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`Payment - ${selectedProduct.nama} | Raihasa`} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className='pt-32 pb-6'>
          <div className='layout'>
            <div
              className='w-full bg-gradient-to-r from-[#FB991A] to-[#C0172A] py-12 shadow-sm rounded-lg'
              data-aos='fade-up'
            >
              <div className="text-center max-w-2xl mx-auto px-4">
                <Typography variant="h1" weight="semibold" className="text-white text-2xl lg:text-3xl mb-2">
                  Checkout Pembayaran
                </Typography>
                <Typography className="text-white/90 text-sm">
                  Selesaikan pembayaran untuk {selectedProduct.nama}
                </Typography>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className='pb-8'>
          <div className='layout'>
            <nav className="flex items-center space-x-2 text-sm text-gray-500" data-aos="fade-right">
              <button
                onClick={() => router.push('/')}
                className="hover:text-[#FB991A] transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <button
                onClick={() => router.push('/products')}
                className="hover:text-[#FB991A] transition-colors"
              >
                Products
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Payment</span>
            </nav>
          </div>
        </section>

        {/* Main Content */}
        <section className='pb-12'>
          <div className='layout'>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Form */}
              <div className="lg:col-span-2" data-aos="fade-up">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <Typography variant="h3" weight="semibold" className="text-lg mb-6 pb-4 border-b border-gray-200">
                    Detail Pembayaran
                  </Typography>

                  <PaymentComponent
                    productId={selectedProduct.id}
                    productName={selectedProduct.nama ?? selectedProduct.name ?? selectedProduct.id}
                    productPrice={displayPrice}
                    productDescription={selectedProduct.deskripsi}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="100">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm sticky top-24">
                  <div className="p-6">
                    <Typography variant="h4" weight="semibold" className="text-lg mb-4 pb-4 border-b border-gray-200">
                      Ringkasan Pesanan
                    </Typography>

                    {/* Product Details */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between items-start gap-4">
                        <Typography className="text-gray-600 text-sm">Produk</Typography>
                        <Typography weight="medium" className="text-gray-900 text-sm text-right">{selectedProduct.nama}</Typography>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <Typography className="text-gray-600 text-sm">Durasi Akses</Typography>
                        <Typography weight="medium" className="text-gray-900 text-sm">{selectedProduct.masa_aktif} bulan</Typography>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <Typography className="text-gray-600 text-sm">Deskripsi</Typography>
                        <Typography className="text-gray-700 text-sm text-right leading-relaxed">{selectedProduct.deskripsi}</Typography>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                      {hasDiscount && (
                        <div className="flex justify-between items-center">
                          <Typography className="text-gray-500 text-sm">Harga Normal</Typography>
                          <Typography className="text-gray-500 text-sm line-through">
                            Rp {selectedProduct.harga.toLocaleString('id-ID')}
                          </Typography>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <Typography variant="h4" weight="semibold" className="text-base text-gray-900">
                          Total Bayar
                        </Typography>
                        <div className="text-right">
                          <Typography variant="h3" weight="semibold" className="text-xl text-[#FB991A]">
                            Rp {displayPrice.toLocaleString('id-ID')}
                          </Typography>
                          {hasDiscount && (
                            <Typography className="text-xs text-green-600 font-medium">
                              Hemat Rp {(selectedProduct.harga - displayPrice).toLocaleString('id-ID')}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                          <FiLock className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <Typography className="text-sm font-medium text-gray-900">Pembayaran Aman</Typography>
                          <Typography className="text-xs text-gray-500 mt-0.5">Terenkripsi SSL</Typography>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FiClock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <Typography className="text-sm font-medium text-gray-900">Akses Instan</Typography>
                          <Typography className="text-xs text-gray-500 mt-0.5">Langsung aktif setelah bayar</Typography>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                          <FiRefreshCw className="w-4 h-4 text-[#FB991A]" />
                        </div>
                        <div>
                          <Typography className="text-sm font-medium text-gray-900">Garansi Uang Kembali</Typography>
                          <Typography className="text-xs text-gray-500 mt-0.5">30 hari jaminan</Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods Info */}
        <section className='pb-12'>
          <div className='layout'>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm" data-aos="fade-up">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FB991A] to-[#C0172A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Typography className="text-gray-600 text-xs">Powered by</Typography>
                    <Typography weight="semibold" className="text-gray-900 text-sm">Midtrans Payment Gateway</Typography>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end">
                  <span className="px-3 py-1.5 bg-gray-50 rounded-md text-xs font-medium text-gray-700 border border-gray-200">Credit Card</span>
                  <span className="px-3 py-1.5 bg-gray-50 rounded-md text-xs font-medium text-gray-700 border border-gray-200">Bank Transfer</span>
                  <span className="px-3 py-1.5 bg-gray-50 rounded-md text-xs font-medium text-gray-700 border border-gray-200">E-Wallet</span>
                  <span className="px-3 py-1.5 bg-gray-50 rounded-md text-xs font-medium text-gray-700 border border-gray-200">Convenience Store</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
