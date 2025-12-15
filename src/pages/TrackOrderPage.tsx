import { useState } from 'react';
import { Header } from '@/components/user/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, CheckCircle2, Truck, MapPin, Home as HomeIcon } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/helpers';

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'placed', label: 'Order Placed', icon: <Package className="w-5 h-5" /> },
  { status: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="w-5 h-5" /> },
  { status: 'packed', label: 'Packed', icon: <Package className="w-5 h-5" /> },
  { status: 'shipped', label: 'Shipped', icon: <Truck className="w-5 h-5" /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: <MapPin className="w-5 h-5" /> },
  { status: 'delivered', label: 'Delivered', icon: <HomeIcon className="w-5 h-5" /> },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const snapshot = await get(ref(database, 'orders'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orders = Object.entries(data).map(([id, o]) => ({
          id,
          ...(o as Omit<Order, 'id'>),
        }));
        
        const found = orders.find(o => 
          o.id === orderId.trim() || 
          o.id.toLowerCase().includes(orderId.trim().toLowerCase())
        );
        
        if (found) {
          setOrder(found);
        } else {
          setOrder(null);
          setError('Order not found. Please check your Order ID.');
        }
      } else {
        setOrder(null);
        setError('No orders found in the system.');
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex(s => s.status === status);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-center mb-8">
          Track Your Order
        </h1>

        {/* Search Form */}
        <div className="flex gap-2 mb-8">
          <Input
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="flex-1"
          />
          <Button onClick={handleTrack} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Track'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center mb-8">
            {error}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-accent">{formatPrice(order.total)}</p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Customer: {order.customerName}</p>
                <p>Address: {order.address}</p>
                <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-medium mb-6">Order Progress</h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                <div 
                  className="absolute left-6 top-0 w-0.5 bg-accent transition-all duration-500"
                  style={{ 
                    height: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%` 
                  }}
                />

                {/* Steps */}
                <div className="space-y-6">
                  {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.status} className="relative flex items-center gap-4">
                        <div 
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                            ${isCompleted 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'
                            }
                            ${isCurrent ? 'ring-4 ring-accent/30 scale-110' : ''}
                          `}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-accent">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searched && !order && !error && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Enter your Order ID to track your order</p>
          </div>
        )}
      </div>
    </div>
  );
}
