import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'aos/dist/aos.css';

import { Disclosure, Transition } from '@headlessui/react';
import { useQuery,keepPreviousData, } from '@tanstack/react-query';
import Aos from 'aos';
import React, { useEffect, useMemo, useState } from 'react';
import { CiFilter } from 'react-icons/ci';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { HiChevronUp } from 'react-icons/hi';
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdCloseCircleOutline,
} from 'react-icons/io';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { Swiper } from 'swiper/react';

import Button from '@/components/buttons/Button';
import Loading from '@/components/Loading';
import NextImage from '@/components/NextImage';
import SEO from '@/components/SEO';
import { VelocityScroll } from '@/components/TextCustom/ScrollBasedVelocity';
import Typography from '@/components/Typography';
import { SIDEBAR } from '@/contents/sidebar-detail-beasiswa';
import Layout from '@/layouts/Layout';
import clsxm from '@/lib/clsxm';
import BeasiswaCard from '@/pages/scholarship-info/component/BeasiswaCard';
import { ApiReturn } from '@/types/api';
import { AllBeasiswa, BeasiswaDetail } from '@/types/entities/detailbeasiswa';
import api from '@/lib/api';
import { useRouter } from 'next/router';
import withAuth from '@/components/hoc/withAuth';

function InfoBeasiswa() {
  useEffect(() => {
    Aos.init({ once: true });
  }, []);

  const router = useRouter();
  const { id } = router.query;

  const [filters, setFilters] = useState({
    search: '',
    jenis: '',
    skala: '',
  });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;

  const { data, isLoading } = useQuery<ApiReturn<AllBeasiswa[]>>({
    queryKey: ['/scholarship', currentPage, filters, sort],
    queryFn: async () => {
      const res = await api.get<ApiReturn<AllBeasiswa[]>>('/scholarship', {
        params: {
          page: currentPage,
          limit: cardsPerPage,
          search: filters.search,
          jenis: filters.jenis,
          skala: filters.skala,
          sort,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((b) => {
      const name = b.nama ?? '';
      return (
        (filters.search === '' ||
          name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.jenis === '' || b.jenis === filters.jenis) &&
        (filters.skala === '' || b.skala === filters.skala)
      );
    });
  }, [data, filters]);

  const toTime = (s?: string | Date | null) => {
    if (!s) return Number.POSITIVE_INFINITY;
    const dateStr = s instanceof Date ? s.toISOString() : s;
    const t = Date.parse(dateStr);
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };

  const paginatedData = useMemo(() => {
    let filtered = [...filteredData];

    if (sort === 'deadlineDekat') {
      filtered.sort((a, b) => toTime(a.tanggal_selesai) - toTime(b.tanggal_selesai));
    } else if (sort === 'deadlineLama') {
      filtered.sort((a, b) => toTime(b.tanggal_selesai) - toTime(a.tanggal_selesai));
    } else if (sort === 'urutNama') {
      filtered.sort((a, b) => a.nama.localeCompare(b.nama));
    }

    return filtered.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);
  }, [filteredData, sort, currentPage, cardsPerPage]);

  const totalFiltered = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / cardsPerPage));

  // pagination helper
  const DOTS = 'DOTS';
  function getPaginationRange(total: number, current: number, siblingCount = 1, boundaryCount = 1) {
    const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
    if (total <= totalPageNumbers) return Array.from({ length: total }, (_, i) => i + 1);

    const leftSibling = Math.max(current - siblingCount, boundaryCount + 2);
    const rightSibling = Math.min(current + siblingCount, total - boundaryCount - 1);

    const showLeftDots = leftSibling > boundaryCount + 2;
    const showRightDots = rightSibling < total - boundaryCount - 1;

    const pages: (number | string)[] = [];
    for (let i = 1; i <= boundaryCount; i++) pages.push(i);
    if (showLeftDots) pages.push(DOTS);
    else for (let i = boundaryCount + 1; i < leftSibling; i++) pages.push(i);
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    if (showRightDots) pages.push(DOTS);
    else for (let i = rightSibling + 1; i <= total - boundaryCount; i++) pages.push(i);
    for (let i = total - boundaryCount + 1; i <= total; i++) pages.push(i);
    return pages;
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setCurrentPage(1);
  };

  if (isLoading) return <Loading />;


  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title='Info Beasiswa' />
      <main className='overflow-hidden'>
        <section className='pt-20 mt-20 hero lg:pt-0'>
          <div className='grid grid-flow-row md:grid-cols-12 '>
            <div className='grid order-1 md:col-span-4 md:order-none place-items-center lg:block'>
              <NextImage
                src={'/images/infobeasiswa/hero.png'}
                width={511}
                height={352}
                quality={100}
                alt='Heira Raih Asa'
                className='hidden w-full md:block'
                data-aos='fade-right'
                data-aos-delay='400'
              />
              <NextImage
                src={'/images/infobeasiswa/hero-sm.png'}
                width={337}
                height={181}
                quality={100}
                alt='Heira Raih Asa'
                className='md:hidden'
                data-aos='fade-right'
                data-aos-delay='400'
              />
            </div>
            <div className='grid grid-flow-row mb-10 md:col-span-8 place-items-center lg:mb-0'>
              <div className='flex flex-col items-center w-full gap-2 px-4 md:w-auto'>
                <h3
                  data-aos='zoom-in'
                  className='font-bold text-[28px] lg:text-6xl bg-[#E94759] py-4 w-full lg:w-auto text-center lg:px-8 text-shadow-bg text-[#F5F5F5]'
                >
                  Raih Beasiswa
                </h3>
                <h5
                  data-aos='zoom-in'
                  className='text-lg lg:text-[32px] font-semibold'
                >
                  Raih mimpimu, eksplorasi dirimu!
                </h5>
              </div>
            </div>
          </div>
        </section>
        <section className='relative py-20 lg:h-screen'>
          <div className='flex absolute top-0 rotate-1 md:-rotate-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] w-full py-7 justify-center gap-8 shadow-[0_62px_26px_0_rgba(0,0,0,0.20)]'>
            <VelocityScroll
              text=' Rekomendasi Beasiswa Untukmu! '
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl lg:text-5xl whitespace-nowrap opacity-60'
            />
          </div>
          <div className='flex absolute top-0 -rotate-1 md:rotate-1 bg-gradient-to-r from-[#FB991A] to-[#C0172A] w-full py-7 justify-center gap-8 shadow-[0_62px_26px_0_rgba(0,0,0,0.20)]'>
            <VelocityScroll
              text=' Rekomendasi Beasiswa Untukmu! '
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl lg:text-5xl whitespace-nowrap opacity-60'
            />
            <VelocityScroll
              text=' Rekomendasi Beasiswa Untukmu! '
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl lg:text-5xl whitespace-nowrap opacity-80'
            />
            <VelocityScroll
              text=' Rekomendasi Beasiswa Untukmu! '
              default_velocity={2}
              className='text-xl font-bold text-white sm:text-2xl lg:text-5xl whitespace-nowrap opacity-60'
            />
          </div>

          <div className='relative mt-12 translate-x-1/2 lg:mt-0 top-1/2 lg:-translate-y-1/3 right-1/2'>
            <Swiper
              style={{}}
              spaceBetween={48}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                1440: {
                  slidesPerView: 2,
                },
              }}
              navigation={{ prevEl: '.prev', nextEl: '.next' }}
              loop={true}
              modules={[Autoplay, Navigation, Pagination]}
              pagination={{
                clickable: true,
              }}
              className='mySwiper detailbeasiswaSwiper flex justify-center max-w-4xl !px-3 !py-8'
            >
             {data?.data.slice(0, 6).map((detailbeasiswa, id) => (
              <SwiperSlide key={id} className='mb-12'>
                <BeasiswaCard
                  data-aos='fade-right'
                  data-aos-delay={400 * (id + 1)}
                  detailbeasiswa={detailbeasiswa}
                />
              </SwiperSlide>
            ))}
              <div className='absolute bottom-0 left-0 w-full'>
                <div className='swiper-pagination'></div>
              </div>
            </Swiper>
            <div className='absolute z-30 flex justify-between w-full max-w-6xl px-12 translate-x-1/2 lg:px-0 bottom-1 lg:bottom-auto lg:top-1/2 right-1/2'>
              <div className='prev text-lg lg:text-3xl bg-[#E94759] text-white p-4 rounded-[50px] cursor-pointer'>
                <FaArrowLeft />
              </div>
              <div className='next text-lg lg:text-3xl bg-[#E94759] text-white p-4 rounded-[50px] cursor-pointer'>
                <FaArrowRight />
              </div>
            </div>
          </div>
        </section>

        <section className='px-4 lg:py-24 lg:px-24'>
          <div
            className='w-full text-center bg-[#E47F1A] py-3 lg:py-5 shadow-header'
            data-aos='fade-up'
          >
            <h2 className='text-xl font-bold text-white lg:text-5xl text-shadow-xl'>
              Semua Beasiswa
            </h2>
          </div>

          <div className='grid grid-cols-12 mt-12 lg:mt-[104px]'>
            <div className='hidden col-span-3 gird place-items-center lg:block'>
              <h6 className='text-[28px] font-semibold' data-aos='fade-up'>
                Filter Beasiswa
              </h6>

              <div className='sidebar ' data-aos='fade-up'>
                {SIDEBAR.map((e, index) => {
                  return (
                    <Disclosure as='div' key={index}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button
                            className={`${
                              open ? 'font-medium' : 'font-normal'
                            } flex gap-[13px] items-center`}
                          >
                            <HiChevronUp
                              className={`${
                                open
                                  ? 'rotate-180 transform transition ease-in-out duration-200 '
                                  : ''
                              }  text-[#1C1C1C] h-5 w-5`}
                            />
                            <span className='text-lg '>{e.title}</span>
                          </Disclosure.Button>
                          <Transition
                            enter='transition duration-100 ease-out'
                            enterFrom='transform scale-95 opacity-0'
                            enterTo='transform scale-100 opacity-100'
                            leave='transition duration-75 ease-out'
                            leaveFrom='transform scale-100 opacity-100'
                            leaveTo='transform scale-95 opacity-0'
                          >
                            <Disclosure.Panel className='flex flex-col ml-4'>
                              {e.btaction?.map((item, index) => (
                                <div
                                  className='flex items-center gap-3 p-2'
                                  key={index}
                                >
                                  <input
                                    type='radio'
                                    name={e.slug}
                                    onChange={() =>
                                    handleFilterChange(e.slug as 'search' | 'jenis' | 'skala', item.name)

                                    }
                                  />
                                  <label htmlFor=''>{item.name}</label>
                                </div>
                              ))}
                            </Disclosure.Panel>
                          </Transition>
                        </>
                      )}
                    </Disclosure>
                  );
                })}
              </div>
            </div>

            <div className='col-span-12 lg:col-span-9 ' data-aos='fade-up'>
              <div className='flex flex-col items-start justify-between w-full header lg:flex-row'>
                <div className='flex items-center w-full'>
                  <input
                    type='text'
                    name=''
                    id=''
                    placeholder='Cari Beasiswa'
                    className='flex w-full lg:w-[349px] pr-5 rounded-md'
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                  />
                </div>
                <div className='flex items-start w-full gap-4 mt-3 lg:mt-0'>
                  <Disclosure as='div' className={'xl:w-full w-[294px]'}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`${
                            open ? 'font-medium' : 'font-normal'
                          } flex justify-between items-center w-full border border-[#D1D5DC] rounded-md px-3 py-2`}
                        >
                          <span className='text-lg'>Sortir</span>
                          <HiChevronUp
                            className={`${
                              open
                                ? 'rotate-180 transform transition ease-in-out duration-200 '
                                : ''
                            }  text-[#1C1C1C] h-5 w-5`}
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
                          <Disclosure.Panel className='relative z-30 flex flex-col w-full mt-4 bg-white xl:absolute'>
                            <div className='px-3 py-2 flex flex-col gap-2 border border-[#1B7691] rounded-md'>
                              <div className='flex items-center gap-2 '>
                                <input
                                  type='checkbox'
                                  name=''
                                  id=''
                                  value='deadlineDekat'
                                  onChange={() =>
                                    handleSortChange('deadlineDekat')
                                  }
                                />
                                <label htmlFor=''>Deadline Terdekat</label>
                              </div>
                              <div className='flex items-center gap-2 '>
                                <input
                                  type='checkbox'
                                  name=''
                                  id=''
                                  value='deadlineLama'
                                  onChange={() =>
                                    handleSortChange('deadlineLama')
                                  }
                                />
                                <label htmlFor=''>Deadline Paling Lama</label>
                              </div>
                              <div className='flex items-center gap-2 '>
                                <input
                                  type='checkbox'
                                  name=''
                                  id=''
                                  value='urutNama'
                                  onChange={() => handleSortChange('urutNama')}
                                />
                                <label htmlFor=''>
                                  Urutkan Berdasarkan Nama
                                </label>
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                 <div className='flex-grow lg:hidden'>
  <Button
    variant='warning'
    className='w-full px-6 py-3'
    leftIcon={CiFilter}
  >
    Filter
  </Button>
</div>
</div>
</div>

<div className='flex-col gap-4 mt-4 toggle-wrapper'>
  <p className='text-sm'>
    Menampilkan {paginatedData?.length || 0} dari {totalFiltered}
  </p>

  <div className='hidden gap-2 lg:flex'>
    <div className='flex gap-4 filtered-wrapper'>
      {filters.jenis && (
        <div className='border border-[#1B7691] text-[#1B7691] px-3 py-1 rounded-md flex gap-2 items-center'>
          <p>{filters.jenis}</p>
          <IoMdCloseCircleOutline
            className='cursor-pointer'
            onClick={() => handleFilterChange('jenis', '')}
          />
        </div>
      )}
      {filters.skala && (
        <div className='border border-[#1B7691] text-[#1B7691] px-3 py-1 rounded-md flex gap-2 items-center'>
          <p>{filters.skala}</p>
          <IoMdCloseCircleOutline
            className='cursor-pointer'
            onClick={() => handleFilterChange('skala', '')}
          />
        </div>
      )}
    </div>
    <Button
      type='reset'
      variant='unstyled'
      className='text-[#FB991A] hover:text-[#d48a29] px-3 py-1'
      onClick={() => {
        setFilters({
          search: '',
          jenis: '',
          skala: '',
        });
        setCurrentPage(1);
      }}
    >
      Hapus Semua
    </Button>
  </div>
</div>

{paginatedData.length > 0 ? (
  <div className='grid gap-8 mt-5 lg:grid-cols-2'>
    {paginatedData.map((detailbeasiswa, id) => (
      <BeasiswaCard key={id} detailbeasiswa={detailbeasiswa} />
    ))}
  </div>
) : (
  <Typography variant='p'>Tidak ada data tersedia.</Typography>
)}

{/* Pagination */}
<div className='flex items-center justify-center gap-4 py-8'>
  <button
    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    className='cursor-pointer'
  >
    <IoIosArrowBack className='w-6 h-6' />
  </button>

  {getPaginationRange(totalPages, currentPage).map((p, i) =>
    p === DOTS ? (
      <span key={`dots-${i}`} className='px-2'>…</span>
    ) : (
      <Button
        variant='unstyled'
        key={p}
        onClick={() => setCurrentPage(Number(p))}
        className={clsxm(
          'rounded flex items-center w-10 h-10 border border-[#37384C] hover:text-zinc-400',
          currentPage === p && 'shadow-pagination'
        )}
      >
        {p}
      </Button>
    )
  )}

  <button
    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages}
    className='cursor-pointer'
  >
    <IoIosArrowForward className='w-6 h-6' />
  </button>
</div>

</div>
</div>
  </section>
  
      </main>
    </Layout>
  );
}

export default withAuth(InfoBeasiswa, 'user');

