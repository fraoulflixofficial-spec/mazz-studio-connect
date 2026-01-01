import { Link } from 'react-router-dom';
import { FEATURED_CATEGORIES } from '@/types';
import { 
  Headphones, 
  Watch, 
  Smartphone, 
  Speaker, 
  Gamepad2, 
  Camera,
  Ear,
  Cable,
  Joystick,
  Clock
} from 'lucide-react';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Earbuds': Ear,
  'Headphones': Headphones,
  'Smart Watch': Watch,
  'Speakers': Speaker,
  'Watches': Clock,
  'Mobile Phones': Smartphone,
  'Accessories': Cable,
  'Gaming Consoles': Gamepad2,
  'Controllers': Joystick,
  'Camera': Camera,
};

export function CategoryNav() {
  return (
    <div className="py-6 md:py-8">
      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
        Shop by Category
      </h2>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
        {FEATURED_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category] || Headphones;
          return (
            <Link
              key={category}
              to={`/category/${encodeURIComponent(category)}`}
              className="flex flex-col items-center gap-2 p-2 md:p-4 bg-card rounded-lg border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                {category}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
