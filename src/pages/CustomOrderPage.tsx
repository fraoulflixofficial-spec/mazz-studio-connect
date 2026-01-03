import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { FEATURED_CATEGORIES, DeliveryZone, UrgencyLevel, FeaturedCategory, CustomOrder } from '@/types';
import { createCustomOrder } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { PackagePlus, Upload, CheckCircle } from 'lucide-react';

export default function CustomOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    productName: '',
    productCategory: FEATURED_CATEGORIES[0] as FeaturedCategory,
    productDescription: '',
    referenceLink: '',
    expectedBudget: '',
    quantity: '1',
    urgencyLevel: 'normal' as UrgencyLevel,
    deliveryZone: '' as DeliveryZone | '',
    productImageUrl: '',
    additionalNotes: '',
  });

  const deliveryCharges: Record<DeliveryZone, number> = {
    inside_dhaka: 80,
    outside_dhaka: 100,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.deliveryZone) {
      toast({
        title: 'Delivery Location Required',
        description: 'Please select your delivery location.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.customerName.trim() || !form.phone.trim() || !form.productName.trim() || !form.expectedBudget) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order data, excluding undefined/empty optional fields for Firebase
      const orderData: Record<string, unknown> = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        productName: form.productName.trim(),
        productCategory: form.productCategory,
        expectedBudget: Number(form.expectedBudget),
        quantity: Number(form.quantity) || 1,
        urgencyLevel: form.urgencyLevel,
        deliveryZone: form.deliveryZone as DeliveryZone,
        deliveryCharge: deliveryCharges[form.deliveryZone as DeliveryZone],
        status: 'pending',
        createdAt: Date.now(),
      };
      
      // Only add optional fields if they have values
      if (form.email.trim()) orderData.email = form.email.trim();
      if (form.productDescription.trim()) orderData.productDescription = form.productDescription.trim();
      if (form.referenceLink.trim()) orderData.referenceLink = form.referenceLink.trim();
      if (form.productImageUrl.trim()) orderData.productImageUrl = form.productImageUrl.trim();
      if (form.additionalNotes.trim()) orderData.additionalNotes = form.additionalNotes.trim();

      await createCustomOrder(orderData as Omit<CustomOrder, 'id'>);

      setIsSubmitted(true);
      toast({
        title: 'Request Submitted!',
        description: 'Our team will contact you shortly.',
      });
    } catch (error) {
      console.error('Failed to submit custom order:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-2xl mb-4">Request Submitted!</h1>
            <p className="text-muted-foreground mb-8">
              Your custom product request has been submitted successfully. Our team will contact you shortly.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <PackagePlus className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl">Custom Product Order</h1>
              <p className="text-sm text-muted-foreground">
                Request any product not available on our website
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-medium text-lg">Customer Information</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email Address <span className="text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-medium text-lg">Product Details</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    placeholder="e.g., Sony WH-1000XM5"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Product Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.productCategory}
                    onChange={(e) => setForm({ ...form, productCategory: e.target.value as FeaturedCategory })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {FEATURED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Product Description / Specifications
                </label>
                <textarea
                  value={form.productDescription}
                  onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                  placeholder="Brand, model, color, version, storage, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Reference Product Link <span className="text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={form.referenceLink}
                  onChange={(e) => setForm({ ...form, referenceLink: e.target.value })}
                  placeholder="Amazon, AliExpress, official site, etc."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Product Image URL <span className="text-muted-foreground">(Optional)</span>
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={form.productImageUrl}
                    onChange={(e) => setForm({ ...form, productImageUrl: e.target.value })}
                    placeholder="Paste image URL for reference"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-medium text-lg">Order Details</h2>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Expected Budget (৳) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.expectedBudget}
                    onChange={(e) => setForm({ ...form, expectedBudget: e.target.value })}
                    placeholder="5000"
                    min="0"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Quantity <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Urgency Level <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={form.urgencyLevel}
                    onChange={(e) => setForm({ ...form, urgencyLevel: e.target.value as UrgencyLevel })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-medium text-lg">
                Delivery Location <span className="text-destructive">*</span>
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    form.deliveryZone === 'inside_dhaka'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryZone"
                    value="inside_dhaka"
                    checked={form.deliveryZone === 'inside_dhaka'}
                    onChange={() => setForm({ ...form, deliveryZone: 'inside_dhaka' })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    form.deliveryZone === 'inside_dhaka' ? 'border-accent' : 'border-muted-foreground'
                  }`}>
                    {form.deliveryZone === 'inside_dhaka' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Inside Dhaka</p>
                    <p className="text-sm text-muted-foreground">Delivery: ৳80</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    form.deliveryZone === 'outside_dhaka'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryZone"
                    value="outside_dhaka"
                    checked={form.deliveryZone === 'outside_dhaka'}
                    onChange={() => setForm({ ...form, deliveryZone: 'outside_dhaka' })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    form.deliveryZone === 'outside_dhaka' ? 'border-accent' : 'border-muted-foreground'
                  }`}>
                    {form.deliveryZone === 'outside_dhaka' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Outside Dhaka</p>
                    <p className="text-sm text-muted-foreground">Delivery: ৳100</p>
                  </div>
                </label>
              </div>

              {form.deliveryZone && (
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium">Selected Delivery Charge:</span>
                  <span className="font-bold text-accent">
                    ৳{deliveryCharges[form.deliveryZone as DeliveryZone]}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-card border border-border rounded-xl p-6">
              <label className="block text-sm font-medium mb-1.5">
                Additional Notes <span className="text-muted-foreground">(Optional)</span>
              </label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                placeholder="Any other requirements or preferences..."
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-bold text-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Custom Order'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
