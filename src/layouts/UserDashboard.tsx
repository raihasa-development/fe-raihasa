import { Disclosure, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import { HiChevronDown, HiOutlineLogout } from 'react-icons/hi';
import { IoCartOutline } from 'react-icons/io5';
import { LuClipboardList, LuUser } from 'react-icons/lu';

import Button from '@/components/buttons/Button';
import ButtonLink from '@/components/links/ButtonLink';
import UnstyledLink from '@/components/links/UnstyledLink';
import Modal from '@/components/modal/Modal';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';
import Typography from '@/components/Typography';
import clsxm from '@/lib/clsxm';
import { getToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';

export function MobileSidebar() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const logOut = useAuthStore.useLogout();
  const token = getToken();
  const router = useRouter();
  const user = useAuthStore().user;
  const pathName = router.pathname;

  useEffect(() => {
    if (user !== undefined && token !== null) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [user, token]);

  const handleLogout = () => {
    logOut();
    setIsModalOpen(false);
    showToast('Sampai jumpa lagi!, semoga harimu menyenangkan', SUCCESS_TOAST);
    router.push('/');
  };

  const handleConfirmLogout = () => {
    setIsModalOpen(true);
  };

  const menuItems = [
    {
      title: 'Notification',
      href: '/profile/notification',
      icon: FaRegBell,
    },
    {
      title: 'User Profile',
      href: '/profile/edit',
      icon: LuUser,
    },
    {
      title: 'Aktifitas Saya',
      href: '/profile/activity',
      icon: LuClipboardList,
    },
    {
      title: 'Riwayat Transaksi',
      href: '/profile/transaction',
      icon: IoCartOutline,
    },
  ];

  return (
    <div className='block w-full px-4 sm:px-5 mb-6 md:mb-8 xl:hidden'>
      <Modal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title='Konfirmasi Logout'
        modalContainerClassName='border-none !bg-white rounded-2xl shadow-2xl p-5 md:p-6 max-w-md mx-4'
        titleClassName='font-bold text-gray-900 text-lg md:text-xl mb-2'
      >
        <div className='py-3 md:py-4'>
          <Typography className='text-gray-600 text-center mb-5 md:mb-6 text-sm md:text-base px-2'>
            Apakah kamu yakin ingin keluar dari akun?
          </Typography>
          
          <div className='flex flex-col sm:flex-row justify-center gap-2.5 md:gap-3'>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant='unstyled'
              className='flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 py-2.5 md:py-3'
            >
              Batal
            </Button>

            <Button
              onClick={handleLogout}
              className='flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-2.5 md:py-3'
            >
              Ya, Logout
            </Button>
          </div>
        </div>
      </Modal>

      <Disclosure as='div' className='w-full'>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={clsxm(
                'flex justify-between items-center w-full rounded-xl px-4 py-3 transition-all duration-300',
                'border-2 hover:shadow-md',
                open 
                  ? 'border-primary-blue bg-blue-50 font-semibold shadow-md' 
                  : 'border-gray-200 bg-white font-medium hover:border-gray-300'
              )}
            >
              <Typography variant='bt' className={clsxm(
                'transition-colors duration-300 text-sm md:text-base',
                open ? 'text-primary-blue' : 'text-gray-700'
              )}>
                Navigasi Profile
              </Typography>
              <HiChevronDown
                className={clsxm(
                  'h-5 w-5 transition-all duration-300 flex-shrink-0',
                  open ? 'rotate-180 text-primary-blue' : 'text-gray-500'
                )}
              />
            </Disclosure.Button>
            
            <Transition
              enter='transition duration-200 ease-out'
              enterFrom='transform scale-95 opacity-0 -translate-y-2'
              enterTo='transform scale-100 opacity-100 translate-y-0'
              leave='transition duration-150 ease-in'
              leaveFrom='transform scale-100 opacity-100 translate-y-0'
              leaveTo='transform scale-95 opacity-0 -translate-y-2'
            >
              <Disclosure.Panel className='mt-3 bg-white border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden'>
                <ul className='divide-y divide-gray-100'>
                  {menuItems.map((item) => {
                    const isActive = pathName === item.href;
                    return (
                      <li key={item.href}>
                        <UnstyledLink
                          href={item.href}
                          className={clsxm(
                            'flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 transition-all duration-300 group',
                            isActive
                              ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white'
                              : 'text-gray-700 hover:bg-blue-50'
                          )}
                        >
                          <div className={clsxm(
                            'p-1.5 md:p-2 rounded-lg transition-all duration-300 flex-shrink-0',
                            isActive ? 'bg-white/20' : 'bg-blue-100 group-hover:scale-110'
                          )}>
                            <item.icon className={clsxm(
                              'w-4 h-4 md:w-5 md:h-5 transition-colors duration-300',
                              isActive ? 'text-white' : 'text-primary-blue'
                            )} />
                          </div>
                          <Typography variant='bt' weight='medium' className='flex-1 text-sm md:text-base truncate'>
                            {item.title}
                          </Typography>
                        </UnstyledLink>
                      </li>
                    );
                  })}
                  <li className='p-3.5 md:p-4 bg-gray-50'>
                    <Button
                      leftIcon={HiOutlineLogout}
                      className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2.5 md:py-3 text-sm md:text-base'
                      onClick={handleConfirmLogout}
                    >
                      Logout
                    </Button>
                  </li>
                </ul>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}

export function SidebarUser() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathName = router.pathname;
  const logOut = useAuthStore.useLogout();

  const handleLogout = () => {
    logOut();
    setIsModalOpen(false);
    showToast('Sampai jumpa lagi!, semoga harimu menyenangkan', SUCCESS_TOAST);
    router.push('/');
  };

  const handleConfirmLogout = () => {
    setIsModalOpen(true);
  };

  const menuItems = [
    {
      title: 'Notification',
      href: '/profile/notification',
      icon: FaRegBell,
    },
    {
      title: 'User Profile',
      href: '/profile/edit',
      icon: LuUser,
    },
    {
      title: 'Aktifitas Saya',
      href: '/profile/activity',
      icon: LuClipboardList,
    },
    {
      title: 'Riwayat Transaksi',
      href: '/profile/transaction',
      icon: IoCartOutline,
    },
  ];

  return (
    <>
      <Modal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title='Konfirmasi Logout'
        modalContainerClassName='border-none !bg-white rounded-2xl shadow-2xl p-6 max-w-md'
        titleClassName='font-bold text-gray-900 text-xl mb-2'
      >
        <div className='py-4'>
          <Typography className='text-gray-600 text-center mb-6 px-2'>
            Apakah kamu yakin ingin keluar dari akun?
          </Typography>
          
          <div className='flex flex-col sm:flex-row justify-center gap-3'>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant='unstyled'
              className='flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200'
            >
              Batal
            </Button>

            <Button
              onClick={handleLogout}
              className='flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
            >
              Ya, Logout
            </Button>
          </div>
        </div>
      </Modal>

      <div className='hidden xl:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
        <div className='px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-blue-50 to-orange-50 border-b border-gray-100'>
          <Typography variant='h3' weight='bold' className='text-gray-900'>
            Navigasi Profile
          </Typography>
          <Typography variant='c1' className='text-gray-600 mt-1'>
            Kelola profil dan aktivitas Anda
          </Typography>
        </div>
        
        <ul className='divide-y divide-gray-100'>
          {menuItems.map((item) => {
            const isActive = pathName === item.href;
            return (
              <li key={item.href}>
                <UnstyledLink
                  href={item.href}
                  className={clsxm(
                    'flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3.5 md:py-4 transition-all duration-300 group relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  )}
                >
                  {isActive && (
                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 md:h-10 bg-white rounded-r-full' />
                  )}
                  
                  <div className={clsxm(
                    'p-1.5 md:p-2 rounded-lg transition-all duration-300 flex-shrink-0',
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-blue-100 group-hover:bg-primary-blue/10 group-hover:scale-110'
                  )}>
                    <item.icon className={clsxm(
                      'w-4 h-4 md:w-5 md:h-5 transition-colors duration-300',
                      isActive ? 'text-white' : 'text-primary-blue'
                    )} />
                  </div>
                  
                  <Typography variant='bt' weight='medium' className='flex-1 truncate'>
                    {item.title}
                  </Typography>
                  
                  {isActive && (
                    <div className='w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0' />
                  )}
                </UnstyledLink>
              </li>
            );
          })}
        </ul>
        
        <div className='p-4 md:p-5 bg-gray-50 border-t border-gray-100'>
          <Button
            leftIcon={HiOutlineLogout}
            onClick={handleConfirmLogout}
            className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 group'
          >
            <span className='group-hover:scale-105 transition-transform duration-300'>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
