const hero = document.querySelector(".hero");
const logo = document.querySelector(".logo");
const cursor = document.querySelector("#reveal-cursor");
const canvas = document.querySelector("#stars");
const context = canvas.getContext("2d");
let stars = [];
let pointer = { x: -1000, y: -1000 };

function resize() {
  const scale = Math.min(devicePixelRatio, 2);
  canvas.width = innerWidth * scale;
  canvas.height = innerHeight * scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  stars = Array.from({ length: Math.max(500, innerWidth / 3) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    size: Math.random() * 1.7 + 0.3,
  }));
}

function draw() {
  context.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    const dx = pointer.x - star.x,
      dy = pointer.y - star.y;
    const distance = Math.hypot(dx, dy);
    const pull = distance < 300 ? (300 - distance) / 60 : 0;
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
  requestAnimationFrame(draw);
}

logo.addEventListener("click", () => hero.classList.toggle("revealed"));
logo.addEventListener("mouseenter", () => (cursor.style.display = "block"));
logo.addEventListener("mouseleave", () => (cursor.style.display = "none"));
logo.addEventListener("mousemove", (event) => {
  cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});
hero.addEventListener(
  "pointermove",
  (event) => (pointer = { x: event.clientX, y: event.clientY }),
);
hero.addEventListener("pointerleave", () => (pointer = { x: -1000, y: -1000 }));

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
resize();
draw();
