import React from 'react';
import { clsx } from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, resize = 'vertical', ...props }, ref) => {
    const textareaId = React.useId();
    const errorId = React.useId();
    const helperTextId = React.useId();

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={clsx(
            'w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[80px]',
            resizeClasses[resize],
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : helperText ? helperTextId : undefined
          }
          ref={ref}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-destructive text-sm mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="text-muted-foreground text-sm mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';