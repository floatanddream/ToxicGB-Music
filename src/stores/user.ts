import { defineStore } from 'pinia'
import type { User, Account, userSimpleInfo } from '@/types/user'
import {
  fetchUserPlaylist,
  getLikeMusic,
  getUserFromCookie,
  getUserSimpleIInfo,
  likeMusic,
} from '@/api/user'
import type { Playlist, Song } from '@/types/musicTypes'
import type { Playlist as FullPlaylist } from '@/types/playlist'
import { transformToPlaylist } from '@/utils/dataTransformer'
import emitter from '@/utils/eventBus'
import { MESSAGE_TYPE } from '@/constants/messages'

interface UserState {
  user: User | null
  account: Account | null
  loaded: boolean
  lastFetchTime: number
  _userCreatePlaylist: Playlist[] | null // 改名前缀加 _
  _userSubPlaylist: Playlist[] | null // 改名前缀加 _
  userLikeListSet: Set<number | string>
  userSubCount: userSimpleInfo | null
}

const getUserPlaylist = async (userId: number) => {
  let userCreate: Array<Playlist> = []
  let userSub: Array<Playlist> = []
  const res = await fetchUserPlaylist(userId)
  res.playlist.map((item: any) => {
    if (!item.subscribed) {
      userCreate.push(transformToPlaylist(item))
    } else {
      userSub.push(transformToPlaylist(item))
    }
  })
  return { userCreate, userSub }
}

const STORAGE_KEY = 'user_store'
const FETCH_INTERVAL = 10 * 60 * 1000 // 10分钟缓存

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    account: null,
    loaded: false,
    lastFetchTime: 0,
    _userCreatePlaylist: null,
    _userSubPlaylist: null,
    userLikeListSet: new Set(),
    userSubCount: null,
  }),

  getters: {

    isLogin: (state): boolean => !!state.user,

    userId: (state): number | null => state.user?.userId || null,

    nickname: (state): string => state.user?.nickname || '',

    avatar: (state): string => state.user?.avatarUrl || '',

    userCreatePlaylist: (state): Playlist[] => state._userCreatePlaylist || [],

    userSubPlaylist: (state): Playlist[] => state._userSubPlaylist || [],

    isSongLiked:
      (state) =>
      (song: Song): boolean =>
        state.userLikeListSet.has(song.id),
    
    isUserCreatedPlaylist: (state) =>
      (playlist: Playlist | FullPlaylist): boolean =>
        state._userCreatePlaylist!.some((item) => item.id === playlist.id),
  },

  actions: {
    init() {
      const cache = localStorage.getItem(STORAGE_KEY)
      if (!cache) return
      try {
        const data = JSON.parse(cache)
        this.user = data.user
        this.account = data.account
        this.lastFetchTime = data.lastFetchTime || 0
        this.loaded = data.loaded
        this._userCreatePlaylist = data.userCreatePlaylist
        this._userSubPlaylist = data.userSubPlaylist
        this.userLikeListSet = new Set(data.userLikeListSet || [])
      } catch {
        this.resetUser()
      }
    },

    async toggleLikeMusic(song: Song) {
      const isAlreadyLike = this.userLikeListSet.has(song.id)
      if (isAlreadyLike) {
        // 取消喜欢
        const res = await likeMusic(song.id, !isAlreadyLike)
        if (res?.code === 200 || res?.code === '200') {
          // 创建新 Set 触发响应式更新
          const newSet = new Set(this.userLikeListSet)
          newSet.delete(song.id)
          this.userLikeListSet = newSet
          emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, '已取消喜欢')
        } else {
          emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '取消喜欢失败')
        }
      } else {
        // 添加喜欢
        const res = await likeMusic(song.id, !isAlreadyLike)
        if (res?.code === 200 || res?.code === '200') {
          // 创建新 Set 触发响应式更新
          const newSet = new Set(this.userLikeListSet)
          newSet.add(song.id)
          this.userLikeListSet = newSet
          emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, '喜欢歌曲成功')
        } else {
          emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '喜欢歌曲失败')
        }
      }
    },

    async fetchUser(force = false) {
      const token = localStorage.getItem('cookie')
      if (!token) {
        this.resetUser()
        return
      }
      if (!force && this.loaded && Date.now() - this.lastFetchTime < FETCH_INTERVAL) {
        return
      }
      try {
        const res = await getUserFromCookie()
        const { userCreate, userSub } = await getUserPlaylist(res.account.id)
        const userSimpleInfoRes = await getUserSimpleIInfo()
        const userLikeListRes = await getLikeMusic(res.account.id)

        this.userLikeListSet = new Set(
          userLikeListRes.ids.map((id: number | string) => id.toString()),
        )
        this.user = res.profile
        this.account = res.account
        this.loaded = true
        this.lastFetchTime = Date.now()
        this._userCreatePlaylist = userCreate
        this._userSubPlaylist = userSub
        const { code, ...userSimpleInfo } = userSimpleInfoRes
        this.userSubCount = userSimpleInfo
        this.persist()
      } catch (error) {
        console.error('token 失效或获取用户失败', error)
        this.resetUser()
      }
    },
    async ensureUser() {
      if (!this.loaded) {
        await this.fetchUser()
      }
    },
    setUser(user: User, account: Account) {
      this.user = user
      this.account = account
      this.loaded = true
      this.lastFetchTime = Date.now()
      this.persist()
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
          lastFetchTime: this.lastFetchTime,
          userLikeListSet: [...this.userLikeListSet],
        }),
      )
    },
  },
})

export type userStore = ReturnType<typeof useUserStore>
