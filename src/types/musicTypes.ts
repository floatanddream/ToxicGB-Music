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

// 原始数据接口（根据 JSON 结构定义）
export interface RawUserProfile {
  userId: number;
  nickname: string;
  avatarUrl: string;
  followed: boolean;
  // 注意：原始数据中没有直接的 fanCount 和 songCount
  // 需要从其他字段获取或设置默认值
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