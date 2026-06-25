const https = require("https");

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DEFAULT_MODEL = "qwen3.7-plus";

async function callLLM(prompt, model = DEFAULT_MODEL, options = {}) {
  if (!DASHSCOPE_API_KEY) {
    throw new Error("未配置 API Key");
  }

  const { maxTokens = 2048, temperature = 0.7, topP = 0.9, messages } = options;

  const postData = JSON.stringify({
    model,
    input: {
      messages: messages || [{ role: "user", content: prompt }],
    },
    parameters: {
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    },
  });

  const reqOptions = {
    hostname: "dashscope.aliyuncs.com",
    path: "/api/v1/services/aigc/text-generation/generation",
    method: "POST",
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    let responseData = "";
    const request = https.request(reqOptions, (apiRes) => {
      apiRes.on("data", (chunk) => {
        responseData += chunk;
      });
      apiRes.on("end", () => {
        try {
          const result = JSON.parse(responseData);
          if (result.output && result.output.choices && result.output.choices[0]) {
            resolve(result.output.choices[0].message.content);
          } else if (result.code) {
            reject(new Error(result.message || "LLM调用失败"));
          } else {
            reject(new Error("LLM响应解析失败"));
          }
        } catch {
          reject(new Error("LLM响应解析失败"));
        }
      });
    });

    request.on("error", (e) => {
      reject(e);
    });

    request.write(postData);
    request.end();
  });
}

async function callLLMStream(prompt, model = DEFAULT_MODEL, onChunk, options = {}) {
  if (!DASHSCOPE_API_KEY) {
    throw new Error("未配置 API Key");
  }

  const { maxTokens = 2048, temperature = 0.7, topP = 0.9, messages } = options;

  const postData = JSON.stringify({
    model,
    input: {
      messages: messages || [{ role: "user", content: prompt }],
    },
    parameters: {
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    },
    stream: true,
  });

  const reqOptions = {
    hostname: "dashscope.aliyuncs.com",
    path: "/api/v1/services/aigc/text-generation/generation",
    method: "POST",
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(reqOptions, (apiRes) => {
      let fullContent = "";
      apiRes.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              let content = "";
              if (data.output?.choices?.[0]?.message?.content) {
                content = data.output.choices[0].message.content;
              } else if (data.output?.choices?.[0]?.delta?.content) {
                content = data.output.choices[0].delta.content;
              } else if (data.output?.text) {
                content = data.output.text;
              }
              if (content) {
                fullContent += content;
                if (onChunk) onChunk(content, fullContent);
              }
            } catch (e) {
              console.log("Stream parse error:", e.message);
            }
          }
        }
      });
      apiRes.on("end", () => {
        resolve(fullContent.trim());
      });
    });

    request.on("error", reject);
    request.write(postData);
    request.end();
  });
}

function normalizeDialogueScript(text) {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matched = line.match(/^[【\[]?(男|女|主持人|嘉宾|旁白)[】\]]?\s*[：:]\s*(.+)$/);
      if (matched) {
        const speaker = matched[1] === "男" || matched[1] === "主持人" ? "男" : "女";
        return `${speaker}：${matched[2].trim()}`;
      }
      return line;
    })
    .join("\n");
}

async function generatePodcastScript(flowerData) {
  const prompt = `你是一位精通中国古典诗词与花卉文化的播客主持人。请为"${flowerData.flower}"（${flowerData.dynasty}花神：${flowerData.godName}）生成一段约500字的播客文案，适合4-5分钟音频播放。

要求：
1. 开头友好亲切，介绍本期主题
2. 讲述花神${flowerData.godName}与${flowerData.flower}的渊源
3. 引用2-3句经典诗句，并简要赏析
4. 介绍${flowerData.flower}的文化意象和象征意义
5. 结合${flowerData.dynasty}的诗词风格进行解读
6. 结尾温馨，预告下期内容

请直接输出文案内容，不要包含任何标记或前缀。`;

  const content = await callLLM(prompt, DEFAULT_MODEL, { maxTokens: 3000, temperature: 0.8 });
  return content.trim();
}

async function generatePodcastScriptStream(flowerData, onChunk) {
  const prompt = `你是一位精通中国古典诗词与花卉文化的播客主持人。请为"${flowerData.flower}"（${flowerData.dynasty}花神：${flowerData.godName}）生成一段约500字的播客文案，适合4-5分钟音频播放。

要求：
1. 开头友好亲切，介绍本期主题
2. 讲述花神${flowerData.godName}与${flowerData.flower}的渊源
3. 引用2-3句经典诗句，并简要赏析
4. 介绍${flowerData.flower}的文化意象和象征意义
5. 结合${flowerData.dynasty}的诗词风格进行解读
6. 结尾温馨，预告下期内容

请直接输出文案内容，不要包含任何标记或前缀。`;

  return callLLMStream(prompt, DEFAULT_MODEL, onChunk, { maxTokens: 3000, temperature: 0.8 });
}

async function generateDialoguePodcast(flowerData) {
  const { flower, godName, dynasty, poem, cultureImage, dynastyStyle, month } = flowerData;
  const monthNames = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthName = monthNames[(month || 1) - 1];

  const systemPrompt = `你是一位专业的播客编剧，擅长创作男女双人对话的文化类播客节目。
请以"花月诗境"为栏目名，创作一期关于${monthName}${flower}的男女对话播客。

角色设定：
- 男主持人（阿明）：知识渊博，风趣幽默，负责引导话题和补充背景知识
- 女主持人（小雅）：温婉细腻，感性文艺，负责诗词赏析和情感共鸣

对话要求：
1. 自然流畅的男女交替对话，避免独白式内容
2. 每段对话1-3句话，适合语音合成
3. 整体时长约5-6分钟，约800-1000字
4. 对话要有互动感、问答感，像真实的播客录制

内容结构：
- 开场白：欢迎听众，介绍本期主题（${monthName}${flower}与花神${godName}）
- 花神故事：讲述${godName}与${flower}的渊源典故
- 诗词赏析：引用2-3句经典${dynasty}诗词，进行赏析交流
- 文化解读：探讨${flower}的文化意象（${cultureImage}）
- 时代背景：结合${dynasty}诗词风格（${dynastyStyle}）展开
- 结尾：总结本期内容，温馨告别，预告下期

输出格式：
每行以"男："或"女："开头，后面跟对话内容。
例如：
男：各位听众朋友们，大家好，欢迎收听花月诗境播客。
女：大家好，我是小雅。今天我们要聊的可是大有来头呢！

注意：只输出对话内容，不要任何其他说明文字。`;

  const content = await callLLM(systemPrompt, DEFAULT_MODEL, {
    maxTokens: 4000,
    temperature: 0.85,
    topP: 0.92,
  });

  return normalizeDialogueScript(content);
}

async function generateDialoguePodcastStream(flowerData, onChunk) {
  const { flower, godName, dynasty, poem, cultureImage, dynastyStyle, month } = flowerData;
  const monthNames = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthName = monthNames[(month || 1) - 1];

  const systemPrompt = `你是一位专业的播客编剧，擅长创作男女双人对话的文化类播客节目。
请以"花月诗境"为栏目名，创作一期关于${monthName}${flower}的男女对话播客。

角色设定：
- 男主持人（阿明）：知识渊博，风趣幽默，负责引导话题和补充背景知识
- 女主持人（小雅）：温婉细腻，感性文艺，负责诗词赏析和情感共鸣

对话要求：
1. 自然流畅的男女交替对话，避免独白式内容
2. 每段对话1-3句话，适合语音合成
3. 整体时长约5-6分钟，约800-1000字
4. 对话要有互动感、问答感，像真实的播客录制

内容结构：
- 开场白：欢迎听众，介绍本期主题（${monthName}${flower}与花神${godName}）
- 花神故事：讲述${godName}与${flower}的渊源典故
- 诗词赏析：引用2-3句经典${dynasty}诗词，进行赏析交流
- 文化解读：探讨${flower}的文化意象（${cultureImage}）
- 时代背景：结合${dynasty}诗词风格（${dynastyStyle}）展开
- 结尾：总结本期内容，温馨告别，预告下期

输出格式：
每行以"男："或"女："开头，后面跟对话内容。
例如：
男：各位听众朋友们，大家好，欢迎收听花月诗境播客。
女：大家好，我是小雅。今天我们要聊的可是大有来头呢！

注意：只输出对话内容，不要任何其他说明文字。`;

  const fullContent = await callLLMStream(systemPrompt, DEFAULT_MODEL, onChunk, {
    maxTokens: 4000,
    temperature: 0.85,
    topP: 0.92,
  });

  return normalizeDialogueScript(fullContent);
}

async function generatePoems(flower, dynasty, existingPoem) {
  const prompt = `请为"${flower}"（${dynasty}花神相关）推荐3-5首经典诗词。已知诗句："${existingPoem}"。

请以JSON格式输出，包含poems数组，每个元素包含title（诗名）、author（作者）、dynasty（朝代）、content（诗句，引用最经典的句子）、appreciation（简短赏析，30字以内）。

示例格式：
{
  "poems": [
    {"title": "诗名", "author": "作者", "dynasty": "朝代", "content": "诗句", "appreciation": "赏析"}
  ]
}

请确保输出是合法的JSON格式。`;

  const content = await callLLM(prompt, DEFAULT_MODEL, { maxTokens: 2048, temperature: 0.7 });
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.poems && Array.isArray(result.poems)) {
        return result.poems;
      }
    }
  } catch {
    console.log("Poems JSON parse failed, fallback to text");
  }
  return [];
}

async function aiKeywordMatch(keyword, flowers) {
  const flowerList = flowers.map(f => `${f.month}月-${f.flower}-${f.godName}-${f.dynasty}`).join("；");
  
  const prompt = `请根据关键词"${keyword}"，从以下花卉列表中推荐3-5个最匹配的花卉：

花卉列表：
${flowerList}

请以JSON格式输出，包含matches数组，每个元素包含month（月份）、flower（花卉名称）、reason（匹配理由，30字以内）。

示例格式：
{
  "matches": [
    {"month": 1, "flower": "梅花", "reason": "梅花象征高洁，与关键词意境相符"}
  ]
}

请确保输出是合法的JSON格式。`;

  const content = await callLLM(prompt, DEFAULT_MODEL, { maxTokens: 1500, temperature: 0.6 });
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.matches && Array.isArray(result.matches)) {
        return result.matches;
      }
    }
  } catch {
    console.log("Keyword match JSON parse failed");
  }
  return [];
}

function hasLLMKey() {
  return !!DASHSCOPE_API_KEY;
}

module.exports = {
  callLLM,
  callLLMStream,
  generatePodcastScript,
  generatePodcastScriptStream,
  generateDialoguePodcast,
  generateDialoguePodcastStream,
  generatePoems,
  aiKeywordMatch,
  normalizeDialogueScript,
  hasLLMKey,
  DEFAULT_MODEL,
  DASHSCOPE_API_KEY,
};
