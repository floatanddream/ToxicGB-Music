import type { User } from "./user";

// 身份标识
export interface Identify {
    imageUrl: string;
    imageDesc: string;
    actionUrl: string;
}

// 排名信息
export interface Rank {
    rank: number;
    type: number;
}

// 艺人信息
export interface Artist {
    id: number;
    cover: string;
    avatar: string;
    name: string;
    transNames: string[];
    alias: string[];
    identities: string[];
    identifyTag: string[];
    briefDesc: string;
    rank: Rank;
    albumSize: number;
    musicSize: number;
    mvSize: number;
}

// 简单用户身份标识
export interface SimpleUserIdentify {
    imageUrl: string;
    imageDesc: string;
    actionUrl: string;
}

// 次要专家身份
export interface SecondaryExpertIdentity {
    expertIdentiyId: number;
    expertIdentiyName: string;
    expertIdentiyCount: number;
}

// 头像详情
export interface AvatarDetail {
    userType: number;
    identityLevel: number;
    identityIconUrl: string;
}



// API 返回的数据结构
export interface ArtistData {
    videoCount: number;
    identify: Identify;
    artist: Artist;
    simpleUserIdentify: SimpleUserIdentify;
    blacklist: boolean;
    preferShow: number;
    showPriMsg: boolean;
    secondaryExpertIdentiy: SecondaryExpertIdentity[];
    eventCount: number;
    user: User;
}