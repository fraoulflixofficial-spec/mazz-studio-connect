import { useState, useEffect } from 'react';
import { getSetting, setSetting, subscribeToSetting } from '@/lib/database';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface DataCollectionPeriodProps {
  onPeriodChange?: (startDate: Date, endDate: Date) => void;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getDataCollectionPeriod = async (): Promise<{ startDate: Date; endDate: Date }> => {
  const data = await getSetting('collectionPeriod');
  
  if (data) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    // Check if period has ended, if so create new period
    if (new Date() > endDate) {
      return await initializeNewPeriod();
    }
    
    return { startDate, endDate };
  }
  
  return await initializeNewPeriod();
};

const initializeNewPeriod = async (): Promise<{ startDate: Date; endDate: Date }> => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);
  
  await setSetting('collectionPeriod', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  
  return { startDate, endDate };
};

export function DataCollectionPeriod({ onPeriodChange }: DataCollectionPeriodProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPeriod = async () => {
      const { startDate: start, endDate: end } = await getDataCollectionPeriod();
      setStartDate(start);
      setEndDate(end);
      onPeriodChange?.(start, end);
      setLoading(false);
    };

    initPeriod();

    // Subscribe to settings changes
    const unsubscribe = subscribeToSetting('collectionPeriod', async (data) => {
      if (data) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        
        // Check if period has ended
        if (new Date() > end) {
          const newPeriod = await initializeNewPeriod();
          setStartDate(newPeriod.startDate);
          setEndDate(newPeriod.endDate);
          onPeriodChange?.(newPeriod.startDate, newPeriod.endDate);
        } else {
          setStartDate(start);
          setEndDate(end);
          onPeriodChange?.(start, end);
        }
      }
    });

    return () => unsubscribe();
  }, [onPeriodChange]);

  // Countdown timer
  useEffect(() => {
    if (!endDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Trigger period reset
        initializeNewPeriod();
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [endDate]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border rounded-xl p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <RefreshCw className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">30-Day Data Collection Period</h3>
          <p className="text-xs text-muted-foreground">Auto-resets when period ends</p>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-green-500" />
            <p className="text-xs text-muted-foreground">Start Date</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {startDate ? format(startDate, 'dd/MM/yy') : '--/--/--'}
          </p>
        </div>
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-red-500" />
            <p className="text-xs text-muted-foreground">End Date</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {endDate ? format(endDate, 'dd/MM/yy') : '--/--/--'}
          </p>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Clock className="w-4 h-4 text-accent" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Remaining</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="bg-primary/10 rounded-lg p-2 lg:p-3">
              <p className="text-xl lg:text-2xl font-bold text-primary">
                {String(countdown.days).padStart(2, '0')}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Days</p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-lg p-2 lg:p-3">
              <p className="text-xl lg:text-2xl font-bold text-primary">
                {String(countdown.hours).padStart(2, '0')}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Hours</p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 rounded-lg p-2 lg:p-3">
              <p className="text-xl lg:text-2xl font-bold text-primary">
                {String(countdown.minutes).padStart(2, '0')}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Mins</p>
          </div>
          <div className="text-center">
            <div className="bg-accent/20 rounded-lg p-2 lg:p-3">
              <p className="text-xl lg:text-2xl font-bold text-accent animate-pulse">
                {String(countdown.seconds).padStart(2, '0')}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Secs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
