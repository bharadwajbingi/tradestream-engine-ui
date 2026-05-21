import { LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';
import { Card } from '../ui/card';
import { cn } from '../../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

export function MetricCard({ title, value, icon: Icon, gradient, trend, isLoading }: MetricCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isLoading) {
      const controls = animate(count, value, { duration: 1 });
      return controls.stop;
    }
  }, [value, count, isLoading]);

  if (isLoading) {
    return (
      <Card className="p-6 border border-border rounded-2xl animate-pulse">
        <div className="h-10 w-10 rounded-full bg-muted mb-4" />
        <div className="h-4 w-20 bg-muted rounded mb-2" />
        <div className="h-8 w-24 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group"
    >
      <Card className={cn(
        'p-6 border border-border rounded-2xl transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/5'
      )}>
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center mb-4', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <motion.p className="text-3xl font-semibold text-foreground">
          {rounded}
        </motion.p>
        {trend && (
          <p className={cn('text-xs mt-2', trend.isPositive ? 'text-success' : 'text-error')}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </p>
        )}
      </Card>
    </motion.div>
  );
}
