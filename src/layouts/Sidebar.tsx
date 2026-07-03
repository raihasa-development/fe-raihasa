import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaUsers, FaBookReader } from 'react-icons/fa';
import { HiHome, HiLogout, HiUserGroup, HiCurrencyDollar } from 'react-icons/hi';
import { IoSparkles, IoBulbOutline, IoSettingsOutline } from 'react-icons/io5';
import { FiX } from 'react-icons/fi';

import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import clsxm from '@/lib/clsxm';
import useAuthStore from '@/store/useAuthStore';

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    if (
      pathName.includes('scholra') ||
      pathName.includes('dreamshub') ||
      pathName.includes('bisa-learning') ||
      pathName.includes('scholarship-recommendation')
    ) {
      setIsServicesOpen(true);
      setActiveSection('services');
    } else if (
      pathName.includes('users') ||
      pathName.includes('crm') ||
      pathName.includes('mentors') ||
      pathName.includes('payments') ||
      pathName.includes('manajemen-beasiswa') ||
      pathName.includes('courses') ||
      pathName.includes('pricing') ||
      pathName.includes('promos') ||
      pathName.includes('config') ||
      pathName.includes('scholra-tracks')
    ) {
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
          paths: ['/admin/users'],
        },
        {
          title: 'CRM Analytics',
          href: '/admin/crm',
          icon: FaUsers,
          paths: ['/admin/crm'],
        },
        {
          title: 'Kelola Mentor',
          href: '/admin/mentors',
          icon: HiUserGroup,
          paths: ['/admin/mentors'],
        },
        {
          title: 'Manage Courses',
          href: '/admin/courses',
          icon: FaBookReader,
          paths: ['/admin/courses'],
        },
        {
          title: 'Manage Pricing',
          href: '/admin/pricing',
          icon: HiCurrencyDollar,
          paths: ['/admin/pricing'],
        },
        {
          title: 'Manage Promos',
          href: '/admin/promos',
          icon: HiCurrencyDollar,
          paths: ['/admin/promos'],
        },
        {
          title: 'Payment Monitoring',
          href: '/admin/payments',
          icon: HiCurrencyDollar,
          paths: ['/admin/payments'],
        },
        {
          title: 'Generate Kuitansi',
          href: '/admin/payments/receipt',
          icon: HiCurrencyDollar,
          paths: ['/admin/payments/receipt'],
        },
        {
          title: 'Manajemen Beasiswa',
          href: '/admin/manajemen-beasiswa',
          icon: IoBulbOutline,
          paths: ['/admin/manajemen-beasiswa'],
        },
        {
          title: 'Scholra Tracking',
          href: '/admin/scholra-tracks',
          icon: IoBulbOutline,
          paths: ['/admin/scholra-tracks'],
        },
        {
          title: 'Konfigurasi Sistem',
          href: '/admin/config',
          icon: IoSettingsOutline,
          paths: ['/admin/config'],
        },
      ],
    },
  ];

  const userMenu = [
    {
      id: 'services',
      title: 'Fitur Utama',
      icon: IoSparkles,
      isOpen: isServicesOpen,
      setIsOpen: setIsServicesOpen,
      items: [
        {
          title: 'Scholra',
          href: '/scholra',
          icon: IoBulbOutline,
          paths: ['/scholra', '/scholarship-recommendation', '/scholarship-recommendation/results'],
        },
        {
          title: 'BISA Learning',
          href: '/bisa-learning',
          icon: FaBookReader,
          paths: ['/bisa-learning', '/dashboard/bisa-learning'],
        },
        {
          title: 'Dreamshub',
          href: isAdmin ? '/admin/dreamshub' : '/dreamshub',
          icon: FaUsers,
          paths: ['/dreamshub', '/dashboard/dreamshub', '/admin/dreamshub'],
        },
      ],
    },
  ];

  const menuSections = isAdmin ? [...adminMenu, ...userMenu] : userMenu;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className={clsxm(
          'fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 xl:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <div
        className={clsxm(
          'fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 overflow-hidden transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        )}
      >
        {/* Header */}
        <div className='flex-shrink-0 px-6 py-6 border-b border-gray-100 relative'>
          {onClose && (
            <button
              onClick={onClose}
              className='xl:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors'
              aria-label='Close sidebar'
            >
              <FiX className='w-5 h-5' />
            </button>
          )}
          <div className='text-center mb-4'>
            <NextImage
              src='/images/logo.png'
              alt='logo'
              width={254}
              height={177}
              className='w-12 mx-auto mb-2'
            />
            <Typography className='text-primary-blue font-bold text-lg'>
              Raihasa
            </Typography>
            <Typography className='text-gray-400 text-xs tracking-wider'>
              Dashboard Panel
            </Typography>
          </div>

          {/* User Profile */}
          <div className='flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 via-white to-orange-50 rounded-xl border border-gray-100'>
            <div className='relative flex-shrink-0'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#1B7691] to-[#FB991A] flex items-center justify-center shadow-sm'>
                <Typography className='text-white font-bold text-sm'>
                  {user?.name?.charAt(0).toUpperCase()}
                </Typography>
              </div>
              <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
            </div>
            <div className='flex-1 min-w-0 overflow-hidden'>
              <Typography variant='bt' weight='semibold' className='text-gray-900 truncate text-xs block font-bold'>
                {user?.name}
              </Typography>
              <Typography variant='c2' className='text-gray-400 truncate text-[10px] block font-semibold uppercase tracking-wider'>
                {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
              </Typography>
            </div>
          </div>
        </div>

        {/* Navigation - Make it scrollable properly */}
        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-250'>
          {/* Home / Dashboard Link */}
          <div>
            <UnstyledLink
              href={isAdmin ? `/admin` : `/home`}
              className={clsxm(
                'group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-xs',
                (pathName === '/admin' || pathName === '/home') && 'bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white shadow-md'
              )}
            >
              <div className={clsxm(
                'p-1.5 rounded-lg transition-all duration-300 flex-shrink-0',
                pathName === '/admin' || pathName === '/home'
                  ? 'bg-white/20'
                  : 'bg-gray-100 group-hover:bg-[#1B7691]/10'
              )}>
                <HiHome
                  className={clsxm(
                    'w-4 h-4 transition-colors duration-300',
                    pathName === '/admin' || pathName === '/home'
                      ? 'text-white'
                      : 'text-gray-600 group-hover:text-[#1B7691]'
                  )}
                />
              </div>
              <Typography
                variant='bt'
                weight='medium'
                className={clsxm(
                  'transition-colors duration-300 truncate text-xs font-bold',
                  pathName === '/admin' || pathName === '/home'
                    ? 'text-white'
                    : 'text-gray-700 group-hover:text-gray-900'
                )}
              >
                Dashboard Utama
              </Typography>
            </UnstyledLink>
          </div>

          {/* Menu Sections */}
          <div className='space-y-3'>
            {menuSections.map((section) => (
              <div key={section.id} className='mb-2'>
                {/* Section Header */}
                <button
                  onClick={() => {
                    section.setIsOpen(!section.isOpen);
                    setActiveSection(section.isOpen ? '' : section.id);
                  }}
                  className={clsxm(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-xs group border border-transparent',
                    activeSection === section.id && 'bg-blue-50/50 shadow-xs border-blue-100/50'
                  )}
                >
                  <div className={clsxm(
                    'p-1.5 rounded-lg transition-all duration-300 flex-shrink-0',
                    activeSection === section.id
                      ? 'bg-[#1B7691]/10'
                      : 'bg-gray-100 group-hover:bg-[#1B7691]/10'
                  )}>
                    <section.icon className={clsxm(
                      'w-4 h-4 transition-colors duration-300',
                      activeSection === section.id ? 'text-[#1B7691]' : 'text-gray-600 group-hover:text-[#1B7691]'
                    )} />
                  </div>
                  <Typography
                    variant='bt'
                    weight='medium'
                    className={clsxm(
                      'flex-1 text-left transition-colors duration-300 truncate text-xs font-bold',
                      activeSection === section.id ? 'text-[#1B7691]' : 'text-gray-700 group-hover:text-gray-900'
                    )}
                  >
                    {section.title}
                  </Typography>
                  <FaChevronDown
                    className={clsxm(
                      'w-3.5 h-3.5 transition-all duration-300 flex-shrink-0',
                      section.isOpen ? 'rotate-180 text-[#1B7691]' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                </button>

                {/* Section Items with dynamic scroll height fix */}
                <div className={clsxm(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  section.isOpen ? 'max-h-[1000px] opacity-100 mt-1.5' : 'max-h-0 opacity-0'
                )}>
                  <div className='ml-3 space-y-1 pb-1 border-l border-gray-100 pl-3'>
                    {section.items.map((item) => {
                      const isActive = item.paths.includes(pathName);
                      return (
                        <UnstyledLink
                          key={item.title}
                          href={item.href}
                          className={clsxm(
                            'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden',
                            isActive
                              ? 'bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white shadow-xs font-bold'
                              : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                          )}
                        >
                          <div className={clsxm(
                            'p-1 rounded-lg transition-all duration-300 relative z-10 flex-shrink-0',
                            isActive
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-[#1B7691]/10'
                          )}>
                            <item.icon className={clsxm(
                              'w-3.5 h-3.5 transition-colors duration-300',
                              isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#1B7691]'
                            )} />
                          </div>
                          <Typography
                            variant='c1'
                            weight='medium'
                            className={clsxm(
                              'transition-colors duration-300 relative z-10 truncate text-[11px] font-semibold',
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
            className='w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group hover:shadow-xs'
          >
            <div className='p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-300 flex-shrink-0'>
              <HiLogout className='w-4 h-4 group-hover:scale-110 transition-transform duration-300' />
            </div>
            <Typography variant='bt' weight='medium' className='group-hover:text-red-700 transition-colors duration-300 truncate text-xs font-bold'>
              Logout
            </Typography>
          </button>
        </div>
      </div>
    </>
  );
}
