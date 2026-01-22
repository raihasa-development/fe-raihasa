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
    <header className='fixed top-0 z-[100] w-full py-4 px-4 md:px-8 font-primary'>
      {/* Glass Pill Navbar - Solid White on Blue Pages, Glassy on others */}
      <div className={clsxm(
        'max-w-6xl mx-auto rounded-full border shadow-lg transition-all duration-500',
        isBluePage
          ? 'bg-white/90 backdrop-blur-md border-white/60 shadow-blue-900/10' // High Opacity Glass for Blue Pages (Frosted)
          : 'bg-white/70 backdrop-blur-xl border-white/50 shadow-black/5' // Default Glassy
      )}>
        <div className='flex flex-row items-center justify-between h-16 px-6'>
          <UnstyledLink
            href='/'
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
                  href='/'
                  className={clsxm(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname === '/'
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
                  href='/scholarship-recommendation/maintenance'
                  className={clsxm(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    router.pathname.startsWith('/scholarship-recommendation')
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

      {/* Mobile Nav */}
      <div
        className={clsxm(
          'fixed left-0 top-0 flex flex-col items-center gap-12',
          'w-full h-screen shadow-xl px-4 pt-10 pb-24 md:hidden bg-primary-white overflow-y-auto overflow-x-clip',
          'transition ease-in-out duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <UnstyledLink
          href='/'
          className='flex flex-row items-center gap-2 md:gap-4'
        >
          <NextImage
            src='/images/logo.png'
            alt='logo'
            width='254'
            height='177'
            className='w-16 md:w-24'
          />
        </UnstyledLink>

        <nav className='flex-1 w-full'>
          <ul className='space-y-2'>
            <li>
              <UnstyledLink
                href='/'
                className='flex rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                onClick={toggleShowNav}
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='py-4 pl-4'
                >
                  Home
                </Typography>
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/scholarship-calendar'
                className='flex rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                onClick={toggleShowNav}
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='py-4 pl-4'
                >
                  Calendar
                </Typography>
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/scholarship-recommendation/maintenance'
                className='flex items-center gap-2 rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                onClick={toggleShowNav}
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='py-4 pl-4'
                >
                  Scholra
                </Typography>
                <span className='px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded'>AI</span>
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/dreamshub'
                className='flex rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                onClick={toggleShowNav}
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='py-4 pl-4'
                >
                  Dreamshub
                </Typography>
              </UnstyledLink>
            </li>
            <li>
              <UnstyledLink
                href='/bisa-learning'
                className='flex rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                onClick={toggleShowNav}
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='py-4 pl-4'
                >
                  BISA Learning
                </Typography>
              </UnstyledLink>
            </li>

            {/* User-specific items */}
            {isLogin && user?.role === 'ADMIN' && (
              <li>
                <UnstyledLink
                  href='/admin'
                  className='flex rounded-xl hover:bg-[#1B7691]/5 hover:text-[#1B7691] transition-colors'
                  onClick={toggleShowNav}
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='py-4 pl-4'
                  >
                    Dashboard
                  </Typography>
                </UnstyledLink>
              </li>
            )}

          </ul>
          <div className='flex flex-col gap-4'>
            {!isLogin ? (
              <>
                <ButtonLink
                  href='/register'
                  size='base'
                  variant='primary'
                  isOutline={false}
                  className='py-4 hover:bg-transparent hover:text-primary-bluegreen'
                >
                  <Typography color='inline' variant='bt'>
                    Daftar
                  </Typography>
                </ButtonLink>
                <ButtonLink
                  href='/login'
                  size='base'
                  variant='primary'
                  isOutline={true}
                  className='py-4 hover:bg-primary-bluegreen hover:text-white'
                >
                  <Typography color='inline' variant='bt'>
                    Masuk
                  </Typography>
                </ButtonLink>
              </>
            ) : (
              <>
                <UnstyledLink
                  href='/scholarship-info'
                  className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='px-4 py-4'
                  >
                    Info Beasiswa
                  </Typography>
                </UnstyledLink>
                <Menu as='div' className='w-full '>
                  <Menu.Button className='ring ring-primary-bluegreen w-full font-semibold rounded-md md:rounded-lg py-1.5 px-[14px]'>
                    {() => (
                      <div className='flex w-full h-[42px] py-2 px-4 justify-start items-center gap-2 text-primary-bluegreen cursor-pointer'>
                        <HiUserCircle className='w-6 h-6' />
                        <span className='text-lg font-semibold'>
                          Hai, {user?.name}!
                        </span>
                      </div>
                    )}
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
                    <Menu.Items className='relative z-20 w-full flex flex-col py-4 px-2 mt-[14px] gap-2 bg-white rounded-md md:rounded-lg'>
                      {/* <Menu.Item
                        as='button'
                        className='flex items-center justify-start w-full gap-2 px-4 py-2 text-lg font-semibold cursor-pointer text-primary-bluegreen'
                        onClick={() => router.push('/profile-user')}
                      >
                        Profil Saya
                      </Menu.Item> */}
                      <Menu.Item
                        as='button'
                        className='flex items-center justify-start w-full gap-2 px-4 py-2 text-lg font-semibold border-2 rounded-lg cursor-pointer hover:text-rose-600 text-rose-800 hover:bg-rose-200 border-rose-200'
                        onClick={handleLogout}
                      >
                        <span className='text-lg font-semibold'>Log out</span>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            )}
          </div>
        </nav>

        <IconButton
          variant='unstyled'
          icon={MdClose}
          size='lg'
          className='bg-transparent border-2 rounded-full border-[#1B7691]'
          iconClassName='text-[#1B7691]'
          onClick={toggleShowNav}
        />
      </div>
    </header>
  );
}
