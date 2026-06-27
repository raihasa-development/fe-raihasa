'use client';
import { useMutation } from '@tanstack/react-query';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import Typography from '@/components/Typography';
import { REG_EMAIL, REG_PASSWORD } from '@/constants/regex';
import useMutationToast from '@/hooks/useMutationToast';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { removeToken, setToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';
import { GoogleLogin } from '@react-oauth/google';

type RegisterForm = {
  email: string;
  name: string;
  password: string;
  whatsapp: string;
};

export default function RegisterPage() {
  const methods = useForm<RegisterForm>({
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;
  const router = useRouter();
  const login = useAuthStore.useLogin();

  /* eslint-disable no-console */
  const mutation = useMutation<void, AxiosError<ApiError>, RegisterForm>({
    mutationFn: async (data: RegisterForm) => {
      await api.post('/auth/register', data);

      // Verification is required, so do not auto-login (it would fail).
      // Instead, show instruction to check email.
      showToast('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun sebelum login.', SUCCESS_TOAST);

      router.push('/login');
    },
    onError: (error) => {
      let errMsg = error.response?.data?.message || 'Gagal mendaftar. Coba cek koneksi internetmu, ya! 😊';
      if (errMsg.includes('belum diverifikasi') || errMsg.includes('not verified')) {
        errMsg = 'Email ini udah kedaftar tapi belum diverifikasi. Yuk cek inbox/spam email-mu buat klik tautan verifikasi! 💌';
      } else if (errMsg.includes('terdaftar') || errMsg.includes('registered')) {
        errMsg = 'Email ini udah punya akun, bestie. Yuk cuss langsung login aja! 😊';
      }
      methods.setError('root', {
        message: errMsg,
      });
    },
  });

  const resendMutation = useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (email: string) => {
      await api.post('/auth/resend-verification', { email });
      showToast('Email verifikasi telah dikirim ulang', SUCCESS_TOAST);
    },
  });

  const { mutate: registerMutation, isPending } = mutation;
  const { mutate: resendVerificationMutation } = resendMutation;

  const handleResendVerification = (email: string) => {
    if (email) {
      resendVerificationMutation(email);
    } else {
      showToast('Masukkan email terlebih dahulu', DANGER_TOAST);
    }
  };

  const googleMutation = useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (googleToken: string) => {
      removeToken();

      const { data: res } = await api.post('/auth/google-login', {
        token: googleToken,
      });

      if (!res?.data) throw new Error('Sesi login tidak valid');

      const { token, ...user } = res.data;

      setToken(token);
      login({ ...user, token });
      showToast('Berhasil terdaftar dan masuk dengan Google', SUCCESS_TOAST);

      router.push('/');
    },
  });

  const { mutate: googleLoginMutation } = useMutationToast<void, string>(googleMutation);

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLoginMutation(credentialResponse.credential);
    }
  };

  const onSubmit = (data: RegisterForm) => {
    registerMutation(data);
  };


  return (
    <Layout withFooter={false} withNavbar={false}>
      <SEO title='Register - Raih Asa' description='Daftar akun baru di Raih Asa.' />

      <div className="min-h-screen flex items-stretch font-primary">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FB991A] to-[#DB4B24] overflow-hidden flex-col justify-between p-16 text-white">
          {/* Background Elements - Variant for Orange/Teal mix */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FFFFFF] rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-[120px] opacity-20"></div>

          <div className="relative z-10">
            <NextImage
              src='/images/logo_white.svg'
              alt='Raih Asa Logo'
              width={160}
              height={110}
              className='opacity-90 object-contain'
            />
          </div>

          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Start Your Journey with <span className="text-white drop-shadow-md">Raih Asa</span>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Bergabunglah dengan komunitas pencari beasiswa terbesar di Indonesia. Dapatkan akses ke mentoring, materi eksklusif, dan info terupdate.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {['Mentor Expert', 'Info Terupdate', 'Komunitas Supportif', 'Materi Lengkap'].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-sm text-white/60">
            &copy; {new Date().getFullYear()} Raih Asa. All Rights Reserved.
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
          <div className="lg:hidden absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FB991A] to-[#1B7691]"></div>

          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <NextImage src='/images/logo_white.svg' alt='logo' width={140} height={100} className="brightness-0" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Buat Akun Baru</h2>
              <p className="mt-3 text-base text-gray-600">Mulai langkah pertamamu meraih beasiswa impian.</p>
            </div>

            <div className="bg-white">
              <FormProvider {...methods}>
                <form
                  method="post"
                  className='space-y-5'
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    id='name'
                    label='Username'
                    placeholder='Cth: Jerome Makarim'
                    validation={{ required: 'Username harus diisi' }}
                  />
                  <Input
                    id='email'
                    label='Email'
                    placeholder='nama@email.com'
                    validation={{
                      required: 'Email harus diisi',
                      pattern: {
                        value: REG_EMAIL,
                        message: 'Email tidak sesuai format',
                      },
                    }}
                  />
                  <Input
                    id='password'
                    label='Password'
                    type='password'
                    placeholder='Minimal 8 karakter'
                    validation={{
                      required: 'Kata sandi harus diisi',
                      pattern: {
                        value: REG_PASSWORD,
                        message:
                          'Min. 8 karakter, kombinasi huruf besar, kecil, & angka',
                      },
                    }}
                  />
                  <Input
                    id='whatsapp'
                    label='Nomor WhatsApp'
                    placeholder='Cth: 081234567890'
                    validation={{
                      required: 'Nomor WhatsApp harus diisi',
                      pattern: {
                        value: /^(0|62|\+62)8[1-9][0-9]{6,12}$/,
                        message:
                          'Nomor WhatsApp tidak valid (Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx)',
                      },
                    }}
                  />

                  <div className="pt-2">
                    <Button
                      isLoading={isPending}
                      type='submit'
                      variant='primary'
                      className='w-full !py-3 !text-base !rounded-xl !bg-[#FB991A] hover:!bg-[#e08916] !font-semibold shadow-lg shadow-orange-500/10'
                    >
                      Daftar Sekarang
                    </Button>
                  </div>

                  {methods.formState.errors.root?.message && (
                    <div className='mt-3 text-center p-3 bg-red-50 rounded-xl border border-red-100'>
                      <Typography variant='c2' className='text-red-600 block mb-1.5 font-normal'>
                        {methods.formState.errors.root.message}
                      </Typography>
                      {methods.formState.errors.root.message.includes('belum diverifikasi') && (
                        <button
                          type='button'
                          onClick={() => handleResendVerification(methods.getValues('email'))}
                          className='text-[#1B7691] hover:underline disabled:opacity-50 text-xs mt-1 block mx-auto font-semibold'
                        >
                          Kirim Ulang Email Verifikasi 💌
                        </button>
                      )}
                    </div>
                  )}

                  <p className='text-center text-sm text-gray-500 mt-6'>
                    Dengan mendaftar, Anda menyetujui <a href="#" className="underline hover:text-gray-800">Syarat & Ketentuan</a> kami.
                  </p>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-400">Atau daftar dengan</span>
                    </div>
                  </div>

                  <div className="flex justify-center w-full my-4">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        showToast('Registrasi Google gagal. Coba lagi.', DANGER_TOAST);
                      }}
                      useOneTap
                    />
                  </div>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-400">Sudah punya akun?</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <ButtonLink
                      href='/login'
                      className='font-semibold text-[#FB991A] hover:text-[#d97706]'
                    >
                      Masuk disini
                    </ButtonLink>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
