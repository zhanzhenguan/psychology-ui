---
alwaysApply: true
---

# 项目技术栈与编码约束

## 1. 语言与框架基础
- **语言**：使用 JavaScript（ES6+），暂不引入 TypeScript。
- **Vue 版本**：Vue 3，统一使用 **Composition API** + `<script setup>` 语法糖。
- **禁止**：Options API（除非维护旧代码）、`new Vue()` 写法、Vue 2 风格的 `this.$xxx` 调用。

## 2. 代码风格
- **命名**：
  - 组件文件：PascalCase（如 `UserProfile.vue`）
  - 变量/函数/ref/reactive：camelCase
  - 常量：UPPER_SNAKE_CASE
  - CSS class：kebab-case（推荐），或跟随项目现有风格
- **分号**：统一加分号 `;`（或跟随项目 .prettierrc 配置）
- **引号**：单引号 `'`，HTML 属性用双引号 `"`
- **函数长度**：单个函数不超过 50 行，超过必须拆分
- **嵌套控制**：if/for 不超过 3 层，优先 early return

## 3. `<script setup>` 编写规范
- **import 顺序**：Vue 相关 → 第三方库 → 项目内工具/组件 → 样式
- **ref vs reactive**：
  - 基本类型、单个对象引用 → `ref`
  - 复杂嵌套对象且不需要整体替换 → `reactive`
  - 从 `reactive` 解构时需用 `toRefs` 保持响应性
- **watch vs computed**：
  - 派生数据 → `computed`
  - 副作用（调接口、DOM 操作）→ `watch` / `watchEffect`
- **生命周期**：用 `onMounted`、`onUpdated` 等组合式函数，不混用 Options 里的钩子
- **defineProps / defineEmits**：
- 
```js
const props = defineProps({
title: { type: String, default: '' },
visible: { type: Boolean, required: true }
})
const emit = defineEmits(['update:visible', 'confirm'])
```

## 4. 组件设计
- **单一职责**：一个组件只做一件事，超过 250 行考虑拆分
- **Props 校验**：所有 props 必须声明类型和默认值
- **事件命名**：使用 kebab-case（`@user-click` 而非 `@userClick`）
- **v-model**：统一用 `defineModel()`（Vue 3.4+）或 `update:modelValue` 模式
- **插槽**：具名插槽用 `name` 标识，作用域插槽明确传出数据
- **禁止**：直接修改 props、在子组件里改父组件状态（通过 emit 通知）

## 5. Element Plus 使用规范
- **按需导入**：使用 `unplugin-vue-components` + `unplugin-auto-import` 自动按需引入，不在页面里手动 import 组件
- **表单**：
- 统一用 `el-form` + `el-form-item` + `:model` + `:rules`
- 表单校验规则集中定义在 `rules` 对象中，不散落在模板里
- 提交前必须调 `formRef.validate()`
- **表格**：
- `el-table` 的 `key` 用唯一 ID，禁止用 `index`
- 列宽合理设置，长文本用 `show-overflow-tooltip`
- 分页统一用 `el-pagination`，封装为独立组件或 mixin
- **弹窗**：
- 用 `el-dialog` 的 `v-model` 控制显隐
- 关闭时重置表单（`@close` 里调 `resetFields()`）
- **消息提示**：统一用 `ElMessage` / `ElMessageBox`，不混用 `alert` 或自定义 toast
- **图标**：使用 `@element-plus/icons-vue`，按需引入，不引入整个图标集
- **禁止**：魔改 Element Plus 组件样式（除非 scoped 覆盖），优先用组件自带 props 控制外观

## 6. 状态管理（Pinia）
- **store 拆分**：按业务域拆分（user、order、dict 等），不堆在一个大 store 里
- **定义方式**：用 `defineStore` + `setup` 语法
- 
```js
export const useUserStore = defineStore('user', () => {
const userInfo = ref(null)
const setUserInfo = (info) => { userInfo.value = info }
return { userInfo, setUserInfo }
})
```

- **使用**：在组件中通过 `storeToRefs` 解构保持响应性
- **持久化**：需要持久化的状态用 `pinia-plugin-persistedstate`

## 7. 路由（Vue Router）
- **路由定义**：用 `createRouter` + `createWebHistory`
- **路由守卫**：全局守卫放 `router/index.js`，页面级用 `onBeforeRouteLeave`
- **懒加载**：所有路由组件用 `() => import()` 懒加载
- **meta 字段**：统一定义 `title`、`requiresAuth`、`roles` 等

## 8. 接口请求
- **统一封装**：所有请求走项目封装的 `request` 实例（基于 axios），不裸调 `axios.get()`
- **API 文件**：按模块拆分 `api/user.js`、`api/order.js`
- **错误处理**：拦截器统一处理 401/403/500，业务错误码在调用处单独处理
- **取消重复请求**：短时间内重复提交的请求要做防抖或取消上一次

## 9. 性能
- **v-for**：必须带 `:key`，用唯一 ID
- **v-show vs v-if**：频繁切换用 `v-show`，条件不常变用 `v-if`
- **computed 缓存**：复杂计算放 computed，不放在模板里内联算
- **大列表**：超过 100 条数据考虑虚拟滚动（vue-virtual-scroller）
- **图片**：用 `el-image` 的懒加载，或原生 `loading="lazy"`

## 10. 安全
- **XSS**：动态 HTML 用 `v-html` 时必须确保内容可信，用户输入展示用插值 `{{ }}`（自动转义）
- **Token**：存 `httpOnly` cookie 或 `sessionStorage`，不存 `localStorage`
- **敏感信息**：API Key、密钥不写在前端代码里

## 11. 注释与文档
- **业务注释**：复杂逻辑写「为什么」而不是「做了什么」，中文
- **组件头部**：每个 `.vue` 文件头部写一段注释说明组件用途、接收的 props、触发的事件
- **接口注释**：`api/` 下每个函数注明请求方法、路径、参数含义

## 12. AI 协作约束
- **复用优先**：生成代码时优先调用项目已有的 utils、composables、components
- **Element Plus 优先**：能用 Element Plus 组件实现的，不自己手写 DOM
- **最小化改动**：修改功能时缩小改动范围，回复中说明影响了哪些文件
- **不主动加依赖**：不引入 `package.json` 中没有的库，如需引入说明理由
- **错误处理**：异步代码必须有 try/catch，接口调用失败要有用户可见的提示
- **不删不改无关代码**：只动对话中明确提到的部分