<template>
  <view class="site-footer">
    <view class="footer-brand">
      <text class="footer-logo">花月诗境</text>
      <text class="footer-tagline">月令花神，一境入诗</text>
    </view>
    <view class="footer-meta">
      <text class="footer-label">创作团队</text>
      <text class="footer-authors">谭书宏 · 刘思冉</text>
      <text class="footer-project">《花月诗境：十二花神诗词智能导览系统》</text>
    </view>
    <view class="footer-legal">
      <text class="footer-copyright">© 2026 Mistiness. All rights reserved.</text>
      <text class="footer-icp" @click="openICP">湘ICP备2026021754号-2</text>
    </view>
  </view>
</template>

<script setup lang="ts">
function openICP() {
  // #ifdef H5
  window.open('https://beian.miit.gov.cn', '_blank')
  // #endif
  // #ifndef H5
  uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent('https://beian.miit.gov.cn')}` })
  // #endif
}
</script>

<style>
.site-footer{margin-top:72px;padding:38px 2px 26px;border-top:1px solid #d7e3de;display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:40px;align-items:start}.footer-brand,.footer-meta,.footer-legal{gap:7px}.footer-logo{color:#183f34;font:25px 'STKaiti','KaiTi',serif;letter-spacing:4px}.footer-tagline,.footer-label,.footer-project,.footer-copyright{color:#84968f;font-size:11px;line-height:1.7}.footer-label{letter-spacing:2px}.footer-authors{color:#45665c;font-size:14px}.footer-legal{align-items:flex-end;text-align:right}.footer-icp{color:#597a70;font-size:11px;text-decoration:underline;cursor:pointer}@media(max-width:700px){.site-footer{grid-template-columns:1fr;gap:24px}.footer-legal{align-items:flex-start;text-align:left}}
</style>
