import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Snippets from "@renderer/pages/Snippets.vue";
import Content from "@renderer/pages/Content.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/snippets'
  },{
    path: '/snippets',
    name: 'snippets',
    component: Snippets
  },{
    path: '/content',
    name: 'content',
    component: Content
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
