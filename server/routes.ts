
import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertMenuItemSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth setup
  setupAuth(app);

  // === Menu Routes ===
  app.get(api.menu.list.path, async (req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.get(api.menu.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Protected Admin Routes
  app.post(api.menu.items.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.createMenuItem(req.body);
    res.status(201).json(item);
  });

  app.put(api.menu.items.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.updateMenuItem(Number(req.params.id), req.body);
    res.json(item);
  });

  app.delete(api.menu.items.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteMenuItem(Number(req.params.id));
    res.sendStatus(204);
  });

  app.post(api.menu.categories.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  // === Order Routes ===
  app.post(api.orders.create.path, async (req, res) => {
    const { tableId, items, guestName } = req.body;
    
    // Calculate total
    let total = 0;
    const menuItems = await storage.getMenuItems();
    
    for (const item of items) {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (menuItem) {
        total += Number(menuItem.price) * item.quantity;
      }
    }

    const order = await storage.createOrder({
      tableId,
      guestName,
      totalAmount: total.toString(),
      status: 'pending'
    }, items);

    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req, res) => {
    // Allow public access for tracking? Or just staff?
    // For now, let's keep it open or check auth depending on requirements.
    // The prompt implies a dashboard for waiters/kitchen, so likely protected.
    // BUT customer needs to track status... let's check query params.
    
    const status = req.query.status as string;
    const tableId = req.query.tableId ? Number(req.query.tableId) : undefined;
    
    const orders = await storage.getOrders({ status, tableId });
    res.json(orders);
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.updateOrderStatus(Number(req.params.id), req.body.status);
    res.json(order);
  });

  // === Stats & Tables ===
  app.get(api.tables.list.path, async (req, res) => {
    const tables = await storage.getTables();
    res.json(tables);
  });

  app.get(api.orders.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const dailyStats = await storage.getDailyStats();
    const popularItems = await storage.getPopularItems();
    
    res.json({
      dailyRevenue: dailyStats.revenue,
      dailyOrders: dailyStats.count,
      popularItems
    });
  });
  
  // Seed data endpoint (dev only)
  app.post('/api/seed', async (req, res) => {
    await seedDatabase();
    res.json({ message: "Database seeded" });
  });

  return httpServer;
}

async function seedDatabase() {
  // Check if users exist
  const existingUser = await storage.getUserByUsername("manager@test.com");
  if (existingUser) return;

  // Create Users
  await storage.createUser({
    username: "manager@test.com",
    password: "demo123", // In real app, hash this!
    role: "manager",
    name: "Manager Mike"
  });

  await storage.createUser({
    username: "waiter@test.com",
    password: "demo123",
    role: "waiter",
    name: "Waiter Will"
  });

  await storage.createUser({
    username: "kitchen@test.com",
    password: "demo123",
    role: "kitchen",
    name: "Chef Chris"
  });
  
  await storage.createUser({
    username: "admin",
    password: "password",
    role: "admin",
    name: "Admin User"
  });

  // Create Tables
  for (let i = 1; i <= 10; i++) {
    await storage.createTable({
      number: i,
      capacity: i % 2 === 0 ? 4 : 2,
      status: "available"
    });
  }

  // Create Categories
  const starters = await storage.createCategory({ name: "Starters", slug: "starters", sortOrder: 1 });
  const mains = await storage.createCategory({ name: "Mains", slug: "mains", sortOrder: 2 });
  const drinks = await storage.createCategory({ name: "Drinks", slug: "drinks", sortOrder: 3 });

  // Create Menu Items
  await storage.createMenuItem({
    categoryId: starters.id,
    name: "Bruschetta",
    description: "Toasted bread with tomatoes, basil, and olive oil",
    price: "8.50",
    imageUrl: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=500&q=80",
    isAvailable: true,
    ingredients: ["Bread", "Tomato", "Basil", "Olive Oil"]
  });

  await storage.createMenuItem({
    categoryId: mains.id,
    name: "Margherita Pizza",
    description: "Classic tomato and mozzarella pizza",
    price: "14.00",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    isAvailable: true,
    ingredients: ["Dough", "Tomato Sauce", "Mozzarella"]
  });
  
  await storage.createMenuItem({
    categoryId: mains.id,
    name: "Cheeseburger",
    description: "Beef patty with cheddar, lettuce, and tomato",
    price: "16.50",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    isAvailable: true,
    ingredients: ["Cheddar", "Bun", "Lettuce", "Tomato"]
  });

  await storage.createMenuItem({
    categoryId: drinks.id,
    name: "Fresh Lemonade",
    description: "Homemade sparkling lemonade",
    price: "4.50",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    isAvailable: true,
    ingredients: ["Lemon", "Sugar", "Water", "Mint"]
  });
}
