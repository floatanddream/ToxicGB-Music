<script setup lang="ts">
</script>

<template>
  <div class="home">
    <h1>欢迎来到 ToxicGB Music</h1>
    <div class="content-grid">
      <div class="card">
        <h2>推荐歌单</h2>
        <p>发现热门音乐</p>
      </div>
      <div class="card">
        <h2>最新音乐</h2>
        <p>抢先试听新歌</p>
      </div>
      <div class="card">
        <h2>热门歌手</h2>
        <p>关注你的偶像</p>
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
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h2 {
  margin-bottom: 15px;
  color: #e74c3c;
}

.card p {
  color: #666;
}
</style>