const COLORS = ["#ff8fab", "#b79ced", "#ffb347", "#7ed6c1", "#ff6f91", "#8ec5ff", "#f7a8e0"];
const pile = document.getElementById("pile");
let count = 0;

/* ---------- background hearts ---------- */
(function floatingHearts() {
  const box = document.getElementById("hearts");
  const icons = ["💗", "💕", "💖", "🌸", "✨"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = icons[i % icons.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 14 + Math.random() * 22 + "px";
    s.style.animationDuration = 9 + Math.random() * 10 + "s";
    s.style.animationDelay = -Math.random() * 15 + "s";
    box.appendChild(s);
  }
})();

/* ---------- gifts ---------- */
function addGift(text, scroll = false) {
  const item = document.createElement("div");
  item.className = "item";

  const gift = document.createElement("button");
  gift.className = "gift";
  gift.setAttribute("aria-label", "Open gift");
  gift.style.setProperty("--c", COLORS[count++ % COLORS.length]);
  gift.innerHTML = '<span class="lid"></span><span class="bow"></span><span class="box"></span>';

  const note = document.createElement("div");
  note.className = "note";
  note.textContent = text; // textContent keeps it safe from HTML injection

  gift.addEventListener("click", (e) => {
    item.classList.add("open");
    burst(e.clientX, e.clientY);
  });
  note.addEventListener("click", () => item.classList.remove("open")); // tap note to re-wrap

  item.append(gift, note);
  pile.appendChild(item);
  if (scroll) item.scrollIntoView({ behavior: "smooth", block: "center" });
}

function burst(x, y) {
  for (let i = 0; i < 10; i++) {
    const h = document.createElement("span");
    h.className = "pop";
    h.textContent = ["💖", "💕", "✨"][i % 3];
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.setProperty("--x", (Math.random() - 0.5) * 220 + "px");
    h.style.setProperty("--y", -40 - Math.random() * 160 + "px");
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 900);
  }
}

/* ---------- load messages.json ---------- */
async function load() {
  try {
    const res = await fetch("messages.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (data.title) document.getElementById("title").textContent = data.title;
    if (data.subtitle) document.getElementById("subtitle").textContent = data.subtitle;
    (data.messages || []).forEach((m) => addGift(m));
  } catch (err) {
    // Happens when the page is opened by double-click (file://). Needs a tiny local server.
    addGift("Couldn't load messages.json. Run a local server (see README) and refresh 💕");
    document.querySelector(".item").classList.add("open");
  }
}

/* ---------- add from the page (saved in this browser only) ---------- */
const SAVED_KEY = "giftMessagesExtra";
function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch { return []; }
}
function saveMsg(text) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify([...getSaved(), text])); } catch {}
}

document.getElementById("toggleAdd").addEventListener("click", () => {
  const p = document.getElementById("addPanel");
  p.hidden = !p.hidden;
  if (!p.hidden) document.getElementById("newMsg").focus();
});

document.getElementById("addBtn").addEventListener("click", () => {
  const box = document.getElementById("newMsg");
  const text = box.value.trim();
  if (!text) return;
  addGift(text, true);
  saveMsg(text);
  box.value = "";
  document.getElementById("addPanel").hidden = true;
});

load().then(() => getSaved().forEach((m) => addGift(m)));
