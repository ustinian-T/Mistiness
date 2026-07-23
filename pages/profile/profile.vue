<template>
  <scroll-view class="page-bg" scroll-y>
    <view class="page-wrap">

      <!-- Logged-in header -->
      <view v-if="isLogin" class="user-header">
        <view class="avatar" :style="'background:' + avatarColor">
          <text class="avatar-text">{{ displayName.slice(0,1) }}</text>
        </view>
        <view class="user-info">
          <view class="user-name-row">
            <text class="user-name">{{ displayName }}</text>
            <view v-if="userInfo != null && userInfo!.role === 'admin'" class="admin-badge">
              <text class="admin-badge-text">绠＄悊鍛?/text>
            </view>
          </view>
          <text class="user-sub">
            {{ userInfo != null && userInfo!.hasInviteCode ? '閭€璇风爜娉ㄥ唽鐢ㄦ埛' : '鑷 Key 鐢ㄦ埛' }}
          </text>
        </view>
        <view class="logout-btn" @click="logout">
          <text class="logout-text">閫€鍑?/text>
        </view>
      </view>

      <!-- Guest header -->
      <view v-else class="guest-header">
        <view class="guest-info">
          <text class="guest-title">鑺辨湀璇楀</text>
          <text class="guest-sub">鐧诲綍鍚庤В閿佹洿澶氬姛鑳?/text>
        </view>
        <view class="login-btn" @click="goLogin">
          <text class="login-btn-text">鐧诲綍 / 娉ㄥ唽</text>
        </view>
      </view>

      <!-- AI Config Section -->
      <view class="section-card">
        <text class="section-title">AI 閰嶇疆</text>
        <text class="section-desc">
          {{ isLogin && userInfo != null && userInfo!.hasInviteCode
            ? '宸查€氳繃閭€璇风爜娉ㄥ唽锛屽彲鐩存帴浣跨敤绯荤粺 AI锛屼篃鍙～鍐欒嚜宸辩殑 Key 浣跨敤鏇村棰濆害銆?
            : '濉啓 OpenAI 鍏煎 API Key 浠ヤ娇鐢?AI 鎾鍔熻兘銆? }}
        </text>

        <view v-if="isLogin && userInfo != null && userInfo!.hasInviteCode" class="toggle-row">
          <text class="toggle-label">浣跨敤鑷繁鐨?API Key</text>
          <switch :checked="useOwnKey" @change="onToggleOwnKey($event)" color="#2563eb" />
        </view>

        <view v-if="shouldShowKeyForm">
          <view class="field-wrap">
            <text class="field-label">API Key</text>
            <view class="input-row">
              <input
                class="field-input flex1"
                v-model="apiKey"
                :password="!showKey"
                placeholder="sk-..."
                placeholder-style="color:#94a3b8"
                maxlength="200"
              />
              <view class="eye-btn" @click="showKey = !showKey">
                <text class="eye-text">{{ showKey ? '闅愯棌' : '鏄剧ず' }}</text>
              </view>
            </view>
          </view>
          <view class="field-wrap" style="margin-top:16rpx">
            <text class="field-label">API Base URL <text class="optional-tag">鍙€?/text></text>
            <input
              class="field-input"
              v-model="apiBaseUrl"
              placeholder="榛樿 https://api.openai.com/v1"
              placeholder-style="color:#94a3b8"
              maxlength="200"
            />
          </view>
          <view class="action-row" style="margin-top:20rpx">
            <view class="btn-secondary" @click="testKey">
              <text class="btn-secondary-text">{{ testing ? '楠岃瘉涓€? : '楠岃瘉 Key' }}</text>
            </view>
            <view class="btn-primary-sm" @click="saveKey">
              <text class="btn-primary-sm-text">{{ saving ? '淇濆瓨涓€? : '淇濆瓨閰嶇疆' }}</text>
            </view>
          </view>
          <view v-if="keyMsg !== ''" class="msg-box" :style="keyMsgOk ? 'background:#f0fdf4;border-color:#86efac' : 'background:#fef2f2;border-color:#fecaca'">
            <text class="msg-text" :style="keyMsgOk ? 'color:#15803d' : 'color:#dc2626'">{{ keyMsg }}</text>
          </view>
        </view>

        <view v-else class="hint-green">
          <text class="hint-green-text">鉁?褰撳墠浣跨敤绯荤粺鍏变韩 AI锛屾棤闇€閰嶇疆</text>
        </view>
      </view>

      <!-- Admin Panel -->
      <view v-if="isLogin && userInfo != null && userInfo!.role === 'admin'" class="section-card admin-section">
        <text class="section-title">绠＄悊鍛橀潰鏉?/text>

        <view v-if="adminStats != null" class="stats-row">
          <view class="stat-box">
            <text class="stat-num">{{ adminStats!.totalUsers }}</text>
            <text class="stat-lbl">娉ㄥ唽鐢ㄦ埛</text>
          </view>
          <view class="stat-box">
            <text class="stat-num">{{ adminStats!.unusedCodes }}</text>
            <text class="stat-lbl">鍙敤閭€璇风爜</text>
          </view>
          <view class="stat-box">
            <text class="stat-num">{{ adminStats!.usedCodes }}</text>
            <text class="stat-lbl">宸茬敤閭€璇风爜</text>
          </view>
        </view>

        <view class="field-wrap" style="margin-top:8rpx">
          <text class="field-label">鐢熸垚閭€璇风爜</text>
          <view class="input-row" style="margin-top:8rpx">
            <input
              class="field-input" style="width:120rpx"
              v-model="genCountStr" type="number"
              placeholder="鏁伴噺" placeholder-style="color:#94a3b8" maxlength="2"
            />
            <input
              class="field-input flex1" style="margin-left:12rpx"
              v-model="genNote" placeholder="澶囨敞锛堝彲閫夛級"
              placeholder-style="color:#94a3b8" maxlength="40"
            />
          </view>
          <view class="btn-dark" style="margin-top:12rpx" @click="generateCodes">
            <text class="btn-dark-text">{{ genLoading ? '鐢熸垚涓€? : '鐢熸垚閭€璇风爜' }}</text>
          </view>
        </view>

        <view v-if="generatedCodes.length > 0" class="codes-box">
          <view class="codes-box-header">
            <text class="codes-box-label">宸茬敓鎴愶紙鐐瑰嚮澶嶅埗锛?/text>
            <view class="copy-all-btn" @click="copyAll">
              <text class="copy-all-text">澶嶅埗鍏ㄩ儴</text>
            </view>
          </view>
          <view class="chips-row">
            <view v-for="c in generatedCodes" :key="c" class="code-chip" @click="copyOne(c)">
              <text class="code-chip-text">{{ c }}</text>
            </view>
          </view>
        </view>

        <view style="margin-top:8rpx">
          <view class="list-header">
            <text class="field-label">鍙敤閭€璇风爜</text>
            <view class="refresh-btn" @click="loadAdminData">
              <text class="refresh-text">鍒锋柊</text>
            </view>
          </view>
          <view v-if="unusedCodes.length === 0" class="empty-hint">
            <text class="empty-hint-text">鏆傛棤鍙敤閭€璇风爜</text>
          </view>
          <view v-for="item in unusedCodes" :key="item._id" class="code-row">
            <view class="code-row-left" @click="copyOne(item.code)">
              <text class="code-mono">{{ item.code }}</text>
              <text v-if="item.note !== ''" class="code-note">{{ item.note }}</text>
            </view>
            <view class="del-btn" @click="deleteCode(item._id)">
              <text class="del-text">鍒犻櫎</text>
            </view>
          </view>
        </view>
      </view>

      <!-- About -->
      <view class="section-card">
        <text class="section-title">鍏充簬</text>
        <text class="about-text">鑺辨湀璇楀 路 鍗佷簩鏈堜护鑺辩璇楄瘝瀵艰</text>
        <text class="version-text">v1.0.0 路 浼犳壙涓崕璇楄瘝鏂囧寲涔嬬編</text>
        <text class="version-text" style="margin-top:8rpx">浣滆€咃細璋功瀹忥紝鍒樻€濆唹</text>
        <view class="icp-row">
          <text class="icp-link" @click="openICP">婀業CP澶?026021754鍙?2</text>
        </view>
        <text class="version-text">www.mistiness.tshai.top</text>
      </view>

      <view style="height:60rpx"></view>
    </view>
  </scroll-view>
</template>

<script setup lang="uts">
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
const displayName = ref<string>('娓稿')
const avatarColor = ref<string>('#2563eb')

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

const COLORS : string[] = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669']

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
    displayName.value = '娓稿'
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
    keyMsg.value = '璇峰厛濉啓 API Key'
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
    keyMsg.value = '楠岃瘉璇锋眰澶辫触锛岃妫€鏌ョ綉缁?
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
      keyMsg.value = '閰嶇疆宸蹭繚瀛樺埌鏈湴'
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
    keyMsg.value = '淇濆瓨澶辫触锛岃閲嶈瘯'
    keyMsgOk.value = false
  } finally {
    saving.value = false
  }
}

async function generateCodes() {
  if (genLoading.value) return
  const count = parseInt(genCountStr.value) || 1
  if (count < 1 || count > 50) {
    uni.showToast({ title: '鏁伴噺闇€鍦?1-50 涔嬮棿', icon: 'none' })
    return
  }
  genLoading.value = true
  generatedCodes.value = []
  try {
    const res = await callInviteCode({ action: 'create', token: getToken(), count, note: genNote.value.trim() })
    if (res.code === 0) {
      generatedCodes.value = res.codes as string[]
      await loadAdminData()
      uni.showToast({ title: `宸茬敓鎴?${count} 涓個璇风爜`, icon: 'success' })
    } else {
      uni.showToast({ title: res.message as string, icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '鐢熸垚澶辫触锛岃閲嶈瘯', icon: 'none' })
  } finally {
    genLoading.value = false
  }
}

async function deleteCode(id : string) {
  const res = await callInviteCode({ action: 'delete', token: getToken(), codeId: id })
  if (res.code === 0) {
    await loadAdminData()
    uni.showToast({ title: '宸插垹闄?, icon: 'success' })
  } else {
    uni.showToast({ title: res.message as string, icon: 'none' })
  }
}

function copyOne(code : string) {
  uni.setClipboardData({ data: code, success: () => uni.showToast({ title: '宸插鍒?, icon: 'success' }) })
}

function copyAll() {
  uni.setClipboardData({
    data: generatedCodes.value.join('\n'),
    success: () => uni.showToast({ title: `宸插鍒?${generatedCodes.value.length} 涓猔, icon: 'success' })
  })
}

function goLogin() { uni.navigateTo({ url: '/pages/auth/auth' }) }

function openICP() {
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent('https://beian.miit.gov.cn')}`
  })
}

function logout() {
  uni.showModal({
    title: '纭閫€鍑?,
    content: '閫€鍑哄悗闇€閲嶆柊鐧诲綍鎵嶈兘浣跨敤 AI 鍔熻兘',
    success: (res) => {
      if (res.confirm) {
        clearAuth()
        refreshState()
        uni.showToast({ title: '宸查€€鍑虹櫥褰?, icon: 'success' })
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
.page-bg { flex: 1; background-color: #eef6fd; }
.page-wrap { padding: 28rpx 28rpx 0; gap: 20rpx; }
.user-header { background-color: #2563eb; border-radius: 24rpx; padding: 32rpx 28rpx; flex-direction: row; align-items: center; gap: 20rpx; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 44rpx; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-text { font-size: 36rpx; font-weight: 700; color: #ffffff; }
.user-info { flex: 1; gap: 6rpx; }
.user-name-row { flex-direction: row; align-items: center; gap: 12rpx; }
.user-name { font-size: 32rpx; font-weight: 700; color: #ffffff; }
.admin-badge { background-color: rgba(255,255,255,0.25); border-radius: 12rpx; padding: 3rpx 14rpx; }
.admin-badge-text { font-size: 20rpx; color: #ffffff; font-weight: 500; }
.user-sub { font-size: 22rpx; color: rgba(255,255,255,0.75); }
.logout-btn { background-color: rgba(255,255,255,0.2); border-radius: 14rpx; padding: 14rpx 24rpx; }
.logout-text { font-size: 24rpx; color: #ffffff; }
.guest-header { background-color: #2563eb; border-radius: 24rpx; padding: 36rpx 28rpx; flex-direction: row; align-items: center; justify-content: space-between; }
.guest-info { gap: 6rpx; }
.guest-title { font-size: 36rpx; font-weight: 700; color: #ffffff; }
.guest-sub { font-size: 22rpx; color: rgba(255,255,255,0.75); }
.login-btn { background-color: rgba(255,255,255,0.2); border-radius: 16rpx; padding: 16rpx 32rpx; }
.login-btn-text { font-size: 26rpx; color: #ffffff; font-weight: 600; }
.section-card { background-color: #ffffff; border-radius: 20rpx; padding: 28rpx; gap: 16rpx; box-shadow: 0 2rpx 12rpx rgba(37,99,235,0.06); }
.admin-section { border-width: 1rpx; border-style: solid; border-color: #fde68a; }
.section-title { font-size: 28rpx; font-weight: 700; color: #1e3a5f; }
.section-desc { font-size: 23rpx; color: #64748b; line-height: 1.7; }
.toggle-row { flex-direction: row; align-items: center; justify-content: space-between; padding: 4rpx 0; }
.toggle-label { font-size: 26rpx; color: #334155; font-weight: 500; }
.field-wrap { gap: 10rpx; }
.field-label { font-size: 24rpx; font-weight: 600; color: #475569; }
.optional-tag { font-size: 20rpx; color: #94a3b8; font-weight: 400; }
.input-row { flex-direction: row; align-items: center; }
.field-input { background-color: #f8fafc; border-radius: 14rpx; padding: 22rpx 20rpx; font-size: 26rpx; color: #1e3a5f; border-width: 1rpx; border-style: solid; border-color: #e2e8f0; }
.flex1 { flex: 1; }
.eye-btn { background-color: #f1f5f9; border-radius: 12rpx; padding: 18rpx 16rpx; margin-left: 12rpx; }
.eye-text { font-size: 20rpx; color: #64748b; }
.action-row { flex-direction: row; gap: 16rpx; }
.btn-secondary { flex: 1; background-color: #ffffff; border-radius: 14rpx; padding: 24rpx; align-items: center; border-width: 1rpx; border-style: solid; border-color: #2563eb; }
.btn-secondary-text { font-size: 26rpx; color: #2563eb; font-weight: 600; }
.btn-primary-sm { flex: 1; background-color: #2563eb; border-radius: 14rpx; padding: 24rpx; align-items: center; }
.btn-primary-sm-text { font-size: 26rpx; color: #ffffff; font-weight: 600; }
.msg-box { border-radius: 12rpx; padding: 14rpx 18rpx; border-width: 1rpx; border-style: solid; }
.msg-text { font-size: 24rpx; }
.hint-green { background-color: #f0fdf4; border-radius: 14rpx; padding: 20rpx 24rpx; }
.hint-green-text { font-size: 24rpx; color: #15803d; font-weight: 500; }
.stats-row { flex-direction: row; gap: 12rpx; }
.stat-box { flex: 1; background-color: #f8fafc; border-radius: 14rpx; padding: 20rpx 12rpx; align-items: center; gap: 6rpx; }
.stat-num { font-size: 36rpx; font-weight: 700; color: #2563eb; }
.stat-lbl { font-size: 20rpx; color: #64748b; }
.btn-dark { background-color: #1e3a5f; border-radius: 14rpx; padding: 24rpx; align-items: center; }
.btn-dark-text { font-size: 26rpx; color: #ffffff; font-weight: 600; }
.codes-box { background-color: #f8fafc; border-radius: 14rpx; padding: 20rpx; gap: 12rpx; }
.codes-box-header { flex-direction: row; align-items: center; justify-content: space-between; }
.codes-box-label { font-size: 22rpx; color: #64748b; }
.copy-all-btn { background-color: #2563eb; border-radius: 10rpx; padding: 8rpx 20rpx; }
.copy-all-text { font-size: 20rpx; color: #ffffff; }
.chips-row { flex-direction: row; flex-wrap: wrap; gap: 10rpx; }
.code-chip { background-color: #dbeafe; border-radius: 10rpx; padding: 8rpx 18rpx; }
.code-chip-text { font-size: 22rpx; color: #1e40af; font-weight: 600; }
.list-header { flex-direction: row; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.refresh-btn { background-color: #f1f5f9; border-radius: 10rpx; padding: 8rpx 18rpx; }
.refresh-text { font-size: 22rpx; color: #2563eb; }
.empty-hint { padding: 20rpx 0; align-items: center; }
.empty-hint-text { font-size: 24rpx; color: #94a3b8; }
.code-row { flex-direction: row; align-items: center; justify-content: space-between; padding: 16rpx 0; border-bottom-width: 1rpx; border-bottom-style: solid; border-bottom-color: #f1f5f9; }
.code-row-left { flex: 1; gap: 4rpx; }
.code-mono { font-size: 26rpx; font-weight: 600; color: #1e40af; }
.code-note { font-size: 20rpx; color: #94a3b8; }
.del-btn { background-color: #fef2f2; border-radius: 10rpx; padding: 8rpx 18rpx; }
.del-text { font-size: 22rpx; color: #dc2626; }
.about-text { font-size: 26rpx; color: #475569; }
.version-text { font-size: 20rpx; color: #94a3b8; }
.icp-row { margin-top: 12rpx; align-items: center; }
.icp-link { font-size: 20rpx; color: #2563eb; text-decoration: underline; }
</style>

