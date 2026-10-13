<template>
  <div class="container">
    <div class="title">
        <div class="back-home" @click="backHome">
            <el-icon> <Back /> </el-icon>
            <span>返回首页</span>
        </div>
        <div class="title-text">
            <h2>登录您的账户</h2>
            <p>请输入你的登录信息</p>
        </div>

    </div>
    <div class="form-container">
        <el-form :model="formData" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="用户名或邮箱" prop="username">
                <el-input v-model="formData.username" size="large" placeholder="请输入用户名或邮箱" clearable />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" size="large" type="password" placeholder="请输入密码" show-password clearable />
            </el-form-item>
            <!-- <el-row :gutter="24">
                <el-col :span="12">
                        <el-form-item label="记住密码" prop="remember" label-position="left">
                    <el-checkbox v-model="formData.remember" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-link type="primary"  href="#">忘记密码？</el-link>
                </el-col>
            </el-row> -->
            <el-button class="btn" type="primary" size="large" @click="submitForm(formRef)">登录</el-button>
        </el-form>
        <div class = "footer">
             <p>还没有账户？<router-link  to="/auth/register">马上注册</router-link></p>
        </div>
    </div>


  </div>
    
</template>
<script setup>
import { ref,reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'


const router = useRouter()
const userStore = useUserStore()



const formData = reactive({
    username: '',
    password: ''
})

const rules = ref({
    username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
        // 该字段为「用户名/邮箱」二选一：含 @ 按邮箱校验格式，否则校验用户名长度
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback()
                    return
                }
                const emailReg = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/
                if (value.includes('@')) {
                    if (!emailReg.test(value)) {
                        callback(new Error('邮箱格式不正确'))
                        return
                    }
                } else if (value.length < 5) {
                    callback(new Error('用户名长度不能少于 5 位'))
                    return
                }
                callback()
            },
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
    ]
})

const formRef = ref()

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      login(formData).then(data=>{
        //token 为空时，登录失败
        console.log(data)
        if(!data.token){
            return console.error('登录失败')
        }
        //登录成功，将token 和 userInfo 存储到本地存储中
        // localStorage.setItem('token',data.token)
        // localStorage.setItem('userInfo',JSON.stringify(data.userInfo))
        userStore.setToken(data.token, data.refreshToken || '', data.userInfo)
        //登录成功，跳转到首页
        if(data.userInfo.userType === 2){
            router.replace('/back/dashboard')
        }else{
            router.replace('/')
        }
        ElMessage.success('登录成功')
      })
    } else {
      console.log('error submit!', fields)
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