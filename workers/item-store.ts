import { DurableObject } from "cloudflare:workers";

interface ItemStoreEnv {}

export interface Item extends Record<string, SqlStorageValue> {
  id: number;
  title: string;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
}

export class ItemStore extends DurableObject<ItemStoreEnv> {
  constructor(ctx: DurableObjectState, env: ItemStoreEnv) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  list(): Item[] {
    return this.ctx.storage.sql.exec<Item>(
      "SELECT id, title, status, created_at AS createdAt FROM items ORDER BY id DESC",
    ).toArray();
  }

  create(title: string): Item {
    return this.ctx.storage.sql.exec<Item>(
      "INSERT INTO items (title) VALUES (?) RETURNING id, title, status, created_at AS createdAt",
      title,
    ).one();
  }

  updateStatus(id: number, status: Item["status"]): void {
    this.ctx.storage.sql.exec("UPDATE items SET status = ? WHERE id = ?", status, id);
  }

  remove(id: number): void {
    this.ctx.storage.sql.exec("DELETE FROM items WHERE id = ?", id);
  }
}
