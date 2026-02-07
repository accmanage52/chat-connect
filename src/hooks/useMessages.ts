import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types/chat';

interface UseMessagesOptions {
  clientUsername: string;
  currentUser: string;
  autoMarkSeen?: boolean;
}

export function useMessages({ clientUsername, currentUser, autoMarkSeen = false }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!clientUsername) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, 'chats', clientUsername, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: Message[] = [];
        snapshot.forEach((docSnap) => {
          newMessages.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Message);
        });
        setMessages(newMessages);
        setLoading(false);

        // Auto-mark messages as seen for support role
        if (autoMarkSeen) {
          newMessages.forEach((msg) => {
            if (!msg.seenBy.includes(currentUser) && msg.user !== currentUser) {
              const msgRef = doc(db, 'chats', clientUsername, 'messages', msg.id);
              updateDoc(msgRef, {
                seenBy: arrayUnion(currentUser),
              }).catch(console.error);
            }
          });
        }
      },
      (err) => {
        console.error('Messages listener error:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [clientUsername, currentUser, autoMarkSeen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!clientUsername || !text.trim()) return;

      try {
        // Ensure parent chat document exists (for chat list discovery)
        const chatDocRef = doc(db, 'chats', clientUsername);
        await setDoc(chatDocRef, {
          clientUsername,
          updatedAt: Timestamp.now(),
        }, { merge: true });

        // Add the message
        const messagesRef = collection(db, 'chats', clientUsername, 'messages');
        await addDoc(messagesRef, {
          text: text.trim(),
          user: currentUser,
          createdAt: Timestamp.now(),
          seenBy: [currentUser],
        });
      } catch (err) {
        console.error('Send message error:', err);
        throw err;
      }
    },
    [clientUsername, currentUser]
  );

  const markAsSeen = useCallback(
    async (messageId: string) => {
      if (!clientUsername) return;

      try {
        const msgRef = doc(db, 'chats', clientUsername, 'messages', messageId);
        await updateDoc(msgRef, {
          seenBy: arrayUnion(currentUser),
        });
      } catch (err) {
        console.error('Mark as seen error:', err);
      }
    },
    [clientUsername, currentUser]
  );

  return { messages, loading, error, sendMessage, markAsSeen };
}
