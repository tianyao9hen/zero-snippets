import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Snippets from "@renderer/pages/Snippets.vue";
import Content from "@renderer/pages/Content.vue";
import Category from "@renderer/components/content/Category.vue";
import Web from "@renderer/components/content/Web.vue";
import NativeApp from "@renderer/components/content/NativeApp.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/snippets'
  },{
    path: '/snippets',
    name: 'snippets',
    component: Snippets
  },{
    path: '/content/:id?',
    name: 'content',
    component: Content,
    children: [
      {
        path: 'category',
        name: 'category',
        component: Category
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
