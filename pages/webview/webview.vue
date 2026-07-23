<template>
  <web-view :src="url"></web-view>
</template>

<script setup lang="ts">
const url = ref<string>('')

onLoad((options ?: AnyObject) => {
  const urlParam = options?.['url'] as string
  url.value = urlParam ? decodeURIComponent(urlParam) : 'https://beian.miit.gov.cn'
})
</script>
