import type {
  ForumCategory,
  ForumPost,
  ForumComment,
  CreateForumPostRequest,
  UpdateForumPostRequest,
  CreateForumCommentRequest,
  GetForumPostsQuery,
  ForumPostsResponse,
  ForumApiResponse,
} from '@/types/forum';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Helper to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const localStorageKeys = ['token', 'accessToken', '@raihasa/token'];
  for (const key of localStorageKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const cookieKeys = ['token', 'accessToken', '@raihasa/token'];
  for (const key of cookieKeys) {
    const value = getCookie(key);
    if (value) return value;
  }

  return null;
};

// Helper to get headers with auth
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============ CATEGORY APIs ============
export const forumApi = {
  // Get all categories
  async getCategories(): Promise<ForumCategory[]> {
    try {
      const response = await fetch(`${API_URL}/posts/categories`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch categories:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: `${API_URL}/posts/categories`,
        });
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const result: ForumApiResponse<ForumCategory[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create category (ADMIN only)
  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }): Promise<ForumCategory> {
    const response = await fetch(`${API_URL}/posts/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const result: ForumApiResponse<ForumCategory> = await response.json();
    return result.data;
  },

  // Update category (ADMIN only)
  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
    }
  ): Promise<ForumCategory> {
    const response = await fetch(`${API_URL}/posts/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    const result: ForumApiResponse<ForumCategory> = await response.json();
    return result.data;
  },

  // Delete category (ADMIN only)
  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }
  },

  // ============ POST APIs ============
  // Get posts with filters
  async getPosts(query: GetForumPostsQuery = {}): Promise<ForumPostsResponse> {
    const params = new URLSearchParams();

    if (query.author_id) params.append('author_id', query.author_id);
    if (query.category_id) params.append('category_id', query.category_id);
    if (query.search) params.append('search', query.search);
    if (query.is_pinned !== undefined) params.append('is_pinned', String(query.is_pinned));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const url = `${API_URL}/posts${params.toString() ? `?${params.toString()}` : ''}`;

    // console.log('[Forum API] Fetching posts from:', url);
    // console.log('[Forum API] Headers:', getHeaders());

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    console.log('[Forum API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Forum API] Error response:', errorText);
      throw new Error(`Failed to fetch posts (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const result = await response.json();
    console.log('[Forum API] Posts fetched successfully:', result);
    return result;
  },

  // Get single post by ID
  async getPostById(id: string): Promise<ForumPost> {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    const result: ForumApiResponse<ForumPost> = await response.json();
    return result.data;
  },

  // Create new post
  async createPost(data: CreateForumPostRequest): Promise<ForumPost> {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    const result: ForumApiResponse<ForumPost> = await response.json();
    return result.data;
  },

  // Update post
  async updatePost(id: string, data: UpdateForumPostRequest): Promise<ForumPost> {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }

    const result: ForumApiResponse<ForumPost> = await response.json();
    return result.data;
  },

  // Delete post
  async deletePost(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
  },

  // Toggle like on post
  async toggleLikePost(id: string): Promise<{ is_liked: boolean; message: string }> {
    const response = await fetch(`${API_URL}/posts/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle like');
    }

    const result = await response.json();
    return result.data;
  },

  // ============ COMMENT APIs ============
  // Create comment on post
  async createComment(postId: string, data: CreateForumCommentRequest): Promise<ForumComment> {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }

    const result: ForumApiResponse<ForumComment> = await response.json();
    return result.data;
  },

  // Update comment
  async updateComment(id: string, content: string): Promise<ForumComment> {
    const response = await fetch(`${API_URL}/posts/comments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update comment');
    }

    const result: ForumApiResponse<ForumComment> = await response.json();
    return result.data;
  },

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/comments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
  },

  // ============ ADMIN APIs ============
  // Toggle pin post (ADMIN only)
  async togglePinPost(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/${id}/pin`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle pin');
    }
  },

  // Toggle lock post (ADMIN only)
  async toggleLockPost(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/${id}/lock`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle lock');
    }
  },
};
