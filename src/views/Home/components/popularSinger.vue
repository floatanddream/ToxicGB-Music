<script setup lang="ts">
import { ref, computed } from 'vue';

interface Singer {
    name: string;
    imageUrl: string;
    id: number;
}

const singers = ref<Singer[]>([
    { id: 1, name: 'Taylor', imageUrl: 'https://picsum.photos/96/96?random=20' },
    { id: 2, name: '周杰伦', imageUrl: 'https://picsum.photos/96/80?random=21' },
    { id: 3, name: 'Adele', imageUrl: 'https://picsum.photos/96/112?random=22' },
    { id: 4, name: 'Bruno', imageUrl: 'https://picsum.photos/96/88?random=23' },
    { id: 5, name: '林俊杰', imageUrl: 'https://picsum.photos/96/104?random=24' },
    { id: 6, name: '邓紫棋', imageUrl: 'https://picsum.photos/96/92?random=25' },
    { id: 7, name: 'Ed Sheeran', imageUrl: 'https://picsum.photos/96/100?random=26' },
    { id: 8, name: '蔡依林', imageUrl: 'https://picsum.photos/96/84?random=27' },
    { id: 9, name: 'Rihanna', imageUrl: 'https://picsum.photos/96/108?random=28' },
    { id: 10, name: '林忆莲', imageUrl: 'https://picsum.photos/96/76?random=29' },
    { id: 11, name: '王菲', imageUrl: 'https://picsum.photos/96/96?random=40' },
    { id: 12, name: '张学友', imageUrl: 'https://picsum.photos/96/88?random=41' },
    { id: 16, name: 'Ariana', imageUrl: 'https://picsum.photos/96/80?random=45' },
    { id: 17, name: '李荣浩', imageUrl: 'https://picsum.photos/96/96?random=46' },
    { id: 18, name: 'Dua Lipa', imageUrl: 'https://picsum.photos/96/108?random=47' },
    { id: 19, name: '薛之谦', imageUrl: 'https://picsum.photos/96/84?random=48' },
    { id: 20, name: 'Billie Eilish', imageUrl: 'https://picsum.photos/96/92?random=49' },
    { id: 21, name: '张惠妹', imageUrl: 'https://picsum.photos/96/100?random=50' },
    { id: 22, name: 'The Weeknd', imageUrl: 'https://picsum.photos/96/112?random=51' },
    { id: 23, name: '田馥甄', imageUrl: 'https://picsum.photos/96/76?random=52' },
    { id: 24, name: 'Post Malone', imageUrl: 'https://picsum.photos/96/104?random=53' },
    { id: 25, name: '莫文蔚', imageUrl: 'https://picsum.photos/96/88?random=54' },
    { id: 26, name: 'Shawn Mendes', imageUrl: 'https://picsum.photos/96/96?random=55' },
    { id: 27, name: '张杰', imageUrl: 'https://picsum.photos/96/80?random=56' },
    { id: 28, name: 'Coldplay', imageUrl: 'https://picsum.photos/96/96?random=57' },
    { id: 29, name: '陈奕迅', imageUrl: 'https://picsum.photos/96/84?random=58' },
    { id: 30, name: 'Maroon 5', imageUrl: 'https://picsum.photos/96/100?random=59' },
    { id: 31, name: '李宇春', imageUrl: 'https://picsum.photos/96/92?random=60' },
    { id: 32, name: 'Justin Bieber', imageUrl: 'https://picsum.photos/96/108?random=61' },
    { id: 33, name: 'Taylor Swift', imageUrl: 'https://picsum.photos/96/76?random=62' },
    { id: 34, name: 'G.E.M.邓紫棋', imageUrl: 'https://picsum.photos/96/96?random=63' },
    { id: 35, name: 'Adele', imageUrl: 'https://picsum.photos/96/88?random=64' },
    { id: 36, name: 'Bruno Mars', imageUrl: 'https://picsum.photos/96/80?random=65' },
    { id: 37, name: 'Taylor Swift', imageUrl: 'https://picsum.photos/96/96?random=66' },
    { id: 38, name: '周杰伦', imageUrl: 'https://picsum.photos/96/84?random=67' },
    { id: 39, name: '张学友', imageUrl: 'https://picsum.photos/96/100?random=68' },
])

// 分成两行显示
const firstRowSingers = computed(() => singers.value.slice(0, 16))
const secondRowSingers = computed(() => singers.value.slice(16))

function getRandomHeight() {
    return Math.floor(Math.random() * (50 + 1)) + 50 + 'px'
}
</script>

<template>
    <div class="mt-8 opacity-90 -m-5">
        <h2 class="text-2xl font-bold text-primary drop-shadow-md mb-6">热门歌手</h2>

        <!-- 第一行 - 向左滚动 -->
        <div class="mb-4 relative" style="overflow: hidden;">
            <div class="scroll-track" style="animation: scroll-left 10s linear infinite;">
                <div v-for="singer in firstRowSingers" :key="'row1-' + singer.id" :style="{ height: getRandomHeight() }"
                    class="singer-item">
                    <img :src="singer.imageUrl" :alt="singer.name" class="w-full h-full object-cover singer-image">
                    <div class="singer-overlay">
                        <div class="singer-name">
                            <p>{{ singer.name }}</p>
                        </div>
                    </div>
                </div>
                <!-- 重复数据实现无缝循环 -->
                <div v-for="singer in firstRowSingers" :key="'row1-dup-' + singer.id"
                    :style="{ height: getRandomHeight() }" class="singer-item">
                    <img :src="singer.imageUrl" :alt="singer.name" class="w-full h-full object-cover singer-image">
                    <div class="singer-overlay">
                        <div class="singer-name">
                            <p>{{ singer.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 第二行 - 向右滚动 -->
        <div class="relative" style="overflow: hidden;">
            <div class="scroll-track-right" style="animation: scroll-left 10s linear infinite; animation-delay: -5s;">
                <div v-for="singer in secondRowSingers" :key="'row2-' + singer.id"
                    :style="{ height: getRandomHeight() }" class="singer-item">
                    <img :src="singer.imageUrl" :alt="singer.name" class="w-full h-full object-cover singer-image">
                    <div class="singer-overlay">
                        <div class="singer-name">
                            <p>{{ singer.name }}</p>
                        </div>
                    </div>
                </div>
                <!-- 重复数据实现无缝循环 -->
                <div v-for="singer in secondRowSingers" :key="'row2-dup-' + singer.id"
                    :style="{ height: getRandomHeight() }" class="singer-item">
                    <img :src="singer.imageUrl" :alt="singer.name" class="w-full h-full object-cover singer-image">
                    <div class="singer-overlay">
                        <div class="singer-name">
                            <p>{{ singer.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
@keyframes scroll-left {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}

@keyframes scroll-right {
    0% {
        transform: translateX(-50%);
    }

    100% {
        transform: translateX(0);
    }
}

@keyframes scroll-right-opposite {
    0% {
        transform: translateX(-50%);
    }

    100% {
        transform: translateX(0);
    }
}
</style>

<style scoped>
.scroll-track {
    display: flex;
    width: max-content;
    will-change: transform;
}

.scroll-track:hover {
    animation-play-state: paused;
}

.scroll-track-right {
    display: flex;
    width: max-content;
    will-change: transform;
}

.scroll-track-right:hover {
    animation-play-state: paused;
}

.singer-item {
    flex-shrink: 0;
    width: 96px;
    margin-right: 8px;
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    transition: box-shadow 0.3s;
    cursor: pointer;
}

.singer-item:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
}

.singer-image {
    transition: all 0.7s ease-out;
    transform: scale(1);
    filter: brightness(100%);
}

.singer-item:hover .singer-image {
    transform: scale(1.1);
    filter: brightness(110%);
}

.singer-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
    transition: all 0.5s ease-out;
    opacity: 0;
    transform: translateY(20px);
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
}

.singer-item:hover .singer-overlay {
    opacity: 1;
    transform: translateY(0);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
}

.singer-name {
    position: absolute;
    bottom: 12px;
    left: 12px;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    drop-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s ease-out;
}

.singer-item:hover .singer-name {
    transform: translateY(0);
    opacity: 1;
}
</style>