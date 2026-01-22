import React, { useEffect, useState } from 'react';
import { FiSearch, FiFolder, FiMessageSquare, FiCornerDownRight, FiSend, FiUser, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import withAuth from '@/components/hoc/withAuth';
import AdminDashboard from '@/layouts/AdminDashboard';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import { Linkify } from '@/components/Linkify';

export default withAuth(AdminDreamshubPage, 'admin');

function AdminDreamshubPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/posts/categories');
      setCategories(data?.data || []);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts', { params: { limit: 5 } });
      setPosts(data?.data || []);
    } catch {
      toast.error('Failed to fetch posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const openPost = async (post: any) => {
    try {
      const { data } = await api.get(`/posts/${post.id}`);
      setSelectedPost(data?.data);
      setComments(data?.data?.comments || []);
    } catch (e) {
      toast.error('Failed to load post details');
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedPost) return;
    setSendingReply(true);
    try {
      await api.post(`/posts/${selectedPost.id}/comments`, {
        content: replyContent
      });
      toast.success('Reply sent successfully');
      setReplyContent('');
      openPost(selectedPost);
    } catch (e) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await api.post('/posts/categories', { name });
      toast.success('Category created');
      fetchCategories();
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await api.put(`/posts/categories/${id}`, { name });
      toast.success('Category updated');
      fetchCategories();
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/posts/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      fetchPosts();
      if (selectedPost?.id === id) setSelectedPost(null);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <AdminDashboard withSidebar>
      <div className='mb-6'>
        <Typography variant='h5' className='font-bold text-gray-900'>Dreamshub Management</Typography>
        <Typography variant='c1' className='text-gray-500'>Manage forum categories and engage in discussions.</Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
        {/* Left Column: Categories and Recent Posts List */}
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Categories */}
          <div className='bg-white border border-gray-100 rounded-xl shadow-sm p-6 shrink-0'>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiFolder className="text-[#1B7691]" />
                <Typography variant="h6" className="font-bold">Categories</Typography>
              </div>
              <button
                onClick={() => {
                  const name = prompt('Enter new category name:');
                  if (name) handleCreateCategory(name);
                }}
                className="text-xs bg-[#1B7691] text-white px-2 py-1 rounded hover:bg-[#155a6e]"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {loadingCats ? <p className="text-gray-400 text-xs">Loading...</p> : categories.map(cat => (
                <div key={cat.id} className="group relative flex items-center text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-gray-600 hover:border-[#1B7691] hover:text-[#1B7691]">
                  <span className='cursor-pointer' onClick={() => {
                    const newName = prompt('Edit category name:', cat.name);
                    if (newName && newName !== cat.name) handleUpdateCategory(cat.id, newName);
                  }}>
                    {cat.name} ({cat._count?.posts || 0})
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete category?')) handleDeleteCategory(cat.id); }}
                    className="ml-1 hidden group-hover:block text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className='bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden grow'>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="text-[#E58941]" />
                <Typography variant="h6" className="font-bold">Recent Discussions</Typography>
              </div>
              <button onClick={fetchPosts} className="text-xs text-[#1B7691] hover:underline">Refresh</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {loadingPosts ? (
                <p className="text-center text-gray-400 text-sm">Loading posts...</p>
              ) : posts.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">No discussions found.</p>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => openPost(post)}
                    className={`relative group p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedPost?.id === post.id ? 'border-[#E58941] bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div className="pr-6">
                      <p className="font-bold text-sm text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.content}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this post?')) handleDeletePost(post.id); }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Post"
                    >
                      <FiTrash2 size={14} />
                    </button>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <FiUser /> {post.author?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                        {post._count?.comments || 0} replies
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Discussion / Chat Interface */}
        <div className='bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden'>
          {!selectedPost ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm flex-col gap-2">
              <FiMessageSquare className="text-4xl text-gray-200" />
              <p>Select a discussion to view details and reply</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {selectedPost.category?.name || 'General'}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedPost.title}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                    {selectedPost.author?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedPost.author?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  <Linkify>{selectedPost.content}</Linkify>
                </div>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs my-4">No comments yet. Be the first to reply!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className={`flex gap-3 ${comment.author?.role === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${comment.author?.role === 'ADMIN' ? 'bg-[#1B7691] text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {comment.author?.name?.[0] || '?'}
                      </div>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${comment.author?.role === 'ADMIN' ? 'bg-[#1B7691]/10 text-gray-800 rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                        <div className="flex justify-between items-center mb-1 gap-4">
                          <span className={`text-xs font-bold ${comment.author?.role === 'ADMIN' ? 'text-[#1B7691]' : 'text-gray-900'}`}>{comment.author?.name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <Linkify>{comment.content}</Linkify>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply as Admin..."
                    className="w-full resize-none border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 focus:border-[#1B7691] min-h-[50px]"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyContent.trim()}
                    className="bg-[#1B7691] hover:bg-[#15627a] text-white p-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {sendingReply ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminDashboard>
  );
}
