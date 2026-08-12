const hero = document.querySelector(".hero");
const about = document.querySelector(".about");
const filmEvents = document.querySelector(".film-events");
const logo = document.querySelector(".logo");
const cursor = document.querySelector("#reveal-cursor");
const canvas = document.querySelector(".stars");
const context = canvas.getContext("2d");
const main = document.querySelector("main");
const pages = [...document.querySelectorAll("main > section")];
let stars = [];
let pointer = { x: -1000, y: -1000 };
let starFieldHeight = 0;
const mobileBreakpoint = matchMedia("(max-width: 500px)");
let previousScrollY = scrollY;
let starScrollVelocity = 0;
const scrollStarSpeed = 0.1;
const scrollInertia = 0.85;
const scrollScatter = 1.5;
const pageFadeDistance = 0.25;
const filmScrollStart = 2;
const filmEventsRevealAt = 2;
const communityScrollPosition = 3.3;

function getFooterHeight() {
  return mobileBreakpoint.matches ? 0.4 : 0.15;
}

function getPageScrollPosition(index) {
  return index === pages.length - 1 ? communityScrollPosition : index;
}

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

function updatePages() {
  const progress = scrollY / innerHeight;

  pages.forEach((page, index) => {
    if (page.classList.contains("community-contact")) return;

    const pagePosition = getPageScrollPosition(index);
    const entranceDistance = Math.max(
      0,
      pagePosition - progress - pageFadeDistance,
    );
    const exitDistance = page.classList.contains("film")
      ? 0
      : Math.max(0, progress - pagePosition - pageFadeDistance);
    const opacity = Math.max(
      0,
      1 - Math.max(entranceDistance, exitDistance) * 4,
    );
    page.style.opacity = opacity;
    page.classList.toggle("is-visible", opacity > 0.5);
  });

  filmEvents.classList.toggle("is-visible", progress >= filmEventsRevealAt);

  const footerHeight = getFooterHeight();
  const footerScrollStart = communityScrollPosition - footerHeight;
  const footerProgress = Math.min(
    1,
    Math.max(0, (progress - footerScrollStart) / footerHeight),
  );
  const filmOffset = footerProgress * footerHeight * innerHeight;
  document.querySelector(".film").style.transform =
    `translateY(-${filmOffset}px)`;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.hash);
    const page = target?.closest("section");
    if (!page) return;

    event.preventDefault();
    scrollTo({
      top: getPageScrollPosition(pages.indexOf(page)) * innerHeight,
      behavior: "smooth",
    });
  });
});

function resize() {
  const scale = Math.min(devicePixelRatio, 2);
  starFieldHeight = main.offsetHeight;
  canvas.style.height = `${starFieldHeight}px`;
  canvas.width = innerWidth * scale;
  canvas.height = starFieldHeight * scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  stars = Array.from({ length: Math.max(1000, innerWidth / 3) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * starFieldHeight,
    size: Math.random() * 1.7 + 0.3,
    color: ["#15281C", "#24422D", "#C5B459", "#E9E3C4"][
      Math.floor(Math.random() * 4)
    ],
    driftX: 0,
    driftY: 0,
  }));
}

function draw() {
  context.clearRect(0, 0, innerWidth, starFieldHeight);
  for (const star of stars) {
    star.x = (((star.x + star.driftX) % innerWidth) + innerWidth) % innerWidth;
    star.y =
      (((star.y + starScrollVelocity + star.driftY) % starFieldHeight) +
        starFieldHeight) %
      starFieldHeight;
    star.driftX *= scrollInertia;
    star.driftY *= scrollInertia;
    const dx = pointer.x - star.x,
      dy = pointer.y - star.y;
    const distance = Math.hypot(dx, dy);
    const pull = distance < 700 ? (700 - distance) / 60 : 0;
    context.fillStyle = star.color;
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

// logo.addEventListener("click", () => hero.classList.toggle("revealed"));
/*
logo.addEventListener("mouseenter", () => (cursor.style.display = "block"));
logo.addEventListener("mouseleave", () => (cursor.style.display = "none"));
logo.addEventListener("mousemove", (event) => {
  cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});
*/
hero.addEventListener("pointermove", (event) => {
  if (!mobileBreakpoint.matches) {
    pointer = {
      x: event.clientX,
      y: event.clientY - hero.getBoundingClientRect().top,
    };
  }
});
about.addEventListener("pointermove", (event) => {
  if (!mobileBreakpoint.matches) {
    pointer = {
      x: event.clientX,
      y: event.clientY - about.getBoundingClientRect().top + hero.offsetHeight,
    };
  }
});
mobileBreakpoint.addEventListener("change", () => {
  if (mobileBreakpoint.matches) {
    pointer = { x: -1000, y: -1000 };
  }
});

const filmVideos = [...document.querySelectorAll(".film-video")];
const filmCrossfadeSeconds = 4;
let activeFilmVideo = filmVideos[0];
let filmCrossfadeInProgress = false;

function playActiveFilm() {
  for (const video of filmVideos) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
  }

  activeFilmVideo.play().catch(() => {});
}

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
  video.addEventListener("loadeddata", playActiveFilm, { once: true });
  video.addEventListener("canplay", playActiveFilm, { once: true });
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

playActiveFilm();
addEventListener("visibilitychange", () => {
  if (!document.hidden && activeFilmVideo.paused) playActiveFilm();
});
addEventListener("pointerdown", playActiveFilm, { once: true, passive: true });
addEventListener("keydown", playActiveFilm, { once: true });

addEventListener("resize", resize);
addEventListener(
  "scroll",
  () => {
    moveStarsWithScroll();
    updatePages();
  },
  { passive: true },
);
resize();
updatePages();
draw();
