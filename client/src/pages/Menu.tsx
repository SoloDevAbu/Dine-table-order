import { useMenu, useCategories } from "@/hooks/use-menu";
import { MenuGrid } from "@/components/MenuGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { MenuItemWithCategory } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Menu() {
  const { data: menuItems, isLoading: isMenuLoading } = useMenu();
  const { data: categories, isLoading: isCatsLoading } = useCategories();
  
  // Get table number from query params
  const searchParams = new URLSearchParams(window.location.search);
  const tableId = searchParams.get("table");

  if (isMenuLoading || isCatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Group items by category
  const groupedItems = categories?.reduce((acc: any, cat: any) => {
    acc[cat.name] = menuItems?.filter((item: MenuItemWithCategory) => item.categoryId === cat.id) || [];
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary/30 py-12">
        <div className="container text-center">
          <h1 className="mb-4 font-display text-4xl font-bold">Our Menu</h1>
          {tableId && (
            <p className="text-muted-foreground">Ordering for Table {tableId}</p>
          )}
        </div>
      </div>

      <div className="container mt-8">
        <Tabs defaultValue={categories?.[0]?.name} className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-center gap-2 bg-transparent">
            {categories?.map((cat: any) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.name}
                className="rounded-full px-6 py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories?.map((cat: any) => (
            <TabsContent key={cat.id} value={cat.name}>
              <MenuGrid items={groupedItems[cat.name]} category={cat.name} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <CartDrawer />
    </div>
  );
}
