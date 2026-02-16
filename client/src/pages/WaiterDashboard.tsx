import { useTables } from "@/hooks/use-tables";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Check, Clock, Coffee } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WaiterDashboard() {
  const { data: tables } = useTables();
  const { data: orders } = useOrders({ status: "ready" }); // Fetch ready orders to serve
  const { data: allOrders } = useOrders(); // Fetch all for table view
  const { mutate: updateStatus } = useUpdateOrderStatus();

  // Helper to get active order for a table
  const getTableStatus = (tableId: number) => {
    const activeOrder = allOrders?.find((o: any) => o.tableId === tableId && ['pending', 'preparing', 'ready', 'served'].includes(o.status));
    return activeOrder ? activeOrder.status : 'available';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Waiter Dashboard</h1>
        <div className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ready to Serve Column */}
        <div className="lg:col-span-1">
          <Card className="h-full border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-primary animate-pulse" />
                Ready to Serve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)]">
                {orders?.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    No orders ready
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order: any) => (
                      <Card key={order.id} className="bg-white dark:bg-card">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <span className="font-bold">Table {order.table?.number}</span>
                            <Badge>Ready</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="mb-4 text-sm text-muted-foreground">
                            {order.items.map((item: any) => (
                              <li key={item.id}>
                                {item.quantity}x {item.menuItem?.name}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => updateStatus({ id: order.id, status: "served" })}
                          >
                            Mark Served
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tables">
            <TabsList className="mb-4">
              <TabsTrigger value="tables">Table View</TabsTrigger>
              <TabsTrigger value="orders">All Active Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tables">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {tables?.map((table: any) => {
                  const status = getTableStatus(table.id);
                  const statusColors = {
                    available: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
                    pending: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
                    preparing: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
                    ready: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
                    served: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
                  };
                  
                  return (
                    <Card key={table.id} className={`border-2 transition-all ${statusColors[status as keyof typeof statusColors] || ""}`}>
                      <CardContent className="flex h-32 flex-col items-center justify-center p-4">
                        <span className="text-3xl font-bold">{table.number}</span>
                        <span className="mt-2 text-xs font-semibold uppercase">{status}</span>
                        <div className="mt-2 flex items-center text-xs opacity-60">
                          <Coffee className="mr-1 h-3 w-3" /> {table.capacity} Seats
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders?.filter((o: any) => o.status !== 'paid' && o.status !== 'cancelled').map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>Table {order.table?.number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(order.createdAt), "h:mm a")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(order.totalAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function BellIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
