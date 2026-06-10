export type Track = {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumTitle: string;
  albumId?: string;
  durationMs: number;
  coverUrl: string;
  streamUrl: string;
  genre: string;
  popularity: number;
  views: number;
  likes: number;
  isRemix: boolean;
  originalTrackId?: string;
};

export type Comment = {
  id: string;
  trackId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type Genre = {
  id: string;
  name: string;
};

export type Playlist = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  trackIds: string[];
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  isPremium: boolean;
};

export type HandoffPayload = {
  sessionId: string;
  trackId: string;
  positionMs: number;
  issuedAt: number;
};

