<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SearchInput from './components/SearchInput.vue';
import SongList from '@/components/common/pageComponents/SongList.vue';
import ArtistGrid from '@/components/common/pageComponents/ArtistGrid.vue';
import AlbumGrid from '@/components/common/pageComponents/AlbumGrid.vue';
import UserGrid from '@/components/common/pageComponents/UserGrid.vue';
import PlaylistGrid from '@/components/common/pageComponents/PlaylistGrid.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchIcon, Loader2 } from 'lucide-vue-next';
import { searchBySinger, searchByAlbum, searchByPlaylist, searchByUser, searchBySong } from '@/api/search';
import * as MusicTypes from '@/types/musicTypes'
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { transformAlbums, transformToArtist, transformToPlaylist, transformToSong, transformToUser } from '@/utils/dataTransformer'
const route = useRoute();
const searchArtistData = ref<Array<MusicTypes.Artist>>([]);
const searchAlbumData = ref<Array<MusicTypes.Album>>([]);
const searchPlaylistData = ref<Array<MusicTypes.Playlist>>([]);
const searchUserData = ref<Array<MusicTypes.User>>([]);
const searchSongData = ref<Array<MusicTypes.Song>>([]);
const loading = ref(false);
const searchStatus = ref({
  artist: false,
  album: false,
  playlist: false,
  user: false,
  song: false
});

const allSearchCompleted = computed(() => {
  return searchStatus.value.artist &&
    searchStatus.value.album &&
    searchStatus.value.playlist &&
    searchStatus.value.user &&
    searchStatus.value.song;
});

const resetSearchStatus = () => {
  searchStatus.value = {
    artist: false,
    album: false,
    playlist: false,
    user: false,
    song: false
  };
};

const searchArtist = async (keywords: string) => {
  try {
    const data = await searchBySinger(keywords as string);
    searchArtistData.value = data.result.artists.map(transformToArtist);
  } catch (error) {
    console.error('搜索歌手失败:', error);
    searchArtistData.value = [];
  } finally {
    searchStatus.value.artist = true;
  }
};
const searchAlbum = async (keywords: string) => {
  try {
    const data = await searchByAlbum(keywords as string);
    searchAlbumData.value = data.result.albums.map((item: MusicTypes.RawAlbum) => transformAlbums(item, true));
  } catch (error) {
    console.error('搜索专辑失败:', error);
    searchAlbumData.value = [];
  } finally {
    searchStatus.value.album = true;
  }
};
const searchPlaylist = async (keywords: string) => {
  try {
    const data = await searchByPlaylist(keywords as string);
    searchPlaylistData.value = data.result.playlists.map(transformToPlaylist);
  } catch (error) {
    console.error('搜索歌单失败:', error);
    searchPlaylistData.value = [];
  } finally {
    searchStatus.value.playlist = true;
  }
};
const searchUser = async (keywords: string) => {
  try {
    const data = await searchByUser(keywords as string);
    searchUserData.value = data.result.userprofiles.map(transformToUser);
  } catch (error) {
    console.error('搜索用户失败:', error);
    searchUserData.value = [];
  } finally {
    searchStatus.value.user = true;
  }
};
const searchSong = async (keywords: string) => {
  try {
    const data = await searchBySong(keywords as string);
    searchSongData.value = data.result.songs.map(transformToSong);
  } catch (error) {
    console.error('搜索歌曲失败:', error);
    searchSongData.value = [];
  } finally {
    searchStatus.value.song = true;
  }
};
const handelSearchAllType = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  resetSearchStatus();

  // 并行执行所有搜索
  Promise.all([
    searchSong(searchQuery.value),
    searchArtist(searchQuery.value),
    searchAlbum(searchQuery.value),
    searchPlaylist(searchQuery.value),
    searchUser(searchQuery.value)
  ]).finally(() => {
    loading.value = false;
  });
};

watch(() => route.query.keywords, async (newKeywords) => {
  searchQuery.value = newKeywords;
  handelSearchAllType();
});

const searchQuery = ref();
const activeTab = ref('songs');
const isPlaying = ref(false);

const handleSearch = (query: string) => {
  searchQuery.value = query;
  handelSearchAllType();
};

const handlePlaySong = (song: MusicTypes.Song) => {
  isPlaying.value = !isPlaying.value;
  console.log('Playing song:', song.title);
};

const handleArtistClick = (artist: MusicTypes.Artist) => {
  console.log('Artist clicked:', artist.name);
};

const handleAlbumClick = (album: MusicTypes.Album) => {
  console.log('Album clicked:', album.title);
};

const handleUserClick = (user: MusicTypes.User) => {
  console.log('User clicked:', user.name);
};

const handleFollowUser = (user: MusicTypes.User) => {
  console.log('Follow user:', user.name);
};

const handlePlaylistClick = (playlist: MusicTypes.Playlist) => {
  console.log('Playlist clicked:', playlist.title);
};

const handleLikePlaylist = (playlist: MusicTypes.Playlist) => {
  console.log('Like playlist:', playlist.title);
};

onMounted(() => {
  if (route.query.keywords) {
    searchQuery.value = route.query.keywords as string;
    handelSearchAllType();
  }
})
</script>

<template>
  <div class="glass-container min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
      <div class="section-header flex flex-col mb-8 ">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
          <span
            class="bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
            <span v-if="searchQuery">{{ searchQuery }} 的搜索结果</span>
            <span v-else>搜索音乐</span>
          </span>
        </h1>
        <p class="text-secondary mt-5 max-w-2xl">
          发现你喜欢的音乐、歌手和专辑
        </p>
      </div>
      <div class="max-w-4xl mx-auto mb-8">
        <SearchInput @search="handleSearch" />
      </div>

      <div v-if="!searchQuery" class="search-empty-state">
        <div class="max-w-2xl mx-auto text-center py-16">
          <div
            class="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <SearchIcon class="w-16 h-16 text-gray-400" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">输入关键词开始搜索</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">搜索歌曲、歌手、专辑、歌单或用户</p>

        </div>
      </div>

      <div v-else class="glass-card rounded-2xl p-6">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <Loader2 class="w-10 h-10 animate-spin text-gray-500" />
          <span class="ml-3 text-gray-600 dark:text-gray-400">正在搜索...</span>
        </div>

        <Tabs v-else v-model="activeTab" class="w-full">
          <div class="sticky top-10 z-20">
            <TabsList class="grid grid-cols-5 lg:w-[700px] mx-auto mb-8 tab-back ">
              <TabsTrigger value="songs">
                <div class="flex items-center gap-1 ">
                  <span >歌曲</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    ({{ searchSongData.length }})
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="artists">
                <div class="flex items-center gap-1">
                  <span>歌手</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    ({{ searchArtistData.length }})
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="albums">
                <div class="flex items-center gap-1">
                  <span>专辑</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    ({{ searchAlbumData.length }})
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="playlists">
                <div class="flex items-center gap-1">
                  <span>歌单</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    ({{ searchPlaylistData.length }})
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="users">
                <div class="flex items-center gap-1">
                  <span>用户</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    ({{ searchUserData.length }})
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          <!-- 添加过渡动画 -->
          <div class="relative">
            <Transition name="fade-scale" mode="out-in">
              <div :key="activeTab">
                <TabsContent value="songs" v-show="activeTab === 'songs'">
                  <SongList :songs="searchSongData" />
                </TabsContent>

                <TabsContent value="artists" v-show="activeTab === 'artists'">
                  <ArtistGrid :artists="searchArtistData" />
                </TabsContent>

                <TabsContent value="albums" v-show="activeTab === 'albums'">
                  <AlbumGrid :albums="searchAlbumData" />
                </TabsContent>

                <TabsContent value="playlists" v-show="activeTab === 'playlists'">
                  <PlaylistGrid :playlists="searchPlaylistData" />
                </TabsContent>

                <TabsContent value="users" v-show="activeTab === 'users'">
                  <UserGrid :users="searchUserData" />
                </TabsContent>
              </div>
            </Transition>
          </div>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>

.fade-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}

.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: perspective(800px) rotateX(8deg) scale(0.96);
  transform-origin: top center;
}

.fade-scale-leave-to {
  opacity: 0;
  transform: perspective(800px) rotateX(-5deg) scale(0.98);
  transform-origin: bottom center;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  bottom: -150px;
  right: -150px;
  animation-delay: 5s;
}

.bg-circle-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  top: 50%;
  left: 70%;
  animation-delay: 10s;
}

/* 玻璃态标签页 */
.glass-tab {
  background-color: transparent;
  border: none;
  transition: all 0.3s ease;
}

.glass-tab:hover {
  background-color: rgba(14, 165, 233, 0.1);
}

.glass-tab[data-state="active"] {
  background-color: rgba(14, 165, 233, 0.2);
  color: #0ea5e9;
}

.dark .glass-tab:hover {
  background-color: rgba(14, 165, 233, 0.15);
}

.dark .glass-tab[data-state="active"] {
  background-color: rgba(14, 165, 233, 0.3);
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.05);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {

  .bg-circle-1,
  .bg-circle-2,
  .bg-circle-3 {
    filter: blur(40px);
  }
}
</style>