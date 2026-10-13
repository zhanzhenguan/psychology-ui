<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <Sidebar/>
      <el-container style="height: 100%;">
        <el-header class="header-container">
            <Navbar />
        </el-header>
        <el-main class="main-content">
            <router-view class="content-container"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

</script>
<style scoped lang="scss">

.backend-layout {

  height: 100vh;

// 不可用
//   el-header {
//         height: 74px !important;    
//         
//   }
  .main-container {
    height: 100%;
    // 导航栏
    .header-container {
        height: 70px !important;
    }
    // 内容区域
    .main-content{

        flex: 1;
        .content-container {
            padding: 25px;
            background-color: #fff;
            min-height: calc(100% - 74px);
        }
    }
    
  }

  
}

</style>

