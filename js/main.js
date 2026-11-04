const BMC_URL = "https://buymeacoffee.com/raghavg27/e/563450";
const EMAIL   = "raghavg2705@gmail.com";

document.querySelectorAll(".js-mail").forEach(a => a.href = "mailto:" + EMAIL);
document.querySelectorAll(".js-bmc").forEach(a => a.href = BMC_URL);
document.getElementById("bmcFallback").href = BMC_URL;
document.getElementById("yr").textContent = new Date().getFullYear();

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- shared state read by the WebGL module ---------- */
const THEMES = [
  { id:"roseGold",   name:"Royal Blue & Pearl",   desc:"Hyper-distinct cobalt spheres floating in soft white-slate gradients.", primary:"#2F69FF", ball:"#2F69FF",
    bg:"radial-gradient(circle at center, #ffffff 0%, #ecefff 35%, #c2d1ff 100%)" },
  { id:"pinkBlush",  name:"Rose Blush & Crème",   desc:"Sweet candy pinks and juicy strawberry accents in a pearl studio.",   primary:"#FFA6B3", ball:"#FFC5C2",
    bg:"radial-gradient(circle at center, #ffffff 0%, #fff0f1 35%, #ffd1d5 100%)" },
  { id:"voltLime",   name:"Volt Lime & Slate",    desc:"Electric neon volt-lime against a clean white-slate horizon.",         primary:"#E1FC03", ball:"#E1FC03",
    bg:"radial-gradient(circle at center, #ffffff 0%, #fbffe5 35%, #e8ff9c 100%)" },
  { id:"arcticBlue", name:"Arctic Sky & Crystal", desc:"Cool arctic crystal blues with a translucent glass sheen.",            primary:"#96E5FF", ball:"#96E5FF",
    bg:"radial-gradient(circle at center, #ffffff 0%, #eefaff 35%, #c9f1ff 100%)" },
];
const BG_LIME = "radial-gradient(circle at center, #ffffff 0%, #fbffe5 38%, #e8ff9c 100%)";
const BG_PINK = "radial-gradient(circle at center, #ffffff 0%, #fff0f1 38%, #ffd1d5 100%)";

let themeId = "roseGold";
try { const t = localStorage.getItem("steno-theme"); if (THEMES.some(x => x.id === t)) themeId = t; } catch (e) {}
const theme = () => THEMES.find(t => t.id === themeId);

const GRAVITY = window.GRAVITY = {
  control: { progress: 0, started: false },
  mousePos: { x: 99, y: 99, isDown: false },
  ballColor: theme().ball,
  ready: false,
  onReady(){ GRAVITY.ready = true; },
  rebuild: null, // set by the module
};

/* ---------- pointer tracking ---------- */
const mousePos = GRAVITY.mousePos;
addEventListener("pointermove", e => {
  mousePos.x = (e.clientX / innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / innerHeight) * 2 + 1;
}, { passive: true });
addEventListener("mousedown", () => mousePos.isDown = true);
addEventListener("mouseup",   () => mousePos.isDown = false);
document.addEventListener("mouseleave", () => { mousePos.x = 99; mousePos.y = 99; });

/* ---------- scroll -> progress + background stage ---------- */
const bgEl = document.getElementById("bg");
const hdr = document.getElementById("hdr");
let bgStage = -1, scrollQueued = false;
function applyBg(){
  bgEl.style.background = bgStage === 2 ? BG_PINK : bgStage === 1 ? BG_LIME : theme().bg;
}
/* progress is a float "section index" (0 hero, 1 drop, 2 shape, 3 release).
   Steno's sections can run taller than one screen, so map scroll piecewise
   onto the real section tops; on 100vh sections this equals scrollY / vh. */
const sceneSections = ["#top > .hero", "#proof", "#inside", "#buy"].map(s => document.querySelector(s));
function sceneProgress(vh){
  const y = scrollY;
  const tops = sceneSections.map(el => el.getBoundingClientRect().top + y);
  for (let i = 0; i < tops.length - 1; i++){
    if (y < tops[i + 1]) return i + (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
  }
  return tops.length - 1 + (y - tops[tops.length - 1]) / vh;
}
function onScroll(){
  scrollQueued = false;
  const vh = innerHeight || 1;
  const progress = sceneProgress(vh);
  GRAVITY.control.progress = progress;
  const stage = progress > 1.55 ? 2 : progress > 0.7 ? 1 : 0;
  if (stage !== bgStage){ bgStage = stage; applyBg(); }
  hdr.classList.toggle("scrolled", scrollY > vh * 0.6);
}
const queueScroll = () => { if (!scrollQueued){ scrollQueued = true; requestAnimationFrame(onScroll); } };
addEventListener("scroll", queueScroll, { passive: true });
addEventListener("resize", queueScroll);
onScroll();

/* ---------- smooth wheel scroll (Lenis-style, lerp 0.09) ---------- */
let scrollLocked = false;
const smooth = { target: scrollY, current: scrollY, active: false };
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
const clampS = v => Math.min(maxScroll(), Math.max(0, v));
function smoothTo(y){
  if (reduceMotion){ scrollTo(0, y); return; }
  if (!smooth.active){ smooth.current = scrollY; }
  smooth.target = clampS(y);
  smooth.active = true;
}
if (!reduceMotion){
  addEventListener("wheel", e => {
    if (e.ctrlKey || scrollLocked) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const inner = e.target.closest && e.target.closest("#labIn, #labOut");
    if (inner && inner.scrollHeight > inner.clientHeight + 1){
      const atTop = inner.scrollTop <= 0, atEnd = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
      if (!(e.deltaY < 0 && atTop) && !(e.deltaY > 0 && atEnd)) return; // let the box scroll itself
    }
    e.preventDefault();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= innerHeight;
    if (!smooth.active){ smooth.target = smooth.current = scrollY; }
    smooth.target = clampS(smooth.target + d * 1); // wheelMultiplier = 1
    smooth.active = true;
  }, { passive: false });
  addEventListener("scroll", () => { if (!smooth.active){ smooth.target = smooth.current = scrollY; } }, { passive: true });
  (function tick(){
    if (smooth.active){
      smooth.target = clampS(smooth.target);
      smooth.current += (smooth.target - smooth.current) * 0.09;
      if (Math.abs(smooth.target - smooth.current) < 0.5){ smooth.current = smooth.target; smooth.active = false; }
      scrollTo(0, smooth.current);
    }
    requestAnimationFrame(tick);
  })();
  addEventListener("keydown", e => { if (["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(e.key)) smooth.active = false; });
  addEventListener("touchstart", () => { smooth.active = false; }, { passive: true });
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  e.preventDefault();
  if (id === "#" ) return;
  const el = id === "#top" ? document.body : document.querySelector(id);
  if (!el) return;
  smoothTo(id === "#top" ? 0 : el.getBoundingClientRect().top + scrollY);
  history.replaceState(null, "", id === "#top" ? location.pathname : id);
});

/* ---------- reveals (sections 02+ and footer) ---------- */
function revealObserver(selector, opts){
  const els = document.querySelectorAll(selector);
  if (reduceMotion || !("IntersectionObserver" in window)){ els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const big = en.intersectionRect.height >= innerHeight * 0.45;
      if (en.isIntersecting && (en.intersectionRatio >= opts.ratio || big)){
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: [0, .1, .2, .3, .45, .6, .8, 1] });
  els.forEach((el, i) => {
    const d = el.dataset.delay ?? (opts.stagger ? (i * opts.stagger).toFixed(2) : 0);
    if (+d) el.style.transitionDelay = d + "s";
    io.observe(el);
  });
}
revealObserver(".rv", { ratio: .45 });
revealObserver(".fu", { ratio: .2, stagger: .08 });

/* ---------- marquee ---------- */
const TELLS = ["delve into", "stands as a testament", "it is important to note", "tapestry", "not only X but Y", "let us dive in", "underscores the importance", "in today's fast paced world"];
const seq = TELLS.map(w => `<span><s>${w}</s><i></i></span>`).join("");
document.getElementById("track").innerHTML = seq + seq;

/* ---------- loader ---------- */
(function loader(){
  const el = document.getElementById("loader");
  const fill = document.getElementById("ldFill");
  const count = document.getElementById("ldCount");
  const status = document.getElementById("ldStatus");
  let value = 0, last = performance.now(), finished = false;
  setTimeout(() => { if (!GRAVITY.ready) GRAVITY.ready = true; }, 7000); // never trap the page if WebGL can't start
  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!GRAVITY.ready) value += (92 - value) * 1.7 * dt;
    else { value += (100 - value) * 6 * dt; if (value >= 99.4) value = 100; }
    fill.style.width = value + "%";
    count.textContent = String(Math.floor(value)).padStart(3, "0") + "%";
    status.textContent = value < 100 ? "Stripping the ornament" : "Clean copy ready";
    if (value >= 99.9 && GRAVITY.ready && !finished){
      finished = true;
      setTimeout(() => el.classList.add("leaving"), 140);
      setTimeout(onDone, 140 + 520);
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function onDone(){
    GRAVITY.control.started = true;
    document.body.classList.add("is-in");
    setTimeout(() => { el.style.display = "none"; }, 600);
  }
})();

/* ---------- studio controls drawer ---------- */
const drawer = document.getElementById("drawer"), scrim = document.getElementById("scrim");
function setDrawer(open){
  drawer.classList.toggle("open", open);
  scrim.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  scrollLocked = open;
}
document.getElementById("openDrawer").onclick = () => setDrawer(true);
document.getElementById("closeDrawer").onclick = () => setDrawer(false);
scrim.onclick = () => setDrawer(false);

const themesEl = document.getElementById("themes");
function renderThemes(){
  themesEl.innerHTML = THEMES.map(t => `
    <button class="theme${t.id === themeId ? " sel" : ""}" data-id="${t.id}">
      <div class="t-row"><span>${t.name}</span><span class="sw" style="background:${t.primary}"></span></div>
      <div class="t-desc">${t.desc}</div>
    </button>`).join("");
}
function selectTheme(id){
  if (id === themeId) return;
  themeId = id;
  try { localStorage.setItem("steno-theme", id); } catch (e) {}
  GRAVITY.ballColor = theme().ball;
  renderThemes();
  applyBg();
  if (GRAVITY.rebuild) GRAVITY.rebuild(GRAVITY.ballColor);
}
themesEl.addEventListener("click", e => { const b = e.target.closest(".theme"); if (b) selectTheme(b.dataset.id); });
document.getElementById("resetTheme").onclick = () => selectTheme("roseGold");
renderThemes();

/* ---------- buy modal ---------- */
function buy(){
  window.open(BMC_URL, "_blank", "noopener");
  document.getElementById("ov").classList.add("open");
  document.body.style.overflow = "hidden";
  scrollLocked = true;
}
function closeM(){
  document.getElementById("ov").classList.remove("open");
  document.body.style.overflow = "";
  scrollLocked = drawer.classList.contains("open");
}
document.addEventListener("keydown", e => { if (e.key === "Escape"){ closeM(); setDrawer(false); } });

/* ---------- live lab ---------- */
(function lab(){
  const MAX = 2500, FREE = 3, KEY = "steno-tries";
  const SAMPLE = `In today's fast-paced digital landscape, remote work has become a crucial part of how modern teams operate. It's worth noting that this shift isn't merely a trend — it's a fundamental transformation in the way we collaborate.

By leveraging robust tools and fostering a culture of trust, organizations can unlock seamless communication across time zones. Furthermore, remote work empowers employees to achieve a healthier work-life balance, ultimately boosting productivity and engagement.

In conclusion, embracing remote work is not only a smart business decision but also a testament to a company's commitment to its people.`;
  // Common giveaways, used only to count before and after for the stats card.
  const TELL_RX = new RegExp([
    "delve\\w*","crucial","robust","seamless\\w*","leverag\\w+","utiliz\\w+","comprehensive","ensur\\w+","furthermore","moreover",
    "additionally","notably","significantly","it'?s worth noting","it is worth noting","i hope this helps","landscape","tapestry",
    "testament","pivotal","foster\\w*","showcas\\w+","underscor\\w+","in today's","ever[- ]evolving","rapidly evolving","realm",
    "embark\\w*","elevat\\w+","unlock\\w*","game[- ]changer","not only","serves as","stands as","in conclusion","ultimately",
    "vibrant","holistic","streamlin\\w+","empower\\w*","dive into","navigat\\w+ the","fast[- ]paced","not merely"
  ].map(w => "\\b" + w + "\\b").join("|") + "|[—–]", "gi");
  const countTells = t => (t.match(TELL_RX) || []).length;
  const countWords = t => (t.trim().match(/\S+/g) || []).length;

  const $ = id => document.getElementById(id);
  const input = $("labIn"), out = $("labOut"), go = $("labGo"), copyBtn = $("labCopy");
  const triesEl = $("labTries"), countEl = $("labCount"), wall = $("labWall");
  const dets = document.querySelectorAll(".js-det");
  const goLabel = go.innerHTML;
  let result = "", busy = false;

  const getUsed = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const setUsed = n => { try { localStorage.setItem(KEY, String(n)); } catch (e) {} };
  function renderTries(){
    const left = Math.max(0, FREE - getUsed());
    triesEl.textContent = left === 0 ? "No free tries left" : left === 1 ? "1 free try left" : left + " free tries left";
    wall.classList.toggle("hidden", left > 0);
    go.disabled = busy || left === 0;
  }
  function renderCount(){
    const n = input.value.length;
    countEl.textContent = n + " / " + MAX;
    countEl.classList.toggle("over", n > MAX);
  }
  function setResult(text){
    result = text;
    copyBtn.disabled = !text;
    dets.forEach(b => b.disabled = !text);
  }
  function placeholder(msg, cls){
    out.innerHTML = "";
    const span = document.createElement("span");
    span.className = cls || "ph";
    span.textContent = msg;
    out.appendChild(span);
  }

  input.value = SAMPLE;
  renderCount(); renderTries();
  input.addEventListener("input", renderCount);
  $("labSample").onclick = () => { input.value = SAMPLE; renderCount(); input.focus(); };

  go.onclick = async () => {
    const text = input.value.trim();
    if (text.length < 40){ placeholder("Paste a bit more text first. A couple of sentences at least.", "lab-err"); return; }
    if (text.length > MAX){ placeholder("Keep it under " + MAX + " characters for the demo.", "lab-err"); return; }
    if (getUsed() >= FREE){ renderTries(); return; }

    busy = true; renderTries(); setResult("");
    go.innerHTML = 'Rewriting <span class="orb"><svg class="ic" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></span>';
    out.innerHTML = '<div class="shim" aria-label="Rewriting"><i></i><i></i><i></i><i></i><i></i><span>Rewriting like a human</span></div>';
    const t0 = performance.now();
    try {
      const r = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.output) throw new Error(data.error || "Something went wrong. Try again.");
      const secs = (performance.now() - t0) / 1000;
      out.textContent = data.output;
      setResult(data.output);
      setUsed(getUsed() + 1);
      $("stTells").textContent = countTells(text) + " → " + countTells(data.output);
      $("stWords").textContent = countWords(text) + " → " + countWords(data.output);
      $("stTime").textContent = secs.toFixed(1) + "s";
    } catch (err){
      placeholder(err.message || "Something went wrong. Try again.", "lab-err");
    } finally {
      busy = false; go.innerHTML = goLabel; renderTries();
    }
  };

  function copyText(text){
    if (navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text){
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove(); return ok;
  }
  const toastEl = $("toast"); let toastT = 0;
  function toast(msg){
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 3200);
  }

  copyBtn.onclick = () => { if (result) copyText(result).then(ok => toast(ok ? "Copied." : "Select the text and copy it by hand.")); };
  dets.forEach(b => b.onclick = () => {
    if (!result) return;
    const copied = copyText(result);          // start the copy inside the click
    window.open(b.dataset.url, "_blank", "noopener");
    copied.then(ok => toast(ok ? "Copied. Paste it into " + b.dataset.name + "." : "Copy the text by hand and paste it into " + b.dataset.name + "."));
  });
})();

// Buttons and the checkout overlay (no inline handlers, so the page can use a strict policy)
document.querySelectorAll(".js-buy").forEach(b => b.addEventListener("click", buy));
const ov = document.getElementById("ov");
ov.addEventListener("click", e => { if (e.target === ov) closeM(); });
ov.querySelector(".close").addEventListener("click", closeM);
