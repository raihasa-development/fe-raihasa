'use client';

import 'aos/dist/aos.css';
import 'swiper/css';
import 'swiper/css/navigation';


import Link from 'next/link';
import { motion } from 'framer-motion';
import Aos from 'aos';
import React, { useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import PromoPopup from '@/components/Popups/PromoPopups';
import ProgramCardLanding from '@/components/card/ProgramCardLanding';
import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import { NumberTicker } from '@/components/TextCustom/NumberTicker';
import { VelocityScroll } from '@/components/TextCustom/ScrollBasedVelocity';
import SparklesText from '@/components/TextCustom/SparklesText';
import Typography from '@/components/Typography';
import { TESTIMONIALS } from '@/contents/landing';
import { sponsorList } from '@/contents/sponsor';
import Layout from '@/layouts/Layout';
import { useRouter } from 'next/router';
import { getToken } from '@/lib/cookies';
import api from '@/lib/api';
import { FiPlay, FiStar, FiClock, FiBookOpen, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';

export default function Home() {
  const aboutRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [previewCourses, setPreviewCourses] = React.useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(true);
  const [pricingPlans, setPricingPlans] = React.useState<any[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = React.useState(true);
  const [selectedPreviewCourse, setSelectedPreviewCourse] = React.useState<any | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = React.useState('scholra');

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

    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/payment/checkout?productId=${productId}`);
      return;
    }
    router.push(`/payment/checkout?productId=${productId}`);
  };

  // Animation Refs
  const pillRef = useRef<HTMLDivElement>(null);
  const titleSmallRef = useRef<HTMLDivElement>(null);
  const titleMainRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const imageDesktopRef = useRef<HTMLDivElement>(null);
  const imageMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Aos.init({
      once: true,
      duration: 800,
      easing: 'ease-out-cubic',
    });

    const fetchPreviewCourses = async () => {
      try {
        const response = await api.get('/lms/modul');
        const dataArray = response.data.data || [];
        setPreviewCourses(dataArray.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch preview courses', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    const fetchPricingPlans = async () => {
      try {
        const response = await api.get('/pricing/plans');
        const raw = response.data;
        const result = raw?.data || raw;
        const plans = result?.plans || result || [];
        setPricingPlans(plans);
      } catch (error) {
        console.error('Failed to fetch pricing plans', error);
      } finally {
        setIsLoadingPricing(false);
      }
    };

    fetchPreviewCourses();
    fetchPricingPlans();
  }, []);

  return (
    <Layout withNavbar={true} withFooter={true}>
      {/* Top WhatsApp Community Announcement Banner */}
      <div className='fixed top-0 inset-x-0 z-[110] h-10 bg-gradient-to-r from-[#25D366] to-[#1B7691] flex items-center justify-center text-white text-xs md:text-sm font-semibold shadow-sm px-4'>
        <a
          href='https://whatsapp.com/channel/0029VbAylifBA1euNUV6LN09'
          target='_blank'
          rel='noreferrer'
          className='flex items-center gap-2 hover:underline'
        >
          <FaWhatsapp className='w-4 h-4 text-white' />
          <span>Ayo join Community bareng 66 ribu Peraih Asa Lainnya!</span>
          <span className='inline-block px-2 py-0.5 ml-1 text-[10px] font-bold uppercase bg-white/20 rounded border border-white/30 backdrop-blur-sm'>
            Join
          </span>
        </a>
      </div>

      <SEO title='Home' />
      <PromoPopup />

      {/* Floating WhatsApp Button */}
      <a
        href='https://wa.me/6285117323893?text=Halo%20Kak%20Admin%20Raih%20Asa!%0AAku%20mau%20tanya-tanya%20soal%20paket%2Fbimbingan%20beasiswanya%20dong.%0A%0ANama%3A%20%0AAsal%20Univ%2FSekolah%3A%0APertanyaan%3A%0A%0AMakasih%20Kak!'
        target='_blank'
        rel='noreferrer'
        className='fixed z-[999] bottom-6 right-6 md:bottom-10 md:right-10 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-110 cursor-pointer'
        title='Hubungi Kami di WhatsApp'
      >
        <FaWhatsapp className='w-8 h-8 text-white md:w-10 md:h-10' />
      </a>

      <main className='scroll-smooth overflow-hidden bg-[#fff]'>
        <section className='relative min-h-screen pt-8 pb-16 md:pt-12 md:pb-24 mt-16 md:mt-20'>
          {/* Main Hero Content */}
          <div className='container relative z-20 grid grid-cols-1 gap-8 px-4 mx-auto md:px-10 xl:grid-cols-2 xl:gap-16 place-items-center'>
            {/* Left Column - Text Content */}
            <div className='flex flex-col items-center order-2 w-full max-w-2xl gap-5 xl:order-1 xl:items-start md:gap-6'>

              {/* Awards Badges - Horizontal Pills */}
              <div className='flex flex-wrap items-center justify-center gap-2 md:gap-3 xl:justify-start' data-aos='fade-down' data-aos-delay='0'>
                <div className='flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300'>
                  <div className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500'>
                    <svg className='w-3 h-3 md:w-3.5 md:h-3.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  </div>
                  <span className='text-[10px] md:text-xs font-bold text-yellow-700'>#1 EdTech Indonesia</span>
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300'>
                  <div className='flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500'>
                    <svg className='w-3 h-3 md:w-3.5 md:h-3.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <span className='text-[10px] md:text-xs font-bold text-blue-700'>Dikti Verified</span>
                </div>
              </div>

              {/* Pill Badge - Counting */}
              <div
                ref={pillRef}
                data-aos='fade-up'
                data-aos-delay='100'
                className='flex items-center gap-3 px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-md bg-white border border-gray-200 w-fit'
              >
                <div className='flex -space-x-2'>
                  <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center'>
                    <span className='text-[10px] text-white font-bold'>👨</span>
                  </div>
                  <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 border-2 border-white flex items-center justify-center'>
                    <span className='text-[10px] text-white font-bold'>👩</span>
                  </div>
                  <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white flex items-center justify-center'>
                    <span className='text-[10px] text-white font-bold'>🎓</span>
                  </div>
                </div>
                <Typography className='text-xs md:text-sm text-gray-700 font-medium'>
                  Gabung bareng <NumberTicker value={100} suffix='+' className='!text-[#FB991A] font-extrabold' /> awardee di Indonesia
                </Typography>
              </div>

              {/* Tagline */}
              <div ref={titleSmallRef} data-aos='fade-up' data-aos-delay='200'>
                <Typography
                  variant='h5'
                  weight='regular'
                  className='text-base md:text-lg lg:text-xl text-[#1B7691] text-center xl:text-left font-medium'
                >
                  <i>Temukan kesempatan, wujudkan impian</i>
                </Typography>
              </div>

              {/* Main Headline */}
              <div ref={titleMainRef} data-aos='fade-up' data-aos-delay='300'>
                <Typography
                  as='h1'
                  className='font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#FB991A] leading-tight text-center xl:text-left'
                >
                  Raih Beasiswa Impianmu dengan Lebih Mudah
                </Typography>
              </div>

              {/* Description */}
              <div ref={descRef} data-aos='fade-up' data-aos-delay='400'>
                <Typography
                  className='text-sm md:text-base lg:text-lg text-[#1B7691]/80 text-center xl:text-left leading-relaxed max-w-lg'
                >
                  Jelajahi kesempatan beasiswa terbaik dari seluruh Indonesia dan
                  dunia. Temukan peluang pendidikan yang sesuai dengan passion dan
                  cita-citamu!
                </Typography>
              </div>

              {/* CTA Section */}
              <div className='flex flex-col items-center w-full gap-4 mt-2 xl:items-start md:mt-4' ref={btnRef} data-aos='fade-up' data-aos-delay='500'>
                <ButtonLink
                  href='/products'
                  variant='unstyled'
                  size='lg'
                  className='group'
                >
                  <div className='flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-gradient-to-r from-[#1B7691] to-[#0e5c71] rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#1B7691]/30 transition-all duration-300 hover:scale-105'>
                    Daftar BISA Membership
                    <FaArrowRightLong className='transition-transform duration-300 group-hover:translate-x-1' />
                  </div>
                </ButtonLink>

                {/* Trusted By Section */}
                <div className='flex items-center gap-3 mt-2'>
                  <div className='flex -space-x-2'>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center'>
                      <span className='text-[10px] text-white'>👨‍🎓</span>
                    </div>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white shadow-sm flex items-center justify-center'>
                      <span className='text-[10px] text-white'>👩‍🎓</span>
                    </div>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white shadow-sm flex items-center justify-center'>
                      <span className='text-[10px] text-white'>👨‍👩‍👧</span>
                    </div>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold'>
                      +99k
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <Typography className='text-sm md:text-base font-semibold text-gray-700'>
                      <span className='text-[#FB991A] font-bold'>100k+</span> sudah bergabung
                    </Typography>
                    <Typography className='text-[10px] md:text-xs text-gray-500'>
                      Students, Parents, and Partners
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='relative order-1 w-full max-w-lg mx-auto xl:order-2 xl:max-w-none flex flex-col items-center xl:sticky xl:top-28'
            >
              <div ref={imageDesktopRef} className='hidden xl:block'>
                <NextImage
                  src='/images/landing/haira-hero-desktop.png'
                  width={590}
                  height={625}
                  quality={100}
                  alt='Haira Raih Asa'
                  className='w-full h-auto drop-shadow-2xl animate-float'
                  priority
                />
              </div>

              <div ref={imageMobileRef} className='block xl:hidden'>
                <NextImage
                  src='/images/landing/haira-hero-mobile.png'
                  width={295}
                  height={328}
                  quality={100}
                  alt='Haira Raih Asa'
                  className='w-full max-w-sm mx-auto drop-shadow-xl animate-float'
                  imgClassName='w-auto h-auto object-contain'
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Background Decorations */}
          <NextImage
            src={'/images/landing/hero-b.png'}
            width={264}
            height={264}
            quality={100}
            alt='Haira Raih Asa'
            className='absolute bottom-0 left-0 w-1/3 md:w-[220px] z-10'
            data-aos='fade-right'
          />
          <NextImage
            src={'/images/landing/bg-bot-hero-desktop.png'}
            width={1440}
            height={540}
            quality={100}
            priority
            alt='Haira Raih Asa'
            className='absolute inset-x-0 bottom-0 z-0 hidden w-full md:block'
            imgClassName='object-cover w-full h-full'
            data-aos='fade-right'
          />
          <NextImage
            src={'/images/landing/bg-bot-hero-mobile.png'}
            width={425}
            height={722}
            quality={100}
            priority
            alt='Haira Raih Asa'
            className='absolute inset-x-0 bottom-0 z-0 block w-full md:hidden'
            imgClassName='object-cover w-full h-full'
            data-aos='fade-right'
          />

        </section>

        <section
          className='bg-[#4EA4BE] relative pt-32 pb-24 z-20'
          ref={aboutRef}
        >
          <div className='flex absolute top-0 rotate-3 md:-rotate-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] w-full py-5 justify-center gap-8 shadow-[0_62px_26px_0_rgba(0,0,0,0.20)]'>
            <VelocityScroll
              text=' KENAPA HARUS RAIH ASA ?'
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl md:text-5xl whitespace-nowrap opacity-60'
            />
          </div>
          <div className='flex absolute top-0 -rotate-3 md:rotate-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] w-full py-5 justify-center gap-8 shadow-[0_62px_26px_0_rgba(0,0,0,0.20)]'>
            <VelocityScroll
              text=' KENAPA HARUS RAIH ASA ?'
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl md:text-5xl whitespace-nowrap opacity-60'
            />
            <VelocityScroll
              text=' KENAPA HARUS RAIH ASA ?'
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl md:text-5xl whitespace-nowrap opacity-80'
            />
            <VelocityScroll
              text=' KENAPA HARUS RAIH ASA ?'
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl md:text-5xl whitespace-nowrap opacity-60'
            />
          </div>
          {/* <div className='relative px-4 mt-12 top-1/3'>
            <div className='flex flex-row flex-wrap justify-center gap-5 '>
              {WHY_US_CARD.map((card, index) => {
                return (
                  <div
                    key={index}
                    data-aos='fade-right'
                    data-aos-delay={400 * (index + 1)}
                    className='flex flex-col w-[329px] p-4 items-center bg-primary-white rounded-[16px] shadow-md'
                  >
                    <div className='flex flex-col items-center self-stretch gap-4'>
                      <div
                        className={`${card.color2} flex items-center gap-3 self-stretch rounded-[8px] pr-4`}
                      >
                        <div
                          className={`${card.color} flex w-12 h-[74px] p-[10px] justify-center items-center gap-[10px] rounded-[8px]`}
                        >
                          <card.link_icon className='w-8 h-8 text-primary-light' />
                        </div>
                        <Typography className='text-[#272D4E] text-xl font-[700] tracking-[2px] leading-6'>
                          {card.title}
                        </Typography>
                      </div>
                      <Typography className='text-base font-[400] tracking-[1px] leading-6'>
                        {card.description}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div> */}
        </section>

        <section className='relative px-4 md:px-10 py-16 md:py-20'>
          <div className='container mx-auto max-w-6xl'>
            {/* Section Header */}
            <div className='text-center mb-14 md:mb-20' data-aos='fade-up'>
              <Typography className='text-sm md:text-base font-medium text-[#1B7691] uppercase tracking-widest mb-3'>
                Ekosistem Beasiswa Terlengkap
              </Typography>
              <Typography as='h2' className='text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight'>
                Semua yang Kamu Butuhkan untuk
                <span className='block text-[#FB991A]'>Raih Beasiswa Impian</span>
              </Typography>
            </div>

            {/* Program Cards - 3 Column Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>

              {/* Card 1 - Scholra */}
              <Link
                href='/scholra'
                className='block bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#1B7691]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                data-aos='fade-up'
              >
                <div className='w-14 h-14 rounded-xl bg-[#1B7691] flex items-center justify-center mb-5'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <span className='text-[#1B7691] text-xs font-medium bg-[#1B7691]/10 px-2 py-1 rounded'>AI</span>
                <Typography className='text-xl font-bold text-gray-900 mt-3 mb-2'>
                  Scholra
                </Typography>
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4 max-w-prose'>
                  Asisten cerdas yang menganalisis profilmu dan merekomendasikan beasiswa paling sesuai. Hemat waktu riset dengan rekomendasi personal.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#1B7691] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Pelajari <FaArrowRightLong className='text-xs' />
                </span>
              </Link>

              {/* Card 3 - BISA Learning */}
              <Link
                href='/bisa-learning'
                className='block bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#1B7691]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                data-aos='fade-up'
                data-aos-delay='200'
              >
                <div className='w-14 h-14 rounded-xl bg-[#1B7691] flex items-center justify-center mb-5'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                </div>
                <span className='text-[#1B7691] text-xs font-medium bg-[#1B7691]/10 px-2 py-1 rounded'>Video & E-book</span>
                <Typography className='text-xl font-bold text-gray-900 mt-3 mb-2'>
                  BISA Learning
                </Typography>
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4 max-w-prose'>
                  Akses ratusan video tutorial dan e-book persiapan beasiswa. Dari CV, motivation letter, hingga interview.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#1B7691] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Akses <FaArrowRightLong className='text-xs' />
                </span>
              </Link>

              {/* Card 2 - Dreamshub */}
              <Link
                href='/dreamshub'
                className='block bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#FB991A]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                data-aos='fade-up'
                data-aos-delay='100'
              >
                <div className='w-14 h-14 rounded-xl bg-[#FB991A] flex items-center justify-center mb-5'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <span className='text-[#FB991A] text-xs font-medium bg-[#FB991A]/10 px-2 py-1 rounded'>Forum</span>
                <Typography className='text-xl font-bold text-gray-900 mt-3 mb-2'>
                  Dreamshub
                </Typography>
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4 max-w-prose'>
                  Komunitas eksklusif untuk konsultasi langsung dengan mentor dan awardee. Dapat feedback real dan tips praktis.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#FB991A] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Gabung <FaArrowRightLong className='text-xs' />
                </span>
              </Link>
            </div>

            {/* Interactive Feature Showcase Section */}
            <div className='mt-16 bg-gradient-to-br from-[#1B7691]/5 to-[#FB991A]/5 rounded-3xl p-6 md:p-10 border border-gray-100 shadow-inner' data-aos='fade-up'>
              <div className='text-center mb-8'>
                <span className='text-xs font-bold text-[#FB991A] uppercase tracking-wider bg-[#FB991A]/10 px-3 py-1 rounded-full'>
                  Interactive Demo
                </span>
                <Typography as='h3' className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>
                  Lihat Bagaimana Fitur Kami Membantumu
                </Typography>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
                {/* Tab Controls - Left 4 Columns */}
                <div className='lg:col-span-4 flex flex-col gap-3'>
                  {[
                    {
                      id: 'scholra',
                      title: 'Scholra AI',
                      tag: 'AI Assistant',
                      desc: 'Analisis profil instan & rekomendasi beasiswa personal.',
                      color: 'border-[#1B7691]',
                      bg: 'bg-[#1B7691]/10',
                      text: 'text-[#1B7691]',
                    },
                    {
                      id: 'bisa-learning',
                      title: 'BISA Learning',
                      tag: 'Learning Hub',
                      desc: 'Ratusan materi video premium dan e-book lolos beasiswa.',
                      color: 'border-[#1B7691]',
                      bg: 'bg-[#1B7691]/10',
                      text: 'text-[#1B7691]',
                    },
                    {
                      id: 'dreamshub',
                      title: 'Dreamshub',
                      tag: 'Forum & Mentor',
                      desc: 'Tanya jawab langsung dengan mentor dan review dokumen.',
                      color: 'border-[#FB991A]',
                      bg: 'bg-[#FB991A]/10',
                      text: 'text-[#FB991A]',
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFeatureTab(tab.id)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 ${activeFeatureTab === tab.id
                        ? `bg-white border-gray-200 shadow-md scale-[1.02] ${tab.color}`
                        : 'bg-transparent border-transparent hover:bg-white/50'
                        }`}
                    >
                      <div className='flex justify-between items-center mb-1'>
                        <span className='font-bold text-gray-900 text-lg'>{tab.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tab.bg} ${tab.text}`}>
                          {tab.tag}
                        </span>
                      </div>
                      <p className='text-sm text-gray-500 leading-relaxed'>{tab.desc}</p>
                    </button>
                  ))}
                </div>

                {/* macOS Browser Mockup - Right 8 Columns */}
                <div className='lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[400px] md:h-[450px] relative transition-all duration-500'>
                  {/* macOS Header */}
                  <div className='bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0'>
                    <div className='flex items-center gap-1.5'>
                      <span className='w-3 h-3 rounded-full bg-red-400'></span>
                      <span className='w-3 h-3 rounded-full bg-yellow-400'></span>
                      <span className='w-3 h-3 rounded-full bg-green-400'></span>
                    </div>
                    <div className='bg-white border border-gray-200 rounded-md py-1 px-8 text-[11px] text-gray-400 font-mono w-1/2 text-center select-none truncate'>
                      raihasa.id/{activeFeatureTab}
                    </div>
                    <div className='w-12'></div>
                  </div>

                  {/* Browser Content Frame - Video Placeholder */}
                  <div className='flex-1 bg-black relative overflow-hidden h-full w-full'>
                    {(() => {
                      const activeTab = [
                        { id: 'scholra', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-34281-large.mp4' },
                        { id: 'bisa-learning', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-at-home-42289-large.mp4' },
                        { id: 'dreamshub', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-with-a-large-screen-34255-large.mp4' }
                      ].find(t => t.id === activeFeatureTab);

                      return (
                        <video
                          key={activeFeatureTab}
                          src={activeTab?.videoUrl}
                          className='w-full h-full object-cover opacity-90 animate-fade-in'
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      );
                    })()}

                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none' />
                    <div className='absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-between shadow-md'>
                      <span className='capitalize font-bold'>{activeFeatureTab} Demo Video</span>
                      <span className='flex items-center gap-1.5'>
                        <span className='w-2 h-2 rounded-full bg-[#1B7691] animate-pulse'></span>
                        Preview Mode
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className='text-center mt-14 md:mt-20' data-aos='fade-up'>
              <div className='inline-flex flex-col sm:flex-row items-center gap-4 p-6 md:p-8 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] rounded-2xl'>
                <div className='text-white text-center sm:text-left'>
                  <Typography className='text-lg md:text-xl font-bold mb-1'>
                    Akses Semua Fitur dengan BISA Membership
                  </Typography>
                  <Typography className='text-white/80 text-sm'>
                    Satu langganan untuk Scholra, Dreamshub, dan BISA Learning
                  </Typography>
                </div>
                <ButtonLink
                  href='/products'
                  variant='unstyled'
                  className='flex-shrink-0'
                >
                  <div className='px-6 py-3 text-sm md:text-base font-bold text-[#1B7691] bg-white rounded-xl hover:bg-gray-100 transition-all duration-300'>
                    Daftar Sekarang
                  </div>
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* BISA LEARNING PREVIEW SECTION */}
        <section className='relative px-4 bg-gray-50/50 md:px-10 py-16 md:py-20 overflow-hidden'>
          <div className='absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
          <div className='container mx-auto max-w-6xl'>
            <div className='flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16' data-aos='fade-up'>
              <div className='max-w-2xl'>
                <Typography className='text-sm md:text-base font-medium text-[#1B7691] uppercase tracking-widest mb-3'>
                  BISA Learning Center
                </Typography>
                <Typography as='h2' className='text-3xl md:text-4xl font-bold text-gray-900 leading-tight'>
                  Materi Eksklusif dari
                  <span className='text-[#FB991A]'> Awardee & Mentor</span>
                </Typography>
                <Typography className='text-gray-600 mt-4 text-sm md:text-base max-w-prose'>
                  Dapatkan akses ke ratusan materi video dan panduan komprehensif untuk mempersiapkan diri lolos beasiswa melalui BISA Learning Center.
                </Typography>
              </div>
              <ButtonLink href='/products' variant='unstyled' className='hidden md:block group'>
                <div className='flex items-center gap-2 text-[#1B7691] font-bold group-hover:bg-[#1B7691]/10 px-4 py-2 rounded-xl transition-all duration-300'>
                  Gabung Sekarang <FiChevronRight className='transition-transform group-hover:translate-x-1' />
                </div>
              </ButtonLink>
            </div>

            {isLoadingCourses ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='h-[400px] bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100'></div>
                ))}
              </div>
            ) : previewCourses.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {previewCourses.map((course, idx) => {
                  const thumbnail = course.ThumbnailModule || (course.videoId ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg` : '');
                  return (
                    <div
                      key={course.id}
                      data-aos='fade-up'
                      data-aos-delay={idx * 100}
                      className='group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full cursor-pointer'
                      onClick={() => setSelectedPreviewCourse(course)}
                    >
                      <div className='relative h-56 overflow-hidden'>
                        {/* Dynamic Floating CTA Badge to invite user to watch video preview */}
                        <div className='absolute top-3 left-3 bg-[#1B7691] backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md z-20 flex items-center gap-1.5 transition-all duration-300 group-hover:bg-[#FB991A] group-hover:scale-105'>
                          <FiPlay className='w-3 h-3 fill-white animate-pulse' />
                          Tonton Preview
                        </div>
                        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 z-10 flex items-center justify-center'>
                          <div className='bg-white/90 backdrop-blur w-12 h-12 rounded-full flex items-center justify-center transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300'>
                            <FiPlay className='w-5 h-5 ml-1 text-[#1B7691] fill-[#1B7691]' />
                          </div>
                        </div>
                        <img
                          src={thumbnail}
                          alt={course.name}
                          className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (course.videoId) target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
                          }}
                        />
                        <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex justify-between items-end'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-xs'>
                              {course.instructor ? course.instructor.charAt(0) : 'M'}
                            </div>
                            <div className='text-white'>
                              <p className='text-[10px] opacity-80 font-light'>Mentor</p>
                              <p className='text-xs font-bold'>{course.instructor || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='p-6 flex flex-col flex-grow'>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map(i => <FiStar key={i} className='w-3 h-3 text-[#FB991A] fill-[#FB991A]' />)}
                          </div>
                          <span className='text-[10px] text-gray-400 font-medium'>({course.rating || '4.5'}) • Preview</span>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#1B7691] transition-all duration-300'>
                          {course.name}
                        </h3>
                        <p className='text-sm text-gray-500 line-clamp-2 mb-4'>
                          {course.deskripsi || 'Modul pembelajaran eksklusif dari Raih Asa untuk membantumu lolos beasiswa impian.'}
                        </p>
                        <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <div className='flex items-center gap-1'><FiClock className='w-3 h-3' /> {course.duration || 'N/A'}</div>
                            <div className='flex items-center gap-1'><FiBookOpen className='w-3 h-3' /> {course.lessons_count || 0} Bab</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className='mt-10 text-center md:hidden'>
              <ButtonLink href='/products' variant='primary' className='w-full'>
                Gabung Sekarang
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section className='relative px-4 md:px-10 py-16 md:py-20 bg-gray-50/50 overflow-hidden border-t border-b border-gray-100'>
          <div className='container mx-auto max-w-6xl'>
            {/* Section Header */}
            <div className='text-center mb-14 md:mb-20' data-aos='fade-up'>
              <Typography className='text-sm md:text-base font-medium text-[#1B7691] uppercase tracking-widest mb-3'>
                BISA Membership Plans
              </Typography>
              <Typography as='h2' className='text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight'>
                Pilih Paket Belajar Terbaik
                <span className='block text-[#FB991A]'>Sesuai Kebutuhan Beasiswamu</span>
              </Typography>
            </div>

            {isLoadingPricing ? (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='h-[450px] bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100'></div>
                ))}
              </div>
            ) : pricingPlans.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
                {pricingPlans.map((product, index) => {
                  const isPopular = product.is_popular;
                  const isEnterprise = product.is_enterprise;
                  const isBasic = !isPopular && !isEnterprise;

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
                          className={`text-xl font-bold ${isPopular ? 'text-[#DB4B24]' : 'text-gray-900'} ${isBasic ? 'group-hover:text-[#FB991A] transition-all duration-300' : ''}`}
                        >
                          {product.name}
                        </Typography>
                        <p className={`text-sm mt-2 leading-relaxed ${isPopular ? 'text-[#d97706]/80' : 'text-gray-500'}`}>
                          {product.description || ''}
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
                        {product.features?.map((feature: string, i: number) => (
                          <li key={i} className={`flex gap-3 text-sm leading-relaxed ${isPopular ? 'text-gray-800' : 'text-gray-600'}`}>
                            <div className={`mt-0.5 shrink-0 ${isPopular ? 'w-5 h-5 rounded-full bg-[#FB991A] flex items-center justify-center' : ''}`}>
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
            ) : (
              <div className='text-center text-gray-500 py-10'>
                Belum ada paket membership tersedia saat ini.
              </div>
            )}
          </div>
        </section>

        <section className='relative pb-[500px] lg:pb-0 lg:min-h-screen'>
          <div
            data-aos='fade-up'
            className='relative z-30 grid gap-3 title place-items-center'
            data-aos-delay='600'
          >
            <Typography as='h2' className='text-xl md:text-[32px] text-[#1B7691]'>
              Maju bersama
            </Typography>
            <Typography as='h2' className='font-extrabold text-4xl md:text-[80px] text-[#FB991A] mt-3'>
              RAIH ASA
            </Typography>
          </div>
          <NextImage
            src={'/images/landing/trust-element-t.png'}
            width={1440}
            height={104}
            alt='Trust element ornament'
            className='absolute top-0 z-40 w-full'
            data-aos='zoom-in-up'
          />
          <div className='grid place-items-center'>
            <NextImage
              src={'/images/landing/peta.png'}
              width={1318}
              height={520}
              quality={100}
              alt='Peta Indonesia'
              data-aos='zoom-in-up'
              className='absolute top-[20%] md:top-1/2 md:-translate-y-1/2 left-1/2 -translate-x-1/2 w-[540px] md:w-[800px] lg:w-[1318px] z-0'
            />
          </div>
          <div className='bg-white border-2 border-[#1B7691] px-5 py-4 rounded-[42px] rounded-tl-none absolute right-1/2 md:right-auto top-1/4 md:top-1/2 md:-translate-y-1/2 lg:-translate-y-1/3  md:left-[10%] 2xl:left-1/4'>
            <NextImage
              src={'/images/landing/univ.png'}
              width={240}
              height={198}
              alt='List Universitas'
              className='w-28 md:w-[240px]'
            />
          </div>
          <div className='absolute bottom-1/4 md:bottom-[10%] left-1/2 lg:left-1/2 -translate-x-1/2 min-w-[200px] sm:min-w-[400px] flex flex-wrap lg:flex-nowrap justify-center md:justify-center items-center lg:justify-normal gap-2 md:gap-4 lg:gap-0 py-3 md:py-5 px-2 md:px-4 lg:px-[60px] rounded-[20px] bg-white shadow-[0_0_8px_0_rgba(0,0,0,0.32)] max-w-[95vw] lg:max-w-none'>
            <div className='border-r-2 lg:border-r-4 border-[#E4E4E7] pr-2 lg:pr-10 w-[45%] sm:w-auto'>
              <div className='flex flex-col items-center whitespace-nowrap'>
                <div className='flex flex-row w-fit'>
                  <NumberTicker
                    className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'
                    value={100}
                    suffix='K'
                  />
                  <Typography className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'>
                    +
                  </Typography>
                </div>
                <Typography className='text-[8px] sm:text-[10px] md:text-xl text-[#1B7691] text-center'>
                  <b>Community </b>
                  member
                </Typography>
              </div>
            </div>
            <div className='border-r-2 lg:border-r-4 border-[#E4E4E7] px-2 lg:px-10 w-[45%] sm:w-auto'>
              <div className='flex flex-col items-center whitespace-nowrap'>
                <div className='flex flex-row w-fit'>
                  <NumberTicker
                    className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'
                    value={3000}
                  />
                  <Typography className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'>
                    +
                  </Typography>
                </div>
                <Typography className='text-[8px] sm:text-[10px] md:text-xl text-[#1B7691] text-center'>
                  <b>Peraih </b>
                  asa
                </Typography>
              </div>
            </div>
            <div className='border-r-2 lg:border-r-4 border-[#E4E4E7] lg:px-10 px-2 w-[45%] sm:w-auto'>
              <div className='flex flex-col items-center whitespace-nowrap'>
                <div className='flex flex-row w-fit'>
                  <NumberTicker
                    className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'
                    value={100}
                  />
                  <Typography className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'>
                    +
                  </Typography>
                </div>
                <Typography className='text-[8px] sm:text-[10px] md:text-xl text-[#1B7691] text-center'>
                  <b>Universitas</b> di Indonesia
                </Typography>
              </div>
            </div>
            <div className='lg:pl-10 w-[45%] sm:w-auto'>
              <div className='flex flex-col items-center whitespace-nowrap'>
                <div className='flex flex-row w-fit'>
                  <NumberTicker
                    className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'
                    value={35}
                  />
                  <Typography className='font-bold text-lg sm:text-[28px] lg:text-7xl !text-[#FB991A] text-shadow-yellow'>
                    +
                  </Typography>
                </div>
                <Typography className='text-[8px] sm:text-[10px] md:text-xl text-[#1B7691] text-center'>
                  <b>provinsi Indonesia</b>
                </Typography>
              </div>
            </div>
          </div>
        </section>

        <section className='relative min-h-screen '>
          <div className='flex bg-gradient-to-l from-[#FB991A] to-[#C0172A] w-full py-8 justify-center gap-8 shadow-[0_20px_12px_0_rgba(0,0,0,0.20)]'>
            <VelocityScroll
              text=' APA KATA MEREKA ? '
              default_velocity={2}
              className='text-2xl md:text-[60px] font-bold py-2 text-white whitespace-nowrap opacity-80'
            />
          </div>
          <div className='grid place-items-center gap-10 col-span-2 lg:grid-cols-12 py-[60px] lg:px-20 md:px-4'>
            <div className='lg:col-span-4 2xl:col-span-3'>
              <NextImage
                data-aos='fade-right'
                data-aos-delay='200'
                src={'/images/landing/testimoni.gif'}
                width={360}
                height={700}
                alt='Testimoni Mockup'
                className='w-[300px] sm:w-[360px]'
              />
            </div>
            <div className='lg:col-span-8 2xl:col-span-9 relative w-full mt-12 pb-[420px] lg:pb-0 lg:h-full '>
              <Typography
                as='h2'
                className='text-[28px] font-medium text-[#1B7691] px-4 lg:px-0'
                data-aos='fade-right'
                data-aos-delay='400'
              >
                Mereka yang berhasil me-<b>Raih Asa</b>-nya bersama kami!
              </Typography>
              <Swiper
                data-aos='fade-right'
                data-aos-delay='800'
                spaceBetween={20}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  1440: {
                    slidesPerView: 2,
                  },
                  1560: {
                    slidesPerView: 3,
                  },
                }}
                navigation={{ prevEl: '.prev', nextEl: '.next' }}
                loop={true}
                modules={[Autoplay, Navigation]}
                className='mySwiper !absolute w-full !py-8 md:!py-12'
              >
                {TESTIMONIALS.map((testimonial, index) => (
                  <SwiperSlide
                    key={index}
                    className='flex flex-col gap-10 px-10 py-6 bg-white drop-shadow-lg md:py-10'
                  >
                    <div className='flex flex-col min-h-[340px] justify-between'>
                      <Typography className='text-lg text-black-200'>
                        {testimonial.description}
                      </Typography>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='w-12 h-12'>
                          <NextImage
                            src={testimonial.avatar}
                            width={48}
                            height={48}
                            alt={testimonial.name}
                            className='rounded-full'
                          />
                        </div>
                        <div className='flex flex-col gap-1'>
                          <Typography className='text-sm font-bold'>
                            {testimonial.name}
                          </Typography>
                          <div className='flex flex-col'>
                            <Typography>{testimonial.university}</Typography>
                            <Typography className='italic'>
                              {testimonial.awards}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className='absolute z-30 justify-between hidden w-2/3 2xl:w-2/3 2xl:left-1/2 2xl:pl-6 2xl:-translate-x-1/3 xl:flex top-1/2 right-6'>
              <div className='prev text-3xl bg-[#2F9A97] text-white p-4 rounded-[50px] cursor-pointer'>
                <FaArrowLeft />
              </div>
              <div className='next text-3xl bg-[#2F9A97] text-white p-4 rounded-[50px] cursor-pointer'>
                <FaArrowRight />
              </div>
            </div>
          </div>
        </section>

        {/* <section className='w-screen mt-12 mb-24' id='FAQ'>
          <div className='flex flex-col items-center justify-center gap-6 mx-auto'>
            <Typography
              data-aos='fade-up'
              className='text-[#FB991A] text-3xl lg:text-6xl uppercase font-bold text-center px-4'
            >
              FREQUENTLY ASKED QUESTIONS
            </Typography>
            <div className='lg:w-[920px]  w-full rounded-xl bg-white py-2 px-4 flex flex-col gap-y-4'>
              {FAQ.map((e, index) => {
                return (
                  <Disclosure as='div' key={index}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          data-aos='fade-up'
                          data-aos-delay='400'
                          className={`${
                            open ? 'font-bold' : 'font-medium'
                          } shadow-md flex w-full justify-between items-center rounded-lg bg-[#1B7691] px-6 py-4 text-left text-xl md:text-2xl  text-[#f5f5f5]  focus:outline-none`}
                        >
                          <span className='w-fit '>{e.title}</span>
                          <HiChevronUp
                            className={`${
                              open
                                ? 'rotate-180 transform transition ease-in-out duration-200 '
                                : ''
                            }  text-[#f5f5f5] h-8 w-8`}
                          />
                        </Disclosure.Button>
                        <Transition
                          enter='transition duration-100 ease-out'
                          enterFrom='transform scale-95 opacity-0'
                          enterTo='transform scale-100 opacity-100'
                          leave='transition duration-75 ease-out'
                          leaveFrom='transform scale-100 opacity-100'
                          leaveTo='transform scale-95 opacity-0'
                        >
                          <Disclosure.Panel className='shadow-md px-4 pb-2 pt-4 text-base text-black-100 border bg-[#f5f5f5] rounded-b-lg'>
                            {e.content}
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </section> */}
        <section className='bg-white py-16 md:py-20 overflow-hidden border-t border-gray-100'>

          {/* SECTION 1: AS SEEN ON (Static, Premium, Trusted) */}
          <div className='container mx-auto px-4 mb-20 text-center' data-aos='fade-up'>
            <div className='inline-block py-2 px-6 bg-blue-50/50 rounded-full mb-6 border border-blue-100'>
              <Typography className='text-[#1B7691] font-bold uppercase tracking-widest text-xs md:text-sm'>
                AS SEEN ON
              </Typography>
            </div>

            {/* Main Sponsors Grid - Balanced Layout with Safe Margins */}
            <div className='flex flex-wrap items-center justify-center gap-12 md:gap-20 pt-10 pb-10'>
              {sponsorList.filter(s =>
                s.alt.toLowerCase().includes('kemendik') ||
                s.alt.toLowerCase().includes('puspresnas') ||
                s.alt.toLowerCase().includes('pertamuda')
              ).map((sponsor, idx) => (
                <div key={idx} className='relative w-[220px] h-[120px] md:w-[260px] md:h-[140px] flex items-center justify-center group select-none'>
                  <NextImage
                    src={sponsor.src}
                    width={260}
                    height={140}
                    alt={sponsor.alt}
                    className='object-contain max-w-full max-h-[100px] md:max-h-[120px] transition-all duration-300 group-hover:scale-105 filter drop-shadow-sm'
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: COMMUNITY PARTNERS (Marquee) */}
          <div className='pt-16 border-t border-gray-50' data-aos='fade-up' data-aos-delay='200'>
            <div className='text-center mb-10'>
              <Typography className='text-gray-400 font-medium uppercase tracking-widest text-xs'>
                Berkolaborasi dengan Komunitas
              </Typography>
            </div>

            <div className='relative w-full overflow-hidden hover:pause-animation py-6'>
              {/* Gradient Overlays */}
              <div className='absolute top-0 left-0 z-10 h-full w-[50px] md:w-[200px] bg-gradient-to-r from-white to-transparent pointer-events-none'></div>
              <div className='absolute top-0 right-0 z-10 h-full w-[50px] md:w-[200px] bg-gradient-to-l from-white to-transparent pointer-events-none'></div>

              <div className='flex animate-marquee w-fit items-center gap-0 whitespace-nowrap px-10 py-4'>
                {/* Render helper function for marquee list */}
                {[0, 1].map((round) => (
                  <React.Fragment key={round}>
                    {sponsorList.filter(s =>
                      !s.alt.toLowerCase().includes('kemendik') &&
                      !s.alt.toLowerCase().includes('puspresnas') &&
                      !s.alt.toLowerCase().includes('pertamuda')
                    ).map((sponsor, idx) => (
                      <div
                        key={`partner-${round}-${idx}`}
                        className='relative group w-[180px] h-[100px] shrink-0 flex flex-col items-center justify-center select-none'
                      >
                        <div className="w-[140px] h-[70px] flex items-center justify-center transition-all duration-300 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
                          <NextImage
                            src={sponsor.src}
                            width={140}
                            height={70}
                            alt={sponsor.alt}
                            className='object-contain max-w-[120px] max-h-[60px]'
                            draggable={false}
                          />
                        </div>

                        {/* Hover Name Label */}
                        <div className='h-6 flex items-end justify-center overflow-visible mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0'>
                          <span className='text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 shadow-sm whitespace-normal text-center leading-tight max-w-[160px]'>
                            {sponsor.alt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <style jsx global>{`
            /* Global Image Protection for Landing Page */
            section img {
               pointer-events: none !important;
               user-select: none !important;
               -webkit-user-drag: none !important;
               -webkit-touch-callout: none !important;
            }

            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 60s linear infinite;
            }
            .hover\\:pause-animation:hover .animate-marquee {
              animation-play-state: paused;
            }

            /* Adjust layouts for top announcement banner */
            header {
              top: 40px !important;
              transition: top 0.3s ease;
            }
            main {
              margin-top: 40px !important;
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
            .animate-scale-up {
              animation: scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
        </section>
      </main>

      {/* Mini Preview Modal for Course Cards */}
      {selectedPreviewCourse && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-3xl overflow-hidden w-full max-w-xl shadow-2xl border border-gray-100 flex flex-col relative max-h-[85vh] md:max-h-[80vh] animate-scale-up'>
            {/* Close Button */}
            <button
              onClick={() => setSelectedPreviewCourse(null)}
              className='absolute top-3 right-3 z-50 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-100 shadow transition-all hover:scale-105'
              title='Tutup'
            >
              <FiX className='w-4 h-4' />
            </button>

            {/* Video / Thumbnail Area */}
            <div className='relative aspect-video w-full bg-black shrink-0'>
              {selectedPreviewCourse.videoId ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedPreviewCourse.videoId}?autoplay=1&rel=0&start=240&end=270`}
                    title={selectedPreviewCourse.name}
                    className='w-full h-full border-0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  ></iframe>
                  {/* Transparent click blocker to protect the video URL from direct access */}
                  <div className='absolute inset-0 bg-transparent z-10 cursor-default' />
                </>
              ) : (
                <div className='w-full h-full relative'>
                  <img
                    src={selectedPreviewCourse.ThumbnailModule || `https://img.youtube.com/vi/${selectedPreviewCourse.videoId}/maxresdefault.jpg`}
                    alt={selectedPreviewCourse.name}
                    className='w-full h-full object-cover opacity-85'
                  />
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                    <div className='w-16 h-16 rounded-full bg-[#1B7691] border border-[#1B7691]/20 flex items-center justify-center text-white shadow-lg shadow-[#1B7691]/30'>
                      <FiPlay className='w-6 h-6 ml-1 fill-white' />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Details Area */}
            <div className='p-5 md:p-6 flex flex-col flex-grow overflow-y-auto'>
              <div className='flex flex-wrap items-center gap-2 mb-2'>
                <span className='text-[9px] font-bold text-[#1B7691] bg-[#1B7691]/10 px-2.5 py-1 rounded-full uppercase'>
                  BISA Learning Preview
                </span>
                <div className='flex items-center gap-1 ml-auto text-[11px] text-gray-500'>
                  <div className='flex gap-0.5'>
                    {[1, 2, 3, 4, 5].map(i => <FiStar key={i} className='w-2.5 h-2.5 text-[#FB991A] fill-[#FB991A]' />)}
                  </div>
                  <span className='font-bold text-gray-700'>({selectedPreviewCourse.rating || '4.5'})</span>
                </div>
              </div>

              <Typography as='h3' className='text-lg md:text-xl font-bold text-gray-900 leading-snug mb-2'>
                {selectedPreviewCourse.name}
              </Typography>

              <div className='flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 pb-3 border-b border-gray-100 text-[11px] text-gray-500'>
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 rounded-full bg-[#1B7691]/10 flex items-center justify-center font-bold text-[#1B7691] text-[10px]'>
                    {selectedPreviewCourse.instructor ? selectedPreviewCourse.instructor.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <span className='text-gray-400 block leading-none'>Mentor</span>
                    <span className='font-semibold text-gray-800 leading-tight block mt-0.5'>{selectedPreviewCourse.instructor || '-'}</span>
                  </div>
                </div>
                <div>
                  <span className='text-gray-400 block leading-none'>Durasi</span>
                  <span className='font-semibold text-gray-800 flex items-center gap-1 mt-0.5 leading-tight'><FiClock className='w-3 h-3 text-gray-400' /> {selectedPreviewCourse.duration || 'N/A'}</span>
                </div>
                <div>
                  <span className='text-gray-400 block leading-none'>Kurikulum</span>
                  <span className='font-semibold text-gray-800 flex items-center gap-1 mt-0.5 leading-tight'><FiBookOpen className='w-3 h-3 text-gray-400' /> {selectedPreviewCourse.lessons_count || 0} Bab</span>
                </div>
              </div>

              {/* Modal CTA */}
              <div className='pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 shrink-0'>
                <div className='text-center sm:text-left'>
                  <p className='text-xs text-gray-400 font-medium'>Dapatkan Akses Lengkap Modul Ini</p>
                  <p className='text-sm font-bold text-[#FB991A]'>Gabung BISA Membership Sekarang</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPreviewCourse(null);
                    router.push('/products');
                  }}
                  className='sm:ml-auto w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] hover:from-[#FB991A] hover:to-[#DB4B24] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group'
                >
                  Gabung Sekarang
                  <FiChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
