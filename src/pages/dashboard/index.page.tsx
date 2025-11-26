import React from 'react';

import withAuth from '@/components/hoc/withAuth';
import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';

export default withAuth(DashboardUserPage, 'user');
function DashboardUserPage() {
  return (
    <AdminDashboard
      withSidebar
      className='min-h-screen bg-gradient-to-br from-blue-50 to-orange-50'
    >
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Hero Section */}
        <section className='relative pt-8 pb-12'>
          <div className='text-center mb-12'>
            <Typography className='font-bold text-3xl md:text-5xl text-primary-orange mb-4'>
              Selamat Datang di Dashboard
            </Typography>
            <Typography className='text-lg md:text-xl text-primary-blue max-w-3xl mx-auto'>
              Kelola perjalanan beasiswa Anda dengan berbagai layanan yang tersedia
            </Typography>
          </div>

          {/* Character Illustration */}
          <div className='flex justify-center mb-12'>
            <NextImage
              src='/images/dashboard/haira.png'
              width={300}
              height={300}
              alt='Haira Assistant'
              className='w-full max-w-[300px] h-auto'
            />
          </div>
        </section>

        {/* Services Section */}
        <section className='py-12 bg-white/50 rounded-2xl mb-12'>
          <div className='px-4 lg:px-8'>
            <div className='mb-8'>
              <Typography className='text-2xl md:text-3xl font-bold text-primary-blue text-center mb-4'>
                Layanan Tersedia
              </Typography>
              <Typography className='text-gray-600 text-center max-w-2xl mx-auto'>
                Pilih layanan yang sesuai dengan kebutuhan Anda untuk meningkatkan peluang mendapatkan beasiswa
              </Typography>
            </div>

            {/* Services Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto'>
              {/* CV Boost Card */}
              <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow'>
                <div className='flex justify-between items-start mb-4'>
                  <Typography className='text-xl font-bold text-primary-blue leading-tight'>
                    CV Boost
                  </Typography>
                  <div className='bg-primary-orange/10 text-primary-orange px-3 py-1 rounded-full text-sm font-medium'>
                    Populer
                  </div>
                </div>

                <div className='flex items-center justify-center mb-6'>
                  <NextImage
                    src='/images/dashboard/cv-boost.png'
                    width={120}
                    height={80}
                    alt='CV Boost'
                    className='w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-sm mb-6 leading-relaxed'>
                  Tingkatkan kualitas CV Anda dengan bantuan mentor profesional untuk meningkatkan peluang diterima beasiswa.
                </Typography>

                <ButtonLink
                  href='/dashboard/cv-boost'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-xl transition-colors px-4 py-3 text-center'
                >
                  <Typography className='text-sm font-semibold'>
                    Mulai CV Boost
                  </Typography>
                </ButtonLink>
              </div>

              {/* Essay Boost Card */}
              <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow'>
                <div className='flex justify-between items-start mb-4'>
                  <Typography className='text-xl font-bold text-primary-blue leading-tight'>
                    Essay Boost
                  </Typography>
                </div>

                <div className='flex items-center justify-center mb-6'>
                  <NextImage
                    src='/images/dashboard/essay-boost.png'
                    width={120}
                    height={80}
                    alt='Essay Boost'
                    className='w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-sm mb-6 leading-relaxed'>
                  Dapatkan bimbingan untuk menulis essay aplikasi beasiswa yang menarik dan berkesan bagi reviewer.
                </Typography>

                <ButtonLink
                  href='/dashboard/essay-boost'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-xl transition-colors px-4 py-3 text-center'
                >
                  <Typography className='text-sm font-semibold'>
                    Mulai Essay Boost
                  </Typography>
                </ButtonLink>
              </div>

              {/* Interview Boost Card */}
              <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow'>
                <div className='flex justify-between items-start mb-4'>
                  <Typography className='text-xl font-bold text-primary-blue leading-tight'>
                    Interview Boost
                  </Typography>
                </div>

                <div className='flex items-center justify-center mb-6'>
                  <NextImage
                    src='/images/dashboard/interview-boost.png'
                    width={120}
                    height={80}
                    alt='Interview Boost'
                    className='w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-sm mb-6 leading-relaxed'>
                  Persiapkan diri untuk interview beasiswa dengan simulasi dan tips dari mentor berpengalaman.
                </Typography>

                <ButtonLink
                  href='/dashboard/interview-boost'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-xl transition-colors px-4 py-3 text-center'
                >
                  <Typography className='text-sm font-semibold'>
                    Mulai Interview Boost
                  </Typography>
                </ButtonLink>
              </div>

              {/* LMS Card */}
              <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow'>
                <div className='flex justify-between items-start mb-4'>
                  <Typography className='text-xl font-bold text-primary-blue leading-tight'>
                    Learning Management
                  </Typography>
                  <div className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>
                    Baru
                  </div>
                </div>

                <div className='flex items-center justify-center mb-6'>
                  <NextImage
                    src='/images/dashboard/lms.png'
                    width={120}
                    height={80}
                    alt='LMS'
                    className='w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-sm mb-6 leading-relaxed'>
                  Akses materi pembelajaran lengkap untuk mempersiapkan berbagai jenis tes dan persyaratan beasiswa.
                </Typography>

                <ButtonLink
                  href='/dashboard/lms'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-xl transition-colors px-4 py-3 text-center'
                >
                  <Typography className='text-sm font-semibold'>
                    Mulai Belajar
                  </Typography>
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className='py-12'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto'>
            <Typography className='text-xl font-semibold text-primary-blue text-center mb-8'>
              Navigasi Cepat
            </Typography>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <ButtonLink
                href='/rekomendasi-beasiswa'
                className='flex items-center gap-4 p-4 border-2 border-primary-blue text-primary-blue rounded-xl hover:bg-primary-blue hover:text-white transition-colors'
              >
                <div className='w-8 h-8 bg-primary-blue/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Typography className='text-primary-blue font-bold text-sm'>
                    AI
                  </Typography>
                </div>
                <div className='text-left'>
                  <Typography className='font-medium'>
                    Rekomendasi Beasiswa
                  </Typography>
                  <Typography className='text-sm opacity-75'>
                    Dapatkan rekomendasi berbasis AI
                  </Typography>
                </div>
              </ButtonLink>

              <ButtonLink
                href='/profile/edit'
                className='flex items-center gap-4 p-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-primary-blue hover:text-primary-blue transition-colors'
              >
                <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Typography className='text-gray-600 font-bold text-sm'>
                    P
                  </Typography>
                </div>
                <div className='text-left'>
                  <Typography className='font-medium'>
                    Edit Profil
                  </Typography>
                  <Typography className='text-sm opacity-75'>
                    Kelola informasi akun Anda
                  </Typography>
                </div>
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </AdminDashboard>
  );
}
