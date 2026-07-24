<template>
  <scroll-view class="page-shell" scroll-y>
    <view class="site-container">

      <view class="brand">
        <text class="brand-icon">🌸</text>
        <text class="brand-title">花月诗境</text>
        <text class="brand-sub">月令花神，一境入诗</text>
      </view>

      <view class="tab-row">
        <view
          class="tab-item"
          :class="mode === 'login' ? 'tab-active' : ''"
          @click="mode = 'login'; clearErrors()"
        >
          <text class="tab-text">登录</text>
        </view>
        <view
          class="tab-item"
          :class="mode === 'register' ? 'tab-active' : ''"
          @click="mode = 'register'; clearErrors()"
        >
          <text class="tab-text">注册</text>
        </view>
      </view>

      <view class="form-card glass">

        <view class="field-wrap">
          <text class="field-label">用户名</text>
          <input
            class="field-input"
            v-model="username"
            placeholder="3-20位字母/数字/汉字"
            placeholder-style="color:#94a3b8"
            maxlength="20"
          />
        </view>

        <view class="field-wrap">
          <text class="field-label">密码</text>
          <view class="pwd-row">
            <input
              class="field-input"
              v-model="password"
              :password="!showPwd"
              placeholder="不少于6位"
              placeholder-style="color:#94a3b8"
              maxlength="64"
            />
            <view class="eye-btn" @click="showPwd = !showPwd">
              <text class="eye-text">{{ showPwd ? '隐藏' : '显示' }}</text>
            </view>
          </view>
        </view>

        <view v-if="mode === 'register'" class="field-wrap">
          <view class="field-label-row">
            <text class="field-label">邀请码</text>
            <text class="field-hint">填写后直接使用系统 AI，不填则需自备 API Key</text>
          </view>
          <input
            class="field-input"
            v-model="inviteCode"
            placeholder="输入邀请码（可选）"
            placeholder-style="color:#94a3b8"
            maxlength="32"
          />
        </view>

        <view v-if="errorMsg !== ''" class="error-box">
          <text class="error-text">{{ errorMsg }}</text>
        </view>

        <view
          class="submit-btn"
          :class="loading ? 'submit-disabled' : ''"
          @click="submit"
        >
          <text class="submit-text">{{ loading ? '请稍候…' : (mode === 'login' ? '登录' : '注册') }}</text>
        </view>

        <view class="guest-tip" @click="continueAsGuest">
          <text class="guest-tip-text">暂不登录，自备 API Key 使用 →</text>
        </view>

      </view>

      <view v-if="mode === 'register'" class="notes-card glass">
        <text class="notes-title">关于注册</text>
        <text class="notes-item">• 有邀请码：注册后即可直接使用系统 AI 功能</text>
        <text class="notes-item">• 无邀请码：注册后需在「个人」页填写自己的 API Key</text>
        <text class="notes-item">• 也可不注册，直接在「个人」页填写 API Key 使用</text>
      </view>

      <AppFooter />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppFooter from '../../components/app-footer.vue'
import { saveAuth, getToken, callUserAuth, type UserInfo } from '../../utils/auth'

const mode = ref<string>('login')
const username = ref<string>('')
const password = ref<string>('')
const inviteCode = ref<string>('')
const showPwd = ref<boolean>(false)
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

function clearErrors() {
  errorMsg.value = ''
}

function validateForm() : boolean {
  if (username.value.trim() === '') {
    errorMsg.value = '请填写用户名'
    return false
  }
  if (password.value.length < 6) {
    errorMsg.value = '密码不能少于6位'
    return false
  }
  return true
}

async function submit() {
  if (loading.value) return
  clearErrors()
  if (!validateForm()) return

  loading.value = true
  try {
    const params : Record<string, any> = {
      action: mode.value,
      username: username.value.trim(),
      password: password.value,
    }
    if (mode.value === 'register' && inviteCode.value.trim() !== '') {
      params['inviteCode'] = inviteCode.value.trim().toUpperCase()
    }

    const res = await callUserAuth(params)

    if (res.code !== 0) {
      errorMsg.value = res.message || '操作失败，请重试'
      return
    }

    const userInfo : UserInfo = {
      userId: res.userInfo.userId,
      username: res.userInfo.username,
      role: res.userInfo.role,
      hasInviteCode: res.userInfo.hasInviteCode ?? false,
      useOwnKey: res.userInfo.useOwnKey ?? false,
      hasApiKey: false,
      apiBaseUrl: res.userInfo.apiBaseUrl ?? '',
    }
    saveAuth(res.token as string, userInfo)

    uni.showToast({ title: mode.value === 'login' ? '登录成功' : '注册成功', icon: 'success' })

    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }, 800)
  } catch (e : any) {
    errorMsg.value = '网络异常，请检查连接后重试'
  } finally {
    loading.value = false
  }
}

function continueAsGuest() {
  uni.navigateTo({ url: '/pages/profile/profile?tab=apikey' })
}

onLoad(() => {
  if (getToken() !== '') {
    uni.reLaunch({ url: '/pages/index/index' })
  }
})
</script>

<style>
@import '../../common/theme.css';

.page-shell { height: 100vh; background: var(--paper); position: relative; }
.site-container { width: calc(100% - 40px); max-width: 560px; margin: 0 auto; padding: 52px 0 64px; position: relative; z-index: 1; }

.brand { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; }
.brand-icon { font-size: 70px; }
.brand-title { font: 42px 'STKaiti', 'KaiTi', serif; color: #183f34; letter-spacing: 4px; }
.brand-sub { font-size: 14px; color: #71857e; }

.tab-row { display: flex; flex-direction: row; background: #e7efeb; border-radius: 18px; padding: 4px; gap: 0; }
.tab-item { flex: 1; padding: 14px; display: flex; align-items: center; justify-content: center; border-radius: 14px; }
.tab-active { background: #fff; box-shadow: 0 6px 18px rgba(35,71,60,.08); }
.tab-text { font-size: 15px; font-weight: 600; color: #527269; }
.tab-active .tab-text { color: #183f34; }

.form-card { margin-top: 28px; border-radius: 24px; padding: 34px; gap: 22px; }

.field-wrap { gap: 8px; }
.field-label-row { flex-direction: row; align-items: center; gap: 10px; }
.field-label { font-size: 13px; font-weight: 600; color: #526b63; }
.field-hint { font-size: 11px; color: #859992; flex: 1; }

.field-input { flex: 1; background: #f7faf8; border-radius: 12px; padding: 16px; font-size: 15px; color: #183f34; border: 1px solid #d7e3de; }

.pwd-row { flex-direction: row; align-items: center; gap: 10px; }
.eye-btn { background: #f1f5f9; border-radius: 10px; padding: 14px; align-items: center; justify-content: center; }
.eye-text { font-size: 12px; color: #6a837a; }

.error-box { background: #fef2f2; border-radius: 12px; padding: 14px 18px; border: 1px solid #fecaca; }
.error-text { font-size: 13px; color: #dc2626; }

.submit-btn { background: #183f34; border-radius: 14px; padding: 20px; align-items: center; margin-top: 8px; }
.submit-disabled { opacity: .5; }
.submit-text { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 2px; }

.guest-tip { align-items: center; padding: 12px; }
.guest-tip-text { font-size: 14px; color: #426b5f; }

.notes-card { margin-top: 22px; background: #f7faf8; border-radius: 18px; padding: 22px 26px; gap: 8px; border: 1px solid #e5ede9; }
.notes-title { font-size: 13px; font-weight: 600; color: #315e51; margin-bottom: 4px; }
.notes-item { font-size: 12px; color: #647971; line-height: 1.8; }

@media (max-width: 600px) {
  .site-container { width: calc(100% - 28px); padding-top: 34px; }
  .brand-title { font-size: 36px; }
  .form-card { padding: 26px; }
}
</style>
