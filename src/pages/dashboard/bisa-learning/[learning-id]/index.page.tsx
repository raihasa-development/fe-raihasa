import { useRouter } from 'next/router';
import React from 'react';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

// Hardcoded course data with YouTube and Google Drive links
const courseData = {
  'ielts-speaking-basics': {
    id: 'ielts-speaking-basics',
    title: 'IELTS Speaking Fundamentals',
    description: 'Dasar-dasar speaking test IELTS dengan tips dan strategi untuk mencapai band score tinggi. Pelajari struktur tes, jenis pertanyaan, dan teknik menjawab yang efektif.',
    duration: '45 min',
    type: 'video',
    level: 'Beginner',
    category: 'IELTS Preparation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Sample YouTube embed URL
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view', // Sample Google Drive link
    instructor: 'Sarah Johnson',
    topics: [
      'IELTS Speaking Test Format',
      'Part 1: Introduction and Interview',
      'Part 2: Long Turn (Cue Card)',
      'Part 3: Discussion',
      'Pronunciation Tips',
      'Vocabulary Enhancement',
      'Common Mistakes to Avoid',
    ],
  },
  'ielts-writing-task1': {
    id: 'ielts-writing-task1',
    title: 'IELTS Writing Task 1 Mastery',
    description: 'Teknik menulis Task 1 untuk Academic dan General Training dengan contoh-contoh nyata dan template yang dapat langsung digunakan.',
    duration: '60 min',
    type: 'video',
    level: 'Intermediate',
    category: 'IELTS Preparation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    instructor: 'Michael Chen',
    topics: [
      'Academic vs General Training Task 1',
      'Graph and Chart Description',
      'Process and Map Description',
      'Letter Writing (General Training)',
      'Language and Grammar for Task 1',
      'Time Management Strategies',
    ],
  },
  'toefl-reading-strategies': {
    id: 'toefl-reading-strategies',
    title: 'TOEFL Reading Comprehension',
    description: 'Strategi efektif untuk section reading TOEFL dengan teknik skimming, scanning, dan analisis tipe pertanyaan.',
    duration: '50 min',
    type: 'video',
    level: 'Intermediate',
    category: 'TOEFL Preparation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    instructor: 'Dr. Amanda Smith',
    topics: [
      'TOEFL Reading Section Overview',
      'Skimming and Scanning Techniques',
      'Question Types Analysis',
      'Vocabulary in Context',
      'Time Management',
      'Practice Strategies',
    ],
  },
  'gre-math-review': {
    id: 'gre-math-review',
    title: 'GRE Quantitative Reasoning',
    description: 'Review matematika komprehensif untuk section quantitative GRE, mencakup algebra, geometri, dan analisis data.',
    duration: '75 min',
    type: 'video',
    level: 'Advanced',
    category: 'GRE Preparation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    instructor: 'Prof. David Wilson',
    topics: [
      'Arithmetic and Number Properties',
      'Algebra and Functions',
      'Geometry and Measurement',
      'Data Analysis and Probability',
      'Problem Solving Strategies',
      'Calculator Usage Tips',
    ],
  },
  'scholarship-essay-guide': {
    id: 'scholarship-essay-guide',
    title: 'Winning Scholarship Essays',
    description: 'Panduan lengkap menulis essay beasiswa yang memenangkan hati reviewer dengan struktur yang jelas dan compelling story.',
    duration: '40 min',
    type: 'ebook',
    level: 'All Levels',
    category: 'Essay Writing',
    videoUrl: null,
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    instructor: 'Rachel Martinez',
    topics: [
      'Understanding Essay Prompts',
      'Brainstorming Techniques',
      'Essay Structure and Flow',
      'Personal Story Development',
      'Common Essay Mistakes',
      'Editing and Proofreading',
      'Sample Winning Essays',
    ],
  },
  'interview-preparation': {
    id: 'interview-preparation',
    title: 'Scholarship Interview Mastery',
    description: 'Persiapan komprehensif untuk wawancara beasiswa dengan simulasi dan teknik menjawab berbagai jenis pertanyaan.',
    duration: '55 min',
    type: 'video',
    level: 'Intermediate',
    category: 'Interview Skills',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ebookUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    instructor: 'James Thompson',
    topics: [
      'Interview Types and Formats',
      'Common Interview Questions',
      'STAR Method for Behavioral Questions',
      'Body Language and Presentation',
      'Handling Difficult Questions',
      'Mock Interview Practice',
      'Follow-up Strategies',
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
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl'>
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

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Course Header */}
            <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
              <div className='flex flex-wrap items-center gap-3 mb-4'>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  course.type === 'video' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {course.type === 'video' ? 'Video Course' : 'E-book'}
                </span>
                <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold'>
                  {course.category}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {course.level}
                </span>
              </div>

              <Typography className='text-2xl sm:text-3xl font-bold text-primary-blue mb-3'>
                {course.title}
              </Typography>

              <Typography className='text-gray-600 mb-4 leading-relaxed'>
                {course.description}
              </Typography>

              <div className='flex items-center gap-6 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center'>
                    <span className='text-xs font-bold'>I</span>
                  </div>
                  <span>{course.instructor}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center'>
                    <span className='text-xs font-bold'>T</span>
                  </div>
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>

            {/* Video Player or E-book Access */}
            <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
              {course.type === 'video' && course.videoUrl ? (
                <div>
                  <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                    Course Video
                  </Typography>
                  <div className='aspect-video rounded-lg overflow-hidden bg-gray-100'>
                    <iframe
                      src={course.videoUrl}
                      title={course.title}
                      className='w-full h-full'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className='text-center py-16'>
                  <div className='w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <span className='text-2xl font-bold text-primary-blue'>BOOK</span>
                  </div>
                  <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                    Access E-book
                  </Typography>
                  <Typography className='text-gray-600 mb-8 max-w-md mx-auto'>
                    Click the button below to access the e-book via Google Drive
                  </Typography>
                  <a
                    href={course.ebookUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-block bg-primary-blue hover:bg-primary-orange text-white px-8 py-3 rounded-lg font-semibold transition-colors'
                  >
                    Open E-book
                  </a>
                </div>
              )}
            </div>

            {/* Additional Resources */}
            {course.type === 'video' && course.ebookUrl && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                  Additional Resources
                </Typography>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                        <span className='text-green-700 font-bold text-sm'>PDF</span>
                      </div>
                      <div>
                        <Typography className='font-semibold text-gray-900'>
                          {course.title} - Study Guide
                        </Typography>
                        <Typography className='text-sm text-gray-600'>
                          Learning materials and practice exercises
                        </Typography>
                      </div>
                    </div>
                    <a
                      href={course.ebookUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-primary-blue hover:bg-primary-orange text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors'
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            {/* Course Topics */}
            <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
              <Typography className='text-xl font-semibold text-primary-blue mb-4'>
                Topik Pembahasan
              </Typography>
              <ul className='space-y-3'>
                {course.topics.map((topic, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center text-sm font-medium mt-0.5 flex-shrink-0'>
                      {index + 1}
                    </div>
                    <Typography className='text-gray-700 text-sm leading-relaxed'>
                      {topic}
                    </Typography>
                  </li>
                ))}
              </ul>
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
                  Back to Courses
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
