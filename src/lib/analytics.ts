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
export const getDateRanges = () => {
  const now = new Date();
  const today = getDateString(now);
  
  // Last week (7 days ago to today)
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  // Current month (1st of current month)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    today,
    lastWeekStart: getDateString(lastWeekStart),
    currentMonthStart: getDateString(currentMonthStart),
    lastMonthStart: getDateString(lastMonthStart),
    lastMonthEnd: getDateString(lastMonthEnd),
  };
};

// Subscribe to visitor analytics
export const subscribeToVisitorAnalytics = (
  callback: (data: { today: number; lastWeek: number; currentMonth: number; lastMonth: number }) => void
) => {
  const visitorsRef = ref(database, 'analytics/visitors');
  
  return onValue(visitorsRef, (snapshot) => {
    const ranges = getDateRanges();
    const data = { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 };
    
    if (!snapshot.exists()) {
      callback(data);
      return;
    }
    
    const visitors = snapshot.val();
    const uniqueToday = new Set<string>();
    const uniqueLastWeek = new Set<string>();
    const uniqueCurrentMonth = new Set<string>();
    const uniqueLastMonth = new Set<string>();
    
    Object.values(visitors).forEach((v: any) => {
      const date = v.date;
      
      if (date === ranges.today) {
        uniqueToday.add(v.visitorId);
      }
      if (date >= ranges.lastWeekStart && date <= ranges.today) {
        uniqueLastWeek.add(v.visitorId);
      }
      if (date >= ranges.currentMonthStart && date <= ranges.today) {
        uniqueCurrentMonth.add(v.visitorId);
      }
      if (date >= ranges.lastMonthStart && date <= ranges.lastMonthEnd) {
        uniqueLastMonth.add(v.visitorId);
      }
    });
    
    data.today = uniqueToday.size;
    data.lastWeek = uniqueLastWeek.size;
    data.currentMonth = uniqueCurrentMonth.size;
    data.lastMonth = uniqueLastMonth.size;
    
    callback(data);
  });
};

// Subscribe to product view analytics
export const subscribeToProductViewAnalytics = (
  callback: (data: { 
    today: number; 
    lastWeek: number; 
    currentMonth: number; 
    lastMonth: number;
    mostViewedProductId: string | null;
    productViewCounts: Record<string, number>;
  }) => void
) => {
  const viewsRef = ref(database, 'analytics/productViews');
  
  return onValue(viewsRef, (snapshot) => {
    const ranges = getDateRanges();
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
    const currentMonthProductViews: Record<string, number> = {};
    
    Object.values(views).forEach((v: any) => {
      const date = v.date;
      
      if (date === ranges.today) {
        data.today++;
      }
      if (date >= ranges.lastWeekStart && date <= ranges.today) {
        data.lastWeek++;
      }
      if (date >= ranges.currentMonthStart && date <= ranges.today) {
        data.currentMonth++;
        // Track per-product views for current month
        currentMonthProductViews[v.productId] = (currentMonthProductViews[v.productId] || 0) + 1;
      }
      if (date >= ranges.lastMonthStart && date <= ranges.lastMonthEnd) {
        data.lastMonth++;
      }
    });
    
    // Find most viewed product of current month
    let maxViews = 0;
    Object.entries(currentMonthProductViews).forEach(([productId, count]) => {
      if (count > maxViews) {
        maxViews = count;
        data.mostViewedProductId = productId;
      }
    });
    
    data.productViewCounts = currentMonthProductViews;
    callback(data);
  });
};

// Calculate sales analytics from orders
export const calculateSalesAnalytics = (orders: Order[]) => {
  const ranges = getDateRanges();
  const data = {
    sales: { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 },
    revenue: { today: 0, lastWeek: 0, currentMonth: 0, lastMonth: 0 },
    topSoldProducts: [] as { productId: string; qty: number }[],
  };
  
  // Only count confirmed/completed orders
  const validOrders = orders.filter(o => 
    o.status !== 'placed' // All statuses except 'placed' are valid
  );
  
  const currentMonthProductSales: Record<string, number> = {};
  
  validOrders.forEach((order) => {
    const orderDate = getDateString(new Date(order.createdAt));
    const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
    
    if (orderDate === ranges.today) {
      data.sales.today += totalQty;
      data.revenue.today += order.total;
    }
    if (orderDate >= ranges.lastWeekStart && orderDate <= ranges.today) {
      data.sales.lastWeek += totalQty;
      data.revenue.lastWeek += order.total;
    }
    if (orderDate >= ranges.currentMonthStart && orderDate <= ranges.today) {
      data.sales.currentMonth += totalQty;
      data.revenue.currentMonth += order.total;
      // Track per-product sales for current month
      order.items.forEach((item) => {
        currentMonthProductSales[item.productId] = (currentMonthProductSales[item.productId] || 0) + item.qty;
      });
    }
    if (orderDate >= ranges.lastMonthStart && orderDate <= ranges.lastMonthEnd) {
      data.sales.lastMonth += totalQty;
      data.revenue.lastMonth += order.total;
    }
  });
  
  // Get top 5 sold products of current month
  data.topSoldProducts = Object.entries(currentMonthProductSales)
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
