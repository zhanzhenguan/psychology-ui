import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authRefresh } from '@/api/auth'

export const useUserStore = defineStore('user', () => {

     // 登录token
    const token = ref(localStorage.getItem('token') || '')
    const refreshToken = ref(localStorage.getItem('refreshToken') || '')
    const userInfo = ref((() => {
        const info = localStorage.getItem('userInfo')
        if (!info) return {}
        try {
          return JSON.parse(info)
        } catch {
          return {}
        }
      })())


  // 设置token
  const setToken = (newToken, newRefreshToken, newUserInfo) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      localStorage.setItem('refreshToken', newRefreshToken)
    }
    if (newUserInfo) {
      userInfo.value = newUserInfo
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  }

  // 刷新token
  const refreshTokenFn = async () => {
    const res = await authRefresh({
      refreshToken: refreshToken.value
    })
    setToken(res.accessToken, res.refreshToken)
    return res.accessToken
  }

  return { token, userInfo, refreshToken, 
    setToken, logout, 
    refreshToken: refreshTokenFn }
})