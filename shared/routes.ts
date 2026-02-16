
import { z } from 'zod';
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertMenuItemSchema, 
  insertTableSchema, 
  users, 
  categories, 
  menuItems, 
  tables, 
  orders,
  orderItems
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  menu: {
    list: {
      method: 'GET' as const,
      path: '/api/menu' as const,
      responses: {
        200: z.array(z.custom<typeof menuItems.$inferSelect & { category: typeof categories.$inferSelect | null }>()),
      },
    },
    items: {
      create: {
        method: 'POST' as const,
        path: '/api/menu/items' as const,
        input: insertMenuItemSchema,
        responses: {
          201: z.custom<typeof menuItems.$inferSelect>(),
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/menu/items/:id' as const,
        input: insertMenuItemSchema.partial(),
        responses: {
          200: z.custom<typeof menuItems.$inferSelect>(),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/menu/items/:id' as const,
        responses: {
          204: z.void(),
        },
      },
    },
    categories: {
      list: {
        method: 'GET' as const,
        path: '/api/categories' as const,
        responses: {
          200: z.array(z.custom<typeof categories.$inferSelect>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/categories' as const,
        input: insertCategorySchema,
        responses: {
          201: z.custom<typeof categories.$inferSelect>(),
        },
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        tableId: z.number(),
        guestName: z.string().optional(),
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number(),
          notes: z.string().optional(),
        })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      input: z.object({
        status: z.enum(["pending", "preparing", "ready", "served", "paid", "cancelled"]).optional(),
        tableId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect & { menuItem: typeof menuItems.$inferSelect | null })[]; table: typeof tables.$inferSelect | null }>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({
        status: z.enum(["pending", "preparing", "ready", "served", "paid", "cancelled"]),
      }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          dailyRevenue: z.number(),
          dailyOrders: z.number(),
          popularItems: z.array(z.object({
            name: z.string(),
            count: z.number(),
          })),
        }),
      },
    }
  },
  tables: {
    list: {
      method: 'GET' as const,
      path: '/api/tables' as const,
      responses: {
        200: z.array(z.custom<typeof tables.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tables/:id' as const,
      input: insertTableSchema.partial(),
      responses: {
        200: z.custom<typeof tables.$inferSelect>(),
      },
    }
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
