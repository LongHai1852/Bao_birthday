const gate = document.querySelector("#gate");
const enterButton = document.querySelector("#enterButton");
const audioToggle = document.querySelector("#audioToggle");
const wishButton = document.querySelector("#wishButton");
const sealButtons = [...document.querySelectorAll("#sealGrid button")];
const reveals = [...document.querySelectorAll(".reveal")];
const canvas = document.querySelector("#auraCanvas");
const ctx = canvas.getContext("2d");

const backgroundMusic = new Audio("assets/quy_linh.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.42;

let audioOn = false;
let particles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seedParticles() {
  const count = Math.min(90, Math.floor(window.innerWidth / 14));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.9 + 0.4,
    speed: Math.random() * 0.42 + 0.12,
    sway: Math.random() * 0.7 + 0.2,
    alpha: Math.random() * 0.55 + 0.18,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.y -= p.speed;
    p.x += Math.sin((p.y + performance.now() * 0.015) * 0.018) * p.sway;

    if (p.y < -10) {
      p.y = window.innerHeight + 10;
      p.x = Math.random() * window.innerWidth;
    }

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
    glow.addColorStop(0, `rgba(242, 198, 109, ${p.alpha})`);
    glow.addColorStop(0.45, `rgba(106, 216, 206, ${p.alpha * 0.34})`);
    glow.addColorStop(1, "rgba(106, 216, 206, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

function revealOnScroll() {
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  reveals.forEach((item) => observer.observe(item));
}

function openGate() {
  document.body.classList.add("gate-open");
  document.querySelectorAll("#hero .reveal").forEach((item) => {
    item.classList.add("is-visible");
  });
  window.setTimeout(() => {
    gate.hidden = true;
    document.querySelector("#hero").scrollIntoView({ behavior: "smooth" });
  }, 950);
}

async function startAudio() {
  await backgroundMusic.play();
  audioOn = true;
  audioToggle.textContent = "Âm Nền: Bật";
}

function stopAudio() {
  backgroundMusic.pause();
  audioOn = false;
  audioToggle.textContent = "Âm Nền: Tắt";
}

async function toggleAudio() {
  if (audioOn) {
    stopAudio();
  } else {
    await startAudio();
  }
}

function lightSeal(button) {
  button.classList.toggle("is-lit");
  makeBurst(
    button.getBoundingClientRect().left + button.offsetWidth / 2,
    button.getBoundingClientRect().top + button.offsetHeight / 2,
    12
  );
}

function makeBurst(x, y, amount = 28) {
  for (let i = 0; i < amount; i += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * i) / amount;
    const distance = 46 + Math.random() * 76;
    spark.className = "spark";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 980);
  }
}

enterButton.addEventListener("click", () => {
  openGate();
  startAudio().catch((error) => {
    console.warn("Không thể bật âm nền trên trình duyệt này.", error);
  });
});

audioToggle.addEventListener("click", () => {
  toggleAudio().catch((error) => {
    console.warn("Không thể bật âm nền trên trình duyệt này.", error);
  });
});

wishButton.addEventListener("click", () => {
  const rect = wishButton.getBoundingClientRect();
  makeBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 42);
  sealButtons.forEach((button, index) => {
    window.setTimeout(() => button.classList.add("is-lit"), index * 55);
  });
});

sealButtons.forEach((button) => {
  button.addEventListener("click", () => lightSeal(button));
});

window.addEventListener("resize", () => {
  resizeCanvas();
  seedParticles();
});

resizeCanvas();
seedParticles();
drawParticles();
revealOnScroll();
