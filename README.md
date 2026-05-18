# Douban addon for Stremio

为 Stremio 提供豆瓣电影/剧集目录的插件。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fqw000/stremio-addon-douban)

## ✨ 功能特性

- 📽️ **丰富的电影目录** - 豆瓣热门、Top250、一周口碑榜、影院热映等
- 📺 **全面的剧集覆盖** - 热门剧集、综艺节目、动画、华语/全球口碑榜
- 🎭 **多类型片单** - 覆盖剧情、喜剧、动作、科幻、悬疑、恐怖等 20+ 类型
- 🌍 **多地区剧集** - 大陆、美剧、英剧、日剧、韩剧、港剧、台剧等
- ⚙️ **可配置目录** - 自定义选择要显示的目录内容
- 🔗 **ID 映射** - 自动将豆瓣 ID 映射到 TMDB/IMDB/Trakt ID

## 📋 支持的目录

<details>
<summary><strong>🎬 电影目录</strong></summary>

| 目录名称 | 描述 |
|---------|------|
| 豆瓣热门电影 | 热门电影榜单 |
| 一周口碑电影榜 | 近一周口碑最佳电影 |
| 实时热门电影 | 实时热度排行 |
| 豆瓣电影 Top250 | 经典高分电影 |
| 影院热映 | 正在上映的电影 |
| 类型片榜 | 剧情、喜剧、爱情、动作、科幻、动画、悬疑、犯罪、惊悚、冒险、家庭、儿童、历史、音乐、奇幻、恐怖、战争、传记、歌舞、武侠、情色、灾难、西部、古装、运动、短片 |

</details>

<details>
<summary><strong>📺 剧集目录</strong></summary>

| 目录名称 | 描述 |
|---------|------|
| 近期热门剧集 | 近期热播剧集 |
| 近期热门综艺节目 | 热门综艺 |
| 近期热门动画 | 热门动画作品 |
| 实时热门电视 | 实时热度排行 |
| 华语口碑剧集榜 | 华语剧集口碑榜 |
| 全球口碑剧集榜 | 全球剧集口碑榜 |
| 国内/国外口碑综艺榜 | 综艺口碑榜 |
| 地区剧榜 | 大陆、美剧、英剧、日剧、韩剧、港剧、台剧、泰剧、欧洲剧 |

</details>

## 🚀 快速开始

### 在线使用

直接在 Stremio 中添加以下 URL：

```
https://stremio-addon-douban.baran.wang/manifest.json
```

或访问配置页面自定义目录：

```
https://stremio-addon-douban.baran.wang/configure
```

### 自行部署

#### 环境要求

- Node.js 24+
- pnpm
- Cloudflare 账户

#### 1. 克隆项目

```bash
git clone https://github.com/baranwang/stremio-addon-douban.git
cd stremio-addon-douban
pnpm install
```

#### 2. 配置环境变量

创建 `.env` 文件并配置以下环境变量：

```bash
# Trakt API (用于 ID 映射)
TRAKT_CLIENT_ID=your_trakt_client_id

# TMDB API (用于获取元数据)
TMDB_API_KEY=your_tmdb_api_key

# 豆瓣认证信息 (可选，用于访问受限内容)
DOUBAN_COOKIE=your_douban_cookie
```

#### 3. 配置 Cloudflare 资源

```bash
# 创建 D1 数据库
wrangler d1 create stremio-addon-douban

# 创建 KV 命名空间
wrangler kv:namespace create KV
```

更新 `wrangler.jsonc` 中的数据库 ID 和 KV 命名空间 ID。

#### 4. 本地开发

```bash
pnpm dev
```

#### 5. 部署

```bash
pnpm deploy
```

## 🛠️ 技术栈

- **运行时**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **框架**: [Hono](https://hono.dev/)
- **前端**: React + [shadcn/ui](https://ui.shadcn.com/) + TailwindCSS
- **数据库**: Cloudflare D1 + [Drizzle ORM](https://orm.drizzle.team/)
- **缓存**: Cloudflare KV
- **构建**: [Vite](https://vitejs.dev/)
- **语言**: TypeScript

## 📁 项目结构

```
src/
├── client/          # 客户端代码
├── components/      # React 组件
├── db/              # 数据库 schema
├── libs/
│   ├── api/         # API 封装 (豆瓣、TMDB、Trakt、IMDB)
│   ├── middleware/  # Hono 中间件
│   └── catalog.ts   # 目录配置
├── routes/          # 路由处理
│   ├── catalog.ts   # 目录数据接口
│   ├── configure.tsx # 配置页面
│   └── manifest.ts  # Stremio manifest
└── index.tsx        # 入口文件
```

## 🔗 相关链接

- [Stremio 官网](https://www.stremio.com/)
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [豆瓣](https://www.douban.com/)

## ❤️ 支持

如果这个项目对你有帮助，欢迎 [Star](https://github.com/baranwang/stremio-addon-douban) 支持！

也可以通过 [爱发电](https://afdian.com/a/baran) 进行捐赠。

## 📄 License

MIT
