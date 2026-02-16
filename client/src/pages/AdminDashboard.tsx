import { useMenu, useCreateMenuItem, useDeleteMenuItem } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMenuItemSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MenuItemWithCategory } from "@shared/schema";

export default function AdminDashboard() {
  const { data: menuItems } = useMenu();
  const { mutate: deleteItem } = useDeleteMenuItem();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Menu Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Menu Item</DialogTitle>
            </DialogHeader>
            <CreateItemForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems?.map((item: MenuItemWithCategory) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category?.name || "Uncategorized"}</TableCell>
                <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateItemForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createItem, isPending } = useCreateMenuItem();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      categoryId: 1, // Default to first category for simplicity
      imageUrl: "",
      isAvailable: true,
    }
  });

  const onSubmit = (data: any) => {
    // Need to coerce types because form values are strings
    createItem({
      ...data,
      categoryId: Number(data.categoryId),
      price: data.price, // Sent as string/decimal
    }, {
      onSuccess: () => {
        toast({ title: "Item Created" });
        onSuccess();
      },
      onError: () => toast({ title: "Failed to create", variant: "destructive" }),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" {...form.register("name")} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...form.register("price")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category ID</Label>
          <Input id="categoryId" type="number" {...form.register("categoryId")} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (Unsplash)</Label>
        <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://..." />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Item"}
      </Button>
    </form>
  );
}
