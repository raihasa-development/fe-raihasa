import UnstyledLink from '@/components/links/UnstyledLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function SuccessVerify() {
  return (
    <section className='min-h-screen bg-gray-50 flex justify-center items-center flex-col py-16 md:py-20 px-4'>
      <div className='max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center'>
        <NextImage
          src='/images/auth/email-verification/successmascot.png'
          alt='success mascot'
          width={665}
          height={369}
          className='md:w-[400px] md:h-[222px] w-[280px] h-[155px] mb-8'
        />
        <div className='flex flex-col items-center justify-center gap-4'>
          <span className='inline-block text-white px-6 py-2 bg-[#1B7691] rounded-xl font-bold text-xl tracking-wide'>
            VERIFIED
          </span>
          <Typography
            as='h2'
            variant='h6'
            weight='medium'
            className='text-gray-900 text-center max-w-md text-base leading-relaxed mt-2'
          >
            Yay, E-Mail kamu telah{' '}
            <span className='text-[#FB991A] font-bold'>terverifikasi!</span> Sekarang
            kamu sudah dapat{' '}
            <span className='text-[#1B7691] font-bold underline hover:no-underline hover:cursor-pointer'>
              <UnstyledLink href='/auth/login'>Log In</UnstyledLink>
            </span>
            . Selamat bereksplorasi dan{' '}
            <span className='text-[#FB991A] font-bold'>Meraih Asa!</span>
          </Typography>
        </div>
      </div>
    </section>
  );
}
