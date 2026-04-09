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
    <div class="lg:col-span-2 h-90">
        <div class="relative h-full min-h-75 overflow-hidden rounded-xl opacity-90 shadow-lg hover:shadow-2xl transition-shadow duration-500"
            @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <!-- 图片容器 -->
            <div class="absolute inset-0 flex transition-transform duration-1000 cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                <div v-for="(slide, index) in slides" :key="index" class="min-w-full h-full relative">
                    <img :src="slide.image" :alt="slide.title"
                        class="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-105">
                </div>
            </div>

            <!-- 多层遮罩效果 -->
            <div class="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
            <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            <!-- 轮播内容 -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white px-4 max-w-xl transform transition-all duration-700 hover:scale-105"
                    :style="{ opacity: slides[currentSlide] ? 1 : 0 }">
                    <h2
                        class="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg text-white transform transition-all duration-500">
                        {{ slides[currentSlide]?.title }}
                    </h2>
                    <p
                        class="text-base md:text-lg mb-6 drop-shadow text-gray-100 transform transition-all duration-500 delay-75">
                        {{ slides[currentSlide]?.description }}
                    </p>
                    <Button size="default"
                        class="btn-gradient-primary">
                        {{ slides[currentSlide]?.action }}
                    </Button>
                </div>
            </div>

            <!-- 左侧控制按钮 -->
            <button @click="prevSlide"
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-300 group z-10">
                <ChevronLeftIcon class="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-200" />
            </button>

            <!-- 右侧控制按钮 -->
            <button @click="nextSlide"
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-300 group z-10">
                <ChevronRightIcon class="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-200" />
            </button>

            <!-- 底部指示器 -->
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <button v-for="(slide, index) in slides" :key="`indicator-${index}`" @click="goToSlide(index)"
                    class="w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125"
                    :class="currentSlide === index ? 'bg-white scale-150 shadow-lg' : 'bg-white/50 hover:bg-white/80'"
                    :aria-label="`跳转到第${index + 1}张`" />
            </div>

            <!-- 当前页码显示 -->
            <div
                class="absolute bottom-6 right-6 text-white text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full z-10">
                {{ currentSlide + 1 }} / {{ slides.length }}
            </div>

            <!-- 加载动画 -->
            <div v-if="!slides[currentSlide]" class="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        </div>
    </div>
</template>