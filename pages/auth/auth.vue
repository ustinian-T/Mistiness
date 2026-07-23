<template>
  <scroll-view class="page-bg" scroll-y>
    <view class="auth-wrap">

      <!-- Logo / Title -->
      <view class="brand">
        <text class="brand-icon">🌸</text>
        <text class="brand-title">花月诗境</text>
        <text class="brand-sub">月令花神，一境入诗</text>
      </view>

      <!-- Tab Switch -->
      <view class="tab-row">
        <view
          class="tab-item"
          :class="mode === 'login' ? 'tab-active' : ''"
          @click="mode = 'login'; clearErrors()"
        >
          <text class="tab-text" :style="mode === 'login' ? 'color:#2563eb' : 'color:#94a3b8'">登录</text>
        </view>
        <view
          class="tab-item"
          :class="mode === 'register' ? 'tab-active' : ''"
          @click="mode = 'register'; clearErrors()"
        >
          <text class="tab-text" :style="mode === 'register' ? 'color:#2563eb' : 'color:#94a3b8'">注册</text>
        </view>
      </view>

      <!-- Form Card -->
      <view class="form-card">

        <!-- Username -->
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

        <!-- Password -->
        <view class="field-wrap">
          <text class="field-label">密码</text>
          <view class="pwd-row">
            <input
              class="field-input pwd-input"
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

        <!-- Invite Code (register only) -->
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

        <!-- Error message -->
        <view v-if="errorMsg !== ''" class="error-box">
          <text class="error-text">{{ errorMsg }}</text>
        </view>

        <!-- Submit Button -->
        <view
          class="submit-btn"
          :style="loading ? 'background:#94a3b8' : 'background:#2563eb'"
          @click="submit"
        >
          <text class="submit-text">{{ loading ? '请稍候…' : (mode === 'login' ? '登录' : '注册') }}</text>
        </view>

        <!-- Guest mode tip -->
        <view class="guest-tip" @click="continueAsGuest">
          <text class="guest-tip-text">暂不登录，自备 API Key 使用 →</text>
        </view>

      </view>

      <!-- Register notes -->
      <view v-if="mode === 'register'" class="notes-card">
        <text class="notes-title">关于注册</text>
        <text class="notes-item">• 有邀请码：注册后即可直接使用系统 AI 功能</text>
        <text class="notes-item">• 无邀请码：注册后需在「个人」页填写自己的 OpenAI API Key</text>
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
      // If came from another page, go back; else go to index
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
.page-bg {
  min-height: 100vh;
  height: 100vh;
  flex: 1;
  background-color: #eef6fd;
}

.auth-wrap {
  padding: 60rpx 40rpx 80rpx;
  gap: 28rpx;
}

.brand {
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.brand-icon {
  font-size: 80rpx;
}

.brand-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #1e3a5f;
  letter-spacing: 6rpx;
  margin-top: 10rpx;
}

.brand-sub {
  font-size: 26rpx;
  color: #64748b;
}

.tab-row {
  flex-direction: row;
  background-color: #f1f5f9;
  border-radius: 20rpx;
  padding: 6rpx;
  gap: 0;
}

.tab-item {
  flex: 1;
  padding: 18rpx;
  align-items: center;
  border-radius: 16rpx;
}

.tab-active {
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(37,99,235,0.10);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 600;
}

.form-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  gap: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(37,99,235,0.08);
}

.field-wrap {
  gap: 10rpx;
}

.field-label-row {
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.field-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #475569;
}

.field-hint {
  font-size: 20rpx;
  color: #94a3b8;
  flex: 1;
}

.field-input {
  background-color: #f8fafc;
  border-radius: 14rpx;
  padding: 24rpx 20rpx;
  font-size: 28rpx;
  color: #1e3a5f;
  border-width: 1rpx;
  border-style: solid;
  border-color: #e2e8f0;
}

.pwd-row {
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.pwd-input {
  flex: 1;
}

.eye-btn {
  background-color: #f1f5f9;
  border-radius: 12rpx;
  padding: 20rpx 20rpx;
  align-items: center;
  justify-content: center;
}

.eye-text {
  font-size: 22rpx;
  color: #64748b;
}

.error-box {
  background-color: #fef2f2;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border-width: 1rpx;
  border-style: solid;
  border-color: #fecaca;
}

.error-text {
  font-size: 24rpx;
  color: #dc2626;
}

.submit-btn {
  border-radius: 18rpx;
  padding: 32rpx;
  align-items: center;
  margin-top: 4rpx;
}

.submit-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.guest-tip {
  align-items: center;
  padding: 8rpx;
}

.guest-tip-text {
  font-size: 24rpx;
  color: #2563eb;
}

.notes-card {
  background-color: #f0f9ff;
  border-radius: 18rpx;
  padding: 24rpx 28rpx;
  gap: 10rpx;
  border-width: 1rpx;
  border-style: solid;
  border-color: #bae6fd;
}

.notes-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 4rpx;
}

.notes-item {
  font-size: 22rpx;
  color: #0c4a6e;
  line-height: 1.8;
}
.page-bg{background:#f3f7f5}.auth-wrap{width:calc(100% - 40px);max-width:560px;margin:0 auto;padding:52px 0 64px}.brand-icon{display:none}.brand-title{color:#183f34;font-family:'STKaiti','KaiTi',serif;font-weight:500}.brand-sub{color:#71857e}.tab-row{background:#e7efeb}.tab-active{box-shadow:0 6px 18px rgba(35,71,60,.08)}.tab-text{color:#527269!important}.tab-active .tab-text{color:#183f34!important}.form-card,.notes-card{border:1px solid #fff;box-shadow:0 20px 55px rgba(35,71,60,.08)}.field-input{background:#f7faf8;border-color:#d7e3de;color:#183f34}.submit-btn{background:#183f34!important}.guest-link-text{color:#426b5f}.site-footer{width:100%}@media(max-width:600px){.auth-wrap{width:calc(100% - 28px);padding-top:34px}.brand-title{font-size:46rpx}}</style>
