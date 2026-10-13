# 技术栈与外部依赖

> 心理健康管理平台前端（psychology-ui），包含用户前台（home / diary / repository / article / consultation）与后台管理（dashboard / knowledge / consultations / emotional）两端。

## 1. 核心技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| Vue | ^3.5.42 | 框架，统一 Composition API + `<script setup>` |
| Vite | ^8.2.2 | 构建工具（函数式 `defineConfig` + `loadEnv`） |
| Vue Router | ^5.3.1 | 路由，懒加载 + 全局导航守卫鉴权 |
| Pinia | ^4.0.3 | 状态管理（user / admin store） |
| JavaScript ES6+ | — | 语言（未引入 TypeScript） |
| SCSS (sass) | ^1.105.1 | 样式预处理，变量/嵌套/`:deep()` 穿透 |

## 2. 外部依赖

### 运行时依赖（dependencies）

| 依赖 | 版本 | 用途 |
|---|---|---|
| element-plus | ^2.14.7 | UI 组件库（全量引入 + 全局图标注册） |
| @element-plus/icons-vue | ^2.3.2 | Element Plus 图标集 |
| axios | ^1.20.0 | HTTP 请求，封装于 `src/utils/request.js`（token 注入、401 拦截） |
| echarts | ^6.1.0 | 数据可视化（dashboard 情绪趋势/咨询统计/用户活跃图表） |
| @wangeditor/editor | ^5.1.23 | 富文本编辑器核心 |
| @wangeditor/editor-for-vue | ^5.1.12 | wangEditor 的 Vue 3 封装（文章编辑） |
| dayjs | ^1.11.23 | 日期处理（`src/utils/date.js`，约 40 个工具函数，含插件体系） |
| @microsoft/fetch-event-source | ^2.0.1 | SSE 流式请求（AI 聊天流式回复，`src/api/stream.js`） |

### 开发依赖（devDependencies）

| 依赖 | 版本 | 用途 |
|---|---|---|
| @vitejs/plugin-vue | ^6.0.8 | Vite 的 Vue SFC 编译插件 |
| vite-plugin-vue-devtools | ^8.2.1 | Vue DevTools 集成 |

### Node 版本要求

```
node ^22.18.0 || >=24.12.0
```

## 3. 项目结构

```
src/
├── api/            # 接口层：admin.js（后台）/ frontend.js（前台）/ auth.js / stream.js（SSE）
├── assets/         # main.scss 全局样式 + images/
├── components/     # 布局与公共组件
│   ├── BackendLayout.vue / FrontendLayout.vue / AuthLayout.vue
│   ├── Navbar.vue / Sidebar.vue / PageHead.vue / TableSearch.vue
│   ├── ArticleDialog.vue    # 文章编辑弹窗（含封面上传）
│   ├── RichTextEditor.vue   # wangEditor 封装
│   └── MarkdownRenderer.vue # 聊天消息 Markdown 渲染
├── router/         # 路由 + 登录鉴权守卫（userType 区分前台/后台）
├── stores/         # Pinia：user.js（token/userInfo 持久化）/ admin.js
├── utils/
│   ├── request.js  # axios 封装（{code, message, data}，code 0/200 成功）
│   └── date.js     # dayjs 工具库（格式化/相对时间/时区/计算等约 40 个函数）
└── views/
    ├── 前台：home / login / register / diary / repository / article / consultation（AI 聊天）
    └── 后台：dashboard（统计+图表）/ knowledge / consultations / emotional
```

## 4. 关键约定

- **后端通信**：baseURL `/api`（开发环境 Vite 代理到 `VITE_PROXY_TARGET`，`.env` 配置）；响应结构 `{ code, message, data }`，`code` 为 0 或 200 视为成功
- **鉴权**：token 存 localStorage，请求头 `Authorization: Bearer <token>`；401 自动登出跳登录页
- **路由守卫**：未登录访问 `/back/*` 跳登录页；`userType === 2` 为管理员可进后台
- **编码规范**：Composition API + `<script setup>`；Element Plus 优先；组件 PascalCase；异步代码必须 try/catch
- **设计体系**：统一柔和低饱和配色 —— 正文 `#3d4654`、次要 `#8b949e`、辅助 `#a0a7b3`、暖橙主题渐变 `#f8b76a→#f09b3e`、图表调色板 `['#7ba7d9','#e0a96d','#8fc49a','#b39ddb']`
- **构建命令**：`npm run dev`（开发，端口 5173）/ `npm run build`（生产）/ `npm run preview`

## 5. 开发日志

每次环境搭建、依赖引入、配置变更的执行记录见 [dev-log.md](./dev-log.md)（按日期分组，含背景/依赖/改动文件/改动内容/验证/状态）。
