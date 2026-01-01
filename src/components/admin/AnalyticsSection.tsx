import { useState, useEffect, useCallback } from 'react';
import { Product, Offer } from '@/types';
import { subscribeToVisitorAnalytics, subscribeToProductViewAnalytics, getDateString } from '@/lib/analytics';
import { Users, Eye, TrendingUp, Award, Gift } from 'lucide-react';
import { DataCollectionPeriod } from './DataCollectionPeriod';

interface AnalyticsSectionProps {
  products: Product[];
  offers?: Offer[];
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
        <p className="text-xs text-muted-foreground mb-1">This Period</p>
        <p className="text-xl font-bold text-foreground">{currentMonth.toLocaleString()}</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">Last Period</p>
        <p className="text-xl font-bold text-foreground">{lastMonth.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

export function AnalyticsSection({ products, offers = [] }: AnalyticsSectionProps) {
  const [period, setPeriod] = useState<{ startDate: Date; endDate: Date } | null>(null);
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

  const handlePeriodChange = useCallback((startDate: Date, endDate: Date) => {
    setPeriod({ startDate, endDate });
  }, []);

  useEffect(() => {
    if (!period) return;
    
    const periodStart = getDateString(period.startDate);
    const periodEnd = getDateString(period.endDate);
    
    const unsub1 = subscribeToVisitorAnalytics(setVisitorData, periodStart, periodEnd);
    const unsub2 = subscribeToProductViewAnalytics(setProductViewData, periodStart, periodEnd);
    
    return () => {
      unsub1();
      unsub2();
    };
  }, [period]);

  // Check both products and offers for most viewed item
  const mostViewedProduct = products.find(p => p.id === productViewData.mostViewedProductId);
  const mostViewedOffer = offers.find(o => o.id === productViewData.mostViewedProductId);
  const isOfferMostViewed = !mostViewedProduct && !!mostViewedOffer;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent" />
        Analysis
      </h2>

      {/* Data Collection Period with Countdown */}
      <DataCollectionPeriod onPeriodChange={handlePeriodChange} />
      
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
            {isOfferMostViewed ? <Gift className="w-5 h-5" /> : <Award className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-medium text-foreground">Most Viewed {isOfferMostViewed ? 'Offer' : 'Product'}</h3>
            <p className="text-xs text-muted-foreground">Current Period</p>
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
                {productViewData.productViewCounts[mostViewedProduct.id] || 0} views this period
              </p>
            </div>
          </div>
        ) : mostViewedOffer ? (
          <div className="flex items-center gap-4 bg-gradient-to-r from-accent/10 to-transparent rounded-xl p-4">
            <div className="relative">
              <img
                src={mostViewedOffer.images?.[0] || '/placeholder.svg'}
                alt={mostViewedOffer.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <Gift className="w-3 h-3 text-accent-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{mostViewedOffer.title}</h4>
              <p className="text-sm text-accent">Special Offer</p>
              <p className="text-xs text-muted-foreground mt-1">
                {productViewData.productViewCounts[mostViewedOffer.id] || 0} views this period
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No product views recorded yet this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
