import NextImage from 'next/image';
import React from 'react';
import { AiFillHome } from 'react-icons/ai';

import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';

export default function ComingSoonPage() {
  return (
    <Layout withFooter={true} withNavbar={true}>
      <SEO
        title='Under Maintenance'
        description='Halaman ini sedang dalam perbaikan. Silakan kunjungi Dreamshub untuk informasi beasiswa.'
      />
      <section className='h-full mt-32 mb-24 md:mb-28'>
        <div className='flex flex-col justify-center items-center gap-2'>
          <NextImage
            src='/images/coming-soon/head-haira.png'
            width={360}
            height={368}
            alt='Haira Head Logo'
            quality={100}
            className='w-[40%] lg:w-[20%] h-auto'
          />
          <div className='flex flex-col justify-center items-center gap-2 md:gap-4'>
            <Typography
              as='h3'
              weight='bold'
              variant='h3'
              className='text-white lg:px-10 lg:py-4 px-6 py-2 bg-secondary w-fit text-3xl'
            >
              Under Maintenance
            </Typography>
            <Typography
              as='p'
              weight='medium'
              variant='t'
              className='text-[#1B7691] text-center text-xs w-[75%]'
            >
              Fitur ini sedang dalam perbaikan/pengembangan. <br />
              Mau cari info beasiswa? Yuk gabung diskusi di Dreamshub!
            </Typography>
          </div>
          <ButtonLink
            href='/dreamshub'
            variant='primary'
            leftIcon={AiFillHome}
            className='py-2 px-4 md:py-4 md:px-8 rounded-sm items-center flex flex-row gap-2 justify-center hover:bg-[#1b7691e1] mt-4 lg:mt-6'
          >
            <Typography
              as='p'
              weight='medium'
              variant='bt'
              className='text-white'
            >
              Ke Dreamshub
            </Typography>
          </ButtonLink>
        </div>
      </section>
    </Layout>
  );
}
