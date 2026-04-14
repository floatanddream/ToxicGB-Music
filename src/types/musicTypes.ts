export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: Array<Artist>;
  cover: string;
  releaseDate: string;
  songCount: string;
}

export interface RawAlbum {
  id: number;
  name: string;
  artists: Array<{ name: string }>;
  picUrl: string;
  publishTime: number;
  size: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  isFollowing: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  creator: User;
  cover: string;
  songCount: string;
  playCount: string;
  likeCount: string;
  isLiked: boolean;
  description: string;
  updateTime: string;
}