<template>
  <main class="blank-page">
    <section class="blank-box">
      <img :src="addArticleIcon.url" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { iconMap } from '@renderer/composables/iconUtils'

const addArticleIcon = iconMap['addArticle']
</script>
