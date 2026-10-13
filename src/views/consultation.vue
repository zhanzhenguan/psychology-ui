<template>
  <div class="consultation-page">
    <!-- 左侧信息栏：助手名片 / 情绪花园 / 会话历史 -->
    <div class="side-bar">
      <div class="side-card assistant-card">
        <div class="assistant-avatar">
          <el-image style="width: 50px; height: 50px" :src="robotLogo"></el-image>
        </div>
        <p class="assistant-name">摆渡AI助手</p>
        <p class="assistant-status"><span class="status-dot"></span>在线服务中</p>
      </div>

      <div class="side-card mood-card">
        <h3 class="card-title">情绪花园</h3>
        <div class="mood-badge">
          <span class="mood-label">{{ currentEmotion.primaryEmotion }}</span>
          <span class="mood-score">{{ currentEmotion.emotionScore }}</span>
        </div>
        <p class="mood-feel">今天感觉 <b>{{ currentEmotion.isNegative ? '需要关注' : '很不错' }}</b></p>
        <div class="mood-dots">
          <span v-for="dot in 3" :key="dot" class="dot" 
          :class="{'active': getMoodClass(currentEmotion.emotionScore) >= dot }"></span>
          <span class="dots-text">{{getRiskText(currentEmotion.riskLevel)}}</span>
        </div>
        <!-- 温暖小卡片建议 -->
        <div class="mood-advice" v-if="currentEmotion?.suggestion">
          <p class="advice-title">💖  给你的小建议</p>
          <p class="advice-content">{{ currentEmotion.suggestion }}</p>
        </div>
        <!-- 治愈小行动 -->
        <div class="healing-actions" v-if="healingActions.length > 0">
          <h4 class="healing-title">治愈小行动</h4>
          <div v-for="(action, index) in healingActions" :key="index" class="healing-item">
            <span class="healing-star">✨</span>
            <span class="healing-text">{{ action }}</span>
          </div>
        </div>
        <!-- 风险提示（riskLevel > 0 时显示） -->
        <div class="risk-warning" v-if="currentEmotion?.riskLevel > 0">
          <span class="risk-icon">🤗</span>
          <div class="risk-body">
            <p class="risk-title">温馨提醒</p>
            <p class="risk-content">{{ getRiskText(currentEmotion.riskLevel) }}风险，请立即关注</p>
          </div>
        </div>
      </div>
      <!-- 会话历史 -->
      <div class="side-card history-card">
        <h3 class="card-title">会话历史</h3>
        <div v-if="sessionList.length" class="session-list">
          <div v-for="session in sessionList" :key="session.id" class="session-item"
            :class="{ active: currentSession?.sessionId === session.id }" 
            @click="selectSession(session)">
            <div class="session-title">{{ session.sessionTitle }}</div>
            <span class="session-time">{{ session.startedAt }}</span>
            <p class="session-preview">{{ session.lastMessageContent }}</p>
            <div class="session-stats">
              <span><el-icon>
                  <ChatRound />
                </el-icon>{{ session.messageCount || 0 }}</span>
              <span><el-icon>
                  <Clock />
                </el-icon>{{ session.durationMinutes || 0 }} 分钟</span>
            </div>
            <el-button class="session-delete" text type="danger" size="small" title="删除会话"
             :disabled="currentSession?.sessionId === session.id"
              @click.stop="deleteSession(session)">
              <el-icon>
                <DeleteFilled />
              </el-icon>
            </el-button>
          </div>
        </div>
        <p v-else class="history-empty">暂无会话记录</p>

      </div>
    </div>

    <!-- 右侧聊天区 -->
    <div class="chat-panel">
      <div class="chat-header">
        <div class="header-left">
          <span class="header-icon">
            <el-image style="width: 30px; height: 30px" :src="heartLogo"></el-image>
          </span>
          <div>
            <h3>摆渡AI助手</h3>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button class="header-plus" type="primary" title="新会话"
          :disabled="currentSession?.status === 'TEMP'"  @click="createTempSession">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>

      <!-- 聊天消息区域 -->
      <div ref="chatBodyRef" class="chat-body">
        <!-- 欢迎用语 由数据初始化处理 -->
        <!-- <div class="message-row" v-if="messages.length === 0">
          <span class="msg-avatar">
            <el-image style="width: 30px; height: 30px" :src="robotLogo"></el-image>
          </span>
          <div class="msg-content">
            <div class="msg-bubble">
              <p >您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？</p>
            </div>
            <p class="msg-time">{{ '刚刚' }}</p>
          </div>
        </div> -->

        <!-- 消息列表渲染 -->
        <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.senderType === 2 ? 'is-ai' : 'is-user'">
          <span class="msg-avatar">
            <el-image v-if="msg.senderType === 2" style="width: 30px; height: 30px" :src="robotLogo"></el-image>
            <el-image v-else style="width: 30px; height: 30px" :src="userLogo"></el-image>
          </span>
          <div class="msg-content">
            <div class="msg-bubble">
              <!-- AI正在思考中 -->
              <div v-if="msg.senderType === 2 && isAiTyping && !msg.content" class="typing-indicator">
                <span class="status-dot"></span>
                <span class="status-dot"></span>
                <span class="status-dot"></span>
              </div>
              <!-- AI错误提示 -->
              <div v-else-if="msg.isError" class="error-message">
                <p>{{ msg.content }}</p>
              </div>
              <!-- AI正常返回消息 -->
              <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError"
                v-html="formatMessageContent(msg.content)" :isAiMessage="true" class="msg-text"></MarkdownRenderer>
              <!-- 用户消息 -->
              <p v-else-if="msg.content" class="msg-text" v-html="formatMessageContent(msg.content)"></p>
            </div>
            <p class="msg-time">{{ msg.createdAt }}</p>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="input-wrapper">
          <textarea v-model="userMessage" maxlength="500" placeholder="请输入您想要分享的内容..." @keydown="handleKeydown"
            :disabled="isAiTyping"></textarea>
          <div class="input-hints">
            <span>按Enter发送，Shift+Enter换行</span>
            <span>{{ userMessage.length }}/500</span>
          </div>
        </div>
        <button :disabled="!userMessage.trim() || userMessage.length > 500" class="send-btn" type="button"
          @click="sendMessage">
          <el-icon>
            <Promotion />
          </el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSession, chatSessionList, deleteChatSession, getChatMessages,getEmotions } from '@/api/frontend'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 情绪花园
const currentEmotion = ref({
  primaryEmotion:'中性',
  emotionScore:50,
  isNegative:false,
  riskLevel:0,
  suggestion:'情绪状态平稳',
  improvementSuggestions:[]
})

// 治愈小行动（取自情绪分析的改善建议）
const healingActions = computed(() => currentEmotion.value?.improvementSuggestions || [])

//默认
const messages = ref([
  {
    id: 1,
    senderType: 2,
    content: '您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？',
    createdAt: '刚刚'
  }
])

const userMessage = ref('')
const chatBodyRef = ref(null)
const isAiTyping = ref(false)
const robotLogo = new URL('@/assets/images/robot-w.png', import.meta.url).href
const heartLogo = new URL('@/assets/images/heart.png', import.meta.url).href
const userLogo = new URL('@/assets/images/user.png', import.meta.url).href
//当前会话
const currentSession = ref(null)
const sessionList = ref([])



//1.创建临时新会话，才能发消息
const createTempSession = () => {
  const newSessionData = {
    sessionId: `temp_${crypto.randomUUID()}`,
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  //手动创建临时会话，需要清空消息列表
  messages.value = [
    {
      id: 1,
      senderType: 2,
      content: '您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？',
      createdAt: '刚刚'
    }
  ]
  currentSession.value = newSessionData
  console.log('创建临时会话',currentSession.value)

}

onMounted(() => {
  // 创建新会话
  createTempSession()
  //获取会话列表
  getSessionList()
})

// Enter 发送、Shift+Enter 换行
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 新消息到达后滚动到底部
watch(() => messages.value.length, () => {
  nextTick(() => {
    const el = chatBodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
})


// 2.发送消息
const sendMessage = () => {
  const message = userMessage.value.trim()
  if (!message) return

  if (isAiTyping.value) {
    ElMessage.warning('AI助手正在思考中...，请勿发送消息')
    return
  }

  userMessage.value = ''

  //3.1 如果没有会话或者是临时会话，就需要创建一个新的会话
  //3.2 如果有会话历史，继续发送消息
  switch (currentSession.value.status) {
    case 'TEMP':
      createNewSession(message)
      break;
    case 'ACTIVE':
      //继续发送消息
      messages.value.push({
        id: crypto.randomUUID(),
        senderType: 1,
        content: message,
        createAt: new Date().toISOString()
      })
      //继续接收消息
      getAiMessageStream(currentSession.value.sessionId, message)
      break;
    default:
      console.log('未知状态');
      break;
  }

}

//4.创建新会话
const createNewSession = (message) => {
  //构建会话参数
  const sessionParams = {
    initialMessage: message
  }

  if (currentSession.value.sessionTitle === '新对话') {
    sessionParams.sessionTitle = `摆渡AI助手-${new Date().toLocaleString()}`
  } else {
    //如果历史会话记录
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }
  //调用后端接口创建新会话
    createSession(sessionParams).then(data => {
      const sessionData = {
        sessionId: data.sessionId,
        status: data.status,
        sessionTitle: sessionParams.sessionTitle
      }
      //如果当曾是临时会话，更新数据
      if (currentSession.value && currentSession.value.status === 'TEMP') {
        //更新为正式会话
        Object.assign(currentSession.value, sessionData)
      } else {
        //否则，创建一个新的会话
        currentSession.value = sessionData
      }

      //更新会话列表
      getSessionList()

      //添加初始用户消息
      messages.value.push({
        id: crypto.randomUUID(),
        senderType: 1,
        content: message,
        createAt: new Date().toISOString()
      })

      //流式接收 => sessionId,userMessage
      getAiMessageStream(currentSession.value.sessionId, message)

    })
}


//获取会话列表，历史会话记录
const getSessionList = () => {
  const params = {
    pageNum: 1,
    pageSize: 10
  }
  chatSessionList(params).then(data => {
    sessionList.value = data.records
  })
}

//选择会话
const selectSession = (session) => {
  //选中当前会话，无需操作
  if (currentSession.value?.sessionId === session.id) {
    return
  }

  //先更新当前会话
  const sessionData = {
    //选中高亮 作为活跃会话
    sessionId: session.id,
    status: 'ACTIVE',
    sessionTitle: session.sessionTitle
  }

  currentSession.value = sessionData
  //获取会话列表显示到聊天区域
  localChatMessages(session.id)
  //获取情绪数据
  localChatEmotions(session.id)

}

//获取会话列表显示到聊天区域
const localChatMessages = (sessionId)=>{
  getChatMessages(sessionId).then(data => {
      messages.value = data
    })
}


//获取情绪数据
const localChatEmotions = (sessionId)=>{
  const id =`session_${sessionId}`
  getEmotions(id).then(data => {
    //确保session_id格式正确
    currentEmotion.value = data
  })
}


//删除会话
const deleteSession = (session) => {
  ElMessageBox.confirm(`确定删除${session.sessionTitle}吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteChatSession(session.id).then(() => {
      ElMessage.success(`会话${session.sessionTitle}删除成功`)
      getSessionList()
    })
  })
}


//获取AI消息流
const getAiMessageStream = (sessionId, userMessage) => {

  if (isAiTyping.value) {
    ElMessage.warning('AI助手正在思考中...，请勿发送消息')
    return
  }
  isAiTyping.value = true

  const aiMessage = {
    id: `ai_${crypto.randomUUID()}`,
    senderType: 2,
    content: '',
    createAt: new Date().toISOString()
  }

  messages.value.push(aiMessage)

  //调用流式接口
  const controller = new AbortController()
  fetchEventSource('api/psychological-chat/stream',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.token}`,
      'Token': userStore.token,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userMessage: userMessage
    }),
    signal: controller.signal,
    // 连接建立时校验响应头
    onopen: (response) => {
      // console.log(response)
      if (response.headers.get('Content-Type') !== 'text/event-stream') {
        ElMessage.error("服务端返回的不是事件流格式")
        return
      }
    },
    // 每次收到一个 data 事件
    onmessage: (event) => {
      const raw = event.data
      console.log(event)
      if (!raw) return
      const eventName = event.event
      // 当前会话的AI消息
      const aiMessage = messages.value[messages.value.length - 1]

      if (eventName === 'done') {
        isAiTyping.value = false
        controller.abort()
        //信息流结束，获取情绪数据
        localChatEmotions(currentSession.value.sessionId)
        return
      }

      const payload = JSON.parse(raw)
      const ok = String(payload.code) === '200'

      if (ok && payload.data && payload.data.content) {
        aiMessage.content += payload.data.content
      } else if (!ok) {
        // 错误回复的显示
        handleError(payload.message || 'AI回复失败')
      }
    },
    // 连接错误时触发
    onerror: (error) => {
      handleError(payload.message || 'AI回复失败')
      throw error
    },
    // 连接关闭时触发
    onclose: () => {
      //调用后 情绪分析
      localChatEmotions(currentSession.value.sessionId)
    },
  })
}

// 错误处理函数
const handleError = (error) => {
  // 当前会话的AI消息
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage) {
    aiMessage.content = 'AI回复失败,请重试...'
  }
  isAiTyping.value = false
  ElMessage.error(error)
}

// 简单的换行逻辑
const formatMessageContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 情绪分析结果
const getRiskText = (level)=>{
  switch (level) {
    case 0:
      return '正常'
    case 1:
      return '关注'
    case 2:
      return '预警'
    case 3:
      return '危机'
    default:
      return '紧急'
  }
}
// 情绪分析结果
const getMoodClass  = (score)=>{
    if (score >= 61) {
      return 3
    } else if (score >= 31) {
      return 2
    } else {
      return 1
    }
}


</script>

<style scoped lang="scss">
.consultation-page {
  display: flex;
  gap: 14px;
  max-width: 1250px;
  margin: 0 auto;
  padding: 16px 24px;
  box-sizing: border-box;
}

// ========== 左侧信息栏 ==========
.side-bar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.side-card {
  background: #f5f1f1;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(81, 104, 141, 0.05);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #3d4654;
  margin-bottom: 16px;
}

// 助手名片
.assistant-card {
  text-align: center;

  .assistant-avatar {
    width: 52px;
    height: 52px;
    margin: 0 auto 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8b76a, #f09b3e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .assistant-name {
    font-size: 15px;
    font-weight: 600;
    color: #ef9a3d;
    margin-bottom: 6px;
  }

  .assistant-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: #67c23a;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #67c23a;
  }
}

// 情绪花园
.mood-card {
  background: linear-gradient(180deg, #fdf6ec, #faeeda);
  text-align: center;

  .mood-badge {
    width: 84px;
    height: 84px;
    margin: 0 auto 12px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f6b3cc, #d9a6e8);
    border: 3px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 6px 16px rgba(230, 160, 200, 0.4);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .mood-label {
      font-size: 14px;
    }

    .mood-score {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .mood-feel {
    font-size: 13px;
    color: #8b949e;

    b {
      color: #3d4654;
      margin-left: 6px;
    }
  }

  .mood-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 10px 0 16px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f3d7de;

      &.active {
        background: #ee9bb4;
      }
    }

    .dots-text {
      font-size: 12px;
      color: #8b949e;
      margin-left: 4px;
    }
  }

  .mood-advice {
    background: #fff;
    border-radius: 12px;
    padding: 12px 14px;
    text-align: left;
    box-shadow: 0 2px 8px rgba(61, 70, 84, 0.04);

    .advice-title {
      font-size: 13px;
      font-weight: 600;
      color: #e8833a;
      margin-bottom: 4px;
    }

    .advice-content {
      font-size: 13px;
      color: #3d4654;
    }
  }

  // 治愈小行动
  .healing-actions {
    margin-top: 16px;

    .healing-title {
      font-size: 14px;
      font-weight: 600;
      color: #3d4654;
      margin-bottom: 10px;
    }

    .healing-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 8px;
      box-shadow: 0 2px 8px rgba(61, 70, 84, 0.04);

      &:last-child {
        margin-bottom: 0;
      }

      .healing-star {
        flex-shrink: 0;
        font-size: 14px;
      }

      .healing-text {
        font-size: 13px;
        color: #3d4654;
        line-height: 1.5;
      }
    }
  }

  // 风险提示（危机场景）
  .risk-warning {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding: 12px 14px;
    background: linear-gradient(135deg, #fdf6e3, #faeeb8);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(180, 130, 40, 0.08);

    .risk-icon {
      font-size: 24px;
      flex-shrink: 0;
      font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
    }

    .risk-body {
      flex: 1;
      text-align: center;
    }

    .risk-title {
      font-size: 14px;
      font-weight: 600;
      color: #a67c2e;
      margin-bottom: 2px;
    }

    .risk-content {
      font-size: 13px;
      font-weight: 600;
      color: #b03a2e;
    }
  }
}

// 会话历史
.history-card {
  height: 300px; // 固定高度，内部列表滚动
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  .session-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e8ebf1;
      border-radius: 3px;
    }
  }

  .session-item {
    position: relative;
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: #f0dcc0;
      box-shadow: 0 2px 8px rgba(61, 70, 84, 0.06);

      .session-delete {
        opacity: 1;
      }
    }

    &.active {
      border-color: #f0c894;
      background: #fdf8f1;
    }

    .session-title {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      color: #3d4654;
      padding-right: 26px; // 给右上角删除按钮留位
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-time {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 6px;
      font-size: 11px;
      line-height: 1.4;
      color: #a0a7b3;
    }

    .session-preview {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      color: #8b949e;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-stats {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 6px;
      font-size: 11px;
      line-height: 1.4;
      color: #a0a7b3;

      span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }


    }

    // 删除按钮：默认隐藏，悬停会话项时显示在右上角
    .session-delete {
      position: absolute;
      top: 6px;
      right: 6px;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  .history-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #a0a7b3;
  }
}

// ========== 右侧聊天区 ==========
.chat-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #fafbfc;
  box-shadow: 0 2px 10px rgba(61, 70, 84, 0.05);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f8b76a, #f09b3e);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      font-size: 16px;
      color: #fff;
      margin-bottom: 2px;
    }

    p {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .header-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-plus {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: #fff;
    color: #ef9a3d;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.08);
    }

    // 禁用态：关闭 hover 放大，灰底灰图标 + 禁用光标
    // 选择器与 :hover 同级但声明在后，禁用时优先命中
    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus,
    &.is-disabled:active {
      background: #f5f5f5;
      color: #c0c4cc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}

.chat-body {
  flex: 1;
  min-height: 320px; // 消息少时保证最小可视高度
  max-height: calc(100vh - 180px); // 消息多时限制在视口内，触发内部滚动
  overflow-y: auto;
  padding: 20px 24px;
  background-color: #f5f1f1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e8ebf1;
    border-radius: 3px;
  }
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;

  .msg-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8b76a, #f09b3e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .msg-bubble {
    max-width: 72%;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msg-time {
    font-size: 11px;
    color: #a0a7b3;
    margin-top: 6px;
  }

  // AI 消息：左侧灰白气泡
  &.is-ai {
    .msg-bubble {
      background: #f4f5f7;
      color: #3d4654;
      border-top-left-radius: 4px;
    }
  }

  // 用户消息：右侧橙色渐变气泡
  &.is-user {
    justify-content: flex-end;

    .msg-content {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .msg-bubble {
      background: linear-gradient(135deg, #f8b76a, #f09b3e);
      color: #fff;
      border-top-right-radius: 4px;
    }
  }
}

.chat-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px 16px;
  background: #fff;

  .input-wrapper {
    flex: 1;
    border: 1px solid #eef1f6;
    border-radius: 14px;
    padding: 10px 14px;
    background: #fff;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #f5c084;
    }

    textarea {
      width: 100%;
      min-height: 56px;
      border: none;
      outline: none;
      resize: none;
      font-size: 14px;
      font-family: inherit;
      color: #3d4654;

      &::placeholder {
        color: #a0a7b3;
      }
    }

    .input-hints {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #a0a7b3;
      margin-top: 4px;
    }
  }

  .send-btn {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8b76a, #f09b3e);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(240, 155, 62, 0.35);
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.06);
    }
  }
}
</style>
