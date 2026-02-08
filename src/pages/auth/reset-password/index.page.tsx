import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { HiLockClosed } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';

type ResetPasswordForm = {
    password: string;
    confirmPassword: string;
};

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const methods = useForm<ResetPasswordForm>({
        mode: 'onTouched',
    });
    const { handleSubmit, watch } = methods;

    const password = watch('password');

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token) {
            toast.error('Token tidak valid atau kadaluarsa.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword: data.password,
            });
            setIsSuccess(true);
            toast.success('Password berhasil direset!');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mereset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout withNavbar={true} withFooter={true}>
            <SEO title="Reset Password | Raih Asa" description="Buat password baru untuk akun Anda." />

            <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div>
                        <Typography variant="h2" weight="bold" className="text-center text-3xl text-gray-900">
                            {isSuccess ? 'Password Berhasil Direset' : 'Buat Password Baru'}
                        </Typography>
                        <Typography className="mt-2 text-center text-sm text-gray-600">
                            {isSuccess
                                ? 'Silakan login kembali dengan password baru Anda. Mengalihkan...'
                                : 'Masukkan password baru yang aman untuk akun Anda.'}
                        </Typography>
                    </div>

                    {!isSuccess ? (
                        <FormProvider {...methods}>
                            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4">
                                    <Input
                                        id="password"
                                        label="Password Baru"
                                        type="password"
                                        placeholder="Minimal 8 karakter"
                                        leftIcon={HiLockClosed}
                                        validation={{
                                            required: 'Password wajib diisi',
                                            minLength: {
                                                value: 8,
                                                message: 'Password minimal 8 karakter',
                                            },
                                        }}
                                    />
                                    <Input
                                        id="confirmPassword"
                                        label="Konfirmasi Password"
                                        type="password"
                                        placeholder="Ulangi password baru"
                                        leftIcon={HiLockClosed}
                                        validation={{
                                            required: 'Konfirmasi password wajib diisi',
                                            validate: (value) =>
                                                value === password || 'Password tidak cocok',
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isLoading}
                                        className="w-full py-3"
                                    >
                                        Reset Password
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    ) : (
                        <div className="mt-8 flex justify-center">
                            <Button
                                onClick={() => router.push('/login')}
                                variant="primary"
                                className="w-full py-3"
                            >
                                Login Sekarang
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
