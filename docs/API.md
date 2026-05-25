# ToxicGB-Music API 文档

基于项目中实际 API 调用方式推测的 API 响应数据结构。

---

## HTTP 客户端架构

- **基础库**: `ky` (非 axios)，自定义 `HttpClient` 类封装
- **Base URL**: `VITE_GLOB_API_URL` 环境变量
- **默认配置**: 10s 超时，2 次重试
- **认证**: `localStorage` 中的 `cookie` 随请求发送
- **响应解包**: 原始响应格式为 `{ success, data, errorMsg, code }`，`afterResponse` 钩子在 `success: true` 时提取 `data.data` 返回
- **401 自动刷新**: 触发 `POST /auth/refresh` 获取新 Token 后重试
- **可用方法**: `get(searchParams)`, `post(json)`, `put(json)`, `delete(json)`

---

## API 清单

### 1. GET /banner

**文件**: `src/api/banner.ts` → `getBanner()`

**响应**:
```json
{
  "banners": [
    {
      "imageUrl": "string",
      "bigImageUrl": "string | null",
      "typeTitle": "string | null"
    }
  ]
}
```

**使用处**: `src/views/Home/components/carousel.vue` — 首页轮播

---

### 2. GET /song/url/v1

**文件**: `src/api/song.ts` → `getSongUrl(id)`

**参数**: `id`, `level='exhigh'`

**响应**:
```json
{
  "data": [
    { "url": "string (音频地址)" }
  ]
}
```

**使用处**: `src/core/player/MusicService.ts` — 获取歌曲播放地址，5分钟缓存

---

### 3. POST /lyric/new

**文件**: `src/api/lyric.ts` → `getSongLyric(id)`

**参数**: `id`, `timestamp`

**响应**: 未知（未被当前代码直接调用，可能由歌词组件内部使用）

---

### 4. GET /album

**文件**: `src/api/album.ts` → `getAlbumDetail(id)`

**参数**: `id`

**响应**:
```json
{
  "album": {
    "id": "number",
    "name": "string",
    "picUrl": "string",
    "blurPicUrl": "string",
    "type": "string",
    "subType": "string",
    "publishTime": "number (timestamp)",
    "description": "string",
    "briefDesc": "string",
    "size": "number (歌曲数)",
    "artists": [
      { "id": "number", "name": "string", "picUrl": "string" }
    ],
    "info": {
      "commentThread": {
        "commentCount": "number",
        "shareCount": "number"
      }
    }
  },
  "songs": [
    {
      "id": "number",
      "name": "string",
      "alias": ["string"],
      "alia": ["string"],
      "dt": "number (时长ms)",
      "publishTime": "number",
      "ar": [{ "id": "number", "name": "string" }],
      "al": { "id": "number", "name": "string", "picUrl": "string" }
    }
  ]
}
```

**转换**: `transformAlbumDetail()` → `Album` 类型

**使用处**: `src/views/Album/index.vue` — 专辑详情页

---

### 5. GET /comment/album

**文件**: `src/api/album.ts` → `getAlbumComments(params)`

**参数**: `id`, `limit`(默认20), `offset`(默认0), `before`(可选)

**响应**:
```json
{
  "isMusician": "boolean",
  "cnum": "number",
  "userId": "number",
  "topComments": ["Comment[]"],
  "moreHot": "boolean",
  "hotComments": ["Comment[]"],
  "commentBanner": "null",
  "code": "number",
  "comments": ["Comment[]"],
  "total": "number",
  "more": "boolean"
}
```

**转换**: `transformCommentListResponse()`

**使用处**: `src/views/Album/index.vue` — 专辑评论分页加载

---

### 6. GET /search

**文件**: `src/api/search.ts`

| 函数 | type参数 | 含义 |
|------|----------|------|
| `searchByKeyword(keyword)` | 1018 | 综合搜索（暂无使用） |
| `searchBySong(keyword)` | 1 | 歌曲搜索 |
| `searchByAlbum(keyword)` | 10 | 专辑搜索 |
| `searchBySinger(keyword)` | 100 | 歌手搜索 |
| `searchByPlaylist(keyword)` | 1000 | 歌单搜索 |
| `searchByUser(keyword)` | 1002 | 用户搜索 |

**参数**: `keywords`, `type`, `limit=100`

#### searchBySong 响应:
```json
{
  "result": {
    "songs": [
      {
        "id": "number",
        "name": "string",
        "alias": ["string"],
        "alia": ["string"],
        "dt": "number",
        "publishTime": "number",
        "ar": [{ "id": "number", "name": "string" }],
        "al": { "id": "number", "name": "string", "picUrl": "string" }
      }
    ]
  }
}
```
**转换**: `data.result.songs.map(transformToSong)` → `Song[]`

#### searchByAlbum 响应:
```json
{
  "result": {
    "albums": [
      {
        "id": "number",
        "name": "string",
        "artists": [{ "name": "string" }],
        "picUrl": "string",
        "publishTime": "number",
        "size": "number"
      }
    ]
  }
}
```
**转换**: `data.result.albums.map(item => transformAlbums(item, true))` → `Album[]`

#### searchBySinger 响应:
```json
{
  "result": {
    "artists": [
      {
        "id": "number",
        "name": "string",
        "picUrl": "string",
        "img1v1Url": "string",
        "fansSize": "number",
        "musicSize": "number",
        "identityIconUrl": "string"
      }
    ]
  }
}
```
**转换**: `data.result.artists.map(transformToArtist)` → `Artist[]`

#### searchByPlaylist 响应:
```json
{
  "result": {
    "playlists": [
      {
        "id": "number",
        "name": "string",
        "creator": {
          "userId": "number",
          "nickname": "string",
          "avatarUrl": "string"
        },
        "coverImgUrl": "string",
        "trackCount": "number",
        "playCount": "number",
        "bookCount": "number",
        "subscribedCount": "number",
        "subscribed": "boolean",
        "description": "string | null"
      }
    ]
  }
}
```
**转换**: `data.result.playlists.map(transformToPlaylist)` → `Playlist[]`

#### searchByUser 响应:
```json
{
  "result": {
    "userprofiles": [
      {
        "userId": "number",
        "nickname": "string",
        "avatarUrl": "string",
        "followed": "boolean"
      }
    ]
  }
}
```
**转换**: `data.result.userprofiles.map(transformToUser)` → `User[]`

**使用处**: `src/views/Search/index.vue` — 5种搜索类型并行调用

---

### 7. GET /playlist/detail

**文件**: `src/api/playlist.ts` → `getPlaylistDetail(playlistId)`

**参数**: `id`, `sendCookie=true`

**响应**:
```json
{
  "playlist": {
    "id": "number",
    "name": "string",
    "coverImgId": "number",
    "coverImgUrl": "string",
    "userId": "number",
    "createTime": "number",
    "updateTime": "number",
    "trackCount": "number",
    "playCount": "number",
    "subscribedCount": "number",
    "cloudTrackCount": "number",
    "description": "string",
    "tags": ["string"],
    "subscribed": "boolean",
    "creator": { -- User对象 -- },
    "tracks": [
      {
        "id": "number",
        "name": "string",
        "alias": ["string"],
        "alia": ["string"],
        "dt": "number",
        "publishTime": "number",
        "ar": [{ "id": "number", "name": "string" }],
        "al": { "id": "number", "name": "string", "picUrl": "string" }
      }
    ],
    "subscribers": [
      { "userId": "number", "nickname": "string", "avatarUrl": "string", "followed": "boolean" }
    ],
    "backgroundCoverUrl": "string | null",
    "englishTitle": "string | null",
    "highQuality": "boolean",
    "privacy": "number",
    "specialType": "number",
    "trackUpdateTime": "number",
    "trackNumberUpdateTime": "number"
  }
}
```

**转换**: `transformPlaylistDetail()` → `Playlist` 完整类型

**使用处**: `src/views/Playlist/index.vue` — 歌单详情页

---

### 8. GET /comment/playlist

**文件**: `src/api/playlist.ts` → `getPlaylistComments(params)`

**参数**: `id`, `limit`(默认20), `offset`(默认0), `before`(可选)

**响应**: 与 `/comment/album` 相同

**使用处**: `src/views/Playlist/index.vue` — 歌单评论分页加载

---

### 9. GET /playlist/subscribers

**文件**: `src/api/playlist.ts` → `getPlaylistSubscribers(params)`

**参数**: `id`, `limit`(默认20), `offset`(默认0)

**响应**:
```json
{
  "subscribers": [
    {
      "userId": "number",
      "nickname": "string",
      "avatarUrl": "string",
      "followed": "boolean"
    }
  ],
  "more": "boolean"
}
```

**转换**: `data.subscribers.map(transformToUser)` → `User[]`

**使用处**: `src/views/Playlist/index.vue` — 歌单收藏者列表

---

### 10. GET /top/playlist

**文件**: `src/api/playlist.ts` → `getExquisitePlaylists(params)`

**参数**: `order`('new'|'hot'，默认'hot'), `cat`(默认'全部'), `limit`(默认10), `offset`(默认0)

**响应**:
```json
{
  "playlists": [
    {
      "id": "number",
      "name": "string",
      "creator": { "userId": "number", "nickname": "string", "avatarUrl": "string" },
      "coverImgUrl": "string",
      "trackCount": "number",
      "playCount": "number",
      "bookCount": "number",
      "subscribedCount": "number",
      "subscribed": "boolean",
      "description": "string | null"
    }
  ]
}
```

**转换**: `res.playlists.map(transformToPlaylist)` → `Playlist[]`

**使用处**: `src/views/Home/components/PlaylistSection.vue` — 首页精选歌单

---

### 11. GET /playlist/track/all

**文件**: `src/api/playlist.ts` → `getPlaylistAllTracks(params)`

**参数**: `id`, `limit`(默认0=全部), `offset`(默认0)

**响应**:
```json
{
  "songs": [
    {
      "id": "number",
      "name": "string",
      "alias": ["string"],
      "alia": ["string"],
      "dt": "number",
      "publishTime": "number",
      "ar": [{ "id": "number", "name": "string" }],
      "al": { "id": "number", "name": "string", "picUrl": "string" }
    }
  ]
}
```

**转换**: `data.songs.map(transformToSong)` → `Song[]`

**使用处**: `src/views/Home/components/PlaylistSection.vue` — 播放歌单全部歌曲

---

### 12. POST /playlist/tracks

**文件**: `src/api/playlist.ts` → `modifyPlaylistTracks(playlistId, songId, op)`

**参数**: `op`('add'|'del'), `pid`, `tracks`

**响应**:
```json
{
  "body": {
    "code": 200,
    "message": "string (失败时，如 '歌单内歌曲重复')"
  }
}
```

**使用处**: `src/components/common/musicComponents/collectSongToPlaylistDialog.vue` — 收藏歌曲到歌单

---

### 13. GET /artist/top/song

**文件**: `src/api/artist.ts` → `getArtistTop50(id)`

**参数**: `id`

**响应**:
```json
{
  "songs": [
    {
      "id": "number",
      "name": "string",
      "dt": "number",
      "ar": [{ "id": "number", "name": "string" }],
      "al": { "id": "number", "name": "string", "picUrl": "string" }
    }
  ]
}
```

**转换**: `data.songs.map(transformToSong)` → `Song[]`

**使用处**: `src/views/Artist/index.vue` — 歌手热门50首

---

### 14. GET /artist/detail

**文件**: `src/api/artist.ts` → `getArtistDetail(id)`

**参数**: `id`

**响应**:
```json
{
  "data": {
    "videoCount": "number",
    "identify": {
      "imageUrl": "string",
      "imageDesc": "string",
      "actionUrl": "string"
    },
    "artist": {
      "id": "number",
      "cover": "string",
      "avatar": "string",
      "name": "string",
      "transNames": ["string"],
      "alias": ["string"],
      "identities": ["string"],
      "identifyTag": ["string"],
      "briefDesc": "string",
      "rank": { "rank": "number", "type": "number" },
      "albumSize": "number",
      "musicSize": "number",
      "mvSize": "number"
    },
    "blacklist": "boolean",
    "preferShow": "number",
    "showPriMsg": "boolean",
    "eventCount": "number",
    "user": {
      "followed": "boolean",
      "userId": "number",
      "nickname": "string",
      "avatarUrl": "string"
    }
  }
}
```

**使用处**: `src/views/Artist/index.vue` — 歌手详情头部信息

---

### 15. GET /artist/album

**文件**: `src/api/artist.ts` → `getArtistAlbum(id)`

**参数**: `id`, `limit=100`

**响应**:
```json
{
  "hotAlbums": [
    {
      "id": "number",
      "name": "string",
      "artists": [{ "name": "string" }],
      "picUrl": "string",
      "publishTime": "number",
      "size": "number"
    }
  ]
}
```

**转换**: `data.hotAlbums.map(transformAlbums)` → `Album[]`

**使用处**: `src/views/Artist/index.vue` — 歌手专辑列表

---

### 16. GET /top/artists

**文件**: `src/api/artist.ts` → `getHotArtists(limit=50, offset=0)`

**参数**: `offset`, `limit`

**响应**:
```json
{
  "artists": [
    {
      "name": "string",
      "picUrl": "string",
      "id": "number"
    }
  ]
}
```

**使用处**: `src/views/Home/components/popularSinger.vue` — 首页热门歌手

---

### 17. POST /user/account

**文件**: `src/api/user.ts` → `getUserFromCookie()`

**响应**:
```json
{
  "account": {
    "id": "number",
    "userName": "string",
    "type": "number",
    "status": "number",
    "createTime": "number",
    "vipType": "number"
  },
  "profile": {
    "userId": "number",
    "nickname": "string",
    "avatarUrl": "string",
    "backgroundUrl": "string",
    "birthday": "number",
    "signature": "string",
    "description": "string",
    "gender": "number",
    "city": "number",
    "followed": "boolean",
    "followeds": "number",
    "follows": "number",
    "vipType": "number",
    "userType": "number",
    "avatarDetail": {
      "identityIconUrl": "string",
      "userType": "number",
      "identityLevel": "number"
    },
    "lastLoginTime": "number",
    "createTime": "number"
  }
}
```

**使用处**: `src/stores/user.ts` — 初始化当前登录用户

---

### 18. POST /user/detail

**文件**: `src/api/user.ts` → `getUser(uid)`

**参数**: `uid`

**响应**: 与 `/user/account` 的 `profile` 相同

**使用处**: `src/views/User/index.vue` — 查看其他用户详情

---

### 19. GET /user/playlist

**文件**: `src/api/user.ts` → `fetchUserPlaylist(uid)`

**参数**: `uid`, `sendCookie=true`

**响应**:
```json
{
  "playlist": [
    {
      "id": "number",
      "name": "string",
      "subscribed": "boolean (区分创建/收藏)",
      "creator": { "userId": "number", "nickname": "string", "avatarUrl": "string" },
      "coverImgUrl": "string",
      "trackCount": "number",
      "playCount": "number",
      "bookCount": "number",
      "subscribedCount": "number",
      "description": "string | null"
    }
  ]
}
```

**转换**: `transformToPlaylist()`

**使用处**: `src/stores/user.ts`(按 `subscribed` 分离创建/收藏歌单), `src/views/User/index.vue`

---

### 20. GET /user/follows

**文件**: `src/api/user.ts` → `fetchUserFollows(uid, limit=150, offset=0)`

**参数**: `uid`, `limit`, `offset`

**响应**:
```json
{
  "follow": [
    {
      "userId": "number",
      "nickname": "string",
      "avatarUrl": "string",
      "followed": "boolean"
    }
  ]
}
```

**转换**: `data.follow.map(transformToUser)` → `User[]`

**使用处**: `src/views/User/index.vue` — 用户关注列表

---

### 21. GET /user/followeds

**文件**: `src/api/user.ts` → `fetchUserFolloweds(uid, limit=150, offset=0)`

**参数**: `uid`, `limit`, `offset`

**响应**:
```json
{
  "followeds": [
    {
      "userId": "number",
      "nickname": "string",
      "avatarUrl": "string",
      "followed": "boolean"
    }
  ]
}
```

**转换**: `data.followeds.map(transformToUser)` → `User[]`

**使用处**: `src/views/User/index.vue` — 用户粉丝列表

---

### 22. POST /user/subcount

**文件**: `src/api/user.ts` → `getUserSimpleIInfo()`

**响应**:
```json
{
  "programCount": "number",
  "djRadioCount": "number",
  "mvCount": "number",
  "artistCount": "number",
  "newProgramCount": "number",
  "createDjRadioCount": "number",
  "createdPlaylistCount": "number",
  "subPlaylistCount": "number",
  "code": "number"
}
```

**使用处**: `src/stores/user.ts` — 用户统计数据

---

### 23. POST /likelist

**文件**: `src/api/user.ts` → `getLikeMusic(uid)`

**参数**: `uid`

**响应**:
```json
{
  "ids": ["number | string"]
}
```

**使用处**: `src/stores/user.ts` — 获取用户喜欢的歌曲ID列表，转 `Set` 存储

---

### 24. POST /like

**文件**: `src/api/user.ts` → `likeMusic(id, like)`

**参数**: `timestamp`, `id`, `like`(boolean)

**响应**:
```json
{
  "code": "number | string (200 表示成功)"
}
```

**使用处**: `src/stores/user.ts` `toggleLikeMusic()` — 歌曲喜欢/取消喜欢

---

## 数据转换函数一览

| 函数 | 输入 | 输出类型 |
|------|------|----------|
| `transformToArtist(rawArtist)` | `{ id, name, picUrl, img1v1Url, fansSize, musicSize, identityIconUrl }` | `Artist` |
| `transformToSong(rawData)` | `{ id, name, alias/alia, dt, publishTime, ar, al }` | `Song` |
| `transformAlbums(rawAlbums, formatDate?)` | `{ id, name, artists, picUrl, publishTime, size }` | `Album` |
| `transformToPlaylist(rawPlaylist)` | 搜索/探索接口原始歌单 JSON | `Playlist` |
| `transformToUser(rawUser)` | `{ userId, nickname, avatarUrl, followed }` | `User` |
| `transformPlaylistDetail(rawPlaylist)` | 歌单详情接口原始 JSON | `Playlist`(完整版) |
| `transformAlbumDetail(rawData)` | `{ album, songs }` | `Album`(完整版) |
| `transformCommentListResponse(rawData)` | 评论接口原始 JSON | `CommentListResponse` |

---

## 页面 → API 对照

| 页面 | 调用的 API |
|------|-----------|
| **Home** | `getBanner`, `getHotArtists`, `getExquisitePlaylists`, `getPlaylistAllTracks` |
| **Search** | `searchBySong`, `searchBySinger`, `searchByAlbum`, `searchByPlaylist`, `searchByUser` (并行5个) |
| **Album** | `getAlbumDetail`, `getAlbumComments`(懒加载) |
| **Artist** | `getArtistDetail`, `getArtistTop50`, `getArtistAlbum` (并行3个) |
| **Playlist** | `getPlaylistDetail`, `getPlaylistComments`(懒加载), `getPlaylistSubscribers`(懒加载) |
| **User** | `getUser`, `fetchUserPlaylist`, `fetchUserFollows`, `fetchUserFolloweds` (并行4个) |
| **Player** | `getSongUrl` (每次播放时) |
| **收藏弹窗** | `modifyPlaylistTracks` |
| **User Store** | `getUserFromCookie`, `fetchUserPlaylist`, `getUserSimpleIInfo`, `getLikeMusic`, `likeMusic` |
