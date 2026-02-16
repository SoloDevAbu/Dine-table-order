import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [guestName, setGuestName] = useState("");

  // Get table number from URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const tableId = parseInt(searchParams.get("table") || "0");

  const total = items.reduce((sum, item) => sum + (Number(item.menuItem.price) * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!tableId) {
      toast({
        title: "Table number missing",
        description: "Please scan a valid QR code or ask a waiter.",
        variant: "destructive",
      });
      return;
    }

    createOrder({
      tableId,
      guestName: guestName || "Guest",
      items: items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
    }, {
      onSuccess: () => {
        toast({
          title: "Order Placed!",
          description: "The kitchen has received your order.",
        });
        clearCart();
        setIsOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not place order. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (items.length === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-xl">
          <div className="relative">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
              {items.length}
            </span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your Order</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {items.map((item) => (
              <div key={item.uniqueId} className="mb-6 flex gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  {item.menuItem.imageUrl && (
                    <img 
                      src={item.menuItem.imageUrl} 
                      alt={item.menuItem.name} 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{item.menuItem.name}</h4>
                  <p className="text-sm text-muted-foreground">${Number(item.menuItem.price).toFixed(2)}</p>
                  {item.notes && <p className="text-xs text-muted-foreground italic">Note: {item.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.uniqueId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.uniqueId, -1)}
                      className="hover:text-primary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.uniqueId, 1)}
                      className="hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="space-y-4 pt-6">
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="guestName">Your Name (Optional)</Label>
            <Input 
              id="guestName" 
              placeholder="Enter your name" 
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between font-display text-xl font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <SheetFooter>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePlaceOrder}
              disabled={isPending}
            >
              {isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
