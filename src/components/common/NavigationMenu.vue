<template>
  <nav class="navigation-menu">
    <ul class="menu-list">
      <li v-for="item in items" :key="item.id" class="menu-item">
        <RouterLink
          v-if="item.route"
          :to="item.route"
          class="menu-link"
          active-class="active"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </RouterLink>
        <button
          v-else-if="item.action"
          @click="item.action"
          class="menu-link w-full text-left"
          :class="{ active: item.active }"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </button>
        <div v-else class="menu-group">
          <span class="group-label">
            <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </span>
          <ul v-if="item.children" class="sub-menu">
            <li v-for="child in item.children" :key="child.id">
              <RouterLink
                :to="child.route"
                class="sub-menu-link"
                active-class="active"
              >
                <span v-if="child.icon" class="menu-icon">{{ child.icon }}</span>
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

defineProps<{
  items: MenuItem[]
}>()
</script>

<style scoped>
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
  background: rgba(231, 76, 60, 0.08);
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.1);
  margin: 0 8px;
  padding: 12px 12px;
}

.dark .menu-link:hover,
.dark .sub-menu-link:hover {
  background: rgba(192, 57, 43, 0.15);
  border: 1px solid rgba(192, 57, 43, 0.2);
}

.menu-link.active,
.sub-menu-link.active {
  background: rgba(231, 76, 60, 0.15);
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  margin: 0 8px;
  padding: 12px 12px;
}

.dark .menu-link.active,
.dark .sub-menu-link.active {
  background: rgba(192, 57, 43, 0.2);
  border: 1px solid rgba(192, 57, 43, 0.3);
  color: #e74c3c;
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
}

.sub-menu .menu-link {
  padding: 8px 15px;
  font-size: 14px;
}
</style>