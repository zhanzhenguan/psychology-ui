# 项目记忆

## 约定

### 执行日志

- **每次执行环境搭建、依赖引入、配置变更等任务后，必须更新 `docs/dev-log.md`**。
- 日志格式：按日期分组，每条记录包含：背景/依赖/改动文件/改动内容/状态。
- 用户明确要求："把刚才的执行情况存入md，然后每次执行都保存"（2026-10-09）。

## 技术栈

- Vue 3 + Vite + Pinia + Vue Router
- UI 库：Element Plus（Vue 3 版，替代 Element-UI）
- HTTP：axios，封装于 `src/utils/request.js`，含请求/响应拦截器
- 后端返回结构约定：`{ code, message, data }`，`code` 为 0 或 200 视为成功
- Token 存储于 `localStorage`，key 为 `token`，请求头使用 `Authorization: Bearer <token>`
