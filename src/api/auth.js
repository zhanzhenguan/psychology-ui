import http from '@/utils/request'

export const authRefresh = (data)=> http.post('/auth/refresh', data)