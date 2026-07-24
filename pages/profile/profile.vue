<template>
  <scroll-view class="page-shell" scroll-y>
    <view class="site-container">
      <view v-if="isLogin" class="user-header glass">
        <view class="avatar" :style="'background:' + avatarColor">
          <text class="avatar-text">{{ displayName.slice(0,1) }}</text>
        </view>
        <view class="user-info">
          <view class="user-name-row">
            <text class="user-name">{{ displayName }}</text>
            <view v-if="userInfo != null && userInfo.role === 'admin'" class="admin-badge">
              <text class="admin-badge-text">管理员</text>
            </view>
          </view>
          <text class="user-sub">
            {{ userInfo != null && userInfo.hasInviteCode ? '邀请码注册用户' : '自备 Key 用户' }}
          </text>
        </view>
        <view class="logout-btn" @click="logout">
          <text class="logout-text">退出</text>
        </view>
      </view>

      <view v-else class="guest-header glass">
        <view class="guest-info">
          <text class="guest-title">花月诗境</text>
          <text class="guest-sub">登录后解锁更多功能</text>
        </view>
        <view class="login-btn" @click="goLogin">
          <text class="login-btn-text">登录 / 注册</text>
        </view>
      </view>

      <view class="section-card glass">
        <view><text class="section-kicker">AI CONFIG</text><text class="section-title">AI 配置</text></view>
        <text class="section-desc">
          {{ isLogin && userInfo != null && userInfo.hasInviteCode
            ? '已通过邀请码注册，可直接使用系统 AI，也可填写自己的 Key 使用更多额度。'
            : '填写 API Key 以使用 AI 播客功能。' }}
        </text>

        <view v-if="isLogin && userInfo != null && userInfo.hasInviteCode" class="toggle-row">
          <text class="toggle-label">使用自己的 API Key</text>
          <switch :checked="useOwnKey" @change="onToggleOwnKey($event)" color="#183f34" />
        </view>

        <view v-if="shouldShowKeyForm">
          <view class="field-wrap">
            <text class="field-label">API Key</text>
            <view class="input-row">
              <input
                class="field-input"
                v-model="apiKey"
                :password="!showKey"
                placeholder="sk-..."
                placeholder-style="color:#94a3b8"
                maxlength="200"
              />
              <view class="eye-btn" @click="showKey = !showKey">
                <text class="eye-text">{{ showKey ? '隐藏' : '显示' }}</text>
              </view>
            </view>
          </view>
          <view class="field-wrap">
            <text class="field-label">API Base URL <text class="optional-tag">可选</text></text>
            <input
              class="field-input"
              v-model="apiBaseUrl"
              placeholder="默认 https://api.openai.com/v1"
              placeholder-style="color:#94a3b8"
              maxlength="200"
            />
          </view>
          <view class="action-row">
            <view class="btn-secondary" @click="testKey">
              <text class="btn-secondary-text">{{ testing ? '验证中…' : '验证 Key' }}</text>
            </view>
            <view class="btn-primary-sm" @click="saveKey">
              <text class="btn-primary-sm-text">{{ saving ? '保存中…' : '保存配置' }}</text>
            </view>
          </view>
          <view v-if="keyMsg !== ''" class="msg-box" :class="keyMsgOk ? 'msg-success' : 'msg-error'">
            <text class="msg-text">{{ keyMsg }}</text>
          </view>
        </view>

        <view v-else class="hint-green">
          <text class="hint-green-text">✓ 当前使用系统共享 AI，无需配置</text>
        </view>
      </view>

      <view v-if="isLogin && userInfo != null && userInfo.role === 'admin'" class="section-card glass admin-section">
        <view><text class="section-kicker">ADMIN PANEL</text><text class="section-title">管理员面板</text></view>

        <view v-if="adminStats != null" class="stats-row">
          <view class="stat-box">
            <text class="stat-num">{{ adminStats.totalUsers }}</text>
            <text class="stat-lbl">注册用户</text>
          </view>
          <view class="stat-box">
            <text class="stat-num">{{ adminStats.unusedCodes }}</text>
            <text class="stat-lbl">可用邀请码</text>
          </view>
          <view class="stat-box">
            <text class="stat-num">{{ adminStats.usedCodes }}</text>
            <text class="stat-lbl">已用邀请码</text>
          </view>
        </view>

        <view class="field-wrap">
          <text class="field-label">生成邀请码</text>
          <view class="input-row">
            <input
              class="field-input" style="width:120rpx"
              v-model="genCountStr" type="number"
              placeholder="数量" placeholder-style="color:#94a3b8" maxlength="2"
            />
            <input
              class="field-input" style="margin-left:12rpx"
              v-model="genNote" placeholder="备注（可选）"
              placeholder-style="color:#94a3b8" maxlength="40"
            />
          </view>
          <view class="btn-dark" @click="generateCodes">
            <text class="btn-dark-text">{{ genLoading ? '生成中…' : '生成邀请码' }}</text>
          </view>
        </view>

        <view v-if="generatedCodes.length > 0" class="codes-box">
          <view class="codes-box-header">
            <text class="codes-box-label">已生成（点击复制）</text>
            <view class="copy-all-btn" @click="copyAll">
              <text class="copy-all-text">复制全部</text>
            </view>
          </view>
          <view class="chips-row">
            <view v-for="c in generatedCodes" :key="c" class="code-chip" @click="copyOne(c)">
              <text class="code-chip-text">{{ c }}</text>
            </view>
          </view>
        </view>

        <view>
          <view class="list-header">
            <text class="field-label">可用邀请码</text>
            <view class="refresh-btn" @click="loadAdminData">
              <text class="refresh-text">刷新</text>
            </view>
          </view>
          <view v-if="unusedCodes.length === 0" class="empty-hint">
            <text class="empty-hint-text">暂无可用邀请码</text>
          </view>
          <view v-for="item in unusedCodes" :key="item._id" class="code-row">
            <view class="code-row-left" @click="copyOne(item.code)">
              <text class="code-mono">{{ item.code }}</text>
              <text v-if="item.note !== ''" class="code-note">{{ item.note }}</text>
            </view>
            <view class="del-btn" @click="deleteCode(item._id)">
              <text class="del-text">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card glass">
        <view><text class="section-kicker">ABOUT</text><text class="section-title">关于项目</text></view>
        <text class="about-text">花月诗境 · 十二月令花神诗词智能导览系统</text>
        <text class="version-text">v1.0.0 · 以数字技术传承中华诗词文化之美</text>
      </view>

      <AppFooter />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import AppFooter from '../../components/app-footer.vue'
import {
  isLoggedIn, getLocalUserInfo, clearAuth, getToken,
  callUserAuth, callAiProxy, callInviteCode, saveAuth, type UserInfo
} from '../../utils/auth'

type AdminStats = {
  totalUsers : number
  unusedCodes : number
  usedCodes : number
  totalCodes : number
}

type CodeItem = {
  _id : string
  code : string
  note : string
}

const isLogin = ref<boolean>(false)
const userInfo = ref<UserInfo | null>(null)
const displayName = ref<string>('游客')
const avatarColor = ref<string>('#183f34')

const apiKey = ref<string>('')
const apiBaseUrl = ref<string>('')
const useOwnKey = ref<boolean>(false)
const showKey = ref<boolean>(false)
const testing = ref<boolean>(false)
const saving = ref<boolean>(false)
const keyMsg = ref<string>('')
const keyMsgOk = ref<boolean>(false)

const adminStats = ref<AdminStats | null>(null)
const unusedCodes = ref<CodeItem[]>([])
const generatedCodes = ref<string[]>([])
const genCountStr = ref<string>('5')
const genNote = ref<string>('')
const genLoading = ref<boolean>(false)

const COLORS : string[] = ['#183f34', '#a87462', '#587e72', '#2e584c', '#315e51']

const shouldShowKeyForm = computed(() : boolean => {
  if (!isLogin.value) return true
  if (userInfo.value == null) return true
  if (!userInfo.value!.hasInviteCode) return true
  return useOwnKey.value
})

function refreshState() {
  isLogin.value = isLoggedIn()
  const u = getLocalUserInfo()
  userInfo.value = u
  if (u != null) {
    displayName.value = u!.username
    avatarColor.value = COLORS[u!.username.charCodeAt(0) % COLORS.length]
    useOwnKey.value = u!.useOwnKey
    apiBaseUrl.value = u!.apiBaseUrl || ''
  } else {
    displayName.value = '游客'
    apiKey.value = (uni.getStorageSync('guest_api_key') as string) || ''
    apiBaseUrl.value = (uni.getStorageSync('guest_api_base') as string) || ''
  }
}

async function loadAdminData() {
  const u = userInfo.value
  if (u == null || u!.role !== 'admin') return
  try {
    const statsRes = await callInviteCode({ action: 'stats', token: getToken() })
    if (statsRes.code === 0) adminStats.value = statsRes.stats as AdminStats
    const listRes = await callInviteCode({ action: 'list', token: getToken(), onlyUnused: true, pageSize: 50 })
    if (listRes.code === 0) unusedCodes.value = listRes.list as CodeItem[]
  } catch {}
}

function onToggleOwnKey(e : any) {
  useOwnKey.value = (e.detail.value as boolean)
}

async function testKey() {
  if (testing.value || apiKey.value.trim() === '') {
    keyMsg.value = '请先填写 API Key'
    keyMsgOk.value = false
    return
  }
  testing.value = true
  keyMsg.value = ''
  try {
    const res = await callAiProxy({
      action: 'validateApiKey',
      apiKey: apiKey.value.trim(),
      apiBaseUrl: apiBaseUrl.value.trim(),
    })
    keyMsgOk.value = res.code === 0
    keyMsg.value = res.message as string
  } catch {
    keyMsg.value = '验证请求失败，请检查网络'
    keyMsgOk.value = false
  } finally {
    testing.value = false
  }
}

async function saveKey() {
  if (saving.value) return
  keyMsg.value = ''
  saving.value = true
  try {
    if (!isLogin.value) {
      uni.setStorageSync('guest_api_key', apiKey.value.trim())
      uni.setStorageSync('guest_api_base', apiBaseUrl.value.trim())
      keyMsg.value = '配置已保存到本地'
      keyMsgOk.value = true
      return
    }
    const res = await callUserAuth({
      action: 'updateApiKey',
      token: getToken(),
      apiKey: apiKey.value.trim(),
      apiBaseUrl: apiBaseUrl.value.trim(),
      useOwnKey: useOwnKey.value,
    })
    keyMsgOk.value = res.code === 0
    keyMsg.value = res.message as string
    if (res.code === 0) {
      const u = getLocalUserInfo()
      if (u != null) {
        u!.useOwnKey = useOwnKey.value
        u!.apiBaseUrl = apiBaseUrl.value.trim()
        u!.hasApiKey = apiKey.value.trim() !== ''
        saveAuth(getToken(), u!)
        userInfo.value = u
      }
    }
  } catch {
    keyMsg.value = '保存失败，请重试'
    keyMsgOk.value = false
  } finally {
    saving.value = false
  }
}

async function generateCodes() {
  if (genLoading.value) return
  const count = parseInt(genCountStr.value) || 1
  if (count < 1 || count > 50) {
    uni.showToast({ title: '数量需在 1-50 之间', icon: 'none' })
    return
  }
  genLoading.value = true
  generatedCodes.value = []
  try {
    const res = await callInviteCode({ action: 'create', token: getToken(), count, note: genNote.value.trim() })
    if (res.code === 0) {
      generatedCodes.value = res.codes as string[]
      await loadAdminData()
      uni.showToast({ title: `已生成 ${count} 个邀请码`, icon: 'success' })
    } else {
      uni.showToast({ title: res.message as string, icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '生成失败，请重试', icon: 'none' })
  } finally {
    genLoading.value = false
  }
}

async function deleteCode(id : string) {
  const res = await callInviteCode({ action: 'delete', token: getToken(), codeId: id })
  if (res.code === 0) {
    await loadAdminData()
    uni.showToast({ title: '已删除', icon: 'success' })
  } else {
    uni.showToast({ title: res.message as string, icon: 'none' })
  }
}

function copyOne(code : string) {
  uni.setClipboardData({ data: code, success: () => uni.showToast({ title: '已复制', icon: 'success' }) })
}

function copyAll() {
  uni.setClipboardData({
    data: generatedCodes.value.join('\n'),
    success: () => uni.showToast({ title: `已复制 ${generatedCodes.value.length} 个`, icon: 'success' })
  })
}

function goLogin() { uni.navigateTo({ url: '/pages/auth/auth' }) }

function logout() {
  uni.showModal({
    title: '确认退出',
    content: '退出后需重新登录才能使用 AI 功能',
    success: (res) => {
      if (res.confirm) {
        clearAuth()
        refreshState()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

onLoad(() => { refreshState() })
onShow(() => {
  refreshState()
  if (isLogin.value && userInfo.value != null && userInfo.value!.role === 'admin') {
    loadAdminData()
  }
})
</script>

<style>
@import '../../common/theme.css';

.page-shell { height: 100vh; background: var(--paper); position: relative; }
.site-container { width: calc(100% - 48px); max-width: 980px; margin: 0 auto; padding: 32px 0 20px; position: relative; z-index: 1; }

.user-header, .guest-header { border-radius: 24px; padding: 28px 32px; display: flex; flex-direction: row; align-items: center; gap: 20px; background: linear-gradient(135deg, #183f34, #315e51); }
.avatar { width: 72px; height: 72px; border-radius: 50%; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-text { font-size: 30px; font-weight: 700; color: #fff; }
.user-info { flex: 1; }
.user-name-row { flex-direction: row; align-items: center; gap: 12px; }
.user-name { font-size: 28px; font-weight: 700; color: #fff; }
.admin-badge { background: rgba(255,255,255,.2); border-radius: 10px; padding: 4px 12px; }
.admin-badge-text { font-size: 12px; color: #fff; font-weight: 500; }
.user-sub { font-size: 13px; color: rgba(255,255,255,.7); }
.logout-btn { background: rgba(255,255,255,.15); border-radius: 12px; padding: 12px 20px; }
.logout-text { font-size: 14px; color: #fff; }
.guest-info { flex: 1; }
.guest-title { font: 28px 'STKaiti', 'KaiTi', serif; color: #fff; letter-spacing: 2px; }
.guest-sub { font-size: 13px; color: rgba(255,255,255,.7); }
.login-btn { background: rgba(255,255,255,.15); border-radius: 12px; padding: 12px 24px; }
.login-btn-text { font-size: 14px; color: #fff; font-weight: 600; }

.section-card { margin-top: 22px; border-radius: 20px; padding: 30px; gap: 14px; }
.admin-section { border: 1px solid #fde68a; }
.section-kicker { color: #829b92; font: 11px Georgia, serif; letter-spacing: 3px; }
.section-title { margin-top: 8px; font: 26px 'STKaiti', 'KaiTi', serif; color: #183f34; }
.section-desc { font-size: 14px; color: #647971; line-height: 1.7; }

.toggle-row { flex-direction: row; align-items: center; justify-content: space-between; padding: 4px 0; }
.toggle-label { font-size: 14px; color: #334155; font-weight: 500; }

.field-wrap { gap: 10px; }
.field-label { font-size: 13px; font-weight: 600; color: #526b63; }
.optional-tag { font-size: 11px; color: #859992; font-weight: 400; }
.input-row { flex-direction: row; align-items: center; }
.field-input { flex: 1; background: #f7faf8; border-radius: 12px; padding: 16px; font-size: 15px; color: #183f34; border: 1px solid #d7e3de; }
.eye-btn { background: #f1f5f9; border-radius: 10px; padding: 12px 14px; margin-left: 10px; }
.eye-text { font-size: 12px; color: #6a837a; }

.action-row { flex-direction: row; gap: 12px; }
.btn-secondary { flex: 1; border-radius: 12px; padding: 16px; align-items: center; border: 1px solid #52786d; }
.btn-secondary-text { font-size: 14px; color: #426b5f; font-weight: 600; }
.btn-primary-sm { flex: 1; background: #183f34; border-radius: 12px; padding: 16px; align-items: center; }
.btn-primary-sm-text { font-size: 14px; color: #fff; font-weight: 600; }

.msg-box { border-radius: 12px; padding: 14px 18px; }
.msg-success { background: #f0fdf4; border: 1px solid #86efac; }
.msg-success .msg-text { color: #15803d; }
.msg-error { background: #fef2f2; border: 1px solid #fecaca; }
.msg-error .msg-text { color: #dc2626; }
.msg-text { font-size: 14px; }

.hint-green { background: #f0fdf4; border-radius: 12px; padding: 18px 22px; }
.hint-green-text { font-size: 14px; color: #15803d; font-weight: 500; }

.stats-row { flex-direction: row; gap: 10px; }
.stat-box { flex: 1; background: #f7faf8; border-radius: 12px; padding: 16px 10px; align-items: center; gap: 4px; }
.stat-num { font-size: 30px; font-weight: 700; color: #315e51; }
.stat-lbl { font-size: 12px; color: #859992; }

.btn-dark { background: #183f34; border-radius: 12px; padding: 16px; align-items: center; margin-top: 10px; }
.btn-dark-text { font-size: 14px; color: #fff; font-weight: 600; }

.codes-box { background: #f7faf8; border-radius: 12px; padding: 18px; gap: 10px; }
.codes-box-header { flex-direction: row; align-items: center; justify-content: space-between; }
.codes-box-label { font-size: 12px; color: #859992; }
.copy-all-btn { background: #183f34; border-radius: 8px; padding: 8px 16px; }
.copy-all-text { font-size: 12px; color: #fff; }

.chips-row { flex-direction: row; flex-wrap: wrap; gap: 8px; }
.code-chip { background: #e9f1ed; border-radius: 10px; padding: 8px 14px; }
.code-chip-text { font-size: 13px; color: #315e51; font-weight: 600; }

.list-header { flex-direction: row; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.refresh-btn { background: #f1f5f9; border-radius: 8px; padding: 6px 14px; }
.refresh-text { font-size: 12px; color: #426b5f; }

.empty-hint { padding: 16px 0; align-items: center; }
.empty-hint-text { font-size: 14px; color: #859992; }

.code-row { flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #e5ede9; }
.code-row:last-child { border-bottom: 0; }
.code-row-left { flex: 1; gap: 4px; }
.code-mono { font-size: 15px; font-weight: 600; color: #315e51; }
.code-note { font-size: 12px; color: #859992; }
.del-btn { background: #fef2f2; border-radius: 8px; padding: 8px 14px; }
.del-text { font-size: 12px; color: #dc2626; }

.about-text { font-size: 15px; color: #526b63; }
.version-text { font-size: 12px; color: #859992; }

@media (max-width: 600px) {
  .site-container { width: calc(100% - 28px); padding-top: 14px; }
  .user-header, .guest-header { border-radius: 20px; padding: 22px; }
  .guest-header { flex-direction: column; align-items: flex-start; }
  .login-btn { margin-top: 14px; }
  .section-card { padding: 22px; }
}
</style>
