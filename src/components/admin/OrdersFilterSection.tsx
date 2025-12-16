import { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase';

interface OrderFilters {
  orderId: string;
  productName: string;
  customerName: string;
  customerNumber: string;
  dateOfPurchase: string;
}

interface OrdersFilterSectionProps {
  onFiltersChange: (filters: OrderFilters) => void;
}

export function OrdersFilterSection({ onFiltersChange }: OrdersFilterSectionProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    orderId: '',
    productName: '',
    customerName: '',
    customerNumber: '',
    dateOfPurchase: '',
  });

  // 6-month reset timer state
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Initialize and manage 6-month reset period
  useEffect(() => {
    const initResetPeriod = async () => {
      const resetRef = ref(database, 'settings/ordersResetDate');
      const snapshot = await get(resetRef);

      let resetDateValue: Date;

      if (snapshot.exists()) {
        resetDateValue = new Date(snapshot.val());
        
        // Check if reset date has passed
        if (resetDateValue <= new Date()) {
          // Start new 6-month period
          resetDateValue = new Date();
          resetDateValue.setMonth(resetDateValue.getMonth() + 6);
          await set(resetRef, resetDateValue.toISOString());
        }
      } else {
        // Initialize first 6-month period
        resetDateValue = new Date();
        resetDateValue.setMonth(resetDateValue.getMonth() + 6);
        await set(resetRef, resetDateValue.toISOString());
      }

      setResetDate(resetDateValue);
    };

    initResetPeriod();
  }, []);

  // Update days remaining
  useEffect(() => {
    if (!resetDate) return;

    const updateDays = () => {
      const now = new Date();
      const diff = resetDate.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setDaysRemaining(days);
    };

    updateDays();
    const interval = setInterval(updateDays, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [resetDate]);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: OrderFilters = {
      orderId: '',
      productName: '',
      customerName: '',
      customerNumber: '',
      dateOfPurchase: '',
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-4">
      {/* 6-Month Reset Timer */}
      <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium">Orders Reset Timer</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">{daysRemaining} Days</p>
          <p className="text-xs text-muted-foreground">
            {resetDate ? `Reset on ${resetDate.toLocaleDateString('en-GB')}` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFilterOpen || hasActiveFilters
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter Orders
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-accent-foreground/20 rounded text-xs">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-4 animate-in slide-in-from-top-2">
          <h4 className="font-medium text-sm text-muted-foreground">Search by any of the following (optional):</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Order ID */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Order ID</label>
              <input
                type="text"
                value={filters.orderId}
                onChange={(e) => handleFilterChange('orderId', e.target.value)}
                placeholder="Enter Order ID..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Product Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Product Name</label>
              <input
                type="text"
                value={filters.productName}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
                placeholder="Enter Product Name..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Customer Name</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                placeholder="Enter Customer Name..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Customer Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Customer Number</label>
              <input
                type="text"
                value={filters.customerNumber}
                onChange={(e) => handleFilterChange('customerNumber', e.target.value)}
                placeholder="Enter Phone Number..."
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Date of Purchase */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Date of Purchase</label>
              <input
                type="date"
                value={filters.dateOfPurchase}
                onChange={(e) => handleFilterChange('dateOfPurchase', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { OrderFilters };
