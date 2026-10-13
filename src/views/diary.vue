<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="heartLogo" style="width: 60px;height: 60px;"></el-image>
        <h1>情绪日志</h1>
      </div>
    </div>
    <div class="content">
      <!-- 情绪评分 -->
      <div class="diary-card">
        <div class="title">今日情绪评分</div>
        <div class="section">
          <p>你今天的整体情绪状态如何？(1-10分)</p>
          <div class="rate">
            <el-rate v-model="fromData.moodScore" :show-text="true" :texts="emotionStatus" :text-color="'#ff9900'"
              :allow-half="true" :max="10" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              :icon-classes="['el-icon-star-off', 'el-icon-star-on', 'el-icon-star-on']"
              v-on:change="handleMoodScoreChange" size="large"></el-rate>
          </div>
        </div>
      </div>
      <!-- 主要情绪 -->
      <div class="diary-card">
        <div class="title">主要情绪</div>
        <div class="emotion-grid">
          <div v-for="emotion in emotionOptions" :key="emotion.name" class="emotion-card"
            :class="{ 'selected': emotion.name === fromData.dominantEmotion }" @click="selectEmotion(emotion.name)">
            <el-image :src="emotion.url" style="width: 80px;height: 80px; border-radius: 50%;"></el-image>
            <div class="emotion-name">{{ emotion.name }}</div>
          </div>
        </div>
      </div>
      <!-- 详细记录 -->
      <div class="diary-card">
        <div class="title">详细记录</div>
        <div class="detail-form">
          <div class="form-group">
            <div class="form-label">情绪触发因素</div>
            <el-input v-model="fromData.emotionTriggers" placeholder="今天什么事情影响了你的情绪？" type="textarea" :rows="3"
              maxLength="1000" show-word-limit></el-input>
          </div>
          <div class="form-group">
            <div class="form-label">今日感想</div>
            <el-input v-model="fromData.diaryContent" placeholder="写下您今天的想法、感受或发生的有趣事情..." type="textarea" :rows="5"
              maxLength="2000" show-word-limit></el-input>
          </div>
          <div class="life-indicators">
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select v-model="fromData.sleepQuality" placeholder="请选择">
                <el-option label="很差" :value="1"></el-option>
                <el-option label="较差" :value="2"></el-option>
                <el-option label="一般" :value="3"></el-option>
                <el-option label="良好" :value="4"></el-option>
                <el-option label="优秀" :value="5"></el-option>
              </el-select>
            </div>
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select v-model="fromData.stressLevel" placeholder="请选择">
                <el-option label="很低" :value="1"></el-option>
                <el-option label="较低" :value="2"></el-option>
                <el-option label="中等" :value="3"></el-option>
                <el-option label="较高" :value="4"></el-option>
                <el-option label="很高" :value="5"></el-option>
              </el-select>
            </div>
          </div>
          
        </div>


      </div>
      <div class="action-buttons">
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
    </div>
    
  </div>

</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { formatDateOnly } from '@/utils/date'
import {emotionDiary} from '@/api/frontend'
import { ElMessage } from 'element-plus'

const heartLogo = new URL('@/assets/images/heart.png', import.meta.url).href
const fromData = reactive({
  diaryDate: formatDateOnly(new Date()),
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null,
})

// 情绪状态
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福'];

// 情绪选项
const emotionOptions = [
  { name: '开心', url: new URL('@/assets/images/happy.png', import.meta.url).href },
  { name: '平静', url: new URL('@/assets/images/calm.png', import.meta.url).href },
  { name: '焦虑', url: new URL('@/assets/images/anxious.png', import.meta.url).href },
  { name: '悲伤', url: new URL('@/assets/images/sad.png', import.meta.url).href },
  { name: '兴奋', url: new URL('@/assets/images/excited.png', import.meta.url).href },
  { name: '疲惫', url: new URL('@/assets/images/tired.png', import.meta.url).href },
  { name: '惊讶', url: new URL('@/assets/images/surprised.png', import.meta.url).href },
  { name: '困惑', url: new URL('@/assets/images/confused.png', import.meta.url).href },
]




// 选择主要情绪
const selectEmotion = (emotion) => {
  fromData.dominantEmotion = emotion
}

const handleMoodScoreChange = (score) => {
  fromData.moodScore = score
}


// 重置表单
const resetForm = () => {
  Object.assign(fromData, {
    diaryDate: formatDateOnly(new Date()),
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null,
  })
}

const submitForm = () => {
  if(!fromData.moodScore) {
    ElMessage.error('请给自己当前情绪状态评分！！！')
    return
  }
  if(!fromData.dominantEmotion) {
    ElMessage.error('请选择当前情绪状态！！！')
    return
  }
  if(!fromData.emotionTriggers) {
    ElMessage.error('请填写情绪触发因素！！！')
    return
  }
  if(!fromData.diaryContent) {
    ElMessage.error('请填写今天情绪感想！！！')
    return
  }
  if(!fromData.sleepQuality) {
    ElMessage.error('请选择睡眠质量！！！')
    return
  }
  if(!fromData.stressLevel) {
    ElMessage.error('请选择压力等级！！！')
    return
  }
  emotionDiary(fromData).then(() => {
    ElMessage.success('提交成功')
    resetForm()
  })
}

</script>
<style scoped lang="scss">
.emotionDiary-container {
  min-height: 100%;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  
  .header-section {
    background: linear-gradient(135deg, #b4eb6d 0%, #eeb75f 100%);
    color: #fff;
    padding: 44px 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 1200px;
      margin: 0 auto;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #687280;
          margin-bottom: 15px;
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .emotion-card {
          padding: 15px;
          border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;

          .emotion-name {
            margin-top: 16px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            border-color: #7ED321;
            background: #F8FDF4;
            transform: translateY(-3px);
          }
        }
      }

      .detail-form {
        .form-label {
          margin: 10px;
          color: #374151;
        }

        .life-indicators {
          display: flex;
          gap: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px;

        }
      }

    }
  }




}
</style>