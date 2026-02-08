import React from 'react';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: Timestamp;
  showText?: boolean;
  className?: string;
}

export function OnlineStatus({ isOnline, lastSeen, showText = true, className }: OnlineStatusProps) {
  const formatLastSeen = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Offline';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span 
        className={cn(
          'w-2.5 h-2.5 rounded-full shrink-0',
          isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'
        )} 
      />
      {showText && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
        </span>
      )}
    </div>
  );
}

// Dot-only version for avatars
export function OnlineDot({ isOnline, className }: { isOnline: boolean; className?: string }) {
  return (
    <span 
      className={cn(
        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
        isOnline ? 'bg-green-500' : 'bg-muted-foreground/40',
        className
      )} 
    />
  );
}
