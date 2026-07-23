'use strict'

/**
 * 管理员账号初始化脚本
 * 仅在首次部署时执行一次，之后可删除或禁用
 *
 * 执行方式：在 uniCloud 控制台「云函数」中上传并运行，或通过 HBuilderX 右键「运行云函数」
 *
 * 重要：运行完成后务必修改管理员密码，并删除本文件中的明文密码
 */

const crypto = require('crypto')

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

exports.main = async (event, context) => {
  const db = uniCloud.database()
  const usersCol = db.collection('mistiness_users')

  const ADMIN_USERNAME = 'tanshuhong'

  // Check if admin already exists
  const existing = await usersCol.where({ username: ADMIN_USERNAME }).get()
  if (existing.data.length > 0) {
    return {
      code: 0,
      message: `管理员账号 "${ADMIN_USERNAME}" 已存在，无需重新创建`,
      tip: '如需重置密码，请直接在数据库中更新 password_hash 字段',
    }
  }

  // Read password from environment variable — never hardcode in production
  const adminPassword = process.env.ADMIN_INIT_PASSWORD
  if (!adminPassword) {
    return {
      code: 400,
      message: '请在云函数环境变量中设置 ADMIN_INIT_PASSWORD，不要在代码中硬编码密码',
    }
  }

  if (adminPassword.length < 8) {
    return { code: 400, message: '管理员密码不能少于8位' }
  }

  const now = Date.now()
  const res = await usersCol.add({
    username: ADMIN_USERNAME,
    password_hash: hashPassword(adminPassword),
    role: 'admin',
    invite_code_used: '',
    use_own_key: false,
    api_key_encrypted: '',
    api_base_url: '',
    created_at: now,
    last_login_at: now,
  })

  return {
    code: 0,
    message: `管理员账号 "${ADMIN_USERNAME}" 创建成功`,
    userId: res.id,
    warning: '请立即清除 ADMIN_INIT_PASSWORD 环境变量，并妥善保管密码',
  }
}
