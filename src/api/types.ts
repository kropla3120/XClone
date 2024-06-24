export type LoginRequestDTO = {
  username: string;
  password: string;
};

export type UserSession = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export type UserShortDTO = {
  id: number;
  firstName: string;
  lastName: string;
};

export type UserDTO = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  followers: UserShortDTO[];
  following: UserShortDTO[];
};

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
  responseToPostId: number | null;
  likeCount: number;
  responseCount: number;
  likedByMe: boolean;
};
