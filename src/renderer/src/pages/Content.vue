<template>
  <main class="content-page">
    <div class="content-type">
      <router-link
        v-for="item in typeList"
        :key="item.id"
        :to="{ name: item.name, params: { tid: item.id } }"
        class="content-type-item unselectable"
        :class="{ active: snippetsStore.content.selectTypeId === item.id }"
        @click="choiceType(item.id)"
      >
        {{ item.title }}
      </router-link>
      <router-link
        :to="{ name: 'setting', params: { tid: -1 } }"
        class="content-type-item unselectable"
        :class="{ active: snippetsStore.content.selectTypeId === -1 }"
        @click="choiceType(-1)"
      >
        <img
          class="w-3 h-3 inline-block align-middle mr-1"
          :src="snippetsStore.content.selectTypeId === -1 ? settingIcon.url : settingIcon.dUrl"
        />
        设 置
      </router-link>
    </div>
    <div class="content-content">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
import { iconMap } from '@renderer/composables/iconUtils'
import useType from '@renderer/hooks/useType'
import { useSnippetsStore } from '@renderer/store/snippetsStore'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const settingIcon = iconMap['setting']

const route = useRoute()
const router = useRouter()
const snippetsStore = useSnippetsStore()
const { getAllTypeList } = useType()
const typeList = ref<TypeEntity[]>([])

onMounted(async () => {
  typeList.value = await getAllTypeList()
  if (typeList.value.length > 0) {
    if (route.params.tid) {
      let typeId = typeList.value[0].id
      if (route.params.tid) {
        typeId = Number(route.params.tid)
      }
      choiceType(typeId)
    } else {
      choiceType(typeList.value[0].id)
      router.push({
        name: typeList.value[0].name,
        params: {
          tid: typeList.value[0].id
        },
        query: {
          t: Date.now()
        }
      })
    }
  }
})

function choiceType(tid: number) {
  snippetsStore.setContentTypeId(tid)
}
</script>

<style scoped></style>
