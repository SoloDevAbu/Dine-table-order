import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type User } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";

// Zod schema for login form
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json() as User;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      
      return await res.json() as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      
      // Redirect based on role
      switch (user.role) {
        case "admin": setLocation("/admin"); break;
        case "manager": setLocation("/manager"); break;
        case "kitchen": setLocation("/kitchen"); break;
        case "waiter": setLocation("/waiter"); break;
        default: setLocation("/");
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/login");
    },
  });
}
