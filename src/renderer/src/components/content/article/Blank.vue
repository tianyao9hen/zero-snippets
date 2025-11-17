<template>
  <main class="blank-page">
    <section class="blank-box" @click="addCatelog()">
      <img :src="addArticleIcon.url" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { iconMap } from '@renderer/composables/iconUtils'
import { useRoute, useRouter } from 'vue-router'
import useArticle from '@renderer/hooks/useArticle'

const addArticleIcon = iconMap['addArticle']
const route = useRoute()
const router = useRouter()
const { addArticle } = useArticle()

/**
 * 新增文章
 */
async function addCatelog() {
  const { tid, cid } = route.params as { tid: string; cid: string }
  const typeId = Number(tid)
  let categoryId = Number(cid)
  if(!categoryId) {
    categoryId = -1
  }
  const id = await addArticle({
    typeId,
    categoryId,
    title: '新建文章',
    content: ''
  } as ContentEntity)
  console.log('新增文章', id)
  refreshUrl(id, id)
}

/**
 * 刷新页面
 * @param updAid 进行了调整的文章id
 */
function refreshUrl(updAid: number, toAid?: number) {
  const { tid, cid, aid } = route.params as { tid: string; cid: string; aid: string }
  if (toAid) {
    router.push({
      name: 'article',
      params: {
        tid,
        cid,
        aid: toAid
      },
      query: {
        t: Date.now()
      }
    })
  }else if (aid && updAid !== Number(aid)) {
    router.push({
      name: 'article',
      params: {
        tid,
        cid,
        aid
      },
      query: {
        t: Date.now()
      }
    })
  } else {
    router.push({
      name: 'catelog',
      params: {
        tid,
        cid
      },
      query: {
        t: Date.now()
      }
    })
  }
}
</script>
