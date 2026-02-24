import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }
>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'neural-btn',
        variant === 'outline' && 'bg-transparent border-neural-red text-neural-red hover:bg-neural-red/10',
        variant === 'ghost' && 'bg-transparent border-transparent text-neural-text hover:bg-white/5',
        className
      )}
      {...props}
    />
  );
});

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('neural-card', className)}>
    {children}
  </div>
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-neural-text focus:outline-none focus:border-neural-neon transition-colors',
      className
    )}
    {...props}
  />
));
