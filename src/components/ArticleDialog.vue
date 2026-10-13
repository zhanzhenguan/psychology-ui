<template>
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑文章' : '创建文章'" width="50%" @close="handleClose" :close-on-click-modal="false">
    <el-form  ref="formRef"  :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="文章标题" prop="title" :label-width="formLabelWidth">
        <el-input v-model="formData.title" placeholder="请输入文章标题" min-length="5" maxlength="200" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId" :label-width="formLabelWidth">
        <el-select v-model="formData.categoryId" placeholder="请选择分类">
          <el-option v-for="item in categories" :key="item.value" :value="item.value" :label="item.label"  />
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary" :label-width="formLabelWidth">
        <el-input type="textarea" v-model="formData.summary"  placeholder="请输入文章摘要(可选)" :rows="4" maxlength="1000" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="标签" prop="tags" :label-width="formLabelWidth">
        <el-select v-model="formData.tagArray" type="textarea" placeholder="请选择标签(可自定义标签)" multiple filterable allow-create style="width: 100%">
          <el-option v-for="tag in commonTags" :key="tag" :value="tag" :label="tag"  /> 
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片" prop="coverImage">
        <div class="cover-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            accept="image/*"
            :http-request="httpRequest"
            :before-upload="beforeUpload"
            :show-file-list="false"
          >
          <div v-if="!imgUrl" class="cover-placeholder">
            <p>点击上传封面</p>
          </div>
          <img v-else :src="imgUrl" alt="封面图片" class="cover-img" />
          <div v-if="imgUrl" class="cover-remove">
              <el-button type="danger" size="small" @click="handleRemove">移除封面</el-button>
          </div>
        </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" >
        <RichTextEditor 
        v-model="formData.content"
         placeholder="请输入文章内容，支持富文本格式\n\n可以使用加粗、斜体、列表、标题等格式来丰富文章内容。" 
         :maxCharCount="5000"
         @change="handleContent"
         @created="handleCreated"
         @destroyed="handleDestroyed"
         min-height="400px"
         />
      </el-form-item>
    </el-form>
    <div v-if="isPreview">
      <h3>内容预览</h3>
      <div v-html="formData.content"></div>
    </div>
    <template #footer>
      <el-button type="info" size="small" @click="isPreview = !isPreview">{{isPreview ? '隐藏预览' : '预览效果'}}</el-button>
      <el-button type="primary" size="small" @click="handleClose">取消</el-button>
      <el-button type="success" size="small" @click="handleSubmit" :loading="loading">{{isEdit?'编辑文章':'创建文章'}}</el-button>
    </template>
  </el-dialog>
    
</template>
<script setup>
import { ref, reactive,computed,defineEmits,nextTick,watch  } from 'vue'
import { ElMessage } from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { uploadFile,createArticle,updateArticle } from '@/api/admin'

const props = defineProps({
  article: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['update:visible','success'])

const formLabelWidth = '120px'

const commonTags = [
'情绪管理','焦虑','抑郁','压力','睡眠',
'冥想','正念','放松','心理健康','自我成长',
'人际关系','工作压力','学习方法','生活技巧'
]


const formRef = ref(null)
const formData = reactive({
    title: "",
    content: "",
    coverImage: "",
    categoryId: null,
    summary: "",
    tags: "",
    id: ""
})

const rules = reactive({
    title: [
      { required: true, message: '请输入文章标题', trigger: 'blur' },
      { min: 5, max: 200, message: '长度在 6 到 200 个字符', trigger: 'blur' }
    ],
    categoryId: [
      { required: true, message: '请选择分类', trigger: 'change' },
    ],
    content: [
      { required: true, message: '请输入文章内容', trigger: 'blur' },
    ]
})

const isPreview = ref(false)
const loading = ref(false)

// 提交表单
const handleSubmit = () => {
  console.log(formData)
  formRef.value.validate((valid, fields)=>{
    if(valid){
      const submitData = {
        ...formData,
        tags: formData.tagArray.join(',')
      }
      delete submitData.tagArray
      loading.value = true
      if(isEdit.value){
        updateArticle(props.article.id,submitData).then(data=>{ 
             ElMessage.success('文章更新成功')
        })

      }else{
        createArticle(submitData).then(data=>{
            ElMessage.success('文章创建成功')
        })
      }
      loading.value = false
      emits('success')
    }else{
      return false
    }
  })
  
}

//Set operation on key "visible" failed: target is readonly.
// 定义计算属性 dialogVisible，用于绑定 dialog 组件的 visible 属性
// dialogVisible.value  不能直接修改
const dialogVisible = computed({
  set(val){
    emits('update:visible',val)
  },
  get(){
    return props.visible
  }
})
// 是否编辑
const isEdit = computed(()=> !!props.article?.id)

// 监听文章变化，更新表单数据
watch(()=>props.article, (newVal, oldVal) => {
  if(newVal){
    nextTick(()=>{
      Object.assign(formData,newVal)
      // console.log('watch',formData)
      businessId.value = newVal.id
      // formData.tagArray = formData.tags.split(',')
      if(newVal.coverImage){
        imgUrl.value = import.meta.env.VITE_PROXY_TARGET + newVal.coverImage
      }
      
    })
  }
})

const handleClose = () => { 
  // 重置表单验证状态
  formRef.value.resetFields()
  // 关闭弹窗
  handleRemove()
  businessId.value = null
  formData.tagArray = []
  formData.content = ""
  emits('update:visible',false)
  handleDestroyed()

}

// 上传图片
const imgUrl = ref("")


const businessId = ref(null)

const httpRequest = async ({file}) => { 
  businessId.value = crypto.randomUUID()
  const fileRes = await uploadFile(file,{
    businessId:businessId.value
  })

  //图片组装
  imgUrl.value = import.meta.env.VITE_PROXY_TARGET +fileRes.filePath
  formData.coverImage = fileRes.filePath

}
const beforeUpload = (file)=>{

  //图片类型
  const isImage = file.type.startsWith('image/')
  //文件大小
  const isLt5M = file.size / 1024 / 1024 < 5

  if(!isImage){
    ElMessage.error('请上传封面图片，请选择图片文件')
    return false
  }

  if(!isLt5M){
    ElMessage.error('上传封面图片，图片大小不能超过5MB')
    return false
  }

  return true
}
const handleRemove = () => {
  imgUrl.value = ""
  formData.coverImage = ""
}
// 文章内容改变时，更新字数统计
const handleContent = (editor) => {
  // console.log(editor)
  formData.content = editor.html
}

// 文章内容创建时，更新字数统计
const editorInstance = ref(null)
const handleCreated = (editor) => {
  editorInstance.value = editor
  //编辑
  if(formData.content && editor){
    nextTick(()=>{
      // 等待 DOM 更新完成
      editor.setHtml(formData.content)
    })
  }
}
const handleDestroyed = (editor) => {
  editorInstance.value = null
}







</script>
<style scoped lang="scss">

// 穿透 el-upload 内部容器，强制列布局，确保「移除封面」在图片正下方
.cover-upload {
  :deep(.el-upload) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.cover-placeholder{
  width:200px;
  height:120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color:#8b949e;
  background:#f6f8fa;
}
.cover-img{
  width:200px;
  height:120px;
  display: block;
  object-fit: cover;
}

.cover-remove{
  width: 200px;
  margin-top: 8px;
  // text-align: center;
}

</style>