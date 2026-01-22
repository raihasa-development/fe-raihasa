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
import { REG_EMAIL, REG_PASSWORD } from '@/constants/regex';
import useMutationToast from '@/hooks/useMutationToast';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { setToken } from '@/lib/cookies';
import useAuthStore from '@/store/useAuthStore';
import { ApiError } from '@/types/api';
import { AxiosError } from 'axios';

type RegisterForm = {
  email: string;
  name: string;
  password: string;
};

export default function RegisterPage() {
  const methods = useForm<RegisterForm>({
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;
  const router = useRouter();
  const login = useAuthStore.useLogin();

  const {
    mutate: registerMutation,
    isPending,
  } = useMutation<void, AxiosError<ApiError>, RegisterForm>({
    mutationFn: async (data: RegisterForm) => {
      const res = await api.post('/auth/register', data);
      // eslint-disable-next-line no-console
      // console.log(res);
      showToast('Berhasil mendaftar', SUCCESS_TOAST);

      // Automatically log in the user after registration
      const { data: loginRes } = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { token, ...user } = loginRes.data;
      setToken(token);
      login({ ...user, token });

      // Redirect logic after registration and login
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push('/');
      }
    },
  });

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
              src='/images/logo.png'
              alt='Raih Asa Logo'
              width={180}
              height={125}
              className='brightness-0 invert opacity-90'
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
                <NextImage src='/images/logo.png' alt='logo' width={140} height={100} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Buat Akun Baru</h2>
              <p className="mt-2 text-gray-500">Mulai langkah pertamamu meraih beasiswa impian.</p>
            </div>

            <div className="bg-white">
              <FormProvider {...methods}>
                <form
                  className='space-y-4 md:space-y-5'
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

                  <p className='text-center text-sm text-gray-500 mt-6'>
                    Dengan mendaftar, Anda menyetujui <a href="#" className="underline hover:text-gray-800">Syarat & Ketentuan</a> kami.
                  </p>

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
