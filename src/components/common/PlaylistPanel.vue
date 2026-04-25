<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { X, ListMusic } from 'lucide-vue-next'
import type { MusicType } from '@/types/musicTypes'

defineProps<{
  playlist: MusicType.Song[]
  currentSong: MusicType.Song | null
}>()

defineEmits<{
  close: []
  playSong: [song: MusicType.Song]
}>()

// Mock 数据
const mockPlaylist: MusicType.Song[] = [
  { id: '1', title: '晴天', aliasTitle: 'Sunny Day', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '1', title: '叶惠美', artist: [], cover: 'https://picsum.photos/50/50?random=1', releaseDate: '2003', songCount: '10' }, duration: '04:29', cover: 'https://picsum.photos/50/50?random=1' },
  { id: '2', title: '稻香', aliasTitle: 'Rice Fragrance', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '2', title: '魔杰座', artist: [], cover: 'https://picsum.photos/50/50?random=2', releaseDate: '2008', songCount: '10' }, duration: '03:43', cover: 'https://picsum.photos/50/50?random=2' },
  { id: '3', title: '七里香', aliasTitle: 'Seven Mile Fragrance', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '3', title: '七里香', artist: [], cover: 'https://picsum.photos/50/50?random=3', releaseDate: '2004', songCount: '10' }, duration: '04:59', cover: 'https://picsum.photos/50/50?random=3' },
  { id: '4', title: '夜曲', aliasTitle: 'Nocturne', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '4', title: '十一月的萧邦', artist: [], cover: 'https://picsum.photos/50/50?random=4', releaseDate: '2005', songCount: '10' }, duration: '04:33', cover: 'https://picsum.photos/50/50?random=4' },
  { id: '5', title: '青花瓷', aliasTitle: 'Blue and White Porcelain', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '5', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=5', releaseDate: '2007', songCount: '10' }, duration: '03:59', cover: 'https://picsum.photos/50/50?random=5' },
  { id: '6', title: '听妈妈的话', aliasTitle: 'Listen to Mom', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '6', title: '依然范特西', artist: [], cover: 'https://picsum.photos/50/50?random=6', releaseDate: '2006', songCount: '10' }, duration: '04:20', cover: 'https://picsum.photos/50/50?random=6' },
  { id: '7', title: '双截棍', aliasTitle: 'Nunchaku', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '7', title: '范特西', artist: [], cover: 'https://picsum.photos/50/50?random=7', releaseDate: '2001', songCount: '10' }, duration: '03:30', cover: 'https://picsum.photos/50/50?random=7' },
  { id: '8', title: '龙卷风', aliasTitle: 'Tornado', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '8', title: '杰迷', artist: [], cover: 'https://picsum.photos/50/50?random=8', releaseDate: '2000', songCount: '10' }, duration: '04:10', cover: 'https://picsum.photos/50/50?random=8' },
  { id: '9', title: '以父之名', aliasTitle: 'In the Name of the Father', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '9', title: '叶惠美', artist: [], cover: 'https://picsum.photos/50/50?random=9', releaseDate: '2003', songCount: '10' }, duration: '05:42', cover: 'https://picsum.photos/50/50?random=9' },
  { id: '10', title: '东风破', aliasTitle: 'East Wind Breaks', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '10', title: '叶惠美', artist: [], cover: 'https://picsum.photos/50/50?random=10', releaseDate: '2003', songCount: '10' }, duration: '04:35', cover: 'https://picsum.photos/50/50?random=10' },
  { id: '11', title: '简单爱', aliasTitle: 'Simple Love', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '11', title: '范特西', artist: [], cover: 'https://picsum.photos/50/50?random=11', releaseDate: '2001', songCount: '10' }, duration: '04:30', cover: 'https://picsum.photos/50/50?random=11' },
  { id: '12', title: '安静', aliasTitle: 'Quiet', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '12', title: '范特西', artist: [], cover: 'https://picsum.photos/50/50?random=12', releaseDate: '2001', songCount: '10' }, duration: '05:20', cover: 'https://picsum.photos/50/50?random=12' },
  { id: '13', title: '退后', aliasTitle: 'Step Back', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '13', title: '依然范特西', artist: [], cover: 'https://picsum.photos/50/50?random=13', releaseDate: '2006', songCount: '10' }, duration: '04:10', cover: 'https://picsum.photos/50/50?random=13' },
  { id: '14', title: '甜甜的', aliasTitle: 'Sweet', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '14', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=14', releaseDate: '2007', songCount: '10' }, duration: '04:18', cover: 'https://picsum.photos/50/50?random=14' },
  { id: '15', title: '彩虹', aliasTitle: 'Rainbow', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '15', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=15', releaseDate: '2007', songCount: '10' }, duration: '04:35', cover: 'https://picsum.photos/50/50?random=15' },
  { id: '16', title: '最长的电影', aliasTitle: 'The Longest Movie', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '16', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=16', releaseDate: '2007', songCount: '10' }, duration: '04:25', cover: 'https://picsum.photos/50/50?random=16' },
  { id: '17', title: '青花瓷', aliasTitle: 'Blue and White Porcelain', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '17', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=17', releaseDate: '2007', songCount: '10' }, duration: '03:59', cover: 'https://picsum.photos/50/50?random=17' },
  { id: '18', title: '魔术先生', aliasTitle: 'Mr. Magic', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '18', title: '我很忙', artist: [], cover: 'https://picsum.photos/50/50?random=18', releaseDate: '2007', songCount: '10' }, duration: '03:45', cover: 'https://picsum.photos/50/50?random=18' },
  { id: '19', title: '时光机', aliasTitle: 'Time Machine', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '19', title: '魔杰座', artist: [], cover: 'https://picsum.photos/50/50?random=19', releaseDate: '2008', songCount: '10' }, duration: '04:15', cover: 'https://picsum.photos/50/50?random=19' },
  { id: '20', title: '说好的幸福呢', aliasTitle: 'Where is the Promised Happiness', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '20', title: '魔杰座', artist: [], cover: 'https://picsum.photos/50/50?random=20', releaseDate: '2008', songCount: '10' }, duration: '04:00', cover: 'https://picsum.photos/50/50?random=20' },
  { id: '21', title: '花海', aliasTitle: 'Ocean of Flowers', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '21', title: '魔杰座', artist: [], cover: 'https://picsum.photos/50/50?random=21', releaseDate: '2008', songCount: '10' }, duration: '04:25', cover: 'https://picsum.photos/50/50?random=21' },
  { id: '22', title: '免费教学录影带', aliasTitle: 'Free Teaching Video', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '22', title: '跨时代', artist: [], cover: 'https://picsum.photos/50/50?random=22', releaseDate: '2010', songCount: '10' }, duration: '03:55', cover: 'https://picsum.photos/50/50?random=22' },
  { id: '23', title: '超人会飞', aliasTitle: 'Superman Can Fly', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '23', title: '跨时代', artist: [], cover: 'https://picsum.photos/50/50?random=23', releaseDate: '2010', songCount: '10' }, duration: '04:30', cover: 'https://picsum.photos/50/50?random=23' },
  { id: '24', title: '跨时代', aliasTitle: 'A New Era', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '24', title: '跨时代', artist: [], cover: 'https://picsum.photos/50/50?random=24', releaseDate: '2010', songCount: '10' }, duration: '04:20', cover: 'https://picsum.photos/50/50?random=24' },
  { id: '25', title: '说了再见', aliasTitle: 'Said Goodbye', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '25', title: '跨时代', artist: [], cover: 'https://picsum.photos/50/50?random=25', releaseDate: '2010', songCount: '10' }, duration: '04:40', cover: 'https://picsum.photos/50/50?random=25' },
  { id: '26', title: '烟花易冷', aliasTitle: 'Fireworks Cold', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '26', title: '跨时代', artist: [], cover: 'https://picsum.photos/50/50?random=26', releaseDate: '2010', songCount: '10' }, duration: '04:15', cover: 'https://picsum.photos/50/50?random=26' },
  { id: '27', title: '惊叹号', aliasTitle: 'Exclamation Mark', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '27', title: '惊叹号', artist: [], cover: 'https://picsum.photos/50/50?random=27', releaseDate: '2011', songCount: '10' }, duration: '03:50', cover: 'https://picsum.photos/50/50?random=27' },
  { id: '28', title: '爱你没差', aliasTitle: 'Love You No Difference', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '28', title: '惊叹号', artist: [], cover: 'https://picsum.photos/50/50?random=28', releaseDate: '2011', songCount: '10' }, duration: '04:20', cover: 'https://picsum.photos/50/50?random=28' },
  { id: '29', title: '琴伤', aliasTitle: 'Piano Injury', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '29', title: '惊叹号', artist: [], cover: 'https://picsum.photos/50/50?random=29', releaseDate: '2011', songCount: '10' }, duration: '04:30', cover: 'https://picsum.photos/50/50?random=29' },
  { id: '30', title: '公主病', aliasTitle: 'Princess Disease', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '30', title: '惊叹号', artist: [], cover: 'https://picsum.photos/50/50?random=30', releaseDate: '2011', songCount: '10' }, duration: '03:40', cover: 'https://picsum.photos/50/50?random=30' },
  { id: '31', title: '比较大', aliasTitle: 'Compare Bigger', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '31', title: '十二新歌', artist: [], cover: 'https://picsum.photos/50/50?random=31', releaseDate: '2012', songCount: '10' }, duration: '03:50', cover: 'https://picsum.photos/50/50?random=31' },
  { id: '32', title: '红尘客栈', aliasTitle: 'Red Dust Inn', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '32', title: '十二新歌', artist: [], cover: 'https://picsum.photos/50/50?random=32', releaseDate: '2012', songCount: '10' }, duration: '04:20', cover: 'https://picsum.photos/50/50?random=32' },
  { id: '33', title: '手写的从前', aliasTitle: 'Handwritten Past', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '33', title: '十二新歌', artist: [], cover: 'https://picsum.photos/50/50?random=33', releaseDate: '2012', songCount: '10' }, duration: '04:30', cover: 'https://picsum.photos/50/50?random=33' },
  { id: '34', title: '爱你没差', aliasTitle: 'Love You No Difference', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '34', title: '十二新歌', artist: [], cover: 'https://picsum.photos/50/50?random=34', releaseDate: '2012', songCount: '10' }, duration: '04:25', cover: 'https://picsum.photos/50/50?random=34' },
  { id: '35', title: '她妈妈不喜欢我', aliasTitle: 'Her Mom Doesnt Like Me', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '35', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=35', releaseDate: '2014', songCount: '10' }, duration: '03:55', cover: 'https://picsum.photos/50/50?random=35' },
  { id: '36', title: '鞋子特大号', aliasTitle: 'Big Size Shoes', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '36', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=36', releaseDate: '2014', songCount: '10' }, duration: '04:15', cover: 'https://picsum.photos/50/50?random=36' },
  { id: '37', title: '算死草', aliasTitle: 'Dead Reckoning', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '37', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=37', releaseDate: '2014', songCount: '10' }, duration: '03:45', cover: 'https://picsum.photos/50/50?random=37' },
  { id: '38', title: '天涯过客', aliasTitle: 'Passerby', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '38', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=38', releaseDate: '2014', songCount: '10' }, duration: '04:35', cover: 'https://picsum.photos/50/50?random=38' },
  { id: '39', title: '怎么了', aliasTitle: 'What Happened', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '39', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=39', releaseDate: '2014', songCount: '10' }, duration: '04:00', cover: 'https://picsum.photos/50/50?random=39' },
  { id: '40', title: '一点点', aliasTitle: 'A Little', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '40', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=40', releaseDate: '2014', songCount: '10' }, duration: '04:10', cover: 'https://picsum.photos/50/50?random=40' },
  { id: '41', title: '前世情人', aliasTitle: 'Past Life Lover', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '41', title: '哎呦不错哦', artist: [], cover: 'https://picsum.photos/50/50?random=41', releaseDate: '2014', songCount: '10' }, duration: '04:00', cover: 'https://picsum.photos/50/50?random=41' },
  { id: '42', title: '英雄', aliasTitle: 'Hero', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '42', title: '周杰伦的床边故事', artist: [], cover: 'https://picsum.photos/50/50?random=42', releaseDate: '2016', songCount: '10' }, duration: '03:30', cover: 'https://picsum.photos/50/50?random=42' },
  { id: '43', title: '告白气球', aliasTitle: 'Love Confession', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '43', title: '周杰伦的床边故事', artist: [], cover: 'https://picsum.photos/50/50?random=43', releaseDate: '2016', songCount: '10' }, duration: '03:35', cover: 'https://picsum.photos/50/50?random=43' },
  { id: '44', title: '等你下课', aliasTitle: 'Waiting for You After Class', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '44', title: '等你下课', artist: [], cover: 'https://picsum.photos/50/50?random=44', releaseDate: '2018', songCount: '10' }, duration: '03:50', cover: 'https://picsum.photos/50/50?random=44' },
  { id: '45', title: '不爱我就拉倒', aliasTitle: 'If You Dont Love Me Just Let It Be', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '45', title: '不爱我就拉倒', artist: [], cover: 'https://picsum.photos/50/50?random=45', releaseDate: '2018', songCount: '10' }, duration: '04:05', cover: 'https://picsum.photos/50/50?random=45' },
  { id: '46', title: 'Mojito', aliasTitle: 'Mojito', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '46', title: 'Mojito', artist: [], cover: 'https://picsum.photos/50/50?random=46', releaseDate: '2020', songCount: '10' }, duration: '03:05', cover: 'https://picsum.photos/50/50?random=46' },
  { id: '47', title: '说好不哭', aliasTitle: 'Promise Not to Cry', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '47', title: '说好不哭', artist: [], cover: 'https://picsum.photos/50/50?random=47', releaseDate: '2019', songCount: '10' }, duration: '03:28', cover: 'https://picsum.photos/50/50?random=47' },
  { id: '48', title: '我是如此相信', aliasTitle: 'I Believe', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '48', title: '我是如此相信', artist: [], cover: 'https://picsum.photos/50/50?random=48', releaseDate: '2019', songCount: '10' }, duration: '04:15', cover: 'https://picsum.photos/50/50?random=48' },
  { id: '49', title: '最伟大的作品', aliasTitle: 'The Greatest Work', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '49', title: '最伟大的作品', artist: [], cover: 'https://picsum.photos/50/50?random=49', releaseDate: '2022', songCount: '10' }, duration: '04:06', cover: 'https://picsum.photos/50/50?random=49' },
  { id: '50', title: '还在流浪', aliasTitle: 'Still Wandering', artist: [{ id: '1', name: '周杰伦', avatar: '', fanCount: '1000万', songCount: '300', verified: true }], album: { id: '50', title: '最伟大的作品', artist: [], cover: 'https://picsum.photos/50/50?random=50', releaseDate: '2022', songCount: '10' }, duration: '03:55', cover: 'https://picsum.photos/50/50?random=50' },
]

const songs = ref(mockPlaylist)

// 虚拟滚动配置
const ITEM_HEIGHT = 68
const BUFFER_COUNT = 5

const scrollRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(400)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_COUNT)
  const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT) + 2 * BUFFER_COUNT
  const end = Math.min(songs.value.length, start + visibleCount)
  return { start, end }
})

const visibleItems = computed(() => {
  return songs.value.slice(visibleRange.value.start, visibleRange.value.end)
})

const totalHeight = computed(() => songs.value.length * ITEM_HEIGHT)
const offsetY = computed(() => visibleRange.value.start * ITEM_HEIGHT)

const onScroll = (e: Event) => {
  const target = e.target as HTMLDivElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  if (scrollRef.value) {
    containerHeight.value = scrollRef.value.clientHeight
  }
})
</script>

<template>
  <div class="playlist-panel" @click.stop>
    <!-- 头部 -->
    <div class="playlist-header">
      <div class="flex items-center gap-3">
        <ListMusic class="w-5 h-5 text-red-500" />
        <h2 class="playlist-title">正在播放</h2>
      </div>
      <button class="playlist-close-btn" @click="$emit('close')">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- 歌曲数量 -->
    <div class="playlist-count-bar">
      <span class="text-sm text-gray-500 dark:text-gray-400">共 {{ songs.length }} 首歌曲</span>
    </div>

    <!-- 虚拟滚动容器 -->
    <div
      ref="scrollRef"
      class="playlist-viewport custom-scrollbar"
      @scroll="onScroll"
    >
      <div class="playlist-spacer" :style="{ height: `${totalHeight}px` }">
        <div class="playlist-visible" :style="{ transform: `translateY(${offsetY}px)` }">
          <div
            v-for="song in visibleItems"
            :key="song.id"
            class="playlist-item"
            :class="{ 'playlist-item-active': currentSong?.id === song.id }"
            @click="$emit('playSong', song)"
          >
            <img :src="song.cover" :alt="song.title" class="playlist-cover" />
            <div class="playlist-info">
              <span class="playlist-song-title">{{ song.title }}</span>
              <span class="playlist-artist">{{ song.artist[0]?.name }}</span>
            </div>
            <span class="playlist-duration">{{ song.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-panel {
  z-index: 10000;
  position: fixed;
  top: 15vh;
  right: 0;
  width: 380px;
  max-height: 70vh;
  height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  margin: 10px;
  overflow: hidden;

  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(200%) brightness(1.2) contrast(1.05);
  -webkit-backdrop-filter: blur(18px) saturate(200%) brightness(1.2) contrast(1.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
}

.dark .playlist-panel {
  background: rgba(17, 25, 40, 0.35);
  border-color: rgba(255, 255, 255, 0.08);
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.dark .playlist-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.playlist-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.dark .playlist-title {
  color: #ffffff;
}

.playlist-close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.playlist-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.dark .playlist-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.playlist-count-bar {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.dark .playlist-count-bar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.playlist-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.playlist-spacer {
  position: relative;
  width: 100%;
}

.playlist-visible {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 12px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  height: 68px;
  box-sizing: border-box;
}

.playlist-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .playlist-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.playlist-item-active {
  background: rgba(250, 35, 59, 0.08);
}

.dark .playlist-item-active {
  background: rgba(250, 35, 59, 0.15);
}

.playlist-item-active .playlist-song-title {
  color: #fa233b;
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playlist-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.playlist-song-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .playlist-song-title {
  color: #ffffff;
}

.playlist-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.dark .playlist-artist {
  color: #aaa;
}

.playlist-duration {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.dark .playlist-duration {
  color: #888;
}
</style>
