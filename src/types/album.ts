import type { Artist, Song } from "./musicTypes";

// 专辑信息（精简版）
export interface Album {
    id?: number | string;
    name?: string;
    picUrl?: string;           // 封面图URL
    blurPicUrl?: string;       // 模糊封面图
    description?: string;      // 专辑描述
    publishTime?: number;      // 发布时间戳
    type?: string;             // 类型：Single/EP/Album等
    subType?: string;          // 子类型：录音室版等
    size?: number;             // 歌曲数量
    artists?: Artist[];        // 艺人列表（使用已定义的Artist类型）
    briefDesc?: string;        // 简介
    commentCount?: number;    
    shareCount?: number;      
    songs?: Song[];            
}