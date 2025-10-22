import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { useBeasiswaStore } from '@/store/useBeasiswaStore';

export default function Page() {
  const router = useRouter();
  const { selected, setSelected } = useBeasiswaStore();

  const [benefit, setBenefit] = useState<string[]>([]);

  // Pisah benefit jadi array
  useEffect(() => {
    if (selected) {
      const benefitsArray = selected.benefit
        ? selected.benefit
            .split('|')
            .map((b) => b.trim())
            .filter(Boolean)
        : [];
      setBenefit(benefitsArray);
    }
  }, [selected]);

  // Ambil data dari sessionStorage kalau store kosong
  useEffect(() => {
    if (!selected) {
      const savedData = sessionStorage.getItem('selectedBeasiswa');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSelected(parsedData);
      } else {
        router.push('/rekomendasi-beasiswa');
      }
    }
  }, [router, selected, setSelected]);

  if (!selected) return <p>Loading atau redirect fallback...</p>;

  /** ========== Styling Helpers ========== */
  const jenjangColors: Record<string, string> = {
    SMP: 'bg-blue-100 text-blue-800',
    'SMA/SMK SEDERAJAT': 'bg-green-100 text-green-800',
    S1: 'bg-yellow-100 text-yellow-800',
    S2: 'bg-purple-100 text-purple-800',
    S3: 'bg-red-100 text-red-800',
  };

const jenjangKey = Array.isArray(selected.jenjang)
  ? selected.jenjang[0]?.toUpperCase() ?? ''
  : String(selected.jenjang ?? '').toUpperCase();

  const jenjangClass =
    jenjangColors[jenjangKey] || 'bg-gray-100 text-gray-800';

  const isBeasiswaOpen =
    new Date(selected.close_registration) > new Date();

  const pendanaanColor: Record<string, string> = {
    'FULLY FUNDED': 'bg-blue-100 text-blue-800',
    'PARTIALLY FUNDED': 'bg-purple-100 text-purple-800',
    RISET: 'bg-yellow-100 text-yellow-800',
    MENTORING: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-purple-100 text-purple-800',
  };

  const pendanaanKey = selected.jenis?.toUpperCase() ?? '';
  const pendanaanClass =
    pendanaanColor[pendanaanKey] || 'bg-gray-100 text-gray-800';

  /** ========== Safe Arrays ========== */
  const kampusList =
    Array.isArray(selected.kampus_bisa_daftar) && selected.kampus_bisa_daftar.length > 0
      ? selected.kampus_bisa_daftar
      : [];
  const persyaratanList = Array.isArray(selected.persyaratan)
    ? selected.persyaratan
    : [];
  const lainnyaList = Array.isArray(selected.lainnya)
    ? selected.lainnya
    : [];

  /** ========== Render ========== */
  return (
    <>
      <SEO title={`Detail Beasiswa | ${selected.nama ?? '-'}`} />
      <Layout withFooter={true} withNavbar={true}>
        <div className='px-4 py-10 mt-20 md:px-10 lg:px-20'>
          {/* Judul dan Info Utama */}
          <Typography className='font-bold' variant='h5'>
            {selected.nama ?? '-'}
          </Typography>

          <div className='flex items-center gap-3 justify-normal'>
            <Typography
              className='text-gray-600 font-semibold text-[14px] lg:text-[18px]'
              variant='btn'
            >
              Oleh: {selected.penyelenggara ?? '-'}
            </Typography>
            <Typography>|</Typography>
            <Typography
              className={`text-[12px] lg:text-[14px] px-2 py-1 rounded-full ${jenjangClass}`}
              variant='p'
            >
              {selected.jenjang ?? '-'}
            </Typography>
          </div>

          {/* Deskripsi */}
          <Typography className='mt-4 text-gray-600' variant='p'>
            {selected.deskripsi ?? '-'}
          </Typography>

          <hr className='border-[1.2px] rounded-full my-2 lg:my-4 border-gray-300' />

          {/* Status Pendaftaran */}
          <div
            className={`mt-3 py-3 px-4 rounded-lg ${
              isBeasiswaOpen ? 'bg-green-100' : 'bg-rose-100'
            }`}
          >
            <Typography
              variant='btn'
              className='mb-3 text-[12px] lg:text-[14px] font-semibold text-gray-600'
            >
              {isBeasiswaOpen
                ? 'ⓘ Daftar Sekarang, Beasiswa Masih Dibuka'
                : 'ⓘ Beasiswa Sudah Ditutup'}
            </Typography>

            <div className='grid items-center justify-start grid-cols-1 md:grid-cols-2 gap-x-6 '>
              <div className='md:border-r-[1.5px] border-none md:border-gray-600'>
                <Typography className='font-semibold' variant='p'>
                  Mulai Pendaftaran
                </Typography>
                <Typography className='text-gray-600' variant='p'>
                  {selected.open_registration
                    ? new Date(selected.open_registration).toLocaleDateString()
                    : '-'}
                </Typography>
              </div>
              <div>
                <Typography className='font-semibold' variant='p'>
                  Penutupan Pendaftaran
                </Typography>
                <Typography className='text-gray-600' variant='p'>
                  {selected.close_registration
                    ? new Date(selected.close_registration).toLocaleDateString()
                    : '-'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Info Tambahan */}
          <div className='grid grid-cols-1 mt-6 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3'>
            <div>
              <Typography className='font-semibold' variant='p'>
                Kampus yang Bisa Mendaftar
              </Typography>
              {kampusList.length === 0 ? (
                <Typography className='text-gray-600' variant='p'>
                  -
                </Typography>
              ) : (
                <Typography className='text-gray-600' variant='p'>
                  {kampusList.join(', ')}
                </Typography>
              )}
            </div>

            <div>
              <Typography className='font-semibold' variant='p'>
                Guidebook
              </Typography>
              {selected.link_guidebook ? (
                <Link href={selected.link_guidebook}>
                  <Typography className='text-blue-600 underline ' variant='p'>
                    Akses Guidebook
                  </Typography>
                </Link>
              ) : (
                <Typography className='text-gray-600' variant='p'>
                  Guidebook Tidak Tersedia
                </Typography>
              )}
            </div>

            <div>
              <Typography className='font-semibold' variant='p'>
                Daftar Sekarang
              </Typography>
              {selected.link_pendaftaran ? (
                <Link href={selected.link_pendaftaran}>
                  <Typography className='text-blue-600 underline ' variant='p'>
                    Akses Link Pendaftaran
                  </Typography>
                </Link>
              ) : (
                <Typography className='text-gray-600' variant='p'>
                  Link Pendaftaran Tidak Tersedia
                </Typography>
              )}
            </div>
          </div>

          <hr className='border-[1.2px] rounded-full my-6 border-gray-300' />

          {/* Pendanaan & Benefit */}
          <div className='px-4 py-3 bg-green-100 rounded-lg'>
            <div>
              <Typography className='font-semibold' variant='p'>
                Tipe Pendanaan
              </Typography>

              <Typography
                className={`${pendanaanClass} mt-2 w-fit px-3 py-1 rounded-sm`}
                variant='p'
              >
                {selected.jenis ?? '-'}
              </Typography>
            </div>

            <div className='mt-4'>
              <Typography className='font-semibold' variant='p'>
                Benefit
              </Typography>

              {benefit.length > 0 ? (
                <ul className='pl-5 mt-2 list-disc'>
                  {benefit.map((item, index) => (
                    <li key={index} className='text-gray-600'>
                      <Typography>{item}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography className='mt-2 text-gray-600' variant='p'>
                  Tidak ada benefit yang tersedia.
                </Typography>
              )}
            </div>
          </div>

          <hr className='border-[1.5px] rounded-full my-6 border-gray-300' />

          {/* Persyaratan & Lainnya */}
          <div className='px-4 py-3 bg-gray-100 rounded-lg'>
            <Typography className='font-semibold' variant='p'>
              Persyaratan
            </Typography>
            {persyaratanList.map((item, index) => (
              <Typography
                className='mt-2 text-gray-600'
                variant='p'
                key={index}
              >
                {item?.trim() || '-'}
              </Typography>
            ))}

            <Typography className='mt-3 font-semibold' variant='p'>
              Lainnya
            </Typography>
            {lainnyaList.map((item, index) => {
              const raw = item?.trim() ?? '';
              const withoutLast = raw.slice(0, -1);
              const formatted =
                withoutLast.length > 0
                  ? withoutLast.charAt(0).toUpperCase() + withoutLast.slice(1)
                  : '-';

              return (
                <Typography
                  className='mt-2 text-gray-600'
                  variant='p'
                  key={index}
                >
                  {index + 1}. {formatted}
                </Typography>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
}
