import React from 'react';
import Head from 'next/head';

import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';

export default function MaintenancePage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center font-primary px-4 bg-gradient-to-br from-white to-[#1B7691]/5'>
      <Head>
        <title>Pemeliharaan Sistem | Raihasa</title>
      </Head>

      <div className='max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#1B7691]/20 mt-16'>
        <div className='flex justify-center mb-6'>
          <NextImage
            src='/images/mentor/haira.png'
            alt='Maskot Haira'
            width={128}
            height={128}
            className='w-32 object-contain drop-shadow-sm'
          />
        </div>

        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'>Pemeliharaan Sistem</h1>

        <p className='text-gray-600 mb-8 leading-relaxed text-sm lg:text-base'>
          Kami sedang melakukan pembaruan dan pemeliharaan pada layanan ini untuk meningkatkan kualitas pengalaman Anda. Kami memohon maaf atas ketidaknyamanan ini dan menghargai kesabaran Anda.
        </p>

        <ButtonLink
          href='/'
          variant='primary'
          className='w-full flex justify-center py-3 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] hover:shadow-lg hover:shadow-[#1B7691]/25 transition-all duration-300 rounded-xl outline-none border-none'
        >
          Kembali ke Beranda
        </ButtonLink>
      </div>
    </div>
  );
}
