export interface Profile {
  id: string;
  name: string;
  age: number;
  distance: string;
  distanceMeters: number;
  isOnline: boolean;
  lastActive: string;
  image: string;
  album: string[];
  headline: string;
  bio: string;
  lookingFor: string[];
  tribes: string[];
  height: string;
  weight: string;
  bodyType: string;
  relationshipStatus: string;
  position: string;
  ethnicity: string;
  locationCity: string;
  health: {
    testedDate: string;
    prep: boolean;
    covidVaccinated: boolean;
  };
  social: {
    instagram?: string;
    spotify?: string;
  };
  isFavorite?: boolean;
  hasAudioNote?: boolean;
  audioDuration?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  escortInfo?: EscortInfo;
}

export interface EscortInfo {
  size?: string;
  orientation?: string;
  foreskin?: string;
  safeBb?: string;
  bodyHair?: string;
  hairColor?: string;
  eyeColor?: string;
  style?: string;
  tattoos?: string;
  piercings?: string;
  smoking?: string;
  zodiac?: string;
  services?: string[];
  languages?: string[];
  intoTags?: string[];
}

export type TapType = 'flame' | 'devil' | 'wave' | 'water' | 'coffee';

export type MessageMediaType = 'text' | 'image' | 'video' | 'audio' | 'location';

export interface ChatMessage {
  id: string;
  senderId: 'me' | string;
  text?: string;
  tapType?: TapType;
  mediaType?: MessageMediaType;
  imageUrl?: string;
  videoUrl?: string;
  videoDuration?: string;
  thumbnailUrl?: string;
  isExpiring?: boolean;
  isExpired?: boolean;
  viewOnceSeconds?: number;
  isAudio?: boolean;
  audioDuration?: string;
  isLocation?: boolean;
  locationName?: string;
  timestamp: string;
  read: boolean;
  readAt?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  profileId: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface FilterState {
  onlineOnly: boolean;
  photosOnly: boolean;
  maxDistanceKm: number;
  minAge: number;
  maxAge: number;
  selectedTribes: string[];
  selectedLookingFor: string[];
}

export interface ProfileReport {
  id: string;
  profileId: string;
  profileName: string;
  reason: string;
  details?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface SignInRecord {
  id: string;
  name: string;
  emailOrPhone: string;
  authMethod: 'email' | 'phone';
  password?: string;
  rememberMe?: boolean;
  timestamp: string;
  dateFormatted: string;
  userAgent?: string;
  status: 'active' | 'archived';
}
