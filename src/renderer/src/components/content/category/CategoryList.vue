<template>
  <main class="category-list box">
    <section class="box-title">类别目录</section>
    <section class="category-list-content box-content" ref="categoryListRef">
      <div
        class="category-item box-item"
        :class="{ active: snippetsStore.content.selectCategoryId === category.id }"
        v-for="category in categoryList"
        :key="category.id"
        :ref="(el) => setItemRef(category.id, el)"
        @click="choiceCategory(category.id)"
        @contextmenu="rightClickMenu($event, category.id)"
      >
        <img
          :src="
            snippetsStore.content.selectCategoryId === category.id
              ? folderIcon.url
              : folderIcon.dUrl
          "
        />
        <span class="box-item-content">
          {{ category.title }}
        </span>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
// 类别列表
import useCategory from '@renderer/hooks/useCategory'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { iconMap } from '@renderer/composables/iconUtils'
import { h, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContextMenu from '@imengyu/vue3-context-menu'

const categoryListRef = ref<HTMLDivElement>()
let itemListRef = ref<Map<number, HTMLDivElement>>(new Map())

const folderIcon = iconMap['folder']
const deleteIcon = iconMap['delete']
const snippetsStore = useSnippetsStore()
const { getAllCategoryList } = useCategory()
const categoryList = ref<CategoryEntity[]>([])
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  categoryList.value = await getAllCategoryList()
  // 初始化时若有cid参数，则滚动到指定类别
  const cid = route.params.cid
  if(cid){
    const itemRef = itemListRef.value.get(Number(cid))
    if(itemRef){
      categoryListRef.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
    }
  }
})

/**
 * 监听路由参数cid的变化，当变化时需要重新获取类别列表
 */
watch(() => route.params.cid, async (newCId) => {
  categoryList.value = await getAllCategoryList()
  if(newCId){
    itemListRef = ref<Map<number, HTMLDivElement>>(new Map())
    snippetsStore.choiceCategory(Number(newCId))
    //等待DOM渲染
    await nextTick(() => {
      const itemRef = itemListRef.value.get(Number(newCId))
      if(itemRef){
        categoryListRef.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
      }
    })
  }
})

function setItemRef(itemId: number, el) {
  if (el) {
    itemListRef.value.set(itemId, el)
  }
}

/**
 * 点击类别，跳转目录列表
 * @param cid 类别id
 */
function choiceCategory(cid: number) {
  snippetsStore.choiceCategory(cid)
  console.log(`/content/${snippetsStore.content.selectTypeId}/category/${cid}/catelog`)
  router.push({
    name: 'catelog',
    params: {
      tid: snippetsStore.content.selectTypeId,
      cid
    },
    query: {
      t: Date.now()
    }
  })
}

/**
 * 展示右键菜单
 * @param e 鼠标点击事件
 * @param aid 文章id
 */
function rightClickMenu(e: MouseEvent, cid: number) {
  e.preventDefault()
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: 'flat',
    items: getRightMenu(Number(cid))
  })
}

/**
 * 获取右键菜单列表
 */
function getRightMenu(cid: number) {
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
        console.log('删除', cid)
      }
    }
  ]
}
</script>

<style scoped></style>
