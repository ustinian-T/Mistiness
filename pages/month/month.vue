<template>
  <scroll-view class="month-page" scroll-y>
    <view class="month-nav glass">
      <scroll-view scroll-x class="month-scroll">
        <view class="month-tabs">
          <view v-for="item in flowers" :key="item.month" class="month-tab" :class="selectedMonth===item.month?'active':''" @click="selectMonth(item.month)">
            <text class="tab-number">{{ String(item.month).padStart(2,'0') }}</text><text class="tab-name">{{ item.flower }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="current" class="month-container">
      <view class="detail-hero glass">
        <view class="detail-media">
          <image class="detail-flower-image" :src="flowerImage(selectedMonth)" mode="aspectFill" />
          <view class="media-shade"></view>
          <view class="media-caption"><text class="caption-month">{{ current.monthName }}</text><text class="caption-flower">{{ current.flower }}</text></view>
        </view>
        <view class="detail-intro">
          <text class="detail-kicker">MONTHLY FLOWER DEITY · {{ String(selectedMonth).padStart(2,'0') }}</text>
          <text class="detail-title">{{ current.flower }} · {{ current.godName }}</text>
          <text class="detail-poem">“{{ current.poem }}”</text>
          <view class="keyword-row"><text v-for="keyword in current.keywords" :key="keyword">{{ keyword }}</text></view>
          <text class="detail-summary">{{ current.cultureImage }}</text>
          <view class="intro-actions">
            <view class="primary-action" @click="goPodcast"><text>生成花月播客</text></view>
            <view class="secondary-action" @click="copyAiScript"><text>复制讲解文案</text></view>
          </view>
        </view>
      </view>

      <view class="content-grid">
        <view class="portrait-card glass">
          <image class="portrait-image" :src="godImage(selectedMonth)" mode="aspectFill" />
          <view class="portrait-info">
            <text class="content-label">花神人物</text>
            <view class="portrait-name-wrap">
              <text class="portrait-name" @click="openBaiduBaike(current.godName)">{{ current.godName }}</text>
              <text class="link-icon">↗</text>
            </view>
            <view class="portrait-dynasty">
              <text class="dynasty-link" @click="openBaiduBaike(current.dynasty)">{{ current.dynasty }}</text>
              <text> · {{ current.monthName }}花神</text>
            </view>
          </view>
        </view>
        <view class="narrative-card glass">
          <view class="narrative-section"><text class="content-label">文化意象</text><text class="content-body">{{ current.cultureImage }}</text></view>
          <view class="divider"></view>
          <view class="narrative-section"><text class="content-label">朝代诗词风格</text><text class="content-body">{{ current.dynastyStyle }}</text></view>
        </view>
      </view>

      <view class="script-card glass">
        <view class="script-head"><view><text class="content-label">AI CURATED NARRATION</text><text class="script-title">花神讲解</text></view><text class="script-index">{{ String(selectedMonth).padStart(2,'0') }}</text></view>
        <text class="script-body">{{ current.aiScript }}</text>
      </view>

      <AppFooter />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppFooter from '../../components/app-footer.vue'
import { FLOWERS,getFlowerByMonth,getFlowerImage,getGodImage,type FlowerItem } from '../../utils/flowerData'
const flowers=ref<FlowerItem[]>(FLOWERS);const selectedMonth=ref(1);const current=ref<FlowerItem|null>(FLOWERS[0])
function flowerImage(month:number){return getFlowerImage(month)}
function godImage(month:number){return getGodImage(month)}
function selectMonth(month:number){selectedMonth.value=month;current.value=getFlowerByMonth(month);uni.setStorageSync('selected_month',month)}
function goPodcast(){uni.setStorageSync('podcast_month',selectedMonth.value);uni.switchTab({url:'/pages/podcast/podcast'})}
function copyAiScript(){if(!current.value)return;uni.setClipboardData({data:current.value.aiScript,success:()=>uni.showToast({title:'讲解文案已复制',icon:'success'})})}
function openBaiduBaike(keyword:string){uni.navigateTo({url:`/pages/webview/webview?url=${encodeURIComponent('https://baike.baidu.com/item/'+encodeURIComponent(keyword))}`})}
function loadMonth(month:number){selectMonth(month>=1&&month<=12?month:1)}
onLoad((options:any={})=>loadMonth(parseInt(options?.month||'0')||Number(uni.getStorageSync('selected_month'))||1))
onShow(()=>{const month=Number(uni.getStorageSync('selected_month'));if(month&&month!==selectedMonth.value)loadMonth(month)})
</script>

<style>
@import '../../common/theme.css';
.month-page{height:100vh;background:#f3f7f5}.month-nav{position:sticky;top:0;z-index:20;border-radius:0;padding:12px 0}.month-scroll{width:100%}.month-tabs{flex-direction:row;gap:8px;padding:0 max(18px,calc((100vw - 1240px)/2))}.month-tab{min-width:72px;padding:10px 12px;border-radius:14px;align-items:center;gap:3px;color:#789087;cursor:pointer}.month-tab.active{background:#183f34;color:#fff;box-shadow:0 10px 24px rgba(24,63,52,.18)}.tab-number{font:15px Georgia,serif}.tab-name{font-size:11px}.month-container{width:calc(100% - 48px);max-width:1240px;margin:0 auto;padding:28px 0 20px}.detail-hero{min-height:540px;border-radius:30px;display:flex;overflow:hidden}.detail-media{width:48%;position:relative;min-height:540px}.detail-flower-image,.media-shade{position:absolute;inset:0;width:100%;height:100%}.media-shade{background:linear-gradient(180deg,transparent 45%,rgba(8,31,24,.7))}.media-caption{position:absolute;left:30px;bottom:28px;color:#fff}.caption-month{font-size:13px;letter-spacing:3px;opacity:.8}.caption-flower{margin-top:5px;font:44px 'STKaiti','KaiTi',serif;letter-spacing:5px}.detail-intro{flex:1;padding:62px 54px;justify-content:center}.detail-kicker,.content-label{color:#829b92;font:11px Georgia,serif;letter-spacing:2px}.detail-title{margin-top:17px;color:#183f34;font:42px 'STKaiti','KaiTi',serif;letter-spacing:3px}.detail-poem{margin-top:24px;color:#8d6557;font:21px/1.8 'STKaiti','KaiTi',serif}.keyword-row{margin-top:22px;flex-direction:row;flex-wrap:wrap;gap:8px}.keyword-row text{padding:6px 12px;border-radius:100px;background:#e9f1ed;color:#5e786f;font-size:12px}.detail-summary{margin-top:24px;color:#647971;font-size:14px;line-height:1.9}.intro-actions{margin-top:30px;flex-direction:row;flex-wrap:wrap;gap:10px}.primary-action,.secondary-action{height:45px;padding:0 20px;border-radius:100px;align-items:center;justify-content:center;font-size:13px;cursor:pointer}.primary-action{background:#183f34;color:#fff}.secondary-action{border:1px solid #b9ccc5;color:#345d51}.content-grid{display:grid;grid-template-columns:1fr 1.55fr;gap:22px;margin-top:22px}.portrait-card,.narrative-card,.script-card{border-radius:24px;overflow:hidden}.portrait-card{display:grid;grid-template-columns:46% 1fr;min-height:340px}.portrait-image{width:100%;height:100%}.portrait-info{padding:32px;justify-content:center}.portrait-name-wrap{flex-direction:row;align-items:center;gap:8px;margin-top:12px}.portrait-name{font:38px 'STKaiti','KaiTi',serif;color:#183f34;cursor:pointer;transition:color .3s}.portrait-name:active,.portrait-name:hover{color:#a87462}.link-icon{font-size:18px;color:#a87462;transition:transform .3s}.portrait-name-wrap:active .link-icon{transform:translateX(2px)}.portrait-dynasty{margin-top:10px;color:#81938d;font-size:14px;flex-direction:row;align-items:center;gap:6px}.dynasty-link{color:#315e51;text-decoration:underline;text-decoration-color:#a87462;text-underline-offset:4px;cursor:pointer;transition:color .3s}.dynasty-link:active,.dynasty-link:hover{color:#a87462}.narrative-card{padding:42px}.narrative-section{gap:14px}.content-body{color:#536b63;font-size:15px;line-height:2}.divider{height:1px;background:#dce7e2;margin:30px 0}.script-card{margin-top:22px;padding:44px 50px}.script-head{flex-direction:row;justify-content:space-between;align-items:start}.script-title{margin-top:10px;color:#183f34;font:32px 'STKaiti','KaiTi',serif}.script-index{color:#d3e0db;font:60px Georgia,serif}.script-body{margin-top:22px;color:#455f57;font:17px/2.1 'STKaiti','KaiTi',serif;letter-spacing:1px}
@media(max-width:800px){.month-container{width:calc(100% - 28px)}.detail-hero{flex-direction:column}.detail-media{width:100%;min-height:450px}.detail-intro{padding:38px 30px}.content-grid{grid-template-columns:1fr}.portrait-card{min-height:360px}.script-card{padding:34px 28px}}
@media(max-width:520px){.month-tabs{padding:0 14px}.detail-media{min-height:390px}.detail-title{font-size:34px}.portrait-card{grid-template-columns:1fr}.portrait-image{height:390px}.portrait-info{padding:26px}.narrative-card{padding:28px}.intro-actions{flex-direction:column}.primary-action,.secondary-action{width:100%}}
</style>
