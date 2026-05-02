import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import 'aos/dist/aos.css';
import Aos from 'aos';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';

// Helper function to get cookie value (works on server and client)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Helper function to check if user is authenticated (CLIENT-SIDE ONLY)
const checkAuthentication = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = getToken();
  if (token) {
    return true;
  }

  const cookieKeys = [
    'token',
    'accessToken',
    'authToken',
    'access_token',
    'jwt',
    'bearerToken',
    'auth_token'
  ];

  for (const key of cookieKeys) {
    const value = getCookie(key);
    if (value) {
      return true;
    }
  }

  try {
    const localStorageKeys = ['token', 'accessToken', 'authToken', 'access_token', 'jwt', 'bearerToken', '@raihasa/token'];

    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }

  return false;
};

// Countdown Timer Component
const CountdownTimer = ({ expiresAt }: { expiresAt?: string | null }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt);

    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();
      if (difference > 0) {
        return {
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        };
      }
      return { h: 0, m: 0, s: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <span className="tabular-nums font-mono font-bold">
      {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
    </span>
  );
};

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

export default function ProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    Aos.init({ once: true, duration: 800 });
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      const authenticated = checkAuthentication();
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, [isMounted]);

  // Fetch products from backend
  const { data: pricingResponse } = useQuery<{ plans: PricingPlan[]; new_user_offer?: { is_active: boolean; expires_at: string | null; discount_percent: number } | null }>({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      try {
        const response = await api.get('/pricing/plans');
        const raw = response.data;
        // Handle both { data: { plans: [...] } } and { plans: [...] } structures
        const result = raw?.data || raw;
        return result?.plans ? result : { plans: result || [] };
      } catch (error) {
        return { plans: [] };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const products = pricingResponse?.plans || [];
  const newUserOffer = pricingResponse?.new_user_offer;
  const isOfferActive = !!newUserOffer?.is_active && !!newUserOffer?.expires_at;

  const handleSelectProduct = (productId: string, isPremium?: boolean) => {
    if (isPremium) {
      const message = encodeURIComponent(`Halo Raih Asa!
Saya tertarik untuk berdiskusi mengenai paket Enterprise/Partnership.

Nama:
Nama Institusi:
Asal Kota Institusi:
Pertanyaan/Kebutuhan:

Terima kasih!`);
      window.open(`https://wa.me/6285117323893?text=${message}`, '_blank');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/payment/checkout?productId=${productId}`);
      return;
    }
    router.push(`/payment/checkout?productId=${productId}`);
  };

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO
        title="Paket Mentoring Beasiswa | Raih Asa"
        description="Pilih paket mentoring beasiswa terbaik. Dapatkan bimbingan intensif persiapan kuliah ke luar negeri, review essay, dan simulasi interview."
        keywords={['paket mentoring beasiswa', 'biaya mentoring beasiswa', 'bimbingan kuliah luar negeri', 'kursus beasiswa']}
      />
      <main className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-[100px] opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
            {isOfferActive && (
              <div className="flex justify-center mb-6" data-aos="fade-down" data-aos-delay="50">
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm">
                  <span className="relative flex h-2.5 w-2.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-medium text-red-700">Flash Sale berakhir dalam:</span>
                  <span className="text-red-600 font-bold"><CountdownTimer expiresAt={newUserOffer?.expires_at} /></span>
                </div>
              </div>
            )}
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-[#FB991A] text-sm font-semibold tracking-wide mb-4 border border-orange-200">
              MEMBERSHIP PLANS
            </span>
            <Typography variant="h3" weight="bold" className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
              Awali langkah
              <span className="bg-gradient-to-r from-[#FB991A] to-[#DB4B24] bg-clip-text text-transparent"> #JadiBisa </span>
              bareng Raih Asa sekarang! <br />

            </Typography>
            <Typography className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Pilih paket yang sesuai dengan kebutuhan belajarmu. Akses materi eksklusif, mentoring, dan komunitas ambis.
            </Typography>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-16 md:py-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {products.map((product, index) => {
                const isPopular = product.is_popular;
                const isEnterprise = product.is_enterprise;
                const isBasic = !isPopular && !isEnterprise;

                let subtitle = product.description || '';

                return (
                  <div
                    key={product.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className={`flex flex-col p-8 rounded-2xl transition-all duration-300 relative group h-full ${isPopular
                      ? 'border-2 border-[#FB991A] bg-[#FFFBF5] shadow-xl scale-[1.02] z-20'
                      : isEnterprise
                        ? 'border border-gray-100 bg-white shadow-sm hover:border-[#1B7691]/30 hover:shadow-xl hover:shadow-blue-500/5'
                        : 'border border-gray-100 bg-white shadow-sm hover:border-[#FB991A]/30 hover:shadow-xl hover:shadow-orange-500/5'
                      }`}
                  >
                    {product.tag && (
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${isPopular ? 'bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white' : 'bg-gray-100 text-gray-700'} text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap`}>
                        {product.tag}
                      </div>
                    )}

                    <div className={`mb-6 ${product.tag ? 'mt-2' : ''}`}>
                      <Typography
                        weight="bold"
                        className={`text-xl font-bold ${isPopular ? 'text-[#DB4B24]' : 'text-gray-900'
                          } ${isBasic ? 'group-hover:text-[#FB991A] transition-all duration-300' : ''}`}
                      >
                        {product.name}
                      </Typography>
                      <p className={`text-sm mt-2 leading-relaxed ${isPopular ? 'text-[#d97706]/80' : 'text-gray-500'}`}>
                        {subtitle}
                      </p>
                    </div>

                    <div className="mb-8 pb-6 border-b border-gray-100">
                      <div className="flex items-baseline gap-1">
                        {isEnterprise ? (
                          <span className="text-2xl font-bold text-gray-900">Custom</span>
                        ) : (
                          <>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-base text-gray-400 line-through mr-2">
                                {Math.floor(product.original_price / 1000)}k
                              </span>
                            )}
                            <span className={`font-bold text-gray-900 ${isPopular ? 'text-4xl' : 'text-3xl'}`}>
                              {Math.floor(product.price / 1000)}k
                            </span>
                            <span className="text-gray-400 text-sm font-medium ml-1">/ {product.duration_months} bulan</span>
                          </>
                        )}
                      </div>
                      {!isEnterprise && product.original_price && product.original_price > product.price && (
                        <div className="mt-3">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${isPopular ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            Hemat {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% {isPopular && "• Offer Ends Soon!"}
                          </span>
                        </div>
                      )}
                      {isEnterprise && <p className="text-sm text-gray-400 mt-2">Harga menyesuaikan kebutuhan</p>}
                    </div>

                    <ul className="space-y-3.5 mb-8 flex-1">
                      {product.features?.map((feature, i) => (
                        <li key={i} className={`flex gap-3 text-sm leading-relaxed ${isPopular ? 'text-gray-800' : 'text-gray-600'}`}>
                          <div className={`mt-0.5 shrink-0 ${isPopular
                            ? 'w-5 h-5 rounded-full bg-[#FB991A] flex items-center justify-center'
                            : ''
                            }`}>
                            {isPopular ? (
                              <FiCheck className="w-3 h-3 text-white" />
                            ) : (
                              <FiCheck className="w-4 h-4 text-[#FB991A]" />
                            )}
                          </div>
                          <span className={isPopular ? 'font-medium' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectProduct(product.id, isEnterprise)}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isPopular
                        ? 'text-white bg-gradient-to-r from-[#FB991A] to-[#DB4B24] hover:shadow-lg hover:shadow-orange-500/30'
                        : isEnterprise
                          ? 'text-[#1B7691] border border-[#1B7691]/20 bg-[#1B7691]/5 hover:bg-[#1B7691] hover:text-white'
                          : 'text-[#FB991A] bg-[#FB991A]/10 hover:bg-[#FB991A] hover:text-white'
                        }`}
                    >
                      {isEnterprise ? (
                        <>
                          <FaWhatsapp className="w-5 h-5" />
                          Hubungi Kami
                        </>
                      ) : (
                        `Pilih Paket`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className='py-16 md:py-20 bg-white relative z-10'>
          <div className="layout">
            <div className="text-center mb-12" data-aos='fade-up'>
              <Typography variant="h2" weight="bold" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Bandingkan Fitur
              </Typography>
              <Typography className="text-base text-gray-600 leading-relaxed">
                Detail lengkap fitur yang akan kamu dapatkan
              </Typography>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto" data-aos='fade-up'>
              {/* Custom Responsive Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-5 font-bold text-gray-900 w-1/3">Fitur Utama</th>
                      <th className="px-6 py-5 font-bold text-gray-900 text-center w-1/5">BISA Basic</th>
                      <th className="px-6 py-5 font-bold text-[#FB991A] text-center w-1/5 bg-orange-50">BISA Plus+</th>
                      <th className="px-6 py-5 font-bold text-gray-900 text-center w-1/5">Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">Akses Video & Berkas</td>
                      <td className="px-6 py-4 text-center"><FiCheck className="mx-auto text-green-500" /></td>
                      <td className="px-6 py-4 text-center bg-orange-50/30"><FiCheck className="mx-auto text-[#FB991A]" /></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300">-</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">Dreamshub Consultation</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">5x</td>
                      <td className="px-6 py-4 text-center font-bold text-[#FB991A] bg-orange-50/30">10x</td>
                      <td className="px-6 py-4 text-center text-green-600 font-bold">Unlimited</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">Durasi Akses</td>
                      <td className="px-6 py-4 text-center text-gray-600">3 Bulan</td>
                      <td className="px-6 py-4 text-center text-[#FB991A] font-bold bg-orange-50/30">12 Bulan</td>
                      <td className="px-6 py-4 text-center text-gray-600">Fleksibel</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">Enterprise Service</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300">-</span></td>
                      <td className="px-6 py-4 text-center bg-orange-50/30"><span className="text-gray-300">-</span></td>
                      <td className="px-6 py-4 text-center"><FiCheck className="mx-auto text-green-500" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>



      </main>
    </Layout>
  );
}