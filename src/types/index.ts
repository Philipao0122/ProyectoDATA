export interface Topic {
  id: string;
  title: string;
  faculty: string;
  type: string;
  icon: string;
  description: string;
  upvotes: number;
  comments: number;
}

export interface Faculty {
  id: string;
  name: string;
}