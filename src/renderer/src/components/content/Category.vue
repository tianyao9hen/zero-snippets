<template>
  <main class="category-page">
    <section class="category-box">
      <quick-nav/>
      <category-list/>
      <footer-menu/>
    </section>
    <section class="category-content">

    </section>
  </main>
</template>

<script setup lang="ts">
import QuickNav from '@renderer/components/content/category/QuickNav.vue';
import FooterMenu from '@renderer/components/content/category/FooterMenu.vue';
import CategoryList from '@renderer/components/content/category/CategoryList.vue';

</script>

<style scoped>

</style>
