<template>
  <div>
    <PageHead title="咨询记录" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="userNickname" label="会话ID" width="100" >
        <template #default="scope">
          <el-avatar> {{scope.row.userNickname}} </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="emotional" label="情绪日记" >
        <template #default="scope">
          <div class="sesion-title">{{scope.row.sessionTitle}}</div>
          <div class="sesion-preview">{{scope.row.lastMessageContent}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="messageCount" label="消息数" width="100" >
      </el-table-column>
      <el-table-column prop="lastMessageTime" label="时间" width="180" ></el-table-column>
      <el-table-column fixed="right" label="操作"  width="200" >
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 用 el-config-provider 单独包裹分页，局部中文 -->
    <el-config-provider :locale="zhCn">
        <el-pagination
        style="margin-top: 25px;"
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

      <el-dialog title="咨询会话" 
      v-model="dialogVisible"
       width="70%"
      :close-on-click-modal="false"
      >
        <div class="session-detail">
          <div class="detail-header">
            <div class="detial-row">
              <div class="detail-label">用户:</div>
              <div class="detail-value">{{currentSession.userNickname}}</div>
            </div>
            <div class="detial-row">
              <div class="detail-label">开始时间:</div>
              <div class="detail-value">{{currentSession.startedAt}}</div>
            </div>
            <div class="detial-row">
              <div class="detail-label">消息数:</div>
              <div class="detail-value">{{currentSession.messageCount}}</div>
            </div>
          </div>
          <div class="message-container">
            <div class="message-header">
              <h4>对话记录</h4>
            </div>
            <div class="message-list" v-loading="loading">
              <div
                class="message-item"
                :class="message.senderType == 1 ? 'user-message' : 'ai-message'"
                v-for="message in sessionMessages"
              >
                <div class="item-header">
                  <span class="sender">{{message.senderType==1?'用户':'AI助手'}}</span>
                  <span class="time">{{message.createdAt}}</span>
                </div>

                <div class="item-content">{{message.content}}</div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button type="primary" size="small" @click="handleClose">关闭</el-button>
        </template>
      </el-dialog>

  </div>
    
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import { ref, onMounted,reactive } from 'vue'
import { chatSessionsPage,getChatMessages } from '@/api/admin'
import zhCn from 'element-plus/es/locale/lang/zh-cn'


const tableData = ref([])
const dialogVisible = ref(false)
const currentSession = ref(null)
const sessionMessages = ref([])
const loading = ref(false)


const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0,
  emotionTag: ''
})

onMounted(() => {
  handleSearch()
})

const handleClose = () => {
  dialogVisible.value = false
}



const handleDetail = (row) => {
  loading.value = true
  getChatMessages(row.id).then(data => {
    loading.value = false
    sessionMessages.value = data
    dialogVisible.value = true
    currentSession.value = row
  })
  
}

const handleSearch = async () => {
  const {records,total} = await chatSessionsPage(pagination)
  tableData.value = records 
  pagination.total = total
}

const handleSizeChange = (val) => {
  console.log(`${val} items per page`)
  pagination.size = val
  handleSearch()
}
const handleCurrentChange = (val) => {
  console.log(`current page: ${val}`)
  pagination.currentPage = val
  handleSearch()
}



</script>
<style scoped lang="scss">

// 咨询会话详情：柔和低饱和配色
.session-detail {
  .detail-header {
    background: #f6f8fb;
    border: 1px solid #eef1f6;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 18px;

    .detial-row {
      display: flex;
      align-items: center;
      line-height: 2;

      .detail-label {
        width: 80px;
        color: #8b949e;
        font-size: 13px;
        flex-shrink: 0;
      }
      .detail-value {
        color: #3d4654;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .message-container {
    .message-header {
      h4 {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
        color: #3d4654;
        padding-left: 10px;
        border-left: 3px solid #a8c5e8;
      }
    }

    .message-list {
      max-height: 480px;
      overflow-y: auto;
      padding: 8px 4px;
      // 柔和滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: #dde3ec;
        border-radius: 3px;
      }
    }

    .message-item {
      margin-bottom: 14px;
      padding: 12px 16px;
      border-radius: 10px;
      line-height: 1.7;

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        .sender {
          font-size: 13px;
          font-weight: 600;
        }
        .time {
          font-size: 12px;
          color: #a0a7b3;
        }
      }

      .item-content {
        font-size: 14px;
        color: #3d4654;
        white-space: pre-wrap;
        word-break: break-word;
      }

      // 用户消息：柔和蓝
      &.user-message {
        background: #eaf2fc;
        border: 1px solid #dde9f8;
        .sender {
          color: #5b82b8;
        }
      }

      // AI 消息：柔和暖白
      &.ai-message {
        background: #f7f9f6;
        border: 1px solid #ebf0e9;
        .sender {
          color: #7a9b76;
        }
      }
    }
  }
}

</style>