import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatList } from '@/hooks/useChatList';
import { ChatPreview } from '@/types/chat';
import { MessageSquare, LogOut, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (clientUsername: string) => void;
}

export function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  const { user, logout } = useAuth();
  const { chats, loading } = useChatList({ currentUser: user?.username || '' });

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-sidebar-bg flex flex-col h-full border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5 text-sidebar-text" />
          </div>
          <div>
            <p className="font-semibold text-sidebar-text">{user?.username}</p>
            <p className="text-xs text-sidebar-text-muted capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-sidebar-text-muted hover:text-sidebar-text hover:bg-sidebar-hover"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Search placeholder */}
      <div className="p-3">
        <div className="bg-sidebar-hover rounded-lg px-4 py-2">
          <p className="text-sm text-sidebar-text-muted">Search or start new chat</p>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-sidebar-text-muted animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sidebar-text-muted">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.clientUsername}
              chat={chat}
              isSelected={selectedChat === chat.clientUsername}
              onClick={() => onSelectChat(chat.clientUsername)}
              formatTime={formatTime}
              currentUser={user?.username || ''}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: ChatPreview;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (timestamp: any) => string;
  currentUser: string;
}

function ChatListItem({ chat, isSelected, onClick, formatTime, currentUser }: ChatListItemProps) {
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const isOwnMessage = chat.lastMessage?.user === currentUser;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 flex items-center gap-3 transition-colors text-left',
        isSelected ? 'bg-sidebar-active' : 'hover:bg-sidebar-hover'
      )}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-sidebar-text">
          {getInitials(chat.clientUsername)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sidebar-text truncate">
            {chat.clientUsername}
          </span>
          {chat.lastMessage && (
            <span className="text-xs text-sidebar-text-muted shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-sidebar-text-muted truncate pr-2">
            {chat.lastMessage ? (
              <>
                {isOwnMessage && <span className="text-sidebar-text-muted">You: </span>}
                {chat.lastMessage.text}
              </>
            ) : (
              'No messages yet'
            )}
          </p>
          {chat.unreadCount > 0 && (
            <span className="bg-unread-badge text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
