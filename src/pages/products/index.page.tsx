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
const PRODUCT_CATALOG = [
  {
    id: 'new-card',
    nama: 'New Card',
    harga: 49000,
    deskripsi: 'Perfect untuk kamu yang baru mulai perjalanan beasiswa',
    jenis: 'basic',
    masa_aktif: 3,
    features: [
      'Akses Video dan berkas',
      '5x Dreamshub Consultation',
    ],
    tag: 'Untuk Pemula'
  },
  {
    id: 'ideal-plan',
    nama: 'Ideal Plan',
    harga: 169000,
    deskripsi: 'Paket lengkap untuk persiapan beasiswa yang serius',
    jenis: 'ideal',
    masa_aktif: 12,
    features: [
      'Akses Video dan berkas',
      '10x Dreamshub Consultation',
    ],
    tag: 'Paling Populer',
    isPopular: true
  },
  {
    id: 'private',
    nama: 'Private Consultation',
    harga: 0,
    deskripsi: 'Konsultasi pribadi langsung via WhatsApp',
    jenis: 'private',
    masa_aktif: 0,
    features: [
      'Private consultation: DM WA',
      'Jadwal fleksibel',
      'Bimbingan personal 1-on-1',
    ],
    tag: 'Premium',
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
    Aos.init({ once: true });
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
        // Use /products/lms endpoint (note: plural 'products')
        const response = await api.get<{ data: any[] }>('/products/lms');
        
        // Transform backend data to match our ProductData type
        const transformed: ProductData[] = response.data.data.map((p: any) => ({
          id: p.id,
          nama: p.name, // Backend uses 'name'
          harga: p.harga,
          deskripsi: p.PaketLMS?.[0]?.deskripsi || p.deskripsi || '',
          jenis: p.PaketLMS?.[0]?.name || p.name || '',
          masa_aktif: p.PaketLMS?.[0]?.masa_aktif || p.masa_aktif || 0,
          features: p.features || [],
          tag: p.tag,
          isPopular: p.isPopular,
          isPremium: p.isPremium,
        }));
        
        // console.log('📦 Products loaded from API:', transformed);
        return transformed;
      } catch (error) {
        // console.warn('⚠️ Failed to fetch products, using hardcoded data');
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Use API data if available, otherwise use hardcoded
  const products = productsData || PRODUCT_CATALOG;

  const handleSelectProduct = (productId: string, isPremium?: boolean) => {
    if (isPremium) {
      // Redirect to WhatsApp for private consultation
      window.open('https://wa.me/YOUR_WHATSAPP_NUMBER?text=Halo, saya tertarik dengan Private Consultation', '_blank');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/payment/checkout?productId=${productId}`);
      return;
    }
    
    // Langsung ke checkout page (no form needed)
    router.push(`/payment/checkout?productId=${productId}`);
  };

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Choose Your Plan | Raihasa" />
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className='pt-20 mt-20 lg:pt-32 lg:mt-0'>
          <div className='layout'>
            <div
              className='w-full text-center bg-gradient-to-r from-[#FB991A] to-[#C0172A] py-5 lg:py-8 shadow-header rounded-lg'
              data-aos='fade-up'
            >
              <Typography variant="h1" weight="bold" className="text-white text-shadow-xl text-2xl lg:text-5xl">
                Pilih Paket Anda
              </Typography>
              <Typography className="text-white mt-2 text-sm lg:text-base">
                Mulai perjalanan beasiswamu dengan paket yang sesuai kebutuhanmu
              </Typography>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className='py-12 lg:py-24'>
          <div className="layout">
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  data-aos='fade-up'
                  data-aos-delay={index * 100}
                  className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    product.isPopular
                      ? 'border-[#FB991A] shadow-xl hover:shadow-2xl hover:-translate-y-2'
                      : 'border-gray-200 hover:border-[#FB991A]/50 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Gradient Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] transition-all duration-300 ${
                    product.isPopular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`} />

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FB991A] to-[#C0172A]" />
                  </div>

                  {/* Popular Badge */}
                  {product.isPopular && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-50">
                      <span className="bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {product.tag}
                      </span>
                    </div>
                  )}

                  <div className="relative p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                      {!product.isPopular && product.tag && (
                        <span className="inline-block text-xs font-bold text-[#FB991A] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full mb-3">
                          {product.tag}
                        </span>
                      )}
                      <Typography variant="h3" weight="bold" className="text-gray-900 mt-2 mb-2 text-xl lg:text-2xl group-hover:text-[#C0172A] transition-colors duration-300">
                        {product.nama}
                      </Typography>
                      <Typography className="text-gray-600 text-sm leading-relaxed">
                        {product.deskripsi}
                      </Typography>
                    </div>

                    {/* Pricing with animation */}
                    <div className="mb-6 pb-6 border-b-2 border-gray-100 group-hover:border-[#FB991A]/20 transition-colors duration-300">
                      {product.isPremium ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FB991A] to-[#C0172A] animate-pulse" />
                            <Typography variant="h2" weight="bold" className="bg-gradient-to-r from-[#FB991A] to-[#C0172A] bg-clip-text text-transparent text-2xl lg:text-3xl">
                              Hubungi Kami
                            </Typography>
                          </div>
                          <Typography className="text-sm text-gray-500 ml-4">
                            Konsultasi personal langsung
                          </Typography>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex items-baseline gap-1 mb-1">
                            <Typography variant="h2" weight="bold" className="text-gray-900 text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300 inline-block">
                              Rp{product.harga.toLocaleString('id-ID')}
                            </Typography>
                          </div>
                          <Typography className="text-sm text-gray-500">
                            untuk {product.masa_aktif} bulan akses
                          </Typography>
                          {/* Price underline animation */}
                          <div className="h-0.5 bg-gradient-to-r from-[#FB991A] to-[#C0172A] w-0 group-hover:w-full transition-all duration-500 mt-2" />
                        </div>
                      )}
                    </div>

                    {/* Features with staggered animation */}
                    <div className="mb-8 space-y-3">
                      {product.features?.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 group/item hover:translate-x-1 transition-transform duration-200"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <div className="relative flex-shrink-0">
                            <FiCheck className="text-[#FB991A] w-5 h-5 mt-0.5 relative z-10" />
                            <div className="absolute inset-0 bg-orange-100 rounded-full scale-0 group-hover/item:scale-150 transition-transform duration-300 opacity-50" />
                          </div>
                          <Typography className="text-sm text-gray-700 leading-snug group-hover/item:text-gray-900 transition-colors duration-200">
                            {feature}
                          </Typography>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button with gradient hover */}
                    <button
                      onClick={() => handleSelectProduct(product.id, product.isPremium)}
                      className={`relative w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm overflow-hidden group/btn ${
                        product.isPopular
                          ? 'bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 text-white hover:bg-gradient-to-r hover:from-[#FB991A] hover:to-[#C0172A]'
                      }`}
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      
                      <span className="relative z-10">
                        {isAuthenticated || product.isPremium ? 'Pilih Paket' : 'Login untuk Beli'}
                      </span>
                      <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300 relative z-10" />
                    </button>

                    {/* Corner decoration */}
                    <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#FB991A]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      product.isPopular ? 'opacity-50' : ''
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className='py-12 lg:py-24 bg-gradient-to-b from-gray-50 to-white'>
          <div className="layout">
            <div className="text-center mb-8 lg:mb-12" data-aos='fade-up'>
              <Typography variant="h2" weight="bold" className="text-gray-900 mb-2 text-2xl lg:text-4xl">
                Perbandingan Paket
              </Typography>
              <Typography className="text-gray-600 text-sm lg:text-base">
                Lihat detail lengkap untuk memilih yang terbaik
              </Typography>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 max-w-5xl mx-auto" data-aos='fade-up' data-aos-delay='200'>
              {/* Gradient top border */}
              <div className="h-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A]" />
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-orange-50/30 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900">
                        Fitur
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center font-bold text-gray-900">
                        New Card
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center font-bold text-white bg-gradient-to-r from-[#FB991A] to-[#C0172A]">
                        Ideal Plan
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center font-bold text-gray-900">
                        Private
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-orange-50/30 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 text-gray-700 font-medium">Akses Video & Berkas</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                          <FiCheck className="w-5 h-5 text-green-600" />
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center bg-orange-50/50">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FB991A]/20">
                          <FiCheck className="w-5 h-5 text-[#C0172A]" />
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="text-gray-300 text-lg">—</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-orange-50/30 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 text-gray-700 font-medium">Dreamshub Consultation</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">5x</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center bg-orange-50/50">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white rounded-full font-bold text-xs shadow-md">10x</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs">Unlimited</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-orange-50/30 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 text-gray-700 font-medium">Masa Aktif</td>
                      <td className="px-4 lg:px-6 py-4 text-center text-gray-700">3 bulan</td>
                      <td className="px-4 lg:px-6 py-4 text-center text-gray-700 bg-orange-50/50 font-semibold">12 bulan</td>
                      <td className="px-4 lg:px-6 py-4 text-center text-gray-700">Fleksibel</td>
                    </tr>
                    <tr className="hover:bg-orange-50/30 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 text-gray-700 font-medium">Private WhatsApp</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className="text-gray-300 text-lg">—</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center bg-orange-50/50">
                        <span className="text-gray-300 text-lg">—</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                          <FiCheck className="w-5 h-5 text-green-600" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='py-12 lg:py-24'>
          <div className="layout">
            <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-10 shadow-xl overflow-hidden max-w-5xl mx-auto group" data-aos='fade-up'>
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FB991A]/5 via-[#C0172A]/5 to-[#FB991A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A]" />
              
              <div className="relative grid md:grid-cols-3 gap-8 md:gap-0 md:divide-x-2 divide-gray-200">
                <div className="px-4 lg:px-8 text-center group/stat hover:scale-105 transition-transform duration-300">
                  <Typography variant="h2" weight="bold" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#C0172A] mb-2 text-3xl lg:text-4xl">
                    500+
                  </Typography>
                  <Typography className="text-sm lg:text-base text-gray-600">
                    Beasiswa Terdaftar
                  </Typography>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FB991A] to-[#C0172A] mx-auto mt-3 rounded-full opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="px-4 lg:px-8 text-center group/stat hover:scale-105 transition-transform duration-300">
                  <Typography variant="h2" weight="bold" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#C0172A] mb-2 text-3xl lg:text-4xl">
                    1,000+
                  </Typography>
                  <Typography className="text-sm lg:text-base text-gray-600">
                    Siswa Terbantu
                  </Typography>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FB991A] to-[#C0172A] mx-auto mt-3 rounded-full opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="px-4 lg:px-8 text-center group/stat hover:scale-105 transition-transform duration-300">
                  <Typography variant="h2" weight="bold" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#C0172A] mb-2 text-3xl lg:text-4xl">
                    24/7
                  </Typography>
                  <Typography className="text-sm lg:text-base text-gray-600">
                    Dukungan Tersedia
                  </Typography>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FB991A] to-[#C0172A] mx-auto mt-3 rounded-full opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}