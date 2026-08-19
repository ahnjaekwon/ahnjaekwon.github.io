// ---------- 커스텀 커서 (마우스 위치를 그대로 따른다 — 지연 없음) ----------
const cursor = document.querySelector('.cursor');
if (cursor && matchMedia('(hover: hover)').matches) {
  addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

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
