import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar, Sidebar } from "@/components/Navigation";

import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Login from "@/pages/Login";
import WaiterDashboard from "@/pages/WaiterDashboard";
import KitchenDashboard from "@/pages/KitchenDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useUser } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles: string[] }) {
  const { data: user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to login if not authorized
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  // Dashboard layout wrapper
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-muted/20">
        <Component />
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Home />
        </div>
      </Route>
      <Route path="/menu">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Menu />
        </div>
      </Route>
      <Route path="/login" component={Login} />

      {/* Protected Routes */}
      <Route path="/waiter">
        <ProtectedRoute component={WaiterDashboard} allowedRoles={["waiter", "manager", "admin"]} />
      </Route>
      <Route path="/kitchen">
        <ProtectedRoute component={KitchenDashboard} allowedRoles={["kitchen", "manager", "admin"]} />
      </Route>
      <Route path="/manager">
        <ProtectedRoute component={ManagerDashboard} allowedRoles={["manager", "admin"]} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
