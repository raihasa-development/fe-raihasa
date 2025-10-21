import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaChevronDown, FaUserGroup } from 'react-icons/fa6';
import { HiBookOpen, HiDocumentSearch, HiDocumentText } from 'react-icons/hi';
import { TiHome } from 'react-icons/ti';

import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import clsxm from '@/lib/clsxm';
import useAuthStore from '@/store/useAuthStore';

export default function Sidebar() {
  const user = useAuthStore().user;
  const router = useRouter();

  const [isBoosterOpen, setIsBoosterOpen] = useState(true);
  const [isLmsOpen, setIsLmsOpen] = useState(false);
  const [isBeasiswaOpen, setIsBeasiswaOpen] = useState(false);

  const pathName = router.pathname;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className='relative z-50 px-6 py-8 bg-white'>
      <NextImage
        src='/images/logo.png'
        alt='logo'
        width={254}
        height={177}
        className='self-center w-20 mx-auto'
      />
      <div className='flex flex-row items-center gap-6 mt-6'>
        <div className='w-10 h-10 rounded-full bg-slate-400' />
        <div>
          <Typography
            variant='bt'
            weight='medium'
            className='text-primary-blue'
          >
            {user?.name}
          </Typography>
          <Typography
            variant='c2'
            weight='medium'
            className='truncate text-primary-blue max-w-52'
          >
            {user?.email}
          </Typography>
        </div>
      </div>

      <div className='mt-6'>
        <UnstyledLink
          href={isAdmin ? `/admin` : `/dashboard`}
          className={clsxm(
            'py-2 px-3 flex items-center gap-2 rounded-md',
            (pathName === '/dashboard' || pathName === '/admin') &&
              'bg-primary-blue'
          )}
        >
          <TiHome
            className={clsxm(
              'w-6 h-6',
              pathName === '/dashboard' || pathName === '/admin'
                ? 'text-white'
                : 'text-primary-blue'
            )}
          />
          <Typography
            variant='bt'
            weight='medium'
            className={clsxm(
              pathName === '/dashboard' || pathName === '/admin'
                ? 'text-white'
                : 'text-primary-blue'
            )}
          >
            Home
          </Typography>
        </UnstyledLink>
        <div className='h-[1px] my-3 w-full bg-[#111111]/15' />
        <div>
          <div
            className='flex items-center gap-4 hover:cursor-pointer'
            onClick={() => setIsBoosterOpen(!isBoosterOpen)}
          >
            <FaChevronDown
              className={clsxm(
                'w-4 h-4 text-primary-blue transition-all',
                isBoosterOpen && '-rotate-180'
              )}
            />
            <Typography
              variant='bt'
              weight='medium'
              className='text-primary-blue'
            >
              Booster
            </Typography>
          </div>
          {isBoosterOpen && (
            <div className='flex flex-col gap-2 mt-2 ml-4'>
              <UnstyledLink
                href={isAdmin ? `/admin/cv-boost` : `/dashboard/cv-boost`}
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  (pathName === '/dashboard/cv-boost' ||
                    pathName === '/admin/cv-boost') &&
                    'bg-primary-blue'
                )}
              >
                <HiDocumentSearch
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/dashboard/cv-boost' ||
                      pathName === '/admin/cv-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/dashboard/cv-boost' ||
                      pathName === '/admin/cv-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Order CV
                </Typography>
              </UnstyledLink>
              <UnstyledLink
                href={isAdmin ? `/admin/essay-boost` : `/dashboard/essay-boost`}
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  (pathName === '/dashboard/essay-boost' ||
                    pathName === '/admin/essay-boost') &&
                    'bg-primary-blue'
                )}
              >
                <HiDocumentText
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/dashboard/essay-boost' ||
                      pathName === '/admin/essay-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/dashboard/essay-boost' ||
                      pathName === '/admin/essay-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Order Essay
                </Typography>
              </UnstyledLink>
              <UnstyledLink
                href={
                  isAdmin
                    ? `/admin/interview-boost`
                    : `/dashboard/interview-boost`
                }
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  (pathName === '/dashboard/interview-boost' ||
                    pathName === '/admin/interview-boost') &&
                    'bg-primary-blue'
                )}
              >
                <FaUserGroup
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/dashboard/interview-boost' ||
                      pathName === '/admin/interview-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/dashboard/interview-boost' ||
                      pathName === '/admin/interview-boost'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Order Interview
                </Typography>
              </UnstyledLink>
            </div>
          )}
        </div>
        <div className='h-[1px] my-3 w-full bg-[#111111]/15' />
        <div>
          <div
            className='flex items-center gap-4 hover:cursor-pointer'
            onClick={() => setIsLmsOpen(!isLmsOpen)}
          >
            <FaChevronDown
              className={clsxm(
                'w-4 h-4 text-primary-blue transition-all',
                isLmsOpen && '-rotate-180'
              )}
            />
            <Typography
              variant='bt'
              weight='medium'
              className='text-primary-blue'
            >
              LMS
            </Typography>
          </div>
          {isLmsOpen && (
            <div className='flex flex-col gap-2 mt-2 ml-4'>
              <UnstyledLink
                href={isAdmin ? `/admin/lms` : `/dashboard/lms`}
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  (pathName === '/dashboard/lms' ||
                    pathName === '/admin/lms') &&
                    'bg-primary-blue'
                )}
              >
                <HiBookOpen
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/dashboard/lms' || pathName === '/admin/lms'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/dashboard/lms' || pathName === '/admin/lms'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Order LMS
                </Typography>
              </UnstyledLink>
            </div>
          )}
        </div>
         <div className='h-[1px] my-3 w-full bg-[#111111]/15' />
        <div>
          <div
            className='flex items-center gap-4 hover:cursor-pointer'
            onClick={() => setIsBeasiswaOpen(!isBeasiswaOpen)}
          >
            <FaChevronDown
              className={clsxm(
                'w-4 h-4 text-primary-blue transition-all',
                isBeasiswaOpen && '-rotate-180'
              )}
            />
            <Typography
              variant='bt'
              weight='medium'
              className='text-primary-blue'
            >
              Beasiswa
            </Typography>
          </div>
          {isBeasiswaOpen && (
            <div className='flex flex-col gap-2 mt-2 ml-4'>
              <UnstyledLink
                href={isAdmin ? `/rekomendasi-beasiswa` : `/rekomendasi-beasiswa`}
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  (pathName === '/rekomendasi-beasiswa' ||
                    pathName === '/rekomendasi-beasiswa') &&
                    'bg-primary-blue'
                )}
              >
                <HiBookOpen
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/rekomendasi-beasiswa' || pathName === '/rekomendasi-beasiswa'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/rekomendasi-beasiswa' || pathName === '/rekomendasi-beasiswa'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Rekomendasi Beasiswa
                </Typography>
              </UnstyledLink>
               {isAdmin && (
              <UnstyledLink
                href='/admin/input-beasiswa'
                className={clsxm(
                  'py-2 px-3 flex items-center gap-2 rounded-md',
                  pathName === '/admin/input-beasiswa' && 'bg-primary-blue'
                )}
              >
                <HiDocumentText
                  className={clsxm(
                    'w-6 h-6',
                    pathName === '/admin/input-beasiswa'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                />
                <Typography
                  variant='bt'
                  weight='medium'
                  className={clsxm(
                    pathName === '/admin/input-beasiswa'
                      ? 'text-white'
                      : 'text-primary-blue'
                  )}
                >
                  Input Beasiswa
                </Typography>
              </UnstyledLink>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
