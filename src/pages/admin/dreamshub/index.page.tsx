'use client';

import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiHeart, FiUser, FiClock, FiEdit2, FiTrash2, FiLock, FiUnlock, FiSearch, FiX, FiSend, FiSettings } from 'react-icons/fi';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';
import type { ForumCategory, ForumPost, ForumComment } from '@/types/forum';
import { forumApi } from '@/lib/api/forum';

export default function AdminDreamshubPage() {
  // Forum states
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [isLoadingForum, setIsLoadingForum] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  
  // Category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#FF5733');

  // User info
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Helper to get cookie
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Get auth token
  const getAuthToken = () => {
    const localStorageKeys = ['token', 'accessToken', '@raihasa/token'];
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    
    const cookieKeys = ['token', 'accessToken', '@raihasa/token'];
    for (const key of cookieKeys) {
      const value = getCookie(key);
      if (value) return value;
    }
    
    return null;
  };

  // Decode JWT to get user info
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id);
        setUserRole(payload.role);
        
        // Redirect if not admin
        if (payload.role !== 'ADMIN') {
          alert('Akses ditolak. Hanya admin yang bisa mengakses halaman ini.');
          window.location.href = '/dreamshub';
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        window.location.href = '/auth/login';
      }
    } else {
      window.location.href = '/auth/login';
    }
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await forumApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Don't throw - just log the error so page still renders
    }
  };

  // Fetch forum posts
  const fetchForumPosts = async () => {
    try {
      setIsLoadingForum(true);
      const response = await forumApi.getPosts({
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });
      
      setForumPosts(response.data);
      setTotalPages(response.metadata.totalPages);
      setTotalPosts(response.metadata.total);
    } catch (error) {
      console.error('Failed to fetch forum posts:', error);
    } finally {
      setIsLoadingForum(false);
    }
  };

  // Fetch post detail with comments
  const fetchPostDetail = async (postId: string) => {
    try {
      const post = await forumApi.getPostById(postId);
      setSelectedPost(post);
      setShowPostDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      alert('Gagal memuat detail post');
    }
  };

  // Admin: Toggle Pin Post
  const handleTogglePin = async (postId: string, currentStatus: boolean) => {
    try {
      await forumApi.togglePinPost(postId);
      alert(`Post berhasil ${currentStatus ? 'di-unpin' : 'di-pin'}!`);
      fetchForumPosts();
      if (selectedPost && selectedPost.id === postId) {
        fetchPostDetail(postId);
      }
    } catch (error: any) {
      console.error('Failed to toggle pin:', error);
      alert(error.message || 'Gagal mengubah status pin');
    }
  };

  // Admin: Toggle Lock Post
  const handleToggleLock = async (postId: string, currentStatus: boolean) => {
    try {
      await forumApi.toggleLockPost(postId);
      alert(`Post berhasil ${currentStatus ? 'dibuka' : 'dikunci'}!`);
      fetchForumPosts();
      if (selectedPost && selectedPost.id === postId) {
        fetchPostDetail(postId);
      }
    } catch (error: any) {
      console.error('Failed to toggle lock:', error);
      alert(error.message || 'Gagal mengubah status lock');
    }
  };

  // Admin: Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Yakin ingin menghapus post ini?')) return;

    try {
      await forumApi.deletePost(postId);
      alert('Post berhasil dihapus!');
      setShowPostDetailModal(false);
      setSelectedPost(null);
      fetchForumPosts();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert(error.message || 'Gagal menghapus post');
    }
  };

  // Admin: Create comment (with admin badge)
  const handleCreateAdminComment = async () => {
    if (!selectedPost || !commentContent.trim()) {
      alert('Mohon isi komentar');
      return;
    }

    try {
      await forumApi.createComment(selectedPost.id, {
        content: commentContent.trim(),
        parent_id: replyToCommentId || undefined,
      });

      alert('Balasan admin berhasil ditambahkan!');
      setCommentContent('');
      setReplyToCommentId(null);
      fetchPostDetail(selectedPost.id);
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      alert(error.message || 'Gagal menambahkan komentar');
    }
  };

  // Admin: Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return;

    try {
      await forumApi.deleteComment(commentId);
      alert('Komentar berhasil dihapus!');
      if (selectedPost) {
        fetchPostDetail(selectedPost.id);
      }
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      alert(error.message || 'Gagal menghapus komentar');
    }
  };

  // Admin: Create/Update Category
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert('Mohon isi nama kategori');
      return;
    }

    try {
      if (editingCategory) {
        await forumApi.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
          icon: categoryIcon.trim() || undefined,
          color: categoryColor || undefined,
        });
        alert('Kategori berhasil diupdate!');
      } else {
        await forumApi.createCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
          icon: categoryIcon.trim() || undefined,
          color: categoryColor || undefined,
        });
        alert('Kategori berhasil dibuat!');
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      setCategoryIcon('');
      setCategoryColor('#FF5733');
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Gagal menyimpan kategori');
    }
  };

  // Admin: Delete Category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua post dalam kategori ini akan terhapus!')) return;

    try {
      await forumApi.deleteCategory(categoryId);
      alert('Kategori berhasil dihapus!');
      fetchCategories();
      if (selectedCategory === categoryId) {
        setSelectedCategory('all');
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Gagal menghapus kategori');
    }
  };

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fetch initial data
  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchCategories();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchForumPosts();
    }
  }, [selectedCategory, searchQuery, currentPage, userRole]);

  if (userRole !== 'ADMIN') {
    return null; // Don't render anything until role is verified
  }

  return (
    <AdminDashboard>
      <SEO title="Admin - Dreamshub Management" />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <Typography className="text-3xl font-bold text-gray-900 mb-2">
              Forum Dreamshub Management
            </Typography>
            <Typography className="text-gray-600">
              Kelola kategori, moderasi post, dan balas pertanyaan sebagai admin
            </Typography>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography className="text-sm text-gray-600 mb-1">Total Posts</Typography>
                  <Typography className="text-2xl font-bold text-gray-900">{totalPosts}</Typography>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMessageCircle className="text-xl text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography className="text-sm text-gray-600 mb-1">Categories</Typography>
                  <Typography className="text-2xl font-bold text-gray-900">{categories.length}</Typography>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiSettings className="text-xl text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography className="text-sm text-gray-600 mb-1">Pinned Posts</Typography>
                  <Typography className="text-2xl font-bold text-gray-900">
                    {forumPosts.filter(p => p.is_pinned).length}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MdPushPin className="text-xl text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography className="text-sm text-gray-600 mb-1">Locked Posts</Typography>
                  <Typography className="text-2xl font-bold text-gray-900">
                    {forumPosts.filter(p => p.is_locked).length}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiLock className="text-xl text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Typography className="text-lg font-semibold text-gray-900">
                Kelola Kategori
              </Typography>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryDescription('');
                  setCategoryIcon('');
                  setCategoryColor('#FF5733');
                  setShowCategoryModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Tambah Kategori
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Typography className="font-semibold text-gray-900">{cat.name}</Typography>
                      {cat.description && (
                        <Typography className="text-sm text-gray-600 mt-1">{cat.description}</Typography>
                      )}
                      <Typography className="text-xs text-gray-500 mt-2">
                        {cat._count ? cat._count.posts : 0} posts
                      </Typography>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setCategoryDescription(cat.description || '');
                        setCategoryIcon(cat.icon || '');
                        setCategoryColor(cat.color || '#FF5733');
                        setShowCategoryModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forum Posts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <Typography className="text-lg font-semibold text-gray-900 mb-4">
                Moderasi Post Forum
              </Typography>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari post..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cari
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchInput('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name} {cat._count && `(${cat._count.posts})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Forum Posts */}
            {isLoadingForum ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <Typography className="text-gray-600">Memuat posts...</Typography>
              </div>
            ) : forumPosts.length === 0 ? (
              <div className="text-center py-12">
                <Typography className="text-gray-500">Tidak ada post</Typography>
              </div>
            ) : (
              <div className="space-y-3">
                {forumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-lg text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Typography className="font-semibold text-gray-900">
                            {post.author.name}
                          </Typography>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {post.category.name}
                          </span>
                          {post.is_pinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              <MdOutlinePushPin className="w-3 h-3" />
                              Pinned
                            </span>
                          )}
                          {post.is_locked && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              <FiLock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                          <Typography className="text-xs text-gray-500">
                            {formatTimestamp(post.created_at)}
                          </Typography>
                        </div>
                        <Typography className="font-semibold text-gray-900 mb-1">
                          {post.title}
                        </Typography>
                        <Typography className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {post.content}
                        </Typography>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fetchPostDetail(post.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Lihat & Balas
                          </button>
                          <button
                            onClick={() => handleTogglePin(post.id, post.is_pinned)}
                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            {post.is_pinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => handleToggleLock(post.id, post.is_locked)}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            {post.is_locked ? 'Unlock' : 'Lock'}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Hapus
                          </button>
                          <div className="flex items-center gap-4 text-xs text-gray-500 ml-auto">
                            <span className="flex items-center gap-1">
                              <FiHeart className="w-3 h-3" />
                              {post.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageCircle className="w-3 h-3" />
                              {post._count.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2 items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== CATEGORY MODAL ========== */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Typography className="text-xl font-semibold text-gray-900">
                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                  </Typography>
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      setCategoryName('');
                      setCategoryDescription('');
                      setCategoryIcon('');
                      setCategoryColor('#FF5733');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Contoh: Umum, Tips & Trik"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Deskripsi singkat kategori..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (opsional)
                  </label>
                  <input
                    type="text"
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    placeholder="Emoji atau icon"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warna
                  </label>
                  <input
                    type="color"
                    value={categoryColor}
                    onChange={(e) => setCategoryColor(e.target.value)}
                    className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setCategoryName('');
                    setCategoryDescription('');
                    setCategoryIcon('');
                    setCategoryColor('#FF5733');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== POST DETAIL MODAL (ADMIN REPLY) ========== */}
        {showPostDetailModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-lg text-gray-600" />
                      </div>
                      <div>
                        <Typography className="font-semibold text-gray-900">
                          {selectedPost.author.name}
                        </Typography>
                        <Typography className="text-xs text-gray-500">
                          {formatTimestamp(selectedPost.created_at)}
                        </Typography>
                      </div>
                      <span className="px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                        {selectedPost.category.name}
                      </span>
                      {selectedPost.is_pinned && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">
                          <MdOutlinePushPin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      {selectedPost.is_locked && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                          <FiLock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPostDetailModal(false);
                      setSelectedPost(null);
                      setCommentContent('');
                      setReplyToCommentId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6 border-b border-gray-200">
                <Typography className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedPost.title}
                </Typography>
                <Typography className="text-gray-700 whitespace-pre-wrap mb-4">
                  {selectedPost.content}
                </Typography>
                
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleTogglePin(selectedPost.id, selectedPost.is_pinned)}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                  >
                    {selectedPost.is_pinned ? 'Unpin Post' : 'Pin Post'}
                  </button>
                  <button
                    onClick={() => handleToggleLock(selectedPost.id, selectedPost.is_locked)}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    {selectedPost.is_locked ? 'Unlock Post' : 'Lock Post'}
                  </button>
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Hapus Post
                  </button>
                  <div className="flex items-center gap-4 text-gray-500 ml-auto">
                    <span className="flex items-center gap-1.5">
                      <FiHeart className="w-4 h-4" />
                      {selectedPost.like_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMessageCircle className="w-4 h-4" />
                      {selectedPost._count.comments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-6">
                <Typography className="text-lg font-semibold text-gray-900 mb-4">
                  Balasan ({selectedPost._count.comments})
                </Typography>

                {/* Admin Comment Input */}
                <div className="mb-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      ADMIN
                    </span>
                    <Typography className="text-sm font-medium text-gray-700">
                      Balas sebagai Admin
                    </Typography>
                  </div>
                  {replyToCommentId && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <span>Membalas komentar...</span>
                      <button
                        onClick={() => setReplyToCommentId(null)}
                        className="text-blue-600 hover:underline"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-lg text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Tulis balasan admin..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleCreateAdminComment}
                          disabled={!commentContent.trim()}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <FiSend className="w-4 h-4" />
                          Kirim Balasan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            comment.is_admin_reply ? 'bg-blue-600' : 'bg-gray-100'
                          }`}>
                            <FiUser className={`text-lg ${comment.is_admin_reply ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Typography className="font-semibold text-gray-900 text-sm">
                                {comment.author.name}
                              </Typography>
                              {comment.is_admin_reply && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                  ADMIN
                                </span>
                              )}
                              <Typography className="text-xs text-gray-500">
                                {formatTimestamp(comment.created_at)}
                              </Typography>
                            </div>
                            <Typography className="text-gray-700 text-sm whitespace-pre-wrap mb-2">
                              {comment.content}
                            </Typography>
                            <div className="flex items-center gap-4 text-xs">
                              <button
                                onClick={() => setReplyToCommentId(comment.id)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Balas
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Hapus
                              </button>
                            </div>
                            
                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 ml-8 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      reply.is_admin_reply ? 'bg-blue-600' : 'bg-gray-100'
                                    }`}>
                                      <FiUser className={`text-sm ${reply.is_admin_reply ? 'text-white' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Typography className="font-semibold text-gray-900 text-sm">
                                          {reply.author.name}
                                        </Typography>
                                        {reply.is_admin_reply && (
                                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                            ADMIN
                                          </span>
                                        )}
                                        <Typography className="text-xs text-gray-500">
                                          {formatTimestamp(reply.created_at)}
                                        </Typography>
                                      </div>
                                      <Typography className="text-gray-700 text-sm whitespace-pre-wrap mb-2">
                                        {reply.content}
                                      </Typography>
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Typography className="text-gray-500">
                        Belum ada balasan. Jadilah admin pertama yang menjawab!
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminDashboard>
  );
}
