export type PostDTO = {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  created: string;
};
export type CommentDTO = {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  postId: number;
  created: string;
};
