<template>
  <scroll-view class="page-shell" scroll-y>
    <view class="site-container">
      <view class="hero glass">
        <view class="hero-copy">
          <view class="eyebrow"><text>2026 · 十二月令花神数字导览</text></view>
          <text class="hero-title">花月有序，诗境无边</text>
          <text class="hero-lead">循四时花信，遇见十二位花神与中国古典诗词中的风雅人格。</text>
          <view class="hero-actions">
            <view class="button button-primary" @click="goMonth(1)"><text>开始花神之旅</text></view>
            <view class="button button-secondary" @click="goPage('/pages/keyword/keyword')"><text>探索诗词意象</text></view>
          </view>
          <view class="hero-metrics">
            <view class="metric"><text class="metric-value">12</text><text class="metric-label">月令花神</text></view><view class="metric-line"></view>
            <view class="metric"><text class="metric-value">{{ keywordCount }}</text><text class="metric-label">文化意象</text></view><view class="metric-line"></view>
            <view class="metric"><text class="metric-value">{{ dynastyCount }}</text><text class="metric-label">历史时期</text></view>
          </view>
        </view>
        <view class="hero-gallery" @click="goMonth(featured.month)">
          <image class="hero-image" :src="flowerImage(featured.month)" mode="aspectFill" />
          <image class="hero-god-image" :src="godImage(featured.month)" mode="aspectFit" />
          <view class="hero-image-shade"></view>
          <view class="hero-image-meta">
            <text class="hero-image-index">{{ String(featured.month).padStart(2, '0') }}</text>
            <view><text class="hero-image-name">{{ featured.flower }}</text><text class="hero-image-god">{{ featured.monthName }}花神 · {{ featured.godName }}</text></view>
          </view>
          <view class="hero-poem"><text>“{{ featured.poem }}”</text></view>
        </view>
      </view>

      <view class="section-heading">
        <view><text class="section-kicker">FLOWER CALENDAR</text><text class="section-title">十二花神月历</text></view>
        <text class="section-intro">每一月，都有一朵花承载中国人的精神气象。点击卡片，进入完整诗词与文化导览。</text>
      </view>
      <view class="flower-grid">
        <view v-for="item in flowers" :key="item.month" class="flower-card" @click="goMonth(item.month)">
          <view class="card-media">
            <image class="card-image" :src="flowerImage(item.month)" mode="aspectFill" lazy-load />
            <view class="card-overlay"></view><text class="card-month-number">{{ String(item.month).padStart(2, '0') }}</text><view class="card-season"><text>{{ item.monthName }}</text></view>
          </view>
          <view class="card-body">
            <view class="card-title-row"><text class="card-title">{{ item.flower }}</text><text class="card-arrow">↗</text></view>
            <text class="card-meta">花神 {{ item.godName }} · {{ item.dynasty }}</text><text class="card-poem">{{ item.poem }}</text>
            <view class="card-keywords"><text v-for="keyword in item.keywords" :key="keyword">{{ keyword }}</text></view>
          </view>
        </view>
      </view>

      <view class="section-heading">
        <view><text class="section-kicker">DIGITAL EXPERIENCE</text><text class="section-title">以数字之力，重访古典</text></view>
        <text class="section-intro">从月令查询到意象匹配、文脉统计与 AI 播客，在一处完成沉浸式文化探索。</text>
      </view>
      <view class="feature-grid">
        <view v-for="feature in features" :key="feature.no" class="feature-card" @click="goPage(feature.path)">
          <text class="feature-no">{{ feature.no }}</text><text class="feature-title">{{ feature.title }}</text><text class="feature-desc">{{ feature.desc }}</text><text class="feature-link">进入体验 →</text>
        </view>
      </view>
      <view class="quote-banner"><text class="quote-mark">“</text><text class="quote-text">以花为引，以诗为舟，在四时流转中看见中国人的情感、品格与审美。</text><text class="quote-en">A DIGITAL JOURNEY THROUGH FLOWERS AND POETRY</text></view>
      <AppFooter />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppFooter from '../../components/app-footer.vue'
import { FLOWERS, ALL_KEYWORDS, getFlowerImage, getGodImage, type FlowerItem } from '../../utils/flowerData'
const flowers = ref<FlowerItem[]>(FLOWERS)
const keywordCount = ALL_KEYWORDS.length
const dynastyCount = new Set(FLOWERS.map(item => item.dynasty)).size
const featured = computed(() => FLOWERS[new Date().getMonth()] || FLOWERS[0])
const features = [
  { no:'01',title:'按月导览',desc:'花卉、花神画像、诗句与文化意象的完整叙事。',path:'/pages/month/month' },
  { no:'02',title:'意象匹配',desc:'以高洁、团圆、隐逸等关键词发现契合的月令花卉。',path:'/pages/keyword/keyword' },
  { no:'03',title:'朝代文脉',desc:'用可视化图谱理解十二花神跨越千年的时代分布。',path:'/pages/dynasty/dynasty' },
  { no:'04',title:'花月播客',desc:'结合文化数据与 AI，生成适合聆听与分享的诗境文案。',path:'/pages/podcast/podcast' },
  { no:'05',title:'个人中心',desc:'管理登录状态、AI 服务配置与个人创作体验。',path:'/pages/profile/profile' }
]
function flowerImage(month:number){return getFlowerImage(month)}
function godImage(month:number){return getGodImage(month)}
function goMonth(month:number){uni.setStorageSync('selected_month',month);uni.switchTab({url:'/pages/month/month'})}
function goPage(path:string){const tabs=['/pages/month/month','/pages/keyword/keyword','/pages/dynasty/dynasty','/pages/podcast/podcast'];tabs.includes(path)?uni.switchTab({url:path}):uni.navigateTo({url:path})}
</script>

<style>
@import '../../common/theme.css';
</style>
