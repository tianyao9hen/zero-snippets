<template>
  <main class="category-list box">
    <section class="box-title">类别目录</section>
    <section class="category-list-content box-content" ref="categoryListRef">
      <template v-for="category in categoryList" :key="category.id">
        <div
          v-show="category.id !== snippetsStore.content.updateCategoryId"
          class="category-item box-item"
          :class="{ active: snippetsStore.content.selectCategoryId === category.id }"
          :ref="(el) => setItemRef(category.id, el)"
          @click="choiceCategory(category.id)"
          @dblclick="startUpdateCategory(category.id)"
          @contextmenu="rightClickMenu($event, category.id)"
        >
          <!-- 展示普通按钮 -->
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
        <!-- 展示更新输入框 -->
        <div
          v-show="category.id === snippetsStore.content.updateCategoryId"
          class="h-[30px] w-full px-2">
          <input
            type="text"
            class="w-full h-full rounded-md px-2 border outline-none"
            :ref="(el) => setItemInputRef(category.id, el)"
            v-model="category.title"
            spellcheck="false"
            @keydown="updateCategory($event, category.id, category.title)"
          />
        </div>
      </template>
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
let itemInputListRef = ref<Map<number, HTMLInputElement>>(new Map())

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
  if (cid) {
    const itemRef = itemListRef.value.get(Number(cid))
    if (itemRef) {
      categoryListRef.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
    }
  }
})

/**
 * 监听路由参数cid的变化，当变化时需要重新获取类别列表
 */
watch(
  () => route.params.cid,
  async (newCId) => {
    categoryList.value = await getAllCategoryList()
    snippetsStore.updateCategoryEnd()
    if (newCId) {
      itemListRef = ref<Map<number, HTMLDivElement>>(new Map())
      snippetsStore.choiceCategory(Number(newCId))
      //等待DOM渲染
      await nextTick(() => {
        const itemRef = itemListRef.value.get(Number(newCId))
        if (itemRef) {
          categoryListRef.value?.scrollTo(0, itemRef.offsetTop - itemRef.offsetHeight * 5)
        }
      })
    }
  }
)

/**
 * 保存类别的DOM元素Map
 * @param itemId 类别id
 * @param el 类被元素
 */
function setItemRef(itemId: number, el) {
  if (el) {
    itemListRef.value.set(itemId, el)
  }
}

/**
 * 保存类别的输入框DOM元素Map
 * @param itemId 类别id
 * @param el 输入框元素
 */
function setItemInputRef(itemId: number, el){
  if(el){
    itemInputListRef.value.set(itemId, el)
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
 * 开始更新类别
 * @param cid 类别id
 */
async function startUpdateCategory(cid: number) {
  snippetsStore.updateCategoryStart(cid)
  await nextTick()
  itemInputListRef.value.get(cid)?.focus()
}
/**
 * 更新类别
 * @param cid 类别id
 * @param title 类别名称
 */
async function updateCategory(e: KeyboardEvent, cid: number, title: string | null) {
  if (e.key === 'Enter') {
    console.log('更新类别', cid, title)
    // TODO 更新类别
    if(title == null || title.trim() === ''){
      return
    }
    await window.api.editCategory(cid, title)
    snippetsStore.updateCategoryEnd()
    router.push({
      name: 'catelog',
      params: {
        tid: snippetsStore.content.selectTypeId,
        cid,
      },
      query: {
        t: Date.now()
      }
    })
  }
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
 * @param cid 类别id
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
      onClick: async () => {
        await window.api.removeCategory(cid)
        console.log('删除', cid)
        categoryList.value = await getAllCategoryList()
      }
    }
  ]
}
</script>

<style scoped></style>
