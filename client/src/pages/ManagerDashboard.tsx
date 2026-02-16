import { useStats } from "@/hooks/use-orders";
import { StatsCards } from "@/components/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerDashboard() {
  const { data: stats, isLoading } = useStats();

  // Mock chart data since the backend endpoint is simple currently
  const chartData = [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 900 },
    { name: 'Wed', revenue: 1600 },
    { name: 'Thu', revenue: 1400 },
    { name: 'Fri', revenue: 2400 },
    { name: 'Sat', revenue: 3200 },
    { name: 'Sun', revenue: 2800 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Overview of restaurant performance</p>
      </div>

      <StatsCards data={stats} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis prefix="$" />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.popularItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">{item.count} orders</span>
                </div>
              ))}
              {!stats && (
                 <div className="text-center text-muted-foreground py-10">Loading data...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
