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
