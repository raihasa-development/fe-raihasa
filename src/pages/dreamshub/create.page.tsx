'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit3, FiTag, FiFileText, FiUnlock, FiLock, FiInfo, FiLink } from 'react-icons/fi';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { forumApi } from '@/lib/api/forum';
import type { ForumCategory } from '@/types/forum';
import withAuth from '@/components/hoc/withAuth';

function CreatePostPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
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
                category_id: categoryId,
                is_private: isPrivate,
                attachment_url: attachmentUrl
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

                <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-24 relative z-10 max-w-3xl">
                    <button onClick={() => router.back()} className="text-white/90 hover:text-white flex items-center gap-2 mb-6 font-medium transition-all duration-300">
                        <FiArrowLeft /> Batal
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1B7691]/10 rounded-xl flex items-center justify-center text-[#1B7691]">
                                    <FiEdit3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Buat Diskusi Baru</h1>
                                    <p className="text-base text-gray-600">Mulai percakapan dengan komunitas</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FiTag className="text-[#1B7691]" /> Kategori Topik
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryId(cat.id)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 text-left ${categoryId === cat.id
                                                ? 'bg-[#1B7691] text-white border-[#1B7691] shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B7691]/50 hover:bg-blue-50'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FiInfo className="text-[#1B7691]" /> Visibilitas Konsultasi
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(false)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${!isPrivate
                                            ? 'bg-blue-50 border-[#1B7691] ring-1 ring-[#1B7691]'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!isPrivate ? 'bg-[#1B7691] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <FiUnlock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${!isPrivate ? 'text-[#1B7691]' : 'text-gray-700'}`}>Diskusi Terbuka</p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Konsultasi kamu dapat dilihat oleh seluruh komunitas DreamsHub dan bermanfaat untuk yang lain.</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(true)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${isPrivate
                                            ? 'bg-orange-50 border-[#FB991A] ring-1 ring-[#FB991A]'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPrivate ? 'bg-[#FB991A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <FiLock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isPrivate ? 'text-[#FB991A]' : 'text-gray-700'}`}>Konsultasi Pribadi</p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Hanya Anda dan tim mentor yang dapat melihat konsultasi ini. Cocok untuk pertanyaan personal.</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <FiLink className="text-[#1B7691]" /> Link Lampiran (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={attachmentUrl}
                                    onChange={(e) => setAttachmentUrl(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="Tempel link Google Drive atau dokumen lain di sini..."
                                />
                                <p className="text-[11px] text-gray-400 mt-2 px-1 font-normal italic">
                                    Pastikan akses link sudah diset agar Admin dapat melihat file tersebut.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Judul Diskusi</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all outline-none font-medium placeholder:text-gray-400"
                                    placeholder="Apa topik yang ingin dibahas?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
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
                                <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all duration-300">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl font-bold shadow-lg shadow-[#1B7691]/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
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

export default withAuth(CreatePostPage, 'user');
