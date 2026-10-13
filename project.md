# 默认头像


富文本 https://www.wangeditor.com/
Echart图表库https://echarts.apache.org/zh/index.html


# 使用AI样式总结

先将页面的布局确定，再根据布局确定样式。
有需要的标签加上 class,等属性，方便后续样式修改。
然后将效果告诉AI，AI会根据效果生成样式。



computed = "算出来"（派生数据，有缓存，无副作用）
watch = "做点事"（响应变化，执行逻辑，有副作用）
能用 computed 就别用 watch，watch 是 computed 做不了时的兜底方案。



nextTick = "等 Vue 把 DOM 更新完，再执行我的代码"。​ 修改数据后需要操作 DOM、获取尺寸、聚焦、调第三方库时，记得 await nextTick()。


``` javascript

const dialogVisible = computed({
  set(val){
    emits('update:visible',val)
  },
  get(){
    return props.visible
  }
})

// dialogVisible.value  不能直接修改
// 只能通过 dialogVisible 来修改 visible 属性
// 例如：dialogVisible.value = false
// 或者：emits('update:visible',false) 推荐使用


```


#### 分页组件 中文显示
## 原理

`el-config-provider` 是 ElementPlus 的语言容器，包裹谁，谁就使用中文 locale，**不受全局按需导入 bug 影响**，最快兜底方案。

## 效果
- `items per page` → `每页`
- `Go` → `前往`

``` javascript

<template>

<!-- 用 el-config-provider 单独包裹分页，局部中文 -->
<el-config-provider :locale="zhCn">
<el-pagination
  v-model:current-page="pagination.currentPage"
  :page-size="pagination.size"
  :page-sizes="[10, 20, 30, 40, 50]"
  size="small"
  layout="prev, pager, next,sizes, total, jumper"
  :total="pagination.total"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
>
</el-pagination>
</el-config-provider>
</template>

<script setup>
// 按需导入项目用这个路径（90%的vite自动导入项目都是这个）
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ElConfigProvider } from 'element-plus'

const pagination = {
  currentPage: 1,
  size: 10,
  total: 0
}
const handleSizeChange = (val) => {
  pagination.size = val
}
const handleCurrentChange = (val) => {
  pagination.currentPage = val
}
</script>

```



# 路由配置

1.对与/back路径，不能跳转，需要重定向跳转到 redirect: '/back/dashboard'
2.没有登录的时，是不能跳转到任何页面  在导航守卫中判断是否有token，没有token跳转到登录页


# 流式接口对接 fetchEventSource





# 接口文档
https://xsl1e23zpk.apifox.cn/





