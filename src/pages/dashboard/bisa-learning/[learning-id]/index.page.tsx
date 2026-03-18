import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiPlay, FiAward, FiVideo, FiClock, FiCheck, FiDownload, FiLock, FiUnlock } from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';
import api from '@/lib/api';

export default withAuth(LearningDetailPage, 'user');

function LearningDetailPage() {
  const router = useRouter();
  const { 'learning-id': learningId } = router.query;
  const [secureUrl, setSecureUrl] = useState('');

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['module', learningId],
    queryFn: async () => {
      if (!learningId) return null;
      const res = await api.get(`/lms/modul/${learningId}`);
      const c = res.data.data;
      
      const topics = c.Sections && c.Sections.length > 0 
        ? c.Sections.map((s: any) => s.name)
        : ['Overview Course'];

      return {
        id: c.id,
        title: c.name,
        description: c.deskripsi?.deskripsi || 'Tidak ada deskripsi tersedia.',
        duration: c.duration || 'Video Tutorial',
        category: c.categoryId || 'General',
        videoId: c.videoId || '',
        pdfUrl: c.pdfUrl || null,
        pdfName: c.pdfName || 'Materi Pendukung.pdf',
        instructor: c.instructor || 'Mentor Raihasa',
        topics: topics,
      };
    },
    enabled: !!learningId,
  });

  useEffect(() => {
    if (course?.videoId) {
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        setSecureUrl(`https://www.youtube.com/embed/${course.videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0&origin=${origin}`);
      }
    }
  }, [course?.videoId]);

  if (isLoading) {
    return (
      <AdminDashboard withSidebar>
        <div className='container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]'>
            <div className='w-16 h-16 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mb-6'></div>
            <Typography>Memuat materi...</Typography>
        </div>
      </AdminDashboard>
    );
  }

  if (isError || !course) {
    return (
      <AdminDashboard withSidebar>
        <div className='container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]'>
          <Typography className='text-2xl font-bold text-gray-900 mb-2'>
            Materi tidak ditemukan
          </Typography>
          <p className='text-gray-500 mb-8'>Materi mungkin telah dihapus atau Anda tidak memiliki akses.</p>
          <ButtonLink href='/dashboard/bisa-learning' className='bg-[#1B7691] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#15627a]'>
            Kembali ke Learning Center
          </ButtonLink>
        </div>
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard
      withSidebar
      className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
        {/* Breadcrumb */}
        <div className='pt-6 pb-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <ButtonLink href='/dashboard/bisa-learning' className='hover:text-[#1B7691] font-medium'>
              BISA Learning
            </ButtonLink>
            <span className='opacity-30'>/</span>
            <span className='text-[#1B7691] font-bold'>{course.title}</span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Video Player */}
            <div className='bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white p-2'>
              <div className='aspect-video bg-gray-900 rounded-[2rem] overflow-hidden shadow-inner'>
                {secureUrl ? (
                  <iframe
                    src={secureUrl}
                    title={course.title}
                    className='w-full h-full'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                ) : (
                  <div className='w-full h-full flex flex-col items-center justify-center text-gray-400'>
                    <FiVideo size={48} className='mb-4 opacity-20' />
                    <p>Video tidak tersedia</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className='bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-50'>
              <div className='flex flex-wrap items-center gap-2 mb-6'>
                <span className='px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200'>
                  Premium Content
                </span>
                <span className='bg-blue-50 text-[#1B7691] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100'>
                  {course.category}
                </span>
              </div>

              <Typography variant='h1' className='text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight'>
                {course.title}
              </Typography>

              <div className='flex items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-900/20'>
                    {course.instructor.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className='font-bold text-gray-900'>{course.instructor}</p>
                    <p className='text-xs text-gray-500'>LMS Instructor</p>
                  </div>
                </div>
              </div>

              <div className='space-y-8'>
                <div className='prose prose-sm max-w-none text-gray-600 leading-relaxed'>
                  {course.description.split('\n').map((para: string, i: number) => (
                    <p key={i} className='mb-4 last:mb-0'>{para}</p>
                  ))}
                </div>
                
                <div className='bg-gray-50 rounded-[2rem] p-8 border border-gray-100'>
                  <Typography className='text-lg font-black text-gray-900 mb-6 flex items-center gap-2'>
                    <FiAward className='text-[#FB991A]' /> Apa yang kamu pelajari:
                  </Typography>
                  <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {course.topics.map((topic: string, index: number) => (
                      <li key={index} className='flex items-start gap-4 p-3 rounded-2xl bg-white border border-gray-100 transition-hover hover:border-[#1B7691]/30 hover:shadow-lg hover:shadow-[#1B7691]/5'>
                        <div className='w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 flex-shrink-0'>
                          <FiCheck />
                        </div>
                        <Typography className='text-gray-700 text-sm font-semibold leading-snug'>
                          {topic}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Download Materials */}
            {course.pdfUrl && (
              <div className='bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-50'>
                <Typography className='text-xl border-l-[6px] border-[#FB991A] pl-4 font-black text-gray-900 mb-6 uppercase tracking-wider'>
                  Materi Pendukung
                </Typography>
                <div className='bg-gradient-to-br from-[#1B7691] to-[#12586b] rounded-[2rem] p-8 text-white relative overflow-hidden group'>
                  <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150' />
                  <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-6'>
                    <div className='flex items-center gap-6 flex-1 min-w-0'>
                      <div className='w-20 h-20 bg-white rounded-3xl flex items-center justify-center flex-shrink-0 shadow-2xl -rotate-6 group-hover:rotate-0 transition-transform'>
                        <div className='text-center'>
                          <p className='text-red-500 font-black text-xs uppercase'>PDF</p>
                          <FiDownload className='text-[#1B7691]' size={24} />
                        </div>
                      </div>
                      <div className='flex-1 min-w-0 text-center md:text-left'>
                        <Typography className='text-xl font-black text-white truncate mb-1'>
                          {course.pdfName}
                        </Typography>
                        <Typography className='text-sm text-blue-100 opacity-80'>
                          Unduh materi lengkap dalam format PDF untuk belajar offline.
                        </Typography>
                      </div>
                    </div>
                    <a
                      href={course.pdfUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-[#FB991A] hover:bg-orange-500 text-white px-10 py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-xl shadow-orange-900/20 active:scale-95 whitespace-nowrap'
                    >
                      DOWNLOAD MATERI
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1 space-y-8'>
            {/* Course Summary Card */}
            <div className='bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-50'>
              <Typography className='text-xl font-black text-gray-900 mb-6 flex items-center gap-3'>
                <div className='w-8 h-1 bg-[#1B7691] rounded-full' /> Ringkasan
              </Typography>
              <div className='space-y-4'>
                <div className='flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1B7691] shadow-sm'>
                    <FiCheck size={24} />
                  </div>
                  <div>
                    <Typography className='text-lg font-black text-[#1B7691] leading-none mb-1'>
                      {course.topics.length}
                    </Typography>
                    <Typography className='text-[10px] uppercase font-bold text-gray-500 tracking-wider'>
                      Materi Utama
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-100'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm'>
                    <FiPlay size={24} />
                  </div>
                  <div>
                    <Typography className='text-lg font-black text-red-500 leading-none mb-1'>
                      Unlimited
                    </Typography>
                    <Typography className='text-[10px] uppercase font-bold text-gray-500 tracking-wider'>
                      Akses Video
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100'>
                  <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#FB991A] shadow-sm'>
                    <FiDownload size={24} />
                  </div>
                  <div>
                    <Typography className='text-lg font-black text-[#FB991A] leading-none mb-1'>
                      E-Book
                    </Typography>
                    <Typography className='text-[10px] uppercase font-bold text-gray-500 tracking-wider'>
                      Materi Download
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Message */}
            <div className='bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] shadow-xl p-8 text-white'>
              <Typography className='text-xl font-black mb-4 leading-tight'>Ada Pertanyaan Mengenai Materi?</Typography>
              <p className='text-blue-100 text-sm mb-6 opacity-80'>Mentor kami siap membantu menjelaskan bagian yang membingungkan.</p>
              <ButtonLink
                href='https://wa.me/yourwhatsapp'
                className='w-full bg-white text-indigo-700 px-6 py-4 rounded-2xl transition-all text-center font-black text-sm shadow-xl'
              >
                TANYA MENTOR
              </ButtonLink>
            </div>

            {/* Navigation */}
            <div className='flex flex-col gap-3'>
                <ButtonLink
                  href='/dashboard/bisa-learning'
                  className='w-full bg-white hover:bg-gray-50 text-gray-600 px-6 py-4 rounded-2xl transition-all text-center font-bold text-sm border border-gray-100'
                >
                  KEMBALI KE LIST KELAS
                </ButtonLink>
                <ButtonLink
                  href='/dashboard'
                  className='w-full bg-[#1B7691] hover:bg-[#15627a] text-white px-6 py-4 rounded-2xl transition-all text-center font-bold text-sm shadow-lg shadow-blue-900/10'
                >
                  DASHBOARD UTAMA
                </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}

