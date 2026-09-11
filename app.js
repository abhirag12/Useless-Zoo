// ============================================================================
// 🦁 USELESS ZOO EXPLORER - MAIN APPLICATION CONTROLLER
// Certified 100% Intentionally Inaccurate
// ============================================================================

(function() {
  const { ANIMALS, USELESS_FACTS, QUIZ_QUESTIONS, CHIMERA_DATA, RANDOM_RECHECK_FACTS } = window.UselessZooData;
  const { sounds } = window.UselessZooAudio;
  const { cursorFollower, FOLLOWER_TYPES } = window.UselessZooCursor;

  class UselessZooApp {
    constructor() {
      this.animals = [...ANIMALS];
      this.currentCategory = "all";
      this.searchQuery = "";
      this.favorites = this.loadFavorites();
      this.activeModalAnimal = null;

      // Quiz State
      this.currentQuestionIdx = 0;
      this.quizScore = 0;
      this.quizAnswered = false;

      // Comparison State
      this.fighter1Id = "lion";
      this.fighter2Id = "penguin";

      // Live Accuracy Tracker
      this.accuracyValue = 37;

      // Daily animal seed
      this.dailyAnimal = this.getDailyAnimal();
    }

    init() {
      // 1. Initialize cursor follower
      cursorFollower.init();

      // 2. Setup theme & sounds
      this.initTheme();
      this.initSoundToggle();

      // 3. Setup header controls & disclaimer
      this.initHeaderControls();
      this.initLiveAccuracyTracker();

      // 4. Run funny loading sequence
      this.runLoadingSequence();

      // 5. Populate floating emojis
      this.populateFloatingEmojis();

      // 6. Setup companion toolbar
      this.initCompanionChips();

      // 7. Render Daily Animal
      this.renderDailyAnimal();
      this.startCountdownTimer();

      // 8. Render Database & Search/Filter
      this.initDatabase();

      // 9. Setup Random Fact Generator
      this.initFactGenerator();

      // 10. Setup Comparison Showdown
      this.initComparison();

      // 11. Setup Quiz Arena
      this.initQuiz();

      // 12. Setup Chimera Slot Machine
      this.initChimeraGenerator();

      // 13. Setup Modals
      this.initModals();

      console.log("🦁 Useless Zoo initialized. Science has left the chat.");
    }

    // ==========================================================================
    // LOADING SCREEN SEQUENCE
    // ==========================================================================
    runLoadingSequence() {
      const overlay = document.getElementById("loading-overlay");
      const textEl = document.getElementById("loading-text");
      const spinnerEl = document.getElementById("loading-spinner-emoji");
      const fillEl = document.getElementById("loading-bar-fill");
      const skipBtn = document.getElementById("skip-loading-btn");

      const steps = [
        { text: "🦁 Training the elephants...", emoji: "🐘", progress: 25, delay: 600 },
        { text: "🦒 Teaching the giraffe to look busy...", emoji: "🦒", progress: 55, delay: 700 },
        { text: "🦥 Waiting for the sloth to notice us...", emoji: "🦥", progress: 85, delay: 800 },
        { text: "✅ Absolutely nothing important is ready!", emoji: "🎉", progress: 100, delay: 600 }
      ];

      let currentStep = 0;

      const advance = () => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          textEl.textContent = step.text;
          spinnerEl.textContent = step.emoji;
          fillEl.style.width = `${step.progress}%`;
          currentStep++;
          this.loadingTimer = setTimeout(advance, step.delay);
        } else {
          setTimeout(() => {
            overlay.classList.add("hidden");
            sounds.playFanfare();
          }, 400);
        }
      };

      const skipLoading = () => {
        clearTimeout(this.loadingTimer);
        overlay.classList.add("hidden");
        sounds.playBoing();
      };

      skipBtn.addEventListener("click", skipLoading);
      advance();
    }

    // ==========================================================================
    // THEME & SOUND TOGGLES
    // ==========================================================================
    initTheme() {
      const themeBtn = document.getElementById("theme-toggle-btn");
      const savedTheme = localStorage.getItem("useless_zoo_theme") || "light";
      document.documentElement.setAttribute("data-theme", savedTheme);
      themeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

      themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const nextTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("useless_zoo_theme", nextTheme);
        themeBtn.textContent = nextTheme === "dark" ? "☀️" : "🌙";
        sounds.playClick();
        this.showToast(`Switched to ${nextTheme === "dark" ? "Midnight Safari" : "Sunny Jungle"} mode`);
      });
    }

    initSoundToggle() {
      const soundBtn = document.getElementById("sound-toggle-btn");
      const updateSoundBtn = () => {
        soundBtn.textContent = sounds.isMuted() ? "🔇" : "🔊";
        soundBtn.title = sounds.isMuted() ? "Unmute Silly Sounds" : "Mute Silly Sounds";
      };

      updateSoundBtn();

      soundBtn.addEventListener("click", () => {
        const isMuted = sounds.toggleMute();
        updateSoundBtn();
        this.showToast(isMuted ? "Sound muted (Sweet silence)" : "Sound unmuted (Prepare your ears)");
        if (!isMuted) sounds.playBoing();
      });
    }

    initHeaderControls() {
      // Disclaimer dismiss
      const topDisclaimer = document.getElementById("top-disclaimer");
      const dismissBtn = document.getElementById("disclaimer-dismiss-btn");
      dismissBtn.addEventListener("click", () => {
        topDisclaimer.style.display = "none";
        sounds.playClick();
        this.showToast("You promised to believe these lies!");
      });

      // Companion toggle in header
      const companionToggle = document.getElementById("companion-toggle-btn");
      companionToggle.addEventListener("click", () => {
        const enabled = cursorFollower.toggleEnabled();
        companionToggle.style.opacity = enabled ? "1" : "0.5";
        sounds.playBoing();
        this.showToast(enabled ? "Cursor pet enabled!" : "Cursor pet taking a break");
      });
    }

    // ==========================================================================
    // LIVE ACCURACY TRACKER (Header Meter)
    // ==========================================================================
    initLiveAccuracyTracker() {
      const bar = document.getElementById("accuracy-meter-bar");
      const percentEl = document.getElementById("accuracy-percent");
      const commentEl = document.getElementById("accuracy-comment");

      const comments = [
        "Accuracy level: Probably not.",
        "Accuracy dropped: Someone read Wikipedia.",
        "Spiked to 42%: Accidental truth detected, fixing...",
        "Accuracy level: Verified by zero scientists.",
        "Accuracy level: Marginally worse than guessing.",
        "Accuracy level: Pure vibes only.",
        "Down to 6%: Cat walked across the keyboard.",
        "Accuracy level: Peer reviewed by a garden potato."
      ];

      setInterval(() => {
        const newAccuracy = Math.floor(Math.random() * 45) + 3;
        this.accuracyValue = newAccuracy;
        bar.style.width = `${newAccuracy}%`;
        percentEl.textContent = `${newAccuracy}%`;

        const randComment = comments[Math.floor(Math.random() * comments.length)];
        commentEl.textContent = randComment;
      }, 4500);
    }

    // ==========================================================================
    // HERO & FLOATING EMOJIS
    // ==========================================================================
    populateFloatingEmojis() {
      const container = document.getElementById("floating-emojis-container");
      const emojis = ["🦁", "🐘", "🦒", "🐼", "🐯", "🐸", "🦓", "🐒", "🐊", "🦜", "🐧", "🦘", "🦛", "🦏", "🐢", "🦋"];

      emojis.forEach((emoji, index) => {
        const el = document.createElement("span");
        el.className = "floating-emoji";
        el.textContent = emoji;

        const left = (index * 6.2 + Math.random() * 4) % 94;
        const top = (index * 14.5 + Math.random() * 10) % 80;
        const delay = (index * 0.5) % 6;
        const duration = 9 + (index % 5);

        el.style.left = `${left}%`;
        el.style.top = `${top}%`;
        el.style.animationDelay = `${delay}s`;
        el.style.animationDuration = `${duration}s`;

        el.addEventListener("click", () => {
          if (emoji === "🦆") sounds.playQuack();
          else sounds.playBoing();

          el.style.transform = "scale(2.2) rotate(360deg)";
          this.showToast(`${emoji} says: "Please do not quote me on this!"`);
          setTimeout(() => {
            el.style.transform = "";
          }, 600);
        });

        container.appendChild(el);
      });

      document.getElementById("hero-fact-btn").addEventListener("click", () => {
        sounds.playBoing();
        this.generateRandomFact();
        document.getElementById("useless-fact-section").scrollIntoView({ behavior: "smooth" });
      });

      document.getElementById("why-exist-btn").addEventListener("click", () => {
        sounds.playClick();
        this.openWhyModal();
      });
    }

    // ==========================================================================
    // CURSOR COMPANION BAR
    // ==========================================================================
    initCompanionChips() {
      const chips = document.querySelectorAll(".companion-chip");
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          const type = chip.getAttribute("data-type");
          cursorFollower.setAnimal(type);

          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");

          if (type === "duck") sounds.playQuack();
          else sounds.playBoing();

          this.showToast(`Switched companion to ${FOLLOWER_TYPES[type].name}!`);
        });
      });

      const current = cursorFollower.currentType;
      chips.forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-type") === current);
      });
    }

    // ==========================================================================
    // DAILY ANIMAL
    // ==========================================================================
    getDailyAnimal() {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const index = dayOfYear % this.animals.length;
      return this.animals[index] || this.animals[0];
    }

    renderDailyAnimal() {
      const a = this.dailyAnimal;
      document.getElementById("daily-emoji").textContent = a.emoji;
      document.getElementById("daily-name").textContent = a.name;
      document.getElementById("daily-sci-name").textContent = a.fakeScientificName;
      document.getElementById("daily-quote").textContent = `"${a.funnyFact}"`;
      document.getElementById("daily-speed").textContent = a.fakeSpeed;
      document.getElementById("daily-confidence").textContent = `${a.scientificConfidence}%`;

      document.getElementById("daily-inspect-btn").addEventListener("click", () => {
        sounds.playClick();
        this.openAnimalModal(a);
      });
    }

    startCountdownTimer() {
      const countdownEl = document.getElementById("daily-countdown");
      const updateCountdown = () => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow - now;

        const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

        countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
      };

      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    // ==========================================================================
    // ANIMAL DATABASE & SEARCH / FILTER
    // ==========================================================================
    initDatabase() {
      const searchInput = document.getElementById("animal-search-input");
      const clearSearchBtn = document.getElementById("clear-search-btn");
      const resetSearchBtn = document.getElementById("reset-search-btn");
      const tabs = document.querySelectorAll(".category-tab");

      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        clearSearchBtn.classList.toggle("visible", this.searchQuery.length > 0);
        this.renderAnimalsGrid();
      });

      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearSearchBtn.classList.remove("visible");
        sounds.playClick();
        this.renderAnimalsGrid();
      });

      resetSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearSearchBtn.classList.remove("visible");
        this.currentCategory = "all";
        tabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-category") === "all"));
        sounds.playClick();
        this.renderAnimalsGrid();
      });

      tabs.forEach(tab => {
        tab.addEventListener("click", () => {
          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          this.currentCategory = tab.getAttribute("data-category");
          sounds.playClick();
          this.renderAnimalsGrid();
        });
      });

      this.updateFavoritesCount();
      this.renderAnimalsGrid();
    }

    renderAnimalsGrid() {
      const grid = document.getElementById("animals-grid");
      const emptyState = document.getElementById("empty-search-state");
      grid.innerHTML = "";

      const filtered = this.animals.filter(a => {
        if (this.currentCategory === "favorites") {
          if (!this.favorites.includes(a.id)) return false;
        } else if (this.currentCategory !== "all") {
          if (a.category !== this.currentCategory) return false;
        }

        if (this.searchQuery) {
          const matchesName = a.name.toLowerCase().includes(this.searchQuery);
          const matchesSci = a.fakeScientificName.toLowerCase().includes(this.searchQuery);
          const matchesFact = a.funnyFact.toLowerCase().includes(this.searchQuery);
          const matchesDiet = a.fakeDiet.toLowerCase().includes(this.searchQuery);
          return matchesName || matchesSci || matchesFact || matchesDiet;
        }

        return true;
      });

      if (filtered.length === 0) {
        emptyState.style.display = "block";
        return;
      }

      emptyState.style.display = "none";

      filtered.forEach(animal => {
        const isFav = this.favorites.includes(animal.id);
        const card = document.createElement("div");
        card.className = "animal-card";
        card.innerHTML = `
          <div class="card-top-row">
            <span class="card-badge">${animal.badge}</span>
            <button class="favorite-toggle-btn ${isFav ? "favorited" : ""}" data-id="${animal.id}" title="${isFav ? "Remove favorite" : "Add to favorites"}" aria-label="Favorite animal">
              ${isFav ? "❤️" : "🤍"}
            </button>
          </div>
          <div class="card-avatar-wrapper">
            <span class="card-emoji">${animal.emoji}</span>
          </div>
          <div class="card-info">
            <h3 class="card-name">${animal.name}</h3>
            <div class="card-sci-name">${animal.fakeScientificName}</div>
          </div>
          <div class="card-quick-stats">
            <div class="quick-stat-row">
              <span class="quick-stat-label">⚖️ Weight:</span>
              <span class="quick-stat-val" title="${animal.fakeWeight}">${animal.fakeWeight}</span>
            </div>
            <div class="quick-stat-row">
              <span class="quick-stat-label">🍕 Pizza Match:</span>
              <span class="quick-stat-val">${animal.stats.pizzaCompatibility}%</span>
            </div>
            <div class="quick-stat-row">
              <span class="quick-stat-label">🔬 Confidence:</span>
              <span class="quick-stat-val">${animal.scientificConfidence}%</span>
            </div>
          </div>
          <div class="card-bottom-actions">
            <button class="card-inspect-btn">🔬 Inspect Nonsense</button>
          </div>
        `;

        card.addEventListener("click", (e) => {
          if (e.target.closest(".favorite-toggle-btn")) {
            e.stopPropagation();
            this.toggleFavorite(animal.id);
            return;
          }
          sounds.playClick();
          this.openAnimalModal(animal);
        });

        grid.appendChild(card);
      });
    }

    // ==========================================================================
    // FAVORITES SYSTEM
    // ==========================================================================
    loadFavorites() {
      try {
        const raw = localStorage.getItem("useless_zoo_favorites");
        return raw ? JSON.parse(raw) : ["lion", "sloth"];
      } catch (e) {
        return ["lion", "sloth"];
      }
    }

    saveFavorites() {
      localStorage.setItem("useless_zoo_favorites", JSON.stringify(this.favorites));
      this.updateFavoritesCount();
    }

    toggleFavorite(animalId) {
      const idx = this.favorites.indexOf(animalId);
      if (idx >= 0) {
        this.favorites.splice(idx, 1);
        sounds.playClick();
        this.showToast("Removed from completely unnecessary favorites");
      } else {
        this.favorites.push(animalId);
        sounds.playBoing();
        this.showToast("❤️ Saved to completely unnecessary favorites!");
      }
      this.saveFavorites();
      this.renderAnimalsGrid();

      if (this.activeModalAnimal && this.activeModalAnimal.id === animalId) {
        this.updateModalFavoriteBtn();
      }
    }

    updateFavoritesCount() {
      const countEl = document.getElementById("favorites-count");
      if (countEl) {
        countEl.textContent = this.favorites.length;
      }
    }

    // ==========================================================================
    // RANDOM USELESS FACT GENERATOR
    // ==========================================================================
    initFactGenerator() {
      const generateBtn = document.getElementById("generate-fact-btn");
      const copyBtn = document.getElementById("copy-fact-btn");
      const factDisplay = document.getElementById("random-fact-display");

      generateBtn.addEventListener("click", () => {
        sounds.playBoing();
        this.generateRandomFact();
      });

      copyBtn.addEventListener("click", () => {
        const text = factDisplay.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          sounds.playClick();
          this.showToast("Copied fact to clipboard! Share the misinformation!");
        }).catch(() => {
          this.showToast("Could not copy to clipboard.");
        });
      });
    }

    generateRandomFact() {
      const factDisplay = document.getElementById("random-fact-display");
      const randomIndex = Math.floor(Math.random() * USELESS_FACTS.length);
      const fact = USELESS_FACTS[randomIndex];

      factDisplay.style.opacity = "0";
      factDisplay.style.transform = "translateY(10px)";

      setTimeout(() => {
        factDisplay.textContent = `"${fact}"`;
        factDisplay.style.opacity = "1";
        factDisplay.style.transform = "translateY(0)";
      }, 200);
    }

    // ==========================================================================
    // ANIMAL COMPARISON SHOWDOWN
    // ==========================================================================
    initComparison() {
      const select1 = document.getElementById("fighter-1-select");
      const select2 = document.getElementById("fighter-2-select");
      const randomBtn = document.getElementById("random-matchup-btn");

      this.animals.forEach(a => {
        const opt1 = document.createElement("option");
        opt1.value = a.id;
        opt1.textContent = `${a.emoji} ${a.name}`;
        select1.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = a.id;
        opt2.textContent = `${a.emoji} ${a.name}`;
        select2.appendChild(opt2);
      });

      select1.value = this.fighter1Id;
      select2.value = this.fighter2Id;

      select1.addEventListener("change", (e) => {
        this.fighter1Id = e.target.value;
        sounds.playClick();
        this.renderComparison();
      });

      select2.addEventListener("change", (e) => {
        this.fighter2Id = e.target.value;
        sounds.playClick();
        this.renderComparison();
      });

      randomBtn.addEventListener("click", () => {
        sounds.playBoing();
        const rand1 = this.animals[Math.floor(Math.random() * this.animals.length)].id;
        let rand2 = this.animals[Math.floor(Math.random() * this.animals.length)].id;
        while (rand2 === rand1) {
          rand2 = this.animals[Math.floor(Math.random() * this.animals.length)].id;
        }

        this.fighter1Id = rand1;
        this.fighter2Id = rand2;
        select1.value = rand1;
        select2.value = rand2;
        this.renderComparison();
      });

      this.renderComparison();
    }

    renderComparison() {
      const a1 = this.animals.find(a => a.id === this.fighter1Id) || this.animals[0];
      const a2 = this.animals.find(a => a.id === this.fighter2Id) || this.animals[3];

      document.getElementById("fighter-1-avatar").textContent = a1.emoji;
      document.getElementById("fighter-2-avatar").textContent = a2.emoji;

      const metrics = [
        { key: "roaringPower", label: "🦁 Roaring Power" },
        { key: "snackCapacity", label: "🍕 Snack Capacity" },
        { key: "napAbility", label: "😴 Nap Ability" },
        { key: "danceSkill", label: "🕺 Dance Skill" },
        { key: "wifiStrength", label: "📶 Wi-Fi Strength" },
        { key: "homeworkAvoidance", label: "🏃 Homework Avoidance" },
        { key: "hatCompatibility", label: "🎩 Hat Compatibility" },
        { key: "formalwear", label: "👔 Formalwear Elegance" }
      ];

      const statsGrid = document.getElementById("comparison-stats-grid");
      statsGrid.innerHTML = "";

      let a1Score = 0;
      let a2Score = 0;

      metrics.forEach(m => {
        const val1 = a1.comparisonStats[m.key] || 50;
        const val2 = a2.comparisonStats[m.key] || 50;

        if (val1 > val2) a1Score++;
        else if (val2 > val1) a2Score++;

        const row = document.createElement("div");
        row.className = "comparison-metric-row";
        row.innerHTML = `
          <div class="metric-bar-left">
            <div class="metric-fill-left" style="width: ${val1}%;"></div>
          </div>
          <div class="metric-name-center">${m.label}</div>
          <div class="metric-bar-right">
            <div class="metric-fill-right" style="width: ${val2}%;"></div>
          </div>
        `;
        statsGrid.appendChild(row);
      });

      const verdictTitle = document.getElementById("verdict-title");
      const verdictDesc = document.getElementById("verdict-desc");

      const hilariousVerdicts = [
        `${a1.name} took a four-hour nap midway through the debate, allowing ${a2.name} to declare an uncontested victory via committee consensus.`,
        `${a2.name} successfully distracted everyone with a warm pizza delivery, completely invalidating ${a1.name}'s argument.`,
        `Both contestants refused to participate and instead formed a mutual alliance to avoid finishing their homework.`,
        `${a1.name} wore a more sensible hat, but ${a2.name} possessed significantly superior Wi-Fi hotspot bandwidth.`,
        `The judges fell asleep. The victory was awarded to the nearby garden snail by default.`
      ];

      const randomVerdict = hilariousVerdicts[Math.floor(Math.random() * hilariousVerdicts.length)];

      if (a1Score > a2Score) {
        verdictTitle.textContent = `🏆 Verdict: ${a1.name} Wins!`;
      } else if (a2Score > a1Score) {
        verdictTitle.textContent = `🏆 Verdict: ${a2.name} Wins!`;
      } else {
        verdictTitle.textContent = `🤝 Verdict: A Draw of Utter Incompetence!`;
      }

      verdictDesc.textContent = randomVerdict;
    }

    // ==========================================================================
    // THE WORLD'S MOST USELESS ANIMAL QUIZ
    // ==========================================================================
    initQuiz() {
      const nextBtn = document.getElementById("quiz-next-btn");
      const restartBtn = document.getElementById("quiz-restart-btn");

      nextBtn.addEventListener("click", () => {
        sounds.playClick();
        this.currentQuestionIdx++;
        if (this.currentQuestionIdx >= QUIZ_QUESTIONS.length) {
          this.showQuizResults();
        } else {
          this.renderQuizQuestion();
        }
      });

      restartBtn.addEventListener("click", () => {
        sounds.playBoing();
        this.currentQuestionIdx = 0;
        this.quizScore = 0;
        this.quizAnswered = false;
        document.getElementById("quiz-result-view").classList.remove("visible");
        document.getElementById("quiz-question-view").style.display = "block";
        this.renderQuizQuestion();
      });

      this.renderQuizQuestion();
    }

    renderQuizQuestion() {
      const q = QUIZ_QUESTIONS[this.currentQuestionIdx];
      this.quizAnswered = false;

      const currentNum = this.currentQuestionIdx + 1;
      document.getElementById("quiz-progress-text").textContent = `Question ${currentNum} of ${QUIZ_QUESTIONS.length}`;
      document.getElementById("quiz-progress-fill").style.width = `${(currentNum / QUIZ_QUESTIONS.length) * 100}%`;

      document.getElementById("quiz-question-title").textContent = q.question;

      const optionsList = document.getElementById("quiz-options-list");
      optionsList.innerHTML = "";

      const feedbackBox = document.getElementById("quiz-feedback-box");
      feedbackBox.classList.remove("visible");
      feedbackBox.textContent = "";

      const nextBtn = document.getElementById("quiz-next-btn");
      nextBtn.style.display = "none";

      q.answers.forEach((ans, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.innerHTML = `<span>${String.fromCharCode(65 + idx)}. ${ans.text}</span>`;

        btn.addEventListener("click", () => {
          if (this.quizAnswered) return;
          this.quizAnswered = true;

          if (ans.correct) {
            sounds.playFanfare();
            btn.classList.add("correct");
            feedbackBox.textContent = `🎯 ${ans.comment}`;
            feedbackBox.style.borderColor = "var(--accent-primary)";
            this.quizScore++;
          } else {
            sounds.playFailBuzz();
            btn.classList.add("wrong");
            feedbackBox.textContent = `❌ ${ans.comment}`;
            feedbackBox.style.borderColor = "#d32f2f";

            const buttons = optionsList.querySelectorAll(".quiz-option-btn");
            q.answers.forEach((a, i) => {
              if (a.correct) buttons[i].classList.add("correct");
            });
          }

          feedbackBox.classList.add("visible");
          nextBtn.style.display = "inline-flex";
        });

        optionsList.appendChild(btn);
      });
    }

    showQuizResults() {
      document.getElementById("quiz-question-view").style.display = "none";
      const resultView = document.getElementById("quiz-result-view");
      resultView.classList.add("visible");

      const ranks = [
        "Certified Master of Disinformation",
        "Senior Professor of Fake Zoology",
        "Supreme Chancellor of Fabricated Wildlife",
        "Honorary Potato with Internet Access"
      ];
      const chosenRank = ranks[Math.floor(Math.random() * ranks.length)];
      document.getElementById("quiz-result-rank").textContent = `Awarded Title: ${chosenRank}`;

      sounds.playFanfare();
    }

    // ==========================================================================
    // RANDOM ANIMAL CHIMERA GENERATOR (SLOT MACHINE)
    // ==========================================================================
    initChimeraGenerator() {
      const spinBtn = document.getElementById("spin-chimera-btn");
      spinBtn.addEventListener("click", () => {
        this.spinChimera();
      });
    }

    spinChimera() {
      sounds.playSlotTick();
      const reelPrefix = document.getElementById("reel-prefix");
      const reelNoun = document.getElementById("reel-noun");
      const reelCreature = document.getElementById("reel-creature");

      reelPrefix.classList.add("spinning");
      reelNoun.classList.add("spinning");
      reelCreature.classList.add("spinning");

      let counter = 0;
      const interval = setInterval(() => {
        sounds.playSlotTick();
        const p = CHIMERA_DATA.prefixes[Math.floor(Math.random() * CHIMERA_DATA.prefixes.length)];
        const n = CHIMERA_DATA.nouns[Math.floor(Math.random() * CHIMERA_DATA.nouns.length)];
        const c = CHIMERA_DATA.creatures[Math.floor(Math.random() * CHIMERA_DATA.creatures.length)];

        reelPrefix.textContent = p;
        reelNoun.textContent = n;
        reelCreature.textContent = `${c.name} ${c.emoji}`;

        counter++;
        if (counter > 8) {
          clearInterval(interval);
          reelPrefix.classList.remove("spinning");
          reelNoun.classList.remove("spinning");
          reelCreature.classList.remove("spinning");

          sounds.playFanfare();
          this.displayChimera(p, n, c);
        }
      }, 90);
    }

    displayChimera(prefix, noun, creature) {
      const fullName = `${prefix} ${noun} ${creature.name}`;
      const sciName = `${creature.name}us ${noun}icus ${prefix}alis`;
      const habitat = CHIMERA_DATA.habitats[Math.floor(Math.random() * CHIMERA_DATA.habitats.length)];
      const diet = CHIMERA_DATA.diets[Math.floor(Math.random() * CHIMERA_DATA.diets.length)];
      const power = CHIMERA_DATA.superpowers[Math.floor(Math.random() * CHIMERA_DATA.superpowers.length)];

      document.getElementById("chimera-avatar").textContent = creature.emoji;
      document.getElementById("chimera-name").textContent = fullName;
      document.getElementById("chimera-sci").textContent = sciName;
      document.getElementById("chimera-habitat").textContent = habitat;
      document.getElementById("chimera-diet").textContent = diet;
      document.getElementById("chimera-power").textContent = power;

      this.showToast(`✨ Successfully spawned: ${fullName}!`);
    }

    // ==========================================================================
    // ANIMAL DETAILS MODAL & RECHECK SCIENCE
    // ==========================================================================
    initModals() {
      const modal = document.getElementById("animal-modal");
      const closeBtn = document.getElementById("modal-close-btn");
      const recheckBtn = document.getElementById("recheck-science-btn");
      const favBtn = document.getElementById("modal-favorite-btn");

      closeBtn.addEventListener("click", () => this.closeAnimalModal());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeAnimalModal();
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeAnimalModal();
          this.closeWhyModal();
        }
      });

      recheckBtn.addEventListener("click", () => {
        sounds.playScienceGlitch();
        recheckBtn.disabled = true;
        recheckBtn.innerHTML = `<span>🔬</span> Consulting satellite potatoes...`;

        setTimeout(() => {
          this.recheckScience();
          recheckBtn.disabled = false;
          recheckBtn.innerHTML = `<span>🔬</span> RECHECK SCIENCE`;
          sounds.playFanfare();
          this.showToast("Science successfully recalculated (still 100% wrong)!");
        }, 500);
      });

      favBtn.addEventListener("click", () => {
        if (this.activeModalAnimal) {
          this.toggleFavorite(this.activeModalAnimal.id);
        }
      });

      const whyModal = document.getElementById("why-exist-modal");
      const whyClose = document.getElementById("why-close-btn");
      const whyAccept = document.getElementById("why-accept-btn");

      whyClose.addEventListener("click", () => this.closeWhyModal());
      whyAccept.addEventListener("click", () => this.closeWhyModal());
      whyModal.addEventListener("click", (e) => {
        if (e.target === whyModal) this.closeWhyModal();
      });
    }

    openAnimalModal(animal) {
      this.activeModalAnimal = animal;
      const modal = document.getElementById("animal-modal");

      document.getElementById("modal-emoji").textContent = animal.emoji;
      document.getElementById("modal-name").textContent = animal.name;
      document.getElementById("modal-sci-name").textContent = animal.fakeScientificName;
      document.getElementById("modal-badge").textContent = animal.badge;

      document.getElementById("modal-weight").textContent = animal.fakeWeight;
      document.getElementById("modal-height").textContent = animal.fakeHeight;
      document.getElementById("modal-speed").textContent = animal.fakeSpeed;
      document.getElementById("modal-diet").textContent = animal.fakeDiet;
      document.getElementById("modal-habitat").textContent = animal.fakeHabitat;
      document.getElementById("modal-lifespan").textContent = animal.fakeLifespan;
      document.getElementById("modal-superpower").textContent = animal.specialAbility;
      document.getElementById("modal-hat").textContent = animal.difficultyFindingHat;

      document.getElementById("modal-fill-sleep").style.width = `${animal.stats.sleepiness}%`;
      document.getElementById("modal-val-sleep").textContent = `${animal.stats.sleepiness}%`;

      document.getElementById("modal-fill-pizza").style.width = `${animal.stats.pizzaCompatibility}%`;
      document.getElementById("modal-val-pizza").textContent = `${animal.stats.pizzaCompatibility}%`;

      document.getElementById("modal-fill-gaming").style.width = `${animal.stats.gamingSkill}%`;
      document.getElementById("modal-val-gaming").textContent = `${animal.stats.gamingSkill}%`;

      document.getElementById("modal-val-brain").textContent = animal.brainPower;

      this.updateModalConfidence(animal.scientificConfidence);
      this.updateModalFavoriteBtn();
      modal.classList.add("open");
    }

    updateModalFavoriteBtn() {
      const favBtn = document.getElementById("modal-favorite-btn");
      if (!this.activeModalAnimal) return;
      const isFav = this.favorites.includes(this.activeModalAnimal.id);
      favBtn.innerHTML = isFav 
        ? `<span>💔</span> Remove from Favorites`
        : `<span>❤️</span> Add to Completely Unnecessary Favorites`;
    }

    updateModalConfidence(val) {
      document.getElementById("modal-confidence-score").textContent = `${val}%`;
      document.getElementById("modal-confidence-bar").style.width = `${Math.min(val, 100)}%`;
    }

    recheckScience() {
      if (!this.activeModalAnimal) return;
      const randomSet = RANDOM_RECHECK_FACTS[Math.floor(Math.random() * RANDOM_RECHECK_FACTS.length)];

      document.getElementById("modal-weight").textContent = randomSet.weight;
      document.getElementById("modal-height").textContent = randomSet.height;
      document.getElementById("modal-speed").textContent = randomSet.speed;
      this.updateModalConfidence(randomSet.confidence);
      document.getElementById("modal-confidence-verdict").textContent = `Recalibrated: ${randomSet.notes}`;
    }

    closeAnimalModal() {
      document.getElementById("animal-modal").classList.remove("open");
      this.activeModalAnimal = null;
    }

    openWhyModal() {
      document.getElementById("why-exist-modal").classList.add("open");
    }

    closeWhyModal() {
      document.getElementById("why-exist-modal").classList.remove("open");
    }

    // ==========================================================================
    // TOAST NOTIFICATIONS
    // ==========================================================================
    showToast(message) {
      const toast = document.getElementById("toast-notification");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
    }
  }

  // Start Application on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const app = new UselessZooApp();
    app.init();
  });
})();
