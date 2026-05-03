const layers = [
  { el: document.querySelector('.header__city'),    speed: 0.15 },
  { el: document.querySelector('.header__ellipse'), speed: 0.08 },
  { el: document.querySelector('.header__king'),   speed: 0.25 },
  { el: document.querySelector('.header__queen'),  speed: 0.30 },
  { el: document.querySelector('.header__horse'),  speed: 0.35 },
  { el: document.querySelector('.header__pawn'),   speed: 0.40 },
];

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      layers.forEach(({ el, speed }) => {
        el.style.transform += ` translateY(${scrollY * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
});