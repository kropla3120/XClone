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
