import type { ListItem } from "../../src/app/list-item/list-items.service";

export const mockListItemDbTable = new Map<string, ListItem>();

export function getListItemsByOwner(userId: string) {
  return Array.from(mockListItemDbTable.values()).filter(
    ({ ownerId }) => ownerId === userId,
  );
}
