import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'
import { useUserStore } from '@/stores/user'

//1、定义路由表

//前台路由
const backendRoutes = [
  { 
    path: '/back',
    name: 'back',
    component: BackendLayout,
    redirect: '/back/dashboard',//重定向跳转到数据分析
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'DataAnalysis',
        },
      },
      {
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        },
      },
      {
        path: 'consultations',
        name: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        },
      },
      {
        path: 'emotional',
        name: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',
        },
      },
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
          title: '登录'
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/register.vue'),
        meta: {
          title: '注册'
        },
      },
    ]
  },
]

//后台路由
const frontendRoutes = [
  {
    path: '/',
    name: 'front',
    component: FrontendLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home.vue'),
        meta: {
          title: '首页',
        },
      },
      {
        path: 'consultation',
        name: 'consultation',
        component: () => import('@/views/consultation.vue'),
        meta: {
          title: '咨询记录',
        },
      },
      {
        path: 'diary',
        name: 'diary',
        component: () => import('@/views/diary.vue'),
        meta: {
          title: '情绪日志',
        },
      },
      {
        path: 'repository',
        name: 'repository',
        component: () => import('@/views/repository.vue'),
        meta: {
          title: '知识库',
        },
      },
      {
        path: 'repository/article/:id',
        name: 'article',
        component: () => import('@/views/article.vue'),
        props: true,
        meta: {
          title: '文章详情',
        },
      },
      
    ]
  },
  

  
]


//路由合并
const routes = [
  ...backendRoutes,
  ...frontendRoutes,
]


//2、创建路由器
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


//导航守卫 登录鉴权 未登录 跳回登录页
//1、返回 false：取消导航
//2、返回true，不返回：继续导航
//3、返回'路径'：跳转到指定页面
// return false
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  if(userStore.token){
      if(userStore.userInfo?.userType === 2){
        if(to.path.startsWith('/back')){
          //如果是访问后台页面，那么跳转到登录页
          return true
        }else{
          return '/back/dashboard'
        }
      }else if(userStore.userInfo?.userType === 1){
        //用户端账号只能访向前台路由
        if (to.path.startsWith('/back') || to.path.startsWith('/auth')){
          return '/'
        }
      }
  }else{
    if(to.path.startsWith('/back')){
      //如果是访问后台页面，那么跳转到登录页
      return '/auth/login'
    }
  }
  return true
})



export default router
