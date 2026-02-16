import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateOrderRequest, type UpdateOrderStatusRequest } from "@shared/routes";

// Poll interval for real-time feel (5 seconds)
const POLL_INTERVAL = 5000;

export function useOrders(params?: { status?: string, tableId?: number }) {
  // Build query string manually since we don't have a complex query builder
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.tableId) queryParams.append("tableId", String(params.tableId));
  
  const queryString = queryParams.toString();
  const url = `${api.orders.list.path}${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: [api.orders.list.path, params],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    },
    refetchInterval: POLL_INTERVAL,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create order");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & UpdateOrderStatusRequest) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.orders.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.orders.stats.path],
    queryFn: async () => {
      const res = await fetch(api.orders.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    },
  });
}
