// =============================================================
// 1. ЛОВУШКА ОШИБОК И ЗВУК
// =============================================================
const debugConsole = document.getElementById('debug-console');

window.onerror = function(msg, source, lineno) {
    if (debugConsole) {
        debugConsole.style.display = 'block';
        debugConsole.innerHTML += `<div class="error-msg">❌ ${msg} (стр. ${lineno})</div>`;
    }
    return false;
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = new AudioContext();

function playSound(type) {
    if (!isSoundOn) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'click') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(800, now); 
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); 
        osc.stop(now + 0.1);
    } else if (type === 'money') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(1200, now); 
        osc.frequency.setValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); 
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); 
        osc.stop(now + 0.3);
    } else if (type === 'win') {
        playNote(523.25, now, 0.1); 
        playNote(659.25, now + 0.1, 0.1); 
        playNote(783.99, now + 0.2, 0.4);
    } else if (type === 'legendary') {
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(200, now); 
        osc.frequency.linearRampToValueAtTime(600, now + 1);
        gainNode.gain.setValueAtTime(0.3, now); 
        gainNode.gain.linearRampToValueAtTime(0.01, now + 1.5);
        osc.start(now); 
        osc.stop(now + 1.5);
    }
}

function playNote(freq, time, duration) {
    const osc = audioCtx.createOscillator(); 
    const gain = audioCtx.createGain();
    
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, time); 
    gain.gain.linearRampToValueAtTime(0.01, time + duration);
    
    osc.start(time); 
    osc.stop(time + duration);
}

// =============================================================
// 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =============================================================
const API_URL = "https://focushatcher-ondey.amvera.io"; 
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 
let modalStack = [];

// Основной прогресс
let collection = [];
let userXP = 0;
let userLevel = 1;
let walletBalance = 0;
let userStars = 0;
let pegasusShards = 0;
let userJokers = 0; 

// Инвентарь и настройки
let ownedItems = { themes: ['default'], eggs: ['default'] };
let activeTheme = 'default';
let activeEggSkin = 'default';
let selectedAvatar = 'default';
let userStats = { hatched: 0, earned: 0, invites: 0, crafts: 0 };
let myBoosters = { luck: 0, speed: 0, bio: 0 };
let claimedAchievements = [];
let claimedQuests = [];
let usedCodes = [];
let isVibrationOn = true;
let isSoundOn = false;

// Таймеры и механики
let vipEndTime = 0;
let hasSecondSlot = false;
let secondSlotEndTime = 0;
let localSaveTime = 0; 
let currentModeIndex = 0;
let timerInterval = null;
let isRunning = false;
let timeLeft = 10;
let activeBoosters = { luck: false, speed: false, bio: false };
let currentHatchMode = 'none'; 
let currentShopTab = 'themes';
let currentAchTab = 'achievements';
let selectedPet = null;
let customEggConfig = { target: 'all', timeOnline: 3600, timeOffline: 5 * 3600 };
let resurrectCountdownInterval = null;
let secondSlotInterval = null;

// Мультиплеер (Пати)
let currentPartyCode = null;
let partyPollingInterval = null;
let isPartyLeader = false;
let currentActiveGame = 'none';
let currentPartyPlayersData = [];
let invitesPollingInterval = null;
let currentPendingInviteId = null;

// Босс-Рейд и Экспедиция
let currentExpeditionLocation = 'forest'; 
let currentExpeditionEndTime = 0; 
let bossTimerInterval = null; 
let bossTimeLeft = 60; 
let bossIsDead = false;
let expeditionInterval = null;
let bonusSpawningInterval = null;
let currentWolfHp = 0;
let isMegaRadarActive = false; 

// Рулетка и Forbes
let lastRouletteDate = ""; 
let boxAdsProgress = { epic: 0, mythic: 0 };
let currentBoxType = 'base';
let secretTaps = 0;
let secretTapTimer = null;
let forbesDataCache = null;
let currentForbesTab = 'global';

// Новые механики (ДНК, Паразиты, Уровни петов, Контракты)
let dnaGrid = [];
let isStunned = false;
let parasiteInterval = null;
let petStars = {}; 
let activeContracts = { date: '', tasks: [] }; 

// Рынок
let currentMarketTab = 'all';
let selectedPetForSale = null;

// =============================================================
// БЕЗОПАСНЫЙ ПАРСИНГ ДАННЫХ (ЗАЩИТА)
// =============================================================
function safeParse(val, def) {
    if (!val || val === 'undefined' || val === 'null') {
        return def;
    }
    try { 
        return JSON.parse(val); 
    } catch(e) { 
        return def; 
    }
}

// =============================================================
// 3. БАЗЫ ДАННЫХ И КОНСТАНТЫ
// =============================================================
const MODES = [
    { id: 'short', timeOnline: 25 * 60, timeOffline: 6 * 3600, xpReward: 250, egg: 'default', title: 'Базовое Яйцо (25 мин)', sub: 'Шанс Легендарки: 1%', reqLevel: 1 },
    { id: 'long', timeOnline: 60 * 60, timeOffline: 12 * 3600, xpReward: 1000, egg: 'diamond', title: 'Алмазное (60 мин)', sub: 'Шанс Легендарки: 5% 🔥', reqLevel: 3 },
    { id: 'custom', timeOnline: 3600, timeOffline: 5 * 3600, xpReward: 500, egg: 'default', title: 'Кастомное яйцо', sub: 'Настрой редкость', reqLevel: 5 },
    { id: 'alien', timeOnline: 2 * 3600, timeOffline: 14 * 3600, xpReward: 3000, egg: 'glitch', title: 'Инопланетное (2 ч)', sub: 'Только Легенды и Мифики', reqLevel: 30 },
    { id: 'radio', timeOnline: 5 * 60, timeOffline: 1 * 3600, xpReward: 500, egg: 'glow', title: 'Радиоактивное (5 мин)', sub: 'Только Мутанты ☢️ (Нужен бустер 💉)', reqLevel: 50 }
];

const PRICES = { 
    common: 15, 
    rare: 150, 
    legendary: 5000, 
    mythic: 50000, 
    mutant: 10000 
};

const RANKS = [
    "Новичок", 
    "Искатель", 
    "Укротитель", 
    "Мастер", 
    "Ниндзя", 
    "Легенда", 
    "Мифик", 
    "Создатель"
];

const PET_NAMES = {
    "chick": "Цыпленок", 
    "kitten": "Котенок", 
    "puppy": "Щенок", 
    "hamster": "Хомяк", 
    "bunny": "Зайчик",
    "frog": "Лягушка", 
    "bear": "Мишка", 
    "koala": "Коала", 
    "duck": "Утенок", 
    "caterpillar": "Гусеница",
    "fox": "Лисенок", 
    "panda": "Панда", 
    "tiger": "Тигренок", 
    "lion": "Львенок", 
    "cow": "Коровка",
    "pig": "Свинка", 
    "monkey": "Обезьянка", 
    "owl": "Сова",
    "unicorn": "Единорог", 
    "dragon": "Дракон", 
    "alien": "Пришелец", 
    "robot": "Робот", 
    "dino": "Динозавр",
    "fireball": "Огонек", 
    "god": "Бог Фокуса", 
    "pegasus": "Мифический Пегас",
    "cerberus": "Цербер", 
    "dark_dragon": "Темный Дракон",
    "mutant_cat": "Мутакот ☢️", 
    "mutant_dog": "Токси-Пёс ☢️", 
    "mutant_dragon": "Гамма-Ящер ☢️"
};

const LEVEL_REWARDS = {
    1: { title: "Новичок", reward: null },
    5: { title: "Искатель", reward: "1000 монет" },
    10: { title: "Укротитель", reward: "5000 монет" },
    20: { title: "Мастер", reward: "10000 монет" },
    50: { title: "Легенда", reward: "Уникальный: <img src='assets/pets/pet-god.png' style='width:24px;vertical-align:middle'> God" },
    75: { title: "Мифик", reward: "Уникальный: Пегас" },
    100: { title: "Создатель", reward: "Уникальный: Властелин Времени" }
};

const petDatabase = {
    common: ["chick", "kitten", "puppy", "hamster", "bunny", "frog", "bear", "koala", "duck", "caterpillar"],
    rare: ["fox", "panda", "tiger", "lion", "cow", "pig", "monkey", "owl"],
    legendary: ["unicorn", "dragon", "alien", "robot", "dino", "fireball"],
    mythic: ["pegasus", "cerberus", "dark_dragon"],
    mutant: ["mutant_cat", "mutant_dog", "mutant_dragon"]
};

const ALL_PETS_FLAT = [
    ...petDatabase.common, 
    ...petDatabase.rare, 
    ...petDatabase.legendary, 
    ...petDatabase.mythic, 
    ...petDatabase.mutant, 
    "god"
];

const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

function getPetRarity(p) {
    if (p === "god") return 'legendary';
    if (petDatabase.mythic.includes(p)) return 'mythic';
    if (petDatabase.mutant.includes(p)) return 'mutant';
    if (petDatabase.legendary.includes(p)) return 'legendary';
    if (petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}

const ACHIEVEMENTS_DATA = [
    { id: 'first_hatch', title: 'Первый шаг', desc: 'Вырасти 1 питомца', goal: 1, reward: 100 },
    { id: 'rich_kid', title: 'Богач', desc: 'Заработай 1000', goal: 1000, type: 'money', reward: 500 },
    { id: 'collector', title: 'Коллекционер', desc: 'Собери 5 уникальных', goal: 5, type: 'unique', reward: 1000 },
    { id: 'hard_worker', title: 'Трудяга', desc: 'Вырасти 10 питомцев', goal: 10, reward: 2000 },
    { id: 'craft_unique', title: 'Алхимик', desc: 'Скрафтить уникального пета', goal: 1, type: 'craft', reward: 5000 },
    { id: 'money_25k', title: 'Магнат', desc: 'Накопить 25000', goal: 25000, type: 'money', reward: 10000 },
    { id: 'hatch_52', title: 'Заводчик', desc: 'Вырасти 52 питомца', goal: 52, type: 'hatch', reward: 5000 },
    { id: 'lvl_100', title: 'Мастер Времени', desc: 'Достигнуть 100 лвл', goal: 100, type: 'level', reward: 50000 }
];

const QUESTS_DATA = [
    { id: 'sub_channel', title: 'Подписка', desc: 'Подпишись на канал', reward: 1000, type: 'link', url: 'https://t.me/focushatch' },
    { id: 'invite_friends', title: 'Друзья', desc: 'Пригласи 5 друзей', reward: 2000, type: 'invite', goal: 5 }
];

const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма', price: 0, bgFile: null },
        { id: 'forest', name: 'Лес', price: 500, bgFile: 'assets/bg/bg-forest.jpg' },
        { id: 'space', name: 'Космос', price: 2000, bgFile: 'assets/bg/bg-space.jpg' },
        { id: 'neon', name: 'Неон', price: 5000, bgFile: 'assets/bg/bg-neon.jpg' },
        { id: 'gold', name: 'Мажор', price: 10000, bgFile: 'assets/bg/bg-gold.jpg' },
        { id: 'matrix', name: 'Матрица PRO', price: '100 ⭐️', isPremium: true, bgFile: null }
    ],
    eggs: [
        { id: 'default', name: 'Стандарт', price: 0, img: 'assets/eggs/egg-default.png' },
        { id: 'glow', name: 'Сияние', price: 1000, img: 'assets/eggs/egg-glow.png' },
        { id: 'ice', name: 'Лед', price: 3000, img: 'assets/eggs/egg-ice.png' },
        { id: 'glitch', name: 'Глюк', price: 7777, img: 'assets/eggs/egg-glitch.png' },
        { id: 'gold', name: 'Золото', price: 15000, img: 'assets/eggs/egg-gold.png' },
        { id: 'holo', name: 'Голограмма PRO', price: '100 ⭐️', isPremium: true, img: 'assets/eggs/egg-ice.png' }
    ],
    boosters: [
        { id: 'luck', name: 'Зелье Удачи', price: 4990, icon: 'assets/ui/booster-luck.png', desc: 'Шанс x5' },
        { id: 'speed', name: 'Ускоритель', price: 9990, icon: 'assets/ui/booster-speed.png', desc: 'Меньше времени' },
        { id: 'bio', name: 'Биодобавка 💉', price: '50 ⭐️', icon: '💉', desc: 'Мутант гарантирован' }
    ]
};

const DAILY_REWARDS = [
    { day: 1, type: 'money', val: 100 }, 
    { day: 2, type: 'money', val: 250 }, 
    { day: 3, type: 'money', val: 500 },
    { day: 4, type: 'money', val: 1000 }, 
    { day: 5, type: 'money', val: 2000 }, 
    { day: 6, type: 'booster', id: 'speed', val: 1 }, 
    { day: 7, type: 'mixed', money: 5000, booster: 'luck' }
];

const ROULETTE_PRIZES = {
    base: [
        { n: "1000 Монет", t: 'money', v: 1000, p: 40 },
        { n: "5000 Монет", t: 'money', v: 5000, p: 20 },
        { n: "Бустер Удачи", t: 'luck', v: 1, p: 15 },
        { n: "Ген Мутации", t: 'joker', v: 1, p: 10 },
        { n: "10 Звезд", t: 'stars', v: 10, p: 10 },
        { n: "Осколок Пегаса", t: 'shard', v: 1, p: 5 }
    ],
    epic: [
        { n: "5000 Монет", t: 'money', v: 5000, p: 35 },
        { n: "10000 Монет", t: 'money', v: 10000, p: 24 },
        { n: "Бустер Удачи x3", t: 'luck', v: 3, p: 15 },
        { n: "Ген Мутации x2", t: 'joker', v: 2, p: 15 },
        { n: "Осколок Пегаса", t: 'shard', v: 1, p: 10 },
        { n: "СЛУЧАЙНАЯ ЛЕГЕНДА!", t: 'legendary_random', v: 1, p: 1 }
    ],
    mythic: [
        { n: "15000 Монет", t: 'money', v: 15000, p: 30 },
        { n: "Ген Мутации x5", t: 'joker', v: 5, p: 25 },
        { n: "Осколок Пегаса x2", t: 'shard', v: 2, p: 20 },
        { n: "50 Звезд", t: 'stars', v: 50, p: 15 },
        { n: "Бог Фокуса", t: 'pet', v: 'god', p: 5 },
        { n: "СЛУЧАЙНАЯ ЛЕГЕНДА!", t: 'legendary_random', v: 1, p: 5 }
    ]
};

// =============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ UI
// =============================================================
function getEl(id) { 
    return document.getElementById(id); 
}

function formatTime(s) { 
    if (s >= 3600) {
        return `${Math.floor(s/3600)}ч ${Math.floor((s%3600)/60).toString().padStart(2,'0')}м`;
    }
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`; 
}

function getPetImg(id) { 
    return id === 'default' ? 'assets/ui/icon-profile.png' : `assets/pets/pet-${id}.png`; 
}

function hardReset() { 
    if (confirm("Сбросить все?")) { 
        localStorage.clear(); 
        location.reload(); 
    } 
}

function getTgUser() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        return { 
            id: String(window.Telegram.WebApp.initDataUnsafe.user.id), 
            name: window.Telegram.WebApp.initDataUnsafe.user.first_name 
        };
    }
    if (!localStorage.getItem('fake_uid')) {
        localStorage.setItem('fake_uid', 'user_' + Math.floor(Math.random() * 10000));
    }
    return { 
        id: localStorage.getItem('fake_uid'), 
        name: "Игрок" 
    };
}

function isVip() { 
    return Date.now() < vipEndTime; 
}

function openModal(id) {
    playSound('click');
    if (modalStack.length > 0 && modalStack[modalStack.length - 1] === id) return;
    
    if (modalStack.length > 0) {
        const prevEl = document.getElementById(modalStack[modalStack.length - 1]);
        if (prevEl) prevEl.style.display = 'none';
    }
    
    const el = document.getElementById(id);
    if (el) { 
        el.style.display = 'flex'; 
        modalStack.push(id); 
    }
}

function closeModal(id) {
    playSound('click');
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    
    modalStack = modalStack.filter(m => m !== id);
    
    if (modalStack.length > 0) {
        const prevEl = document.getElementById(modalStack[modalStack.length - 1]);
        if (prevEl) prevEl.style.display = 'flex';
    }
}

function showToast(msg, icon='🔔') {
    const c = getEl('toast-container'); 
    if (!c) return;
    
    const d = document.createElement('div');
    let content = icon === 'img' ? `<img src="assets/ui/coin.png"> <span>${msg}</span>` : `<span>${icon}</span> <span>${msg}</span>`;
    d.className = 'toast'; 
    d.innerHTML = content;
    
    c.appendChild(d); 
    setTimeout(() => { 
        d.classList.add('fade-out'); 
        setTimeout(() => d.remove(), 300); 
    }, 3000);
}

function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas'); 
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    
    let particles = [];
    const colors = ['#ff3b30', '#ffcc00', '#34c759', '#007aff', '#5856d6'];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, 
            y: canvas.height / 2, 
            w: Math.random() * 10 + 5, 
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 20, 
            vy: (Math.random() - 0.5) * 20 - 10, 
            grav: 0.5
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, index) => {
            p.x += p.vx; 
            p.y += p.vy; 
            p.vy += p.grav;
            ctx.fillStyle = p.color; 
            ctx.fillRect(p.x, p.y, p.w, p.h);
            if (p.y > canvas.height) particles.splice(index, 1);
        });
        if (particles.length > 0) {
            requestAnimationFrame(draw); 
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    draw();
}// =============================================================
// КОНТРАКТЫ И НАГРАДЫ
// =============================================================
function checkContracts() {
    const today = new Date().toDateString();
    if (activeContracts.date !== today) {
        const pools = [
            { t: 'hatch', g: 5, r: { t: 'money', v: 3000 }, d: 'Вырасти 5 петов' },
            { t: 'dmg', g: 1000, r: { t: 'stars', v: 15 }, d: 'Нанеси 1000 урона Боссу' },
            { t: 'craft', g: 2, r: { t: 'joker', v: 1 }, d: 'Сделай 2 синтеза' },
            { t: 'roulette', g: 3, r: { t: 'luck', v: 2 }, d: 'Покрути рулетку 3 раза' },
            { t: 'sell', g: 3, r: { t: 'money', v: 2000 }, d: 'Продай 3 пета' }
        ];
        
        let shuffled = pools.sort(() => 0.5 - Math.random()).slice(0, 3);
        activeContracts.date = today;
        activeContracts.tasks = shuffled.map(x => ({ ...x, p: 0, c: false }));
        saveData();
    }
}

function updateContract(type, val) {
    if (!activeContracts.tasks) return;
    
    let updated = false;
    activeContracts.tasks.forEach(t => {
        if (t.t === type && !t.c && t.p < t.g) {
            t.p += val;
            if (t.p > t.g) {
                t.p = t.g;
            }
            if (t.p === t.g && !t.notified) { 
                showToast('Контракт выполнен!', '📜'); 
                t.notified = true; 
                playSound('win');
            }
            updated = true;
        }
    });
    
    if (updated) {
        saveData();
    }
}

window.claimContract = function(idx) {
    let t = activeContracts.tasks[idx];
    if (t.c) return;
    
    t.c = true;
    if (t.r.t === 'money') walletBalance += t.r.v;
    if (t.r.t === 'stars') userStars += t.r.v;
    if (t.r.t === 'joker') userJokers += t.r.v;
    if (t.r.t === 'luck') {
        if (!myBoosters.luck) myBoosters.luck = 0;
        myBoosters.luck += t.r.v;
    }
    if (t.r.t === 'speed') {
        if (!myBoosters.speed) myBoosters.speed = 0;
        myBoosters.speed += t.r.v;
    }
    
    saveData(); 
    updateBalanceUI(); 
    renderQuests();
    showToast(`Награда получена!`, '🎁'); 
    playSound('money');
};

function checkTutorial() { 
    if (!localStorage.getItem('tutorialSeen')) {
        openModal('tutorial-modal'); 
    }
}

window.closeTutorial = function() { 
    localStorage.setItem('tutorialSeen', 'true'); 
    closeModal('tutorial-modal'); 
    checkDailyReward(); 
}

function checkDailyReward() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    let streak = parseInt(localStorage.getItem('dailyStreak')) || 0;
    
    if (lastLogin === today) return; 
    
    const yesterday = new Date(); 
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin !== yesterday.toDateString()) {
        streak = 0;
    }
    
    renderDailyModal(streak); 
    openModal('daily-modal'); 
    playSound('win'); 
}

function renderDailyModal(curr) {
    const g = getEl('daily-grid'); 
    if (!g) return;
    
    g.innerHTML = '';
    
    DAILY_REWARDS.forEach((r, i) => {
        const d = document.createElement('div');
        let st = ''; 
        if (i < curr) st = 'claimed'; 
        if (i === curr) st = 'active';
        
        d.className = `daily-item ${st}`;
        let iconHTML = '';
        
        if (r.type === 'money') {
            iconHTML = `<img src="assets/ui/coin.png" class="daily-icon-img">`;
        } else if (r.type === 'booster' && r.id === 'speed') {
            iconHTML = `<img src="assets/ui/booster-speed.png" class="daily-icon-img">`;
        } else if (r.type === 'mixed') {
            iconHTML = `<img src="assets/ui/icon-trophy.png" class="daily-icon-img">`; 
        }
        
        let v = (r.type === 'money' || r.type === 'mixed') ? `+${r.money || r.val}` : '+1 Буст';
        d.innerHTML = `<div class="daily-day">День ${r.day}</div>${iconHTML}<div class="daily-val">${v}</div>`;
        g.appendChild(d);
    });
}

window.claimDaily = function() {
    let s = parseInt(localStorage.getItem('dailyStreak')) || 0;
    const t = new Date().toDateString();
    const l = localStorage.getItem('lastLoginDate');
    const y = new Date(); 
    y.setDate(y.getDate() - 1);
    
    if (l && l !== y.toDateString()) {
        s = 0;
    }
    
    const r = DAILY_REWARDS[s];
    let bonusMult = isVip() ? 1.2 : 1;
    
    if (r.type === 'money') {
        walletBalance += Math.floor(r.val * bonusMult);
    } else if (r.type === 'booster') { 
        if (!myBoosters[r.id]) myBoosters[r.id] = 0; 
        myBoosters[r.id]++; 
    } else if (r.type === 'mixed') { 
        walletBalance += Math.floor(r.money * bonusMult); 
        if (!myBoosters[r.booster]) myBoosters[r.booster] = 0; 
        myBoosters[r.booster]++; 
    }
    
    s++; 
    if (s >= 7) {
        s = 0;
    }
    
    localStorage.setItem('dailyStreak', s); 
    localStorage.setItem('lastLoginDate', t);
    
    saveData(); 
    updateBalanceUI(); 
    showToast("Награда получена!", "📅"); 
    closeModal('daily-modal'); 
    playSound('money');
}

// =============================================================
// ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЯ 
// =============================================================
function initGame() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand(); 
        window.Telegram.WebApp.enableClosingConfirmation();
        window.Telegram.WebApp.setHeaderColor('#1c1c1e'); 
        window.Telegram.WebApp.setBackgroundColor('#1c1c1e');
    }
    
    try {
        localSaveTime = parseInt(localStorage.getItem('lastSaveTime')) || 0;
        let savedLevel = parseInt(localStorage.getItem('userLevel'));
        
        if (savedLevel && savedLevel >= 1) {
            userLevel = savedLevel;
            collection = safeParse(localStorage.getItem('myCollection'), []);
            userXP = parseInt(localStorage.getItem('userXP')) || 0;
            walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
            userStars = parseInt(localStorage.getItem('userStars')) || 0;
            pegasusShards = parseInt(localStorage.getItem('pegasusShards')) || 0; 
            userJokers = parseInt(localStorage.getItem('userJokers')) || 0; 
            
            ownedItems = safeParse(localStorage.getItem('ownedItems'), { themes: ['default'], eggs: ['default'] });
            activeTheme = localStorage.getItem('activeTheme') || 'default';
            activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
            selectedAvatar = localStorage.getItem('selectedAvatar') || 'default'; 
            
            let s = safeParse(localStorage.getItem('userStats'), {}); 
            userStats = {...userStats, ...s};
            
            let b = safeParse(localStorage.getItem('myBoosters'), {}); 
            myBoosters = { luck: b.luck || 0, speed: b.speed || 0, bio: b.bio || 0 };
            
            claimedAchievements = safeParse(localStorage.getItem('claimedAchievements'), []);
            claimedQuests = safeParse(localStorage.getItem('claimedQuests'), []);
            usedCodes = safeParse(localStorage.getItem('usedCodes'), []);
            
            isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';
            isSoundOn = localStorage.getItem('isSoundOn') === 'true';
            vipEndTime = parseInt(localStorage.getItem('vipEndTime')) || 0;
            hasSecondSlot = localStorage.getItem('hasSecondSlot') === 'true';
            secondSlotEndTime = parseInt(localStorage.getItem('secondSlotEndTime')) || 0;
            lastRouletteDate = localStorage.getItem('lastRouletteDate') || "";
            boxAdsProgress = safeParse(localStorage.getItem('boxAdsProgress'), { epic: 0, mythic: 0 });
            
            petStars = safeParse(localStorage.getItem('petStars'), {});
            activeContracts = safeParse(localStorage.getItem('activeContracts'), { date: '', tasks: [] });
        }
    } catch(e) { 
        console.error("Local Load Error", e); 
    }

    let profileBtn = getEl('header-profile-btn');
    if (selectedAvatar !== 'default' && profileBtn) { 
        profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
    }
    
    let vibToggle = getEl('vibration-toggle');
    if (vibToggle) { 
        vibToggle.checked = isVibrationOn; 
        vibToggle.onchange = (e) => { 
            isVibrationOn = e.target.checked; 
            localStorage.setItem('isVibrationOn', isVibrationOn); 
            playSound('click'); 
        }; 
    }
    
    let soundToggle = getEl('sound-toggle');
    if (soundToggle) { 
        soundToggle.checked = isSoundOn; 
        soundToggle.onchange = (e) => { 
            isSoundOn = e.target.checked; 
            localStorage.setItem('isSoundOn', isSoundOn); 
            if (isSoundOn) playSound('click'); 
        }; 
    }

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        loadFromCloud();
    } else {
        postInit();
    }
}

function loadFromCloud() {
    const keys = [
        'walletBalance', 'userStars', 'userXP', 'userLevel', 'myCollection', 
        'ownedItems', 'activeTheme', 'activeEggSkin', 'userStats', 'myBoosters', 
        'claimedAchievements', 'claimedQuests', 'selectedAvatar', 'pegasusShards', 
        'vipEndTime', 'hasSecondSlot', 'secondSlotEndTime', 'userJokers', 
        'lastRouletteDate', 'lastSaveTime', 'boxAdsProgress', 'petStars', 'activeContracts'
    ];
    
    Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
        if (!err && values && values.userLevel) {
            let cloudLevel = parseInt(values.userLevel) || 1;
            let cloudTime = parseInt(values.lastSaveTime) || 0;
            
            if (cloudLevel > userLevel || (cloudLevel === userLevel && cloudTime >= localSaveTime)) {
                walletBalance = parseInt(values.walletBalance) || 0;
                userStars = parseInt(values.userStars) || 0;
                userXP = parseInt(values.userXP) || 0;
                userLevel = cloudLevel;
                
                if (values.pegasusShards) pegasusShards = parseInt(values.pegasusShards);
                if (values.userJokers) userJokers = parseInt(values.userJokers);
                
                if (values.myCollection) collection = safeParse(values.myCollection, []);
                if (values.ownedItems) ownedItems = safeParse(values.ownedItems, { themes: ['default'], eggs: ['default'] });
                if (values.activeTheme) activeTheme = values.activeTheme;
                if (values.activeEggSkin) activeEggSkin = values.activeEggSkin;
                if (values.selectedAvatar) selectedAvatar = values.selectedAvatar;
                
                if (values.userStats) userStats = {...userStats, ...safeParse(values.userStats, {})};
                
                if (values.myBoosters) {
                    let cb = safeParse(values.myBoosters, {});
                    myBoosters = { luck: cb.luck || 0, speed: cb.speed || 0, bio: cb.bio || 0 };
                }
                
                if (values.claimedAchievements) claimedAchievements = safeParse(values.claimedAchievements, []);
                if (values.claimedQuests) claimedQuests = safeParse(values.claimedQuests, []);
                
                if (values.vipEndTime) vipEndTime = parseInt(values.vipEndTime);
                if (values.hasSecondSlot) hasSecondSlot = values.hasSecondSlot === 'true';
                if (values.secondSlotEndTime) secondSlotEndTime = parseInt(values.secondSlotEndTime);
                if (values.lastRouletteDate) lastRouletteDate = values.lastRouletteDate;
                if (values.boxAdsProgress) boxAdsProgress = safeParse(values.boxAdsProgress, { epic: 0, mythic: 0 });
                
                if (values.petStars) petStars = safeParse(values.petStars, {});
                if (values.activeContracts) activeContracts = safeParse(values.activeContracts, { date: '', tasks: [] });

                let profileBtn = getEl('header-profile-btn');
                if (selectedAvatar !== 'default' && profileBtn) { 
                    profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
                }
                saveData(true); 
            } else if (userLevel > cloudLevel) {
                saveData(false); 
            }
        } else if (!err && (!values || !values.userLevel)) {
            if (userLevel > 1) {
                saveData(false);
            }
        }
        
        postInit();
    });
}

function postInit() {
    try { checkContracts(); } catch(e) {}
    try { updateUI(); } catch(e) {}
    try { checkBackgroundHatch(); } catch(e) {}
    try { updateSecondSlotUI(); } catch(e) {}
    try { updateLevelUI(); } catch(e) {}
    try { updateBalanceUI(); } catch(e) {}
    try { applyTheme(); } catch(e) {}
    try { applyEggSkin(); } catch(e) {}
    try { apiSyncGlobalProfile(); } catch(e) {}
    try { startInvitesPolling(); } catch(e) {}
    
    if (localStorage.getItem('tutorialSeen')) {
        try { checkDailyReward(); } catch(e) {}
    } else {
        openModal('tutorial-modal');
    }
}

function saveData(skipTimeUpdate = false) {
    let now = Date.now();
    if (!skipTimeUpdate) localSaveTime = now;

    localStorage.setItem('lastSaveTime', localSaveTime);
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('userStars', userStars);
    localStorage.setItem('pegasusShards', pegasusShards);
    localStorage.setItem('userJokers', userJokers);
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    localStorage.setItem('activeTheme', activeTheme);
    localStorage.setItem('activeEggSkin', activeEggSkin);
    localStorage.setItem('selectedAvatar', selectedAvatar);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
    localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    localStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
    localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
    localStorage.setItem('myCollection', JSON.stringify(collection));
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    localStorage.setItem('vipEndTime', vipEndTime);
    localStorage.setItem('hasSecondSlot', hasSecondSlot);
    localStorage.setItem('secondSlotEndTime', secondSlotEndTime);
    localStorage.setItem('lastRouletteDate', lastRouletteDate);
    localStorage.setItem('boxAdsProgress', JSON.stringify(boxAdsProgress));
    localStorage.setItem('petStars', JSON.stringify(petStars));
    localStorage.setItem('activeContracts', JSON.stringify(activeContracts));

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.setItem('lastSaveTime', localSaveTime.toString());
        Telegram.WebApp.CloudStorage.setItem('walletBalance', walletBalance.toString());
        Telegram.WebApp.CloudStorage.setItem('userStars', userStars.toString());
        Telegram.WebApp.CloudStorage.setItem('pegasusShards', pegasusShards.toString());
        Telegram.WebApp.CloudStorage.setItem('userJokers', userJokers.toString());
        Telegram.WebApp.CloudStorage.setItem('userXP', userXP.toString());
        Telegram.WebApp.CloudStorage.setItem('userLevel', userLevel.toString());
        Telegram.WebApp.CloudStorage.setItem('myCollection', JSON.stringify(collection));
        Telegram.WebApp.CloudStorage.setItem('ownedItems', JSON.stringify(ownedItems));
        Telegram.WebApp.CloudStorage.setItem('activeTheme', activeTheme);
        Telegram.WebApp.CloudStorage.setItem('activeEggSkin', activeEggSkin);
        Telegram.WebApp.CloudStorage.setItem('selectedAvatar', selectedAvatar);
        Telegram.WebApp.CloudStorage.setItem('userStats', JSON.stringify(userStats));
        Telegram.WebApp.CloudStorage.setItem('myBoosters', JSON.stringify(myBoosters));
        Telegram.WebApp.CloudStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
        Telegram.WebApp.CloudStorage.setItem('vipEndTime', vipEndTime.toString());
        Telegram.WebApp.CloudStorage.setItem('hasSecondSlot', hasSecondSlot.toString());
        Telegram.WebApp.CloudStorage.setItem('secondSlotEndTime', secondSlotEndTime.toString());
        Telegram.WebApp.CloudStorage.setItem('lastRouletteDate', lastRouletteDate);
        Telegram.WebApp.CloudStorage.setItem('boxAdsProgress', JSON.stringify(boxAdsProgress));
        Telegram.WebApp.CloudStorage.setItem('petStars', JSON.stringify(petStars));
        Telegram.WebApp.CloudStorage.setItem('activeContracts', JSON.stringify(activeContracts));
    }
}

// =============================================================
// ПРОФИЛЬ, ДРУЗЬЯ И УРОВНИ
// =============================================================
async function apiSyncGlobalProfile() {
    const user = getTgUser(); 
    let netWorth = walletBalance; 
    
    collection.forEach(pet => {
        netWorth += PRICES[getPetRarity(pet)] || 0;
    });
    
    let finalName = user.name;
    if (isVip()) {
        finalName += ' 👑'; 
    }
    
    try {
        await fetch(`${API_URL}/api/users/sync`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: user.id, 
                name: finalName, 
                avatar: selectedAvatar, 
                level: userLevel, 
                earned: netWorth, 
                hatched: userStats.hatched || 0 
            })
        });
    } catch(e) {}
}

function startInvitesPolling() {
    if (invitesPollingInterval) {
        clearInterval(invitesPollingInterval);
    }
    
    invitesPollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_URL}/api/invites/check/${getTgUser().id}`);
            const data = await res.json();
            
            if (data.has_invite && !modalStack.includes('incoming-invite-modal')) {
                currentPendingInviteId = data.invite.id;
                
                let isn = getEl('invite-sender-name'); 
                if (isn) isn.textContent = data.invite.sender_name;
                
                let isa = getEl('invite-sender-avatar'); 
                if (isa) isa.src = getPetImg(data.invite.sender_avatar);
                
                let iim = getEl('incoming-invite-modal'); 
                if (iim) iim.setAttribute('data-party', data.invite.party_code);
                
                playSound('win');
                openModal('incoming-invite-modal');
            }
        } catch(e) {}
    }, 5000);
}

async function declineInvite() {
    if (currentPendingInviteId) {
        try { 
            await fetch(`${API_URL}/api/invites/clear`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ code: String(currentPendingInviteId) }) 
            }); 
        } catch(e) {}
    }
    closeModal('incoming-invite-modal');
}

async function acceptInvite() {
    let iim = getEl('incoming-invite-modal');
    const code = iim ? iim.getAttribute('data-party') : '';
    
    await declineInvite(); 
    if (currentPartyCode) {
        await apiLeaveParty();
    }
    
    let pci = getEl('party-code-input'); 
    if (pci) pci.value = code;
    
    await apiJoinParty(code);
    openModal('party-modal');
}

function switchProfileTab(tab) {
    document.querySelectorAll('#profile-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    playSound('click');
    
    let psv = getEl('profile-stats-view');
    let pfv = getEl('profile-friends-view');
    
    if (tab === 'stats') {
        if (psv) psv.style.display = 'block'; 
        if (pfv) pfv.style.display = 'none';
    } else {
        if (psv) psv.style.display = 'none'; 
        if (pfv) pfv.style.display = 'block';
        
        let mfc = getEl('my-friend-code'); 
        if (mfc) mfc.value = getTgUser().id; 
        
        apiLoadFriends(); 
    }
}

function openProfile() {
    apiSyncGlobalProfile(); 
    
    let pr = getEl('profile-rank'); 
    if (pr) {
        pr.textContent = RANKS[Math.floor(userLevel / 5)] || "Создатель";
        if (isVip()) pr.innerHTML += ' <span style="color:#ffd700">👑 PRO</span>';
    }
    
    let pl = getEl('profile-level'); 
    if (pl) pl.textContent = `Уровень ${userLevel}`;
    
    let sh = getEl('stat-hatched'); 
    if (sh) sh.textContent = userStats.hatched || 0;
    
    let su = getEl('stat-unique'); 
    if (su) su.textContent = new Set(collection).size;
    
    let si = getEl('stat-invites'); 
    if (si) si.textContent = userStats.invites || 0;
    
    let netWorth = walletBalance;
    collection.forEach(pet => netWorth += PRICES[getPetRarity(pet)] || 0);
    
    ownedItems.themes.forEach(t => { 
        const item = SHOP_DATA.themes.find(x => x.id === t); 
        if (item) netWorth += item.price; 
    });
    ownedItems.eggs.forEach(e => { 
        const item = SHOP_DATA.eggs.find(x => x.id === e); 
        if (item) netWorth += item.price; 
    });
    
    let se = getEl('stat-earned'); 
    if (se) se.textContent = netWorth; 
    
    let pa = getEl('profile-avatar'); 
    if (pa) pa.src = getPetImg(selectedAvatar);
    
    let psv = getEl('profile-stats-view'); 
    if (psv) psv.style.display = 'block'; 
    
    let pfv = getEl('profile-friends-view'); 
    if (pfv) pfv.style.display = 'none';
    
    let tabs = document.querySelectorAll('#profile-modal .tab-btn');
    if (tabs.length >= 2) {
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    }
    
    openModal('profile-modal');
}

function copyMyCode() {
    let mfc = getEl('my-friend-code');
    if (!mfc) return;
    navigator.clipboard.writeText(mfc.value).then(() => showToast("Код скопирован!", "📋"));
}

async function apiAddFriend() {
    playSound('click'); 
    let input = getEl('add-friend-input'); 
    if (!input) return;
    
    const friendId = input.value.trim();
    if (!friendId || friendId === getTgUser().id) {
        return showToast("Неверный ID", "❌");
    }
    
    try {
        const res = await fetch(`${API_URL}/api/friends/add`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: getTgUser().id, friend_id: friendId })
        });
        const data = await res.json();
        
        if (data.status === 'success') { 
            showToast("Друг добавлен!", "🤝"); 
            input.value = ''; 
            apiLoadFriends(); 
        } else { 
            showToast(data.detail || "Ошибка", "❌"); 
        }
    } catch(e) { 
        showToast("Ошибка сети", "❌"); 
    }
}

async function apiLoadFriends() {
    const container = getEl('friends-list-container'); 
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; color:#888;">Загрузка...</div>';
    
    try {
        const res = await fetch(`${API_URL}/api/friends/list/${getTgUser().id}`); 
        const data = await res.json();
        
        container.innerHTML = '';
        if (data.friends.length === 0) { 
            container.innerHTML = '<div style="text-align:center; color:#888;">У вас пока нет друзей</div>'; 
            return; 
        }
        
        data.friends.forEach(f => {
            const encodedFriend = encodeURIComponent(JSON.stringify(f));
            container.innerHTML += `
                <div class="achievement-card" style="cursor: pointer;" onclick="openFriendProfile('${encodedFriend}')">
                    <img src="${getPetImg(f.avatar)}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #007aff;" onerror="this.src='assets/ui/icon-profile.png'">
                    <div class="ach-info">
                        <div class="ach-title">${f.name}</div>
                        <div class="ach-desc">Уровень ${f.level}</div>
                    </div>
                </div>
            `;
        });
    } catch(e) { 
        container.innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>'; 
    }
}

let currentViewingFriendId = null;

function openFriendProfile(encodedFriend) {
    playSound('click'); 
    const f = JSON.parse(decodeURIComponent(encodedFriend)); 
    currentViewingFriendId = f.user_id;
    
    let fpn = getEl('fp-name'); if (fpn) fpn.textContent = f.name; 
    let fpa = getEl('fp-avatar'); if (fpa) fpa.src = getPetImg(f.avatar);
    let fpl = getEl('fp-level'); if (fpl) fpl.textContent = `Уровень ${f.level}`; 
    let fph = getEl('fp-hatched'); if (fph) fph.textContent = f.hatched || 0; 
    let fpe = getEl('fp-earned'); if (fpe) fpe.textContent = f.earned || 0;
    
    let fib = getEl('fp-invite-btn');
    let fih = getEl('fp-invite-hint');
    
    if (currentPartyCode) { 
        if (fib) fib.style.display = 'block'; 
        if (fih) fih.style.display = 'none'; 
    } else { 
        if (fib) fib.style.display = 'none'; 
        if (fih) fih.style.display = 'block'; 
    }
    openModal('friend-profile-modal');
}

async function sendInviteToFriend() {
    playSound('click'); 
    if (!currentPartyCode || !currentViewingFriendId) return;
    
    const btn = getEl('fp-invite-btn'); 
    if (btn) { 
        btn.textContent = "Отправляем..."; 
        btn.disabled = true; 
    }
    
    try {
        await fetch(`${API_URL}/api/invites/send`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ sender_id: getTgUser().id, receiver_id: currentViewingFriendId, party_code: currentPartyCode }) 
        });
        showToast("Приглашение отправлено!", "💌");
    } catch(e) { 
        showToast("Ошибка", "❌"); 
    }
    
    setTimeout(() => { 
        if (btn) { 
            btn.textContent = "Позвать в свою Пати 🎮"; 
            btn.disabled = false; 
        } 
        closeModal('friend-profile-modal'); 
    }, 1000);
}

function openLevels() {
    const list = getEl('levels-list'); 
    if (!list) return;
    
    list.innerHTML = '';
    
    for (let lvl = 1; lvl <= 100; lvl++) {
        if (!LEVEL_REWARDS[lvl]) continue;
        
        const info = LEVEL_REWARDS[lvl]; 
        const isReached = userLevel >= lvl;
        const status = isReached ? `<img src="assets/ui/icon-check.png" style="width:20px">` : `<img src="assets/ui/icon-lock.png" style="width:20px">`;
        
        const div = document.createElement('div'); 
        div.className = `level-item ${isReached ? 'active' : 'locked'}`;
        
        let rewardText = info.reward || "Нет";
        if (rewardText && rewardText.includes("монет")) {
            rewardText = rewardText.replace("монет", `<img src="assets/ui/coin.png" style="width:16px;vertical-align:middle">`);
        }
        
        div.innerHTML = `<div class="rank-icon">${status}</div><div class="rank-details"><div class="rank-title">Ур. ${lvl}: ${info.title}</div><div class="rank-desc">Награда: ${rewardText}</div></div>`;
        list.appendChild(div);
    }
    openModal('levels-modal');
}

function checkAchievements() {
    let has = false; 
    let u = new Set(collection).size;
    
    ACHIEVEMENTS_DATA.forEach(a => { 
        if (!claimedAchievements.includes(a.id)) { 
            if (a.type === 'money' && walletBalance >= a.goal) has = true;
            if (a.type === 'unique' && u >= a.goal) has = true;
            if (a.type === 'hatch' && userStats.hatched >= a.goal) has = true;
            if (!a.type && userStats.hatched >= a.goal) has = true;
            if (a.type === 'level' && userLevel >= a.goal) has = true;
            if (a.type === 'craft' && userStats.crafts >= a.goal) has = true;
        } 
    });
    
    if (activeContracts && activeContracts.tasks) {
        if (activeContracts.tasks.some(t => t.p >= t.g && !t.c)) {
            has = true;
        }
    }
    
    let badge = getEl('ach-badge');
    if (badge) {
        badge.style.display = has ? 'block' : 'none';
    }
}

function openAvatarSelector() {
    const list = getEl('avatar-list'); 
    if (!list) return;
    
    list.innerHTML = '';
    const uniquePets = [...new Set(collection)];
    
    if (uniquePets.length === 0) { 
        list.innerHTML = "<p style='color:#888; grid-column:span 4;'>Сначала выбей питомца!</p>"; 
    }
    
    uniquePets.forEach(pet => {
        const div = document.createElement('div');
        div.className = `avatar-item ${selectedAvatar === pet ? 'selected' : ''}`;
        div.innerHTML = `<img src="assets/pets/pet-${pet}.png" onerror="this.src='assets/eggs/egg-default.png'">`;
        
        div.onclick = () => {
            selectedAvatar = pet; 
            saveData();
            
            let pAvatar = getEl('profile-avatar'); 
            if (pAvatar) pAvatar.src = getPetImg(pet);
            
            let hBtn = getEl('header-profile-btn'); 
            if (hBtn) hBtn.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`;
            
            if (currentPartyCode) {
                apiUpdatePlayerAvatar();
            }
            
            closeModal('avatar-modal'); 
            showToast("Аватар изменен!");
        };
        list.appendChild(div);
    });
    openModal('avatar-modal');
}

async function apiUpdatePlayerAvatar() {
    let finalName = getTgUser().name;
    if (isVip()) {
        finalName += ' 👑';
    }
    try { 
        await fetch(`${API_URL}/api/party/join`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin }) 
        }); 
    } catch(e) {}
}// =============================================================
// UI, МАГАЗИН И АЧИВКИ
// =============================================================
function applyTheme() { 
    if (activeTheme === 'matrix') {
        document.body.className = 'theme-matrix';
        document.body.style.backgroundImage = 'none';
        return;
    }
    
    document.body.className = '';
    const t = SHOP_DATA.themes.find(x => x.id === activeTheme); 
    
    if (t && t.bgFile) {
        document.body.style.backgroundImage = `url('${t.bgFile}')`; 
    } else { 
        document.body.style.backgroundImage = 'none'; 
        document.body.style.backgroundColor = '#1c1c1e'; 
    }
}

function applyEggSkin() { 
    const egg = getEl('egg-display'); 
    if (!egg) return;

    egg.className = 'egg-img'; 
    egg.classList.remove('egg-locked');
    
    const m = MODES[currentModeIndex] || MODES[0];

    if (userLevel < m.reqLevel) {
        egg.classList.add('egg-locked');
        egg.src = 'assets/eggs/egg-default.png';
        return;
    }

    if (m.egg !== 'default') {
        egg.src = `assets/eggs/egg-${m.egg}.png`;
    } else if (activeEggSkin === 'holo') {
        egg.classList.add('holo-egg');
        egg.src = 'assets/eggs/egg-ice.png';
    } else {
        const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 
        egg.src = s ? s.img : 'assets/eggs/egg-default.png';
    }
    
    if (isRunning) {
        egg.classList.add('shaking'); 
    }
}

function updateLevelUI() { 
    const max = userLevel * 200; 
    let p = (userXP / max) * 100; 
    if (p > 100) p = 100; 
    
    let xpBar = getEl('xp-bar'); 
    if (xpBar) xpBar.style.width = `${p}%`; 
    
    let numEl = getEl('level-number'); 
    if (numEl) numEl.textContent = `Lvl ${userLevel}`; 
    
    let r = Math.floor(userLevel / 5); 
    let rankEl = getEl('rank-name'); 
    if (rankEl) rankEl.textContent = RANKS[Math.min(r, RANKS.length - 1)] || "Создатель"; 
}

function switchShopTab(t) { 
    currentShopTab = t; 
    document.querySelectorAll('#shop-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    renderShop(); 
    playSound('click'); 
}

function openShop() { 
    switchShopTab('themes'); 
    openModal('shop-modal'); 
}

function openSettings() { 
    openModal('settings-modal'); 
}

function openAch() { 
    switchAchTab('achievements'); 
    openModal('achievements-modal'); 
}

function renderShop() {
    const c = getEl('shop-items'); 
    if (!c) return;
    
    c.innerHTML = '';
    
    if (currentShopTab === 'premium') {
        c.innerHTML = `
            <div class="shop-item" style="grid-column: span 2; background: rgba(0, 163, 255, 0.1); border: 1px solid #00A3FF;">
                <div style="font-size: 30px;">👑</div>
                <div class="shop-item-name">Focus PRO (30 дней)</div>
                <div style="font-size:12px;color:#ccc;margin-bottom:10px;">+20% к монетам, коронка в Пати</div>
                <button class="buy-btn" style="${isVip() ? 'background:#555' : 'background: #00A3FF;'}" onclick="buyPremium('pro', 150)">${isVip() ? 'Продлить (150 ⭐️)' : '150 ⭐️'}</button>
            </div>
            <div class="shop-item" style="grid-column: span 2; background: rgba(52, 199, 89, 0.1); border: 1px solid #34c759;">
                <div style="font-size: 30px;">🥚</div>
                <div class="shop-item-name">Второй Инкубатор</div>
                <div style="font-size:12px;color:#ccc;margin-bottom:10px;">Расти 2 яйца оффлайн одновременно</div>
                <button class="buy-btn" style="${hasSecondSlot ? 'background:#555; pointer-events:none;' : 'background: #00A3FF;'}" onclick="buyPremium('slot', 500)">${hasSecondSlot ? 'Куплено навсегда' : '500 ⭐️'}</button>
            </div>
            <div class="shop-item" style="grid-column: span 2; background: rgba(255, 59, 48, 0.1); border: 1px solid #ff3b30;">
                <div style="font-size: 30px;">🧬</div>
                <div class="shop-item-name">Ген Мутации (Джокер)</div>
                <div style="font-size:12px;color:#ccc;margin-bottom:10px;">Заменяет недостающего пета при синтезе</div>
                <button class="buy-btn" style="background: #00A3FF;" onclick="buyPremium('joker', 50)">50 ⭐️ (У вас: ${userJokers})</button>
            </div>
            <div class="shop-item" style="grid-column: span 1; background: rgba(255, 255, 255, 0.05); border: 1px solid #ffd700;">
                <div style="font-size: 30px;">🌌</div>
                <div class="shop-item-name">Фон: Матрица</div>
                <button class="buy-btn" style="${ownedItems.themes.includes('matrix') ? 'background:#555' : 'background: #00A3FF;'}" onclick="buyPremium('theme_matrix', 100)">${ownedItems.themes.includes('matrix') ? 'Куплено' : '100 ⭐️'}</button>
            </div>
            <div class="shop-item" style="grid-column: span 1; background: rgba(255, 255, 255, 0.05); border: 1px solid #ffd700;">
                <div style="font-size: 30px;">🔮</div>
                <div class="shop-item-name">Яйцо: Голограмма</div>
                <button class="buy-btn" style="${ownedItems.eggs.includes('holo') ? 'background:#555' : 'background: #00A3FF;'}" onclick="buyPremium('egg_holo', 100)">${ownedItems.eggs.includes('holo') ? 'Куплено' : '100 ⭐️'}</button>
            </div>
        `;
        return;
    }

    SHOP_DATA[currentShopTab].forEach(item => {
        if (item.isPremium) return; 
        
        const d = document.createElement('div'); 
        d.className = 'shop-item';
        
        let btnHTML = '';
        if (currentShopTab === 'boosters') {
            btnHTML = `<button class="buy-btn" onclick="buyItem('${item.id}', '${item.price}')">${item.price} ${typeof item.price === 'number' ? '<img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">' : ''}</button>`;
            let iconContent = item.icon.includes('.png') ? `<img src="${item.icon}" class="shop-icon-img">` : `<div style="font-size: 50px; margin-bottom: 10px;">${item.icon}</div>`;
            d.innerHTML = `${iconContent}<div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888">${item.desc}</div>${btnHTML}`;
        } else if (currentShopTab === 'eggs') {
            const owned = ownedItems.eggs.includes(item.id); 
            const active = activeEggSkin === item.id;
            let cls = owned ? "buy-btn owned" : "buy-btn"; 
            
            if (!owned && walletBalance < item.price) {
                cls += " locked"; 
            }
            
            let txt = owned ? (active ? "Выбрано" : "Выбрать") : `${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML = `<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            d.innerHTML = `<img src="${item.img}" class="shop-icon-img"><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        } else {
            const owned = ownedItems.themes.includes(item.id); 
            const active = activeTheme === item.id;
            let cls = owned ? "buy-btn owned" : "buy-btn"; 
            
            if (!owned && walletBalance < item.price) {
                cls += " locked"; 
            }
            
            let txt = owned ? (active ? "Выбрано" : "Выбрать") : `${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML = `<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            
            let icon = item.bgFile ? `<img src="${item.bgFile}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;margin-bottom:5px">` : `<div style="width:60px;height:60px;background:#333;border-radius:10px;margin-bottom:5px"></div>`;
            d.innerHTML = `${icon}<div class="shop-item-name">${item.name}</div>${btnHTML}`;
        }
        c.appendChild(d);
    });
}

function buyPremium(type, price) {
    if (userStars >= price) {
        if (type === 'pro') {
            if (isVip()) {
                vipEndTime += 30 * 24 * 60 * 60 * 1000;
            } else {
                vipEndTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
            }
            showToast("Focus PRO активирован! 👑", "⭐️");
        } else if (type === 'slot') {
            if (hasSecondSlot) return;
            hasSecondSlot = true;
            showToast("Второй слот открыт!", "🥚");
            updateSecondSlotUI();
        } else if (type === 'joker') {
            userJokers++;
            showToast("Куплен Ген Мутации! 🧬", "⭐️");
        } else if (type === 'theme_matrix') {
            if (ownedItems.themes.includes('matrix')) return;
            ownedItems.themes.push('matrix');
            showToast("Куплен премиум фон!", "⭐️");
        } else if (type === 'egg_holo') {
            if (ownedItems.eggs.includes('holo')) return;
            ownedItems.eggs.push('holo');
            showToast("Куплено премиум яйцо!", "⭐️");
        }
        
        userStars -= price;
        saveData();
        updateBalanceUI();
        apiSyncGlobalProfile();
        renderShop();
        playSound('money');
    } else {
        showToast("Недостаточно Звезд!", "❌");
        openBuyStarsModal();
    }
}

function buyItem(id, price) {
    if (typeof price === 'string' && price.includes('⭐️')) { 
        let starCost = parseInt(price);
        if (userStars >= starCost) {
            userStars -= starCost;
            if (!myBoosters[id]) {
                myBoosters[id] = 0; 
            }
            myBoosters[id]++; 
            
            saveData(); 
            updateBalanceUI(); 
            renderShop();
            showToast("Куплено за Звезды!", "💉"); 
            playSound('money');
        } else {
            showToast("Мало Звезд!", "❌");
            openBuyStarsModal();
        }
        return; 
    }
    
    if (currentShopTab === 'boosters') {
        if (walletBalance >= price) { 
            walletBalance -= price; 
            if (!myBoosters[id]) {
                myBoosters[id] = 0; 
            }
            myBoosters[id]++; 
            
            saveData(); 
            updateBalanceUI(); 
            showToast("Куплено!", "🧪"); 
            playSound('money'); 
        } else {
            showToast("Мало денег", "🚫");
        }
        return;
    }
    
    const category = currentShopTab; 
    const owned = ownedItems[category].includes(id);
    
    if (owned) {
        if (category === 'themes') { 
            activeTheme = id; 
            applyTheme(); 
        } else { 
            activeEggSkin = id; 
            applyEggSkin(); 
        }
        saveData(); 
        renderShop(); 
        playSound('click');
    } else {
        if (walletBalance >= price) {
            walletBalance -= price; 
            ownedItems[category].push(id);
            
            if (category === 'themes') { 
                activeTheme = id; 
                applyTheme(); 
            } else { 
                activeEggSkin = id; 
                applyEggSkin(); 
            }
            
            saveData(); 
            updateBalanceUI(); 
            renderShop(); 
            showToast("Куплено!", "🛍️"); 
            playSound('money');
        } else {
            showToast("Мало денег", "🚫");
        }
    }
}

function switchAchTab(t) { 
    currentAchTab = t; 
    document.querySelectorAll('#achievements-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    
    if (t === 'achievements') {
        renderAch(); 
    } else {
        renderQuests(); 
    }
    playSound('click'); 
}

function renderAch() {
    const c = getEl('achievements-list'); 
    if (!c) return;
    
    c.innerHTML = ''; 
    let u = new Set(collection).size;
    
    ACHIEVEMENTS_DATA.forEach(a => {
        const claimed = claimedAchievements.includes(a.id); 
        let done = false; 
        
        if (a.type === 'money' && walletBalance >= a.goal) done = true;
        if (a.type === 'unique' && u >= a.goal) done = true;
        if (a.type === 'hatch' && userStats.hatched >= a.goal) done = true;
        if (!a.type && userStats.hatched >= a.goal) done = true;
        if (a.type === 'level' && userLevel >= a.goal) done = true;
        if (a.type === 'craft' && userStats.crafts >= a.goal) done = true;
        
        const d = document.createElement('div'); 
        d.className = `achievement-card ${done ? 'unlocked' : ''}`;
        
        let btn = ''; 
        if (done && !claimed) {
            btn = `<button class="buy-btn" onclick="claimAch('${a.id}',${a.reward})">Забрать ${a.reward} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`; 
        } else if (claimed) {
            btn = "✅"; 
        } else {
            btn = `<span style="font-size:12px;color:#888">Цель: ${a.goal}</span>`;
        }
        
        d.innerHTML = `<div class="ach-icon">${done ? '<img src="assets/ui/icon-trophy.png">' : '<img src="assets/ui/icon-lock.png">'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function renderQuests() {
    const c = getEl('achievements-list'); 
    if (!c) return;
    
    c.innerHTML = '<p style="font-size:12px; color:#888; text-align:center; margin-bottom:10px;">Обновляются каждый день</p>';
    
    if (!activeContracts.tasks) return;

    activeContracts.tasks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = `achievement-card ${t.p >= t.g ? 'unlocked' : ''}`;
        
        let btn = '';
        if (t.c) {
            btn = '✅';
        } else if (t.p >= t.g) {
            btn = `<button class="buy-btn" onclick="claimContract(${i})">Забрать</button>`;
        } else {
            btn = `<span style="font-size:12px;color:#888">${t.p}/${t.g}</span>`;
        }
        
        let icon = t.r.t === 'money' ? '💰' : (t.r.t === 'stars' ? '⭐️' : '🎁');
        let rewardText = `${t.r.v} ` + (t.r.t === 'money' ? 'Монет' : (t.r.t === 'stars' ? 'Звезд' : 'Бустер'));

        d.innerHTML = `<div class="ach-icon" style="font-size:24px;">${icon}</div><div class="ach-info"><div class="ach-title">${t.d}</div><div class="ach-desc">Награда: ${rewardText}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function clickLink(id, u, r) { 
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.openLink(u); 
    } else {
        window.open(u, '_blank'); 
    }
    
    const b = getEl(`qbtn-${id}`); 
    if (b) {
        b.textContent = "Проверяю...";
        b.disabled = true;
        b.style.background = "#555";
        setTimeout(() => claimQuest(id, r), 4000);
    }
}

function claimAch(id, r) { 
    if (claimedAchievements.includes(id)) return; 
    
    claimedAchievements.push(id); 
    walletBalance += r; 
    
    saveData(); 
    updateBalanceUI(); 
    renderAch(); 
    
    showToast(`Награда +${r}`, 'img'); 
    playSound('money'); 
}

function claimQuest(id, r) { 
    if (claimedQuests.includes(id)) return; 
    
    claimedQuests.push(id); 
    walletBalance += r; 
    
    saveData(); 
    updateBalanceUI(); 
    renderQuests(); 
    
    showToast(`Награда +${r}`, 'img'); 
    playSound('money'); 
}

function handleShare() { 
    if (!userStats.invites) {
        userStats.invites = 0; 
    }
    userStats.invites++; 
    
    saveData(); 
    checkAchievements(); 
    
    const t = `У меня ${new Set(collection).size} петов в Focus Hatcher!`; 
    const u = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(t)}`; 
    
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(u); 
    } else {
        window.open(u, '_blank'); 
    }
}

// =============================================================
// FORBES (ТОП БОГАЧЕЙ)
// =============================================================
async function openForbes() {
    playSound('click');
    openModal('forbes-modal');
    
    let flc = getEl('forbes-list-container');
    if (flc) {
        flc.innerHTML = '<div style="text-align:center; color:#888; padding: 20px;">Синхронизация...</div>';
    }
    
    await apiSyncGlobalProfile();
    
    try {
        const res = await fetch(`${API_URL}/api/forbes/${getTgUser().id}`);
        forbesDataCache = await res.json();
        renderForbesList(currentForbesTab);
    } catch(e) {
        if (flc) {
            flc.innerHTML = '<div style="text-align:center; color:#ff3b30; padding: 20px;">Ошибка загрузки топа</div>';
        }
    }
}

function switchForbesTab(tab) {
    playSound('click');
    currentForbesTab = tab;
    
    document.querySelectorAll('#forbes-modal .tab-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    renderForbesList(tab);
}

function renderForbesList(tab) {
    const container = getEl('forbes-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (!forbesDataCache || !forbesDataCache[tab]) return;
    
    const list = forbesDataCache[tab];
    if (list.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#888; padding: 20px;">Тут пока пусто</div>';
        return;
    }

    let html = '';
    list.forEach((p, index) => {
        let rankNum = index + 1;
        let rankClass = rankNum <= 3 ? `top-${rankNum}` : '';
        let isMe = p.user_id === String(getTgUser().id) ? 'me' : '';
        
        html += `
            <div class="forbes-item ${isMe}">
                <div class="forbes-rank ${rankClass}">${rankNum}</div>
                <img src="${getPetImg(p.avatar)}" class="forbes-avatar" onerror="this.src='assets/ui/icon-profile.png'">
                <div class="forbes-info">
                    <div class="forbes-name">${p.name} ${isMe ? '(Ты)' : ''}</div>
                    <div class="forbes-lvl">Уровень ${p.level}</div>
                </div>
                <div class="forbes-val">${p.earned} <img src="assets/ui/coin.png"></div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// =============================================================
// РУЛЕТКА И РЕКЛАМА (ПОДКЛЮЧАЕМ GAMEPUSH)
// =============================================================
function switchRouletteBox(type) {
    playSound('click');
    currentBoxType = type;
    
    document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.classList.remove('active'));
    let activeTab = getEl(`r-tab-${type}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    let cost = 10; 
    let reqAds = 1;
    
    if (type === 'epic') { 
        cost = 25; 
        reqAds = 2; 
    }
    if (type === 'mythic') { 
        cost = 50; 
        reqAds = 3; 
    }
    
    let paidBtn = getEl('roulette-paid-btn');
    if (paidBtn) {
        paidBtn.textContent = `Крутить за ${cost} ⭐️`;
    }
    
    const today = new Date().toDateString();
    let freeBtn = getEl('roulette-free-btn');
    let adBtn = getEl('roulette-ad-btn');

    if (type === 'base' && lastRouletteDate !== today) {
        if (freeBtn) freeBtn.style.display = 'block';
        if (adBtn) adBtn.style.display = 'none';
        if (paidBtn) paidBtn.style.display = 'none';
    } else {
        if (freeBtn) freeBtn.style.display = 'none';
        if (adBtn) {
            adBtn.style.display = 'block';
            if (type !== 'base') {
                let watched = boxAdsProgress[type] || 0;
                adBtn.textContent = `Смотреть рекламу 📺 (${watched}/${reqAds})`;
            } else {
                adBtn.textContent = `Смотреть рекламу 📺`;
            }
        }
        if (paidBtn) paidBtn.style.display = 'block';
    }
    
    let boxColor = '#fff';
    if (type === 'epic') boxColor = '#00A3FF';
    if (type === 'mythic') boxColor = '#ffd700';
    
    let rBox = getEl('roulette-box');
    if (rBox) {
        rBox.style.filter = `drop-shadow(0 0 20px ${boxColor})`;
        rBox.textContent = '🎁';
    }
    
    let resText = getEl('roulette-result-text');
    if (resText) {
        resText.textContent = '';
    }
}

function openRouletteModal() {
    switchRouletteBox('base');
    openModal('roulette-modal');
}

function spinRouletteAd() {
    if (!window.gp || !window.gp.ads) {
        showToast("Реклама еще загружается", "⏳");
        return;
    }
    
    const btn = getEl('roulette-ad-btn');
    if (!btn) return;
    
    const orig = btn.textContent;
    btn.disabled = true; 
    btn.textContent = "Поиск видео...";

    let adTimeout = setTimeout(() => {
        btn.disabled = false;
        btn.textContent = orig;
        showToast("Нет видео у провайдера", "⏳");
    }, 8000);

    try {
        window.gp.ads.showRewardedVideo({
            onStart: () => {
                clearTimeout(adTimeout);
            },
            onRewarded: () => {
                if (currentBoxType !== 'base') {
                    let req = currentBoxType === 'epic' ? 2 : 3;
                    if (!boxAdsProgress[currentBoxType]) {
                        boxAdsProgress[currentBoxType] = 0;
                    }
                    boxAdsProgress[currentBoxType]++;
                    
                    if (boxAdsProgress[currentBoxType] >= req) {
                        boxAdsProgress[currentBoxType] = 0;
                        spinRoulette('ad');
                    } else {
                        saveData(); 
                        switchRouletteBox(currentBoxType); 
                        showToast(`Реклама просмотрена: ${boxAdsProgress[currentBoxType]}/${req}`, '📺');
                    }
                } else {
                    spinRoulette('ad'); 
                }
            },
            onClose: () => {
                clearTimeout(adTimeout);
                btn.disabled = false; 
                btn.textContent = orig;
            },
            onError: (err) => {
                clearTimeout(adTimeout);
                btn.disabled = false; 
                btn.textContent = orig;
                showToast("Ошибка рекламы", "❌");
                console.error(err);
            }
        });
    } catch (e) {
        clearTimeout(adTimeout);
        btn.disabled = false; 
        btn.textContent = orig;
        showToast("Сбой сети", "❌");
    }
}

function spinRoulette(method) {
    let cost = 10;
    if (currentBoxType === 'epic') cost = 25;
    if (currentBoxType === 'mythic') cost = 50;

    if (method === 'stars') {
        if (userStars < cost) {
            showToast("Недостаточно Звезд!", "❌");
            openBuyStarsModal();
            return;
        }
        userStars -= cost;
        updateBalanceUI();
    } else if (method === 'free' && currentBoxType === 'base') {
        lastRouletteDate = new Date().toDateString();
        switchRouletteBox('base'); 
    }
    
    updateContract('roulette', 1);
    playSound('click'); 
    saveData();
    
    const box = getEl('roulette-box');
    const resText = getEl('roulette-result-text');
    if (!box || !resText) return;
    
    if (getEl('roulette-free-btn')) getEl('roulette-free-btn').disabled = true;
    if (getEl('roulette-ad-btn')) getEl('roulette-ad-btn').disabled = true;
    if (getEl('roulette-paid-btn')) getEl('roulette-paid-btn').disabled = true;
    
    document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.disabled = true);
    
    box.className = 'roulette-box roulette-spinning';
    resText.textContent = "Крутим...";
    
    setTimeout(() => {
        box.className = 'roulette-box';
        
        if (getEl('roulette-free-btn')) getEl('roulette-free-btn').disabled = false;
        if (getEl('roulette-ad-btn')) getEl('roulette-ad-btn').disabled = false;
        if (getEl('roulette-paid-btn')) getEl('roulette-paid-btn').disabled = false;
        
        document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.disabled = false);
        
        let rnd = Math.random() * 100;
        let selectedPrize = null;
        let pool = ROULETTE_PRIZES[currentBoxType];
        
        for (let p of pool) {
            if (rnd < p.p) { 
                selectedPrize = p; 
                break; 
            }
            rnd -= p.p;
        }
        
        if (!selectedPrize) {
            selectedPrize = pool[0];
        }
        
        playSound('win'); 
        fireConfetti();
        
        if (selectedPrize.t === 'legendary_random') {
            const randLeg = petDatabase.legendary[Math.floor(Math.random() * petDatabase.legendary.length)];
            collection.push(randLeg);
            showToast(`СУПЕР ПРИЗ! Легендарный ${PET_NAMES[randLeg]}!`, "🏆");
            box.textContent = "🐲";
            resText.textContent = `ДЖЕКПОТ: ${PET_NAMES[randLeg]}`;
        }
        else if (selectedPrize.t === 'money') { 
            walletBalance += selectedPrize.v; 
            showToast(`+${selectedPrize.v} монет!`, "💰"); 
            box.textContent = "💰"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'stars') { 
            userStars += selectedPrize.v; 
            showToast(`+${selectedPrize.v} Звезд!`, "⭐️"); 
            box.textContent = "⭐️"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'joker') { 
            userJokers += selectedPrize.v; 
            showToast(`Ген Мутации x${selectedPrize.v}!`, "🧬"); 
            box.textContent = "🧬"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'shard') { 
            pegasusShards += selectedPrize.v; 
            showToast(`Осколок Пегаса x${selectedPrize.v}!`, "🧩"); 
            box.textContent = "🦄"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'luck') { 
            if (!myBoosters.luck) myBoosters.luck = 0; 
            myBoosters.luck += selectedPrize.v; 
            showToast(`Зелье удачи x${selectedPrize.v}!`, "🧪"); 
            box.textContent = "🧪"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'speed') { 
            if (!myBoosters.speed) myBoosters.speed = 0; 
            myBoosters.speed += selectedPrize.v; 
            showToast(`Ускоритель x${selectedPrize.v}!`, "⚡️"); 
            box.textContent = "⚡️"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }

        saveData(); 
        updateBalanceUI();
    }, 2000);
}

// =============================================================
// ПОКУПКА РЕАЛЬНЫХ ЗВЕЗД TELEGRAM (API)
// =============================================================
function openBuyStarsModal() {
    openModal('buy-stars-modal');
}

async function buyStars(amount) {
    playSound('click');
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "Загрузка...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/payment/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount, user_id: getTgUser().id })
        });
        const data = await res.json();
        
        if (data.status === 'success' && data.invoice_link) {
            window.Telegram.WebApp.openInvoice(data.invoice_link, (status) => {
                if (status === 'paid') {
                    playSound('win');
                    userStars += amount;
                    saveData();
                    updateBalanceUI();
                    showToast(`Успешно куплено ${amount} Звезд!`, '⭐️');
                    closeModal('buy-stars-modal');
                } else if (status === 'cancelled') {
                    showToast("Оплата отменена", "❌");
                } else {
                    showToast("Ошибка оплаты", "❌");
                }
            });
        } else {
            showToast("Ошибка создания чека: " + (data.detail || ""), "❌");
        }
    } catch(e) {
        showToast("Ошибка сети", "❌");
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
}

// =============================================================
// СЕРВЕРНЫЕ ПРОМОКОДЫ
// =============================================================
function openPromo() { 
    openModal('promo-modal'); 
}

async function activatePromo() {
    playSound('click');
    const input = getEl('promo-input');
    const code = input.value.toUpperCase().trim();
    if (!code) return;

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "Проверка...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/promo/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: getTgUser().id, code: code })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            if (data.type === 'money') { 
                walletBalance += data.val; 
                showToast(`+${data.val} Монет`, 'img'); 
            } else if (data.type === 'speed') { 
                if (!myBoosters.speed) myBoosters.speed = 0; 
                myBoosters.speed += data.val; 
                showToast(`+${data.val} Ускоритель`, '⚡️'); 
            } else if (data.type === 'luck') { 
                if (!myBoosters.luck) myBoosters.luck = 0; 
                myBoosters.luck += data.val; 
                showToast(`+${data.val} Удача`, '🧪'); 
            } else if (data.type === 'stars') { 
                userStars += data.val; 
                showToast(`+${data.val} Звезд!`, '⭐️'); 
            } else if (data.type === 'joker') { 
                userJokers += data.val; 
                showToast(`+${data.val} Ген Мутации!`, '🧬'); 
            }
            
            if (!usedCodes.includes(code)) {
                usedCodes.push(code);
            }
            
            saveData(); 
            updateBalanceUI(); 
            playSound('win'); 
            closeModal('promo-modal'); 
            input.value = "";
        } else {
            showToast(data.detail, "❌");
        }
    } catch (e) {
        showToast("Ошибка сети", "❌");
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
}

// =============================================================
// АДМИН-ПАНЕЛЬ
// =============================================================
function generateRandomPromo() {
    playSound('click');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FH-';
    
    for(let i=0; i<6; i++) {
        if (i===3) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    getEl('admin-promo-code').value = code;
}

async function adminSubmitPromo() {
    playSound('click');
    const code = getEl('admin-promo-code').value.trim().toUpperCase();
    const type = getEl('admin-promo-type').value;
    const val = parseInt(getEl('admin-promo-val').value) || 0;
    const limit = parseInt(getEl('admin-promo-limit').value) || 0;
    const pwd = getEl('admin-password').value.trim();
    
    if (!code || val <= 0 || !pwd) {
        return showToast("Заполни все поля и пароль!", "❌");
    }
    
    const btn = event.target;
    const origText = btn.textContent;
    btn.textContent = "Создаем...";
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/api/admin/promo/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd, code: code, type: type, val: val, max_uses: limit })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            showToast("Промокод создан!", "✅");
            closeModal('admin-modal');
            getEl('admin-promo-code').value = '';
        } else {
            showToast(data.detail, "❌");
        }
    } catch(e) {
        showToast("Ошибка сети", "❌");
    }
    
    btn.textContent = origText;
    btn.disabled = false;
}// =============================================================
// ВЫБОР ЯЙЦА И БУСТЕРЫ
// =============================================================
function updateUI() {
    const m = MODES[currentModeIndex];
    let title = getEl('mode-title'); if (title) title.textContent = m.title;
    let sub = getEl('mode-subtitle'); if (sub) sub.textContent = m.sub;
    
    let btnPrev = getEl('prev-btn'); if (btnPrev) btnPrev.style.visibility = currentModeIndex > 0 ? 'visible' : 'hidden';
    let btnNext = getEl('next-btn'); if (btnNext) btnNext.style.visibility = currentModeIndex < MODES.length - 1 ? 'visible' : 'hidden';

    let customBtn = getEl('custom-egg-btn');
    if (customBtn) customBtn.style.display = m.id === 'custom' ? 'block' : 'none';

    if (!isRunning) {
        let t = m.timeOnline;
        if (m.id === 'custom') t = customEggConfig.timeOnline;
        if (activeBoosters.speed) t = Math.max(1, Math.floor(t * 0.7));
        
        let timerDisplay = getEl('timer');
        if (timerDisplay) timerDisplay.textContent = formatTime(t);
        applyEggSkin();
    }
    
    renderBoosters();
}

function prevMode() { 
    if (isRunning || currentModeIndex <= 0) return; 
    currentModeIndex--; 
    playSound('click'); 
    updateUI(); 
}

function nextMode() { 
    if (isRunning || currentModeIndex >= MODES.length - 1) return; 
    currentModeIndex++; 
    playSound('click'); 
    updateUI(); 
}

function renderBoosters() {
    const c = getEl('boosters-panel'); 
    if (!c) return;
    
    if (isRunning) { 
        c.style.display = 'none'; 
        return; 
    }
    c.style.display = 'flex';
    c.innerHTML = '';
    
    const bs = [
        { id: 'luck', icon: 'assets/ui/booster-luck.png', count: myBoosters.luck || 0 },
        { id: 'speed', icon: 'assets/ui/booster-speed.png', count: myBoosters.speed || 0 },
        { id: 'bio', icon: '💉', count: myBoosters.bio || 0, text: true }
    ];
    
    bs.forEach(b => {
        const d = document.createElement('div');
        d.className = `booster-slot ${b.count === 0 ? 'empty' : ''} ${activeBoosters[b.id] ? 'active' : ''}`;
        d.onclick = () => toggleBooster(b.id);
        
        let iconHtml = b.text ? `<div style="font-size:24px">${b.icon}</div>` : `<img src="${b.icon}">`;
        d.innerHTML = `${iconHtml}<div class="booster-count">${b.count}</div>`;
        c.appendChild(d);
    });
}

function toggleBooster(id) {
    if (isRunning || !myBoosters[id] || myBoosters[id] <= 0) {
        if (!myBoosters[id] || myBoosters[id] <= 0) {
            showToast("Нет в наличии! Купите в Магазине", "🛒");
            openShop();
        }
        return;
    }
    activeBoosters[id] = !activeBoosters[id];
    playSound('click');
    updateUI();
}

// =============================================================
// КАСТОМНОЕ ЯЙЦО
// =============================================================
function openCustomEggModal() { 
    updateCustomEggTimes(); 
    openModal('custom-egg-modal'); 
}

function updateCustomEggTimes() {
    const val = getEl('custom-rarity-select').value;
    let to = 3600; 
    let tf = 5 * 3600;
    
    if (val === 'common') { to = 10 * 60; tf = 2 * 3600; }
    if (val === 'rare') { to = 40 * 60; tf = 8 * 3600; }
    if (val === 'legendary') { to = 2 * 3600; tf = 14 * 3600; }
    
    customEggConfig.target = val;
    customEggConfig.timeOnline = to;
    customEggConfig.timeOffline = tf;
    
    let el = getEl('custom-egg-times');
    if (el) el.textContent = `Онлайн: ${formatTime(to)} | Оффлайн: ${formatTime(tf)}`;
}

function saveCustomEgg() {
    const val = getEl('custom-rarity-select').value;
    if (val === 'rare' && userLevel < 10) return showToast("Доступно с 10 уровня!", "❌");
    if (val === 'legendary' && userLevel < 20) return showToast("Доступно с 20 уровня!", "❌");
    
    playSound('click'); 
    closeModal('custom-egg-modal'); 
    updateUI();
}

// =============================================================
// ОСНОВНАЯ ЛОГИКА ТАЙМЕРА И ИНКУБАТОРА
// =============================================================
function startTimer(type) {
    if (isRunning) return;
    const m = MODES[currentModeIndex];
    if (userLevel < m.reqLevel) return showToast(`Доступно с ${m.reqLevel} уровня!`, "🔒");

    currentHatchMode = type;
    let t = type === 'online' ? m.timeOnline : m.timeOffline;
    if (m.id === 'custom') t = type === 'online' ? customEggConfig.timeOnline : customEggConfig.timeOffline;
    if (activeBoosters.speed) t = Math.max(1, Math.floor(t * 0.7));

    if (type === 'offline') {
        localStorage.setItem('offlineHatchStart', Date.now());
        localStorage.setItem('offlineHatchDuration', t);
        localStorage.setItem('offlineHatchMode', currentModeIndex);
        localStorage.setItem('offlineHatchCustom', JSON.stringify(customEggConfig));
        localStorage.setItem('offlineHatchBoosters', JSON.stringify(activeBoosters));
        
        consumeBoosters();
        showToast("Яйцо помещено в инкубатор!", "🥚");
        playSound('click');
        checkBackgroundHatch();
        return;
    }

    isRunning = true;
    timeLeft = t;
    consumeBoosters();
    
    let timerDisplay = getEl('timer'); if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    let sbc = getEl('start-buttons-container'); if (sbc) sbc.style.display = 'none';
    let mb = getEl('main-btn'); if (mb) mb.style.display = 'block';
    let hi = getEl('hatched-info'); if (hi) hi.style.display = 'none';
    let sb = getEl('share-btn'); if (sb) sb.style.display = 'none';
    let ow = getEl('offline-warning'); if (ow) ow.style.display = 'block';
    
    applyEggSkin();
    playSound('click');
    timerInterval = setInterval(tick, 1000);
}

function consumeBoosters() {
    if (activeBoosters.luck) { myBoosters.luck--; activeBoosters.luck = false; }
    if (activeBoosters.speed) { myBoosters.speed--; activeBoosters.speed = false; }
    if (activeBoosters.bio) { myBoosters.bio--; activeBoosters.bio = false; }
    saveData();
    renderBoosters();
}

function tick() {
    timeLeft--;
    let timerDisplay = getEl('timer');
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    updateCrackOverlay(timeLeft, MODES[currentModeIndex].timeOnline);

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        hatchEgg();
    }
}

function stopTimer() {
    if (!isRunning) return;
    playSound('click');
    clearInterval(timerInterval);
    
    getEl('resurrect-timer').textContent = "20";
    openModal('resurrect-modal');
    
    let rTime = 20;
    resurrectCountdownInterval = setInterval(() => {
        rTime--;
        getEl('resurrect-timer').textContent = rTime;
        if (rTime <= 0) {
            clearInterval(resurrectCountdownInterval);
            confirmFail(false);
        }
    }, 1000);
}

function resurrectEgg() {
    if (userStars >= 20) {
        userStars -= 20;
        updateBalanceUI();
        clearInterval(resurrectCountdownInterval);
        closeModal('resurrect-modal');
        showToast("Яйцо спасено!", "✨");
        playSound('win');
        timerInterval = setInterval(tick, 1000);
    } else {
        showToast("Недостаточно Звезд!", "❌");
        openBuyStarsModal();
    }
}

function confirmFail(manual) {
    clearInterval(resurrectCountdownInterval);
    closeModal('resurrect-modal');
    
    isRunning = false;
    let sbc = getEl('start-buttons-container'); if (sbc) sbc.style.display = 'flex';
    let mb = getEl('main-btn'); if (mb) mb.style.display = 'none';
    let ow = getEl('offline-warning'); if (ow) ow.style.display = 'none';
    let co = getEl('crack-overlay'); if (co) co.className = 'crack-overlay';
    
    let egg = getEl('egg-display'); 
    if (egg) egg.classList.remove('shaking');
    
    if (!manual) showToast("Вы отвлеклись! Яйцо разбито.", "💔");
    updateUI();
}

function updateCrackOverlay(left, total) {
    const p = left / total;
    let co = getEl('crack-overlay');
    if (!co) return;
    co.className = 'crack-overlay';
    if (p < 0.25) co.classList.add('crack-stage-3');
    else if (p < 0.5) co.classList.add('crack-stage-2');
    else if (p < 0.75) co.classList.add('crack-stage-1');
}

// =============================================================
// ВЫЛУПЛЕНИЕ
// =============================================================
function hatchEgg(isOffline = false, savedModeIndex = 0, customConf = null, bsts = null) {
    isRunning = false;
    let m = MODES[isOffline ? savedModeIndex : currentModeIndex];
    if (!m) m = MODES[0];
    
    let luckMult = (bsts && bsts.luck) || (!isOffline && activeBoosters.luck) ? 5 : 1;
    let isBio = (bsts && bsts.bio) || (!isOffline && activeBoosters.bio);
    let target = isOffline && customConf ? customConf.target : (m.id === 'custom' ? customEggConfig.target : 'all');

    let pool = [];
    if (isBio || m.id === 'radio') {
        pool = petDatabase.mutant;
    } else if (m.id === 'alien') {
        pool = [...petDatabase.legendary, ...petDatabase.mythic];
    } else if (target !== 'all') {
        pool = petDatabase[target] || petDatabase.common;
    } else {
        let r = Math.random() * 100;
        let legChance = (m.id === 'long' ? 5 : 1) * luckMult;
        let rareChance = 20 * luckMult;
        
        if (r < legChance) pool = petDatabase.legendary;
        else if (r < legChance + rareChance) pool = petDatabase.rare;
        else pool = petDatabase.common;
    }

    const newPet = pool[Math.floor(Math.random() * pool.length)];
    const rarity = getPetRarity(newPet);
    
    if (!petStars[newPet]) petStars[newPet] = 1;
    collection.push(newPet);
    
    if (!userStats.hatched) userStats.hatched = 0;
    userStats.hatched++;
    
    let xpGain = m.xpReward || 100;
    if (isVip()) xpGain = Math.floor(xpGain * 1.5);
    userXP += xpGain;
    
    while(userXP >= userLevel * 200) {
        userXP -= userLevel * 200;
        userLevel++;
        showToast(`Уровень ${userLevel}!`, "⬆️");
    }

    let egg = getEl('egg-display'); 
    if (egg) {
        egg.classList.remove('shaking', 'holo-egg');
        egg.src = getPetImg(newPet);
        egg.style.transform = 'scale(1.6)'; 
        egg.style.animation = 'popScale 0.5s ease-out';
    }
    
    let timerDisplay = getEl('timer'); if (timerDisplay) timerDisplay.textContent = "ГОТОВО!";
    let sbc = getEl('start-buttons-container'); if (sbc) sbc.style.display = 'flex';
    let mb = getEl('main-btn'); if (mb) mb.style.display = 'none';
    let ow = getEl('offline-warning'); if (ow) ow.style.display = 'none';
    let co = getEl('crack-overlay'); if (co) co.className = 'crack-overlay';
    
    let hi = getEl('hatched-info'); if (hi) hi.style.display = 'block';
    let hn = getEl('hatched-name'); if (hn) hn.textContent = PET_NAMES[newPet];
    let hr = getEl('hatched-rarity'); 
    if (hr) {
        hr.textContent = rarity;
        hr.className = `pet-rarity ${rarity}`;
    }
    
    let sb = getEl('share-btn'); if (sb) sb.style.display = 'block';

    if (rarity === 'legendary' || rarity === 'mythic' || rarity === 'mutant') {
        playSound('legendary');
    } else {
        playSound('win');
    }
    fireConfetti();

    if (isOffline) {
        localStorage.removeItem('offlineHatchStart');
        localStorage.removeItem('offlineHatchDuration');
        localStorage.removeItem('offlineHatchMode');
        localStorage.removeItem('offlineHatchCustom');
        localStorage.removeItem('offlineHatchBoosters');
    }

    saveData();
    updateLevelUI();
    updateContract('hatch', 1);
    checkAchievements();
    apiSyncGlobalProfile();
}

// =============================================================
// ОФФЛАЙН ИНКУБАТОР И ВТОРОЙ СЛОТ
// =============================================================
function checkBackgroundHatch() {
    if (isRunning) return;

    let start = parseInt(localStorage.getItem('offlineHatchStart'));
    let dur = parseInt(localStorage.getItem('offlineHatchDuration'));
    if (start && dur) {
        let passed = Math.floor((Date.now() - start) / 1000);
        if (passed >= dur) {
            let savedMode = parseInt(localStorage.getItem('offlineHatchMode')) || 0;
            let customConf = safeParse(localStorage.getItem('offlineHatchCustom'), null);
            let bsts = safeParse(localStorage.getItem('offlineHatchBoosters'), null);
            hatchEgg(true, savedMode, customConf, bsts);
        } else {
            let left = dur - passed;
            let timerDisplay = getEl('timer');
            if (timerDisplay) timerDisplay.textContent = formatTime(left);
            
            let sbc = getEl('start-buttons-container'); if (sbc) sbc.style.display = 'none';
            let egg = getEl('egg-display'); 
            if (egg) {
                egg.src = 'assets/eggs/egg-default.png';
                egg.classList.add('holo-egg');
            }
            
            setTimeout(checkBackgroundHatch, 1000);
        }
    }
}

function updateSecondSlotUI() {
    let panel = getEl('second-slot-panel');
    if (!panel) return;
    
    if (!hasSecondSlot) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';

    let start = parseInt(localStorage.getItem('ss_start'));
    let dur = parseInt(localStorage.getItem('ss_dur'));
    
    let idle = getEl('second-slot-idle');
    let act = getEl('second-slot-active');
    let done = getEl('second-slot-done');

    if (!start || !dur) {
        if (idle) idle.style.display = 'flex';
        if (act) act.style.display = 'none';
        if (done) done.style.display = 'none';
        if (secondSlotInterval) clearInterval(secondSlotInterval);
    } else {
        let passed = Math.floor((Date.now() - start) / 1000);
        if (passed >= dur) {
            if (idle) idle.style.display = 'none';
            if (act) act.style.display = 'none';
            if (done) done.style.display = 'flex';
            if (secondSlotInterval) clearInterval(secondSlotInterval);
        } else {
            if (idle) idle.style.display = 'none';
            if (act) act.style.display = 'flex';
            if (done) done.style.display = 'none';
            
            let sst = getEl('second-slot-timer');
            if (sst) sst.textContent = formatTime(dur - passed);
            
            if (secondSlotInterval) clearInterval(secondSlotInterval);
            secondSlotInterval = setInterval(updateSecondSlotUI, 1000);
        }
    }
}

function startSecondSlot() {
    playSound('click');
    let to = 6 * 3600; 
    localStorage.setItem('ss_start', Date.now());
    localStorage.setItem('ss_dur', to);
    updateSecondSlotUI();
    showToast("Яйцо во 2-м слоте!", "🥚");
}

function claimSecondSlot() {
    playSound('win');
    fireConfetti();
    localStorage.removeItem('ss_start');
    localStorage.removeItem('ss_dur');
    
    let pool = [...petDatabase.common, ...petDatabase.rare];
    if (Math.random() < 0.05) pool = petDatabase.legendary;
    
    const p = pool[Math.floor(Math.random() * pool.length)];
    collection.push(p);
    
    if (!userStats.hatched) userStats.hatched = 0;
    userStats.hatched++;
    
    showToast(`Вылупился ${PET_NAMES[p]}!`, "🎉");
    saveData();
    updateSecondSlotUI();
    checkAchievements();
    apiSyncGlobalProfile();
}

function updateBalanceUI() {
    let m = getEl('total-money'); if (m) m.innerHTML = `💰 ${walletBalance}`;
    let s = getEl('total-stars'); if (s) s.innerHTML = `⭐️ ${userStars} <span style="background:rgba(255,255,255,0.2); border-radius:50%; padding:0 5px; margin-left:4px;">+</span>`;
}

// =============================================================
// КОЛЛЕКЦИЯ И КАРТОЧКИ ПЕТОВ
// =============================================================
function openInventory() {
    playSound('click');
    const c = getEl('collection-container');
    if (!c) return;
    
    c.innerHTML = '';
    let counts = {};
    collection.forEach(p => counts[p] = (counts[p] || 0) + 1);

    ALL_PETS_FLAT.forEach(pet => {
        const d = document.createElement('div');
        const count = counts[pet] || 0;
        const rarity = getPetRarity(pet);
        const stars = petStars[pet] || 1;
        
        let starHtml = (count > 0 && stars > 1) ? `<div class="star-badge">⭐️${stars}</div>` : '';

        if (count > 0) {
            d.className = `pet-slot ${rarity}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count">x${count}</div>${starHtml}`;
            d.onclick = () => showPetDetails(pet, count, rarity, stars);
        } else {
            d.className = `pet-slot locked`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">`;
        }
        c.appendChild(d);
    });
    
    checkAchievements();
    openModal('inventory-modal');
}

function showPetDetails(pet, count, rarity, stars) {
    playSound('click');
    const v = getEl('pet-detail-view');
    if (!v) return;
    
    const price = PRICES[rarity] || 0;
    const isMaxStars = stars >= 5;
    const upgradeCost = price * stars * 2;
    
    let btnHtml = '';
    if (count > 1) {
        btnHtml = `<button class="btn sell-action" onclick="sellPet('${pet}', ${price})">Продать за ${price} <img src="assets/ui/coin.png" style="width:14px;vertical-align:middle"></button>`;
    } else {
        btnHtml = `<button class="btn locked">Единственный экземпляр</button>`;
    }
    
    let upgradeHtml = '';
    if (isMaxStars) {
        upgradeHtml = `<div style="text-align:center; color:#ffd700; font-weight:bold; margin-top:15px;">MAX LEVEL ⭐️5</div>`;
    } else {
        let cls = walletBalance >= upgradeCost ? 'btn' : 'btn locked';
        upgradeHtml = `<button class="${cls}" style="background:transparent; border:2px solid #00A3FF; color:#00A3FF; margin-top:10px;" onclick="upgradePetStars('${pet}', ${upgradeCost})">Прокачать до ⭐️${stars+1} (${upgradeCost} 💰)</button>`;
    }

    v.innerHTML = `
        <img src="assets/pets/pet-${pet}.png" class="pet-img-big" onerror="this.src='assets/eggs/egg-default.png'">
        <div class="pet-name">${PET_NAMES[pet]}</div>
        <div style="text-align:center; color:#ffd700; margin-bottom:10px; font-weight:bold;">Уровень: ⭐️${stars}</div>
        <div class="pet-rarity ${rarity}">${rarity}</div>
        <div class="pet-price">Ценность: ${price} <img src="assets/ui/coin.png" style="width:16px;vertical-align:middle"></div>
        ${btnHtml}
        ${upgradeHtml}
    `;
    
    openModal('pet-modal');
}

window.sellPet = function(pet, p) {
    const idx = collection.indexOf(pet);
    if (idx > -1) {
        collection.splice(idx, 1);
        walletBalance += p;
        saveData();
        updateBalanceUI();
        playSound('money');
        updateContract('sell', 1);
        openInventory(); 
        closeModal('pet-modal');
        showToast(`Продано за ${p}`, "💰");
    }
}

window.upgradePetStars = function(pet, cost) {
    if (walletBalance >= cost) {
        walletBalance -= cost;
        if (!petStars[pet]) petStars[pet] = 1;
        petStars[pet]++;
        
        saveData();
        updateBalanceUI();
        playSound('win');
        fireConfetti();
        showToast("Уровень повышен!", "⭐️");
        
        let counts = {};
        collection.forEach(p => counts[p] = (counts[p] || 0) + 1);
        showPetDetails(pet, counts[pet], getPetRarity(pet), petStars[pet]);
    }
}

// =============================================================
// ЛАБОРАТОРИЯ (КРАФТ И ДНК)
// =============================================================
function openCraft() {
    playSound('click');
    const c = getEl('craft-list');
    if (!c) return;
    
    c.innerHTML = '';
    let counts = {};
    collection.forEach(p => counts[p] = (counts[p] || 0) + 1);

    let rc = getEl('pegasus-shards-count'); if (rc) rc.textContent = pegasusShards;
    let jc = getEl('joker-count-display'); if (jc) jc.textContent = userJokers;
    
    let btn = getEl('craft-mythic-btn');
    if (btn) {
        if (pegasusShards >= 10) {
            btn.className = 'btn share';
            btn.textContent = 'СИНТЕЗ МИФИКА!';
        } else {
            btn.className = 'btn locked';
            btn.textContent = `Скрафтить Мифика (${pegasusShards}/10 🧩)`;
        }
    }

    const recipes = [
        { from: 'chick', to: 'fox', req: 3 },
        { from: 'puppy', to: 'lion', req: 3 },
        { from: 'fox', to: 'dragon', req: 5 },
        { from: 'lion', to: 'unicorn', req: 5 }
    ];

    recipes.forEach(r => {
        const d = document.createElement('div');
        d.className = 'shop-item';
        d.style.gridColumn = 'span 2';
        
        const hasCount = counts[r.from] || 0;
        let canCraft = hasCount >= r.req;
        let useJoker = false;
        
        if (!canCraft && hasCount === r.req - 1 && userJokers > 0) {
            canCraft = true;
            useJoker = true;
        }

        let cls = canCraft ? 'buy-btn' : 'buy-btn locked';
        let btnText = canCraft ? (useJoker ? 'Синтез (с Джокером)' : 'Синтез') : `${hasCount}/${r.req}`;

        d.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:10px;">
                <img src="assets/pets/pet-${r.from}.png" style="width:40px;" onerror="this.src='assets/eggs/egg-default.png'">
                <span style="color:#888">➔</span>
                <img src="assets/pets/pet-${r.to}.png" style="width:40px;" onerror="this.src='assets/eggs/egg-default.png'">
            </div>
            <button class="${cls}" onclick="craftPet('${r.from}', '${r.to}', ${r.req}, ${useJoker})">${btnText}</button>
        `;
        c.appendChild(d);
    });
    
    openModal('craft-modal');
}

window.craftPet = function(from, to, req, useJoker) {
    let counts = {};
    collection.forEach(p => counts[p] = (counts[p] || 0) + 1);
    
    if (useJoker) {
        if ((counts[from] || 0) < req - 1 || userJokers < 1) return;
        userJokers--;
        for(let i=0; i<req-1; i++) {
            collection.splice(collection.indexOf(from), 1);
        }
        showToast("Использован Ген Мутации!", "🧬");
    } else {
        if ((counts[from] || 0) < req) return;
        for(let i=0; i<req; i++) {
            collection.splice(collection.indexOf(from), 1);
        }
    }
    
    collection.push(to);
    if (!userStats.crafts) userStats.crafts = 0;
    userStats.crafts++;
    
    saveData();
    updateContract('craft', 1);
    checkAchievements();
    openCraft();
    playSound('win');
    fireConfetti();
    showToast(`Успешный синтез: ${PET_NAMES[to]}!`, "✨");
}

function startDnaPuzzle() {
    if (pegasusShards < 10) return;
    playSound('click');
    closeModal('craft-modal');
    openModal('dna-modal');
    
    dnaGrid = Array(9).fill(false);
    const g = getEl('dna-grid');
    if (!g) return;
    
    g.innerHTML = '';
    
    for (let i=0; i<9; i++) {
        let n = document.createElement('div');
        n.className = 'dna-node';
        n.onclick = () => tapDnaNode(i);
        g.appendChild(n);
    }
}

function tapDnaNode(i) {
    playSound('click');
    dnaGrid[i] = !dnaGrid[i];
    if (i > 0) dnaGrid[i-1] = !dnaGrid[i-1];
    if (i < 8) dnaGrid[i+1] = !dnaGrid[i+1];
    if (i - 3 >= 0) dnaGrid[i-3] = !dnaGrid[i-3];
    if (i + 3 <= 8) dnaGrid[i+3] = !dnaGrid[i+3];
    
    const nodes = document.querySelectorAll('.dna-node');
    nodes.forEach((n, idx) => {
        n.className = `dna-node ${dnaGrid[idx] ? 'active' : ''}`;
    });
    
    if (dnaGrid.every(x => x)) {
        setTimeout(finishMythicCraft, 500);
    }
}

function finishMythicCraft() {
    pegasusShards -= 10;
    collection.push('pegasus');
    if (!userStats.crafts) userStats.crafts = 0;
    userStats.crafts++;
    saveData();
    
    closeModal('dna-modal');
    openModal('mythic-craft-modal');
    playSound('legendary');
    
    let sil = getEl('mythic-silhouette');
    if (sil) {
        sil.src = 'assets/pets/pet-pegasus.png';
        sil.className = 'mythic-silhouette spinning';
        
        setTimeout(() => {
            sil.className = 'mythic-silhouette epic-flash';
            fireConfetti();
        }, 2000);
        
        setTimeout(() => {
            closeModal('mythic-craft-modal');
            showToast("ВЫ СОЗДАЛИ ПЕГАСА!", "🦄");
        }, 4000);
    }
}

// =============================================================
// ПАТИ (СЕТЕВОЙ МУЛЬТИПЛЕЕР)
// =============================================================
async function apiCreateParty() {
    playSound('click');
    const user = getTgUser();
    let finalName = user.name;
    if (isVip()) finalName += ' 👑';
    
    try {
        const res = await fetch(`${API_URL}/api/party/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        const data = await res.json();
        if (data.status === 'success') {
            currentPartyCode = data.partyCode;
            isPartyLeader = true;
            updatePartyUI();
            startPartyPolling();
        }
    } catch(e) {
        showToast("Ошибка соединения", "❌");
    }
}

async function apiJoinParty(codeParam = null) {
    playSound('click');
    let input = getEl('party-code-input');
    const code = codeParam || (input ? input.value.trim().toUpperCase() : '');
    if (!code) return;
    
    const user = getTgUser();
    let finalName = user.name;
    if (isVip()) finalName += ' 👑';

    try {
        const res = await fetch(`${API_URL}/api/party/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            currentPartyCode = code;
            isPartyLeader = false;
            if (input) input.value = '';
            updatePartyUI();
            startPartyPolling();
        } else {
            showToast(data.detail || "Не найдено", "❌");
        }
    } catch(e) {
        showToast("Сбой сети", "❌");
    }
}

async function apiLeaveParty() {
    playSound('click');
    if (!currentPartyCode) return;
    
    try {
        await fetch(`${API_URL}/api/party/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: getTgUser().id, name: "", avatar: "", egg_skin: "" })
        });
    } catch(e) {}
    
    currentPartyCode = null;
    isPartyLeader = false;
    currentActiveGame = 'none';
    if (partyPollingInterval) clearInterval(partyPollingInterval);
    
    updatePartyUI();
}

function updatePartyUI() {
    let psv = getEl('party-setup-view');
    let pav = getEl('party-active-view');
    let plc = getEl('party-leader-controls');
    let pmc = getEl('party-member-controls');
    
    if (!currentPartyCode) {
        if (psv) psv.style.display = 'block';
        if (pav) pav.style.display = 'none';
        return;
    }
    
    if (psv) psv.style.display = 'none';
    if (pav) pav.style.display = 'block';
    
    let cpc = getEl('current-party-code');
    if (cpc) cpc.textContent = currentPartyCode;
    
    if (plc) plc.style.display = isPartyLeader ? 'block' : 'none';
    if (pmc) pmc.style.display = isPartyLeader ? 'none' : 'block';
}

function startPartyPolling() {
    if (partyPollingInterval) clearInterval(partyPollingInterval);
    partyPollingInterval = setInterval(pollPartyStatus, 2000);
}

async function pollPartyStatus() {
    if (!currentPartyCode) return;
    
    try {
        const res = await fetch(`${API_URL}/api/party/status/${currentPartyCode}`);
        if (res.status === 404) {
            apiLeaveParty();
            showToast("Пати распущено", "ℹ️");
            return;
        }
        
        const data = await res.json();
        currentPartyPlayersData = data.players;
        isPartyLeader = (data.leader_id === String(getTgUser().id));
        
        let list = getEl('party-players-list');
        if (list) {
            list.innerHTML = '';
            data.players.forEach(p => {
                let isMe = p.user_id === String(getTgUser().id);
                let isLead = p.user_id === data.leader_id;
                list.innerHTML += `
                    <div class="player-slot ${isMe ? 'me' : ''}">
                        <div class="player-avatar-circle"><img src="${getPetImg(p.avatar)}" onerror="this.src='assets/ui/icon-profile.png'"></div>
                        <div class="player-name" style="${isLead ? 'color:#ffd700;' : ''}">${p.name} ${isLead ? '👑' : ''}</div>
                    </div>
                `;
            });
        }
        
        updatePartyUI();

        if (data.active_game !== currentActiveGame) {
            currentActiveGame = data.active_game;
            let rgb = getEl('return-game-btn');
            let cgb = getEl('cancel-game-btn');
            
            if (currentActiveGame === 'none') {
                if (rgb) rgb.style.display = 'none';
                if (cgb) cgb.style.display = 'none';
                closeModal('boss-raid-modal');
                closeModal('mega-egg-modal');
                closeModal('expedition-modal');
                bossIsDead = false;
            } else {
                if (rgb) rgb.style.display = 'block';
                if (cgb) cgb.style.display = isPartyLeader ? 'block' : 'none';
                forceOpenMiniGame(currentActiveGame);
            }
        }

        // Синхронизация состояний игр
        if (currentActiveGame === 'tap_boss' && !bossIsDead) {
            let fill = getEl('raid-hp-fill');
            let text = getEl('raid-hp-text');
            if (fill && text) {
                let p = (data.boss_hp / data.boss_max_hp) * 100;
                fill.style.width = `${p}%`;
                text.textContent = `${data.boss_hp} / ${data.boss_max_hp}`;
                
                if (data.boss_hp <= 0) {
                    bossIsDead = true;
                    if (isPartyLeader) requestStopMiniGame();
                    let rew = 1000 * currentPartyPlayersData.length;
                    walletBalance += rew;
                    saveData();
                    updateBalanceUI();
                    showToast(`Босс повержен! +${rew} 💰`, "🏆");
                    playSound('win');
                    fireConfetti();
                }
            }
        } else if (currentActiveGame === 'mega_egg') {
            let bar = getEl('mega-egg-bar');
            let text = getEl('mega-egg-text');
            if (bar && text) {
                let p = (data.mega_progress / data.mega_target) * 100;
                if (p > 100) p = 100;
                bar.style.width = `${p}%`;
                text.textContent = `${Math.floor(data.mega_progress/3600)} / ${Math.floor(data.mega_target/3600)} Часов`;
                
                let btn = getEl('mega-egg-claim-btn');
                if (btn) {
                    if (data.mega_progress >= data.mega_target) {
                        btn.style.display = isPartyLeader ? 'block' : 'none';
                    } else {
                        btn.style.display = 'none';
                        fetch(`${API_URL}/api/party/mega_egg/add`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: currentPartyCode, seconds: 2 * currentPartyPlayersData.length })
                        });
                    }
                }
            }
        } else if (currentActiveGame === 'expedition') {
            currentExpeditionEndTime = data.expedition_end;
            currentWolfHp = data.wolf_hp;
            isMegaRadarActive = data.mega_radar === 1;
            
            let btnStart = getEl('expedition-start-btn');
            let btnClaim = getEl('expedition-claim-btn');
            let wMsg = getEl('expedition-waiting-msg');
            let aView = getEl('expedition-active-view');
            let iView = getEl('expedition-info-view');
            
            if (currentExpeditionEndTime === 0) {
                if (iView) iView.style.display = 'block';
                if (aView) aView.style.display = 'none';
                if (btnStart) btnStart.style.display = isPartyLeader ? 'block' : 'none';
                if (wMsg) wMsg.style.display = isPartyLeader ? 'none' : 'block';
                updateExpeditionPreScore();
            } else {
                if (iView) iView.style.display = 'none';
                if (aView) aView.style.display = 'block';
                
                let mult = data.expedition_score;
                if (isMegaRadarActive) mult *= 2;
                let em = getEl('expedition-multiplier');
                if (em) em.textContent = mult;
                
                let sBadge = getEl('mega-radar-badge');
                if (sBadge) sBadge.style.display = isMegaRadarActive ? 'block' : 'none';
                
                let left = currentExpeditionEndTime - data.server_time;
                if (left <= 0) left = 0;
                
                let eTimer = getEl('expedition-timer');
                if (eTimer) eTimer.textContent = formatTime(left);
                
                if (btnClaim) btnClaim.style.display = (left === 0 && isPartyLeader) ? 'block' : 'none';
                
                let wOverlay = getEl('wolf-overlay');
                let wBar = getEl('wolf-hp-bar');
                if (wOverlay && wBar) {
                    if (currentWolfHp > 0 && left > 0) {
                        wOverlay.style.display = 'flex';
                        wBar.style.width = `${(currentWolfHp / data.wolf_max_hp) * 100}%`;
                    } else {
                        wOverlay.style.display = 'none';
                    }
                }
            }
        }
    } catch(e) {}
}

async function requestStartMiniGame(gameName) {
    playSound('click');
    if (!isPartyLeader) return;
    try {
        await fetch(`${API_URL}/api/party/set_game`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: gameName })
        });
    } catch(e) {}
}

async function requestStopMiniGame() {
    playSound('click');
    if (!isPartyLeader) return;
    try {
        await fetch(`${API_URL}/api/party/set_game`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: 'none' })
        });
    } catch(e) {}
}

function forceOpenMiniGame(gameName) {
    if (gameName === 'tap_boss') {
        openModal('boss-raid-modal');
        bossTimeLeft = 60;
        if (bossTimerInterval) clearInterval(bossTimerInterval);
        bossTimerInterval = setInterval(() => {
            bossTimeLeft--;
            let rt = getEl('raid-timer');
            if (rt) rt.textContent = bossTimeLeft.toFixed(1);
            if (bossTimeLeft <= 0) {
                clearInterval(bossTimerInterval);
                if (isPartyLeader) requestStopMiniGame();
                closeModal('boss-raid-modal');
                showToast("Время вышло! Рейд провален.", "💀");
            }
        }, 1000);
        spawnParasites();
    } else if (gameName === 'mega_egg') {
        openModal('mega-egg-modal');
    } else if (gameName === 'expedition') {
        openModal('expedition-modal');
        renderExpeditionPets();
    }
}

// =============================================================
// БОСС И ПАРАЗИТЫ
// =============================================================
let raidClickCount = 0;
function tapRaidBoss(e) {
    if (isStunned) return;
    raidClickCount++;
    playSound('click');
    
    let bossImg = getEl('raid-boss-img');
    if (bossImg) {
        bossImg.classList.remove('boss-hit-anim');
        void bossImg.offsetWidth; 
        bossImg.classList.add('boss-hit-anim');
    }
    
    if (raidClickCount >= 10) {
        raidClickCount = 0;
        fetch(`${API_URL}/api/party/damage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, damage: 50 })
        });
    }
}

function spawnParasites() {
    if (parasiteInterval) clearInterval(parasiteInterval);
    parasiteInterval = setInterval(() => {
        if (!getEl('boss-raid-modal') || getEl('boss-raid-modal').style.display === 'none') {
            clearInterval(parasiteInterval);
            return;
        }
        if (isStunned || Math.random() > 0.4) return;
        
        const pc = getEl('parasites-container');
        if (!pc) return;
        
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.width = '30px'; p.style.height = '30px';
        p.style.background = '#39ff14';
        p.style.borderRadius = '50%';
        p.style.boxShadow = '0 0 10px #39ff14';
        p.style.top = Math.random() * 80 + 10 + '%';
        p.style.left = Math.random() * 80 + 10 + '%';
        p.style.cursor = 'crosshair';
        p.style.zIndex = '100';
        
        let aliveTime = 0;
        let deathTimer = setInterval(() => {
            aliveTime += 100;
            if (aliveTime >= 3000) {
                clearInterval(deathTimer);
                if (p.parentNode) {
                    p.remove();
                    triggerStun();
                }
            }
        }, 100);
        
        p.onclick = (ev) => {
            ev.stopPropagation();
            clearInterval(deathTimer);
            p.remove();
            playSound('click');
        };
        
        pc.appendChild(p);
    }, 1500);
}

function triggerStun() {
    isStunned = true;
    let so = getEl('stun-overlay');
    if (so) so.style.display = 'block';
    showToast("ВАС ОГЛУШИЛО!", "💥");
    setTimeout(() => {
        isStunned = false;
        if (so) so.style.display = 'none';
    }, 3000);
}

// =============================================================
// МЕГА-ЯЙЦО И ЭКСПЕДИЦИИ
// =============================================================
window.claimMegaEgg = async function() {
    playSound('win');
    if (!isPartyLeader) return;
    try {
        await fetch(`${API_URL}/api/party/mega_egg/claim`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode })
        });
        requestStopMiniGame();
        
        let rew = 5000;
        walletBalance += rew;
        saveData();
        updateBalanceUI();
        showToast(`Мега-Яйцо расколото! +${rew} 💰`, "🌟");
        fireConfetti();
    } catch(e) {}
}

function selectExpeditionLocation(loc) {
    if (!isPartyLeader) return;
    currentExpeditionLocation = loc;
    playSound('click');
    document.querySelectorAll('#leader-location-selector .tab-btn').forEach(b => b.classList.remove('active'));
    let b = getEl(`loc-btn-${loc}`);
    if (b) b.classList.add('active');
    
    let scene = getEl('expedition-scene');
    if (scene) scene.className = `expedition-scene ${loc}-bg`;
}

function renderExpeditionPets() {
    let epc = getEl('expedition-pets-container');
    if (!epc) return;
    epc.innerHTML = '';
    currentPartyPlayersData.forEach(p => {
        epc.innerHTML += `<img src="${getPetImg(p.avatar)}" class="expedition-pet walking-pet" onerror="this.src='assets/ui/icon-profile.png'">`;
    });
}

function updateExpeditionPreScore() {
    let score = 0; let farmCount = 0; let predCount = 0;
    currentPartyPlayersData.forEach(p => {
        let a = p.avatar;
        if (["unicorn","dragon","alien","robot","dino","fireball","god"].includes(a)) score += 10;
        else if (["fox","panda","tiger","lion","cow","pig","monkey","owl"].includes(a)) score += 3;
        else score += 1;
        
        if (["cow","pig","duck"].includes(a)) farmCount++;
        if (["kitten","tiger","lion","fox"].includes(a)) predCount++;
    });
    
    let synText = "Нет синергии";
    if (farmCount >= 3) { score = Math.floor(score * 1.5); synText = "Ферма (Множитель x1.5)"; }
    if (predCount >= 2) { synText = "Хищники (Ускорение)"; }
    
    let eps = getEl('expedition-pre-score'); if (eps) eps.textContent = score;
    let sd = getEl('synergy-display'); if (sd) sd.textContent = synText;
}

window.buyMegaRadar = async function() {
    if (userStars < 100) return showToast("Мало звезд!", "❌");
    playSound('click');
    userStars -= 100;
    updateBalanceUI();
    saveData();
    try {
        await fetch(`${API_URL}/api/party/radar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode })
        });
        showToast("Мега-Радар включен!", "📡");
    } catch(e) {}
}

window.startExpedition = async function() {
    if (!isPartyLeader) return;
    playSound('click');
    try {
        await fetch(`${API_URL}/api/party/expedition/start`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, location: currentExpeditionLocation })
        });
    } catch(e) {}
}

window.claimExpedition = async function() {
    if (!isPartyLeader) return;
    playSound('win');
    
    let mult = parseInt(getEl('expedition-multiplier').textContent) || 1;
    let rew = 500 * mult;
    walletBalance += rew;
    saveData();
    updateBalanceUI();
    showToast(`Экспедиция завершена! +${rew} 💰`, "🗺");
    fireConfetti();
    
    try {
        await fetch(`${API_URL}/api/party/expedition/claim`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode })
        });
        requestStopMiniGame();
    } catch(e) {}
}

let wolfClickCount = 0;
window.tapWolf = function() {
    wolfClickCount++;
    playSound('click');
    let img = getEl('wolf-img');
    if (img) {
        img.classList.remove('wolf-hit');
        void img.offsetWidth;
        img.classList.add('wolf-hit');
    }
    if (wolfClickCount >= 5) {
        wolfClickCount = 0;
        fetch(`${API_URL}/api/party/expedition/wolf_damage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, damage: 10 })
        });
    }
}

// =============================================================
// РЫНОК (ГЛОБАЛЬНАЯ ТОРГОВЛЯ)
// =============================================================
async function openMarketModal() {
    openModal('market-modal');
    switchMarketTab('all');
    await loadMarket();
}

window.openMarketModal = openMarketModal;

function switchMarketTab(tab) {
    currentMarketTab = tab;
    document.querySelectorAll('#market-modal .tab-btn').forEach(b => b.classList.remove('active'));
    let activeBtn = getEl(`market-tab-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');
    loadMarket();
    playSound('click');
}

window.switchMarketTab = switchMarketTab;

async function loadMarket() {
    const grid = getEl('market-items-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center; color:#888; grid-column: 1 / -1; padding: 20px;">Загрузка товаров... ⏳</div>';
    
    try {
        const res = await fetch(`${API_URL}/api/market/list`);
        const data = await res.json();
        let lots = data.lots || [];
        
        if (currentMarketTab !== 'all') {
            lots = lots.filter(l => l.currency === currentMarketTab);
        }
        
        if (lots.length === 0) {
            grid.innerHTML = '<div style="text-align:center; color:#888; grid-column: 1 / -1; padding: 20px;">Рынок пуст. Стань первым продавцом! 💸</div>';
            return;
        }
        
        grid.innerHTML = '';
        lots.forEach(lot => {
            const r = getPetRarity(lot.pet_id);
            const petName = PET_NAMES[lot.pet_id] || "Питомец";
            const stars = lot.pet_stars || 1;
            let starStr = stars > 1 ? `<div class="star-badge" style="top:5px; right:5px; left:auto;">⭐️${stars}</div>` : '';
            
            const isMyLot = lot.seller_id === String(getTgUser().id);
            let btnHtml = '';
            
            if (isMyLot) {
                btnHtml = `<button class="btn locked" style="padding: 8px; font-size: 12px; margin-top: 10px;">Твой лот</button>`;
            } else {
                const currIcon = lot.currency === 'coins' ? '💰' : '⭐️';
                btnHtml = `<button class="btn" style="background: #00A3FF; padding: 8px; font-size: 12px; margin-top: 10px; box-shadow:0 2px 10px rgba(0,163,255,0.4);" onclick="buyMarketLot('${lot.lot_id}', ${lot.price}, '${lot.currency}')">Купить за ${lot.price} ${currIcon}</button>`;
            }

            const d = document.createElement('div');
            d.className = `pet-slot ${r}`;
            d.style.display = 'flex';
            d.style.flexDirection = 'column';
            d.style.height = 'auto';
            d.style.padding = '15px 10px';
            d.style.pointerEvents = 'auto'; 
            
            d.innerHTML = `
                <div style="position:relative; width:100%; display:flex; justify-content:center;">
                    <img src="assets/pets/pet-${lot.pet_id}.png" style="width: 70px; height: 70px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); pointer-events:none;" onerror="this.src='assets/eggs/egg-default.png'">
                    ${starStr}
                </div>
                <div style="font-size: 13px; font-weight: bold; margin-top: 10px; text-align:center;">${petName}</div>
                <div style="font-size: 10px; color: #888; text-align:center; margin-top: 4px;">Продавец: ${lot.seller_name}</div>
                ${btnHtml}
            `;
            grid.appendChild(d);
        });
    } catch(e) {
        grid.innerHTML = '<div style="text-align:center; color:#ff3b30; grid-column: 1 / -1; padding: 20px;">Ошибка сети. Сервер недоступен.</div>';
    }
}

window.loadMarket = loadMarket;

async function buyMarketLot(lotId, price, currency) {
    if (currency === 'coins' && walletBalance < price) return showToast("Мало монет!", "❌");
    if (currency === 'stars' && userStars < price) {
        showToast("Мало звезд!", "❌");
        return openBuyStarsModal();
    }
    
    playSound('click');
    
    try {
        const res = await fetch(`${API_URL}/api/market/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lot_id: lotId, buyer_id: String(getTgUser().id) })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            if (currency === 'coins') walletBalance -= price;
            if (currency === 'stars') userStars -= price;
            
            const boughtPet = data.lot.pet_id;
            const boughtStars = data.lot.pet_stars || 1;
            
            collection.push(boughtPet);
            
            if (!petStars[boughtPet] || petStars[boughtPet] < boughtStars) {
                petStars[boughtPet] = boughtStars;
            }
            
            saveData();
            updateBalanceUI();
            loadMarket(); 
            
            showToast(`Успешная покупка: ${PET_NAMES[boughtPet]}!`, "🎉");
            playSound('win');
            fireConfetti();
        } else {
            showToast(data.detail, "❌");
            loadMarket();
        }
    } catch(e) {
        showToast("Ошибка транзакции", "❌");
    }
}

window.buyMarketLot = buyMarketLot;

function openSellModal() {
    selectedPetForSale = null;
    const sel = getEl('sell-pet-selector');
    if (!sel) return;
    sel.innerHTML = '';
    
    const uniquePets = [...new Set(collection)];
    if (uniquePets.length === 0) {
        sel.innerHTML = '<div style="color:#888; font-size:12px;">У вас нет питомцев для продажи.</div>';
    } else {
        uniquePets.forEach(pet => {
            const r = getPetRarity(pet);
            const stars = petStars[pet] || 1;
            const d = document.createElement('div');
            d.className = `pet-slot ${r}`;
            d.style.minWidth = '65px';
            d.style.height = '65px';
            d.style.borderRadius = '12px';
            d.style.cursor = 'pointer';
            d.style.pointerEvents = 'auto';
            
            let starStr = stars > 1 ? `<div class="star-badge" style="font-size:8px;">⭐️${stars}</div>` : '';
            
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" style="width:70%;height:70%;object-fit:contain; pointer-events:none;" onerror="this.src='assets/eggs/egg-default.png'">${starStr}`;
            d.onclick = () => selectPetToSell(pet, stars);
            sel.appendChild(d);
        });
    }
    
    getEl('selected-pet-to-sell').style.display = 'none';
    getEl('confirm-sell-btn').disabled = true;
    getEl('sell-price-input').value = '';
    
    openModal('sell-pet-modal');
}

window.openSellModal = openSellModal;

function selectPetToSell(pet, stars) {
    selectedPetForSale = pet;
    playSound('click');
    
    getEl('selected-pet-to-sell').style.display = 'block';
    getEl('sell-preview-img').src = `assets/pets/pet-${pet}.png`;
    getEl('sell-preview-name').textContent = PET_NAMES[pet] || "Питомец";
    getEl('sell-preview-stars').textContent = stars > 1 ? `Уровень: ⭐️${stars}` : '';
    
    getEl('confirm-sell-btn').disabled = false;
}

async function submitSellPet() {
    if (!selectedPetForSale) return;
    
    const priceInput = getEl('sell-price-input').value;
    const price = parseInt(priceInput);
    const currency = getEl('sell-currency-select').value;
    
    if (!price || price <= 0) return showToast("Укажите корректную цену!", "❌");
    
    const user = getTgUser();
    let finalName = user.name;
    if (isVip()) finalName += ' 👑';
    
    const stars = petStars[selectedPetForSale] || 1;
    
    const btn = getEl('confirm-sell-btn');
    const origText = btn.textContent;
    btn.textContent = "Публикация...";
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/api/market/sell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                seller_id: user.id,
                seller_name: finalName,
                pet_id: selectedPetForSale,
                pet_stars: stars,
                price: price,
                currency: currency
            })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            const idx = collection.indexOf(selectedPetForSale);
            if (idx > -1) collection.splice(idx, 1);
            
            if (!collection.includes(selectedPetForSale)) {
                delete petStars[selectedPetForSale];
            }
            
            saveData();
            updateBalanceUI();
            closeModal('sell-pet-modal');
            showToast("Питомец выставлен на продажу!", "✅");
            playSound('money');
            
            loadMarket();
        } else {
            showToast("Ошибка при создании лота", "❌");
        }
    } catch(e) {
        showToast("Сбой сети", "❌");
    }
    
    btn.textContent = origText;
    btn.disabled = false;
}

window.submitSellPet = submitSellPet;

// =============================================================
// ЗАПУСК ИГРЫ
// =============================================================
window.onload = initGame;