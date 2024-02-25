import Dexie, { Table } from "dexie";
import type { User } from "../../../src/app/common/user";

export type AuthSession = {
  id: string;
  rollingExpiration: Date;
  absoluteExpiration: Date;
  userId: User["id"];
};

export type DbUser = Pick<User, "id" | "username" | "source"> & {
  passwordHash: string;
};

// Used by `auth` and `user` handlers to not lose stored sessions across page refreshes.
export class MockDb extends Dexie {
  authSessions!: Table<AuthSession, AuthSession["id"]>;
  users!: Table<DbUser, DbUser["id"]>;

  constructor() {
    super("mockDatabase");

    this.version(1).stores({
      authSessions: "id, userId",
      users: "id, &username, source",
    });
  }
}

export const mockDb = new MockDb();
