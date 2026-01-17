'use client';

import 'aos/dist/aos.css';
import 'swiper/css';
import 'swiper/css/navigation';


import { animate, Timeline, stagger, utils } from 'animejs';
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

export default function Home() {
  const aboutRef = useRef<HTMLElement>(null);

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

    // Simple floating animation for hero image using anime.js
    try {
      const imageElements = [imageDesktopRef.current, imageMobileRef.current].filter(Boolean);
      if (imageElements.length > 0) {
        animate(imageElements, {
          translateY: [-8, 8],
          duration: 2500,
          direction: 'alternate',
          loop: true,
          ease: 'in-out-sine',
        });
      }
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, []);

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title='Home' />
      <PromoPopup />

      {/* Floating WhatsApp Button */}
      <a
        href='https://wa.me/6285117323893?text=Halo%20min%2C%20saya%20tertarik%20dengan%20program%20Scholarship%20Mentoring%20di%20Raih%20Asa.%20Boleh%20minta%20info%20lebih%20lanjut%3F'
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
                  href='https://raihasa.myr.id/bundling'
                  variant='unstyled'
                  size='lg'
                  className='group'
                >
                  <div className='flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-gradient-to-r from-[#1B7691] to-[#0e5c71] rounded-full shadow-lg hover:shadow-xl hover:shadow-[#1B7691]/30 transition-all duration-300 hover:scale-105'>
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
            <div className='relative order-1 w-full max-w-lg mx-auto xl:order-2 xl:max-w-none' data-aos='fade-left' data-aos-delay='200'>
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
            </div>
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

        <section className='relative px-4 md:px-10 py-20 md:py-28'>
          <div className='container mx-auto max-w-6xl'>
            {/* Section Header */}
            <div className='text-center mb-14 md:mb-20' data-aos='fade-up'>
              <Typography className='text-sm md:text-base font-medium text-[#1B7691] uppercase tracking-widest mb-3'>
                Ekosistem Beasiswa Terlengkap
              </Typography>
              <Typography className='text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight'>
                Semua yang Kamu Butuhkan untuk
                <span className='block text-[#FB991A]'>Raih Beasiswa Impian</span>
              </Typography>
            </div>

            {/* Program Cards - 3 Column Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>

              {/* Card 1 - Scholra */}
              <div
                className='bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#1B7691]/30 hover:shadow-lg transition-all duration-300'
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
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4'>
                  Asisten cerdas yang menganalisis profilmu dan merekomendasikan beasiswa paling sesuai. Hemat waktu riset dengan rekomendasi personal.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#1B7691] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Pelajari <FaArrowRightLong className='text-xs' />
                </span>
              </div>

              {/* Card 2 - Dreamshub */}
              <div
                className='bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#FB991A]/30 hover:shadow-lg transition-all duration-300'
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
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4'>
                  Komunitas eksklusif untuk konsultasi langsung dengan mentor dan awardee. Dapat feedback real dan tips praktis.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#FB991A] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Gabung <FaArrowRightLong className='text-xs' />
                </span>
              </div>

              {/* Card 3 - BISA Learning */}
              <div
                className='bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-[#1B7691]/30 hover:shadow-lg transition-all duration-300'
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
                <Typography className='text-gray-600 text-sm leading-relaxed mb-4'>
                  Akses ratusan video tutorial dan e-book persiapan beasiswa. Dari CV, motivation letter, hingga interview.
                </Typography>
                <span className='inline-flex items-center gap-1 text-[#1B7691] text-sm font-medium hover:gap-2 transition-all cursor-pointer'>
                  Akses <FaArrowRightLong className='text-xs' />
                </span>
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
                  href='https://raihasa.myr.id/bundling'
                  variant='unstyled'
                  className='flex-shrink-0'
                >
                  <div className='px-6 py-3 text-sm md:text-base font-bold text-[#1B7691] bg-white rounded-full hover:bg-gray-100 transition-colors'>
                    Daftar Sekarang
                  </div>
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section className='relative pb-[500px] lg:pb-0 lg:min-h-screen'>
          <div
            data-aos='fade-up'
            className='relative z-30 grid gap-3 title place-items-center'
            data-aos-delay='600'
          >
            <Typography className='text-xl md:text-[32px] text-[#1B7691]'>
              Maju bersama
            </Typography>
            <Typography className='font-extrabold text-4xl md:text-[80px] text-[#FB991A] mt-3'>
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
        <section className='bg-white py-16 md:py-24 overflow-hidden border-t border-gray-100'>

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
          `}</style>
        </section>
      </main>
    </Layout>
  );
}
