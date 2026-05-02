import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/useAuthStore';
import { User } from '@/types/entities/user';
import { getToken } from '@/lib/cookies';
import { FaWhatsapp } from 'react-icons/fa';

import api from '@/lib/api';

type PricingPlan = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  duration_months: number;
  description: string | null;
  features: string[];
  tag: string | null;
  is_popular: boolean;
  is_enterprise: boolean;
};

type NewUserOfferMeta = {
  code?: string;
  is_active: boolean;
  expires_at: string | null;
  remaining_seconds: number;
  discount_percent: number;
  discount_amount: number;
  plan_discounts?: Record<string, number>;
};

type PricingPlansResponse = {
  plans: PricingPlan[];
  is_new_user: boolean;
  new_user_offer?: NewUserOfferMeta | null;
};

const CountdownTimer: React.FC<{ expiresAt?: string | null }> = ({ expiresAt }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawSeconds = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 1000))
    : 0;

  // Product decision: visual countdown is always shown as a 1-hour urgency window.
  const totalSeconds = Math.min(3600, rawSeconds);

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    <span className="tabular-nums font-mono">
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
};

const PromoPopup: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const user = useAuthStore.useUser() as User | null;

  const { data: pricingData, isLoading: isLoadingPlans } = useQuery<PricingPlansResponse>({
    queryKey: ['pricing-plans-popup', user?.id || 'guest'],
    queryFn: async () => {
      const response = await api.get('/pricing/plans');
      return response.data?.data || { plans: [], is_new_user: false, new_user_offer: null };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const plans = pricingData?.plans || [];
  const newUserOffer = pricingData?.new_user_offer;

  useEffect(() => {
    const sessionKey = `promoPopupShown:${user?.id || 'guest'}`;

    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (alreadyShown) return;

    let timer: NodeJS.Timeout;

    const checkPremiumAndShow = async () => {
      try {
        const token = getToken();
        if (token) {
          // If already active member, do not show popup.
          const subRes = await api.get('/pricing/subscription/status');
          if (subRes.data?.data?.active) {
            sessionStorage.setItem(sessionKey, 'true');
            return;
          }
        }
      } catch (error) {
        console.error("Error checking premium status for popup:", error);
        // On error, we proceed to show popup (safer to show than not)
      }

      if (!newUserOffer?.is_active || !newUserOffer?.expires_at) {
        return;
      }

      // If not premium (or not logged in), show popup after delay
      timer = setTimeout(() => {
        setShowPopup(true);
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem(sessionKey, 'true');
      }, 2000);
    };

    checkPremiumAndShow();

    return () => clearTimeout(timer);
  }, [newUserOffer?.is_active, newUserOffer?.expires_at, user?.id]);

  const handleClose = () => {
    setShowPopup(false);
    document.body.style.overflow = 'unset';
  };

  const handleSelectPlan = (planId: string) => {
    handleClose();
    router.push('/products');
  };

  const handleConsultation = () => {
    const message = encodeURIComponent(`Halo Raih Asa!
Saya tertarik untuk berdiskusi mengenai paket Enterprise/Partnership.

Nama:
Nama Institusi:
Asal Kota Institusi:
Pertanyaan/Kebutuhan:

Terima kasih!`);
    window.open(`https://wa.me/6285117323893?text=${message}`, '_blank');
  };

  if (!showPopup) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}
      >
        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 md:p-8"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>


          <div className="absolute top-4 right-12 z-10 hidden md:flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
            <span className="inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            <span className="text-xs font-medium text-red-600">Promo berakhir dalam: <CountdownTimer expiresAt={newUserOffer?.expires_at} /></span>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 pt-4">
            <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-[#FB991A]/10 to-[#DB4B24]/10 text-[#DB4B24] text-xs font-bold tracking-wider uppercase mb-3 border border-[#FB991A]/20">
              Penawaran Akun Baru
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Awali langkah   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#DB4B24]">#JadiBisa </span>
              bareng Raih Asa sekarang!
            </h2>
            <div className="md:hidden flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 inline-flex">
                <span className="inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                <span className="text-xs font-medium text-red-600">Promo berakhir dalam: <CountdownTimer expiresAt={newUserOffer?.expires_at} /></span>
              </div>
            </div>
            <p className="text-gray-500 text-sm md:text-base">
              Penawaran spesial akun baru berlaku terbatas 1 jam sejak akun aktif. Pilih paket membership yang paling sesuai dengan target beasiswamu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {isLoadingPlans ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="h-[420px] rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
              ))
            ) : (
              plans.map((plan) => {
                const isPopular = plan.is_popular;
                const isEnterprise = plan.is_enterprise;

                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col p-6 rounded-2xl transition-all duration-300 relative h-full ${
                      isPopular
                        ? 'border-2 border-[#FB991A] bg-[#FFFBF5] shadow-lg z-20'
                        : isEnterprise
                        ? 'border border-gray-100 bg-white hover:border-[#1B7691]/30 hover:shadow-md'
                        : 'border border-gray-100 bg-white hover:border-[#FB991A]/30 hover:shadow-md'
                    }`}
                  >
                    {plan.tag && (
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${isPopular ? 'bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white' : 'bg-gray-100 text-gray-700'} text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap`}>
                        {plan.tag}
                      </div>
                    )}

                    <div className={`mb-4 ${plan.tag ? 'mt-2' : ''}`}>
                      <h3 className={`text-xl font-bold ${isPopular ? 'text-[#DB4B24]' : 'text-gray-900'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-xs mt-1 ${isPopular ? 'text-[#d97706]/80' : 'text-gray-500'}`}>
                        {plan.description || (isEnterprise ? 'Untuk Sekolah, Yayasan, & Komunitas' : 'Paket membership Raih Asa')}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        {isEnterprise ? (
                          <span className="text-2xl font-bold text-gray-900">Custom</span>
                        ) : (
                          <>
                            {plan.original_price && plan.original_price > plan.price && (
                              <span className="text-sm text-gray-400 line-through mr-1">
                                {Math.floor(plan.original_price / 1000)}k
                              </span>
                            )}
                            <span className={`font-bold text-gray-900 ${isPopular ? 'text-4xl' : 'text-3xl'}`}>
                              {Math.floor(plan.price / 1000)}k
                            </span>
                            <span className="text-gray-400 text-sm font-medium">/ {plan.duration_months} bulan</span>
                          </>
                        )}
                      </div>

                      {!isEnterprise && plan.original_price && plan.original_price > plan.price && (
                        <div className="mt-1">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${isPopular ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            Hemat {Math.round(((plan.original_price - plan.price) / plan.original_price) * 100)}%
                          </span>
                        </div>
                      )}

                      {isEnterprise && (
                        <p className="text-xs text-gray-400 mt-1">Harga menyesuaikan kebutuhan</p>
                      )}
                    </div>

                    {isEnterprise ? (
                      <div className="flex-1 mb-6 space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Berikan akses pendidikan beasiswa terbaik untuk seluruh siswa atau anak didik Anda secara terintegrasi.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-3 mb-8 flex-1">
                        {(plan.features || []).map((feature, index) => (
                          <li key={index} className={`flex gap-3 text-sm ${isPopular ? 'text-gray-800' : 'text-gray-600'}`}>
                            <div className={`mt-0.5 shrink-0 ${isPopular ? 'w-4 h-4 rounded-full bg-[#FB991A] flex items-center justify-center' : ''}`}>
                              {isPopular ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Check className="w-4 h-4 text-[#FB991A]" />
                              )}
                            </div>
                            <span className={isPopular ? 'font-medium' : ''}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => (isEnterprise ? handleConsultation() : handleSelectPlan(plan.id))}
                      className={isEnterprise
                        ? 'w-full py-3 rounded-xl font-semibold text-[#1B7691] border border-[#1B7691]/20 bg-[#1B7691]/5 hover:bg-[#1B7691] hover:text-white transition-all duration-300 flex items-center justify-center gap-2'
                        : isPopular
                        ? 'w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#FB991A] to-[#DB4B24] hover:shadow-md transition-all duration-300'
                        : 'w-full py-3 rounded-xl font-semibold text-[#FB991A] bg-[#FB991A]/10 hover:bg-[#FB991A] hover:text-white transition-all duration-300'}
                    >
                      {isEnterprise ? (
                        <>
                          <FaWhatsapp className="w-5 h-5" />
                          Hubungi Kami
                        </>
                      ) : (
                        `Pilih ${plan.name}`
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Masih bingung? <a href="https://wa.me/6285117323893" target="_blank" rel="noreferrer" className="text-[#FB991A] hover:underline">Chat Tim Kami</a> untuk konsultasi gratis.
          </p>
        </div>
      </div>
    </>
  );
};

export default PromoPopup;
