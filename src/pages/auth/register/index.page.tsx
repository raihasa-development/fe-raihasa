'use client';
import { useMutation } from '@tanstack/react-query';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
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
    <Layout withFooter={true} withNavbar={true}>
      <SEO title='Register' description='Register Page' />
      <main className='flex flex-col items-center py-24 lg:flex-row'>
        <section className='hidden px-16 lg:block lg:w-1/2'>
          <NextImage
            src={'/images/auth/hero.png'}
            width={687}
            height={508}
            alt='Auth Hero'
            className=''
          />
        </section>
        <section className='w-full mx-auto bg-white rounded-lg lg:w-1/2'>
          <div className='w-4/5 p-6 mx-auto space-y-4 shadow-xl md:w-3/5 md:space-y-6 sm:p-8'>
            <div className='flex flex-col items-center justify-center mb-6 '>
              <NextImage
                src='/images/logo.png'
                alt='logo'
                width='254'
                height='177'
                className='w-16 md:w-24'
              />
            </div>

            <FormProvider {...methods}>
              <form
                className='space-y-4 md:space-y-6'
                onSubmit={handleSubmit(onSubmit)}
              >
                <Input
                  id='name'
                  label='Username'
                  placeholder='Masukkan username'
                  validation={{ required: 'Username harus diisi' }}
                />
                <Input
                  id='email'
                  label='Email'
                  placeholder='Masukkan email'
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
                  placeholder='Masukkan password'
                  validation={{
                    required: 'Kata sandi harus diisi',
                    pattern: {
                      value: REG_PASSWORD,
                      message:
                        'Kata sandi harus mengandung minimal 8 karakter yang terdiri atas kombinasi huruf besar, huruf kecil, dan angka',
                    },
                  }}
                />
                <Button
                  isLoading={isPending}
                  type='submit'
                  variant='primary'
                  className='w-full'
                >
                  Daftar
                </Button>
                <p className='text-sm font-body-standard text-gray-500 dark:text-gray-400 text-center font-[500]'>
                  Sudah memiliki akun?{' '}
                  <a href='/login' className='font-primary text-primary-orange'>
                    Masuk
                  </a>
                </p>
              </form>
            </FormProvider>
          </div>
        </section>
      </main>
    </Layout>
  );
}
