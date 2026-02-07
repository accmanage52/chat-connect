import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
}

export function MessageBubble({ message, isOwn, showSender = false }: MessageBubbleProps) {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message has been seen by anyone other than the sender
  const isSeen = message.seenBy.length > 1;

  return (
    <div
      className={cn(
        'flex message-animate',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-chat-sent text-chat-sent-foreground rounded-br-md'
            : 'bg-chat-received text-chat-received-foreground rounded-bl-md'
        )}
      >
        {showSender && !isOwn && (
          <p className="text-xs font-semibold text-accent mb-1">{message.user}</p>
        )}
        
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-[11px]',
            isOwn ? 'text-chat-sent-foreground/70' : 'text-timestamp'
          )}>
            {formatTime(message.createdAt)}
          </span>
          
          {isOwn && (
            <span className="text-chat-sent-foreground/70">
              {isSeen ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
