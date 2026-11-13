import { ChatMessage, Conversation } from '../types';

/**
 * Extracts or parses a numerical timestamp (epoch milliseconds) from a ChatMessage.
 * Handles:
 * - Direct ID timestamp e.g. "msg-1731284920123-ab12"
 * - 12-hour formatted time strings e.g. "9:54 PM", "9:42 PM", "8:15 PM"
 * - Relative strings e.g. "Yesterday", "Just now", "2d ago"
 * - ISO string or Date-parseable string
 */
export function getMessageTimestampScore(msg?: ChatMessage | null): number {
  if (!msg) return 0;

  // 1. Check if ID contains a valid timestamp (ms since epoch)
  if (msg.id) {
    const idMatch = msg.id.match(/\b(\d{13})\b/);
    if (idMatch) {
      const ts = parseInt(idMatch[1], 10);
      if (!isNaN(ts) && ts > 1600000000000) {
        return ts;
      }
    }
  }

  const raw = (msg.timestamp || '').trim();
  if (!raw) return 0;

  if (raw.toLowerCase() === 'just now') {
    return Date.now();
  }

  // 2. Parse 12-hour or 24-hour time e.g. "9:54 PM", "9:42 PM", "8:15 PM"
  const time12Match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (time12Match) {
    let hours = parseInt(time12Match[1], 10);
    const minutes = parseInt(time12Match[2], 10);
    const seconds = time12Match[3] ? parseInt(time12Match[3], 10) : 0;
    const meridiem = time12Match[4]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    const d = new Date();
    d.setHours(hours, minutes, seconds, 0);
    return d.getTime();
  }

  // 3. Handle 'Yesterday'
  if (raw.toLowerCase().includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(20, 0, 0, 0);
    return d.getTime();
  }

  // 4. Handle "X days ago" or "Xd ago"
  const daysAgoMatch = raw.match(/(\d+)\s*(?:d|days?)\s*ago/i);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }

  // 5. Try standard Date.parse
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

/**
 * Calculates a recency timestamp score for a provider's conversation.
 * Returns -1 if the conversation has no messages (so it ranks after all active chats).
 */
export function getConversationRecencyScore(conv?: Conversation | null): number {
  if (!conv) return -1;
  const messages = Array.isArray(conv.messages) ? conv.messages : [];

  // If there are messages, take the most recent message
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    const score = getMessageTimestampScore(lastMsg);
    if (score > 0) return score;
  }

  // If lastMessage is populated with actual content
  if (
    conv.lastMessage &&
    (conv.lastMessage.text ||
      conv.lastMessage.tapType ||
      conv.lastMessage.imageUrl ||
      conv.lastMessage.videoUrl ||
      conv.lastMessage.isLocation)
  ) {
    const score = getMessageTimestampScore(conv.lastMessage);
    if (score > 0) return score;
    return 1;
  }

  return -1;
}
