'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit3, FiTag, FiFileText } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { forumApi } from '@/lib/api/forum';
import type { ForumCategory } from '@/types/forum';

export default function CreatePostPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await forumApi.getCategories();
                setCategories(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) {
            alert('Mohon lengkapi semua data');
            return;
        }

        try {
            setIsSubmitting(true);
            await forumApi.createPost({
                title,
                content,
                category_id: categoryId
            });
            // Success
            router.push('/dreamshub');
        } catch (error: any) {
            alert(error.message || 'Gagal membuat postingan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout withNavbar={true} withFooter={true}>
            <SEO title="Buat Diskusi Baru - DreamsHub" />
            <main className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] h-48 relative">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                </div>

                <div className="container mx-auto px-4 -mt-24 relative z-10 max-w-3xl">
                    <button onClick={() => router.back()} className="text-white/90 hover:text-white flex items-center gap-2 mb-6 font-medium">
                        <FiArrowLeft /> Batal
                    </button>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1B7691]/10 rounded-2xl flex items-center justify-center text-[#1B7691]">
                                    <FiEdit3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Buat Diskusi Baru</h1>
                                    <p className="text-gray-500">Mulai percakapan dengan komunitas</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiTag className="text-[#1B7691]" /> Kategori Topik
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryId(cat.id)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${categoryId === cat.id
                                                    ? 'bg-[#1B7691] text-white border-[#1B7691] shadow-md shadow-blue-500/20'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B7691]/50 hover:bg-blue-50'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Diskusi</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="Apa topik yang ingin dibahas?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiFileText className="text-[#1B7691]" /> Isi Diskusi
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={8}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all outline-none resize-none placeholder:text-gray-400 leading-relaxed"
                                    placeholder="Ceritakan detail pertanyaan atau opinimu di sini..."
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {isSubmitting ? 'Memposting...' : 'Posting Diskusi'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
