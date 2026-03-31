import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiLock,
  FiMessageCircle,
  FiSearch,
  FiTrendingUp,
  FiUnlock,
  FiUsers,
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { forumApi } from '@/lib/api/forum';
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
};

function UserHomePage() {
  const user = useAuthStore((state) => state.user);
  const displayIdentity = (user?.name?.trim() || user?.email?.trim() || '');
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
  }>({
    active: false,
    until: null,
    loading: true,
  });

  const [userTokens, setUserTokens] = useState<number | null>(null);
  const [forumSummary, setForumSummary] = useState({ posts: 0, categories: 0 });
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
      } catch (error) {
        setMembership({ active: false, until: null, loading: false });
      }
    };

    checkMembership();
  }, []);

  useEffect(() => {
    const fetchDreamshubSummary = async () => {
      try {
        const [posts, categories] = await Promise.all([
          forumApi.getPosts({ page: 1, limit: 1 }),
          forumApi.getCategories(),
        ]);

        setForumSummary({
          posts: posts.metadata?.total || 0,
          categories: categories.length,
        });
      } catch {
        setForumSummary({ posts: 0, categories: 0 });
      }

      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts/tokens/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.ok) {
          const json = await response.json();
          const count = json.data?.forum_tokens ?? json.data?.token ?? 0;
          setUserTokens(Number(count));
        }
      } catch {
        setUserTokens(null);
      }
    };

    fetchDreamshubSummary();
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

  const recommendedCourses = useMemo(() => courses.slice(0, 3), [courses]);
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

      <main className='min-h-screen bg-[#F8FAFC] pt-28 pb-16'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <section className='relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1B7691] to-[#0F4C61] p-7 md:p-10 text-white mb-8'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3' />
            <div className='absolute bottom-0 left-0 w-56 h-56 bg-[#FB991A]/25 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3' />

            <div className='relative z-10'>
              <Typography className='text-3xl md:text-5xl font-extrabold tracking-tight mb-3'>
                Selamat datang, {firstName}!
              </Typography>
              <Typography className='text-blue-100 text-base md:text-lg max-w-3xl leading-relaxed'>
                Pusat aktivitas Raihasa untuk lanjut belajar di BISA Learning dan membangun koneksi di Dreamshub.
              </Typography>
            </div>
          </section>

          <section className='mb-8'>
            <div
              className={`rounded-3xl p-6 shadow-sm border flex flex-wrap items-center justify-between gap-4 ${
                membership.loading
                  ? 'bg-gray-100 border-gray-200'
                  : membership.active
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-transparent text-white'
                  : 'bg-white border-gray-200'
              }`}
            >
              {membership.loading ? (
                <Typography className='text-gray-500'>Memuat status membership...</Typography>
              ) : membership.active ? (
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-white/20 flex items-center justify-center'>
                    <FiCheckCircle className='w-6 h-6' />
                  </div>
                  <div>
                    <Typography className='text-xl font-bold'>Membership Premium Aktif</Typography>
                    <Typography className='text-sm text-green-50'>
                      Akses penuh BISA Learning aktif hingga {membership.until}
                    </Typography>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600'>
                    <FiLock className='w-6 h-6' />
                  </div>
                  <div>
                    <Typography className='text-xl font-bold text-gray-900'>Akses Membership Belum Aktif</Typography>
                    <Typography className='text-sm text-gray-600'>
                      Aktifkan membership untuk membuka semua modul BISA Learning.
                    </Typography>
                  </div>
                </div>
              )}

              {!membership.loading && !membership.active && (
                <ButtonLink
                  href='/products'
                  className='px-5 py-3 rounded-xl bg-[#FB991A] text-white font-semibold hover:bg-orange-600 transition-colors'
                >
                  Dapatkan Akses
                </ButtonLink>
              )}
            </div>
          </section>

          <section className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
            {[
              {
                icon: FiBookOpen,
                label: 'Total Modul',
                value: String(courses.length),
                tone: 'bg-blue-50 text-[#1B7691]',
              },
              {
                icon: FiTrendingUp,
                label: 'Forum Post',
                value: String(forumSummary.posts),
                tone: 'bg-emerald-50 text-emerald-700',
              },
              {
                icon: FiUsers,
                label: 'Kategori Forum',
                value: String(forumSummary.categories),
                tone: 'bg-indigo-50 text-indigo-700',
              },
              {
                icon: membership.active ? FiUnlock : FiLock,
                label: 'Dreamshub Token',
                value: userTokens !== null ? String(userTokens) : '-',
                tone: 'bg-amber-50 text-amber-700',
              },
            ].map((item) => (
              <article key={item.label} className='bg-white border border-gray-200 rounded-2xl p-4 shadow-sm'>
                <div className={`w-10 h-10 rounded-xl ${item.tone} flex items-center justify-center mb-3`}>
                  <item.icon className='w-5 h-5' />
                </div>
                <Typography className='text-xs uppercase tracking-wide text-gray-400 font-bold mb-1'>
                  {item.label}
                </Typography>
                <Typography className='text-2xl font-extrabold text-gray-900'>{item.value}</Typography>
              </article>
            ))}
          </section>

          <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='space-y-6'>
              <article className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                <Typography className='text-xl font-bold text-gray-900 mb-4'>Aksi Cepat</Typography>
                <div className='space-y-3'>
                  <ButtonLink href={learningLandingHref} className='w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-[#1B7691]/30 hover:bg-[#1B7691]/5 transition-colors'>
                    <span className='inline-flex items-center gap-2 text-sm font-semibold text-gray-800'>
                      {learningLocked ? <FiLock className='w-4 h-4 text-amber-600' /> : <FiBookOpen className='w-4 h-4 text-[#1B7691]' />}
                      {learningLocked ? 'BISA Learning (Terkunci)' : 'Buka BISA Learning'}
                    </span>
                    <FiArrowRight className='w-4 h-4 text-gray-400' />
                  </ButtonLink>

                  <ButtonLink href='/dreamshub' className='w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-[#1B7691]/30 hover:bg-[#1B7691]/5 transition-colors'>
                    <span className='inline-flex items-center gap-2 text-sm font-semibold text-gray-800'>
                      <FiMessageCircle className='w-4 h-4 text-[#1B7691]' /> Masuk Dreamshub
                    </span>
                    <FiArrowRight className='w-4 h-4 text-gray-400' />
                  </ButtonLink>

                  <ButtonLink href='/dreamshub/create' className='w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-[#1B7691]/30 hover:bg-[#1B7691]/5 transition-colors'>
                    <span className='inline-flex items-center gap-2 text-sm font-semibold text-gray-800'>
                      <FiEdit3 className='w-4 h-4 text-[#1B7691]' /> Buat Diskusi Baru
                    </span>
                    <FiArrowRight className='w-4 h-4 text-gray-400' />
                  </ButtonLink>
                </div>
              </article>

              {lastViewed && (
                <article className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                  <Typography className='text-xl font-bold text-gray-900 mb-3'>Lanjutkan Belajar</Typography>
                  <Typography className='text-sm text-gray-600 mb-2'>{lastViewed.title}</Typography>
                  <Typography className='text-xs text-gray-500 mb-4'>Terakhir: {lastViewed.lastLesson}</Typography>
                  <div className='w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden'>
                    <div className='h-full bg-gradient-to-r from-[#1B7691] to-[#2ecc71]' style={{ width: `${lastViewed.progress || 0}%` }} />
                  </div>
                  <ButtonLink href={learningModuleHref(lastViewed.id, Boolean(lastViewedCourse?.is_authorize))} className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B7691] text-white text-sm font-semibold hover:bg-[#15627a] transition-colors'>
                    {!lastViewedCourse?.is_authorize ? 'Aktifkan Membership' : 'Lanjutkan'} <FiArrowRight className='w-4 h-4' />
                  </ButtonLink>
                </article>
              )}
            </div>

            <div className='lg:col-span-2 space-y-6'>
              <article className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                <div className='flex items-center justify-between mb-4 gap-3'>
                  <div>
                    <Typography className='text-2xl font-bold text-gray-900'>Rekomendasi BISA Learning</Typography>
                    <Typography className='text-gray-600 text-sm'>Modul pilihan untuk persiapan beasiswa Anda.</Typography>
                  </div>
                  <ButtonLink href={learningLandingHref} className='text-sm font-semibold text-[#1B7691] hover:text-[#15627a] whitespace-nowrap'>
                    {learningLocked ? 'Aktifkan akses' : 'Lihat semua'}
                  </ButtonLink>
                </div>

                {isLoadingCourses ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {[1, 2].map((item) => (
                      <div key={item} className='h-40 rounded-2xl bg-gray-100 animate-pulse' />
                    ))}
                  </div>
                ) : recommendedCourses.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {recommendedCourses.map((course) => {
                      const isCourseLocked = !course.is_authorize;
                      const thumbnail =
                        course.ThumbnailModule ||
                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80';

                      return (
                        <article key={course.id} className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all'>
                          <div className='h-36 bg-gray-100 relative'>
                            <img src={thumbnail} alt={course.name} className='w-full h-full object-cover' />
                            {course.is_free && (
                              <div className='absolute top-3 right-3'>
                                <span className='px-2.5 py-1 rounded-lg bg-emerald-500/95 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm'>
                                  Free Access
                                </span>
                              </div>
                            )}
                            {isCourseLocked && (
                              <div className='absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center'>
                                <div className='w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center'>
                                  <FiLock className='w-5 h-5 text-white' />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className='p-4'>
                            <Typography className={`font-bold text-gray-900 line-clamp-2 mb-2 ${isCourseLocked ? 'blur-[3px] select-none opacity-70' : ''}`}>
                              {course.name}
                            </Typography>
                            <div className={`flex items-center gap-4 text-xs text-gray-500 mb-4 ${isCourseLocked ? 'blur-[3px] select-none opacity-70' : ''}`}>
                              <span className='inline-flex items-center gap-1'>
                                <FiClock className='w-3.5 h-3.5' /> {course.duration || 'Self-paced'}
                              </span>
                              <span className='inline-flex items-center gap-1'>
                                <FiBookOpen className='w-3.5 h-3.5' /> {course.Sections?.length || 0} sesi
                              </span>
                            </div>
                            <ButtonLink href={learningModuleHref(course.id, course.is_authorize)} className='inline-flex items-center gap-2 text-sm font-semibold text-[#1B7691] hover:text-[#15627a]'>
                              {isCourseLocked ? 'Aktifkan membership' : 'Buka modul'} <FiArrowRight className='w-4 h-4' />
                            </ButtonLink>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className='text-center py-10 text-gray-500'>Belum ada modul tersedia.</div>
                )}
              </article>

              <article className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                <div className='flex items-center justify-between gap-3 mb-4'>
                  <div>
                    <Typography className='text-2xl font-bold text-gray-900'>Dreamshub Snapshot</Typography>
                    <Typography className='text-sm text-gray-600'>Ikuti forum komunitas untuk berbagi strategi dan insight beasiswa.</Typography>
                  </div>
                  <ButtonLink href='/dreamshub' className='text-sm font-semibold text-[#1B7691] hover:text-[#15627a] whitespace-nowrap'>
                    Kunjungi Dreamshub
                  </ButtonLink>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='rounded-xl bg-[#F0F9FF] border border-[#d8eeff] p-4'>
                    <Typography className='text-xs uppercase font-bold tracking-wide text-[#1B7691] mb-1'>Diskusi</Typography>
                    <Typography className='text-2xl font-extrabold text-[#0f172a]'>{forumSummary.posts}</Typography>
                  </div>
                  <div className='rounded-xl bg-[#ECFDF5] border border-[#d5f5e7] p-4'>
                    <Typography className='text-xs uppercase font-bold tracking-wide text-emerald-700 mb-1'>Kategori</Typography>
                    <Typography className='text-2xl font-extrabold text-[#0f172a]'>{forumSummary.categories}</Typography>
                  </div>
                  <div className='rounded-xl bg-[#FFF7ED] border border-[#ffe6cc] p-4'>
                    <Typography className='text-xs uppercase font-bold tracking-wide text-amber-700 mb-1'>Token Anda</Typography>
                    <Typography className='text-2xl font-extrabold text-[#0f172a]'>
                      {userTokens !== null ? userTokens : '-'}
                    </Typography>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
