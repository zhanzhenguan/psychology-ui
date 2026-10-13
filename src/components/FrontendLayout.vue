<template>
  <div class="frontend-layout">
    <div class="navbar-container">
      <div class="brand-section">
        <img :src="robotLogo" alt="logo" class="brand-logo">
        <h1 class="brand-name">心理健康AI助手</h1>
      </div>
      <div class="nav-section">
        <router-link class="nav-link" to="/">首页</router-link>
        <router-link class="nav-link" to="/consultation" v-if="isLogin">AI咨询</router-link>
        <router-link class="nav-link" to="/diary" v-if="isLogin">情绪日志</router-link>
        <router-link class="nav-link" to="/repository" v-if="isLogin">知识库</router-link>
        <el-button @click="handleLogout" v-if="isLogin">退出登录</el-button>
        <template v-else>
          <router-link class="nav-link" to="/auth/login">登录</router-link>
          <router-link class="nav-link" to="/auth/register">注册</router-link>
        </template>
      </div>
    </div>

    <div class="main-content">
      <router-view></router-view>
    </div>
    <div class="footer-container">
      <div class="footer-bottom">
        <p> © 2026 心理健康Al助手.All rights reserved.</p>
      </div>
    </div>

  </div>

</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(false)

onMounted(() => {
  isLogin.value = userStore.userInfo?.id
})

const robotLogo = new URL('@/assets/images/robot.png', import.meta.url).href
const handleLogout = () => {
  console.log('退出登陆')
  ElMessageBox.confirm('确定退出登陆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    logout().then(() => {
      isLogin.value = false
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/auth/login')
    })
  })
}

</script>
<style scoped lang="scss">
.frontend-layout {
  background-color: #fff;

  .navbar-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .brand-section {
      display: flex;
      align-items: center;

      .brand-logo {
        width: 50px;
        height: 50px;
        // margin-right: 5px;
      }

      .brand-name {
        margin-left: 10px;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }
    }

    .nav-section {
      display: flex;
      align-items: center;
      gap: 40px;

      .nav-link {
        color: #4b5563;
        font-size: 16px;
        font-weight: 500;

        &:hover {
          color: #4A90E2;
        }
      }
    }

  }

  .footer-container {
    background: #1f2937;
    color: white;
    padding: 15px 0;
    margin-top: auto;

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 10px;
      text-align: center;
    }
  }

}
</style>