import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    let lastTime = 0;
    const timeouts = new Set();

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 35) return;
      lastTime = now;

      const firefly = document.createElement('div');
      firefly.classList.add('firefly');

      const startX = Math.round(e.clientX + (Math.random() - 0.5) * 16);
      const startY = Math.round(e.clientY + (Math.random() - 0.5) * 16);
      firefly.style.left = startX + 'px';
      firefly.style.top = startY + 'px';

      const pixelSizes = [4, 6, 8];
      const size = pixelSizes[Math.floor(Math.random() * pixelSizes.length)];
      firefly.style.width = size + 'px';
      firefly.style.height = size + 'px';

      const driftX = Math.round((Math.random() - 0.5) * 70);
      const driftY = Math.round((Math.random() - 0.7) * 70);
      firefly.style.setProperty('--dx', driftX + 'px');
      firefly.style.setProperty('--dy', driftY + 'px');

      document.body.appendChild(firefly);

      const timeoutId = setTimeout(() => {
        firefly.remove();
        timeouts.delete(timeoutId);
      }, 1500);

      timeouts.add(timeoutId);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <style>{`
      /* Square pixel firefly trail */
      .firefly {
        position: fixed;
        border-radius: 0;
        pointer-events: none;
        z-index: 9999;
        background-color: #fff8a6;
        box-shadow: 0 0 0 2px rgba(255, 215, 64, 0.45);
        animation: float-firefly 1.5s steps(12) forwards;
      }

      @keyframes float-firefly {
        0% {
          opacity: 0;
          transform: translate(0, 0);
        }
        20% {
          opacity: 1;
          transform: translate(calc(var(--dx) * 0.2), calc(var(--dy) * 0.2));
        }
        50% {
          opacity: 0.6;
        }
        80% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(var(--dx), var(--dy));
        }
      }
    `}</style>
  );
}