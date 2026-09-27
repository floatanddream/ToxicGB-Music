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
 * 把「副歌词」合并进已解析的歌词行 —— 翻译与音译都走这里。
 *
 * 网易云把它们放在**独立的平行字段**里（翻译 `tlyric`、音译 `romalrc`），
 * 而 amll 的 `parseLrc` / `parseYrc` 只接受一个歌词字符串、不处理它们。官方文档
 * 明说这是设计如此（「本库不会特别处理时间戳相同的歌词行... 使用者需自行决定如何
 * 使用」），所以按开始时间对齐自己合。
 *
 * 用 ±20ms 的容差而不是精确匹配：副歌词的时间戳理论上与原文一致，但不保证分毫不差，
 * 译文 / 音译本身也常有缺行。
 *
 * **原地修改** `lines` 并返回它，方便同一份原文连着合两种副歌词。
 *
 * @param field 填到哪一列 —— `translatedLyric`（翻译）或 `romanLyric`（音译）。
 *              两者渲染样式不同：翻译是常规副行，音译是更小更淡的一行。
 */
const mergeSubLyric = (
    lines: LyricLine[],
    subLyricSrc: unknown,
    field: 'translatedLyric' | 'romanLyric',
): LyricLine[] => {
    if (typeof subLyricSrc !== 'string' || subLyricSrc === '') return lines;

    const subLines = parseLrc(subLyricSrc);
    if (subLines.length === 0) return lines;

    const TOLERANCE_MS = 20;
    let cursor = 0;

    for (const line of lines) {
        // 两侧都按时间升序，游标只往前走 —— 整体 O(n + m)，不是逐行从头找
        while (
            cursor < subLines.length &&
            subLines[cursor]!.startTime < line.startTime - TOLERANCE_MS
        ) {
            cursor++;
        }
        const candidate = subLines[cursor];
        if (candidate && Math.abs(candidate.startTime - line.startTime) <= TOLERANCE_MS) {
            line[field] = candidate.words.map((w) => w.word).join('');
        }
    }

    return lines;
}

/**
 * 提取歌词数据：逐字（yrc）优先，否则普通（lrc），并把翻译与音译一并合上。
 * @param {Object} data - 包含歌词数据的对象
 * @returns {LyricLine[]} 解析后的歌词数据
 */
export const extractLeagcyLyrics = (data :any):LyricLine[] => {
    // ⚠️ 副歌词必须**跟着原文的来源配对**，不能混用 —— 响应里是两套平行数据：
    //     逐字原文 yrc  ←→ 逐字翻译 ytlrc、逐字音译 yromalrc
    //     普通原文 lrc  ←→ 普通翻译 tlyric、普通音译 romalrc
    // 两者的时间戳不是同一套。实测同一首歌：yrc 首行 15950ms、ytlrc 首行也是 15950ms，
    // 而 tlyric 首行是 16030ms —— 差 80ms，逐行还各不相同。混用会让整首歌一个字都
    // 对不上（症状就是「载荷里明明有翻译，界面却没有」）。

    // 逐字歌词优先（信息量更大）
    if (data?.yrc?.lyric && data.yrc.version > 0) {
        const lines = parseYrc(data.yrc.lyric);
        mergeSubLyric(lines, data?.ytlrc?.lyric, 'translatedLyric');
        mergeSubLyric(lines, data?.yromalrc?.lyric, 'romanLyric');
        return lines;
    }

    // 回退到普通歌词
    if (data?.lrc?.lyric && data.lrc.version > 0) {
        const lines = parseLrc(data.lrc.lyric);
        mergeSubLyric(lines, data?.tlyric?.lyric, 'translatedLyric');
        mergeSubLyric(lines, data?.romalrc?.lyric, 'romanLyric');
        return lines;
    }

    // 都没有歌词数据
    return [];
}

export const extractTTMLLyrics = (data :any):LyricLine[] => {
    return parseTTML(data).lines || [];
}