<template>
  <div class="playlist-subscribers">
    <div class="text-center py-12 text-gray-500">
      <p>收藏者列表</p>
    </div>
  </div>
</template>

<style scoped>
.playlist-subscribers {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .playlist-subscribers {
    padding: 16px;
  }
}
</style>
