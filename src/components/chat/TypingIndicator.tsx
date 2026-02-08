import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  username?: string;
  className?: string;
}

export function TypingIndicator({ username, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1 px-4 py-2 bg-muted rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
      {username && (
        <span className="text-xs text-muted-foreground">
          {username} is typing...
        </span>
      )}
    </div>
  );
}
