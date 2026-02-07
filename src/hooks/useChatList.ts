import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
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
  const listenersRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        // Get all chat documents (each represents a client)
        const chatsRef = collection(db, 'chats');
        const chatsSnapshot = await getDocs(chatsRef);
        
        const chatPreviews: Map<string, ChatPreview> = new Map();

        // Set up listeners for each chat's messages
        chatsSnapshot.docs.forEach((chatDoc) => {
          const clientUsername = chatDoc.id;
          
          // Skip if already listening
          if (listenersRef.current.has(clientUsername)) return;

          const messagesRef = collection(db, 'chats', clientUsername, 'messages');
          const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const messages: Message[] = [];
              let unreadCount = 0;

              snapshot.forEach((doc) => {
                const msg = { id: doc.id, ...doc.data() } as Message;
                messages.push(msg);
                
                // Count unread messages (not seen by current user, not sent by current user)
                if (!msg.seenBy.includes(currentUser) && msg.user !== currentUser) {
                  unreadCount++;
                }
              });

              const preview: ChatPreview = {
                clientUsername,
                lastMessage: messages[0],
                unreadCount,
              };

              chatPreviews.set(clientUsername, preview);

              // Update state with sorted chats
              const sortedChats = Array.from(chatPreviews.values()).sort((a, b) => {
                const aTime = a.lastMessage?.createdAt?.toMillis() || 0;
                const bTime = b.lastMessage?.createdAt?.toMillis() || 0;
                return bTime - aTime;
              });

              setChats(sortedChats);
              setLoading(false);
            },
            (err) => {
              console.error('Chat listener error:', err);
            }
          );

          listenersRef.current.set(clientUsername, unsubscribe);
        });

        if (chatsSnapshot.empty) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch chats error:', err);
        setError('Failed to load chats');
        setLoading(false);
      }
    };

    fetchChats();

    return () => {
      // Cleanup all listeners
      listenersRef.current.forEach((unsubscribe) => unsubscribe());
      listenersRef.current.clear();
    };
  }, [currentUser]);

  return { chats, loading, error };
}
