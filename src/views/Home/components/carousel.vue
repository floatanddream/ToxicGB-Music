<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { getBanner } from '@/api/banner';
import type { Banner } from '@/types/banner';

const getBannerContent = async () =>{
   const res = await getBanner();
   const data : Banner[] = res.banners.map((item : any)=>{
        return {
            imageUrl: item.imageUrl,
            bigImageUrl: item.bigImageUrl,
            typeTitle: item.typeTitle,
        }
   });
   slides.value = data;
}

// 轮播图数据
const slides = ref<Banner[]>();

// 当前轮播索引
const currentSlide = ref(0);
const isAutoPlaying = ref(true);

// 自动轮播定时器
let autoPlayTimer: number | null = null;

// 下一张
const nextSlide = () => {
    if (!slides.value || slides.value.length === 0) return;
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
    resetAutoPlay();
};

// 上一张
const prevSlide = () => {
    if (!slides.value || slides.value.length === 0) return;
    currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
    resetAutoPlay();
};

// 跳转到指定幻灯片
const goToSlide = (index: number) => {
    if (!slides.value || slides.value.length === 0) return;
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
    getBannerContent();
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
            <Transition v-if="slides && slides.length > 0" name="carousel" mode="out-in">
                <div :key="currentSlide" class="absolute inset-0">
                    <img :src="slides[currentSlide].bigImageUrl || slides[currentSlide].imageUrl" :alt="slides[currentSlide].typeTitle || ''"
                        class="w-full h-full object-cover" />
                </div>
            </Transition>

            <!-- 多层遮罩效果 -->
            <div class="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
            <div class="absolute inset-0 bg-black/15 backdrop-blur-[4px]" />

            <!-- 轮播内容 -->
            <div class="absolute inset-0 flex items-center justify-center">
                <Transition v-if="slides && slides.length > 0" name="text-carousel" mode="out-in">
                    <div :key="currentSlide" class="text-center text-white px-4 max-w-xl hover:scale-105 transition-transform duration-700">
                        <h2 class="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg text-white">
                            {{ slides[currentSlide]?.typeTitle }}
                        </h2>
                    </div>
                </Transition>
            </div>

            <!-- 左侧控制按钮 -->
            <button v-if="slides && slides.length > 0" @click="prevSlide"
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-300 group z-10">
                <ChevronLeftIcon class="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-200" />
            </button>

            <!-- 右侧控制按钮 -->
            <button v-if="slides && slides.length > 0" @click="nextSlide"
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-300 group z-10">
                <ChevronRightIcon class="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-200" />
            </button>

            <!-- 底部指示器 -->
            <div v-if="slides && slides.length > 0" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <button v-for="(slide, index) in slides" :key="`indicator-${index}`" @click="goToSlide(index)"
                    class="w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125"
                    :class="currentSlide === index ? 'bg-white scale-150 shadow-lg' : 'bg-white/50 hover:bg-white/80'"
                    :aria-label="`跳转到第${index + 1}张`" />
            </div>

            <!-- 当前页码显示 -->
            <div v-if="slides && slides.length > 0"
                class="absolute bottom-6 right-6 text-white text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full z-10">
                {{ currentSlide + 1 }} / {{ slides.length }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
    transition: opacity 0.8s ease;
}

.carousel-enter-from,
.carousel-leave-to {
    opacity: 0;
}

.text-carousel-enter-active,
.text-carousel-leave-active {
    transition: all 0.6s ease;
}

.text-carousel-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.text-carousel-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>