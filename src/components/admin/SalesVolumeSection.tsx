import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, Order } from '@/types';
import { calculateSalesAnalytics, getDateString } from '@/lib/analytics';
import { formatPrice } from '@/lib/helpers';
import { ShoppingBag, DollarSign, Flame, TrendingUp } from 'lucide-react';
import { DataCollectionPeriod } from './DataCollectionPeriod';

interface SalesVolumeSectionProps {
  products: Product[];
  orders: Order[];
}

interface MetricCardProps {
  title: string;
  today: number | string;
  lastWeek: number | string;
  currentMonth: number | string;
  lastMonth: number | string;
  icon: React.ReactNode;
  isCurrency?: boolean;
}

const MetricCard = ({ title, today, lastWeek, currentMonth, lastMonth, icon, isCurrency }: MetricCardProps) => {
  const format = (val: number | string) => {
    if (typeof val === 'string') return val;
    return isCurrency ? formatPrice(val) : val.toLocaleString();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Today</p>
          <p className={`font-bold text-foreground ${isCurrency ? 'text-lg' : 'text-xl'}`}>{format(today)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Last 7 Days</p>
          <p className={`font-bold text-foreground ${isCurrency ? 'text-lg' : 'text-xl'}`}>{format(lastWeek)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">This Period</p>
          <p className={`font-bold text-foreground ${isCurrency ? 'text-lg' : 'text-xl'}`}>{format(currentMonth)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Last Period</p>
          <p className={`font-bold text-foreground ${isCurrency ? 'text-lg' : 'text-xl'}`}>{format(lastMonth)}</p>
        </div>
      </div>
    </div>
  );
};

export function SalesVolumeSection({ products, orders }: SalesVolumeSectionProps) {
  const [period, setPeriod] = useState<{ startDate: Date; endDate: Date } | null>(null);

  const handlePeriodChange = useCallback((startDate: Date, endDate: Date) => {
    setPeriod({ startDate, endDate });
  }, []);

  const analytics = useMemo(() => {
    if (!period) return null;
    return calculateSalesAnalytics(orders, getDateString(period.startDate), getDateString(period.endDate));
  }, [orders, period]);

  const topProducts = useMemo(() => {
    if (!analytics) return [];
    return analytics.topSoldProducts
      .map(({ productId, qty }) => {
        const product = products.find(p => p.id === productId);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as { product: Product; qty: number }[];
  }, [analytics?.topSoldProducts, products]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent" />
        Sales Volume
      </h2>

      {/* Data Collection Period with Countdown */}
      <DataCollectionPeriod onPeriodChange={handlePeriodChange} />
      
      {analytics && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              title="Sales Data"
              today={analytics.sales.today}
              lastWeek={analytics.sales.lastWeek}
              currentMonth={analytics.sales.currentMonth}
              lastMonth={analytics.sales.lastMonth}
              icon={<ShoppingBag className="w-5 h-5" />}
            />
            
            <MetricCard
              title="Revenue Data"
              today={analytics.revenue.today}
              lastWeek={analytics.revenue.lastWeek}
              currentMonth={analytics.revenue.currentMonth}
              lastMonth={analytics.revenue.lastMonth}
              icon={<DollarSign className="w-5 h-5" />}
              isCurrency
            />
          </div>

          {/* Top 5 Most Sold Products */}
          <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Most Sold Products</h3>
                <p className="text-xs text-muted-foreground">Top 5 This Period</p>
              </div>
            </div>
            
            {topProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {topProducts.map(({ product, qty }, index) => (
                  <div 
                    key={product.id} 
                    className="relative bg-gradient-to-b from-accent/5 to-transparent rounded-xl p-3 border border-border/50"
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <img
                      src={product.images[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <h4 className="text-xs font-medium text-foreground truncate">{product.name}</h4>
                    <p className="text-xs text-accent">{qty} sold</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No sales recorded yet this period</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
