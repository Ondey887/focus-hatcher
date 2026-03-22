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
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
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
const API_URL = "https://focushatcher-ondey.amvera.io/api"; 
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 

const socket = io("https://focushatcher-ondey.amvera.io");

let modalStack = [];
// Основной прогресс
let collection = [];
let userXP = 0;
let userLevel = 1;
let walletBalance = 0;
let userStars = 0;
let pegasusShards = 0;
let userJokers = 0; 
let dustBalance = 0; 
let hatchStreak = 0; 
let lastHatchDate = ""; 

// НОВОЕ: Данные Battle Pass
let claimedRewards = [];
let mythicTickets = 0;

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
let activeContracts = { date: '', allClaimed: false, tasks: [] }; 

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
    { id: 'radio', timeOnline: 5 * 60, timeOffline: 1 * 3600, xpReward: 500, egg: 'glow', title: 'Радиоактивное (5 мин)', sub: 'Только Мутанты ☢️ (Нужен бустер 💉)', reqLevel: 50 },
    { id: 'anomal', timeOnline: 45 * 60, timeOffline: 45 * 60, xpReward: 2000, egg: 'glitch', title: 'Аномальное (45 мин)', sub: 'Только в выходные (50 ✨)', reqLevel: 1 }
];

const PRICES = { 
    common: 15, rare: 150, epic: 1500, legendary: 5000, mythic: 50000, mutant: 10000, glitch: 7777
};

const RANKS = [
    "Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Мифик", "Создатель"
];

const PET_NAMES = {
    "chick": "Цыпленок", "kitten": "Котенок", "puppy": "Щенок", "hamster": "Хомяк", "bunny": "Зайчик",
    "frog": "Лягушка", "bear": "Мишка", "koala": "Коала", "duck": "Утенок", "caterpillar": "Гусеница",
    "fox": "Лисенок", "panda": "Панда", "tiger": "Тигренок", "lion": "Львенок", "cow": "Коровка",
    "pig": "Свинка", "monkey": "Обезьянка", "owl": "Сова",
    "raccoon": "Енот", "panther": "Пантера",
    "unicorn": "Единорог", "dragon": "Дракон", "alien": "Пришелец", "robot": "Робот", "dino": "Динозавр",
    "fireball": "Огонек", "god": "Бог Фокуса", "pegasus": "Мифический Пегас",
    "cerberus": "Цербер", "dark_dragon": "Темный Дракон",
    "mutant_cat": "Мутакот ☢️", "mutant_dog": "Токси-Пёс ☢️", "mutant_dragon": "Гамма-Ящер ☢️",
    "cyber_cat": "Кибер-Кот 👾", "matrix_dog": "Матричный Пёс 👾"
};

const petDatabase = {
    common: ["chick", "kitten", "puppy", "hamster", "bunny", "frog", "bear", "koala", "duck", "caterpillar"],
    rare: ["fox", "panda", "tiger", "lion", "cow", "pig", "monkey", "owl"],
    epic: ["raccoon", "panther"],
    legendary: ["unicorn", "dragon", "alien", "robot", "dino", "fireball"],
    mythic: ["pegasus", "cerberus", "dark_dragon"],
    mutant: ["mutant_cat", "mutant_dog", "mutant_dragon"],
    glitch: ["cyber_cat", "matrix_dog"]
};

const ALL_PETS_FLAT = [
    ...petDatabase.common, ...petDatabase.rare, ...petDatabase.epic, 
    ...petDatabase.legendary, ...petDatabase.mythic, ...petDatabase.mutant,
    ...petDatabase.glitch, "god"
];

const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

function getPetRarity(p) {
    if (p === "god") return 'legendary';
    if (petDatabase.mythic.includes(p)) return 'mythic';
    if (petDatabase.mutant.includes(p)) return 'mutant';
    if (petDatabase.glitch.includes(p)) return 'glitch'; 
    if (petDatabase.legendary.includes(p)) return 'legendary';
    if (petDatabase.epic.includes(p)) return 'epic'; 
    if (petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}

// === НОВОЕ: ГЕНЕРАЦИЯ BATTLE PASS ===
const BATTLE_PASS_REWARDS = [];
for (let i = 1; i <= 100; i++) {
    let free = { type: 'money', val: i * 50, icon: '💰', name: `${i*50} Монет` };
    let pro = { type: 'dust', val: i * 2, icon: '✨', name: `${i*2} Пыли` };

    if (i % 5 === 0) { free = { type: 'luck', val: 1, icon: '🧪', name: 'Удача x1' }; pro = { type: 'stars', val: 10, icon: '⭐️', name: '10 Звезд' }; }
    if (i % 10 === 0) { free = { type: 'speed', val: 2, icon: '⚡️', name: 'Ускоритель x2' }; pro = { type: 'bio', val: 1, icon: '💉', name: 'Биодобавка x1' }; }

    // Главные Майлстоуны
    if (i === 15) { pro = { type: 'mythic_ticket', val: 1, icon: '🎫', name: 'Билет Рулетки' }; }
    if (i === 30) { free = { type: 'pet', val: 'alien', icon: 'assets/pets/pet-alien.png', name: 'Пришелец' }; pro = { type: 'joker', val: 1, icon: '🧬', name: 'Ген Мутации' }; }
    if (i === 50) { free = { type: 'pet', val: 'god', icon: 'assets/pets/pet-god.png', name: 'Бог Фокуса' }; pro = { type: 'theme', val: 'matrix', icon: '🌌', name: 'Фон: Матрица' }; }
    if (i === 75) { free = { type: 'pet', val: 'pegasus', icon: 'assets/pets/pet-pegasus.png', name: 'Пегас' }; pro = { type: 'mythic_ticket', val: 3, icon: '🎫', name: 'Билеты x3' }; }
    if (i === 100) { free = { type: 'pet', val: 'dark_dragon', icon: 'assets/pets/pet-dark_dragon.png', name: 'Тёмный Дракон' }; pro = { type: 'stars', val: 500, icon: '⭐️', name: '500 Звезд' }; }

    BATTLE_PASS_REWARDS.push({ level: i, free, pro });
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
}

// =============================================================
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
        activeContracts.allClaimed = false; 
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
    
    userXP += 30;
    
    let allCompleted = activeContracts.tasks.every(task => task.c);
    if (allCompleted && !activeContracts.allClaimed) {
        userXP += 500;
        activeContracts.allClaimed = true;
        setTimeout(() => showToast('БОНУС +500 XP за 3 контракта!', '🔥'), 1000);
    }
    
    while (userXP >= userLevel * 200) { 
        userXP -= userLevel * 200; 
        userLevel++; 
        showToast(`Lvl UP: ${userLevel} 🏆`, "🎉"); 
        playSound('win'); 
    }

    saveData(); 
    updateBalanceUI(); 
    updateLevelUI();
    renderQuests();
    showToast(`Награда получена! (+30 XP)`, '🎁'); 
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
            dustBalance = parseInt(localStorage.getItem('dustBalance')) || 0; 
            
            // Загрузка BATTLE PASS
            claimedRewards = safeParse(localStorage.getItem('claimedRewards'), []);
            mythicTickets = parseInt(localStorage.getItem('mythicTickets')) || 0;
            
            hatchStreak = parseInt(localStorage.getItem('hatchStreak')) || 0;
            lastHatchDate = localStorage.getItem('lastHatchDate') || "";
            
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
            activeContracts = safeParse(localStorage.getItem('activeContracts'), { date: '', allClaimed: false, tasks: [] });
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
        'lastRouletteDate', 'lastSaveTime', 'boxAdsProgress', 'petStars', 'activeContracts',
        'hatchStreak', 'lastHatchDate', 'dustBalance', 'claimedRewards', 'mythicTickets'
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
                if (values.dustBalance) dustBalance = parseInt(values.dustBalance);
                
                if (values.claimedRewards) claimedRewards = safeParse(values.claimedRewards, []);
                if (values.mythicTickets) mythicTickets = parseInt(values.mythicTickets);
                
                if (values.hatchStreak) hatchStreak = parseInt(values.hatchStreak);
                if (values.lastHatchDate) lastHatchDate = values.lastHatchDate;
                
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
                if (values.activeContracts) activeContracts = safeParse(values.activeContracts, { date: '', allClaimed: false, tasks: [] });

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
    localStorage.setItem('dustBalance', dustBalance); 
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
    localStorage.setItem('mythicTickets', mythicTickets);
    localStorage.setItem('hatchStreak', hatchStreak); 
    localStorage.setItem('lastHatchDate', lastHatchDate); 
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
        Telegram.WebApp.CloudStorage.setItem('dustBalance', dustBalance.toString());
        Telegram.WebApp.CloudStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
        Telegram.WebApp.CloudStorage.setItem('mythicTickets', mythicTickets.toString());
        Telegram.WebApp.CloudStorage.setItem('hatchStreak', hatchStreak.toString());
        Telegram.WebApp.CloudStorage.setItem('lastHatchDate', lastHatchDate);
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
// ПРОФИЛЬ, ДРУЗЬЯ И BATTLE PASS (УРОВНИ)
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
        await fetch(`${API_URL}/users/sync`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: user.id, 
                name: finalName, 
                avatar: selectedAvatar, 
                level: userLevel, 
                earned: netWorth, 
                hatched: userStats.hatched || 0,
                dust: dustBalance,
                claimed_rewards: JSON.stringify(claimedRewards),
                mythic_tickets: mythicTickets
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
            const res = await fetch(`${API_URL}/invites/check/${getTgUser().id}`);
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
            await fetch(`${API_URL}/invites/clear`, { 
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
        const res = await fetch(`${API_URL}/friends/add`, {
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
        const res = await fetch(`${API_URL}/friends/list/${getTgUser().id}`); 
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
        await fetch(`${API_URL}/invites/send`, { 
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

// === НОВОЕ: ОТРИСОВКА BATTLE PASS ===
function openLevels() {
    const list = getEl('battle-pass-list'); 
    if (!list) return;
    
    let banner = getEl('pro-pass-banner');
    if (banner) {
        if (isVip()) {
            banner.innerHTML = `
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #ffd700; font-size: 14px;">Focus PRO 👑 Активен</div>
                    <div style="font-size: 10px; color: #ccc;">Все премиум-награды доступны!</div>
                </div>
            `;
        } else {
            banner.innerHTML = `
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #00A3FF; font-size: 14px;">Focus PRO 👑</div>
                    <div style="font-size: 10px; color: #ccc;">Разблокируй нижнюю линию наград!</div>
                </div>
                <button id="buy-pro-pass-btn" class="btn small" style="background: #00A3FF; width: auto; margin: 0;" onclick="closeModal('levels-modal'); openShop();">Купить PRO</button>
            `;
        }
    }

    list.innerHTML = '';
    
    BATTLE_PASS_REWARDS.forEach(bp => {
        const isReached = userLevel >= bp.level;
        const freeClaimed = claimedRewards.includes(`${bp.level}_free`);
        const proClaimed = claimedRewards.includes(`${bp.level}_pro`);
        
        const div = document.createElement('div'); 
        div.className = `bp-level-row ${isReached ? 'completed' : ''}`;
        
        // Free Track
        let freeBtn = '';
        if (freeClaimed) freeBtn = `<button class="bp-btn claimed" disabled>✅</button>`;
        else if (isReached) freeBtn = `<button class="bp-btn" onclick="claimBpReward(${bp.level}, 'free')">Забрать</button>`;
        else freeBtn = `<button class="bp-btn" disabled>🔒</button>`;
        
        let freeIcon = bp.free.icon.includes('.') ? `<img src="${bp.free.icon}" class="bp-reward-icon">` : `<div class="bp-reward-icon" style="font-size:20px;">${bp.free.icon}</div>`;

        // Pro Track
        let proBtn = '';
        let proLock = !isVip() ? `<div class="bp-lock-icon">🔒</div>` : '';
        let proTrackClass = `bp-track pro ${!isVip() ? 'locked' : ''}`;

        if (proClaimed) proBtn = `<button class="bp-btn claimed" disabled>✅</button>`;
        else if (isReached && isVip()) proBtn = `<button class="bp-btn" onclick="claimBpReward(${bp.level}, 'pro')">Забрать</button>`;
        else proBtn = `<button class="bp-btn" disabled>🔒</button>`;
        
        let proIcon = bp.pro.icon.includes('.') ? `<img src="${bp.pro.icon}" class="bp-reward-icon">` : `<div class="bp-reward-icon" style="font-size:20px;">${bp.pro.icon}</div>`;

        div.innerHTML = `
            <div class="bp-level-number">Ур.<br>${bp.level}</div>
            <div class="bp-tracks">
                <div class="bp-track">
                    <div class="bp-reward-info">${freeIcon}<div class="bp-reward-text">${bp.free.name}</div></div>
                    ${freeBtn}
                </div>
                <div class="${proTrackClass}">
                    ${proLock}
                    <div class="bp-reward-info">${proIcon}<div class="bp-reward-text">${bp.pro.name}</div></div>
                    ${proBtn}
                </div>
            </div>
        `;
        list.appendChild(div);
    });
    openModal('levels-modal');
}

// === НОВОЕ: ПОЛУЧЕНИЕ НАГРАДЫ BATTLE PASS ===
window.claimBpReward = function(level, type) {
    if (userLevel < level) return;
    if (type === 'pro' && !isVip()) return showToast("Нужен статус Focus PRO!", "👑");
    
    let claimKey = `${level}_${type}`;
    if (claimedRewards.includes(claimKey)) return;
    
    let bp = BATTLE_PASS_REWARDS.find(x => x.level === level);
    if (!bp) return;
    
    let reward = type === 'free' ? bp.free : bp.pro;
    
    if (reward.type === 'money') walletBalance += reward.val;
    if (reward.type === 'dust') dustBalance += reward.val;
    if (reward.type === 'stars') userStars += reward.val;
    if (reward.type === 'luck') { myBoosters.luck = (myBoosters.luck || 0) + reward.val; }
    if (reward.type === 'speed') { myBoosters.speed = (myBoosters.speed || 0) + reward.val; }
    if (reward.type === 'bio') { myBoosters.bio = (myBoosters.bio || 0) + reward.val; }
    if (reward.type === 'joker') { userJokers += reward.val; }
    if (reward.type === 'mythic_ticket') { mythicTickets += reward.val; }
    if (reward.type === 'pet') {
        collection.push(reward.val);
        showToast(`Получен уникальный питомец: ${PET_NAMES[reward.val]}!`, "🎁");
    }
    if (reward.type === 'theme') {
        if (!ownedItems.themes.includes(reward.val)) ownedItems.themes.push(reward.val);
        showToast(`Новый фон разблокирован!`, "🌌");
    }

    claimedRewards.push(claimKey);
    saveData();
    updateBalanceUI();
    openLevels(); 
    playSound('win');
    fireConfetti();
    showToast(`Награда получена!`, "✅");
};

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
    
    // Подсветка для Батл Пасса
    let hasBpReward = false;
    BATTLE_PASS_REWARDS.forEach(bp => {
        if (userLevel >= bp.level) {
            if (!claimedRewards.includes(`${bp.level}_free`)) hasBpReward = true;
            if (isVip() && !claimedRewards.includes(`${bp.level}_pro`)) hasBpReward = true;
        }
    });

    let badge = getEl('ach-badge');
    if (badge) {
        badge.style.display = (has || hasBpReward) ? 'block' : 'none';
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
        await fetch(`${API_URL}/party/join`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin }) 
        }); 
    } catch(e) {}
}

// =============================================================
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

function openAch() { 
    switchAchTab('achievements'); 
    openModal('achievements-modal'); 
}

function renderShop() {
    const c = getEl('shop-items'); 
    if (!c) return;
    
    c.innerHTML = '';
    
    if (currentShopTab === 'shadow') {
        c.innerHTML = `
            <div class="shop-item" style="grid-column: span 2; background: rgba(138, 43, 226, 0.1); border: 1px solid #8a2be2;">
                <div style="font-size: 30px;">🧩</div>
                <div class="shop-item-name">Осколок Пегаса</div>
                <div style="font-size:12px;color:#ccc;margin-bottom:10px;">Для крафта Мифика</div>
                <button class="buy-btn" style="background: #8a2be2;" onclick="buyShadowItem('shard', 250)">Купить (250 ✨)</button>
            </div>
        `;
        return;
    }
    
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

window.buyShadowItem = function(type, price) {
    if (dustBalance >= price) {
        dustBalance -= price;
        if (type === 'shard') pegasusShards++;
        
        saveData();
        updateBalanceUI();
        renderShop();
        playSound('win');
        showToast("Осколок куплен!", "🌑");
    } else {
        showToast("Недостаточно Пыли!", "❌");
    }
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
        const res = await fetch(`${API_URL}/forbes/${getTgUser().id}`);
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
// РУЛЕТКА И РЕКЛАМА
// =============================================================
// === ИЗМЕНЕНИЕ: ЛОГИКА БИЛЕТОВ В РУЛЕТКЕ ===
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
        if (type === 'mythic' && mythicTickets > 0) {
            paidBtn.textContent = `Крутить за Билет 🎫 (${mythicTickets} шт)`;
        } else {
            paidBtn.textContent = `Крутить за ${cost} ⭐️`;
        }
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

// === ИЗМЕНЕНИЕ: ЛОГИКА БИЛЕТОВ В РУЛЕТКЕ ===
function spinRoulette(method) {
    let cost = 10;
    if (currentBoxType === 'epic') cost = 25;
    if (currentBoxType === 'mythic') cost = 50;

    if (method === 'stars') {
        if (currentBoxType === 'mythic' && mythicTickets > 0) {
            mythicTickets -= 1;
            showToast("Использован Билет Рулетки!", "🎫");
        } else {
            if (userStars < cost) {
                showToast("Недостаточно Звезд!", "❌");
                openBuyStarsModal();
                return;
            }
            userStars -= cost;
        }
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
        switchRouletteBox(currentBoxType); // Обновляем кнопку, если потратили билет
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
        const res = await fetch(`${API_URL}/payment/invoice`, {
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
        const res = await fetch(`${API_URL}/promo/activate`, {
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
        const res = await fetch(`${API_URL}/admin/promo/create`, {
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
}

// =============================================================
// БАЗОВЫЙ ТАЙМЕР И ФОКУС
// =============================================================
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning && currentHatchMode === 'online') {
        stopTimer(true); 
    }
});

function updateBalanceUI() {
    let moneyEl = getEl('total-money'); 
    if (moneyEl) moneyEl.innerHTML = `<img src="assets/ui/coin.png" class="coin-img"> ${walletBalance}`;
    
    let dustEl = getEl('total-dust');
    if (dustEl) dustEl.innerHTML = `✨ ${dustBalance}`;
    
    let starsEl = getEl('total-stars');
    if (starsEl) starsEl.innerHTML = `<span style="font-size: 20px; margin-right: 4px;">⭐️</span> ${userStars} <span style="font-size: 14px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 8px; margin-left: 5px;">+</span>`;
    
    let uc = getEl('unique-count'); 
    if (uc) uc.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    
    checkAchievements();
    renderBoostersPanel();
}

function renderBoostersPanel() {
    const p = getEl('boosters-panel'); 
    if (!p) return;
    
    p.innerHTML = '';
    p.appendChild(createBoosterBtn('luck', 'assets/ui/booster-luck.png', myBoosters.luck || 0, activeBoosters.luck));
    p.appendChild(createBoosterBtn('speed', 'assets/ui/booster-speed.png', myBoosters.speed || 0, activeBoosters.speed));
    p.appendChild(createBoosterBtn('bio', '💉', myBoosters.bio || 0, activeBoosters.bio)); 
}

function createBoosterBtn(type, content, count, isActive) {
    const d = document.createElement('div');
    d.className = `booster-slot ${isActive ? 'active' : ''} ${count === 0 ? 'empty' : ''}`;
    
    let inner = content.includes('.png') ? `<img src="${content}">` : `<div style="font-size:30px;">${content}</div>`;
    d.innerHTML = `${inner} <div class="booster-count">${count}</div>`;
    
    d.onclick = () => {
        if (count > 0 && !isRunning) { 
            activeBoosters[type] = !activeBoosters[type]; 
            renderBoostersPanel(); 
            updateUI(); 
            playSound('click');
        }
    };
    return d;
}

function prevMode() { 
    if (!isRunning) { 
        currentModeIndex--; 
        if (currentModeIndex < 0) currentModeIndex = MODES.length - 1; 
        updateUI(); 
        playSound('click'); 
    }
}

function nextMode() { 
    if (!isRunning) { 
        currentModeIndex++; 
        if (currentModeIndex >= MODES.length) currentModeIndex = 0; 
        updateUI(); 
        playSound('click'); 
    }
}

function openCustomEggModal() { 
    updateCustomEggTimes(); 
    openModal('custom-egg-modal'); 
}

function updateCustomEggTimes() {
    let sel = getEl('custom-rarity-select'); 
    if (!sel) return;
    
    const r = sel.value;
    if (r === 'rare' && userLevel < 10) { 
        showToast("Редкие с 10 уровня!", "🔒"); 
        sel.value = 'common'; 
        return; 
    }
    if (r === 'legendary' && userLevel < 20) { 
        showToast("Легендарки с 20 уровня!", "🔒"); 
        sel.value = 'common'; 
        return; 
    }

    if (r === 'all') { customEggConfig.timeOnline = 3600; customEggConfig.timeOffline = 5 * 3600; }
    else if (r === 'common') { customEggConfig.timeOnline = 3600; customEggConfig.timeOffline = 6 * 3600; }
    else if (r === 'rare') { customEggConfig.timeOnline = 2 * 3600; customEggConfig.timeOffline = 7 * 3600; }
    else if (r === 'legendary') { customEggConfig.timeOnline = 3 * 3600; customEggConfig.timeOffline = 8 * 3600; }
    
    let timesEl = getEl('custom-egg-times');
    if (timesEl) {
        timesEl.textContent = `Онлайн: ${customEggConfig.timeOnline / 3600} ч | Оффлайн: ${customEggConfig.timeOffline / 3600} ч`;
    }
}

function saveCustomEgg() {
    let sel = getEl('custom-rarity-select'); 
    if (sel) customEggConfig.target = sel.value;
    closeModal('custom-egg-modal');
    updateUI();
}

function updateUI() {
    const m = MODES[currentModeIndex] || MODES[0];
    let t = currentModeIndex === 2 ? customEggConfig.timeOnline : m.timeOnline;
    
    if (activeBoosters.speed) {
        if (currentModeIndex === 0) t = 20 * 60; 
        else if (currentModeIndex === 1) t = 45 * 60; 
        else t = Math.floor(t * 0.7); 
    }

    if (!isRunning) { 
        applyEggSkin();
        let timerEl = getEl('timer'); 
        if (timerEl) timerEl.textContent = formatTime(t); 
        
        let infoEl = getEl('hatched-info'); 
        if (infoEl) infoEl.style.display = 'none';
        
        let custBtn = getEl('custom-egg-btn'); 
        if (custBtn) custBtn.style.display = currentModeIndex === 2 ? 'block' : 'none';
        
        let lockEl = getEl('egg-lock');
        let btnFocus = getEl('btn-focus') || (document.querySelectorAll('#start-buttons-container .btn').length > 0 ? document.querySelectorAll('#start-buttons-container .btn')[0] : null);
        let btnIncub = getEl('btn-incubator') || (document.querySelectorAll('#start-buttons-container .btn').length > 1 ? document.querySelectorAll('#start-buttons-container .btn')[1] : null);
        let titleEl = getEl('mode-title');
        let subEl = getEl('mode-subtitle');

        if (userLevel < m.reqLevel) {
            if (lockEl) lockEl.style.display = 'block';
            if (btnFocus) btnFocus.disabled = true;
            if (btnIncub) btnIncub.disabled = true;
            if (custBtn) custBtn.style.display = 'none';
            if (titleEl) { titleEl.textContent = `Доступно с ${m.reqLevel} уровня`; titleEl.style.color = '#ff3b30'; }
            if (subEl) subEl.innerHTML = m.title;
        } else {
            if (lockEl) lockEl.style.display = 'none';
            if (btnFocus) btnFocus.disabled = false;
            if (btnIncub) btnIncub.disabled = false;
            if (titleEl) { titleEl.textContent = m.title; titleEl.style.color = 'white'; }
            if (subEl) subEl.innerHTML = currentModeIndex === 2 ? `Настрой редкость <span style="font-size:10px;">(${customEggConfig.target})</span>` : m.sub;
        }
    }
}

// -------------------------------------------------------------
// ВТОРОЙ СЛОТ (ОФФЛАЙН ИНКУБАТОР)
// -------------------------------------------------------------
function updateSecondSlotUI() {
    const panel = getEl('second-slot-panel');
    if (!panel) return;
    
    if (!hasSecondSlot) { 
        panel.style.display = 'none'; 
        return; 
    }
    
    panel.style.display = 'block';

    if (secondSlotEndTime > 0) {
        const now = Date.now();
        if (now >= secondSlotEndTime) {
            getEl('second-slot-idle').style.display = 'none';
            getEl('second-slot-active').style.display = 'none';
            getEl('second-slot-done').style.display = 'block';
            if (secondSlotInterval) { 
                clearInterval(secondSlotInterval); 
                secondSlotInterval = null; 
            }
        } else {
            getEl('second-slot-idle').style.display = 'none';
            getEl('second-slot-active').style.display = 'block';
            getEl('second-slot-done').style.display = 'none';
            if (!secondSlotInterval) {
                secondSlotInterval = setInterval(() => {
                    const diff = Math.floor((secondSlotEndTime - Date.now()) / 1000);
                    if (diff <= 0) {
                        clearInterval(secondSlotInterval); 
                        secondSlotInterval = null;
                        updateSecondSlotUI(); 
                        showToast("Яйцо во 2 слоте готово!", "🥚");
                    } else {
                        getEl('second-slot-timer').textContent = formatTime(diff);
                    }
                }, 1000);
            }
        }
    } else {
        getEl('second-slot-idle').style.display = 'block';
        getEl('second-slot-active').style.display = 'none';
        getEl('second-slot-done').style.display = 'none';
        if (secondSlotInterval) { 
            clearInterval(secondSlotInterval); 
            secondSlotInterval = null; 
        }
    }
}

function startSecondSlot() {
    playSound('click'); 
    const m = MODES[currentModeIndex] || MODES[0];
    let time = currentModeIndex === 2 ? customEggConfig.timeOffline : m.timeOffline;
    secondSlotEndTime = Date.now() + (time * 1000);
    saveData(); 
    updateSecondSlotUI();
}

function claimSecondSlot() {
    playSound('win'); 
    secondSlotEndTime = 0;
    
    let leg = 5; 
    let rare = 30; 
    let pool;
    const rnd = Math.random() * 100;
    
    if (rnd < leg) pool = petDatabase.legendary;
    else if (rnd < leg + rare) pool = petDatabase.rare;
    else pool = petDatabase.common;
    
    const dropped = pool[Math.floor(Math.random() * pool.length)];
    collection.push(dropped); 
    
    saveData(); 
    updateBalanceUI();
    showToast(`Слот 2: Получен ${PET_NAMES[dropped]}!`, "🎉");
    fireConfetti(); 
    updateSecondSlotUI();
}

function checkBackgroundHatch() {
    const hatchEndTime = parseInt(localStorage.getItem('hatchEndTime'));
    const savedModeIndex = parseInt(localStorage.getItem('hatchEggType'));
    const savedTarget = localStorage.getItem('hatchTarget');
    
    if (hatchEndTime) {
        currentModeIndex = isNaN(savedModeIndex) ? 0 : savedModeIndex;
        if (savedTarget) customEggConfig.target = savedTarget;
        
        const now = Date.now();
        if (now >= hatchEndTime) {
            timeLeft = 0; 
            finishTimer(true); 
            localStorage.removeItem('hatchEndTime'); 
            showToast("Яйцо из инкубатора готово!", "🤖");
        } else {
            timeLeft = Math.round((hatchEndTime - now) / 1000); 
            startTimer('offline', true); 
        }
    }
}

function startTimer(mode, isResuming = false) {
    const m = MODES[currentModeIndex] || MODES[0];
    
    if (m.id === 'radio' && !activeBoosters.bio && !isResuming) {
        showToast("Нужна Биодобавка! 💉", "⚠️");
        return;
    }
    
    if (m.id === 'anomal' && !isResuming) {
        const day = new Date().getDay();
        const isWeekend = (day === 6 || day === 0);
        if (!isWeekend) {
            showToast("Доступно только в выходные!", "❌");
            return;
        }
        if (dustBalance < 50) {
            showToast("Нужно 50 Пыли (✨) для запуска!", "❌");
            return;
        }
        dustBalance -= 50;
        updateBalanceUI();
    }

    currentHatchMode = mode; 
    let baseTime = 0;
    
    if (!isResuming) {
        if (currentModeIndex === 2) {
            baseTime = mode === 'online' ? customEggConfig.timeOnline : customEggConfig.timeOffline;
        } else {
            baseTime = mode === 'online' ? m.timeOnline : m.timeOffline;
        }

        if (activeBoosters.speed) {
            if (currentModeIndex === 0 && mode === 'online') baseTime = 20 * 60; 
            else if (currentModeIndex === 1 && mode === 'online') baseTime = 45 * 60;
            else baseTime = Math.floor(baseTime * 0.7); 
            
            myBoosters.speed--; 
            activeBoosters.speed = false;
        }
        
        if (activeBoosters.bio) {
            myBoosters.bio--; 
            activeBoosters.bio = false;
        }
        
        timeLeft = baseTime;
        
        if (mode === 'offline') {
            localStorage.setItem('hatchEndTime', Date.now() + timeLeft * 1000);
            localStorage.setItem('hatchEggType', currentModeIndex);
            if (currentModeIndex === 2) {
                localStorage.setItem('hatchTarget', customEggConfig.target);
            }
            saveData();
        }
    }
    
    isRunning = true;
    let timerEl = getEl('timer'); 
    if (timerEl) timerEl.textContent = formatTime(timeLeft);
    
    let sbc = getEl('start-buttons-container'); 
    if (sbc) sbc.style.display = 'none';
    
    let mb = getEl('main-btn'); 
    if (mb) { 
        mb.style.display = 'block'; 
        mb.textContent = "Сдаться"; 
        mb.className = "btn stop"; 
    }
    
    let sb = getEl('share-btn'); 
    if (sb) sb.style.display = 'none';
    
    let pb = getEl('prev-btn'); 
    if (pb) pb.style.visibility = 'hidden';
    
    let nb = getEl('next-btn'); 
    if (nb) nb.style.visibility = 'hidden';
    
    let hi = getEl('hatched-info'); 
    if (hi) hi.style.display = 'none';
    
    let ceb = getEl('custom-egg-btn'); 
    if (ceb) ceb.style.display = 'none';
    
    let ow = getEl('offline-warning'); 
    if (ow) { 
        if (mode === 'online') ow.style.display = 'block'; 
        else ow.style.display = 'none'; 
    }

    if (!isResuming) {
        let egg = getEl('egg-display');
        if (egg) {
            if (m.egg === 'diamond') egg.src = 'assets/eggs/egg-diamond.png';
            else applyEggSkin();
        }
        let co = getEl('crack-overlay'); 
        if (co) co.className = 'crack-overlay'; 
    }
    
    let egg = getEl('egg-display'); 
    if (egg) egg.className = 'egg-img shaking'; 
    
    renderBoostersPanel();
    
    const totalTime = isResuming ? timeLeft : baseTime; 
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--; 
        let t = getEl('timer'); 
        if (t) t.textContent = formatTime(timeLeft);
        
        const progress = 1 - (timeLeft / totalTime);
        const overlay = getEl('crack-overlay');
        
        if (overlay) {
            if (progress > 0.25 && progress < 0.5) overlay.className = 'crack-overlay crack-stage-1';
            else if (progress >= 0.5 && progress < 0.75) overlay.className = 'crack-overlay crack-stage-2';
            else if (progress >= 0.75) overlay.className = 'crack-overlay crack-stage-3';
        }
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer(failed = false) {
    clearInterval(timerInterval); 
    isRunning = false;
    
    if (failed) {
        let rm = getEl('resurrect-modal'); 
        if (rm) rm.style.display = 'flex';
        
        let resTime = 20; 
        let rt = getEl('resurrect-timer'); 
        if (rt) rt.textContent = resTime;
        
        if (resurrectCountdownInterval) clearInterval(resurrectCountdownInterval);
        
        resurrectCountdownInterval = setInterval(() => {
            resTime--;
            if (rt) rt.textContent = resTime;
            if (resTime <= 0) {
                confirmFail(true);
            }
        }, 1000);
    } else {
        confirmFail(false);
    }
}

function resurrectEgg() {
    if (userStars >= 20) {
        userStars -= 20;
        saveData();
        updateBalanceUI();
        
        clearInterval(resurrectCountdownInterval);
        let rm = getEl('resurrect-modal'); 
        if (rm) rm.style.display = 'none';
        
        showToast("Яйцо спасено! Продолжаем фокус.", "✨");
        
        startTimer(currentHatchMode, true);
    } else {
        showToast("Недостаточно Звезд!", "❌");
        openBuyStarsModal();
    }
}

function confirmFail(wasInterrupted = true) {
    clearInterval(resurrectCountdownInterval);
    let rm = getEl('resurrect-modal'); 
    if (rm) rm.style.display = 'none';
    
    localStorage.removeItem('hatchEndTime'); 
    let mb = getEl('main-btn'); 
    if (mb) mb.style.display = 'none'; 
    
    let sbc = getEl('start-buttons-container'); 
    if (sbc) sbc.style.display = 'flex';
    
    let pb = getEl('prev-btn'); 
    if (pb) pb.style.visibility = 'visible'; 
    
    let nb = getEl('next-btn'); 
    if (nb) nb.style.visibility = 'visible';
    
    let ow = getEl('offline-warning'); 
    if (ow) ow.style.display = 'none';
    
    const eggDisplay = getEl('egg-display'); 
    if (eggDisplay) { 
        eggDisplay.className = 'egg-img'; 
        eggDisplay.classList.remove('shaking'); 
    }
    
    let co = getEl('crack-overlay'); 
    if (co) co.className = 'crack-overlay'; 
    
    let hi = getEl('hatched-info'); 
    if (hi) hi.style.display = 'none';
    
    updateUI(); 
    renderBoostersPanel();
    
    if (wasInterrupted) { 
        showToast("Яйцо разбито...", "❌"); 
        playSound('click'); 
    } else { 
        showToast("Выращивание отменено", "⚠️"); 
    }
}

// === НОВОЕ: ОТРИСОВКА BATTLE PASS ===
function openLevels() {
    const list = getEl('battle-pass-list'); 
    if (!list) return;
    
    let banner = getEl('pro-pass-banner');
    if (banner) {
        if (isVip()) {
            banner.innerHTML = `
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #ffd700; font-size: 14px;">Focus PRO 👑 Активен</div>
                    <div style="font-size: 10px; color: #ccc;">Все премиум-награды доступны!</div>
                </div>
            `;
        } else {
            banner.innerHTML = `
                <div style="text-align: left;">
                    <div style="font-weight: bold; color: #00A3FF; font-size: 14px;">Focus PRO 👑</div>
                    <div style="font-size: 10px; color: #ccc;">Разблокируй нижнюю линию наград!</div>
                </div>
                <button id="buy-pro-pass-btn" class="btn small" style="background: #00A3FF; width: auto; margin: 0;" onclick="closeModal('levels-modal'); openShop();">Купить PRO</button>
            `;
        }
    }

    list.innerHTML = '';
    
    BATTLE_PASS_REWARDS.forEach(bp => {
        const isReached = userLevel >= bp.level;
        const freeClaimed = claimedRewards.includes(`${bp.level}_free`);
        const proClaimed = claimedRewards.includes(`${bp.level}_pro`);
        
        const div = document.createElement('div'); 
        div.className = `bp-level-row ${isReached ? 'completed' : ''}`;
        
        // Free Track
        let freeBtn = '';
        if (freeClaimed) freeBtn = `<button class="bp-btn claimed" disabled>✅ Забрано</button>`;
        else if (isReached) freeBtn = `<button class="bp-btn" onclick="claimBpReward(${bp.level}, 'free')">Забрать</button>`;
        else freeBtn = `<button class="bp-btn" disabled>🔒 ${bp.level} ур.</button>`;
        
        let freeIcon = bp.free.icon.includes('.') ? `<img src="${bp.free.icon}" class="bp-reward-icon">` : `<div class="bp-reward-icon">${bp.free.icon}</div>`;

        // Pro Track
        let proBtn = '';
        let proTrackClass = `bp-track pro ${!isVip() ? 'locked' : ''}`;

        if (proClaimed) proBtn = `<button class="bp-btn claimed" disabled>✅ Забрано</button>`;
        else if (isReached && isVip()) proBtn = `<button class="bp-btn" onclick="claimBpReward(${bp.level}, 'pro')">Забрать</button>`;
        else proBtn = `<button class="bp-btn" disabled>🔒 ${!isVip() ? 'PRO' : bp.level + ' ур.'}</button>`;
        
        let proIcon = bp.pro.icon.includes('.') ? `<img src="${bp.pro.icon}" class="bp-reward-icon">` : `<div class="bp-reward-icon">${bp.pro.icon}</div>`;

        div.innerHTML = `
            <div class="bp-level-number">Ур.<br>${bp.level}</div>
            <div class="bp-tracks">
                <div class="bp-track">
                    <div class="bp-reward-info">${freeIcon}<div class="bp-reward-text">${bp.free.name}</div></div>
                    ${freeBtn}
                </div>
                <div class="${proTrackClass}">
                    <div class="bp-reward-info">${proIcon}<div class="bp-reward-text">${bp.pro.name}</div></div>
                    ${proBtn}
                </div>
            </div>
        `;
        list.appendChild(div);
    });
    openModal('levels-modal');
}

// =============================================================
// ИНВЕНТАРЬ И ЛАБОРАТОРИЯ (ДНК, ПРОКАЧКА)
// =============================================================
function openCraft() {
    let psc = getEl('pegasus-shards-count'); 
    if (psc) psc.textContent = pegasusShards;
    
    let jcd = getEl('joker-count-display'); 
    if (jcd) jcd.textContent = userJokers;
    
    let cmb = getEl('craft-mythic-btn');
    if (cmb) {
        if (pegasusShards >= 10) {
            cmb.className = "btn";
            cmb.style.background = "#8a2be2";
            cmb.style.color = "white";
            cmb.style.boxShadow = "0 0 15px rgba(138, 43, 226, 0.8)";
        } else {
            cmb.className = "btn locked";
            cmb.style.boxShadow = "none";
        }
    }

    const c = getEl('craft-list'); 
    if (!c) return;
    
    c.innerHTML = ''; 
    let canCraft = false;
    
    [...petDatabase.common].forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        if (count >= 5) {
            canCraft = true; 
            const r = getPetRarity(pet); 
            const d = document.createElement('div'); 
            d.className = `pet-slot ${r}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count" style="background:#ff3b30">${count}/5</div>`;
            d.onclick = () => craftPet(pet, 0); 
            c.appendChild(d);
        } else if (count > 0 && count < 5 && userJokers >= (5 - count)) {
            canCraft = true; 
            const r = getPetRarity(pet); 
            const d = document.createElement('div'); 
            d.className = `pet-slot ${r}`;
            d.style.borderColor = '#00A3FF';
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count" style="background:#00A3FF">+${5-count} 🧬</div>`;
            d.onclick = () => craftPet(pet, 5 - count); 
            c.appendChild(d);
        }
    });
    
    if (!canCraft) {
        c.innerHTML = '<p style="grid-column: span 4; color: #888; font-size: 12px;">Собери 5 одинаковых обычных петов или используй Ген Мутации!</p>';
    }
    openModal('craft-modal');
}

function upgradePet(pet, cost) {
    let removed = 0; 
    collection = collection.filter(p => { 
        if (p === pet && removed < cost) { 
            removed++; 
            return false; 
        } 
        return true; 
    });
    
    petStars[pet] = (petStars[pet] || 1) + 1;
    saveData(); 
    updateBalanceUI();
    playSound('win'); 
    showToast(`${PET_NAMES[pet]} улучшен до ⭐️${petStars[pet]}!`, '🌟');
    
    openPetModal(pet, true);
    openInventory();
}

window.dustPet = function(pet, amount) {
    if (!confirm(`Вы уверены, что хотите распылить ${PET_NAMES[pet]} за +${amount} ✨? Питомец навсегда исчезнет!`)) return;
    
    const idx = collection.indexOf(pet);
    if (idx > -1) {
        collection.splice(idx, 1);
        dustBalance += amount;
        saveData();
        updateBalanceUI();
        playSound('win');
        showToast(`Распылено! +${amount} ✨`, '✨');
        openPetModal(pet, true);
        openInventory();
    }
}

function startDnaPuzzle() {
    if (pegasusShards < 10) {
        return showToast("Не хватает осколков!", "❌");
    }
    
    dnaGrid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];
    
    for (let i = 0; i < 15; i++) {
        let r = Math.floor(Math.random() * 3); 
        let c = Math.floor(Math.random() * 3);
        toggleDnaNode(r, c, true);
    }
    
    if (checkDnaWin(true)) {
        toggleDnaNode(0, 0, true);
    }
    
    renderDnaGrid();
    closeModal('craft-modal');
    openModal('dna-modal');
}

function toggleDnaNode(r, c, isScrambling=false) {
    let coords = [[r,c], [r-1,c], [r+1,c], [r,c-1], [r,c+1]];
    
    coords.forEach(([nr, nc]) => {
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
            dnaGrid[nr][nc] = dnaGrid[nr][nc] === 1 ? 0 : 1;
        }
    });
    
    if (!isScrambling) {
        playSound('click');
        renderDnaGrid();
        
        if (checkDnaWin()) {
            setTimeout(() => {
                closeModal('dna-modal');
                pegasusShards -= 10;
                saveData(); 
                updateBalanceUI();
                craftMythicReal(); 
            }, 500);
        }
    }
}

function checkDnaWin(silent=false) {
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) { 
            if (dnaGrid[r][c] === 0) return false; 
        } 
    }
    return true;
}

function renderDnaGrid() {
    let container = getEl('dna-grid'); 
    if (!container) return; 
    
    container.innerHTML = '';
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let d = document.createElement('div');
            d.className = `dna-node ${dnaGrid[r][c] === 1 ? 'active' : ''}`;
            d.onclick = () => toggleDnaNode(r, c);
            container.appendChild(d);
        }
    }
}

function craftMythicReal() {
    openModal('mythic-craft-modal'); 
    playSound('legendary');
    
    let ms = getEl('mythic-silhouette');
    if (ms) { 
        ms.className = 'mythic-silhouette spinning'; 
        ms.src = 'assets/eggs/egg-default.png'; 
    }

    let pulseInterval = setInterval(() => {
        fireConfetti();
    }, 800);
    
    setTimeout(() => {
        clearInterval(pulseInterval);
        
        let pool = petDatabase.mythic; 
        let dropped = pool[Math.floor(Math.random() * pool.length)]; 
        collection.push(dropped);
        
        updateContract('craft', 1);
        saveData(); 
        updateBalanceUI();
        
        if (ms) { 
            ms.className = 'mythic-silhouette epic-flash'; 
            ms.src = `assets/pets/pet-${dropped}.png`; 
        }
        
        showToast(`МИФИК СОЗДАН: ${PET_NAMES[dropped]}! 🦄`, "🌟"); 
        
        for (let i = 0; i < 5; i++) {
            setTimeout(fireConfetti, i * 300);
        }
        
        setTimeout(() => { 
            closeModal('mythic-craft-modal'); 
            openInventory(); 
        }, 4000);
        
    }, 3000);
}

function craftPet(basePet, jokersUsed = 0) {
    let msg = jokersUsed > 0 ? `Соединить ${5 - jokersUsed}x ${PET_NAMES[basePet]} и ${jokersUsed}x 🧬 Джокер?` : `Соединить 5x ${PET_NAMES[basePet]}?`;
    
    if (confirm(msg)) {
        let removed = 0; 
        collection = collection.filter(p => { 
            if (p === basePet && removed < (5 - jokersUsed)) { 
                removed++; 
                return false; 
            } 
            return true; 
        });
        
        if (jokersUsed > 0) {
            userJokers -= jokersUsed;
        }
        
        let newPet = petDatabase.rare[Math.floor(Math.random() * petDatabase.rare.length)];
        showToast(`Успех! Получен Редкий петомец`, '🧪'); 
        playSound('win');
        
        collection.push(newPet); 
        
        if (!userStats.crafts) {
            userStats.crafts = 0; 
        }
        userStats.crafts++;
        
        updateContract('craft', 1);
        saveData(); 
        updateBalanceUI(); 
        openInventory(); 
        openCraft();
    }
}

function splinterPet(pet, rarity) {
    if (!confirm(`ВНИМАНИЕ! Питомец ${PET_NAMES[pet]} будет уничтожен в расщепителе. Продолжить?`)) return;
    
    const idx = collection.indexOf(pet); 
    if (idx === -1) return;
    
    collection.splice(idx, 1); 
    playSound('click');
    
    if (rarity === 'rare') {
        if (Math.random() < 0.20) { 
            pegasusShards += 1; 
            showToast(`Успех! Получен 1 Осколок! 🧩`, "win"); 
        } else { 
            showToast(`Питомец расщеплен, но осколок не выпал... 💨`, "❌"); 
        }
    } else if (rarity === 'legendary') {
        let amount = Math.random() < 0.5 ? 1 : 2; 
        pegasusShards += amount; 
        showToast(`Успех! Получено ${amount} Осколков! 🧩`, "win");
    }
    
    saveData(); 
    updateBalanceUI(); 
    closeModal('pet-modal'); 
    openInventory();
}

function openInventory() {
    const container = document.getElementById('collection-container'); 
    if (!container) return; 
    
    container.innerHTML = ''; 
    
    ALL_PETS_FLAT.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const r = getPetRarity(pet); 
        const d = document.createElement('div');
        
        let starLevel = petStars[pet] || 1;
        let starBadge = starLevel > 1 ? `<div class="star-badge">⭐️${starLevel}</div>` : '';
        
        if (count > 0) {
            d.className = `pet-slot ${r}`; 
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">${starBadge}`;
            
            if (count > 1) { 
                const b = document.createElement('div'); 
                b.className = 'slot-count'; 
                b.textContent = `x${count}`; 
                d.appendChild(b); 
            }
            d.onclick = () => openPetModal(pet, true);
        } else {
            d.className = `pet-slot locked`; 
            if (r === 'mythic' || r === 'mutant' || r === 'glitch') { 
                let col = '#8a2be2';
                if (r === 'mutant') col = '#39ff14';
                if (r === 'glitch') col = '#00ffff';
                d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" style="filter:brightness(0) opacity(0.5);" onerror="this.src='assets/eggs/egg-default.png'"> <div style="position:absolute; font-size: 24px; font-weight:bold; color:${col}; text-shadow: 0 0 5px #000;">?</div>`; 
            } else { 
                d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">`; 
            }
            d.onclick = () => openPetModal(pet, false);
        }
        container.appendChild(d);
    });
    
    openModal('inventory-modal');
}

function openPetModal(pet, owned) {
    selectedPet = pet; 
    const r = getPetRarity(pet); 
    const p = PRICES[r] || 0;
    const petName = PET_NAMES[pet] || "Питомец";
    
    let currentStar = petStars[pet] || 1;
    let cost = currentStar === 1 ? 3 : (currentStar === 2 ? 5 : (currentStar === 3 ? 10 : 0));
    
    const count = collection.filter(x => x === pet).length;
    
    let upgradeBtn = '';
    if (owned && cost > 0) {
        if (count >= cost + 1) {
            upgradeBtn = `<button class="btn" style="background:#5856d6; font-size:14px; margin-top:5px;" onclick="upgradePet('${pet}', ${cost})">⬆️ Улучшить до ⭐️${currentStar+1} (${count}/${cost+1} шт)</button>`;
        } else {
            upgradeBtn = `<button class="btn locked" style="font-size:14px; margin-top:5px;">⬆️ Нужно ${cost+1} шт (есть ${count})</button>`;
        }
    }
    
    let splinterBtn = '';
    if (owned) {
        if (r === 'rare') {
            splinterBtn = `<button class="btn" style="background:#ff9500; font-size:14px; margin-top:5px; box-shadow: 0 0 10px rgba(255,149,0,0.5);" onclick="splinterPet('${pet}', 'rare')">Расщепить (Шанс 20%) 🧩</button>`;
        }
        if (r === 'legendary') {
            splinterBtn = `<button class="btn" style="background:#ff3b30; font-size:14px; margin-top:5px; box-shadow: 0 0 10px rgba(255,59,48,0.5);" onclick="splinterPet('${pet}', 'legendary')">Расщепить (100% 1-2 🧩)</button>`;
        }
    }
    
    let dustBtn = '';
    if (owned && count > 1 && ['common', 'rare', 'epic'].includes(r)) {
        let dustGain = r === 'common' ? 5 : (r === 'rare' ? 15 : 50);
        dustBtn = `<button class="btn" style="background:#ff3b30; font-size:14px; margin-top:5px; box-shadow: 0 0 10px rgba(255,59,48,0.5);" onclick="dustPet('${pet}', ${dustGain})">Распылить дубликат (+${dustGain} ✨)</button>`;
    }

    let starStr = currentStar > 1 ? ` <span style="color:#ffd700; font-size:16px;">${'⭐️'.repeat(currentStar)}</span>` : '';

    let pdv = getEl('pet-detail-view');
    if (pdv) {
        pdv.innerHTML = owned ? 
            `<img src="assets/pets/pet-${pet}.png" class="pet-img-big" onerror="this.src='assets/eggs/egg-default.png'">
             <h3 class="pet-name">${petName}${starStr}</h3><p class="pet-rarity ${r}">${r}</p><p class="pet-price">Цена: ${p} <img src="assets/ui/coin.png" style="width:16px;vertical-align:middle"></p>
             <button class="btn sell-action" onclick="sellPet()">Продать ${p}</button>
             ${upgradeBtn}
             ${splinterBtn}
             ${dustBtn}` : 
            `<img src="assets/pets/pet-${pet}.png" class="pet-img-big" style="filter:brightness(0) opacity(0.3)" onerror="this.src='assets/eggs/egg-default.png'">
             <h3 class="pet-name">???</h3><p class="pet-rarity ${r}">${r}</p><button class="btn" style="background:#333" onclick="closeModal('pet-modal')">Закрыть</button>`;
    }
    openModal('pet-modal');
}

function sellPet() {
    if (!selectedPet) return; 
    
    const idx = collection.indexOf(selectedPet); 
    if (idx === -1) return;
    
    let basePrice = PRICES[getPetRarity(selectedPet)] || 0;
    let finalPrice = isVip() ? Math.floor(basePrice * 1.2) : basePrice;
    
    walletBalance += finalPrice; 
    userStats.earned += finalPrice;
    
    collection.splice(idx, 1); 
    updateContract('sell', 1);
    
    saveData(); 
    updateBalanceUI(); 
    closeModal('pet-modal'); 
    showToast(`Продано +${finalPrice}`, 'img'); 
    playSound('money'); 
    openInventory(); 
}

// =============================================================
// МУЛЬТИПЛЕЕР И БОСС-РЕЙД
// =============================================================
function openPartyModal() {
    let psv = getEl('party-setup-view');
    let pav = getEl('party-active-view');
    
    if (currentPartyCode) {
        if (psv) psv.style.display = 'none';
        if (pav) pav.style.display = 'block';
        startPartyPolling(); 
    } else {
        if (psv) psv.style.display = 'block';
        if (pav) pav.style.display = 'none';
    }
    openModal('party-modal');
}

async function apiCreateParty() {
    playSound('click');
    const btn = event.target; 
    btn.textContent = "Создаем сервер...";
    const user = getTgUser();
    
    let finalName = user.name;
    if (isVip()) {
        finalName += ' 👑';
    }

    try {
        const res = await fetch(`${API_URL}/party/create`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        const data = await res.json();
        
        currentPartyCode = data.partyCode;
        let cpc = getEl('current-party-code'); 
        if (cpc) cpc.textContent = currentPartyCode;
        
        let psv = getEl('party-setup-view'); 
        if (psv) psv.style.display = 'none';
        
        let pav = getEl('party-active-view'); 
        if (pav) pav.style.display = 'block';
        
        showToast("Пати создано! Ты лидер 👑", "🎮");
        
        if (typeof socket !== 'undefined') {
            socket.emit('joinRoom', { roomId: currentPartyCode });
        }
        
        startPartyPolling();
    } catch (e) { 
        showToast("Ошибка сервера", "❌"); 
    }
    btn.textContent = "Создать Пати";
}

async function apiJoinParty(prefilledCode = null) {
    playSound('click');
    const input = getEl('party-code-input');
    const code = prefilledCode || (input ? input.value.trim() : '');
    
    if (code.length < 4) return showToast("Неверный код", "❌");
    
    const user = getTgUser();
    let finalName = user.name;
    if (isVip()) {
        finalName += ' 👑';
    }

    try {
        const res = await fetch(`${API_URL}/party/join`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        
        if (res.ok) {
            currentPartyCode = code;
            let cpc = getEl('current-party-code'); 
            if (cpc) cpc.textContent = currentPartyCode;
            
            let psv = getEl('party-setup-view'); 
            if (psv) psv.style.display = 'none';
            
            let pav = getEl('party-active-view'); 
            if (pav) pav.style.display = 'block';
            
            showToast("Успешный вход!", "✅");
            
            if (typeof socket !== 'undefined') {
                socket.emit('joinRoom', { roomId: currentPartyCode });
            }
            
            startPartyPolling();
        } else {
            showToast("Пати не найдено", "❌");
        }
    } catch(e) { 
        showToast("Ошибка соединения", "❌"); 
    }
}

async function apiLeaveParty(localOnly = false) {
    if (!localOnly) playSound('click');
    const user = getTgUser();
    
    if (!localOnly) {
        try {
            await fetch(`${API_URL}/party/leave`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, name: user.name, avatar: selectedAvatar, egg_skin: activeEggSkin })
            });
        } catch(e) {}
    }

    currentPartyCode = null; 
    isPartyLeader = false;
    currentActiveGame = 'none';
    isMegaRadarActive = false; 
    
    clearInterval(partyPollingInterval);
    if (bossTimerInterval) clearInterval(bossTimerInterval);
    if (expeditionInterval) clearInterval(expeditionInterval);
    if (parasiteInterval) clearInterval(parasiteInterval);
    if (bonusSpawningInterval) clearInterval(bonusSpawningInterval);

    ['boss-raid-modal', 'quantum-reactor-modal', 'expedition-modal'].forEach(m => {
        if (modalStack.includes(m)) closeModal(m);
    });

    let psv = getEl('party-setup-view'); 
    if (psv) psv.style.display = 'block';
    
    let pav = getEl('party-active-view'); 
    if (pav) pav.style.display = 'none';
    
    let rgb = getEl('return-game-btn'); 
    if (rgb) rgb.style.display = 'none';
}

function renderPartyPlayers(players) {
    const container = getEl('party-players-list'); 
    if (!container) return;
    
    container.innerHTML = '';
    const header = document.querySelector('#party-active-view h3');
    
    if (header && players.length) {
        header.innerHTML = `Игроки <span id="leader-badge" style="color: #ffd700; font-size: 12px; display: ${isPartyLeader ? 'inline' : 'none'};">(Вы Лидер 👑)</span>`;
    }
    
    players.forEach(p => {
        container.innerHTML += `<div class="player-slot"><div class="player-avatar-circle"><img src="assets/pets/pet-${p.avatar}.png" onerror="this.src='assets/eggs/egg-default.png'"></div><div class="player-name">${p.name}</div></div>`;
    });
}

function startPartyPolling() {
    if (partyPollingInterval) clearInterval(partyPollingInterval);
    
    partyPollingInterval = setInterval(async () => {
        if (!currentPartyCode) return;
        try {
            const res = await fetch(`${API_URL}/party/status/${currentPartyCode}`);
            if (res.status === 404) {
                showToast("Пати распущено", "⚠️");
                apiLeaveParty(true);
                return;
            }
            
            const data = await res.json();
            
            isPartyLeader = (getTgUser().id === data.leader_id);
            currentPartyPlayersData = data.players; 
            isMegaRadarActive = data.mega_radar === 1; 
            
            renderPartyPlayers(data.players);
            updatePartyUI();

            if (data.active_game !== 'none' && currentActiveGame === 'none') {
                currentActiveGame = data.active_game;
                forceOpenMiniGame(currentActiveGame);
            } else if (data.active_game === 'none' && currentActiveGame !== 'none') {
                forceCloseMiniGame(currentActiveGame);
                currentActiveGame = 'none';
            } else {
                currentActiveGame = data.active_game;
            }
            
            if (modalStack.includes('boss-raid-modal')) {
                updateBossRaidUI(data.boss_hp, data.boss_max_hp, data.players);
                if (data.boss_hp <= 0 && !bossIsDead && currentActiveGame === 'tap_boss') {
                    handleBossRaidEnd();
                }
            }
            
            if (modalStack.includes('expedition-modal')) {
                updateExpeditionUI(data.expedition_end, data.expedition_score, data.expedition_location, data.wolf_hp, data.wolf_max_hp, data.server_time);
            }
        } catch(e) {}
    }, 2000);
}

function updatePartyUI() {
    let plc = getEl('party-leader-controls');
    let pmc = getEl('party-member-controls');
    let cgb = getEl('cancel-game-btn');
    let rgb = getEl('return-game-btn');

    if (isPartyLeader) {
        if (plc) plc.style.display = 'block';
        if (pmc) pmc.style.display = 'none';
        
        if (currentActiveGame !== 'none') {
            if (cgb) cgb.style.display = 'block';
            if (plc) { 
                plc.style.opacity = '0.5'; 
                plc.style.pointerEvents = 'none'; 
            }
        } else {
            if (cgb) cgb.style.display = 'none';
            if (plc) { 
                plc.style.opacity = '1'; 
                plc.style.pointerEvents = 'auto'; 
            }
        }
    } else {
        if (plc) plc.style.display = 'none';
        if (cgb) cgb.style.display = 'none';
        
        if (pmc) {
            pmc.style.display = 'block';
            if (currentActiveGame !== 'none') {
                pmc.innerHTML = `Игра "<b>${getGameName(currentActiveGame)}</b>" запущена!`;
            } else {
                pmc.innerHTML = "⏳ Ожидание лидера...";
            }
        }
    }
    
    if (currentActiveGame !== 'none' && !modalStack.includes(getModalIdForGame(currentActiveGame))) {
        if (rgb) rgb.style.display = 'block';
    } else {
        if (rgb) rgb.style.display = 'none';
    }
}

function getGameName(type) {
    if (type === 'tap_boss') return "Зараженное Яйцо";
    if (type === 'quantum_reactor') return "Квантовый Реактор";
    if (type === 'expedition') return "Экспедиция";
    return "Неизвестно";
}

function getModalIdForGame(type) {
    if (type === 'tap_boss') return 'boss-raid-modal';
    if (type === 'quantum_reactor') return 'quantum-reactor-modal';
    if (type === 'expedition') return 'expedition-modal';
    return '';
}

async function requestStartMiniGame(gameType) {
    if (!isPartyLeader) return;
    playSound('click');
    
    try {
        const res = await fetch(`${API_URL}/party/set_game`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: gameType })
        });
        if (res.ok) {
            currentActiveGame = gameType; 
            forceOpenMiniGame(gameType); 
            updatePartyUI();
        }
    } catch(e) { 
        showToast("Ошибка сервера", "❌"); 
    }
}

async function requestStopMiniGame() {
    if (!isPartyLeader) return;
    playSound('click');
    
    try {
        await fetch(`${API_URL}/party/set_game`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: 'none' })
        });
        forceCloseMiniGame(currentActiveGame); 
        currentActiveGame = 'none'; 
        updatePartyUI();
    } catch(e) {}
}

function forceOpenMiniGame(gameType) {
    let modalId = getModalIdForGame(gameType);
    
    if (gameType === 'tap_boss') { 
        bossTimeLeft = 60; 
        bossIsDead = false; 
        isStunned = false;
        
        let so = getEl('stun-overlay'); 
        if (so) so.style.display = 'none';
        
        let pc = getEl('parasites-container'); 
        if (pc) pc.innerHTML = '';
        
        if (bossTimerInterval) clearInterval(bossTimerInterval);
        
        bossTimerInterval = setInterval(() => {
            bossTimeLeft -= 0.1; 
            const timerEl = getEl('raid-timer'); 
            if (timerEl) timerEl.textContent = bossTimeLeft.toFixed(1);
            if (bossTimeLeft <= 0 && !bossIsDead) { 
                clearInterval(bossTimerInterval); 
                if (parasiteInterval) clearInterval(parasiteInterval); 
                handleBossRaidEnd(); 
            }
        }, 100);

        if (parasiteInterval) clearInterval(parasiteInterval);
        parasiteInterval = setInterval(spawnParasite, 2500); 
    }
    
    if (gameType === 'quantum_reactor') {
        openModal('quantum-reactor-modal');
        let testRole = isPartyLeader ? 'dispatcher' : 'engineer';
        setupReactorRole(testRole, ['🔴', '🔵', '🟢', '🟡']);
    }
    
    if (gameType === 'expedition') {
        calculatePreStartSynergy(); 
        
        if (isPartyLeader) {
            let locSel = getEl('leader-location-selector');
            if (locSel) locSel.style.display = 'flex';
            if (!currentExpeditionLocation) selectExpeditionLocation('forest'); 
        } else {
            let locSel = getEl('leader-location-selector');
            if (locSel) locSel.style.display = 'none';
        }
    }

    if (modalId && !modalStack.includes(modalId)) {
        openModal(modalId);
    }
}

function forceCloseMiniGame(gameType) {
    let modalId = getModalIdForGame(gameType);
    
    if (bossTimerInterval) { clearInterval(bossTimerInterval); bossTimerInterval = null; }
    if (parasiteInterval) { clearInterval(parasiteInterval); parasiteInterval = null; }
    if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
    if (expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
    
    if (modalId && modalStack.includes(modalId)) {
        closeModal(modalId); 
        showToast("Лидер завершил игру", "ℹ️");
    }
}

function spawnParasite() {
    if (bossTimeLeft <= 0 || bossIsDead || isStunned) return;
    const c = getEl('parasites-container'); 
    if (!c) return;
    
    const p = document.createElement('div');
    p.style.position = 'absolute'; 
    p.style.width = '40px'; 
    p.style.height = '40px';
    p.style.background = 'radial-gradient(circle, #39ff14, #004d00)'; 
    p.style.borderRadius = '50%';
    p.style.boxShadow = '0 0 10px #39ff14'; 
    p.style.top = `${20 + Math.random() * 60}%`; 
    p.style.left = `${20 + Math.random() * 60}%`;
    p.style.cursor = 'pointer'; 
    p.style.zIndex = '5'; 
    p.style.animation = 'pulseFast 0.5s infinite';
    
    let clicked = false;
    p.onclick = (e) => { 
        e.stopPropagation(); 
        clicked = true; 
        playSound('click'); 
        p.remove(); 
    };
    
    c.appendChild(p);
    
    setTimeout(() => { 
        if (!clicked && p.parentNode) { 
            p.remove(); 
            triggerStun(); 
        } 
    }, 2000);
}

function triggerStun() {
    if (isStunned) return; 
    isStunned = true; 
    playSound('click'); 
    showToast("ОГЛУШЕНИЕ!", "🤢");
    
    const overlay = getEl('stun-overlay'); 
    if (overlay) overlay.style.display = 'flex';

    const modalContent = document.querySelector('#boss-raid-modal .modal-content');
    if (modalContent) modalContent.classList.add('shake-hard');
    
    setTimeout(() => { 
        isStunned = false; 
        if (overlay) overlay.style.display = 'none'; 
        if (modalContent) modalContent.classList.remove('shake-hard');
    }, 3000);
}

async function tapRaidBoss(event) {
    if (bossTimeLeft <= 0 || bossIsDead) return;
    if (isStunned) return showToast("Ты оглушен!", "❌");
    
    playSound('click');
    let baseDamage = 1; 
    const r = getPetRarity(selectedAvatar); 
    
    if (r === 'rare') baseDamage = 5; 
    if (r === 'legendary') baseDamage = 20; 
    if (r === 'mythic' || r === 'mutant') baseDamage = 50;

    let stars = petStars[selectedAvatar] || 1;
    baseDamage = baseDamage * stars;

    let isCrit = Math.random() < 0.15;
    let damage = isCrit ? baseDamage * 2 : baseDamage;

    const img = getEl('raid-boss-img');
    if (img) { 
        img.classList.remove('boss-hit-anim'); 
        void img.offsetWidth; 
        img.classList.add('boss-hit-anim'); 
    }

    if (event) {
        const ft = document.createElement('div'); 
        ft.textContent = `-${damage}`; 
        ft.style.position = 'fixed';
        
        let offsetX = (Math.random() - 0.5) * 60;
        let offsetY = (Math.random() - 0.5) * 60;
        
        ft.style.left = `${event.clientX + offsetX}px`; 
        ft.style.top = `${event.clientY + offsetY}px`; 
        ft.style.fontWeight = 'bold'; 
        ft.style.pointerEvents = 'none'; 
        ft.style.zIndex = '9999';

        if (isCrit) {
            ft.style.color = '#ff3b30'; 
            ft.style.fontSize = '36px';
            ft.style.textShadow = '0 0 10px #ff0000';
            ft.style.animation = 'critFly 1s ease-out forwards';
        } else {
            ft.style.color = '#ffd700'; 
            ft.style.fontSize = '24px';
            ft.style.textShadow = '0 0 5px #000';
            ft.style.animation = 'damageFly 1s ease-out forwards';
        }
        
        document.body.appendChild(ft);
        setTimeout(() => ft.remove(), 1000);
    }

    try { 
        await fetch(`${API_URL}/party/damage`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, damage: damage }) 
        }); 
        updateContract('dmg', damage); 
    } catch(e) {}
}

function updateBossRaidUI(hp, maxHp, players) {
    let hpFill = getEl('raid-hp-fill'); 
    let hpText = getEl('raid-hp-text');
    
    if (hpFill && hpText) { 
        hpFill.style.width = `${(hp/maxHp)*100}%`; 
        hpText.textContent = `${hp} / ${maxHp} HP`; 
    }
    
    const grid = getEl('raid-players-grid'); 
    if (!grid) return; 
    
    grid.innerHTML = '';
    const myId = getTgUser().id;
    let sorted = [...players].sort((a,b) => b.boss_hp - a.boss_hp);
    
    sorted.forEach(p => {
        const isMe = p.user_id === myId;
        let eggSkin = p.egg_skin || 'default'; 
        const item = SHOP_DATA.eggs.find(x => x.id === eggSkin);
        const eggImg = item ? item.img : 'assets/eggs/egg-default.png';
        
        grid.innerHTML += `
            <div class="tap-cell ${isMe ? 'me' : ''}" style="padding: 5px;">
                <div class="tap-cell-name" style="font-size:10px;">${p.name}</div>
                <img src="${eggImg}" style="width:40px; height:40px; object-fit:contain; margin-bottom:5px;">
                <div style="font-size:12px; font-weight:bold; color:#39ff14;">${p.boss_hp} DMG</div>
            </div>`;
    });
}

function handleBossRaidEnd() {
    if (bossIsDead) return; 
    
    bossIsDead = true; 
    if (bossTimerInterval) clearInterval(bossTimerInterval); 
    if (parasiteInterval) clearInterval(parasiteInterval);
    
    playSound('win');
    
    const myId = getTgUser().id; 
    const me = currentPartyPlayersData.find(p => p.user_id === myId);
    let winner = null;
    
    if (currentPartyPlayersData.length > 0) {
        winner = currentPartyPlayersData.reduce((prev, curr) => (prev.boss_hp > curr.boss_hp) ? prev : curr);
    }
    
    let vipMult = isVip() ? 1.2 : 1;
    
    if (winner && winner.user_id === myId) { 
        let prize = Math.floor(10000 * vipMult); 
        fireConfetti(); 
        showToast(`ТЫ MVP! +${prize} монет`, "🏆"); 
        walletBalance += prize; 
    } else { 
        const myDmg = me ? me.boss_hp : 0; 
        const reward = Math.floor(myDmg * 0.5 * vipMult); 
        showToast(`Босс повержен! Твоя доля: +${reward} монет`, "💰"); 
        walletBalance += reward; 
    }
    
    saveData(); 
    updateBalanceUI();
    if (isPartyLeader) setTimeout(() => requestStopMiniGame(), 4000);
}

// =============================================================
// МИНИ-ИГРА: КВАНТОВЫЙ РЕАКТОР
// =============================================================
window.setupReactorRole = function(role, secretCode = null) {
    let rd = getEl('role-dispatcher');
    let re = getEl('role-engineer');
    let rs = getEl('role-stabilizer');
    
    if (rd) rd.style.display = 'none';
    if (re) re.style.display = 'none';
    if (rs) rs.style.display = 'none';
    
    if (role === 'dispatcher') {
        if (rd) rd.style.display = 'block';
        renderDispatcherCode(secretCode || ['🔴','🔵','🟢','🟡']);
    } 
    else if (role === 'engineer') {
        if (re) re.style.display = 'block';
        requiredCodeLength = secretCode ? secretCode.length : 4;
        reactorClearInput();
    }
    else if (role === 'stabilizer') {
        if (rs) rs.style.display = 'block';
    }
}

function renderDispatcherCode(codeArray) {
    const container = getEl('dispatcher-secret-code');
    if (!container) return;
    container.innerHTML = '';
    codeArray.forEach(gene => {
        const span = document.createElement('span');
        span.textContent = gene;
        span.style.animation = "popIn 0.3s ease";
        container.appendChild(span);
    });
}

window.renderEngineerSlots = function() {
    const container = getEl('engineer-input-slots');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 0; i < requiredCodeLength; i++) {
        const slot = document.createElement('div');
        slot.style.width = '40px'; slot.style.height = '40px';
        slot.style.border = '2px dashed #555'; slot.style.borderRadius = '8px';
        slot.style.display = 'flex'; slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center'; slot.style.fontSize = '24px';
        
        if (engineerCurrentInput[i]) {
            slot.textContent = engineerCurrentInput[i];
            slot.style.border = '2px solid #00A3FF';
            slot.style.background = 'rgba(0, 163, 255, 0.1)';
        }
        container.appendChild(slot);
    }
}

window.reactorTypeGene = function(gene) {
    if (engineerCurrentInput.length >= requiredCodeLength) return;
    if (typeof playSound === 'function') playSound('click');
    
    engineerCurrentInput.push(gene);
    renderEngineerSlots();
    
    if (engineerCurrentInput.length === requiredCodeLength) {
        socket.emit('submitCode', { 
            roomId: currentPartyCode, 
            code: engineerCurrentInput 
        });
        showToast("Код отправлен на проверку...", "📡");
    }
}

socket.on('timerUpdate', (timeLeft) => {
    const timerEl = document.getElementById('reactor-timer');
    if (timerEl) {
        timerEl.textContent = timeLeft.toFixed(1);
        if (timeLeft <= 10) timerEl.style.color = '#ff3b30';
        else timerEl.style.color = '#fff';
    }
});

socket.on('correctCode', (data) => {
    reactorClearInput(); 
    playSound('win');
    
    const progressText = document.getElementById('reactor-progress-text');
    const progressBar = document.getElementById('reactor-progress-bar');
    if (progressText) progressText.textContent = data.progress;
    if (progressBar) progressBar.style.width = `${(data.progress / 3) * 100}%`;
    
    if (document.getElementById('role-dispatcher').style.display === 'block') {
        renderDispatcherCode(data.newCode);
    }
    showToast("Код подошел! Продолжаем!", "✅");
});

socket.on('wrongCode', (data) => {
    triggerReactorPenalty(); 
    showToast("-5 секунд за ошибку!", "❌");
    
    const timerEl = document.getElementById('reactor-timer');
    if (timerEl) timerEl.textContent = data.newTimeLeft.toFixed(1);
});

socket.on('gameWon', () => {
    handleReactorEnd('win'); 
});

socket.on('gameOver', () => {
    handleReactorEnd('lose'); 
});

// =============================================================
// МИНИ-ИГРА: ЭКСПЕДИЦИЯ
// =============================================================
function selectExpeditionLocation(loc) {
    currentExpeditionLocation = loc;
    document.querySelectorAll('#leader-location-selector .tab-btn').forEach(b => b.classList.remove('active'));
    
    let btn = getEl(`loc-btn-${loc}`); 
    if (btn) btn.classList.add('active');
    
    const scene = getEl('expedition-scene'); 
    if (scene) scene.className = `expedition-scene ${loc}-bg`;
}

function calculatePreStartSynergy() {
    let score = 0; 
    let farm_count = 0; 
    let pred_count = 0; 
    let magic_count = 0;
    
    currentPartyPlayersData.forEach(p => {
        let av = p.avatar;
        if (["unicorn", "dragon", "alien", "robot", "dino", "fireball", "god"].includes(av)) score += 10;
        else if (["fox", "panda", "tiger", "lion", "cow", "pig", "monkey", "owl"].includes(av)) score += 3;
        else score += 1;
        
        if (["cow", "pig", "duck"].includes(av)) farm_count++;
        if (["kitten", "tiger", "lion", "fox"].includes(av)) pred_count++;
        if (["dragon", "unicorn", "alien"].includes(av)) magic_count++;
    });

    let synergyText = [];
    if (farm_count >= 3) { score = Math.floor(score * 1.5); synergyText.push("🌾 Ферма (+50% лута)"); }
    if (pred_count >= 2) { synergyText.push("🐾 Хищники (-15% времени)"); }
    if (magic_count >= 1) { synergyText.push("✨ Магия (Выше шанс Осколка)"); }

    let scoreEl = getEl('expedition-pre-score'); 
    let synEl = getEl('synergy-display');
    
    if (scoreEl) scoreEl.textContent = score;
    if (synEl) synEl.innerHTML = synergyText.length > 0 ? `Активные баффы: ${synergyText.join(', ')}` : 'Соберите синергию петов!';
}

async function buyMegaRadar() {
    if (userStars < 100) { 
        showToast("Нужно 100 Звезд!", "❌"); 
        openBuyStarsModal(); 
        return; 
    }
    
    playSound('money'); 
    userStars -= 100; 
    saveData(); 
    updateBalanceUI(); 
    showToast("Мега-Радар активирован!", "📡");
    
    try { 
        await fetch(`${API_URL}/party/radar`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        }); 
    } catch(e) {}
}

async function startExpedition() {
    playSound('click'); 
    const btn = getEl('expedition-start-btn'); 
    if (btn) { 
        btn.disabled = true; 
        btn.textContent = "Отправляем..."; 
    }
    
    if (!currentExpeditionLocation) currentExpeditionLocation = 'forest';
    
    try {
        const res = await fetch(`${API_URL}/party/expedition/start`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, location: currentExpeditionLocation }) 
        });
        if (!res.ok) { 
            showToast("Ошибка БД! Пересоздайте пати!", "❌"); 
        } else { 
            showToast("Отряд выдвинулся в путь!", "🗺️"); 
        }
    } catch(e) { 
        showToast("Сбой сети", "❌"); 
    }
    
    if (btn) { 
        btn.disabled = false; 
        btn.textContent = "Отправить отряд"; 
    }
}

function updateTimerVisuals(seconds) {
    let timerEl = getEl('expedition-timer'); 
    if (!timerEl) return;
    
    if (seconds <= 0) { 
        timerEl.textContent = "00:00:00"; 
    } else {
        let h = Math.floor(seconds / 3600).toString().padStart(2, '0'); 
        let m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0'); 
        let s = (seconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
    }
}

function updateExpeditionUI(serverEndTime, score, loc, wolfHp, wolfMaxHp, serverTime) {
    const scene = getEl('expedition-scene'); 
    const petsContainer = getEl('expedition-pets-container'); 
    const wolfOverlay = getEl('wolf-overlay');
    const infoView = getEl('expedition-info-view'); 
    const activeView = getEl('expedition-active-view'); 
    const claimBtn = getEl('expedition-claim-btn');
    const timerEl = getEl('expedition-timer'); 
    const locSelector = getEl('leader-location-selector'); 
    const radarBadge = getEl('mega-radar-badge');
    
    if (!infoView || !activeView || !timerEl) return; 

    const safeWolfHp = wolfHp || 0; 
    const safeWolfMaxHp = wolfMaxHp || 1; 
    currentWolfHp = safeWolfHp;
    
    const sTime = serverTime || Math.floor(Date.now() / 1000);
    const isLobby = !serverEndTime || serverEndTime === 0;
    let secondsLeft = 0; 
    
    if (!isLobby) secondsLeft = serverEndTime - sTime;
    
    const isFinished = !isLobby && secondsLeft <= 0; 
    const isActive = !isLobby && secondsLeft > 0;

    if (radarBadge) radarBadge.style.display = isMegaRadarActive ? 'block' : 'none';

    let targetLoc = 'forest'; 
    if (isLobby) targetLoc = currentExpeditionLocation || 'forest'; 
    else targetLoc = loc || 'forest';
    
    if (scene && !scene.classList.contains(`${targetLoc}-bg`)) {
        scene.className = `expedition-scene ${targetLoc}-bg`;
    }

    if (currentPartyPlayersData && petsContainer) {
        petsContainer.innerHTML = '';
        currentPartyPlayersData.forEach(p => {
            const isWalking = (isActive && safeWolfHp === 0) ? 'walking-pet' : '';
            petsContainer.innerHTML += `<img src="assets/pets/pet-${p.avatar}.png" class="expedition-pet ${isWalking}" onerror="this.src='assets/eggs/egg-default.png'">`;
        });
    }

    if (isLobby) {
        currentExpeditionEndTime = 0; 
        if (scene) scene.classList.remove('scrolling-bg'); 
        if (wolfOverlay) wolfOverlay.style.display = 'none';
        
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if (changeBtn) changeBtn.style.display = 'inline-block';
        
        infoView.style.display = 'block'; 
        activeView.style.display = 'none';
        
        let radarBtn = getEl('expedition-radar-btn'); 
        if (radarBtn) radarBtn.style.display = isMegaRadarActive ? 'none' : 'block';

        if (isPartyLeader) {
            if (locSelector) locSelector.style.display = 'flex';
            let startBtn = getEl('expedition-start-btn'); 
            if (startBtn) startBtn.style.display = 'inline-block';
            let waitMsg = getEl('expedition-waiting-msg'); 
            if (waitMsg) waitMsg.style.display = 'none';
        } else {
            if (locSelector) locSelector.style.display = 'none';
            let startBtn = getEl('expedition-start-btn'); 
            if (startBtn) startBtn.style.display = 'none';
            let waitMsg = getEl('expedition-waiting-msg'); 
            if (waitMsg) waitMsg.style.display = 'block';
        }
        
        calculatePreStartSynergy();
        
        if (expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
        if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
        
    } else if (isActive) {
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if (changeBtn) changeBtn.style.display = 'none';
        
        if (locSelector) locSelector.style.display = 'none';
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        let multEl = getEl('expedition-multiplier'); 
        if (multEl) multEl.textContent = score;
        
        if (claimBtn) claimBtn.style.display = 'none';

        if (safeWolfHp > 0) {
            if (wolfOverlay) wolfOverlay.style.display = 'flex';
            let wolfBar = getEl('wolf-hp-bar'); 
            if (wolfBar) wolfBar.style.width = `${(safeWolfHp / safeWolfMaxHp) * 100}%`;
            timerEl.style.color = '#ff3b30'; 
            if (scene) scene.classList.remove('scrolling-bg');
            if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
        } else {
            if (wolfOverlay) wolfOverlay.style.display = 'none';
            timerEl.style.color = '#34c759'; 
            if (scene) scene.classList.add('scrolling-bg');
            if (!bonusSpawningInterval) bonusSpawningInterval = setInterval(spawnFlyingBonus, 8000);
        }

        if (currentExpeditionEndTime !== serverEndTime) {
            currentExpeditionEndTime = serverEndTime; 
            let localTargetTime = Math.floor(Date.now() / 1000) + secondsLeft;
            
            if (expeditionInterval) clearInterval(expeditionInterval);
            updateTimerVisuals(secondsLeft);
            
            expeditionInterval = setInterval(() => {
                let nowLocal = Math.floor(Date.now() / 1000); 
                let diff = localTargetTime - nowLocal;
                
                if (diff <= 0) {
                    clearInterval(expeditionInterval); 
                    expeditionInterval = null; 
                    timerEl.textContent = "00:00:00";
                    if (currentWolfHp === 0 && claimBtn) claimBtn.style.display = 'block';
                    if (scene) scene.classList.remove('scrolling-bg');
                    if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
                } else { 
                    updateTimerVisuals(diff); 
                }
            }, 1000);
        }
    } else if (isFinished) {
        currentExpeditionEndTime = 0; 
        if (scene) scene.classList.remove('scrolling-bg'); 
        if (wolfOverlay) wolfOverlay.style.display = 'none';
        
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if (changeBtn) changeBtn.style.display = 'none';
        
        if (locSelector) locSelector.style.display = 'none';
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        timerEl.textContent = "00:00:00"; 
        let multEl = getEl('expedition-multiplier'); 
        if (multEl) multEl.textContent = score; 
        timerEl.style.color = '#34c759';
        
        if (safeWolfHp === 0 && claimBtn) claimBtn.style.display = 'block';
        if (expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
        if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
    }
}

async function tapWolf() {
    playSound('click'); 
    const img = getEl('wolf-img');
    if (img) { 
        img.classList.remove('wolf-hit'); 
        void img.offsetWidth; 
        img.classList.add('wolf-hit'); 
    }
    
    try { 
        await fetch(`${API_URL}/party/expedition/wolf_damage`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, damage: 1 }) 
        }); 
    } catch(e) {}
}

function spawnFlyingBonus() {
    const scene = getEl('expedition-scene'); 
    if (!scene || !scene.classList.contains('scrolling-bg')) return;
    
    const b = document.createElement('div'); 
    b.className = 'flying-bonus'; 
    b.textContent = Math.random() > 0.5 ? '🦋' : '💰'; 
    b.style.bottom = (20 + Math.random() * 60) + 'px';
    
    b.onclick = () => { 
        playSound('money'); 
        walletBalance += 50; 
        saveData(); 
        updateBalanceUI(); 
        showToast('+50 монет!', 'img'); 
        if (b && b.parentNode) b.remove(); 
    };
    
    scene.appendChild(b); 
    setTimeout(() => { 
        if (b && b.parentNode) b.remove(); 
    }, 4000);
}

async function claimExpedition() {
    playSound('money'); 
    let multEl = getEl('expedition-multiplier'); 
    let score = multEl ? parseInt(multEl.textContent) : 1;
    
    let locMultiplier = 100; 
    if (currentExpeditionLocation === 'mountains') locMultiplier = 300; 
    if (currentExpeditionLocation === 'space') locMultiplier = 500; 
    
    let vipMult = isVip() ? 1.2 : 1; 
    let radarMult = isMegaRadarActive ? 2 : 1;
    
    let uniqueMutants = new Set(collection.filter(p => petDatabase.mutant.includes(p))).size; 
    let mutantBonus = 1 + (uniqueMutants * 0.05);
    
    let stars = petStars[selectedAvatar] || 1;
    let starBonus = 1 + ((stars - 1) * 0.1); 

    const reward = Math.floor(score * locMultiplier * vipMult * radarMult * mutantBonus * starBonus); 
    
    let magicCount = 0; 
    currentPartyPlayersData.forEach(p => { 
        if (["dragon", "unicorn", "alien"].includes(p.avatar)) magicCount++; 
    });
    
    const sceneClass = getEl('expedition-scene') ? getEl('expedition-scene').className : '';
    let shardChance = 0; 
    if (sceneClass.includes('space-bg')) shardChance += 25; 
    if (sceneClass.includes('mountains-bg')) shardChance += 5; 
    if (magicCount >= 1) shardChance += 15; 
    
    let droppedShard = false; 
    if (shardChance > 0 && (Math.random() * 100) < shardChance) { 
        pegasusShards += 1; 
        droppedShard = true; 
    }

    walletBalance += reward; 
    saveData(); 
    updateBalanceUI();
    
    let msgBonus = uniqueMutants > 0 ? ` (Мутанты: +${uniqueMutants*5}%)` : '';
    if (stars > 1) {
        msgBonus += ` (⭐️${stars}: +${(stars-1)*10}%)`;
    }

    if (droppedShard) { 
        showToast(`Лут: +${reward} монет${msgBonus} и ОСКОЛОК ПЕГАСА! 🧩`, "💰"); 
        fireConfetti(); 
    } else { 
        showToast(`Лут собран: +${reward} монет${msgBonus}!`, "💰"); 
    }

    try { 
        await fetch(`${API_URL}/party/expedition/claim`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        }); 
    } catch(e) {}
    
    closeModal('expedition-modal'); 
    if (isPartyLeader) {
        requestStopMiniGame(); 
    }
}

// =============================================================
// ГЛОБАЛЬНЫЙ РЫНОК (MARKET)
// =============================================================
let currentMarketTab = 'all';
let selectedPetForSale = null;

async function openMarketModal() {
    openModal('market-modal');
    switchMarketTab('all');
    await loadMarket();
}

function switchMarketTab(tab) {
    currentMarketTab = tab;
    document.querySelectorAll('#market-modal .tab-btn').forEach(b => b.classList.remove('active'));
    let activeBtn = getEl(`market-tab-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');
    loadMarket();
}

async function loadMarket() {
    const grid = getEl('market-items-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center; color:#888; grid-column: 1 / -1; padding: 20px;">Загрузка товаров... ⏳</div>';
    
    try {
        const res = await fetch(`${API_URL}/market/list`);
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
            const p = PRICES[r] || 0;
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
            
            d.innerHTML = `
                <div style="position:relative; width:100%; display:flex; justify-content:center;">
                    <img src="assets/pets/pet-${lot.pet_id}.png" style="width: 70px; height: 70px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));" onerror="this.src='assets/eggs/egg-default.png'">
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

async function buyMarketLot(lotId, price, currency) {
    if (currency === 'coins' && walletBalance < price) return showToast("Мало монет!", "❌");
    if (currency === 'stars' && userStars < price) return showToast("Мало звезд!", "❌");
    
    playSound('click');
    
    try {
        const res = await fetch(`${API_URL}/market/buy`, {
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
            
            let starStr = stars > 1 ? `<div class="star-badge" style="font-size:8px;">⭐️${stars}</div>` : '';
            
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" style="width:70%;height:70%;object-fit:contain;" onerror="this.src='assets/eggs/egg-default.png'">${starStr}`;
            d.onclick = () => selectPetToSell(pet, stars);
            sel.appendChild(d);
        });
    }
    
    getEl('selected-pet-to-sell').style.display = 'none';
    getEl('confirm-sell-btn').disabled = true;
    getEl('sell-price-input').value = '';
    
    openModal('sell-pet-modal');
}

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
        const res = await fetch(`${API_URL}/market/sell`, {
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

// =============================================================
// ЖЕЛЕЗОБЕТОННЫЙ ФИКС НАСТРОЕК И РЫНКА
// =============================================================
window.openSettings = function() {
    openModal('settings-modal');
    playSound('click');
};

async function checkMarketSales() {
    try {
        const uid = String(getTgUser().id);
        let res = await fetch(`${API_URL}/market/rewards/${uid}`);
        if (!res.ok) {
            res = await fetch(`${API_URL}/api/market/rewards/${uid}`);
        }
        
        const data = await res.json();
        
        if (data.rewards && data.rewards.length > 0) {
            let gotCoins = 0;
            let gotStars = 0;
            
            data.rewards.forEach(r => {
                if (r.currency === 'coins') gotCoins += r.amount;
                if (r.currency === 'stars') gotStars += r.amount;
            });
            
            if (gotCoins > 0) { 
                walletBalance += gotCoins; 
                showToast(`Вашего пета купили! +${gotCoins} 💰`, "🎉"); 
            }
            if (gotStars > 0) { 
                userStars += gotStars; 
                showToast(`Вашего пета купили! +${gotStars} ⭐️`, "🎉"); 
            }
            
            saveData();
            updateBalanceUI();
            playSound('money');
        }
    } catch(e) {}
}

setInterval(checkMarketSales, 5000);
setTimeout(checkMarketSales, 1000);

// =============================================================
// ЗАПУСК ИГРЫ
// =============================================================
window.onload = initGame;