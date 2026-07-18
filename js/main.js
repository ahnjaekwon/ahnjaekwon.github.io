// ---------- 커스텀 커서 ----------
const cursor = document.querySelector('.cursor');
if (cursor && matchMedia('(hover: hover)').matches) {
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  (function loop() {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a.card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

// ---------- 빛가루 (커서를 따라 피어나는 금빛 먼지) ----------
if (matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:250;pointer-events:none;mix-blend-mode:screen;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  const fit = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  fit();
  addEventListener('resize', fit);

  const dust = [];
  const GOLD = ['217,179,108', '233,213,170', '245,235,215'];
  let lastX = 0, lastY = 0, lastSpawn = 0;

  addEventListener('mousemove', e => {
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    const moved = Math.hypot(dx, dy);
    if (now - lastSpawn < 26 || moved < 4) return;   // 절제: 빠르게 움직일 때만 드문드문
    lastSpawn = now; lastX = e.clientX; lastY = e.clientY;
    const ux = dx / moved, uy = dy / moved;          // 이동 방향 단위벡터
    const n = Math.min(2, Math.round(moved / 30) + 1);
    for (let i = 0; i < n; i++) {
      if (dust.length > 90) dust.shift();
      const back = 10 + Math.random() * 22;          // 커서 '뒤쪽' 거리
      const side = (Math.random() - 0.5) * 8;        // 자취에 수직인 미세한 퍼짐
      dust.push({
        x: e.clientX - ux * back - uy * side,
        y: e.clientY - uy * back + ux * side,
        r: 0.6 + Math.random() * 1.6,
        vx: -ux * 0.12 + (Math.random() - 0.5) * 0.1, // 뒤로 살짝 밀리며
        vy: -0.14 - Math.random() * 0.3,              // 잉걸불처럼 천천히 위로
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        c: GOLD[(Math.random() * GOLD.length) | 0],
        tw: Math.random() * Math.PI * 2               // 반짝임 위상
      });
    }
  }, { passive: true });

  (function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { dust.splice(i, 1); continue; }
      const twinkle = 0.72 + 0.28 * Math.sin(t * 0.004 + p.tw);
      const a = p.life * p.life * 0.5 * twinkle;  // 은은하게: 최대 투명도 0.5
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${a})`;
      ctx.shadowColor = `rgba(${p.c},${a * 0.8})`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(draw);
  })(0);
}

// ---------- 스크롤 시 내비게이션 ----------
const nav = document.querySelector('.nav');
addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', scrollY > 40);
}, { passive: true });

// ---------- 스크롤 리빌 ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Works 필터 ----------
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('is-hidden', !show);
      if (show) card.classList.add('is-visible');
    });
  });
});
