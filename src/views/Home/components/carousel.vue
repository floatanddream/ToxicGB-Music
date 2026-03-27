<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
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
    <div class="lg:col-span-2">
        <div class="relative h-full min-h-75 overflow-hidden rounded-xl opacity-90" @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <!-- 图片容器 -->
            <div class="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                <div v-for="(slide, index) in slides" :key="index" class="min-w-full h-full relative">
                    <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover">
                </div>
            </div>

            <!-- 毛玻璃遮罩层 -->
            <div class="absolute inset-0 bg-black/20 backdrop-blur-xs" />

            <!-- 渐变遮罩，提升文字可读性 -->
            <div class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/20" />

            <!-- 轮播内容 -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white px-4 max-w-xl">
                    <h2 class="text-2xl md:text-3xl font-bold mb-2 drop-shadow">
                        {{ slides[currentSlide]?.title }}
                    </h2>
                    <p class="text-sm md:text-base mb-4 drop-shadow">
                        {{ slides[currentSlide]?.description }}
                    </p>
                    <Button size="sm" class="bg-primary hover:bg-primary/90 text-white">
                        {{ slides[currentSlide]?.action }}
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
</template>