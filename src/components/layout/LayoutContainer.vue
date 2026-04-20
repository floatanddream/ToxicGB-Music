<script setup lang="ts">
import TheHeader from './TheHeader.vue'
import TheSidebar from './TheSidebar.vue'
import TheFooter from './TheFooter.vue'
import { BackgroundRender } from '@applemusic-like-lyrics/vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core';
import emitter from '@/utils/eventBus';
import {EVENTS} from '@/constants/events'
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
const imageUrl = ref(`${userStore.avatar}`);

//拿到main元素ref
const mainRef = ref<HTMLElement | null>(null);

//滚到top
const handleScrollTop: () => void = () => {
  if(mainRef.value){
    mainRef.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

// Dark mode initialization
onMounted(() => {
  emitter.on(EVENTS.SCROOL_TOP,handleScrollTop);
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
onUnmounted(()=>{
  emitter.off(EVENTS.SCROOL_TOP);
});
</script>

<template>
  <div class="layout-container">
    <div class="full-page-background">
      <BackgroundRender :renderer="MeshGradientRenderer" :fps="90" :render-scale="1" :album="imageUrl" />
    </div>
    <TheHeader class="header" />
    <TheSidebar class="sidebar" />
      <main ref="mainRef" class="main"> 
          <slot /> 
    </main>
    <TheFooter class="footer" />
  </div>
</template>

<style scoped>
.layout-container {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main";
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  height: 100vh;
  padding-bottom: 80px;
  /* 为固定底部播放器留出空间 */
  overflow: hidden;
  position: relative;
}

.full-page-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.dark .full-page-background {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
}


.header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 100;
  /* Background handled by child component */
}

.sidebar {
  grid-area: sidebar;
  overflow-y: auto;
  height: calc(100vh - 60px);
  /* 减去header高度 */
  position: relative;
  z-index: 2;
  /* Background handled by child component (TheSidebar.vue) */
}

.main {
  grid-area: main;
  overflow-y: auto;
  height: calc(100vh - 60px);
  /* 减去header高度 */
  padding: 20px 20px 100px 20px;
  /* 底部增加80px padding避免被footer挡住 */
  position: relative;
  z-index: 1;
  /* Lower z-index to stay behind sidebar */
}

.dark .main {
  color: #e0e0e0;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  /* Background handled by child component (TheFooter.vue) */
}
</style>