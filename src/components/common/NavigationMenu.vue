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

.menu-link:hover,
.sub-menu-link:hover {
  background-color: #e9ecef;
}

.menu-link.active,
.sub-menu-link.active {
  background-color: #e74c3c;
  color: #fff;
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