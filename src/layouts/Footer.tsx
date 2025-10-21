import { FaInstagram } from 'react-icons/fa';

import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';

export default function Footer() {
  return (
    <footer className='relative z-50 flex flex-col items-center content-center py-6 bg-primary-bluegreen font-primary lg:py-8'>
      <div className='flex flex-col w-10/12 gap-6 mx-auto'>
        <div className='flex flex-col justify-between gap-6 px-5 py-6 md:flex-row lg:py-8'>
          <div className='mx-auto w-fit md:mx-0'>
            <UnstyledLink
              href='/'
              className='flex flex-row items-center gap-2 md:gap-4'
            >
              <NextImage
                src='/images/logo.png'
                alt='logo'
                width='254'
                height='177'
                className='w-32 md:w-28'
              />
            </UnstyledLink>
          </div>
          <div className='flex flex-col justify-around gap-8 md:flex-row sm:gap-12'>
            {/* Booster Series */}
            <div className='w-full md:w-fit'>
              <h3 className='mb-6 text-lg font-semibold text-white'>
                Booster Series
              </h3>
              <div className='flex flex-col gap-4 list'>
                <a
                  href='https://raihasa.myr.id/course/Booster-C'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  CV Boost
                </a>
                <a
                  href='https://raihasa.myr.id/course/Booster-C'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  Essay Boost
                </a>
                <a
                  href='https://raihasa.myr.id/course/booster-i'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  Interview Boost
                </a>
              </div>
            </div>

           
            <div className='w-full md:w-fit'>
              <h3 className='mb-6 text-lg font-semibold text-white'>
                BISA Membership
              </h3>
              <div className='flex flex-col gap-4 list'>
                <a
                  href='https://raihasa.myr.id/bundling'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  EKSPLORA Mini
                </a>
                <a
                  href='https://raihasa.myr.id/bundling'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  EKSPLORA Lite
                </a>
                <a
                  href='https://raihasa.myr.id/bundling'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  EKSPLORA Basic
                </a>
                <a
                  href='https://raihasa.myr.id/bundling'
                  target='_blank'
                  className='flex items-center text-white no-underline'
                >
                  EKSPLORA PLUS+
                </a>
              </div>
            </div>

            {/* Bantuan */}
            <div className='w-full md:w-fit'>
              <h3 className='mb-6 text-lg font-semibold text-white'>Bantuan</h3>
              <div className='flex flex-col gap-4 list'>
                <a
                  href='#FAQ'
                  className='flex items-center text-white no-underline'
                >
                  FAQs
                </a>
              </div>
            </div>

            {/* Kantor & Hubungi kami */}
            <div className='flex flex-col w-full gap-6 md:w-fit'>
              <div>
                <h3 className='mb-4 text-lg font-semibold text-white'>
                  Kantor
                </h3>
                <p className='text-primary-white'>
                  Jl Raya ITS Sukolilo,
                  <br />
                  Keputih, Surabaya, Jawa
                  <br />
                  Timur 60117
                </p>
              </div>
              <div>
                <h3 className='mb-4 text-lg font-semibold text-white'>
                  Hubungi kami
                </h3>
                <a
                  href='https://www.instagram.com/raihasa.co/'
                  className='flex items-center gap-2 no-underline cursor-pointer text-primary-white'
                >
                  <FaInstagram size={20} />
                  <p>raihasa.co</p>
                </a>
              </div>
            </div>
          </div>
        </div>
        <hr className='border-primary-white' />
        <h3 className='text-center text-primary-white'>
          &copy; {new Date().getFullYear()} - Raih Asa. All Rights Reserved
        </h3>
      </div>
    </footer>
  );
}
