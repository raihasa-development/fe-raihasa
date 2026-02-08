import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { HiOutlineMail } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import Button from '@/components/buttons/Button';
import Input from '@/components/form/Input';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import api from '@/lib/api';

type ForgotPasswordForm = {
    email: string;
};

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const methods = useForm<ForgotPasswordForm>({
        mode: 'onTouched',
    });
    const { handleSubmit } = methods;

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', data);
            setIsSuccess(true);
            toast.success('Email reset password telah dikirim!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim email reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout withNavbar={true} withFooter={true}>
            <SEO title="Lupa Password | Raih Asa" description="Reset password akun Raih Asa Anda." />

            <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div>
                        <Typography variant="h2" weight="bold" className="text-center text-3xl text-gray-900">
                            {isSuccess ? 'Cek Email Anda' : 'Lupa Password?'}
                        </Typography>
                        <Typography className="mt-2 text-center text-sm text-gray-600">
                            {isSuccess
                                ? 'Kami telah mengirimkan instruksi reset password ke email Anda. Silakan cek inbox atau spam folder Anda.'
                                : 'Masukkan email Anda untuk menerima instruksi reset password.'}
                        </Typography>
                    </div>

                    {!isSuccess ? (
                        <FormProvider {...methods}>
                            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4">
                                    <Input
                                        id="email"
                                        label="Email Address"
                                        placeholder="nama@email.com"
                                        leftIcon={HiOutlineMail}
                                        validation={{
                                            required: 'Email wajib diisi',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email tidak valid',
                                            },
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
                                        Kirim Instruksi Reset
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => router.push('/login')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Kembali ke Login
                                    </button>
                                </div>
                            </form>
                        </FormProvider>
                    ) : (
                        <div className="mt-8 space-y-6">
                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={() => setIsSuccess(false)}
                                    variant="warning"
                                    isOutline
                                    className="w-full py-3"
                                >
                                    Kirim Ulang Email
                                </Button>
                                <Button
                                    onClick={() => router.push('/login')}
                                    variant="primary"
                                    className="w-full py-3"
                                >
                                    Kembali ke Login
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
