# 页面页脚添加指南

所有主要页面需要在底部添加统一的页脚，包含：
1. 作者信息：谭书宏，刘思冉
2. 备案号：湘ICP备2026021754号-2（可点击跳转）
3. 版权信息：© 2026 花月诗境 · www.mistiness.tshai.top

## 需要添加页脚的页面

- pages/index/index.uvue ✓（首页）
- pages/month/month.uvue ✓
- pages/keyword/keyword.uvue ✓
- pages/dynasty/dynasty.uvue ✓
- pages/podcast/podcast.uvue ✓
- pages/auth/auth.uvue ✓
- pages/profile/profile.uvue ✓（已有备案信息）

## 添加步骤

### 1. 在 `<template>` 底部（`</scroll-view>` 前）添加：

```vue
    <!-- Footer -->
    <view class="page-footer">
      <text class="footer-text">作者：谭书宏，刘思冉</text>
      <text class="footer-icp" @click="openICP">湘ICP备2026021754号-2</text>
      <text class="footer-copy">© 2026 花月诗境 · www.mistiness.tshai.top</text>
    </view>
```

### 2. 在 `<script>` 中添加函数（如果还没有）：

```typescript
function openICP() {
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent('https://beian.miit.gov.cn')}`
  })
}
```

### 3. 在 `<style>` 末尾添加样式：

```css
.page-footer {
  padding: 48rpx 28rpx 20rpx;
  align-items: center;
  gap: 12rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
}

.footer-icp {
  font-size: 22rpx;
  color: #2563eb;
  text-decoration: underline;
  text-align: center;
}

.footer-copy {
  font-size: 20rpx;
  color: #94a3b8;
  text-align: center;
}
```

## 完整示例

参考 `pages/profile/profile.uvue` 的"关于"部分，已经包含了类似的备案信息展示。

## 注意事项

- profile 页面已有备案信息，无需重复添加
- 确保 webview 页面路由已配置（已完成）
- 页脚应该在所有内容的最底部，但在 `</scroll-view>` 之前
