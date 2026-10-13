<template>
  <div>
    <PageHead title="知识文章" >
        <template #button>
            <el-button type="primary" @click="handleSaveOrEdit({})">新增</el-button>
            <!-- <el-button type="primary">编辑</el-button> -->
        </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" @reset="handleReset"></TableSearch>
    <el-table :data="tableData" style="width: 100%; margin-top: 25px;"> 
        <el-table-column fixed="left" prop="title" label="文章标题" width="450" >
            <template #default="scope">
                <div style="display: flex; align-items: center;">
                    <el-icon><Timer/></el-icon>
                    <el-text class="mx-3" type="info">{{ scope.row.title }}</el-text>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="250" >
            <template #default="scope">
                <div style="display: flex; align-items: center;">
                    <!-- <el-icon><Timer/></el-icon> -->
                    <el-tag>{{ categoryOptions[scope.row.categoryId] }}</el-tag>
                </div>
                
            </template>
        </el-table-column>
        
        <el-table-column prop="authorName" label="作者" width="100" />
        <el-table-column prop="readCount" label="阅读量" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="250" />
         <el-table-column fixed="right" label="操作" min-width="200">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="handleSaveOrEdit(scope.row)">编辑</el-button>
                <el-button v-if="scope.row.status === 0 || scope.row.status === 2" link 
                type="success" size="small" @click="handlePublish(scope.row)">发布</el-button>
                <el-button v-if="scope.row.status === 1" link type="warning"  size="small" 
                @click="handleOffline(scope.row)">下线</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
      :locale="zhCn"
    >
    </el-pagination>
    </el-config-provider>


    <ArticleDialog 
    v-model:visible="dialogVisible" 
    :categories="categories" 
    :article="currentArticle"
     @success="handleSuccess"></ArticleDialog>

  </div>
    
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import ArticleDialog from '@/components/ArticleDialog.vue'
import { ElMessage,ElMessageBox } from 'element-plus'
import { onMounted,ref,reactive } from 'vue'
import { categoryTree,articlePage,getArticleDetail,deleteArticle,updateArticleStatus } from '@/api/admin'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const formItem = [
    {
        type: 'input',
        prop: 'title',
        label: '文章标题',
        placeholder: '请输入文章标题'
    },
    {
        type: 'select',
        prop: 'categoryId',
        label: '分类',
        placeholder: '请选择分类',
        options: [
            {
                label: '分类1',
                value: 'categoryId1'
            },
            {
                label: '分类2',
                value: 'categoryId2'
            },
            {
                label: '分类3',
                value: 'categoryId3'
            }
        ]
    },
    {
        type: 'select',
        prop: 'status',
        label: '状态',
        placeholder: '请选择状态',
        options: [
            {
                label: '草稿',
                value: '0'
            },
            {
                label: '已上线',
                value: '1'
            },
            {
                label: '已下线',
                value: '2'
            }
        ]

    },
]


//分类映射
const categoryOptions = reactive({})
//分类列表
const categories = ref([])

//表格数据
const tableData = ref([])

//新增和编辑
const dialogVisible = ref(false)



//获取分类
onMounted(async () => {
    const data = await categoryTree()
    categories.value = data.map(item => {
        categoryOptions[item.id] = item.categoryName
        return{
            label : item.categoryName,
            value : item.id
        }
    })
    formItem[1].options = categories.value

    // 获取文章列表
    handleSearch()
})

//新增和编辑成功后刷新列表
const handleSuccess = () => {
    dialogVisible.value = false
    handleSearch()
}

// 表单数据
const currentArticle = ref({})

// 新增和编辑文章
const handleSaveOrEdit = async (row) => {
    console.log(!row?.id)
    if(!row?.id) {
        dialogVisible.value = true
        currentArticle.value = {}
    }else{
        const data = await getArticleDetail(row.id)
        if(!data){
            ElMessage.error("文章详情获取失败")
            return
        }
        currentArticle.value = data
        dialogVisible.value = true
    }
    
}

// 发布文章
const handlePublish = async (row) => {
    ElMessageBox.confirm(`确认发布${row.title}吗？`, '发布确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await updateArticleStatus(row.id,{status:1})
        ElMessage.success(`文章${row.title}发布成功`)
        handleSearch()
    }).catch(() => {
        ElMessage.info(`已取消发布${row.title}`)
    })
}
// 下线文章
const handleOffline = async (row) => {
    ElMessageBox.confirm(`确认下线${row.title}吗？`, '下线确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await updateArticleStatus(row.id,{status:2})
        ElMessage.success(`文章${row.title}下线成功`)
        handleSearch()
    }).catch(() => {
        ElMessage.info(`已取消下线${row.title}`)
    })
}
// 删除文章
const handleDelete = async (row) => {
    ElMessageBox.confirm(`确认删除${row.title}吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await deleteArticle(row.id)
        ElMessage.success(`文章${row.title}删除成功`)
        console.log(row.id)
        handleSearch()
    }).catch(() => {
        ElMessage.info(`已取消删除${row.title}`)
    })
}



//分页
const pagination = reactive({
    currentPage: 1,
    size: 10,
    total: 0
})

const handleSearch = async (formData) => {
    // console.log('父回调查询参数', formData)
    const params = {
        ...pagination,
        ...formData,
    }
    const {records,total} = await articlePage(params)
    tableData.value = records
    pagination.total = total
    // console.log('分页数据', data)
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




</script>
<style scoped lang="scss">

</style>