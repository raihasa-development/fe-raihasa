import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import React from 'react';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FiMenu, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import {
  HiChevronDown,
  HiChevronRight,
  HiOutlineMenuAlt3,
  HiUserCircle,
} from 'react-icons/hi';
import { MdClose } from 'react-icons/md';

import Button from '@/components/buttons/Button';
import IconButton from '@/components/buttons/IconButton';
import ProgramCard from '@/components/card/ProgramCard';
import ButtonLink from '@/components/links/ButtonLink';
import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';
import Typography from '@/components/Typography';
import { programs } from '@/constants/programs';
import { BOOSTER_SERIES_CARD_DATA } from '@/contents/booster-series-a-la-carte';
import clsxm from '@/lib/clsxm';
import { getToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';

export default function Navbar() {
  const token = getToken();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openPrograms, setOpenPrograms] = useState<boolean>(false);
  // const [scholarshipOpen, setScholarshipOpen] = useState<boolean>(false);
  const [boosterOpen, setBoosterOpen] = useState<boolean>(false);
  const authStore = useAuthStore();
  const user = authStore.user;
  const isAuthenticatedUser = isLogin && user?.role !== 'ADMIN';
  const homeHref = isAuthenticatedUser ? '/home' : '/';

  useEffect(() => {
    if (user && token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [user, token]);

  // const handleLogout = () => {
  //   removeToken();
  //   setIsLogin(false);
  //   showToast('Sampai jumpa lagi!, semoga harimu menyenangkan', SUCCESS_TOAST);
  //   router.push('/');
  // };

  const logOut = useAuthStore.useLogout();

  const handleLogout = () => {
    logOut();
    setIsLogin(false);
    showToast('Sampai jumpa lagi!, semoga harimu menyenangkan', SUCCESS_TOAST);
    router.reload();
  };

  const toggleShowNav = () => {
    setIsOpen(!isOpen);
  };

  const toggleNavPrograms = () => {
    setOpenPrograms(!openPrograms);
  };

  const togglePrograms = (index: number) => {
    if (index === 0) {
      // setScholarshipOpen(false);
      setBoosterOpen(true);
    }
    // else if (index === 1) {
    //   setScholarshipOpen(false);
    //   setBoosterOpen(true);
    // }
  };

  const isBluePage = router.pathname.startsWith('/bisa-learning') || router.pathname.startsWith('/dreamshub');

  return (
    <header className={clsxm(
      'fixed z-[100] w-full py-4 px-4 md:px-8 font-primary transition-all duration-300',
      router.pathname === '/' ? 'top-10' : 'top-0'
    )}>
      {/* Glass Pill Navbar - Solid White on Blue Pages, Glassy on others */}
      <div className={clsxm(
        'max-w-6xl mx-auto rounded-full border shadow-lg transition-all duration-500',
        isBluePage
          ? 'bg-white/90 backdrop-blur-md border-white/60 shadow-blue-900/10' // High Opacity Glass for Blue Pages (Frosted)
          : 'bg-white/70 backdrop-blur-xl border-white/50 shadow-black/5' // Default Glassy
      )}>
        <div className='flex flex-row items-center justify-between h-16 px-6'>
          <UnstyledLink
            href={homeHref}
            className='flex flex-row items-center gap-2 md:gap-4'
          >
            <NextImage
              src='/images/logo.png'
              alt='logo'
              width='254'
              height='177'
              className='w-14'
            />
          </UnstyledLink>

          {/* Desktop Navbar */}
          <nav className='hidden md:block'>
            <ul className='flex flex-row items-center gap-1'>
              <li>
                <UnstyledLink
                  href={homeHref}
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname === homeHref
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                  Home
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink
                  href='/scholarship-calendar'
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname.startsWith('/scholarship-calendar')
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                  Calendar
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink
                  href='/products'
                  className={clsxm(
                    'px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-300 inline-block',
                    router.pathname.startsWith('/products')
                      ? 'text-white bg-[#FB991A] shadow-md shadow-orange-500/10 ring-1 ring-[#FB991A]'
                      : 'text-[#FB991A] border border-[#FB991A]/60 bg-[#FB991A]/5 hover:bg-[#FB991A] hover:text-white hover:border-[#FB991A] shadow-sm shadow-orange-500/5'
                  )}
                >
                  Package
                </UnstyledLink>
              </li>
              {/* <li>
                <UnstyledLink
                  href='/list-scholarship'
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname.startsWith('/list-scholarship')
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                  Scholarship List
                </UnstyledLink>
              </li> */}
              <li>
                <UnstyledLink
                  href='/scholra'
                  className={clsxm(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    (router.pathname.startsWith('/scholra'))
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                   Scholra
                   <span className='px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded'>AI</span>
                 </UnstyledLink>
              </li>
              <li>
                <UnstyledLink
                  href='/bisa-learning'
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    (router.pathname.startsWith('/bisa-learning') || router.pathname.startsWith('/dashboard/bisa-learning'))
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                  BISA Learning
                </UnstyledLink>
              </li>
              <li>
                <UnstyledLink
                  href='/dreamshub'
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname.startsWith('/dreamshub')
                      ? 'text-[#1B7691] bg-[#1B7691]/10 font-bold shadow-sm ring-1 ring-[#1B7691]/20'
                      : 'text-gray-700 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                >
                  Dreamshub
                </UnstyledLink>
              </li>
            </ul>
          </nav>

          {/* CTA Buttons */}
          <div className='hidden md:flex flex-row gap-2'>
            {!isLogin ? (
              <>
                <ButtonLink
                  href='/login'
                  size='base'
                  variant='unstyled'
                  className='px-5 py-2 text-sm font-medium text-gray-700 hover:text-[#1B7691] transition-colors'
                >
                  Masuk
                </ButtonLink>
                <ButtonLink
                  href='/register'
                  size='base'
                  variant='unstyled'
                  className='px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] rounded-full hover:shadow-lg hover:shadow-[#1B7691]/25 transition-all duration-300'
                >
                  Daftar Gratis
                </ButtonLink>
              </>
            ) : (
              <Menu as='div' className='relative z-20 w-fit'>
                <Menu.Button className='outline-none focus:outline-none'>
                  <div className='flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer group'>
                    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] flex items-center justify-center text-white font-bold text-sm shadow-inner'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col items-start'>
                      <span className='text-sm font-bold text-gray-700 group-hover:text-[#1B7691] transition-colors max-w-[100px] truncate text-left leading-tight'>
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className='text-[10px] text-gray-400 font-medium leading-tight'>Member</span>
                    </div>
                    <FiChevronDown className='w-4 h-4 text-gray-400 group-hover:text-[#1B7691] transition-transform group-hover:rotate-180 duration-300' />
                  </div>
                </Menu.Button>
                <Transition
                  as={React.Fragment}
                  enter='transition ease-out duration-100'
                  enterFrom='transform opacity-0 scale-95'
                  enterTo='transform opacity-100 scale-100'
                  leave='transition ease-in duration-75'
                  leaveFrom='transform opacity-100 scale-100'
                  leaveTo='transform opacity-0 scale-95'
                >
                  <Menu.Items className='absolute w-full flex flex-col py-2 px-2 mt-[14px] gap-1  bg-white rounded-md md:rounded-lg'>
                    {isLogin && user?.role === 'ADMIN' && (
                      <li>
                        <UnstyledLink
                          href='/admin'
                          className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                        >
                          <Typography
                            color='inline'
                            variant='bt'
                            className='py-4 pl-4 '
                          >
                            Dashboard
                          </Typography>
                        </UnstyledLink>
                      </li>
                    )}



                    <Menu.Item
                      as='button'
                      className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                      onClick={handleLogout}
                    >
                      <Typography
                        color='inline'
                        variant='bt'
                        className='py-4 pl-4 '
                      >
                        Log Out
                      </Typography>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>

          {/* Mobile Menu Button */}
          {!isOpen && (
            <IconButton
              variant='unstyled'
              icon={HiOutlineMenuAlt3}
              className='md:hidden'
              iconClassName='text-[#1B7691]'
              onClick={toggleShowNav}
            />
          )}
        </div>
      </div>

      {/* Mobile Nav Backdrop Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm md:hidden transition-all duration-300'
          onClick={toggleShowNav}
        />
      )}

      {/* Mobile Nav Drawer */}
      <div
        className={clsxm(
          'fixed right-0 top-0 z-[100] flex flex-col gap-6',
          'w-[85%] max-w-[320px] h-screen shadow-2xl px-6 pb-12 md:hidden bg-white/95 backdrop-blur-lg border-l border-white/20 overflow-y-auto',
          router.pathname === '/' ? 'pt-16' : 'pt-6',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className='flex items-center justify-between w-full pb-4 border-b border-gray-100'>
          <UnstyledLink
            href={homeHref}
            className='flex flex-row items-center gap-2'
            onClick={toggleShowNav}
          >
            <NextImage
              src='/images/logo.png'
              alt='logo'
              width='254'
              height='177'
              className='w-12'
            />
          </UnstyledLink>
          <IconButton
            variant='unstyled'
            icon={MdClose}
            size='sm'
            className='text-gray-500 hover:text-gray-800'
            iconClassName='w-6 h-6 text-gray-500'
            onClick={toggleShowNav}
          />
        </div>

        {/* Drawer Links */}
        <nav className='flex-1 w-full'>
          <ul className='space-y-1.5'>
            <li>
              <UnstyledLink
                href={homeHref}
                className={clsxm(
                  'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  router.pathname === homeHref
                    ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                    : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                )}
                onClick={toggleShowNav}
              >
                Home
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/products'
                className={clsxm(
                  'flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl transition-all border',
                  router.pathname.startsWith('/products')
                    ? 'bg-[#FB991A] text-white border-[#FB991A] shadow-md shadow-orange-500/10'
                    : 'bg-[#FB991A]/5 text-[#FB991A] border-[#FB991A]/20 hover:bg-[#FB991A]/10'
                )}
                onClick={toggleShowNav}
              >
                Package
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/list-scholarship'
                className={clsxm(
                  'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  router.pathname.startsWith('/list-scholarship')
                    ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                    : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                )}
                onClick={toggleShowNav}
              >
                Scholarship List
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/scholra'
                className={clsxm(
                  'flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  router.pathname.startsWith('/scholra')
                    ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                    : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                )}
                onClick={toggleShowNav}
              >
                <span>Scholra</span>
                <span className='px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded'>AI</span>
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/dreamshub'
                className={clsxm(
                  'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  router.pathname.startsWith('/dreamshub')
                    ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                    : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                )}
                onClick={toggleShowNav}
              >
                Dreamshub
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/bisa-learning'
                className={clsxm(
                  'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                  router.pathname.startsWith('/bisa-learning')
                    ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                    : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                )}
                onClick={toggleShowNav}
              >
                BISA Learning
              </UnstyledLink>
            </li>

            {isLogin && user?.role === 'ADMIN' && (
              <li>
                <UnstyledLink
                  href='/admin'
                  className={clsxm(
                    'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all',
                    router.pathname.startsWith('/admin')
                      ? 'text-[#1B7691] bg-[#1B7691]/5 font-bold'
                      : 'text-gray-600 hover:text-[#1B7691] hover:bg-[#1B7691]/5'
                  )}
                  onClick={toggleShowNav}
                >
                  Dashboard Admin
                </UnstyledLink>
              </li>
            )}
          </ul>

          {/* Drawer CTA Action Buttons */}
          <div className='flex flex-col gap-3 mt-8 w-full border-t border-gray-100 pt-6'>
            {!isLogin ? (
              <>
                <ButtonLink
                  href='/login'
                  size='base'
                  variant='unstyled'
                  className='w-full text-center py-2.5 text-sm font-bold text-[#1B7691] bg-[#1B7691]/5 hover:bg-[#1B7691]/10 rounded-xl transition-all'
                  onClick={toggleShowNav}
                >
                  Masuk
                </ButtonLink>
                <ButtonLink
                  href='/register'
                  size='base'
                  variant='unstyled'
                  className='w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] rounded-xl shadow-md hover:shadow-lg transition-all'
                  onClick={toggleShowNav}
                >
                  Daftar Gratis
                </ButtonLink>
              </>
            ) : (
              <>
                <div className='flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0'>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex flex-col items-start min-w-0'>
                    <span className='text-sm font-bold text-gray-700 truncate w-full leading-tight'>
                      {user?.name}
                    </span>
                    <span className='text-[10px] text-gray-400 font-medium leading-tight'>Member</span>
                  </div>
                </div>
                <button
                  className='w-full text-center py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all'
                  onClick={() => {
                    handleLogout();
                    toggleShowNav();
                  }}
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
