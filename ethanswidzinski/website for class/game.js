// SOULFORGED: UNLEASHED - game.js

const FIGHTERS = [
  {
    id: "ignis",
    name: "Kaelen Ignis",
    icon: "🔥",
    color: "#ff5722",
    description: "Pyromancer striker with high burst damage and fiery projectiles.",
    maxHp: 100,
    speed: 6.2,
    jumpForce: 15.5,
    punch: { damage: 8, range: 110, cooldown: 320, meter: 10, label: "PYRO JAB" },
    kick: { damage: 13, range: 135, cooldown: 520, meter: 15, label: "FLAME KICK" },
    abilities: {
      q: { name: "Ember Bolt", cost: 20, damage: 14, projectile: true, speed: 11, color: "#ff7043" },
      e: { name: "Inferno Dash", cost: 25, damage: 16, dash: 150, color: "#ff9800" },
      r: { name: "Solar Flare", cost: 35, damage: 22, range: 210, color: "#ff3d00" }
    },
    ultimate: { name: "Cataclysm Nova", damage: 38, range: 280, color: "#ff1744" }
  },
  {
    id: "void",
    name: "Nyra Void",
    icon: "💜",
    color: "#ab47bc",
    description: "Shadow duelist with fast mobility, rift strikes, and dark blasts.",
    maxHp: 95,
    speed: 6.9,
    jumpForce: 16.2,
    punch: { damage: 7, range: 105, cooldown: 270, meter: 11, label: "SHADOW STRIKE" },
    kick: { damage: 12, range: 130, cooldown: 460, meter: 15, label: "VOID SWEEP" },
    abilities: {
      q: { name: "Abyss Orb", cost: 20, damage: 13, projectile: true, speed: 12, color: "#ce93d8" },
      e: { name: "Phase Step", cost: 25, damage: 15, dash: 165, color: "#8e24aa" },
      r: { name: "Rift Burst", cost: 35, damage: 21, range: 200, color: "#d500f9" }
    },
    ultimate: { name: "Event Horizon", damage: 36, range: 275, color: "#aa00ff" }
  },
  {
    id: "aegis",
    name: "Thorne Aegis",
    icon: "⚡",
    color: "#29b6f6",
    description: "Storm juggernaut with heavy armor, shockwaves, and thunder slams.",
    maxHp: 115,
    speed: 5.4,
    jumpForce: 14.5,
    punch: { damage: 10, range: 115, cooldown: 380, meter: 11, label: "THUNDER FIST" },
    kick: { damage: 15, range: 140, cooldown: 580, meter: 16, label: "STATIC CRUSH" },
    abilities: {
      q: { name: "Arc Bolt", cost: 20, damage: 15, projectile: true, speed: 11.5, color: "#4fc3f7" },
      e: { name: "Volt Charge", cost: 25, damage: 18, dash: 140, color: "#00e5ff" },
      r: { name: "Tempest Slam", cost: 35, damage: 24, range: 220, color: "#00b0ff" }
    },
    ultimate: { name: "Judgment Sky", damage: 40, range: 290, color: "#2979ff" }
  },
  {
    id: "verdant",
    name: "Sylva Verdant",
    icon: "🌿",
    color: "#66bb6a",
    description: "Spirit warden balancing range, quick combos, and nature surges.",
    maxHp: 105,
    speed: 6.0,
    jumpForce: 15.8,
    punch: { damage: 8, range: 115, cooldown: 300, meter: 11, label: "THORN JAB" },
    kick: { damage: 13, range: 140, cooldown: 500, meter: 15, label: "BRIAR KICK" },
    abilities: {
      q: { name: "Spirit Seed", cost: 20, damage: 14, projectile: true, speed: 10.5, color: "#81c784" },
      e: { name: "Vine Lunge", cost: 25, damage: 16, dash: 155, color: "#43a047" },
      r: { name: "Wild Growth", cost: 35, damage: 22, range: 215, color: "#00e676" }
    },
    ultimate: { name: "Ancient Wrath", damage: 37, range: 285, color: "#00c853" }
  }
];

// DOM References
const selectScreen = document.getElementById("select-screen");
const battleScreen = document.getElementById("battle-screen");
const victoryScreen = document.getElementById("victory-screen");

const gameModeSelect = document.getElementById("game-mode");
const p1Portrait = document.getElementById("p1-portrait");
const p1NameEl = document.getElementById("p1-name");
const p1DescEl = document.getElementById("p1-description");
const p1OptionsEl = document.getElementById("p1-options");

const p2SelectTitle = document.getElementById("p2-select-title");
const p2Portrait = document.getElementById("p2-portrait");
const p2NameEl = document.getElementById("p2-name");
const p2DescEl = document.getElementById("p2-description");
const p2OptionsEl = document.getElementById("p2-options");

const startButton = document.getElementById("start-button");
const quitButton = document.getElementById("quit-button");
const rematchButton = document.getElementById("rematch-button");
const selectAgainButton = document.getElementById("select-again-button");

const stageEl = document.getElementById("stage");
const fightAnnouncer = document.getElementById("fight-announcer");

const hud = {
  p1Name: document.getElementById("hud-p1-name"),
  p2Name: document.getElementById("hud-p2-name"),
  p1Health: document.getElementById("p1-health"),
  p2Health: document.getElementById("p2-health"),
  p1Meter: document.getElementById("p1-meter"),
  p2Meter: document.getElementById("p2-meter"),
  p1Status: document.getElementById("p1-status"),
  p2Status: document.getElementById("p2-status"),
  p1Controls: document.getElementById("p1-controls"),
  p2Controls: document.getElementById("p2-controls")
};

const winnerPortrait = document.getElementById("winner-portrait");
const winnerNameEl = document.getElementById("winner-name");
const victoryMessageEl = document.getElementById("victory-message");

// Game State
let selectedP1 = null;
let selectedP2 = null;
let gameMode = "bot"; // "bot" | "pvp"
let matchActive = false;
let matchEnded = false;
let animFrameId = null;
let botThinkTimer = 0;

const keys = new Set();
const projectiles = [];

let fightersState = {
  p1: null,
  p2: null
};

// Screen Management
function showScreen(screen) {
  [selectScreen, battleScreen, victoryScreen].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

// Character Select Setup
function renderFighterOptions() {
  p1OptionsEl.innerHTML = "";
  p2OptionsEl.innerHTML = "";

  FIGHTERS.forEach((fighter) => {
    const btn1 = document.createElement("button");
    btn1.type = "button";
    btn1.className = "fighter-choice";
    btn1.textContent = `${fighter.icon} ${fighter.name}`;
    btn1.addEventListener("click", () => selectFighter(1, fighter));
    p1OptionsEl.appendChild(btn1);

    const btn2 = document.createElement("button");
    btn2.type = "button";
    btn2.className = "fighter-option";
    btn2.textContent = `${fighter.icon} ${fighter.name}`;
    btn2.addEventListener("click", () => selectFighter(2, fighter));
    p2OptionsEl.appendChild(btn2);
  });
}

function selectFighter(playerNum, fighter) {
  if (playerNum === 1) {
    selectedP1 = fighter;
    p1Portrait.innerHTML = `<span>${fighter.icon}</span>`;
    p1Portrait.style.borderColor = fighter.color;
    p1NameEl.textContent = fighter.name;
    p1DescEl.textContent = fighter.description;
    highlightSelection(p1OptionsEl, fighter.id);
  } else {
    selectedP2 = fighter;
    p2Portrait.innerHTML = `<span>${fighter.icon}</span>`;
    p2Portrait.style.borderColor = fighter.color;
    p2NameEl.textContent = fighter.name;
    p2DescEl.textContent = fighter.description;
    highlightSelection(p2OptionsEl, fighter.id);
  }

  updateStartButton();
}

function highlightSelection(container, fighterId) {
  const buttons = container.querySelectorAll(".fighter-option");
  buttons.forEach((btn, idx) => {
    btn.classList.toggle("selected", FIGHTERS[idx].id === fighterId);
  });
}

function updateStartButton() {
  const valid = Boolean(selectedP1 && selectedP2 && selectedP1.id !== selectedP2.id);
  startButton.disabled = !valid;
}

gameModeSelect.addEventListener("change", (e) => {
  gameMode = e.target.value;
  if (gameMode === "bot") {
    p2SelectTitle.textContent = "CPU OPPONENT";
    hud.p2Controls.textContent = "P2: CPU CONTROLLED";
  } else {
    p2SelectTitle.textContent = "PLAYER 2";
    hud.p2Controls.textContent =
      "P2: ARROWS MOVE · J PUNCH · K KICK · U/I/O ABILITIES · M ULTIMATE";
  }
});

startButton.addEventListener("click", () => {
  if (!selectedP1 || !selectedP2 || selectedP1.id === selectedP2.id) return;
  startMatch();
});

quitButton.addEventListener("click", () => {
  endLoop();
  matchActive = false;
  clearProjectiles();
  showScreen(selectScreen);
});

rematchButton.addEventListener("click", () => {
  startMatch();
});

selectAgainButton.addEventListener("click", () => {
  endLoop();
  matchActive = false;
  clearProjectiles();
  showScreen(selectScreen);
});

// Fighter Instance Creation
function createFighterState(slot, data, startX, facing) {
  const el = document.getElementById(slot === 1 ? "player1" : "player2");
  const bodyEl = el.querySelector(".fighter-body");
  const auraEl = el.querySelector(".fighter-aura");

  bodyEl.textContent = data.icon;
  auraEl.style.backgroundColor = data.color;
  el.style.left = `${startX}px`;
  el.style.bottom = "80px";
  el.style.transform = `scaleX(${facing})`;

  return {
    slot,
    data,
    el,
    bodyEl,
    auraEl,
    x: startX,
    y: 0, // height above ground
    vx: 0,
    vy: 0,
    facing, // 1 right, -1 left
    hp: data.maxHp,
    maxHp: data.maxHp,
    meter: 0,
    maxMeter: 100,
    grounded: true,
    lastPunchTime: 0,
    lastKickTime: 0,
    attackLockUntil: 0,
    hurtUntil: 0,
    statusText: "READY"
  };
}

function startMatch() {
  endLoop();
  clearProjectiles();
  matchEnded = false;
  matchActive = false;
  botThinkTimer = 0;

  const stageWidth = stageEl.clientWidth || 800;
  const p1Start = Math.max(80, Math.min(220, stageWidth * 0.22));
  const p2Start = Math.max(300, Math.min(stageWidth - 280, stageWidth * 0.78));

  fightersState.p1 = createFighterState(1, selectedP1, p1Start, 1);
  fightersState.p2 = createFighterState(2, selectedP2, p2Start, -1);

  hud.p1Name.textContent = `${selectedP1.name} (P1)`;
  hud.p2Name.textContent =
    gameMode === "bot" ? `${selectedP2.name} (CPU)` : `${selectedP2.name} (P2)`;

  updateHud();
  showScreen(battleScreen);

  fightAnnouncer.textContent = "READY...";
  fightAnnouncer.classList.remove("hidden");

  setTimeout(() => {
    if (battleScreen.classList.contains("hidden")) return;
    fightAnnouncer.textContent = "FIGHT!";
    matchActive = true;
    setTimeout(() => {
      fightAnnouncer.classList.add("hidden");
    }, 700);
  }, 850);

  animFrameId = requestAnimationFrame(gameLoop);
}

function endLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function clearProjectiles() {
  while (projectiles.length > 0) {
    const p = projectiles.pop();
    if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
  }
}

// Input Handling
window.addEventListener("keydown", (e) => {
  const code = e.code;
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space"
    ].includes(code)
  ) {
    e.preventDefault();
  }

  const firstPress = !keys.has(code);
  keys.add(code);

  if (!matchActive || matchEnded || !firstPress) return;

  const p1 = fightersState.p1;
  const p2 = fightersState.p2;

  // Player 1 Action Keys
  if (code === "KeyW") jump(p1);
  if (code === "KeyF") performBasicAttack(p1, p2, "punch");
  if (code === "KeyG") performBasicAttack(p1, p2, "kick");
  if (code === "KeyQ") performAbility(p1, p2, "q");
  if (code === "KeyE") performAbility(p1, p2, "e");
  if (code === "KeyR") performAbility(p1, p2, "r");
  if (code === "KeyT") performUltimate(p1, p2);

  // Player 2 Action Keys (PvP only)
  if (gameMode === "pvp") {
    if (code === "ArrowUp") jump(p2);
    if (code === "KeyJ") performBasicAttack(p2, p1, "punch");
    if (code === "KeyK") performBasicAttack(p2, p1, "kick");
    if (code === "KeyU") performAbility(p2, p1, "q");
    if (code === "KeyI") performAbility(p2, p1, "e");
    if (code === "KeyO") performAbility(p2, p1, "r");
    if (code === "KeyM") performUltimate(p2, p1);
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});

// Combat Actions
function jump(fighter) {
  if (!fighter.grounded || performance.now() < fighter.hurtUntil) return;
  fighter.vy = fighter.data.jumpForce;
  fighter.grounded = false;
  fighter.statusText = "AIRBORNE";
}

function gainMeter(fighter, amount) {
  fighter.meter = Math.min(fighter.maxMeter, Math.max(0, fighter.meter + amount));
}

function performBasicAttack(attacker, defender, type) {
  const now = performance.now();
  if (now < attacker.attackLockUntil || now < attacker.hurtUntil) return;

  const move = type === "punch" ? attacker.data.punch : attacker.data.kick;
  const lastTime = type === "punch" ? attacker.lastPunchTime : attacker.lastKickTime;
  if (now - lastTime < move.cooldown) return;

  if (type === "punch") attacker.lastPunchTime = now;
  else attacker.lastKickTime = now;

  attacker.attackLockUntil = now + 200;
  attacker.statusText = move.label;
  gainMeter(attacker, move.meter);
  animateLunge(attacker, type === "punch" ? 14 : 22);

  const dx = (defender.x - attacker.x) * attacker.facing;
  const dy = Math.abs(defender.y - attacker.y);
  if (dx >= -25 && dx <= move.range && dy < 85) {
    applyDamage(attacker, defender, move.damage, attacker.facing * (type === "punch" ? 6 : 11), 6);
  }
}

function performAbility(attacker, defender, slotKey) {
  const now = performance.now();
  if (now < attacker.attackLockUntil || now < attacker.hurtUntil) return;

  const abil = attacker.data.abilities[slotKey];
  if (!abil || attacker.meter < abil.cost) return;

  attacker.meter -= abil.cost;
  attacker.attackLockUntil = now + 260;
  attacker.statusText = abil.name.toUpperCase();

  if (abil.projectile) {
    spawnProjectile(attacker, abil);
    return;
  }

  if (abil.dash) {
    attacker.vx = attacker.facing * 14;
    animateLunge(attacker, 28);
    const distance = Math.abs(defender.x - attacker.x);
    const dy = Math.abs(defender.y - attacker.y);
    if (distance <= abil.dash + 60 && dy < 90) {
      applyDamage(attacker, defender, abil.damage, attacker.facing * 13, 8);
    }
    return;
  }

  // Area / burst ability
  const distance = Math.abs(defender.x - attacker.x);
  const dy = Math.abs(defender.y - attacker.y);
  spawnShockwave(attacker.x + attacker.facing * 45, attacker.y + 35, abil.color, abil.range);
  if (distance <= abil.range && dy < 110) {
    applyDamage(attacker, defender, abil.damage, attacker.facing * 14, 9);
  }
}

function performUltimate(attacker, defender) {
  const now = performance.now();
  if (now < attacker.attackLockUntil || now < attacker.hurtUntil) return;
  if (attacker.meter < attacker.maxMeter) return;

  const ult = attacker.data.ultimate;
  attacker.meter = 0;
  attacker.attackLockUntil = now + 420;
  attacker.statusText = `ULT: ${ult.name.toUpperCase()}`;

  fightAnnouncer.textContent = `${ult.name.toUpperCase()}!`;
  fightAnnouncer.classList.remove("hidden");
  setTimeout(() => fightAnnouncer.classList.add("hidden"), 750);

  spawnShockwave(attacker.x + attacker.facing * 60, attacker.y + 40, ult.color, ult.range);

  const distance = Math.abs(defender.x - attacker.x);
  const dy = Math.abs(defender.y - attacker.y);
  if (distance <= ult.range && dy < 140) {
    applyDamage(attacker, defender, ult.damage, attacker.facing * 18, 12);
  }
}

function applyDamage(attacker, defender, amount, knockbackX, knockbackY) {
  defender.hp = Math.max(0, defender.hp - amount);
  defender.vx = knockbackX;
  if (knockbackY > 0) {
    defender.vy = Math.max(defender.vy, knockbackY);
    defender.grounded = false;
  }
  defender.hurtUntil = performance.now() + 240;
  defender.statusText = `-${amount} HP`;
  gainMeter(defender, Math.round(amount * 0.45));

  flashHit(defender);
  updateHud();

  if (defender.hp <= 0 && !matchEnded) {
    finishMatch(attacker, defender);
  }
}

function flashHit(target) {
  target.el.style.filter = "brightness(1.8)";
  setTimeout(() => {
    if (target.el) target.el.style.filter = "";
  }, 110);
}

function animateLunge(fighter, offset) {
  fighter.el.style.marginLeft = `${fighter.facing * offset}px`;
  setTimeout(() => {
    if (fighter.el) fighter.el.style.marginLeft = "0px";
  }, 130);
}

function spawnProjectile(owner, abil) {
  const el = document.createElement("div");
  el.className = "projectile";
  el.style.position = "absolute";
  el.style.width = "22px";
  el.style.height = "22px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = abil.color;
  el.style.boxShadow = `0 0 14px ${abil.color}`;
  el.style.bottom = `${80 + owner.y + 34}px`;
  const startX = owner.x + (owner.facing === 1 ? 52 : -22);
  el.style.left = `${startX}px`;
  stageEl.appendChild(el);

  projectiles.push({
    owner,
    x: startX,
    y: owner.y + 34,
    vx: owner.facing * abil.speed,
    damage: abil.damage,
    el
  });
}

function spawnShockwave(x, y, color, radius) {
  const wave = document.createElement("div");
  wave.style.position = "absolute";
  wave.style.left = `${x - 24}px`;
  wave.style.bottom = `${80 + y - 24}px`;
  wave.style.width = "48px";
  wave.style.height = "48px";
  wave.style.borderRadius = "50%";
  wave.style.border = `3px solid ${color}`;
  wave.style.boxShadow = `0 0 18px ${color}`;
  wave.style.pointerEvents = "none";
  wave.style.transition = "transform 240ms ease-out, opacity 240ms ease-out";
  stageEl.appendChild(wave);

  requestAnimationFrame(() => {
    const scale = Math.min(4.5, radius / 60);
    wave.style.transform = `scale(${scale})`;
    wave.style.opacity = "0";
  });

  setTimeout(() => {
    if (wave.parentNode) wave.parentNode.removeChild(wave);
  }, 260);
}

// CPU Bot Logic
function updateBot(bot, opponent, now) {
  if (now < bot.hurtUntil) return;

  const dx = opponent.x - bot.x;
  const dist = Math.abs(dx);
  bot.facing = dx >= 0 ? 1 : -1;

  if (dist > 125) {
    bot.vx = bot.facing * (bot.data.speed * 0.85);
    if (bot.grounded && Math.random() < 0.012) {
      jump(bot);
    }
  } else {
    bot.vx *= 0.6;
  }

  botThinkTimer -= 16;
  if (botThinkTimer > 0) return;
  botThinkTimer = 260 + Math.random() * 240;

  if (bot.meter >= bot.maxMeter && dist < bot.data.ultimate.range) {
    performUltimate(bot, opponent);
    return;
  }

  if (dist > 220 && bot.meter >= bot.data.abilities.q.cost && Math.random() < 0.55) {
    performAbility(bot, opponent, "q");
    return;
  }

  if (dist <= 135) {
    const roll = Math.random();
    if (roll < 0.42) performBasicAttack(bot, opponent, "punch");
    else if (roll < 0.72) performBasicAttack(bot, opponent, "kick");
    else if (roll < 0.88 && bot.meter >= bot.data.abilities.e.cost) {
      performAbility(bot, opponent, "e");
    } else if (bot.meter >= bot.data.abilities.r.cost) {
      performAbility(bot, opponent, "r");
    }
  }
}

// Physics & Loop
function updateFighterPhysics(fighter, now) {
  if (now >= fighter.hurtUntil && now >= fighter.attackLockUntil) {
    fighter.vx *= 0.72;
    if (Math.abs(fighter.vx) < 0.15) fighter.vx = 0;
  }

  fighter.x += fighter.vx;

  // Gravity & Vertical Movement
  if (!fighter.grounded || fighter.vy > 0) {
    fighter.y += fighter.vy;
    fighter.vy -= 0.75;
    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.vy = 0;
      fighter.grounded = true;
      if (now >= fighter.attackLockUntil && now >= fighter.hurtUntil) {
        fighter.statusText = "READY";
      }
    }
  }

  const maxX = Math.max(120, (stageEl.clientWidth || 800) - 70);
  fighter.x = Math.max(24, Math.min(maxX, fighter.x));

  fighter.el.style.left = `${fighter.x}px`;
  fighter.el.style.bottom = `${80 + fighter.y}px`;
  fighter.el.style.transform = `scaleX(${fighter.facing})`;
}

function updateProjectiles() {
  const stageWidth = stageEl.clientWidth || 800;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx;
    p.el.style.left = `${p.x}px`;

    const target = p.owner.slot === 1 ? fightersState.p2 : fightersState.p1;
    const hitX = Math.abs(p.x - target.x) < 42;
    const hitY = Math.abs(p.y - (target.y + 35)) < 48;

    if (hitX && hitY && !matchEnded) {
      const dir = Math.sign(p.vx) || 1;
      applyDamage(p.owner, target, p.damage, dir * 9, 4);
      p.el.remove();
      projectiles.splice(i, 1);
      continue;
    }

    if (p.x < -40 || p.x > stageWidth + 40) {
      p.el.remove();
      projectiles.splice(i, 1);
    }
  }
}

function updateHud() {
  const { p1, p2 } = fightersState;
  if (!p1 || !p2) return;

  const p1HpPct = Math.max(0, (p1.hp / p1.maxHp) * 100);
  const p2HpPct = Math.max(0, (p2.hp / p2.maxHp) * 100);

  hud.p1Health.style.width = `${p1HpPct}%`;
  hud.p2Health.style.width = `${p2HpPct}%`;

  hud.p1Meter.style.width = `${(p1.meter / p1.maxMeter) * 100}%`;
  hud.p2Meter.style.width = `${(p2.meter / p2.maxMeter) * 100}%`;

  hud.p1Status.textContent = p1.meter >= p1.maxMeter ? "ULTIMATE READY!" : p1.statusText;
  hud.p2Status.textContent = p2.meter >= p2.maxMeter ? "ULTIMATE READY!" : p2.statusText;
}

function gameLoop(now) {
  if (!matchEnded) {
    const p1 = fightersState.p1;
    const p2 = fightersState.p2;

    if (matchActive && p1 && p2) {
      // Face opponent when idle/moving
      if (now >= p1.attackLockUntil && now >= p1.hurtUntil) {
        p1.facing = p2.x >= p1.x ? 1 : -1;
        if (keys.has("KeyA")) p1.vx = -p1.data.speed;
        if (keys.has("KeyD")) p1.vx = p1.data.speed;
      }

      if (gameMode === "pvp") {
        if (now >= p2.attackLockUntil && now >= p2.hurtUntil) {
          p2.facing = p1.x >= p2.x ? 1 : -1;
          if (keys.has("ArrowLeft")) p2.vx = -p2.data.speed;
          if (keys.has("ArrowRight")) p2.vx = p2.data.speed;
        }
      } else {
        updateBot(p2, p1, now);
      }
    }

    if (p1) updateFighterPhysics(p1, now);
    if (p2) updateFighterPhysics(p2, now);
    updateProjectiles();
    updateHud();
  }

  animFrameId = requestAnimationFrame(gameLoop);
}

function finishMatch(winner, loser) {
  matchEnded = true;
  matchActive = false;

  fightAnnouncer.textContent = "K.O.!";
  fightAnnouncer.classList.remove("hidden");

  setTimeout(() => {
    endLoop();
    clearProjectiles();
    fightAnnouncer.classList.add("hidden");

    winnerPortrait.innerHTML = `<span>${winner.data.icon}</span>`;
    winnerPortrait.style.borderColor = winner.data.color;
    winnerNameEl.textContent = winner.data.name;
    victoryMessageEl.textContent = `${winner.data.name} defeated ${loser.data.name} with ${winner.hp} HP remaining!`;

    showScreen(victoryScreen);
  }, 1100);
}

// Initialize
renderFighterOptions();
showScreen(selectScreen);
