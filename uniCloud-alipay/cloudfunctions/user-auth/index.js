'use strict'

const crypto = require('crypto')
const db = uniCloud.database()
const usersCol = db.collection('mistiness_users')
const inviteCodesCol = db.collection('mistiness_invite_codes')

// PBKDF2 password hashing (no external deps needed)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return verify === hash
}

function generateToken(userId, username, role) {
  const payload = JSON.stringify({ userId, username, role, iat: Date.now() })
  const secret = process.env.JWT_SECRET || 'mistiness-secret-change-in-env'
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const token = Buffer.from(payload).toString('base64') + '.' + sig
  return token
}

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'mistiness-secret-change-in-env'
    const [payloadB64, sig] = token.split('.')
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (expected !== sig) return null
    const data = JSON.parse(payload)
    // Token valid for 30 days
    if (Date.now() - data.iat > 30 * 24 * 60 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

// Simple AES-256-GCM encryption for API keys stored in DB
function encryptApiKey(plaintext) {
  const key = Buffer.from(process.env.AES_KEY || 'mistiness-aes-key-32bytes-change!', 'utf8').slice(0, 32)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex')
}

function decryptApiKey(stored) {
  try {
    const key = Buffer.from(process.env.AES_KEY || 'mistiness-aes-key-32bytes-change!', 'utf8').slice(0, 32)
    const [ivHex, tagHex, encHex] = stored.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const enc = Buffer.from(encHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(enc) + decipher.final('utf8')
  } catch {
    return null
  }
}

exports.main = async (event, context) => {
  const { action } = event

  // ── REGISTER ──────────────────────────────────────────────────
  if (action === 'register') {
    const { username, password, inviteCode } = event

    if (!username || !password) {
      return { code: 400, message: '用户名和密码不能为空' }
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/.test(username)) {
      return { code: 400, message: '用户名3-20位，只允许字母数字下划线汉字' }
    }
    if (password.length < 6) {
      return { code: 400, message: '密码不能少于6位' }
    }

    // Check username unique
    const existing = await usersCol.where({ username }).get()
    if (existing.data.length > 0) {
      return { code: 409, message: '用户名已被注册' }
    }

    let usedCode = null
    if (inviteCode) {
      const codeRes = await inviteCodesCol
        .where({ code: inviteCode, is_used: false })
        .get()
      if (codeRes.data.length === 0) {
        return { code: 403, message: '邀请码无效或已被使用' }
      }
      const codeDoc = codeRes.data[0]
      if (codeDoc.expires_at && Date.now() > codeDoc.expires_at) {
        return { code: 403, message: '邀请码已过期' }
      }
      usedCode = codeDoc._id
    }

    const now = Date.now()
    const newUser = {
      username,
      password_hash: hashPassword(password),
      role: 'user',
      invite_code_used: inviteCode || '',
      use_own_key: false,
      api_key_encrypted: '',
      api_base_url: '',
      created_at: now,
      last_login_at: now,
    }

    const addRes = await usersCol.add(newUser)
    const userId = addRes.id

    // Mark invite code as used
    if (usedCode) {
      await inviteCodesCol.doc(usedCode).update({
        is_used: true,
        used_by: username,
        used_at: now,
      })
    }

    const token = generateToken(userId, username, 'user')
    return {
      code: 0,
      message: '注册成功',
      token,
      userInfo: { userId, username, role: 'user', hasInviteCode: !!inviteCode },
    }
  }

  // ── LOGIN ──────────────────────────────────────────────────────
  if (action === 'login') {
    const { username, password } = event
    if (!username || !password) {
      return { code: 400, message: '请填写用户名和密码' }
    }

    const res = await usersCol.where({ username }).get()
    if (res.data.length === 0) {
      return { code: 401, message: '用户名或密码错误' }
    }

    const user = res.data[0]
    if (!verifyPassword(password, user.password_hash)) {
      return { code: 401, message: '用户名或密码错误' }
    }

    await usersCol.doc(user._id).update({ last_login_at: Date.now() })

    const token = generateToken(user._id, user.username, user.role)
    return {
      code: 0,
      message: '登录成功',
      token,
      userInfo: {
        userId: user._id,
        username: user.username,
        role: user.role,
        hasInviteCode: !!user.invite_code_used,
        useOwnKey: user.use_own_key,
        apiBaseUrl: user.api_base_url || '',
      },
    }
  }

  // ── VERIFY TOKEN ───────────────────────────────────────────────
  if (action === 'verifyToken') {
    const { token } = event
    const data = verifyToken(token)
    if (!data) return { code: 401, message: 'Token 无效或已过期' }
    return { code: 0, userInfo: data }
  }

  // ── UPDATE API KEY ─────────────────────────────────────────────
  if (action === 'updateApiKey') {
    const { token, apiKey, apiBaseUrl, useOwnKey } = event
    const auth = verifyToken(token)
    if (!auth) return { code: 401, message: '请先登录' }

    const update = { use_own_key: !!useOwnKey }
    if (apiKey) {
      update.api_key_encrypted = encryptApiKey(apiKey)
    }
    if (apiBaseUrl !== undefined) {
      update.api_base_url = apiBaseUrl || ''
    }

    await usersCol.doc(auth.userId).update(update)
    return { code: 0, message: '配置已保存' }
  }

  // ── GET USER API KEY (server-side only, called by ai-proxy) ────
  if (action === 'getUserApiKey') {
    // Only callable from other cloud functions (server context)
    if (!context.FUNCTION_TYPE) {
      return { code: 403, message: '禁止访问' }
    }
    const { userId } = event
    const res = await usersCol.doc(userId).get()
    if (res.data.length === 0) return { code: 404, message: '用户不存在' }
    const user = res.data[0]
    const apiKey = user.api_key_encrypted ? decryptApiKey(user.api_key_encrypted) : null
    return {
      code: 0,
      apiKey,
      apiBaseUrl: user.api_base_url || '',
      useOwnKey: user.use_own_key,
    }
  }

  // ── GET MY PROFILE ─────────────────────────────────────────────
  if (action === 'getProfile') {
    const { token } = event
    const auth = verifyToken(token)
    if (!auth) return { code: 401, message: '请先登录' }

    const res = await usersCol.doc(auth.userId).get()
    if (res.data.length === 0) return { code: 404, message: '用户不存在' }
    const user = res.data[0]
    return {
      code: 0,
      profile: {
        userId: user._id,
        username: user.username,
        role: user.role,
        hasInviteCode: !!user.invite_code_used,
        useOwnKey: user.use_own_key,
        hasApiKey: !!user.api_key_encrypted,
        apiBaseUrl: user.api_base_url || '',
        createdAt: user.created_at,
      },
    }
  }

  return { code: 404, message: '未知操作' }
}
