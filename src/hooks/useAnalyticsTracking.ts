import { useEffect } from 'react';
import { trackVisitor, trackProductView } from '@/lib/analytics';

// Hook to track page visitors
export const useVisitorTracking = () => {
  useEffect(() => {
    trackVisitor().catch(console.error);
  }, []);
};

// Hook to track product views
export const useProductViewTracking = (productId: string | undefined) => {
  useEffect(() => {
    if (productId) {
      trackProductView(productId).catch(console.error);
    }
  }, [productId]);
};
