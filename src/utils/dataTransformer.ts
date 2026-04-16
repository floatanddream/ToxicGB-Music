import * as MusicTypes from '@/types/musicTypes'
import type { Playlist } from '@/types/playlist';

  
  // 转换函数
export const transformToArtist = (rawArtist: any): MusicTypes.Artist => {
  return {
    id: String(rawArtist.id),
    name: rawArtist.name,
    avatar: rawArtist.picUrl,
    fanCount: String(rawArtist.fansSize),
    songCount: String(rawArtist.musicSize),
    verified: !!rawArtist.identityIconUrl, // 有认证图标即为认证歌手
  };
};
export const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export const transformAlbums = (rawAlbums: MusicTypes.RawAlbum, formatDate: boolean = false): MusicTypes.Album => {
  return {
    id: String(rawAlbums.id),
    title: rawAlbums.name,
    artist: rawAlbums.artists.map(transformToArtist),
    cover: rawAlbums.picUrl,
    releaseDate: formatDate ? formatTimestampToDate(rawAlbums.publishTime) : String(rawAlbums.publishTime),
    songCount: String(rawAlbums.size)
  };
}
export const transformToPlaylist = (rawPlaylist: any): MusicTypes.Playlist => {
  const creator: MusicTypes.User = {
    id: String(rawPlaylist.creator.userId),
    name: rawPlaylist.creator.nickname,
    avatar: rawPlaylist.creator.avatarUrl,
    fanCount: '0', // API 未返回粉丝数，需要额外获取或设默认值
    songCount: '0', // API 未返回歌曲数，需要额外获取或设默认值
    isFollowing: false, // API 未返回关注状态
  };
  // 转换 Playlist 主体
  return {
    id: String(rawPlaylist.id),
    title: rawPlaylist.name,
    creator,
    cover: rawPlaylist.coverImgUrl,
    songCount: String(rawPlaylist.trackCount),
    playCount: rawPlaylist.playCount, // 格式化播放量
    likeCount: String(rawPlaylist.bookCount), // bookCount 对应收藏数
    isLiked: rawPlaylist.subscribed, // subscribed 是收藏状态
    description: rawPlaylist.description || '',
    updateTime: '', // API 未返回更新时间，需要额外获取
  };
};
export const transformToUser = (rawUser: MusicTypes.RawUserProfile): MusicTypes.User => {
  return {
    id: String(rawUser.userId),
    name: rawUser.nickname,
    avatar: rawUser.avatarUrl,
    fanCount: '0', // 原始数据中没有粉丝数，需从其他接口获取
    songCount: '0', // 原始数据中没有歌曲数，需从其他接口获取
    isFollowing: rawUser.followed,
  };
};
export const transformToSong = (rawData: any) : MusicTypes.Song => {
  // 转换艺术家信息（从 ar 数组）
  const artists: MusicTypes.Artist[] = rawData.ar?.map((artist: any) => ({
    id: String(artist.id),
    name: artist.name,
    avatar: '', // 原数据中没有艺术家头像，可后续获取或留空
    fanCount: '0', // 原数据中没有粉丝数，可后续获取
    songCount: '0', // 原数据中没有歌曲数，可后续获取
    verified: false // 原数据中没有认证信息，默认 false
  })) || [];

  // 转换专辑信息
  const album: MusicTypes.Album = {
    id: String(rawData.al?.id || ''),
    title: rawData.al?.name || '',
    artist: artists, // 专辑的艺术家通常与歌曲相同
    cover: rawData.al?.picUrl || '',
    releaseDate: formatTimestampToDate(rawData.publishTime),
    songCount: '0' // 原数据中没有专辑歌曲数，可后续获取
  };

  // 格式化时长（毫秒转 mm:ss 格式）
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 构建 Song 对象
  const song: MusicTypes.Song = {
    id: String(rawData.id),
    title: rawData.name || '',
    aliasTitle: rawData.alias?.join(', ') || rawData.alia?.join(', ') || '', // 优先用 alias，其次 alia
    artist: artists,
    album: album,
    duration: formatDuration(rawData.dt || 0),
    cover: rawData.al?.picUrl || '' // 使用专辑封面
  };

  return song;
}

// 转换歌单数据（如果需要处理字段类型或格式）
export function transformPlaylistDetail(rawPlaylist: any): Playlist {
    return {
        id: String(rawPlaylist.id), // 将 number 转换为 string
        name: rawPlaylist.name,
        coverImgId: rawPlaylist.coverImgId,
        coverImgUrl: rawPlaylist.coverImgUrl,
        coverImgId_str: rawPlaylist.coverImgId_str,
        adType: rawPlaylist.adType,
        userId: rawPlaylist.userId,
        createTime: rawPlaylist.createTime,
        status: rawPlaylist.status,
        opRecommend: rawPlaylist.opRecommend,
        highQuality: rawPlaylist.highQuality,
        newImported: rawPlaylist.newImported,
        updateTime: rawPlaylist.updateTime,
        trackCount: rawPlaylist.trackCount,
        specialType: rawPlaylist.specialType,
        privacy: rawPlaylist.privacy,
        trackUpdateTime: rawPlaylist.trackUpdateTime,
        commentThreadId: rawPlaylist.commentThreadId,
        playCount: rawPlaylist.playCount,
        trackNumberUpdateTime: rawPlaylist.trackNumberUpdateTime,
        subscribedCount: rawPlaylist.subscribedCount,
        cloudTrackCount: rawPlaylist.cloudTrackCount,
        ordered: rawPlaylist.ordered,
        description: rawPlaylist.description,
        tags: rawPlaylist.tags,
        updateFrequency: rawPlaylist.updateFrequency,
        backgroundCoverId: rawPlaylist.backgroundCoverId,
        backgroundCoverUrl: rawPlaylist.backgroundCoverUrl,
        titleImage: rawPlaylist.titleImage,
        titleImageUrl: rawPlaylist.titleImageUrl,
        detailPageTitle: rawPlaylist.detailPageTitle,
        englishTitle: rawPlaylist.englishTitle,
        officialPlaylistType: rawPlaylist.officialPlaylistType,
        copied: rawPlaylist.copied,
        relateResType: rawPlaylist.relateResType,
        coverStatus: rawPlaylist.coverStatus,
        subscribers: rawPlaylist.subscribers?.map(transformToUser) || [],
        subscribed: rawPlaylist.subscribed,
        creator: rawPlaylist.creator, // 已经是 User 类型
        tracks: rawPlaylist.tracks?.map(transformToSong) || [],
        sharedPrivilege: rawPlaylist.sharedPrivilege,
        resEntrance: rawPlaylist.resEntrance,
        fromUsers: rawPlaylist.fromUsers,
        fromUserCount: rawPlaylist.fromUserCount,
        songFromUsers: rawPlaylist.songFromUsers
    };
}