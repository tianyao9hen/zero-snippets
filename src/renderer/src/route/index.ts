import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Snippets from '@renderer/pages/Snippets.vue'
import Content from '@renderer/pages/Content.vue'
import Category from '@renderer/components/content/Category.vue'
import Web from '@renderer/components/content/Web.vue'
import Software from '@renderer/components/content/Software.vue'
import Catelog from '@renderer/components/content/Catelog.vue'
import Article from '@renderer/components/content/Article.vue'
import Folder from '@renderer/components/content/Folder.vue'
import Setting from '@renderer/components/content/Setting.vue'
import NoteInput from '@renderer/pages/NoteInput.vue'
import NoteList from '@renderer/components/content/NoteList.vue'

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
    path: '/content/:tid?',
    name: 'content',
    component: Content,
    children: [
      {
        path: 'category/:cid?',
        name: 'category',
        component: Category,
        children: [
          {
            path: 'catelog/:aid?',
            name: 'catelog',
            component: Catelog,
            children: [
              {
                path: 'article',
                name: 'article',
                component: Article
              }
            ]
          }
        ]
      },
      {
        path: 'web/:cid?',
        name: 'web',
        component: Web,
        children: [
          {
            path: 'folder',
            name: 'folder',
            component: Folder
          }
        ]
      },
      {
        path: 'note',
        name: 'note',
        component: NoteList
      },
      {
        path: 'software',
        name: 'software',
        component: Software
      },
      {
        path: 'setting',
        name: 'setting',
        component: Setting
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
