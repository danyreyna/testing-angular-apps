import Dexie, { Table } from "dexie";
import type { User } from "../../src/app/common/user";

export type Session = {
  id: string;
  rollingExpiration: Date;
  absoluteExpiration: Date;
  userId: User["id"];
};

export type DbUser = Pick<User, "id" | "username" | "source"> & {
  passwordHash: string;
};

export class MockDb extends Dexie {
  sessions!: Table<Session, Session["id"]>;
  users!: Table<DbUser, DbUser["id"]>;

  constructor() {
    super("mockDatabase");

    this.version(1).stores({
      sessions: "id, userId",
      users: "id, &username, source",
    });
  }
}

export const mockDb = new MockDb();
