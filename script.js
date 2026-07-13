const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const spaceCanvas = document.querySelector('[data-space]');
const spaceContext = spaceCanvas?.getContext('2d');
let stars = [];
let animationFrame;

const createStars = () => {
  if (!spaceCanvas || !spaceContext) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  spaceCanvas.width = width * pixelRatio;
  spaceCanvas.height = height * pixelRatio;
  spaceCanvas.style.width = `${width}px`;
  spaceCanvas.style.height = `${height}px`;
  spaceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const starCount = Math.min(150, Math.max(60, Math.floor((width * height) / 9000)));
  stars = Array.from({ length: starCount }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.2 + 0.25,
    opacity: Math.random() * 0.55 + 0.15,
    speed: Math.random() * 0.08 + 0.015,
    phase: index * 0.7,
  }));
};

const drawSpace = (time = 0) => {
  if (!spaceCanvas || !spaceContext) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  spaceContext.clearRect(0, 0, width, height);

  const glow = spaceContext.createRadialGradient(width * 0.78, height * 0.16, 0, width * 0.78, height * 0.16, width * 0.55);
  glow.addColorStop(0, 'rgba(113, 123, 255, 0.10)');
  glow.addColorStop(1, 'rgba(5, 6, 10, 0)');
  spaceContext.fillStyle = glow;
  spaceContext.fillRect(0, 0, width, height);

  stars.forEach((star) => {
    const twinkle = reducedMotion ? 1 : 0.72 + Math.sin(time * 0.001 + star.phase) * 0.28;
    spaceContext.beginPath();
    spaceContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    spaceContext.fillStyle = `rgba(225, 229, 255, ${star.opacity * twinkle})`;
    spaceContext.fill();

    if (!reducedMotion) {
      star.y -= star.speed;
      if (star.y < -2) {
        star.y = height + 2;
        star.x = Math.random() * width;
      }
    }
  });

  if (!reducedMotion) animationFrame = window.requestAnimationFrame(drawSpace);
};

if (spaceCanvas && spaceContext) {
  createStars();
  drawSpace();
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(animationFrame);
    createStars();
    drawSpace();
  });
  document.addEventListener('visibilitychange', () => {
    window.cancelAnimationFrame(animationFrame);
    if (!document.hidden && !reducedMotion) drawSpace();
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
