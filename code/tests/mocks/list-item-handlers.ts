import type { User } from "../../src/app/common/user";

export const mockListItemDbTable = new Map<
  string,
  { id: string; ownerId: User["id"]; bookId: string }
>();

export function getListItemsByOwner(userId: string) {
  return Array.from(mockListItemDbTable.values()).filter(
    ({ ownerId }) => ownerId === userId,
  );
}
