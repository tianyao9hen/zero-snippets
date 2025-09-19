<template>
  <main class="catelog-page">
    <section class="catelog box">
      <div class="box-title">文章目录</div>
      <div class="box-content catelog-content">
        <div class="catelog-content-box">
          <div
            class="box-item"
            :class="{ active: snippetsStore.content.selectArticleId === content.id }"
            v-for="content in contentList"
            :key="content.id"
            @click="choiceArticle(content.id)"
            @contextmenu="rightClickMenu($event, content.id)"
          >
            <span class="box-item-content">{{ content.title }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="article">
      <router-view :key="$route.fullPath" />
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * 文章目录组件
 */
import useSearch from '@renderer/hooks/useSearch'
import { h, onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import ContextMenu from '@imengyu/vue3-context-menu'
import { iconMap } from '@renderer/composables/iconUtils'

const deleteIcon = iconMap['delete']
const { getContentListByTypeIdAndCategoryId } = useSearch()
const route = useRoute()
const router = useRouter()
const snippetsStore = useSnippetsStore()
let contentList = ref<ContentEntity[]>([])

onMounted(() => {
  const { tid, cid, aid } = route.params as { tid: string; cid: string; aid: string }
  if (!aid) {
    snippetsStore.choiceArticle(0)
    router.push({
      name: 'article',
      params: {
        tid,
        cid,
        aid: 0
      },
      query: {
        t: Date.now()
      }
    })
  }else{
    contentList.value = getContentList(tid, cid)
  }
})

onBeforeRouteUpdate((to, _from, next) => {
  const { tid, cid, aid } = to.params as { tid: string; cid: string; aid: string }
  if (!aid) {
    snippetsStore.choiceArticle(0)
    router.push({
      name: 'article',
      params: {
        tid,
        cid,
        aid: 0
      },
      query: {
        t: Date.now()
      }
    })
  }else{
    contentList.value = getContentList(tid, cid)
  }
  next()
})

/**
 * 展示右键菜单
 * @param e 鼠标点击事件
 * @param aid 文章id
 */
function rightClickMenu(e: MouseEvent, aid: number) {
  e.preventDefault()
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: 'flat',
    items: getRightMenu(Number(aid))
  })
}

/**
 * 获取右键菜单列表
 */
function getRightMenu(aid: number) {
  return [
    {
      label: h(
        'div',
        {
          style: {
            fontSize: '12px',
            color: '#64748b'
          }
        },
        '删除'
      ),
      icon: h('img', {
        src: deleteIcon.url,
        style: {
          width: '12px',
          height: '12px'
        }
      }),
      onClick: () => {
        console.log('删除', aid)
      }
    }
  ]
}

/**
 * 获取文章列表
 * @param tid 类别id
 * @param cid 分类id
 */
function getContentList(tid: string, cid: string): ContentEntity[] {
  if (tid && cid) {
    return getContentListByTypeIdAndCategoryId(Number(tid), Number(cid))
  }
  return []
}

/**
 * 选择文章
 * @param aid 文章id
 */
function choiceArticle(aid: number) {
  snippetsStore.choiceArticle(aid)
  router.push({
    name: 'article',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid: snippetsStore.content.selectCategoryId,
      aid
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
