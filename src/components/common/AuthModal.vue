<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next';

const isOpen = ref(false);
const isLogin = ref(true);
const showPassword = ref(false);

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
};

const openAuthModal = () => {
  isOpen.value = true;
};

const closeAuthModal = () => {
  isOpen.value = false;
};

defineExpose({
  openAuthModal,
  closeAuthModal
});
</script>

<template>
  <Dialog :style="{'z-index': 15000}" v-model:open="isOpen">
    <DialogContent class="glass-container max-w-md p-8 rounded-2xl z-500">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold text-center">
          {{ isLogin ? '登录' : '注册' }}
        </DialogTitle>
        <DialogDescription class="text-center mt-2">
          {{ isLogin ? '登录您的账号以继续' : '创建新账号以开始' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-6">
        <!-- 用户名/邮箱 -->
        <div class="space-y-2">
          <Label for="email">邮箱</Label>
          <div class="relative">
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              class="pl-10 glass-card"
            />
            <MailIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- 密码 -->
        <div class="space-y-2">
          <Label for="password">密码</Label>
          <div class="relative">
            <Input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="pl-10 pr-10 glass-card"
            />
            <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <EyeIcon v-if="!showPassword" class="h-4 w-4 text-gray-400" />
              <EyeOffIcon v-else class="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- 确认密码（注册时显示） -->
        <div v-if="!isLogin" class="space-y-2">
          <Label for="confirm-password">确认密码</Label>
          <div class="relative">
            <Input
              id="confirm-password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              class="pl-10 glass-card"
            />
            <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- 用户名（注册时显示） -->
        <div v-if="!isLogin" class="space-y-2">
          <Label for="username">用户名</Label>
          <div class="relative">
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              class="pl-10 glass-card"
            />
            <UserIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- 记住我（登录时显示） -->
        <div v-if="isLogin" class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="remember" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label for="remember" class="text-sm font-normal">记住我</Label>
          </div>
          <Button variant="link" class="text-sm text-primary hover:underline">
            忘记密码？
          </Button>
        </div>

        <!-- 提交按钮 -->
        <Button type="submit" class="w-full glass-card">
          {{ isLogin ? '登录' : '注册' }}
        </Button>

        <!-- 切换登录/注册 -->
        <div class="text-center">
          <Button
            variant="link"
            class="text-sm text-primary hover:underline"
            @click="toggleAuthMode"
          >
            {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
