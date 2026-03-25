<script setup lang="ts">
</script>

<template>
  <div class="player-page">
    <h1>音乐播放器</h1>
    <div class="player-container">
      <div class="player-controls">
        <button class="control-btn">⏮</button>
        <button class="control-btn">⏯</button>
        <button class="control-btn">⏭</button>
      </div>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
      <p>播放器功能开发中...</p>
    </div>
  </div>
</template>

<style scoped>
.player-page {
  max-width: 800px;
  margin: 0 auto;
}

.player-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.player-controls {
  margin-bottom: 20px;
}

.control-btn {
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin: 0 10px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

.control-btn:hover {
  background-color: #c0392b;
}

.progress-bar {
  background-color: #e0e0e0;
  height: 6px;
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress {
  background-color: #e74c3c;
  height: 100%;
  width: 30%;
  transition: width 0.3s ease;
}
</style>