export const runtime = 'experimental-edge';

import { Accordion, AccordionItem, Checkbox, Divider } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaVideo } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { LuExternalLink } from 'react-icons/lu';

import withAuth from '@/components/hoc/withAuth';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import clsxm from '@/lib/clsxm';
import NavDetailJourney from '@/pages/lms/[slug]/components/NavDetail';
import { ApiReturn } from '@/types/api';

type DetailModul = {
  id: string;
  name: string;
  deskripsi: string;
  product_id: string;
  Sections: {
    id: string;
    name: string;
    Materi: {
      id: string;
      name: string;
      deskripsi: string;
      link_ref: string;
      link_video: string;
    }[];
  }[];
  ThumbnailModule: string;
};

export default withAuth(JourneyPage, 'user');
function JourneyPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [ModulJourneyData, setModulJourneyData] = useState<DetailModul | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleMateriChange = (url_video: string, index: number) => {
    setSelectedIndex(index);
    if (url_video) {
      setSelectedVideo(url_video);
    }
  };

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get<ApiReturn<DetailModul>>(
          `/lms/modul/${slug}`
        );
        setModulJourneyData(response.data.data);
        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        // console.log(err);
        setIsLoading(false);
      }
    };
    if (slug) {
      loadData();
    }
  }, [slug]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title='Journey' />
      <main className='lg:px-10 lg:py-8 grid grid-cols-12 relative lg:mt-20 gap-2'>
        <div className='col-span-8'>
          <div className='flex flex-col'>
            <iframe
              width='875'
              height='546'
              src={selectedVideo || 'https://www.youtube.com/embed'}
              title='RA Video'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen
            ></iframe>
            <NavDetailJourney
              name={ModulJourneyData?.name}
              deskripsi={ModulJourneyData?.deskripsi}
            />
          </div>
        </div>
        <div className='col-span-4  right-0 top-0 z-20 px-2'>
          <div className='flex flex-col'>
            <div className='flex w-full justify-between items-center'>
              <Typography variant='t' className='text-[#1B7691] font-bold'>
                Perjalanan Pembelajaranmu~
              </Typography>
              <Link href={'..'}>
                <HiX className='text-xl text-[#1B7691]' />
              </Link>
            </div>
            <Divider className='mt-4' />
            {ModulJourneyData?.Sections && (
              <Accordion>
                {ModulJourneyData?.Sections.map((e, index) => (
                  <AccordionItem
                    key={index}
                    classNames={{
                      title: 'text-xl font-bold',
                    }}
                    aria-label={e.name}
                    title={e.name}
                    subtitle={`0/${e.Materi.length} Modul yang telah ditempuh`}
                  >
                    <div className='flex flex-col gap-2'>
                      {e.Materi.map((materi, index) => (
                        <Link
                          key={index}
                          href={materi.link_video || materi.link_ref}
                          passHref
                        >
                          <div
                            className={clsxm(
                              'flex gap-2 p-2',
                              selectedIndex === index && 'bg-[#3872C333]'
                            )}
                          >
                            <Checkbox
                              classNames={{
                                icon: 'text-[#1B7691]',
                              }}
                              onChange={() =>
                                handleMateriChange(materi.link_video, index)
                              }
                            >
                              <div className='flex flex-col ml-2'>
                                <Typography variant='btn'>
                                  {materi.name}
                                </Typography>
                                <div className='flex items-center gap-2'>
                                  {materi.link_ref ? (
                                    // tdk ada link_video
                                    <>
                                      <LuExternalLink className='text-muted text-[#7C7D8A]' />
                                      Link
                                    </>
                                  ) : (
                                    // ada link_video
                                    <>
                                      <FaVideo className='text-muted text-[#7C7D8A]' />
                                      Video
                                    </>
                                  )}
                                </div>
                              </div>
                            </Checkbox>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
