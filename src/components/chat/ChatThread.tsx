import React, { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { User, Phone, Video, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatThreadProps {
  clientUsername: string;
}

export function ChatThread({ clientUsername }: ChatThreadProps) {
  const { user } = useAuth();
  const isSupport = user?.role === 'support';
  
  const { messages, loading, sendMessage } = useMessages({
    clientUsername,
    currentUser: user?.username || '',
    autoMarkSeen: isSupport,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-foreground">
              {getInitials(clientUsername)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{clientUsername}</h2>
            <p className="text-xs text-muted-foreground">
              {isSupport ? 'Client' : 'Support'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-pattern custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user === user?.username}
                showSender={isSupport}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
