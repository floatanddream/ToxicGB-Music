<script setup lang="ts">
import { ref, defineAsyncComponent, computed, watch } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-vue-next';


type AuthMode = 'login' | 'register' | 'forgot-password' | 'qrcode';

const isOpen = ref(false);
const authMode = ref<AuthMode>('login');
const previousAuthMode = ref<AuthMode | null>(null);
const isTransitioning = ref(false);

// Async component loading for better performance
const LoginForm = defineAsyncComponent(() => import('./Auth/LoginForm.vue'));
const RegisterForm = defineAsyncComponent(() => import('./Auth/RegisterForm.vue'));
const ForgotPasswordForm = defineAsyncComponent(() => import('./Auth/ForgotPasswordForm.vue'));
const QRCodeLoginForm = defineAsyncComponent(() => import('./Auth/QRCodeLoginForm.vue'));

watch(authMode, (newMode, oldMode) => {
  if (oldMode !== newMode) {
    previousAuthMode.value = oldMode;
    isTransitioning.value = true;
  }
});

const setAuthMode = (mode: AuthMode) => {
  if (mode !== authMode.value && !isTransitioning.value) {
    authMode.value = mode;
  }
};

const openAuthModal = () => {
  isOpen.value = true;
  authMode.value = 'login';
  previousAuthMode.value = null;
};

const closeAuthModal = () => {
  isOpen.value = false;
  // Reset child forms when modal closes
  resetCurrentForm();
};

const resetCurrentForm = () => {
  // This will be called on child components to reset their forms
  // Implementation depends on how we want to handle form resets
};

const beforeEnter = () => {
  // Preparation before enter transition
};

const afterLeave = () => {
  // Cleanup after leave transition
  isTransitioning.value = false;
};

const handleLogin = async (data: { email: string; password: string; remember: boolean }) => {
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('登录数据:', data);
    closeAuthModal();
  } catch (error) {
    console.error('登录失败:', error);
  }
};

const handleRegister = async (data: { email: string; password: string; username: string }) => {
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('注册数据:', data);
    closeAuthModal();
  } catch (error) {
    console.error('注册失败:', error);
  }
};

const handleForgotPassword = async (email: string) => {
  try {
    // 模拟发送重置邮件
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('重置密码邮件已发送至:', email);
    setAuthMode('login');
  } catch (error) {
    console.error('发送重置邮件失败:', error);
  }
};

const handleQRCodeLoginSuccess = (cookie: string) => {
  try {
    console.log('二维码登录成功，cookie:', cookie);
    // 可以在这里保存cookie到localStorage等
    closeAuthModal();
  } catch (error) {
    console.error('二维码登录成功处理失败:', error);
  }
};

defineExpose({
  openAuthModal,
  closeAuthModal
});
</script>

<template>
  <Dialog :style="{ 'z-index': 15000 }" v-model:open="isOpen">
    <DialogContent :class="{
      'login-mode': authMode === 'login',
      'register-mode': authMode === 'register',
      'forgot-mode': authMode === 'forgot-password'
    }" class="change-container glass-container max-w-md p-8 rounded-2xl z-500 overflow-hidden ">
      <!-- 头部 -->
      <DialogHeader class="relative">
        <!-- 返回按钮 -->
        <Button v-if="authMode !== 'login'" variant="ghost" size="icon" class="absolute left-0 top-0 rounded-full"
          @click="setAuthMode('login')">
          <ArrowLeftIcon class="h-4 w-4" />
        </Button>

        <transition name="scale" mode="out-in">
          <DialogTitle :key="authMode" class="text-2xl font-bold text-center">
            <template v-if="authMode === 'login'">登录</template>
            <template v-else-if="authMode === 'register'">注册</template>
            <template v-else-if="authMode === 'forgot-password'">重置密码</template>
          </DialogTitle>
        </transition>

        <transition name="scale" mode="out-in">
          <DialogDescription :key="authMode" class="text-center mt-2">
            <template v-if="authMode === 'login'">登录您的账号以继续</template>
            <template v-else-if="authMode === 'register'">创建新账号以开始</template>
            <template v-else-if="authMode === 'forgot-password'">输入您的邮箱以重置密码</template>
          </DialogDescription>
        </transition>
      </DialogHeader>

      <div class="form-container relative min-h-75">
        <!-- Dynamic component with smooth transitions -->
        <transition name="scale" mode="out-in" @before-enter="beforeEnter" @after-leave="afterLeave">
          <component
            :key="authMode"
            :is="authMode === 'login' ? LoginForm : (
              authMode === 'register' ? RegisterForm : (
                authMode === 'qrcode' ? QRCodeLoginForm : ForgotPasswordForm
              )
            )"
            @submit="authMode === 'login' ? handleLogin($event) : (
              authMode === 'register' ? handleRegister($event) : handleForgotPassword($event)
            )"
            @forgot-password="setAuthMode('forgot-password')"
            @login-success="handleQRCodeLoginSuccess"
            @switch-to-password="setAuthMode('login')"
          />
        </transition>
      </div>

      <!-- 登录方式切换 -->
      <transition name="fade" mode="out-in">
        <div v-if="authMode === 'login'" class="text-center mt-6 space-y-3">
          <!-- 二维码登录按钮 -->
          <Button variant="outline" class="w-full" @click="setAuthMode('qrcode')">
            扫码登录
          </Button>

          <!-- 登录/注册切换 -->
          <Button variant="link" class="text-sm text-primary hover:underline"
            @click="setAuthMode('register')">
            还没有账号？立即注册
          </Button>
        </div>

        <div v-else-if="authMode === 'register'" class="text-center mt-6">
          <Button variant="link" class="text-sm text-primary hover:underline"
            @click="setAuthMode('login')">
            已有账号？立即登录
          </Button>
        </div>

        <div v-else-if="authMode === 'qrcode'" class="text-center mt-6">
          <Button variant="link" class="text-sm text-primary hover:underline"
            @click="setAuthMode('login')">
            返回密码登录
          </Button>
        </div>
      </transition>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.change-container {
  overflow: hidden;
  max-height: 0px !important;
  transition: max-height 0.3s ease;
}
.change-container.login-mode{
  max-height: 461.764px;
}
.change-container.register-mode{
  max-height: 565.764px
}
.change-container.forgot-mode{
  max-height: 325.764px
}


.form-container {
  position: relative;
  min-height: 200px;
}

.form-container>* {
  width: 100%;
}

/* 缩放 + 淡入淡出动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.4s ease;
}

.scale-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>