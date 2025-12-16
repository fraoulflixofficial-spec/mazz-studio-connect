import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { subscribeToVisitorAnalytics, subscribeToProductViewAnalytics } from '@/lib/analytics';
import { Users, Eye, TrendingUp, Award } from 'lucide-react';

interface AnalyticsSectionProps {
  products: Product[];
}

interface MetricCardProps {
  title: string;
  today: number;
  lastWeek: number;
  currentMonth: number;
  lastMonth: number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, today, lastWeek, currentMonth, lastMonth, icon }: MetricCardProps) => (
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
        <p className="text-xl font-bold text-foreground">{today.toLocaleString()}</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">Last 7 Days</p>
        <p className="text-xl font-bold text-foreground">{lastWeek.toLocaleString()}</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">This Month</p>
        <p className="text-xl font-bold text-foreground">{currentMonth.toLocaleString()}</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">Last Month</p>
        <p className="text-xl font-bold text-foreground">{lastMonth.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

export function AnalyticsSection({ products }: AnalyticsSectionProps) {
  const [visitorData, setVisitorData] = useState({
    today: 0,
    lastWeek: 0,
    currentMonth: 0,
    lastMonth: 0,
  });
  
  const [productViewData, setProductViewData] = useState({
    today: 0,
    lastWeek: 0,
    currentMonth: 0,
    lastMonth: 0,
    mostViewedProductId: null as string | null,
    productViewCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    const unsub1 = subscribeToVisitorAnalytics(setVisitorData);
    const unsub2 = subscribeToProductViewAnalytics(setProductViewData);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const mostViewedProduct = products.find(p => p.id === productViewData.mostViewedProductId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent" />
        Analysis
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Visitor's Data"
          today={visitorData.today}
          lastWeek={visitorData.lastWeek}
          currentMonth={visitorData.currentMonth}
          lastMonth={visitorData.lastMonth}
          icon={<Users className="w-5 h-5" />}
        />
        
        <MetricCard
          title="Product Views"
          today={productViewData.today}
          lastWeek={productViewData.lastWeek}
          currentMonth={productViewData.currentMonth}
          lastMonth={productViewData.lastMonth}
          icon={<Eye className="w-5 h-5" />}
        />
      </div>

      {/* Most Viewed Product */}
      <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Most Viewed Product</h3>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>
        
        {mostViewedProduct ? (
          <div className="flex items-center gap-4 bg-gradient-to-r from-accent/10 to-transparent rounded-xl p-4">
            <img
              src={mostViewedProduct.images[0] || '/placeholder.svg'}
              alt={mostViewedProduct.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{mostViewedProduct.name}</h4>
              <p className="text-sm text-accent">{mostViewedProduct.featuredCategory}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {productViewData.productViewCounts[mostViewedProduct.id] || 0} views this month
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No product views recorded yet this month</p>
          </div>
        )}
      </div>
    </div>
  );
}
