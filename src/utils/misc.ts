import { parseLrc, parseYrc, type LyricLine } from "@applemusic-like-lyrics/lyric";

export const shouldTruncate = (text: string | undefined) => {
  return text && text.length > 100;
};
export const getTruncatedDesc = (text: string | undefined) => {
  if (!text) return '';
  return shouldTruncate(text) ? text.slice(0, 100) + '...' : text;
};

export const formatTimestampToDate = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 提取歌词数据，优先使用yrc，否则使用lrc
 * @param {Object} data - 包含歌词数据的对象
 * @returns {LyricLine[]} 解析后的歌词数据
 */
export const extractLyrics = (data :any):LyricLine[] => {
    // 检查yrc是否存在且有内容
    if (data?.yrc?.lyric && data.yrc.version > 0) {
        return parseYrc(data?.yrc?.lyric);
    }
    
    // 回退到lrc
    if (data?.lrc?.lyric && data.lrc.version > 0) {
        return parseLrc(data?.lrc?.lyric);
    }
    // 都没有歌词数据
    return [];
}