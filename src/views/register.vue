<template>
  <div class="container">
    <div class="title">
        <!-- <div class="back-home" @click="backHome">
            <el-icon> <Back /> </el-icon>
            <span>返回首页</span>
        </div> -->
        <div class="title-text">
            <h2>创建您的账户</h2>
            <p>请填写注册信息</p>
        </div>
    </div>
    <div class="form-container">
      <el-form :model="formData" :rules="rules" ref="formRef" label-position="top"> 
        <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户名"  clearable/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
            <el-autocomplete
              v-model="formData.email"
              :fetch-suggestions="querySearch"
              placeholder="请输入邮箱"
              fit-input-width
              style="width: 100%"
              clearable
            />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入昵称(可选)" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号(可选)" clearable/>
        </el-form-item>
        <!-- <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
                <el-radio label="0">男</el-radio>
                <el-radio label="1">女</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
            <el-radio-group v-model="formData.userType">
                <el-radio label="1" disabled checked>普通用户</el-radio>
                <el-radio label="2" disabled >管理员</el-radio>
            </el-radio-group>
        </el-form-item> -->
        <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="请输入密码" clearable show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" clearable show-password/>
        </el-form-item>
         <el-button class="btn" type="primary" size="large" @click="submitForm(formRef)">注册</el-button>
      </el-form>
      <div class = "footer">
             <p>已经有账户？<router-link  to="/auth/login">马上登录</router-link></p>
        </div>
    </div>
  </div>
    
</template>
<script setup>
import { useRouter } from 'vue-router'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import { ref,reactive } from 'vue'



const router = useRouter()

const formData = reactive({
    username: "",
    email: "",
    nickname: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: 0,
    userType: 1
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, message: '用户名长度不能少于 5 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
        validator: (rule, value, callback) => {
            if (!value) {
                callback()
                return
            }
            const emailReg = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/
            if (!emailReg.test(value)) {
                callback(new Error('邮箱格式不正确'))
                return
            }
            callback()
        },
        trigger: 'change'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
    {
      // 密码需要一致
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
})

const formRef = ref()

// 常用邮箱后缀，输入时自动补全，无需手打 @xxx.com
const EMAIL_SUFFIXES = ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com',
  'hotmail.com', 'sina.com', 'sohu.com', 'foxmail.com', 'yahoo.com']

// el-autocomplete 建议源：未输入 @ 时补全全部后缀；已输入 @ 时按 @ 后内容过滤后缀
const querySearch = (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }
  const atIndex = queryString.indexOf('@')
  const prefix = atIndex === -1 ? queryString : queryString.slice(0, atIndex)
  const suffixPart = atIndex === -1 ? '' : queryString.slice(atIndex + 1).toLowerCase()
  const result = EMAIL_SUFFIXES
    .filter(suffix => !suffixPart || suffix.startsWith(suffixPart))
    .map(suffix => ({ value: `${prefix}@${suffix}` }))
  cb(result)
}


// 注册
const submitForm = async (formEl) => {
  if (!formEl) return
    await formEl.validate((valid,fields) => {
        if (valid) {
            register(formData).then(() => {
              ElMessage.success('注册成功')
              router.push('/auth/login')
            })
        } else {
            ElMessage.error('请填写完整信息',fields)
        }
    })
}


const backHome = () => {
    router.push('/')
}


</script>
<style scoped lang="scss">
.container{
    width: 384px;
    .title {
        .back-home{
            margin-bottom:60px;

            &:hover{
                color: #007bff;
            }
        }
    .title-text{
        text-align: center;
        h2{
            font-size: 36px;
            margin-bottom:10px;
        }
        p{
            font-size: 18px;
            color: #6b7280;
        }
    }
    }
    .form-container{
        margin-top: 30px;
        .btn{
            width: 100%;
            margin-top: 40px;
        }
        .footer{
            padding: 30px;
            text-align: center;
        }
    }
}
</style>