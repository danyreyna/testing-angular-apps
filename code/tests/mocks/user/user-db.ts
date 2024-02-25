import { type DbUser, mockDb } from "../mock-db";

export async function findByUsername(
  username: DbUser["username"],
): Promise<Error | undefined | DbUser> {
  try {
    const [user] = await mockDb.users.where({ username }).toArray();

    return user;
  } catch (error) {
    return new Error(`Error getting user with username "${username}"`, {
      cause: error,
    });
  }
}

export async function getUser(userId: DbUser["id"]) {
  try {
    return mockDb.users.get(userId);
  } catch (error) {
    return new Error(`Error getting user with ID "${userId}"`, {
      cause: error,
    });
  }
}

export async function deleteUsersWithSource(source: DbUser["source"]) {
  try {
    return mockDb.users.where({ source }).delete();
  } catch (error) {
    return new Error(`Error deleting users with source "${source}"`, {
      cause: error,
    });
  }
}

export async function addUser(user: DbUser) {
  try {
    await mockDb.users.add(user);
    return null;
  } catch (error) {
    return new Error("Error adding user", {
      cause: error,
    });
  }
}
