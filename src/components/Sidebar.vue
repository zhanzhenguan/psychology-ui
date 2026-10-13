<template>
  <el-aside :width="isCollapse ? '64px' : '264px'">
    <el-menu
        default-active="2"
        class="menu-style"
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <div class="brand">
            <el-image :src="robotLogo" alt="logo" class="logo" />
            <div v-show="!isCollapse" class="info-card">
                <h1 class="brand-title">心理健康AI助手</h1>
                <p class="brand-subtitle">后台管理系统</p>
            </div>
        </div>
        <el-menu-item @click="selectItem" v-for="item in items" :key="item.name" :index="item.name">
          <el-icon>
            <!-- 动态渲染图标 -->
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{item.meta.title}}</span>
        </el-menu-item>
        
      </el-menu>
  </el-aside>
</template>

<script setup>
// 这里写逻辑，空也可以保留标签
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { ref,computed } from 'vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()



const items = route.matched[0].children
// console.log(route)


const robotLogo = new URL('@/assets/images/robot.png', import.meta.url).href

const selectItem = (item) => {
    const currentPath = route.matched[0].path
    const path = `${currentPath}/${item.index}`
    // console.log(path)
    router.push(path)
}

// 计算属性
const isCollapse = computed(() => adminStore.isCollapse)



</script>

<style scoped lang="scss">


.menu-style {
    height: 100%;
.brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;

    .logo {
        width: 50px;
        height: 50px;
        // margin-right: 5px;
    }

    .info-card {
        .brand-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #1f2937;
        }

        .brand-subtitle {
            font-size: 12px;
            color: #909399;
        }
    }

    }
}


</style>
