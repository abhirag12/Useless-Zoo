// ============================================================================
// 🐾 MOUSE-FOLLOWING ANIMAL ENGINE (Smooth requestAnimationFrame Physics)
// Supports 10 distinct comical movement algorithms
// ============================================================================

const FOLLOWER_TYPES = {
  snail: {
    emoji: "🐌",
    name: "Slow Snail",
    desc: "Moves at the speed of continental drift",
    speed: 0.012,
    bubble: "I'll be there by next Tuesday..."
  },
  chicken: {
    emoji: "🐔",
    name: "Confused Chicken",
    desc: "Constantly forgets why it is chasing you",
    speed: 0.045,
    bubble: "BWAAAK?! Which way?!"
  },
  duck: {
    emoji: "🦆",
    name: "Angry Duck",
    desc: "Chases while violently bouncing for bread",
    speed: 0.065,
    bubble: "HAND OVER THE BAGUETTE!"
  },
  turtle: {
    emoji: "🐢",
    name: "Extremely Slow Turtle",
    desc: "Glacial, stoic, completely unfazed",
    speed: 0.008,
    bubble: "Patience... I was born in 1890."
  },
  fish: {
    emoji: "🐟",
    name: "Flying Fish",
    desc: "Swims through air in harmonic sine waves",
    speed: 0.05,
    bubble: "Air is just thin water!"
  },
  elephant: {
    emoji: "🐘",
    name: "Tiny Elephant",
    desc: "Heavy inertia with delayed spring physics",
    speed: 0.025,
    bubble: "Heavy steps coming through!"
  },
  dinosaur: {
    emoji: "🦖",
    name: "Definitely Real Dinosaur",
    desc: "Intermittent stomps and roaring lunges",
    speed: 0.055,
    bubble: "ROAAAR! (Tiny arms)"
  },
  sloth: {
    emoji: "🦥",
    name: "Busy Sloth",
    desc: "Barely moves, falls asleep immediately",
    speed: 0.003,
    bubble: "Taking a nap first... zZz"
  },
  monkey: {
    emoji: "🐒",
    name: "Office Monkey",
    desc: "Chaotic orbital loops and keyboard mischief",
    speed: 0.08,
    bubble: "I just replied-all to the CEO!"
  },
  unicorn: {
    emoji: "🦄",
    name: "Suspicious Unicorn",
    desc: "Backs away if you get too close; emits sparkles",
    speed: 0.04,
    bubble: "Don't touch the horn! Free Wi-Fi only!"
  }
};

class CursorFollower {
  constructor() {
    this.currentType = "snail";
    this.enabled = true;

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.followerX = window.innerWidth / 2 - 100;
    this.followerY = window.innerHeight / 2 - 100;
    this.vx = 0;
    this.vy = 0;

    this.time = 0;
    this.idleTimer = 0;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;

    // Special behavior states
    this.chickenJitterTimer = 0;
    this.chickenAngle = 0;
    this.dinoStepTimer = 0;
    this.dinoIsLurching = false;

    this.domElement = null;
    this.bubbleElement = null;
    this.trailContainer = null;

    this.boundAnimate = this.animate.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
  }

  init() {
    // Check local storage for preference
    const saved = localStorage.getItem("useless_zoo_companion");
    if (saved && FOLLOWER_TYPES[saved]) {
      this.currentType = saved;
    }
    const savedEnabled = localStorage.getItem("useless_zoo_companion_enabled");
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === "true";
    }

    this.createDom();
    window.addEventListener("mousemove", this.boundMouseMove, { passive: true });
    requestAnimationFrame(this.boundAnimate);
  }

  createDom() {
    // Main follower node
    this.domElement = document.createElement("div");
    this.domElement.id = "cursor-follower";
    this.domElement.className = "cursor-follower";
    this.domElement.innerHTML = `
      <div class="follower-body">${FOLLOWER_TYPES[this.currentType].emoji}</div>
      <div class="follower-bubble" id="follower-bubble">${FOLLOWER_TYPES[this.currentType].bubble}</div>
    `;

    // Trail container for snail slime or sparkles
    this.trailContainer = document.createElement("div");
    this.trailContainer.id = "follower-trail-container";
    this.trailContainer.className = "follower-trail-container";

    document.body.appendChild(this.trailContainer);
    document.body.appendChild(this.domElement);

    this.bubbleElement = this.domElement.querySelector(".follower-bubble");

    if (!this.enabled) {
      this.domElement.style.display = "none";
    }
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  setAnimal(typeKey) {
    if (!FOLLOWER_TYPES[typeKey]) return;
    this.currentType = typeKey;
    localStorage.setItem("useless_zoo_companion", typeKey);

    if (this.domElement) {
      const body = this.domElement.querySelector(".follower-body");
      if (body) body.textContent = FOLLOWER_TYPES[typeKey].emoji;
      if (this.bubbleElement) {
        this.bubbleElement.textContent = FOLLOWER_TYPES[typeKey].bubble;
        this.showBubbleBriefly();
      }
    }
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    localStorage.setItem("useless_zoo_companion_enabled", this.enabled);
    if (this.domElement) {
      this.domElement.style.display = this.enabled ? "flex" : "none";
    }
    return this.enabled;
  }

  showBubbleBriefly() {
    if (!this.bubbleElement) return;
    this.bubbleElement.classList.add("visible");
    clearTimeout(this._bubbleTimeout);
    this._bubbleTimeout = setTimeout(() => {
      if (this.bubbleElement) this.bubbleElement.classList.remove("visible");
    }, 2400);
  }

  createTrailParticle(x, y, content, className = "trail-particle") {
    if (!this.enabled) return;
    const p = document.createElement("span");
    p.className = className;
    p.textContent = content;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    this.trailContainer.appendChild(p);

    setTimeout(() => {
      p.remove();
    }, 800);
  }

  animate() {
    if (this.enabled && this.domElement) {
      this.time += 0.016;

      const config = FOLLOWER_TYPES[this.currentType];
      const dx = this.mouseX - this.followerX;
      const dy = this.mouseY - this.followerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check mouse movement for idle detection
      if (Math.abs(this.mouseX - this.lastMouseX) < 1 && Math.abs(this.mouseY - this.lastMouseY) < 1) {
        this.idleTimer += 1;
      } else {
        this.idleTimer = 0;
      }
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;

      let targetX = this.mouseX;
      let targetY = this.mouseY;
      let visualRotation = 0;
      let visualScale = 1;
      let visualOffsetY = 0;

      switch (this.currentType) {
        case "snail":
          // Extremely slow crawl + slime trail
          this.followerX += dx * config.speed;
          this.followerY += dy * config.speed;
          if (dist > 15 && Math.random() < 0.15) {
            this.createTrailParticle(this.followerX + 10, this.followerY + 22, "✨", "trail-slime");
          }
          break;

        case "chicken":
          // Chaotic zigzagging pecks
          this.chickenJitterTimer++;
          if (this.chickenJitterTimer > 35) {
            this.chickenJitterTimer = 0;
            this.chickenAngle = (Math.random() - 0.5) * Math.PI * 1.5;
            if (Math.random() < 0.2) {
              this.showBubbleBriefly();
            }
          }
          const jitterX = Math.cos(this.chickenAngle) * 45;
          const jitterY = Math.sin(this.chickenAngle) * 45;
          this.followerX += (targetX + jitterX - this.followerX) * config.speed;
          this.followerY += (targetY + jitterY - this.followerY) * config.speed;
          visualOffsetY = Math.abs(Math.sin(this.time * 16)) * -8;
          break;

        case "duck":
          // Bouncy chasing with waddle
          this.followerX += dx * config.speed;
          this.followerY += dy * config.speed;
          visualOffsetY = Math.sin(this.time * 14) * 14;
          visualRotation = Math.sin(this.time * 14) * 15;
          break;

        case "turtle":
          // Glacial crawl
          this.followerX += dx * config.speed;
          this.followerY += dy * config.speed;
          break;

        case "fish":
          // Harmonic wave swimming motion
          const wave = Math.sin(this.time * 8) * 35;
          const perpX = -dy / (dist || 1);
          const perpY = dx / (dist || 1);
          this.followerX += dx * config.speed + perpX * wave * 0.1;
          this.followerY += dy * config.speed + perpY * wave * 0.1;
          visualRotation = Math.sin(this.time * 8) * 20;
          if (Math.random() < 0.1) {
            this.createTrailParticle(this.followerX + 15, this.followerY + 15, "🫧", "trail-bubble");
          }
          break;

        case "elephant":
          // Delayed heavy spring inertia
          const ax = dx * 0.008;
          const ay = dy * 0.008;
          this.vx = (this.vx + ax) * 0.91;
          this.vy = (this.vy + ay) * 0.91;
          this.followerX += this.vx;
          this.followerY += this.vy;
          visualScale = 1.15;
          break;

        case "dinosaur":
          // Intermittent stomps
          this.dinoStepTimer++;
          if (this.dinoStepTimer > 40) {
            this.dinoStepTimer = 0;
            this.dinoIsLurching = true;
            setTimeout(() => { this.dinoIsLurching = false; }, 200);
          }
          if (this.dinoIsLurching) {
            this.followerX += dx * 0.2;
            this.followerY += dy * 0.2;
            visualOffsetY = -15;
          }
          break;

        case "sloth":
          // Barely moves at all
          this.followerX += dx * config.speed;
          this.followerY += dy * config.speed;
          if (this.idleTimer > 90) {
            if (this.bubbleElement && !this.bubbleElement.classList.contains("visible")) {
              this.bubbleElement.textContent = "💤 zZzZz...";
              this.bubbleElement.classList.add("visible");
            }
          }
          break;

        case "monkey":
          // Chaotic orbital loops
          const orbitAngle = this.time * 5;
          const orbitRadius = 60;
          targetX = this.mouseX + Math.cos(orbitAngle) * orbitRadius;
          targetY = this.mouseY + Math.sin(orbitAngle) * orbitRadius;
          this.followerX += (targetX - this.followerX) * config.speed;
          this.followerY += (targetY - this.followerY) * config.speed;
          visualRotation = Math.sin(this.time * 10) * 25;
          break;

        case "unicorn":
          // Tiptoes; flees in panic if cursor gets too close!
          if (dist < 90) {
            targetX = this.followerX - dx * 0.8;
            targetY = this.followerY - dy * 0.8;
            this.followerX += (targetX - this.followerX) * 0.08;
            this.followerY += (targetY - this.followerY) * 0.08;
            if (Math.random() < 0.3) {
              this.createTrailParticle(this.followerX + 15, this.followerY + 15, "✨", "trail-sparkle");
            }
          } else {
            this.followerX += dx * config.speed;
            this.followerY += dy * config.speed;
          }
          break;

        default:
          this.followerX += dx * config.speed;
          this.followerY += dy * config.speed;
          break;
      }

      // Flip face direction based on relative X
      const isFacingLeft = dx < 0;
      const flipScale = isFacingLeft ? -1 : 1;

      this.domElement.style.transform = `translate3d(${this.followerX}px, ${this.followerY + visualOffsetY}px, 0)`;
      const body = this.domElement.querySelector(".follower-body");
      if (body) {
        body.style.transform = `scaleX(${flipScale}) scale(${visualScale}) rotate(${visualRotation}deg)`;
      }
    }

    requestAnimationFrame(this.boundAnimate);
  }
}

const cursorFollower = new CursorFollower();

if (typeof window !== "undefined") {
  window.UselessZooCursor = { cursorFollower, FOLLOWER_TYPES };
}
