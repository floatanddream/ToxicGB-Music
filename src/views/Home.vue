<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CircleFadingArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon } from 'lucide-vue-next';

// 轮播图数据
const slides = [
  {
    image: 'https://picsum.photos/800/400?random=1',
    title: '发现音乐之美',
    description: '探索无限音乐世界',
    action: '开始探索'
  },
  {
    image: 'https://picsum.photos/800/400?random=2',
    title: '热门歌单',
    description: '紧跟潮流音乐',
    action: '查看歌单'
  },
  {
    image: 'https://picsum.photos/800/400?random=3',
    title: '新歌首发',
    description: '抢先试听最新音乐',
    action: '立即试听'
  },
  {
    image: 'https://picsum.photos/800/400?random=4',
    title: '热门歌手',
    description: '关注你的偶像动态',
    action: '查看详情'
  },
  {
    image: 'https://picsum.photos/800/400?random=5',
    title: '个性化推荐',
    description: '专属你的音乐体验',
    action: '开启体验'
  }
];

// 当前轮播索引
const currentSlide = ref(0);
const isAutoPlaying = ref(true);

// 自动轮播定时器
let autoPlayTimer: number | null = null;

// 下一张
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
  resetAutoPlay();
};

// 上一张
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
  resetAutoPlay();
};

// 跳转到指定幻灯片
const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetAutoPlay();
};

// 开始自动轮播
const startAutoPlay = () => {
  if (autoPlayTimer) return;

  autoPlayTimer = window.setInterval(() => {
    if (isAutoPlaying.value) {
      nextSlide();
    }
  }, 5000);
};

// 停止自动轮播
const stopAutoPlay = () => {
  if (autoPlayTimer) {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

// 重置自动轮播
const resetAutoPlay = () => {
  stopAutoPlay();
  startAutoPlay();
};

// 鼠标悬停时停止自动轮播
const handleMouseEnter = () => {
  isAutoPlaying.value = false;
};

// 鼠标离开时恢复自动轮播
const handleMouseLeave = () => {
  isAutoPlaying.value = true;
};

// 组件挂载时开始自动轮播
onMounted(() => {
  startAutoPlay();
});

// 组件卸载时停止自动轮播
onUnmounted(() => {
  stopAutoPlay();
});
</script>

<template>
  <div class="home ">
    <!-- 新的布局：左侧用户信息，右侧轮播图 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 左侧：用户卡片 -->
      <div class="lg:col-span-1">
        <Card class="h-full p-5! bg-white/40 glass-effect">
          <CardHeader class="items-center text-center pb-6">
            <div class="relative mb-4">
              <div
                class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <UserIcon class="w-12 h-12 text-white" />
              </div>
              <div class="absolute -bottom-0 left-16 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <CardTitle class="text-xl">音乐爱好者</CardTitle>
            <CardDescription>聆听世界的声音</CardDescription>
          </CardHeader>
          <CardContent class="py-6">
            <div class="grid place-items-center">
              <div class="w-1/2">
                <div class="w-full space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">听歌时长</span>
                    <span class="font-semibold">2,560小时</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">收藏歌曲</span>
                    <span class="font-semibold">892首</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">创建歌单</span>
                    <span class="font-semibold">12个</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter class="mt-auto pt-4">
            <p class="text-sm italic text-gray-600 text-center w-full">"音乐是心灵的翅膀"</p>
          </CardFooter>
        </Card>
      </div>

      <!-- 右侧：轮播图 -->
      <div class="lg:col-span-2">
        <div class="relative h-full min-h-[300px] overflow-hidden rounded-xl opacity-90" @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave">
          <!-- 图片容器 -->
          <div class="absolute inset-0 flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(slide, index) in slides" :key="index" class="min-w-full h-full relative">
              <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover">
            </div>
          </div>

          <!-- 毛玻璃遮罩层 -->
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          <!-- 渐变遮罩，提升文字可读性 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          <!-- 轮播内容 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white px-4 max-w-xl">
              <h2 class="text-2xl md:text-3xl font-bold mb-2 drop-shadow">
                {{ slides[currentSlide].title }}
              </h2>
              <p class="text-sm md:text-base mb-4 drop-shadow">
                {{ slides[currentSlide].description }}
              </p>
              <Button class="bg-primary hover:bg-primary/90 text-white">
                {{ slides[currentSlide].action }}
              </Button>
            </div>
          </div>

          <!-- 左侧控制按钮 -->
          <button @click="prevSlide"
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 group">
            <ChevronLeftIcon class="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          <!-- 右侧控制按钮 -->
          <button @click="nextSlide"
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 group">
            <ChevronRightIcon class="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          <!-- 底部指示器 -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button v-for="(slide, index) in slides" :key="`indicator-${index}`" @click="goToSlide(index)"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'"
              :aria-label="`跳转到第${index + 1}张`" />
          </div>

          <!-- 当前页码显示 -->
          <div
            class="absolute bottom-4 right-4 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
            {{ currentSlide + 1 }} / {{ slides.length }}
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid opacity-90 ">
      <div class="card  glass-effect">
        <h2>推荐歌单</h2>
        <p>发现热门音乐</p>
      </div>
      <div class="card bg-white/60 backdrop-blur-md">
        <h2>最新音乐</h2>
        <p>抢先试听新歌</p>
      </div>
      <div class="card bg-white/60 backdrop-blur-md">
        <h2>热门歌手</h2>
        <p>关注你的偶像</p>
        <Button variant="outline" size="icon">
          <CircleFadingArrowUpIcon />
        </Button>
        <Button class="bg-sky-500">657567</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.home h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  margin-top: 2vh;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-in-out;
}

.card:hover {
  background: rgba(255, 255, 255, 0.673);
  transform: translateY(-5px);
}

.card h2 {
  margin-bottom: 15px;
  color: #e74c3c;
}

.card p {
  color: #666;
}

/* 用户卡片样式修复 */
:deep(.user-card) {
  height: 100%;
}

:deep(.user-card-header) {
  padding-bottom: 1.5rem;
  /* 24px */
}

:deep(.user-card-content) {
  padding-top: 1.5rem;
  /* 24px */
  padding-bottom: 1.5rem;
  /* 24px */
}

:deep(.user-card-footer) {
  margin-top: auto;
  padding-top: 1rem;
  /* 16px */
  border-top: 1px solid #e5e7eb;
  /* gray-200 */
}
</style>