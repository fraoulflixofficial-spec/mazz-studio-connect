import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FEATURED_CATEGORIES } from '@/types';
import { Product } from '@/types';
import { subscribeToProducts } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/helpers';

type Step = 'idle' | 'category' | 'budget' | 'color' | 'other' | 'loading' | 'result';

interface Answers {
  category: string;
  budget: string;
  color: string;
  otherRequirements: string;
}

interface AIRecommendation {
  productName: string;
  reason: string;
}

interface AIResponse {
  greeting: string;
  recommendations: AIRecommendation[];
  note?: string;
}

export function AIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [answers, setAnswers] = useState<Answers>({
    category: '',
    budget: '',
    color: '',
    otherRequirements: '',
  });
  const [inputValue, setInputValue] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Subscribe to products
  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  // Tooltip animation logic
  useEffect(() => {
    if (hasInteracted) return;

    const showTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, [hasInteracted]);

  useEffect(() => {
    if (!showTooltip || hasInteracted) return;

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);

    const reappearTimer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTooltip(true);
      }
    }, 13000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(reappearTimer);
    };
  }, [showTooltip, hasInteracted]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
    setShowTooltip(false);
    setStep('category');
    setAnswers({ category: '', budget: '', color: '', otherRequirements: '' });
    setAiResponse(null);
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('idle');
  };

  const handleCategorySelect = (category: string) => {
    setAnswers(prev => ({ ...prev, category }));
    setStep('budget');
  };

  const handleBudgetSubmit = () => {
    const budgetNum = parseFloat(inputValue);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    setAnswers(prev => ({ ...prev, budget: inputValue }));
    setInputValue('');
    setError('');
    setStep('color');
  };

  const handleColorSubmit = () => {
    if (!inputValue.trim()) {
      setError('Please enter your preferred color');
      return;
    }
    setAnswers(prev => ({ ...prev, color: inputValue.trim() }));
    setInputValue('');
    setError('');
    setStep('other');
  };

  const handleOtherSubmit = async (skip: boolean = false) => {
    const otherReq = skip ? '' : inputValue.trim();
    setAnswers(prev => ({ ...prev, otherRequirements: otherReq }));
    setInputValue('');
    setStep('loading');
    
    await getRecommendations({ ...answers, otherRequirements: otherReq });
  };

  const getRecommendations = async (finalAnswers: Answers) => {
    try {
      // Filter products by category
      const categoryProducts = products.filter(
        p => p.featuredCategory === finalAnswers.category || p.menuCategory === finalAnswers.category
      );

      const productData = categoryProducts.map(p => ({
        name: p.name,
        price: p.price,
        colors: p.colors,
        description: p.description,
        stock: p.stock,
        category: p.featuredCategory,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('ai-product-assistant', {
        body: {
          category: finalAnswers.category,
          budget: finalAnswers.budget,
          color: finalAnswers.color,
          otherRequirements: finalAnswers.otherRequirements,
          products: productData,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setAiResponse(data.recommendation);
      setStep('result');
    } catch (err) {
      console.error('AI recommendation error:', err);
      setError('Failed to get recommendations. Please try again.');
      setStep('other');
    }
  };

  const getMatchedProducts = (): Product[] => {
    if (!aiResponse?.recommendations) return [];
    
    return aiResponse.recommendations
      .map(rec => {
        const matchedProduct = products.find(
          p => p.name.toLowerCase() === rec.productName.toLowerCase()
        );
        return matchedProduct;
      })
      .filter((p): p is Product => p !== undefined);
  };

  const handleProductClick = (productId: string) => {
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  const resetChat = () => {
    setStep('category');
    setAnswers({ category: '', budget: '', color: '', otherRequirements: '' });
    setAiResponse(null);
    setError('');
    setInputValue('');
  };

  const renderContent = () => {
    switch (step) {
      case 'category':
        return (
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">
              What type of product are you looking for? <span className="text-destructive">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {FEATURED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-3 py-2 text-xs bg-accent/10 hover:bg-accent/20 text-foreground rounded-lg transition-colors border border-border/50 hover:border-accent/50"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">
              What's your budget in ৳? <span className="text-destructive">*</span>
            </p>
            <p className="text-xs text-muted-foreground">Enter a numeric value (e.g., 5000)</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter budget..."
                className="flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleBudgetSubmit()}
              />
              <Button size="sm" onClick={handleBudgetSubmit}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case 'color':
        return (
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">
              What's your preferred color? <span className="text-destructive">*</span>
            </p>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., Black, White, Blue..."
                className="flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleColorSubmit()}
              />
              <Button size="sm" onClick={handleColorSubmit}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case 'other':
        return (
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">
              Any other requirements? <span className="text-muted-foreground">(Optional)</span>
            </p>
            <p className="text-xs text-muted-foreground">Brand preference, features, usage, etc.</p>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., Noise cancelling, waterproof..."
                className="flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleOtherSubmit(false)}
              />
              <Button size="sm" onClick={() => handleOtherSubmit(false)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOtherSubmit(true)}
              className="w-full text-muted-foreground"
            >
              Skip this step
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Finding the perfect products for you...</p>
          </div>
        );

      case 'result':
        const matchedProducts = getMatchedProducts();
        return (
          <div className="space-y-4">
            {/* AI Greeting */}
            {aiResponse?.greeting && (
              <p className="text-sm text-foreground">{aiResponse.greeting}</p>
            )}

            {/* Product Cards */}
            {matchedProducts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">
                  Recommended Products ({matchedProducts.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {matchedProducts.map((product) => {
                    const recommendation = aiResponse?.recommendations.find(
                      r => r.productName.toLowerCase() === product.name.toLowerCase()
                    );
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="bg-accent/5 hover:bg-accent/10 border border-border/50 hover:border-accent/50 rounded-lg p-2 transition-all text-left group"
                      >
                        <div className="aspect-square rounded-md overflow-hidden mb-2 bg-background">
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-xs font-semibold text-accent">
                          {formatPrice(product.price)}
                        </p>
                        {recommendation?.reason && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                            {recommendation.reason}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                <p className="text-sm text-foreground">
                  {aiResponse?.note || "No exact matches found. Try adjusting your preferences."}
                </p>
              </div>
            )}

            {/* AI Note */}
            {aiResponse?.note && matchedProducts.length > 0 && (
              <p className="text-xs text-muted-foreground italic">{aiResponse.note}</p>
            )}

            <Button onClick={resetChat} variant="outline" size="sm" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Start New Search
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 active:scale-95 group"
        aria-label="AI Shopping Assistant"
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white" />
      </button>

      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-40 right-6 z-50 animate-fade-in">
          <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-52 relative">
            <p className="text-xs text-foreground font-medium">
              🤖 Find the right gadget instantly with AI
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">AI Shopping Assistant</h3>
                <p className="text-white/80 text-xs">Mazzé Studio</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {step === 'category' && (
              <div className="mb-4 bg-accent/5 rounded-lg p-3 border border-accent/20">
                <p className="text-xs text-foreground">
                  👋 Hello! I'm here to help you find the perfect gadget. Let me ask you a few questions to understand your needs.
                </p>
              </div>
            )}
            {renderContent()}
          </div>

          {/* Progress Indicator */}
          {step !== 'idle' && step !== 'loading' && step !== 'result' && (
            <div className="px-4 pb-4">
              <div className="flex gap-1">
                {['category', 'budget', 'color', 'other'].map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      ['category', 'budget', 'color', 'other'].indexOf(step) >= i
                        ? 'bg-accent'
                        : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Step {['category', 'budget', 'color', 'other'].indexOf(step) + 1} of 4
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
