// ---------- 커스텀 커서 + 흰 잔광 (지연 없음 / 커서가 지나온 자리에만) ----------
const cursor = document.querySelector('.cursor');
if (cursor && matchMedia('(hover: hover)').matches) {
  const motesOn = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ctx, W, H;
  const motes = [];

  if (motesOn) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:250;pointer-events:none;mix-blend-mode:screen;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    const fit = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    fit();
    addEventListener('resize', fit);
  }

  // 미리 그려둔 흰 글로우 스프라이트 — 입자마다 shadowBlur를 거는 것보다 훨씬 가볍다
  let sprite;
  if (motesOn) {
    sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sc = sprite.getContext('2d');
    const g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.16)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    sc.fillStyle = g;
    sc.fillRect(0, 0, 64, 64);
  }

  let x = 0, y = 0, px = 0, py = 0, lastSpawn = 0;
  addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    cursor.style.left = x + 'px';   // 보간 없음 — 마우스 위치를 그대로
    cursor.style.top = y + 'px';
  }, { passive: true });

  if (motesOn) {
    (function loop(t) {
      const dx = x - px, dy = y - py;
      const speed = Math.hypot(dx, dy);

      // 커서가 지나온 자리 '뒤쪽'에서만 태어난다
      if (speed > 3 && t - lastSpawn > 30) {
        lastSpawn = t;
        const ux = dx / speed, uy = dy / speed;
        for (let i = 0, n = speed > 12 ? 2 : 1; i < n; i++) {
          if (motes.length > 34) motes.shift();
          const back = 8 + Math.random() * 14;
          const side = (Math.random() - 0.5) * 6;
          motes.push({
            x: x - ux * back - uy * side,
            y: y - uy * back + ux * side,
            r: 0.7 + Math.random() * 1.3,
            vx: (Math.random() - 0.5) * 0.12,
            vy: -0.16 - Math.random() * 0.26,
            life: 1,
            decay: 0.026 + Math.random() * 0.020
          });
        }
      }
      px = x; py = y;

      ctx.clearRect(0, 0, W, H);
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.x += m.vx; m.y += m.vy; m.life -= m.decay;
        if (m.life <= 0) { motes.splice(i, 1); continue; }
        const a = m.life * m.life * 0.65;
        const d = m.r * 9;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, m.x - d / 2, m.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    })(0);
  }

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
// 원칙: 연출(페이드인)이 실패하더라도 콘텐츠가 사라지면 안 된다.
const revealEls = document.querySelectorAll('.reveal');
const showAll = () => revealEls.forEach(el => el.classList.add('is-visible'));

if ('IntersectionObserver' in window) {
  // threshold를 비율로 두면 긴 섹션(수천 px)은 12%를 채울 수 없어 영영 발동하지 않는다.
  // 0 + rootMargin으로 "화면에 조금이라도 들어오면" 기준으로 바꾼다.
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  // 안전장치: 관찰이 한 번도 동작하지 않는 환경이면 전부 그냥 보여준다.
  setTimeout(() => {
    if (!document.querySelector('.reveal.is-visible')) showAll();
  }, 1500);
} else {
  showAll();
}

// ---------- 유튜브 플레이어: 누르기 전까지는 로컬 마스터 프레임 ----------
document.querySelectorAll('.player--lite').forEach(box => {
  box.addEventListener('click', () => {
    const id = box.dataset.yt;
    if (!id || box.dataset.loaded) return;
    box.dataset.loaded = '1';
    const f = document.createElement('iframe');
    f.width = 1280; f.height = 720;
    f.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&autoplay=1`;
    f.title = box.dataset.title || '';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(f);
  });
});

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
