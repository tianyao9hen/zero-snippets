<template>
  <main class="content-page">
    <div class="content-type">
      <router-link
        :to="{ name: item.name }"
        class="content-type-item"
        :class="{ active: snippetsStore.content.selectTypeId === item.id }"
        v-for="item in typeList"
        :key="item.id"
        @click="choiceType(item.id)"
      >
        {{ item.title }}
      </router-link>
    </div>
    <div class="content-content">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
import useType from '@renderer/hooks/useType'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const snippetsStore = useSnippetsStore()
const { getAllTypeList } = useType()
let typeList = ref<ContentTypeType[]>([])

onMounted(() => {
  typeList.value = getAllTypeList()
  if (typeList.value.length > 0) {
    let typeId = typeList.value[0].id
    let typeActive = typeList.value[0]
    if (route.params.tid) {
      typeId = Number(route.params.tid)
      typeActive = typeList.value.filter((item) => {
        return item.id === typeId
      })[0]
    }
    choiceType(typeId)
  }
})

function choiceType(tid: number) {
  snippetsStore.setContentTypeId(tid)
  console.log("tid", tid)
}
</script>

<style scoped></style>
