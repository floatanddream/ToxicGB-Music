import type { AvatarDetail } from "./artist"

export interface UserInfo {
  id: string
  username: string
  avatar: string
  email: string
  role: string
}

// 用户信息
export interface User {
    backgroundUrl: string;
    birthday: number;
    detailDescription: string;
    authenticated: boolean;
    gender: number;
    city: number;
    signature: string;
    description: string;
    remarkName: string | null;
    shortUserName: string;
    accountStatus: number;
    locationStatus: number;
    avatarImgId: number;
    defaultAvatar: boolean;
    province: number;
    nickname: string;
    expertTags: string | null;
    djStatus: number;
    avatarUrl: string;
    accountType: number;
    authStatus: number;
    vipType: number;
    userName: string;
    followed: boolean;
    userId: number;
    lastLoginIP: string;
    lastLoginTime: number;
    authenticationTypes: number;
    mutual: boolean;
    createTime: number;
    anchor: boolean;
    authority: number;
    backgroundImgId: number;
    userType: number;
    experts: string | null;
    avatarDetail: AvatarDetail;
}