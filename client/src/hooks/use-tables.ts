import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertTableSchema } from "@shared/schema";
import { z } from "zod";

export function useTables() {
  return useQuery({
    queryKey: [api.tables.list.path],
    queryFn: async () => {
      const res = await fetch(api.tables.list.path);
      if (!res.ok) throw new Error("Failed to fetch tables");
      return await res.json();
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<z.infer<typeof insertTableSchema>>) => {
      const url = buildUrl(api.tables.update.path, { id });
      const res = await fetch(url, {
        method: api.tables.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update table");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tables.list.path] });
    },
  });
}
