export type User = {
  id: string;
  username: string;
  password: string;
  source: "registration" | "test";
};

export type UserWithoutPassword = Pick<User, "id" | "username" | "source">;
