'use client';

import { useMutation } from '@tanstack/react-query';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import Typography from '@/components/Typography';
import useMutationToast from '@/hooks/useMutationToast';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { removeToken, setToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';
import withAuth from '@/components/hoc/withAuth';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';
import { GoogleLogin } from '@react-oauth/google';

type LoginForm = {
  email: string;
  password: string;
};

export default withAuth(LoginPage, 'public');

function LoginPage() {
  const methods = useForm<LoginForm>({
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;
  const router = useRouter();
  const login = useAuthStore.useLogin();

  // Persist redirect param to session storage so it survives page navigation (e.g. to register)
  React.useEffect(() => {
    if (router.isReady && router.query.redirect) {
      sessionStorage.setItem('redirectAfterLogin', router.query.redirect as string);
    }
  }, [router.isReady, router.query.redirect]);

  const mutation = useMutation<void, AxiosError<ApiError>, LoginForm>({
    mutationFn: async (data: LoginForm) => {
      removeToken();

      const { data: res } = await api.post('/auth/login', data);

      if (!res?.data) throw new Error('Sesi login tidak valid');

      const { token, ...user } = res.data;

      setToken(token);
      login({ ...user, token });
      showToast('Berhasil login', SUCCESS_TOAST);

      // Prioritize query param, then session storage, then default
      const queryRedirect = router.query.redirect as string | undefined;
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');

      const target = queryRedirect || sessionRedirect || '/';

      // Clean up session storage if we used it
      if (sessionRedirect) sessionStorage.removeItem('redirectAfterLogin');

      router.push(target);
    },
    onError: (error) => {
      let errMsg = error.response?.data?.message || 'Gagal masuk. Coba cek koneksi internetmu, ya! 😊';
      if (errMsg === 'Invalid credentials' || errMsg === 'Unauthorized') {
        errMsg = 'Password-nya kurang pas nih, bestie. Coba cek lagi deh caps lock atau typo-nya, jangan sampai salah ketik ya! 😊';
      } else if (errMsg === 'Credentials not found' || errMsg === 'Not Found' || errMsg === 'Credentials Not Found') {
        errMsg = 'Waduh, email kamu belum terdaftar nih. Kalau belum punya akun, yuk daftar dulu biar bisa bareng-bareng kejar beasiswa impianmu! 🤗';
      } else if (errMsg === 'Account not verified' || errMsg === 'Forbidden') {
        errMsg = 'Akun kamu belum diverifikasi, nih. Yuk, cek inbox email-mu atau folder spam buat klik tautan verifikasinya! 💌';
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

  const { mutate: loginMutation, isPending } = mutation;

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
      showToast('Berhasil login dengan Google', SUCCESS_TOAST);

      const queryRedirect = router.query.redirect as string | undefined;
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
      const target = queryRedirect || sessionRedirect || '/';

      if (sessionRedirect) sessionStorage.removeItem('redirectAfterLogin');

      router.push(target);
    },
  });

  const { mutate: googleLoginMutation } = useMutationToast<void, string>(googleMutation);

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLoginMutation(credentialResponse.credential);
    }
  };

  const onSubmit = (data: LoginForm) => {
    loginMutation(data);
  };

  const handleResend = () => {
    const email = methods.getValues('email');
    if (email) {
      resendMutation.mutate(email);
    } else {
      showToast('Masukkan email terlebih dahulu', DANGER_TOAST);
    }
  };

  return (
    <Layout withFooter={false} withNavbar={false}>
      <SEO title='Login - Raih Asa' description='Masuk ke akun Raih Asa Anda.' />

      <div className="min-h-screen flex items-stretch font-primary">
        {/* Left Side - Artistic/Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B7691] overflow-hidden flex-col justify-between p-16 text-white">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FB991A] rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[100px] opacity-10"></div>

          <div className="relative z-10">
            <NextImage
              src='/images/logo_white.svg'
              alt='Raih Asa Logo'
              width={160}
              height={110}
              className='opacity-90 object-contain pointer-events-none select-none'
            />
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Welcome Back to <span className="text-[#FB991A]">Raih Asa</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Lanjutkan perjalanan meraih mimpimu. Akses ribuan informasi beasiswa, mentoring eksklusif, dan komunitas yang suportif.
            </p>

            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1B7691] bg-gray-200"></div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-xl">100k+</p>
                  <p className="text-sm text-white/70">Students Joined</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-white/50">
            &copy; {new Date().getFullYear()} Raih Asa. All Rights Reserved.
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50/50 lg:bg-slate-50/20 relative overflow-hidden">
          {/* Mobile Background Decoration */}
          <div className="lg:hidden absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1B7691] to-[#FB991A]"></div>

          {/* Decorative blurred circles in the background (mesh gradient effect for mobile) */}
          <div className="lg:hidden absolute -top-12 -left-12 w-64 h-64 bg-[#1B7691]/8 rounded-full blur-3xl pointer-events-none"></div>
          <div className="lg:hidden absolute bottom-12 -right-12 w-72 h-72 bg-[#FB991A]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6 md:space-y-8 relative z-10">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <NextImage 
                  src='/images/landing/Logo Primary Raih Asa Warna.svg' 
                  alt='Raih Asa Logo' 
                  width={150} 
                  height={104} 
                  className="object-contain pointer-events-none select-none" 
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Masuk Akun</h2>
              <p className="mt-2.5 text-base text-gray-600">Silakan masukkan detail akun Anda</p>
            </div>

            <div>
              <FormProvider {...methods}>
                <form method='post' className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-5">
                    <Input
                      id='email'
                      label='Email'
                      placeholder='nama@email.com'
                      validation={{ required: 'Email tidak boleh kosong' }}
                      className="!bg-slate-50/40 hover:!bg-slate-50/80 focus:!bg-white focus:!ring-[#1B7691] transition-all duration-200 !rounded-md"
                    />

                    <div className="space-y-1">
                      <Input
                        id='password'
                        label='Password'
                        type='password'
                        placeholder='••••••••'
                        validation={{ required: 'Password tidak boleh kosong' }}
                        className="!bg-slate-50/40 hover:!bg-slate-50/80 focus:!bg-white focus:!ring-[#1B7691] transition-all duration-200 !rounded-md"
                      />
                      <div className='flex justify-end'>
                        <ButtonLink
                          variant='unstyled'
                          href='/auth/forgot-password'
                          className='text-sm font-medium text-[#1B7691] hover:text-[#166076] transition-colors'
                        >
                          Lupa password?
                        </ButtonLink>
                      </div>
                    </div>
                  </div>

                  <Button
                    isLoading={isPending}
                    type='submit'
                    variant='primary'
                    className='w-full !py-3 !text-base !rounded-xl !bg-[#1B7691] hover:!bg-[#166076] !font-semibold shadow-md shadow-[#1b7691]/20 hover:shadow-lg hover:shadow-[#1b7691]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                  >
                    Masuk
                  </Button>

                  {methods.formState.errors.root?.message && (
                    <div className='mt-3 text-center p-3 bg-red-50 rounded-xl border border-red-100'>
                      <Typography variant='c2' className='text-red-600 block mb-1.5 font-normal'>
                        {methods.formState.errors.root.message}
                      </Typography>
                      {methods.formState.errors.root.message.includes('belum diverifikasi') && (
                        <button
                          type='button'
                          onClick={handleResend}
                          disabled={resendMutation.isPending}
                          className='text-[#1B7691] hover:underline disabled:opacity-50 text-xs mt-1 block mx-auto font-semibold'
                        >
                          {resendMutation.isPending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi 💌'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-400">Atau</span>
                    </div>
                  </div>

                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        showToast('Login Google gagal. Coba lagi.', DANGER_TOAST);
                      }}
                      useOneTap
                    />
                  </div>

                  <p className='text-center text-gray-600 text-sm'>
                    Belum memiliki akun?{' '}
                    <ButtonLink
                      href='/register'
                      className='font-semibold text-[#FB991A] hover:text-[#e08916] transition-colors'
                    >
                      Daftar Sekarang
                    </ButtonLink>
                  </p>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
