
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "manager", "kitchen", "waiter"] }).notNull().default("waiter"),
  name: text("name").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // stored as string in JS
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  ingredients: text("ingredients").array(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  capacity: integer("capacity").default(4),
  status: text("status", { enum: ["available", "occupied", "reserved"] }).default("available"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").references(() => tables.id),
  status: text("status", { enum: ["pending", "preparing", "ready", "served", "paid", "cancelled"] }).default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  guestName: text("guest_name"), // Optional for guest ordering
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  priceAtOrder: decimal("price_at_order", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  options: jsonb("options"), // For customizations
});

// === RELATIONS ===

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// Composite types for API responses
export type MenuItemWithCategory = MenuItem & { category: Category | null };
export type OrderWithItems = Order & { 
  items: (OrderItem & { menuItem: MenuItem | null })[];
  table: Table | null;
};

// Request types
export type CreateOrderRequest = {
  tableId: number;
  guestName?: string;
  items: {
    menuItemId: number;
    quantity: number;
    notes?: string;
    options?: any;
  }[];
};

export type UpdateOrderStatusRequest = {
  status: "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";
};
