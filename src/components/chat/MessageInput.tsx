import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  const handleTypingChange = useCallback((text: string) => {
    if (!onTyping) return;

    if (text.trim()) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set typing to false after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      onTyping(false);
    }
  }, [onTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    handleTypingChange(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping?.(false);

    setSending(true);
    try {
      await onSend(message);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-muted border-t border-border"
    >
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Smile className="w-6 h-6" />
        </Button>

        <div className="flex-1 bg-card rounded-3xl border border-border overflow-hidden">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-5 py-3 bg-transparent resize-none focus:outline-none',
              'text-foreground placeholder:text-muted-foreground',
              'max-h-[120px]'
            )}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || sending || disabled}
          className={cn(
            'shrink-0 w-12 h-12 rounded-full',
            'bg-accent hover:bg-accent/90 text-accent-foreground',
            'disabled:opacity-50'
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
