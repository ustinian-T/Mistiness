const API_BASE = "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof payload === "object" ? payload.error || payload.message : payload;
    throw new Error(message || `请求失败: ${res.status}`);
  }
  return payload;
}

const api = {
  getFlowers: () => request("/api/flowers"),
  getByMonth: (month) => request(`/api/flowers/month/${month}`),
  getKeywords: () => request("/api/keywords"),
  recommend: (keyword) => request(`/api/recommend?keyword=${encodeURIComponent(keyword)}`),
  dynastyStats: () => request("/api/stats/dynasty"),
  broadcast: (month) => request(`/api/broadcast/${month}`),
  saveRecord: (payload) =>
    request("/api/records", { method: "POST", body: JSON.stringify(payload) }),
  getPodcast: (month) => request(`/api/podcast/${month}`),
  generateTTS: (text, voice) =>
    request("/api/tts", { method: "POST", body: JSON.stringify({ text, voice }) }),
};

window.api = api;
