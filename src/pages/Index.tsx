import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { subscribeToProducts } from '@/lib/database';
import { Header } from '@/components/user/Header';
import { HeroSlider } from '@/components/user/HeroSlider';
import { CategoryNav } from '@/components/user/CategoryNav';
import { ProductGrid } from '@/components/user/ProductGrid';
import { AdminButton } from '@/components/user/AdminButton';
import { FloatingWhatsApp } from '@/components/user/FloatingWhatsApp';
import { AIAssistant } from '@/components/user/AIAssistant';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  // If logged in, show admin dashboard
  if (user) {
    return <AdminDashboard />;
  }

  const featuredProducts = products.slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSlider />
        
        <div className="container mx-auto px-4">
          <CategoryNav />
          
          <ProductGrid 
            products={featuredProducts} 
            title="Featured Products"
          />
        </div>
      </main>

      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="font-display text-2xl text-foreground mb-2">
              Mazzé<span className="text-accent">.</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Premium Audio & Tech Accessories
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              © {new Date().getFullYear()} Mazzé Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AIAssistant />
      <FloatingWhatsApp />
      <AdminButton onClick={() => setShowLoginModal(true)} />
      <AdminLogin isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
