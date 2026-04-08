<script setup lang="ts">
import { ref, computed,watch } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import SearchInput from './components/SearchInput.vue';
import SongResults from './components/SongResults.vue';
import ArtistResults from './components/ArtistResults.vue';
import AlbumResults from './components/AlbumResults.vue';
import UserResults from './components/UserResults.vue';
import PlaylistResults from './components/PlaylistResults.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchIcon } from 'lucide-vue-next';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  verified: boolean;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseDate: string;
  songCount: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  isFollowing: boolean;
}

interface Playlist {
  id: string;
  title: string;
  creator: string;
  cover: string;
  songCount: string;
  playCount: string;
  likeCount: string;
  isLiked: boolean;
  description: string;
  updateTime: string;
}

const route = useRoute();
const router = useRouter();

watch( () => route.query.keywords,(newKeywords) =>{
  searchQuery.value = newKeywords as string;
})


const searchQuery = ref('');
const activeTab = ref('songs');
const isPlaying = ref(false);

const mockSongs: Song[] = [
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1' },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2' },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3' },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4' },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5' },
];

const mockArtists: Artist[] = [
  { id: '1', name: 'Taylor Swift', avatar: 'https://picsum.photos/200/200?random=6', fanCount: '123.4万', songCount: '89', verified: true },
  { id: '2', name: '周杰伦', avatar: 'https://picsum.photos/200/200?random=7', fanCount: '89.2万', songCount: '156', verified: true },
  { id: '3', name: 'Ed Sheeran', avatar: 'https://picsum.photos/200/200?random=8', fanCount: '67.1万', songCount: '45', verified: true },
  { id: '4', name: 'Adele', avatar: 'https://picsum.photos/200/200?random=9', fanCount: '54.3万', songCount: '23', verified: true },
  { id: '5', name: 'The Weeknd', avatar: 'https://picsum.photos/200/200?random=10', fanCount: '43.2万', songCount: '67', verified: true },
];

const mockAlbums: Album[] = [
  { id: '1', title: 'Midnights', artist: 'Taylor Swift', cover: 'https://picsum.photos/200/200?random=11', releaseDate: '2022', songCount: '13' },
  { id: '2', title: '1989', artist: 'Taylor Swift', cover: 'https://picsum.photos/200/200?random=12', releaseDate: '2014', songCount: '16' },
  { id: '3', title: '÷ (Divide)', artist: 'Ed Sheeran', cover: 'https://picsum.photos/200/200?random=13', releaseDate: '2017', songCount: '16' },
  { id: '4', title: '21', artist: 'Adele', cover: 'https://picsum.photos/200/200?random=14', releaseDate: '2011', songCount: '12' },
  { id: '5', title: 'Thriller', artist: 'Michael Jackson', cover: 'https://picsum.photos/200/200?random=15', releaseDate: '1982', songCount: '9' },
];

const mockUsers: User[] = [
  { id: '1', name: '音乐爱好者', avatar: 'https://picsum.photos/200/200?random=16', fanCount: '1.2万', songCount: '234', isFollowing: false },
  { id: '2', name: '深夜音乐人', avatar: 'https://picsum.photos/200/200?random=17', fanCount: '8.9千', songCount: '156', isFollowing: true },
  { id: '3', name: '旋律分享者', avatar: 'https://picsum.photos/200/200?random=18', fanCount: '3.4千', songCount: '89', isFollowing: false },
  { id: '4', name: '音乐制作人', avatar: 'https://picsum.photos/200/200?random=19', fanCount: '12.5万', songCount: '45', isFollowing: true },
  { id: '5', name: 'DJ小张', avatar: 'https://picsum.photos/200/200?random=20', fanCount: '5.6千', songCount: '342', isFollowing: false },
];

const mockPlaylists: Playlist[] = [
  { id: '1', title: '今日热门', creator: '系统推荐', cover: 'https://picsum.photos/200/200?random=21', songCount: '32', playCount: '12.3万', likeCount: '892', isLiked: false, description: '今日最热门的歌曲集合', updateTime: '2小时前' },
  { id: '2', title: '华语经典', creator: '音乐达人', cover: 'https://picsum.photos/200/200?random=22', songCount: '45', playCount: '8.9万', likeCount: '567', isLiked: true, description: '经典华语歌曲，回忆满满', updateTime: '1天前' },
  { id: '3', title: '电音节奏', creator: 'DJ小王', cover: 'https://picsum.photos/200/200?random=23', songCount: '28', playCount: '6.7万', likeCount: '432', isLiked: false, description: '动感电音，让你嗨翻天', updateTime: '3小时前' },
  { id: '4', title: '治愈系音乐', creator: '心灵音乐', cover: 'https://picsum.photos/200/200?random=24', songCount: '52', playCount: '9.8万', likeCount: '723', isLiked: true, description: '放松心情，治愈心灵', updateTime: '5小时前' },
  { id: '5', title: '摇滚力量', creator: '摇滚乐迷', cover: 'https://picsum.photos/200/200?random=25', songCount: '38', playCount: '7.6万', likeCount: '654', isLiked: false, description: '摇滚精神，永不灭', updateTime: '1天前' },
];

const filteredSongs = computed(() => {
  if (!searchQuery.value) return mockSongs;
  return mockSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredArtists = computed(() => {
  if (!searchQuery.value) return mockArtists;
  return mockArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredAlbums = computed(() => {
  if (!searchQuery.value) return mockAlbums;
  return mockAlbums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    album.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return mockUsers;
  return mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredPlaylists = computed(() => {
  if (!searchQuery.value) return mockPlaylists;
  return mockPlaylists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    playlist.creator.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleSearch = (query: string) => {
  if (query.trim()) {
     router.push({
    path: '/search',
    query: {
      keywords: query
    }
  })
  }
};

const handlePlaySong = (song: Song) => {
  isPlaying.value = !isPlaying.value;
  console.log('Playing song:', song.title);
};

const handleArtistClick = (artist: Artist) => {
  console.log('Artist clicked:', artist.name);
};

const handleAlbumClick = (album: Album) => {
  console.log('Album clicked:', album.title);
};

const handleUserClick = (user: User) => {
  console.log('User clicked:', user.name);
};

const handleFollowUser = (user: User) => {
  console.log('Follow user:', user.name);
};

const handlePlaylistClick = (playlist: Playlist) => {
  console.log('Playlist clicked:', playlist.title);
};

const handleLikePlaylist = (playlist: Playlist) => {
  console.log('Like playlist:', playlist.title);
};
</script>

<template>
  <div class="search-container min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
      <div class="section-header flex flex-col mb-8 ">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
          <span class="bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
          "{{ searchQuery }}" 的搜索结果
          </span>
        </h1>
        <p class="text-secondary mt-5 max-w-2xl">
          发现你喜欢的音乐、歌手和专辑
        </p>
      </div>
      <div class="max-w-4xl mx-auto mb-8">
        <SearchInput @search="handleSearch" />
      </div>
      <div class="glass-card rounded-2xl p-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid grid-cols-5 lg:w-[700px] mx-auto mb-8">
            <TabsTrigger value="songs">
              歌曲
            </TabsTrigger>
            <TabsTrigger value="artists">
              歌手
            </TabsTrigger>
            <TabsTrigger value="albums">
              专辑
            </TabsTrigger>
            <TabsTrigger value="playlists">
              歌单
            </TabsTrigger>
            <TabsTrigger value="users">
              用户
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs">
            <ScrollArea class="h-[600px]">
              <SongResults
                :songs="filteredSongs"
                :is-playing="isPlaying"
                @play-song="handlePlaySong"
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="artists">
            <ScrollArea class="h-[600px]">
              <ArtistResults
                :artists="filteredArtists"
                @artist-click="handleArtistClick"
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="albums">
            <ScrollArea class="h-[600px]">
              <AlbumResults
                :albums="filteredAlbums"
                @album-click="handleAlbumClick"
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="playlists">
            <ScrollArea class="h-[600px]">
              <PlaylistResults
                :playlists="filteredPlaylists"
                @playlist-click="handlePlaylistClick"
                @like-playlist="handleLikePlaylist"
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="users">
            <ScrollArea class="h-[600px]">
              <UserResults
                :users="filteredUsers"
                @user-click="handleUserClick"
                @follow-user="handleFollowUser"
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  padding: 1.25rem;
  opacity: 0.9;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background-color: var(--glass-bg);
  border-radius: 1%;
}

/* 毛玻璃效果卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
  background: rgba(17, 25, 40, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
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
  0%, 100% {
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
  .bg-circle-1, .bg-circle-2, .bg-circle-3 {
    filter: blur(40px);
  }
}
</style>