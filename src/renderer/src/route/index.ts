import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Snippets from "@renderer/pages/Snippets.vue";
import Content from "@renderer/pages/Content.vue";
import Category from "@renderer/components/content/Category.vue";
import Web from "@renderer/components/content/Web.vue";
import NativeApp from "@renderer/components/content/NativeApp.vue";
import Catelog from "@renderer/components/content/Catelog.vue";
import Article from "@renderer/components/content/Article.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/snippets'
  },{
    path: '/snippets',
    name: 'snippets',
    component: Snippets
  },{
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
      },{
        path: 'web',
        name: 'web',
        component: Web
      },{
        path: 'native-app',
        name: 'nativeApp',
        component: NativeApp
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
