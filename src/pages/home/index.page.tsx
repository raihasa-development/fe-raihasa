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
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
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
};

function UserHomePage() {
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

      <main className='min-h-screen bg-[var(--color-paper)] pt-24 pb-20'>

        {/* ── Header Band ── */}
        <header className='bg-[var(--color-ink-900)] grain-overlay'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
            <p className='eyebrow-mono text-[var(--color-paper)] opacity-50 mb-3'>
              DASHBOARD — RAIH ASA
            </p>
            <h1 className='font-display text-4xl md:text-5xl lg:text-6xl text-[var(--color-paper)] leading-tight'>
              Halo, <em>{firstName}.</em>
            </h1>
            <p className='mt-3 text-[var(--color-paper)] opacity-60 text-base md:text-lg max-w-xl'>
              Pantau perkembangan belajarmu dan temukan beasiswa yang sesuai profilmu.
            </p>
          </div>
        </header>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8'>

          {/* ── Membership Status ── */}
          <section>
            {membership.loading ? (
              <div className='h-20 bg-[var(--color-paper-warm)] border border-[var(--color-ink-900)] rounded-sm animate-pulse' />
            ) : membership.active ? (
              <div className='flex flex-wrap items-center justify-between gap-4 border-l-4 border-[var(--color-primary-blue)] bg-[var(--color-paper-warm)] px-6 py-5'>
                <div className='flex items-center gap-4'>
                  <FiCheckCircle className='w-5 h-5 text-[var(--color-primary-blue)] shrink-0' />
                  <div>
                    <p className='font-display text-lg text-[var(--color-ink-900)]'>Membership Premium Aktif</p>
                    <p className='eyebrow-mono text-[var(--color-ink-500)] mt-0.5'>
                      Aktif hingga {membership.until}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap items-center justify-between gap-4 border-2 border-[var(--color-ink-900)] bg-[var(--color-paper)] px-6 py-5'>
                <div className='flex items-center gap-4'>
                  <FiLock className='w-5 h-5 text-[var(--color-primary-orange)] shrink-0' />
                  <div>
                    <p className='font-display text-lg text-[var(--color-ink-900)]'>Membership Belum Aktif</p>
                    <p className='eyebrow-mono text-[var(--color-ink-500)] mt-0.5'>
                      Aktifkan untuk membuka semua modul BISA Learning
                    </p>
                  </div>
                </div>
                <ButtonLink
                  href='/products'
                  className='bg-[var(--color-ink-900)] text-[var(--color-paper)] px-6 py-3 rounded-none text-sm font-medium tracking-tight hover:bg-[var(--color-ink-700)] transition-colors'
                >
                  Dapatkan Akses →
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
                accent: 'border-[var(--color-primary-blue)]',
              },
              {
                Icon: membership.active ? FiUnlock : FiLock,
                label: 'Membership',
                value: membership.loading ? '—' : membership.active ? 'Aktif' : 'Belum Aktif',
                accent: membership.active
                  ? 'border-[var(--color-primary-blue)]'
                  : 'border-[var(--color-primary-orange)]',
              },
            ].map((item) => (
              <article
                key={item.label}
                className={`bg-[var(--color-paper)] border-l-4 ${item.accent} border border-[var(--color-ink-900)] border-l-4 px-5 py-5`}
              >
                <item.Icon className='w-4 h-4 text-[var(--color-ink-500)] mb-3' />
                <p className='eyebrow-mono text-[var(--color-ink-500)] mb-1'>{item.label}</p>
                <p className='font-display text-4xl md:text-5xl text-[var(--color-ink-900)]'>{item.value}</p>
              </article>
            ))}
          </section>

          {/* ── Main Grid ── */}
          <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

            {/* Sidebar */}
            <div className='space-y-6'>

              {/* Quick Access */}
              <article className='border border-[var(--color-ink-900)] bg-[var(--color-paper)]'>
                <div className='px-6 py-4 border-b border-[var(--color-ink-900)]'>
                  <p className='font-display text-xl text-[var(--color-ink-900)]'>Akses Cepat</p>
                </div>
                <div className='divide-y divide-[var(--color-ink-900)]'>
                  {[
                    {
                      href: learningLandingHref,
                      Icon: learningLocked ? FiLock : FiBookOpen,
                      label: learningLocked ? 'BISA Learning (Terkunci)' : 'BISA Learning',
                    },
                    { href: '/scholra', Icon: FiSearch, label: 'Cari Beasiswa (Scholra)' },
                    { href: '/scholarship-calendar', Icon: FiCalendar, label: 'Kalender Beasiswa' },
                  ].map(({ href, Icon, label }) => (
                    <ButtonLink
                      key={href}
                      href={href}
                      className='w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--color-paper-warm)] transition-colors'
                    >
                      <span className='inline-flex items-center gap-3 text-sm font-medium text-[var(--color-ink-700)]'>
                        <Icon className='w-4 h-4 text-[var(--color-ink-500)]' />
                        {label}
                      </span>
                      <FiArrowRight className='w-4 h-4 text-[var(--color-ink-500)]' />
                    </ButtonLink>
                  ))}
                </div>
              </article>

              {/* Continue Learning */}
              {lastViewed && (
                <article className='border border-[var(--color-ink-900)] bg-[var(--color-paper)] p-6'>
                  <p className='eyebrow-mono text-[var(--color-ink-500)] mb-3'>Lanjutkan Belajar</p>
                  <p className='font-display text-lg text-[var(--color-ink-900)] mb-1 line-clamp-2'>
                    {lastViewed.title}
                  </p>
                  <p className='text-xs text-[var(--color-ink-500)] mb-4'>
                    Terakhir dibuka: {lastViewed.lastLesson}
                  </p>
                  <div className='w-full bg-[var(--color-paper-warm)] h-1 mb-5'>
                    <div
                      className='h-full bg-[var(--color-ink-900)]'
                      style={{ width: `${lastViewed.progress || 0}%` }}
                    />
                  </div>
                  <ButtonLink
                    href={learningModuleHref(lastViewed.id, Boolean(lastViewedCourse?.is_authorize))}
                    className='inline-flex items-center gap-2 bg-[var(--color-ink-900)] text-[var(--color-paper)] px-5 py-3 text-sm font-medium rounded-none hover:bg-[var(--color-ink-700)] transition-colors'
                  >
                    {!lastViewedCourse?.is_authorize ? 'Aktifkan Membership' : 'Lanjutkan'}{' '}
                    <FiArrowRight className='w-4 h-4' />
                  </ButtonLink>
                </article>
              )}
            </div>

            {/* Course Grid */}
            <div className='lg:col-span-2'>
              <article className='border border-[var(--color-ink-900)] bg-[var(--color-paper)]'>
                <div className='px-6 py-4 border-b border-[var(--color-ink-900)] flex items-center justify-between gap-3'>
                  <div>
                    <p className='font-display text-xl text-[var(--color-ink-900)]'>Modul BISA Learning</p>
                    <p className='eyebrow-mono text-[var(--color-ink-500)] mt-0.5'>
                      Modul pilihan untuk perjalanan beasiswamu
                    </p>
                  </div>
                  <ButtonLink
                    href={learningLandingHref}
                    className='text-xs font-medium text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)] whitespace-nowrap editorial-link'
                  >
                    {learningLocked ? 'Aktifkan akses' : 'Lihat semua'}
                  </ButtonLink>
                </div>

                <div className='p-6'>
                  {isLoadingCourses ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='h-44 bg-[var(--color-paper-warm)] animate-pulse' />
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
                          <article
                            key={course.id}
                            className='border border-[var(--color-ink-900)] overflow-hidden hover:shadow-[4px_4px_0_0_var(--color-ink-900)] transition-shadow duration-300'
                          >
                            <div className='h-36 relative'>
                              <img
                                src={thumbnail}
                                alt={course.name}
                                className='w-full h-full object-cover'
                              />
                              {course.is_free && (
                                <div className='absolute top-0 left-0'>
                                  <span className='eyebrow-mono bg-[var(--color-ink-900)] text-[var(--color-paper)] px-3 py-1 text-[10px]'>
                                    Gratis
                                  </span>
                                </div>
                              )}
                              {isCourseLocked && (
                                <div className='absolute inset-0 bg-[var(--color-ink-900)]/60 flex items-center justify-center'>
                                  <FiLock className='w-6 h-6 text-[var(--color-paper)]' />
                                </div>
                              )}
                            </div>
                            <div className='p-4'>
                              <p
                                className={`font-display text-base text-[var(--color-ink-900)] line-clamp-2 mb-2 ${
                                  isCourseLocked ? 'blur-[3px] select-none opacity-60' : ''
                                }`}
                              >
                                {course.name}
                              </p>
                              <div
                                className={`flex items-center gap-4 mb-4 ${
                                  isCourseLocked ? 'blur-[3px] select-none opacity-60' : ''
                                }`}
                              >
                                <span className='eyebrow-mono text-[var(--color-ink-500)] flex items-center gap-1'>
                                  <FiClock className='w-3 h-3' /> {course.duration || 'Self-paced'}
                                </span>
                                <span className='eyebrow-mono text-[var(--color-ink-500)] flex items-center gap-1'>
                                  <FiBookOpen className='w-3 h-3' /> {course.Sections?.length || 0} sesi
                                </span>
                              </div>
                              <ButtonLink
                                href={learningModuleHref(course.id, course.is_authorize)}
                                className='inline-flex items-center gap-1 text-xs font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)] editorial-link'
                              >
                                {isCourseLocked ? 'Aktifkan membership' : 'Buka modul'}{' '}
                                <FiArrowRight className='w-3 h-3' />
                              </ButtonLink>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-center py-10 eyebrow-mono text-[var(--color-ink-500)]'>
                      Belum ada modul tersedia.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
