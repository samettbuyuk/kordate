export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'admin';
  gender?: 'female' | 'male' | 'other';
  age: number;
  bio: string;
  interests: string[];
  photoUrl: string;
  photoRevealed: boolean;
  harmonyScore: number;
  createdAt: number;
  isBanned?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  matchId: string;
  text: string;
  timestamp: number;
  wordCount: number;
  isWarning?: boolean;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  harmonyScore: number;
  messageCount: number;
  photosUnlocked: boolean;
  user1RequestedUnlock: boolean;
  user2RequestedUnlock: boolean;
  user1Rating?: number;
  user2Rating?: number;
  status: 'active' | 'blocked' | 'ended';
  createdAt: number;
  harmonyHistory?: { time: string; score: number }[];
}

export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  category: 'Cyber Talk' | 'Music Vibe' | 'Movie Sync' | 'Blind Quiz' | 'Deep Philosophy';
  participants: string[];
  pendingParticipants?: string[];
  maxParticipants: number;
  audience: 'karma' | 'female_only' | 'male_only';
  requiresApproval: boolean;
  isLive: boolean;
  createdAt: number;
  messages?: { id: string; sender: string; text: string; time: string }[];
}

export interface SharedRoom {
  roomCode: string;
  roomName: string;
  hostUsername: string;
  activeMediaUrl: string;
  mediaType: 'music' | 'watch';
  messages: { id: string; sender: string; text: string; time: string }[];
  xoxBoard: (string | null)[];
  xoxIsXNext: boolean;
  xoxWinner: string | null;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'dismissed';
}
