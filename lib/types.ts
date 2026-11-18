export type Post = {
  id: string;
  user_id: string | null;
  body: string | null;
  author_name: string;
  image_url: string | null;
  created_at: string;
};
