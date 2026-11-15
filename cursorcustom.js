let lastTime = 0;

document.addEventListener("mousemove", function(e) {
  const now = Date.now();
  if (now - lastTime < 35) return;
  lastTime = now;

  const firefly = document.createElement("div");
  firefly.classList.add("firefly");

  const startX = Math.round(e.clientX + (Math.random() - 0.5) * 16);
  const startY = Math.round(e.clientY + (Math.random() - 0.5) * 16);
  firefly.style.left = startX + "px";
  firefly.style.top = startY + "px";

  const pixelSizes = [4, 6, 8];
  const size = pixelSizes[Math.floor(Math.random() * pixelSizes.length)];
  firefly.style.width = size + "px";
  firefly.style.height = size + "px";

  const driftX = Math.round((Math.random() - 0.5) * 70);
  const driftY = Math.round((Math.random() - 0.7) * 70);
  firefly.style.setProperty("--dx", driftX + "px");
  firefly.style.setProperty("--dy", driftY + "px");

  document.body.appendChild(firefly);

  setTimeout(() => {
    firefly.remove();
  }, 1500);
});