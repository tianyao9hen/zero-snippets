<template>
  <section
    :ref="setSectionRef"
    class="result-list relative rounded-br-xl rounded-bl-xl px-3 w-full max-h-[379px]"
  >
    <div
      v-for="item in resultList"
      :ref="(el) => setItemRef(el, item.id)"
      :key="item.id"
      class="result-item rounded-md p-1 h-8 leading-6 flex items-center"
      :class="{
        active: item.id == selectId,
        focus: item.id == selectId && resultFlag
      }"
    >
      <div class="result-item-focus"></div>
      <div class="result-item-info truncate flex-1">
        <!-- 文章类型：使用 article 图标 -->
        <template v-if="item.typeId === 1">
          <img :src="iconMap.article.dUrl" class="item-type-icon" alt="文章" />
          <span
            class="item-title"
            v-html="highlightText(item.title, searchKeyword)"
          />
        </template>

        <!-- 网页类型：使用 web 图标或自定义图标 -->
        <template v-else>
          <img
            :src="item.icon || iconMap.web.dUrl"
            class="item-type-icon"
            alt="网页"
            @error="handleIconError"
          />
          <span
            class="item-title"
            v-html="highlightText(item.title, searchKeyword)"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useSelect from '@renderer/hooks/useSelect'
import { iconMap } from '@renderer/composables/iconUtils'

const snippetsStore = useSnippetsStore()
const { setItemRef, setSectionRef } = useSelect()

// 从 store 获取数据
const resultList = computed(() => snippetsStore.snippets.resultList)
const selectId = computed(() => snippetsStore.snippets.selectId)
const resultFlag = computed(() => snippetsStore.snippets.resultFlag)
const searchKeyword = computed(() => snippetsStore.snippets.search.trim())

/**
 * 处理图标加载错误
 * 当自定义图标加载失败时，回退到默认图标
 */
const handleIconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = iconMap.web.dUrl
}

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param text 原始文本
 * @returns 转义后的文本
 */
const escapeHtml = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 转义正则表达式特殊字符
 * @param string 原始字符串
 * @returns 转义后的字符串
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 高亮文本中的关键词
 * @param text 原始文本
 * @param keyword 搜索关键词
 * @returns 高亮后的 HTML 字符串
 */
const highlightText = (text: string, keyword: string): string => {
  if (!keyword || !text) return escapeHtml(text)

  const escapedKeyword = escapeRegExp(keyword)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>')
}
</script>

<style lang="scss" scoped></style>
