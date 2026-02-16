import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { insertMenuItemSchema, insertCategorySchema } from "@shared/schema";

export function useMenu() {
  return useQuery({
    queryKey: [api.menu.list.path],
    queryFn: async () => {
      const res = await fetch(api.menu.list.path);
      if (!res.ok) throw new Error("Failed to fetch menu");
      return await res.json();
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [api.menu.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.menu.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertCategorySchema>) => {
      const res = await fetch(api.menu.categories.create.path, {
        method: api.menu.categories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.categories.list.path] });
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertMenuItemSchema>) => {
      // Ensure price is string for Decimal handling on backend, though Zod schema handles types
      const res = await fetch(api.menu.items.create.path, {
        method: api.menu.items.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<z.infer<typeof insertMenuItemSchema>>) => {
      const url = buildUrl(api.menu.items.update.path, { id });
      const res = await fetch(url, {
        method: api.menu.items.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update menu item");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.menu.items.delete.path, { id });
      const res = await fetch(url, { method: api.menu.items.delete.method });
      if (!res.ok) throw new Error("Failed to delete menu item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
    },
  });
}
