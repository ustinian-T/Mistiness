<template>
  <scroll-view class="dynasty-page" scroll-y>
    <view class="dynasty-container">
      <view class="dynasty-hero glass">
        <view><text class="section-kicker">CULTURAL TIMELINE</text><text class="dynasty-title">千年文脉，十二花神</text><text class="dynasty-lead">从春秋至明代，花木意象随时代流转，也沉淀为中国人的人格表达与审美传统。</text></view>
        <view class="hero-stat"><text class="hero-stat-number">{{ dynastyList.length }}</text><text class="hero-stat-label">历史时期</text></view>
      </view>

      <view class="section-heading"><view><text class="section-kicker">DATA LANDSCAPE</text><text class="section-title">花神朝代分布</text></view><text class="section-intro">按花神代表人物所属时代聚合，观察十二月令文化跨越千年的分布。</text></view>
      <view class="chart-card glass">
        <view v-for="(item,idx) in dynastyList" :key="item.dynasty" class="bar-row">
          <text class="bar-label">{{ item.dynasty }}</text><view class="bar-track"><view class="bar-fill" :style="`width:${barWidth(item.count)}%;background:${barColor(idx)}`"></view></view><text class="bar-count">{{ item.count }}</text>
        </view>
      </view>

      <view class="section-heading"><view><text class="section-kicker">DYNASTY COLLECTION</text><text class="section-title">按朝代浏览花神</text></view><text class="section-intro">选择任一人物与花卉，即可进入对应月份的完整文化档案。</text></view>
      <view class="dynasty-grid">
        <view v-for="item in dynastyList" :key="item.dynasty" class="dynasty-card glass">
          <view class="dynasty-card-head"><view><text class="dynasty-name">{{ item.dynasty }}</text><text class="dynasty-count">{{ item.count }} 位花神</text></view><text class="dynasty-mark">{{ item.dynasty.slice(0,1) }}</text></view>
          <view class="flower-list">
            <view v-for="flower in item.flowers" :key="flower.month" class="flower-row" @click="goDetail(flower.month)">
              <image class="flower-thumb" :src="flowerImage(flower.month)" mode="aspectFill" lazy-load />
              <view class="flower-info"><text class="flower-name">{{ flower.flower }}</text><text class="flower-meta">{{ flower.monthName }} · {{ flower.godName }}</text><text class="flower-poem">{{ flower.poem }}</text></view><text class="flower-arrow">↗</text>
            </view>
          </view>
        </view>
      </view>
      <AppFooter />
    </view>
  </scroll-view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppFooter from '../../components/app-footer.vue'
import { getFlowerImage, type FlowerItem } from '../../utils/flowerData'
import { getDynastyStats } from '../../utils/api'
type DynastyGroup={dynasty:string;count:number;flowers:FlowerItem[]}
const palette=['#587e72','#a57462','#879d73','#756f94','#b18b55','#557c8e','#9c6975','#476b62']
const dynastyList=ref<DynastyGroup[]>([])
const maxCount=computed(()=>Math.max(...dynastyList.value.map(item=>item.count),1))
async function loadStats(){
  try{
    const res=await getDynastyStats()
    if(res&&res.length){
      dynastyList.value=res.sort((a:any,b:any)=>b.count-a.count)
    }
  }catch{}
}
onLoad(()=>loadStats())
function barWidth(count:number){return Math.max(8,Math.round(count/maxCount.value*100))}
function barColor(index:number){return palette[index%palette.length]}
function flowerImage(month:number){return getFlowerImage(month)}
function goDetail(month:number){uni.setStorageSync('selected_month',month);uni.switchTab({url:'/pages/month/month'})}
</script>
<style>
@import '../../common/theme.css';
.dynasty-page{height:100vh;background:#f3f7f5}.dynasty-container{width:calc(100% - 48px);max-width:1120px;margin:0 auto;padding:32px 0}.dynasty-hero{border-radius:30px;padding:58px;display:grid;grid-template-columns:1fr auto;gap:50px;align-items:center}.dynasty-title{margin-top:12px;color:#183f34;font:50px 'STKaiti','KaiTi',serif;letter-spacing:4px}.dynasty-lead{margin-top:18px;max-width:680px;color:#6b8179;font-size:15px;line-height:1.9}.hero-stat{width:150px;height:150px;border:1px solid #cadbd4;border-radius:50%;align-items:center;justify-content:center}.hero-stat-number{font:46px Georgia,serif;color:#a87462}.hero-stat-label{margin-top:5px;color:#7c9189;font-size:12px}.chart-card{padding:38px;border-radius:24px;gap:22px}.bar-row{flex-direction:row;align-items:center;gap:18px}.bar-label{width:68px;text-align:right;color:#526e65;font-size:13px}.bar-track{flex:1;height:18px;border-radius:100px;background:#e7efeb;overflow:hidden}.bar-fill{height:100%;border-radius:100px}.bar-count{width:26px;color:#294f44;font:15px Georgia,serif}.dynasty-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.dynasty-card{border-radius:24px;overflow:hidden}.dynasty-card-head{padding:25px 28px;background:#e9f1ed;flex-direction:row;justify-content:space-between;align-items:center}.dynasty-name{font:27px 'STKaiti','KaiTi',serif;color:#234b40}.dynasty-count{margin-top:5px;color:#82968f;font-size:11px}.dynasty-mark{color:#cadbd4;font:44px 'STKaiti','KaiTi',serif}.flower-list{padding:8px 22px}.flower-row{padding:20px 4px;border-bottom:1px solid #e5ede9;flex-direction:row;align-items:center;gap:16px;cursor:pointer;transition:background .3s}.flower-row:last-child{border-bottom:0}.flower-row:active,.flower-row:hover{background:rgba(24,63,52,.03)}.flower-thumb{width:76px;height:76px;border-radius:16px;flex-shrink:0}.flower-info{flex:1;min-width:0}.flower-name{font:22px 'STKaiti','KaiTi',serif;color:#183f34}.flower-meta{margin-top:4px;color:#8a9a95;font-size:11px}.flower-poem{margin-top:8px;color:#5e786f;font:13px 'STKaiti','KaiTi',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.flower-arrow{color:#a87462;font-size:16px;transition:transform .3s}.flower-row:active .flower-arrow{transform:translateX(4px)}
@media(max-width:760px){.dynasty-container{width:calc(100% - 28px);padding-top:14px}.dynasty-hero{padding:34px;grid-template-columns:1fr}.dynasty-title{font-size:40px}.hero-stat{display:none}.dynasty-grid{grid-template-columns:1fr}.chart-card{padding:28px 20px}}
</style>
