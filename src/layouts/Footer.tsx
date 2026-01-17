import { FaInstagram, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';

import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function Footer() {
  return (
    <footer className='relative z-50 bg-gradient-to-b from-[#1B7691] to-[#0d5a6e] font-primary'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-4 py-12 md:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8'>

          {/* Brand Column */}
          <div className='lg:col-span-2'>
            <UnstyledLink href='/' className='inline-block mb-4'>
              <NextImage
                src='/images/logo.png'
                alt='Raih Asa Logo'
                width={254}
                height={177}
                className='w-24 md:w-28'
              />
            </UnstyledLink>
            <Typography className='text-white/80 text-sm leading-relaxed mb-6 max-w-xs'>
              Platform terlengkap untuk meraih beasiswa impianmu. Dari discovery hingga persiapan, semua ada di sini.
            </Typography>
            {/* Social Links */}
            <div className='flex gap-3'>
              <a
                href='https://www.instagram.com/raihasa.co/'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors'
              >
                <FaInstagram size={18} />
              </a>
              <a
                href='https://wa.me/6285117323893?text=Halo%20Admin%20Raih%20Asa%2C%20saya%20ingin%20bertanya%20seputar%20program%20mentoring%20beasiswa.'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors'
              >
                <FaWhatsapp size={18} />
              </a>
              <a
                href='https://www.linkedin.com/company/raih-asa/'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors'
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href='mailto:raihasa.edu@gmail.com'
                className='w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors'
              >
                <HiMail size={18} />
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Platform</h3>
            <ul className='space-y-3'>
              <li>
                <UnstyledLink href='/coming-soon' className='text-white/70 hover:text-white text-sm transition-colors'>
                  Scholra AI
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink href='/coming-soon' className='text-white/70 hover:text-white text-sm transition-colors'>
                  Dreamshub Forum
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink href='/coming-soon' className='text-white/70 hover:text-white text-sm transition-colors'>
                  BISA Learning
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink href='/scholarship-info' className='text-white/70 hover:text-white text-sm transition-colors'>
                  Calendar Beasiswa
                </UnstyledLink>
              </li>
            </ul>
          </div>

          {/* Membership */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Membership</h3>
            <ul className='space-y-3'>
              <li>
                <a href='https://raihasa.myr.id/bundling' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white text-sm transition-colors'>
                  BISA Membership
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Company</h3>
            <ul className='space-y-3'>
              <li>
                <UnstyledLink href='/#about' className='text-white/70 hover:text-white text-sm transition-colors'>
                  Tentang Kami
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink href='#FAQ' className='text-white/70 hover:text-white text-sm transition-colors'>
                  FAQs
                </UnstyledLink>
              </li>
              <li>
                <a href='https://wa.me/6285117323893?text=Halo%20Admin%20Raih%20Asa%2C%20saya%20butuh%20bantuan.' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white text-sm transition-colors'>
                  Hubungi Kami
                </a>
              </li>
            </ul>

            {/* Office */}
            <div className='mt-6'>
              <h4 className='text-white/60 text-xs uppercase tracking-wider mb-2'>Kantor</h4>
              <p className='text-white/70 text-sm leading-relaxed'>
                Jl Raya ITS Sukolilo,<br />
                Keputih, Surabaya,<br />
                Jawa Timur 60117
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-white/10'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <Typography className='text-white/60 text-sm'>
              &copy; {new Date().getFullYear()} Raih Asa. All Rights Reserved
            </Typography>
            <div className='flex gap-6'>
              <UnstyledLink href='#' className='text-white/60 hover:text-white text-sm transition-colors'>
                Privacy Policy
              </UnstyledLink>
              <UnstyledLink href='#' className='text-white/60 hover:text-white text-sm transition-colors'>
                Terms of Service
              </UnstyledLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
