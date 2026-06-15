import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiSearch,
  FiUnlock,
  FiCalendar,
  FiX,
  FiPlay,
  FiStar,
  FiChevronRight,
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import PromoWidget from '@/components/Popups/PromoPopups';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';

export default withAuth(UserHomePage, 'user');

type LearningCourse = {
  id: string;
  name: string;
  deskripsi?: string;
  ThumbnailModule?: string;
  instructor?: string;
  duration?: string;
  is_authorize?: boolean;
  is_free?: boolean;
  Sections?: Array<{ id: string }>;
  ModuleProduct?: string[];
};

function UserHomePage() {
  const router = useRouter();
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState<any | null>(null);
  const user = useAuthStore((state) => state.user);
  const displayIdentity = user?.name?.trim() || user?.email?.trim() || '';
  const firstName = displayIdentity
    ? displayIdentity.includes('@')
      ? displayIdentity.split('@')[0]
      : displayIdentity.split(' ')[0]
    : 'Teman';

  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [membership, setMembership] = useState<{
    active: boolean;
    until: string | null;
    loading: boolean;
  }>({ active: false, until: null, loading: true });

  const [lastViewed, setLastViewed] = useState<any>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/lms/modul');
        const rawCourses = (response.data?.data || []) as LearningCourse[];
        const sortedCourses = [...rawCourses].sort((a, b) => {
          const aFree = Number(Boolean(a?.is_free));
          const bFree = Number(Boolean(b?.is_free));
          return bFree - aFree;
        });
        setCourses(sortedCourses);
      } catch (error) {
        console.error('Failed to fetch home courses', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const token = getToken();
        if (!token) {
          setMembership({ active: false, until: null, loading: false });
          return;
        }
        const response = await api.get('/pricing/subscription/status');
        const data = response.data?.data;
        if (data?.active && data?.ends_at) {
          const endDate = new Date(data.ends_at);
          if (endDate > new Date()) {
            setMembership({
              active: true,
              until: endDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              loading: false,
            });
            return;
          }
        }
        setMembership({ active: false, until: null, loading: false });
      } catch {
        setMembership({ active: false, until: null, loading: false });
      }
    };
    checkMembership();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lastViewedCourse');
    if (!saved) return;
    try {
      setLastViewed(JSON.parse(saved));
    } catch {
      setLastViewed(null);
    }
  }, []);

  const recommendedCourses = useMemo(() => courses.slice(0, 4), [courses]);
  const lastViewedCourse = useMemo(
    () => courses.find((course) => course.id === lastViewed?.id),
    [courses, lastViewed?.id],
  );
  const learningLocked = !membership.loading && !membership.active;

  const learningLandingHref = '/bisa-learning';
  const learningModuleHref = (courseId: string, isAuthorize?: boolean) =>
    isAuthorize ? `/bisa-learning/${courseId}` : '/products';

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title='Home - Raihasa' />
      <PromoWidget />

      <main className='min-h-screen bg-[#F8FAFC] pb-20'>
        <style jsx global>{`
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
        {/* ── Header Band ── */}
        <div className='relative overflow-hidden bg-gradient-to-r from-[#1B7691] to-[#0F4C61] pt-36 pb-20 rounded-b-[2rem] shadow-lg'>
          {/* Decorative shapes */}
          <div className='absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3'></div>
          <div className='absolute bottom-0 left-0 w-64 h-64 bg-[#FB991A]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3'></div>

          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-50 border border-white/10'>
                Dashboard
              </span>
            </div>
            <Typography className='font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight'>
              Selamat Datang Kembali, <span className='text-[#FB991A]'>{firstName}</span>!
            </Typography>
            <Typography className='mt-3 text-blue-100 text-sm md:text-base font-light max-w-xl leading-relaxed'>
              Pantau perkembangan belajarmu dan temukan beasiswa terbaik yang paling sesuai dengan profil akademikmu.
            </Typography>
          </div>
        </div>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8'>
          {/* ── Membership Status ── */}
          <section>
            {membership.loading ? (
              <div className='h-20 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100' />
            ) : membership.active ? (
              <div className='flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-md shadow-green-500/10'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0'>
                    <FiCheckCircle className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-lg font-bold'>Membership Premium Aktif</p>
                    <p className='text-sm text-green-50 opacity-90 mt-0.5'>
                      Anda memiliki akses penuh hingga <span className='font-bold bg-white/20 px-2 py-0.5 rounded'>{membership.until}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0'>
                    <FiLock className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-lg font-bold text-gray-800'>Membership Belum Aktif</p>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      Aktifkan untuk membuka seluruh video, modul PDF, dan fitur premium Raih Asa.
                    </p>
                  </div>
                </div>
                <ButtonLink
                  href='/products'
                  className='bg-[#FB991A] hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all'
                >
                  Dapatkan Akses
                </ButtonLink>
              </div>
            )}
          </section>

          {/* ── Stat Cards ── */}
          <section className='grid grid-cols-2 gap-4'>
            {[
              {
                Icon: FiBookOpen,
                label: 'Total Modul',
                value: isLoadingCourses ? '—' : String(courses.length),
                bgColor: 'bg-[#1B7691]/5',
                borderColor: 'border-[#1B7691]/10',
                iconColor: 'text-[#1B7691]',
              },
              {
                Icon: membership.active ? FiUnlock : FiLock,
                label: 'Membership',
                value: membership.loading ? '—' : membership.active ? 'Aktif' : 'Belum Aktif',
                bgColor: membership.active ? 'bg-emerald-500/5' : 'bg-orange-500/5',
                borderColor: membership.active ? 'border-emerald-500/10' : 'border-orange-500/10',
                iconColor: membership.active ? 'text-emerald-600' : 'text-orange-600',
              },
            ].map((item) => (
              <article
                key={item.label}
                className={`bg-white border ${item.borderColor} rounded-2xl p-6 shadow-sm flex items-center gap-4`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div>
                  <p className='text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5'>{item.label}</p>
                  <p className='text-2xl md:text-3xl font-black text-gray-800 leading-none'>{item.value}</p>
                </div>
              </article>
            ))}
          </section>

          {/* ── Main Grid ── */}
          <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Access */}
              <article className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
                <div className='px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <p className='text-base font-bold text-gray-800'>Akses Cepat</p>
                </div>
                <div className='divide-y divide-gray-100'>
                  {[
                    {
                      href: learningLandingHref,
                      Icon: learningLocked ? FiLock : FiBookOpen,
                      label: learningLocked ? 'BISA Learning (Preview)' : 'BISA Learning Center',
                    },
                    { href: '/scholra', Icon: FiSearch, label: 'Asisten Scholra AI' },
                    { href: '/scholarship-calendar', Icon: FiCalendar, label: 'Kalender Beasiswa' },
                  ].map(({ href, Icon, label }) => (
                    <ButtonLink
                      key={href}
                      href={href}
                      className='w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors text-left border-none shadow-none rounded-none'
                    >
                      <span className='inline-flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-[#1B7691] transition-colors'>
                        <Icon className='w-4 h-4 text-[#1B7691]' />
                        {label}
                      </span>
                      <FiArrowRight className='w-4 h-4 text-gray-400' />
                    </ButtonLink>
                  ))}
                </div>
              </article>

              {/* Continue Learning */}
              {lastViewed && (
                <article className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
                  <p className='text-xs text-gray-400 font-bold uppercase tracking-wider mb-3'>Lanjutkan Belajar</p>
                  <p className='text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight'>
                    {lastViewed.title}
                  </p>
                  <p className='text-xs text-gray-500 mb-4'>
                    Bab Terakhir: {lastViewed.lastLesson}
                  </p>
                  <div className='w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] rounded-full'
                      style={{ width: `${lastViewed.progress || 0}%` }}
                    />
                  </div>
                  {!lastViewedCourse?.is_authorize ? (
                    <button
                      onClick={() => setSelectedPreviewCourse(lastViewedCourse)}
                      className='w-full justify-center inline-flex items-center gap-2 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] hover:from-[#FB991A] hover:to-[#DB4B24] text-white px-5 py-3 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all'
                    >
                      Tonton Preview <FiArrowRight className='w-4 h-4' />
                    </button>
                  ) : (
                    <ButtonLink
                      href={learningModuleHref(lastViewed.id, true)}
                      className='w-full justify-center inline-flex items-center gap-2 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] hover:from-[#FB991A] hover:to-[#DB4B24] text-white px-5 py-3 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all'
                    >
                      Lanjutkan Belajar <FiArrowRight className='w-4 h-4' />
                    </ButtonLink>
                  )}
                </article>
              )}
            </div>

            {/* Course Grid */}
            <div className='lg:col-span-2'>
              <article className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
                <div className='px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-base font-bold text-gray-800'>Rekomendasi Bisa Learning</p>
                    <p className='text-xs text-gray-400 font-medium mt-0.5'>
                      Modul pilihan dari awardee untuk membantumu lolos seleksi
                    </p>
                  </div>
                  <ButtonLink
                    href={learningLandingHref}
                    className='text-xs font-bold text-[#1B7691] hover:text-[#0d5a6e] whitespace-nowrap'
                  >
                    Lihat Semua →
                  </ButtonLink>
                </div>

                <div className='p-6'>
                  {isLoadingCourses ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='h-44 bg-gray-100 rounded-xl animate-pulse' />
                      ))}
                    </div>
                  ) : recommendedCourses.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {recommendedCourses.map((course) => {
                        const isCourseLocked = !course.is_authorize && !course.is_free;
                        const thumbnail =
                          course.ThumbnailModule ||
                          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80';

                        return (
                          <article
                            key={course.id}
                            className='group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full'
                          >
                            <div 
                              className='h-36 relative overflow-hidden cursor-pointer' 
                              onClick={() => {
                                if (isCourseLocked) {
                                  setSelectedPreviewCourse(course);
                                } else {
                                  window.location.href = `/bisa-learning/${course.id}`;
                                }
                              }}
                            >
                              <img
                                src={thumbnail}
                                alt={course.name}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                              />
                              {course.is_free && (
                                <div className='absolute top-3 left-3 z-10'>
                                  <span className='px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] font-extrabold uppercase rounded shadow-sm'>
                                    Gratis
                                  </span>
                                </div>
                              )}
                              {isCourseLocked && (
                                <div className='absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]'>
                                  <div className='bg-white/10 border border-white/20 p-2.5 rounded-full'>
                                    <FiLock className='w-4 h-4 text-white' />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='p-4 flex flex-col flex-grow'>
                              <p
                                className='text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#1B7691] transition-colors leading-snug cursor-pointer'
                                onClick={() => {
                                  if (isCourseLocked) {
                                    setSelectedPreviewCourse(course);
                                  } else {
                                    window.location.href = `/bisa-learning/${course.id}`;
                                  }
                                }}
                              >
                                {course.name}
                              </p>
                              <div
                                className='flex items-center gap-4 mb-4 mt-auto'
                              >
                                <span className='text-[11px] text-gray-500 font-semibold flex items-center gap-1'>
                                  <FiClock className='w-3 h-3 text-gray-400' /> {course.duration || 'Self-paced'}
                                </span>
                                <span className='text-[11px] text-gray-500 font-semibold flex items-center gap-1'>
                                  <FiBookOpen className='w-3 h-3 text-gray-400' /> {course.Sections?.length || 0} Sesi
                                </span>
                              </div>

                              {isCourseLocked ? (
                                <button
                                  onClick={() => setSelectedPreviewCourse(course)}
                                  className='w-full justify-center inline-flex items-center gap-1 bg-[#1B7691]/10 text-[#1B7691] hover:bg-[#1B7691] hover:text-white px-4 py-2 text-xs font-bold rounded-lg transition-all'
                                >
                                  Tonton Preview <FiArrowRight className='w-3 h-3' />
                                </button>
                              ) : (
                                <ButtonLink
                                  href={`/bisa-learning/${course.id}`}
                                  className='w-full justify-center inline-flex items-center gap-1 bg-[#1B7691]/10 text-[#1B7691] hover:bg-[#1B7691] hover:text-white px-4 py-2 text-xs font-bold rounded-lg border-none shadow-none transition-all'
                                >
                                  Buka Modul <FiArrowRight className='w-3 h-3' />
                                </ButtonLink>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-center py-10 text-gray-400 font-medium text-sm'>
                      Belum ada modul tersedia.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </section>
        </div>
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
            <div className='p-5 md:p-6 pb-4 flex flex-col flex-grow overflow-y-auto'>
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

              {selectedPreviewCourse.instructor && (
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <span>Mentor:</span>
                  <span className='font-semibold text-gray-800'>{selectedPreviewCourse.instructor}</span>
                </div>
              )}
            </div>

            {/* Modal CTA (Fixed at bottom) */}
            <div className='p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 shrink-0 mt-auto'>
              {selectedPreviewCourse.is_free ? (
                <>
                  <div className='text-center sm:text-left'>
                    <p className='text-xs text-gray-400 font-medium'>Akses Gratis Modul Persiapan Ini</p>
                    <p className='text-sm font-bold text-[#1B7691]'>Masuk atau Daftar Akun Sekarang</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPreviewCourse(null);
                      router.push(`/login?redirect=/bisa-learning/${selectedPreviewCourse.id}`);
                    }}
                    className='sm:ml-auto w-full sm:w-auto px-6 py-3.5 bg-[#1B7691] hover:bg-[#0d5a6e] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group'
                  >
                    Masuk / Daftar
                    <FiChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
