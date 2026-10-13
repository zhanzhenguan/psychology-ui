<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="booksLogo" style="width: 60px;height: 60px;"></el-image>
        <h1>知识库</h1>
      </div>
    </div>
    <div class="content">
      <!-- 左侧推荐列表 -->
      <div class="recommend-section">
        <div class="section-title">推荐阅读</div>
        <div class="recommend-list">
          <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="handleClick(item.id)">
            <h4>{{ item.title }}</h4>
            <p class="read-count">
              <el-icon>
                <Histogram />
              </el-icon>
              阅读量 {{ item.readCount }}
            </p>
          </div>
        </div>
      </div>
      <!-- 右侧文章列表 -->
      <div class="article-list">
        <div class="article-item" v-for="item in articleList" :key="item.id"  @click="handleClick(item.id)">
          <el-image style="width: 240px; height: 150px" :src="imageUrl(item.coverImage)"></el-image>
          <div class="info">
            <div class="title">
              <h3>{{ item.title }}</h3>
              <el-tag plain type="primary">{{ item.categoryName }}</el-tag>
            </div>
            <div :style="{ marginTop: '10px' }">
              <div class="flex-box">
                <el-icon>
                  <Avatar />
                </el-icon>
                <span>{{ item.authorName }}</span>
              </div>
              <div class="flex-box">
                <el-icon>
                  <list />
                </el-icon>
                <span>{{ formatDateOnly(item.updatedAt) }}</span>
              </div>
              <div :style="{ marginTop: '10px' }">
                <div class="flex-box">
                  <el-icon>
                    <Platform />
                  </el-icon>
                  <span>观看人数 {{ item.readCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
    <div class="pagination-wrapper">
        <!-- 用 el-config-provider 单独包裹分页，局部中文 -->
        <el-config-provider :locale="zhCn">
          <el-pagination  v-model:current-page="pagination.currentPage"
            :page-size="pagination.size" size="small"
            layout="prev, pager, next, total, jumper" :total="pagination.total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
          </el-pagination>
        </el-config-provider>
      </div>

  </div>


</template>
<script setup>
import { articlePage } from '@/api/frontend'
import { ref, reactive,onMounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { formatDateOnly } from '@/utils/date'
import { useRouter } from 'vue-router'

const router = useRouter()
const marginTop = ref('25px')
const recommendList = ref([])
const articleList = ref([])
const pagination = reactive({
  currentPage: 1,
  size: 4,
  total: 0,
})

const booksLogo = new URL('@/assets/images/books.png', import.meta.url).href

onMounted(() => {
  getRecommendList()
  getArticlePage()
})




// params ===>  /repository/article/:id
// query ===>  /repository/article?id=123
//点击文章
const handleClick = (id) => {
  // 跳转文章详情页 隐式传递id
  router.push(`/repository/article/${id}`)
  // 跳转文章详情页 通过路由路径参数传递id
  // router.push({ path: `/repository/article/${id}` })
  // 跳转文章详情页 通过路由名称，参数传递id
  // router.push({ name: 'article', params: { id:123 } })
}



//左侧推荐列表
const getRecommendList = async () => {
  const params = {
    sortField: 'readCount',
    sortDirection: 'desc',
    currentPage: 1,
    size: 6,
  }
  const { records } = await articlePage(params)
  recommendList.value = records
}

//右侧文章列表
const getArticlePage = async () => {
  const params = {
    sortField: 'publishedAt',
    sortDirection: 'desc',
    ...pagination
  }

  const { records, total } = await articlePage(params)
  articleList.value = records
  pagination.total = total
}

//文章图片
const imageUrl = (url) => url ? import.meta.env.VITE_BASE_URL + url : 'https://file.itndedu.com/psychology_ai.png'



//分页
const handleSizeChange = (val) => {
  console.log(`${val} items per page`)
  pagination.size = val
  getArticlePage()
}
//分页
const handleCurrentChange = (val) => {
  console.log(`current page: ${val}`)
  pagination.currentPage = val
  getArticlePage()
}

</script>
<style scoped lang="scss">
.knowledge-container {
  min-height: 100%;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f4f7fb 100%);

  .flex-box {
    display: flex;
    align-items: center;
    color: #8b949e;

    .el-icon {
      color: #b6c2d4;
      font-size: 14px;
    }

    span {
      margin-left: 8px;
      font-size: 13px;
    }
  }

  .header-section {
    background: linear-gradient(135deg, #f8b76a 0%, #c8a4e0 100%);
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
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    max-width: calc(100% - 48px);
    padding: 24px 0;

    .recommend-section {
      width: 280px;
      flex-shrink: 0;
      position: sticky;
      top: 20px;
      background: #fff;
      border: 1px solid #eef1f6;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(61, 70, 84, 0.05);
      padding: 18px;
      max-height: calc(100vh - 80px);
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-thumb {
        background: #e8ebf1;
        border-radius: 3px;
      }
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #3d4654;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;

      &::before {
        content: '';
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: #f0b26a;
      }
    }

    .recommend-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .recommend-item {
        border-left: 3px solid #f5d5a8;
        border-radius: 0 8px 8px 0;
        padding: 8px 10px;
        cursor: pointer;
        transition: all 0.2s;

        h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          color: #3d4654;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-count {
          margin: 8px 0 0;
          font-size: 12px;
          color: #a0a7b3;
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            font-size: 13px;
          }
        }

        &:hover {
          background: #fdf8f1;
          border-left-color: #f0b26a;

          h4 {
            color: #d98a3a;
          }
        }
      }
    }

    .article-list {
      flex: 1;
      min-width: 0;

      .article-item {
        display: flex;
        gap: 18px;
        background: #fff;
        border: 1px solid #eef1f6;
        border-radius: 14px;
        box-shadow: 0 4px 14px rgba(61, 70, 84, 0.05);
        padding: 16px;
        margin-bottom: 18px;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(61, 70, 84, 0.09);
        }

        :deep(.el-image) {
          width: 240px;
          height: 150px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .info {
          display: flex;
          flex-direction: column;
          margin-left: 0;
          min-width: 0;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;

            h3 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #3d4654;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 6px 0 32px;
  }
}
</style>