import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

// 主窗口入口与常用页面直接导入，保证首屏速度
import Snippets from '@renderer/pages/Snippets.vue'
import Content from '@renderer/pages/Content.vue'
import CommandLog from '@renderer/pages/CommandLog.vue'
import NoteInput from '@renderer/pages/NoteInput.vue'
// 子页面按需懒加载，减小初始 bundle（含 bytemd、antd 等重型组件）
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/snippets'
  },
  {
    path: '/note-input',
    name: 'note-input',
    component: NoteInput
  },
  {
    path: '/snippets',
    name: 'snippets',
    component: Snippets
  },
  {
    path: '/command-log',
    name: 'command-log',
    component: CommandLog
  },
  {
    path: '/content/:tid?',
    name: 'content',
    component: Content,
    children: [
      {
        path: 'category/:cid?',
        name: 'category',
        component: () => import('@renderer/components/content/Category.vue'),
        children: [
          {
            path: 'catelog/:aid?',
            name: 'catelog',
            component: () => import('@renderer/components/content/Catelog.vue'),
            children: [
              {
                path: 'article',
                name: 'article',
                component: () => import('@renderer/components/content/Article.vue')
              }
            ]
          }
        ]
      },
      {
        path: 'web/:cid?',
        name: 'web',
        component: () => import('@renderer/components/content/Web.vue'),
        children: [
          {
            path: 'folder',
            name: 'folder',
            component: () => import('@renderer/components/content/Folder.vue')
          }
        ]
      },
      {
        path: 'note',
        name: 'note',
        component: () => import('@renderer/components/content/NoteList.vue')
      },
      {
        path: 'software',
        name: 'software',
        component: () => import('@renderer/components/content/Software.vue')
      },
      {
        path: 'command',
        name: 'command',
        component: () => import('@renderer/components/content/Command.vue')
      },
      {
        path: 'setting',
        name: 'setting',
        component: () => import('@renderer/components/content/Setting.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
