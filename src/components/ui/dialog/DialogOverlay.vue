<script setup lang="ts">
import type { DialogOverlayProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogOverlay } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-100 duration-500 ease-in-out',
      'liquid-glass-advanced',
      props.class
    )"
  >
    <slot />
  </DialogOverlay>
</template>

<style scoped>
.liquid-glass-advanced {
  background: 
    radial-gradient(
      ellipse at 50% 30%,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    ),
    rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px) saturate(200%) brightness(1.05);
  -webkit-backdrop-filter: blur(25px) saturate(200%) brightness(1.05);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.12);
  outline: 1px solid rgba(255, 255, 255, 0.2);
  outline-offset: -1px;
}

@keyframes liquid-shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.liquid-glass-advanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  background-size: 200% 100%;
  animation: liquid-shimmer 8s infinite;
  pointer-events: none;
  border-radius: inherit;
}

.dark .liquid-glass-advanced {
  background: 
    radial-gradient(
      ellipse at 50% 30%,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 100%
    ),
    rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px) saturate(180%) brightness(0.9);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>