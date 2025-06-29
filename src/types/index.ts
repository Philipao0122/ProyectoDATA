export interface Topic {
  id: string;
  title: string;
  description: string;
  faculty: {
    code: string;
    name: string;
    color: string;
  };
  type: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
  actions: {
    view_url: string;
    download_url: string;
    comment_enabled: boolean;
    share_enabled: boolean;
  };
  upvotes: number;
  downvotes: number;
  comments: number;
  views: number;
  summary: string;
  content?: string;
  icon?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  related_topics?: string[];
  metadata?: {
    [key: string]: any;
  };
}

export interface Faculty {
  id: string;
  name: string;
}