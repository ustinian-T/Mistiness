const https = require("https");

const DASHSCOPE_API_KEY = "sk-ws-H.RPXIHML.dupt.MEUCIQDwWUgU4RAp8PugAe1_HqUCWHuB85iblWNuwOkbjzQjJAIgPPYRooo8HxyAVUnwE0NY0FKCgr0NGazjLc9O8GhlLqw";

async function callLLM(prompt, model = "qwen3-8b-instruct") {
  if (!DASHSCOPE_API_KEY) {
    throw new Error("未配置 API Key");
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model,
      input: {
        messages: [{ role: "user", content: prompt }],
      },
      parameters: {
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
      },
    });

    const options = {
      hostname: "dashscope.aliyuncs.com",
      path: "/api/v1/services/aigc/text-generation/generation",
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

  const content = await callLLM(prompt, "qwen3-8b-instruct");
  return content.trim();
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

  const content = await callLLM(prompt, "qwen3-8b-instruct");
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

  const content = await callLLM(prompt, "qwen3-8b-instruct");
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

  const postData = JSON.stringify({
    model: "qwen3-8b-instruct",
    input: {
      messages: [{ role: "user", content: prompt }],
    },
    parameters: {
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    },
    stream: true,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "dashscope.aliyuncs.com",
      path: "/api/v1/services/aigc/text-generation/generation",
      method: "POST",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (apiRes) => {
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
              } else {
                console.log("Unknown stream format:", JSON.stringify(data).slice(0, 200));
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
        console.log("Stream ended, full content length:", fullContent.length);
        resolve(fullContent.trim());
      });
    });

    request.on("error", reject);
    request.write(postData);
    request.end();
  });
}

function hasLLMKey() {
  return !!DASHSCOPE_API_KEY;
}

module.exports = {
  callLLM,
  generatePodcastScript,
  generatePodcastScriptStream,
  generatePoems,
  aiKeywordMatch,
  hasLLMKey,
};
