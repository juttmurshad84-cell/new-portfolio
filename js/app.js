/* MURSHAD — Cinematic Template Interactions */
gsap.registerPlugin(ScrollTrigger);

// ---------- Lenis Smooth Scroll ----------
let lenis;
try{
  lenis = new Lenis({ duration: 1.05, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothWheel: true, smoothTouch: false });
  function raf(time){
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}catch(e){ console.warn('Lenis not available', e) }

// ---------- Loader ----------
const loader = document.getElementById('loader');
const loaderPercent = document.getElementById('loaderPercent');
const loaderBar = document.getElementById('loaderBar');
let p=0;
const loaderTimer = setInterval(()=>{
  p += Math.random()*14 + 4;
  if(p>=100){ p=100; clearInterval(loaderTimer); setTimeout(hideLoader, 450); }
  loaderPercent.textContent = String(Math.floor(p)).padStart(2,'0')+'%';
  loaderBar.style.width = p+'%';
}, 110);
function hideLoader(){
  loader.classList.add('is-hidden');
  document.body.classList.add('has-cursor');
  // start reveals after loader
  refreshReveals();
  setTimeout(()=> ScrollTrigger.refresh(), 300);
}

// Fallback hide
setTimeout(()=>{ if(!loader.classList.contains('is-hidden')) hideLoader(); }, 2600);

// ---------- Video Scroll Sync ----------
const video = document.getElementById('bgVideo');
const poster = document.getElementById('videoPoster');
const timeHint = document.getElementById('videoTimeHint');
const durationHint = document.getElementById('videoDurationHint');
const heroTimecode = document.getElementById('heroTimecode');
let duration = 0;
let ready = false;
let targetTime = 0;
let currentTime = 0;
let ticking = false;

function initVideo(){
  if(!video) return;
  const onReady = ()=>{
    duration = video.duration || 8;
    ready = true;
    poster.classList.add('is-hidden');
    durationHint.textContent = formatTime(duration);
    video.pause();
    // iOS requires play then pause to enable seeking
    try{ video.currentTime = 0.01; }catch(e){}
    requestAnimationFrame(videoLoop);
  };
  if(video.readyState >= 1 && video.duration){
    onReady();
  }else{
    video.addEventListener('loadedmetadata', onReady, {once:true});
    video.addEventListener('canplay', ()=>{ if(!ready) onReady(); }, {once:true});
    // fallback duration
    setTimeout(()=>{ if(!ready){ duration = 10; ready=true; poster.classList.add('is-hidden'); durationHint.textContent='--:--'; requestAnimationFrame(videoLoop);} }, 2000);
  }
  video.addEventListener('error', ()=>{
    // keep poster visible, still sync fake progress
    duration = 12;
    ready=true;
    durationHint.textContent='POSTER';
    requestAnimationFrame(videoLoop);
  });
}
initVideo();

function formatTime(s){
  if(!isFinite(s)) return '--:--';
  const m = Math.floor(s/60);
  const sec = Math.floor(s%60);
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
function formatTC(s){
  const m = Math.floor(s/60);
  const sec = Math.floor(s%60);
  const f = Math.floor((s%1)*24);
  return `TC ${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}:${String(f).padStart(2,'0')} — ${ready? 'SYNCED TO SCROLL':'LOADING'}`;
}

// Map scroll to video time
function updateTarget(){
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll>0 ? window.scrollY / maxScroll : 0;
  const clamped = Math.min(0.999, Math.max(0, progress));
  targetTime = clamped * (duration - 0.05);
  // also update progress bar
  const pct = clamped*100;
  document.getElementById('progressFill').style.width = pct+'%';
  document.getElementById('navProgressFill').style.width = pct+'%';
  // active section
  updateActiveSection(progress);
}
window.addEventListener('scroll', updateTarget, {passive:true});
window.addEventListener('resize', updateTarget);

function videoLoop(){
  if(ready){
    // lerp
    const ease = 0.08; // smooth interpolation
    const diff = targetTime - currentTime;
    // avoid jitter: snap if very close
    if(Math.abs(diff) > 0.003){
      currentTime += diff * ease;
      // only seek if diff significant to avoid decode spam
      if(Math.abs(video.currentTime - currentTime) > 0.04){
        try{ video.currentTime = currentTime; }catch(e){}
      }
      timeHint.textContent = formatTime(currentTime);
      heroTimecode.textContent = formatTC(currentTime);
    } else {
      currentTime = targetTime;
    }
  }
  requestAnimationFrame(videoLoop);
}

// Reduced motion fallback: autoplay slowly instead of scroll sync
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  // disable scroll sync jitter
  // let video play normally muted loop
  if(video){ video.muted=true; video.loop=true; video.play().catch(()=>{}); poster.classList.add('is-hidden'); }
}

// ---------- Active Section ----------
const sections = [...document.querySelectorAll('.section')];
const railDotsEl = document.getElementById('railDots');
const railLabel = document.getElementById('railLabel');
const navSectionName = document.getElementById('navSectionName');
const navProgress = document.getElementById('navProgress');

// build dots
sections.forEach((sec,i)=>{
  const btn = document.createElement('button');
  btn.setAttribute('aria-label', sec.id);
  btn.addEventListener('click', ()=> {
    sec.scrollIntoView({behavior:'smooth', block:'start'});
  });
  railDotsEl.appendChild(btn);
});
function updateActiveSection(progress){
  // find section closest to top
  let activeIdx = 0;
  let minDist = Infinity;
  sections.forEach((sec,i)=>{
    const rect = sec.getBoundingClientRect();
    const dist = Math.abs(rect.top);
    if(dist < minDist){ minDist=dist; activeIdx=i; }
  });
  // if near bottom, last section
  if(progress > 0.97) activeIdx = sections.length-1;
  const dots = railDotsEl.children;
  for(let i=0;i<dots.length;i++) dots[i].classList.toggle('is-active', i===activeIdx);
  const label = sections[activeIdx]?.dataset.section || '—';
  railLabel.textContent = String(activeIdx+1).padStart(2,'0')+' / '+label.split('—')[0].trim();
  navSectionName.textContent = label;
  navProgress.textContent = String(activeIdx+1).padStart(2,'0')+' — '+String(sections.length).padStart(2,'0');

  // nav scrolled state
  document.getElementById('nav').classList.toggle('is-scrolled', window.scrollY>40);
}

// ---------- Reveals ----------
function refreshReveals(){
  const reveals = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        // add clip effect for placeholders inside
        e.target.querySelectorAll('.placeholder').forEach((ph,idx)=>{
          ph.style.transitionDelay = (idx*60)+'ms';
        });
      }
    });
  }, {threshold:0.12});
  reveals.forEach(el=> io.observe(el));
  // GSAP parallax
  document.querySelectorAll('[data-parallax]').forEach(el=>{
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      y: -80*speed*4,
      ease:'none',
      scrollTrigger:{
        trigger: el.closest('.section') || el,
        start:'top bottom',
        end:'bottom top',
        scrub: true,
      }
    });
  });

  // Section pin subtle (selected)
  // Make featured meta sticky while media scrolls? Keep light for perf.
  // Add staggered reveal for principles/cards
  gsap.utils.toArray('.principle, .industry-card, .placeholder--gallery, .detail-card').forEach((el,i)=>{
    gsap.from(el, {
      y: 18, opacity:0,
      duration:0.9, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 88%' },
      delay: (i%3)*0.06
    });
  });
}

// ---------- Custom Cursor ----------
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const cursorLabel = document.getElementById('cursorLabel');
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
let ringX = mouseX, ringY = mouseY;
let activeCursor = '';

window.addEventListener('mousemove', e=>{
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  dot.style.opacity = 1;
});

function cursorLoop(){
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

// hover labels
document.querySelectorAll('[data-cursor]').forEach(el=>{
  el.addEventListener('mouseenter', ()=>{
    const label = el.dataset.cursor;
    cursorLabel.textContent = label;
    ring.classList.add('is-hover');
  });
  el.addEventListener('mouseleave', ()=>{
    ring.classList.remove('is-hover');
    cursorLabel.textContent = '';
  });
});
// generic hover for placeholders and buttons
document.querySelectorAll('.placeholder, .btn, .industry-card, a').forEach(el=>{
  if(el.dataset.cursor) return;
  el.addEventListener('mouseenter', ()=> {
    if(el.classList.contains('placeholder')){ cursorLabel.textContent='REPLACE'; ring.classList.add('is-hover'); }
    else if(el.tagName==='A' || el.classList.contains('btn')){ cursorLabel.textContent='VIEW'; ring.classList.add('is-hover'); }
  });
  el.addEventListener('mouseleave', ()=>{
    ring.classList.remove('is-hover'); cursorLabel.textContent='';
  });
});

// magnetic
document.querySelectorAll('.btn--primary, .principle h3').forEach(el=>{
  el.classList.add('magnetic');
  el.addEventListener('mousemove', e=>{
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) * 0.18;
    const dy = (e.clientY - cy) * 0.18;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', ()=> el.style.transform='translate(0,0)');
});

// ---------- Asset Replacement (drag & drop + click) ----------
const placeholders = document.querySelectorAll('.placeholder');
placeholders.forEach(ph=>{
  // click to upload
  ph.addEventListener('click', ()=>{
    const input = document.createElement('input');
    input.type='file';
    input.accept='image/png,image/jpeg,image/webp,image/jpg';
    input.onchange = e=>{
      const file = e.target.files[0];
      if(file) loadImageToPlaceholder(ph, file);
    };
    input.click();
  });
  // drag
  ph.addEventListener('dragover', e=>{ e.preventDefault(); ph.classList.add('is-dragover'); });
  ph.addEventListener('dragleave', ()=> ph.classList.remove('is-dragover'));
  ph.addEventListener('drop', e=>{
    e.preventDefault();
    ph.classList.remove('is-dragover');
    const file = e.dataTransfer.files[0];
    if(file) loadImageToPlaceholder(ph, file);
  });

  // lightbox preview if already has image
  ph.addEventListener('dblclick', e=>{
    e.stopPropagation();
    const img = ph.querySelector('img');
    if(img) openLightbox(img.src, ph.dataset.label);
  });
});

function loadImageToPlaceholder(ph, file){
  if(!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    let img = ph.querySelector('img');
    if(!img){
      img = document.createElement('img');
      ph.appendChild(img);
    }
    img.src = reader.result;
    img.alt = file.name;
    ph.querySelector('span')?.style && (ph.querySelector('span').style.opacity='0');
    // persist hint
    ph.dataset.hasImage='1';
  };
  reader.readAsDataURL(file);
}

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbLabel = document.getElementById('lightboxLabel');
function openLightbox(src, label){
  lbImg.src = src;
  lbLabel.textContent = label || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden','false');
}
function closeLightbox(){
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden','true');
}
document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLightbox(); });

// ---------- Drawers ----------
const indexBtn = document.getElementById('indexBtn');
const indexDrawer = document.getElementById('indexDrawer');
const indexBackdrop = document.getElementById('indexBackdrop');
const indexClose = document.getElementById('indexClose');
function toggleIndex(open){
  indexDrawer.classList.toggle('is-open', open);
  indexDrawer.setAttribute('aria-hidden', String(!open));
}
indexBtn.addEventListener('click', ()=> toggleIndex(true));
indexBackdrop.addEventListener('click', ()=> toggleIndex(false));
indexClose.addEventListener('click', ()=> toggleIndex(false));
indexDrawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> toggleIndex(false)));

const assetToggle = document.getElementById('assetToggle');
const assetDrawer = document.getElementById('assetDrawer');
const assetClose = document.getElementById('assetClose');
assetToggle.addEventListener('click', ()=> assetDrawer.classList.toggle('is-open'));
assetClose.addEventListener('click', ()=> assetDrawer.classList.remove('is-open'));

// ---------- Export helper (uses html2canvas-like fallback: opens print) ----------
document.querySelectorAll('.export-btn').forEach(btn=>{
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const sec = document.getElementById('section-'+btn.dataset.export.padStart(2,'0'));
    if(!sec) return;
    // Create still: open new window with section clone for screenshotting
    const range = document.createRange();
    range.selectNode(sec);
    // Simple: use browser screenshot via hint
    // Fallback: scroll to section and notify
    sec.scrollIntoView({behavior:'smooth', block:'start'});
    // Create temporary canvas export using html2canvas if available
    // We'll dynamically load html2canvas for one-time export
    loadHtml2CanvasAndExport(sec);
  });
});
let html2canvasPromise=null;
function loadHtml2CanvasAndExport(el){
  if(!html2canvasPromise){
    html2canvasPromise = new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  html2canvasPromise.then(()=>{
    // temporarily boost quality
    html2canvas(el, {backgroundColor:'#08080A', scale:2, useCORS:true}).then(canvas=>{
      const url = canvas.toDataURL('image/png');
      const a=document.createElement('a');
      a.href=url;
      a.download=`murshad-section-${el.id}.png`;
      a.click();
    }).catch(()=>{
      window.print();
    });
  }).catch(()=> window.print());
}

// ---------- Back to top ----------
document.getElementById('backToTop').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// ---------- Touch: disable custom cursor ----------
if(window.matchMedia('(pointer: coarse)').matches){
  document.body.classList.remove('has-cursor');
}

// ---------- Performance: lazy load below fold placeholders bg ----------
// (images are user-provided, so nothing to lazy-load, but we can defer video)
window.addEventListener('load', ()=>{
  setTimeout(()=> updateTarget(), 100);
});

// ---------- Keyboard nav ----------
window.addEventListener('keydown', e=>{
  if(e.key==='g' && (e.metaKey||e.ctrlKey)){
    e.preventDefault();
    assetDrawer.classList.toggle('is-open');
  }
});

// expose for debugging
window.MURSHAD = { video, updateTarget };
