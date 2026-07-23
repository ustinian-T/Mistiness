'use strict'

const https = require('https')
const crypto = require('crypto')

// Verify token (same logic as user-auth, no cross-function dep needed)
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

// Simple rate limiting: max 20 AI requests per user per hour (in-memory, resets on cold start)
const rateLimitMap = new Map()
function checkRateLimit(userId) {
  const now = Date.now()
  const window = 60 * 60 * 1000
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, { count: 1, start: now })
    return true
  }
  const entry = rateLimitMap.get(userId)
  if (now - entry.start > window) {
    rateLimitMap.set(userId, { count: 1, start: now })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

// HTTP POST helper (no axios needed in cloud functions)
function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on('error', reject)
    req.write(JSON.stringify(body))
    req.end()
  })
}

exports.main = async (event, context) => {
  const { action, token, clientApiKey, clientApiBaseUrl } = event

  // ── GENERATE PODCAST TEXT ──────────────────────────────────────
  if (action === 'generatePodcast') {
    const { flowerData } = event

    if (!flowerData) return { code: 400, message: '缺少花神数据' }

    // Resolve which API key to use
    let apiKey = process.env.OPENAI_API_KEY || ''
    let apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
    let fromServer = true

    // If user is logged in and chose to use own key
    if (token) {
      const auth = verifyToken(token)
      if (auth) {
        if (!checkRateLimit(auth.userId)) {
          return { code: 429, message: '请求过于频繁，每小时最多生成20次，请稍后再试' }
        }
        // Fetch user config from DB
        const db = uniCloud.database()
        const userRes = await db.collection('mistiness_users').doc(auth.userId).get()
        if (userRes.data.length > 0) {
          const user = userRes.data[0]
          if (user.use_own_key && user.api_key_encrypted) {
            const decrypted = decryptApiKey(user.api_key_encrypted)
            if (decrypted) {
              apiKey = decrypted
              apiBase = user.api_base_url || apiBase
              fromServer = false
            }
          }
        }
      }
    }

    // Guest with client-provided key (user chose not to register)
    if (!token && clientApiKey) {
      apiKey = clientApiKey
      apiBase = clientApiBaseUrl || apiBase
      fromServer = false
    }

    if (!apiKey) {
      return { code: 403, message: '未配置 API Key，请登录或在设置中填写您的 API Key' }
    }

    const prompt = buildPodcastPrompt(flowerData)

    try {
      const result = await httpsPost(
        `${apiBase}/chat/completions`,
        { Authorization: `Bearer ${apiKey}` },
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '你是一位擅长中国古典诗词文化的播客主持人，风格典雅而亲切，善用诗意语言讲述花神故事。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.85,
        }
      )

      if (result.status !== 200) {
        const errMsg = result.body?.error?.message || 'AI 服务返回错误'
        return { code: 500, message: errMsg }
      }

      const text = result.body.choices?.[0]?.message?.content || ''
      return { code: 0, text, source: fromServer ? 'server' : 'user', length: text.length }
    } catch (err) {
      return { code: 500, message: 'AI 请求失败：' + (err.message || '网络错误') }
    }
  }

  // ── VALIDATE CLIENT API KEY (test connection) ──────────────────
  if (action === 'validateApiKey') {
    const { apiKey, apiBaseUrl } = event
    if (!apiKey) return { code: 400, message: 'API Key 不能为空' }

    const base = apiBaseUrl || 'https://api.openai.com/v1'
    try {
      const result = await httpsPost(
        `${base}/chat/completions`,
        { Authorization: `Bearer ${apiKey}` },
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }
      )
      if (result.status === 200 || result.status === 201) {
        return { code: 0, message: 'API Key 有效' }
      }
      const errMsg = result.body?.error?.message || `状态码 ${result.status}`
      return { code: 400, message: 'API Key 无效：' + errMsg }
    } catch (err) {
      return { code: 500, message: '连接失败：' + (err.message || '网络错误') }
    }
  }

  return { code: 404, message: '未知操作' }
}

function buildPodcastPrompt(f) {
  return `请为以下月令花神撰写一段约400字的播客文案，风格典雅、生动，适合朗读：

花神信息：
- 月份：${f.monthName}（${f.month}月）
- 花卉：${f.flower}
- 花神人物：${f.godName}
- 所属朝代：${f.dynasty}
- 代表诗句：「${f.poem}」
- 文化意象：${f.cultureImage}
- 朝代诗词风格：${f.dynastyStyle}

要求：
1. 以"欢迎收听花月诗境"开头
2. 自然引出花神人物与代表花卉的渊源
3. 引用并赏析代表诗句
4. 结合文化意象展开叙述
5. 以温柔收尾，不超过420字`
}
