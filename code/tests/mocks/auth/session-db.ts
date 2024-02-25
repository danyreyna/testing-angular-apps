import { mockDb, type Session } from "../mock-db";

export async function deleteSession(sessionId: Session["id"]) {
  try {
    await mockDb.sessions.delete(sessionId);
    return null;
  } catch (error) {
    return new Error(`Error deleting session with ID "${sessionId}"`, {
      cause: error,
    });
  }
}

export async function addSession(session: Session) {
  try {
    await mockDb.sessions.add(session);
    return null;
  } catch (error) {
    return new Error("Error adding session", {
      cause: error,
    });
  }
}

export async function getSession(sessionId: Session["id"]) {
  try {
    return mockDb.sessions.get(sessionId);
  } catch (error) {
    return new Error(`Error getting session with ID "${sessionId}"`, {
      cause: error,
    });
  }
}
