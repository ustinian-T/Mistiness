require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const https = require("https");
const { FlowerService } = require("./flowerService");
const {
  hasLLMKey,
  generatePodcastScript,
  generatePodcastScriptStream,
  generateDialoguePodcast,
  generateDialoguePodcastStream,
  generatePoems,
  aiKeywordMatch,
  normalizeDialogueScript,
  DASHSCOPE_API_KEY,
  DEFAULT_MODEL,
} = require("./aiService");

const PORT = process.env.PORT || 8080;
const ROOT = path.resolve(__dirname, "../..");
const CSV_PATH = path.join(ROOT, "flower_poetry_data.csv");
const RECORD_PATH = path.join(ROOT, "record.txt");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const MONTH_NAMES = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

const app = express();
const flowerService = new FlowerService(CSV_PATH, RECORD_PATH);

function buildPodcast(data) {
  const monthName = MONTH_NAMES[data.month - 1];
  return `男：各位听众朋友们，欢迎来到花月诗境播客。我是主持人阿明，今天我们将带大家一起走进中国传统花卉文化的诗意世界。
女：大家好，我是主持人小雅。今天我们要聊的是${monthName}的${data.flower}，这可是这个月份最具代表性的花卉呢！

男：${data.flower}，在中国传统文化中有着极其重要的地位。小雅，你知道它的花神是谁吗？
女：我知道！它的花神是${data.godName}，来自${data.dynasty}时期。${data.godName}与${data.flower}之间有着深厚的渊源，这段故事已经成为了千古流传的佳话。

男：没错。说到${data.flower}，就不得不提到那句脍炙人口的诗句："${data.poem}"。这句诗生动地描绘了${data.flower}的独特韵味，让我们仿佛身临其境，感受到那份诗意之美。
女：是的，这句诗真是太美了。${data.flower}承载着丰富的文化意象。${data.cultureImage}它不仅是一种美丽的花卉，更是一种精神象征，寄托着人们对美好生活的向往。

男：在${data.dynasty}时期，诗词创作达到了鼎盛。${data.dynastyStyle}${data.flower}作为重要的创作主题，被众多文人墨客吟咏，留下了大量传世佳作，至今仍被人们传颂。
女：${data.aiScript}

男：说到这里，我还想补充一点。${data.flower}在中国园林艺术中也占有重要地位，古人常在庭院中种植${data.flower}，以寄托情怀，营造诗意氛围。
女：是啊，${data.flower}的美不仅在于外表，更在于它所承载的文化内涵和精神品格。每一次欣赏${data.flower}，都是一次与传统文化的对话。

男：让我们再次回味那句经典诗句："${data.poem}"。${data.flower}的美丽与神韵，将永远铭刻在中华文化的长河中，成为我们民族审美的重要组成部分。
女：感谢您收听花月诗境播客。希望今天的分享能让您对${data.flower}有更深的了解和喜爱。下期我们将继续探索其他月令花卉的奥秘，敬请期待！

男：再见！
女：再见！`;
}

function fallbackPoems(data) {
  const poemMap = {
    梅花: [
      ["梅花", "王安石", "北宋", "墙角数枝梅，凌寒独自开。", "写梅凌寒绽放，突出孤高坚贞。"],
      ["卜算子·咏梅", "陆游", "南宋", "零落成泥碾作尘，只有香如故。", "借梅写品格不改，意蕴深沉。"],
      ["雪梅", "卢梅坡", "南宋", "梅须逊雪三分白，雪却输梅一段香。", "以梅雪互衬，写出梅之清香。"],
    ],
    杏花: [
      ["临安春雨初霁", "陆游", "南宋", "小楼一夜听春雨，深巷明朝卖杏花。", "杏花点染春意，清新含蓄。"],
      ["游园不值", "叶绍翁", "南宋", "春色满园关不住，一枝红杏出墙来。", "借红杏写春色蓬勃难掩。"],
      ["清明", "杜牧", "唐代", "借问酒家何处有，牧童遥指杏花村。", "杏花村承载清明烟雨情调。"],
    ],
    桃花: [
      ["题都城南庄", "崔护", "唐代", "去年今日此门中，人面桃花相映红。", "桃花映人面，写尽春日怅惘。"],
      ["大林寺桃花", "白居易", "唐代", "人间四月芳菲尽，山寺桃花始盛开。", "以桃花表现春光迟至之美。"],
      ["桃花溪", "张旭", "唐代", "桃花尽日随流水，洞在清溪何处边。", "桃花流水，营造幽远仙境。"],
    ],
    芍药: [
      ["感芍药花寄正一上人", "白居易", "唐代", "今日阶前红芍药，几花欲老几花新。", "写芍药新旧交替，含惜春之意。"],
      ["戏题阶前芍药", "柳宗元", "唐代", "凡卉与时谢，妍华丽兹晨。", "赞芍药晨光中盛放之美。"],
      ["芍药", "韩愈", "唐代", "浩态狂香昔未逢，红灯烁烁绿盘笼。", "写芍药浓艳繁盛，气象热烈。"],
    ],
    榴花: [
      ["题榴花", "韩愈", "唐代", "五月榴花照眼明，枝间时见子初成。", "写榴花明艳热烈，初夏鲜活。"],
      ["山石榴寄元九", "白居易", "唐代", "闲折两枝持在手，细看不似人间有。", "写石榴花奇艳，赞其非凡。"],
      ["同张明府碧溪赠答", "孟浩然", "唐代", "石榴花发满溪津，溪女洗花染白云。", "以榴花入景，色彩明丽。"],
    ],
    荷花: [
      ["晓出净慈寺送林子方", "杨万里", "南宋", "接天莲叶无穷碧，映日荷花别样红。", "写荷花盛景，境界开阔明艳。"],
      ["爱莲说", "周敦颐", "北宋", "出淤泥而不染，濯清涟而不妖。", "以莲喻君子，写高洁人格。"],
      ["采莲曲", "王昌龄", "唐代", "荷叶罗裙一色裁，芙蓉向脸两边开。", "荷花与人相映，清丽动人。"],
    ],
    蜀葵: [
      ["蜀葵", "陈标", "唐代", "眼前无奈蜀葵何，浅紫深红数百窠。", "写蜀葵繁盛色艳，热烈明快。"],
      ["蜀葵花歌", "岑参", "唐代", "昨日一花开，今日一花开。", "写蜀葵逐日而开，生命力强。"],
      ["黄蜀葵花", "张祜", "唐代", "名花八叶嫩黄金，色照书窗透竹林。", "写黄蜀葵明丽照眼，清雅可赏。"],
    ],
    桂花: [
      ["鹧鸪天·桂花", "李清照", "南宋", "暗淡轻黄体性柔，情疏迹远只香留。", "写桂花色淡香远，品格内敛。"],
      ["十五夜望月", "王建", "唐代", "中庭地白树栖鸦，冷露无声湿桂花。", "桂花入中秋夜景，清冷静美。"],
      ["鸟鸣涧", "王维", "唐代", "人闲桂花落，夜静春山空。", "桂花飘落，写空山幽寂。"],
    ],
    菊花: [
      ["饮酒", "陶渊明", "东晋", "秋菊有佳色，裛露掇其英。", "菊花清雅，寄寓隐逸情怀。"],
      ["菊花", "元稹", "唐代", "不是花中偏爱菊，此花开尽更无花。", "突出菊花晚开耐霜之品格。"],
      ["不第后赋菊", "黄巢", "唐代", "待到秋来九月八，我花开后百花杀。", "以菊写豪迈气势，风格雄健。"],
    ],
    芙蓉: [
      ["涉江采芙蓉", "佚名", "汉代", "涉江采芙蓉，兰泽多芳草。", "芙蓉寄托思念，清婉动人。"],
      ["采莲曲", "王昌龄", "唐代", "荷叶罗裙一色裁，芙蓉向脸两边开。", "芙蓉映美人，柔美明丽。"],
      ["古风", "李白", "唐代", "清水出芙蓉，天然去雕饰。", "借芙蓉赞自然清丽之美。"],
    ],
    山茶: [
      ["山茶", "陆游", "南宋", "东园三月雨兼风，桃李飘零扫地空。", "以百花凋零反衬山茶风骨。"],
      ["山茶", "苏轼", "北宋", "游蜂掠尽粉丝黄，落蕊犹收蜜露香。", "写山茶余香不散，含蓄清雅。"],
      ["山茶花", "贯休", "唐代", "风裁日染开仙囿，百花色死猩血谬。", "写山茶色泽浓烈，气韵不凡。"],
    ],
    水仙: [
      ["水仙花", "杨万里", "南宋", "韵绝香仍绝，花清月未清。", "写水仙清韵幽香，格调高洁。"],
      ["水仙花", "刘克庄", "南宋", "岁华摇落物萧然，一种清风绝可怜。", "水仙凌冬而开，清冷可爱。"],
      ["广群芳谱", "刘灏", "清代", "得水能仙天与奇，寒香寂寞动冰肌。", "写水仙临水仙姿，寒香清绝。"],
    ],
  };

  return (poemMap[data.flower] || [])
    .map(([title, author, dynasty, content, appreciation]) => ({ title, author, dynasty, content, appreciation }))
    .filter((poem) => poem.content !== data.poem)
    .slice(0, 5);
}

function localKeywordMatch(keyword) {
  const exact = flowerService.recommendByKeyword(keyword).map((item) => ({
    ...item,
    matchReason: "本地关键词命中",
  }));
  if (exact.length) return exact;

  return flowerService.flowers
    .map((flower) => {
      const haystack = `${flower.flower} ${flower.godName} ${flower.dynasty} ${flower.keyword} ${flower.cultureImage} ${flower.dynastyStyle}`;
      let score = haystack.includes(keyword) ? 4 : 0;
      for (const char of Array.from(keyword)) {
        if (char.trim() && haystack.includes(char)) score += 1;
      }
      return { flower, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ flower }) => ({
      month: flower.month,
      monthName: MONTH_NAMES[flower.month - 1],
      flower: flower.flower,
      godName: flower.godName,
      dynasty: flower.dynasty,
      matchReason: "本地意象模糊匹配",
    }));
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/flowers", (_req, res) => {
  res.json(flowerService.getAllSummaries());
});

app.get("/api/flowers/month/:month", (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });
  res.json(data);
});

app.get("/api/poems/:month", async (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });

  if (!hasLLMKey()) {
    return res.json({ source: "local", poems: fallbackPoems(data), message: "未配置 DASHSCOPE_API_KEY，已使用本地诗句" });
  }

  try {
    const poems = await generatePoems(data.flower, data.dynasty, data.poem);
    res.json({ source: poems.length ? "ai" : "local", poems: poems.length ? poems : fallbackPoems(data) });
  } catch (e) {
    console.log("AI poems generation failed:", e.message);
    res.json({ source: "local", poems: fallbackPoems(data), message: e.message });
  }
});

app.get("/api/keywords", (_req, res) => {
  res.json(flowerService.getKeywords());
});

app.get("/api/recommend", async (req, res) => {
  let keyword = req.query.keyword || "";
  if (typeof keyword !== "string") keyword = "";
  keyword = decodeURIComponent(keyword).trim();
  if (!keyword) return res.status(400).json({ error: "缺少关键词" });

  let results = localKeywordMatch(keyword);
  let source = "local";

  if (hasLLMKey()) {
    try {
      const aiResults = await aiKeywordMatch(keyword, flowerService.getAllSummaries());
      const aiMatches = aiResults
        .map((match) => {
          const flower = flowerService.findByMonth(match.month);
          if (!flower) return null;
          return {
            month: flower.month,
            monthName: MONTH_NAMES[flower.month - 1],
            flower: flower.flower,
            godName: flower.godName,
            dynasty: flower.dynasty,
            matchReason: match.reason || "AI 判断意象相近",
          };
        })
        .filter(Boolean);
      if (aiMatches.length) {
        results = aiMatches;
        source = "ai";
      }
    } catch (e) {
      console.log("AI keyword match failed:", e.message);
    }
  }

  res.json({ keyword, source, results });
});

app.get("/api/stats/dynasty", (_req, res) => {
  res.json(flowerService.getDynastyStats());
});

app.get("/api/broadcast/:month", (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });
  const script = flowerService.generateBroadcastScript(data.aiScript, 80);
  res.json({ flower: data.flower, script, length: String(script.length) });
});

app.post("/api/records", (req, res) => {
  const { queryType = "", queryInput = "", resultText = "" } = req.body || {};
  const success = flowerService.saveRecord(queryType, queryInput, resultText);
  res.json({ success });
});

app.get("/api/podcast/:month", async (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });

  let text = buildPodcast(data);
  let source = "local";
  if (hasLLMKey()) {
    try {
      const aiText = await generatePodcastScript(data);
      if (aiText && aiText.length > 200) {
        text = aiText;
        source = "ai";
      }
    } catch (e) {
      console.log("AI podcast generation failed:", e.message);
    }
  }

  res.json({
    month,
    flower: data.flower,
    godName: data.godName,
    dynasty: data.dynasty,
    text,
    length: text.length,
    source,
  });
});

app.get("/api/podcast/:month/stream", async (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendChunk = (chunk, full) => {
    const cleaned = full.replace(/\n/g, " ").replace(/\s+/g, " ");
    res.write(`data: ${JSON.stringify({ chunk, full: cleaned, text: full })}\n\n`);
  };

  if (!hasLLMKey()) {
    const text = buildPodcast(data);
    const cleaned = text.replace(/\n/g, " ").replace(/\s+/g, " ");
    res.write(`data: ${JSON.stringify({ done: true, full: cleaned, text, length: text.length, source: "local" })}\n\n`);
    res.end();
    return;
  }

  try {
    const text = await generatePodcastScriptStream(data, sendChunk);
    const cleaned = text.replace(/\n/g, " ").replace(/\s+/g, " ");
    res.write(`data: ${JSON.stringify({ done: true, full: cleaned, text, length: text.length, source: "ai" })}\n\n`);
  } catch (e) {
    console.log("AI podcast stream failed:", e.message);
    const text = buildPodcast(data);
    const cleaned = text.replace(/\n/g, " ").replace(/\s+/g, " ");
    res.write(`data: ${JSON.stringify({ done: true, full: cleaned, text, length: text.length, source: "local" })}\n\n`);
  }

  res.end();
});

app.get("/api/podcast-dialog/:month", async (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });

  let text = buildPodcast(data);
  let source = "local";
  let paragraphs = parseDialogueParagraphs(text);

  if (hasLLMKey()) {
    try {
      const aiText = await generateDialoguePodcast(data);
      if (aiText && aiText.length > 200) {
        text = aiText;
        source = "ai";
        paragraphs = parseDialogueParagraphs(text);
      }
    } catch (e) {
      console.log("AI dialogue podcast generation failed:", e.message);
    }
  }

  res.json({
    month,
    flower: data.flower,
    godName: data.godName,
    dynasty: data.dynasty,
    text,
    paragraphs,
    length: text.length,
    source,
    model: DEFAULT_MODEL,
  });
});

app.get("/api/podcast-dialog/:month/stream", async (req, res) => {
  const month = Number(req.params.month);
  const data = flowerService.findByMonth(month);
  if (!data) return res.status(400).json({ error: "无效月份" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendChunk = (chunk, full) => {
    const normalized = normalizeDialogueScript(full);
    const paragraphs = parseDialogueParagraphs(normalized);
    res.write(`data: ${JSON.stringify({ chunk, full: normalized, paragraphs, text: normalized })}\n\n`);
  };

  if (!hasLLMKey()) {
    const text = buildPodcast(data);
    const normalized = normalizeDialogueScript(text);
    const paragraphs = parseDialogueParagraphs(normalized);
    res.write(`data: ${JSON.stringify({ done: true, full: normalized, text: normalized, paragraphs, length: normalized.length, source: "local" })}\n\n`);
    res.end();
    return;
  }

  try {
    const text = await generateDialoguePodcastStream(data, sendChunk);
    const normalized = normalizeDialogueScript(text);
    const paragraphs = parseDialogueParagraphs(normalized);
    res.write(`data: ${JSON.stringify({ done: true, full: normalized, text: normalized, paragraphs, length: normalized.length, source: "ai", model: DEFAULT_MODEL })}\n\n`);
  } catch (e) {
    console.log("AI dialogue podcast stream failed:", e.message);
    const text = buildPodcast(data);
    const normalized = normalizeDialogueScript(text);
    const paragraphs = parseDialogueParagraphs(normalized);
    res.write(`data: ${JSON.stringify({ done: true, full: normalized, text: normalized, paragraphs, length: normalized.length, source: "local" })}\n\n`);
  }

  res.end();
});

const TTS_MODELS = [
  { model: "cosyvoice-v3-flash", endpoint: "/api/v1/services/audio/tts/SpeechSynthesizer" },
  { model: "qwen3-tts-flash", endpoint: "/api/v1/services/audio/tts/SpeechSynthesizer" },
];

const TTS_VOICES = {
  cosyvoice: { male: "longanyang", female: "longanhuan" },
  qwen: { male: "Cherry", female: "Cherry" },
};

async function requestTTS(text, voice, modelIndex = 0) {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim().slice(0, 800);
  if (!cleanText) return Promise.resolve(null);

  const config = TTS_MODELS[modelIndex];
  if (!config) {
    throw new Error("所有TTS模型均已尝试，无法合成语音");
  }

  const postData = JSON.stringify({
    model: config.model,
    input: {
      text: cleanText,
      voice,
      format: "mp3",
      sample_rate: 24000,
    },
  });

  const options = {
    hostname: "dashscope.aliyuncs.com",
    path: config.endpoint,
    method: "POST",
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    let responseData = "";
    const request = https.request(options, (apiRes) => {
      apiRes.on("data", (chunk) => {
        responseData += chunk;
      });
      apiRes.on("end", () => {
        try {
          const result = JSON.parse(responseData);
          console.log(`TTS ${config.model} Response:`, JSON.stringify(result).slice(0, 300));
          if (result.output?.audio?.url) {
            resolve(result.output.audio.url);
          } else if (result.code && modelIndex < TTS_MODELS.length - 1) {
            console.log(`TTS ${config.model} failed with code ${result.code}, trying next model`);
            requestTTS(text, TTS_VOICES.qwen.male, modelIndex + 1).then(resolve, reject);
          } else {
            reject(new Error(result.message || result.code || "TTS合成失败"));
          }
        } catch {
          reject(new Error("TTS响应解析失败"));
        }
      });
    });
    request.on("error", (e) => {
      if (modelIndex < TTS_MODELS.length - 1) {
        console.log(`TTS ${config.model} network error: ${e.message}, trying next model`);
        requestTTS(text, TTS_VOICES.qwen.male, modelIndex + 1).then(resolve, reject);
      } else {
        reject(e);
      }
    });
    request.write(postData);
    request.end();
  });
}

async function requestTTSWithRetry(text, voice, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await requestTTS(text, voice);
    } catch (error) {
      lastError = error;
      if (i < retries) await new Promise((resolve) => setTimeout(resolve, 450 * (i + 1)));
    }
  }
  throw lastError;
}

function parseDialogueParagraphs(text) {
  return normalizeDialogueScript(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matched = line.match(/^(男|女)\s*[：:](.+)$/);
      return {
        speaker: matched?.[1] === "男" ? "male" : "female",
        text: (matched ? matched[2] : line).trim(),
      };
    })
    .filter((item) => item.text);
}

app.post("/api/tts", async (req, res) => {
  const { text, voice = "longanyang" } = req.body;
  if (!text) return res.status(400).json({ error: "缺少文本内容" });
  if (!DASHSCOPE_API_KEY) {
    return res.status(503).json({ success: false, error: "未配置 DASHSCOPE_API_KEY，无法进行语音合成" });
  }

  const truncatedText = text.slice(0, 3000);
  const postData = JSON.stringify({
    model: "cosyvoice-v3-flash",
    input: {
      text: truncatedText,
      voice,
      format: "mp3",
      sample_rate: 24000,
    },
  });

  const options = {
    hostname: "dashscope.aliyuncs.com",
    path: "/api/v1/services/audio/tts/SpeechSynthesizer",
    method: "POST",
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  let responseData = "";
  const request = https.request(options, (apiRes) => {
    apiRes.on("data", (chunk) => {
      responseData += chunk;
    });
    apiRes.on("end", () => {
      try {
        const result = JSON.parse(responseData);
        console.log("TTS Response:", JSON.stringify(result).slice(0, 300));
        if (result.output?.audio?.url) {
          res.json({ success: true, url: result.output.audio.url, textLength: truncatedText.length });
        } else {
          res.status(500).json({ success: false, error: result.message || "TTS合成失败" });
        }
      } catch {
        res.status(500).json({ success: false, error: "TTS响应解析失败" });
      }
    });
  });

  request.on("error", (e) => {
    console.log("TTS Error:", e.message);
    res.status(500).json({ success: false, error: e.message });
  });

  request.write(postData);
  request.end();
});

app.post("/api/tts-dialog", async (req, res) => {
  const { paragraphs, text } = req.body;
  const normalizedParagraphs = Array.isArray(paragraphs) && paragraphs.length ? paragraphs : parseDialogueParagraphs(text || "");
  if (!normalizedParagraphs.length) {
    return res.status(400).json({ success: false, error: "缺少可合成的男女对话段落" });
  }
  if (!DASHSCOPE_API_KEY) {
    return res.status(503).json({ success: false, error: "未配置 DASHSCOPE_API_KEY" });
  }

  const maleVoice = TTS_VOICES.cosyvoice.male;
  const femaleVoice = TTS_VOICES.cosyvoice.female;
  
  const audioUrls = [];
  
  for (const para of normalizedParagraphs.slice(0, 18)) {
    const voice = para.speaker === "male" ? maleVoice : femaleVoice;
    const paraText = para.text.slice(0, 500);
    
    try {
      const audioUrl = await requestTTS(paraText, voice, 0);
      audioUrls.push({ speaker: para.speaker, url: audioUrl, text: para.text });
    } catch (e) {
      console.log("TTS Dialog Error:", e.message);
      audioUrls.push({ speaker: para.speaker, url: null, error: e.message, text: para.text });
    }
    
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const successCount = audioUrls.filter((item) => item.url).length;
  res.json({
    success: successCount > 0,
    audios: audioUrls,
    failedCount: audioUrls.length - successCount,
    error: successCount > 0 ? "" : "所有段落语音合成失败，请稍后重试或检查 API Key/网络",
  });
});

app.use(express.static(FRONTEND_DIR));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`花月诗境服务已启动: http://localhost:${PORT}`);
});
