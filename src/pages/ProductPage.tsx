import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { subscribeToProducts } from '@/lib/database';
import { formatPrice } from '@/lib/helpers';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/user/Header';
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

      <main className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-xl overflow-hidden border border-border">
              <img
                src={product.images[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
          <div className="space-y-6">
            <div>
              <p className="text-sm text-accent mb-2">{product.featuredCategory}</p>
              <h1 className="font-display text-2xl md:text-4xl text-foreground mb-3">
                {product.name}
              </h1>
              <p className="text-3xl md:text-4xl font-bold text-accent">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} in stock
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-destructive rounded-full"></span>
                  <span className="text-sm text-destructive">Out of stock</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedColor === color
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {color}
                      {selectedColor === color && <Check className="w-3 h-3 inline ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-lg font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-6 border-2 border-accent text-accent rounded-lg font-medium hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleOrderNow}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-6 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Order Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
