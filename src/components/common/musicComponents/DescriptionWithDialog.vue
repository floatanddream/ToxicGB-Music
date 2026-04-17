<template>
  <div class="flex items-start gap-2 mb-4 max-w-2xl">
    <p class="text-sm md:text-base">
      {{ getTruncatedDesc(text) }}
      <Dialog v-if="shouldTruncate(text)">
        <DialogTrigger as-child>
          <Button variant="ghost" size="sm" class="h-6 text-xs">
            {{ triggerText }}
          </Button>
        </DialogTrigger>
        <DialogContent :class="dialogContentClass">
          <DialogHeader>
            <DialogTitle>{{ title }}</DialogTitle>
          </DialogHeader>
          <ScrollArea :class="scrollAreaClass">
            <DialogDescription class="whitespace-pre-wrap wrap-break-word pr-4">
              {{ text }}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { shouldTruncate, getTruncatedDesc } from '@/utils/misc' // 根据实际路径调整

interface Props {
  text?: string
  title?: string
  triggerText?: string
  dialogContentClass?: string
  scrollAreaClass?: string
}

withDefaults(defineProps<Props>(), {
  title: '简介',
  triggerText: '详细',
  dialogContentClass: 'max-w-2xl max-h-[80vh] z-500 overflow-hidden',
  scrollAreaClass: 'h-[calc(80vh-120px)]',
})
</script>