<template>
  <scroll-view class="page-bg" scroll-y>

    <!-- Hero -->
    <view class="hero-card">
      <text class="hero-title">花月播客</text>
      <text class="hero-desc">为每位花神生成专属诗境文案</text>
    </view>

    <!-- Month Selector -->
    <view class="section-header">
      <text class="section-title">选择花神</text>
    </view>
    <scroll-view scroll-x class="month-scroll-wrap">
      <view class="month-tab-row">
        <view
          v-for="item in flowers"
          :key="item.month"
          class="month-tab"
          :style="selectedMonth === item.month
            ? 'background:' + monthColor(item.month) + ';border-color:' + monthColor(item.month)
            : 'background:#fff;border-color:#dbeafe'"
          @click="selectMonth(item.month)"
        >
          <text
            class="month-tab-flower"
            :style="selectedMonth === item.month ? 'color:#fff' : 'color:#1e3a5f'"
          >{{ item.flower }}</text>
          <text
            class="month-tab-num"
            :style="selectedMonth === item.month ? 'color:rgba(255,255,255,0.8)' : 'color:#94a3b8'"
          >{{ item.month }}月</text>
        </view>
      </view>
    </scroll-view>

    <!-- Current flower info -->
    <view v-if="current != null" class="flower-info-card">
      <view class="flower-info-left">
        <text class="flower-info-name">{{ current.flower }}</text>
        <text class="flower-info-meta">{{ current.godName }} · {{ current.dynasty }}</text>
        <text class="flower-info-poem">「{{ current.poem.length > 20 ? current.poem.slice(0,20) + '…' : current.poem }}」</text>
      </view>
      <image class="flower-info-image" :src="flowerImage(selectedMonth)" mode="aspectFill" />
    </view>

    <!-- Generate Button -->
    <view class="gen-wrap">
      <view
        class="gen-btn"
        :style="generating ? 'background:#94a3b8' : 'background:#2563eb'"
        @click="generatePodcast"
      >
        <text class="gen-btn-text">{{ generating ? '生成中…' : '生成播客文案' }}</text>
      </view>
      <view class="key-tip" @click="goProfile">
        <text class="key-tip-text">未配置 API Key？前往个人中心设置 →</text>
      </view>
    </view>

    <!-- Error message -->
    <view v-if="errorMsg !== ''" class="error-card">
      <text class="error-text">{{ errorMsg }}</text>
    </view>

    <!-- Result -->
    <view v-if="podcastText !== '' || paragraphs.length > 0" class="result-card">
      <view class="result-header-row">
        <text class="result-label">播客文案</text>
        <view style="flex-direction:row;align-items:center;gap:12rpx">
          <view v-if="aiSource !== ''" class="source-tag">
            <text class="source-tag-text">{{ aiSource }}</text>
          </view>
          <view class="copy-btn" @click="copyText">
            <text class="copy-btn-text">复制</text>
          </view>
        </view>
      </view>

      <!-- Paragraphs -->
      <view class="para-list">
        <view
          v-for="(para, idx) in paragraphs"
          :key="idx"
          class="para-item"
          :style="para.type === 'title' ? 'margin-bottom:8rpx' : ''"
        >
          <text
            :class="para.type === 'title' ? 'para-title' : 'para-body'"
          >{{ para.text }}</text>
        </view>
      </view>

      <!-- Share reminder -->
      <view class="share-hint">
        <text class="share-hint-text">✨ 文案已生成，可复制后分享或发布</text>
      </view>
    </view>

    <!-- Empty hint -->
    <view v-if="podcastText === '' && paragraphs.length === 0 && !generating && errorMsg === ''" class="empty-hint">
      <text class="empty-icon">🎙</text>
      <text class="empty-text">点击上方按钮为当前花神生成专属播客文案</text>
    </view>

    <AppFooter />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppFooter from '../../components/app-footer.vue'
import { FLOWERS, MONTH_COLORS, getFlowerByMonth, getFlowerImage, type FlowerItem } from '../../utils/flowerData'
import { getToken, isLoggedIn, callAiProxy } from '../../utils/auth'

type ParaItem = {
  text : string
  type : string
}

const flowers = ref<FlowerItem[]>(FLOWERS)
const selectedMonth = ref<number>(1)
const current = ref<FlowerItem | null>(null)
const podcastText = ref<string>('')
const generating = ref<boolean>(false)
const paragraphs = ref<ParaItem[]>([])
const aiSource = ref<string>('')
const errorMsg = ref<string>('')

function flowerImage(month : number) : string {
  return getFlowerImage(month)
}

function monthColor(month : number) : string {
  return MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length]
}

function selectMonth(month : number) {
  selectedMonth.value = month
  current.value = getFlowerByMonth(month)
  podcastText.value = ''
  paragraphs.value = []
  aiSource.value = ''
  errorMsg.value = ''
}

function parseParagraphs(text : string) : ParaItem[] {
  return text.split('\n').map(line => {
    if (line.startsWith('【') && line.endsWith('】')) {
      return { text: line, type: 'title' } as ParaItem
    }
    if (line === '') {
      return { text: ' ', type: 'empty' } as ParaItem
    }
    return { text: line, type: 'body' } as ParaItem
  })
}

function buildLocalText(f : FlowerItem) : string {
  return [
    `【${f.monthName}花神 · ${f.flower}】`,
    '',
    `欢迎收听花月诗境，今天为您讲述${f.monthName}的花神——${f.flower}，以及她的守护者${f.godName}。`,
    '',
    f.aiScript,
    '',
    `说到${f.flower}，就不得不提那首千古名句——`,
    `"${f.poem}"`,
    '',
    `这句诗出自${f.dynasty}，正是${f.flower}文化意象最深刻的写照。${f.cultureImage}。`,
    '',
    `从诗词风格来看，${f.dynastyStyle}。`,
    '',
    `今日花神${f.godName}与${f.flower}的故事，愿为您在${f.monthName}带来一份诗意与宁静。感谢收听花月诗境，我们下期再见。`,
  ].join('\n')
}

function streamDisplay(text : string) {
  const allParas = parseParagraphs(text)
  let idx = 0
  const addNext = () => {
    if (idx < allParas.length) {
      paragraphs.value = allParas.slice(0, idx + 1)
      idx++
      setTimeout(addNext, 60)
    } else {
      podcastText.value = text
      generating.value = false
    }
  }
  setTimeout(addNext, 200)
}

async function generatePodcast() {
  if (generating.value || current.value == null) return
  generating.value = true
  podcastText.value = ''
  paragraphs.value = []
  aiSource.value = ''
  errorMsg.value = ''

  const f = current.value!
  const token = getToken()
  const guestKey = (uni.getStorageSync('guest_api_key') as string) || ''
  const guestBase = (uni.getStorageSync('guest_api_base') as string) || ''

  // Attempt AI generation via cloud function
  const hasAuth = isLoggedIn() || guestKey !== ''
  if (hasAuth) {
    try {
      const params : Record<string, any> = {
        action: 'generatePodcast',
        flowerData: {
          month: f.month,
          monthName: f.monthName,
          flower: f.flower,
          godName: f.godName,
          dynasty: f.dynasty,
          poem: f.poem,
          cultureImage: f.cultureImage,
          dynastyStyle: f.dynastyStyle,
        },
      }
      if (token !== '') params['token'] = token
      if (!isLoggedIn() && guestKey !== '') {
        params['clientApiKey'] = guestKey
        params['clientApiBaseUrl'] = guestBase
      }

      const res = await callAiProxy(params)
      if (res.code === 0) {
        const text = res.text as string
        aiSource.value = res.source === 'server' ? 'AI · 系统' : 'AI · 自备Key'
        streamDisplay(text)
        return
      } else if (res.code === 429) {
        errorMsg.value = res.message as string
        generating.value = false
        return
      }
      // Other errors fall through to local generation
    } catch {}
  }

  // Fallback: local template generation
  aiSource.value = '本地模板'
  streamDisplay(buildLocalText(f))
}

function copyText() {
  if (podcastText.value === '') return
  uni.setClipboardData({
    data: podcastText.value,
    success: () => uni.showToast({ title: '文案已复制', icon: 'success' })
  })
}

function goProfile() {
  uni.navigateTo({ url: '/pages/profile/profile' })
}

onLoad((options: any = {}) => {
  const stored = Number(uni.getStorageSync('podcast_month') || 0)
  const m = parseInt((options?.['month'] as string) ?? '0') || stored || 1
  selectedMonth.value = (m >= 1 && m <= 12) ? m : 1
  current.value = getFlowerByMonth(selectedMonth.value)
})

onShow(() => {
  const stored = Number(uni.getStorageSync('podcast_month') || 0)
  if (stored >= 1 && stored <= 12 && stored !== selectedMonth.value) {
    selectedMonth.value = stored
    current.value = getFlowerByMonth(stored)
    podcastText.value = ''
    paragraphs.value = []
  }
})
</script>

<style>
.page-bg {
  min-height: 100vh;
  height: 100vh;
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

.month-scroll-wrap {
  width: 100%;
  padding-left: 28rpx;
}

.month-tab-row {
  flex-direction: row;
  padding-right: 28rpx;
  gap: 14rpx;
}

.month-tab {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  border-width: 1rpx;
  border-style: solid;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.month-tab-flower {
  font-size: 26rpx;
  font-weight: 600;
}

.month-tab-num {
  font-size: 20rpx;
}

.flower-info-card {
  margin: 20rpx 28rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06);
}

.flower-info-left {
  flex: 1;
  gap: 8rpx;
}

.flower-info-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e3a5f;
}

.flower-info-meta {
  font-size: 24rpx;
  color: #64748b;
}

.flower-info-poem {
  font-size: 22rpx;
  color: #475569;
  font-style: italic;
  line-height: 1.5;
}

.flower-info-dot {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  align-items: center;
  justify-content: center;
}

.flower-info-dot-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 700;
}

.gen-wrap {
  margin: 24rpx 28rpx 0;
}

.key-tip {
  margin-top: 16rpx;
  align-items: center;
}
.key-tip-text {
  font-size: 22rpx;
  color: #2563eb;
}
.error-card {
  margin: 16rpx 28rpx 0;
  background-color: #fef2f2;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  border-width: 1rpx;
  border-style: solid;
  border-color: #fecaca;
}
.error-text {
  font-size: 24rpx;
  color: #dc2626;
  line-height: 1.6;
}
.source-tag {
  background-color: #dbeafe;
  border-radius: 10rpx;
  padding: 6rpx 16rpx;
}
.source-tag-text {
  font-size: 20rpx;
  color: #1e40af;
  font-weight: 500;
}
.gen-btn {
  border-radius: 18rpx;
  padding: 32rpx;
  align-items: center;
}

.gen-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.result-card {
  margin: 24rpx 28rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(37,99,235,0.08);
}

.result-header-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.result-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #2563eb;
}

.copy-btn {
  background-color: #dbeafe;
  border-radius: 12rpx;
  padding: 8rpx 24rpx;
}

.copy-btn-text {
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 500;
}

.para-list {
  gap: 4rpx;
}

.para-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1.6;
}

.para-body {
  font-size: 26rpx;
  color: #334155;
  line-height: 1.9;
}

.share-hint {
  margin-top: 28rpx;
  padding: 18rpx 24rpx;
  background-color: #f0f9ff;
  border-radius: 12rpx;
  align-items: center;
}

.share-hint-text {
  font-size: 22rpx;
  color: #2563eb;
}

.empty-hint {
  margin: 60rpx 28rpx 0;
  align-items: center;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
  text-align: center;
  line-height: 1.7;
}
.flower-info-image { width: 150rpx; height: 150rpx; border-radius: 22rpx; flex-shrink: 0; }
.page-bg { background: #f3f7f5; }
.hero-card { max-width: 1064px; width: calc(100% - 48px); margin: 32px auto 0; padding: 42px 48px; border-radius: 28px; background: linear-gradient(135deg,#183f34,#315e51); box-sizing: border-box; }
.hero-title { font-family: 'STKaiti','KaiTi',serif; font-size: 42px; letter-spacing: 4px; }
.hero-desc { font-size: 14px; }
.section-header,.month-scroll-wrap,.flower-info-card,.gen-wrap,.error-card,.result-card,.empty-hint,.site-footer { max-width: 1064px; width: calc(100% - 48px); margin-left: auto; margin-right: auto; box-sizing: border-box; }
.month-scroll-wrap { padding-left: 0; }
.month-tab { background: rgba(255,255,255,.86) !important; border-color: #d7e3de !important; }
.month-tab-flower { color: #234c40 !important; }
.month-tab-num { color: #83978f !important; }
.flower-info-card,.result-card { border: 1px solid #fff; box-shadow: 0 20px 55px rgba(35,71,60,.08); }
.flower-info-name,.section-title { color: #183f34; font-family: 'STKaiti','KaiTi',serif; }
.gen-btn { background: #183f34 !important; }
.key-tip-text,.copy-btn-text { color: #426b5f; }
@media(max-width:600px){.hero-card,.section-header,.month-scroll-wrap,.flower-info-card,.gen-wrap,.error-card,.result-card,.empty-hint,.site-footer{width:calc(100% - 28px)}.hero-card{padding:30px 26px}.hero-title{font-size:34px}.flower-info-image{width:120rpx;height:120rpx}}</style>
