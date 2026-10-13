<template>
  <div>
    <PageHead title="情绪日志" />
    <TableSearch :formItem="formItem" @search="handleSearch" @reset="handleReset"></TableSearch>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="nickname" label="会话ID" width="80">
        <template #default="scope">
          <el-avatar> {{ scope.row.nickname }} </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="diaryDate" label="记录时间" width="120"></el-table-column>
      <el-table-column label="情绪评分">
        <template #default="scope">
          <el-rate v-model="scope.row.moodScore" :max="10" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="emotionTag" label="生活指标" width="120">
        <template #default="scope">
          <div>
            <p>睡眠:{{ scope.row.sleepQuality }} / 5</p>
            <p>压力:{{ scope.row.stressLevel }} / 5</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="emotionTriggers" label="情绪触发因数" width="200"></el-table-column>
      <el-table-column prop="diaryContent" label="日记内容" width="250"></el-table-column>
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 用 el-config-provider 单独包裹分页'局部中文 -->
    <el-config-provider :locale="zhCn">
      <el-pagination style="margin-top: 25px;" v-model:current-page="pagination.currentPage"
        :page-size="pagination.size" :page-sizes="[10, 20, 30, 40, 50]" size="small"
        layout="prev, pager, next,sizes, total, jumper" :total="pagination.total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-config-provider>

    <el-dialog title="情绪日志详情" v-model="dialogVisible" width="70%" :close-on-click-modal="false">
      <div class="detail-content" v-if="currentDetail">
        <div class="detail-section">
          <h4>用户信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ currentDetail.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ currentDetail.nickname }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentDetail.userId }}</el-descriptions-item>
            <el-descriptions-item label="记录时间">{{ currentDetail.diaryDate }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h4>情绪状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="情绪评分">
              <el-rate v-model="currentDetail.moodScore" :max="10" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="主要情绪">
              <el-tag :type="getEmotionTagType(currentDetail.dominantEmotion)">{{ currentDetail.dominantEmotion ||
                '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="睡眠质量">{{ currentDetail.sleepQuality || '-' }} / 5</el-descriptions-item>
            <el-descriptions-item label="压力水平">{{ currentDetail.stressLevel || '-' }} / 5</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h4>日记内容</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="情绪触发因数">{{ currentDetail.emotionTriggers || '无' }}</el-descriptions-item>
            <el-descriptions-item label="日记内容">{{ currentDetail.diaryContent }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h4>AI情绪分析结果</h4>
          <div class="ai-analysis-result">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="主要情绪">
                <el-tag :type="getAiEmotionTagType(aiData.primaryEmotion)">{{ aiData.primaryEmotion }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="情绪强度">
                <el-progress :percentage="aiData.emotionScore" stroke-width="8" :show-text="false"
                  :status="getEmotionScoreColor(aiData.emotionScore)"></el-progress>
              </el-descriptions-item>
              <el-descriptions-item label="风险等级">
                <el-tag :type="getRiskLevelText(aiData.riskLevel)">{{ aiData.riskLevel }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="情绪性质">
                <el-tag :type="aiData.isNegative ? 'danger' : 'success'">{{ aiData.isNegative ? '消极' : '积极' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="ai-suggestion-section">
              <h5>专家建议</h5>
              <div class="suggestion-content">{{ aiData.suggestion || '无' }}</div>
            </div>
            <div class="ai-risk-section">
              <h5>风险描述</h5>
              <div class="risk-content">{{ aiData.riskDescription || '无' }}</div>
            </div>
            <div class="ai-improvement-section">
              <h5>改善建议</h5>
              <ul class="improvement-list">
                <li v-for="item in aiData.improvementSuggestions" :key="item">{{ item }}</li>
              </ul>
            </div>
            <el-divider content-position="left">
              <template #default>
                <p class="ai-analysis-time">AI分析时间：{{ formatTimestamp(aiData.timestamp) }}</p>
              </template>
            </el-divider>

          </div>
        </div>

        <div class="detail-section">
          <h4>时间信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">{{ currentDetail.createAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentDetail.updateAt }}</el-descriptions-item>

          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>



</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { ref, onMounted, reactive } from 'vue'
import { emotionDiaryPage, deleteEmotionDiary } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { formatTimestamp } from '@/utils/date'

const dialogVisible = ref(false)
const currentDetail = ref({})
const aiData = ref({})


const getEmotionTagType = (emotion) => {
  const emotionTypes = {
    '快乐': 'success',
    '平静': 'info',
    '兴奋': 'warning',
    '愤怒': 'danger',
    '悲伤': 'info',
    '焦虑': 'warning'
  }
  return emotionTypes[emotion] || 'info'
}

const getAiEmotionTagType = (emotion) => {
  const emotionTagMap = {
    '快乐': 'success',
    '平静': 'success',
    '兴奋': 'warning',
    '满足': 'success',
    '愤怒': 'danger',
    '悲伤': 'info',
    '焦虑': 'warning',
    '恐惧': 'danger',
    '沮丧': 'info',
    '压力': 'warning'
  }
  return emotionTagMap[emotion] || 'info'
}


const getEmotionScoreColor = (score) => {
  if (score >= 80) return '#f56c6c'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#909399'
  return '#67c23a'

}
const getRiskLevelTaType = (riskLevel) => {
  const riskTagMap = {
    0: 'success',
    1: 'info',
    2: 'warning',
    3: 'danger',
  }
  return riskTagMap[riskLevel] || 'info'
}


const getRiskLevelText = (riskLevel) => {
  const riskTextMap = {
    0: '正常',
    1: '关注',
    2: '预警',
    3: '危机'
  }
  return riskTextMap[riskLevel] || '未知风险等级'

}

const formItem = [
  {
    type: 'input',
    prop: 'userId',
    label: '用户ID',
    placeholder: '请输入用户ID'
  },
  {
    type: 'select',
    prop: 'moodScoreRange',
    label: '情绪评分',
    placeholder: '请选择情绪评分范围',
    options: [
      {
        label: '低分(1-3)',
        value: '1-3'
      },
      {
        label: '中分(4-6)',
        value: '4-6'
      },
      {
        label: '高分(7-10)',
        value: '7-10'
      }
    ]
  },

]

const tableData = ref([
  {
    id: 1,
    userId:45646456,
    nickname: '用户三',
    diaryDate: '2023-08-15',
    moodScore: 8,
    sleepQuality: 4,
    stressLevel: 3,
    emotionTriggers: '工作压力',
    diaryContent: '最近工作压力较大,需要多休息。',
    username: 'user3',
    dominantEmotion: "压力",
    createAt: '2023-08-15 10:00:00',
    updateAt: '2023-08-15 10:00:00',
    aiEmotionAnalysis: '{"emotionScore":50,"icon":"😊","improvementSuggestions":["保持规律作息","适当运动","与朋友交流"],"keywords":[],"label":"平静","primaryEmotion":"中性","isNegative":false,"riskDescription":"当前情绪状态稳定，无需特别关注","riskLevel":0,"suggestion":"情绪状态平稳，慢慢来就好","timestamp":1769652853654}'
  },
])

const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  handleSearch()
})

const handleSearch = async (formData) => {
  const params = {
    ...pagination,
    ...formData
  }
  // const data = await emotionDiaryPage(params)
  // pagination.total = res.total
  // tableData.value = data
}
const handleReset = () => {
  console.log('重置')
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



const handleDetail = (row) => {
  currentDetail.value = row
  if (row.aiEmotionAnalysis) {
    aiData.value = JSON.parse(row.aiEmotionAnalysis)
  } else {
    aiData.value = {}
  }
  dialogVisible.value = true
}
const handleDelete = async (row) => {
  ElMessageBox.confirm('确认删除该情绪日志吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteEmotionDiary(row.id)
    ElMessage.success('删除成功情绪日志')
    handleSearch()
  }).catch(() => {
    ElMessage.info('已取消删除该情绪日志')
  })
}



</script>
<style scoped lang="scss">

// 情绪日志详情：柔和低饱和配色
.detail-content {
  .detail-section {
    margin-bottom: 22px;

    h4 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 600;
      color: #3d4654;
      padding-left: 10px;
      border-left: 3px solid #a8c5e8;
    }
  }

  // AI 分析结果区域
  .ai-analysis-result {
    .ai-suggestion-section,
    .ai-risk-section,
    .ai-improvement-section {
      margin-top: 14px;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid transparent;

      h5 {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 600;
      }
      .suggestion-content,
      .risk-content {
        font-size: 14px;
        line-height: 1.7;
        color: #3d4654;
      }
    }

    // 专家建议：柔和蓝
    .ai-suggestion-section {
      background: #eef4fb;
      border-color: #e0eaf7;
      h5 {
        color: #5b82b8;
      }
    }

    // 风险描述：柔和暖橙
    .ai-risk-section {
      background: #fdf6ee;
      border-color: #f7eada;
      h5 {
        color: #c08a4e;
      }
    }

    // 改善建议：柔和绿
    .ai-improvement-section {
      background: #f1f7f0;
      border-color: #e5efe3;
      h5 {
        color: #7a9b76;
      }
    }

    .improvement-list {
      margin: 0;
      padding-left: 20px;
      color: #3d4654;
      font-size: 14px;
      line-height: 1.9;

      li::marker {
        color: #9dbf94;
      }
    }

    // AI 分析时间：小而淡
    .ai-analysis-time {
      margin: 0;
      font-size: 12px;
      color: #a0a7b3;
    }
  }
}

</style>