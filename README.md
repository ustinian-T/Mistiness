# 花月诗境 · 十二花神诗词智能导览系统

> 月令花神，一境入诗。浅蓝诗境中漫游十二花神，查询诗词、匹配意象、统计朝代、生成花月播客。

基于 **Node.js + Express + 原生前端** 开发的轻量化传统文化学习 Web 应用。融合十二花神文化数据、AI 播客生成、TTS 语音合成、数据可视化，打造沉浸式诗词导览体验。

---

## ✨ 功能特性

### 核心功能
- **按月查询**：下拉选择月份，查看花卉、花神人物、朝代、经典诗句、文化意象、AI 讲解稿，配花卉图与人物画像
- **关键词推荐**：输入高洁/爱情/隐逸等 38 个意象关键词，智能匹配对应花卉，支持标签快捷输入
- **朝代统计**：Chart.js 柱状图展示各朝代花神分布，配数据明细表
- **记录保存**：一键保存查询记录至本地 record.txt

### AI 增值功能（需配置 DashScope API Key）
- **AI 播客生成**：单人/双人对话播客文案，支持 SSE 流式输出
- **TTS 语音合成**：CosyVoice 语音合成，单人/双人对话双模式，在线播放与下载
- **AI 诗词扩展**：每花 3-5 首相关诗词推荐，含赏析
- **AI 语义匹配**：语义级关键词推荐，返回匹配理由

### 展示特性
- 液态玻璃（Glassmorphism）UI 设计，浅蓝诗境主题
- 12 月花卉高清图 + 12 花神人物画像
- 渐入动画、悬停动效、平滑滚动
- 响应式布局，适配桌面与移动端

---

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 方式一：一键启动（Windows）

```bash
双击 start.bat
```

### 方式二：命令行启动

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（热重载）
npm run dev
```

启动后访问：http://localhost:8080

### 启用 AI 功能（可选）

1. 复制 `.env.example` 为 `.env`
2. 填入阿里云 DashScope API Key：

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
```

3. 重启服务后自动启用 AI 功能

> DashScope API Key 申请：https://dashscope.console.aliyun.com/

---

## 📁 项目结构

```
Mistiness/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express 服务入口，路由定义
│   │   ├── flowerService.js   # 花神数据服务（查询/推荐/统计/保存）
│   │   ├── aiService.js       # AI 服务（大模型调用/TTS 合成）
│   │   └── constants.js       # 常量定义（月份名/关键词映射）
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── css/
│   │   ├── tokens.css         # 设计令牌（颜色/字体/间距）
│   │   ├── glass.css          # 液态玻璃样式
│   │   ├── layout.css         # 布局与组件样式
│   │   └── motion.css         # 动画与过渡效果
│   ├── js/
│   │   ├── api.js             # API 请求封装
│   │   ├── app.js             # 主应用逻辑与页面渲染
│   │   └── motion.js          # 动画控制
│   ├── images/
│   │   ├── flowers/           # 12 月花卉图片
│   │   └── gods/              # 12 花神人物画像
│   └── index.html             # 入口页面
├── flower_poetry_data.csv     # 十二花神基础数据表
├── start.bat                  # Windows 一键启动脚本
├── package.json               # 根项目配置
├── .env.example               # 环境变量示例
└── README.md
```

---

## 📡 API 接口

### 基础接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/flowers` | 获取全部花神摘要列表 |
| GET | `/api/flowers/month/:month` | 按月查询花神详情 |
| GET | `/api/keywords` | 获取预设关键词列表 |
| GET | `/api/recommend?keyword=xxx` | 关键词推荐花卉 |
| GET | `/api/stats/dynasty` | 朝代统计数据 |
| GET | `/api/broadcast/:month` | 生成数字人播报台词 |
| POST | `/api/records` | 保存查询记录 |

### AI 接口（需配置 API Key）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/poems/:month` | AI 扩展诗词推荐 |
| GET | `/api/podcast/:month` | AI 单人播客文案 |
| GET | `/api/podcast/:month/stream` | AI 单人播客（流式 SSE） |
| GET | `/api/podcast-dialog/:month` | AI 双人对话播客 |
| GET | `/api/podcast-dialog/:month/stream` | AI 双人对话播客（流式） |
| POST | `/api/tts` | TTS 语音合成（单人） |
| POST | `/api/tts-dialog` | TTS 语音合成（双人对话） |

### 接口示例

**按月查询：**
```bash
curl http://localhost:8080/api/flowers/month/1
```

**关键词推荐：**
```bash
curl "http://localhost:8080/api/recommend?keyword=高洁"
```

**TTS 语音合成：**
```bash
curl -X POST http://localhost:8080/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"正月梅花是岁寒之首...","voice":"longanyang"}'
```

---

## 📊 数据结构

### flower_poetry_data.csv 字段

| 字段 | 说明 | 示例 |
|------|------|------|
| month | 月份（数字） | 1 |
| flower | 花卉名称 | 梅花 |
| god_name | 花神人物 | 林逋 |
| dynasty | 所属朝代 | 北宋 |
| poem | 代表诗句 | 疏影横斜水清浅，暗香浮动月黄昏 |
| keyword | 关键词（逗号分隔） | 高洁，清冷，孤傲 |
| culture_image | 文化意象 | 寒梅临水、月下暗香... |
| dynasty_style | 朝代风格 | 北宋诗文情理兼备... |
| ai_script | AI 讲解稿 | 正月梅花是岁寒之首... |

---

## 🎯 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + Express + csv-parse + cors |
| 前端 | 原生 HTML5 / CSS3 / JavaScript（ES6+） |
| 图表 | Chart.js 4.x |
| AI / LLM | 阿里云 DashScope API（通义千问 + CosyVoice） |
| 设计 | Glassmorphism 液态玻璃 / CSS 变量 / Noto 字体 |
| 数据存储 | 本地 CSV 文件 |

---

## 🧪 测试用例

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| T01 | 合法月份查询 | 3月 | 返回桃花、息夫人、春秋及完整数据 |
| T02 | 非法月份 | 13 | 返回 400 错误与提示 |
| T03 | 有效关键词 | 高洁 | 返回梅花、荷花、菊花等 |
| T04 | 无效关键词 | 山河 | 提示无匹配花卉 |
| T05 | 朝代统计 | 点击统计 | 柱状图 + 数据明细表 |
| T06 | 保存记录 | 点击保存 | record.txt 写入数据 |
| T07 | 播客生成 | 选择月份 | 生成播客文案（本地/AI） |
| T08 | TTS 合成 | 点击语音合成 | 返回可播放音频 URL |

---

## 📝 相关文档

- [需求文档](./《花月诗境》十二花神诗词智能导览系统%20需求文档.md)
- [产品文档](./《花月诗境：基于Python与AI的十二花神诗词智能导览系统》产品文档.md)
- [扩充版数据表](./扩充版十二花神完整数据表（代表诗人增至每列3位，均为同朝代非花神本人）.md)

---

## 📄 许可证

课程作业项目，仅供学习交流使用。

---

**花月诗境 · 刘思冉 · 2026**
