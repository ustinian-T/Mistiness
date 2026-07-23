<template>
  <scroll-view class="page-bg" scroll-y>

    <!-- Month Selector -->
    <view class="selector-bar">
      <scroll-view scroll-x class="month-scroll">
        <view class="month-tab-row">
          <view
            v-for="item in flowers"
            :key="item.month"
            class="month-tab"
            :class="selectedMonth === item.month ? 'month-tab-active' : ''"
            :style="selectedMonth === item.month ? 'background:' + monthColor(item.month) : ''"
            @click="selectMonth(item.month)"
          >
            <text
              class="month-tab-text"
              :style="selectedMonth === item.month ? 'color:#fff' : 'color:#64748b'"
            >{{ item.month }}月</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Detail Card -->
    <view v-if="current != null" class="detail-wrap">

      <!-- Header -->
      <view class="detail-header" :style="'border-top: 6rpx solid ' + monthColor(selectedMonth)">
        <view class="detail-header-left">
          <text class="detail-month-name">{{ current.monthName }}</text>
          <text class="detail-flower">{{ current.flower }}</text>
          <view class="dynasty-tag" :style="'background:' + tagBg(selectedMonth)">
            <text class="dynasty-tag-text">{{ current.dynasty }}</text>
          </view>
        </view>
        <view class="detail-dot" :style="'background:' + monthColor(selectedMonth)">
          <text class="detail-dot-text">{{ current.flower.slice(0,1) }}</text>
        </view>
      </view>

      <!-- Meta Row -->
      <view class="meta-row">
        <view class="meta-item">
          <text class="meta-label">花神人物</text>
          <text class="meta-value">{{ current.godName }}</text>
        </view>
        <view class="meta-divider"></view>
        <view class="meta-item">
          <text class="meta-label">所属朝代</text>
          <text class="meta-value">{{ current.dynasty }}</text>
        </view>
      </view>

      <!-- Poem -->
      <view class="section-block">
        <text class="block-label">经典诗句</text>
        <view class="poem-box" :style="'border-left: 4rpx solid ' + monthColor(selectedMonth)">
          <text class="poem-text">「{{ current.poem }}」</text>
        </view>
      </view>

      <!-- Keywords -->
      <view class="section-block">
        <text class="block-label">文化意象关键词</text>
        <view class="kw-row">
          <view
            v-for="kw in current.keywords"
            :key="kw"
            class="kw-chip"
            :style="'background:' + tagBg(selectedMonth) + ';border-color:' + monthColor(selectedMonth)"
          >
            <text class="kw-chip-text" :style="'color:' + monthColor(selectedMonth)">{{ kw }}</text>
          </view>
        </view>
      </view>

      <!-- Culture Image -->
      <view class="section-block">
        <text class="block-label">文化意象</text>
        <text class="block-body">{{ current.cultureImage }}</text>
      </view>

      <!-- Dynasty Style -->
      <view class="section-block">
        <text class="block-label">朝代诗词风格</text>
        <text class="block-body">{{ current.dynastyStyle }}</text>
      </view>

      <!-- AI Script -->
      <view class="section-block">
        <text class="block-label">花神讲解</text>
        <text class="block-body ai-text">{{ current.aiScript }}</text>
      </view>

      <!-- Action Buttons -->
      <view class="action-row">
        <view class="btn-primary" @click="goPodcast">
          <text class="btn-primary-text">生成播客文案</text>
        </view>
        <view class="btn-ghost" @click="copyAiScript">
          <text class="btn-ghost-text">复制讲解</text>
        </view>
      </view>

    </view>

    <view style="height: 60rpx;"></view>
  </scroll-view>
</template>

<script setup lang="ts">
import { FLOWERS, MONTH_COLORS, getFlowerByMonth, type FlowerItem } from '../../utils/flowerData'

const flowers = ref<FlowerItem[]>(FLOWERS)
const selectedMonth = ref<number>(1)
const current = ref<FlowerItem | null>(null)

function monthColor(month : number) : string {
  return MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length]
}

function tagBg(month : number) : string {
  const c = MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length]
  return c + '22'
}

function selectMonth(month : number) {
  selectedMonth.value = month
  current.value = getFlowerByMonth(month)
}

function goPodcast() {
  uni.navigateTo({
    url: `/pages/podcast/podcast?month=${selectedMonth.value}`
  })
}

function copyAiScript() {
  if (current.value == null) return
  uni.setClipboardData({
    data: current.value!.aiScript,
    success: () => {
      uni.showToast({ title: '已复制讲解内容', icon: 'success' })
    }
  })
}

onLoad((options ?: AnyObject) => {
  const m = parseInt((options?.['month'] as string) ?? '1')
  selectedMonth.value = (m >= 1 && m <= 12) ? m : 1
  current.value = getFlowerByMonth(selectedMonth.value)
})
</script>

<style>
.page-bg {
  flex: 1;
  background-color: #eef6fd;
}

.selector-bar {
  background-color: #ffffff;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.month-scroll {
  width: 100%;
}

.month-tab-row {
  flex-direction: row;
  padding: 0 20rpx;
  gap: 12rpx;
}

.month-tab {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  background-color: #f1f5f9;
  white-space: nowrap;
}

.month-tab-active {
  /* dynamic color applied inline */
}

.month-tab-text {
  font-size: 26rpx;
  font-weight: 500;
}

.detail-wrap {
  margin: 24rpx 28rpx 0;
  gap: 20rpx;
}

.detail-header {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx 28rpx;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(37,99,235,0.07);
}

.detail-header-left {
  flex: 1;
  gap: 10rpx;
}

.detail-month-name {
  font-size: 24rpx;
  color: #94a3b8;
}

.detail-flower {
  font-size: 48rpx;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1.15;
}

.dynasty-tag {
  align-self: flex-start;
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
  margin-top: 4rpx;
}

.dynasty-tag-text {
  font-size: 22rpx;
  color: #475569;
  font-weight: 500;
}

.detail-dot {
  width: 88rpx;
  height: 88rpx;
  border-radius: 44rpx;
  align-items: center;
  justify-content: center;
}

.detail-dot-text {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
}

.meta-row {
  background-color: #ffffff;
  border-radius: 20rpx;
  flex-direction: row;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.meta-item {
  flex: 1;
  align-items: center;
  gap: 8rpx;
}

.meta-divider {
  width: 1rpx;
  background-color: #e2e8f0;
  margin: 0 20rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #94a3b8;
}

.meta-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e3a5f;
}

.section-block {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  gap: 14rpx;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.block-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #2563eb;
}

.poem-box {
  padding: 16rpx 20rpx;
  background-color: #f8fbff;
  border-radius: 12rpx;
}

.poem-text {
  font-size: 28rpx;
  color: #1e3a5f;
  line-height: 1.8;
  font-style: italic;
}

.kw-row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.kw-chip {
  border-radius: 24rpx;
  padding: 8rpx 24rpx;
  border-width: 1rpx;
  border-style: solid;
}

.kw-chip-text {
  font-size: 24rpx;
  font-weight: 500;
}

.block-body {
  font-size: 26rpx;
  color: #475569;
  line-height: 1.9;
}

.ai-text {
  color: #334155;
}

.action-row {
  flex-direction: row;
  gap: 20rpx;
  padding-bottom: 8rpx;
}

.btn-primary {
  flex: 1;
  background-color: #2563eb;
  border-radius: 16rpx;
  padding: 28rpx;
  align-items: center;
}

.btn-primary-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.btn-ghost {
  flex: 1;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  align-items: center;
  border-width: 1rpx;
  border-style: solid;
  border-color: #2563eb;
}

.btn-ghost-text {
  font-size: 28rpx;
  color: #2563eb;
  font-weight: 600;
}
</style>
