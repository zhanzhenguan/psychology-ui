import http from '@/utils/request'

// 登录
export const login = (data) => http.post('/user/login',data)



//退出
export const logout = () => http.post('/user/logout')




//获取分类
export const categoryTree = () => http.get('/knowledge/category/tree')
//知识文章列表
export const articlePage = (params) => http.get('/knowledge/article/page',{params})


//文件上传
export const uploadFile = (file,businessInfo) => {
    const formData = new FormData()

    formData.append('file',file)
    formData.append('businessType','ARTICLE')
    formData.append('businessId',businessInfo.businessId)
    formData.append('businessField','cover')

    return http.post('/file/upload',formData,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    })
}

// 创建文章
export const createArticle = (data) => http.post('/knowledge/article',data)

///knowledge/article/{id}
// 获取文章详情
export const getArticleDetail = (id) => http.get(`/knowledge/article/${id}`)


///knowledge/article/{id} put请求 更新文章
export const updateArticle = (id,data) => http.put(`/knowledge/article/${id}`,data)

///knowledge/article/{id} delete请求 删除文章
export const deleteArticle = (id) => http.delete(`/knowledge/article/${id}`)

///knowledge/article/{id}/status put请求 更新文章状态
export const updateArticleStatus = (id,data) => http.put(`/knowledge/article/${id}/status`,data)

///psychological-chat/sessions get请求 获取聊天会话列表
export const chatSessionsPage = (params) => http.get('/psychological-chat/sessions',{params})

///psychological-chat/sessions/{sessionId}/messages get请求 获取聊天会话消息列表
export const getChatMessages = (sessionId) => http.get(`/psychological-chat/sessions/${sessionId}/messages`)

///emotion-diary/admin/page get请求 获取情绪日志列表
export const emotionDiaryPage = (params) => http.get('/emotion-diary/admin/page',{params})

///emotion-diary/admin/{id} delete请求 删除情绪日志
export const deleteEmotionDiary = (id) => http.delete(`/emotion-diary/admin/${id}`)

///data-analytics/overview get请求 获取数据分析概览
export const getAnalyticsOverview = () => http.get('/data-analytics/overview')


