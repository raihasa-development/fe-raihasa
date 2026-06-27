import { useState } from 'react';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

interface VerifyEmailProps {
  email?: string;
  onResend?: (email: string) => void;
  isResending?: boolean;
}

export default function VerifyEmail({ email, onResend, isResending }: VerifyEmailProps) {
  const [inputEmail, setInputEmail] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onResend && inputEmail.trim()) {
      onResend(inputEmail.trim());
    }
  };

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

        <div className='max-w-md w-full'>
          <Typography
            as='p'
            className='text-sm text-gray-500 leading-relaxed'
          >
            Jika Anda tidak melihat email tersebut, periksa tempat lain, seperti
            folder sampah, spam, sosial, atau lainnya.
          </Typography>

          {email ? (
            <Typography
              as='p'
              className='text-sm text-gray-500 mt-5'
            >
              Belum menerima email ke <span className="font-semibold text-gray-800">{email}</span>?{' '}
              <button
                onClick={() => onResend && onResend(email)}
                disabled={isResending}
                className='text-[#FB991A] font-semibold hover:underline disabled:opacity-50 transition-all duration-300'
              >
                {isResending ? 'Mengirim...' : 'Kirim ulang email verifikasi 💌'}
              </button>
            </Typography>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
              <Typography as="p" className="text-sm text-gray-600 mb-3 font-medium">
                Belum menerima email atau tautan kadaluarsa? Masukkan email kamu di bawah:
              </Typography>
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FB991A]/30 focus:border-[#FB991A] text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="px-4 py-2 bg-[#FB991A] hover:bg-[#e08916] text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all"
                >
                  {isResending ? 'Mengirim...' : 'Kirim'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
