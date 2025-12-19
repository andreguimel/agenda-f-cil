import { useState } from 'react';
import { Check, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotARobotCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const NotARobotCheck = ({ checked, onChange, className }: NotARobotCheckProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (checked) return;
    
    setIsAnimating(true);
    
    // Simulate a brief verification delay
    setTimeout(() => {
      setIsAnimating(false);
      onChange(true);
    }, 800);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200",
        checked 
          ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
          : "border-border bg-card hover:border-primary/50 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "w-7 h-7 rounded border-2 flex items-center justify-center transition-all duration-300",
          checked
            ? "bg-green-500 border-green-500"
            : isAnimating
            ? "border-primary animate-pulse"
            : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {isAnimating ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : checked ? (
          <Check className="w-4 h-4 text-white" />
        ) : null}
      </div>
      
      <span className={cn(
        "text-sm font-medium select-none",
        checked ? "text-green-700 dark:text-green-400" : "text-foreground"
      )}>
        {isAnimating ? "Verificando..." : checked ? "Verificado" : "Não sou um robô"}
      </span>
      
      <div className="ml-auto">
        <Shield className={cn(
          "w-5 h-5",
          checked ? "text-green-500" : "text-muted-foreground/50"
        )} />
      </div>
    </div>
  );
};

export default NotARobotCheck;
