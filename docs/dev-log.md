# 开发执行日志

> 记录每次环境搭建、依赖引入、配置变更等执行情况。

## 2026-10-09

### 1. 引入 Element Plus（Vue 3 版 Element-UI）

- **背景**：项目使用 Vue 3（`vue: ^3.5.42`），原版 Element-UI 仅支持 Vue 2，故采用 Element Plus。
- **依赖**：`npm install element-plus @element-plus/icons-vue`
- **改动文件**：`src/main.js`
- **改动内容**：
  - 完整引入 Element Plus 及其样式 `element-plus/dist/index.css`
  - 全局注册所有 `@element-plus/icons-vue` 图标组件
  - `app.use(ElementPlus)` 挂载
- **状态**：✅ 完成

### 2. 引入 axios 并配置拦截器

- **依赖**：`npm install axios`
- **新增文件**：`src/utils/request.js`
- **配置说明**：
  - **baseURL**：读取 `VITE_API_BASE_URL` 环境变量，未设置时默认 `/api`
  - **timeout**：10000ms
  - **请求拦截器**：从 `localStorage` 读取 token，附加到 `Authorization` 头
  - **响应拦截器**：
    - 业务成功直接返回 `response.data`
    - 业务失败（`code` 非 0/200）用 `ElMessage` 弹错误；`401` 清 token 并跳 `/login`
    - HTTP 错误（如 500、网络异常）弹错误提示；`401` 自动跳转登录
  - 约定后端返回结构：`{ code, message, data }`
- **状态**：✅ 完成

### 3. 补充 Vite 端口与开发代理配置

- **背景**：开发环境需固定端口并对接后端 API，避免跨域。
- **改动文件**：`vite.config.js`
- **改动内容**：
  - 新增 `server.port = 5173`（固定开发端口）
  - 新增 `server.open = true`（启动自动打开浏览器）
  - 新增 `server.proxy['/api']`：代理到 `http://localhost:8080`，`changeOrigin: true`
  - 预留 `rewrite` 注释：后端无 `/api` 前缀时打开注释去掉前缀
- **状态**：✅ 完成

### 4. 代理地址改为从 .env 读取

- **背景**：代理 target 写死在配置中不便切换环境，改为读取环境变量。
- **改动文件**：
  - 新增 `.env`
  - 修改 `vite.config.js`
- **改动内容**：
  - `.env` 新增两个变量：
    - `VITE_PROXY_TARGET=http://localhost:8080`（代理目标）
    - `VITE_API_BASE_URL=/api`（axios baseURL，配合 `src/utils/request.js`）
  - `vite.config.js` 改用函数式 `defineConfig(({ mode }) => {...})`，通过 `loadEnv(mode, process.cwd(), '')` 读取 env
  - `proxy['/api'].target` 改为 `env.VITE_PROXY_TARGET || 'http://localhost:8080'`，带默认兜底
  - **说明**：`loadEnv` 第三个参数传 `''` 表示读取所有变量（默认只读 `VITE_` 前缀的）；切换环境只需改 `.env`，无需动配置文件。
- **状态**：✅ 完成

### 5. 引入 SCSS

- **背景**：项目需使用 SCSS（变量、嵌套、mixin 等），原仅支持 CSS。
- **依赖**：`npm install -D sass`（Dart Sass，`sass@1.105.1`，Vite 内部 dedupe 复用同一版本，无冲突）
- **改动文件**：
  - 新增 `src/assets/main.scss`（由原 `main.css` 改名，内容完全保留，SCSS 是 CSS 超集，向后兼容）
  - 删除 `src/assets/main.css`
  - `src/main.js` 引用由 `./assets/main.css` 改为 `./assets/main.scss`
- **兼容性**：
  - Vite 8 + Node 22+ 内置 SCSS 编译，仅缺预处理器依赖，装 `sass` 即可用
  - SFC 中可直接用 `<style lang="scss">` / `<style lang="scss" scoped>`
  - `npm run build` 验证通过：1592 模块转换，CSS 产物 360.92 kB
- **状态**：✅ 完成

### 6. 登录表单用户名规则增强

- **背景**：登录账号支持「用户名/邮箱」二选一，需校验用户名长度 ≥ 8、邮箱格式合法。
- **改动文件**：`src/views/login.vue`
- **改动内容**：
  - `username` 字段新增自定义 `validator`（保留原 required 规则）
  - 逻辑：空值交给 required；含 `@` 时按邮箱正则校验格式，否则校验用户名长度不少于 8 位
  - 触发时机 `trigger: 'blur'`，与现有规则一致
- **状态**：✅ 完成

### 7. 登录表单密码规则增强

- **背景**：登录密码需限制最短长度为 8 位。
- **改动文件**：`src/views/login.vue`
- **改动内容**：`password` 字段新增 `{ min: 8, message: '密码长度不能少于 8 位', trigger: 'blur' }` 规则（async-validator 内置 `min`，对字符串按长度校验）。
- **状态**：✅ 完成

## 2026-10-10

### 8. 检查并修复 Vite 代理配置

- **背景**：排查代理链路：`api/admin.js`（`/auth/login`）+ baseURL（`/api`）→ 代理 → `http://159.75.169.224:1235/api/auth/login`。
- **探测结果**（curl 实测后端）：
  - 后端为 Spring Boot，首页自述「API 前缀： /api」→ **无需 rewrite 去前缀**，保持注释正确
  - `POST /api/user/login` → HTTP 200（业务码 500，接口存在）
  - `POST /api/auth/login` → HTTP 403（接口不存在或被拦截）
  - ⚠️ 前端 `api/admin.js` 用的 `/auth/*` 与后端实际路由 `/api/user/login` 疑似不匹配，待确认文档（/doc.html）后调整
- **改动文件**：`vite.config.js`
- **改动内容**：
  - `target` 由硬编码恢复为 `env.VITE_PROXY_TARGET || 'http://localhost:8080'`（此前写死导致 .env 失效）
  - `rewrite` 注释改为说明性注释（后端前缀即 /api，无需去除）
- **状态**：✅ 完成

### 9. 修复 ArticleDialog 上传链路中断

- **背景**：点击「点击上传」选完文件后，`httpRequest` 的 `console.log` 不打印，封面无法上传。
- **改动文件**：`src/components/ArticleDialog.vue`
- **根因**：`beforeUpload` 第一行 `file.type.startswWith(...)` 拼写错误（应为 `startsWith`），抛 `TypeError`，Element Plus 据此判定前置校验失败，`http-request` 永远不会被触发。
- **改动内容**：
  - `startswWith` → `startsWith`
  - 顺便修正 `file.size / 1014 / 1014` → `/ 1024 / 1024`（B→KB→MB 换算笔误）
- **遗留**：`httpRequest` 函数体内业务逻辑全被注释，仍为空实现；后续需按后端上传接口实际返回结构补全。
- **状态**：✅ 完成（仅修复阻断性 bug，未补全上传业务）

### 10. 富文本编辑器（RichTextEditor）配置补全与样式调整

- **背景**：`MENU_CONF` 仅配置了字体/字号等少量菜单，颜色/表情/链接/图片上传/代码块等未配；外层无背景色；`minHeight` prop 声明了但未生效；bgColor 存在两处十六进制乱码（`#9θCAF9`、`#EOEOE0`）。
- **改动文件**：`src/components/RichTextEditor.vue`
- **改动内容**：
  - 模板：工具栏绑定从 `:defaultConfig="toolbarConfig"` 修正（此前绑的是不存在的 `toolbarConfig`，且原对象 key `toolbarkeys` 拼写错误，已改为 `toolbarKeys`）；`<WangEditor>` 加 `:style="{ minHeight: props.minHeight }"` 让 prop 生效
  - MENU_CONF 补全：
    - `color`：新增前景色调色板（灰阶 + 浅色系，与 bgColor 对称）
    - `bgColor`：修正乱码 `#9θCAF9`→`#90CAF9`、`#EOEOE0`→`#E0E0E0`
    - `emotions`：补一组常用表情
    - `insertLink`：基础链接校验/解析
    - `uploadImage`：`customUpload` 走项目封装的 `http` 实例（token 自动注入），上传到 `/file/upload`
    - `code`：补 8 种常用代码语言
  - 脚本：新增 `import http from '@/utils/request'`（供 `uploadImage.customUpload` 使用）
  - 样式：外层 `.rich-text-editor` 背景改为 `#8b949e`，补 `padding`/`border-radius`；新增 `.editor-container`/`.editor-toolbar` 边框与浅灰底；`.wang-editor` 改为按 `min-height` 撑高（去掉写死的 `height: 400px`）；`.editor-footer` 文字与进度条配色适配深色背景
- **验证**：`npm run build` 通过，1675 模块，1.22s
- **状态**：✅ 完成

### 11. 调整「移除封面」按钮到封面图片正下方

- **背景**：封面图上传后，「移除封面」按钮未显示在图片正下方，排版错位。
- **改动文件**：`src/components/ArticleDialog.vue`
- **改动内容**：
  - `.cover-img` 补 `object-fit: cover`（避免图片变形）
  - 新增 `.cover-remove` 样式：`width: 200px`、`margin-top: 8px`、`text-align: center`
  - **关键修复**：用 `:deep(.el-upload) { display: flex; flex-direction: column; align-items: center; }` 穿透 el-upload 内部容器——因为 el-upload 默认对 slot 内容用 inline/flex 布局，普通块级样式无法强制换行，必须穿透改内部布局为列方向
- **状态**：✅ 完成

## 2026-10-11

### 12. 咨询会话弹窗样式补充（柔和配色）

- **背景**：`consultations.vue` 的「咨询会话」详情弹窗此前无任何样式（`<style>` 为空），消息列表无层次。
- **改动文件**：`src/views/consultations.vue`
- **改动内容**：
  - 模板：`.message-item` 增加 `:class="senderType==1 ? 'is-user' : 'is-ai'"` 区分用户/AI 消息
  - 样式（低饱和柔和色系）：
    - `.detail-header`：浅蓝灰卡片底 `#f6f8fb` + 圆角，label 用 `#8b949e`、value 用 `#3d4654`
    - 「对话记录」标题加柔和蓝竖线 `#a8c5e8`
    - `.message-list`：限高 480px 滚动 + 6px 柔和滚动条
    - 用户消息：柔和蓝底 `#eaf2fc`/边框 `#dde9f8`/发送者 `#5b82b8`
    - AI 消息：柔和暖白底 `#f7f9f6`/边框 `#ebf0e9`/发送者 `#7a9b76`
    - 正文行高 1.7、`pre-wrap` 保留换行，时间用浅灰 `#a0a7b3`
- **验证**：`npm run build` 通过，1.25s
- **状态**：✅ 完成

### 13. 情绪日志详情弹窗样式补充（柔和配色）

- **背景**：`emotional.vue` 的「情绪日志详情」弹窗 `<style>` 为空；AI 分析时间字体偏大。
- **改动文件**：`src/views/emotional.vue`
- **改动内容**：
  - 模板：AI 分析时间 `<p>` 增加 `class="ai-analysis-time"`
  - 样式（低饱和柔和色系，与咨询会话风格统一）：
    - `.detail-section h4`：深灰 `#3d4654` + 柔和蓝竖线 `#a8c5e8`，区块间距 22px
    - 专家建议：柔和蓝底 `#eef4fb`
    - 风险描述：柔和暖橙底 `#fdf6ee`
    - 改善建议：柔和绿底 `#f1f7f0`，列表 marker 绿色 `#9dbf94`、行高 1.9
    - 正文 `#3d4654`、行高 1.7
    - **AI 分析时间**：`font-size: 12px`、浅灰 `#a0a7b3`
- **遗留**：`aiData.timestamp` 是毫秒时间戳（如 1769652853654），当前直接显示原始数字，未做日期格式化
- **验证**：`npm run build` 通过，1.20s
- **状态**：✅ 完成

### 14. 建立 date.js 标准时间工具库并格式化 AI 分析时间

- **背景**：情绪日志详情的 `aiData.timestamp` 是毫秒时间戳，直接显示原始数字不可读；项目需要统一时间工具。
- **工具文件**：`src/utils/date.js`（基于已在 package.json 声明的 dayjs ^1.11.23，含约 40 个函数，分 12 组：格式化/时间戳/相对时间/范围/计算/比较/时区/倒计时/季度周/解析/表格 formatter/date-picker shortcuts）
- **改动文件**：`src/views/emotional.vue`
- **改动内容**：
  - emotional.vue 导入 `import { formatTimestamp } from '@/utils/date'`，把 `{{ aiData.timestamp }}` 改为 `{{ formatTimestamp(aiData.timestamp) }}`
  - `formatTimestamp` 自动兼容 10 位秒 / 13 位毫秒，无效值返回 '-'
- **验证**：`1769652853654` → `2026-01-29 10:14:13`
- **状态**：✅ 完成

### 15. 完善 date.js 全函数 JSDoc（参数示例 + 返回结果）

- **背景**：date.js 函数多但缺少参数示例与返回值说明，调用成本高。
- **改动文件**：`src/utils/date.js`
- **改动内容**：
  - 为全部函数补全 JSDoc：`@param`（含具体示例值）、`@returns`（含返回示例）、`@example`（可直接照抄的调用 + 输出）
  - **修复隐患**：`getWeekOfYear` 调用 `.week()` 但未加载 `weekOfYear` 插件，补充 `import weekOfYear from 'dayjs/plugin/weekOfYear'` + `dayjs.extend(weekOfYear)`
  - 时间工具收敛为 date.js 单一来源（早期临时的 src/utils/format.js 已移除）
- **验证**：`npm run build` 通过，1.11s
- **状态**：✅ 完成

### 16. 仪表盘统计卡片样式补充（柔和配色）

- **背景**：`dashboard.vue` 的 `<style>` 为空，四张统计卡片（总用户数/情绪日志/咨询会话/平均情绪）无样式。
- **改动文件**：`src/views/dashboard.vue`
- **改动内容**（低饱和柔和色系，与咨询会话/情绪日志弹窗风格统一）：
  - `.el-card`：圆角 12px、浅边框 `#eef1f6`、极轻阴影，hover 轻微上浮（translateY -2px）+ 阴影加深，`:deep()` 调整内边距 20px
  - `.card-content`：flex 布局 + 16px 间距
  - `.avatar`：48px 圆形浅蓝底 `#eaf2fc`
  - 字体适中三档：标题 13px 柔灰 `#8b949e` / 数字 24px 半粗深灰 `#3d4654`（tabular-nums 等宽数字）/ 副标题 12px 浅灰 `#a0a7b3`
- **状态**：✅ 完成

### 17. 咨询会话统计三项指标条样式

- **背景**：dashboard「咨询会话统计」卡片内 `.conslutation-stats`（会话总数/平均时长/活跃用户）无样式。
- **改动文件**：`src/views/dashboard.vue`（仅新增选中类名样式，不动其他）
- **改动内容**：
  - `.conslutation-stats`：flex 横向、gap 16px、底部留白 16px
  - `.stats-item`：flex:1 均分，内部 `flex-direction: column` 实现标签在上/数值在下的上下分布；浅蓝灰底 `#f6f8fb`、圆角 10px、padding 16px
  - `.stats-laber`：13px 柔灰 `#8b949e`（类名按原代码，含拼写不改动）
  - `.stats-value`：22px 半粗深灰 `#3d4654`，tabular-nums 等宽数字
- **验证**：`npm run build` 通过，1.45s
- **状态**：✅ 完成

### 18. dashboard 整体配色柔化（图标语义底色 + 尺寸约束 + 卡片标题）

- **背景**：以现有样式为基线，进一步柔化颜色/字体/图标，使视觉更舒适。
- **改动文件**：`src/views/dashboard.vue`
- **改动内容**：
  - 模板：四张顶部卡片图标容器类名由统一的 `avatar user` 改为语义修饰类 `user / diary / session / mood`
  - 图标：`:deep(.el-image)` 约束为 24px、`object-fit: contain`（此前 el-image 无尺寸会按原图渲染）
  - 四色柔和浅底（低饱和、冷暖搭配）：用户-柔和蓝 `#eaf2fc` / 日记-柔和绿 `#e9f7f0` / 会话-柔和暖橙 `#fdf3ea` / 情绪-柔和紫 `#f4eefb`
  - `.car-header`：15px 半粗深灰 `#3d4654`（此前无样式）
  - `:deep(.el-card__header)`：padding 14px 20px、分割线弱化 `#f0f2f6`
  - `.chart-content`：顶部 4px 呼吸留白
- **验证**：`npm run build` 通过，1.96s
- **状态**：✅ 完成

### 19. ECharts 三图表统一柔和配色

- **背景**：三个图表 series 全部硬编码近黑色 `#2d3436`（多线同色无法区分），坐标轴深色、tooltip 橙边框，整体沉闷。
- **改动文件**：`src/views/dashboard.vue`（仅改 script 内图表配置，结构/数据/样式不动）
- **改动内容**：
  - 新增统一调色板与共享配置（单一来源，三图表引用）：
    - `CHART_COLORS = ['#7ba7d9' 柔和蓝, '#e0a96d' 柔和橙, '#8fc49a' 柔和绿, '#b39ddb' 柔和紫]`
    - 文本色 `#3d4654` / 轴标签 `#8b949e` / 轴线 `#e2e6ee` / 虚线分割线 `#f0f2f6`
    - `softTooltip`（白底 95% 透明 + 柔边框 + 轻阴影 + 圆角）、`softCategoryAxis`、`softValueAxis`、`softLineSeries`（2px 平滑线 + 圆点白边 + 可选 10% 面积）、`softBarSeries`（圆角柱顶、barMaxWidth 24）、`softTitle`、`softLegend`
  - 情绪趋势：两条折线区分蓝/橙，首条带柔和面积
  - 咨询统计：两组柱状区分蓝/橙，柱顶圆角
  - 用户活跃：4 条折线用蓝/橙/绿/紫，首条带面积；**4 根重复的深色 y 轴合并为 1 根**（同量纲用户数），画面更干净；grid 加 containLabel 防止标签溢出
  - 顺带清理了原有重复 `itemStyle` 键与无效的 `with: 3` 笔误
- **验证**：`npm run build` 通过，1.49s
- **状态**：✅ 完成

### 21. 注册表单补充密码一致性校验

- **背景**：`register.vue` 的 `confirmPassword` 字段只有必填和长度规则，注释「密码需要一致」对应的校验缺失。
- **改动文件**：`src/views/register.vue`
- **改动内容**：`confirmPassword` 规则新增自定义 `validator`：空值放行（交给 required），与 `formData.password` 不一致时报「两次输入的密码不一致」，触发时机 `blur`，风格与现有 email 校验器一致
- **遗留**：若先填确认密码再改密码，确认密码不会自动重校验（需 blur 才触发）；如需实时联动可加 watch，当前保持最小改动
- **验证**：`npm run build` 通过，1.46s
- **状态**：✅ 完成

### 22. 注册邮箱改为自动补全输入（el-autocomplete）

- **背景**：注册页邮箱需手打完整 `@xxx.com`，希望输入前缀后自动补全/选择常用邮箱后缀。
- **方案**：使用 Element Plus 自带 `el-autocomplete`（现成组件，无需新增依赖或自写组件），`v-model` 仍绑 `formData.email`，原有邮箱格式校验不受影响。
- **改动文件**：`src/views/register.vue`
- **改动内容**：
  - 模板：邮箱项 `el-input` 换成 `el-autocomplete`，加 `fit-input-width` 让下拉与输入框同宽
  - 脚本：新增 `EMAIL_SUFFIXES` 常用后缀常量（qq/163/126/gmail/outlook/sina/foxmail）与 `queryEmailSuggestions` 建议源——未输入 `@` 时补全全部后缀；已输入 `@` 时按 `@` 后内容过滤后缀
- **验证**：`npm run build` 通过，1.61s
- **状态**：✅ 完成

### 23. 咨询对话页面（consultation.vue）按 UI 图实现

- **背景**：`src/views/consultation.vue` 为空壳，按用户提供的 UI 截图实现 AI 心理助手对话页，数据写死，仅在此文件操作。
- **改动文件**：`src/views/consultation.vue`（整文件重写）
- **改动内容**：
  - 左侧信息栏：助手名片（橙色渐变头像 + 「在线服务中」绿点状态）、情绪花园卡片（奶油渐变底 + 粉紫渐变情绪圆徽「中性 50」+ 三圆点指示 + 「给你的小建议」白卡）、会话历史卡片（空态「暂无会话记录」）
  - 右侧聊天区：橙色渐变 header（心形图标 + 标题/副标题 + 白色圆形加号按钮）、消息列表（AI 灰白气泡左侧 + 用户橙色渐变气泡右侧，各带时间戳）、底部输入区（圆角 textarea + Enter 发送/Shift+Enter 换行提示 + 0/500 计数 + 橙色圆形发送按钮）
  - 交互（本地 mock）：发送 push 用户消息后 800ms 模拟 AI 回复；新消息自动滚动到底部；Enter 发送、Shift+Enter 换行；maxlength 500
  - 配色延续项目柔和体系：正文 `#3d4654` / 次要 `#8b949e` / 辅助 `#a0a7b3`，橙色渐变 `#f8b76a → #f09b3e`，情绪徽粉紫 `#f6b3cc → #d9a6e8`
  - 图标用全局注册的 Element Plus 图标（Plus/Promotion），无新增依赖
- **验证**：`npm run build` 通过，1.84s（consultation 独立 chunk 3.72kB）
- **状态**：✅ 完成

### 24. 咨询对话页面整体限宽居中

- **背景**：用户反馈页面整体太宽，两侧需要留白。
- **改动文件**：`src/views/consultation.vue`（仅 `.consultation-page` 容器样式）
- **改动内容**：容器加 `max-width: 1200px; margin: 0 auto`（大屏两侧留白），padding 调整为 `16px 24px`；同时移除容器自身的 `#f7f8fa` 背景——限宽后背景会随容器截断形成色带边缘，改用白底衬白卡与 UI 图一致
- **验证**：`npm run build` 通过，1.69s
- **状态**：✅ 完成

## 2026-10-12

### 25. 会话历史列表样式与交互优化

- **背景**：consultation.vue 会话历史列表结构冗余（session-info/session-title 嵌套混乱）、无滚动条、删除按钮占位常驻、空数据时列表与「暂无会话记录」同时渲染。
- **改动文件**：`src/views/consultation.vue`
- **改动内容**：
  - 模板重构：扁平化会话项结构（标题/预览/统计行），`v-if="sessionList.length"` / `v-else` 保证空数据时只显示「暂无会话记录」；当前选中会话加 `.active` 高亮
  - 删除按钮移到会话项右上角（absolute），默认 `opacity: 0`，悬停会话项时显示；点击加 `.stop` 避免触发 selectSession
  - 滚动条：`.session-list` 设 `flex: 1; min-height: 0; overflow-y: auto`（`.history-card` 同步补 `min-height: 0`，否则 flex 子项无法收缩滚动），6px 柔和滚动条与聊天区一致
  - 会话项样式：白底圆角卡片、悬停暖橙边框 + 轻阴影、选中态暖橙底 `#fdf8f1`；标题/预览单行省略，统计行（消息数/时长）图标对齐、时间靠右
  - 顺带移除模板中残留的 `//` 文本节点（原 L97，会被渲染到页面上）
- **验证**：`npm run build` 通过，1.60s
- **状态**：✅ 完成

### 26. 会话项紧凑化调整

- **背景**：用户反馈会话历史列表项偏大，希望更紧凑。
- **改动文件**：`src/views/consultation.vue`（仅 `.session-list` / `.session-item` 样式）
- **改动内容**：列表项间距 10→8px；项内边距 12/14→10/12px；标题 14→13px、预览 margin-top 4→2px、统计行 12→11px 且 margin-top 8→6px；标题/预览/统计行统一 `line-height: 1.4`（保留用户手改的 preview 加粗与 `.session-time` 块）
- **验证**：`npm run build` 通过，1.54s
- **状态**：✅ 完成

### 27. MarkdownRenderer 组件样式补充

- **背景**：`MarkdownRenderer.vue` 的 `<style>` 为空，作为聊天内容渲染器需要为所有支持的 Markdown 标签补充柔和样式。
- **改动文件**：`src/components/MarkdownRenderer.vue`（仅 style 块）
- **改动内容**（因 `v-html` 渲染，全部使用 `:deep()` 穿透 scoped）：
  - 基础：14px 正文、`line-height: 1.75`、`#3d4654` 正文色、`word-break`
  - 标题三档：h1 18px 底部细线 / h2 16px 左蓝竖线 `#a8c5e8` / h3 15px 次级色 `#5b6c7d`
  - strong 加深 `#2c3540`、em 斜体灰蓝 `#6b7d8f`
  - 链接：蓝 `#5b82b8` + 虚线下划线，hover 加深
  - 无序列表：自定义圆点 `#a8c5e8`，去除原生 marker
  - 引用块：左蓝线 + `#f6f8fb` 浅底 + 圆角
  - 分割线：渐变透明→灰→透明
  - 行内代码：灰底 `#f0f2f6` + 柔红 `#c0576b`
  - 代码块：`#f6f8fa` 底 + 边框 + 圆角
  - `.ai-markdown` AI 消息专属微调：竖线/圆点/引用底/代码底统一换为暖橙系（`#f0c894`/`#fdf8f1`/`#fdf3ea`/`#fdf6ec`），与咨询页橙色主题呼应
- **验证**：`npm run build` 通过，1.58s
- **状态**：✅ 完成

### 28. MarkdownRenderer 样式全面补全

- **背景**：用户反馈样式不够全面，需覆盖所有标签与交互细节。
- **改动文件**：`src/components/MarkdownRenderer.vue`（仅 style 块重写）
- **改动内容**（在原有基础上新增）：
  - 标题补 h4/h5/h6 三档（14/13/12px + 颜色递浅，h6 大写字母间距）
  - 段落首尾 `:first-child`/`:last-child` margin 清零
  - 删除线 del/s、高亮 mark 预留样式
  - 无序列表嵌套圆点颜色递浅（蓝→浅蓝→更浅蓝）
  - 有序列表 ol 用 CSS counter 自定义数字编号（蓝系），支持嵌套
  - li 内嵌段落间距消除 + 首尾 margin 清零
  - 引用块嵌套引用（边线/底色递浅）+ 内嵌段落间距消除 + 首尾 margin 清零
  - 分割线首尾 margin 清零
  - 代码块滚动条样式（5px + hover 加深）+ 首尾 margin 清零
  - 表格预留样式（全宽、斑马纹、hover 高亮）
  - 图片预留样式（max-width + 圆角）
  - 选中文字 `::selection` 蓝系半透明底
  - `.ai-markdown` 暖橙系全覆盖：h4/h5 橙色、em 棕橙、链接橙系、有序列表编号橙、嵌套引用/列表递浅、分割线橙渐变、代码块滚动条橙、表格橙系斑马纹、选中文字橙系
- **验证**：`npm run build` 通过，1.45s
- **状态**：✅ 完成

### 29. 引入 @microsoft/fetch-event-source

- **背景**：咨询聊天页需要 SSE 流式接收 AI 回复；原生 EventSource 仅支持 GET 且无法自定义请求头（无法携带 Authorization token），微软的 fetch-event-source 基于 fetch 实现，支持 POST 与自定义头。
- **依赖**：`npm install @microsoft/fetch-event-source`
- **改动文件**：`package.json`（新增依赖）
- **改动内容**：仅引入依赖，尚未接入代码
- **验证**：`npm run build` 通过，1.57s
- **状态**：✅ 完成

### 30. 修复新会话按钮禁用态无视觉反馈

- **背景**：`.header-plus` 由原生 button 换成 el-button 后，自定义样式（白底/橙图标/cursor/hover 放大）选择器优先级高于 Element Plus 的 `.is-disabled`，导致禁用时外观与可用态一致。
- **改动文件**：`src/views/consultation.vue`（仅 `.header-plus` 样式）
- **改动内容**：新增 `&.is-disabled` 及 `:hover/:focus/:active` 组合规则，声明在正常 `:hover` 之后（同级优先级后者胜）：禁用时灰底 `#f5f5f5`、灰图标 `#c0c4cc`、`cursor: not-allowed`、`transform: none`（关闭放大）、无阴影；正常态 hover 放大效果保留
- **验证**：`npm run build` 通过，1.80s
- **状态**：✅ 完成

## 2026-10-13

### 31. 情绪花园补充「治愈小行动」模块

- **背景**：左侧情绪花园卡片缺少 UI 图中的治愈小行动列表。
- **改动文件**：`src/views/consultation.vue`
- **改动内容**：
  - 模板：mood-advice 下方新增 `.healing-actions` 区块，标题「治愈小行动」，循环渲染白色圆角小卡片（✨ 星星图标 + 文字）
  - 脚本：新增 `healingActions` computed，复用 `currentEmotion.improvementSuggestions`；import 补 `computed`
  - 样式：标题 14px 半粗 `#3d4654`；列表项白底圆角 12px、轻阴影、gap 10px、星星 14px、文字 13px `#3d4654`，与情绪花园整体柔和风格统一
- **验证**：`npm run build` 通过，2.04s
- **状态**：✅ 完成

### 32. 情绪花园补充「风险提示」模块

- **背景**：左侧情绪花园卡片在危机场景（riskLevel > 0）缺少 UI 图中的黄色高亮「温馨提醒」提示。
- **改动文件**：`src/views/consultation.vue`
- **改动内容**：
  - 模板：healing-actions 下方新增 `.risk-warning` 区块，`v-if="currentEmotion?.riskLevel > 0"`，左侧 🤗 大 emoji，右侧标题「温馨提醒」+ 风险内容（`getRiskText` 复用现有映射）
  - 样式：暖黄渐变底 `#fdf6e3 → #faeeb8`、圆角 12px、轻阴影；标题 14px 半粗 `#a67c2e`，内容 13px 半粗 `#b03a2e`，与 UI 图一致
- **验证**：`npm run build` 通过，1.82s
- **状态**：✅ 完成

### 33. 会话历史固定高度

- **背景**：左侧信息栏（助手名片/情绪花园/风险提示）内容增多后，会话历史 `flex:1` 被拉伸到底部，页面视觉重心偏下。
- **改动文件**：`src/views/consultation.vue`（仅 `.history-card` 样式）
- **改动内容**：`flex: 1` → `height: 260px; flex-shrink: 0`，固定高度避免被内容撑开；内部 `.session-list` 的 `flex:1; min-height:0; overflow-y:auto` 滚动机制保持不变
- **验证**：`npm run build` 通过，1.93s
- **状态**：✅ 完成

### 34. 彻底解决左右底部平齐（恢复 flex 布局）

- **背景**：固定 260px 的会话历史在内容多时仍会导致左侧超出视口、底部比右侧低；且左右两列高度模型互不相干，无法自动平齐。
- **改动文件**：`src/views/consultation.vue`（仅 `.side-bar` / `.history-card` 样式）
- **改动内容**：
  - `.side-bar` 加 `height: 100%`，利用 flex 父容器 `align-items: stretch`（默认）拉伸到与 `.chat-panel` 同高
  - `.history-card` 恢复 `flex: 1` + `min-height: 0`，填充左侧剩余空间；内容少时自动撑高，内容多时被压缩并触发内部滚动
  - 左右两列底部始终平齐，无论内容多少
- **验证**：`npm run build` 通过，1.72s
- **状态**：✅ 完成

### 35. 右侧聊天区自适应左侧高度

- **背景**：`height: 100vh` + `height: 100%` 方案导致左侧内容多时仍受视口高度限制，会话历史被过度压缩。
- **改动文件**：`src/views/consultation.vue`（仅 `.consultation-page` / `.side-bar` 样式）
- **改动内容**：
  - 去掉 `.consultation-page` 的 `height: 100vh`（改为自然高度）
  - 去掉 `.side-bar` 的 `height: 100%`（恢复自然高度）
  - 左右两列均由内容决定高度，flex 容器 `align-items: stretch`（默认）自动让右侧拉伸到与左侧同高
  - 左侧内容多时整体页面变高，右侧聊天区跟随拉伸，底部始终平齐
  - 顺带修复 `.risk-icon` 字体栈，避免 emoji 在某些环境显示异常
- **验证**：`npm run build` 通过，1.80s
- **状态**：✅ 完成

### 36. 会话历史固定 300px 高度

- **背景**：右侧自适应左侧后，若左侧内容过多（如危机场景显示风险提示），整体页面过高，体验不合理。
- **改动文件**：`src/views/consultation.vue`（仅 `.history-card` 样式）
- **改动内容**：`flex: 1` → `height: 300px; flex-shrink: 0`，固定高度限制左侧总高度，避免页面被撑得过高；内部 `.session-list` 滚动机制保持不变；右侧聊天区继续由 flex `align-items: stretch` 自适应左侧高度，底部平齐
- **验证**：`npm run build` 通过，1.67s
- **状态**：✅ 完成

### 37. 修复右侧消息区滚动

- **背景**：去掉 `height: 100vh` 后，右侧消息区高度完全由左侧决定，消息少时过矮，消息多时整个页面被撑高而不是内部滚动。
- **改动文件**：`src/views/consultation.vue`（仅 `.chat-body` 样式）
- **改动内容**：新增 `min-height: 320px` 保证消息少时有基本可视高度；新增 `max-height: calc(100vh - 180px)` 限制消息区不超过视口高度（扣除 header/footer/padding），消息多时触发内部滚动
- **验证**：`npm run build` 通过，1.78s
- **状态**：✅ 完成

### 38. repository.vue 样式检测与柔化

- **背景**：页面存在若干样式缺陷（无单位字号、图文错位、卡片溢出风险），整体风格偏硬，需对齐项目柔和体系。
- **改动文件**：`src/views/repository.vue`（仅 `<style>` 块）
- **修复的 Bug**：
  - `.section-title` `font-size: 12` 缺单位（无效 CSS）→ 15px
  - `.article-item` 缺 flex 导致图片与文字上下排列、`.info` 的 margin-left 错位 → flex 横向布局
  - h1 默认 margin 导致与图标错位 → margin: 0
  - 推荐卡固定 400px 数据溢出无兜底 → 改 sticky + `max-height: calc(100vh - 80px)` 内部滚动
- **样式柔化**：头部渐变改柔和橙→淡紫（`#f8b76a→#c8a4e0`）；卡片圆角 14px + `#eef1f6` 浅边框 + 轻阴影 + hover 上浮；图片圆角 10px + `object-fit: cover`；推荐项橙色左线 + hover 浅橙底，标题两行省略；统一文字色 `#3d4654/#8b949e/#a0a7b3`；内容区 `max-width: calc(100% - 48px)` 防小屏溢出
- **遗留（未改，待确认）**：`articleDetail/computed/watch/marginTop` 未使用；推荐项无点击事件；页面标题「情绪日志」与文章列表内容不符
- **验证**：`npm run build` 通过，1.61s
- **状态**：✅ 完成

### 39. article.vue 样式检测与柔化

- **背景**：页面存在多个致命样式 Bug（类名拼写错误导致卡片样式全失效），且整体配色与项目柔和体系不协调。
- **改动文件**：`src/views/article.vue`（仅 `<style>` 块）
- **修复的 Bug**：
  - `.diray-card` → `.diary-card`（拼写错误，模板用 `diary-card` 但选择器写 `diray-card`，导致整张卡片样式全失效）
  - `.category-tag` → `.category_tag`（模板用下划线，选择器用连字符，匹配不上）
  - `font-weight: 608` → `600`（608 是无效值，浏览器直接忽略）
  - h2 `15px`、h3 `13px` 比正文 16px 还小 → h1 20px / h2 18px / h3 16px / h4-h6 15px 递减
- **样式柔化**：头部渐变改柔和橙→淡紫（`#f8b76a→#c8a4e0`）；卡片圆角 14px + `#eef1f6` 浅边框 + 轻阴影；摘要区改暖橙底 `#fdf8f1` + 橙左线 `#f0b26a`（原来刺眼绿）；区块标题加橙竖线 + 15px；正文 15px + `line-height: 1.8`；补全 strong/em/a/blockquote/code/pre/img/hr 全套 `:deep()` 柔和样式；统一文字色 `#3d4654/#8b949e/#a0a7b3`；内容区 `max-width: calc(100% - 48px)` 防小屏溢出
- **验证**：`npm run build` 通过，1.57s
- **状态**：✅ 完成

### 40. 项目技术栈总结文档

- **背景**：项目完成，输出技术栈与外部依赖总结文档。
- **新增文件**：`docs/tech-stack.md`
- **内容**：核心技术栈（Vue 3.5 + Vite 8 + Pinia + Vue Router 5 + SCSS）、外部依赖清单（element-plus / axios / echarts / wangEditor / dayjs / fetch-event-source 等，含版本与用途）、项目结构、后端通信约定、鉴权方案、统一设计配色体系、构建命令
- **验证**：`npm run build` 通过，1.75s
- **状态**：✅ 完成
