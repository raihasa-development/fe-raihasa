import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function VerifyEmail() {
  return (
    <section className='min-h-screen bg-gray-50 flex items-center justify-center py-16 md:py-20 px-4'>
      <div className='max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center'>
        <div className='relative flex items-center justify-center mb-8'>
          <NextImage
            src='/images/auth/email-verification/mascot.png'
            alt='mascot'
            width={335}
            height={335}
            className='md:w-[200px] md:h-[200px] w-[160px] h-[160px]'
          />
        </div>

        <Typography
          as='h1'
          className='text-2xl md:text-3xl font-bold text-gray-900 mb-3'
        >
          Cek Email Kamu Sekarang!
        </Typography>

        <Typography
          as='h2'
          className='text-base text-gray-600 leading-relaxed mb-6'
        >
          Link verifikasi sudah dikirimkan ke emailmu.
          <br /> Yuk cek dan lakukan verifikasi akun!
        </Typography>

        <div className='max-w-md'>
          <Typography
            as='p'
            className='text-sm text-gray-500 leading-relaxed'
          >
            Jika Anda tidak melihat email tersebut, periksa tempat lain, seperti
            folder sampah, spam, sosial, atau lainnya.
          </Typography>
          <Typography
            as='p'
            className='text-sm text-gray-500 mt-4'
          >
            Belum menerima email?{' '}
            <span className='text-[#FB991A] font-semibold hover:cursor-pointer hover:underline transition-all duration-300'>
              Kirim ulang email verifikasi
            </span>
          </Typography>
        </div>
      </div>
    </section>
  );
}
