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

// Course Data (Consistent with Index Page)
const courseData = {
  'pertamina-sobat-bumi': {
    id: 'pertamina-sobat-bumi',
    title: 'Mastering Pertamina Sobat Bumi',
    subtitle: 'Panduan lengkap dari Awardee untuk menaklukkan setiap tahapan seleksi.',
    description: `A-Z Scholarship Series Beasiswa Pertamina Sobat Bumi akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Hilmy, video akan membahas seputar:

    • Kenalan sama Hilmy Fadel: Cerita Perjalanan dari 0 sampai 1 lewat Beasiswa SoBi
    • My Revenge Story: Gimana Kegagalan Bisa Jadi Bahan Bakar Menuju Versi Diri yang Lebih Baik
    • Beasiswa Pertamina Sobat Bumi: Apa Aja Benefitnya dan Gimana Cara Daftarnya
    • Timeline dan Teknis Pendaftaran: Panduan Lengkap Biar Nggak Salah Langkah
    • Tips Bikin Essay Juara: Mulai dari STAR Method sampai Bedah Essay Hilmy
    • Bedah Interview: Strategi Hadapi Interview dan Belajar dari Pengalaman Hilmy
    • Studi Kasus FGD: Contoh Jawaban yang Bikin Lolos vs Yang Bikin Gagal`,
    duration: '45 Menit',
    type: 'video',
    level: 'Intermediate',
    category: 'Pertamina Sobat Bumi',
    videoUrl: 'https://www.youtube.com/embed/2qkHDmjfqb8',
    videoId: '2qkHDmjfqb8',
    pdfUrl: 'https://drive.google.com/file/d/1dV5_moVl1UuMvFnhjq2C--1l0NW-Z8jQ/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa PERTAMINA Sobat Bumi (SOBI).pdf',
    instructor: 'Hilmy Fadel',
    topics: [
      'Intro: Kenalan sama Hilmy Fadel',
      'My Revenge Story: From Failure to Success',
      'Beasiswa Pertamina Sobat Bumi Explained',
      'Timeline dan Teknis Pendaftaran',
      'Tips Bikin Essay Juara (STAR Method)',
      'Bedah Interview & Mockup',
      'Studi Kasus FGD & Tips Lolos',
    ],
  },
  'tanoto-teladan': {
    id: 'tanoto-teladan',
    title: 'Rahasia Lolos TANOTO TELADAN',
    subtitle: 'Persiapan komprehensif menuju pemimpin masa depan.',
    description: `A-Z Scholarship Series Beasiswa TANOTO Foundation akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Fazmi, video akan membahas seputar:

    • Kenalan sama Fazmi dari TELADAN!
    • Apa itu Beasiswa TELADAN?
    • Proses Seleksi TELADAN
    • How to be outstanding in ADMINISTRATION Process?
    • Crafting your leadership story through ESSAY
    • Tahapan & Tips Sukses dalam setiap ASSESSMENT`,
    duration: '52 Menit',
    type: 'video',
    level: 'Advanced',
    category: 'TANOTO Foundation',
    videoUrl: 'https://www.youtube.com/embed/FhLU38bFTTU',
    videoId: 'FhLU38bFTTU',
    pdfUrl: 'https://drive.google.com/file/d/1huT2K2fPrDTdjCTR8wJbZRpPab5XHSaw/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa TANOTO Foundation.pdf',
    instructor: 'Fazmi Rizki',
    topics: [
      'Kenalan sama Fazmi dari TELADAN!',
      'Apa itu Beasiswa TELADAN?',
      'Proses Seleksi TELADAN',
      'Outstanding in Administration',
      'Crafting Your Leadership Essay',
      'Assessment & LGD Tips',
      'Final Interview Secrets',
    ],
  },
  'bright-scholarship': {
    id: 'bright-scholarship',
    title: 'Bright Scholarship Bootcamp',
    subtitle: 'Langkah pasti menuju masa depan cerah.',
    description: 'Dapatkan insight eksklusif tentang personal statement dan prediksi pertanyaan interview langsung dari Dinar Annasta.',
    duration: '38 Menit',
    type: 'video',
    level: 'Beginner',
    category: 'Bright Scholarship',
    videoUrl: 'https://www.youtube.com/embed/KmVYW3yBy2Y',
    videoId: 'KmVYW3yBy2Y',
    pdfUrl: 'https://drive.google.com/file/d/10grQn5ja0yUZghgqIn2IKPxU3NqC1LiC/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa BRIGHT.pdf',
    instructor: 'Dinar Annasta',
    topics: [
      'Introduction to Bright Scholarship',
      'Tahapan Seleksi & Administrasi',
      'Writing Personal Statement',
      'Interview Predictions',
      'Preparation Checklist'
    ],
  },
  'bakti-bca': {
    id: 'bakti-bca',
    title: 'Strategi Jitu Bakti BCA',
    subtitle: 'Siapkan dirimu untuk salah satu beasiswa paling bergengsi.',
    description: 'Panduan step-by-step dari Shabrina Yasmin, mulai dari pemberkasan hingga menaklukkan tes online dan interview.',
    duration: '48 Menit',
    type: 'video',
    level: 'All Levels',
    category: 'Bakti BCA',
    videoUrl: 'https://www.youtube.com/embed/Dpk5kXWd9E0',
    videoId: 'Dpk5kXWd9E0',
    pdfUrl: 'https://drive.google.com/file/d/18nU0SfK1qJtJRi09uncyDHqQwvEa19bW/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Bakti BCA.pdf',
    instructor: 'Shabrina Yasmin',
    topics: [
      'Introduction: Meet Shabrina',
      'Beasiswa Bakti BCA Overview',
      'Tahapan Seleksi',
      'Short Essay Writing',
      'Nailing the Assessment',
      'Online Interview Tips'
    ],
  },
  'kse-scholarship': {
    id: 'kse-scholarship',
    title: 'Sukses Beasiswa KSE',
    subtitle: 'Karya Salemba Empat: Lebih dari sekadar bantuan biaya.',
    description: 'Tips administrasi dan essay, serta rahasia menghadapi dua tahap interview yang menantang bersama Prisilia Dita.',
    duration: '42 Menit',
    type: 'video',
    level: 'Intermediate',
    category: 'Karya Salemba Empat',
    videoUrl: 'https://www.youtube.com/embed/dnOoatalKlU',
    videoId: 'dnOoatalKlU',
    pdfUrl: 'https://drive.google.com/file/d/1WSIDWTAFBB6Pa7O3PUJwL1U6fi0jtfWk/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa KSE.pdf',
    instructor: 'Prisilia Dita',
    topics: [
      'Introduction to KSE',
      'PKSE & Benefits',
      'Administration Tips',
      'Essay Writing Secrets',
      'Interview Stage 1 & 2'
    ],
  },
  'beasiswa-unggulan': {
    id: 'beasiswa-unggulan',
    title: 'Masterclass Beasiswa Unggulan',
    subtitle: 'Wujudkan mimpi kuliah gratis dengan Beasiswa Unggulan Kemendikbud.',
    description: 'Bedah tuntas persyaratan, tips essay, persiapan UKBI, dan simulasi interview bersama Reza Nafi.',
    duration: '60 Menit',
    type: 'video',
    level: 'Advanced',
    category: 'Beasiswa Unggulan',
    videoUrl: 'https://www.youtube.com/embed/youqpWSv3qU',
    videoId: 'youqpWSv3qU',
    pdfUrl: 'https://drive.google.com/file/d/1nb79DkV0FK95D_JdbEWk9MAMV3WVGeLW/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Unggulan.pdf',
    instructor: 'Reza Nafi',
    topics: [
      'Introduction: Meet Afa',
      'Persyaratan Umum & Khusus',
      'Bedah Tips Essay',
      'Persiapan Tes UKBI',
      'Tahap Interview',
      'Tutorial Pendaftaran'
    ],
  },
  'indonesia-bangkit': {
    id: 'indonesia-bangkit',
    title: 'Panduan Beasiswa Indonesia Bangkit',
    subtitle: 'Raih pendidikan terbaik dengan beasiswa kolaborasi Kemenag & LPDP.',
    description: 'Pelajari alur seleksi, tips tes skolastik, dan kunci sukses interview bersama Hasna Zahra.',
    duration: '55 Menit',
    type: 'video',
    level: 'Intermediate',
    category: 'Indonesia Bangkit',
    videoUrl: 'https://www.youtube.com/embed/ECXJ47jHSz0',
    videoId: 'ECXJ47jHSz0',
    pdfUrl: 'https://drive.google.com/file/d/1SHIR4yKRik52Z-XvGlC38Zng4bd8e14v/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Indonesia Bangkit.pdf',
    instructor: 'Hasna Zahra',
    topics: [
      'Introduction to BIB',
      'Alur Seleksi',
      'Essay Writing Guide',
      'Tes Skolastik Prep',
      'Interview Success Keys',
      'Step-by-step Registration'
    ],
  },
  'paragon-scholarship': {
    id: 'paragon-scholarship',
    title: 'Paragon Scholarship Program',
    subtitle: 'Beasiswa dari perusahaan kosmetik terbesar di Indonesia.',
    description: 'Persiapan CV, Essay, Online Test, hingga Interview korporat bersama Floren Aliza.',
    duration: '40 Menit',
    type: 'video',
    level: 'All Levels',
    category: 'Paragon',
    videoUrl: 'https://www.youtube.com/embed/iqKSSnao_a4',
    videoId: 'iqKSSnao_a4',
    pdfUrl: 'https://drive.google.com/file/d/13UQqMOfO1JvtHViYNn1mOo7hG5u_Q7pj/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Paragon.pdf',
    instructor: 'Floren Aliza',
    topics: [
      'Introduction: Why Scholarship?',
      'Paragon Scholarship Journey',
      'CV & Essay Preparation',
      'Online Test Strategy',
      'Corporate Interview Tips'
    ],
  },
};

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

  const course = courseData[learningId as keyof typeof courseData];

  // Listen to YouTube Iframe Message for Progress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Strict origin check could be problematic with localhost, but standard is youtube.com
      // We'll trust the event structure for now as a soft check
      try {
        if (typeof event.data !== 'string') return;
        const data = JSON.parse(event.data);

        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime) setCurrentTime(data.info.currentTime);
          if (data.info.duration) setDuration(data.info.duration);

          // Also sync playing state if possible
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
        progress: Math.floor(Math.random() * 60) + 10, // Mock progress for demo
        lastLesson: course.topics[activeLesson] || course.topics[0]
      };
      localStorage.setItem('lastViewedCourse', JSON.stringify(lastViewedData));

      // Set Secure URL with strict parameters
      // controls=0: Hide ALL YouTube controls
      // modestbranding=1: Minimize logo
      // rel=0: Show related videos from same channel only
      // enablejsapi=1: Allow us to control play/pause AND Receive Events
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        setSecureUrl(`https://www.youtube.com/embed/${course.videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&showinfo=0&disablekb=1&fs=0&origin=${origin}`);
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

  const changeSpeed = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': 'setPlaybackRate',
        'args': [nextRate]
      }), '*');
    }
  };

  const skip = (amount: number) => {
    const newTime = currentTime + amount;
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': 'seekTo',
        'args': [newTime, true]
      }), '*');
      // Optimistic update
      setCurrentTime(newTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': 'seekTo',
        'args': [time, true]
      }), '*');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err: any) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
              <p className='text-gray-500 mt-2 max-w-3xl'>{course.subtitle}</p>
            </div>
          </div>

          <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

              {/* LEFT: Video Player & Content */}
              <div className='lg:col-span-2'>
                {/* PROTECTED Video Player */}
                <div
                  ref={containerRef}
                  className='bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group select-none'
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* 1. The IFrame */}
                  <iframe
                    ref={iframeRef}
                    src={secureUrl}
                    title={course.title}
                    className='w-full h-full pointer-events-none'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen={false}
                  />

                  {/* 2. Transparent Interaction Layer */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={togglePlay}
                    onContextMenu={(e) => e.preventDefault()}
                  ></div>

                  {/* 3. Custom Play/Pause Overlay */}
                  <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-white/20 p-5 rounded-full backdrop-blur-md border border-white/30 shadow-2xl transform scale-100">
                      <FiPlay className="w-12 h-12 text-white ml-1 filter drop-shadow-lg" />
                    </div>
                  </div>

                  {/* 4. Custom Control Bar (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none p-4 pb-2">

                    {/* Progress Bar Row */}
                    <div className="w-full flex items-center gap-3 mb-2 pointer-events-auto">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full"
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between w-full pointer-events-auto">
                      <div className="flex items-center gap-4">
                        <button
                          className="text-white hover:text-[#1B7691] transition-colors"
                          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        >
                          {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
                        </button>

                        {/* Skip Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            className="text-white/80 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); skip(-10); }}
                            title="-10s"
                          >
                            <FiRewind className="w-5 h-5" />
                          </button>
                          <button
                            className="text-white/80 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); skip(10); }}
                            title="+10s"
                          >
                            <FiFastForward className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Speed */}
                        <button
                          className="text-white hover:text-[#1B7691] transition-colors text-xs font-bold w-12 text-center bg-white/10 rounded py-1 ml-2"
                          onClick={(e) => { e.stopPropagation(); changeSpeed(); }}
                          title="Playback Speed"
                        >
                          {playbackRate}x
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-white text-xs px-2 py-1 bg-white/20 rounded font-bold flex items-center gap-1 backdrop-blur-md">
                          <FiLock className="w-3 h-3" /> Protected
                        </div>

                        <button
                          className="text-white hover:text-[#1B7691] transition-colors"
                          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                          title="Fullscreen"
                        >
                          <FiMaximize className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
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
                  {/* <div className='flex gap-2'>
                    <button className='p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors' title='Bookmark'><FiBookmark /></button>
                    <button className='p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors' title='Share'><FiShare2 /></button>
                  </div> */}
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

                      <div className='mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100'>
                        <h3 className='font-bold text-[#1B7691] mb-3 flex items-center gap-2'>
                          <FiCheckCircle /> What needs to be prepared?
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> Motivation Letter</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> CV / Resume</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> English Proficiency Test</div>
                          <div className='flex items-center gap-2 text-sm'><div className='w-1.5 h-1.5 bg-[#FB991A] rounded-full'></div> Recommendation Letter</div>
                        </div>
                      </div>
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

              {/* RIGHT: Playlist Sidebar */}
              <div className='lg:col-span-1'>
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24'>
                  <div className='p-6 bg-[#1B7691] text-white'>
                    <h3 className='font-bold text-lg mb-4'>Course Content</h3>
                    {/* Fake Progress Bar */}
                    <div className='mt-4 flex items-center justify-between text-xs font-bold mb-1'>
                      <span>Your Progress</span>
                      <span>0%</span>
                    </div>
                    <div className='w-full bg-black/20 rounded-full h-1.5 overflow-hidden'>
                      <div className='bg-[#FB991A] h-full w-0'></div>
                    </div>
                  </div>

                  <div className='max-h-[600px] overflow-y-auto custom-scrollbar bg-gray-50'>
                    {course.topics.map((topic, index) => (
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
              </div>

            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
