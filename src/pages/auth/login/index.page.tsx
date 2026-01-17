'use client';

import { useMutation } from '@tanstack/react-query';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import ButtonLink from '@/components/links/ButtonLink';
import SEO from '@/components/SEO';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';
import Typography from '@/components/Typography';
import useMutationToast from '@/hooks/useMutationToast';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { removeToken, setToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';
import withAuth from '@/components/hoc/withAuth';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

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

  const mutation = useMutation<void, AxiosError<ApiError>, LoginForm>({
    mutationFn: async (data: LoginForm) => {
      removeToken();

      const { data: res } = await api.post('/auth/login', data);

      if (!res?.data) throw new Error('Sesi login tidak valid');

      const { token, ...user } = res.data;

      setToken(token);
      login({ ...user, token });
      showToast('Berhasil login', SUCCESS_TOAST);

      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      const queryRedirect = router.query.redirect as string | undefined;

      if (redirectAfterLogin) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectAfterLogin);
      } else if (queryRedirect) {
        router.push(queryRedirect);
      } else {
        router.push('/');
      }
    },
  });

  const { mutate: loginMutation, isPending } =
    useMutationToast<void, LoginForm>(mutation);

  const onSubmit = (data: LoginForm) => {
    loginMutation(data);
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
              src='/images/logo.png'
              alt='Raih Asa Logo'
              width={180}
              height={125}
              className='brightness-0 invert opacity-90'
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
          {/* Mobile Background Decoration */}
          <div className="lg:hidden absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B7691] to-[#FB991A]"></div>

          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <NextImage src='/images/logo.png' alt='logo' width={140} height={100} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Masuk Akun</h2>
              <p className="mt-2 text-gray-500">Silakan masukkan detail akun Anda</p>
            </div>

            <div className="bg-white">
              <FormProvider {...methods}>
                <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <Input
                      id='email'
                      label='Email'
                      placeholder='nama@email.com'
                      validation={{ required: 'Email tidak boleh kosong' }}
                    />

                    <div className="space-y-1">
                      <Input
                        id='password'
                        label='Password'
                        type='password'
                        placeholder='••••••••'
                        validation={{ required: 'Password tidak boleh kosong' }}
                      />
                      <div className='flex justify-end'>
                        <ButtonLink
                          variant='unstyled'
                          href='#'
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
                    className='w-full !py-3 !text-base !rounded-xl !bg-[#1B7691] hover:!bg-[#166076] !font-semibold shadow-lg shadow-blue-900/10'
                  >
                    Masuk
                  </Button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-400">Atau</span>
                    </div>
                  </div>

                  <p className='text-center text-gray-600'>
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
