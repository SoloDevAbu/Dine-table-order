import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MenuGridProps {
  items: MenuItem[];
  category: string;
}

export function MenuGrid({ items, category }: MenuGridProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, quantity, notes);
      toast({
        title: "Added to cart",
        description: `${quantity}x ${selectedItem.name} added.`,
      });
      setSelectedItem(null);
      setNotes("");
      setQuantity(1);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-6 font-display text-3xl font-bold text-foreground">{category}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:shadow-lg">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
                <span className="font-semibold text-primary">${Number(item.price).toFixed(2)}</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.ingredients.slice(0, 3).map((ing) => (
                    <Badge key={ing} variant="outline" className="text-[10px]">{ing}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => setSelectedItem(item)}
                disabled={!item.isAvailable}
              >
                <Plus className="mr-2 h-4 w-4" />
                {item.isAvailable ? "Add to Order" : "Sold Out"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <span className="text-lg">-</span>
                </Button>
                <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <span className="text-lg">+</span>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea 
                id="notes" 
                placeholder="No onions, extra spicy, etc..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleAddToCart} className="w-full sm:w-auto">
              Add to Order - ${(Number(selectedItem?.price || 0) * quantity).toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
