const hero = document.querySelector(".hero");
const logo = document.querySelector(".logo");
const cursor = document.querySelector("#reveal-cursor");
const canvas = document.querySelector("#stars");
const context = canvas.getContext("2d");
let stars = [];
let pointer = { x: -1000, y: -1000 };
const mobileBreakpoint = matchMedia("(max-width: 500px)");
let previousScrollY = scrollY;
let starScrollVelocity = 0;
const scrollStarSpeed = 0.1;
const scrollInertia = 0.85;
const scrollScatter = 1.5;

function moveStarsWithScroll() {
  const scrollDelta = scrollY - previousScrollY;

  if (scrollDelta) {
    starScrollVelocity -= scrollDelta * scrollStarSpeed;

    const scatterStrength =
      Math.abs(scrollDelta) * scrollStarSpeed * scrollScatter;
    for (const star of stars) {
      const direction = Math.random() * Math.PI * 2;
      star.driftX += Math.cos(direction) * scatterStrength;
      star.driftY += Math.sin(direction) * scatterStrength;
    }
  }

  previousScrollY = scrollY;
}

function resize() {
  const scale = Math.min(devicePixelRatio, 2);
  canvas.width = innerWidth * scale;
  canvas.height = innerHeight * scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  stars = Array.from({ length: Math.max(500, innerWidth / 3) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    size: Math.random() * 1.7 + 0.3,
    driftX: 0,
    driftY: 0,
  }));
}

function draw() {
  context.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    star.x = (((star.x + star.driftX) % innerWidth) + innerWidth) % innerWidth;
    star.y =
      (((star.y + starScrollVelocity + star.driftY) % innerHeight) +
        innerHeight) %
      innerHeight;
    star.driftX *= scrollInertia;
    star.driftY *= scrollInertia;
    const dx = pointer.x - star.x,
      dy = pointer.y - star.y;
    const distance = Math.hypot(dx, dy);
    const pull = distance < 700 ? (700 - distance) / 60 : 0;
    context.fillStyle =
      star.size > 1.8
        ? "#fff0ad" /* pale yellow */
        : star.size > 1.5
          ? "#ffd6e8" /* pale pink */
          : star.size > 1.2
            ? "#c9e7ff" /* pale blue */
            : "#fff"; /* white */
    context.beginPath();
    context.arc(
      star.x + (dx / distance || 0) * pull,
      star.y + (dy / distance || 0) * pull,
      star.size,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  starScrollVelocity *= scrollInertia;
  requestAnimationFrame(draw);
}

logo.addEventListener("click", () => hero.classList.toggle("revealed"));
logo.addEventListener("mouseenter", () => (cursor.style.display = "block"));
logo.addEventListener("mouseleave", () => (cursor.style.display = "none"));
logo.addEventListener("mousemove", (event) => {
  cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});
hero.addEventListener("pointermove", (event) => {
  if (!mobileBreakpoint.matches) {
    pointer = { x: event.clientX, y: event.clientY };
  }
});
hero.addEventListener("pointerleave", () => (pointer = { x: -1000, y: -1000 }));
mobileBreakpoint.addEventListener("change", () => {
  if (mobileBreakpoint.matches) {
    pointer = { x: -1000, y: -1000 };
  }
});

const filmVideos = [...document.querySelectorAll(".film-video")];
const filmCrossfadeSeconds = 4;
let activeFilmVideo = filmVideos[0];
let filmCrossfadeInProgress = false;

async function crossfadeFilmLoop() {
  if (filmCrossfadeInProgress) return;

  filmCrossfadeInProgress = true;
  const nextFilmVideo = filmVideos.find((video) => video !== activeFilmVideo);
  const previousFilmVideo = activeFilmVideo;

  nextFilmVideo.currentTime = 0;

  try {
    await nextFilmVideo.play();
    nextFilmVideo.classList.add("is-active");
    previousFilmVideo.classList.remove("is-active");
    activeFilmVideo = nextFilmVideo;

    previousFilmVideo.addEventListener(
      "ended",
      () => {
        previousFilmVideo.pause();
        filmCrossfadeInProgress = false;
      },
      { once: true },
    );
  } catch {
    filmCrossfadeInProgress = false;
  }
}

for (const video of filmVideos) {
  video.addEventListener("timeupdate", () => {
    if (
      video === activeFilmVideo &&
      video.duration &&
      video.duration - video.currentTime <= filmCrossfadeSeconds
    ) {
      crossfadeFilmLoop();
    }
  });
}

addEventListener("resize", resize);
addEventListener("scroll", moveStarsWithScroll, { passive: true });
resize();
draw();
