const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { MONTH_NAMES, KEYWORD_MAP } = require("./constants");

class FlowerService {
  constructor(csvPath, recordPath) {
    this.csvPath = csvPath;
    this.recordPath = recordPath;
    this.flowers = [];
    this.load();
  }

  load() {
    const content = fs.readFileSync(this.csvPath, "utf-8");
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    });
    this.flowers = rows.map((row) => ({
      month: Number(row.month),
      flower: row.flower.trim(),
      godName: row.god_name.trim(),
      dynasty: row.dynasty.trim(),
      poem: row.poem.trim(),
      keyword: row.keyword.trim(),
      cultureImage: row.culture_image.trim(),
      dynastyStyle: row.dynasty_style.trim(),
      aiScript: row.ai_script.trim(),
    }));
  }

  getAllSummaries() {
    return this.flowers.map((f) => ({
      month: f.month,
      monthName: MONTH_NAMES[f.month - 1],
      flower: f.flower,
      godName: f.godName,
      dynasty: f.dynasty,
    }));
  }

  findByMonth(month) {
    if (month < 1 || month > 12) return null;
    return this.flowers.find((f) => f.month === month) || null;
  }

  getKeywords() {
    return Object.keys(KEYWORD_MAP).sort();
  }

  recommendByKeyword(keyword) {
    const names = KEYWORD_MAP[keyword] || [];
    return names
      .map((name) => this.flowers.find((f) => f.flower === name))
      .filter(Boolean)
      .map((f) => ({
        month: f.month,
        monthName: MONTH_NAMES[f.month - 1],
        flower: f.flower,
        godName: f.godName,
        dynasty: f.dynasty,
      }));
  }

  getDynastyStats() {
    const stats = {};
    for (const f of this.flowers) {
      stats[f.dynasty] = (stats[f.dynasty] || 0) + 1;
    }
    return stats;
  }

  generateBroadcastScript(aiScript, maxChars = 80) {
    if (!aiScript) return "暂无讲解稿";
    const text = aiScript.trim();
    if (text.length <= maxChars) return text;
    const cut = text.slice(0, maxChars);
    for (const sep of ["。", "，", "；", "、"]) {
      const idx = cut.lastIndexOf(sep);
      if (idx > maxChars / 2) return cut.slice(0, idx + 1);
    }
    return cut + "……";
  }

  saveRecord(queryType, queryInput, resultText) {
    try {
      const now = new Date().toLocaleString("zh-CN", { hour12: false });
      const record =
        `\n${"=".repeat(40)}\n` +
        `查询时间：${now}\n` +
        `查询类型：${queryType}\n` +
        `查询输入：${queryInput}\n` +
        `查询结果：${resultText}\n` +
        `${"=".repeat(40)}\n`;
      fs.mkdirSync(path.dirname(this.recordPath), { recursive: true });
      fs.appendFileSync(this.recordPath, record, "utf-8");
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = { FlowerService };
