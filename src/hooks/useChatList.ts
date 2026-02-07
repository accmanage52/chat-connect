import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  collectionGroup,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatPreview, Message } from '@/types/chat';

interface UseChatListOptions {
  currentUser: string;
}

export function useChatList({ currentUser }: UseChatListOptions) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Use collectionGroup query to get all messages across all chats
    const messagesGroupRef = collectionGroup(db, 'messages');
    const q = query(messagesGroupRef, orderBy('createdAt', 'desc'), limit(500));

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const chatMap = new Map<string, { messages: Message[]; unreadCount: number }>();

        snapshot.forEach((docSnap) => {
          // Extract client username from path: chats/{clientUsername}/messages/{messageId}
          const pathSegments = docSnap.ref.path.split('/');
          const clientUsername = pathSegments[1]; // Index 1 is the client username

          const msg = { id: docSnap.id, ...docSnap.data() } as Message;

          if (!chatMap.has(clientUsername)) {
            chatMap.set(clientUsername, { messages: [], unreadCount: 0 });
          }

          const chatData = chatMap.get(clientUsername)!;
          chatData.messages.push(msg);

          // Count unread messages (not seen by current user, not sent by current user)
          if (!msg.seenBy.includes(currentUser) && msg.user !== currentUser) {
            chatData.unreadCount++;
          }
        });

        // Convert to ChatPreview array
        const chatPreviews: ChatPreview[] = [];
        chatMap.forEach((data, clientUsername) => {
          // Sort messages by createdAt desc to get the latest
          data.messages.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });

          chatPreviews.push({
            clientUsername,
            lastMessage: data.messages[0],
            unreadCount: data.unreadCount,
          });
        });

        // Sort chats by last message time
        chatPreviews.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt?.toMillis() || 0;
          const bTime = b.lastMessage?.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });

        setChats(chatPreviews);
        setLoading(false);
      },
      (err) => {
        console.error('Chat list listener error:', err);
        setError('Failed to load chats');
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentUser]);

  return { chats, loading, error };
}
