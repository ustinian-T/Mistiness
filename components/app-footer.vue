<template>
  <view class="footer">
    <view class="footer-links">
      <text class="footer-link" @click="openICP">湘ICP备2026021754号-2</text>
    </view>
    <text class="footer-text">作者：谭书宏，刘思冉</text>
    <text class="footer-text copyright">© 2026 花月诗境 · Mistiness</text>
  </view>
</template>

<script setup lang="ts">
function openICP() {
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent('https://beian.miit.gov.cn')}`
  })
}
</script>

<style>
.footer {
  padding: 48rpx 28rpx 40rpx;
  align-items: center;
  gap: 12rpx;
  background-color: transparent;
}

.footer-links {
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.footer-link {
  font-size: 22rpx;
  color: #2563eb;
  text-decoration: underline;
}

.footer-text {
  font-size: 22rpx;
  color: #94a3b8;
  text-align: center;
  line-height: 1.6;
}

.copyright {
  font-size: 20rpx;
  color: #cbd5e1;
}
</style>
