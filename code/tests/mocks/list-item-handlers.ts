import type { ListItem } from "../../src/app/common/list-item.service";

export const mockListItemDbTable = new Map<string, ListItem>();

export function getListItemsByOwner(userId: string) {
  return Array.from(mockListItemDbTable.values()).filter(
    ({ ownerId }) => ownerId === userId,
  );
}
