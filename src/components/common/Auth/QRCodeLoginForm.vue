<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import request from '@/utils/request';

interface QRCodeData {
  key: string;
  qrimg: string;
}

interface QRCodeStatus {
  code: number;
  cookie?: string;
  message?: string;
}

const emit = defineEmits<{
  'login-success': [cookie: string];
  'switch-to-password': [];
}>();

const qrCodeData = ref<QRCodeData | null>(null);
const qrCodeStatus = ref<'loading' | 'ready' | 'scanned' | 'success' | 'expired'>('loading');
const qrCodeMessage = ref('请使用网易云音乐APP扫描二维码');
const countdown = ref(0);
let timer: NodeJS.Timeout | null = null;
let checkInterval: NodeJS.Timeout | null = null;

const generateQRCode = async () => {
  try {
    qrCodeStatus.value = 'loading';
    qrCodeMessage.value = '正在生成二维码...';

    // 获取登录密钥
    const keyRes = await request.get<{ data: { unikey: string } }>(`/login/qr/key?timestamp=${Date.now()}`);
    const key = keyRes.data.unikey;

    // 生成二维码
    const qrRes = await request.get<{ data: { qrimg: string } }>(`/login/qr/create?key=${key}&qrimg=true&timestamp=${Date.now()}`);
    qrCodeData.value = { key, qrimg: qrRes.data.qrimg };
    qrCodeStatus.value = 'ready';
    qrCodeMessage.value = '请使用网易云音乐APP扫描二维码';

    // 开始检查扫描状态
    startCheckStatus(key);

    // 60秒倒计时
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        qrCodeStatus.value = 'expired';
        qrCodeMessage.value = '二维码已过期，请重新获取';
        clearCheckInterval();
      }
    }, 1000);

  } catch (error) {
    console.error('生成二维码失败:', error);
    qrCodeStatus.value = 'expired';
    qrCodeMessage.value = '生成二维码失败，请重试';
  }
};

const checkStatus = async (key: string): Promise<QRCodeStatus> => {
  try {
    const res = await request.get<QRCodeStatus>(`/login/qr/check?key=${key}&timestamp=${Date.now()}`);
    return res;
  } catch (error) {
    console.error('检查状态失败:', error);
    return { code: 500, message: '检查状态失败' };
  }
};

// 设置cookie
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  document.cookie = cookie;
};

const startCheckStatus = (key: string) => {
  checkInterval = setInterval(async () => {
    if (!qrCodeData.value) return;

    const status = await checkStatus(key);

    if (status.code === 800) {
      // 二维码已过期
      qrCodeStatus.value = 'expired';
      qrCodeMessage.value = '二维码已过期，请重新获取';
      clearCheckInterval();
    } else if (status.code === 801) {
      // 等待扫码
      qrCodeStatus.value = 'ready';
      qrCodeMessage.value = '请使用网易云音乐APP扫描二维码';
    } else if (status.code === 802) {
      // 已扫码，等待确认
      qrCodeStatus.value = 'scanned';
      qrCodeMessage.value = '请在手机上确认登录';
    } else if (status.code === 803) {
      // 登录成功
      qrCodeStatus.value = 'success';
      qrCodeMessage.value = '登录成功！正在跳转...';
      clearCheckInterval();

      if (status.cookie) {
        // 保存cookie到localStorage和document.cookie
        localStorage.setItem('cookie', status.cookie);
        setCookie('cookie', status.cookie, 7);
        emit('login-success', status.cookie);
      }
    }
  }, 2000);
};

const clearCheckInterval = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 组件卸载时清理
onUnmounted(() => {
  clearCheckInterval();
});

// 初始化生成二维码
generateQRCode();
</script>

<template>
  <div class="qrcode-login-form">
    <div class="qrcode-container">
      <div class="qrcode-header mb-6">
        <h2 class="text-2xl font-bold text-center">扫码登录</h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mt-2">使用网易云音乐APP扫码登录</p>
      </div>

      <!-- 二维码展示区域 -->
      <div class="qrcode-display flex flex-col items-center justify-center mb-6">
        <div class="qrcode-wrapper bg-white p-4 rounded-xl shadow-lg">
          <img v-if="qrCodeData?.qrimg" :src="qrCodeData.qrimg" alt="登录二维码" class="qrcode-image w-48 h-48" />
          <div v-else class="w-48 h-48 flex items-center justify-center">
            <div v-if="qrCodeStatus === 'loading'" class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p class="text-sm text-gray-500">生成中...</p>
            </div>
            <div v-else-if="qrCodeStatus === 'expired'" class="text-center">
              <div class="text-gray-400 mb-2">二维码已过期</div>
              <Button size="sm" @click="generateQRCode">重新获取</Button>
            </div>
          </div>
        </div>

        <!-- 倒计时 -->
        <div v-if="countdown > 0 && qrCodeStatus !== 'success'" class="countdown mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            二维码有效期: <span class="text-red-500 font-semibold">{{ countdown }}秒</span>
          </p>
        </div>

        <!-- 状态消息 -->
        <div class="status-message mt-4 text-center min-h-[20px]">
          <p :class="{
            'text-yellow-500': qrCodeStatus === 'ready',
            'text-blue-500': qrCodeStatus === 'scanned',
            'text-green-500': qrCodeStatus === 'success',
            'text-red-500': qrCodeStatus === 'expired'
          }">
            {{ qrCodeMessage }}
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons space-y-3">
        <Button v-if="qrCodeStatus === 'expired'" class="w-full" @click="generateQRCode">
          重新生成二维码
        </Button>
      </div>

      <!-- 登录说明 -->
      <div class="login-tips mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>• 打开网易云音乐APP</p>
        <p>• 点击左上角"我的"进入个人中心</p>
        <p>• 点击"扫码"功能扫描二维码</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qrcode-login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.qrcode-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.qrcode-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.qrcode-image {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.countdown {
  animation: pulse 1s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.status-message {
  transition: all 0.3s ease;
}

.login-tips {
  line-height: 1.8;
}

@media (max-width: 640px) {
  .qrcode-login-form {
    max-width: 100%;
    padding: 0 1rem;
  }

  .qrcode-image {
    width: 12rem;
    height: 12rem;
  }
}
</style>