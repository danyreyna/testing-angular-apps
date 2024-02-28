import type { Table, Transaction, TransactionMode } from "dexie";
import { mockDb } from "./mock-db";

export async function dbTransaction<TReturnType>(
  mode: TransactionMode,
  tables: Table[],
  callback: (transaction: Transaction) => PromiseLike<TReturnType>,
) {
  try {
    return await mockDb.transaction(mode, tables, callback);
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error(`Error in Dexie transaction: ${JSON.stringify(error)}`);
  }
}
