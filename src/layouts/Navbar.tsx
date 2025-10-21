import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import React from 'react';
import { FaArrowLeftLong } from 'react-icons/fa6';
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

  return (
    <header className='fixed top-0 z-[100] w-full bg-primary-white shadow-xl font-primary'>
      <div className='flex flex-row items-center justify-between h-24 md:h-20 layout'>
        <UnstyledLink
          href='/'
          className='flex flex-row items-center gap-2 md:gap-4'
        >
          <NextImage
            src='/images/logo.png'
            alt='logo'
            width='254'
            height='177'
            className='w-16'
          />
        </UnstyledLink>

        {/* Desktop Navbar */}
        <nav className='hidden md:block'>
          <ul className='flex flex-row items-center justify-between gap-6 text-base'>
            <li>
              <UnstyledLink
                href='/'
                className='flex p-2.5 hover:text-primary-bluegreen hover:bg-gray-100 rounded-lg'
              >
                <Typography color='inline' variant='bt' className={clsxm()}>
                  Home
                </Typography>
              </UnstyledLink>
            </li>
            <li>
              <Menu className='static z-50 flex ' as='div'>
                <Menu.Button>
                  {({ open }) => (
                    <Typography
                      color='inline'
                      variant='bt'
                      className='text-neutral-80 p-2.5  hover:bg-gray-100 rounded-lg  flex flex-row gap-1.5 items-center hover:text-primary-bluegreen'
                    >
                      Programs
                      <HiChevronDown
                        className={clsxm(
                          'text-base text-neutral-80 transition ease-in-out duration-200',
                          open && 'rotate-180'
                        )}
                      />
                    </Typography>
                  )}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter='transition ease-out duration-100'
                  enterFrom='transform opacity-0 scale-95'
                  enterTo='transform opacity-100 scale-100'
                  leave='transition ease-in duration-75'
                  leaveFrom='transform opacity-100 scale-100'
                  leaveTo='transform opacity-0 scale-95'
                >
                  <Menu.Items
                    className={clsxm(
                      'absolute w-screen h-auto left-0 mt-12 z-50 bg-white shadow-xl focus:outline-none'
                    )}
                  >
                    <div className='flex flex-row gap-6 py-6 layout'>
                      <div className='flex flex-col gap-1.5 w-fit text-start'>
                        {programs.map(({ name }, index) => (
                          <Button
                            key={index}
                            onClick={() => togglePrograms(index)}
                            variant='unstyled'
                            className={clsxm(
                              // (scholarshipOpen && index === 0) ||
                              boosterOpen && index === 0
                                ? 'bg-gray-100  text-primary-orange hover:text-primary-orange'
                                : 'bg-white   text-black-100 hover:text-black-100',
                              'text-start !p-0 active:text-black-100 justify-start text-sm md:w-[240px] hover:bg-gray-100  '
                            )}
                          >
                            <div className=' w-fit flex items-center gap-1.5 p-2 hover:rounded-md'>
                              <Typography color='inline' variant='bt' as='p'>
                                {name}
                              </Typography>

                              <HiChevronRight
                                className={clsxm(
                                  // (scholarshipOpen && index === 0) ||
                                  boosterOpen && index === 0
                                    ? 'rotate-180 '
                                    : 'rotate-0',
                                  'h-4 w-4 transition ease-in-out duration-200'
                                )}
                              />
                            </div>
                          </Button>
                        ))}
                        <ButtonLink
                          href='https://raihasa.myr.id/bundling'
                          className='bg-white  text-black-100 hover:text-black-100 text-start !p-0 active:text-black-100 justify-start text-sm md:w-[240px] hover:bg-gray-100'
                        >
                          <div className='w-fit flex items-center gap-1.5 p-2 hover:rounded-md'>
                            <Typography color='inline' variant='bt' as='p'>
                              BISA Membership
                            </Typography>
                          </div>
                        </ButtonLink>
                      </div>

                      <span className='w-0.5 h-auto bg-gray-200'></span>

                      <div className='w-auto h-auto overflow-x-auto rounded-xl'>
                        <div className='grid grid-flow-col gap-4'>
                          {/* {scholarshipOpen &&
                            SCHOLARSHIP_FAIR_CARD_DATA.map((e, index) => (
                              <ProgramCard
                                key={index}
                                title={e.title}
                                desc={e.desc}
                                href={e.href}
                                img={e.img}
                                gradientColor='from-[#C0172AB5] to-[#12121280]'
                                buttonClassName='bg-[#E94759] hover:bg-[#ff99a5]'
                              />
                            ))} */}

                          {boosterOpen &&
                            BOOSTER_SERIES_CARD_DATA.map((f, index) => (
                              <ProgramCard
                                key={index}
                                title={f.title}
                                desc={f.desc}
                                href={f.href}
                                img={f.img}
                                gradientColor='from-[#E47F1A] to-[#12121280]'
                                buttonClassName='bg-[#FB991A] hover:bg-[#ffc77d]'
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </li>
            {/* <li>
              <UnstyledLink href='/product' className='flex p-2.5'>
                <Typography
                  color='inline'
                  variant='bt'
                  className='hover:text-primary-bluegreen'
                >
                  Product
                </Typography>
              </UnstyledLink>
            </li> */}
            <li>
              <UnstyledLink
                href='/coming-soon'
                className='flex p-2.5 hover:text-primary-bluegreen hover:bg-gray-100 rounded-lg'
              >
                <Typography
                  color='inline'
                  variant='bt'
                  className='hover:text-primary-bluegreen'
                >
                  Mentors
                </Typography>
              </UnstyledLink>
            </li>
          {isLogin && (
              <li>
                <UnstyledLink
                  href='/scholarship-info'
                  className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='py-4 pl-4'
                  >
                    Info Beasiswa
                  </Typography>
                </UnstyledLink>
              </li>
            )}

            <div className='flex flex-row gap-4'>
              {!isLogin ? (
                <>
                  <ButtonLink
                    href='/register'
                    size='base'
                    variant='primary'
                    isOutline={false}
                    className='hover:bg-transparent hover:text-primary-bluegreen'
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
                    className='hover:bg-primary-bluegreen hover:text-white'
                  >
                    <Typography color='inline' variant='bt'>
                      Masuk
                    </Typography>
                  </ButtonLink>
                </>
              ) : (
                <Menu as='div' className='relative z-20 w-fit'>
                  <Menu.Button className='ring ring-primary-bluegreen w-full font-semibold rounded-md md:rounded-lg py-1.5 px-[14px]'>
                    {() => (
                      
                      <div className='flex w-full h-[42px] py-2 px-4 justify-center items-center gap-2 text-primary-bluegreen cursor-pointer'>
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

                      {isLogin && user?.role === 'USER' && (
                        <li>
                          <UnstyledLink
                            href='/dashboard'
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
          </ul>
        </nav>

        {!isOpen && (
          <IconButton
            variant='unstyled'
            icon={HiOutlineMenuAlt3}
            className='md:hidden'
            iconClassName='text-primary-bluegreen'
            onClick={toggleShowNav}
          />
        )}
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
          <ul className='space-y-8'>
            <div className='w-full space-y-2 text-base '>
              <li>
                <UnstyledLink
                  href='/'
                  className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='py-4 pl-4 '
                  >
                    Home
                  </Typography>
                </UnstyledLink>
              </li>
              <li>
                <Menu className='static z-10 flex' as='div'>
                  <Menu.Button
                    className={clsxm(
                      `py-4 pl-4 w-full hover:bg-gray-100 rounded-lg hover:text-primary-bluegreen`
                    )}
                    onClick={toggleNavPrograms}
                  >
                    {/* {({ open }) => (
                      <Typography
                        color='inline'
                        variant='bt'
                        className='text-neutral-80 flex flex-row gap-1.5 items-center w-full '
                      >
                        Programs
                        <HiChevronDown
                          className={clsxm(
                            'text-base text-neutral-80 transition ease-in-out duration-200',
                            open && 'rotate-180'
                          )}
                        />
                      </Typography>
                    )} */}

                    <Typography
                      color='inline'
                      variant='bt'
                      className='text-neutral-80 flex flex-row gap-1.5 items-center w-full'
                    >
                      Programs
                      <HiChevronDown
                        className={`text-base text-neutral-80 transition ease-in-out duration-200`}
                        // ${openPrograms ? 'rotate-180' : ''}
                      />
                    </Typography>
                  </Menu.Button>

                  {openPrograms && (
                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'
                    >
                      <Menu.Items
                        className={clsxm(
                          openPrograms
                            ? `absolute w-screen h-screen top-0 left-0 z-60 bg-white focus:outline-none`
                            : `hidden`
                        )}
                      >
                        <div className='z-40 flex flex-col w-full h-auto gap-6 px-4 py-6 bg-white'>
                          <Button
                            onClick={toggleNavPrograms}
                            leftIcon={FaArrowLeftLong}
                            className='w-fit'
                          >
                            Programs
                          </Button>

                          <div className='flex flex-col gap-1.5 w-full text-start'>
                            {programs.map(({ name }, index) => (
                              <Button
                                key={index}
                                onClick={() => togglePrograms(index)}
                                variant='unstyled'
                                className={clsxm(
                                  // (scholarshipOpen && index === 0) ||
                                  boosterOpen && index === 0
                                    ? 'bg-gray-100  text-primary-orange hover:text-primary-orange '
                                    : 'bg-white  text-black-100 hover:text-black-100 ',
                                  'text-start flex !p-0 active:text-black-100 justify-start text-sm md:w-full border-2 hover:bg-gray-100  '
                                )}
                              >
                                <div className=' w-full flex items-center gap-1.5 p-2 hover:rounded-md'>
                                  <Typography
                                    color='inline'
                                    variant='bt'
                                    as='p'
                                  >
                                    {name}
                                  </Typography>
                                  <HiChevronDown
                                    className={clsxm(
                                      // (scholarshipOpen && index === 0) ||
                                      boosterOpen && index === 0
                                        ? 'rotate-180 text-primary-orange'
                                        : 'rotate-0 text-black-100',
                                      'h-4 w-4 transition ease-in-out duration-200'
                                    )}
                                  />
                                </div>
                              </Button>
                            ))}
                          </div>

                          <div className='flex flex-col items-center w-full h-auto pb-8 rounded-xl'>
                            <div className='grid grid-flow-row gap-4'>
                              {/* {scholarshipOpen &&
                                SCHOLARSHIP_FAIR_CARD_DATA.map((e, index) => (
                                  <ProgramCard
                                    key={index}
                                    title={e.title}
                                    desc={e.desc}
                                    href={e.href}
                                    img={e.img}
                                    gradientColor='from-[#C0172AB5] to-[#12121280]'
                                    buttonClassName='bg-[#E94759] hover:bg-[#ff99a5]'
                                  />
                                ))} */}

                              {boosterOpen &&
                                BOOSTER_SERIES_CARD_DATA.map((f, index) => (
                                  <ProgramCard
                                    key={index}
                                    title={f.title}
                                    desc={f.desc}
                                    href={f.href}
                                    img={f.img}
                                    gradientColor='from-[#E47F1A] to-[#12121280]'
                                    buttonClassName='bg-[#FB991A] hover:bg-[#ffc77d]'
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  )}
                </Menu>
              </li>
              {/* <li>
                <UnstyledLink
                  href='/product'
                  className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='py-4 pl-4 '
                  >
                    Produk Kami
                  </Typography>
                </UnstyledLink>
              </li> */}
              <li>
                <UnstyledLink
                  href='/mentors'
                  className='flex rounded-lg hover:bg-gray-100 hover:text-primary-bluegreen'
                >
                  <Typography
                    color='inline'
                    variant='bt'
                    className='py-4 pl-4 '
                  >
                    Mentors
                  </Typography>
                </UnstyledLink>
              </li>
               {isLogin && (
                <li>
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
                </li>
              )}
              {isLogin && user?.role === 'ADMIN' ? (
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
              ) : isLogin && user?.role === 'USER' ? (
                <li>
                  <UnstyledLink
                    href='/dashboard'
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
              ) : (
                ' '
              )}
            </div>
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
          </ul>
        </nav>

        <IconButton
          variant='unstyled'
          icon={MdClose}
          size='lg'
          className='bg-transparent border-2 rounded-full border-primary-bluegreen'
          iconClassName='text-primary-bluegreen'
          onClick={toggleShowNav}
        />
      </div>
    </header>
  );
}
