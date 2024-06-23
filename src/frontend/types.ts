export type PostDTO = {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  created: string;
  myPost: boolean;
  creatorFollowed: boolean;
  responseToPostId: number | null;
  likeCount: number;
  responseCount: number;
  likedByMe: boolean;
};
