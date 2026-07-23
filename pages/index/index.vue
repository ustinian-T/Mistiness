<template>
  <scroll-view class="page-bg" scroll-y>

    <!-- Hero Banner -->
    <view class="hero-card">
      <text class="hero-title">花月诗境</text>
      <text class="hero-sub">月令花神，一境入诗</text>
      <text class="hero-desc">漫游十二花神，查询诗词意象</text>
    </view>

    <!-- Stats Row -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-value">12</text>
        <text class="stat-label">月令花神</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">31</text>
        <text class="stat-label">意象词汇</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">6</text>
        <text class="stat-label">历史朝代</text>
      </view>
    </view>

    <!-- Month Grid Title -->
    <view class="section-header">
      <text class="section-title">十二花神月历</text>
    </view>

    <!-- Month Grid -->
    <view class="month-grid">
      <view
        v-for="item in flowers"
        :key="item.month"
        class="month-tile"
        :style="'border-left: 4rpx solid ' + monthColor(item.month)"
        @click="goMonth(item.month)"
      >
        <view class="tile-left">
          <text class="tile-month-num">{{ String(item.month).padStart(2,'0') }}</text>
          <text class="tile-month-name">{{ item.monthName }}</text>
          <text class="tile-flower">{{ item.flower }}</text>
          <text class="tile-meta">{{ item.godName }} · {{ item.dynasty }}</text>
        </view>
        <view class="tile-dot" :style="'background:' + monthColor(item.month)">
          <text class="tile-dot-text">{{ item.flower.slice(0,1) }}</text>
        </view>
      </view>
    </view>

    <!-- Feature Cards -->
    <view class="section-header">
      <text class="section-title">功能导览</text>
    </view>
    <view class="feature-grid">
      <view class="feature-card" @click="goPage('/pages/month/month')">
        <text class="feature-icon">🌸</text>
        <text class="feature-name">按月导览</text>
        <text class="feature-desc">花神·诗句·意象</text>
      </view>
      <view class="feature-card" @click="goPage('/pages/keyword/keyword')">
        <text class="feature-icon">🔍</text>
        <text class="feature-name">意象匹配</text>
        <text class="feature-desc">关键词查花卉</text>
      </view>
      <view class="feature-card" @click="goPage('/pages/dynasty/dynasty')">
        <text class="feature-icon">📊</text>
        <text class="feature-name">朝代统计</text>
        <text class="feature-desc">时代文脉分布</text>
      </view>
      <view class="feature-card" @click="goPage('/pages/podcast/podcast')">
        <text class="feature-icon">🎙️</text>
        <text class="feature-name">花月播客</text>
        <text class="feature-desc">生成诗境文案</text>
      </view>
      <view class="feature-card" @click="goPage('/pages/profile/profile')">
        <text class="feature-icon">👤</text>
        <text class="feature-name">个人中心</text>
        <text class="feature-desc">登录注册与 AI 配置</text>
      </view>
    </view>

    <view style="height: 40rpx;"></view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FLOWERS, MONTH_COLORS, type FlowerItem } from '../../utils/flowerData'

const flowers = ref<FlowerItem[]>(FLOWERS)

function monthColor(month : number) : string {
  return MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length]
}

function goMonth(month : number) {
  uni.setStorageSync('selected_month', month)
  uni.switchTab({ url: '/pages/month/month' })
}

function goPage(path : string) {
  const tabPages = ['/pages/month/month', '/pages/keyword/keyword', '/pages/dynasty/dynasty', '/pages/podcast/podcast']
  if (tabPages.includes(path)) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url: path })
  }
}
</script>

<style>
.page-bg {
  min-height: 100vh;
  height: 100vh;
  flex: 1;
  background-color: #eef6fd;
}

.hero-card {
  margin: 30rpx 28rpx 0 28rpx;
  background-color: #2563eb;
  border-radius: 28rpx;
  padding: 48rpx 40rpx 44rpx;
  align-items: flex-start;
}

.hero-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 6rpx;
}

.hero-sub {
  font-size: 28rpx;
  color: rgba(255,255,255,0.85);
  margin-top: 10rpx;
}

.hero-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.65);
  margin-top: 8rpx;
}

.stats-row {
  flex-direction: row;
  margin: 24rpx 28rpx 0;
  gap: 16rpx;
}

.stat-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 16rpx;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(37,99,235,0.08);
}

.stat-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 8rpx;
}

.section-header {
  margin: 36rpx 28rpx 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e3a5f;
}

.month-grid {
  margin: 0 28rpx;
  gap: 16rpx;
}

.month-tile {
  background-color: #ffffff;
  border-radius: 18rpx;
  padding: 28rpx 28rpx 28rpx 24rpx;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.tile-left {
  flex: 1;
  gap: 6rpx;
}

.tile-month-num {
  font-size: 38rpx;
  font-weight: 700;
  color: #2563eb;
  line-height: 1.1;
}

.tile-month-name {
  font-size: 22rpx;
  color: #94a3b8;
}

.tile-flower {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e3a5f;
  margin-top: 4rpx;
}

.tile-meta {
  font-size: 22rpx;
  color: #64748b;
}

.tile-dot {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  align-items: center;
  justify-content: center;
}

.tile-dot-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.feature-grid {
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 28rpx;
  gap: 16rpx;
}

.feature-card {
  width: calc(50% - 8rpx);
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  align-items: flex-start;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.feature-icon {
  font-size: 44rpx;
}

.feature-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e3a5f;
  margin-top: 16rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 6rpx;
}
</style>
