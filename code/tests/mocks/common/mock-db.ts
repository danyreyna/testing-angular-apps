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

/*
 * Mainly used by `auth` and `user` handlers to persist sessions across page refreshes.
 * In the request handlers used in your regular tests, you can:
 *   - Directly return an HTTP response and not store anything at all.
 *   - Use a `Map`.
 *   - Use this mock db.
 */
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
