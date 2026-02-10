import React, { useEffect, useRef, useCallback } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { usePresence, useWatchPresence } from '@/hooks/usePresence';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ⭐ Import your logo image
import logo from '@/assets/logo.jpeg';

export function ClientChatView() {
  const { user, logout } = useAuth();
  const [depositOpen, setDepositOpen] = React.useState(false);

  const { messages, loading, sendMessage, markAsSeen } = useMessages({
    clientUsername: user?.username || '',
    currentUser: user?.username || '',
    autoMarkSeen: false,
  });

  // Manage own presence
  const { setTyping } = usePresence({ 
    username: user?.username || '', 
    enabled: !!user?.username 
  });

  // Watch support typing (we'll watch for any support user typing in this chat)
  // For simplicity, we'll track if support is typing in this client's chat
  const { isTyping: supportTyping } = useWatchPresence('support');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, supportTyping]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.user !== user?.username && !msg.seenBy.includes(user?.username || '')) {
        markAsSeen(msg.id);
      }
    });
  }, [messages, user?.username, markAsSeen]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping, user?.username);
  }, [setTyping, user?.username]);

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* ⭐ HEADER UPDATED */}
      <div className="h-16 px-4 flex items-center justify-between bg-primary shrink-0">
        <div className="flex items-center gap-3">
          
          {/* 🔥 LOGO INSTEAD OF ICON */}
          <img
            src={logo}
            alt="Ambani Support"
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <h1 className="font-semibold text-primary-foreground">
              Ambani Support
            </h1>
            <p className="text-xs text-primary-foreground/70">
              24/7 Instant Services
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-pattern custom-scrollbar">
        <div className="max-w-3xl mx-auto p-4 space-y-3">
          <div className="text-center py-4">
            <div className="inline-block px-4 py-2 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.username}! How can we help you today?
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user === user?.username}
              />
            ))
          )}

          {/* Typing Indicator from Support */}
          {supportTyping && (
            <TypingIndicator username="Support" />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDepositOpen(true)}
        >
          Deposit
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-primary-foreground/70 hover:text-primary-foreground"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        username={user?.username}
      />

      <MessageInput onSend={sendMessage} onTyping={handleTyping} />
    </div>
  );
}
