const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const codeCanvas = document.querySelector('[data-code-rain]');
const codeContext = codeCanvas?.getContext('2d');
const codeSnippets = [
  'const app = {}',
  'await build()',
  'data.map(fn)',
  '</hello>',
  'if (ready) {}',
  'SELECT *',
  'def create():',
  '{ useful: true }',
  'git push',
  '=> ship()',
  '[0, 1, 2]',
  'console.log("hi")',
];
let codeBlocks = [];
let animationFrame;

const createCodeRain = () => {
  if (!codeCanvas || !codeContext) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  codeCanvas.width = width * pixelRatio;
  codeCanvas.height = height * pixelRatio;
  codeCanvas.style.width = `${width}px`;
  codeCanvas.style.height = `${height}px`;
  codeContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const blockCount = Math.min(34, Math.max(16, Math.floor(width / 42)));
  codeBlocks = Array.from({ length: blockCount }, (_, index) => ({
    text: codeSnippets[index % codeSnippets.length],
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 10,
    opacity: Math.random() * .09 + .045,
    speed: Math.random() * .32 + .16,
    tone: index % 3,
  }));
};

const drawCodeRain = () => {
  if (!codeCanvas || !codeContext) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  codeContext.clearRect(0, 0, width, height);

  codeBlocks.forEach((block) => {
    codeContext.font = `500 ${block.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    const textWidth = codeContext.measureText(block.text).width;
    const colors = [
      `rgba(196, 167, 255, ${block.opacity})`,
      `rgba(129, 230, 199, ${block.opacity})`,
      `rgba(194, 181, 255, ${block.opacity})`,
    ];
    codeContext.fillStyle = `rgba(255, 255, 255, ${block.opacity * .16})`;
    codeContext.fillRect(block.x - 7, block.y - block.size - 5, textWidth + 14, block.size + 12);
    codeContext.fillStyle = colors[block.tone];
    codeContext.fillText(block.text, block.x, block.y);

    if (!reducedMotion) {
      block.y += block.speed;
      if (block.y > height + 30) {
        block.y = -30 - Math.random() * height * .3;
        block.x = Math.random() * Math.max(1, width - textWidth);
      }
    }
  });

  if (!reducedMotion) animationFrame = window.requestAnimationFrame(drawCodeRain);
};

if (codeCanvas && codeContext) {
  createCodeRain();
  drawCodeRain();
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(animationFrame);
    createCodeRain();
    drawCodeRain();
  });
  document.addEventListener('visibilitychange', () => {
    window.cancelAnimationFrame(animationFrame);
    if (!document.hidden && !reducedMotion) drawCodeRain();
  });
}

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
  document.body.style.overflow = '';
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('is-open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const revealItems = document.querySelectorAll('[data-reveal]');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => observer.observe(item));
}

document.querySelector('.back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
