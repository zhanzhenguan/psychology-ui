<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar user">
              <el-image :src="image1"></el-image>
            </div>
            <div class="info">
              <p class="title">总用户数</p>
              <p class="number">{{ aiData.systemOverview.totalUsers }}</p>
              <p class="subtitle-title">活跃用户数:{{ aiData.systemOverview.activeUsers }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar diary">
              <el-image :src="image2"></el-image>
            </div>
            <div class="info">
              <p class="title">情绪日志</p>
              <p class="number">{{ aiData.systemOverview.totalDiaries }}</p>
              <p class="subtitle-title">今日新增:{{ aiData.systemOverview.todayNewDiaries }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar session">
              <el-image :src="image3"></el-image>
            </div>
            <div class="info">
              <p class="title">咨询会话</p>
              <p class="number">{{ aiData.systemOverview.totalSessions }}</p>
              <p class="subtitle-title">今日新增:{{ aiData.systemOverview.todayNewSessions }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar mood">
              <el-image :src="image4"></el-image>
            </div>
            <div class="info">
              <p class="title">平均情绪</p>
              <p class="number">{{ aiData.systemOverview.avgMoodScore }} / 10</p>
              <p class="subtitle-title">情绪健康指数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card style="width: 100%; height: 100%;">
          <template #header>
            <div class="car-header">
              情绪趋势分析
            </div>
          </template>
          <div class="chart-content">
            <div ref="emotionChartRef" style="height: 370px; width: 100%;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="width: 100%; height: 100%;">
          <template #header>
            <div class="car-header">
              咨询会话统计
            </div>
          </template>
          <div class="chart-content">
            <div class="conslutation-stats">
              <div v-if="aiData.consultationStats" class="stats-item">
                <div class="stats-laber">会话总数</div>
                <div class="stats-value">{{ aiData.consultationStats.totalSessions }}</div>
              </div>
              <div v-if="aiData.consultationStats" class="stats-item">
                <div class="stats-laber">平均时长</div>
                <div class="stats-value">{{ aiData.consultationStats.avgDurationMinutes }}分钟</div>
              </div>
              <div v-if="aiData.systemOverview" class="stats-item">
                <div class="stats-laber">活跃用户</div>
                <div class="stats-value">{{ aiData.systemOverview.activeUsers }}</div>
              </div>
            </div>
            <div ref="conslutationChartRef" style="height: 260px; width: 100%;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-card style="width: 100%;">
          <template #header>
            <div class="car-header">
              用户活跃趋势
            </div>
          </template>
          <div class="chart-content">
            <div ref="activeChartRef" style="height: 300px; width: 100%;"></div>
          </div>
        </el-card>
    </el-row>
  </div>

</template>
<script setup>
import { getAnalyticsOverview } from '@/api/admin'
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts';

const aiData = ref({})

let emotionChart = null
const emotionChartRef = ref(null)
let conslutationChart = null
const conslutationChartRef = ref(null)
let activeChart = null
const activeChartRef = ref(null)

// 图表统一柔和配色（低饱和），三个图表共享，避免各自硬编码
const CHART_COLORS = ['#7ba7d9', '#e0a96d', '#8fc49a', '#b39ddb']
const TITLE_COLOR = '#3d4654'
const AXIS_LABEL_COLOR = '#8b949e'
const AXIS_LINE_COLOR = '#e2e6ee'
const SPLIT_LINE_COLOR = '#f0f2f6'

// 柔和提示框
const softTooltip = {
  trigger: 'axis',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  textStyle: { color: TITLE_COLOR, fontSize: 13 },
  extraCssText: 'box-shadow: 0 4px 12px rgba(61,70,84,0.1); border-radius: 8px;'
}

// 柔和类目轴
const softCategoryAxis = (data = []) => ({
  type: 'category',
  data,
  boundaryGap: true,
  axisLine: { lineStyle: { color: AXIS_LINE_COLOR } },
  axisTick: { show: false },
  axisLabel: { color: AXIS_LABEL_COLOR, fontSize: 12 }
})

// 柔和数值轴
const softValueAxis = () => ({
  type: 'value',
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: AXIS_LABEL_COLOR, fontSize: 12 },
  splitLine: { lineStyle: { color: SPLIT_LINE_COLOR, type: 'dashed' } }
})

// 柔和折线 series 生成器
const softLineSeries = (name, data, colorIndex, area = false) => ({
  name,
  type: 'line',
  data,
  smooth: true,
  symbol: 'circle',
  symbolSize: 6,
  lineStyle: { width: 2, color: CHART_COLORS[colorIndex] },
  itemStyle: { color: CHART_COLORS[colorIndex], borderColor: '#fff', borderWidth: 1 },
  ...(area ? { areaStyle: { color: CHART_COLORS[colorIndex], opacity: 0.1 } } : {})
})

// 柔和柱状 series 生成器
const softBarSeries = (name, data, colorIndex) => ({
  name,
  type: 'bar',
  data,
  barMaxWidth: 24,
  itemStyle: { color: CHART_COLORS[colorIndex], borderRadius: [4, 4, 0, 0] }
})

// 柔和标题
const softTitle = (text) => ({
  text,
  left: 'center',
  top: 10,
  textStyle: { color: TITLE_COLOR, fontSize: 16, fontWeight: 600 }
})

// 柔和图例
const softLegend = (data) => ({
  data,
  top: 42,
  icon: 'roundRect',
  itemWidth: 12,
  itemHeight: 4,
  textStyle: { color: AXIS_LABEL_COLOR, fontSize: 12 }
})

const initChart = () => {
  initEmotionChart()
  initConslutationChart()
  initActiveChart()
}

// 初始化图表
const initEmotionChart = () => {
  // 检查图表容器是否存在
  if (!emotionChartRef.value) {
    return
  }
  // 销毁旧图表实例
  if (emotionChart) {
    emotionChart.dispose()
  }
  emotionChart = echarts.init(emotionChartRef.value)

  const emotionTrend = aiData.value.emotionTrend || []
  //配置项
  const option = {
    color: CHART_COLORS,
    grid: {
      left: '3%',
      right: '4%',
      top: 80,
      bottom: '5%',
      containLabel: true
    },
    title: softTitle('情绪趋势分析'),
    tooltip: softTooltip,
    legend: softLegend(['平均情绪评分', '记录数量']),
    xAxis: softCategoryAxis(emotionTrend.map(item => item.date)),
    yAxis: [
      { ...softValueAxis(), name: '情绪评分', nameTextStyle: { color: AXIS_LABEL_COLOR } },
      { ...softValueAxis(), name: '记录数量', nameTextStyle: { color: AXIS_LABEL_COLOR } }
    ],
    series: [
      softLineSeries('平均情绪评分', emotionTrend.map(item => item.avgMoodScore), 0, true),
      softLineSeries('记录数量', emotionTrend.map(item => item.recordCount), 1)
    ]
  };

  // 使用配置项设置图表
  emotionChart.setOption(option)
}
// 初始化咨询会话统计图表
const initConslutationChart = () => {
  // 检查图表容器是否存在
  if (!conslutationChartRef.value) {
    return
  }
  // 销毁旧图表实例
  if (conslutationChart) {
    conslutationChart.dispose()
  }
  conslutationChart = echarts.init(conslutationChartRef.value)
  const dailyTrend = aiData.value.consultationStats?.dailyTrend || []
  const option = {
    color: CHART_COLORS,
    grid: {
      left: '3%',
      right: '4%',
      top: 80,
      bottom: '3%',
      containLabel: true
    },
    title: softTitle('咨询活动统计'),
    tooltip: softTooltip,
    legend: softLegend(['会话数量', '参与用户数']),
    xAxis: softCategoryAxis(dailyTrend.map(item => item.date)),
    yAxis: [
      softValueAxis(),
      softValueAxis()
    ],
    series: [
      softBarSeries('会话数量', dailyTrend.map(item => item.sessionCount), 0),
      softBarSeries('参与用户数', dailyTrend.map(item => item.userCount), 1)
    ]
  };
  conslutationChart.setOption(option)
}

// 初始化用户活跃趋势图表
const initActiveChart = () => {
  // 检查图表容器是否存在
  if (!activeChartRef.value) {
    return
  }
  // 销毁旧图表实例
  if (activeChart) {
    activeChart.dispose()
  }
  activeChart = echarts.init(activeChartRef.value)
  const active = aiData.value.userActivity || []
  const option = {
    color: CHART_COLORS,
    grid: {
      left: '3%',
      right: '4%',
      top: 80,
      bottom: '3%',
      containLabel: true
    },
    title: softTitle('用户活跃趋势'),
    tooltip: softTooltip,
    legend: softLegend(['活跃用户', '新增用户', '日记用户', '咨询用户']),
    xAxis: softCategoryAxis(active.map(item => item.date)),
    // 四条线同量纲（用户数），共用一根柔和数值轴即可，避免四主轴挤压画面
    yAxis: softValueAxis(),
    series: [
      softLineSeries('活跃用户', active.map(item => item.activeUsers), 0, true),
      softLineSeries('新增用户', active.map(item => item.newUsers), 1),
      softLineSeries('日记用户', active.map(item => item.diaryUsers), 2),
      softLineSeries('咨询用户', active.map(item => item.consultationUsers), 3)
    ]
  };
  activeChart.setOption(option)
}


const image1 = new URL('@/assets/images/user.png', import.meta.url).href
const image2 = new URL('@/assets/images/book.png', import.meta.url).href
const image3 = new URL('@/assets/images/comments.png', import.meta.url).href
const image4 = new URL('@/assets/images/happy.png', import.meta.url).href


onMounted(() => {
  // 初始化图表
  initEmotionChart()
  getAnalyticsOverview().then(data => {
    // console.log(data)
    aiData.value = data
    initChart()
  })
})

</script>
<style scoped lang="scss">
// 仪表盘统计卡片：柔和低饱和配色，与前序页面风格统一
.dashboard-container {
  .el-card {
    border-radius: 12px;
    border: 1px solid #eef1f6;
    box-shadow: 0 2px 8px rgba(61, 70, 84, 0.04);
    transition: box-shadow 0.25s ease, transform 0.25s ease;

    // 柔和 hover 反馈：轻微上浮 + 阴影加深，无强投影
    &:hover {
      box-shadow: 0 6px 16px rgba(61, 70, 84, 0.08);
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    // 图表卡片头部：弱化分割线，留白适中
    :deep(.el-card__header) {
      padding: 14px 20px;
      border-bottom: 1px solid #f0f2f6;
    }
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  // 图标容器：四张卡片按语义使用不同的柔和浅色底，图标本身约束为 24px
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    // el-image 是组件，需穿透控制内部 img 尺寸，避免按原图大小渲染
    :deep(.el-image) {
      width: 24px;
      height: 24px;
    }
    :deep(.el-image img) {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &.user {
      background: #eaf2fc; // 柔和蓝
    }
    &.diary {
      background: #e9f7f0; // 柔和绿
    }
    &.session {
      background: #fdf3ea; // 柔和暖橙
    }
    &.mood {
      background: #f4eefb; // 柔和紫
    }
  }

  .info {
    min-width: 0;

    .title {
      margin: 0;
      font-size: 13px;
      color: #8b949e;
      line-height: 1.5;
    }

    .number {
      margin: 2px 0;
      font-size: 15px;
      font-weight: 600;
      color: #3d4654;
      line-height: 1.3;
      font-variant-numeric: tabular-nums; // 数字等宽，多卡片对齐
    }

    .subtitle-title {
      margin: 0;
      font-size: 12px;
      color: #a0a7b3;
      line-height: 1.5;
    }

    // 咨询会话统计区域
    
  }

  // 图表卡片标题：字号适中、颜色柔和
  .car-header {
    font-size: 15px;
    font-weight: 600;
    color: #3d4654;
    line-height: 1.4;
  }

  // 图表区：与卡片标题留出呼吸空间
  .chart-content {
    padding-top: 4px;
  }

  // 咨询会话统计：三项指标横向均分，每项内部上下分布（标签在上、数值在下）
  .conslutation-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .stats-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 12px;
      background: #f6f8fb;
      border: 1px solid #eef1f6;
      border-radius: 10px;

      .stats-laber {
        font-size: 13px;
        color: #8b949e;
        line-height: 1.5;
      }

      .stats-value {
        font-size: 15px;
        font-weight: 600;
        color: #3d4654;
        line-height: 1.3;
        font-variant-numeric: tabular-nums;
      }
    }
  }


}
</style>