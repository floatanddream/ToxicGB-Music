import { defineStore } from 'pinia'
import type { User, Account } from '@/types/user'
import { fetchUserPlaylist, getUserFromCookie } from '@/api/user'
import type { Playlist } from '@/types/musicTypes'
import { transformToPlaylist } from '@/utils/dataTransformer'

interface UserState {
  user: User | null;
  account: Account | null;
  loaded: boolean;
  lastFetchTime: number;
  userCreatePlaylist: Playlist[]| null;
  userSubPlaylist: Playlist[]| null;
}

const getUserPlaylist = async (userId: number) => {
  let userCreate: Array<Playlist> = [];
  let userSub: Array<Playlist> = [];
  const res = await fetchUserPlaylist(userId);
  res.playlist.map((item : any) =>{
    if(!item.subscribed){
      userCreate.push(transformToPlaylist(item));
    }
    else{
      userSub.push(transformToPlaylist(item))
    }
  });
  return { userCreate, userSub };
}

const STORAGE_KEY = 'user_store'
const FETCH_INTERVAL = 10 * 60 * 1000 // 10分钟缓存

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    account: null,
    loaded: false,
    lastFetchTime: 0,
    userCreatePlaylist: null,
    userSubPlaylist: null
  }),

  getters: {
    isLogin: (state): boolean => !!state.user,

    userId: (state): number | null => state.user?.userId || null,

    nickname: (state): string => state.user?.nickname || '',

    avatar: (state): string => state.user?.avatarUrl || '',

    userCreatePlaylist: (state): Playlist[] => state.userCreatePlaylist || [],

    userSubPlaylist: (state): Playlist[] => state.userSubPlaylist || []
  },

  actions: {
    init() {
      const cache = localStorage.getItem(STORAGE_KEY)
      if (!cache) return
      try {
        const data = JSON.parse(cache);
        this.user = data.user;
        this.account = data.account;
        this.lastFetchTime = data.lastFetchTime || 0;
        this.loaded = data.loaded;
        this.userCreatePlaylist=data.userCreatePlaylist;
        this.userSubPlaylist=data.userSubPlaylist;
      } catch {
        this.resetUser()
      }
    },

    async fetchUser(force = false) {
      const token = localStorage.getItem('cookie')
      if (!token) {
        this.resetUser()
        return
      }
      if (
        !force &&
        this.loaded &&
        Date.now() - this.lastFetchTime < FETCH_INTERVAL
      ) {
        return
      }
      try {
        const res = await getUserFromCookie()
        const { userCreate, userSub } = await getUserPlaylist(res.account.id);
        this.user = res.profile;
        this.account = res.account;
        this.loaded = true;
        this.lastFetchTime = Date.now();
        this.userCreatePlaylist = userCreate;
        this.userSubPlaylist = userSub;

        this.persist();
      } catch (error) {
        console.error('token 失效或获取用户失败', error);
        this.resetUser();
      }
    },
    async ensureUser() {
      if (!this.loaded) {
        await this.fetchUser();
      }
    },
    setUser(user: User, account: Account) {
      this.user = user;
      this.account = account;
      this.loaded = true;
      this.lastFetchTime = Date.now();
      this.persist();
    },

    // ⭐ 退出登录 / token 失效
    resetUser() {
      this.user = null
      this.account = null
      this.loaded = false
      this.lastFetchTime = 0

      localStorage.removeItem(STORAGE_KEY)
    },

    // ⭐ 持久化
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: this.user,
          account: this.account,
          lastFetchTime: this.lastFetchTime
        })
      )
    }
  }
})