import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Utensils, LogOut, LayoutDashboard, Menu, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const cartItems = useCart(state => state.items);

  // If we are on a dashboard route, don't show the public navbar
  if (['/admin', '/manager', '/kitchen', '/waiter'].some(path => location.startsWith(path))) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="hidden font-display text-xl font-bold sm:inline-block">
            Gourmet Bistro
          </span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/menu">
              <Button variant={location === "/menu" ? "default" : "ghost"}>
                Order Now
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={
                  user.role === 'admin' ? '/admin' :
                  user.role === 'manager' ? '/manager' :
                  user.role === 'kitchen' ? '/kitchen' : '/waiter'
                }>
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">Staff Login</Button>
              </Link>
            )}
            
            {location.startsWith('/menu') && cartItems.length > 0 && (
               <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                 <ShoppingBag className="h-3 w-3" />
                 {cartItems.length}
               </Badge>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();

  if (!user) return null;

  const links = [
    { href: "/waiter", label: "Waiter View", icon: ShoppingBag, roles: ["waiter", "manager", "admin"] },
    { href: "/kitchen", label: "Kitchen Display", icon: Utensils, roles: ["kitchen", "manager", "admin"] },
    { href: "/manager", label: "Analytics", icon: LayoutDashboard, roles: ["manager", "admin"] },
    { href: "/admin", label: "Menu Admin", icon: Menu, roles: ["admin"] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user.role as string));

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2 font-display text-2xl font-bold text-primary">
        <Utensils className="h-8 w-8" />
        <span>BistroOS</span>
      </div>
      
      <div className="flex-1 space-y-2">
        {filteredLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button 
              variant={location === link.href ? "secondary" : "ghost"} 
              className="w-full justify-start text-lg"
            >
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
