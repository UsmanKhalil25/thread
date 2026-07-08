import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm shadow-black/5 transition-all',
      'hover:opacity-90 active:opacity-80',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Button.displayName = 'Button';

export { Button };
