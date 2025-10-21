//@ts-nocheck

import { Disclosure, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { HiChevronUp } from 'react-icons/hi';
import { IoIosArrowForward } from 'react-icons/io';

import Loading from '@/components/Loading';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { ApiReturn } from '@/types/api';
import { BeasiswaDetail } from '@/types/entities/detailbeasiswa';

export default function InfoBeasiswa() {
  const router = useRouter();
  const slug = router.query.slug as string | undefined;

  const { data, isLoading, isError } = useQuery<ApiReturn<BeasiswaDetail> | null>({
    queryKey: ['/scholarship', slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/scholarship/${slug}`
      );
      if (!res.ok) throw new Error('Failed to fetch scholarship');
      return (await res.json()) as ApiReturn<BeasiswaDetail>;
    },
    enabled: !!slug, 
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <div>Error loading scholarship info.</div>;

  const scholarship = data?.data?.data?.scholarship;
  const requirement = {
    berkas: [],
    gpa: null,
    instansi: [],
    jurusan: [],
    semester: [],
    persyaratan: [],
    lainnya: [],
    ...data?.data?.data?.requirement,
  };


  const formattedStartDate = scholarship?.open_registration
    ? new Date(scholarship.open_registration).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const formattedEndDate = scholarship?.close_registration
    ? new Date(scholarship.close_registration).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title={`Info Beasiswa | ${scholarship?.nama ?? ''}`} />
      <main className='overflow-hidden px-6 lg:px-[63px]'>
        <section className='min-h-screen py-28'>
          {/* Breadcrumb */}
          <div className='hidden breadcrumb lg:block'>
            <div className='flex items-center gap-1'>
              <Typography variant='p' className='text-base text-[#1B7691] font-bold'>
                Info Beasiswa
              </Typography>
              <IoIosArrowForward className='text-[#AEAEB6] font-bold' />
              <Typography variant='p' className='text-base font-bold'>
                Detail
              </Typography>
            </div>
          </div>

          {/* Banner Desktop */}
         <div className='banner lg:h-[352px] lg:mt-11 relative hidden xl:block after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-[#ffa500] after:opacity-100'>
            <NextImage
              src={
                scholarship?.img_path
                  ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/file/${scholarship.img_path}`
                  : '/images/scholarship-info/image.png'
              }
              width={1100}
              height={352}
              alt={scholarship?.nama ?? 'logo'}
              className='relative object-cover'
            />
            <div className='absolute translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2'>
              <div className='flex flex-col items-center w-full max-w-[90%]'>
                <div className='py-4 px-8 md:px-16 bg-[#E62A3A] rounded rounded-b-none w-full text-center'>
                  <Typography
                    variant='h1'
                    weight='bold'
                    className='!text-white text-[32px] md:text-[56px] text-shadow-lg break-words text-center leading-tight'
                  >
                    {scholarship?.nama}
                  </Typography>
                </div>
                <div className='py-4 w-3/4 bg-[#FFFFFF4F] text-center'>
                  <Typography variant='p' weight='bold' className='text-[#000000]'>
                    {scholarship?.penyelenggara}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Mobile */}
          <div className='banner lg:mt-11 relative block xl:hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-[#ffa500] after:opacity-100'>
            <NextImage
              src={
                scholarship?.img_path
                  ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/file/${scholarship.img_path}`
                  : '/images/scholarship-info/image.png'
              }
              width={327}
              height={166}
              alt={scholarship?.nama ?? 'logo'}
              className='relative object-cover'
            />
            <div className='absolute translate-x-1/2 -translate-y-1/2 top-1/2 right-1/2'>
              <div className='flex flex-col items-center'>
                <div className='py-1 px-4 md:px-16 bg-[#E62A3A] rounded rounded-b-none'>
                  <Typography
                    variant='h6'
                    weight='bold'
                    className='!text-white text-2xl text-shadow-lg whitespace-nowrap'
                  >
                    {scholarship?.nama}
                  </Typography>
                </div>
                <div className='py-1 px-2 w-full bg-[#FFFFFF4F] text-center'>
                  <Typography variant='p' weight='regular' className='text-[#F5F5F5] text-xs'>
                    {scholarship?.penyelenggara}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='content flex flex-col gap-[42px] mt-[42px]'>

            {/* Open Registration & Deadline */}
            <div className='flex flex-col lg:flex-row text-[#4C4E60] bg-[#E4E4E7] rounded-2xl'>
              <div className='flex flex-col flex-grow gap-1 px-8 py-4 lg:py-8'>
                <Typography variant='h5' weight='semibold' className='text-lg lg:text-[32px]'>
                  Open Registration
                </Typography>
                <Typography variant='t' weight='semibold' className='text-base lg:text-xl text-[#343434]'>
                  {formattedStartDate}
                </Typography>
              </div>
              <div className='border lg:border-2 border-[#4C4E60] mx-6 lg:mx-12 lg:my-8'></div>
              <div className='flex flex-col self-start flex-grow gap-1 px-8 py-4 lg:py-8'>
                <Typography variant='h5' weight='semibold' className='text-lg lg:text-[32px]'>
                  Deadline
                </Typography>
                <Typography variant='t' weight='semibold' className='text-base lg:text-xl text-[#343434]'>
                  {formattedEndDate}
                </Typography>
              </div>
            </div>

            {/* Detail Sections */}
            <div className='detail border-4 border-[#FB991A] rounded p-6 lg:p-8 flex flex-col gap-6 lg:gap-8'>
              
              {/* About */}
              <Disclosure as='div'>
                {({ open }) => (
                  <>
                    <Disclosure.Button className='flex justify-between text-[28px] w-full items-center !font-semibold'>
                      <Typography variant='h6' className='text-xl font-semibold'>
                        About
                      </Typography>
                      <HiChevronUp
                        className={`${open ? 'rotate-180 transform transition ease-in-out duration-200' : ''} text-[#111827] text-[32px]`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter='transition duration-100 ease-out'
                      enterFrom='transform scale-95 opacity-0'
                      enterTo='transform scale-100 opacity-100'
                      leave='transition duration-75 ease-out'
                      leaveFrom='transform scale-100 opacity-100'
                      leaveTo='transform scale-95 opacity-0'
                    >
                      <Disclosure.Panel className='p-6 lg:p-8'>
                        <div className='grid gap-4 py-6 item lg:grid-cols-4 lg:py-8'>
                          <div className='col-span-1'>
                            <Typography variant='p' weight='semibold'>Deskripsi</Typography>
                          </div>
                          <div className='col-span-3'>
                            <Typography variant='p'>{scholarship?.deskripsi}</Typography>
                          </div>
                        </div>
                        <hr />
                        <div className='grid py-8 item lg:grid-cols-4'>
                          <div className='col-span-1'>
                            <Typography variant='p' weight='semibold'>Jenis Beasiswa</Typography>
                          </div>
                          <div className='col-span-3'>
                            <ul className='list-disc marker:text-[#FB991A] marker:text-2xl'>
                              <li>
                                <Typography>{scholarship?.jenis}</Typography>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <hr />
                        <div className='grid py-8 item lg:grid-cols-4'>
                          <div className='col-span-1'>
                            <Typography variant='p' weight='semibold'>Penyelenggara</Typography>
                          </div>
                          <div className='col-span-3'>
                            <ul className='list-disc marker:text-[#FB991A] marker:text-2xl'>
                              <li>
                                <Typography>{scholarship?.penyelenggara}</Typography>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              <hr />

              {/* Benefit */}
              <Disclosure as='div'>
                {({ open }) => (
                  <>
                    <Disclosure.Button className='flex justify-between text-[28px] w-full items-center !font-semibold'>
                      <Typography variant='h6' className='text-xl font-semibold'>
                        Benefit
                      </Typography>
                      <HiChevronUp
                        className={`${open ? 'rotate-180 transform transition ease-in-out duration-200' : ''} text-[#111827] text-[32px]`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter='transition duration-100 ease-out'
                      enterFrom='transform scale-95 opacity-0'
                      enterTo='transform scale-100 opacity-100'
                      leave='transition duration-75 ease-out'
                      leaveFrom='transform scale-100 opacity-100'
                      leaveTo='transform scale-95 opacity-0'
                    >
                      <Disclosure.Panel className='p-6 lg:p-8'>
                        <div
                          className='text-lg font-semibold detailbeasiswa-benefit'
                          dangerouslySetInnerHTML={{ __html: scholarship?.benefit ?? '' }}
                        />
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              <hr />

              {/* Requirements */}
            <Disclosure as='div'>
            {({ open }) => (
            <>
              <Disclosure.Button className='flex justify-between text-[28px] w-full items-center !font-semibold'>
                <Typography variant='h6' className='text-xl font-semibold'>
                  Requirements
                </Typography>
                <HiChevronUp
                  className={`${open ? 'rotate-180 transform transition ease-in-out duration-200' : ''} text-[#111827] text-[32px]`}
                />
              </Disclosure.Button>
              <Transition
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <Disclosure.Panel className='px-6 lg:p-8'>
                  {requirement.berkas?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Berkas</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.berkas.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {requirement.gpa && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>GPA</Typography>
                      </div>
                      <div className='col-span-3'>
                        <Typography variant='p'>{requirement.gpa}</Typography>
                      </div>
                    </div>
                  )}

                  {requirement.instansi?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Instansi</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.instansi.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {requirement.jurusan?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Jurusan</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.jurusan.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {requirement.semester?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Semester</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.semester.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {requirement.persyaratan?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Persyaratan</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.persyaratan.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {requirement.lainnya?.length > 0 && (
                    <div className='grid py-8 item lg:grid-cols-4'>
                      <div className='col-span-1'>
                        <Typography variant='p' weight='semibold'>Lainnya</Typography>
                      </div>
                      <div className='col-span-3'>
                        <ul className='list-disc marker:text-[#FB991A] marker:text-2xl px-6 lg:px-0'>
                          {requirement.lainnya.map((item, index) => (
                            <li key={index}><Typography>{item}</Typography></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>

              <hr />

              {/* Timeline */}
              <Disclosure as='div'>
                {({ open }) => (
                  <>
                    <Disclosure.Button className='flex justify-between text-[28px] w-full items-center !font-semibold'>
                      <Typography variant='h6' className='text-xl font-semibold'>Timeline</Typography>
                      <HiChevronUp
                        className={`${open ? 'rotate-180 transform transition ease-in-out duration-200' : ''} text-[#111827] text-[32px]`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter='transition duration-100 ease-out'
                      enterFrom='transform scale-95 opacity-0'
                      enterTo='transform scale-100 opacity-100'
                      leave='transition duration-75 ease-out'
                      leaveFrom='transform scale-100 opacity-100'
                      leaveTo='transform scale-95 opacity-0'
                    >
                      <Disclosure.Panel className='p-6 lg:p-8'>
                        <div
                          className='text-lg font-semibold detailbeasiswa-timeline'
                          dangerouslySetInnerHTML={{ __html: scholarship?.close_registration ?? '' }}
                        />
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
