<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon } from 'lucide-vue-next';

const emit = defineEmits<{
  submit: [email: string];
}>();

const isLoading = ref(false);

const formData = reactive({
  email: ''
});

const errors = reactive({
  email: ''
});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const clearErrors = () => {
  errors.email = '';
};

const validateForm = (): boolean => {
  clearErrors();
  let isValid = true;

  if (!formData.email) {
    errors.email = '请输入邮箱地址';
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    emit('submit', formData.email);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.email = '';
  clearErrors();
};

defineExpose({
  resetForm
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="text-center mb-6">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        输入您的邮箱地址，我们将发送密码重置链接
      </p>
    </div>

    <!-- 邮箱 -->
    <div class="space-y-2">
      <Label for="forgot-email">邮箱</Label>
      <div class="relative">
        <Input
          id="forgot-email"
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

    <!-- 发送重置链接按钮 -->
    <Button type="submit" class="w-full glass-card" :disabled="isLoading">
      <template v-if="isLoading">
        <span class="mr-2">发送中</span>
        <span class="animate-spin">⏳</span>
      </template>
      <template v-else>
        发送重置链接
      </template>
    </Button>
  </form>
</template>