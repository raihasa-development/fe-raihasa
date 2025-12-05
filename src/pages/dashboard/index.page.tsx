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
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
        {/* Hero Section */}
        <section className='relative pt-6 sm:pt-8 pb-8 sm:pb-12'>
          <div className='text-center mb-8 sm:mb-12'>
            <Typography className='font-bold text-2xl sm:text-3xl lg:text-5xl text-primary-orange mb-3 sm:mb-4 leading-tight'>
              Selamat Datang di Dashboard
            </Typography>
            <Typography className='text-base sm:text-lg lg:text-xl text-primary-blue max-w-3xl mx-auto px-4'>
              Kelola perjalanan beasiswa Anda dengan berbagai layanan yang tersedia
            </Typography>
          </div>

      
        </section>

        {/* Services Section */}
        <section className='py-8 sm:py-12 bg-white/50 rounded-xl sm:rounded-2xl mb-8 sm:mb-12'>
          <div className='px-4 sm:px-6 lg:px-8'>
            <div className='mb-6 sm:mb-8'>
              <Typography className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary-blue text-center mb-3 sm:mb-4'>
                Layanan Tersedia
              </Typography>
              <Typography className='text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto px-4'>
                Pilih layanan yang sesuai dengan kebutuhan Anda untuk meningkatkan peluang mendapatkan beasiswa
              </Typography>
            </div>

            {/* Services Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto'>
              {/* Scholra Card */}
              <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex justify-between items-start mb-3 sm:mb-4'>
                  <Typography className='text-lg sm:text-xl font-bold text-primary-blue leading-tight'>
                    Scholra
                  </Typography>
                  <div className='bg-primary-orange/10 text-primary-orange px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium'>
                    AI
                  </div>
                </div>

                <div className='flex items-center justify-center mb-4 sm:mb-6 h-16 sm:h-20'>
                  <NextImage
                    src='/images/dashboard/cv-boost.png'
                    width={120}
                    height={80}
                    alt='Scholra AI'
                    className='w-16 sm:w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed min-h-[3rem] sm:min-h-[4rem]'>
                  Dapatkan rekomendasi beasiswa yang dipersonalisasi menggunakan teknologi AI berdasarkan profil dan preferensi Anda.
                </Typography>

                <ButtonLink
                  href='/scholarship-recommendation'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-lg sm:rounded-xl transition-colors px-3 sm:px-4 py-2.5 sm:py-3 text-center'
                >
                  <Typography className='text-xs sm:text-sm font-semibold'>
                    Mulai Scholra
                  </Typography>
                </ButtonLink>
              </div>

              {/* BISA Learning Card */}
              <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex justify-between items-start mb-3 sm:mb-4'>
                  <Typography className='text-lg sm:text-xl font-bold text-primary-blue leading-tight'>
                    BISA Learning
                  </Typography>
                  <div className='bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium'>
                    Popular
                  </div>
                </div>

                <div className='flex items-center justify-center mb-4 sm:mb-6 h-16 sm:h-20'>
                  <NextImage
                    src='/images/dashboard/lms.png'
                    width={120}
                    height={80}
                    alt='BISA Learning'
                    className='w-16 sm:w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed min-h-[3rem] sm:min-h-[4rem]'>
                  Akses koleksi video pembelajaran dan ebook untuk mempersiapkan tes dan persyaratan beasiswa.
                </Typography>

                <ButtonLink
                  href='/dashboard/bisa-learning'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-lg sm:rounded-xl transition-colors px-3 sm:px-4 py-2.5 sm:py-3 text-center'
                >
                  <Typography className='text-xs sm:text-sm font-semibold'>
                    Mulai Belajar
                  </Typography>
                </ButtonLink>
              </div>

              {/* Dreamshub Card */}
              <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex justify-between items-start mb-3 sm:mb-4'>
                  <Typography className='text-lg sm:text-xl font-bold text-primary-blue leading-tight'>
                    Dreamshub
                  </Typography>
                  <div className='bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium'>
                    Expert
                  </div>
                </div>

                <div className='flex items-center justify-center mb-4 sm:mb-6 h-16 sm:h-20'>
                  <NextImage
                    src='/images/dashboard/interview-boost.png'
                    width={120}
                    height={80}
                    alt='Dreamshub'
                    className='w-16 sm:w-24 h-auto object-contain'
                  />
                </div>

                <Typography className='text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed min-h-[3rem] sm:min-h-[4rem]'>
                  Platform konsultasi dengan mentor berpengalaman untuk bimbingan CV, essay, dan persiapan interview.
                </Typography>

                <ButtonLink
                  href='/dashboard/dreamshub'
                  variant='primary'
                  className='w-full bg-primary-blue hover:bg-primary-orange text-white rounded-lg sm:rounded-xl transition-colors px-3 sm:px-4 py-2.5 sm:py-3 text-center'
                >
                  <Typography className='text-xs sm:text-sm font-semibold'>
                    Mulai Konsultasi
                  </Typography>
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className='py-8 sm:py-12'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto'>
            <Typography className='text-lg sm:text-xl font-semibold text-primary-blue text-center mb-6 sm:mb-8'>
              Navigasi Cepat
            </Typography>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
              <ButtonLink
                href='/rekomendasi-beasiswa'
                className='flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-primary-blue text-primary-blue rounded-lg sm:rounded-xl hover:bg-primary-blue hover:text-white transition-colors group'
              >
                <div className='w-8 h-8 bg-primary-blue/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Typography className='text-primary-blue group-hover:text-white font-bold text-sm'>
                    AI
                  </Typography>
                </div>
                <div className='text-left flex-1'>
                  <Typography className='font-medium text-sm sm:text-base'>
                    Rekomendasi Beasiswa
                  </Typography>
                  <Typography className='text-xs sm:text-sm opacity-75'>
                    Dapatkan rekomendasi berbasis AI
                  </Typography>
                </div>
              </ButtonLink>

              <ButtonLink
                href='/profile/edit'
                className='flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:border-primary-blue hover:text-primary-blue transition-colors group'
              >
                <div className='w-8 h-8 bg-gray-100 group-hover:bg-primary-blue/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Typography className='text-gray-600 group-hover:text-primary-blue font-bold text-sm'>
                    P
                  </Typography>
                </div>
                <div className='text-left flex-1'>
                  <Typography className='font-medium text-sm sm:text-base'>
                    Edit Profil
                  </Typography>
                  <Typography className='text-xs sm:text-sm opacity-75'>
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
