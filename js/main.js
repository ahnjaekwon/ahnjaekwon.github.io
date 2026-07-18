// ---------- 커스텀 커서 + 빛가루 (보이는 커서의 자취에만 남는 금빛 먼지) ----------
const cursor = document.querySelector('.cursor');
if (cursor && matchMedia('(hover: hover)').matches) {
  const dustOn = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ctx, W, H;
  const dust = [];
  const GOLD = ['217,179,108', '233,213,170', '245,235,215'];

  if (dustOn) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:250;pointer-events:none;mix-blend-mode:screen;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    const fit = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    fit();
    addEventListener('resize', fit);
  }

  let x = 0, y = 0, cx = 0, cy = 0;
  let pcx = 0, pcy = 0, lastSpawn = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });

  (function loop(t) {
    // 보이는 커서: 실제 마우스를 부드럽게 뒤따름
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';

    if (dustOn) {
      // 빛가루는 '화면에 보이는 커서'가 방금 지나온 자리에서만 태어난다
      const dx = cx - pcx, dy = cy - pcy;
      const speed = Math.hypot(dx, dy);
      if (speed > 2.5 && t - lastSpawn > 26) {
        lastSpawn = t;
        const ux = dx / speed, uy = dy / speed;
        const n = speed > 9 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          if (dust.length > 90) dust.shift();
          const back = 6 + Math.random() * 16;        // 보이는 커서보다 항상 뒤
          const side = (Math.random() - 0.5) * 7;
          dust.push({
            x: cx - ux * back - uy * side,
            y: cy - uy * back + ux * side,
            r: 0.6 + Math.random() * 1.6,
            vx: -ux * 0.1 + (Math.random() - 0.5) * 0.08,
            vy: -0.14 - Math.random() * 0.3,          // 잉걸불처럼 천천히 위로
            life: 1,
            decay: 0.006 + Math.random() * 0.008,
            c: GOLD[(Math.random() * GOLD.length) | 0],
            tw: Math.random() * Math.PI * 2
          });
        }
      }
      pcx = cx; pcy = cy;

      ctx.clearRect(0, 0, W, H);
      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) { dust.splice(i, 1); continue; }
        const twinkle = 0.72 + 0.28 * Math.sin(t * 0.004 + p.tw);
        const a = p.life * p.life * 0.5 * twinkle;    // 은은하게: 최대 투명도 0.5
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${a})`;
        ctx.shadowColor = `rgba(${p.c},${a * 0.8})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    requestAnimationFrame(loop);
  })(0);

  document.querySelectorAll('a.card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
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
