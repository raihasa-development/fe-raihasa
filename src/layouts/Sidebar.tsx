import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaUsers, FaBookReader } from 'react-icons/fa';
import { HiHome, HiLogout, HiUserGroup, HiCurrencyDollar } from 'react-icons/hi';
import { IoSparkles, IoBulbOutline, IoSettingsOutline } from 'react-icons/io5';

import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import clsxm from '@/lib/clsxm';
import useAuthStore from '@/store/useAuthStore';

export default function Sidebar() {
  const user = useAuthStore().user;
  const logout = useAuthStore().logout;
  const router = useRouter();

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const pathName = router.pathname;
  const isAdmin = user?.role === 'ADMIN';

  // Auto-expand sections based on current path
  useEffect(() => {
    if (pathName.includes('scholra') || pathName.includes('dreamshub') || pathName.includes('bisa-learning')) {
      setIsServicesOpen(true);
      setActiveSection('services');
    } else if (pathName.includes('users') || pathName.includes('payments') || pathName.includes('manajemen-beasiswa')) {
      setIsManagementOpen(true);
      setActiveSection('management');
    }
  }, [pathName]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const adminMenu = [
    {
      id: 'management',
      title: 'Admin Controls',
      icon: IoSettingsOutline,
      isOpen: isManagementOpen,
      setIsOpen: setIsManagementOpen,
      items: [
        {
          title: 'User Management',
          href: '/admin/users',
          icon: HiUserGroup,
          paths: ['/admin/users']
        },
        {
          title: 'Payment Monitor',
          href: '/admin/payments',
          icon: HiCurrencyDollar,
          paths: ['/admin/payments']
        },
        {
          title: 'LMS Content',
          href: '/admin/lms',
          icon: FaBookReader,
          paths: ['/admin/lms']
        },
        {
          title: 'Manajemen Beasiswa',
          href: '/admin/manajemen-beasiswa',
          icon: IoBulbOutline,
          paths: ['/admin/manajemen-beasiswa']
        }
      ]
    }
  ];

  const userMenu = [
    {
      id: 'services',
      title: 'Services',
      icon: IoSparkles,
      isOpen: isServicesOpen,
      setIsOpen: setIsServicesOpen,
      items: [
        {
          title: 'Scholra',
          href: isAdmin ? '/admin/scholra' : '/scholarship-recommendation',
          icon: IoBulbOutline,
          paths: ['/scholra', '/admin/scholra', '/rekomendasi-beasiswa']
        },
        {
          title: 'BISA Learning',
          href: isAdmin ? '/admin/bisa-learning' : '/dashboard/bisa-learning',
          icon: FaBookReader,
          paths: ['/dashboard/bisa-learning', '/admin/bisa-learning']
        },
        {
          title: 'Dreamshub',
          href: isAdmin ? '/admin/dreamshub' : '/dashboard/dreamshub',
          icon: FaUsers,
          paths: ['/dashboard/dreamshub', '/admin/dreamshub']
        }
      ]
    }
  ];

  const menuSections = isAdmin ? [...adminMenu, ...userMenu] : userMenu;

  return (
    <div className='hidden xl:block fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 overflow-hidden'>
      {/* Header */}
      <div className='flex-shrink-0 px-6 py-6 border-b border-gray-100'>
        <div className='text-center mb-6'>
          <NextImage
            src='/images/logo.png'
            alt='logo'
            width={254}
            height={177}
            className='w-12 mx-auto mb-3'
          />
          <Typography className='text-primary-blue font-bold text-lg'>
            Raihasa
          </Typography>
          <Typography className='text-gray-400 text-xs tracking-wider'>
            Dashboard
          </Typography>
        </div>

        {/* User Profile */}
        <div className='flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 via-white to-orange-50 rounded-xl border border-gray-100'>
          <div className='relative flex-shrink-0'>
            <div className='w-11 h-11 rounded-full bg-gradient-to-br from-primary-blue to-primary-orange flex items-center justify-center shadow-sm'>
              <Typography className='text-white font-bold text-base'>
                {user?.name?.charAt(0).toUpperCase()}
              </Typography>
            </div>
            <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full'></div>
          </div>
          <div className='flex-1 min-w-0 overflow-hidden'>
            <Typography variant='bt' weight='semibold' className='text-gray-900 truncate text-sm block'>
              {user?.name}
            </Typography>
            <Typography variant='c2' className='text-gray-500 truncate text-xs block'>
              {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
            </Typography>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
        {/* Home */}
        <div className='mb-6'>
          <UnstyledLink
            href={isAdmin ? `/admin` : `/dashboard`}
            className={clsxm(
              'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-sm',
              (pathName === '/dashboard' || pathName === '/admin') && 'bg-gradient-to-r from-primary-blue to-primary-orange shadow-md'
            )}
          >
            <div className={clsxm(
              'p-2 rounded-lg transition-all duration-300 flex-shrink-0',
              pathName === '/dashboard' || pathName === '/admin'
                ? 'bg-white/20'
                : 'bg-gray-100 group-hover:bg-primary-blue/10'
            )}>
              <HiHome
                className={clsxm(
                  'w-5 h-5 transition-colors duration-300',
                  pathName === '/dashboard' || pathName === '/admin'
                    ? 'text-white'
                    : 'text-gray-600 group-hover:text-primary-blue'
                )}
              />
            </div>
            <Typography
              variant='bt'
              weight='medium'
              className={clsxm(
                'transition-colors duration-300 truncate',
                pathName === '/dashboard' || pathName === '/admin'
                  ? 'text-white'
                  : 'text-gray-700 group-hover:text-gray-900'
              )}
            >
              Dashboard
            </Typography>
          </UnstyledLink>
        </div>

        {/* Menu Sections */}
        <div className='space-y-2'>
          {menuSections.map((section) => (
            <div key={section.id} className='mb-4'>
              {/* Section Header */}
              <button
                onClick={() => {
                  section.setIsOpen(!section.isOpen);
                  setActiveSection(section.isOpen ? '' : section.id);
                }}
                className={clsxm(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-sm group',
                  activeSection === section.id && 'bg-blue-50 shadow-sm border border-blue-100'
                )}
              >
                <div className={clsxm(
                  'p-2 rounded-lg transition-all duration-300 flex-shrink-0',
                  activeSection === section.id
                    ? 'bg-primary-blue/10'
                    : 'bg-gray-100 group-hover:bg-primary-blue/10'
                )}>
                  <section.icon className={clsxm(
                    'w-5 h-5 transition-colors duration-300',
                    activeSection === section.id ? 'text-primary-blue' : 'text-gray-600 group-hover:text-primary-blue'
                  )} />
                </div>
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    'flex-1 text-left transition-colors duration-300 truncate',
                    activeSection === section.id ? 'text-primary-blue' : 'text-gray-700 group-hover:text-gray-900'
                  )}
                >
                  {section.title}
                </Typography>
                <FaChevronDown
                  className={clsxm(
                    'w-4 h-4 transition-all duration-300 flex-shrink-0',
                    section.isOpen ? 'rotate-180 text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
              </button>

              {/* Section Items */}
              <div className={clsxm(
                'overflow-hidden transition-all duration-300 ease-in-out',
                section.isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
              )}>
                <div className='ml-4 space-y-1 pb-2'>
                  {section.items.map((item) => {
                    const isActive = item.paths.includes(pathName);
                    return (
                      <UnstyledLink
                        key={item.title}
                        href={item.href}
                        className={clsxm(
                          'group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden',
                          isActive
                            ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-md transform scale-[1.02]'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                        )}
                      >
                        {/* Background pattern for active state */}
                        {isActive && (
                          <div className='absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50' />
                        )}

                        {/* Active indicator */}
                        {isActive && (
                          <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm' />
                        )}

                        <div className={clsxm(
                          'p-1.5 rounded-lg transition-all duration-300 relative z-10 flex-shrink-0',
                          isActive
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-primary-blue/10'
                        )}>
                          <item.icon className={clsxm(
                            'w-4 h-4 transition-colors duration-300',
                            isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-blue'
                          )} />
                        </div>
                        <Typography
                          variant='c1'
                          weight='medium'
                          className={clsxm(
                            'transition-colors duration-300 relative z-10 truncate',
                            isActive ? 'text-white' : 'group-hover:text-gray-900'
                          )}
                        >
                          {item.title}
                        </Typography>
                      </UnstyledLink>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group hover:shadow-sm'
        >
          <div className='p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-300 flex-shrink-0'>
            <HiLogout className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' />
          </div>
          <Typography variant='bt' weight='medium' className='group-hover:text-red-700 transition-colors duration-300 truncate'>
            Logout
          </Typography>
        </button>
      </div>
    </div>
  );
}
