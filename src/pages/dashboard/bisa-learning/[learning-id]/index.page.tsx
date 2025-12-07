import { useRouter } from 'next/router';
import React from 'react';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

// Hardcoded course data with YouTube and Google Drive links
const courseData = {
  'pertamina-sobat-bumi': {
    id: 'pertamina-sobat-bumi',
    title: 'Pertamina Sobat Bumi',
    description: `A-Z Scholarship Series Beasiswa Pertamina Sobat Bumi akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Hilmy, video akan membahas seputar:

• Kenalan sama Hilmy Fadel: Cerita Perjalanan dari 0 sampai 1 lewat Beasiswa SoBi
• My Revenge Story: Gimana Kegagalan Bisa Jadi Bahan Bakar Menuju Versi Diri yang Lebih Baik
• Beasiswa Pertamina Sobat Bumi: Apa Aja Benefitnya dan Gimana Cara Daftarnya
• Timeline dan Teknis Pendaftaran: Panduan Lengkap Biar Nggak Salah Langkah
• Tips Bikin Essay Juara: Mulai dari STAR Method sampai Bedah Essay Hilmy
• Bedah Interview: Strategi Hadapi Interview dan Belajar dari Pengalaman Hilmy
• Studi Kasus FGD: Contoh Jawaban yang Bikin Lolos vs Yang Bikin Gagal`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Pertamina Sobat Bumi',
    videoUrl: 'https://www.youtube.com/embed/2qkHDmjfqb8',
    pdfUrl: 'https://drive.google.com/file/d/1dV5_moVl1UuMvFnhjq2C--1l0NW-Z8jQ/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa PERTAMINA Sobat Bumi (SOBI).pdf',
    instructor: 'Hilmy Fadel',
    topics: [
      'Kenalan sama Hilmy Fadel: Cerita Perjalanan dari 0 sampai 1 lewat Beasiswa SoBi',
      'My Revenge Story: Gimana Kegagalan Bisa Jadi Bahan Bakar Menuju Versi Diri yang Lebih Baik',
      'Beasiswa Pertamina Sobat Bumi: Apa Aja Benefitnya dan Gimana Cara Daftarnya',
      'Timeline dan Teknis Pendaftaran: Panduan Lengkap Biar Nggak Salah Langkah',
      'Tips Bikin Essay Juara: Mulai dari STAR Method sampai Bedah Essay Hilmy',
      'Bedah Interview: Strategi Hadapi Interview dan Belajar dari Pengalaman Hilmy',
      'Studi Kasus FGD: Contoh Jawaban yang Bikin Lolos vs Yang Bikin Gagal',
    ],
  },
  'tanoto-teladan': {
    id: 'tanoto-teladan',
    title: 'Beasiswa TANOTO Foundation',
    description: `A-Z Scholarship Series Beasiswa TANOTO Foundation akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Fazmi, video akan membahas seputar:

• Kenalan sama Fazmi dari TELADAN!
• Apa itu Beasiswa TELADAN?
• Proses Seleksi TELADAN
• How to be outstanding in ADMINISTRATION Process?
• Crafting your leadership story through ESSAY - Bedah Essay Fazmi
• Tahapan & Tips Sukses dalam setiap ASSESSMENT
• LGD itu harusnya gini...
• Last step: Let's talk about INTERVIEW
• Bring these TIPS on your pocket in every step
• Pesan dari Fazmi untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'TANOTO Foundation',
    videoUrl: 'https://www.youtube.com/embed/FhLU38bFTTU',
    pdfUrl: 'https://drive.google.com/file/d/1huT2K2fPrDTdjCTR8wJbZRpPab5XHSaw/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa TANOTO Foundation.pdf',
    instructor: 'Fazmi Rizki Al Ghifari',
    topics: [
      'Kenalan sama Fazmi dari TELADAN!',
      'Apa itu Beasiswa TELADAN?',
      'Proses Seleksi TELADAN',
      'How to be outstanding in ADMINISTRATION Process?',
      'Crafting your leadership story through ESSAY - Bedah Essay Fazmi',
      'Tahapan & Tips Sukses dalam setiap ASSESSMENT',
      'LGD itu harusnya gini...',
      'Last step: Let\'s talk about INTERVIEW',
      'Bring these TIPS on your pocket in every step',
      'Pesan dari Fazmi untuk Peraih Asa',
    ],
  },
  'bright-scholarship': {
    id: 'bright-scholarship',
    title: 'Bright Scholarship',
    description: `A-Z Scholarship Series Beasiswa Bright Scholarship akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Dinar, video akan membahas seputar:

• Kenalan sama Dinar dari Bright Scholarship!
• Get to know Bright Scholarship
• Tahapan Seleksi & Administrasi
• Create your Personal Statement
• Bedah personal statement Dinar
• Prediksi pertanyaan Interview
• Persiapkan hal ini sebelum mendaftar!
• Pesan dari Dinar untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Bright Scholarship',
    videoUrl: 'https://www.youtube.com/embed/KmVYW3yBy2Y',
    pdfUrl: 'https://drive.google.com/file/d/10grQn5ja0yUZghgqIn2IKPxU3NqC1LiC/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa BRIGHT.pdf',
    instructor: 'Dinar Annasta Naja Mayra',
    topics: [
      'Kenalan sama Dinar dari Bright Scholarship!',
      'Get to know Bright Scholarship',
      'Tahapan Seleksi & Administrasi',
      'Create your Personal Statement',
      'Bedah personal statement Dinar',
      'Prediksi pertanyaan Interview',
      'Persiapkan hal ini sebelum mendaftar!',
      'Pesan dari Dinar untuk Peraih Asa',
    ],
  },
  'bakti-bca': {
    id: 'bakti-bca',
    title: 'Beasiswa Bakti BCA',
    description: `A-Z Scholarship Series Beasiswa Bakti BCA akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Shabrina, video akan membahas seputar:

• Kenalan sama Shabrina dari Bakti BCA!
• Persiapkan hal ini sebelum mendaftar selama masa perkuliahan
• Apa itu Beasiswa Bakti BCA?
• Tahapan seleksi Bakti BCA
• Persyaratan & Berkas Administrasi
• Short Essay - Bedah Essay Shabrina
• Let's nail your Assessment & Interview!
• Assessment 1 & 2
• Teknis & Tips Online Interview - Bedah Interview Shabrina
• Timeline & Alur Pendaftaran
• Checklist your preparation
• Pesan dari Shabrina untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Bakti BCA',
    videoUrl: 'https://www.youtube.com/embed/Dpk5kXWd9E0',
    pdfUrl: 'https://drive.google.com/file/d/18nU0SfK1qJtJRi09uncyDHqQwvEa19bW/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Bakti BCA.pdf',
    instructor: 'Shabrina Yasmin',
    topics: [
      'Kenalan sama Shabrina dari Bakti BCA!',
      'Persiapkan hal ini sebelum mendaftar selama masa perkuliahan',
      'Apa itu Beasiswa Bakti BCA?',
      'Tahapan seleksi Bakti BCA',
      'Persyaratan & Berkas Administrasi',
      'Short Essay - Bedah Essay Shabrina',
      'Let\'s nail your Assessment & Interview!',
      'Assessment 1 & 2',
      'Teknis & Tips Online Interview - Bedah Interview Shabrina',
      'Timeline & Alur Pendaftaran',
      'Checklist your preparation',
      'Pesan dari Shabrina untuk Peraih Asa',
    ],
  },
  'kse-scholarship': {
    id: 'kse-scholarship',
    title: 'Beasiswa Karya Salemba Empat (KSE)',
    description: `A-Z Scholarship Series Beasiswa Karya Salemba Empat (KSE) akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Prisilia, video akan membahas seputar:

• Kenalan sama Prisilia dari Beasiswa KSE!
• Get to know Beasiswa KSE
• About PKSE
• Fastrack KSE for you!
• Step 1: Administration tips - Bedah berkas Prisilia
• Step 2: Essay tips - Bedah essay Prisilia
• Mastering Interview Stage 1
• Mastering Interview Stage 2
• Pesan dari Prisilia untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Karya Salemba Empat',
    videoUrl: 'https://www.youtube.com/embed/dnOoatalKlU',
    pdfUrl: 'https://drive.google.com/file/d/1WSIDWTAFBB6Pa7O3PUJwL1U6fi0jtfWk/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa KSE.pdf',
    instructor: 'Prisilia Dita Sepirasari',
    topics: [
      'Kenalan sama Prisilia dari Beasiswa KSE!',
      'Get to know Beasiswa KSE',
      'About PKSE',
      'Fastrack KSE for you!',
      'Step 1: Administration tips - Bedah berkas Prisilia',
      'Step 2: Essay tips - Bedah essay Prisilia',
      'Mastering Interview Stage 1',
      'Mastering Interview Stage 2',
      'Pesan dari Prisilia untuk Peraih Asa',
    ],
  },
  'beasiswa-unggulan': {
    id: 'beasiswa-unggulan',
    title: 'Beasiswa Unggulan',
    description: `A-Z Scholarship Series Beasiswa Unggulan akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Afa, video akan membahas seputar:

• Kenalan sama Afa dari Beasiswa Unggulan!
• Apa itu Beasiswa Unggulan?
• Persyaratan umum & khusus BU
• Bedah & Tips Essay Afa
• Bedah Tes UKBI
• Cek kelengkapan berkasmu!
• Do & Don'ts: Tahap Administrasi
• Menguasai tahap Interview - Bedah interview Afa
• Timeline pendaftaran
• Tutorial pendaftaran
• Pesan dari Afa untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Beasiswa Unggulan',
    videoUrl: 'https://www.youtube.com/embed/youqpWSv3qU',
    pdfUrl: 'https://drive.google.com/file/d/1nb79DkV0FK95D_JdbEWk9MAMV3WVGeLW/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Unggulan.pdf',
    instructor: 'Reza Nafi Rizqi Musyaffa',
    topics: [
      'Kenalan sama Afa dari Beasiswa Unggulan!',
      'Apa itu Beasiswa Unggulan?',
      'Persyaratan umum & khusus BU',
      'Bedah & Tips Essay Afa',
      'Bedah Tes UKBI',
      'Cek kelengkapan berkasmu!',
      'Do & Don\'ts: Tahap Administrasi',
      'Menguasai tahap Interview - Bedah interview Afa',
      'Timeline pendaftaran',
      'Tutorial pendaftaran',
      'Pesan dari Afa untuk Peraih Asa',
    ],
  },
  'indonesia-bangkit': {
    id: 'indonesia-bangkit',
    title: 'Beasiswa Indonesia Bangkit',
    description: `A-Z Scholarship Series Beasiswa Indonesia Bangkit akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Hasna, video akan membahas seputar:

• Kenalan sama Hasna dari Beasiswa Indonesia Bangkit!
• Get to know Beasiswa Indonesia Bangkit
• Alur seleksi BIB
• Dokumen pendaftaran yang perlu kamu siapkan
• How to write essay - Bedah Essay Hasna
• Kupas tuntas Tes Skolastik
• Interview
• Persiapkan ini dari sekarang
• Step by step mendaftar BIB
• Kunci sukses penerima beasiswa
• Pesan dari Hasna untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Indonesia Bangkit',
    videoUrl: 'https://www.youtube.com/embed/ECXJ47jHSz0',
    pdfUrl: 'https://drive.google.com/file/d/1SHIR4yKRik52Z-XvGlC38Zng4bd8e14v/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Indonesia Bangkit.pdf',
    instructor: 'Hasna Zahra Annabilah',
    topics: [
      'Kenalan sama Hasna dari Beasiswa Indonesia Bangkit!',
      'Get to know Beasiswa Indonesia Bangkit',
      'Alur seleksi BIB',
      'Dokumen pendaftaran yang perlu kamu siapkan',
      'How to write essay - Bedah Essay Hasna',
      'Kupas tuntas Tes Skolastik',
      'Interview',
      'Persiapkan ini dari sekarang',
      'Step by step mendaftar BIB',
      'Kunci sukses penerima beasiswa',
      'Pesan dari Hasna untuk Peraih Asa',
    ],
  },
  'paragon-scholarship': {
    id: 'paragon-scholarship',
    title: 'Beasiswa Paragon',
    description: `A-Z Scholarship Series Beasiswa Paragon akan mengupas tuntas tips and tricks lolos bareng sama Awardee langsung! Bersama dengan Kak Flo, video akan membahas seputar:

• Kenalan sama Flo dari Paragon Scholarship Program!
• Kenapa sih harus banget dapet beasiswa?
• Paragon Scholarship Journey
• Why should PSP?
• Let's get to know Paragon Scholarship Program
• Timeline PSP
• Registration preparation
• CV preparation - Bedah CV Flo
• Essay preparation - Bedah Essay Flo
• Online test preparation
• Interview test preparation
• What to prepare?
• Pesan dari Flo untuk Peraih Asa`,
    duration: 'Video Tutorial',
    type: 'video',
    level: 'All Levels',
    category: 'Paragon',
    videoUrl: 'https://www.youtube.com/embed/iqKSSnao_a4',
    pdfUrl: 'https://drive.google.com/file/d/13UQqMOfO1JvtHViYNn1mOo7hG5u_Q7pj/view?usp=drive_link',
    pdfName: 'A-Z Series Beasiswa Paragon.pdf',
    instructor: 'Floren Aliza',
    topics: [
      'Kenalan sama Flo dari Paragon Scholarship Program!',
      'Kenapa sih harus banget dapet beasiswa?',
      'Paragon Scholarship Journey',
      'Why should PSP?',
      'Let\'s get to know Paragon Scholarship Program',
      'Timeline PSP',
      'Registration preparation',
      'CV preparation - Bedah CV Flo',
      'Essay preparation - Bedah Essay Flo',
      'Online test preparation',
      'Interview test preparation',
      'What to prepare?',
      'Pesan dari Flo untuk Peraih Asa',
    ],
  },
};

export default withAuth(LearningDetailPage, 'user');
function LearningDetailPage() {
  const router = useRouter();
  const { 'learning-id': learningId } = router.query;

  const course = courseData[learningId as keyof typeof courseData];

  if (!course) {
    return (
      <AdminDashboard withSidebar>
        <div className='container mx-auto px-4 py-8'>
          <Typography className='text-center text-xl text-gray-600'>
            Kursus tidak ditemukan
          </Typography>
          <div className='text-center mt-4'>
            <ButtonLink href='/dashboard/bisa-learning' className='text-primary-blue'>
              Kembali ke BISA Learning
            </ButtonLink>
          </div>
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
            <ButtonLink href='/dashboard/bisa-learning' className='hover:text-primary-blue'>
              BISA Learning
            </ButtonLink>
            <span>/</span>
            <span className='text-primary-blue'>{course.title}</span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Video Player */}
            <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
              <div className='aspect-video bg-gray-900'>
                <iframe
                  src={course.videoUrl}
                  title={course.title}
                  className='w-full h-full'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              </div>
            </div>

            {/* Course Info */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <div className='flex flex-wrap items-center gap-2 mb-4'>
                <span className='px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800'>
                  Video Course
                </span>
                <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-semibold'>
                  {course.category}
                </span>
                <span className='px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800'>
                  {course.level}
                </span>
              </div>

              <Typography className='text-2xl sm:text-3xl font-bold text-gray-900 mb-3'>
                {course.title}
              </Typography>

              <div className='flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center'>
                    <span className='text-white text-xs font-bold'>
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className='font-medium'>{course.instructor}</span>
                </div>
              </div>

              <div className='space-y-4'>
                <Typography className='text-gray-700 leading-relaxed text-sm'>
                  {course.description.split('\n\n')[0]}
                </Typography>
                
                <Typography className='text-base font-semibold text-gray-900 mt-6'>
                  Apa yang akan kamu pelajari:
                </Typography>
                <ul className='space-y-2'>
                  {course.topics.map((topic, index) => (
                    <li key={index} className='flex items-start gap-3'>
                      <div className='w-5 h-5 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0'>
                        ✓
                      </div>
                      <Typography className='text-gray-700 text-sm leading-relaxed'>
                        {topic}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Download Materials */}
            {course.pdfUrl && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                  Download Materi
                </Typography>
                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-primary-blue/20'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                      <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <span className='text-red-600 font-bold text-sm'>PDF</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <Typography className='font-semibold text-gray-900 truncate'>
                          {course.pdfName}
                        </Typography>
                        <Typography className='text-sm text-gray-600'>
                          Materi pembelajaran lengkap
                        </Typography>
                      </div>
                    </div>
                    <a
                      href={course.pdfUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-primary-blue hover:bg-primary-orange text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0'
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Course Topics */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                Ringkasan Materi
              </Typography>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 pb-3 border-b border-gray-100'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Typography className='text-primary-blue font-bold text-lg'>
                      {course.topics.length}
                    </Typography>
                  </div>
                  <div>
                    <Typography className='text-sm font-semibold text-gray-900'>
                      Topik Pembahasan
                    </Typography>
                    <Typography className='text-xs text-gray-500'>
                      Materi lengkap & terstruktur
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-3 pb-3 border-b border-gray-100'>
                  <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
                    </svg>
                  </div>
                  <div>
                    <Typography className='text-sm font-semibold text-gray-900'>
                      Video Tutorial
                    </Typography>
                    <Typography className='text-xs text-gray-500'>
                      Pembelajaran interaktif
                    </Typography>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div>
                    <Typography className='text-sm font-semibold text-gray-900'>
                      E-book Pendukung
                    </Typography>
                    <Typography className='text-xs text-gray-500'>
                      Materi PDF dapat diunduh
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                Navigation
              </Typography>
              <div className='space-y-3'>
                <ButtonLink
                  href='/dashboard/bisa-learning'
                  className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors text-center font-medium'
                >
                  ← Back to Courses
                </ButtonLink>
                <ButtonLink
                  href='/dashboard'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white px-4 py-3 rounded-lg transition-colors text-center font-medium'
                >
                  Main Dashboard
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}
