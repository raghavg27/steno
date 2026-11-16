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
const stageEl = document.getElementById("stage");
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
  // the spheres live in the hero only: fade them out as it scrolls away
  const heroOut = scrollY / Math.max(1, sceneSections[0].offsetHeight);
  const stageOpacity = Math.max(0, Math.min(1, (0.8 - heroOut) / 0.5));
  stageEl.style.opacity = stageOpacity;
  GRAVITY.control.hidden = stageOpacity === 0;
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
const smooth = { target: scrollY, current: scrollY, active: false, running: false };
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
const clampS = v => Math.min(maxScroll(), Math.max(0, v));
// The loop runs only during a glide, and stops one frame after the glide ends.
function smoothTick(){
  if (!smooth.active){ smooth.running = false; return; }
  smooth.target = clampS(smooth.target);
  smooth.current += (smooth.target - smooth.current) * 0.09;
  if (Math.abs(smooth.target - smooth.current) < 0.5){ smooth.current = smooth.target; smooth.active = false; }
  scrollTo(0, smooth.current);
  requestAnimationFrame(smoothTick);
}
function smoothStart(){
  smooth.active = true;
  if (!smooth.running){ smooth.running = true; requestAnimationFrame(smoothTick); }
}
function smoothTo(y){
  if (reduceMotion){ scrollTo(0, y); return; }
  if (!smooth.active){ smooth.current = scrollY; }
  smooth.target = clampS(y);
  smoothStart();
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
    smoothStart();
  }, { passive: false });
  addEventListener("scroll", () => { if (!smooth.active){ smooth.target = smooth.current = scrollY; } }, { passive: true });
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

/* ---------- examples lab ---------- */
(function lab(){
  // Each "after" is the Steno skill's rewrite of its "before" draft.
  const SAMPLES = [
    { name: "Upwork proposal", facts: "6 of 6", factsDesc: "Years, client, result and tools",
      before: `Hi there,

I came across your project and I'm thrilled to help bring your vision to life! As a seasoned Shopify developer with over 6 years of experience, I specialize in crafting seamless, user-centric stores that not only look stunning but also drive conversions.

In a recent project, I helped a skincare brand boost their checkout completion rate by 18% — a testament to my commitment to delivering real results. I'm well-versed in Liquid, JavaScript and the Shopify API, ensuring a robust, scalable solution tailored to your unique needs.

I'd love to discuss how we can elevate your online store. Let's hop on a quick call to explore the possibilities!

Best regards,
Arjun`,
      after: `Hi,

I read your project and I would like to help. I have built Shopify stores for more than 6 years. I focus on stores that are easy to use and that turn visitors into buyers.

In a recent project I helped a skincare brand raise its checkout completion rate by 18%. I work with Liquid, JavaScript and the Shopify API.

Could we have a short call about your store?

Best regards
Arjun` },
    { name: "LinkedIn post", facts: "5 of 5", factsDesc: "Years, clients, countries and lessons",
      before: `🚀 Excited to share a major milestone in my freelance journey!

After 3 years of navigating the ever-evolving landscape of freelance copywriting, I've officially crossed 50 clients across 9 countries. 🌍

This journey has taught me so much:
✅ Consistency is key
✅ Relationships matter more than rates
✅ Never stop learning

I'm deeply grateful to every client who trusted me along the way. Here's to the next chapter! 🙌

#Freelancing #Copywriting #Gratitude`,
      after: `I have been a freelance copywriter for 3 years, and I have now worked with 50 clients in 9 countries.

I learned to be consistent, I learned that relationships matter more than rates, and I learned to keep learning.

Thank you to every client who trusted me.

#Freelancing #Copywriting #Gratitude` },
    { name: "Project update", facts: "6 of 6", factsDesc: "Pages, tools, delay and dates",
      before: `Hi Meera,

I hope you're having a wonderful week! I wanted to take a moment to provide a comprehensive update on the progress of your website redesign.

I'm pleased to report that the homepage and About page are now complete, showcasing a fresh, modern look that truly reflects your brand's unique identity. Furthermore, the contact form has been seamlessly integrated with your Mailchimp account, ensuring that no lead slips through the cracks.

However, it's worth noting that the product gallery will require an additional 4 days due to the fact that we're still awaiting the final product photos from your team.

Rest assured, we remain firmly on track to deliver an exceptional final product by March 28. Please don't hesitate to reach out should you have any questions!

Warm regards,
Kabir`,
      after: `Hi Meera

Here is where your website redesign stands.

The homepage and the About page are done with the new design. The contact form now connects to your Mailchimp account, so every enquiry goes there.

The product gallery needs 4 more days because we are still waiting for the final product photos from your team. We still plan to deliver the full site by March 28.

If you have any questions, just reply to this email.

Thanks
Kabir` },
    { name: "Portfolio bio", facts: "6 of 6", factsDesc: "Background, years, sectors and result",
      before: `I'm a passionate UX designer with a keen eye for detail and a deep commitment to crafting intuitive digital experiences that delight users. With a background in psychology and 5+ years in the industry, I bring a unique blend of empathy and strategic thinking to every project.

I've had the privilege of collaborating with startups and established brands alike, from fintech to healthcare. My work on a banking app redesign led to a 40% reduction in support tickets, underscoring the transformative power of thoughtful design.

When I'm not designing, you'll find me exploring local coffee shops or sketching in my notebook. Let's create something amazing together!`,
      after: `I am a UX designer, and I try to make digital products that are easy to use. I have a background in psychology and 5+ years of work in design.

I have worked with startups and with established brands in fintech and healthcare. My redesign of a banking app cut its support tickets by 40%.

When I am not designing, I visit local coffee shops or sketch in my notebook.

If you have a project in mind, get in touch.` },
  ];
  // Common giveaways, used only to count before and after for the stats card.
  const TELL_RX = new RegExp([
    "delve\\w*","crucial","robust","seamless\\w*","leverag\\w+","utiliz\\w+","comprehensive","ensur\\w+","furthermore","moreover",
    "additionally","notably","significantly","it'?s worth noting","it is worth noting","i hope this helps","landscape","tapestry",
    "testament","pivotal","foster\\w*","showcas\\w+","underscor\\w+","in today's","ever[- ]evolving","rapidly evolving","realm",
    "embark\\w*","elevat\\w+","unlock\\w*","game[- ]changer","not only","serves as","stands as","in conclusion","ultimately",
    "vibrant","holistic","streamlin\\w+","empower\\w*","dive into","navigat\\w+ the","fast[- ]paced","not merely"
  ].map(w => "\\b" + w + "\\b").join("|") + "|[—–]", "gi");
  const countTells = t => (t.match(TELL_RX) || []).length;

  const $ = id => document.getElementById(id);
  const input = $("labIn"), out = $("labOut"), copyBtn = $("labCopy"), picks = $("labPicks");
  const dets = document.querySelectorAll(".js-det");
  let result = "";

  function show(i){
    const s = SAMPLES[i];
    input.textContent = s.before;
    out.textContent = s.after;
    result = s.after;
    $("labName").textContent = s.name;
    $("stTells").textContent = countTells(s.before) + " → " + countTells(s.after);
    $("stFacts").textContent = s.facts;
    $("stFactsDesc").textContent = s.factsDesc;
    picks.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  }
  picks.innerHTML = SAMPLES.map((s, i) => `<button type="button" data-i="${i}">${s.name}</button>`).join("");
  picks.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  show(0);

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
