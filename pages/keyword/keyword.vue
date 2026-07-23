<template>
  <scroll-view class="page-bg" scroll-y>

    <!-- Hero -->
    <view class="hero-card">
      <text class="hero-title">意象匹配</text>
      <text class="hero-desc">输入关键词，发现对应的月令花卉</text>
    </view>

    <!-- Keyword chips -->
    <view class="section-header">
      <text class="section-title">常用意象词</text>
    </view>
    <view class="chips-wrap">
      <view
        v-for="kw in allKeywords"
        :key="kw"
        class="chip"
        :class="inputVal === kw ? 'chip-active' : ''"
        @click="selectChip(kw)"
      >
        <text class="chip-text" :style="inputVal === kw ? 'color:#fff' : 'color:#2563eb'">{{ kw }}</text>
      </view>
    </view>

    <!-- Input -->
    <view class="input-wrap">
      <input
        class="kw-input"
        v-model="inputVal"
        placeholder="如：高洁、爱情、隐逸"
        placeholder-style="color:#94a3b8"
        confirm-type="search"
        @confirm="doMatch"
      />
      <view class="search-btn" @click="doMatch">
        <text class="search-btn-text">匹配</text>
      </view>
    </view>

    <!-- Results -->
    <view v-if="searched" class="result-wrap">
      <view v-if="results.length === 0" class="empty-box">
        <text class="empty-text">暂无对应花卉，请尝试其他关键词</text>
      </view>
      <view v-else>
        <view class="result-header">
          <text class="result-title">匹配结果（{{ results.length }}）</text>
        </view>
        <view
          v-for="item in results"
          :key="item.month"
          class="result-card"
          @click="goDetail(item.month)"
        >
          <view class="result-dot" :style="'background:' + monthColor(item.month)">
            <text class="result-dot-text">{{ item.flower.slice(0,1) }}</text>
          </view>
          <view class="result-info">
            <view class="result-top-row">
              <text class="result-flower">{{ item.flower }}</text>
              <view class="result-month-tag" :style="'background:' + monthColor(item.month) + '22'">
                <text class="result-month-tag-text" :style="'color:' + monthColor(item.month)">
                  {{ item.monthName }}
                </text>
              </view>
            </view>
            <text class="result-meta">{{ item.godName }} · {{ item.dynasty }}</text>
            <text class="result-poem">「{{ item.poem.length > 24 ? item.poem.slice(0,24) + '…' : item.poem }}」</text>
            <view class="kw-mini-row">
              <view v-for="kw in item.keywords" :key="kw" class="kw-mini-chip">
                <text class="kw-mini-text">{{ kw }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Placeholder before search -->
    <view v-if="!searched" class="hint-box">
      <text class="hint-text">点击意象词或在输入框中输入关键词后按匹配</text>
    </view>

    <view style="height: 60rpx;"></view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ALL_KEYWORDS, MONTH_COLORS, recommendByKeyword, type FlowerItem } from '../../utils/flowerData'

const allKeywords = ref<string[]>(ALL_KEYWORDS)
const inputVal = ref<string>('')
const results = ref<FlowerItem[]>([])
const searched = ref<boolean>(false)

function monthColor(month : number) : string {
  return MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length]
}

function selectChip(kw : string) {
  inputVal.value = kw
  doMatch()
}

function doMatch() {
  const kw = inputVal.value.trim()
  if (kw === '') {
    uni.showToast({ title: '请输入关键词', icon: 'none' })
    return
  }
  results.value = recommendByKeyword(kw)
  searched.value = true
}

function goDetail(month : number) {
  uni.navigateTo({ url: `/pages/month/month?month=${month}` })
}
</script>

<style>
.page-bg {
  flex: 1;
  background-color: #eef6fd;
}

.hero-card {
  margin: 30rpx 28rpx 0;
  background-color: #2563eb;
  border-radius: 24rpx;
  padding: 40rpx 36rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.75);
  margin-top: 10rpx;
}

.section-header {
  margin: 32rpx 28rpx 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e3a5f;
}

.chips-wrap {
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 28rpx;
  gap: 14rpx;
}

.chip {
  border-radius: 28rpx;
  padding: 10rpx 26rpx;
  background-color: #dbeafe;
  border-width: 1rpx;
  border-style: solid;
  border-color: #bfdbfe;
}

.chip-active {
  background-color: #2563eb;
  border-color: #2563eb;
}

.chip-text {
  font-size: 24rpx;
  font-weight: 500;
}

.input-wrap {
  margin: 28rpx 28rpx 0;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}

.kw-input {
  flex: 1;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #1e3a5f;
  border-width: 1rpx;
  border-style: solid;
  border-color: #bfdbfe;
}

.search-btn {
  background-color: #2563eb;
  border-radius: 16rpx;
  padding: 24rpx 36rpx;
  align-items: center;
  justify-content: center;
}

.search-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.result-wrap {
  margin: 28rpx 28rpx 0;
}

.result-header {
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
}

.result-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  flex-direction: row;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.result-dot {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-dot-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 700;
}

.result-info {
  flex: 1;
  gap: 8rpx;
}

.result-top-row {
  flex-direction: row;
  align-items: center;
  gap: 14rpx;
}

.result-flower {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e3a5f;
}

.result-month-tag {
  border-radius: 20rpx;
  padding: 4rpx 16rpx;
}

.result-month-tag-text {
  font-size: 22rpx;
  font-weight: 500;
}

.result-meta {
  font-size: 24rpx;
  color: #64748b;
}

.result-poem {
  font-size: 24rpx;
  color: #475569;
  font-style: italic;
  line-height: 1.6;
}

.kw-mini-row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.kw-mini-chip {
  background-color: #f1f5f9;
  border-radius: 16rpx;
  padding: 4rpx 16rpx;
}

.kw-mini-text {
  font-size: 20rpx;
  color: #64748b;
}

.empty-box {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 28rpx;
  align-items: center;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
  text-align: center;
}

.hint-box {
  margin: 40rpx 28rpx 0;
  align-items: center;
}

.hint-text {
  font-size: 24rpx;
  color: #94a3b8;
  text-align: center;
  line-height: 1.7;
}
</style>
