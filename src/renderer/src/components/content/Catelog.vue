<template>
  <main class="catelog-page">
    <section class="catelog">
      <div class="catelog-box box">
        <div class="box-title unselectable">文章目录</div>
        <div class="box-content catelog-content">
          <div class="catelog-content-box">
            <div
              class="box-item"
              :class="{ active: snippetsStore.content.selectArticleId === content.id }"
              v-for="content in contentList"
              :key="content.id"
              @click="choiceArticle(content)"
              @contextmenu="rightClickMenu($event, content.id)"
            >
              <span class="box-item-content unselectable">{{ content.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="content">
      <router-view :key="$route.fullPath" />
    </section>
    <section class="footer">
      <div
        class="footer-menu"
        :class="{ 'hover-edit': hoverFlag }"
        @mouseover="choiceAddButton(true)"
        @mouseout="choiceAddButton(false)"
        @click="addCatelog()"
      >
        <img :src="hoverFlag ? addIcon.url : addIcon.dUrl" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * 文章目录组件
 */
import useSearch from '@renderer/hooks/useSearch'
import useArticle from '@renderer/hooks/useArticle'
import { h, onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import ContextMenu from '@imengyu/vue3-context-menu'
import { iconMap } from '@renderer/composables/iconUtils'

const deleteIcon = iconMap['delete']
const addIcon = iconMap['add']
const { getContentListByTypeIdAndCategoryId } = useSearch()
const { removeArticle, addArticle } = useArticle()
const route = useRoute()
const router = useRouter()
const snippetsStore = useSnippetsStore()
let contentList = ref<ContentEntity[]>([])
let hoverFlag = ref(false)

onMounted(async () => {
  const { tid, cid, aid } = route.params as { tid: string; cid: string; aid: string }
  if (!aid) {
    snippetsStore.choiceArticle(null)
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
  } else {
    contentList.value = await getContentList(tid, cid)
  }
})

onBeforeRouteUpdate(async (to, _from, next) => {
  const { tid, cid, aid } = to.params as { tid: string; cid: string; aid: string }
  if (!aid) {
    snippetsStore.choiceArticle(null)
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
  } else {
    contentList.value = await getContentList(tid, cid)
  }
  next()
})

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
  refreshUrl(id, id)
}

/**
 * 鼠标移入移出
 * @param flag 鼠标状态flag。true: 移入 false: 移出
 */
function choiceAddButton(flag: boolean) {
  hoverFlag.value = flag
}

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
        removeArticle(aid)
        refreshUrl(aid)
      }
    }
  ]
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

/**
 * 获取文章列表
 * @param tid 类别id
 * @param cid 分类id
 */
async function getContentList(tid: string, cid: string): Promise<ContentEntity[]> {
  if (tid && cid) {
    return getContentListByTypeIdAndCategoryId(Number(tid), Number(cid))
  }
  return []
}

/**
 * 选择文章
 * @param aid 文章id
 */
function choiceArticle(content: ContentEntity) {
  snippetsStore.choiceArticle(content)
  router.push({
    name: 'article',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid: snippetsStore.content.selectCategoryId,
      aid: content.id
    },
    query: {
      t: Date.now()
    }
  })
}
</script>

<style scoped></style>
