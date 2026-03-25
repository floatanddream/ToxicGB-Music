<script setup lang="ts">
import TheHeader from './TheHeader.vue'
import TheSidebar from './TheSidebar.vue'
import TheFooter from './TheFooter.vue'
</script>

<template>
  <div class="layout-container">
    <TheHeader class="header" />
    <TheSidebar class="sidebar" />
    <main class="main">
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
  padding-bottom: 80px; /* 为固定底部播放器留出空间 */
  overflow: hidden;
}

.header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 100;
}

.sidebar {
  grid-area: sidebar;
  overflow-y: auto;
  height: calc(100vh - 60px); /* 减去header高度 */
}

.main {
  grid-area: main;
  overflow-y: auto;
  height: calc(100vh - 60px); /* 减去header高度 */
  padding: 20px 20px 100px 20px; /* 底部增加80px padding避免被footer挡住 */
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(192, 57, 43, 0.05) 100%);
  position: relative;
}

.main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23e74c3c" opacity="0.1"/><circle cx="80" cy="40" r="1.5" fill="%23c0392b" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="%23e74c3c" opacity="0.1"/><path d="M30,30 Q50,10 70,30 T90,70 Q70,90 50,70 T30,30Z" fill="none" stroke="%23e74c3c" stroke-width="0.5" opacity="0.1"/></svg>');
  pointer-events: none;
  z-index: 0;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
}
</style>