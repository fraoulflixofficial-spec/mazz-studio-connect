import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '@/types';
import { subscribeToProducts } from '@/lib/database';
import { Header } from '@/components/user/Header';
import { ProductGrid } from '@/components/user/ProductGrid';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const categoryProducts = products.filter(
    (p) => p.featuredCategory === decodeURIComponent(category || '')
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4">
        <ProductGrid
          products={categoryProducts}
          title={decodeURIComponent(category || '')}
        />
      </main>
    </div>
  );
}
