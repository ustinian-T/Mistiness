// Unified auth state management for uni-app x

export type UserInfo = {
  userId : string
  username : string
  role : string
  hasInviteCode : boolean
  useOwnKey : boolean
  hasApiKey : boolean
  apiBaseUrl : string
}

const TOKEN_KEY = 'mistiness_token'
const USER_KEY = 'mistiness_user'

export function saveAuth(token : string, userInfo : UserInfo) {
  uni.setStorageSync(TOKEN_KEY, token)
  uni.setStorageSync(USER_KEY, JSON.stringify(userInfo))
}

export function clearAuth() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

export function getToken() : string {
  return (uni.getStorageSync(TOKEN_KEY) as string) || ''
}

export function getLocalUserInfo() : UserInfo | null {
  try {
    const raw = uni.getStorageSync(USER_KEY) as string
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export function isLoggedIn() : boolean {
  return getToken() !== ''
}

export function isAdmin() : boolean {
  const u = getLocalUserInfo()
  return u != null && u.role === 'admin'
}

// Call user-auth cloud function
export async function callUserAuth(params : Record<string, any>) : Promise<any> {
  const res = await uniCloud.callFunction({
    name: 'user-auth',
    data: params,
  })
  return res.result
}

// Call ai-proxy cloud function
export async function callAiProxy(params : Record<string, any>) : Promise<any> {
  const res = await uniCloud.callFunction({
    name: 'ai-proxy',
    data: params,
  })
  return res.result
}

// Call invite-code cloud function
export async function callInviteCode(params : Record<string, any>) : Promise<any> {
  const res = await uniCloud.callFunction({
    name: 'invite-code',
    data: params,
  })
  return res.result
}
