<template>
  <scroll-view class="explore-page" scroll-y>
    <view class="explore-container">
      <view class="explore-hero glass">
        <view><text class="section-kicker">POETIC IMAGERY</text><text class="explore-title">从一个词，遇见一朵花</text><text class="explore-lead">输入情感或文化意象，系统将从十二花神中寻找与你心境相契的诗意表达。</text></view>
        <view class="search-panel">
          <input v-model="inputVal" class="search-input" placeholder="试试：高洁、团圆、隐逸、清雅" confirm-type="search" @confirm="doMatch" />
          <view class="search-button" :class="matching ? 'disabled' : ''" @click="doMatch"><text>{{ matching ? '匹配中…' : '开始匹配' }}</text></view>
        </view>
      </view>

      <view class="keyword-section">
        <text class="keyword-label">常用文化意象</text>
        <view class="chips-wrap"><view v-for="kw in allKeywords" :key="kw" class="chip" :class="inputVal===kw?'active':''" @click="selectChip(kw)"><text>{{ kw }}</text></view></view>
      </view>

      <view v-if="searched" class="result-section">
        <view class="result-heading"><view><text class="section-kicker">MATCHED FLOWERS</text><text class="result-title">匹配结果</text></view><text class="result-count">{{ results.length }} 个结果</text></view>
        <view v-if="results.length" class="result-grid">
          <view v-for="item in results" :key="item.month" class="result-card glass" @click="goDetail(item.month)">
            <image class="result-image" :src="flowerImage(item.month)" mode="aspectFill" lazy-load />
            <view class="result-content">
              <view class="result-top"><text class="result-flower">{{ item.flower }}</text><text class="result-month">{{ item.monthName }}</text></view>
              <text class="result-meta">花神 {{ item.godName }} · {{ item.dynasty }}</text><text class="result-poem">“{{ item.poem }}”</text>
              <view class="mini-tags"><text v-for="kw in item.keywords" :key="kw">{{ kw }}</text></view>
              <text class="result-link">查看完整花神故事 →</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-card glass"><text class="empty-mark">花</text><text class="empty-title">暂未找到契合的花神</text><text class="empty-desc">换一个更简洁的情感或意象词试试，例如“高洁”“爱情”“自然”。</text></view>
      </view>
      <view v-else class="guide-card"><text class="guide-no">38</text><view><text class="guide-title">个预设文化关键词</text><text class="guide-desc">支持精确与模糊匹配，无需 AI 服务也能完成探索。</text></view></view>
      <AppFooter />
    </view>
  </scroll-view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AppFooter from '../../components/app-footer.vue'
import { ALL_KEYWORDS, getFlowerImage, type FlowerItem } from '../../utils/flowerData'
import { recommendByKeyword } from '../../utils/api'
const allKeywords = ref(ALL_KEYWORDS)
const inputVal = ref('')
const results = ref<FlowerItem[]>([])
const searched = ref(false)
const matching = ref(false)
function flowerImage(month: number) { return getFlowerImage(month) }
function selectChip(kw: string) { inputVal.value = kw; doMatch() }
async function doMatch() {
  const kw = inputVal.value.trim()
  if (!kw) { uni.showToast({ title: '请输入关键词', icon: 'none' }); return }
  matching.value = true
  try {
    const res = await recommendByKeyword(kw)
    if (res.results && res.results.length > 0) {
      results.value = res.results.map((r: any) => ({ ...r, keywords: [] }))
    } else {
      results.value = []
    }
  } catch {
    results.value = []
  } finally {
    matching.value = false
    searched.value = true
  }
}
function goDetail(month:number){uni.setStorageSync('selected_month',month);uni.switchTab({url:'/pages/month/month'})}
</script>
<style>
@import '../../common/theme.css';
.explore-page{height:100vh;background:#f3f7f5}.explore-container{width:calc(100% - 48px);max-width:1120px;margin:0 auto;padding:32px 0}.explore-hero{border-radius:30px;padding:54px;display:grid;grid-template-columns:1.15fr 1fr;gap:60px;align-items:center}.explore-title{margin-top:13px;color:#183f34;font:48px/1.2 'STKaiti','KaiTi',serif;letter-spacing:3px}.explore-lead{margin-top:18px;color:#6b8179;font-size:15px;line-height:1.9}.search-panel{padding:12px;border-radius:18px;background:#edf3f0;flex-direction:row;gap:9px}.search-input{flex:1;height:50px;padding:0 17px;background:#fff;border-radius:12px;color:#254a40;font-size:14px}.search-button{height:50px;padding:0 22px;border-radius:12px;background:#183f34;color:#fff;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:.3s}.search-button.disabled{background:#8ba099;cursor:not-allowed}.keyword-section{margin:38px 4px}.keyword-label{color:#6f847d;font-size:12px;letter-spacing:2px}.chips-wrap{margin-top:16px;flex-direction:row;flex-wrap:wrap;gap:9px}.chip{padding:8px 15px;border:1px solid #d3e1dc;border-radius:100px;background:rgba(255,255,255,.66);color:#648078;font-size:12px;cursor:pointer}.chip.active{background:#183f34;color:#fff;border-color:#183f34}.result-section{margin-top:58px}.result-heading{flex-direction:row;justify-content:space-between;align-items:end;margin-bottom:24px}.result-title{margin-top:8px;font:34px 'STKaiti','KaiTi',serif}.result-count{color:#879991;font-size:12px}.result-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.result-card{border-radius:24px;overflow:hidden;display:grid;grid-template-columns:42% 1fr;min-height:320px;cursor:pointer;transition:all .35s}.result-card:hover{transform:translateY(-6px);box-shadow:0 20px 45px rgba(39,75,64,.12)}.result-image{width:100%;height:100%}.result-content{padding:30px 28px}.result-top{flex-direction:row;justify-content:space-between;align-items:center}.result-flower{font:32px 'STKaiti','KaiTi',serif;color:#183f34}.result-month{color:#8aa097;font-size:12px;padding:4px 10px;background:#f0f7f5;border-radius:100px}.result-meta{margin-top:8px;color:#8a9b95;font-size:12px}.result-poem{margin-top:20px;color:#5b7169;font:16px/1.8 'STKaiti','KaiTi',serif}.mini-tags{margin-top:18px;flex-direction:row;flex-wrap:wrap;gap:8px}.mini-tags text{padding:5px 10px;background:#edf4f1;border-radius:100px;color:#5e786f;font-size:11px}.result-link{margin-top:auto;color:#a87462;font-size:12px;font-weight:500}.empty-card{border-radius:24px;padding:70px 30px;align-items:center;text-align:center}.empty-mark{width:60px;height:60px;border-radius:50%;background:#e7efeb;color:#759087;align-items:center;justify-content:center;font:25px 'KaiTi',serif}.empty-title{margin-top:18px;font:25px 'KaiTi',serif}.empty-desc{margin-top:9px;color:#82958e;font-size:13px}.guide-card{margin-top:70px;padding:38px;border-top:1px solid #d7e3de;border-bottom:1px solid #d7e3de;flex-direction:row;justify-content:center;align-items:center;gap:22px}.guide-no{font:52px Georgia,serif;color:#b27c68}.guide-title{font:20px 'KaiTi',serif}.guide-desc{margin-top:6px;color:#84958f;font-size:12px}
@media(max-width:760px){.explore-container{width:calc(100% - 28px);padding-top:14px}.explore-hero{grid-template-columns:1fr;padding:32px;gap:28px}.explore-title{font-size:38px}.result-grid{grid-template-columns:1fr}}
@media(max-width:480px){.search-panel{flex-direction:column}.search-button{width:100%}.result-card{grid-template-columns:1fr}.result-image{height:280px}}
</style>
