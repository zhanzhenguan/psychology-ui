import axios from 'axios'
import { ElMessage,ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',// 后端接口基础路径
  timeout: Number(import.meta.env.VITE_TIMEOUT) || 30000,// 请求超时时间
  headers: { 'Content-Type': 'application/json' }
})


// ========== 防止重复 401 弹窗 ==========
let isRefreshing = false       // 是否正在刷新 token
let pendingQueue = []          // 刷新期间挂起的请求队列
let is401DialogShowing = false // 是否正在显示 401 弹窗

const clearToken = ()=>{
    // 清除 token 并跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    // router.push('/auth/login')
    window.location.href = '/auth/login'
}

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    
    const userStore = useUserStore()
    if (userStore.token) {
      // config.headers.Authorization = `Bearer ${userStore.token}`
      config.headers.token = userStore.token
      return config
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const {data,config} = response
    // 1. 直接返回 data（解包）
    // 如果后端统一格式 { code, data, message }，解包后只返回 data
    if(data && typeof data === 'object' && 'code' in data) {

      // 业务成功
      if (data.code === '200' || data.code === '0') {
        return data.data   // 直接返回业务数据
      }
      
      // 业务失败（code 非 0/200）
      const msg = data.message || data.msg || '接口请求异常，请联系管理员'
      ElMessage.error(msg)

      // 某些业务错误需要特殊处理
      if (data.code === '40101') {
        // 比如 token 过期但可以用 refreshToken 刷新
        return handleTokenRefresh(config)
      }

      return Promise.reject(new Error(msg))
    }

    // 非标准格式，直接返回
    return data
  },
  async (error) => {

    const { response, config } = error
    // 网络错误（无 response）
    if (!response) {
      ElMessage.error('网络连接失败，请检查网络')
      return Promise.reject(error)
    }

    const { status, data } = response
    const msg = data?.message || data?.msg || error.message

    switch (status) {
      case 400:
        ElMessage.error(msg || '请求参数错误')
        break

      case 401:
        // 防止多个请求同时 401 弹出多个登录框
        if (!is401DialogShowing) {
          is401DialogShowing = true
          await ElMessageBox.confirm(
            '登录已过期，请重新登录',
            '提示',
            { confirmButtonText: '去登录', cancelButtonText: '取消', type: 'warning' }
          ).then(() => {
            const userStore = useUserStore()
            userStore.logout()
            window.location.href = '/auth/login'
          }).catch(() => {
            // 用户取消
          }).finally(() => {
            is401DialogShowing = false
          })
        }
        break

      case 403:
        ElMessage.error('无权限访问')
        break

      case 404:
        ElMessage.error(`接口不存在: ${config.url}`)
        break

      case 422:
        // 表单校验错误，通常返回字段级错误信息
        handleValidationError(data)
        break

      case 429:
        ElMessage.error('请求过于频繁，请稍后再试')
        break

      case 500:
        ElMessage.error('服务器内部错误')
        console.error('[API 500 Error]', data)
        break

      case 502:
      case 503:
      case 504:
        ElMessage.error('服务暂时不可用，请稍后重试')
        break

      default:
        ElMessage.error(msg || '请求失败')
    }

    return Promise.reject(error)
  }
)

// ========== Token 刷新处理 ==========
function handleTokenRefresh(originalConfig) {
  if (!isRefreshing) {
    isRefreshing = true

    return new Promise((resolve, reject) => {
      const userStore = useUserStore()
      userStore.refreshToken()
        .then((newToken) => {
          // 刷新成功，重放队列中的请求
          pendingQueue.forEach(({ resolve: res }) =>
            res(request(originalConfig))
          )
          pendingQueue = []
          resolve(request(originalConfig))
        })
        .catch(() => {
          // 刷新失败，清空队列
          pendingQueue.forEach(({ reject: rej }) => rej(error))
          pendingQueue = []
          // 跳登录
          userStore.logout()
          window.location.href = '/auth/login'
        })
        .finally(() => {
          isRefreshing = false
        })
    })
  } else {
    // 正在刷新中，将请求加入队列
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: () => resolve(request(originalConfig)),
        reject
      })
    })
  }
}

// ========== 表单校验错误处理 ==========
function handleValidationError(data) {
  // 后端返回格式: { errors: [{ field: 'username', message: '不能为空' }] }
  const errors = data?.errors || data?.detail || []
  if (Array.isArray(errors) && errors.length) {
    errors.forEach(err => {
      ElMessage.error(`${err.field}: ${err.message}`)
    })
  } else {
    ElMessage.error(data?.message || '数据校验失败')
  }
}


export default http
