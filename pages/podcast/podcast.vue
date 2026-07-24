<template>
  <scroll-view class="page-shell" scroll-y>
    <view class="site-container">
      <view class="hero-card glass">
        <view class="hero-copy">
          <view class="eyebrow"><text>PODCAST</text></view>
          <text class="hero-title">花月播客</text>
          <text class="hero-lead">为每位花神生成专属诗境文案，聆听千年花木的诗意回响。</text>
        </view>
      </view>

      <view class="section-heading">
        <view><text class="section-kicker">CHOOSE MONTH</text><text class="section-title">选择花神</text></view>
      </view>
      
      <scroll-view scroll-x class="month-scroll">
        <view class="month-tabs">
          <view 
            v-for="item in flowers" 
            :key="item.month" 
            class="month-tab" 
            :class="selectedMonth === item.month ? 'active' : ''"
            @click="selectMonth(item.month)"
          >
            <text class="tab-number">{{ String(item.month).padStart(2, '0') }}</text>
            <text class="tab-name">{{ item.flower }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="current != null" class="flower-info-card glass">
        <view class="info-left">
          <text class="info-name">{{ current.flower }}</text>
          <text class="info-meta">花神 {{ current.godName }} · {{ current.dynasty }}</text>
          <text class="info-poem">“{{ current.poem }}”</text>
        </view>
        <image class="info-image" :src="flowerImage(selectedMonth)" mode="aspectFill" />
      </view>

      <view class="gen-wrap">
        <view class="gen-btn" :class="generating ? 'disabled' : ''" @click="generatePodcast">
          <text class="gen-btn-text">{{ generating ? '生成中…' : '生成播客文案' }}</text>
        </view>
        <view class="key-tip" @click="goProfile">
          <text class="key-tip-text">未配置 API Key？前往个人中心设置 →</text>
        </view>
      </view>

      <view v-if="errorMsg !== ''" class="error-card">
        <text class="error-text">{{ errorMsg }}</text>
      </view>

      <view v-if="podcastText !== '' || paragraphs.length > 0" class="result-card glass">
        <view class="result-header">
          <view><text class="section-kicker">PODCAST SCRIPT</text><text class="result-title">播客文案</text></view>
          <view class="result-actions">
            <view v-if="aiSource !== ''" class="source-tag">
              <text class="source-tag-text">{{ aiSource }}</text>
            </view>
            <view class="copy-btn" @click="copyText">
              <text class="copy-btn-text">复制文案</text>
            </view>
          </view>
        </view>

        <view class="podcast-wrap">
          <view class="podcast-bg-image">
            <image :src="flowerImage(selectedMonth)" mode="aspectFill" />
          </view>
          <view class="podcast-content">
            <view 
              v-for="(para, idx) in paragraphs" 
              :key="idx" 
              class="para-item"
              :class="[
                para.type === 'title' ? 'para-title' : 'para-body',
                para.speaker === 'male' ? 'para-male' : '',
                para.speaker === 'female' ? 'para-female' : ''
              ]"
            >
              <text v-if="para.speaker" class="para-speaker">{{ para.speaker === 'male' ? '男' : '女' }}：</text>
              <text>{{ para.text }}</text>
            </view>
          </view>
        </view>

        <view class="audio-section" v-if="audioUrls.length > 0">
          <view class="audio-header">
            <text class="audio-title">语音播放</text>
            <view class="audio-control">
              <view 
                class="voice-btn" 
                :class="playingVoice === 'male' ? 'active' : ''"
                @click="playVoice('male')"
              >
                <text>男声</text>
              </view>
              <view 
                class="voice-btn" 
                :class="playingVoice === 'female' ? 'active' : ''"
                @click="playVoice('female')"
              >
                <text>女声</text>
              </view>
            </view>
          </view>
          <view class="audio-player">
            <view 
              class="play-btn" 
              :class="isPlaying ? 'playing' : ''"
              @click="togglePlay"
            >
              <text>{{ isPlaying ? '⏸' : '▶' }}</text>
            </view>
            <view class="audio-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
              </view>
              <text class="progress-time">{{ currentTime }} / {{ totalTime }}</text>
            </view>
            <view class="audio-speed" @click="toggleSpeed">
              <text>{{ playbackSpeed }}x</text>
            </view>
          </view>
        </view>

        <view class="share-hint">
          <text class="share-hint-text">✨ 文案已生成，可复制后分享或发布</text>
        </view>
      </view>

      <view v-if="podcastText === '' && paragraphs.length === 0 && !generating && errorMsg === ''" class="empty-card glass">
        <text class="empty-icon">🎙</text>
        <text class="empty-title">点击上方按钮</text>
        <text class="empty-desc">为当前花神生成专属播客文案</text>
      </view>

      <AppFooter />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppFooter from '../../components/app-footer.vue'
import { FLOWERS, getFlowerByMonth, getFlowerImage, type FlowerItem } from '../../utils/flowerData'
import { getPodcastDialogStream, generateTTSDialog } from '../../utils/api'

type ParaItem = {
  text: string
  type: string
  speaker?: string
}

const flowers = ref<FlowerItem[]>(FLOWERS)
const selectedMonth = ref<number>(1)
const current = ref<FlowerItem | null>(null)
const podcastText = ref<string>('')
const generating = ref<boolean>(false)
const paragraphs = ref<ParaItem[]>([])
const aiSource = ref<string>('')
const errorMsg = ref<string>('')
const audioUrls = ref<{ speaker: string; url: string; text: string }[]>([])
const isPlaying = ref<boolean>(false)
const playingVoice = ref<string>('male')
const currentAudioIndex = ref<number>(0)
const playbackSpeed = ref<number>(1)
const audioContext = ref<AudioContext | null>(null)
const currentTime = ref('00:00')
const totalTime = ref('00:00')

const progressPercent = computed(() => {
  if (audioUrls.value.length === 0) return 0
  return Math.round((currentAudioIndex.value / audioUrls.value.length) * 100)
})

function flowerImage(month: number): string {
  return getFlowerImage(month)
}

function selectMonth(month: number) {
  selectedMonth.value = month
  current.value = getFlowerByMonth(month)
  podcastText.value = ''
  paragraphs.value = []
  aiSource.value = ''
  errorMsg.value = ''
  audioUrls.value = []
  stopAudio()
}

function parseParagraphs(text: string): ParaItem[] {
  return text.split('\n').map(line => {
    const lineTrimmed = line.trim()
    if (lineTrimmed === '') {
      return { text: ' ', type: 'empty' } as ParaItem
    }
    if (lineTrimmed.startsWith('【') && lineTrimmed.endsWith('】')) {
      return { text: lineTrimmed, type: 'title' } as ParaItem
    }
    const matched = lineTrimmed.match(/^(男|女)\s*[：:](.+)$/)
    if (matched) {
      return {
        text: matched[2].trim(),
        type: 'body',
        speaker: matched[1] === '男' ? 'male' : 'female'
      } as ParaItem
    }
    return { text: lineTrimmed, type: 'body' } as ParaItem
  }).filter(p => p.text.trim() !== '' || p.type === 'empty')
}

function buildLocalText(f: FlowerItem): string {
  return [
    `【${f.monthName}花神 · ${f.flower}】`,
    '',
    '男：各位听众朋友们，欢迎来到花月诗境播客。我是主持人阿明，今天我们将带大家一起走进中国传统花卉文化的诗意世界。',
    '女：大家好，我是主持人小雅。今天我们要聊的是' + f.monthName + '的' + f.flower + '，这可是这个月份最具代表性的花卉呢！',
    '',
    '男：' + f.flower + '，在中国传统文化中有着极其重要的地位。小雅，你知道它的花神是谁吗？',
    '女：我知道！它的花神是' + f.godName + '，来自' + f.dynasty + '时期。' + f.godName + '与' + f.flower + '之间有着深厚的渊源，这段故事已经成为了千古流传的佳话。',
    '',
    '男：没错。说到' + f.flower + '，就不得不提到那句脍炙人口的诗句："' + f.poem + '"。这句诗生动地描绘了' + f.flower + '的独特韵味，让我们仿佛身临其境，感受到那份诗意之美。',
    '女：是的，这句诗真是太美了。' + f.flower + '承载着丰富的文化意象。' + f.cultureImage + '它不仅是一种美丽的花卉，更是一种精神象征，寄托着人们对美好生活的向往。',
    '',
    '男：在' + f.dynasty + '时期，诗词创作达到了鼎盛。' + f.dynastyStyle + f.flower + '作为重要的创作主题，被众多文人墨客吟咏，留下了大量传世佳作，至今仍被人们传颂。',
    '女：' + f.aiScript,
    '',
    '男：说到这里，我还想补充一点。' + f.flower + '在中国园林艺术中也占有重要地位，古人常在庭院中种植' + f.flower + '，以寄托情怀，营造诗意氛围。',
    '女：是啊，' + f.flower + '的美不仅在于外表，更在于它所承载的文化内涵和精神品格。每一次欣赏' + f.flower + '，都是一次与传统文化的对话。',
    '',
    '男：让我们再次回味那句经典诗句："' + f.poem + '"。' + f.flower + '的美丽与神韵，将永远铭刻在中华文化的长河中，成为我们民族审美的重要组成部分。',
    '女：感谢您收听花月诗境播客。希望今天的分享能让您对' + f.flower + '有更深的了解和喜爱。下期我们将继续探索其他月令花卉的奥秘，敬请期待！',
    '',
    '男：再见！',
    '女：再见！'
  ].join('\n')
}

function streamDisplay(text: string) {
  const allParas = parseParagraphs(text)
  let idx = 0
  const addNext = () => {
    if (idx < allParas.length) {
      paragraphs.value = allParas.slice(0, idx + 1)
      idx++
      setTimeout(addNext, 120)
    } else {
      podcastText.value = text
      generating.value = false
      generateAudio(text)
    }
  }
  setTimeout(addNext, 300)
}

async function generatePodcast() {
  if (generating.value || current.value == null) return
  generating.value = true
  podcastText.value = ''
  paragraphs.value = []
  aiSource.value = ''
  errorMsg.value = ''
  audioUrls.value = []

  const f = current.value!

  try {
    await getPodcastDialogStream(f.month, (data: any) => {
      if (data.full) {
        aiSource.value = data.source === 'ai' ? 'AI · 云端生成' : '本地模板'
        paragraphs.value = parseParagraphs(data.full)
      }
      if (data.done && data.full) {
        podcastText.value = data.full
      }
    })
  } catch (e) {
    console.error('Stream error:', e)
  } finally {
    generating.value = false
    if (podcastText.value === '') {
      aiSource.value = '本地模板'
      streamDisplay(buildLocalText(f))
    } else {
      generateAudio(podcastText.value)
    }
  }
}

async function generateAudio(text: string) {
  if (!text) return
  try {
    const paras = parseParagraphs(text).filter(p => p.type === 'body' && p.text.trim())
    const dialogParas = paras.map(p => ({
      speaker: p.speaker || 'male',
      text: p.text
    }))
    const res = await generateTTSDialog(dialogParas, text)
    if (res.success && res.audios) {
      audioUrls.value = res.audios.filter((a: any) => a.url)
      if (audioUrls.value.length > 0) {
        totalTime.value = formatTime(audioUrls.value.length * 15)
      }
    }
  } catch (e) {
    console.error('TTS error:', e)
  }
}

let audioTimer: number | null = null

function togglePlay() {
  if (audioUrls.value.length === 0) return
  if (isPlaying.value) {
    stopAudio()
  } else {
    playNextAudio()
  }
}

function playVoice(voice: string) {
  playingVoice.value = voice
  currentAudioIndex.value = 0
  stopAudio()
}

function toggleSpeed() {
  const speeds = [1, 1.25, 1.5, 2]
  const idx = speeds.indexOf(playbackSpeed.value)
  playbackSpeed.value = speeds[(idx + 1) % speeds.length]
}

function playNextAudio() {
  if (currentAudioIndex.value >= audioUrls.value.length) {
    currentAudioIndex.value = 0
    isPlaying.value = false
    return
  }
  const audioItem = audioUrls.value[currentAudioIndex.value]
  if (!audioItem.url) {
    currentAudioIndex.value++
    playNextAudio()
    return
  }
  const audio = new Audio(audioItem.url)
  audio.playbackRate = playbackSpeed.value
  audio.onended = () => {
    currentAudioIndex.value++
    if (isPlaying.value) {
      playNextAudio()
    }
  }
  audio.play().catch(() => {})
  isPlaying.value = true
  updateTime()
}

function updateTime() {
  if (!isPlaying.value) return
  const elapsed = currentAudioIndex.value * 15
  currentTime.value = formatTime(elapsed)
  audioTimer = setTimeout(updateTime, 1000) as unknown as number
}

function stopAudio() {
  isPlaying.value = false
  if (audioTimer) {
    clearTimeout(audioTimer)
    audioTimer = null
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

onUnmounted(() => {
  stopAudio()
})

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
@import '../../common/theme.css';

.page-shell { height: 100vh; background: var(--paper); position: relative; }
.site-container { width: calc(100% - 48px); max-width: 1064px; margin: 0 auto; padding: 32px 0 20px; position: relative; z-index: 1; }

.hero-card { border-radius: 28px; padding: 44px 52px; overflow: hidden; background: linear-gradient(135deg, #183f34, #2e584c); }
.hero-copy { gap: 12px; }
.eyebrow { padding: 8px 14px; border: 1px solid rgba(255,255,255,.25); border-radius: 100px; color: rgba(255,255,255,.7); font-size: 12px; letter-spacing: 2px; display: inline-block; }
.hero-title { margin-top: 18px; font: 46px/1.1 'STKaiti', 'KaiTi', serif; color: #fff; letter-spacing: 4px; }
.hero-lead { margin-top: 16px; color: rgba(255,255,255,.68); font-size: 15px; line-height: 1.9; max-width: 680px; }

.section-heading { margin: 44px 2px 22px; flex-direction: row; align-items: flex-end; justify-content: space-between; }
.section-kicker { color: #829b92; font: 11px Georgia, serif; letter-spacing: 3px; }
.section-title { margin-top: 10px; color: #193e34; font: 34px 'STKaiti', 'KaiTi', serif; letter-spacing: 3px; }

.month-scroll { width: 100%; white-space: nowrap; }
.month-tabs { flex-direction: row; gap: 10px; padding-right: 4px; }
.month-tab { min-width: 82px; padding: 12px 16px; border-radius: 14px; align-items: center; gap: 4px; color: #789087; background: rgba(255,255,255,.75); border: 1px solid #d7e3de; cursor: pointer; transition: .3s; flex-shrink: 0; }
.month-tab.active { background: #183f34; color: #fff; border-color: #183f34; box-shadow: 0 10px 24px rgba(24,63,52,.18); }
.tab-number { font: 16px Georgia, serif; }
.tab-name { font-size: 12px; }

.flower-info-card { margin-top: 22px; border-radius: 24px; padding: 26px 30px; display: flex; flex-direction: row; align-items: center; gap: 22px; }
.info-left { flex: 1; gap: 6px; }
.info-name { font: 32px 'STKaiti', 'KaiTi', serif; color: #183f34; letter-spacing: 2px; }
.info-meta { color: #859992; font-size: 13px; }
.info-poem { margin-top: 12px; font: 16px/1.7 'STKaiti', 'KaiTi', serif; color: #5a736b; }
.info-image { width: 140px; height: 140px; border-radius: 18px; flex-shrink: 0; }

.gen-wrap { margin-top: 24px; }
.gen-btn { height: 54px; border-radius: 100px; align-items: center; justify-content: center; background: #183f34; box-shadow: 0 12px 26px rgba(24,63,52,.18); cursor: pointer; transition: .3s; }
.gen-btn.disabled { background: #8ba099; box-shadow: none; cursor: not-allowed; }
.gen-btn-text { font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 2px; }
.key-tip { margin-top: 14px; text-align: center; }
.key-tip-text { font-size: 13px; color: #6a837a; }

.error-card { margin-top: 16px; padding: 18px 22px; border-radius: 16px; background: #fef2f2; border: 1px solid #fecaca; }
.error-text { font-size: 14px; color: #dc2626; line-height: 1.6; }

.result-card { margin-top: 24px; border-radius: 24px; padding: 38px; position: relative; overflow: hidden; }
.result-header { flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.result-title { margin-top: 10px; font: 28px 'STKaiti', 'KaiTi', serif; color: #183f34; }
.result-actions { flex-direction: row; gap: 12px; align-items: center; }
.source-tag { padding: 6px 14px; border-radius: 100px; background: #e9f1ed; }
.source-tag-text { font-size: 11px; color: #4a6b61; font-weight: 500; }
.copy-btn { padding: 10px 20px; border-radius: 100px; background: #183f34; cursor: pointer; }
.copy-btn-text { font-size: 13px; color: #fff; }

.podcast-wrap { position: relative; min-height: 400px; border-radius: 18px; overflow: hidden; }
.podcast-bg-image { position: absolute; inset: 0; z-index: 0; }
.podcast-bg-image image { width: 100%; height: 100%; opacity: 0.08; filter: blur(4px); transform: scale(1.05); }
.podcast-content { position: relative; z-index: 1; gap: 14px; padding: 24px; background: rgba(255,255,255,.5); backdrop-filter: blur(8px); border-radius: 18px; }
.para-item { padding: 10px 0; }
.para-title { font-size: 22px; font-weight: 700; color: #183f34; line-height: 1.6; margin-bottom: 16px; text-align: center; }
.para-body { font-size: 17px; color: #3d544e; line-height: 2.3; text-indent: 2em; }
.para-male .para-speaker { color: #2563eb; font-weight: 600; margin-right: 6px; font-size: 17px; }
.para-female .para-speaker { color: #db2777; font-weight: 600; margin-right: 6px; font-size: 17px; }

.audio-section { margin-top: 32px; padding-top: 28px; border-top: 1px solid #e5ede9; }
.audio-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.audio-title { font: 20px 'STKaiti', 'KaiTi', serif; color: #183f34; }
.audio-control { flex-direction: row; gap: 8px; }
.voice-btn { padding: 8px 16px; border-radius: 100px; background: #f7faf8; border: 1px solid #d7e3de; font-size: 13px; color: #647971; cursor: pointer; }
.voice-btn.active { background: #183f34; color: #fff; border-color: #183f34; }
.audio-player { flex-direction: row; align-items: center; gap: 16px; }
.play-btn { width: 44px; height: 44px; border-radius: 50%; background: #183f34; align-items: center; justify-content: center; color: #fff; font-size: 16px; cursor: pointer; }
.play-btn.playing { background: #a87462; }
.audio-progress { flex: 1; }
.progress-bar { height: 6px; border-radius: 100px; background: #e5ede9; }
.progress-fill { height: 100%; border-radius: 100px; background: #183f34; transition: width .3s; }
.progress-time { display: block; margin-top: 6px; font-size: 11px; color: #859992; }
.audio-speed { padding: 6px 12px; border-radius: 8px; background: #f7faf8; font-size: 12px; color: #647971; cursor: pointer; }

.share-hint { margin-top: 28px; padding: 18px 24px; border-radius: 14px; background: #f0f7f5; align-items: center; }
.share-hint-text { font-size: 13px; color: #5a736b; }

.empty-card { margin-top: 50px; padding: 60px 30px; border-radius: 24px; align-items: center; text-align: center; }
.empty-icon { font-size: 56px; }
.empty-title { margin-top: 16px; font: 22px 'STKaiti', 'KaiTi', serif; color: #284c42; }
.empty-desc { margin-top: 8px; font-size: 14px; color: #859992; }

@media (max-width: 768px) {
  .site-container { width: calc(100% - 28px); padding-top: 18px; }
  .hero-card { padding: 30px 26px; border-radius: 22px; }
  .hero-title { font-size: 36px; }
  .hero-lead { font-size: 14px; }
  .section-heading { flex-direction: column; align-items: flex-start; gap: 8px; }
  .section-title { font-size: 28px; }
  .flower-info-card { flex-direction: column; padding: 22px; gap: 18px; }
  .info-image { width: 120px; height: 120px; }
  .gen-btn { height: 48px; }
  .result-card { padding: 26px 22px; }
  .result-header { flex-direction: column; gap: 12px; }
  .para-body { font-size: 14px; }
  .audio-player { flex-direction: column; gap: 12px; }
  .audio-progress { width: 100%; }
}
</style>
