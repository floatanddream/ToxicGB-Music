<template>
  <div class="px-4 md:px-6" style="margin-bottom: 3rem;">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="playlist in playlists" :key="playlist.id" class="rounded-3xl p-6 transition-all duration-300" :style="{
        backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.6))',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
      }" @mouseenter="$event.currentTarget.style.transform = 'translateY(-8px)'"
        @mouseleave="$event.currentTarget.style.transform = 'translateY(0)'">
        <!-- 榜单标题 -->
        <div style="margin-bottom: 1.5rem;">
          <h3
            style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: var(--text-primary, #1e293b);">
            {{ playlist.title }}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary, #64748b); margin-top: 0.25rem;">{{
            playlist.subtitle }}</p>
        </div>

        <!-- 歌曲列表 -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div v-for="song in playlist.songs" :key="song.id"
            class="rounded-2xl p-4 transition-all duration-300 cursor-pointer relative" :style="{
              backgroundColor: song.isPlaying ? 'color-mix(in srgb, var(--primary, #3b82f6) 10%, transparent)' : 'var(--bg-card, rgba(255, 255, 255, 0.6))',
              border: song.isPlaying ? '1px solid color-mix(in srgb, var(--primary, #3b82f6) 30%, transparent)' : '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
              backdropFilter: 'blur(10px)',
            }" @mouseenter="hoveredSong = `${playlist.id}-${song.id}`" @mouseleave="hoveredSong = null">
            <!-- 主内容区域 -->
            <div style="display: flex; align-items: center; gap: 0.75rem; position: relative; z-index: 10;">
              <!-- 播放状态指示器 -->
              <div style="width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center;">
                <PlayIcon v-if="!song.isPlaying"
                  style="width: 1rem; height: 1rem; color: var(--primary, #3b82f6); cursor: pointer; transition: transform 0.2s ease;"
                  @mouseenter="$event.target.style.transform = 'scale(1.1)'"
                  @mouseleave="$event.target.style.transform = 'scale(1)'" @click="togglePlay(song)" />
                <div v-else style="display: flex; align-items: center; gap: 0.125rem;">
                  <span
                    style="width: 0.25rem; height: 0.5rem; background-color: var(--primary, #3b82f6); border-radius: 9999px; animation: pulse 1.5s infinite;"></span>
                  <span
                    style="width: 0.25rem; height: 0.75rem; background-color: var(--primary, #3b82f6); border-radius: 9999px; animation: pulse 1.5s infinite 0.1s;"></span>
                  <span
                    style="width: 0.25rem; height: 0.5rem; background-color: var(--primary, #3b82f6); border-radius: 9999px; animation: pulse 1.5s infinite 0.2s;"></span>
                </div>
              </div>

              <!-- 歌曲封面和信息 -->
              <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1 1 0%; min-width: 0px;">
                <!-- 封面图片 -->
                <img :src="song.coverUrl" :alt="song.title"
                  style="width: 3rem; height: 3rem; border-radius: 0.5rem; object-fit: cover; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;"
                  :style="{
                    boxShadow: song.isPlaying ? '0 0 0 2px var(--primary, #3b82f6), 0 0 20px rgba(59, 130, 246, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }" />

                <!-- 歌曲详情 -->
                <div style="min-width: 0px; flex: 1 1 0%;">
                  <h4
                    style="font-weight: 500; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.25rem; transition: all 0.3s ease;"
                    :style="{
                      color: song.isPlaying ? 'var(--primary, #3b82f6)' : 'var(--text-primary, #1e293b)',
                    }">
                    {{ song.title }}
                  </h4>
                  <div
                    style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-secondary, #64748b);">
                    <span
                      style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s ease; cursor: pointer;"
                      @mouseenter="$event.target.style.color = 'var(--text-primary, #1e293b)'"
                      @mouseleave="$event.target.style.color = 'var(--text-secondary, #64748b)'">{{ song.artist
                      }}</span>
                    <span
                      style="width: 0.25rem; height: 0.25rem; background-color: var(--text-secondary, #64748b); border-radius: 50%;"></span>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.75rem;">{{
                      formatDate(song.releaseDate) }}</span>
                  </div>
                </div>
              </div>

              <!-- 右侧操作区域 -->
              <div style="display: flex; align-items: center; gap: 0.25rem; opacity: 1;">
                <Button variant="ghost" size="icon"
                  style="width: 2rem; height: 2rem; border-radius: 9999px; transition: all 0.2s ease; background-color: transparent;"
                  :style="{
                    color: song.isLiked ? 'var(--primary, #3b82f6)' : 'var(--text-secondary, #64748b)',
                  }" @click="toggleLike(song)"
                  @mouseenter="$event.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary, #3b82f6) 10%, transparent)'"
                  @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'">
                  <HeartIcon style="width: 1rem; height: 1rem; transition: all 0.3s ease;" :style="{
                    color: song.isLiked ? 'var(--primary, #3b82f6)' : 'var(--text-secondary, #64748b)',
                    transform: song.isLiked ? 'scale(1.2)' : 'scale(1)',
                  }" />
                </Button>
              </div>
            </div>

            <!-- 正在播放的进度条 -->
            <div v-if="song.isPlaying"
              style="position: absolute; bottom: 0px; left: 0px; right: 0px; height: 0.125rem; background-color: color-mix(in srgb, var(--primary, #3b82f6) 30%, transparent);">
              <div
                style="height: 100%; background-color: var(--primary, #3b82f6); width: 65%; animation: pulse 2s infinite;">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, ClockIcon, HeartIcon, MoreHorizontalIcon } from 'lucide-vue-next';
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

interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  songs: Song[];
}

const hoveredSong = ref<string | null>(null);

const playlists = ref<Playlist[]>([
  {
    id: 'latest',
    title: '最新音乐',
    subtitle: '抢先试听新歌',
    songs: [
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
      }
    ]
  },
  {
    id: 'popular',
    title: '热门榜单',
    subtitle: '本周最火歌曲',
    songs: [
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
      },
      {
        id: 7,
        title: '青花瓷',
        artist: '周杰伦',
        album: '经典重现',
        coverUrl: 'https://picsum.photos/60/60?random=26',
        duration: '3:58',
        releaseDate: '2024-03-09',
        isPlaying: false,
        isLiked: true
      },
      {
        id: 8,
        title: '演员',
        artist: '薛之谦',
        album: '单曲',
        coverUrl: 'https://picsum.photos/60/60?random=27',
        duration: '4:26',
        releaseDate: '2024-03-08',
        isPlaying: false,
        isLiked: false
      },
      {
        id: 9,
        title: '年少有为',
        artist: '李荣浩',
        album: '专辑《李荣浩》',
        coverUrl: 'https://picsum.photos/60/60?random=28',
        duration: '4:07',
        releaseDate: '2024-03-07',
        isPlaying: false,
        isLiked: true
      },
      {
        id: 10,
        title: '告白气球',
        artist: '周杰伦',
        album: '《周杰伦的床边故事》',
        coverUrl: 'https://picsum.photos/60/60?random=29',
        duration: '3:35',
        releaseDate: '2024-03-06',
        isPlaying: false,
        isLiked: false
      }
    ]
  },
  {
    id: 'genre',
    title: '风格推荐',
    subtitle: '发现你的新喜好',
    songs: [
      {
        id: 11,
        title: '稻香',
        artist: '周杰伦',
        album: '《魔杰座》',
        coverUrl: 'https://picsum.photos/60/60?random=30',
        duration: '3:43',
        releaseDate: '2024-03-05',
        isPlaying: false,
        isLiked: true
      },
      {
        id: 12,
        title: '平凡之路',
        artist: '朴树',
        album: '《猎户星座》',
        coverUrl: 'https://picsum.photos/60/60?random=31',
        duration: '4:56',
        releaseDate: '2024-03-04',
        isPlaying: false,
        isLiked: false
      },
      {
        id: 13,
        title: '夜曲',
        artist: '周杰伦',
        album: '《11月的萧邦》',
        coverUrl: 'https://picsum.photos/60/60?random=32',
        duration: '3:48',
        releaseDate: '2024-03-03',
        isPlaying: false,
        isLiked: true
      },
      {
        id: 14,
        title: '像我这样的人',
        artist: '毛不易',
        album: '《平凡的一天》',
        coverUrl: 'https://picsum.photos/60/60?random=33',
        duration: '3:48',
        releaseDate: '2024-03-02',
        isPlaying: false,
        isLiked: false
      },
      {
        id: 15,
        title: '七里香',
        artist: '周杰伦',
        album: '《七里香》',
        coverUrl: 'https://picsum.photos/60/60?random=34',
        duration: '4:28',
        releaseDate: '2024-03-01',
        isPlaying: false,
        isLiked: true
      }
    ]
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

<style lang="css" scoped>
.playlist-column {
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}

.dark .playlist-column {
  background: rgba(30, 30, 40, 0.6);
}

.song-item {
  backdrop-filter: blur(10px);
}

/* 暗黑模式适配 */
.dark .song-item {
  background: rgba(40, 40, 50, 0.6);
}

.dark .song-item:hover {
  background: rgba(50, 50, 60, 0.8);
}

/* 文本颜色适配 */
.dark .playlist-column h3 {
  color: #f1f5f9;
}

.dark .playlist-column .subtitle {
  color: #94a3b8;
}

.dark .song-item h4 {
  color: #e2e8f0;
}

.dark .song-item .text-text-secondary {
  color: #cbd5e1;
}

.dark .song-item .text-text-tertiary {
  color: #64748b;
}

/* 播放指示器动画 */
.playing-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
}

.playing-indicator span {
  display: inline-block;
}

.delay-75 {
  animation-delay: 75ms !important;
}

.delay-150 {
  animation-delay: 150ms !important;
}

/* 过渡动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .playlist-column {
    border-radius: 2xl;
    padding: 1.5rem;
  }
}
</style>