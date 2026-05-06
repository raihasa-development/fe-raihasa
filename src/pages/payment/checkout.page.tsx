import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from '@/layouts/Layout';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';
import { FiCheck, FiClock, FiX, FiLoader, FiCreditCard, FiShield, FiArrowLeft } from 'react-icons/fi';

type ProductData = {
  id: string;
  nama: string;
  harga: number;
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
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoPreview | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [offerNow, setOfferNow] = useState(new Date());

  const toSafeNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') { const p = Number(value); if (Number.isFinite(p)) return p; }
    return fallback;
  };

  const handleValidatePromo = async () => {
    if (!promoCode || !product) return;
    const autoCode = product.new_user_offer?.code?.toUpperCase();
    if (autoCode && promoCode.toUpperCase() === autoCode) {
      setPromoError('Kode ini otomatis diterapkan untuk akun baru. Gunakan kode referral lain.');
      setAppliedPromo(null);
      return;
    }
    setPromoLoading(true);
    setPromoError('');
    try {
      const token = getToken();
      const res = await api.post('/pricing/validate-promo', { code: promoCode, plan_id: product.id }, { headers: { Authorization: `Bearer ${token}` } });
      const d = res.data?.data || {};
      const disc = toSafeNumber(d.discount_amount, 0);
      setAppliedPromo({
        ...d,
        discount_amount: disc,
        auto_discount_amount: toSafeNumber(d.auto_discount_amount, 0),
        promo_discount_amount: toSafeNumber(d.promo_discount_amount, disc),
        base_amount: toSafeNumber(d.base_amount, product.harga),
        final_amount: toSafeNumber(d.final_amount ?? d.final_price, product.harga),
      });
    } catch (e: any) {
      setPromoError(e.response?.data?.message || 'Kode promo tidak valid');
      setAppliedPromo(null);
    } finally { setPromoLoading(false); }
  };

  useEffect(() => {
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const snapScript = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    if (!clientKey) { setErrorMessage('Midtrans client key tidak dikonfigurasi'); return; }
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => setSnapLoaded(true);
    script.onerror = () => setErrorMessage('Gagal memuat script pembayaran');
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-checkout', productId],
    queryFn: async () => {
      if (!productId) return null;
      try {
        const res = await api.get<{ data: any }>(`/pricing/plans/${productId}`);
        const plan = res.data.data;
        if (!plan) return null;
        return { id: plan.id, nama: plan.name, harga: toSafeNumber(plan.price, 0), deskripsi: plan.description || '', masa_aktif: toSafeNumber(plan.duration_months, 0), jenis: plan.is_enterprise ? 'private' : (plan.is_popular ? 'ideal' : 'basic'), new_user_offer: plan.new_user_offer } as ProductData;
      } catch { return null; }
    },
    enabled: !!productId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await api.post('/pricing/payments/create', { plan_id: product?.id, promo_code: appliedPromo ? promoCode : undefined }, { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    },
    onSuccess: (data) => {
      setPaymentStatus('pending');
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result: any) => router.push(`/payment/success?orderId=${result.order_id || data.order_id}&amount=${displayPrice}`),
          onPending: () => setErrorMessage('Menunggu pembayaran...'),
          onError: (result: any) => { setErrorMessage(result?.status_message || 'Pembayaran gagal.'); setPaymentStatus('failed'); },
          onClose: () => setPaymentStatus('idle'),
        });
      }
    },
    onError: (error: any) => { setPaymentStatus('failed'); setErrorMessage(error.response?.data?.message || 'Gagal memproses pembayaran'); },
  });

  useEffect(() => { const t = setInterval(() => setOfferNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const liveOffer = product?.new_user_offer;
  const isOfferActive = !!liveOffer?.is_active && !!liveOffer?.expires_at && new Date(liveOffer.expires_at) > offerNow;
  const baseAmount = toSafeNumber(appliedPromo?.base_amount, toSafeNumber(product?.harga, 0));
  const autoDiscount = toSafeNumber(appliedPromo?.auto_discount_amount, isOfferActive ? toSafeNumber(liveOffer?.discount_amount, 0) : 0);
  const promoDiscount = toSafeNumber(appliedPromo?.promo_discount_amount, appliedPromo ? toSafeNumber(appliedPromo?.discount_amount, 0) : 0);
  const displayPrice = toSafeNumber(appliedPromo?.final_amount ?? appliedPromo?.final_price, Math.max(0, baseAmount - autoDiscount));
  const hasDiscount = autoDiscount > 0 || promoDiscount > 0;
  const offerSec = isOfferActive && liveOffer?.expires_at ? Math.max(0, Math.floor((new Date(liveOffer.expires_at).getTime() - offerNow.getTime()) / 1000)) : 0;
  const oh = Math.floor(offerSec / 3600), om = Math.floor((offerSec % 3600) / 60), os = offerSec % 60;

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const isProcessing = paymentStatus === 'creating' || paymentStatus === 'pending';

  if (productLoading || !product) {
    return (
      <Layout withNavbar withFooter>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <FiLoader className="w-8 h-8 text-gray-300 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <Layout withNavbar withFooter>
        <SEO title="Pembayaran Berhasil | Raihasa" />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Pembayaran Berhasil</h1>
            <p className="text-sm text-gray-500 mb-6">Membership Anda telah aktif.</p>
            <button onClick={() => router.push('/home')} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all duration-300">
              Ke Dashboard
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Layout withNavbar withFooter>
        <SEO title="Pembayaran Gagal | Raihasa" />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Gagal Memproses</h1>
            <p className="text-sm text-gray-500 mb-2">Terjadi kesalahan pada transaksi.</p>
            {errorMessage && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-6">{errorMessage}</p>}
            <button onClick={() => { setErrorMessage(''); setPaymentStatus('idle'); createPaymentMutation.reset(); }} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all duration-300">
              Coba Lagi
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout withNavbar withFooter>
      <SEO title={`Checkout - ${product.nama} | Raihasa`} />
      <main className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <button onClick={() => router.push('/products')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-all duration-300">
            <FiArrowLeft className="w-4 h-4" /> Kembali ke pilihan paket
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* LEFT: Order details (3 cols) */}
            <div className="lg:col-span-3 space-y-4">

              {/* Product card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">{product.nama}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Akses {product.masa_aktif} bulan</p>
                  </div>
                  <div className="text-right">
                    {hasDiscount && <p className="text-sm text-gray-400 line-through">{fmt(baseAmount)}</p>}
                    <p className="text-2xl font-bold text-gray-900">{fmt(displayPrice)}</p>
                  </div>
                </div>
                {product.deskripsi && (
                  <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{product.deskripsi}</p>
                )}
              </div>

              {/* Flash sale banner */}
              {isOfferActive && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Flash Sale Akun Baru</p>
                    <p className="text-sm text-amber-900 mt-0.5">Diskon {liveOffer?.discount_percent || 35}% otomatis diterapkan</p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-1.5 border border-amber-200 text-center shrink-0">
                    <p className="text-[10px] text-gray-400 uppercase">Sisa waktu</p>
                    <p className="font-mono font-bold text-amber-700 text-sm">{String(oh).padStart(2,'0')}:{String(om).padStart(2,'0')}:{String(os).padStart(2,'0')}</p>
                  </div>
                </div>
              )}

              {/* Promo code */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Kode Promo (Opsional)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); if (appliedPromo) setAppliedPromo(null); }}
                    placeholder="Masukkan kode"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all duration-300"
                    disabled={promoLoading || isProcessing}
                  />
                  <button
                    onClick={handleValidatePromo}
                    disabled={!promoCode || promoLoading || !!appliedPromo || isProcessing}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center"
                  >
                    {promoLoading ? <FiLoader className="animate-spin w-4 h-4" /> : appliedPromo ? <FiCheck className="w-4 h-4 text-green-400" /> : 'Pakai'}
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><FiX className="w-3 h-3" /> {promoError}</p>}
                {appliedPromo && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><FiCheck className="w-3 h-3" /> Diskon {fmt(promoDiscount)} diterapkan</p>}
              </div>

              {/* Transaction detail */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Rincian Pembayaran</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{product.nama} ({product.masa_aktif} bln)</span>
                    <span className="text-gray-700 font-medium">{fmt(baseAmount)}</span>
                  </div>
                  {autoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Flash Sale {liveOffer?.discount_percent || 35}%</span>
                      <span>-{fmt(autoDiscount)}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Kode Promo</span>
                      <span>-{fmt(promoDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-2 mt-1 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{fmt(displayPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Payment action (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:sticky lg:top-28 space-y-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Bayar</p>
                  <p className="text-3xl font-bold text-gray-900">{fmt(displayPrice)}</p>
                </div>

                <button
                  onClick={() => {
                    if (!snapLoaded || !window.snap) { setErrorMessage('Gagal memuat gateway, silakan refresh.'); return; }
                    if (isProcessing) return;
                    setPaymentStatus('creating');
                    createPaymentMutation.mutate();
                  }}
                  disabled={!snapLoaded || isProcessing}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 disabled:opacity-60"
                >
                  {!isProcessing ? <><FiCreditCard className="w-4 h-4" /> Bayar Sekarang</> : <><FiLoader className="w-4 h-4 animate-spin" /> {paymentStatus === 'creating' ? 'Membuat Tagihan...' : 'Memuat...'}</>}
                </button>

                {errorMessage && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">{errorMessage}</p>}

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <FiShield className="w-3.5 h-3.5 shrink-0" />
                    <span>Pembayaran terenkripsi SSL</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <FiClock className="w-3.5 h-3.5 shrink-0" />
                    <span>Akses langsung aktif setelah bayar</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 opacity-40">
                  <img src="/images/midtanslogo.svg" alt="Midtrans" className="h-3" />
                  <span className="text-[9px] text-gray-400">Secured Payment</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
