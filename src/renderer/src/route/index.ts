import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Snippets from "@renderer/pages/Snippets.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/snippets'
  },{
    path: '/snippets',
    component: Snippets
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
