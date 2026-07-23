# 花月诗境 · Mistiness

十二月令花神诗词智能导览系统

## 项目信息

- **作者**：谭书宏，刘思冉
- **域名**：www.mistiness.tshai.top
- **备案号**：湘ICP备2026021754号-2
- **版本**：v1.0.0

## 技术栈

- **前端框架**：uni-app x（支持 H5、App、小程序）
- **云服务**：uniCloud（阿里云）
- **数据库**：uniCloud 云数据库
- **AI 服务**：OpenAI API（GPT-4o-mini）

## 核心功能

1. **花历总览**：十二月令花神月历展示
2. **按月导览**：花神详情、诗句、文化意象
3. **意象匹配**：关键词智能匹配花卉
4. **朝代统计**：可视化朝代诗词分布
5. **花月播客**：AI 生成诗境文案
6. **用户系统**：邀请码注册 + 自备 API Key
7. **管理面板**：邀请码管理、用户统计

## 部署指南

### 1. 环境配置

在 uniCloud 控制台为所有云函数配置环境变量：

```bash
# 必填
JWT_SECRET=随机32位字符串
AES_KEY=固定32位字符串

# AI 服务（可选）
OPENAI_API_KEY=sk-xxxxx
OPENAI_API_BASE=https://api.openai.com/v1

# 仅初始化时用（用完立即删除）
ADMIN_INIT_PASSWORD=强密码
```

### 2. 初始化管理员

1. 上传 `init-admin` 云函数
2. 右键「运行云函数」
3. 成功后**立即删除** `ADMIN_INIT_PASSWORD` 环境变量

### 3. 部署云端

- 上传数据库 Schema：`database/*.schema.json`
- 上传所有云函数：`cloudfunctions/*`

### 4. 前端构建

```bash
# H5
HBuilderX → 发行 → H5

# App
HBuilderX → 发行 → 原生 App-云打包

# 小程序
HBuilderX → 发行 → 微信小程序
```

## 安全特性

- ✅ 密码 PBKDF2 哈希（100,000 次迭代）
- ✅ API Key AES-256-GCM 加密存储
- ✅ JWT Token 30 天有效期
- ✅ 速率限制：每用户每小时 20 次 AI 请求
- ✅ 数据库权限控制（DB Schema）
- ✅ 云函数环境变量隔离

## 项目结构

```
pages/                  # 页面
  ├── index/            # 花历首页
  ├── month/            # 按月导览
  ├── keyword/          # 意象匹配
  ├── dynasty/          # 朝代统计
  ├── podcast/          # 花月播客
  ├── auth/             # 登录注册
  ├── profile/          # 个人中心
  └── webview/          # 外部链接

utils/                  # 工具函数
  ├── flowerData.uts    # 花神数据
  └── auth.uts          # 认证管理

uniCloud-alipay/        # 云服务
  ├── database/         # 数据库 Schema
  └── cloudfunctions/   # 云函数
      ├── user-auth/    # 用户认证
      ├── ai-proxy/     # AI 代理
      ├── invite-code/  # 邀请码管理
      └── init-admin/   # 管理员初始化
```

## 开源协议

MIT License

## 联系方式

- **项目地址**：https://github.com/[your-username]/mistiness
- **域名访问**：https://www.mistiness.tshai.top
- **备案查询**：https://beian.miit.gov.cn

---

**© 2026 花月诗境 · 传承中华诗词文化之美**
