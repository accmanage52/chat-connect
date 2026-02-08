import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PresenceData {
  isOnline: boolean;
  lastSeen: Timestamp;
  isTyping: boolean;
  typingIn?: string; // which chat they're typing in
}

interface UsePresenceOptions {
  username: string;
  enabled?: boolean;
}

export function usePresence({ username, enabled = true }: UsePresenceOptions) {
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Update presence status
  const updatePresence = useCallback(async (data: Partial<PresenceData>) => {
    if (!username || !enabled) return;
    
    try {
      const presenceRef = doc(db, 'presence', username);
      await setDoc(presenceRef, {
        ...data,
        lastSeen: Timestamp.now(),
      }, { merge: true });
    } catch (err) {
      console.error('Presence update error:', err);
    }
  }, [username, enabled]);

  // Set typing status
  const setTyping = useCallback(async (isTyping: boolean, chatId?: string) => {
    await updatePresence({ 
      isTyping, 
      typingIn: isTyping ? chatId : undefined 
    });
  }, [updatePresence]);

  // Set online status
  const setOnline = useCallback(async (isOnline: boolean) => {
    await updatePresence({ isOnline, isTyping: false });
  }, [updatePresence]);

  // Heartbeat to maintain online status
  useEffect(() => {
    if (!username || !enabled) return;

    // Set online immediately
    setOnline(true);

    // Heartbeat every 30 seconds
    heartbeatRef.current = setInterval(() => {
      updatePresence({ isOnline: true });
    }, 30000);

    // Handle page visibility
    const handleVisibility = () => {
      if (document.hidden) {
        updatePresence({ isOnline: false, isTyping: false });
      } else {
        updatePresence({ isOnline: true });
      }
    };

    // Handle beforeunload
    const handleUnload = () => {
      // Use sendBeacon for reliable offline update
      const presenceRef = doc(db, 'presence', username);
      updateDoc(presenceRef, { 
        isOnline: false, 
        isTyping: false,
        lastSeen: Timestamp.now() 
      }).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
      
      // Set offline on cleanup
      setOnline(false);
    };
  }, [username, enabled, setOnline, updatePresence]);

  return { setTyping, setOnline };
}

// Hook to watch another user's presence
export function useWatchPresence(username: string) {
  const [presence, setPresence] = useState<PresenceData | null>(null);

  useEffect(() => {
    if (!username) {
      setPresence(null);
      return;
    }

    const presenceRef = doc(db, 'presence', username);
    const unsubscribe = onSnapshot(presenceRef, (snap) => {
      if (snap.exists()) {
        setPresence(snap.data() as PresenceData);
      } else {
        setPresence(null);
      }
    }, (err) => {
      console.error('Presence watch error:', err);
    });

    return unsubscribe;
  }, [username]);

  // Consider offline if lastSeen > 60 seconds ago
  const isOnline = presence?.isOnline && 
    presence?.lastSeen && 
    (Date.now() - presence.lastSeen.toMillis() < 60000);

  const isTyping = presence?.isTyping || false;
  const typingIn = presence?.typingIn;

  return { isOnline: !!isOnline, isTyping, typingIn, lastSeen: presence?.lastSeen };
}
