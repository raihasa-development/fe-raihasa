import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import {
  FiPlay, FiCheckCircle, FiDownload, FiChevronLeft, FiShare2, FiBookmark, FiMessageSquare, FiFileText, FiPause, FiLock, FiMaximize, FiRewind, FiFastForward
} from 'react-icons/fi';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import SEO from '@/components/SEO';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';

export default withAuth(LearningDetailPage, 'user');

function LearningDetailPage() {
  const router = useRouter();
  const { 'learning-id': learningId } = router.query;
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState(0);

  // Video Player Logic
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [secureUrl, setSecureUrl] = useState('');

  // Progress Logic
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Course Data State
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canAccessModule, setCanAccessModule] = useState(false);
  const [membership, setMembership] = useState<{
    active: boolean;
    until: string | null;
    loading: boolean;
  }>({
    active: false,
    until: null,
    loading: true,
  });

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const token = getToken();
        if (!token) {
          setMembership({ active: false, until: null, loading: false });
          return;
        }

        const res = await api.get('/pricing/subscription/status');
        const data = res.data?.data;

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

  // Fetch Course Detail
  useEffect(() => {
    const fetchCourse = async () => {
      if (!learningId || membership.loading) return;
      try {
        const response = await api.get(`/lms/modul/${learningId}`);
        const data = response.data.data;
        setCanAccessModule(Boolean(data?.is_authorize));
        
        // Transform data to match required UI structure
        const transformed = {
          id: data.id,
          is_free: Boolean(data.is_free),
          title: data.name,
          subtitle: data.instructor_role || 'Scholarship Preparation',
          description: data.deskripsi || '',
          duration: data.duration || '0m',
          type: 'video',
          level: data.level || 'All Levels',
          category: data.categoryId || 'General',
          videoId: data.videoId || '',
          pdfUrl: data.pdfUrl || null,
          pdfName: data.pdfName || 'Materi.pdf',
          instructor: data.instructor || 'Mintor',
          topics: data.Sections?.length > 0 
            ? data.Sections.map((s: any) => s.name) 
            : ['Introduction', 'Core Material', 'Conclusion'],
        };
        setCourse(transformed);
      } catch (error) {
        console.error('Error fetching course detail:', error);
        setCanAccessModule(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [learningId, membership.loading, membership.active]);

  // Listen to YouTube Iframe Message for Progress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data !== 'string') return;
        const data = JSON.parse(event.data);

        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime) setCurrentTime(data.info.currentTime);
          if (data.info.duration) setDuration(data.info.duration);

          if (data.info.playerState) {
            setIsPlaying(data.info.playerState === 1);
          }
        }
      } catch (error) { }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Logic to save 'Last Viewed' course
  useEffect(() => {
    if (course) {
      const lastViewedData = {
        id: course.id,
        title: course.title,
        thumbnail: `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`,
        progress: 10, // Default progress
        lastLesson: course.topics[activeLesson] || course.topics[0]
      };
      localStorage.setItem('lastViewedCourse', JSON.stringify(lastViewedData));

      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        setSecureUrl(`https://www.youtube.com/embed/${course.videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0&disablekb=0&fs=1&origin=${origin}`);
      }
    }
  }, [course, activeLesson]);

  const togglePlay = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': action,
        'args': []
      }), '*');
      setIsPlaying(!isPlaying);
    }
  };

  if (membership.loading || isLoading) {
    return (
        <Layout withNavbar={true} withFooter={true}>
            <div className='container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center'>
                <div className='w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mb-4'></div>
                <Typography>Loading Lesson...</Typography>
            </div>
        </Layout>
    );
  }

  if (!canAccessModule) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <SEO title='Akses Terkunci - BISA Learning' />
        <main className='min-h-screen bg-[#F8FAFC] pt-28 pb-16 px-4'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm'>
              <div className='relative rounded-2xl overflow-hidden mb-6'>
                <div className='h-[260px] bg-gradient-to-r from-[#1B7691]/70 to-[#0F4C61]/70 blur-[1px]' />
                <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center px-6'>
                  <div className='w-14 h-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-4'>
                    <FiLock className='w-7 h-7 text-white' />
                  </div>
                  <Typography className='text-white text-xl md:text-2xl font-bold mb-2'>Konten Premium Terkunci</Typography>
                  <Typography className='text-white/85 text-sm md:text-base max-w-xl'>
                    Modul ini hanya tersedia untuk member aktif. Aktifkan membership untuk membuka seluruh materi dan video belajar.
                  </Typography>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <ButtonLink href='/products' className='px-5 py-3 rounded-xl bg-[#FB991A] text-white font-semibold hover:bg-orange-600 transition-colors'>
                  Aktifkan Membership
                </ButtonLink>
                <ButtonLink href='/bisa-learning' className='px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors'>
                  Kembali ke Learning Center
                </ButtonLink>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout withNavbar={true} withFooter={true}>
        <div className='container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400'>
            <FiPlay className='w-8 h-8' />
          </div>
          <Typography className='text-2xl font-bold text-gray-900 mb-2'>
            Kursus tidak ditemukan
          </Typography>
          <p className='text-gray-500 mb-8'>Mungkin URL salah atau kursus telah dihapus.</p>
          <ButtonLink href='/bisa-learning' className='bg-[#1B7691] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#15627a] transition-all'>
            Kembali ke Learning Center
          </ButtonLink>
        </div>
      </Layout>
    );
  }

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`${course.title} - BISA Learning`} />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
        }
        
        /* Custom Range Slider */
        input[type=range] {
           -webkit-appearance: none;
           background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
           -webkit-appearance: none;
           height: 12px;
           width: 12px;
           border-radius: 50%;
           background: #1B7691;
           cursor: pointer;
           margin-top: -4px;
        }
        input[type=range]::-webkit-slider-runnable-track {
           width: 100%;
           height: 4px;
           cursor: pointer;
           background: rgba(255,255,255,0.3);
           border-radius: 2px;
        }
      `}</style>

      {/* Disable Context Menu Globally for this page to handle "Copy Link" attempts */}
      <div onContextMenu={(e) => e.preventDefault()}>

        <main className='min-h-screen bg-[#F8FAFC] pb-20 pt-20'>
          {/* Breadcrumb & Title Header */}
          <div className='bg-white border-b border-gray-200'>
            <div className='container mx-auto px-4 py-6'>
              <div className='flex items-center gap-2 text-sm text-gray-500 mb-4'>
                <ButtonLink href='/bisa-learning' className='hover:text-[#1B7691] flex items-center gap-1 transition-colors'>
                  <FiChevronLeft /> Learning Center
                </ButtonLink>
                <span className='text-gray-300'>/</span>
                <span className='max-w-[200px] truncate'>{course.category}</span>
                <span className='text-gray-300'>/</span>
                <span className='text-[#1B7691] font-medium max-w-[200px] truncate'>{course.title}</span>
              </div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>{course.title}</h1>
              {course.is_free && (
                <div className='mt-3'>
                  <span className='inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide border border-emerald-200'>
                    Free Access
                  </span>
                </div>
              )}
              <p className='text-gray-500 mt-2 max-w-3xl'>{course.subtitle}</p>
            </div>
          </div>

          <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

              {/* LEFT: Video Player & Content */}
              <div className='lg:col-span-3'>
                {/* PROTECTED Video Player */}
                <div className='bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative'>
                  <iframe
                    ref={iframeRef}
                    src={secureUrl}
                    title={course.title}
                    className='w-full h-full'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
                    allowFullScreen
                  />
                </div>

                {/* Action Bar */}
                <div className='flex items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1B7691] font-bold border border-gray-200'>
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <p className='text-sm font-bold text-gray-900'>{course.instructor}</p>
                      <p className='text-xs text-gray-500'>Mentor</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className='mt-8'>
                  <div className='flex border-b border-gray-200 mb-6'>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-[#1B7691] text-[#1B7691]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'resources' ? 'border-[#1B7691] text-[#1B7691]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      Resources
                    </button>
                  </div>

                  {activeTab === 'overview' && (
                    <div className='prose max-w-none text-sm text-gray-600 space-y-4'>
                      <p className='whitespace-pre-line leading-relaxed'>
                        {course.description}
                      </p>

                      {/* <div className='mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100'>
                        <h3 className='font-bold text-[#1B7691] mb-3 flex items-center gap-2'>
                          <FiCheckCircle /> What needs to be prepared?
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> Motivation Letter</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> CV / Resume</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> English Proficiency Test</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> Recommendation Letter</div>
                        </div>
                      </div> */}
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className='space-y-4'>
                      {course.pdfUrl ? (
                        <div className='flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow'>
                          <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500'>
                              <FiFileText className='w-6 h-6' />
                            </div>
                            <div>
                              <h4 className='font-bold text-gray-900 text-sm mb-1'>{course.pdfName}</h4>
                              <p className='text-xs text-gray-500'>PDF Document • Enhanced Material</p>
                            </div>
                          </div>
                          <a href={course.pdfUrl} target='_blank' rel='noreferrer' className='text-[#1B7691] font-bold text-sm flex items-center gap-2 hover:underline'>
                            <FiDownload /> Download
                          </a>
                        </div>
                      ) : (
                        <div className='text-center py-10 text-gray-400'>No resources available for this course.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Playlist Sidebar - COMMENTED OUT AS REQUESTED */}
              {/* <div className='lg:col-span-1'>
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24'>
                  <div className='p-6 bg-[#1B7691] text-white'>
                    <h3 className='font-bold text-lg mb-4'>Course Content</h3>
                    <div className='mt-4 flex items-center justify-between text-xs font-bold mb-1'>
                      <span>Your Progress</span>
                      <span>0%</span>
                    </div>
                    <div className='w-full bg-black/20 rounded-full h-1.5 overflow-hidden'>
                      <div className='bg-[#FB991A] h-full w-0'></div>
                    </div>
                  </div>

                  <div className='max-h-[600px] overflow-y-auto custom-scrollbar bg-gray-50'>
                    {course.topics.map((topic: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setActiveLesson(index)}
                        className={`w-full text-left p-4 border-b border-gray-100 transition-colors hover:bg-white flex items-start gap-3 group ${activeLesson === index ? 'bg-white border-l-4 border-l-[#1B7691]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${activeLesson === index ? 'bg-[#1B7691] text-white border-[#1B7691]' : 'border-gray-300 text-gray-400'}`}>
                          {index + 1}
                        </div>
                        <div className='flex-1'>
                          <p className={`text-sm font-medium leading-snug group-hover:text-[#1B7691] ${activeLesson === index ? 'text-[#1B7691]' : 'text-gray-700'}`}>
                            {topic}
                          </p>
                          <div className='flex items-center gap-1 mt-1.5 text-[10px] text-gray-400'>
                            <FiPlay className='w-3 h-3' /> Video
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div> */}

            </div>
          </div>
        </main>
      </div >
    </Layout >
  );
}
