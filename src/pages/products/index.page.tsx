import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
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

// Hardcoded product catalog matching the image
// Hardcoded product catalog matching the image
const PRODUCT_CATALOG = [
  {
    id: '102287d5-03ea-4e3f-b84c-a88973104e13',
    nama: 'BISA Basic',
    harga: 49000,
    deskripsi: 'Akses Seluruh Tutorial Beasiswa Dalam Negeri dan Luar Negeri',
    jenis: 'basic',
    masa_aktif: 3,
    features: [
      'Akses Seluruh Tutorial Beasiswa Dalam Negeri dan Luar Negeri',
      'Exclusive E-Book',
      '5x Dreamshub Consultation',
    ],
    tag: 'Best Starter'
  },
  {
    id: 'a5edc065-212f-4ee7-afb3-8481ad577479',
    nama: 'BISA Plus+',
    harga: 169000,
    deskripsi: 'Akses Seluruh Tutorial Beasiswa & Mentoring',
    jenis: 'ideal',
    masa_aktif: 12,
    features: [
      'Akses Seluruh Tutorial Beasiswa Dalam Negeri dan Luar Negeri',
      'Exclusive E-Book',
      'Monthly Live Class with Mentors',
      '10x Dreamshub Consultation',
    ],
    tag: 'Most Popular',
    isPopular: true
  },
  {
    id: 'private',
    nama: 'For Enterprise & Partners',
    harga: 0,
    deskripsi: 'Untuk Sekolah, Yayasan, & Komunitas. Solusi tepat untuk mencetak peraih beasiswa.',
    jenis: 'private',
    masa_aktif: 0,
    features: [
      'Untuk Sekolah, Yayasan, & Komunitas',
      'Akses pendidikan terintegrasi',
      'Pemantauan terukur',
    ],
    tag: 'Exclusive',
    isPremium: true
  }
];

type ProductData = {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string;
  jenis: string;
  masa_aktif: number;
  features?: string[];
  tag?: string;
  isPopular?: boolean;
  isPremium?: boolean;
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

  // Fetch products from backend (optional, use hardcoded as fallback)
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any[] }>('/products/lms');
        const transformed: ProductData[] = response.data.data.map((p: any) => ({
          id: p.id,
          nama: p.name,
          harga: p.harga,
          deskripsi: p.PaketLMS?.[0]?.deskripsi || p.deskripsi || '',
          jenis: p.PaketLMS?.[0]?.name || p.name || '',
          masa_aktif: p.PaketLMS?.[0]?.masa_aktif || p.masa_aktif || 0,
          features: p.features || [],
          tag: p.tag,
          isPopular: p.isPopular,
          isPremium: p.isPremium,
        }));
        return transformed;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Use API data if available, otherwise fallback to local catalog
  // IMPORTANT: Check length > 0 to handle cases where API returns empty array []
  const products = productsData && productsData.length > 0 ? productsData : PRODUCT_CATALOG;

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
      <SEO title="Membership Plans | Raihasa" />
      <main className="min-h-screen bg-[#FAFAFA] relative overflow-hidden font-poppins">

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-[100px] opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
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
        <section className="py-12 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className={`relative p-8 rounded-[2rem] transition-all duration-300 ${product.isPopular
                    ? 'bg-white shadow-2xl border-2 border-[#FB991A] lg:-mt-8 lg:p-10 z-20'
                    : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100 hover:shadow-2xl hover:bg-white'
                    }`}
                >
                  {product.isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-[1.8rem] shadow-lg">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <Typography weight="bold" className={`text-lg mb-2 ${product.isPopular ? 'text-[#FB991A]' : 'text-gray-500'}`}>
                      {product.nama}
                    </Typography>

                    {product.isPremium ? (
                      <Typography variant="h2" weight="bold" className="text-3xl md:text-4xl text-gray-900 mb-2">
                        Hubungi Kami
                      </Typography>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <Typography variant="h2" weight="bold" className="text-4xl md:text-5xl text-gray-900">
                          Rp{product.harga.toLocaleString('id-ID').replace(',', '.')}
                        </Typography>
                        <span className="text-gray-400 font-medium">/{product.masa_aktif}bln</span>
                      </div>
                    )}

                    <Typography className="text-gray-500 mt-3 text-sm leading-relaxed">
                      {product.deskripsi}
                    </Typography>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gray-100 mb-6" />

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {product.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${product.isPopular ? 'bg-orange-100 text-[#FB991A]' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <FiCheck className="w-3 h-3" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectProduct(product.id, product.isPremium)}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${product.isPopular
                      ? 'bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02]'
                      : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-[#FB991A] hover:text-[#FB991A] hover:bg-orange-50'
                      }`}
                  >
                    {isAuthenticated || product.isPremium ? 'Pilih Paket Ini' : 'Login untuk Membeli'}
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className='py-16 md:py-24 bg-white relative z-10'>
          <div className="layout">
            <div className="text-center mb-12" data-aos='fade-up'>
              <Typography variant="h2" weight="bold" className="text-3xl md:text-4xl text-gray-900 mb-3">
                Bandingkan Fitur
              </Typography>
              <Typography className="text-gray-500">
                Detail lengkap fitur yang akan kamu dapatkan
              </Typography>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-5xl mx-auto" data-aos='fade-up'>
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