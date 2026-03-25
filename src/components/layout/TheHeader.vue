<script setup lang="ts">
import AppLogo from '../common/AppLogo.vue'
import SearchBar from '../common/SearchBar.vue'
import UserAvatar from '../common/UserAvatar.vue'
</script>

<template>
  <header class="header">
    <div class="header-content">
      <AppLogo size="medium" />
      <div class="search-wrapper">
        <SearchBar placeholder="搜索音乐、歌手、专辑..." />
      </div>
      <UserAvatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=default" alt="用户头像" size="small" />
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}
</style>