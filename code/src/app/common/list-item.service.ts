import { Injectable } from "@angular/core";
import type { User } from "./user";

export type ListItem = {
  id: string;
  ownerId: User["id"];
  bookId: string;
};

@Injectable({
  providedIn: "root",
})
export class ListItemService {}
