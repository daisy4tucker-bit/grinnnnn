/**
 * Real-Time Cross-Tab / Cross-Window Live Chat Synchronization
 * Enables seamless two-way chat between Visitor and Escort/Receiver across multiple tabs or windows
 * without requiring any bot or AI simulated auto-messages.
 */

import { ChatMessage, TapType, SignInRecord } from '../types';

export interface ChatSyncEvent {
  type: 'NEW_MESSAGE' | 'SEND_TAP' | 'TYPING' | 'MEDIA_EXPIRED' | 'MESSAGES_READ' | 'SIGN_IN';
  profileId?: string;
  senderRole?: 'visitor' | 'escort';
  message?: ChatMessage;
  tapType?: TapType;
  isTyping?: boolean;
  messageId?: string;
  readAt?: string;
  signInRecord?: SignInRecord;
  timestamp: number;
}

const CHANNEL_NAME = 'grindr_private_chat_sync_v1';
let channel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment, falling back to localStorage');
}

export function broadcastChatEvent(event: Omit<ChatSyncEvent, 'timestamp'>) {
  const payload: ChatSyncEvent = {
    ...event,
    timestamp: Date.now(),
  };

  // 1. Broadcast via native BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed:', e);
    }
  }

  // 2. Storage event fallback for cross-tab sync
  try {
    localStorage.setItem('grindr_chat_sync_event', JSON.stringify(payload));
  } catch (e) {
    // Ignore storage quota
  }
}

export function subscribeToChatEvents(callback: (event: ChatSyncEvent) => void): () => void {
  const onBroadcastMessage = (e: MessageEvent<ChatSyncEvent>) => {
    if (e.data && e.data.type) {
      callback(e.data);
    }
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === 'grindr_chat_sync_event' && e.newValue) {
      try {
        const data: ChatSyncEvent = JSON.parse(e.newValue);
        callback(data);
      } catch (err) {
        // ignore
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', onBroadcastMessage);
  }
  window.addEventListener('storage', onStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', onBroadcastMessage);
    }
    window.removeEventListener('storage', onStorage);
  };
}
