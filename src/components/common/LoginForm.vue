<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next';

const emit = defineEmits<{
  submit: [data: { email: string; password: string; remember: boolean }];
  'forgot-password': [];
}>();

const showPassword = ref(false);
const isLoading = ref(false);

const formData = reactive({
  email: '',
  password: '',
  remember: false
});

const errors = reactive({
  email: '',
  password: ''
});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const clearErrors = () => {
  errors.email = '';
  errors.password = '';
};

const validateForm = (): boolean => {
  clearErrors();
  let isValid = true;

  if (!formData.email) {
    errors.email = '邮箱不能为空';
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }

  if (!formData.password) {
    errors.password = '密码不能为空';
    isValid = false;
  } else if (!validatePassword(formData.password)) {
    errors.password = '密码长度至少为6位';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    emit('submit', {
      email: formData.email,
      password: formData.password,
      remember: formData.remember
    });
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.email = '';
  formData.password = '';
  formData.remember = false;
  clearErrors();
};

defineExpose({
  resetForm
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- 邮箱 -->
    <div class="space-y-2">
      <Label for="login-email">邮箱</Label>
      <div class="relative">
        <Input
          id="login-email"
          v-model="formData.email"
          type="email"
          placeholder="请输入邮箱"
          class="pl-10 glass-card"
          :class="{ 'border-red-500': errors.email }"
          required
        />
        <MailIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
    </div>

    <!-- 密码 -->
    <div class="space-y-2">
      <Label for="login-password">密码</Label>
      <div class="relative">
        <Input
          id="login-password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          class="pl-10 pr-10 glass-card"
          :class="{ 'border-red-500': errors.password }"
          required
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
      <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
    </div>

    <!-- 记住我和忘记密码 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <input
          id="remember"
          v-model="formData.remember"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label for="remember" class="text-sm font-normal">记住我</Label>
      </div>
      <Button
        type="button"
        variant="link"
        class="text-sm text-primary hover:underline p-0"
        @click="$emit('forgot-password')"
      >
        忘记密码？
      </Button>
    </div>

    <!-- 登录按钮 -->
    <Button type="submit" class="w-full glass-card" :disabled="isLoading">
      <template v-if="isLoading">
        <span class="mr-2">登录中</span>
        <span class="animate-spin">⏳</span>
      </template>
      <template v-else>
        登录
      </template>
    </Button>
  </form>
</template>