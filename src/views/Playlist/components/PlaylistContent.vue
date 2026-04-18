<script setup lang="ts">
import { ref, computed } from 'vue';
import PlaylistTabs from './PlaylistTabs.vue';
import SongList from '@/components/common/musicComponents/SongList.vue';
import type { Song } from '@/types/musicTypes';
import type { Comment, CommentListResponse } from '@/types/comment';
import SongsContainer from '@/components/common/songComponents/songsContainer.vue';

const activeTab = ref<'songs' | 'comments' | 'subscribers' | 'activities'>('songs');

const props = defineProps<{
  songs: Song[];
}>();

// Mock 评论数据，符合 Comment 接口
const mockComments: Comment[] = [
  {
    user: {
      nickname: '音乐爱好者',
      avatarUrl: '/api/placeholder/40/40',
      userId: 12345,
      authStatus: 0,
      vipType: 0,
      followed: false,
      mutual: false,
      userType: 0,
      avatarDetail: null,
      vipRights: null,
      socialUserId: null,
      remarkName: null,
      experts: null,
      expertTags: null,
      commonIdentity: null,
      locationInfo: null,
      liveInfo: null,
      anonym: 0,
      highlight: false,
      target: null
    },
    beReplied: [],
    status: 0,
    commentId: 1,
    content: '这歌单太棒了！每首歌都是经典，循环播放一整天了！🎵',
    richContent: '这歌单太棒了！每首歌都是经典，循环播放一整天了！🎵',
    time: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
    timeStr: '2小时前',
    likedCount: 128,
    liked: false,
    expressionUrl: null,
    commentLocationType: 0,
    parentCommentId: 0,
    decoration: null,
    repliedMark: null,
    grade: null,
    userBizLevels: null,
    ipLocation: {
      ip: null,
      location: '北京',
      userId: null
    },
    owner: false,
    medal: null,
    likeAnimationMap: {},
    pendantData: null,
    showFloorComment: null,
    contentResource: null,
    needDisplayTime: true
  },
  {
    user: {
      nickname: '歌单作者',
      avatarUrl: '/api/placeholder/40/40',
      userId: 67890,
      authStatus: 1,
      vipType: 1,
      followed: true,
      mutual: false,
      userType: 1,
      avatarDetail: null,
      vipRights: null,
      socialUserId: null,
      remarkName: null,
      experts: null,
      expertTags: null,
      commonIdentity: null,
      locationInfo: null,
      liveInfo: null,
      anonym: 0,
      highlight: true,
      target: null
    },
    beReplied: [
      {
        user: {
          nickname: '粉丝用户',
          avatarUrl: '/api/placeholder/40/40',
          userId: 11111,
          authStatus: 0,
          vipType: 0,
          followed: false,
          mutual: false,
          userType: 0,
          avatarDetail: null,
          vipRights: null,
          socialUserId: null,
          remarkName: null,
          experts: null,
          expertTags: null,
          commonIdentity: null,
          locationInfo: null,
          liveInfo: null,
          anonym: 0,
          highlight: false,
          target: null
        },
        beRepliedCommentId: 2,
        content: '感谢作者！歌单真的很用心',
        richContent: '感谢作者！歌单真的很用心',
        status: 0,
        expressionUrl: null,
        ipLocation: {
          ip: null,
          location: '上海',
          userId: null
        }
      }
    ],
    status: 0,
    commentId: 2,
    content: '感谢大家的支持！我会继续更新更多优质歌单，有什么好听的歌也可以推荐给我哦～',
    richContent: '感谢大家的支持！我会继续更新更多优质歌单，有什么好听的歌也可以推荐给我哦～',
    time: Date.now() - 5 * 60 * 60 * 1000, // 5小时前
    timeStr: '5小时前',
    likedCount: 256,
    liked: true,
    expressionUrl: null,
    commentLocationType: 0,
    parentCommentId: 0,
    decoration: {
      repliedByAuthorCount: 1
    },
    repliedMark: null,
    grade: null,
    userBizLevels: null,
    ipLocation: {
      ip: null,
      location: '广州',
      userId: null
    },
    owner: true,
    medal: null,
    likeAnimationMap: {},
    pendantData: null,
    showFloorComment: null,
    contentResource: null,
    needDisplayTime: true
  },
  {
    user: {
      nickname: '深夜听歌人',
      avatarUrl: '/api/placeholder/40/40',
      userId: 22222,
      authStatus: 0,
      vipType: 0,
      followed: false,
      mutual: false,
      userType: 0,
      avatarDetail: null,
      vipRights: null,
      socialUserId: null,
      remarkName: null,
      experts: null,
      expertTags: null,
      commonIdentity: null,
      locationInfo: null,
      liveInfo: null,
      anonym: 0,
      highlight: false,
      target: null
    },
    beReplied: [],
    status: 0,
    commentId: 3,
    content: '深夜听这个歌单真的绝了，每首歌都直击心灵 🌙',
    richContent: '深夜听这个歌单真的绝了，每首歌都直击心灵 🌙',
    time: Date.now() - 24 * 60 * 60 * 1000, // 1天前
    timeStr: '1天前',
    likedCount: 89,
    liked: false,
    expressionUrl: null,
    commentLocationType: 0,
    parentCommentId: 0,
    decoration: null,
    repliedMark: null,
    grade: null,
    userBizLevels: null,
    ipLocation: {
      ip: null,
      location: '深圳',
      userId: null
    },
    owner: false,
    medal: null,
    likeAnimationMap: {},
    pendantData: null,
    showFloorComment: null,
    contentResource: null,
    needDisplayTime: true
  }
];

// 格式化时间的辅助函数
const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    return '刚刚';
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};
</script>

<template>
  <div class="playlist-content-container">
    <!-- 标签页切换 -->
    <PlaylistTabs v-model="activeTab" />

    <!-- 标签页内容 -->
    <Transition name="fade-slide" mode="out-in">
      <!-- 歌曲标签页 -->
      <div v-if="activeTab === 'songs'" key="songs" class="playlist-content">
        <SongsContainer title="歌单歌曲" :songs="songs" />
        <div class="songs-footer mt-6 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            最后更新: {{ new Date().toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- 评论标签页 -->
      <div v-else-if="activeTab === 'comments'" key="comments" class="playlist-content">
        <div class="comments-container">
          <div class="space-y-6">
            <div
              v-for="comment in mockComments"
              :key="comment.commentId"
              class="comment-item border-b border-gray-200/10 pb-6"
            >
              <div class="flex gap-4">
                <!-- 用户头像 -->
                <div class="flex-shrink-0">
                  <img
                    :src="comment.user.avatarUrl || '/api/placeholder/40/40'"
                    :alt="comment.user.nickname"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </div>

                <!-- 评论内容 -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ comment.user.nickname }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatTime(comment.time) }}
                    </span>
                    <span
                      v-if="comment.owner"
                      class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded"
                    >
                      作者
                    </span>
                  </div>

                  <div class="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {{ comment.content }}
                  </div>

                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <button
                      class="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <span class="w-4 h-4">👍</span>
                      {{ comment.likedCount }}
                    </button>
                    <button class="hover:text-red-500 transition-colors">回复</button>
                  </div>

                  <!-- 回复列表 -->
                  <div
                    v-if="comment.beReplied && comment.beReplied.length > 0"
                    class="mt-4 space-y-3"
                  >
                    <div
                      v-for="replied in comment.beReplied"
                      :key="replied.beRepliedCommentId"
                      class="bg-gray-50/5 rounded-lg p-3"
                    >
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium text-gray-900 dark:text-white">
                          {{ replied.user.nickname }}
                        </span>
                        <span class="text-xs text-gray-500">回复</span>
                        <span class="text-xs text-gray-900 dark:text-white">
                          {{ comment.user.nickname }}
                        </span>
                      </div>
                      <div class="text-xs text-gray-700 dark:text-gray-300">
                        {{ replied.content }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="text-center mt-8">
            <button
              class="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              加载更多评论
            </button>
          </div>
        </div>
      </div>

      <!-- 收藏者标签页 -->
      <div v-else-if="activeTab === 'subscribers'" key="subscribers" class="playlist-content">
        <div class="text-center py-12 text-gray-500">
          <p>收藏者列表</p>
        </div>
      </div>

      <!-- 动态标签页 -->
      <div v-else-if="activeTab === 'activities'" key="activities" class="playlist-content">
        <div class="text-center py-12 text-gray-500">
          <p>歌单动态</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.playlist-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.songs-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 16px;
}

.comments-container {
  min-height: 400px;
}

@media (max-width: 640px) {
  .playlist-content {
    padding: 16px;
  }
}

/* 新增淡入淡出+滑动动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>