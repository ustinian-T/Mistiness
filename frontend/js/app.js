let state = {
  flowers: [],
  keywords: [],
  currentPage: "home",
  selectedMonth: 1,
  chart: null,
};

const app = document.getElementById("app");

function flowerMonogram(flower, month) {
  const color = MONTH_COLORS[(month - 1 + MONTH_COLORS.length) % MONTH_COLORS.length];
  return `
    <div class="flower-monogram" style="--accent:${color}" aria-hidden="true">
      <span>${escapeHtml(flower).slice(0, 1)}</span>
    </div>
  `;
}

function setButtonLoading(btn, loadingText) {
  const originalText = btn.textContent;
  btn.textContent = loadingText;
  btn.disabled = true;
  return () => {
    btn.textContent = originalText;
    btn.disabled = false;
  };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

function getGodImageName(month, godName) {
  const overrides = {
    11: "白居易",
  };
  return overrides[month] || godName;
}

function flowerImageSrc(month, flower) {
  return `images/flowers/${month}月${flower}.jpg`;
}

function godImageSrc(month, godName) {
  return `images/gods/${month}月${getGodImageName(month, godName)}.jpg`;
}

function sourceLabel(source) {
  return source === "ai" ? "AI 生成" : "本地知识库";
}

function hero(title, desc) {
  return `
    <section class="hero liquid-glass reveal">
      <h1 class="hero-title">${escapeHtml(title)}</h1>
      <p class="hero-desc">${escapeHtml(desc)}</p>
    </section>
  `;
}

async function renderHome() {
  app.innerHTML = `
    ${hero("月令花神，一境入诗", "浅蓝诗境中漫游十二花神，查询诗词、匹配意象、统计朝代、生成花月播客。")}
    <div class="stats-row">
      <div class="stat-card liquid-glass reveal reveal-delay-1">
        <div class="stat-value">${state.flowers.length}</div>
        <div class="stat-label">月令花神</div>
      </div>
      <div class="stat-card liquid-glass reveal reveal-delay-2">
        <div class="stat-value">${state.keywords.length}</div>
        <div class="stat-label">意象关键词</div>
      </div>
      <div class="stat-card liquid-glass reveal reveal-delay-3">
        <div class="stat-value">5</div>
        <div class="stat-label">导览功能</div>
      </div>
    </div>
    <section class="panel liquid-glass reveal">
      <h2 class="panel-title">十二花神月历</h2>
      <div class="month-grid" id="homeMonthGrid"></div>
    </section>
    <section class="bento reveal">
      <div class="bento-cell liquid-glass glass-card">
        <span class="bento-tag">MONTH</span>
        <h3>按月导览</h3>
        <p>点选月份，查看花神、诗句、文化意象与 AI 讲解稿。</p>
      </div>
      <div class="bento-cell liquid-glass glass-card">
        <span class="bento-tag">IMAGE</span>
        <h3>意象匹配</h3>
        <p>输入高洁、爱情、隐逸等关键词，发现呼应的花卉。</p>
      </div>
      <div class="bento-cell liquid-glass glass-card">
        <span class="bento-tag">DATA</span>
        <h3>朝代统计</h3>
        <p>柱状图呈现各朝代花神分布，感受时代文脉。</p>
      </div>
      <div class="bento-cell liquid-glass glass-card">
        <span class="bento-tag">VOICE</span>
        <h3>花月播客</h3>
        <p>生成播客文案，一键语音合成在线收听。</p>
      </div>
    </section>
  `;

  const grid = document.getElementById("homeMonthGrid");
  grid.innerHTML = state.flowers
    .map(
      (f) => `
      <article class="month-tile liquid-glass glass-card reveal" data-month="${f.month}">
        <div class="month-tile-content">
          <div class="month-bar" style="background:${MONTH_COLORS[f.month - 1]}"></div>
          <div class="month-num">${String(f.month).padStart(2, "0")}月</div>
          <div class="month-flower">${escapeHtml(f.flower)}</div>
          <div class="month-meta">${escapeHtml(f.godName)} · ${escapeHtml(f.dynasty)}</div>
        </div>
        <div class="month-flower-image">
          <img src="${flowerImageSrc(f.month, f.flower)}" alt="${escapeHtml(f.flower)}" />
        </div>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll("[data-month]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedMonth = Number(el.dataset.month);
      navigate("month");
    });
  });
  observeReveals(app);
}

async function renderMonth() {
  app.innerHTML = `
    ${hero("十二花神按月查询", "选择月份，在液态玻璃诗境中展开花神人物、经典诗句与文化解读。")}
    <section class="panel liquid-glass-strong reveal">
      <label class="section-label" for="monthSelect">选择月份</label>
      <select id="monthSelect" class="field">
        ${state.flowers
          .map(
            (f) =>
              `<option value="${f.month}" ${f.month === state.selectedMonth ? "selected" : ""}>${f.month}月 · ${escapeHtml(f.flower)}</option>`
          )
          .join("")}
      </select>
      <div id="monthResult" class="reveal" style="margin-top:1rem"></div>
    </section>
  `;

  const select = document.getElementById("monthSelect");
  select.addEventListener("change", () => {
    state.selectedMonth = Number(select.value);
    loadMonthResult();
  });
  await loadMonthResult();
  observeReveals(app);
}

async function loadMonthResult() {
  const box = document.getElementById("monthResult");
  box.innerHTML = `<div class="loading liquid-glass"><div class="spinner"></div><p>查询中...</p></div>`;
  try {
    const data = await api.getByMonth(state.selectedMonth);
    const monthName = MONTH_NAMES[data.month - 1];
    box.innerHTML = `
      <div class="month-detail-layout">
        <div class="panel liquid-glass reveal is-visible" style="margin:0;padding:1.25rem">
          <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:0.75rem;margin-bottom:1rem">
            <div>
              <div class="section-label">${monthName}</div>
              <h2 style="margin:0;font-family:var(--font-serif);font-size:1.75rem">${escapeHtml(data.flower)}</h2>
            </div>
            <span class="glass-chip active">${escapeHtml(data.dynasty)}</span>
          </div>
          <div class="grid-2">
            <div class="meta-item"><div class="meta-label">花神人物</div><div class="meta-value"><a href="https://baike.baidu.com/item/${encodeURIComponent(data.godName)}" target="_blank" class="baidu-link">${escapeHtml(data.godName)}</a></div></div>
            <div class="meta-item"><div class="meta-label">所属朝代</div><div class="meta-value"><a href="https://baike.baidu.com/item/${encodeURIComponent(data.dynasty)}" target="_blank" class="baidu-link">${escapeHtml(data.dynasty)}</a></div></div>
          </div>
          <div class="section-label">经典诗句</div>
          <div class="poem-glass liquid-glass">"${escapeHtml(data.poem)}"</div>
          <div class="toolbar">
            <button class="btn-ghost" id="loadPoemsBtn">AI 查询更多相关诗词</button>
          </div>
          <div id="poemsPreview"></div>
          <div class="section-label">文化意象</div>
          <p class="section-text">${escapeHtml(data.cultureImage)}</p>
          <div class="section-label">朝代诗词风格</div>
          <p class="section-text">${escapeHtml(data.dynastyStyle)}</p>
          <div class="section-label">AI 讲解稿</div>
          <p class="section-text">${escapeHtml(data.aiScript)}</p>
          <div class="toolbar">
            <button class="btn-primary" id="genPodcastBtn">生成播客文案</button>
            <button class="btn-ghost" id="saveRecordBtn">保存查询记录</button>
          </div>
          <div id="podcastPreview"></div>
        </div>
        <div class="god-image-container liquid-glass reveal is-visible">
          <div class="god-image-wrapper" style="--accent:${MONTH_COLORS[data.month - 1]}">
            <img src="${godImageSrc(data.month, data.godName)}" alt="${escapeHtml(data.godName)}" />
            <div class="god-image-overlay">
              <div class="god-month">${String(data.month).padStart(2, "0")}</div>
              <div class="god-flower">${escapeHtml(data.flower)}</div>
              <div class="god-name">花神 · ${escapeHtml(data.godName)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("loadPoemsBtn").addEventListener("click", async (event) => {
      const restore = setButtonLoading(event.currentTarget, "AI 查询中...");
      const target = document.getElementById("poemsPreview");
      target.innerHTML = `<div class="loading compact liquid-glass"><div class="spinner"></div><p>正在查询更多诗词...</p></div>`;
      try {
        const res = await api.getPoems(state.selectedMonth);
        const poems = res.poems || [];
        target.innerHTML = poems.length ? `
          <div class="section-label">扩展诗词 · ${sourceLabel(res.source)}</div>
          <div class="poem-list">
            ${poems.map((p) => `
              <div class="poem-item liquid-glass">
                <div class="poem-header">
                  <span class="poem-title">${escapeHtml(p.title)}</span>
                  <span class="poem-author">${escapeHtml(p.author)} · ${escapeHtml(p.dynasty)}</span>
                </div>
                <div class="poem-content">"${escapeHtml(p.content)}"</div>
                <div class="poem-appreciation">${escapeHtml(p.appreciation)}</div>
              </div>
            `).join("")}
          </div>
        ` : `<div class="empty">暂未查询到更多诗词</div>`;
      } catch (err) {
        target.innerHTML = `<div class="empty">${escapeHtml(err.message || "AI 诗词查询失败")}</div>`;
      } finally {
        restore();
      }
    });

    document.getElementById("genPodcastBtn").addEventListener("click", async () => {
      const preview = document.getElementById("podcastPreview");
      const month = state.selectedMonth;
      preview.innerHTML = `
        <div class="podcast-layout">
          <div class="podcast-text-container">
            <div class="section-label" id="podcastStatus">正在生成播客文案...</div>
            <div class="podcast-text" id="podcastText"></div>
            <div class="toolbar" id="podcastActions" style="margin-top:0.75rem;display:none">
              <button class="btn-ghost" id="copyPodcastBtn">复制文案</button>
              <button class="btn-primary" id="genTTSBtn">语音合成</button>
            </div>
            <div id="audioPlayerContainer"></div>
          </div>
          <div class="podcast-flower-image">
            <img src="images/flowers/${month}月${data.flower}.jpg" alt="${escapeHtml(data.flower)}" />
          </div>
        </div>
      `;
      
      let finalText = "";
      let isFirstChunk = true;
      
      try {
        const response = await fetch(`/api/podcast/${month}/stream`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split("\n").filter(line => line.startsWith("data: "));
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.full !== undefined) {
                finalText = data.full;
                const textEl = document.getElementById("podcastText");
                if (isFirstChunk && data.full.length > 0) {
                  isFirstChunk = false;
                }
                const paragraphs = data.full.split(/(?<=[，。！？；])/).join("");
                textEl.innerHTML = `<p style="text-indent:2em">${escapeHtml(paragraphs)}</p>`;
                textEl.innerHTML = textEl.innerHTML.replace(/<\/p><p/g, "</p><p style='text-indent:2em'>");
                
                if (data.done) {
                  document.getElementById("podcastStatus").textContent = `播客文案 (${data.length} 字) · ${sourceLabel(data.source)}`;
                  document.getElementById("podcastActions").style.display = "flex";
                  
                  document.getElementById("copyPodcastBtn").addEventListener("click", () => {
                    navigator.clipboard.writeText(finalText);
                    showToast("文案已复制");
                  });
                  document.getElementById("genTTSBtn").addEventListener("click", async () => {
                    const audioContainer = document.getElementById("audioPlayerContainer");
                    audioContainer.innerHTML = `<div class="loading liquid-glass"><div class="spinner"></div><p>合成中...</p></div>`;
                    try {
                      const ttsRes = await api.generateTTS(finalText);
                      audioContainer.innerHTML = `
                        <div class="audio-player liquid-glass">
                          <audio id="podcastAudio" src="${ttsRes.url}" controls></audio>
                          <div class="audio-info">音频已生成，时长约 ${Math.ceil(data.length / 120)} 分钟</div>
                        </div>
                      `;
                    } catch (e) {
                      audioContainer.innerHTML = `<div class="glass-card" style="color:#ff6b6b">合成失败: ${e.message}</div>`;
                    }
                  });
                }
              }
            } catch {}
          }
        }
      } catch (e) {
        preview.innerHTML = `<div class="glass-card" style="color:#ff6b6b">生成失败: ${e.message}</div>`;
      }
    });

    document.getElementById("saveRecordBtn").addEventListener("click", async () => {
      const summary = `${monthName}${data.flower}，花神${data.godName}，${data.dynasty}`;
      const res = await api.saveRecord({
        queryType: "按月查询",
        queryInput: String(state.selectedMonth),
        resultText: summary,
      });
      showToast(res.success ? "记录已保存至 record.txt" : "保存失败");
    });
  } catch {
    box.innerHTML = `<div class="empty">请输入 1-12 有效月份</div>`;
  }
}

async function renderKeyword() {
  app.innerHTML = `
    ${hero("关键词智能花卉推荐", "点击意象词或输入关键词，系统将匹配对应的月令花卉。")}
    <section class="panel liquid-glass reveal">
      <div class="chip-row" id="keywordChips"></div>
      <input id="keywordInput" class="field" placeholder="如：高洁、爱情、隐逸" />
      <div class="toolbar">
        <button class="btn-primary" id="matchBtn">匹配花卉</button>
      </div>
      <div id="keywordResult"></div>
    </section>
  `;

  const chips = document.getElementById("keywordChips");
  chips.innerHTML = state.keywords
    .slice(0, 16)
    .map((kw) => `<button type="button" class="glass-chip" data-kw="${escapeHtml(kw)}">${escapeHtml(kw)}</button>`)
    .join("");

  chips.querySelectorAll("[data-kw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("keywordInput").value = btn.dataset.kw;
      matchKeyword();
    });
  });

  document.getElementById("matchBtn").addEventListener("click", matchKeyword);
  document.getElementById("keywordInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") matchKeyword();
  });
  observeReveals(app);
}

async function matchKeyword() {
  const keyword = document.getElementById("keywordInput").value.trim();
  const box = document.getElementById("keywordResult");
  if (!keyword) {
    box.innerHTML = `<div class="empty">请输入关键词</div>`;
    return;
  }
  try {
    const payload = await api.recommend(keyword);
    const results = Array.isArray(payload) ? payload : payload.results || [];
    const source = Array.isArray(payload) ? "local" : payload.source;
    if (!results.length) {
      box.innerHTML = `<div class="empty">暂无对应花卉，请更换关键词</div>`;
      return;
    }
    box.innerHTML = `
      <div class="section-label">匹配结果 (${results.length}) · ${sourceLabel(source)}</div>
      <div class="flower-results">
        ${results
          .map(
            (f) => `
          <article class="glass-card liquid-glass reveal">
            <div class="month-flower">${escapeHtml(f.flower)}</div>
            <div class="month-meta">${escapeHtml(f.monthName || f.month + "月")} · ${escapeHtml(f.godName)}</div>
            <div class="month-meta">${escapeHtml(f.dynasty)}</div>
            ${f.matchReason ? `<div class="match-reason">${escapeHtml(f.matchReason)}</div>` : ""}
          </article>
        `
          )
          .join("")}
      </div>
      <div class="toolbar">
        <button class="btn-ghost" id="saveKwBtn">保存推荐记录</button>
      </div>
    `;
    document.getElementById("saveKwBtn").addEventListener("click", async () => {
      const summary = results.map((r) => r.flower).join("、");
      const res = await api.saveRecord({
        queryType: "关键词推荐",
        queryInput: keyword,
        resultText: summary,
      });
      showToast(res.success ? "记录已保存" : "保存失败");
    });
    observeReveals(box);
  } catch {
    box.innerHTML = `<div class="empty">匹配失败，请确认后端已启动</div>`;
  }
}

async function renderDynasty() {
  app.innerHTML = `
    ${hero("朝代诗词数据统计", "浅蓝玻璃面板中呈现各朝代花神数量，感受诗词文化的时代分布。")}
    <section class="panel liquid-glass reveal">
      <div class="grid-2">
        <div>
          <h2 class="panel-title">数据明细</h2>
          <div id="dynastyTable"></div>
        </div>
        <div>
          <h2 class="panel-title">统计图表</h2>
          <div class="chart-wrap liquid-glass">
            <canvas id="dynastyChart"></canvas>
          </div>
        </div>
      </div>
    </section>
  `;

  const stats = await api.dynastyStats();
  const entries = Object.entries(stats);
  document.getElementById("dynastyTable").innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead><tr style="color:var(--ink-muted)"><th style="text-align:left;padding:0.5rem">朝代</th><th style="text-align:right;padding:0.5rem">数量</th></tr></thead>
      <tbody>
        ${entries
          .map(
            ([d, c]) =>
              `<tr><td style="padding:0.45rem 0.5rem;border-top:1px solid rgba(147,197,253,0.35)">${escapeHtml(d)}</td><td style="text-align:right;padding:0.45rem 0.5rem;border-top:1px solid rgba(147,197,253,0.35)">${c}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  if (state.chart) state.chart.destroy();
  const ctx = document.getElementById("dynastyChart");
  state.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: entries.map(([d]) => d),
      datasets: [
        {
          label: "花神数量",
          data: entries.map(([, c]) => c),
          backgroundColor: entries.map((_, i) => `rgba(59, 130, 246, ${0.35 + i * 0.07})`),
          borderColor: "#3b82f6",
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(147,197,253,0.25)" } },
        x: { grid: { display: false } },
      },
    },
  });
  observeReveals(app);
}

async function renderBroadcast() {
  app.innerHTML = `
    ${hero("花月诗境播客", "生成花卉主题播客，支持语音合成与在线播放。")}
    <section class="panel liquid-glass reveal">
      <select id="broadcastMonth" class="field">
        ${state.flowers
          .map(
            (f) =>
              `<option value="${f.month}" ${f.month === state.selectedMonth ? "selected" : ""}>${f.month}月 · ${escapeHtml(f.flower)}</option>`
          )
          .join("")}
      </select>
      <div class="toolbar">
        <button class="btn-primary" id="podcastBtn">生成播客文案</button>
        <button class="btn-primary" id="ttsBtn" disabled>语音合成</button>
        <button class="btn-ghost" id="copyBtn" disabled>复制文案</button>
      </div>
      <div id="broadcastResult"></div>
    </section>
  `;

  let lastPodcast = "";
  let lastMonth = state.selectedMonth;

  document.getElementById("broadcastMonth").addEventListener("change", (event) => {
    state.selectedMonth = Number(event.target.value);
    lastMonth = state.selectedMonth;
    lastPodcast = "";
    document.getElementById("copyBtn").disabled = true;
    document.getElementById("ttsBtn").disabled = true;
    document.getElementById("broadcastResult").innerHTML = "";
  });
  
  document.getElementById("podcastBtn").addEventListener("click", async () => {
    const month = Number(document.getElementById("broadcastMonth").value);
    const btn = document.getElementById("podcastBtn");
    const originalText = btn.textContent;
    btn.textContent = "生成中...";
    btn.disabled = true;
    
    const flowerData = state.flowers.find(f => f.month === month);
    const resultBox = document.getElementById("broadcastResult");
    resultBox.innerHTML = `
      <div class="podcast-wrap">
        <div class="podcast-bg-image">
          <img src="images/flowers/${month}月${flowerData.flower}.jpg" alt="${escapeHtml(flowerData.flower)}" />
        </div>
        <div class="podcast-content">
          <div class="section-label" id="podcastStatus">正在生成播客文案...</div>
          <div class="podcast-text" id="podcastTextContent"></div>
          <div id="audioPlayer" style="display:none"></div>
        </div>
      </div>
    `;
    
    let finalText = "";
    
    try {
      const res = await api.getPodcast(month);
      lastPodcast = res.text;
      lastMonth = month;
      
      const paragraphs = res.text.split("\n").filter(p => p.trim());
      const formattedHtml = paragraphs.map(p => {
        if (p.startsWith("男：")) {
          return `<p style="text-indent:2em"><span class="speaker-male">男：</span>${escapeHtml(p.slice(2))}</p>`;
        } else if (p.startsWith("女：")) {
          return `<p style="text-indent:2em"><span class="speaker-female">女：</span>${escapeHtml(p.slice(2))}</p>`;
        }
        return `<p style="text-indent:2em">${escapeHtml(p)}</p>`;
      }).join("");
      
      const textEl = document.getElementById("podcastTextContent");
      textEl.innerHTML = "";
      
      const paragraphsArray = formattedHtml.split("</p>").filter(p => p.trim());
      let paraIndex = 0;
      
      const addNextParagraph = () => {
        if (paraIndex < paragraphsArray.length) {
          const paraHtml = paragraphsArray[paraIndex] + "</p>";
          textEl.innerHTML += paraHtml;
          paraIndex++;
          setTimeout(addNextParagraph, 300);
        } else {
          document.getElementById("copyBtn").disabled = false;
          document.getElementById("ttsBtn").disabled = false;
          document.getElementById("podcastStatus").textContent = `${flowerData.flower} · 花神${flowerData.godName} · ${flowerData.dynasty} (${res.length} 字) · ${sourceLabel(res.source)}`;
        }
      };
      
      addNextParagraph();
      
      showToast("播客文案已生成");
    } catch {
      showToast("生成失败，请重试");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  document.getElementById("ttsBtn").addEventListener("click", async () => {
    if (!lastPodcast) return;
    const btn = document.getElementById("ttsBtn");
    const originalText = btn.textContent;
    btn.textContent = "合成中...";
    btn.disabled = true;
    
    try {
      const paragraphs = lastPodcast.split("\n").filter(p => p.trim());
      const dialogParts = paragraphs.map(p => {
        if (p.startsWith("男：")) {
          return { speaker: "male", text: p.slice(2) };
        } else if (p.startsWith("女：")) {
          return { speaker: "female", text: p.slice(2) };
        }
        return { speaker: "female", text: p };
      });
      
      const res = await fetch("/api/tts-dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraphs: dialogParts, text: lastPodcast })
      });
      const data = await res.json();
      
      if (data.success && data.audios) {
        const validAudios = data.audios.filter(a => a.url);
        if (validAudios.length === 0) {
          showToast("语音合成失败");
          return;
        }
        
        document.getElementById("audioPlayer").innerHTML = `
          <div class="section-label">播客音频（男女对话）</div>
          <div class="audio-player liquid-glass">
            <div class="audio-progress">
              <div class="audio-progress-bar" id="audioProgressBar"></div>
            </div>
            <div class="audio-controls">
              <button class="audio-btn" id="audioPlayBtn">▶</button>
              <span class="audio-time" id="audioTime">00:00 / --:--</span>
              <button class="audio-btn" id="audioDownloadBtn">⬇</button>
            </div>
            <div id="audioQueue" style="display:none"></div>
            <audio id="audioElement" preload="metadata"></audio>
          </div>
        `;
        document.getElementById("audioPlayer").style.display = "block";
        
        const audioQueue = validAudios.map(a => a.url);
        let currentIndex = 0;
        const audio = document.getElementById("audioElement");
        const playBtn = document.getElementById("audioPlayBtn");
        const progressBar = document.getElementById("audioProgressBar");
        const timeDisplay = document.getElementById("audioTime");
        
        const playNext = () => {
          if (currentIndex < audioQueue.length) {
            audio.src = audioQueue[currentIndex];
            audio.play();
            currentIndex++;
          } else {
            playBtn.textContent = "▶";
            currentIndex = 0;
          }
        };
        
        audio.addEventListener("loadedmetadata", () => {
          timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
        });
        
        audio.addEventListener("timeupdate", () => {
          const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
          progressBar.style.width = `${percent}%`;
          const currentMinutes = Math.floor(audio.currentTime / 60);
          const currentSeconds = Math.floor(audio.currentTime % 60);
          const totalMinutes = Math.floor((audio.duration || 0) / 60);
          const totalSeconds = Math.floor((audio.duration || 0) % 60);
          timeDisplay.textContent = `${currentMinutes.toString().padStart(2, "0")}:${currentSeconds.toString().padStart(2, "0")} / ${totalMinutes.toString().padStart(2, "0")}:${totalSeconds.toString().padStart(2, "0")}`;
        });
        
        audio.addEventListener("ended", playNext);
        
        playBtn.addEventListener("click", () => {
          if (audio.paused) {
            if (!audio.src && audioQueue.length > 0) {
              playNext();
            } else {
              audio.play();
            }
            playBtn.textContent = "⏸";
          } else {
            audio.pause();
            playBtn.textContent = "▶";
          }
        });
        
        document.getElementById("audioDownloadBtn").addEventListener("click", () => {
          if (audioQueue.length > 0) {
            const a = document.createElement("a");
            a.href = audioQueue[0];
            a.download = `花月诗境_${lastMonth}月.mp3`;
            a.click();
          }
        });
        
        showToast(data.failedCount > 0 ? `语音合成完成，${data.failedCount} 段未成功` : "语音合成完成");
      } else {
        showToast(data.error || "语音合成失败");
      }
    } catch (err) {
      showToast(err.message || "语音合成失败，请重试");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!lastPodcast) return;
    await navigator.clipboard.writeText(lastPodcast);
    showToast("已复制到剪贴板");
  });

  observeReveals(app);
}

function setupBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const toggle = () => {
    btn.classList.toggle("show", window.scrollY > 420);
  };
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

const pages = {
  home: renderHome,
  month: renderMonth,
  keyword: renderKeyword,
  dynasty: renderDynasty,
  broadcast: renderBroadcast,
};

async function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
  app.innerHTML = `<div class="loading liquid-glass reveal is-visible"><div class="spinner"></div><p>切换页面...</p></div>`;
  await pages[page]();
}

async function init() {
  try {
    [state.flowers, state.keywords] = await Promise.all([api.getFlowers(), api.getKeywords()]);
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.page));
    });
    setupBackToTop();
    await navigate("home");
  } catch (err) {
    app.innerHTML = `
      <section class="panel liquid-glass reveal is-visible">
        <h2 class="panel-title">无法连接后端</h2>
        <p class="section-text">请在项目根目录执行 npm install && npm start</p>
        <p class="section-text">然后访问 http://localhost:8080</p>
      </section>
    `;
  }
}

init();



