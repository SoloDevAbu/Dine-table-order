import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Utensils, TrendingUp } from "lucide-react";

interface StatsProps {
  data: {
    dailyRevenue: number;
    dailyOrders: number;
    popularItems: { name: string; count: number }[];
  } | undefined;
  isLoading: boolean;
}

export function StatsCards({ data, isLoading }: StatsProps) {
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
    </div>;
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${Number(data.dailyRevenue).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from yesterday
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.dailyOrders}</div>
          <p className="text-xs text-muted-foreground">
            +4% from yesterday
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Dish</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="truncate text-2xl font-bold">{data.popularItems[0]?.name || "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {data.popularItems[0]?.count || 0} orders today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
