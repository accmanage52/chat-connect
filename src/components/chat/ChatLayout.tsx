import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatThread } from './ChatThread';
import { EmptyState } from './EmptyState';
import { ClientChatView } from './ClientChatView';

export function ChatLayout() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // Client view - only shows their own chat
  if (user?.role === 'client') {
    return <ClientChatView />;
  }

  // Support view - shows sidebar with all chats
  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
      <div className="flex-1">
        {selectedChat ? (
          <ChatThread clientUsername={selectedChat} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
