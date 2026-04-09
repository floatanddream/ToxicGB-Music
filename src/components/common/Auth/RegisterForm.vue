<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next';

const emit = defineEmits<{
  submit: [data: { email: string; password: string; username: string }];
}>();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  username: ''
});

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  username: ''
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
  errors.confirmPassword = '';
  errors.username = '';
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

  if (!formData.username) {
    errors.username = '用户名不能为空';
    isValid = false;
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = '请确认密码';
    isValid = false;
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
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
      username: formData.username
    });
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.email = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.username = '';
  clearErrors();
};

defineExpose({
  resetForm
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- 用户名 -->
    <div class="space-y-2">
      <Label for="register-username">用户名</Label>
      <div class="relative">
        <Input
          id="register-username"
          v-model="formData.username"
          type="text"
          placeholder="请输入用户名"
          class="pl-10 glass-card"
          :class="{ 'border-red-500': errors.username }"
        />
        <UserIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <p v-if="errors.username" class="text-sm text-red-500">{{ errors.username }}</p>
    </div>

    <!-- 邮箱 -->
    <div class="space-y-2">
      <Label for="register-email">邮箱</Label>
      <div class="relative">
        <Input
          id="register-email"
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
      <Label for="register-password">密码</Label>
      <div class="relative">
        <Input
          id="register-password"
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

    <!-- 确认密码 -->
    <div class="space-y-2">
      <Label for="register-confirm-password">确认密码</Label>
      <div class="relative">
        <Input
          id="register-confirm-password"
          v-model="formData.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入密码"
          class="pl-10 pr-10 glass-card"
          :class="{ 'border-red-500': errors.confirmPassword }"
        />
        <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <EyeIcon v-if="!showConfirmPassword" class="h-4 w-4 text-gray-400" />
          <EyeOffIcon v-else class="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <p v-if="errors.confirmPassword" class="text-sm text-red-500">{{ errors.confirmPassword }}</p>
    </div>

    <!-- 注册按钮 -->
    <Button type="submit" class="w-full btn-gradient-primary" :disabled="isLoading">
      <template v-if="isLoading">
        <span class="mr-2">注册中</span>
        <span class="animate-spin">⏳</span>
      </template>
      <template v-else>
        注册
      </template>
    </Button>
  </form>
</template>