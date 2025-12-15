import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SliderItem } from '@/types';
import { subscribeToSlider } from '@/lib/database';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/helpers';
import heroPlaceholder from '@/assets/hero-placeholder.jpg';

export function HeroSlider() {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSlider(setItems);
    return () => unsubscribe();
  }, []);

  const nextSlide = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [items.length, nextSlide]);

  if (items.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <img 
          src={heroPlaceholder} 
          alt="Mazzé Studio - Premium Audio & Tech" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-2">
              Mazzé<span className="text-accent">.</span> Studio
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-md">
              Premium Audio & Tech Accessories
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const handleSlideClick = () => {
    if (currentItem.redirectUrl) {
      window.open(currentItem.redirectUrl, '_blank');
    }
  };

  const renderMedia = () => {
    if (currentItem.type === 'video' || isYouTubeUrl(currentItem.mediaUrl)) {
      const embedUrl = getYouTubeEmbedUrl(currentItem.mediaUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        );
      }
      return (
        <video
          src={currentItem.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-primary"
        />
      );
    }

    return (
      <img
        src={currentItem.mediaUrl}
        alt="Slider"
        className="absolute inset-0 w-full h-full object-contain bg-primary"
      />
    );
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-primary">
      <div
        onClick={handleSlideClick}
        className={`absolute inset-0 ${currentItem.redirectUrl ? 'cursor-pointer' : ''}`}
      >
        {renderMedia()}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-accent w-6'
                    : 'bg-card/60 hover:bg-card'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
