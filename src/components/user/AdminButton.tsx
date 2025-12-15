import { Star } from 'lucide-react';

interface AdminButtonProps {
  onClick: () => void;
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-12 h-12 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 gold-glow"
      aria-label="Admin Panel"
    >
      <Star className="w-6 h-6" />
    </button>
  );
}
