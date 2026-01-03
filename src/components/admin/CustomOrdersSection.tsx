import { useState } from 'react';
import { CustomOrder, CustomOrderStatus, FEATURED_CATEGORIES } from '@/types';
import { updateCustomOrder, deleteCustomOrder } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/helpers';
import {
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  FileText,
} from 'lucide-react';

interface CustomOrdersSectionProps {
  customOrders: CustomOrder[];
}

const STATUS_CONFIG: Record<CustomOrderStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-500/20 text-yellow-600' },
  reviewing: { label: 'Reviewing', icon: Eye, className: 'bg-blue-500/20 text-blue-600' },
  price_quoted: { label: 'Price Quoted', icon: FileText, className: 'bg-purple-500/20 text-purple-600' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, className: 'bg-green-500/20 text-green-600' },
  ordered: { label: 'Ordered', icon: Package, className: 'bg-indigo-500/20 text-indigo-600' },
  delivered: { label: 'Delivered', icon: Truck, className: 'bg-emerald-500/20 text-emerald-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-500/20 text-red-600' },
};

const STATUS_ORDER: CustomOrderStatus[] = ['pending', 'reviewing', 'price_quoted', 'confirmed', 'ordered', 'delivered', 'cancelled'];

export function CustomOrdersSection({ customOrders }: CustomOrdersSectionProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomOrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredOrders = customOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => b.createdAt - a.createdAt);

  const handleStatusChange = async (orderId: string, newStatus: CustomOrderStatus) => {
    try {
      await updateCustomOrder(orderId, { status: newStatus });
      toast({ title: 'Status Updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      await updateCustomOrder(selectedOrder.id, { adminNotes });
      setSelectedOrder({ ...selectedOrder, adminNotes });
      toast({ title: 'Notes Saved' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Delete this custom order?')) return;
    try {
      await deleteCustomOrder(orderId);
      setSelectedOrder(null);
      toast({ title: 'Order Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const openOrderDetails = (order: CustomOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
  };

  const pendingCount = customOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CustomOrderStatus | 'all')}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">All Status</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No custom orders found
          </div>
        ) : (
          sortedOrders.map((order) => {
            const StatusIcon = STATUS_CONFIG[order.status].icon;
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status].className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[order.status].label}
                      </span>
                      {order.urgencyLevel === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-600 rounded-full text-xs font-medium">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.phone}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span>Budget: {formatPrice(order.expectedBudget)}</span>
                      <span>Qty: {order.quantity}</span>
                      <span className="text-accent">
                        {order.deliveryZone === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as CustomOrderStatus)}
                      className="px-2 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_CONFIG[status].label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${order.phone}`}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-green-600"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-green-600"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display text-lg">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{selectedOrder.id}</p>
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedOrder.status].className}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium">Customer Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <a href={`tel:${selectedOrder.phone}`} className="text-accent hover:underline">
                      {selectedOrder.phone}
                    </a>
                  </div>
                  {selectedOrder.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <a href={`mailto:${selectedOrder.email}`} className="text-accent hover:underline">
                        {selectedOrder.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium">Product Details</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Name</span>
                    <span className="text-right">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{selectedOrder.productCategory}</span>
                  </div>
                  {selectedOrder.productDescription && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Description</span>
                      <p className="text-foreground">{selectedOrder.productDescription}</p>
                    </div>
                  )}
                  {selectedOrder.referenceLink && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Reference Link</span>
                      <a
                        href={selectedOrder.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedOrder.productImageUrl && (
                    <div>
                      <span className="text-muted-foreground block mb-2">Reference Image</span>
                      <img
                        src={selectedOrder.productImageUrl}
                        alt="Product reference"
                        className="w-full max-w-[200px] rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium">Order Summary</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Budget</span>
                    <span className="font-medium">{formatPrice(selectedOrder.expectedBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgency</span>
                    <span className={selectedOrder.urgencyLevel === 'urgent' ? 'text-red-500 font-medium' : ''}>
                      {selectedOrder.urgencyLevel === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Zone</span>
                    <span>{selectedOrder.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="font-medium text-accent">{formatPrice(selectedOrder.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedOrder.additionalNotes && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-medium mb-2">Customer Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.additionalNotes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <h3 className="font-medium">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this order..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Save Notes
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <a
                  href={`tel:${selectedOrder.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                {selectedOrder.email && (
                  <a
                    href={`mailto:${selectedOrder.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/30 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
