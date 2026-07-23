'use strict'

const crypto = require('crypto')
const db = uniCloud.database()
const usersCol = db.collection('mistiness_users')
const codesCol = db.collection('mistiness_invite_codes')

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'mistiness-secret-change-in-env'
    const [payloadB64, sig] = token.split('.')
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (expected !== sig) return null
    const data = JSON.parse(payload)
    if (Date.now() - data.iat > 30 * 24 * 60 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

function genCode(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = crypto.randomBytes(len)
  for (let i = 0; i < len; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

exports.main = async (event, context) => {
  const { action, token } = event

  // All operations require admin role
  const auth = verifyToken(token)
  if (!auth) return { code: 401, message: '请先登录' }
  if (auth.role !== 'admin') return { code: 403, message: '仅管理员可操作邀请码' }

  // ── CREATE CODES ───────────────────────────────────────────────
  if (action === 'create') {
    const { count = 1, note = '', expiresInDays = null } = event
    if (count < 1 || count > 50) return { code: 400, message: '每次最多生成50个邀请码' }

    const now = Date.now()
    const expiresAt = expiresInDays ? now + expiresInDays * 24 * 60 * 60 * 1000 : null
    const codes = []

    for (let i = 0; i < count; i++) {
      let code = genCode()
      // Ensure uniqueness
      let exists = await codesCol.where({ code }).get()
      while (exists.data.length > 0) {
        code = genCode()
        exists = await codesCol.where({ code }).get()
      }
      codes.push({
        code,
        created_by: auth.username,
        created_at: now,
        is_used: false,
        used_by: '',
        used_at: null,
        note,
        expires_at: expiresAt,
      })
    }

    for (const c of codes) {
      await codesCol.add(c)
    }

    return { code: 0, message: `成功创建 ${count} 个邀请码`, codes: codes.map(c => c.code) }
  }

  // ── LIST CODES ─────────────────────────────────────────────────
  if (action === 'list') {
    const { onlyUnused = false, page = 1, pageSize = 20 } = event
    let query = codesCol.orderBy('created_at', 'desc')
    if (onlyUnused) query = codesCol.where({ is_used: false }).orderBy('created_at', 'desc')

    const res = await query.skip((page - 1) * pageSize).limit(pageSize).get()
    const total = await (onlyUnused
      ? codesCol.where({ is_used: false })
      : codesCol
    ).count()

    return {
      code: 0,
      list: res.data,
      total: total.total,
      page,
      pageSize,
    }
  }

  // ── DELETE CODE ────────────────────────────────────────────────
  if (action === 'delete') {
    const { codeId } = event
    if (!codeId) return { code: 400, message: '缺少邀请码 ID' }
    const res = await codesCol.doc(codeId).get()
    if (res.data.length === 0) return { code: 404, message: '邀请码不存在' }
    if (res.data[0].is_used) return { code: 400, message: '已使用的邀请码不能删除' }
    await codesCol.doc(codeId).remove()
    return { code: 0, message: '删除成功' }
  }

  // ── STATS ──────────────────────────────────────────────────────
  if (action === 'stats') {
    const total = await codesCol.count()
    const unused = await codesCol.where({ is_used: false }).count()
    const userCount = await usersCol.where({ role: 'user' }).count()
    return {
      code: 0,
      stats: {
        totalCodes: total.total,
        unusedCodes: unused.total,
        usedCodes: total.total - unused.total,
        totalUsers: userCount.total,
      },
    }
  }

  return { code: 404, message: '未知操作' }
}
