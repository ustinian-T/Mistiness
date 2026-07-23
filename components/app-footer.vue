<template>
  <view class="footer">
    <view class="footer-links">
      <text class="footer-link" @click="openICP">婀業CP澶?026021754鍙?2</text>
    </view>
    <text class="footer-text">浣滆€咃細璋功瀹忥紝鍒樻€濆唹</text>
    <text class="footer-text copyright">漏 2026 鑺辨湀璇楀 路 Mistiness</text>
  </view>
</template>

<script setup lang="uts">
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

