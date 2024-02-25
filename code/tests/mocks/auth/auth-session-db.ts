import { mockDb, type AuthSession } from "../mock-db";

export async function deleteAuthSession(authSessionId: AuthSession["id"]) {
  try {
    await mockDb.authSessions.delete(authSessionId);
    return null;
  } catch (error) {
    return new Error(`Error deleting auth session with ID "${authSessionId}"`, {
      cause: error,
    });
  }
}

export async function addAuthSession(authSession: AuthSession) {
  try {
    await mockDb.authSessions.add(authSession);
    return null;
  } catch (error) {
    return new Error("Error adding auth session", {
      cause: error,
    });
  }
}

export async function getAuthSession(authSessionId: AuthSession["id"]) {
  try {
    return mockDb.authSessions.get(authSessionId);
  } catch (error) {
    return new Error(`Error getting auth session with ID "${authSessionId}"`, {
      cause: error,
    });
  }
}
