<script setup lang="ts">
import { PlayIcon, PauseIcon, ClockIcon, HeartIcon, MoreHorizontalIcon } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ref } from 'vue';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  releaseDate: string;
  isPlaying: boolean;
  isLiked: boolean;
}

const songs = ref<Song[]>([
  {
    id: 1,
    title: '星光不问赶路人',
    artist: '林俊杰',
    album: '新专辑《时光旅人》',
    coverUrl: 'https://picsum.photos/60/60?random=20',
    duration: '3:45',
    releaseDate: '2024-03-15',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 2,
    title: '城市边缘',
    artist: '周杰伦',
    album: '单曲发行',
    coverUrl: 'https://picsum.photos/60/60?random=21',
    duration: '4:12',
    releaseDate: '2024-03-14',
    isPlaying: false,
    isLiked: false
  },
  {
    id: 3,
    title: '记忆碎片',
    artist: '邓紫棋',
    album: '《回忆拼图》',
    coverUrl: 'https://picsum.photos/60/60?random=22',
    duration: '3:28',
    releaseDate: '2024-03-13',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 4,
    title: '夜空中最亮的星',
    artist: '张杰',
    album: '重制版',
    coverUrl: 'https://picsum.photos/60/60?random=23',
    duration: '4:02',
    releaseDate: '2024-03-12',
    isPlaying: false,
    isLiked: false
  },
  {
    id: 5,
    title: '时光隧道',
    artist: '王菲',
    album: '经典回归',
    coverUrl: 'https://picsum.photos/60/60?random=24',
    duration: '3:56',
    releaseDate: '2024-03-11',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 6,
    title: '风继续吹',
    artist: '张国荣',
    album: '纪念版',
    coverUrl: 'https://picsum.photos/60/60?random=25',
    duration: '4:18',
    releaseDate: '2024-03-10',
    isPlaying: false,
    isLiked: false
  }
]);

const togglePlay = (song: Song) => {
  song.isPlaying = !song.isPlaying;
};

const toggleLike = (song: Song) => {
  song.isLiked = !song.isLiked;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return dateString;
};
</script>

<template>
  <div class="music-list">
    <div v-for="song in songs" :key="song.id" class="song-card">
      <!-- 左：封面 + 播放 -->
      <div class="cover-wrapper" @click="togglePlay(song)">
        <img :src="song.coverUrl" class="cover" />

        <div class="play-overlay">
          <PlayIcon v-if="!song.isPlaying" />
          <PauseIcon v-else />
        </div>
      </div>

      <!-- 中：信息 -->
      <div class="info">
        <div class="title-row">
          <h3 class="title">{{ song.title }}</h3>
          <span class="duration">{{ song.duration }}</span>
        </div>

        <div class="meta">
          <span class="artist">{{ song.artist }}</span>
          <span class="dot">•</span>
          <span class="album">{{ song.album }}</span>
        </div>

        <div class="date">{{ formatDate(song.releaseDate) }}</div>
      </div>

      <!-- 右：操作 -->
      <div class="actions">
        <button class="icon-btn like" @click="toggleLike(song)">
          <HeartIcon :class="{ liked: song.isLiked }" />
        </button>

        <button class="icon-btn more">
          <MoreHorizontalIcon />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.music-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 卡片整体 */
.song-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));

  transition: all 0.25s ease;
  cursor: pointer;
}

/* 暗黑模式适配 */
.dark .song-card {
  background: rgba(30, 30, 40, 0.6);
  border-color: var(--glass-border, rgba(255, 255, 255, 0.1));
}

/* hover 提升 */
.song-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.dark .song-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 封面 */
.cover-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

.cover {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
}

/* 播放按钮（悬浮） */
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;

  opacity: 0;
  transition: 0.2s;
}

.cover-wrapper:hover .play-overlay {
  opacity: 1;
}

.play-overlay svg {
  width: 24px;
  height: 24px;
  color: white;
}

/* 信息区 */
.info {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 15px;
  color: #222;
}

.dark .title {
  color: #f1f5f9;
}

.duration {
  font-size: 12px;
  color: #888;
}

.dark .duration {
  color: #94a3b8;
}

/* 次信息 */
.meta {
  margin-top: 4px;
  font-size: 13px;
  color: #666;

  display: flex;
  gap: 6px;
}

.dark .meta {
  color: #cbd5e1;
}

.artist:hover {
  color: #000;
}

.dark .artist:hover {
  color: #f8fafc;
}

/* 日期 */
.date {
  margin-top: 4px;
  font-size: 12px;
  color: #aaa;
}

.dark .date {
  color: #64748b;
}

/* 操作区 */
.actions {
  display: flex;
  gap: 8px;
}

/* 按钮 */
.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s;
  background-color: transparent;
}

/* hover 动效 */
.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.dark .icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* like 特效 */
.icon-btn.like svg {
  transition: all 0.2s;
  color: #666;
}

.dark .icon-btn.like svg {
  color: #cbd5e1;
}

.icon-btn.like svg.liked {
  color: #ff4d4f;
  fill: #ff4d4f;
  transform: scale(1.2);
}

/* 更多按钮 */
.icon-btn.more svg {
  color: #666;
}

.dark .icon-btn.more svg {
  color: #cbd5e1;
}
</style>