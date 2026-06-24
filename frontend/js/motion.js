function observeReveals(root = document) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = root.querySelectorAll(".reveal");
  if (reduce) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const MONTH_NAMES = [
  "正月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

const MONTH_COLORS = [
  "#64748b", "#f472b6", "#ec4899", "#a855f7", "#ef4444", "#22c55e",
  "#f97316", "#eab308", "#d97706", "#fb7185", "#dc2626", "#38bdf8",
];

window.observeReveals = observeReveals;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.MONTH_NAMES = MONTH_NAMES;
window.MONTH_COLORS = MONTH_COLORS;
