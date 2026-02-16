import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function KitchenDashboard() {
  const { data: orders } = useOrders(); // Should ideally filter by active only in hook
  const { mutate: updateStatus } = useUpdateOrderStatus();

  // Filter for relevant statuses
  const activeOrders = orders?.filter((order: any) => 
    ['pending', 'preparing'].includes(order.status)
  ).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="min-h-screen bg-neutral-100 p-8 dark:bg-neutral-900">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold">Kitchen Display System</h1>
        <div className="flex gap-4">
          <Badge variant="outline" className="text-lg px-4 py-1">Pending: {activeOrders?.filter((o:any) => o.status === 'pending').length}</Badge>
          <Badge variant="outline" className="text-lg px-4 py-1 bg-blue-100 text-blue-800 border-blue-200">Preparing: {activeOrders?.filter((o:any) => o.status === 'preparing').length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeOrders?.length === 0 && (
          <div className="col-span-full flex h-60 items-center justify-center text-2xl text-muted-foreground">
            All clear! No active orders.
          </div>
        )}

        {activeOrders?.map((order: any) => (
          <Card 
            key={order.id} 
            className={`flex flex-col overflow-hidden border-t-8 shadow-lg ${
              order.status === 'pending' ? 'border-t-yellow-500' : 'border-t-blue-500'
            }`}
          >
            <CardHeader className="bg-muted/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Table {order.table?.number}</CardTitle>
                <span className="text-sm font-mono text-muted-foreground">#{order.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 pt-4">
              <ul className="space-y-4">
                {order.items.map((item: any) => (
                  <li key={item.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">{item.quantity}x</span>
                        <span className="font-medium">{item.menuItem?.name}</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                          NOTE: {item.notes}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="bg-muted/20 p-4">
              {order.status === 'pending' ? (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  onClick={() => updateStatus({ id: order.id, status: 'preparing' })}
                >
                  Start Preparing
                </Button>
              ) : (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={() => updateStatus({ id: order.id, status: 'ready' })}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Mark Ready
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
