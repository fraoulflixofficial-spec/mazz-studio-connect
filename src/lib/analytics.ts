import { ref, get, set, push, onValue, query, orderByChild, startAt, endAt, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { VisitorRecord, ProductViewRecord, Order } from '@/types';

// Generate a unique visitor ID using localStorage
export const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('mazze_visitor_id');
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('mazze_visitor_id', visitorId);
  }
  return visitorId;
};

// Get date string in YYYY-MM-DD format
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Track visitor
export const trackVisitor = async (): Promise<void> => {
  const visitorId = getVisitorId();
  const today = getDateString();
  const sessionKey = `mazze_visit_${today}`;
  
  // Only track once per day per visitor
  if (sessionStorage.getItem(sessionKey)) return;
  
  const visitRef = push(ref(database, 'analytics/visitors'));
  await set(visitRef, {
    visitorId,
    timestamp: Date.now(),
    date: today,
  });
  
  sessionStorage.setItem(sessionKey, 'true');
};

// Track product view
export const trackProductView = async (productId: string): Promise<void> => {
  const visitorId = getVisitorId();
  const today = getDateString();
  const viewKey = `mazze_view_${productId}_${today}`;
  
  // Only track once per product per day per visitor
  if (sessionStorage.getItem(viewKey)) return;
  
  const viewRef = push(ref(database, 'analytics/productViews'));
  await set(viewRef, {
    productId,
    visitorId,
    timestamp: Date.now(),
    date: today,
  });
  
  sessionStorage.setItem(viewKey, 'true');
};

// Date utility functions
export const getDateRanges = (periodStart?: string, periodEnd?: string) => {
  const now = new Date();
  const today = getDateString(now);
  
  // Last week (7 days ago to today)
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  // If period bounds are provided, use them for "current period" and calculate "last period"
  if (periodStart && periodEnd) {
    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodEnd);
    const periodDays = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Last period is the same duration before the current period
    const lastPeriodEnd = new Date(periodStartDate);
    lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);
    const lastPeriodStart = new Date(lastPeriodEnd);
    lastPeriodStart.setDate(lastPeriodStart.getDate() - periodDays + 1);
    
    return {
      today,
      lastWeekStart: getDateString(lastWeekStart),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      lastPeriodStart: getDateString(lastPeriodStart),
      lastPeriodEnd: getDateString(lastPeriodEnd),
    };
  }
  
  // Fallback to month-based calculation
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    today,
    lastWeekStart: getDateString(lastWeekStart),
    currentPeriodStart: getDateString(currentMonthStart),
    currentPeriodEnd: today,
    lastPeriodStart: getDateString(lastMonthStart),
    lastPeriodEnd: getDateString(lastMonthEnd),
  };
};

// Subscribe to visitor analytics with period filtering
export const subscribeToVisitorAnalytics = (
  callback: (data: { today: number; lastWeek: number; currentMonth: number; lastMonth: number }) => void,
  periodStart?: string,
  periodEnd?: string
) => {
  const visitorsRef = ref(database, 'analytics/visitors');
  
  return onValue(visitorsRef, (snapshot) => {
    const ranges = getDateRanges(periodStart, periodEnd);
    const data = { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 };
    
    if (!snapshot.exists()) {
      callback(data);
      return;
    }
    
    const visitors = snapshot.val();
    const uniqueToday = new Set<string>();
    const uniqueLastWeek = new Set<string>();
    const uniqueCurrentPeriod = new Set<string>();
    const uniqueLastPeriod = new Set<string>();
    
    Object.values(visitors).forEach((v: any) => {
      const date = v.date;
      
      // Only count data within the collection period
      if (periodStart && periodEnd) {
        if (date < periodStart || date > periodEnd) {
          // Skip data outside current period for current metrics
          // But still check last period
          if (date >= ranges.lastPeriodStart && date <= ranges.lastPeriodEnd) {
            uniqueLastPeriod.add(v.visitorId);
          }
          return;
        }
      }
      
      if (date === ranges.today) {
        uniqueToday.add(v.visitorId);
      }
      if (date >= ranges.lastWeekStart && date <= ranges.today) {
        uniqueLastWeek.add(v.visitorId);
      }
      if (date >= ranges.currentPeriodStart && date <= ranges.currentPeriodEnd) {
        uniqueCurrentPeriod.add(v.visitorId);
      }
      if (date >= ranges.lastPeriodStart && date <= ranges.lastPeriodEnd) {
        uniqueLastPeriod.add(v.visitorId);
      }
    });
    
    data.today = uniqueToday.size;
    data.lastWeek = uniqueLastWeek.size;
    data.currentMonth = uniqueCurrentPeriod.size;
    data.lastMonth = uniqueLastPeriod.size;
    
    callback(data);
  });
};

// Subscribe to product view analytics with period filtering
export const subscribeToProductViewAnalytics = (
  callback: (data: { 
    today: number; 
    lastWeek: number; 
    currentMonth: number; 
    lastMonth: number;
    mostViewedProductId: string | null;
    productViewCounts: Record<string, number>;
  }) => void,
  periodStart?: string,
  periodEnd?: string
) => {
  const viewsRef = ref(database, 'analytics/productViews');
  
  return onValue(viewsRef, (snapshot) => {
    const ranges = getDateRanges(periodStart, periodEnd);
    const data = { 
      today: 0, 
      lastWeek: 0, 
      currentMonth: 0, 
      lastMonth: 0,
      mostViewedProductId: null as string | null,
      productViewCounts: {} as Record<string, number>,
    };
    
    if (!snapshot.exists()) {
      callback(data);
      return;
    }
    
    const views = snapshot.val();
    const currentPeriodProductViews: Record<string, number> = {};
    
    Object.values(views).forEach((v: any) => {
      const date = v.date;
      
      // Only count data within the collection period for current metrics
      if (periodStart && periodEnd) {
        if (date < periodStart || date > periodEnd) {
          // Skip data outside current period for current metrics
          // But still check last period
          if (date >= ranges.lastPeriodStart && date <= ranges.lastPeriodEnd) {
            data.lastMonth++;
          }
          return;
        }
      }
      
      if (date === ranges.today) {
        data.today++;
      }
      if (date >= ranges.lastWeekStart && date <= ranges.today) {
        data.lastWeek++;
      }
      if (date >= ranges.currentPeriodStart && date <= ranges.currentPeriodEnd) {
        data.currentMonth++;
        // Track per-product views for current period
        currentPeriodProductViews[v.productId] = (currentPeriodProductViews[v.productId] || 0) + 1;
      }
      if (date >= ranges.lastPeriodStart && date <= ranges.lastPeriodEnd) {
        data.lastMonth++;
      }
    });
    
    // Find most viewed product of current period
    let maxViews = 0;
    Object.entries(currentPeriodProductViews).forEach(([productId, count]) => {
      if (count > maxViews) {
        maxViews = count;
        data.mostViewedProductId = productId;
      }
    });
    
    data.productViewCounts = currentPeriodProductViews;
    callback(data);
  });
};

// Calculate sales analytics from orders with period filtering
export const calculateSalesAnalytics = (orders: Order[], periodStart?: string, periodEnd?: string) => {
  const ranges = getDateRanges(periodStart, periodEnd);
  const data = {
    sales: { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 },
    revenue: { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 },
    topSoldProducts: [] as { productId: string; qty: number }[],
  };
  
  // Only count confirmed/completed orders
  const validOrders = orders.filter(o => 
    o.status !== 'placed' // All statuses except 'placed' are valid
  );
  
  const currentPeriodProductSales: Record<string, number> = {};
  
  validOrders.forEach((order) => {
    const orderDate = getDateString(new Date(order.createdAt));
    const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
    
    // Only count data within the collection period for current metrics
    if (periodStart && periodEnd) {
      if (orderDate < periodStart || orderDate > periodEnd) {
        // Skip data outside current period for current metrics
        // But still check last period
        if (orderDate >= ranges.lastPeriodStart && orderDate <= ranges.lastPeriodEnd) {
          data.sales.lastMonth += totalQty;
          data.revenue.lastMonth += order.total;
        }
        return;
      }
    }
    
    if (orderDate === ranges.today) {
      data.sales.today += totalQty;
      data.revenue.today += order.total;
    }
    if (orderDate >= ranges.lastWeekStart && orderDate <= ranges.today) {
      data.sales.lastWeek += totalQty;
      data.revenue.lastWeek += order.total;
    }
    if (orderDate >= ranges.currentPeriodStart && orderDate <= ranges.currentPeriodEnd) {
      data.sales.currentMonth += totalQty;
      data.revenue.currentMonth += order.total;
      // Track per-product sales for current period
      order.items.forEach((item) => {
        currentPeriodProductSales[item.productId] = (currentPeriodProductSales[item.productId] || 0) + item.qty;
      });
    }
    if (orderDate >= ranges.lastPeriodStart && orderDate <= ranges.lastPeriodEnd) {
      data.sales.lastMonth += totalQty;
      data.revenue.lastMonth += order.total;
    }
  });
  
  // Get top 5 sold products of current period
  data.topSoldProducts = Object.entries(currentPeriodProductSales)
    .map(([productId, qty]) => ({ productId, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  
  return data;
};

// Cleanup old analytics data (older than 60 days)
export const cleanupOldAnalytics = async (): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);
  const cutoffString = getDateString(cutoffDate);
  
  const visitorsRef = ref(database, 'analytics/visitors');
  const viewsRef = ref(database, 'analytics/productViews');
  
  const visitorsSnapshot = await get(visitorsRef);
  if (visitorsSnapshot.exists()) {
    const visitors = visitorsSnapshot.val();
    const deletions: Promise<void>[] = [];
    Object.entries(visitors).forEach(([key, v]: [string, any]) => {
      if (v.date < cutoffString) {
        deletions.push(remove(ref(database, `analytics/visitors/${key}`)));
      }
    });
    await Promise.all(deletions);
  }
  
  const viewsSnapshot = await get(viewsRef);
  if (viewsSnapshot.exists()) {
    const views = viewsSnapshot.val();
    const deletions: Promise<void>[] = [];
    Object.entries(views).forEach(([key, v]: [string, any]) => {
      if (v.date < cutoffString) {
        deletions.push(remove(ref(database, `analytics/productViews/${key}`)));
      }
    });
    await Promise.all(deletions);
  }
};
