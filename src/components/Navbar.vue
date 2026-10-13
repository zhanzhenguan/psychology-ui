<template>
  <div class="navbar">
    <div class="flex-box" @click="handleCollapse">
        <el-button ><el-icon><Expand /></el-icon></el-button>
        <p class="page-title">{{route.meta.title || '导航栏'}}</p>
    </div>
  <div class="flex-box">
    <el-dropdown @command="handleCommand">
        <div class="flex-box">
            <el-avatar :src="userLogo" />
            <p class="user-name">{{ userStore.userInfo.username }}</p>
            <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item command="logout" >退出登陆</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
  </div>
    
  </div>
    
</template>
<script setup>
// 这里写逻辑，空也可以保留标签
import { ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const adminStore = useAdminStore()
// 用户信息
const userStore = useUserStore()
// 用户头像
const userLogo = new URL('@/assets/images/user.png', import.meta.url).href
// const userLogo = new URL(userStore.userInfo.avatar, import.meta.env.VITE_PROXY_TARGET).href

// 处理下拉菜单点击事件
const handleCommand = (command) => {
    if (command === 'logout') {
            // 退出登陆逻辑
        console.log('退出登陆')
        ElMessageBox.confirm('确定退出登陆吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            logout().then(() => {
                userStore.logout()
                ElMessage.success('退出成功')
                router.push('/auth/login')
            })
        })
    }
}


// 处理折叠事件
const handleCollapse = () => {
    adminStore.toggleCollapse()
    console.log(adminStore.isCollapse)
}


</script>
<style scoped lang="scss">

.navbar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    background:white;
    box-shadow:0 1px 4px rgba(0,21,41,0.08);
    border-bottom:1px solid #e5e7eb;

    .flex-box {
    display: flex;
    align-items: center;
    justify-content: center;

    .page-title {
        margin-left: 20px;
        font-size: 26px;
        font-weight: bold;
        color: #292b2c;

    }
    .user-name{
        font-size: 15px;
        font-weight: bold;
        color: #292b2c;
        margin-left: 8px;
    }



    }
}




</style>