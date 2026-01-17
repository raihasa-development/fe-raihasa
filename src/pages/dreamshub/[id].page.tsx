'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
    FiArrowLeft, FiUser, FiClock, FiHeart, FiMessageCircle,
    FiShare2, FiMoreHorizontal, FiSend, FiTrash2, FiTag
} from 'react-icons/fi';
import { MdOutlinePushPin } from 'react-icons/md';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import Layout from '@/layouts/Layout';
import { forumApi } from '@/lib/api/forum';
import type { ForumPost, ForumComment } from '@/types/forum';
import { Linkify } from '@/components/Linkify';

// Helper: Format Time
const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function PostDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const postId = id as string;

    const [post, setPost] = useState<ForumPost | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [userTokens, setUserTokens] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: string, name: string, role?: string } | null>(null);

    // Helper: Get Auth
    const getAuthToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token') || localStorage.getItem('accessToken');
    };

    const getUserInfo = () => {
        const token = getAuthToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                name: payload.name || payload.username || 'User',
                role: payload.role
            };
        } catch (e) { return null; }
    }

    const fetchUserTokens = async () => {
        const user = getUserInfo();
        if (!user) return;
        setCurrentUser(user);

        try {
            const token = getAuthToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts/tokens/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                const count = json.data?.forum_tokens ?? 0;
                setUserTokens(Number(count));
            }
        } catch (e) { console.error('Token fetch error', e); }
    };

    // -- Mock Data Logic to Replace if API Fails (Optional) --

    const fetchPost = async () => {
        if (!postId) return;
        try {
            setIsLoading(true);
            const data = await forumApi.getPostById(postId);
            setPost(data);
            // Assuming comments are included or fetched separately.
            // If getPostById returns comments inside post.comments:
            if (data.comments) setComments(data.comments);
        } catch (error) {
            console.error('Failed to fetch post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (postId) fetchPost();
        fetchUserTokens();
    }, [postId]);

    const handleLike = async () => {
        if (!post) return;
        try {
            // Optimistic update
            setPost(prev => prev ? ({
                ...prev,
                is_liked: !prev.is_liked,
                like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
            }) : null);

            await forumApi.toggleLikePost(post.id);
        } catch (error) {
            console.error('Like failed', error);
            fetchPost(); // Revert on error
        }
    };

    const handleSubmitComment = async () => {
        if (!commentContent.trim() || !post) return;

        // Client-side Token Check
        if (userTokens !== null && userTokens <= 0) {
            alert('Kuota komentar Anda habis (Maks. 3 komentar).');
            return;
        }

        try {
            setIsSubmitting(true);
            await forumApi.createComment(post.id, { content: commentContent });
            setCommentContent('');
            fetchPost();
            fetchUserTokens(); // Refresh tokens
        } catch (error: any) {
            alert(error.message || 'Gagal mengirim komentar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
        try {
            await forumApi.deleteComment(commentId);
            fetchPost();
        } catch (error: any) {
            alert(error.message || 'Gagal menghapus komentar');
        }
    };

    if (isLoading) {
        return (
            <Layout withNavbar={true} withFooter={true}>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="w-10 h-10 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout withNavbar={true} withFooter={true}>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                    <Typography className="text-xl font-bold mb-4">Postingan tidak ditemukan</Typography>
                    <button onClick={() => router.push('/dreamshub')} className="text-[#1B7691] hover:underline">Kembali ke Forum</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout withNavbar={true} withFooter={true}>
            <SEO title={`${post.title} - DreamsHub`} />
            <main className="min-h-screen bg-gray-50 pb-20">

                {/* Header Background */}
                <div className="h-64 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] relative">
                    <div className="absolute inset-0 bg-[#0d5a6e]/20 backdrop-blur-sm"></div>
                </div>

                <div className="container mx-auto px-4 -mt-40 relative z-10 max-w-4xl">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <FiArrowLeft /> Kembali
                    </button>

                    {/* Main Post Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                        <div className="p-8 md:p-10 text-center border-b border-gray-100 bg-gray-50/50">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1B7691]/10 text-[#1B7691] text-sm font-bold mb-4">
                                {post.category?.name || 'Umum'}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                        <FiUser />
                                    </div>
                                    <span className="font-medium">{post.author?.name || 'Anonim'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiClock />
                                    <span>{formatTimestamp(post.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="prose max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                                <Linkify>{post.content}</Linkify>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-100">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${post.is_liked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-200 text-gray-600'}`}
                                >
                                    <FiHeart className={post.is_liked ? "fill-current" : ""} />
                                    <span className="font-medium">{post.like_count}</span>
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
                                    <FiMessageCircle />
                                    <span className="font-medium">{post._count?.comments || comments.length} Balasan</span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-[#1B7691] transition-colors">
                                <FiShare2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiMessageCircle className="text-[#1B7691]" /> Diskusi ({comments.length})
                            </h3>
                            {userTokens !== null && (
                                <div className={`px-4 py-2 rounded-lg text-sm font-bold border ${userTokens > 0 ? 'bg-blue-50 text-[#1B7691] border-blue-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                    Sisa Kuota Komentar: {userTokens}
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="flex gap-4 mb-10">
                            <div className="w-10 h-10 bg-[#1B7691]/10 rounded-full flex items-center justify-center text-[#1B7691] shrink-0">
                                <FiUser />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder={userTokens === 0 ? "Kuota komentar Anda habis." : "Tulis balasanmu..."}
                                    disabled={userTokens === 0}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all resize-none h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <div className="flex justify-between mt-2 items-center">
                                    <span className="text-xs text-gray-400">
                                        {userTokens !== null && userTokens <= 1 && userTokens > 0 ? 'Hampir habis!' : ''}
                                    </span>
                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={!commentContent.trim() || isSubmitting || (userTokens !== null && userTokens <= 0)}
                                        className="px-6 py-2.5 bg-[#1B7691] hover:bg-[#15627a] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Mengirim...' : <><FiSend /> Kirim Balasan</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comment List */}
                        {comments.map((comment, index) => {
                            const isCommentOwner = currentUser?.id === comment.author?.id || currentUser?.id === comment.author_id;
                            return (
                                <div key={comment.id || index} className="flex gap-4 group">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                        <FiUser />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 p-5 rounded-2xl rounded-tl-none relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-900">{comment.author?.name || 'User'}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">{formatTimestamp(comment.created_at)}</span>
                                                    {isCommentOwner && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Hapus Komentar"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-gray-700 leading-relaxed">
                                                <Linkify>{comment.content}</Linkify>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-2 px-2 text-sm text-gray-500">
                                            <button className="hover:text-[#1B7691]">Suka</button>
                                            <button className="hover:text-[#1B7691]">Balas</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {comments.length === 0 && (
                            <p className="text-center text-gray-400 py-4">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                        )}
                    </div>
                </div>
            </main>
        </Layout>
    );
}
