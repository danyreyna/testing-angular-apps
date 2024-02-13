export type User = {
  id: string;
  username: string;
  password: string;
  source: "registration" | "test";
};
