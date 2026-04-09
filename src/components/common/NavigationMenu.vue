<template>
  <nav class="navigation-menu">
    <ul class="menu-list">
      <li v-for="item in items" :key="item.id" class="menu-item">
        <RouterLink v-if="item.route" :to="item.route" class="menu-link" active-class="active">
          <div class="menu-icon-container">
            <PaletteIcon v-if="item.icon === '🎨'" class="h-5 w-5" />
            <HomeIcon v-else-if="item.icon === '🏠'" class="h-5 w-5" />
            <SearchIcon v-else-if="item.icon === '🔍'" class="h-5 w-5" />
            <ListIcon v-else-if="item.icon === '📋'" class="h-5 w-5" />
          </div>
          <span class="menu-label">{{ item.label }}</span>
        </RouterLink>
        <button v-else-if="item.action" @click="item.action" class="menu-link w-full text-left"
          :class="{ active: item.active }">
          <div class="menu-icon-container">
            <PaletteIcon v-if="item.icon === '🎨'" class="h-5 w-5" />
            <HomeIcon v-else-if="item.icon === '🏠'" class="h-5 w-5" />
            <SearchIcon v-else-if="item.icon === '🔍'" class="h-5 w-5" />
            <ListIcon v-else-if="item.icon === '📋'" class="h-5 w-5" />
          </div>
          <span class="menu-label">{{ item.label }}</span>
        </button>
        <div v-else class="menu-group">
          <span class="group-label">
            <div class="menu-icon-container">
              <PaletteIcon v-if="item.icon === '🎨'" class="h-5 w-5" />
              <HomeIcon v-else-if="item.icon === '🏠'" class="h-5 w-5" />
              <SearchIcon v-else-if="item.icon === '🔍'" class="h-5 w-5" />
              <ListIcon v-else-if="item.icon === '📋'" class="h-5 w-5" />
            </div>
            <span class="menu-label">{{ item.label }}</span>
          </span>
          <ul v-if="item.children" class="sub-menu">
            <li v-for="child in item.children" :key="child.id">
              <RouterLink :to="child.route" class="sub-menu-link" active-class="active">
                <div class="menu-icon-container">
                  <PaletteIcon v-if="child.icon === '🎨'" class="h-5 w-5" />
                  <HomeIcon v-else-if="child.icon === '🏠'" class="h-5 w-5" />
                  <SearchIcon v-else-if="child.icon === '🔍'" class="h-5 w-5" />
                  <ListIcon v-else-if="child.icon === '📋'" class="h-5 w-5" />
                </div>
                <span class="menu-label">{{ child.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/menu'
import { PaletteIcon, HomeIcon, SearchIcon, ListIcon } from 'lucide-vue-next'
defineProps<{
  items: MenuItem[]
}>()
</script>

<style scoped>
.group-label{
  display: flex ;
  flex-wrap: nowrap ;
}
.navigation-menu {
  padding: 20px 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 5px;
}

.menu-link,
.sub-menu-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dark .menu-link,
.dark .sub-menu-link {
  color: #e0e0e0;
}

.menu-link:hover,
.sub-menu-link:hover {
  background: #ff3b30;
  /* 亮红色 */
  border-radius: 8px;
  border: 1px solid #ff3b30;
  margin: 0 8px;
  padding: 12px 12px;



  color: #fff;
  /* 文字变白更清晰 */
}

.dark .menu-link:hover,
.dark .sub-menu-link:hover {
  background: #ff453a;
  /* 暗色稍微提亮 */
  border: 1px solid #ff453a;


  color: #fff;
}

.menu-link.active,
.sub-menu-link.active {
  background: #ff3b30;
  border-radius: 8px;
  border: 1px solid #ff3b30;
  color: #fff;
  margin: 0 8px;
  padding: 12px 12px;

}

.dark .menu-link.active,
.dark .sub-menu-link.active {
  background: #ff453a;
  border: 1px solid #ff453a;
  color: #fff;


}

.menu-icon-container {
  margin-right: 10px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.menu-group {
  padding: 12px 20px;
  font-weight: bold;
  color: #666;
}

.dark .menu-group {
  color: #999;
}

.sub-menu {
  list-style: none;
  padding-left: 30px;
  margin-top: 5px;
  white-space: nowrap;
}

.sub-menu .menu-link {
  padding: 8px 15px;
  font-size: 14px;
}
</style>