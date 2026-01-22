/* eslint-disable @typescript-eslint/naming-convention */

// Category interfaces
export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    posts: number;
  };
}

// Post interfaces
export interface ForumPost {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: ForumCategory;
  _count: {
    likes: number;
    comments: number;
  };
  is_liked?: boolean;
  comments?: ForumComment[];
}

// Comment interfaces
export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  is_admin_reply?: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  replies?: ForumComment[];
}

// Request interfaces
export interface CreateForumPostRequest {
  category_id: string;
  title: string;
  content: string;
}

export interface UpdateForumPostRequest {
  title?: string;
  content?: string;
}

export interface CreateForumCommentRequest {
  content: string;
  parent_id?: string;
}

export interface GetForumPostsQuery {
  author_id?: string;
  category_id?: string;
  search?: string;
  is_pinned?: boolean;
  page?: number;
  limit?: number;
}

// Response interfaces
export interface ForumPostsResponse {
  status: number;
  message: string;
  data: ForumPost[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ForumApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
