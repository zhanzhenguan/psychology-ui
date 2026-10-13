import http from '@/utils/request'


//注册
export const register = (data) => http.post('/user/add',data)

///psychological-chat/session/start
export const createSession = (data) => http.post('psychological-chat/session/start',data)
///psychological-chat/sessions
export const chatSessionList = (params) => http.get('/psychological-chat/sessions',{params})

////psychological-chat/sessions/{sessionId} get请求 获取聊天会话详情
export const deleteChatSession = (sessionId) => http.delete(`/psychological-chat/sessions/${sessionId}`)
///psychological-chat/sessions/{sessionId}/messages
export const getChatMessages = (sessionId) => http.get(`/psychological-chat/sessions/${sessionId}/messages`)

///psychological-chat/session/${sessionId}/emotion
export const getEmotions = (sessionId) => http.get(`/psychological-chat/session/${sessionId}/emotion`)

///emotion-diary
export const emotionDiary = (data) => http.post('/emotion-diary',data)

///knowledge/article/page
export const articlePage = (params) => http.get('/knowledge/article/page',{params})

///knowledge/article/{id} get请求 获取文章详情
export const articleDetail = (id) => http.get(`/knowledge/article/${id}`)

