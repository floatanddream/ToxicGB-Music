import type { Album } from '@/types/album';
import * as MusicTypes from '@/types/musicTypes'
import type { Playlist } from '@/types/playlist';

  
  // 转换函数
export const transformToArtist = (rawArtist: any): MusicTypes.Artist => {
  return {
    id: String(rawArtist.id),
    name: rawArtist.name,
    avatar: `${rawArtist.picUrl}?param=1024y1024` || `${rawArtist.img1v1Url}?param=1024y1024`,
    fanCount: String(rawArtist.fansSize),
    songCount: String(rawArtist.musicSize),
    verified: !!rawArtist.identityIconUrl, // 有认证图标即为认证歌手
  };
};
export const formatTimestampToDate = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
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
    cover: `${rawAlbums.picUrl}?param=1024y1024`,
    releaseDate: formatDate ? formatTimestampToDate(rawAlbums.publishTime) : String(rawAlbums.publishTime),
    songCount: String(rawAlbums.size)
  };
}
export const transformToPlaylist = (rawPlaylist: any): MusicTypes.Playlist => {
  const creator: MusicTypes.User = {
    id: String(rawPlaylist.creator.userId),
    name: rawPlaylist.creator.nickname,
    avatar: `${rawPlaylist.creator.avatarUrl}?param=1024y1024`,
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
    likeCount: String(rawPlaylist.bookCount | 0), // bookCount 对应收藏数
    isLiked: rawPlaylist.subscribed, // subscribed 是收藏状态
    description: rawPlaylist.description || '',
    updateTime: '', // API 未返回更新时间，需要额外获取
  };
};
export const transformToUser = (rawUser: MusicTypes.RawUserProfile): MusicTypes.User => {
  return {
    id: String(rawUser.userId),
    name: rawUser.nickname,
    avatar: `${rawUser.avatarUrl}?param=1024y1024`,
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
    cover: `${rawData.al?.picUrl}?param=1024y1024` || '',
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
    cover: `${rawData.al?.picUrl}?param=1024y1024` || '' // 使用专辑封面
  };

  return song;
}

// 转换歌单数据（如果需要处理字段类型或格式）
export function transformPlaylistDetail(rawPlaylist: any): Playlist {
    return {
        id: String(rawPlaylist.id), // 将 number 转换为 string
        name: rawPlaylist.name,
        coverImgId: rawPlaylist.coverImgId,
        coverImgUrl: `${rawPlaylist.coverImgUrl}?param=1024y1024`,
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

export function transformAlbumDetail(rawData: any) :Album {
    const { album, songs } = rawData;
    return {
        // 专辑信息
            id: album.id,
            name: album.name,
            picUrl: album.picUrl,
            blurPicUrl: album.blurPicUrl,
            type: album.type,
            subType: album.subType,
            publishTime: album.publishTime,
            description: album.description || album.briefDesc,
            size: album.size,
            artists: album.artists.map(transformToArtist),
            songs: songs.map(transformToSong),
            commentCount: album.info?.commentThread?.commentCount || 0,
            shareCount: album.info?.commentThread?.shareCount || 0
    };
}

import type { CommentListResponse, Comment } from '@/types/comment';

// 转换单条评论
const transformComment = (rawComment: any): Comment => {
    return {
        user: rawComment.user,
        beReplied: rawComment.beReplied || [],
        pendantData: rawComment.pendantData || null,
        showFloorComment: rawComment.showFloorComment || null,
        status: rawComment.status || 0,
        commentId: rawComment.commentId || 0,
        content: rawComment.content || '',
        richContent: rawComment.richContent || '',
        contentResource: rawComment.contentResource || null,
        time: rawComment.time || 0,
        timeStr: rawComment.timeStr || '',
        needDisplayTime: rawComment.needDisplayTime !== undefined ? rawComment.needDisplayTime : true,
        likedCount: rawComment.likedCount || 0,
        expressionUrl: rawComment.expressionUrl || null,
        commentLocationType: rawComment.commentLocationType || 0,
        parentCommentId: rawComment.parentCommentId || 0,
        decoration: rawComment.decoration || null,
        repliedMark: rawComment.repliedMark || null,
        grade: rawComment.grade || null,
        userBizLevels: rawComment.userBizLevels || null,
        ipLocation: rawComment.ipLocation || { ip: null, location: '', userId: null },
        owner: rawComment.owner || false,
        medal: rawComment.medal || null,
        likeAnimationMap: rawComment.likeAnimationMap || {},
        liked: rawComment.liked || false
    };
};

// 转换评论列表响应数据
export function transformCommentListResponse(rawData: any): CommentListResponse {
    return {
        isMusician: rawData.isMusician || false,
        cnum: rawData.cnum || 0,
        userId: rawData.userId || 0,
        topComments: (rawData.topComments || []).map(transformComment),
        moreHot: rawData.moreHot || false,
        hotComments: (rawData.hotComments || []).map(transformComment),
        commentBanner: rawData.commentBanner || null,
        code: rawData.code || 200,
        comments: (rawData.comments || []).map(transformComment),
        total: rawData.total || 0,
        more: rawData.more || false
    };
}