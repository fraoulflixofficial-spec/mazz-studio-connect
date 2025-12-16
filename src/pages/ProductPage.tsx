import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { subscribeToProducts } from '@/lib/database';
import { formatPrice } from '@/lib/helpers';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/user/Header';
import { RelatedProducts } from '@/components/user/RelatedProducts';
import { FloatingWhatsApp } from '@/components/user/FloatingWhatsApp';
import { AIAssistant } from '@/components/user/AIAssistant';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  // Scroll to top when navigating to a new product
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImageIndex(0);
    setQty(1);
  }, [id]);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently unavailable.',
        variant: 'destructive',
      });
      return;
    }
    addToCart(product, qty, selectedColor);
    toast({
      title: 'Added to Cart',
      description: `${product.name} x${qty} added to your cart.`,
    });
  };

  const handleOrderNow = () => {
    if (product.stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently unavailable.',
        variant: 'destructive',
      });
      return;
    }
    addToCart(product, qty, selectedColor);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 lg:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 lg:mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 max-w-6xl mx-auto">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-xl overflow-hidden border border-border lg:rounded-2xl">
              <img
                src={product.images[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 lg:gap-3 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg lg:rounded-xl overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-accent'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:space-y-8">
            <div>
              <p className="text-sm lg:text-base text-accent mb-2">{product.featuredCategory}</p>
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-foreground mb-3 lg:mb-4">
                {product.name}
              </h1>
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.brand && (
              <div className="flex items-center gap-2">
                <span className="text-sm lg:text-base text-muted-foreground">Brand:</span>
                <span className="text-sm lg:text-base font-medium text-foreground">{product.brand}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm lg:text-base text-muted-foreground">
                    {product.stock} in stock
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 lg:w-3 lg:h-3 bg-destructive rounded-full"></span>
                  <span className="text-sm lg:text-base text-destructive">Out of stock</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed lg:text-lg lg:leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm lg:text-base font-medium mb-3">Color</p>
                <div className="flex gap-2 lg:gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 lg:px-5 lg:py-3 rounded-lg lg:rounded-xl border text-sm lg:text-base transition-all ${
                        selectedColor === color
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {color}
                      {selectedColor === color && <Check className="w-3 h-3 lg:w-4 lg:h-4 inline ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm lg:text-base font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                <span className="w-12 lg:w-16 text-center text-lg lg:text-xl font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 lg:gap-4 pt-4 lg:pt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 lg:py-4 px-6 border-2 border-accent text-accent rounded-lg lg:rounded-xl font-medium lg:text-lg hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleOrderNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3 lg:py-4 px-6 bg-accent text-accent-foreground rounded-lg lg:rounded-xl font-medium lg:text-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
                Order Now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="max-w-6xl mx-auto">
          <RelatedProducts currentProduct={product} allProducts={products} />
        </div>
      </main>
      <AIAssistant />
      <FloatingWhatsApp />
    </div>
  );
}
