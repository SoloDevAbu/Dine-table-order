
import { db } from "./db";
import {
  users, categories, menuItems, tables, orders, orderItems,
  type User, type InsertUser,
  type Category, type MenuItem, type Table, type Order, type OrderItem
} from "@shared/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Menu
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, "id">): Promise<Category>;
  
  getMenuItems(): Promise<(MenuItem & { category: Category | null })[]>;
  createMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Tables
  getTables(): Promise<Table[]>;
  createTable(table: Omit<Table, "id">): Promise<Table>;
  updateTable(id: number, table: Partial<Table>): Promise<Table>;

  // Orders
  createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">, items: any[]): Promise<Order>;
  getOrders(filters?: { status?: string; tableId?: number }): Promise<(Order & { items: (OrderItem & { menuItem: MenuItem | null })[]; table: Table | null })[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Stats
  getDailyStats(): Promise<{ revenue: number; count: number }>;
  getPopularItems(): Promise<{ name: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Menu
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  }

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getMenuItems(): Promise<(MenuItem & { category: Category | null })[]> {
    return await db.query.menuItems.findMany({
      with: {
        category: true
      }
    });
  }

  async createMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem> {
    const [updated] = await db.update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables).orderBy(tables.number);
  }

  async createTable(table: Omit<Table, "id">): Promise<Table> {
    const [newTable] = await db.insert(tables).values(table).returning();
    return newTable;
  }

  async updateTable(id: number, table: Partial<Table>): Promise<Table> {
    const [updated] = await db.update(tables).set(table).where(eq(tables.id, id)).returning();
    return updated;
  }

  // Orders
  async createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">, items: any[]): Promise<Order> {
    // Start transaction
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(orderData).returning();
      
      for (const item of items) {
        // Get current price
        const [menuItem] = await tx.select().from(menuItems).where(eq(menuItems.id, item.menuItemId));
        
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceAtOrder: menuItem.price,
          notes: item.notes,
        });
      }

      // Update table status if applicable
      if (orderData.tableId) {
        await tx.update(tables).set({ status: 'occupied' }).where(eq(tables.id, orderData.tableId));
      }

      return newOrder;
    });
  }

  async getOrders(filters?: { status?: string; tableId?: number }): Promise<(Order & { items: (OrderItem & { menuItem: MenuItem | null })[]; table: Table | null })[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(orders.status, filters.status as any));
    if (filters?.tableId) conditions.push(eq(orders.tableId, filters.tableId));

    return await db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        items: {
          with: {
            menuItem: true
          }
        },
        table: true
      },
      orderBy: [desc(orders.createdAt)]
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
      
    // If order is paid/served/cancelled, maybe free up table? 
    // Kept simple for now.
    return updated;
  }

  // Stats
  async getDailyStats(): Promise<{ revenue: number; count: number }> {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const result = await db.select({
      revenue: sql<number>`sum(${orders.totalAmount})`,
      count: sql<number>`count(*)`
    })
    .from(orders)
    .where(gte(orders.createdAt, today));
    
    return {
      revenue: Number(result[0]?.revenue || 0),
      count: Number(result[0]?.count || 0)
    };
  }

  async getPopularItems(): Promise<{ name: string; count: number }[]> {
    const result = await db.select({
      name: menuItems.name,
      count: sql<number>`sum(${orderItems.quantity})`
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .groupBy(menuItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);
    
    return result.map(r => ({
      name: r.name,
      count: Number(r.count)
    }));
  }
}

export const storage = new DatabaseStorage();
