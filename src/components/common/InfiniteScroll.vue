<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  loading?: boolean
  hasMore?: boolean
  rootMargin?: string
  threshold?: number
}>(), {
  loading: false,
  hasMore: true,
  rootMargin: '15%',
  threshold: 1,
})

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const trigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!trigger.value) return
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !props.loading && props.hasMore) {
        emit('load-more')
      }
    },
    { rootMargin: props.rootMargin, threshold: props.threshold },
  )
  observer.observe(trigger.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div>
    <slot />
    <div ref="trigger" class="infinite-scroll-trigger">
      <Loader2 v-if="loading" class="animate-spin" :size="20" />
      <span v-else-if="!hasMore && !loading" class="no-more-text">没有更多了</span>
    </div>
  </div>
</template>

<style scoped>
.infinite-scroll-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 1rem 0;
}

.no-more-text {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}
</style>