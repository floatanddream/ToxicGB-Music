import type { AvatarDetail } from "./artist";

// IP归属地信息
export interface IPLocation {
    ip: string | null;
    location: string;
    userId: number | null;
}

// VIP权益信息
export interface VipRights {
    associator: null;
    musicPackage: null;
    redplus: null;
    redVipAnnualCount: number;
    redVipLevel: number;
    relationType: number;
    memberLogo: null;
    extInfo: null;
}

// 评论中的用户信息（简化版，实际接口返回的字段较少）
export interface CommentUser {
    locationInfo: null;
    liveInfo: null;
    anonym: number;
    highlight: boolean;
    avatarDetail: AvatarDetail | null;
    avatarUrl: string;
    userType: number;
    followed: boolean;
    mutual: boolean;
    remarkName: string | null;
    socialUserId: string | null;
    vipRights: VipRights | null;
    nickname: string;
    authStatus: number;
    expertTags: string | null;
    experts: string | null;
    vipType: number;
    commonIdentity: null;
    userId: number;
    target: null;
}

// 被回复的评论
export interface BeRepliedComment {
    user: CommentUser;
    beRepliedCommentId: number;
    content: string;
    richContent: string;
    status: number;
    expressionUrl: string | null;
    ipLocation: IPLocation;
}

// 评论装饰信息
export interface Decoration {
    repliedByAuthorCount?: number;
}

// 评论点赞动画映射
export interface LikeAnimationMap {
    [key: string]: unknown;
}

// 单条评论
export interface Comment {
    user: CommentUser;
    beReplied: BeRepliedComment[];
    pendantData: null;
    showFloorComment: null;
    status: number;
    commentId: number;
    content: string;
    richContent: string;
    contentResource: null;
    time: number;
    timeStr: string;
    needDisplayTime: boolean;
    likedCount: number;
    expressionUrl: string | null;
    commentLocationType: number;
    parentCommentId: number;
    decoration: Decoration | null;
    repliedMark: null;
    grade: null;
    userBizLevels: null;
    ipLocation: IPLocation;
    owner: boolean;
    medal: null;
    likeAnimationMap: LikeAnimationMap;
    liked: boolean;
}

// 评论列表响应
export interface CommentListResponse {
    isMusician: boolean;
    cnum: number;
    userId: number;
    topComments: Comment[];
    moreHot: boolean;
    hotComments: Comment[];
    commentBanner: null;
    code: number;
    comments: Comment[];
    total: number;
    more: boolean;
}