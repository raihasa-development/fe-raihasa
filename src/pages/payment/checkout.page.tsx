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
  new_user_offer?: NewUserOffer;
};

type PromoPreview = {
  discount_amount?: number | null;
  auto_discount_amount?: number | null;
  promo_discount_amount?: number | null;
  base_amount?: number | null;
  final_amount?: number | null;
  final_price?: number | null;
  new_user_offer?: NewUserOffer;
};

type NewUserOffer = {
  code?: string;
  is_active: boolean;
  expires_at: string | null;
  remaining_seconds: number;
  discount_percent: number;
  discount_amount: number;
  price_after_discount: number;
};



type PaymentStatus = 'idle' | 'creating' | 'pending' | 'success' | 'failed';

export default function CheckoutPage() {
  const router = useRouter();
  const { productId } = router.query;
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoPreview | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [offerNow, setOfferNow] = useState(new Date());

  const toSafeNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  const handleValidatePromo = async () => {
    if (!promoCode || !product) return;

    const autoPromoCode = product.new_user_offer?.code?.toUpperCase();
    if (autoPromoCode && promoCode.toUpperCase() === autoPromoCode) {
      setPromoError('Kode ini otomatis diterapkan untuk akun baru. Gunakan kode promo tambahan lain (mis. referral).');
      setAppliedPromo(null);
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    try {
      const token = getToken();
      const response = await api.post('/pricing/validate-promo', 
        { code: promoCode, plan_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const promoData = response.data?.data || {};
      const discountAmount = toSafeNumber(promoData.discount_amount, 0);
      const finalAmount = toSafeNumber(
        promoData.final_amount ?? promoData.final_price,
        product.harga,
      );

      setAppliedPromo({
        ...promoData,
        discount_amount: discountAmount,
        auto_discount_amount: toSafeNumber(promoData.auto_discount_amount, 0),
        promo_discount_amount: toSafeNumber(promoData.promo_discount_amount, discountAmount),
        base_amount: toSafeNumber(promoData.base_amount, product.harga),
        final_amount: finalAmount,
      });
    } catch (e: any) {
      setPromoError(e.response?.data?.message || 'Kode promo tidak valid atau kadaluarsa');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

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

      // Fetch from v2 Pricing API
      try {
        const response = await api.get<{ data: any }>(`/pricing/plans/${productId}`);
        const plan = response.data.data;
        if (!plan) return null;

        // Normalize data structure for UI
        return {
          id: plan.id,
          nama: plan.name,
          harga: toSafeNumber(plan.price, 0),
          harga_diskon: undefined, // no legacy discount logic here
          deskripsi: plan.description || '',
          masa_aktif: toSafeNumber(plan.duration_months, 0),
          jenis: plan.is_enterprise ? 'private' : (plan.is_popular ? 'ideal' : 'basic'),
          new_user_offer: plan.new_user_offer,
        } as ProductData;
      } catch (e) {
        console.error("Failed to fetch plan for checkout", e);
        return null;
      }
    },
    enabled: !!productId,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await api.post('/pricing/payments/create', {
        plan_id: product?.id,
        promo_code: appliedPromo ? promoCode : undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    },
    onSuccess: (data) => {
      setPaymentData(data);
      setPaymentStatus('pending');

      // Automatically launch midtrans snap on successful token creation
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result: any) => router.push(`/payment/success?orderId=${result.order_id || data.order_id}&amount=${displayPrice}`),
          onPending: () => setErrorMessage('Menunggu pembayaran...'),
          onError: (result: any) => {
            const midtransMessage = result?.status_message || result?.message;
            setErrorMessage(midtransMessage || 'Pembayaran gagal/dibatalkan.');
            setPaymentStatus('failed');
          },
          onClose: () => { setPaymentStatus('idle'); },
        });
      }
    },
    onError: (error: any) => {
      setPaymentStatus('failed');
      setErrorMessage(error.response?.data?.message || 'Gagal memproses pembayaran');
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setOfferNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveOffer = product?.new_user_offer;
  const isOfferActive =
    !!liveOffer?.is_active &&
    !!liveOffer?.expires_at &&
    new Date(liveOffer.expires_at) > offerNow;

  const baseAmount = toSafeNumber(
    appliedPromo?.base_amount,
    toSafeNumber(product?.harga, 0),
  );

  const autoDiscountAmount = toSafeNumber(
    appliedPromo?.auto_discount_amount,
    isOfferActive ? toSafeNumber(liveOffer?.discount_amount, 0) : 0,
  );

  const promoDiscountAmount = toSafeNumber(
    appliedPromo?.promo_discount_amount,
    appliedPromo ? toSafeNumber(appliedPromo?.discount_amount, 0) : 0,
  );

  const displayPrice = toSafeNumber(
    appliedPromo?.final_amount ?? appliedPromo?.final_price,
    Math.max(0, baseAmount - autoDiscountAmount),
  );

  const hasDiscount = autoDiscountAmount > 0 || promoDiscountAmount > 0;

  const offerRemainingSeconds = isOfferActive && liveOffer?.expires_at
    ? Math.max(0, Math.floor((new Date(liveOffer.expires_at).getTime() - offerNow.getTime()) / 1000))
    : 0;
  const offerHour = Math.floor(offerRemainingSeconds / 3600);
  const offerMinute = Math.floor((offerRemainingSeconds % 3600) / 60);
  const offerSecond = offerRemainingSeconds % 60;

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
      <main className="min-h-screen bg-[#FDFCFB] relative overflow-hidden flex items-center justify-center py-16 px-4">
        {/* Background Blobs for ambiance */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50 rounded-full blur-[80px] opacity-40 translate-y-1/3 -translate-x-1/4" />

        <div className="relative w-full max-w-xl z-10" data-aos="fade-up">
          {/* Header / Breadcrumb-ish */}
          <div className="text-center mb-6">
            <Typography variant="h1" weight="bold" className="text-2xl md:text-[2rem] font-poppins text-gray-900 font-semibold tracking-tight mb-2">
              Review Pesanan
            </Typography>
            <Typography className="text-gray-500 text-[15px] leading-relaxed">
              Pastikan detail paket langganan Anda sudah sesuai
            </Typography>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_16px_45px_-20px_rgba(17,24,39,0.22)] border border-white/70 overflow-hidden">

            {/* Ready to Pay State */}
            {paymentStatus !== 'success' && paymentStatus !== 'failed' && (
              <div>
                {/* Product Summary Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-7 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      {/* <span className="inline-block py-1 px-3 rounded-full bg-orange-100/60 text-[#DB4B24] text-[11px] font-semibold tracking-normal uppercase mb-3">
                        // {product.jenis === 'basic' ? 'Basic Tier' : 'Premium Tier'}
                      </span> */}
                      <Typography variant="h2" weight="bold" className="text-xl md:text-2xl font-poppins text-gray-900 leading-tight">
                        {product.nama}
                      </Typography>
                      <Typography className="text-gray-500 text-[13px] mt-1">
                        Akses Membership {product.masa_aktif} Bulan
                      </Typography>
                    </div>
                    {/* Compact Price */}
                    <div className="text-right">
                      {hasDiscount && (
                        <Typography className="text-sm text-gray-400 line-through decoration-red-300">
                          Rp {baseAmount.toLocaleString('id-ID')}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {isOfferActive && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Flash Sale Akun Baru</p>
                          <p className="text-sm text-amber-900 font-semibold mt-1">
                            Penawaran khusus {liveOffer?.discount_percent || 35}% sudah aktif untuk akun Anda.
                          </p>
                          <p className="text-xs text-amber-700/90 mt-1">
                            Kode otomatis diterapkan. Anda tetap bisa menambahkan kode referral sebagai diskon tambahan.
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/80 px-3 py-2 border border-amber-200 min-w-[128px] text-right">
                          <p className="text-[10px] uppercase tracking-wide text-gray-500">Berakhir dalam</p>
                          <p className="font-mono font-bold text-amber-700 text-sm">
                            {String(offerHour).padStart(2, '0')}:{String(offerMinute).padStart(2, '0')}:{String(offerSecond).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Huge Price Display */}
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-[0.08em]">Total Pembayaran</span>
                    <span className="text-3xl md:text-[2.2rem] leading-none font-bold text-gray-900">
                      <span className="text-lg md:text-xl mr-1 text-gray-700 font-semibold">Rp</span>
                      {displayPrice.toLocaleString('id-ID')}
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

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Masa Aktif</span>
                      </div>
                      <span className="font-semibold text-gray-700">{product.masa_aktif} Bulan</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiSmartphone className="w-4 h-4" />
                        <span>Metode Bayar</span>
                      </div>
                      <span className="font-semibold text-gray-700">QRIS / Transfer / CC</span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-6 mb-6">
                    <Typography className="text-sm font-semibold text-gray-700 mb-1">Pilih Metode Pembayaran (Dicek Otomatis)</Typography>
                    <Typography className="text-xs text-gray-500 mb-3">Tersedia QRIS, Virtual Account, e-wallet, kartu kredit, dan metode lainnya di Midtrans.</Typography>

                    <Typography className="text-sm font-semibold text-gray-700 mb-2">Kode Promo Tambahan (Opsional)</Typography>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                          if (appliedPromo) setAppliedPromo(null);
                        }}
                        placeholder="Masukkan Kode"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FB991A]/40 bg-gray-50 uppercase font-medium text-sm"
                        disabled={promoLoading || paymentStatus === 'creating' || paymentStatus === 'pending'}
                      />
                      <button
                        onClick={handleValidatePromo}
                        disabled={!promoCode || promoLoading || !!appliedPromo || paymentStatus === 'creating' || paymentStatus === 'pending'}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                      >
                        {promoLoading ? <FiLoader className="animate-spin w-5 h-5" /> : appliedPromo ? <FiCheck className="w-5 h-5 text-green-400" /> : 'Terapkan'}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><FiX /> {promoError}</p>}
                    {appliedPromo && <p className="text-green-600 text-xs mt-2 flex items-center gap-1 font-medium"><FiCheck /> Kode promo berhasil diterapkan. Diskon tambahan: Rp {promoDiscountAmount.toLocaleString('id-ID')}</p>}
                  </div>

                  <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                    <Typography className="text-sm font-semibold text-gray-800 mb-3">Detail Transaksi</Typography>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Akses {product.masa_aktif} Bulan</span>
                        <span className="font-medium text-gray-800">Rp {baseAmount.toLocaleString('id-ID')}</span>
                      </div>

                      {autoDiscountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Discount Flash Sale {liveOffer?.discount_percent || 35}% (Spesial Akun Baru)</span>
                          <span className="font-medium">-Rp {autoDiscountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      {promoDiscountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Diskon Kode Promo Tambahan</span>
                          <span className="font-medium">-Rp {promoDiscountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="border-t border-dashed border-gray-300 pt-2 mt-2 flex justify-between text-gray-900 font-bold">
                        <span>Total</span>
                        <span>Rp {displayPrice.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mb-6 border-t border-dashed border-gray-200 relative">
                    <div className="absolute -left-[44px] -top-3 w-6 h-6 bg-[#FDFCFB] rounded-full" />
                    <div className="absolute -right-[44px] -top-3 w-6 h-6 bg-[#FDFCFB] rounded-full" />
                  </div>

                  {/* Payment Action */}
                  <div className="pb-6 space-y-4">
                    <button
                      onClick={() => {
                        if (!snapLoaded || !window.snap) {
                          setErrorMessage('Gagal memuat gateway, silakan refresh.');
                          return;
                        }
                        if (paymentStatus === 'creating' || paymentStatus === 'pending') return;
                        
                        setPaymentStatus('creating');
                        createPaymentMutation.mutate();
                      }}
                      disabled={!snapLoaded || paymentStatus === 'creating' || paymentStatus === 'pending'}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-[#FB991A] to-[#DB4B24] rounded-xl py-4 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <div className="relative flex items-center justify-center gap-2 text-white font-bold text-lg">
                        {snapLoaded && paymentStatus !== 'creating' && paymentStatus !== 'pending' ? (
                          <>
                            <FiCreditCard className="w-5 h-5" />
                            <span>Bayar Sekarang</span>
                          </>
                        ) : (
                          <>
                            <FiLoader className="w-5 h-5 animate-spin" />
                            <span>{paymentStatus === 'creating' ? 'Membuat Tagihan...' : 'Memuat...'}</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => router.push('/products')}
                      className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
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
                    <img src="/images/midtanslogo.svg" alt="Midtrans" className="h-4" />
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
                <Typography variant="h2" className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Terima Kasih!</Typography>
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
                <Typography variant="h2" className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Gagal Memproses</Typography>
                <Typography className="text-gray-500 text-sm mb-4">Terjadi kesalahan pada transaksi.</Typography>
                {errorMessage && (
                  <div className="mb-8 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm max-w-md">
                    {errorMessage}
                  </div>
                )}
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
