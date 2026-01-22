import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiTool, FiArrowRight, FiBookOpen, FiZap, FiClock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

import SEO from '@/components/SEO';
import Layout from '@/layouts/Layout';

export default function ScholraMaintenancePage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    // Auto redirect countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            router.push('/bisa-learning');
        }
    }, [countdown, router]);

    return (
        <Layout withNavbar withFooter>
            <SEO title="Scholra AI - Sedang Dalam Pengembangan | Raihasa" />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-20">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-2xl w-full text-center">
                    {/* Icon */}
                    <div className="mb-8 inline-flex items-center justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#1B7691]/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <HiSparkles className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                                <FiTool className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Scholra AI Sedang Berevolusi! 🚀
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed max-w-xl mx-auto">
                        Kami sedang menyempurnakan <span className="text-[#1B7691] font-semibold">Scholra AI</span> agar
                        bisa memberikan rekomendasi beasiswa yang lebih akurat dan personal untukmu.
                    </p>

                    {/* Features being improved */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/80 shadow-xl shadow-gray-100/50">
                        <p className="text-sm text-gray-500 mb-4 font-medium">Yang sedang kami tingkatkan:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 text-left p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FiZap className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">AI Lebih Cerdas</p>
                                    <p className="text-xs text-gray-500">Akurasi tinggi</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FiBookOpen className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Database Baru</p>
                                    <p className="text-xs text-gray-500">2500+ beasiswa</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FiClock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Lebih Cepat</p>
                                    <p className="text-xs text-gray-500">Response instan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm">
                            Sambil menunggu, yuk explore materi eksklusif di BISA Learning! 📚
                        </p>

                        <button
                            onClick={() => router.push('/bisa-learning')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white px-8 py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-[#1B7691]/25 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Explore BISA Learning
                            <FiArrowRight className="w-5 h-5" />
                        </button>

                        {/* Auto redirect notice */}
                        <p className="text-xs text-gray-400 mt-4">
                            Otomatis redirect dalam <span className="font-bold text-[#1B7691]">{countdown}</span> detik...
                        </p>
                    </div>

                    {/* Footer note */}
                    <div className="mt-12 pt-8 border-t border-gray-200/50">
                        <p className="text-sm text-gray-500">
                            Ada pertanyaan? Hubungi kami di{' '}
                            <a
                                href="https://wa.me/6285117323893"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1B7691] hover:underline font-medium"
                            >
                                WhatsApp
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
