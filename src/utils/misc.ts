import { parseLrc, parseTTML, parseYrc, type LyricLine } from "@applemusic-like-lyrics/lyric";

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
 * 把翻译合并进已解析的歌词行。
 *
 * 网易云的歌词响应把翻译放在**另一个字段**（`tlyric`）里，而 amll 的
 * `parseLrc` / `parseYrc` 只接受一个歌词字符串、不处理翻译 —— 所以这里按开始时间
 * 对齐自己合，填进 `LyricLine.translatedLyric`（渲染层会读这个字段并显示）。
 *
 * 用 ±20ms 的容差而不是精确匹配：原文与翻译的时间戳理论上一致，但不保证分毫不差，
 * 译文本身也常有缺行。
 *
 * 音译（`romalrc`）走的是同一套机制，对应字段是 `LyricLine.romanLyric` ——
 * 本次没做，要的话照抄一份即可。
 */
const mergeTranslation = (lines: LyricLine[], translationSrc: unknown): LyricLine[] => {
    if (typeof translationSrc !== 'string' || translationSrc === '') return lines;

    const translated = parseLrc(translationSrc);
    if (translated.length === 0) return lines;

    const TOLERANCE_MS = 20;
    let cursor = 0;

    for (const line of lines) {
        // 两侧都按时间升序，游标只往前走 —— 整体 O(n + m)，不是逐行从头找
        while (
            cursor < translated.length &&
            translated[cursor]!.startTime < line.startTime - TOLERANCE_MS
        ) {
            cursor++;
        }
        const candidate = translated[cursor];
        if (candidate && Math.abs(candidate.startTime - line.startTime) <= TOLERANCE_MS) {
            line.translatedLyric = candidate.words.map((w) => w.word).join('');
        }
    }

    return lines;
}

/**
 * 提取歌词数据，优先使用yrc，否则使用lrc，并把翻译（tlyric）合并进去
 * @param {Object} data - 包含歌词数据的对象
 * @returns {LyricLine[]} 解析后的歌词数据
 */
export const extractLeagcyLyrics = (data :any):LyricLine[] => {
    // ⚠️ 翻译必须**跟着原文的来源配对**，不能混用 —— 响应里是两套平行数据：
    //     逐字原文 yrc  ←→ 逐字翻译 ytlrc
    //     普通原文 lrc  ←→ 普通翻译 tlyric
    // 两者的时间戳不是同一套。实测同一首歌：yrc 首行 15950ms、ytlrc 首行也是 15950ms，
    // 而 tlyric 首行是 16030ms —— 差 80ms，逐行还各不相同。混用会让整首歌一个字都
    // 对不上（症状就是「载荷里明明有翻译，界面却没有」）。

    // 逐字歌词优先（信息量更大）
    if (data?.yrc?.lyric && data.yrc.version > 0) {
        return mergeTranslation(parseYrc(data.yrc.lyric), data?.ytlrc?.lyric);
    }

    // 回退到普通歌词
    if (data?.lrc?.lyric && data.lrc.version > 0) {
        return mergeTranslation(parseLrc(data.lrc.lyric), data?.tlyric?.lyric);
    }

    // 都没有歌词数据
    return [];
}

export const extractTTMLLyrics = (data :any):LyricLine[] => {
    return parseTTML(data).lines || [];
}