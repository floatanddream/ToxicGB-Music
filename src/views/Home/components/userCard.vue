<script lang="ts" setup>
import { UserIcon } from 'lucide-vue-next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

</script>
<template>
    <div class="lg:col-span-1">
        <Card class="h-full p-5! glass opacity-90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader class="items-center text-center pb-6">
            <div class="relative mb-4">
              <div
                class="h-24 w-24 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105">
                <UserIcon class="w-12 h-12 text-white" />
              </div>
              <div class="absolute bottom-0 left-16 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>
            <CardTitle class="text-xl text-primary">音乐爱好者</CardTitle>
            <CardDescription class="text-secondary">聆听世界的声音</CardDescription>
          </CardHeader>
          <CardContent class="py-6">
            <div class="grid place-items-center">
              <div class="w-1/2">
                <div class="w-full space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-secondary">听歌时长</span>
                    <span class="font-semibold text-primary">2,560小时</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-secondary">收藏歌曲</span>
                    <span class="font-semibold text-primary">892首</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-secondary">创建歌单</span>
                    <span class="font-semibold text-primary">12个</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter class="mt-auto pt-4">
            <p class="text-sm italic text-gray-600 text-center w-full">"音乐是心灵的翅膀"</p>
          </CardFooter>
        </Card>
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


</style>