// =============================================================
// 1. ЛОВУШКА ОШИБОК И ЗВУКОВОЙ ДВИЖОК
// =============================================================

const debugConsole = document.getElementById('debug-console');

window.onerror = function(msg, source, lineno) {
    if (debugConsole) {
        debugConsole.style.display = 'block';
        debugConsole.innerHTML += `<div class="error-msg">❌ ${msg} (стр. ${lineno})</div>`;
    }
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    if (debugConsole) {
        debugConsole.style.display = 'block';
        debugConsole.innerHTML += `<div class="error-msg">⚠️ Promise Error: ${event.reason}</div>`;
    }
});

const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = null;

try {
    audioCtx = new AudioContext();
} catch (e) {
    console.warn("AudioContext init delayed");
}

window.playSound = function(type) {
    if (!isSoundOn) {
        return;
    }
    
    if (!audioCtx) {
        return;
    }
    
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
    } 
    else if (type === 'money') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(1200, now); 
        osc.frequency.setValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); 
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); 
        osc.stop(now + 0.3);
    } 
    else if (type === 'win') {
        window.playNote(523.25, now, 0.1); 
        window.playNote(659.25, now + 0.1, 0.1); 
        window.playNote(783.99, now + 0.2, 0.4);
    } 
    else if (type === 'legendary') {
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(200, now); 
        osc.frequency.linearRampToValueAtTime(600, now + 1);
        gainNode.gain.setValueAtTime(0.3, now); 
        gainNode.gain.linearRampToValueAtTime(0.01, now + 1.5);
        osc.start(now); 
        osc.stop(now + 1.5);
    } 
    else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
};

window.playNote = function(freq, time, duration) {
    if (!audioCtx) {
        return;
    }
    
    const osc = audioCtx.createOscillator(); 
    const gain = audioCtx.createGain();
    
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, time); 
    gain.gain.linearRampToValueAtTime(0.01, time + duration);
    
    osc.start(time); 
    osc.stop(time + duration);
};

// =============================================================
// 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (ПОЛНЫЙ СПИСОК)
// =============================================================

var API_URL = "https://focushatcher-ondey.amvera.io/api"; 
var botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 

var socket = io("https://focushatcher-ondey.amvera.io");

var modalStack = [];

// Основной прогресс
var collection = [];
var userXP = 0;
var userLevel = 1;
var walletBalance = 0;
var userStars = 0;
var pegasusShards = 0;
var userJokers = 0; 
var dustBalance = 0; 
var hatchStreak = 0; 
var lastHatchDate = ""; 

// Данные Battle Pass
var claimedRewards = [];
var mythicTickets = 0;
var lastBpScroll = 0;

// === ДОСТИЖЕНИЯ И ТИТУЛЫ ===
var focusHours = 0;
var mythicsCrafted = 0;
var reactorWins = 0;
var equippedTitle = "";
var unlockedTitles = [];

// Инвентарь и настройки
var ownedItems = { 
    themes: ['default'], 
    eggs: ['default'] 
};

var activeTheme = 'default';
var activeEggSkin = 'default';
var selectedAvatar = 'default';

var userStats = { 
    hatched: 0, 
    earned: 0, 
    invites: 0, 
    crafts: 0, 
    totalDaysLogged: 0, 
    baseTickets: 0, 
    epicTickets: 0 
};

var myBoosters = { 
    luck: 0, 
    speed: 0, 
    bio: 0 
};

var claimedAchievements = [];
var claimedQuests = [];
var usedCodes = [];
var isVibrationOn = true;
var isSoundOn = false;

// Друзья, Витрина и Синдикаты
var currentFriendsList = [];
var currentViewingFriendId = null;
var currentPublicUser = null;
var userShowcase = { 
    center: null, 
    left: null, 
    right: null 
};
var currentShowcaseSlot = null;

var mySyndicateId = null;
var createSynSelectedAvatar = 'default';
var isEditingSyndicate = false;

// Таймеры и механики
var vipEndTime = 0;
var hasSecondSlot = false;
var secondSlotEndTime = 0;
var localSaveTime = 0; 
var currentModeIndex = 0;
var timerInterval = null;
var isRunning = false;
var timeLeft = 10;
var activeBoosters = { 
    luck: false, 
    speed: false, 
    bio: false 
};
var currentHatchMode = 'none'; 
var currentShopTab = 'themes';
var currentAchTab = 'achievements';
var selectedPet = null;

var customEggConfig = { 
    target: 'all', 
    timeOnline: 3600, 
    timeOffline: 5 * 3600 
};

var resurrectCountdownInterval = null;
var secondSlotInterval = null;

// Мультиплеер (Пати)
var currentPartyCode = null;
var partyPollingInterval = null;
var isPartyLeader = false;
var currentActiveGame = 'none';
var currentPartyPlayersData = [];
var invitesPollingInterval = null;
var currentPendingInviteId = null;

// Босс-Рейд и Экспедиция
var currentExpeditionLocation = 'forest'; 
var currentExpeditionEndTime = 0; 
var bossTimerInterval = null; 
var bossTimeLeft = 60; 
var bossIsDead = false;
var expeditionInterval = null;
var bonusSpawningInterval = null;
var currentWolfHp = 0;
var isMegaRadarActive = false; 

// Рулетка и Forbes
var lastRouletteDate = ""; 
var boxAdsProgress = { 
    epic: 0, 
    mythic: 0 
};
var currentBoxType = 'base';
var secretTaps = 0;
var secretTapTimer = null;
var forbesDataCache = null;
var currentForbesTab = 'global';

// ДНК, Паразиты, Уровни петов, Контракты
var dnaGrid = [];
var isStunned = false;
var parasiteInterval = null;
var petStars = {}; 
var activeContracts = { 
    date: '', 
    allClaimed: false, 
    tasks: [] 
}; 

// === НОВЫЕ ПЕРЕМЕННЫЕ ЛАБОРАТОРИИ И МУТАТОРА ===
var currentLabTab = 'upgrade';
var mutatorSlot1 = null;
var mutatorSlot2 = null;
var mutatorCatalyst = null;
var currentMutatorSelecting = null; 

// Глобальный Рынок
var currentMarketTab = 'all';
var selectedPetForSale = null;

// =============================================================
// БЕЗОПАСНЫЙ ПАРСИНГ ДАННЫХ И ФОРМАТИРОВАНИЕ
// =============================================================

window.safeParse = function(val, def) {
    if (!val || val === 'undefined' || val === 'null') {
        return def;
    }
    try { 
        return JSON.parse(val); 
    } catch(e) { 
        return def; 
    }
};

window.formatNumber = function(num) {
    if (num === undefined || num === null) {
        return 0;
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

window.getEl = function(id) { 
    return document.getElementById(id); 
};

window.formatTime = function(s) { 
    if (s >= 3600) {
        return `${Math.floor(s/3600)}ч ${Math.floor((s%3600)/60).toString().padStart(2,'0')}м`;
    }
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`; 
};

window.getPetImg = function(id) { 
    if (id === 'default') {
        return 'assets/ui/icon-profile.png';
    }
    return `assets/pets/pet-${id}.png`; 
};

// =============================================================
// 3. БАЗЫ ДАННЫХ И КОНСТАНТЫ
// =============================================================

const MODES = [
    { 
        id: 'short', 
        timeOnline: 25 * 60, 
        timeOffline: 6 * 3600, 
        xpReward: 250, 
        egg: 'default', 
        title: 'Базовое Яйцо (25 мин)', 
        sub: 'Шанс Легендарки: 1%', 
        reqLevel: 1 
    },
    { 
        id: 'long', 
        timeOnline: 60 * 60, 
        timeOffline: 12 * 3600, 
        xpReward: 1000, 
        egg: 'diamond', 
        title: 'Алмазное (60 мин)', 
        sub: 'Шанс Легендарки: 5% 🔥', 
        reqLevel: 3 
    },
    { 
        id: 'custom', 
        timeOnline: 3600, 
        timeOffline: 5 * 3600, 
        xpReward: 500, 
        egg: 'default', 
        title: 'Кастомное яйцо', 
        sub: 'Настрой редкость', 
        reqLevel: 5 
    },
    { 
        id: 'alien', 
        timeOnline: 2 * 3600, 
        timeOffline: 14 * 3600, 
        xpReward: 3000, 
        egg: 'glitch', 
        title: 'Инопланетное (2 ч)', 
        sub: 'Только Легенды и Мифики', 
        reqLevel: 30 
    },
    { 
        id: 'radio', 
        timeOnline: 5 * 60, 
        timeOffline: 1 * 3600, 
        xpReward: 500, 
        egg: 'glow', 
        title: 'Радиоактивное (5 мин)', 
        sub: 'Только Мутанты ☢️ (Нужен бустер 💉)', 
        reqLevel: 50 
    },
    { 
        id: 'anomal', 
        timeOnline: 45 * 60, 
        timeOffline: 45 * 60, 
        xpReward: 2000, 
        egg: 'glitch', 
        title: 'Аномальное (45 мин)', 
        sub: 'Только в выходные (50 ✨)', 
        reqLevel: 1 
    }
];

const PRICES = { 
    common: 15, 
    rare: 150, 
    epic: 1500, 
    legendary: 5000, 
    mythic: 50000, 
    mutant: 10000, 
    glitch: 7777
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

// === ДОБАВЛЕНЫ НОВЫЕ АНОМАЛИИ В БАЗУ ===
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
    "raccoon": "Енот", 
    "panther": "Пантера", 
    "cyber_fox": "Кибер-лис",
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
    "neon_dragon": "Неоновый Дракон",
    "mutant_cat": "Мутакот ☢️", 
    "mutant_dog": "Токси-Пёс ☢️", 
    "mutant_dragon": "Гамма-Ящер ☢️",
    "cyber_cat": "Кибер-Кот 👾", 
    "matrix_dog": "Матричный Пёс 👾", 
    "cyber_pig": "Кибер-Хрюшка 👾", 
    "toxic_caterpillar": "Токсичная Гусеница ☢️", 
    "quantum_kitten": "Квантовый Кот ⚛️"
};

const petDatabase = {
    common: [
        "chick", "kitten", "puppy", "hamster", "bunny", 
        "frog", "bear", "koala", "duck", "caterpillar"
    ],
    rare: [
        "fox", "panda", "tiger", "lion", 
        "cow", "pig", "monkey", "owl"
    ],
    epic: [
        "raccoon", "panther", "cyber_fox"
    ],
    legendary: [
        "unicorn", "dragon", "alien", "robot", 
        "dino", "fireball"
    ],
    mythic: [
        "pegasus", "cerberus", "dark_dragon", "neon_dragon"
    ],
    mutant: [
        "mutant_cat", "mutant_dog", "mutant_dragon", "toxic_caterpillar"
    ],
    glitch: [
        "cyber_cat", "matrix_dog", "cyber_pig", "quantum_kitten"
    ]
};

const ALL_PETS_FLAT = [
    ...petDatabase.common, 
    ...petDatabase.rare, 
    ...petDatabase.epic, 
    ...petDatabase.legendary, 
    ...petDatabase.mythic, 
    ...petDatabase.mutant,
    ...petDatabase.glitch, 
    "god"
];

const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

window.getPetRarity = function(p) {
    if (p === "god") {
        return 'legendary';
    }
    if (petDatabase.mythic.includes(p)) {
        return 'mythic';
    }
    if (petDatabase.mutant.includes(p)) {
        return 'mutant';
    }
    if (petDatabase.glitch.includes(p)) {
        return 'glitch'; 
    }
    if (petDatabase.legendary.includes(p)) {
        return 'legendary';
    }
    if (petDatabase.epic.includes(p)) {
        return 'epic'; 
    }
    if (petDatabase.rare.includes(p)) {
        return 'rare';
    }
    return 'common';
};

// === BATTLE PASS 100 УРОВНЕЙ ===
const BATTLE_PASS_REWARDS = [];

for (let i = 1; i <= 100; i++) {
    let free = { 
        type: 'money', 
        val: i * 500, 
        icon: '💰', 
        name: `${window.formatNumber(i*500)} Монет`, 
        dustVal: i * 5 
    };
    
    let pro = { 
        type: 'dust', 
        val: i * 5, 
        icon: '✨', 
        name: `${i*5} Пыли`, 
        dustVal: 0 
    }; 

    if (i % 10 === 5) { 
        free = { 
            type: 'roulette_ticket', 
            val: 'base', 
            icon: '🎟️', 
            name: 'Обычный Билет', 
            dustVal: 10 
        };
        pro = { 
            type: 'stars', 
            val: 15, 
            icon: '⭐️', 
            name: '15 Звезд', 
            dustVal: 10 
        };
    }
    
    if (i % 10 === 0) { 
        free = { 
            type: 'roulette_ticket', 
            val: 'epic', 
            icon: '🎫', 
            name: 'Эпик Билет', 
            dustVal: 20 
        };
        pro = { 
            type: 'joker', 
            val: 1, 
            icon: '🧬', 
            name: 'Ген Мутации', 
            dustVal: 50 
        };
    }

    if (i === 25) { 
        free = { 
            type: 'pet_and_ticket', 
            pet: 'cyber_fox', 
            ticket: 'epic', 
            icon: '🦊', 
            name: 'Кибер-лис + Билет', 
            dustVal: 100 
        }; 
        pro = { 
            type: 'bg_and_ticket', 
            bg: 'cyberpunk', 
            ticket: 'mythic', 
            icon: '🌆', 
            name: 'Cyberpunk + Билет', 
            dustVal: 200 
        }; 
    }
    
    if (i === 50) { 
        free = { 
            type: 'pet', 
            val: 'god', 
            icon: 'assets/pets/pet-god.png', 
            name: 'Бог Фокуса', 
            dustVal: 200 
        }; 
        pro = { 
            type: 'bundle_50', 
            icon: '🎁', 
            name: '2 Гена + 50 ⭐️ + Билет', 
            dustVal: 300 
        }; 
    }
    
    if (i === 75) { 
        free = { 
            type: 'pet', 
            val: 'pegasus', 
            icon: 'assets/pets/pet-pegasus.png', 
            name: 'Пегас', 
            dustVal: 300 
        }; 
        pro = { 
            type: 'bundle_75', 
            icon: '🎁', 
            name: 'Яйцо Голограмма + 3 Гена', 
            dustVal: 400 
        }; 
    }
    
    if (i === 100) { 
        free = { 
            type: 'pet', 
            val: 'dark_dragon', 
            icon: 'assets/pets/pet-dark_dragon.png', 
            name: 'Тёмный Дракон', 
            dustVal: 500 
        }; 
        pro = { 
            type: 'bundle_100', 
            icon: '🎁', 
            name: 'Матрица + 150⭐️ + Неон Дракон', 
            dustVal: 1000 
        }; 
    }

    BATTLE_PASS_REWARDS.push({ 
        level: i, 
        free: free, 
        pro: pro 
    });
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

// === ТИТУЛЫ ===
const TITLES_DATA = [
    { id: 'time_lord', req: 100, type: 'focus', title: '👑 Повелитель Времени', desc: '100 часов фокуса' },
    { id: 'mad_scientist', req: 5, type: 'mythic', title: '☢️ Безумный Ученый', desc: 'Скрафтить 5 мификов' },
    { id: 'quantum_eng', req: 10, type: 'reactor', title: '⚡ Квантовый Инженер', desc: '10 побед в Реакторе' }
];

const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма', price: 0, bgFile: null },
        { id: 'forest', name: 'Лес', price: 10000, bgFile: 'assets/bg/bg-forest.jpg' },
        { id: 'space', name: 'Космос', price: 25000, bgFile: 'assets/bg/bg-space.jpg' },
        { id: 'neon', name: 'Неон', price: 50000, bgFile: 'assets/bg/bg-neon.jpg' },
        { id: 'cyberpunk', name: 'Киберпанк (PRO 25)', price: 'Заблокировано', isPremium: true, bgFile: 'assets/bg/bg-cyberpunk.jpg' },
        { id: 'matrix', name: 'Матрица (PRO 100)', price: '50 ⭐️', isPremium: true, bgFile: null }
    ],
    eggs: [
        { id: 'default', name: 'Стандарт', price: 0, img: 'assets/eggs/egg-default.png' },
        { id: 'glow', name: 'Сияние', price: 10000, img: 'assets/eggs/egg-glow.png' },
        { id: 'ice', name: 'Лед', price: 20000, img: 'assets/eggs/egg-ice.png' },
        { id: 'glitch', name: 'Глюк', price: 50000, img: 'assets/eggs/egg-glitch.png' },
        { id: 'holo', name: 'Голограмма', price: '20 ⭐️', isPremium: true, img: 'assets/eggs/egg-ice.png' }
    ],
    boosters: [
        { id: 'luck', name: 'Зелье Удачи', baseCoins: 5000, baseStars: 5, icon: 'assets/ui/booster-luck.png', desc: 'Шанс x5' },
        { id: 'speed', name: 'Ускоритель', baseCoins: 5000, baseStars: 5, icon: 'assets/ui/booster-speed.png', desc: 'Меньше времени' },
        { id: 'bio', name: 'Шприц 💉', baseCoins: 15000, baseStars: 15, icon: '💉', desc: 'Мутант гарантирован' }
    ]
};

window.getDailyRewardsConfig = function() {
    let totalDays = userStats.totalDaysLogged || 0;
    let week = Math.floor(totalDays / 7);
    
    let day7Reward = { type: 'mixed', booster: 'bio', dust: 50 };
    if (week >= 2) {
        day7Reward = { type: 'shard', val: 1 };
    }

    return [
        { day: 1, type: 'money', val: 1000 }, 
        { day: 2, type: 'dust', val: 15 }, 
        { day: 3, type: 'booster', id: 'luck', val: 1 },
        { day: 4, type: 'money', val: 5000 }, 
        { day: 5, type: 'stars', val: 10 }, 
        { day: 6, type: 'booster', id: 'bio', val: 1 }, 
        { day: 7, ...day7Reward }
    ];
};

const ROULETTE_PRIZES = {
    base: [
        { n: "1 000 Монет", t: 'money', v: 1000, p: 40 },
        { n: "5 000 Монет", t: 'money', v: 5000, p: 20 },
        { n: "Бустер Удачи", t: 'luck', v: 1, p: 15 },
        { n: "Ген Мутации", t: 'joker', v: 1, p: 10 },
        { n: "10 Звезд", t: 'stars', v: 10, p: 10 },
        { n: "Осколок Пегаса", t: 'shard', v: 1, p: 5 }
    ],
    epic: [
        { n: "5 000 Монет", t: 'money', v: 5000, p: 35 },
        { n: "10 000 Монет", t: 'money', v: 10000, p: 24 },
        { n: "Бустер Удачи x3", t: 'luck', v: 3, p: 15 },
        { n: "Ген Мутации x2", t: 'joker', v: 2, p: 15 },
        { n: "Осколок Пегаса", t: 'shard', v: 1, p: 10 },
        { n: "СЛУЧАЙНАЯ ЛЕГЕНДА!", t: 'legendary_random', v: 1, p: 1 }
    ],
    mythic: [
        { n: "15 000 Монет", t: 'money', v: 15000, p: 30 },
        { n: "Ген Мутации x5", t: 'joker', v: 5, p: 25 },
        { n: "Осколок Пегаса x2", t: 'shard', v: 2, p: 20 },
        { n: "50 Звезд", t: 'stars', v: 50, p: 15 },
        { n: "Бог Фокуса", t: 'pet', v: 'god', p: 5 },
        { n: "СЛУЧАЙНАЯ ЛЕГЕНДА!", t: 'legendary_random', v: 1, p: 5 }
    ]
};

// =============================================================
// 4. ОБЩИЕ ФУНКЦИИ (СБРОС, АВТОРИЗАЦИЯ, МОДАЛКИ И ФИКС Z-INDEX)
// =============================================================

window.hardReset = function() { 
    if (confirm("Сбросить все?")) { 
        localStorage.clear(); 
        location.reload(); 
    } 
};

window.getTgUser = function() {
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
};

window.isVip = function() { 
    return Date.now() < vipEndTime; 
};

window.openModal = function(id) {
    window.playSound('click');
    
    if (modalStack.length > 0 && modalStack[modalStack.length - 1] === id) {
        return;
    }
    
    if (modalStack.length > 0) {
        let prevId = modalStack[modalStack.length - 1];
        if (prevId !== 'more-modal' && prevId !== 'syndicate-view-modal' && prevId !== 'showcase-setup-modal' && id !== 'syn-avatar-selector-modal' && id !== 'syndicate-settings-modal') {
            const prevEl = window.getEl(prevId);
            if (prevEl) {
                prevEl.style.display = 'none';
            }
        }
    }
    
    const el = window.getEl(id);
    if (el) { 
        let newZIndex = 1060 + (modalStack.length * 10);
        el.style.zIndex = newZIndex.toString();
        el.style.display = 'flex'; 
        modalStack.push(id); 
    }
};

window.closeModal = function(id) {
    window.playSound('click');
    const el = window.getEl(id);
    if (el) {
        el.style.display = 'none';
    }
    
    modalStack = modalStack.filter(m => m !== id);
    
    if (modalStack.length > 0) {
        const prevId = modalStack[modalStack.length - 1];
        const prevEl = window.getEl(prevId);
        if (prevEl) {
            prevEl.style.display = 'flex';
        }
    }
};

window.showToast = function(msg, icon='🔔') {
    const c = window.getEl('toast-container'); 
    if (!c) {
        return;
    }
    
    const d = document.createElement('div');
    let content = icon === 'img' ? `<img src="assets/ui/coin.png"> <span>${msg}</span>` : `<span>${icon}</span> <span>${msg}</span>`;
    
    d.className = 'toast'; 
    d.innerHTML = content;
    
    c.appendChild(d); 
    
    setTimeout(() => { 
        d.classList.add('fade-out'); 
        setTimeout(() => {
            d.remove();
        }, 300); 
    }, 3000);
};

window.fireConfetti = function() {
    const canvas = document.getElementById('confetti-canvas'); 
    if (!canvas) {
        return;
    }
    
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
            
            if (p.y > canvas.height) {
                particles.splice(index, 1);
            }
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(draw); 
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    draw();
};

// =============================================================
// 5. КОНТРАКТЫ И ЕЖЕДНЕВНЫЕ НАГРАДЫ
// =============================================================
window.checkContracts = function() {
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
        
        window.saveData();
    }
};

window.updateContract = function(type, val) {
    if (!activeContracts.tasks) {
        return;
    }
    
    let updated = false;
    
    activeContracts.tasks.forEach(t => {
        if (t.t === type && !t.c && t.p < t.g) {
            t.p += val; 
            if (t.p > t.g) {
                t.p = t.g;
            }
            if (t.p === t.g && !t.notified) { 
                window.showToast('Контракт выполнен!', '📜'); 
                t.notified = true; 
                window.playSound('win'); 
            }
            updated = true;
        }
    });
    
    if (updated) {
        window.saveData();
    }
};

window.claimContract = function(idx) {
    let t = activeContracts.tasks[idx]; 
    if (t.c) {
        return;
    }
    
    t.c = true;
    
    if (t.r.t === 'money') {
        walletBalance += t.r.v;
    }
    if (t.r.t === 'stars') {
        userStars += t.r.v;
    }
    if (t.r.t === 'joker') {
        userJokers += t.r.v;
    }
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
        setTimeout(() => { 
            window.showToast('БОНУС +500 XP за 3 контракта!', '🔥'); 
        }, 1000);
    }
    
    while (userXP >= userLevel * 200) { 
        userXP -= userLevel * 200; 
        userLevel++; 
        window.showToast(`Lvl UP: ${userLevel} 🏆`, "🎉"); 
        window.playSound('win'); 
    }
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.updateLevelUI(); 
    window.renderQuests(); 
    window.showToast(`Награда получена! (+30 XP)`, '🎁'); 
    window.playSound('money');
};

window.checkTutorial = function() { 
    if (!localStorage.getItem('tutorialSeen')) {
        window.openModal('tutorial-modal'); 
    }
};

window.closeTutorial = function() { 
    localStorage.setItem('tutorialSeen', 'true'); 
    window.closeModal('tutorial-modal'); 
    window.checkDailyReward(); 
};

window.checkDailyReward = function() {
    const today = new Date().toDateString(); 
    const lastLogin = localStorage.getItem('lastLoginDate');
    let streak = parseInt(localStorage.getItem('dailyStreak')) || 0;
    
    if (lastLogin === today) {
        return; 
    }
    
    const yesterday = new Date(); 
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin !== yesterday.toDateString()) {
        streak = 0;
    }
    
    window.renderDailyModal(streak); 
    window.openModal('daily-modal'); 
    window.playSound('win'); 
};

window.renderDailyModal = function(curr) {
    const g = window.getEl('daily-grid'); 
    if (!g) {
        return;
    }
    
    g.innerHTML = ''; 
    const D_REWARDS = window.getDailyRewardsConfig();
    
    D_REWARDS.forEach((r, i) => {
        const d = document.createElement('div'); 
        let st = ''; 
        if (i < curr) {
            st = 'claimed'; 
        }
        if (i === curr) {
            st = 'active';
        }
        
        d.className = `daily-item ${st}`;
        
        let iconHTML = '';
        if (r.type === 'money') {
            iconHTML = `<img src="assets/ui/coin.png" class="daily-icon-img">`;
        } else if (r.type === 'dust') {
            iconHTML = `<div style="font-size:30px; margin-bottom:5px;">✨</div>`;
        } else if (r.type === 'stars') {
            iconHTML = `<div style="font-size:30px; margin-bottom:5px;">⭐️</div>`;
        } else if (r.type === 'booster') {
            iconHTML = r.id === 'speed' ? `<img src="assets/ui/booster-speed.png" class="daily-icon-img">` : `<div style="font-size:30px; margin-bottom:5px;">${r.icon || '💉'}</div>`;
        } else if (r.type === 'shard') {
            iconHTML = `<div style="font-size:30px; margin-bottom:5px;">🧩</div>`; 
        } else if (r.type === 'mixed') {
            iconHTML = `<div style="font-size:30px; margin-bottom:5px;">🎁</div>`; 
        }
        
        let v = '';
        if (r.type === 'money') {
            v = `+${window.formatNumber(r.val)}`; 
        } else if (r.type === 'dust') {
            v = `+${window.formatNumber(r.val)} Пыли`;
        } else if (r.type === 'stars') {
            v = `+${r.val} Звезд`; 
        } else if (r.type === 'shard') {
            v = `Осколок!`;
        } else if (r.type === 'booster') {
            v = '+1 Буст'; 
        } else if (r.type === 'mixed') {
            v = `СУПЕР-ПРИЗ!`;
        }
        
        d.innerHTML = `<div class="daily-day">День ${r.day}</div>${iconHTML}<div class="daily-val">${v}</div>`; 
        g.appendChild(d);
    });
};

window.claimDaily = function() {
    let s = parseInt(localStorage.getItem('dailyStreak')) || 0;
    const t = new Date().toDateString(); 
    const l = localStorage.getItem('lastLoginDate');
    const y = new Date(); 
    y.setDate(y.getDate() - 1);
    
    if (l && l !== y.toDateString()) {
        s = 0;
    }
    
    if (!userStats.totalDaysLogged) {
        userStats.totalDaysLogged = 0;
    }
    userStats.totalDaysLogged++;

    const D_REWARDS = window.getDailyRewardsConfig(); 
    const r = D_REWARDS[s]; 
    let bonusMult = window.isVip() ? 1.2 : 1;
    
    if (r.type === 'money') {
        walletBalance += Math.floor(r.val * bonusMult);
    } else if (r.type === 'dust') {
        dustBalance += Math.floor(r.val * bonusMult);
    } else if (r.type === 'stars') {
        userStars += r.val;
    } else if (r.type === 'shard') {
        pegasusShards++;
    } else if (r.type === 'booster') { 
        if (!myBoosters[r.id]) myBoosters[r.id] = 0; 
        myBoosters[r.id]++; 
    } else if (r.type === 'mixed') { 
        dustBalance += Math.floor(r.dust * bonusMult); 
        if (!myBoosters[r.booster]) myBoosters[r.booster] = 0; 
        myBoosters[r.booster]++; 
    }
    
    s++; 
    if (s >= 7) {
        s = 0;
    }
    
    localStorage.setItem('dailyStreak', s); 
    localStorage.setItem('lastLoginDate', t);
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.showToast("Награда получена!", "📅"); 
    window.closeModal('daily-modal'); 
    window.playSound('money');
};

// =============================================================
// 6. ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЕ В ОБЛАКО
// =============================================================

window.initGame = function() {
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
            collection = window.safeParse(localStorage.getItem('myCollection'), []);
            userXP = parseInt(localStorage.getItem('userXP')) || 0; 
            walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
            userStars = parseInt(localStorage.getItem('userStars')) || 0; 
            pegasusShards = parseInt(localStorage.getItem('pegasusShards')) || 0; 
            userJokers = parseInt(localStorage.getItem('userJokers')) || 0; 
            dustBalance = parseInt(localStorage.getItem('dustBalance')) || 0; 
            claimedRewards = window.safeParse(localStorage.getItem('claimedRewards'), []); 
            mythicTickets = parseInt(localStorage.getItem('mythicTickets')) || 0;
            hatchStreak = parseInt(localStorage.getItem('hatchStreak')) || 0; 
            lastHatchDate = localStorage.getItem('lastHatchDate') || "";
            ownedItems = window.safeParse(localStorage.getItem('ownedItems'), { themes: ['default'], eggs: ['default'] });
            activeTheme = localStorage.getItem('activeTheme') || 'default'; 
            activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
            selectedAvatar = localStorage.getItem('selectedAvatar') || 'default'; 
            
            let s = window.safeParse(localStorage.getItem('userStats'), {}); 
            userStats = { hatched: 0, earned: 0, invites: 0, crafts: 0, totalDaysLogged: 0, baseTickets: 0, epicTickets: 0, ...s };
            
            let b = window.safeParse(localStorage.getItem('myBoosters'), {}); 
            myBoosters = { luck: b.luck || 0, speed: b.speed || 0, bio: b.bio || 0 };
            
            claimedAchievements = window.safeParse(localStorage.getItem('claimedAchievements'), []); 
            claimedQuests = window.safeParse(localStorage.getItem('claimedQuests'), []);
            usedCodes = window.safeParse(localStorage.getItem('usedCodes'), []); 
            
            isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';
            isSoundOn = localStorage.getItem('isSoundOn') === 'true'; 
            
            vipEndTime = parseInt(localStorage.getItem('vipEndTime')) || 0;
            hasSecondSlot = localStorage.getItem('hasSecondSlot') === 'true'; 
            secondSlotEndTime = parseInt(localStorage.getItem('secondSlotEndTime')) || 0;
            lastRouletteDate = localStorage.getItem('lastRouletteDate') || ""; 
            boxAdsProgress = window.safeParse(localStorage.getItem('boxAdsProgress'), { epic: 0, mythic: 0 });
            petStars = window.safeParse(localStorage.getItem('petStars'), {}); 
            activeContracts = window.safeParse(localStorage.getItem('activeContracts'), { date: '', allClaimed: false, tasks: [] });
            customEggConfig = window.safeParse(localStorage.getItem('customEggConfig'), { target: 'all', timeOnline: 3600, timeOffline: 5 * 3600 });
            userShowcase = window.safeParse(localStorage.getItem('userShowcase'), { center: null, left: null, right: null });
            
            // Титулы
            focusHours = parseFloat(localStorage.getItem('focusHours')) || 0;
            mythicsCrafted = parseInt(localStorage.getItem('mythicsCrafted')) || 0;
            reactorWins = parseInt(localStorage.getItem('reactorWins')) || 0;
            equippedTitle = localStorage.getItem('equippedTitle') || "";
            unlockedTitles = window.safeParse(localStorage.getItem('unlockedTitles'), []);
        }
    } catch(e) {
        console.error("Storage read error", e);
    }

    let profileBtn = window.getEl('header-profile-btn');
    if (selectedAvatar !== 'default' && profileBtn) {
        profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
    }
    
    let vibToggle = window.getEl('vibration-toggle');
    if (vibToggle) { 
        vibToggle.checked = isVibrationOn; 
        vibToggle.onchange = (e) => { 
            isVibrationOn = e.target.checked; 
            localStorage.setItem('isVibrationOn', isVibrationOn); 
            window.playSound('click'); 
        }; 
    }
    
    let soundToggle = window.getEl('sound-toggle');
    if (soundToggle) { 
        soundToggle.checked = isSoundOn; 
        soundToggle.onchange = (e) => { 
            isSoundOn = e.target.checked; 
            localStorage.setItem('isSoundOn', isSoundOn); 
            if (isSoundOn) {
                window.playSound('click'); 
            }
        }; 
    }
    
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        window.loadFromCloud(); 
    } else {
        window.postInit();
    }
};

window.loadFromCloud = function() {
    const keys = [
        'walletBalance', 'userStars', 'userXP', 'userLevel', 'myCollection', 
        'ownedItems', 'activeTheme', 'activeEggSkin', 'userStats', 'myBoosters', 
        'claimedAchievements', 'claimedQuests', 'selectedAvatar', 'pegasusShards', 
        'vipEndTime', 'hasSecondSlot', 'secondSlotEndTime', 'userJokers', 
        'lastRouletteDate', 'lastSaveTime', 'boxAdsProgress', 'petStars', 'activeContracts', 
        'hatchStreak', 'lastHatchDate', 'dustBalance', 'claimedRewards', 'mythicTickets', 
        'customEggConfig', 'userShowcase', 'focusHours', 'mythicsCrafted', 'reactorWins', 
        'equippedTitle', 'unlockedTitles'
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
                if (values.claimedRewards) claimedRewards = window.safeParse(values.claimedRewards, []);
                if (values.mythicTickets) mythicTickets = parseInt(values.mythicTickets); 
                if (values.customEggConfig) customEggConfig = window.safeParse(values.customEggConfig, { target: 'all', timeOnline: 3600, timeOffline: 5 * 3600 });
                if (values.userShowcase) userShowcase = window.safeParse(values.userShowcase, { center: null, left: null, right: null });
                if (values.hatchStreak) hatchStreak = parseInt(values.hatchStreak); 
                if (values.lastHatchDate) lastHatchDate = values.lastHatchDate;
                if (values.myCollection) collection = window.safeParse(values.myCollection, []); 
                if (values.ownedItems) ownedItems = window.safeParse(values.ownedItems, { themes: ['default'], eggs: ['default'] });
                if (values.activeTheme) activeTheme = values.activeTheme; 
                if (values.activeEggSkin) activeEggSkin = values.activeEggSkin; 
                if (values.selectedAvatar) selectedAvatar = values.selectedAvatar;
                if (values.userStats) userStats = {...userStats, ...window.safeParse(values.userStats, {})};
                if (values.myBoosters) { 
                    let cb = window.safeParse(values.myBoosters, {}); 
                    myBoosters = { luck: cb.luck || 0, speed: cb.speed || 0, bio: cb.bio || 0 }; 
                }
                if (values.claimedAchievements) claimedAchievements = window.safeParse(values.claimedAchievements, []); 
                if (values.claimedQuests) claimedQuests = window.safeParse(values.claimedQuests, []);
                if (values.vipEndTime) vipEndTime = parseInt(values.vipEndTime); 
                if (values.hasSecondSlot) hasSecondSlot = values.hasSecondSlot === 'true';
                if (values.secondSlotEndTime) secondSlotEndTime = parseInt(values.secondSlotEndTime); 
                if (values.lastRouletteDate) lastRouletteDate = values.lastRouletteDate;
                if (values.boxAdsProgress) boxAdsProgress = window.safeParse(values.boxAdsProgress, { epic: 0, mythic: 0 }); 
                if (values.petStars) petStars = window.safeParse(values.petStars, {});
                if (values.activeContracts) activeContracts = window.safeParse(values.activeContracts, { date: '', allClaimed: false, tasks: [] });
                
                if (values.focusHours) focusHours = parseFloat(values.focusHours);
                if (values.mythicsCrafted) mythicsCrafted = parseInt(values.mythicsCrafted);
                if (values.reactorWins) reactorWins = parseInt(values.reactorWins);
                if (values.equippedTitle) equippedTitle = values.equippedTitle;
                if (values.unlockedTitles) unlockedTitles = window.safeParse(values.unlockedTitles, []);

                let profileBtn = window.getEl('header-profile-btn');
                if (selectedAvatar !== 'default' && profileBtn) {
                    profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
                }
                window.saveData(true); 
            } else if (userLevel > cloudLevel) {
                window.saveData(false); 
            }
        } else if (!err && (!values || !values.userLevel)) { 
            if (userLevel > 1) {
                window.saveData(false); 
            }
        }
        window.postInit();
    });
};

window.postInit = function() {
    try { window.checkContracts(); } catch(e) {}
    try { window.updateUI(); } catch(e) {}
    try { window.checkBackgroundHatch(); } catch(e) {}
    try { window.updateSecondSlotUI(); } catch(e) {}
    try { window.updateLevelUI(); } catch(e) {}
    try { window.updateBalanceUI(); } catch(e) {}
    try { window.applyTheme(); } catch(e) {}
    try { window.applyEggSkin(); } catch(e) {}
    try { window.apiSyncGlobalProfile(); } catch(e) {}
    try { window.startInvitesPolling(); } catch(e) {}
    
    if (localStorage.getItem('tutorialSeen')) { 
        try { window.checkDailyReward(); } catch(e) {} 
    } else { 
        window.openModal('tutorial-modal'); 
    }
};

window.saveData = function(skipTimeUpdate = false) {
    let now = Date.now(); 
    if (!skipTimeUpdate) {
        localSaveTime = now;
    }

    localStorage.setItem('lastSaveTime', localSaveTime); 
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('userStars', userStars); 
    localStorage.setItem('pegasusShards', pegasusShards);
    localStorage.setItem('userJokers', userJokers); 
    localStorage.setItem('dustBalance', dustBalance); 
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards)); 
    localStorage.setItem('mythicTickets', mythicTickets);
    localStorage.setItem('customEggConfig', JSON.stringify(customEggConfig)); 
    localStorage.setItem('userShowcase', JSON.stringify(userShowcase));
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
    
    localStorage.setItem('focusHours', focusHours);
    localStorage.setItem('mythicsCrafted', mythicsCrafted);
    localStorage.setItem('reactorWins', reactorWins);
    localStorage.setItem('equippedTitle', equippedTitle);
    localStorage.setItem('unlockedTitles', JSON.stringify(unlockedTitles));

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.setItem('lastSaveTime', localSaveTime.toString()); 
        Telegram.WebApp.CloudStorage.setItem('walletBalance', walletBalance.toString());
        Telegram.WebApp.CloudStorage.setItem('userStars', userStars.toString()); 
        Telegram.WebApp.CloudStorage.setItem('pegasusShards', pegasusShards.toString());
        Telegram.WebApp.CloudStorage.setItem('userJokers', userJokers.toString()); 
        Telegram.WebApp.CloudStorage.setItem('dustBalance', dustBalance.toString());
        Telegram.WebApp.CloudStorage.setItem('claimedRewards', JSON.stringify(claimedRewards)); 
        Telegram.WebApp.CloudStorage.setItem('mythicTickets', mythicTickets.toString());
        Telegram.WebApp.CloudStorage.setItem('customEggConfig', JSON.stringify(customEggConfig)); 
        Telegram.WebApp.CloudStorage.setItem('userShowcase', JSON.stringify(userShowcase));
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
        
        Telegram.WebApp.CloudStorage.setItem('focusHours', focusHours.toString());
        Telegram.WebApp.CloudStorage.setItem('mythicsCrafted', mythicsCrafted.toString());
        Telegram.WebApp.CloudStorage.setItem('reactorWins', reactorWins.toString());
        Telegram.WebApp.CloudStorage.setItem('equippedTitle', equippedTitle);
        Telegram.WebApp.CloudStorage.setItem('unlockedTitles', JSON.stringify(unlockedTitles));
    }
};

// =============================================================
// 7. ПРОФИЛЬ, ДРУЗЬЯ И ТИТУЛЫ
// =============================================================
window.apiSyncGlobalProfile = async function() {
    const user = window.getTgUser(); 
    let netWorthCoins = walletBalance; 
    
    collection.forEach(pet => { 
        netWorthCoins += PRICES[window.getPetRarity(pet)] || 0; 
    });
    
    ownedItems.themes.forEach(t => { 
        const item = SHOP_DATA.themes.find(x => x.id === t); 
        if (item && typeof item.price === 'number') {
            netWorthCoins += item.price; 
        }
    });
    
    ownedItems.eggs.forEach(e => { 
        const item = SHOP_DATA.eggs.find(x => x.id === e); 
        if (item && typeof item.price === 'number') {
            netWorthCoins += item.price; 
        }
    });
    
    if (myBoosters.luck > 0) {
        netWorthCoins += myBoosters.luck * 5000;
    }
    if (myBoosters.speed > 0) {
        netWorthCoins += myBoosters.speed * 5000;
    }
    if (myBoosters.bio > 0) {
        netWorthCoins += myBoosters.bio * 15000;
    }

    let finalName = user.name;
    if (window.isVip()) {
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
                earned: netWorthCoins, 
                hatched: userStats.hatched || 0, 
                dust: dustBalance,
                claimed_rewards: JSON.stringify(claimedRewards), 
                mythic_tickets: mythicTickets,
                active_theme: activeTheme, 
                showcase: JSON.stringify(userShowcase),
                focus_hours: focusHours, 
                mythics_crafted: mythicsCrafted, 
                reactor_wins: reactorWins,
                equipped_title: equippedTitle, 
                unlocked_titles: JSON.stringify(unlockedTitles)
            })
        });
    } catch(e) {}
};

window.startInvitesPolling = function() {
    if (invitesPollingInterval) {
        clearInterval(invitesPollingInterval);
    }
    
    invitesPollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_URL}/invites/check/${window.getTgUser().id}`);
            const data = await res.json();
            
            if (data.has_invite && !modalStack.includes('incoming-invite-modal')) {
                currentPendingInviteId = data.invite.id;
                
                let isn = window.getEl('invite-sender-name'); 
                if (isn) {
                    isn.textContent = data.invite.sender_name;
                }
                
                let isa = window.getEl('invite-sender-avatar'); 
                if (isa) {
                    isa.src = window.getPetImg(data.invite.sender_avatar);
                }
                
                let iim = window.getEl('incoming-invite-modal'); 
                if (iim) {
                    iim.setAttribute('data-party', data.invite.party_code);
                }
                
                window.playSound('win'); 
                window.openModal('incoming-invite-modal');
            }
        } catch(e) {}
    }, 5000);
};

window.declineInvite = async function() {
    if (currentPendingInviteId) {
        try { 
            await fetch(`${API_URL}/invites/clear`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ code: String(currentPendingInviteId) }) 
            }); 
        } catch(e) {}
    }
    window.closeModal('incoming-invite-modal');
};

window.acceptInvite = async function() {
    let iim = window.getEl('incoming-invite-modal');
    const code = iim ? iim.getAttribute('data-party') : '';
    
    await window.declineInvite(); 
    
    if (currentPartyCode) {
        await window.apiLeaveParty();
    }
    
    let pci = window.getEl('party-code-input'); 
    if (pci) {
        pci.value = code;
    }
    
    await window.apiJoinParty(code); 
    window.openModal('party-modal');
};

window.switchProfileTab = function(tab) {
    document.querySelectorAll('#profile-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    }); 
    
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    
    window.playSound('click');
    
    let psv = window.getEl('profile-stats-view'); 
    let pfv = window.getEl('profile-friends-view');
    
    if (tab === 'stats') {
        if (psv) psv.style.display = 'block'; 
        if (pfv) pfv.style.display = 'none';
    } else {
        if (psv) psv.style.display = 'none'; 
        if (pfv) pfv.style.display = 'block';
        
        let mfc = window.getEl('my-friend-code'); 
        if (mfc) {
            mfc.value = window.getTgUser().id; 
        }
        window.apiLoadFriends(); 
    }
};

window.openProfile = function() {
    window.apiSyncGlobalProfile(); 
    
    let pr = window.getEl('profile-rank'); 
    if (pr) { 
        pr.innerHTML = (equippedTitle ? `<span class="player-title" style="font-size: 14px; display: block; margin-bottom: 5px;">${equippedTitle}</span>` : '') + (RANKS[Math.floor(userLevel / 5)] || "Создатель"); 
        if (window.isVip()) {
            pr.innerHTML += ' <span style="color:#ffd700">👑 PRO</span>'; 
        }
    }
    
    let pl = window.getEl('profile-level'); 
    if (pl) {
        pl.textContent = `Уровень ${userLevel}`;
    }
    
    let sh = window.getEl('stat-hatched'); 
    if (sh) {
        sh.textContent = window.formatNumber(userStats.hatched || 0);
    }
    
    let su = window.getEl('stat-unique'); 
    if (su) {
        su.textContent = window.formatNumber(new Set(collection).size);
    }
    
    let si = window.getEl('stat-invites'); 
    if (si) {
        si.textContent = window.formatNumber(userStats.invites || 0);
    }
    
    let netWorthCoins = walletBalance;
    collection.forEach(pet => { 
        netWorthCoins += PRICES[window.getPetRarity(pet)] || 0; 
    });
    
    ownedItems.themes.forEach(t => { 
        const item = SHOP_DATA.themes.find(x => x.id === t); 
        if (item && typeof item.price === 'number') {
            netWorthCoins += item.price; 
        }
    });
    
    ownedItems.eggs.forEach(e => { 
        const item = SHOP_DATA.eggs.find(x => x.id === e); 
        if (item && typeof item.price === 'number') {
            netWorthCoins += item.price; 
        }
    });
    
    if (myBoosters.luck > 0) netWorthCoins += myBoosters.luck * 5000;
    if (myBoosters.speed > 0) netWorthCoins += myBoosters.speed * 5000;
    if (myBoosters.bio > 0) netWorthCoins += myBoosters.bio * 15000;

    let netWorthStars = userStars;
    
    ownedItems.themes.forEach(t => { 
        const item = SHOP_DATA.themes.find(x => x.id === t); 
        if (item && typeof item.price === 'string' && item.price.includes('⭐️')) {
            netWorthStars += parseInt(item.price.replace(' ⭐️', '')); 
        }
    });
    
    ownedItems.eggs.forEach(e => { 
        const item = SHOP_DATA.eggs.find(x => x.id === e); 
        if (item && typeof item.price === 'string' && item.price.includes('⭐️')) {
            netWorthStars += parseInt(item.price.replace(' ⭐️', '')); 
        }
    });
    
    netWorthStars += (userStats.baseTickets || 0) * 10;
    netWorthStars += (userStats.epicTickets || 0) * 25;
    netWorthStars += mythicTickets * 50;

    let sec = window.getEl('stat-earned-coins'); 
    if (sec) {
        sec.textContent = window.formatNumber(netWorthCoins); 
    }
    
    let ses = window.getEl('stat-earned-stars'); 
    if (ses) {
        ses.textContent = window.formatNumber(netWorthStars); 
    }
    
    let pa = window.getEl('profile-avatar'); 
    if (pa) {
        pa.src = window.getPetImg(selectedAvatar);
    }
    
    let psv = window.getEl('profile-stats-view'); 
    if (psv) {
        psv.style.display = 'block'; 
    }
    
    let pfv = window.getEl('profile-friends-view'); 
    if (pfv) {
        pfv.style.display = 'none';
    }
    
    let tabs = document.querySelectorAll('#profile-modal .tab-btn');
    if (tabs.length >= 2) { 
        tabs[0].classList.add('active'); 
        tabs[1].classList.remove('active'); 
    }
    
    window.openModal('profile-modal');
};

window.copyMyCode = function() {
    let mfc = window.getEl('my-friend-code'); 
    if (!mfc) {
        return;
    }
    navigator.clipboard.writeText(mfc.value).then(() => window.showToast("Код скопирован!", "📋"));
};

window.apiAddFriend = async function() {
    window.playSound('click'); 
    let input = window.getEl('add-friend-input'); 
    if (!input) {
        return;
    }
    
    const friendId = input.value.trim();
    
    if (!friendId || friendId === window.getTgUser().id) {
        return window.showToast("Неверный ID", "❌");
    }
    
    try {
        const res = await fetch(`${API_URL}/friends/add`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id, friend_id: friendId })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') { 
            window.showToast("Друг добавлен!", "🤝"); 
            input.value = ''; 
            window.apiLoadFriends(); 
        } else { 
            window.showToast(data.detail || "Ошибка", "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
};

window.apiLoadFriends = async function() {
    const container = window.getEl('friends-list-container'); 
    if (!container) {
        return;
    }
    
    container.innerHTML = '<div style="text-align:center; color:#888;">Загрузка...</div>';
    
    try {
        const res = await fetch(`${API_URL}/friends/list/${window.getTgUser().id}`); 
        const data = await res.json();
        
        container.innerHTML = '';
        
        if (data.friends.length === 0) { 
            container.innerHTML = '<div style="text-align:center; color:#888;">У вас пока нет друзей</div>'; 
            return; 
        }
        
        currentFriendsList = data.friends;
        
        data.friends.forEach(f => {
            const encodedFriend = encodeURIComponent(JSON.stringify(f));
            let titleHtml = f.equipped_title ? `<span class="player-title">${f.equipped_title}</span>` : '';
            
            container.innerHTML += `
                <div class="achievement-card" style="cursor: pointer;" onclick="window.openPublicProfileObj('${encodedFriend}')">
                    <div class="ach-icon"><img src="${window.getPetImg(f.avatar)}" onerror="this.src='assets/ui/icon-profile.png'"></div>
                    <div class="ach-info">
                        ${titleHtml}
                        <div class="ach-title">${f.name} <span style="color:#ffd700; font-size:10px;">${f.syndicate_tag ? `[${f.syndicate_tag}]` : ''}</span></div>
                        <div class="ach-desc">Уровень ${f.level}</div>
                    </div>
                </div>
            `;
        });
    } catch(e) { 
        container.innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>'; 
    }
};

// === СИНДИКАТЫ (КЛАНЫ) ===
window.openSyndicates = async function() {
    window.playSound('click');
    try {
        let res = await fetch(`${API_URL}/syndicates/my/${window.getTgUser().id}`);
        let data = await res.json();
        
        if (data.status === 'success' && data.syndicate_id) {
            mySyndicateId = data.syndicate_id; 
            window.apiLoadSyndicateInfo(mySyndicateId);
        } else {
            mySyndicateId = null; 
            window.openModal('syndicates-list-modal'); 
            window.apiLoadTopSyndicates();
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
};

window.apiLoadTopSyndicates = async function() {
    let container = window.getEl('syndicates-list-container'); 
    if(!container) {
        return;
    }
    
    container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Загрузка топа... ⏳</div>';
    
    try {
        let res = await fetch(`${API_URL}/syndicates/top`);
        let data = await res.json();
        
        container.innerHTML = '';
        
        if(!data.syndicates || data.syndicates.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Синдикатов пока нет. Стань первым!</div>'; 
            return;
        }
        
        data.syndicates.forEach((s, idx) => {
            let rankNum = idx + 1; 
            let rankClass = rankNum <= 3 ? `top-${rankNum}` : '';
            
            container.innerHTML += `
                <div class="syndicate-card" onclick="window.apiLoadSyndicateInfo('${s.id}')">
                    <div class="forbes-rank ${rankClass}" style="width:20px; font-size:16px;">${rankNum}</div>
                    <img src="${window.getPetImg(s.avatar)}" class="syndicate-avatar">
                    <div class="syndicate-info">
                        <div class="syndicate-name">${s.name} <span class="syndicate-tag">[${s.tag}]</span></div>
                        <div class="syndicate-stats">Уровень ${s.level} • 👥 ${s.members_count}/50</div>
                    </div>
                    <div style="font-weight:bold; color:#00A3FF; font-size:12px; text-align:right;">${window.formatNumber(s.total_minutes)}<br>мин</div>
                </div>`;
        });
    } catch(e) { 
        container.innerHTML = '<div style="text-align:center; color:#ff3b30; padding:20px;">Ошибка загрузки</div>'; 
    }
};

window.openSyndicateCreate = function() {
    window.playSound('click'); 
    createSynSelectedAvatar = selectedAvatar; 
    
    let pvw = window.getEl('create-syn-avatar-preview'); 
    if(pvw) {
        pvw.src = window.getPetImg(createSynSelectedAvatar);
    }
    
    let nameInp = window.getEl('syn-name-input'); 
    if (nameInp) {
        nameInp.value = '';
    }
    
    let tagInp = window.getEl('syn-tag-input'); 
    if (tagInp) {
        tagInp.value = '';
    }
    
    window.openModal('syndicate-create-modal');
};

window.openSynAvatarSelector = function(isEditing = false) {
    window.playSound('click'); 
    isEditingSyndicate = isEditing;
    
    const list = window.getEl('syn-avatar-list'); 
    if (!list) {
        return;
    }
    
    list.innerHTML = ''; 
    const uniquePets = [...new Set(collection)];
    
    if (uniquePets.length === 0) { 
        list.innerHTML = "<p style='color:#888; grid-column:span 4; text-align:center;'>У тебя еще нет питомцев!</p>"; 
    }
    
    uniquePets.forEach(pet => {
        const r = window.getPetRarity(pet); 
        const div = document.createElement('div');
        div.className = `pet-slot ${r} ${createSynSelectedAvatar === pet ? 'selected' : ''}`;
        div.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">`;
        
        div.onclick = () => {
            createSynSelectedAvatar = pet; 
            let targetId = isEditingSyndicate ? 'edit-syn-avatar-preview' : 'create-syn-avatar-preview';
            let pvw = window.getEl(targetId); 
            
            if(pvw) {
                pvw.src = window.getPetImg(pet);
            }
            
            window.playSound('click'); 
            window.closeModal('syn-avatar-selector-modal');
        };
        list.appendChild(div);
    });
    
    window.openModal('syn-avatar-selector-modal');
};

window.apiCreateSyndicate = async function(currency) {
    window.playSound('click');
    let name = window.getEl('syn-name-input').value.trim(); 
    let tag = window.getEl('syn-tag-input').value.trim().toUpperCase();
    
    if(name.length < 3) {
        return window.showToast("Имя от 3 букв!", "❌");
    }
    if(tag.length < 3 || tag.length > 4) {
        return window.showToast("Тег 3-4 буквы!", "❌");
    }
    
    if(currency === 'coins') { 
        if(walletBalance < 100000) {
            return window.showToast("Нужно 100 000 Монет!", "❌"); 
        }
    } else { 
        if(userStars < 250) {
            return window.showToast("Нужно 250 Звезд!", "❌"); 
        }
    }
    
    try {
        let res = await fetch(`${API_URL}/syndicates/create`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id, name: name, tag: tag, avatar: createSynSelectedAvatar })
        });
        
        let data = await res.json();
        
        if(data.status === 'success') {
            if(currency === 'coins') {
                walletBalance -= 100000; 
            } else {
                userStars -= 250;
            }
            
            mySyndicateId = data.syndicate_id; 
            window.saveData(); 
            window.updateBalanceUI();
            window.showToast("Синдикат создан!", "🛡️"); 
            window.closeModal('syndicate-create-modal'); 
            window.apiLoadSyndicateInfo(mySyndicateId);
        } else { 
            window.showToast(data.detail, "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
};

window.apiLoadSyndicateInfo = async function(synId) {
    try {
        let res = await fetch(`${API_URL}/syndicates/info/${synId}`);
        let data = await res.json();
        
        if(data.status === 'success') {
            let s = data.syndicate;
            window.getEl('syn-view-avatar').src = window.getPetImg(s.avatar); 
            window.getEl('syn-view-name').textContent = s.name;
            window.getEl('syn-view-tag').textContent = `[${s.tag}]`; 
            window.getEl('syn-view-level').textContent = s.level;
            window.getEl('syn-view-minutes').textContent = window.formatNumber(s.total_minutes);
            
            let progress = (s.total_minutes % 1000) / 1000 * 100; 
            window.getEl('syn-view-progress').style.width = `${progress}%`;
            window.getEl('syn-view-count').textContent = `${data.members.length}/50`;
            
            let isLeader = (s.leader_id === window.getTgUser().id);
            let settingsBtn = window.getEl('syn-settings-btn');
            
            if (settingsBtn) {
                if (isLeader) { 
                    settingsBtn.style.display = 'block'; 
                    settingsBtn.onclick = () => { window.openSyndicateSettings(s.name, s.tag, s.avatar); }; 
                } else { 
                    settingsBtn.style.display = 'none'; 
                }
            }
            
            let mList = window.getEl('syn-members-list'); 
            mList.innerHTML = '';
            
            data.members.forEach((m, idx) => {
                let rank = idx + 1; 
                let roleHtml = m.user_id === s.leader_id ? `<span class="syn-role">Лидер 👑</span>` : '';
                let isMe = m.user_id === window.getTgUser().id; 
                let bgStyle = isMe ? 'background: rgba(0, 163, 255, 0.1);' : '';
                let encodedUser = encodeURIComponent(JSON.stringify(m));
                let titleHtml = m.equipped_title ? `<span class="player-title">${m.equipped_title}</span>` : '';
                
                mList.innerHTML += `
                    <div class="syndicate-member" style="${bgStyle} cursor:pointer;" onclick="window.openPublicProfileObj('${encodedUser}')">
                        <div style="color:#888; font-size:12px; font-weight:bold; width:15px;">${rank}</div>
                        <img src="${window.getPetImg(m.avatar)}" style="width:30px; height:30px; border-radius:50%; background:#333; object-fit:contain;">
                        <div style="flex:1; overflow:hidden;">
                            ${titleHtml}
                            <div style="font-size:13px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.name} <span style="color:#ffd700; font-size:10px;">${s.tag ? `[${s.tag}]` : ''}</span> ${isMe ? '(Ты)' : ''}</div>
                            <div style="font-size:11px; color:#888;">Уровень ${m.level} ${roleHtml}</div>
                        </div>
                        <div style="font-weight:bold; color:#34c759; font-size:12px; text-align:right;">${window.formatNumber(m.syndicate_minutes)}<br><span style="font-size:9px;color:#888;">мин</span></div>
                    </div>`;
            });
            
            let actionBox = window.getEl('syn-action-buttons'); 
            actionBox.innerHTML = '';
            
            if (mySyndicateId === synId) {
                if (!isLeader) {
                    actionBox.innerHTML = `<button class="btn stop" style="flex:1; background:transparent; border:1px solid #ff3b30;" onclick="window.apiLeaveSyndicate()">Покинуть Синдикат</button>`;
                }
            } else {
                if(!mySyndicateId) {
                    actionBox.innerHTML = `<button class="btn" style="flex:1; background:#34c759;" onclick="window.apiJoinSyndicate('${synId}')">Вступить</button>`;
                }
            }
            window.openModal('syndicate-view-modal');
        } else { 
            window.showToast("Синдикат не найден", "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка", "❌"); 
    }
};

window.openSyndicateSettings = function(currentName, currentTag, currentAvatar) {
    window.playSound('click'); 
    createSynSelectedAvatar = currentAvatar;
    let pvw = window.getEl('edit-syn-avatar-preview'); 
    if (pvw) {
        pvw.src = window.getPetImg(createSynSelectedAvatar);
    }
    
    let nInput = window.getEl('edit-syn-name-input'); 
    if (nInput) {
        nInput.value = currentName;
    }
    
    let tInput = window.getEl('edit-syn-tag-input'); 
    if (tInput) {
        tInput.value = currentTag;
    }
    
    window.openModal('syndicate-settings-modal');
};

window.apiSaveSyndicateSettings = async function(currency) {
    window.playSound('click');
    let name = window.getEl('edit-syn-name-input').value.trim(); 
    let tag = window.getEl('edit-syn-tag-input').value.trim().toUpperCase();
    
    if(name.length < 3) {
        return window.showToast("Имя от 3 букв!", "❌");
    }
    if(tag.length < 3 || tag.length > 4) {
        return window.showToast("Тег 3-4 буквы!", "❌");
    }
    
    if(currency === 'coins') { 
        if(walletBalance < 10000) {
            return window.showToast("Нужно 10 000 Монет!", "❌"); 
        }
    } else { 
        if(userStars < 100) {
            return window.showToast("Нужно 100 Звезд!", "❌"); 
        }
    }
    
    try {
        let res = await fetch(`${API_URL}/syndicates/edit`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id, name: name, tag: tag, avatar: createSynSelectedAvatar })
        });
        
        let data = await res.json();
        
        if (data.status === 'success') {
            if(currency === 'coins') {
                walletBalance -= 10000; 
            } else {
                userStars -= 100;
            }
            window.saveData(); 
            window.updateBalanceUI(); 
            window.showToast("Настройки сохранены!", "⚙️");
            window.closeModal('syndicate-settings-modal'); 
            window.apiLoadSyndicateInfo(mySyndicateId);
        } else { 
            window.showToast(data.detail || "Ошибка сервера", "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
};

window.apiJoinSyndicate = async function(synId) {
    window.playSound('click');
    try {
        let res = await fetch(`${API_URL}/syndicates/join`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id, syndicate_id: synId })
        });
        let data = await res.json();
        
        if(data.status === 'success') {
            mySyndicateId = synId; 
            window.showToast("Вы вступили в Синдикат!", "🤝"); 
            window.apiLoadSyndicateInfo(synId);
        } else { 
            window.showToast(data.detail, "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка", "❌"); 
    }
};

window.apiLeaveSyndicate = async function() {
    if(!confirm("Уверен, что хочешь покинуть/удалить Синдикат?")) {
        return;
    }
    
    window.playSound('click');
    
    try {
        let res = await fetch(`${API_URL}/syndicates/leave`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id })
        });
        
        let data = await res.json();
        
        if(data.status === 'success') {
            mySyndicateId = null; 
            window.showToast("Вы покинули Синдикат", "ℹ️");
            window.closeModal('syndicate-settings-modal'); 
            window.closeModal('syndicate-view-modal'); 
            window.openSyndicates(); 
        }
    } catch(e) { 
        window.showToast("Ошибка", "❌"); 
    }
};

window.copySynInvite = function() {
    window.playSound('click'); 
    let id = mySyndicateId;
    if(!id) { 
        let text = window.getEl('syn-view-tag').textContent; 
        id = "Синдикат"; 
    }
    navigator.clipboard.writeText(id).then(() => window.showToast("ID Синдиката скопирован!", "📋"));
};

window.sendSyndicateMinutes = function(minutes) {
    try {
        fetch(`${API_URL}/syndicates/add_minutes`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: window.getTgUser().id, minutes: minutes })
        });
    } catch(e) {}
};

// =============================================================
// ВИТРИНА ПЕТОВ И ПУБЛИЧНАЯ КАРТОЧКА
// =============================================================
window.openShowcaseSetup = function() {
    window.renderSetupShowcaseSlot('left'); 
    window.renderSetupShowcaseSlot('center'); 
    window.renderSetupShowcaseSlot('right');
    window.openModal('showcase-setup-modal');
};

window.renderSetupShowcaseSlot = function(slot) {
    const petId = userShowcase[slot]; 
    const container = window.getEl(`setup-showcase-${slot}`); 
    if (!container) return;
    
    if (petId) {
        const r = window.getPetRarity(petId);
        container.innerHTML = `<img src="assets/pets/pet-${petId}.png" class="showcase-pet-img glow-${r}" onerror="this.src='assets/eggs/egg-default.png'">`;
    } else {
        container.innerHTML = `<div class="showcase-empty">?</div>`;
    }
};

window.openShowcasePetSelector = function(slot) {
    currentShowcaseSlot = slot; 
    const list = window.getEl('showcase-pet-list'); 
    if (!list) return;
    
    list.innerHTML = ''; 
    const uniquePets = [...new Set(collection)];
    
    if (uniquePets.length === 0) { 
        list.innerHTML = "<p style='color:#888; grid-column:span 4; text-align:center;'>У тебя еще нет питомцев!</p>"; 
    }
    
    uniquePets.forEach(pet => {
        const r = window.getPetRarity(pet); 
        const div = document.createElement('div'); 
        div.className = `pet-slot ${r}`;
        div.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">`;
        div.onclick = () => window.selectShowcasePet(pet); 
        list.appendChild(div);
    });
    
    window.openModal('showcase-pet-selector-modal');
};

window.selectShowcasePet = function(petId) {
    if (currentShowcaseSlot) { 
        userShowcase[currentShowcaseSlot] = petId; 
        window.renderSetupShowcaseSlot(currentShowcaseSlot); 
    }
    window.closeModal('showcase-pet-selector-modal'); 
    window.playSound('click');
};

window.saveShowcase = function() {
    window.saveData(); 
    window.apiSyncGlobalProfile(); 
    window.closeModal('showcase-setup-modal'); 
    window.showToast("Витрина обновлена!", "🏆"); 
    window.playSound('win');
};

window.openPublicProfileObj = function(encodedUser) {
    window.playSound('click'); 
    const u = JSON.parse(decodeURIComponent(encodedUser)); 
    currentPublicUser = u;
    
    let pName = window.getEl('pub-name'); 
    if (pName) {
        let titleHtml = u.equipped_title ? `<span class="player-title">${u.equipped_title}</span>` : '';
        pName.innerHTML = `${titleHtml}${u.name} <span style="color:#ffd700; font-size:12px;">${u.syndicate_tag ? `[${u.syndicate_tag}]` : ''}</span>`;
    }
    
    let pLevel = window.getEl('pub-level'); 
    if (pLevel) {
        pLevel.textContent = `Уровень ${u.level}`;
    }
    
    let pHatched = window.getEl('pub-hatched'); 
    if (pHatched) {
        pHatched.textContent = window.formatNumber(u.hatched || 0);
    }
    
    let pEarned = window.getEl('pub-earned'); 
    if (pEarned) {
        pEarned.textContent = window.formatNumber(u.earned || 0);
    }
    
    let pAvatar = window.getEl('pub-avatar'); 
    if (pAvatar) {
        pAvatar.src = window.getPetImg(u.avatar);
    }

    let bgElem = window.getEl('public-card-bg');
    if (bgElem) {
        bgElem.style.backgroundImage = 'none'; 
        bgElem.style.backgroundColor = 'var(--panel)';
        
        if (u.active_theme && u.active_theme !== 'default' && u.active_theme !== 'matrix') {
            const t = SHOP_DATA.themes.find(x => x.id === u.active_theme);
            if (t && t.bgFile) {
                bgElem.style.backgroundImage = `url('${t.bgFile}')`;
            }
        }
    }

    let sc = { center: null, left: null, right: null }; 
    if (u.showcase) {
        sc = window.safeParse(u.showcase, sc);
    }
    
    ['left', 'center', 'right'].forEach(slot => {
        const petId = sc[slot]; 
        const container = window.getEl(`pub-showcase-${slot}`); 
        if (!container) return;
        
        if (petId) {
            const r = window.getPetRarity(petId);
            container.innerHTML = `<img src="assets/pets/pet-${petId}.png" class="showcase-pet-img glow-${r}" onerror="this.src='assets/eggs/egg-default.png'">`;
        } else {
            container.innerHTML = `<div class="showcase-empty">?</div>`;
        }
    });

    let friendBtn = window.getEl('pub-friend-btn');
    if (friendBtn) {
        if (String(u.user_id) === String(window.getTgUser().id)) {
            friendBtn.style.display = 'none';
        } else {
            friendBtn.style.display = 'block';
            let isFriend = currentFriendsList.some(f => String(f.user_id) === String(u.user_id));
            if (isFriend) {
                friendBtn.textContent = "В друзьях"; 
                friendBtn.style.background = "#555";
                friendBtn.onclick = () => window.showToast("Игрок уже в друзьях", "🤝");
            } else {
                friendBtn.textContent = "Добавить"; 
                friendBtn.style.background = "#34c759"; 
                window.getEl('pub-friend-btn').onclick = () => window.pubToggleFriend();
            }
        }
    }
    
    let inviteBtn = window.getEl('pub-invite-btn');
    if (inviteBtn) {
        if (String(u.user_id) === String(window.getTgUser().id)) {
            inviteBtn.style.display = 'none';
        } else {
            inviteBtn.style.display = 'block';
        }
    }
    
    window.openModal('public-player-modal');
};

window.pubToggleFriend = async function() {
    if (!currentPublicUser) return;
    
    window.playSound('click'); 
    let input = window.getEl('add-friend-input');
    
    if (input) { 
        input.value = currentPublicUser.user_id; 
        await window.apiAddFriend(); 
        window.closeModal('public-player-modal'); 
    }
};

window.pubInviteParty = async function() {
    window.playSound('click');
    if (!currentPartyCode) {
        return window.showToast("Сначала создай Пати!", "❌");
    }
    
    if (!currentPublicUser) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/invites/send`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ sender_id: window.getTgUser().id, receiver_id: currentPublicUser.user_id, party_code: currentPartyCode }) 
        });
        window.showToast("Приглашение отправлено!", "💌"); 
        window.closeModal('public-player-modal');
    } catch(e) { 
        window.showToast("Ошибка", "❌"); 
    }
};

// =============================================================
// ОТРИСОВКА BATTLE PASS И РАСПЫЛЕНИЕ
// =============================================================
window.openLevels = function() {
    const list = window.getEl('battle-pass-list'); 
    if (!list) return;
    
    let banner = window.getEl('pro-pass-banner');
    if (banner) {
        if (window.isVip()) {
            banner.innerHTML = `<div style="text-align: left;"><div style="font-weight: bold; color: #ffd700; font-size: 14px;">Focus PRO 👑 Активен</div><div style="font-size: 10px; color: #ccc;">Все премиум-награды доступны!</div></div>`;
        } else {
            banner.innerHTML = `<div style="text-align: left;"><div style="font-weight: bold; color: #00A3FF; font-size: 14px;">Focus PRO 👑</div><div style="font-size: 10px; color: #ccc;">Разблокируй нижнюю линию наград!</div></div><button id="buy-pro-pass-btn" class="btn small" style="background: #00A3FF; width: auto; margin: 0;" onclick="window.closeModal('levels-modal'); window.openShop();">Купить PRO</button>`;
        }
    }

    list.innerHTML = '';
    
    BATTLE_PASS_REWARDS.forEach(bp => {
        const isReached = userLevel >= bp.level;
        const freeClaimed = claimedRewards.includes(`${bp.level}_free`);
        const proClaimed = claimedRewards.includes(`${bp.level}_pro`);
        
        const col = document.createElement('div'); 
        col.className = 'bp-col';
        
        let freeIcon = bp.free.icon.includes('.') ? `<img src="${bp.free.icon}" class="bp-icon">` : `<div class="bp-icon">${bp.free.icon}</div>`;
        let freeBtnHtml = freeClaimed ? `<button class="bp-btn claimed" disabled>✅</button>` : (isReached ? `<div style="display:flex; width:100%; gap:2px; justify-content:center;"><button class="bp-btn" style="flex:1;" onclick="window.claimBpReward(${bp.level}, 'free')">Взять</button>${bp.free.type !== 'dust' ? `<button class="bp-btn dust" style="flex:1;" onclick="window.dustBpReward(${bp.level}, 'free')">✨${bp.free.dustVal}</button>` : ''}</div>` : `<button class="bp-btn" disabled>🔒</button>`);
        let freeCard = `<div class="bp-card">${freeIcon}<div class="bp-text">${bp.free.name}</div>${freeBtnHtml}</div>`;

        let lineClass = isReached ? 'bp-line active' : 'bp-line';
        let badgeClass = isReached ? 'bp-lvl-badge active' : 'bp-lvl-badge';
        let divider = `<div class="bp-level-divider"><div class="${lineClass}"></div><div class="${badgeClass}">${bp.level}</div></div>`;

        let proIcon = bp.pro.icon.includes('.') ? `<img src="${bp.pro.icon}" class="bp-icon">` : `<div class="bp-icon">${bp.pro.icon}</div>`;
        let proLockedClass = !window.isVip() ? 'locked' : '';
        let proLockOverlay = !window.isVip() ? `<div class="bp-lock-icon">🔒</div>` : '';
        let proBtnHtml = proClaimed ? `<button class="bp-btn claimed" disabled>✅</button>` : ((isReached && window.isVip()) ? `<div style="display:flex; width:100%; gap:2px; justify-content:center;"><button class="bp-btn" style="flex:1;" onclick="window.claimBpReward(${bp.level}, 'pro')">Взять</button>${bp.pro.type !== 'dust' ? `<button class="bp-btn dust" style="flex:1;" onclick="window.dustBpReward(${bp.level}, 'pro')">✨${bp.pro.dustVal}</button>` : ''}</div>` : `<button class="bp-btn" disabled>🔒</button>`);
        let proCard = `<div class="bp-card pro ${proLockedClass}">${proLockOverlay}${proIcon}<div class="bp-text">${bp.pro.name}</div>${proBtnHtml}</div>`;

        col.innerHTML = freeCard + divider + proCard; 
        list.appendChild(col);
    });
    
    let isBpOpen = modalStack.includes('levels-modal'); 
    window.openModal('levels-modal');
    
    if (!isBpOpen) {
        setTimeout(() => {
            if(list.children.length > 0) {
                let targetIndex = Math.max(0, userLevel - 2);
                let targetChild = list.children[targetIndex];
                if (targetChild) {
                    list.scrollTo({ left: targetChild.offsetLeft - 20, behavior: 'smooth' });
                }
            }
        }, 100);
    } else { 
        list.scrollTo({ left: lastBpScroll, behavior: 'instant' }); 
    }
    
    list.onscroll = () => { lastBpScroll = list.scrollLeft; };
};

window.dustBpReward = function(level, type) {
    if (userLevel < level) return;
    if (type === 'pro' && !window.isVip()) {
        return window.showToast("Нужен статус Focus PRO!", "👑");
    }
    
    let claimKey = `${level}_${type}`; 
    if (claimedRewards.includes(claimKey)) return;
    
    let bp = BATTLE_PASS_REWARDS.find(x => x.level === level); 
    if (!bp) return;
    
    let reward = type === 'free' ? bp.free : bp.pro; 
    if (reward.type === 'dust') return; 
    
    if (confirm(`Распылить награду "${reward.name}" и получить ${reward.dustVal} ✨?`)) {
        dustBalance += reward.dustVal; 
        claimedRewards.push(claimKey);
        window.saveData(); 
        window.updateBalanceUI(); 
        window.openLevels(); 
        window.playSound('win'); 
        window.showToast(`Награда распылена! +${reward.dustVal} ✨`, "✨");
    }
};

window.claimBpReward = function(level, type) {
    if (userLevel < level) return;
    
    if (type === 'pro' && !window.isVip()) {
        return window.showToast("Нужен статус Focus PRO!", "👑");
    }
    
    let claimKey = `${level}_${type}`; 
    if (claimedRewards.includes(claimKey)) return;
    
    let bp = BATTLE_PASS_REWARDS.find(x => x.level === level); 
    if (!bp) return;
    
    let reward = type === 'free' ? bp.free : bp.pro;
    
    if (reward.type === 'money') walletBalance += reward.val;
    if (reward.type === 'dust') dustBalance += reward.val;
    if (reward.type === 'stars') userStars += reward.val;
    
    if (reward.type === 'luck') { 
        myBoosters.luck = (myBoosters.luck || 0) + reward.val; 
    }
    if (reward.type === 'speed') { 
        myBoosters.speed = (myBoosters.speed || 0) + reward.val; 
    }
    if (reward.type === 'bio') { 
        myBoosters.bio = (myBoosters.bio || 0) + reward.val; 
    }
    if (reward.type === 'joker') { 
        userJokers += reward.val; 
    }
    if (reward.type === 'mythic_ticket') { 
        mythicTickets += reward.val; 
    }
    
    if (reward.type === 'roulette_ticket') {
        if (reward.val === 'base') userStats.baseTickets = (userStats.baseTickets || 0) + 1;
        if (reward.val === 'epic') userStats.epicTickets = (userStats.epicTickets || 0) + 1;
    }
    
    if (reward.type === 'pet') { 
        collection.push(reward.val); 
        window.showToast(`Получен уникальный питомец: ${PET_NAMES[reward.val]}!`, "🎁"); 
    }
    
    if (reward.type === 'theme') { 
        if (!ownedItems.themes.includes(reward.val)) {
            ownedItems.themes.push(reward.val); 
        }
        window.showToast(`Новый фон разблокирован!`, "🌌"); 
    }
    
    if (reward.type === 'bundle_50') { 
        userJokers += 2; 
        userStars += 50; 
        mythicTickets += 1; 
        window.showToast("Получен Супер-Набор 50 ур!", "🎁"); 
    }
    
    if (reward.type === 'bundle_75') { 
        if (!ownedItems.eggs.includes('holo')) {
            ownedItems.eggs.push('holo'); 
        }
        userJokers += 3; 
        dustBalance += 100; 
        window.showToast("Получено Яйцо Голограмма + Лут!", "🎁"); 
    }
    
    if (reward.type === 'bundle_100') { 
        if (!ownedItems.themes.includes('matrix')) {
            ownedItems.themes.push('matrix'); 
        }
        userStars += 150; 
        collection.push('neon_dragon'); 
        window.showToast("ТЕМНЫЙ ПРО-НАБОР ПОЛУЧЕН!", "🎁"); 
    }
    
    if (reward.type === 'pet_and_ticket') { 
        collection.push(reward.pet); 
        if (reward.ticket === 'epic') {
            userStats.epicTickets = (userStats.epicTickets || 0) + 1; 
        }
        window.showToast(`Получен ${PET_NAMES[reward.pet]} и Билет!`, "🎁"); 
    }
    
    if (reward.type === 'bg_and_ticket') { 
        if (!ownedItems.themes.includes(reward.bg)) {
            ownedItems.themes.push(reward.bg); 
        }
        if (reward.ticket === 'mythic') {
            mythicTickets++; 
        }
        window.showToast("Получен эксклюзивный фон и Билет!", "🎁"); 
    }

    claimedRewards.push(claimKey); 
    window.saveData(); 
    window.updateBalanceUI(); 
    window.openLevels(); 
    window.playSound('win'); 
    window.fireConfetti();
    
    if (!reward.type.includes('bundle') && !reward.type.includes('and')) {
        window.showToast(`Награда получена!`, "✅");
    }
};

window.checkAchievements = function() {
    let hasAch = false; 
    let u = new Set(collection).size;
    
    ACHIEVEMENTS_DATA.forEach(a => { 
        if (!claimedAchievements.includes(a.id)) { 
            if (a.type === 'money' && walletBalance >= a.goal) hasAch = true;
            if (a.type === 'unique' && u >= a.goal) hasAch = true;
            if (a.type === 'hatch' && userStats.hatched >= a.goal) hasAch = true;
            if (!a.type && userStats.hatched >= a.goal) hasAch = true;
            if (a.type === 'level' && userLevel >= a.goal) hasAch = true;
            if (a.type === 'craft' && userStats.crafts >= a.goal) hasAch = true;
        } 
    });
    
    if (activeContracts && activeContracts.tasks) { 
        if (activeContracts.tasks.some(t => t.p >= t.g && !t.c)) {
            hasAch = true; 
        }
    }
    
    TITLES_DATA.forEach(t => {
        let current = 0;
        if (t.type === 'focus') current = Math.floor(focusHours);
        if (t.type === 'mythic') current = mythicsCrafted;
        if (t.type === 'reactor') current = reactorWins;
        
        if (current >= t.req && !unlockedTitles.includes(t.id)) {
            hasAch = true;
        }
    });
    
    let hasBpReward = false;
    
    BATTLE_PASS_REWARDS.forEach(bp => {
        if (userLevel >= bp.level) {
            if (!claimedRewards.includes(`${bp.level}_free`)) {
                hasBpReward = true;
            }
            if (window.isVip() && !claimedRewards.includes(`${bp.level}_pro`)) {
                hasBpReward = true;
            }
        }
    });

    let achBadge = window.getEl('ach-badge'); 
    if (achBadge) {
        achBadge.style.display = hasAch ? 'flex' : 'none';
    }
    
    let bpBadge = window.getEl('bp-badge'); 
    if (bpBadge) {
        bpBadge.style.display = hasBpReward ? 'flex' : 'none';
    }
};

// =============================================================
// МАГАЗИН И ТЕМЫ
// =============================================================
window.applyTheme = function() { 
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
};

window.applyEggSkin = function() { 
    const egg = window.getEl('egg-display'); 
    if (!egg) return;
    
    egg.className = 'egg-img'; 
    egg.classList.remove('egg-locked'); 
    egg.style.filter = ''; 

    const m = MODES[currentModeIndex] || MODES[0];
    
    if (userLevel < m.reqLevel) { 
        egg.classList.add('egg-locked'); 
        egg.src = 'assets/eggs/egg-default.png'; 
        return; 
    }

    if (m.egg !== 'default') {
        egg.src = `assets/eggs/egg-${m.egg}.png`;
    }
    else if (activeEggSkin === 'holo') { 
        egg.classList.add('holo-egg'); 
        egg.src = 'assets/eggs/egg-ice.png'; 
    } 
    else { 
        const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 
        egg.src = s ? s.img : 'assets/eggs/egg-default.png'; 
    }
    
    if (isRunning) {
        egg.classList.add('shaking'); 
    }
};

window.updateLevelUI = function() { 
    const max = userLevel * 200; 
    let p = (userXP / max) * 100; 
    if (p > 100) p = 100; 
    
    let xpBar = window.getEl('xp-bar'); 
    if (xpBar) {
        xpBar.style.width = `${p}%`; 
    }
    
    let numEl = window.getEl('level-number'); 
    if (numEl) {
        numEl.textContent = `Lvl ${userLevel}`; 
    }
    
    let r = Math.floor(userLevel / 5); 
    let rankEl = window.getEl('rank-name'); 
    if (rankEl) {
        rankEl.textContent = RANKS[Math.min(r, RANKS.length - 1)] || "Создатель"; 
    }
};

window.switchShopTab = function(t) { 
    currentShopTab = t; 
    document.querySelectorAll('#shop-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    }); 
    
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    
    window.renderShop(); 
    window.playSound('click'); 
};

window.openShop = function() { 
    window.switchShopTab('themes'); 
    window.openModal('shop-modal'); 
};

window.openAch = function() { 
    window.switchAchTab('achievements'); 
    window.openModal('achievements-modal'); 
};

window.renderShop = function() {
    const c = window.getEl('shop-items'); 
    if (!c) return;
    
    c.innerHTML = '';
    
    if (currentShopTab === 'shadow') {
        c.innerHTML = `
            <div class="shop-item" style="grid-column: span 1; background: rgba(138, 43, 226, 0.1); border: 1px solid #8a2be2;">
                <div style="font-size: 30px;">🧩</div><div class="shop-item-name">Осколок Пегаса</div><div style="font-size:10px;color:#ccc;margin-bottom:10px;">Для крафта Мифика</div>
                <div style="display:flex; gap:5px; width:100%;"><button class="buy-btn" style="background: #8a2be2; flex:1; font-size:11px;" onclick="window.buyShadowItem('shard', 400, 'dust')">400 ✨</button><button class="buy-btn" style="background: #ffd700; color:#000; flex:1; font-size:11px;" onclick="window.buyShadowItem('shard', 40, 'stars')">40 ⭐️</button></div>
            </div>
            <div class="shop-item" style="grid-column: span 1; background: rgba(57, 255, 20, 0.1); border: 1px solid #39ff14;">
                <div style="font-size: 30px;">🧬</div><div class="shop-item-name">Ген Мутации</div><div style="font-size:10px;color:#ccc;margin-bottom:10px;">Джокер для синтеза</div>
                <div style="display:flex; gap:5px; width:100%;"><button class="buy-btn" style="background: #39ff14; color:#000; flex:1; font-size:11px;" onclick="window.buyShadowItem('joker', 150, 'dust')">150 ✨</button><button class="buy-btn" style="background: #ffd700; color:#000; flex:1; font-size:11px;" onclick="window.buyShadowItem('joker', 20, 'stars')">20 ⭐️</button></div>
            </div>`;
        return;
    }
    
    if (currentShopTab === 'premium') {
        c.innerHTML = `
            <div class="shop-item" style="grid-column: span 2; background: rgba(0, 163, 255, 0.1); border: 1px solid #00A3FF;"><div style="font-size: 30px;">👑</div><div class="shop-item-name">Focus PRO (30 дней)</div><div style="font-size:12px;color:#ccc;margin-bottom:10px;">+20% к монетам, коронка в Пати</div><button class="buy-btn" style="${window.isVip() ? 'background:#555' : 'background: #00A3FF;'}" onclick="window.buyPremium('pro', 150)">${window.isVip() ? 'Продлить (150 ⭐️)' : '150 ⭐️'}</button></div>
            <div class="shop-item" style="grid-column: span 2; background: rgba(52, 199, 89, 0.1); border: 1px solid #34c759;"><div style="font-size: 30px;">🥚</div><div class="shop-item-name">Второй Инкубатор</div><div style="font-size:12px;color:#ccc;margin-bottom:10px;">Расти 2 яйца оффлайн одновременно</div><button class="buy-btn" style="${hasSecondSlot ? 'background:#555; pointer-events:none;' : 'background: #00A3FF;'}" onclick="window.buyPremium('slot', 100)">${hasSecondSlot ? 'Куплено навсегда' : '100 ⭐️'}</button></div>`;
        return;
    }

    SHOP_DATA[currentShopTab].forEach(item => {
        if (item.isPremium) return; 
        
        const d = document.createElement('div'); 
        d.className = 'shop-item';
        let btnHTML = '';
        
        if (currentShopTab === 'boosters') {
            let pCoins = item.baseCoins + Math.floor(walletBalance * 0.05); 
            let pStars = item.baseStars;
            btnHTML = `<div style="display:flex; gap:5px; width:100%;"><button class="buy-btn" style="flex:1; font-size:10px;" onclick="window.buyItem('${item.id}', ${pCoins}, 'coins')">${window.formatNumber(pCoins)} 💰</button><button class="buy-btn" style="flex:1; background:#ffd700; color:#000; font-size:10px;" onclick="window.buyItem('${item.id}', ${pStars}, 'stars')">${window.formatNumber(pStars)} ⭐️</button></div>`;
            let iconContent = item.icon.includes('.png') ? `<img src="${item.icon}" class="shop-icon-img">` : `<div style="font-size: 50px; margin-bottom: 10px;">${item.icon}</div>`;
            d.innerHTML = `${iconContent}<div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888;margin-bottom:10px;">${item.desc}</div>${btnHTML}`;
        } else {
            const owned = ownedItems[currentShopTab].includes(item.id); 
            const active = (currentShopTab === 'themes') ? (activeTheme === item.id) : (activeEggSkin === item.id);
            let cls = owned ? "buy-btn owned" : "buy-btn"; 
            
            if (!owned && walletBalance < item.price) {
                cls += " locked"; 
            }
            
            let txt = owned ? (active ? "Выбрано" : "Выбрать") : `${window.formatNumber(item.price)} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML = `<button class="${cls}" onclick="window.buyItem('${item.id}',${item.price}, 'coins')">${txt}</button>`;
            
            if (currentShopTab === 'eggs') {
                d.innerHTML = `<img src="${item.img}" class="shop-icon-img"><div class="shop-item-name">${item.name}</div>${btnHTML}`;
            } else {
                let icon = item.bgFile ? `<img src="${item.bgFile}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;margin-bottom:5px">` : `<div style="width:60px;height:60px;background:#333;border-radius:10px;margin-bottom:5px"></div>`;
                d.innerHTML = `${icon}<div class="shop-item-name">${item.name}</div>${btnHTML}`;
            }
        }
        c.appendChild(d);
    });
};

window.buyShadowItem = function(type, price, currency) {
    if (currency === 'dust' && dustBalance >= price) {
        dustBalance -= price; 
        if (type === 'shard') pegasusShards++; 
        if (type === 'joker') userJokers++;
        window.saveData(); 
        window.updateBalanceUI(); 
        window.renderShop(); 
        window.playSound('win'); 
        window.showToast("Товар куплен за Пыль!", "🌑");
    } else if (currency === 'stars' && userStars >= price) {
        userStars -= price; 
        if (type === 'shard') pegasusShards++; 
        if (type === 'joker') userJokers++;
        window.saveData(); 
        window.updateBalanceUI(); 
        window.renderShop(); 
        window.playSound('money'); 
        window.showToast("Товар куплен за Звезды!", "⭐️");
    } else {
        window.showToast("Недостаточно средств!", "❌"); 
        if (currency === 'stars') {
            window.openBuyStarsModal();
        }
    }
};

window.buyPremium = function(type, price) {
    if (userStars >= price) {
        if (type === 'pro') {
            if (window.isVip()) {
                vipEndTime += 30 * 24 * 60 * 60 * 1000; 
            } else {
                vipEndTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
            }
            window.showToast("Focus PRO активирован! 👑", "⭐️");
        } else if (type === 'slot') {
            if (hasSecondSlot) return;
            hasSecondSlot = true; 
            window.showToast("Второй слот открыт!", "🥚"); 
            window.updateSecondSlotUI();
        } else if (type === 'joker') {
            userJokers++; 
            window.showToast("Куплен Ген Мутации! 🧬", "⭐️");
        } else if (type === 'theme_matrix') {
            if (ownedItems.themes.includes('matrix')) return;
            ownedItems.themes.push('matrix'); 
            window.showToast("Куплен премиум фон!", "⭐️");
        } else if (type === 'egg_holo') {
            if (ownedItems.eggs.includes('holo')) return;
            ownedItems.eggs.push('holo'); 
            window.showToast("Куплено премиум яйцо!", "⭐️");
        }
        userStars -= price; 
        window.saveData(); 
        window.updateBalanceUI(); 
        window.apiSyncGlobalProfile(); 
        window.renderShop(); 
        window.playSound('money');
    } else { 
        window.showToast("Недостаточно Звезд!", "❌"); 
        window.openBuyStarsModal(); 
    }
};

window.buyItem = function(id, price, currency) {
    if (currentShopTab === 'boosters') {
        if (currency === 'coins' && walletBalance >= price) { 
            walletBalance -= price; 
            myBoosters[id] = (myBoosters[id] || 0) + 1; 
            window.saveData(); 
            window.updateBalanceUI(); 
            window.renderShop(); 
            window.showToast("Куплено за Монеты!", "🧪"); 
            window.playSound('money'); 
        } else if (currency === 'stars' && userStars >= price) {
            userStars -= price; 
            myBoosters[id] = (myBoosters[id] || 0) + 1; 
            window.saveData(); 
            window.updateBalanceUI(); 
            window.renderShop(); 
            window.showToast("Куплено за Звезды!", "🧪"); 
            window.playSound('money'); 
        } else {
            window.showToast("Недостаточно средств", "🚫"); 
            if (currency === 'stars') {
                window.openBuyStarsModal();
            }
        }
        return;
    }
    
    const category = currentShopTab; 
    const owned = ownedItems[category].includes(id);
    
    if (owned) {
        if (category === 'themes') { 
            activeTheme = id; 
            window.applyTheme(); 
        } else { 
            activeEggSkin = id; 
            window.applyEggSkin(); 
        }
        window.saveData(); 
        window.renderShop(); 
        window.playSound('click');
    } else {
        if (walletBalance >= price) {
            walletBalance -= price; 
            ownedItems[category].push(id);
            if (category === 'themes') { 
                activeTheme = id; 
                window.applyTheme(); 
            } else { 
                activeEggSkin = id; 
                window.applyEggSkin(); 
            }
            window.saveData(); 
            window.updateBalanceUI(); 
            window.renderShop(); 
            window.showToast("Куплено!", "🛍️"); 
            window.playSound('money');
        } else { 
            window.showToast("Мало монет", "🚫"); 
        }
    }
};

window.switchAchTab = function(t) { 
    currentAchTab = t; 
    document.querySelectorAll('#achievements-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    }); 
    
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
    
    if (t === 'achievements') {
        window.renderAch(); 
    } else if (t === 'quests') {
        window.renderQuests(); 
    } else if (t === 'titles') {
        window.renderTitles();
    }
    window.playSound('click'); 
};

window.renderAch = function() {
    const c = window.getEl('achievements-list'); 
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
            btn = `<button class="buy-btn" onclick="window.claimAch('${a.id}',${a.reward})">Забрать ${window.formatNumber(a.reward)} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`; 
        } 
        else if (claimed) { 
            btn = "✅"; 
        } 
        else { 
            btn = `<span style="font-size:12px;color:#888">Цель: ${window.formatNumber(a.goal)}</span>`; 
        }
        
        d.innerHTML = `<div class="ach-icon">${done ? '<img src="assets/ui/icon-trophy.png">' : '<img src="assets/ui/icon-lock.png">'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
};

window.renderQuests = function() {
    const c = window.getEl('achievements-list'); 
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
            btn = `<button class="buy-btn" onclick="window.claimContract(${i})">Забрать</button>`; 
        } else {
            btn = `<span style="font-size:12px;color:#888">${window.formatNumber(t.p)}/${window.formatNumber(t.g)}</span>`;
        }
        
        let icon = t.r.t === 'money' ? '💰' : (t.r.t === 'stars' ? '⭐️' : '🎁');
        let rewardText = `${window.formatNumber(t.r.v)} ` + (t.r.t === 'money' ? 'Монет' : (t.r.t === 'stars' ? 'Звезд' : 'Бустер'));
        
        d.innerHTML = `<div class="ach-icon" style="font-size:24px;">${icon}</div><div class="ach-info"><div class="ach-title">${t.d}</div><div class="ach-desc">Награда: ${rewardText}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
};

window.renderTitles = function() {
    const c = window.getEl('achievements-list'); 
    if (!c) return;
    
    c.innerHTML = '<p style="font-size:12px; color:#888; text-align:center; margin-bottom:10px;">Особые звания за великие заслуги</p>';
    
    TITLES_DATA.forEach(t => {
        let current = 0;
        if (t.type === 'focus') current = Math.floor(focusHours);
        if (t.type === 'mythic') current = mythicsCrafted;
        if (t.type === 'reactor') current = reactorWins;
        
        let isUnlocked = unlockedTitles.includes(t.id);
        let isEquipped = equippedTitle === t.title;
        let isCompleted = current >= t.req;
        
        const d = document.createElement('div');
        d.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
        
        let btn = '';
        if (isEquipped) {
            btn = `<button class="buy-btn" style="background:#ff3b30;" onclick="window.equipTitle('')">Снять</button>`;
        } else if (isUnlocked) {
            btn = `<button class="buy-btn" style="background:#00A3FF;" onclick="window.equipTitle('${t.title}')">Надеть</button>`;
        } else if (isCompleted) {
            btn = `<button class="buy-btn" style="background:#ffd700; color:#000;" onclick="window.claimTitle('${t.id}')">Забрать</button>`;
        } else {
            btn = `<span style="font-size:12px;color:#888">${window.formatNumber(current)}/${window.formatNumber(t.req)}</span>`;
        }
        
        d.innerHTML = `
            <div class="ach-icon" style="font-size:24px;">${isUnlocked ? '👑' : '🔒'}</div>
            <div class="ach-info">
                <div class="ach-title" style="color:#FFD700;">${t.title}</div>
                <div class="ach-desc">${t.desc}</div>
            </div>
            <div>${btn}</div>
        `;
        c.appendChild(d);
    });
};

window.claimTitle = function(id) {
    if (!unlockedTitles.includes(id)) {
        unlockedTitles.push(id);
        window.saveData();
        window.renderTitles();
        window.playSound('win');
        window.showToast("Титул разблокирован!", "👑");
    }
};

window.equipTitle = function(title) {
    equippedTitle = title;
    window.saveData();
    window.apiSyncGlobalProfile();
    window.renderTitles();
    window.playSound('click');
    window.showToast(title === '' ? "Титул снят" : "Титул надет!", "👑");
    
    let pr = window.getEl('profile-rank');
    if (pr) {
        let titleHtml = equippedTitle ? `<span class="player-title" style="font-size: 14px; display: block; margin-bottom: 5px;">${equippedTitle}</span>` : '';
        pr.innerHTML = titleHtml + (RANKS[Math.floor(userLevel / 5)] || "Создатель");
        if (window.isVip()) {
            pr.innerHTML += ' <span style="color:#ffd700">👑 PRO</span>';
        }
    }
};

window.clickLink = function(id, u, r) { 
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.openLink(u); 
    } else {
        window.open(u, '_blank'); 
    }
    
    const b = window.getEl(`qbtn-${id}`); 
    if (b) { 
        b.textContent = "Проверяю..."; 
        b.disabled = true; 
        b.style.background = "#555"; 
        setTimeout(() => window.claimQuest(id, r), 4000); 
    }
};

window.claimAch = function(id, r) { 
    if (claimedAchievements.includes(id)) return; 
    claimedAchievements.push(id); 
    walletBalance += r; 
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.renderAch(); 
    window.showToast(`Награда +${window.formatNumber(r)}`, 'img'); 
    window.playSound('money'); 
};

window.claimQuest = function(id, r) { 
    if (claimedQuests.includes(id)) return; 
    claimedQuests.push(id); 
    walletBalance += r; 
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.renderQuests(); 
    window.showToast(`Награда +${window.formatNumber(r)}`, 'img'); 
    window.playSound('money'); 
};

window.handleShare = function() { 
    if (!userStats.invites) {
        userStats.invites = 0; 
    }
    userStats.invites++; 
    
    window.saveData(); 
    window.checkAchievements(); 
    
    const t = `У меня ${new Set(collection).size} петов в Focus Hatcher!`; 
    const u = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(t)}`; 
    
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(u); 
    } else {
        window.open(u, '_blank'); 
    }
};

// =============================================================
// ФОРБС И РУЛЕТКА
// =============================================================
window.openForbes = async function() {
    window.playSound('click'); 
    window.openModal('forbes-modal');
    
    let flc = window.getEl('forbes-list-container');
    if (flc) {
        flc.innerHTML = '<div style="text-align:center; color:#888; padding: 20px;">Синхронизация...</div>';
    }
    
    await window.apiSyncGlobalProfile();
    
    try {
        const res = await fetch(`${API_URL}/forbes/${window.getTgUser().id}`);
        forbesDataCache = await res.json();
        window.renderForbesList(currentForbesTab);
    } catch(e) {
        if (flc) {
            flc.innerHTML = '<div style="text-align:center; color:#ff3b30; padding: 20px;">Ошибка загрузки топа</div>';
        }
    }
};

window.switchForbesTab = function(tab) {
    window.playSound('click'); 
    currentForbesTab = tab;
    
    document.querySelectorAll('#forbes-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    window.renderForbesList(tab);
};

window.renderForbesList = function(tab) {
    const container = window.getEl('forbes-list-container'); 
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
        let isMe = p.user_id === String(window.getTgUser().id) ? 'me' : '';
        let encodedUser = encodeURIComponent(JSON.stringify(p));
        let titleHtml = p.equipped_title ? `<span class="player-title">${p.equipped_title}</span>` : '';
        
        html += `
            <div class="forbes-item ${isMe}" style="cursor:pointer;" onclick="window.openPublicProfileObj('${encodedUser}')">
                <div class="forbes-rank ${rankClass}">${rankNum}</div>
                <img src="${window.getPetImg(p.avatar)}" class="forbes-avatar" onerror="this.src='assets/ui/icon-profile.png'">
                <div class="forbes-info">
                    ${titleHtml}
                    <div class="forbes-name">${p.name} ${p.syndicate_tag ? `<span style="color:#ffd700; font-size:10px;">[${p.syndicate_tag}]</span>` : ''} ${isMe ? '(Ты)' : ''}</div>
                    <div class="forbes-lvl">Уровень ${p.level}</div>
                </div>
                <div class="forbes-val">${window.formatNumber(p.earned)} <img src="assets/ui/coin.png"></div>
            </div>`;
    });
    container.innerHTML = html;
};

window.updateRouletteButtons = function() {
    let cost = 10; 
    let reqAds = 1; 
    let ticketCount = 0;
    
    if (currentBoxType === 'base') {
        ticketCount = userStats.baseTickets || 0;
    }
    if (currentBoxType === 'epic') { 
        cost = 25; 
        reqAds = 2; 
        ticketCount = userStats.epicTickets || 0; 
    }
    if (currentBoxType === 'mythic') { 
        cost = 50; 
        reqAds = 3; 
        ticketCount = mythicTickets || 0; 
    }
    
    let paidBtn = window.getEl('roulette-paid-btn');
    if (paidBtn) {
        if (ticketCount > 0) { 
            paidBtn.textContent = `Крутить за Билет 🎫 (${ticketCount} шт)`; 
            paidBtn.onclick = () => window.spinRoulette('ticket'); 
        } 
        else { 
            paidBtn.textContent = `Крутить за ${cost} ⭐️`; 
            paidBtn.onclick = () => window.spinRoulette('stars'); 
        }
    }
    
    const today = new Date().toDateString();
    let freeBtn = window.getEl('roulette-free-btn'); 
    let adBtn = window.getEl('roulette-ad-btn');

    if (currentBoxType === 'base' && lastRouletteDate !== today) {
        if (freeBtn) freeBtn.style.display = 'block'; 
        if (adBtn) adBtn.style.display = 'none'; 
        if (paidBtn) paidBtn.style.display = 'none';
    } else {
        if (freeBtn) freeBtn.style.display = 'none';
        if (adBtn) {
            adBtn.style.display = 'block';
            if (currentBoxType !== 'base') { 
                let watched = boxAdsProgress[currentBoxType] || 0; 
                adBtn.textContent = `Смотреть рекламу 📺 (${watched}/${reqAds})`; 
            } else { 
                adBtn.textContent = `Смотреть рекламу 📺`; 
            }
        }
        if (paidBtn) paidBtn.style.display = 'block';
    }
};

window.switchRouletteBox = function(type) {
    window.playSound('click'); 
    currentBoxType = type;
    
    document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    let activeTab = window.getEl(`r-tab-${type}`); 
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    window.updateRouletteButtons();
    
    let boxColor = '#fff'; 
    if (type === 'epic') boxColor = '#00A3FF'; 
    if (type === 'mythic') boxColor = '#ffd700';
    
    let rBox = window.getEl('roulette-box'); 
    if (rBox) { 
        rBox.style.filter = `drop-shadow(0 0 20px ${boxColor})`; 
        rBox.textContent = '🎁'; 
    }
    
    let resText = window.getEl('roulette-result-text'); 
    if (resText) {
        resText.textContent = '';
    }
};

window.openRouletteModal = function() { 
    window.switchRouletteBox('base'); 
    window.openModal('roulette-modal'); 
};

window.spinRouletteAd = function() {
    if (!window.gp || !window.gp.ads) {
        return window.showToast("Реклама еще загружается", "⏳");
    }
    
    const btn = window.getEl('roulette-ad-btn'); 
    if (!btn) return;
    
    const orig = btn.textContent; 
    btn.disabled = true; 
    btn.textContent = "Поиск видео...";
    
    let adTimeout = setTimeout(() => { 
        btn.disabled = false; 
        btn.textContent = orig; 
        window.showToast("Нет видео у провайдера", "⏳"); 
    }, 8000);

    try {
        window.gp.ads.showRewardedVideo({
            onStart: () => { 
                clearTimeout(adTimeout); 
            },
            onRewarded: () => {
                if (currentBoxType !== 'base') {
                    let req = currentBoxType === 'epic' ? 2 : 3;
                    if (!boxAdsProgress[currentBoxType]) boxAdsProgress[currentBoxType] = 0;
                    boxAdsProgress[currentBoxType]++;
                    if (boxAdsProgress[currentBoxType] >= req) { 
                        boxAdsProgress[currentBoxType] = 0; 
                        window.spinRoulette('ad'); 
                    } 
                    else { 
                        window.saveData(); 
                        window.switchRouletteBox(currentBoxType); 
                        window.showToast(`Реклама просмотрена: ${boxAdsProgress[currentBoxType]}/${req}`, '📺'); 
                    }
                } else { 
                    window.spinRoulette('ad'); 
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
                window.showToast("Ошибка рекламы", "❌"); 
            }
        });
    } catch (e) { 
        clearTimeout(adTimeout); 
        btn.disabled = false; 
        btn.textContent = orig; 
        window.showToast("Сбой сети", "❌"); 
    }
};

window.spinRoulette = function(method) {
    let cost = 10; 
    if (currentBoxType === 'epic') cost = 25; 
    if (currentBoxType === 'mythic') cost = 50;

    if (method === 'ticket') {
        if (currentBoxType === 'base') userStats.baseTickets--;
        else if (currentBoxType === 'epic') userStats.epicTickets--;
        else if (currentBoxType === 'mythic') mythicTickets--;
        window.showToast("Использован Билет Рулетки!", "🎫");
    } else if (method === 'stars') {
        if (userStars < cost) { 
            window.showToast("Недостаточно Звезд!", "❌"); 
            window.openBuyStarsModal(); 
            return; 
        }
        userStars -= cost; 
        window.updateBalanceUI();
    } else if (method === 'free' && currentBoxType === 'base') { 
        lastRouletteDate = new Date().toDateString(); 
    }
    
    window.updateContract('roulette', 1); 
    window.playSound('click'); 
    window.saveData();
    
    const box = window.getEl('roulette-box'); 
    const resText = window.getEl('roulette-result-text'); 
    if (!box || !resText) return;
    
    if (window.getEl('roulette-free-btn')) window.getEl('roulette-free-btn').disabled = true;
    if (window.getEl('roulette-ad-btn')) window.getEl('roulette-ad-btn').disabled = true;
    if (window.getEl('roulette-paid-btn')) window.getEl('roulette-paid-btn').disabled = true;
    document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.disabled = true);
    
    box.className = 'roulette-box roulette-spinning'; 
    resText.textContent = "Крутим...";
    
    setTimeout(() => {
        box.className = 'roulette-box';
        
        if (window.getEl('roulette-free-btn')) window.getEl('roulette-free-btn').disabled = false;
        if (window.getEl('roulette-ad-btn')) window.getEl('roulette-ad-btn').disabled = false;
        if (window.getEl('roulette-paid-btn')) window.getEl('roulette-paid-btn').disabled = false;
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
        
        if (!selectedPrize) selectedPrize = pool[0];
        
        window.playSound('win'); 
        window.fireConfetti();
        
        if (selectedPrize.t === 'legendary_random') {
            const randLeg = petDatabase.legendary[Math.floor(Math.random() * petDatabase.legendary.length)];
            collection.push(randLeg); 
            window.showToast(`СУПЕР ПРИЗ! Легендарный ${PET_NAMES[randLeg]}!`, "🏆");
            box.textContent = "🐲"; 
            resText.textContent = `ДЖЕКПОТ: ${PET_NAMES[randLeg]}`;
        }
        else if (selectedPrize.t === 'xp') {
            let gainedXP = Math.floor(Math.random() * (selectedPrize.max - selectedPrize.min + 1)) + selectedPrize.min;
            userXP += gainedXP;
            while (userXP >= userLevel * 200) { 
                userXP -= userLevel * 200; 
                userLevel++; 
                window.showToast(`Lvl UP: ${userLevel} 🏆`, "🎉"); 
                window.playSound('win'); 
            }
            window.updateLevelUI(); 
            window.showToast(`Вы выиграли +${gainedXP} XP!`, "🌟");
            box.textContent = "🌟"; 
            resText.textContent = `Выпало: ${gainedXP} Опыта`;
        }
        else if (selectedPrize.t === 'money') { 
            walletBalance += selectedPrize.v; 
            window.showToast(`+${window.formatNumber(selectedPrize.v)} монет!`, "💰"); 
            box.textContent = "💰"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'stars') { 
            userStars += selectedPrize.v; 
            window.showToast(`+${selectedPrize.v} Звезд!`, "⭐️"); 
            box.textContent = "⭐️"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'joker') { 
            userJokers += selectedPrize.v; 
            window.showToast(`Ген Мутации x${selectedPrize.v}!`, "🧬"); 
            box.textContent = "🧬"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'shard') { 
            pegasusShards += selectedPrize.v; 
            window.showToast(`Осколок Пегаса x${selectedPrize.v}!`, "🧩"); 
            box.textContent = "🦄"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'luck') { 
            if (!myBoosters.luck) {
                myBoosters.luck = 0; 
            }
            myBoosters.luck += selectedPrize.v; 
            window.showToast(`Зелье удачи x${selectedPrize.v}!`, "🧪"); 
            box.textContent = "🧪"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }
        else if (selectedPrize.t === 'speed') { 
            if (!myBoosters.speed) {
                myBoosters.speed = 0; 
            }
            myBoosters.speed += selectedPrize.v; 
            window.showToast(`Ускоритель x${selectedPrize.v}!`, "⚡️"); 
            box.textContent = "⚡️"; 
            resText.textContent = `Выпало: ${selectedPrize.n}`; 
        }

        window.saveData(); 
        window.updateBalanceUI(); 
        window.updateRouletteButtons(); 
    }, 2000);
};

// =============================================================
// ПОКУПКА ЗВЕЗД И ПРОМОКОДЫ
// =============================================================
window.openBuyStarsModal = function() { 
    window.openModal('buy-stars-modal'); 
};

window.buyStars = async function(amount) {
    window.playSound('click'); 
    const btn = event.target; 
    const originalText = btn.textContent;
    
    btn.textContent = "Загрузка..."; 
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/payment/invoice`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ amount: amount, user_id: window.getTgUser().id })
        });
        const data = await res.json();
        
        if (data.status === 'success' && data.invoice_link) {
            window.Telegram.WebApp.openInvoice(data.invoice_link, (status) => {
                if (status === 'paid') {
                    window.playSound('win'); 
                    userStars += amount; 
                    window.saveData(); 
                    window.updateBalanceUI();
                    window.showToast(`Успешно куплено ${amount} Звезд!`, '⭐️'); 
                    window.closeModal('buy-stars-modal');
                } else if (status === 'cancelled') { 
                    window.showToast("Оплата отменена", "❌"); 
                } else { 
                    window.showToast("Ошибка оплаты", "❌"); 
                }
            });
        } else { 
            window.showToast("Ошибка создания чека: " + (data.detail || ""), "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
    
    btn.textContent = originalText; 
    btn.disabled = false;
};

window.openPromo = function() { 
    window.openModal('promo-modal'); 
};

window.activatePromo = async function() {
    window.playSound('click'); 
    const input = window.getEl('promo-input'); 
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
            body: JSON.stringify({ user_id: window.getTgUser().id, code: code })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            if (data.type === 'money') { 
                walletBalance += data.val; 
                window.showToast(`+${window.formatNumber(data.val)} Монет`, 'img'); 
            } 
            else if (data.type === 'speed') { 
                if (!myBoosters.speed) myBoosters.speed = 0; 
                myBoosters.speed += data.val; 
                window.showToast(`+${data.val} Ускоритель`, '⚡️'); 
            } 
            else if (data.type === 'luck') { 
                if (!myBoosters.luck) myBoosters.luck = 0; 
                myBoosters.luck += data.val; 
                window.showToast(`+${data.val} Удача`, '🧪'); 
            } 
            else if (data.type === 'stars') { 
                userStars += data.val; 
                window.showToast(`+${data.val} Звезд!`, '⭐️'); 
            } 
            else if (data.type === 'joker') { 
                userJokers += data.val; 
                window.showToast(`+${data.val} Ген Мутации!`, '🧬'); 
            }
            
            if (!usedCodes.includes(code)) {
                usedCodes.push(code);
            }
            
            window.saveData(); 
            window.updateBalanceUI(); 
            window.playSound('win'); 
            window.closeModal('promo-modal'); 
            input.value = "";
        } else { 
            window.showToast(data.detail, "❌"); 
        }
    } catch (e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
    
    btn.textContent = originalText; 
    btn.disabled = false;
};

window.generateRandomPromo = function() {
    window.playSound('click'); 
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; 
    let code = 'FH-';
    
    for(let i=0; i<6; i++) { 
        if (i===3) code += '-'; 
        code += chars.charAt(Math.floor(Math.random() * chars.length)); 
    }
    window.getEl('admin-promo-code').value = code;
};

window.adminSubmitPromo = async function() {
    window.playSound('click');
    const code = window.getEl('admin-promo-code').value.trim().toUpperCase(); 
    const type = window.getEl('admin-promo-type').value;
    const val = parseInt(window.getEl('admin-promo-val').value) || 0; 
    const limit = window.getEl('admin-promo-limit').value ? parseInt(window.getEl('admin-promo-limit').value) : 0;
    const pwd = window.getEl('admin-password').value.trim();
    
    if (!code || val <= 0 || !pwd) {
        return window.showToast("Заполни все поля и пароль!", "❌");
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
            window.showToast("Промокод создан!", "✅"); 
            window.closeModal('admin-modal'); 
            window.getEl('admin-promo-code').value = ''; 
        } else { 
            window.showToast(data.detail, "❌"); 
        }
    } catch(e) { 
        window.showToast("Ошибка сети", "❌"); 
    }
    
    btn.textContent = origText; 
    btn.disabled = false;
};

// =============================================================
// ИНВЕНТАРЬ (ЧИСТАЯ КОЛЛЕКЦИЯ - ТОЛЬКО ПРОСМОТР И ПРОДАЖА)
// =============================================================
window.openInventory = function() {
    const container = document.getElementById('collection-container'); 
    if (!container) return; 
    
    container.innerHTML = ''; 
    
    ALL_PETS_FLAT.forEach(pet => {
        const count = collection.filter(p => p === pet).length; 
        const r = window.getPetRarity(pet); 
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
            d.onclick = () => window.openPetModal(pet, true);
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
            d.onclick = () => window.openPetModal(pet, false);
        }
        container.appendChild(d);
    });
    window.openModal('inventory-modal');
};

window.openPetModal = function(pet, owned) {
    selectedPet = pet; 
    const r = window.getPetRarity(pet); 
    const p = PRICES[r] || 0; 
    const petName = PET_NAMES[pet] || "Питомец";
    let currentStar = petStars[pet] || 1;
    let starStr = currentStar > 1 ? ` <span style="color:#ffd700; font-size:16px;">${'⭐️'.repeat(currentStar)}</span>` : '';
    let pdv = window.getEl('pet-detail-view');
    
    if (pdv) {
        if (owned) {
            pdv.innerHTML = `
                <img src="assets/pets/pet-${pet}.png" class="pet-img-big" onerror="this.src='assets/eggs/egg-default.png'">
                <h3 class="pet-name">${petName}${starStr}</h3>
                <p class="pet-rarity ${r}">${r}</p>
                <p class="pet-price">Цена: ${window.formatNumber(p)} <img src="assets/ui/coin.png" style="width:16px;vertical-align:middle"></p>
                <button class="btn sell-action" onclick="window.sellPet()">Продать ${window.formatNumber(p)}</button>
            `;
        } else {
            pdv.innerHTML = `
                <img src="assets/pets/pet-${pet}.png" class="pet-img-big" style="filter:brightness(0) opacity(0.3)" onerror="this.src='assets/eggs/egg-default.png'">
                <h3 class="pet-name">???</h3>
                <p class="pet-rarity ${r}">${r}</p>
                <button class="btn" style="background:#333" onclick="window.closeModal('pet-modal')">Закрыть</button>
            `;
        }
    }
    window.openModal('pet-modal');
};

window.sellPet = function() {
    if (!selectedPet) return; 
    const idx = collection.indexOf(selectedPet); 
    if (idx === -1) return;
    
    let basePrice = PRICES[window.getPetRarity(selectedPet)] || 0; 
    let finalPrice = window.isVip() ? Math.floor(basePrice * 1.2) : basePrice;
    
    walletBalance += finalPrice; 
    userStats.earned += finalPrice; 
    collection.splice(idx, 1); 
    window.updateContract('sell', 1);
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.closeModal('pet-modal'); 
    window.showToast(`Продано +${window.formatNumber(finalPrice)}`, 'img'); 
    window.playSound('money'); 
    window.openInventory(); 
};

// =============================================================
// ЛАБОРАТОРИЯ (ПРОКАЧКА, РАСЩЕПЛЕНИЕ, МИФИКИ И МУТАТОР)
// =============================================================
window.switchLabTab = function(tab) {
    currentLabTab = tab;
    
    document.querySelectorAll('#craft-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    let activeBtn = window.getEl(`lab-tab-${tab}`);
    if(activeBtn) {
        activeBtn.classList.add('active');
    }

    window.getEl('lab-upgrade-view').style.display = 'none';
    window.getEl('lab-splinter-view').style.display = 'none';
    window.getEl('lab-mythic-view').style.display = 'none';
    window.getEl('lab-mutate-view').style.display = 'none';

    if(tab === 'upgrade') {
        window.getEl('lab-upgrade-view').style.display = 'block';
        window.renderLabUpgrade();
    } else if(tab === 'splinter') {
        window.getEl('lab-splinter-view').style.display = 'block';
        window.renderLabSplinter();
    } else if(tab === 'mythic') {
        window.getEl('lab-mythic-view').style.display = 'block';
    } else if(tab === 'mutate') {
        window.getEl('lab-mutate-view').style.display = 'block';
        window.renderMutator();
    }
    window.playSound('click');
};

window.openCraft = function() {
    let psc = window.getEl('pegasus-shards-count'); 
    if(psc) psc.textContent = pegasusShards;
    
    let jcd = window.getEl('joker-count-display'); 
    if(jcd) jcd.textContent = userJokers;
    
    let cmb = window.getEl('craft-mythic-btn');
    if(cmb) {
        if(pegasusShards >= 10) { 
            cmb.className = "btn"; 
            cmb.style.background = "#8a2be2"; 
            cmb.style.boxShadow = "0 0 15px rgba(138,43,226,0.8)"; 
        }
        else { 
            cmb.className = "btn locked"; 
            cmb.style.boxShadow = "none"; 
        }
    }

    window.switchLabTab('upgrade');
    window.openModal('craft-modal');
};

window.renderLabUpgrade = function() {
    const c = window.getEl('lab-upgrade-list'); 
    if(!c) return;
    
    c.innerHTML = '';
    const uniquePets = [...new Set(collection)];
    
    if(uniquePets.length === 0) { 
        c.innerHTML = '<p style="grid-column: span 4; color: #888; font-size: 12px; text-align:center;">Нет питомцев для прокачки.</p>'; 
        return; 
    }

    uniquePets.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const r = window.getPetRarity(pet);
        let currentStar = petStars[pet] || 1;
        let cost = currentStar === 1 ? 3 : (currentStar === 2 ? 5 : (currentStar === 3 ? 10 : 0));
        
        if(cost > 0) {
            const d = document.createElement('div');
            d.className = `pet-slot ${r}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count" style="background:#333;">${count}/${cost+1}</div>`;
            
            if(count >= cost + 1) {
                d.style.borderColor = '#34c759';
                d.onclick = () => window.upgradePet(pet, cost);
            } else if(count > 0 && userJokers >= (cost + 1 - count)) {
                d.style.borderColor = '#00A3FF';
                d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count" style="background:#00A3FF;">+${cost+1-count} 🧬</div>`;
                d.onclick = () => window.upgradePetWithJoker(pet, cost, cost + 1 - count);
            } else {
                d.style.opacity = '0.5';
                d.onclick = () => window.showToast(`Нужно еще ${cost+1-count} ${PET_NAMES[pet]} или Генов!`, '❌');
            }
            c.appendChild(d);
        }
    });
};

window.upgradePet = function(pet, cost) {
    let removed = 0; 
    collection = collection.filter(p => { 
        if (p === pet && removed < cost) { 
            removed++; 
            return false; 
        } 
        return true; 
    });
    
    petStars[pet] = (petStars[pet] || 1) + 1;
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.playSound('win'); 
    window.showToast(`${PET_NAMES[pet]} улучшен до ⭐️${petStars[pet]}!`, '🌟');
    
    window.renderLabUpgrade();
};

window.upgradePetWithJoker = function(pet, cost, jokersNeeded) {
    if(confirm(`Использовать ${jokersNeeded} 🧬 Генов для улучшения ${PET_NAMES[pet]}?`)) {
        userJokers -= jokersNeeded;
        window.upgradePet(pet, cost - jokersNeeded); 
        
        let jcd = window.getEl('joker-count-display'); 
        if(jcd) jcd.textContent = userJokers;
    }
};

window.renderLabSplinter = function() {
    const c = window.getEl('lab-splinter-list'); 
    if(!c) return;
    
    c.innerHTML = '';
    const uniquePets = [...new Set(collection)];
    
    if(uniquePets.length === 0) { 
        c.innerHTML = '<p style="grid-column: span 4; color: #888; font-size: 12px; text-align:center;">Нет питомцев.</p>'; 
        return; 
    }

    uniquePets.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const r = window.getPetRarity(pet);
        
        if(count > 0) {
            const d = document.createElement('div');
            d.className = `pet-slot ${r}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count">x${count}</div>`;
            
            d.onclick = () => {
                if(r === 'common' || r === 'rare' || r === 'epic') {
                    let dustGain = r === 'common' ? 10 : (r === 'rare' ? 30 : 100);
                    if(confirm(`Распылить ${PET_NAMES[pet]} за +${dustGain} ✨?`)) {
                        window.dustPet(pet, dustGain);
                    }
                } else if (r === 'legendary') {
                    if(confirm(`Расщепить ${PET_NAMES[pet]} на Осколки Пегаса?`)) {
                        window.splinterPet(pet, 'legendary');
                    }
                } else {
                    window.showToast("Этого пета нельзя расщепить!", "❌");
                }
            };
            c.appendChild(d);
        }
    });
};

window.dustPet = function(pet, amount) {
    const idx = collection.indexOf(pet);
    if (idx > -1) {
        collection.splice(idx, 1); 
        dustBalance += amount;
        
        window.saveData(); 
        window.updateBalanceUI(); 
        window.playSound('win'); 
        window.showToast(`Распылено! +${amount} ✨`, '✨');
        
        window.renderLabSplinter();
    }
};

window.splinterPet = function(pet, rarity) {
    const idx = collection.indexOf(pet); 
    if (idx === -1) return;
    
    collection.splice(idx, 1); 
    window.playSound('click');
    
    if (rarity === 'legendary') {
        let amount = Math.random() < 0.5 ? 1 : 2; 
        pegasusShards += amount; 
        window.showToast(`Успех! Получено ${amount} Осколков! 🧩`, "win");
    }
    
    window.saveData(); 
    window.updateBalanceUI(); 
    window.renderLabSplinter();
    
    let psc = window.getEl('pegasus-shards-count'); 
    if(psc) psc.textContent = pegasusShards;
};

window.startDnaPuzzle = function() {
    if (pegasusShards < 10) return window.showToast("Не хватает осколков!", "❌");
    
    dnaGrid = [ 
        [1, 1, 1], 
        [1, 1, 1], 
        [1, 1, 1] 
    ];
    
    for (let i = 0; i < 15; i++) { 
        let r = Math.floor(Math.random() * 3); 
        let c = Math.floor(Math.random() * 3); 
        window.toggleDnaNode(r, c, true); 
    }
    
    if (window.checkDnaWin(true)) {
        window.toggleDnaNode(0, 0, true);
    }
    
    window.renderDnaGrid(); 
    window.closeModal('craft-modal'); 
    window.openModal('dna-modal');
};

window.toggleDnaNode = function(r, c, isScrambling=false) {
    let coords = [[r,c], [r-1,c], [r+1,c], [r,c-1], [r,c+1]];
    
    coords.forEach(([nr, nc]) => { 
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
            dnaGrid[nr][nc] = dnaGrid[nr][nc] === 1 ? 0 : 1; 
        }
    });
    
    if (!isScrambling) {
        window.playSound('click'); 
        window.renderDnaGrid();
        
        if (window.checkDnaWin()) {
            setTimeout(() => {
                window.closeModal('dna-modal'); 
                pegasusShards -= 10;
                window.saveData(); 
                window.updateBalanceUI(); 
                window.craftMythicReal(); 
            }, 500);
        }
    }
};

window.checkDnaWin = function(silent=false) {
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) { 
            if (dnaGrid[r][c] === 0) return false; 
        } 
    } 
    return true;
};

window.renderDnaGrid = function() {
    let container = window.getEl('dna-grid'); 
    if (!container) return; 
    
    container.innerHTML = '';
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let d = document.createElement('div'); 
            d.className = `dna-node ${dnaGrid[r][c] === 1 ? 'active' : ''}`;
            d.onclick = () => window.toggleDnaNode(r, c); 
            container.appendChild(d);
        }
    }
};

window.craftMythicReal = function() {
    window.openModal('mythic-craft-modal'); 
    window.playSound('legendary');
    
    let ms = window.getEl('mythic-silhouette'); 
    if (ms) { 
        ms.className = 'mythic-silhouette spinning'; 
        ms.src = 'assets/eggs/egg-default.png'; 
    }
    
    let pulseInterval = setInterval(() => { window.fireConfetti(); }, 800);
    
    setTimeout(() => {
        clearInterval(pulseInterval);
        
        let pool = petDatabase.mythic; 
        let dropped = pool[Math.floor(Math.random() * pool.length)]; 
        collection.push(dropped);
        
        mythicsCrafted++; 
        window.updateContract('craft', 1); 
        window.saveData(); 
        window.updateBalanceUI();
        
        if (ms) { 
            ms.className = 'mythic-silhouette epic-flash'; 
            ms.src = `assets/pets/pet-${dropped}.png`; 
        }
        
        window.showToast(`МИФИК СОЗДАН: ${PET_NAMES[dropped]}! 🦄`, "🌟"); 
        
        for (let i = 0; i < 5; i++) {
            setTimeout(window.fireConfetti, i * 300);
        }
        
        setTimeout(() => { 
            window.closeModal('mythic-craft-modal'); 
            window.openCraft(); 
        }, 4000);
        
    }, 3000);
};

// === СЕКРЕТНЫЙ МУТАТОР ===
window.renderMutator = function() {
    let s1 = window.getEl('mutator-slot-1');
    let s2 = window.getEl('mutator-slot-2');
    let scat = window.getEl('mutator-slot-cat');
    let mBtn = window.getEl('mutate-btn');

    if(mutatorSlot1) { 
        s1.innerHTML = `<img src="assets/pets/pet-${mutatorSlot1}.png">`; 
        s1.classList.add('filled'); 
    } else { 
        s1.innerHTML = '?'; 
        s1.classList.remove('filled'); 
    }
    
    if(mutatorSlot2) { 
        s2.innerHTML = `<img src="assets/pets/pet-${mutatorSlot2}.png">`; 
        s2.classList.add('filled'); 
    } else { 
        s2.innerHTML = '?'; 
        s2.classList.remove('filled'); 
    }
    
    if(mutatorCatalyst) { 
        let catIcon = '';
        if(mutatorCatalyst === 'joker') catIcon = '🧬';
        else if(mutatorCatalyst === 'bio') catIcon = '💉';
        else if(mutatorCatalyst === 'luck') catIcon = '<img src="assets/ui/booster-luck.png">';
        
        scat.innerHTML = catIcon; 
        scat.classList.add('filled'); 
    } else { 
        scat.innerHTML = '🧪'; 
        scat.classList.remove('filled'); 
    }

    if(mutatorSlot1 && mutatorSlot2 && mutatorCatalyst) {
        mBtn.className = "btn"; 
        mBtn.style.background = "linear-gradient(90deg, #ff3b30, #8a2be2)";
    } else {
        mBtn.className = "btn locked";
    }
};

window.openMutatorSelect = function(slot) {
    window.playSound('click');
    currentMutatorSelecting = slot;
    
    const list = window.getEl('mutator-select-list'); 
    if(!list) return;
    
    list.innerHTML = '';
    window.getEl('mutator-select-title').textContent = slot === 'cat' ? "Выберите Катализатор" : "Выберите Питомца";

    if(slot === 'cat') {
        if(userJokers > 0) {
            list.innerHTML += `<div class="pet-slot" style="border-color:#39ff14;" onclick="window.selectMutatorItem('joker')"><div style="font-size:30px;">🧬</div><div class="slot-count">x${userJokers}</div></div>`;
        }
        if(myBoosters.bio > 0) {
            list.innerHTML += `<div class="pet-slot" style="border-color:#ff2d55;" onclick="window.selectMutatorItem('bio')"><div style="font-size:30px;">💉</div><div class="slot-count">x${myBoosters.bio}</div></div>`;
        }
        if(myBoosters.luck > 0) {
            list.innerHTML += `<div class="pet-slot" style="border-color:#ffd700;" onclick="window.selectMutatorItem('luck')"><img src="assets/ui/booster-luck.png" style="width:50%;"><div class="slot-count">x${myBoosters.luck}</div></div>`;
        }
        
        if(userJokers === 0 && myBoosters.bio === 0 && myBoosters.luck === 0) {
            list.innerHTML = "<p style='color:#888; grid-column:span 4; text-align:center;'>Нет катализаторов!</p>";
        }
    } else {
        const uniquePets = [...new Set(collection)];
        if(uniquePets.length === 0) {
            list.innerHTML = "<p style='color:#888; grid-column:span 4; text-align:center;'>Нет питомцев!</p>";
        }
        
        uniquePets.forEach(pet => {
            const count = collection.filter(p => p === pet).length;
            const r = window.getPetRarity(pet);
            const d = document.createElement('div');
            d.className = `pet-slot ${r}`;
            
            let starLevel = petStars[pet] || 1;
            let starBadge = starLevel > 1 ? `<div class="star-badge">⭐️${starLevel}</div>` : '';
            
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'"><div class="slot-count">x${count}</div>${starBadge}`;
            d.onclick = () => window.selectMutatorItem(pet);
            list.appendChild(d);
        });
    }
    window.openModal('mutator-select-modal');
};

window.selectMutatorItem = function(item) {
    window.playSound('click');
    
    if(currentMutatorSelecting === 1) {
        mutatorSlot1 = item;
    } else if(currentMutatorSelecting === 2) {
        mutatorSlot2 = item;
    } else if(currentMutatorSelecting === 'cat') {
        mutatorCatalyst = item;
    }
    
    window.closeModal('mutator-select-modal');
    window.renderMutator();
};

window.executeMutation = async function() {
    if(!mutatorSlot1 || !mutatorSlot2 || !mutatorCatalyst) return;
    
    window.playSound('click');
    let mBtn = window.getEl('mutate-btn');
    mBtn.textContent = "Синтез..."; 
    mBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/craft/mutate`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                pet1: mutatorSlot1, 
                pet1_stars: petStars[mutatorSlot1] || 1,
                pet2: mutatorSlot2, 
                pet2_stars: petStars[mutatorSlot2] || 1,
                catalyst: mutatorCatalyst
            })
        });
        
        const data = await res.json();
        
        if(data.status === 'success') {
            collection.splice(collection.indexOf(mutatorSlot1), 1);
            collection.splice(collection.indexOf(mutatorSlot2), 1);
            
            if(mutatorCatalyst === 'joker') userJokers--;
            else if(mutatorCatalyst === 'bio') myBoosters.bio--;
            else if(mutatorCatalyst === 'luck') myBoosters.luck--;

            collection.push(data.result_pet);
            window.playSound('legendary');
            window.showToast(data.message, "🌟");
            
            window.getEl('craft-modal').querySelector('.modal-content').classList.add('shake-hard');
            setTimeout(() => {
                window.getEl('craft-modal').querySelector('.modal-content').classList.remove('shake-hard');
            }, 1000);
            
            window.fireConfetti();
            mutatorSlot1 = null; 
            mutatorSlot2 = null; 
            mutatorCatalyst = null;
        } else {
            if(mutatorCatalyst === 'joker') userJokers--;
            else if(mutatorCatalyst === 'bio') myBoosters.bio--;
            else if(mutatorCatalyst === 'luck') myBoosters.luck--;
            
            window.playSound('wrong');
            window.showToast(data.message, "❌");
            mutatorCatalyst = null;
        }
        
        window.saveData(); 
        window.updateBalanceUI(); 
        window.renderMutator();
        
    } catch(e) {
        window.showToast("Ошибка мутатора", "❌");
    }
    
    mBtn.textContent = "Синтезировать ☣️"; 
    mBtn.disabled = false;
};

// =============================================================
// БАЗОВЫЙ ТАЙМЕР И ФОКУС
// =============================================================
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning && currentHatchMode === 'online') {
        window.stopTimer(true); 
    }
});

window.updateBalanceUI = function() {
    let moneyEl = window.getEl('total-money'); 
    if (moneyEl) {
        moneyEl.innerHTML = `<img src="assets/ui/coin.png" class="coin-img"> ${window.formatNumber(walletBalance)}`;
    }
    
    let dustEl = window.getEl('total-dust');
    if (dustEl) {
        dustEl.innerHTML = `✨ ${window.formatNumber(dustBalance)}`;
    }
    
    let starsEl = window.getEl('total-stars');
    if (starsEl) {
        starsEl.innerHTML = `<span style="font-size: 20px; margin-right: 4px;">⭐️</span> ${window.formatNumber(userStars)} <span style="font-size: 14px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 8px; margin-left: 5px;">+</span>`;
    }
    
    let uc = window.getEl('unique-count'); 
    if (uc) {
        uc.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    }
    
    window.checkAchievements();
    window.renderBoostersPanel();
};

window.renderBoostersPanel = function() {
    const p = window.getEl('boosters-panel'); 
    if (!p) {
        return;
    }
    
    p.innerHTML = '';
    p.appendChild(window.createBoosterBtn('luck', 'assets/ui/booster-luck.png', myBoosters.luck || 0, activeBoosters.luck));
    p.appendChild(window.createBoosterBtn('speed', 'assets/ui/booster-speed.png', myBoosters.speed || 0, activeBoosters.speed));
    p.appendChild(window.createBoosterBtn('bio', '💉', myBoosters.bio || 0, activeBoosters.bio)); 
};

window.createBoosterBtn = function(type, content, count, isActive) {
    const d = document.createElement('div');
    d.className = `booster-slot ${isActive ? 'active' : ''} ${count === 0 ? 'empty' : ''}`;
    
    let inner = content.includes('.png') ? `<img src="${content}">` : `<div style="font-size:30px;">${content}</div>`;
    d.innerHTML = `${inner} <div class="booster-count">${count}</div>`;
    
    d.onclick = () => {
        if (count > 0 && !isRunning) { 
            activeBoosters[type] = !activeBoosters[type]; 
            window.renderBoostersPanel(); 
            window.updateUI(); 
            window.playSound('click');
        }
    };
    
    return d;
};

window.prevMode = function() { 
    if (!isRunning) { 
        currentModeIndex--; 
        if (currentModeIndex < 0) {
            currentModeIndex = MODES.length - 1; 
        }
        window.updateUI(); 
        window.playSound('click'); 
    }
};

window.nextMode = function() { 
    if (!isRunning) { 
        currentModeIndex++; 
        if (currentModeIndex >= MODES.length) {
            currentModeIndex = 0; 
        }
        window.updateUI(); 
        window.playSound('click'); 
    }
};

window.openCustomEggModal = function() { 
    window.updateCustomEggTimes(); 
    window.openModal('custom-egg-modal'); 
};

window.updateCustomEggTimes = function() {
    let sel = window.getEl('custom-rarity-select'); 
    if (!sel) return;
    
    const r = sel.value;
    if (r === 'rare' && userLevel < 10) { 
        window.showToast("Редкие с 10 уровня!", "🔒"); 
        sel.value = 'common'; 
        return; 
    }
    if (r === 'legendary' && userLevel < 20) { 
        window.showToast("Легендарки с 20 уровня!", "🔒"); 
        sel.value = 'common'; 
        return; 
    }

    if (r === 'all') { 
        customEggConfig.timeOnline = 3600; 
        customEggConfig.timeOffline = 5 * 3600; 
    }
    else if (r === 'common') { 
        customEggConfig.timeOnline = 3600; 
        customEggConfig.timeOffline = 6 * 3600; 
    }
    else if (r === 'rare') { 
        customEggConfig.timeOnline = 2 * 3600; 
        customEggConfig.timeOffline = 7 * 3600; 
    }
    else if (r === 'legendary') { 
        customEggConfig.timeOnline = 3 * 3600; 
        customEggConfig.timeOffline = 8 * 3600; 
    }
    
    let timesEl = window.getEl('custom-egg-times');
    if (timesEl) {
        timesEl.textContent = `Онлайн: ${customEggConfig.timeOnline / 3600} ч | Оффлайн: ${customEggConfig.timeOffline / 3600} ч`;
    }
};

window.saveCustomEgg = function() {
    let sel = window.getEl('custom-rarity-select'); 
    if (sel) {
        customEggConfig.target = sel.value;
    }
    window.closeModal('custom-egg-modal');
    window.updateUI();
    window.saveData();
};

window.updateUI = function() {
    const m = MODES[currentModeIndex] || MODES[0];
    let t = currentModeIndex === 2 ? customEggConfig.timeOnline : m.timeOnline;
    
    if (activeBoosters.speed) {
        if (currentModeIndex === 0) {
            t = 20 * 60; 
        }
        else if (currentModeIndex === 1) {
            t = 45 * 60; 
        }
        else {
            t = Math.floor(t * 0.7); 
        }
    }

    if (!isRunning) { 
        window.applyEggSkin();
        let timerEl = window.getEl('timer'); 
        if (timerEl) {
            timerEl.textContent = window.formatTime(t); 
        }
        
        let infoEl = window.getEl('hatched-info'); 
        if (infoEl) {
            infoEl.style.display = 'none';
        }
        
        let custBtn = window.getEl('custom-egg-btn'); 
        if (custBtn) {
            custBtn.style.display = currentModeIndex === 2 ? 'block' : 'none';
        }
        
        let lockEl = window.getEl('egg-lock');
        let btnFocus = window.getEl('btn-focus') || (document.querySelectorAll('#start-buttons-container .btn').length > 0 ? document.querySelectorAll('#start-buttons-container .btn')[0] : null);
        let btnIncub = window.getEl('btn-incubator') || (document.querySelectorAll('#start-buttons-container .btn').length > 1 ? document.querySelectorAll('#start-buttons-container .btn')[1] : null);
        let titleEl = window.getEl('mode-title');
        let subEl = window.getEl('mode-subtitle');

        if (userLevel < m.reqLevel) {
            if (lockEl) lockEl.style.display = 'block';
            if (btnFocus) btnFocus.disabled = true;
            if (btnIncub) btnIncub.disabled = true;
            if (custBtn) custBtn.style.display = 'none';
            if (titleEl) { 
                titleEl.textContent = `Доступно с ${m.reqLevel} уровня`; 
                titleEl.style.color = '#ff3b30'; 
            }
            if (subEl) {
                subEl.innerHTML = m.title;
            }
        } else {
            if (lockEl) lockEl.style.display = 'none';
            if (btnFocus) btnFocus.disabled = false;
            if (btnIncub) btnIncub.disabled = false;
            if (titleEl) { 
                titleEl.textContent = m.title; 
                titleEl.style.color = 'white'; 
            }
            if (subEl) {
                subEl.innerHTML = currentModeIndex === 2 ? `Настрой редкость <span style="font-size:10px;">(${customEggConfig.target})</span>` : m.sub;
            }
        }
    }
};

// -------------------------------------------------------------
// ВТОРОЙ СЛОТ (ОФФЛАЙН ИНКУБАТОР)
// -------------------------------------------------------------
window.updateSecondSlotUI = function() {
    const panel = window.getEl('second-slot-panel');
    if (!panel) {
        return;
    }
    
    if (!hasSecondSlot) { 
        panel.style.display = 'none'; 
        return; 
    }
    
    panel.style.display = 'block';

    if (secondSlotEndTime > 0) {
        const now = Date.now();
        if (now >= secondSlotEndTime) {
            window.getEl('second-slot-idle').style.display = 'none';
            window.getEl('second-slot-active').style.display = 'none';
            window.getEl('second-slot-done').style.display = 'block';
            
            if (secondSlotInterval) { 
                clearInterval(secondSlotInterval); 
                secondSlotInterval = null; 
            }
        } else {
            window.getEl('second-slot-idle').style.display = 'none';
            window.getEl('second-slot-active').style.display = 'block';
            window.getEl('second-slot-done').style.display = 'none';
            
            if (!secondSlotInterval) {
                secondSlotInterval = setInterval(() => {
                    const diff = Math.floor((secondSlotEndTime - Date.now()) / 1000);
                    if (diff <= 0) {
                        clearInterval(secondSlotInterval); 
                        secondSlotInterval = null;
                        window.updateSecondSlotUI(); 
                        window.showToast("Яйцо во 2 слоте готово!", "🥚");
                    } else {
                        window.getEl('second-slot-timer').textContent = window.formatTime(diff);
                    }
                }, 1000);
            }
        }
    } else {
        window.getEl('second-slot-idle').style.display = 'block';
        window.getEl('second-slot-active').style.display = 'none';
        window.getEl('second-slot-done').style.display = 'none';
        if (secondSlotInterval) { 
            clearInterval(secondSlotInterval); 
            secondSlotInterval = null; 
        }
    }
};

window.startSecondSlot = function() {
    window.playSound('click'); 
    const m = MODES[currentModeIndex] || MODES[0];
    let time = currentModeIndex === 2 ? customEggConfig.timeOffline : m.timeOffline;
    secondSlotEndTime = Date.now() + (time * 1000);
    window.saveData(); 
    window.updateSecondSlotUI();
};

window.claimSecondSlot = function() {
    window.playSound('win'); 
    secondSlotEndTime = 0;
    
    let leg = 5; 
    let rare = 30; 
    let pool;
    const rnd = Math.random() * 100;
    
    if (rnd < leg) {
        pool = petDatabase.legendary;
    } else if (rnd < leg + rare) {
        pool = petDatabase.rare;
    } else {
        pool = petDatabase.common;
    }
    
    const dropped = pool[Math.floor(Math.random() * pool.length)];
    collection.push(dropped); 
    
    window.saveData(); 
    window.updateBalanceUI();
    window.showToast(`Слот 2: Получен ${PET_NAMES[dropped]}!`, "🎉");
    window.fireConfetti(); 
    window.updateSecondSlotUI();
};

window.checkBackgroundHatch = function() {
    const hatchEndTime = parseInt(localStorage.getItem('hatchEndTime'));
    const savedModeIndex = parseInt(localStorage.getItem('hatchEggType'));
    const savedTarget = localStorage.getItem('hatchTarget');
    
    if (hatchEndTime) {
        currentModeIndex = isNaN(savedModeIndex) ? 0 : savedModeIndex;
        if (savedTarget) {
            customEggConfig.target = savedTarget;
        }
        
        const now = Date.now();
        if (now >= hatchEndTime) {
            timeLeft = 0; 
            window.finishTimer(true); 
            localStorage.removeItem('hatchEndTime'); 
            window.showToast("Яйцо из инкубатора готово!", "🤖");
        } else {
            timeLeft = Math.round((hatchEndTime - now) / 1000); 
            window.startTimer('offline', true); 
        }
    }
};

window.startTimer = function(mode, isResuming = false) {
    const m = MODES[currentModeIndex] || MODES[0];
    
    if (m.id === 'radio' && !activeBoosters.bio && !isResuming) {
        window.showToast("Нужна Биодобавка! 💉", "⚠️");
        return;
    }
    
    if (m.id === 'anomal' && !isResuming) {
        const day = new Date().getDay();
        const isWeekend = (day === 6 || day === 0);
        if (!isWeekend) {
            window.showToast("Доступно только в выходные!", "❌");
            return;
        }
        if (dustBalance < 50) {
            window.showToast("Нужно 50 Пыли (✨) для запуска!", "❌");
            return;
        }
        dustBalance -= 50;
        window.updateBalanceUI();
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
            if (currentModeIndex === 0 && mode === 'online') {
                baseTime = 20 * 60; 
            }
            else if (currentModeIndex === 1 && mode === 'online') {
                baseTime = 45 * 60;
            }
            else {
                baseTime = Math.floor(baseTime * 0.7); 
            }
            
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
            window.saveData();
        }
    }
    
    isRunning = true;
    let timerEl = window.getEl('timer'); 
    if (timerEl) {
        timerEl.textContent = window.formatTime(timeLeft);
    }
    
    let sbc = window.getEl('start-buttons-container'); 
    if (sbc) {
        sbc.style.display = 'none';
    }
    
    let mb = window.getEl('main-btn'); 
    if (mb) { 
        mb.style.display = 'block'; 
        mb.textContent = "Сдаться"; 
        mb.className = "btn stop"; 
    }
    
    let sb = window.getEl('share-btn'); 
    if (sb) {
        sb.style.display = 'none';
    }
    
    let pb = window.getEl('prev-btn'); 
    if (pb) {
        pb.style.visibility = 'hidden';
    }
    
    let nb = window.getEl('next-btn'); 
    if (nb) {
        nb.style.visibility = 'hidden';
    }
    
    let hi = window.getEl('hatched-info'); 
    if (hi) {
        hi.style.display = 'none';
    }
    
    let ceb = window.getEl('custom-egg-btn'); 
    if (ceb) {
        ceb.style.display = 'none';
    }
    
    let ow = window.getEl('offline-warning'); 
    if (ow) { 
        if (mode === 'online') {
            ow.style.display = 'block'; 
        }
        else {
            ow.style.display = 'none'; 
        }
    }

    if (!isResuming) {
        let egg = window.getEl('egg-display');
        if (egg) {
            if (m.egg === 'diamond') {
                egg.src = 'assets/eggs/egg-diamond.png';
            }
            else {
                window.applyEggSkin();
            }
        }
        let co = window.getEl('crack-overlay'); 
        if (co) {
            co.className = 'crack-overlay'; 
        }
    }
    
    let egg = window.getEl('egg-display'); 
    if (egg) {
        egg.className = 'egg-img shaking'; 
    }
    
    window.renderBoostersPanel();
    
    const totalTime = isResuming ? timeLeft : baseTime; 
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeLeft--; 
        let t = window.getEl('timer'); 
        if (t) {
            t.textContent = window.formatTime(timeLeft);
        }
        
        const progress = 1 - (timeLeft / totalTime);
        const overlay = window.getEl('crack-overlay');
        
        if (overlay) {
            if (progress > 0.25 && progress < 0.5) {
                overlay.className = 'crack-overlay crack-stage-1';
            }
            else if (progress >= 0.5 && progress < 0.75) {
                overlay.className = 'crack-overlay crack-stage-2';
            }
            else if (progress >= 0.75) {
                overlay.className = 'crack-overlay crack-stage-3';
            }
        }
        
        if (timeLeft <= 0) {
            window.finishTimer();
        }
    }, 1000);
};

window.stopTimer = function(failed = false) {
    clearInterval(timerInterval); 
    isRunning = false;
    
    if (failed) {
        let rm = window.getEl('resurrect-modal'); 
        if (rm) {
            rm.style.display = 'flex';
        }
        
        let resTime = 20; 
        let rt = window.getEl('resurrect-timer'); 
        if (rt) {
            rt.textContent = resTime;
        }
        
        if (resurrectCountdownInterval) {
            clearInterval(resurrectCountdownInterval);
        }
        
        resurrectCountdownInterval = setInterval(() => {
            resTime--;
            if (rt) {
                rt.textContent = resTime;
            }
            
            if (resTime <= 0) {
                window.confirmFail(true);
            }
        }, 1000);
    } else {
        window.confirmFail(false);
    }
};

window.resurrectEgg = function() {
    if (userStars >= 20) {
        userStars -= 20;
        window.saveData();
        window.updateBalanceUI();
        
        clearInterval(resurrectCountdownInterval);
        let rm = window.getEl('resurrect-modal'); 
        if (rm) {
            rm.style.display = 'none';
        }
        
        window.showToast("Яйцо спасено! Продолжаем фокус.", "✨");
        
        window.startTimer(currentHatchMode, true);
    } else {
        window.showToast("Недостаточно Звезд!", "❌");
        window.openBuyStarsModal();
    }
};

window.confirmFail = function(wasInterrupted = true) {
    clearInterval(resurrectCountdownInterval);
    let rm = window.getEl('resurrect-modal'); 
    if (rm) {
        rm.style.display = 'none';
    }
    
    localStorage.removeItem('hatchEndTime'); 
    let mb = window.getEl('main-btn'); 
    if (mb) {
        mb.style.display = 'none'; 
    }
    
    let sbc = window.getEl('start-buttons-container'); 
    if (sbc) {
        sbc.style.display = 'flex';
    }
    
    let pb = window.getEl('prev-btn'); 
    if (pb) {
        pb.style.visibility = 'visible'; 
    }
    
    let nb = window.getEl('next-btn'); 
    if (nb) {
        nb.style.visibility = 'visible';
    }
    
    let ow = window.getEl('offline-warning'); 
    if (ow) {
        ow.style.display = 'none';
    }
    
    const eggDisplay = window.getEl('egg-display'); 
    if (eggDisplay) { 
        eggDisplay.className = 'egg-img'; 
        eggDisplay.classList.remove('shaking'); 
    }
    
    let co = window.getEl('crack-overlay'); 
    if (co) {
        co.className = 'crack-overlay'; 
    }
    
    let hi = window.getEl('hatched-info'); 
    if (hi) {
        hi.style.display = 'none';
    }
    
    window.updateUI(); 
    window.renderBoostersPanel();
    
    if (wasInterrupted) { 
        window.showToast("Яйцо разбито...", "❌"); 
        window.playSound('click'); 
    } else { 
        window.showToast("Выращивание отменено", "⚠️"); 
    }
};

window.finishTimer = function(fromOffline = false) {
    clearInterval(timerInterval); 
    isRunning = false; 
    localStorage.removeItem('hatchEndTime');
    
    let ow = window.getEl('offline-warning'); 
    if (ow) {
        ow.style.display = 'none'; 
    }
    
    let mb = window.getEl('main-btn'); 
    if (mb) {
        mb.style.display = 'none';
    }
    
    let sbc = window.getEl('start-buttons-container'); 
    if (sbc) {
        sbc.style.display = 'flex'; 
    }
    
    let sb = window.getEl('share-btn'); 
    if (sb) {
        sb.style.display = 'block'; 
    }
    
    let pb = window.getEl('prev-btn'); 
    if (pb) {
        pb.style.visibility = 'visible'; 
    }
    
    let nb = window.getEl('next-btn'); 
    if (nb) {
        nb.style.visibility = 'visible';
    }
    
    let co = window.getEl('crack-overlay'); 
    if (co) {
        co.className = 'crack-overlay';
    }

    const m = MODES[currentModeIndex] || MODES[0]; 
    let baseXP = m.xpReward;
    
    let avatarBonus = 0;
    if (selectedAvatar === 'god') {
        avatarBonus = 0.75;
    } else {
        let r = window.getPetRarity(selectedAvatar);
        if (r === 'mythic') avatarBonus = 0.50;
        else if (r === 'legendary') avatarBonus = 0.35;
        else if (r === 'mutant' || r === 'glitch') avatarBonus = 0.20; 
        else if (r === 'rare') avatarBonus = 0.10;
        else avatarBonus = 0.0;
    }

    const todayStr = new Date().toDateString();
    if (lastHatchDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastHatchDate === yesterday.toDateString()) {
            hatchStreak++; 
        } else {
            hatchStreak = 1; 
        }
        lastHatchDate = todayStr;
    } else if (hatchStreak === 0) {
        hatchStreak = 1; 
    }
    
    let streakMult = 1.0;
    if (hatchStreak >= 7) {
        streakMult = 1.5;
    } else if (hatchStreak >= 5) {
        streakMult = 1.3;
    } else if (hatchStreak >= 3) {
        streakMult = 1.2;
    }

    let vipMult = window.isVip() ? 1.2 : 1;
    
    let finalXP = Math.floor((baseXP + (baseXP * avatarBonus)) * streakMult * vipMult);
    userXP += finalXP; 
    
    let timeOnlineBase = (currentModeIndex === 2) ? customEggConfig.timeOnline : m.timeOnline;
    focusHours += (timeOnlineBase / 3600);
    
    let synMinutes = Math.max(1, Math.floor(timeOnlineBase / 60));
    window.sendSyndicateMinutes(synMinutes);
    
    while (userXP >= userLevel * 200) { 
        userXP -= userLevel * 200; 
        userLevel++; 
        window.showToast(`Lvl UP: ${userLevel} 🏆`, "🎉"); 
        window.playSound('win'); 
    }
    
    localStorage.setItem('userXP', userXP); 
    localStorage.setItem('userLevel', userLevel); 
    window.updateLevelUI();
    userStats.hatched++;

    window.apiSyncGlobalProfile();
    window.updateContract('hatch', 1); 
    
    let pool;
    
    if (m.id === 'radio' || activeBoosters.bio) {
        pool = petDatabase.mutant;
        window.playSound('legendary'); 
    } 
    else if (m.id === 'alien') {
        if (Math.random() < 0.10) {
            pool = petDatabase.mythic;
        } else {
            pool = petDatabase.legendary;
        }
        window.playSound('legendary');
    }
    else if (m.id === 'anomal') {
        pool = petDatabase.glitch;
        window.playSound('legendary');
    }
    else if (currentModeIndex === 2 && customEggConfig.target !== 'all') {
        if (fromOffline && customEggConfig.target === 'legendary') {
            pool = petDatabase.rare;
            window.playSound('win');
            window.showToast("В оффлайне легендарки не выпадают!", "⚠️");
        } else {
            pool = petDatabase[customEggConfig.target]; 
            window.playSound(customEggConfig.target === 'legendary' ? 'legendary' : 'win');
        }
    } else {
        let leg = m.id === 'short' ? 1 : 5; 
        let rare = m.id === 'short' ? 15 : 30;
        
        if (activeBoosters.luck) { 
            leg *= 5; 
            myBoosters.luck--; 
            activeBoosters.luck = false; 
        }
        
        if (fromOffline) {
            rare += leg; 
            leg = 0; 
        }

        const rnd = Math.random() * 100;
        if (rnd < leg) { 
            pool = petDatabase.legendary; 
            window.playSound('legendary'); 
        } else if (rnd < leg + rare) { 
            pool = petDatabase.rare; 
            window.playSound('win'); 
        } else { 
            pool = petDatabase.common; 
            window.playSound('win'); 
        }
    }
    
    const dropped = pool[Math.floor(Math.random() * pool.length)]; 
    collection.push(dropped); 
    window.saveData();
    
    const eggDisplay = window.getEl('egg-display');
    if (eggDisplay) {
        eggDisplay.src = `assets/pets/pet-${dropped}.png`; 
        eggDisplay.className = `hatched-img ${window.getPetRarity(dropped)}`;
    }
    
    const infoBox = window.getEl('hatched-info'); 
    let hn = window.getEl('hatched-name'); 
    if (hn) {
        hn.textContent = PET_NAMES[dropped] || "Питомец";
    }
    
    const rarityElem = window.getEl('hatched-rarity'); 
    if (rarityElem) { 
        rarityElem.textContent = window.getPetRarity(dropped); 
        rarityElem.className = window.getPetRarity(dropped); 
    }
    
    if (infoBox) {
        infoBox.style.display = 'block';
    }
    
    window.fireConfetti(); 
    
    let streakMsg = hatchStreak > 1 ? ` (Стрик x${streakMult})` : '';
    window.showToast(`Получено +${window.formatNumber(finalXP)} XP${streakMsg}`, "🐣"); 
    window.updateBalanceUI();
    
    if (isVibrationOn && window.navigator.vibrate) {
        window.navigator.vibrate(200);
    }
};

// =============================================================
// 9. МУЛЬТИПЛЕЕР И ПАТИ (ИНТЕГРАЦИЯ)
// =============================================================

window.openPartyModal = function() {
    let psv = window.getEl('party-setup-view'); 
    let pav = window.getEl('party-active-view');
    
    if (currentPartyCode) { 
        if (psv) {
            psv.style.display = 'none'; 
        }
        if (pav) {
            pav.style.display = 'block'; 
        }
        window.startPartyPolling(); 
    } 
    else { 
        if (psv) {
            psv.style.display = 'block'; 
        }
        if (pav) {
            pav.style.display = 'none'; 
        }
    }
    
    window.openModal('party-modal');
};

window.apiCreateParty = async function(event) {
    window.playSound('click'); 
    const btn = event ? event.target : window.getEl('create-party-btn'); 
    
    if (btn) {
        btn.textContent = "Создаем сервер...";
    }
    
    const user = window.getTgUser(); 
    let finalName = user.name; 
    
    if (window.isVip()) {
        finalName += ' 👑';
    }
    
    try {
        const res = await fetch(`${API_URL}/party/create`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                user_id: user.id, 
                name: finalName, 
                avatar: selectedAvatar, 
                egg_skin: activeEggSkin, 
                equipped_title: equippedTitle 
            }) 
        });
        
        const data = await res.json();
        currentPartyCode = data.partyCode; 
        
        let cpc = window.getEl('current-party-code'); 
        if (cpc) {
            cpc.textContent = currentPartyCode;
        }
        
        let psv = window.getEl('party-setup-view'); 
        if (psv) {
            psv.style.display = 'none'; 
        }
        
        let pav = window.getEl('party-active-view'); 
        if (pav) {
            pav.style.display = 'block';
        }
        
        window.showToast("Пати создано! Ты лидер 👑", "🎮");
        
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('joinRoom', { roomId: currentPartyCode });
        }
        window.startPartyPolling();
        
    } catch (e) { 
        window.showToast("Ошибка сервера", "❌"); 
    }
    
    if (btn) {
        btn.textContent = "Создать Пати";
    }
};

window.apiJoinParty = async function(prefilledCode = null) {
    window.playSound('click'); 
    const input = window.getEl('party-code-input'); 
    const code = prefilledCode || (input ? input.value.trim() : '');
    
    if (code.length < 4) {
        return window.showToast("Неверный код", "❌");
    }
    
    const user = window.getTgUser(); 
    let finalName = user.name; 
    if (window.isVip()) {
        finalName += ' 👑';
    }
    
    try {
        const res = await fetch(`${API_URL}/party/join`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                code: code, 
                user_id: user.id, 
                name: finalName, 
                avatar: selectedAvatar, 
                egg_skin: activeEggSkin, 
                equipped_title: equippedTitle 
            }) 
        });
        
        if (res.ok) {
            currentPartyCode = code; 
            
            let cpc = window.getEl('current-party-code'); 
            if (cpc) {
                cpc.textContent = currentPartyCode;
            }
            
            let psv = window.getEl('party-setup-view'); 
            if (psv) {
                psv.style.display = 'none'; 
            }
            
            let pav = window.getEl('party-active-view'); 
            if (pav) {
                pav.style.display = 'block';
            }
            
            window.showToast("Успешный вход!", "✅");
            
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('joinRoom', { roomId: currentPartyCode });
            }
            window.startPartyPolling();
        } else {
            window.showToast("Пати не найдено", "❌");
        }
    } catch(e) { 
        window.showToast("Ошибка соединения", "❌"); 
    }
};

window.apiLeaveParty = async function(localOnly = false) {
    if (!localOnly) {
        window.playSound('click'); 
    }
    const user = window.getTgUser();
    
    if (!localOnly) { 
        try { 
            await fetch(`${API_URL}/party/leave`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    user_id: user.id, 
                    name: user.name, 
                    avatar: selectedAvatar, 
                    egg_skin: activeEggSkin, 
                    equipped_title: equippedTitle 
                }) 
            }); 
        } catch(e) {} 
    }
    
    currentPartyCode = null; 
    isPartyLeader = false; 
    currentActiveGame = 'none'; 
    isMegaRadarActive = false; 
    
    if (partyPollingInterval) {
        clearInterval(partyPollingInterval); 
    }
    if (bossTimerInterval) {
        clearInterval(bossTimerInterval); 
    }
    if (expeditionInterval) {
        clearInterval(expeditionInterval); 
    }
    if (parasiteInterval) {
        clearInterval(parasiteInterval); 
    }
    if (bonusSpawningInterval) {
        clearInterval(bonusSpawningInterval);
    }
    
    ['boss-raid-modal', 'quantum-reactor-modal', 'expedition-modal'].forEach(m => { 
        if (modalStack.includes(m)) {
            window.closeModal(m); 
        }
    });
    
    let psv = window.getEl('party-setup-view'); 
    if (psv) {
        psv.style.display = 'block'; 
    }
    
    let pav = window.getEl('party-active-view'); 
    if (pav) {
        pav.style.display = 'none'; 
    }
    
    let rgb = window.getEl('return-game-btn'); 
    if (rgb) {
        rgb.style.display = 'none';
    }
};

window.renderPartyPlayers = function(players) {
    const container = window.getEl('party-players-list'); 
    if (!container) {
        return; 
    }
    
    container.innerHTML = ''; 
    const header = window.getEl('party-players-header'); 
    
    if (header && players.length) {
        header.innerHTML = `Игроки: <span id="leader-badge" style="color: #ffd700; font-size: 12px; display: ${isPartyLeader ? 'inline' : 'none'};">(Вы Лидер 👑)</span>`;
    }
    
    players.forEach(p => { 
        let titleHtml = p.equipped_title ? `<span class="player-title">${p.equipped_title}</span>` : '';
        container.innerHTML += `
            <div class="player-slot">
                <div class="player-avatar-circle">
                    <img src="assets/pets/pet-${p.avatar}.png" onerror="this.src='assets/eggs/egg-default.png'">
                </div>
                <div style="flex:1;">
                    <div class="player-name">${titleHtml}${p.name}</div>
                </div>
            </div>
        `; 
    });
};

window.startPartyPolling = function() {
    if (partyPollingInterval) {
        clearInterval(partyPollingInterval);
    }
    
    partyPollingInterval = setInterval(async () => {
        if (!currentPartyCode) {
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/party/status/${currentPartyCode}`);
            
            if (res.status === 404) { 
                window.showToast("Пати распущено", "⚠️"); 
                window.apiLeaveParty(true); 
                return; 
            }
            
            const data = await res.json();
            isPartyLeader = (window.getTgUser().id === data.leader_id); 
            currentPartyPlayersData = data.players; 
            isMegaRadarActive = data.mega_radar === 1; 
            
            window.renderPartyPlayers(data.players); 
            window.updatePartyUI();
            
            if (data.active_game !== 'none' && currentActiveGame === 'none') { 
                currentActiveGame = data.active_game; 
                window.forceOpenMiniGame(currentActiveGame); 
            } 
            else if (data.active_game === 'none' && currentActiveGame !== 'none') { 
                window.forceCloseMiniGame(currentActiveGame); 
                currentActiveGame = 'none'; 
            } 
            else { 
                currentActiveGame = data.active_game; 
            }
            
            if (modalStack.includes('boss-raid-modal')) { 
                window.updateBossRaidUI(data.boss_hp, data.boss_max_hp, data.players); 
                if (data.boss_hp <= 0 && !bossIsDead && currentActiveGame === 'tap_boss') {
                    window.handleBossRaidEnd(); 
                }
            }
            
            if (modalStack.includes('expedition-modal')) { 
                window.updateExpeditionUI(data.expedition_end, data.expedition_score, data.expedition_location, data.wolf_hp, data.wolf_max_hp, data.server_time); 
            }
            
        } catch(e) {}
    }, 2000);
};

window.updatePartyUI = function() {
    let plc = window.getEl('party-leader-controls'); 
    let pmc = window.getEl('party-member-controls'); 
    let cgb = window.getEl('cancel-game-btn'); 
    let rgb = window.getEl('return-game-btn');
    
    if (isPartyLeader) {
        if (plc) {
            plc.style.display = 'block'; 
        }
        if (pmc) {
            pmc.style.display = 'none';
        }
        
        if (currentActiveGame !== 'none') { 
            if (cgb) {
                cgb.style.display = 'block'; 
            }
            if (plc) { 
                plc.style.opacity = '0.5'; 
                plc.style.pointerEvents = 'none'; 
            } 
        } 
        else { 
            if (cgb) {
                cgb.style.display = 'none'; 
            }
            if (plc) { 
                plc.style.opacity = '1'; 
                plc.style.pointerEvents = 'auto'; 
            } 
        }
    } else {
        if (plc) {
            plc.style.display = 'none'; 
        }
        if (cgb) {
            cgb.style.display = 'none';
        }
        
        if (pmc) { 
            pmc.style.display = 'block'; 
            if (currentActiveGame !== 'none') {
                pmc.innerHTML = `Игра "<b>${window.getGameName(currentActiveGame)}</b>" запущена!`; 
            } else {
                pmc.innerHTML = "⏳ Ожидание лидера..."; 
            }
        }
    }
    
    if (currentActiveGame !== 'none' && !modalStack.includes(window.getModalIdForGame(currentActiveGame))) { 
        if (rgb) {
            rgb.style.display = 'block'; 
        }
    } 
    else { 
        if (rgb) {
            rgb.style.display = 'none'; 
        }
    }
};

window.getGameName = function(type) { 
    if (type === 'tap_boss') return "Зараженное Яйцо"; 
    if (type === 'quantum_reactor') return "Квантовый Реактор"; 
    if (type === 'expedition') return "Экспедиция"; 
    return "Неизвестно"; 
};

window.getModalIdForGame = function(type) { 
    if (type === 'tap_boss') return 'boss-raid-modal'; 
    if (type === 'quantum_reactor') return 'quantum-reactor-modal'; 
    if (type === 'expedition') return 'expedition-modal'; 
    return ''; 
};

window.requestStartMiniGame = async function(gameType) {
    if (!isPartyLeader) {
        return; 
    }
    
    window.playSound('click');
    
    try {
        const res = await fetch(`${API_URL}/party/set_game`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: window.getTgUser().id, game_name: gameType }) 
        });
        
        if (res.ok) { 
            currentActiveGame = gameType; 
            window.forceOpenMiniGame(gameType); 
            window.updatePartyUI(); 
        }
    } catch(e) { 
        window.showToast("Ошибка сервера", "❌"); 
    }
};

window.requestStopMiniGame = async function() {
    if (!isPartyLeader) {
        return; 
    }
    
    window.playSound('click');
    
    try {
        await fetch(`${API_URL}/party/set_game`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: window.getTgUser().id, game_name: 'none' }) 
        });
        
        window.forceCloseMiniGame(currentActiveGame); 
        currentActiveGame = 'none'; 
        window.updatePartyUI();
    } catch(e) {}
};

window.forceOpenMiniGame = function(gameType) {
    let modalId = window.getModalIdForGame(gameType);
    
    if (gameType === 'tap_boss') { 
        bossTimeLeft = 60; 
        bossIsDead = false; 
        isStunned = false;
        
        let so = window.getEl('stun-overlay'); 
        if (so) {
            so.style.display = 'none';
        }
        
        let pc = window.getEl('parasites-container'); 
        if (pc) {
            pc.innerHTML = '';
        }
        
        if (bossTimerInterval) {
            clearInterval(bossTimerInterval);
        }
        
        bossTimerInterval = setInterval(() => {
            bossTimeLeft -= 0.1; 
            const timerEl = window.getEl('raid-timer'); 
            
            if (timerEl) {
                timerEl.textContent = bossTimeLeft.toFixed(1);
            }
            
            if (bossTimeLeft <= 0 && !bossIsDead) { 
                clearInterval(bossTimerInterval); 
                
                if (parasiteInterval) {
                    clearInterval(parasiteInterval); 
                }
                window.handleBossRaidEnd(); 
            }
        }, 100);
        
        if (parasiteInterval) {
            clearInterval(parasiteInterval);
        }
        
        parasiteInterval = setInterval(window.spawnParasite, 2500); 
    }
    
    if (gameType === 'quantum_reactor') { 
        window.openModal('quantum-reactor-modal'); 
        let testRole = isPartyLeader ? 'dispatcher' : 'engineer'; 
        window.setupReactorRole(testRole, ['🔴', '🔵', '🟢', '🟡']); 
    }
    
    if (gameType === 'expedition') {
        window.calculatePreStartSynergy(); 
        
        if (isPartyLeader) { 
            let locSel = window.getEl('leader-location-selector'); 
            if (locSel) {
                locSel.style.display = 'flex'; 
            }
            if (!currentExpeditionLocation) {
                window.selectExpeditionLocation('forest'); 
            }
        } 
        else { 
            let locSel = window.getEl('leader-location-selector'); 
            if (locSel) {
                locSel.style.display = 'none'; 
            }
        }
    }
    
    if (modalId && !modalStack.includes(modalId)) {
        window.openModal(modalId);
    }
};

window.forceCloseMiniGame = function(gameType) {
    let modalId = window.getModalIdForGame(gameType);
    
    if (bossTimerInterval) { 
        clearInterval(bossTimerInterval); 
        bossTimerInterval = null; 
    }
    
    if (parasiteInterval) { 
        clearInterval(parasiteInterval); 
        parasiteInterval = null; 
    }
    
    if (bonusSpawningInterval) { 
        clearInterval(bonusSpawningInterval); 
        bonusSpawningInterval = null; 
    }
    
    if (expeditionInterval) { 
        clearInterval(expeditionInterval); 
        expeditionInterval = null; 
    }
    
    if (modalId && modalStack.includes(modalId)) { 
        window.closeModal(modalId); 
        window.showToast("Лидер завершил игру", "ℹ️"); 
    }
};

// =============================================================
// БОСС РЕЙД (ВНУТРЕННИЕ ФУНКЦИИ)
// =============================================================

window.spawnParasite = function() {
    if (bossTimeLeft <= 0 || bossIsDead || isStunned) {
        return;
    }
    
    const c = window.getEl('parasites-container'); 
    if (!c) {
        return;
    }
    
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
        window.playSound('click'); 
        p.remove(); 
    };
    
    c.appendChild(p);
    
    setTimeout(() => { 
        if (!clicked && p.parentNode) { 
            p.remove(); 
            window.triggerStun(); 
        } 
    }, 2000);
};

window.triggerStun = function() {
    if (isStunned) {
        return; 
    }
    
    isStunned = true; 
    window.playSound('click'); 
    window.showToast("ОГЛУШЕНИЕ!", "🤢");
    
    const overlay = window.getEl('stun-overlay'); 
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    const modalContent = document.querySelector('#boss-raid-modal .modal-content'); 
    if (modalContent) {
        modalContent.classList.add('shake-hard');
    }
    
    setTimeout(() => { 
        isStunned = false; 
        
        if (overlay) {
            overlay.style.display = 'none'; 
        }
        
        if (modalContent) {
            modalContent.classList.remove('shake-hard'); 
        }
    }, 3000);
};

window.tapRaidBoss = async function(event) {
    if (bossTimeLeft <= 0 || bossIsDead) {
        return;
    }
    
    if (isStunned) {
        return window.showToast("Ты оглушен!", "❌");
    }
    
    window.playSound('click'); 
    let baseDamage = 1; 
    const r = window.getPetRarity(selectedAvatar); 
    
    if (r === 'rare') {
        baseDamage = 5; 
    }
    if (r === 'legendary') {
        baseDamage = 20; 
    }
    if (r === 'mythic' || r === 'mutant') {
        baseDamage = 50;
    }
    
    let stars = petStars[selectedAvatar] || 1; 
    baseDamage = baseDamage * stars;
    
    let isCrit = Math.random() < 0.15; 
    let damage = isCrit ? baseDamage * 2 : baseDamage;
    
    const img = window.getEl('raid-boss-img'); 
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
        } 
        else { 
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
            body: JSON.stringify({ code: currentPartyCode, user_id: window.getTgUser().id, damage: damage }) 
        }); 
        window.updateContract('dmg', damage); 
    } catch(e) {}
};

window.updateBossRaidUI = function(hp, maxHp, players) {
    let hpFill = window.getEl('raid-hp-fill'); 
    let hpText = window.getEl('raid-hp-text');
    
    if (hpFill && hpText) { 
        hpFill.style.width = `${(hp/maxHp)*100}%`; 
        hpText.textContent = `${hp} / ${maxHp} HP`; 
    }
    
    const grid = window.getEl('raid-players-grid'); 
    if (!grid) {
        return; 
    }
    
    grid.innerHTML = ''; 
    const myId = window.getTgUser().id; 
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
};

window.handleBossRaidEnd = function() {
    if (bossIsDead) {
        return; 
    }
    
    bossIsDead = true; 
    
    if (bossTimerInterval) {
        clearInterval(bossTimerInterval); 
    }
    
    if (parasiteInterval) {
        clearInterval(parasiteInterval);
    }
    
    window.playSound('win');
    
    const myId = window.getTgUser().id; 
    const me = currentPartyPlayersData.find(p => p.user_id === myId); 
    let winner = null;
    
    if (currentPartyPlayersData.length > 0) {
        winner = currentPartyPlayersData.reduce((prev, curr) => (prev.boss_hp > curr.boss_hp) ? prev : curr);
    }
    
    let vipMult = window.isVip() ? 1.2 : 1;
    
    if (winner && winner.user_id === myId) { 
        let prize = Math.floor(10000 * vipMult); 
        window.fireConfetti(); 
        window.showToast(`ТЫ MVP! +${window.formatNumber(prize)} монет`, "🏆"); 
        walletBalance += prize; 
    } 
    else { 
        const myDmg = me ? me.boss_hp : 0; 
        const reward = Math.floor(myDmg * 0.5 * vipMult); 
        window.showToast(`Босс повержен! Твоя доля: +${window.formatNumber(reward)} монет`, "💰"); 
        walletBalance += reward; 
    }
    
    window.saveData(); 
    window.updateBalanceUI();
    
    if (isPartyLeader) {
        setTimeout(() => window.requestStopMiniGame(), 4000);
    }
};

// =============================================================
// МИНИ-ИГРА: КВАНТОВЫЙ РЕАКТОР
// =============================================================

window.setupReactorRole = function(role, secretCode = null) {
    let rd = window.getEl('role-dispatcher'); 
    let re = window.getEl('role-engineer'); 
    let rs = window.getEl('role-stabilizer');
    
    if (rd) rd.style.display = 'none'; 
    if (re) re.style.display = 'none'; 
    if (rs) rs.style.display = 'none';
    
    if (role === 'dispatcher') { 
        if (rd) rd.style.display = 'block'; 
        window.renderDispatcherCode(secretCode || ['🔴','🔵','🟢','🟡']); 
    } 
    else if (role === 'engineer') { 
        if (re) re.style.display = 'block'; 
        requiredCodeLength = secretCode ? secretCode.length : 4; 
        window.reactorClearInput(); 
    }
    else if (role === 'stabilizer') { 
        if (rs) rs.style.display = 'block'; 
    }
};

window.renderDispatcherCode = function(codeArray) {
    const container = window.getEl('dispatcher-secret-code'); 
    if (!container) return; 
    
    container.innerHTML = '';
    
    codeArray.forEach(gene => { 
        const span = document.createElement('span'); 
        span.textContent = gene; 
        span.style.animation = "popIn 0.3s ease"; 
        container.appendChild(span); 
    });
};

window.renderEngineerSlots = function() {
    const container = window.getEl('engineer-input-slots'); 
    if (!container) return; 
    
    container.innerHTML = '';
    
    for (let i = 0; i < requiredCodeLength; i++) {
        const slot = document.createElement('div'); 
        slot.style.width = '40px'; 
        slot.style.height = '40px'; 
        slot.style.border = '2px dashed #555'; 
        slot.style.borderRadius = '8px'; 
        slot.style.display = 'flex'; 
        slot.style.justifyContent = 'center'; 
        slot.style.alignItems = 'center'; 
        slot.style.fontSize = '24px';
        
        if (engineerCurrentInput[i]) { 
            slot.textContent = engineerCurrentInput[i]; 
            slot.style.border = '2px solid #00A3FF'; 
            slot.style.background = 'rgba(0, 163, 255, 0.1)'; 
        }
        container.appendChild(slot);
    }
};

window.reactorTypeGene = function(gene) {
    if (engineerCurrentInput.length >= requiredCodeLength) {
        return;
    }
    
    if (typeof playSound === 'function') {
        window.playSound('click');
    }
    
    engineerCurrentInput.push(gene); 
    window.renderEngineerSlots();
    
    if (engineerCurrentInput.length === requiredCodeLength) {
        socket.emit('submitCode', { roomId: currentPartyCode, code: engineerCurrentInput });
        window.showToast("Код отправлен на проверку...", "📡");
    }
};

window.reactorClearInput = function() { 
    engineerCurrentInput = []; 
    window.renderEngineerSlots(); 
    window.playSound('click'); 
};

window.triggerReactorPenalty = function() {
    const overlay = window.getEl('reactor-danger-overlay'); 
    if (overlay) { 
        overlay.style.display = 'block'; 
        setTimeout(() => overlay.style.display = 'none', 1000); 
    }
    window.playSound('wrong'); 
    window.reactorClearInput();
};

window.handleReactorEnd = function(result) {
    window.forceCloseMiniGame('quantum_reactor');
    
    if (result === 'win') { 
        window.playSound('win'); 
        window.showToast("РЕАКТОР СТАБИЛИЗИРОВАН! +5000 Монет", "⚛️"); 
        walletBalance += 5000; 
        
        // === ИНКРЕМЕНТ ПОБЕД В РЕАКТОРЕ ===
        reactorWins++;
        
    } else { 
        window.playSound('wrong'); 
        window.showToast("ВЗРЫВ! Реактор уничтожен", "💥"); 
    }
    
    window.saveData(); 
    window.updateBalanceUI();
};

socket.on('timerUpdate', (timeLeft) => {
    const timerEl = document.getElementById('reactor-timer');
    if (timerEl) {
        timerEl.textContent = timeLeft.toFixed(1);
        if (timeLeft <= 10) {
            timerEl.style.color = '#ff3b30';
        } else {
            timerEl.style.color = '#fff';
        }
    }
});

socket.on('correctCode', (data) => {
    window.reactorClearInput(); 
    window.playSound('win');
    
    const progressText = document.getElementById('reactor-progress-text');
    const progressBar = document.getElementById('reactor-progress-bar');
    
    if (progressText) {
        progressText.textContent = data.progress;
    }
    if (progressBar) {
        progressBar.style.width = `${(data.progress / 3) * 100}%`;
    }
    
    if (document.getElementById('role-dispatcher').style.display === 'block') {
        window.renderDispatcherCode(data.newCode);
    }
    
    window.showToast("Код подошел! Продолжаем!", "✅");
});

socket.on('wrongCode', (data) => {
    window.triggerReactorPenalty(); 
    window.showToast("-5 секунд за ошибку!", "❌");
    
    const timerEl = document.getElementById('reactor-timer');
    if (timerEl) {
        timerEl.textContent = data.newTimeLeft.toFixed(1);
    }
});

socket.on('gameWon', () => {
    window.handleReactorEnd('win'); 
});

socket.on('gameOver', () => {
    window.handleReactorEnd('lose'); 
});

// =============================================================
// МИНИ-ИГРА: ЭКСПЕДИЦИЯ
// =============================================================
window.selectExpeditionLocation = function(loc) {
    currentExpeditionLocation = loc;
    document.querySelectorAll('#leader-location-selector .tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    let btn = window.getEl(`loc-btn-${loc}`); 
    if (btn) {
        btn.classList.add('active');
    }
    
    const scene = window.getEl('expedition-scene'); 
    if (scene) {
        scene.className = `expedition-scene ${loc}-bg`;
    }
};

window.calculatePreStartSynergy = function() {
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
    if (farm_count >= 3) { 
        score = Math.floor(score * 1.5); 
        synergyText.push("🌾 Ферма (+50% лута)"); 
    }
    if (pred_count >= 2) { 
        synergyText.push("🐾 Хищники (-15% времени)"); 
    }
    if (magic_count >= 1) { 
        synergyText.push("✨ Магия (Выше шанс Осколка)"); 
    }

    let scoreEl = window.getEl('expedition-pre-score'); 
    let synEl = window.getEl('synergy-display');
    
    if (scoreEl) {
        scoreEl.textContent = score;
    }
    if (synEl) {
        synEl.innerHTML = synergyText.length > 0 ? `Активные баффы: ${synergyText.join(', ')}` : 'Соберите синергию петов!';
    }
};

window.buyMegaRadar = async function() {
    if (userStars < 5) { 
        window.showToast("Нужно 5 Звезд!", "❌"); 
        window.openBuyStarsModal(); 
        return; 
    }
    
    window.playSound('money'); 
    userStars -= 5; 
    window.saveData(); 
    window.updateBalanceUI(); 
    window.showToast("Мега-Радар активирован!", "📡");
    
    try { 
        await fetch(`${API_URL}/party/radar`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        }); 
    } catch(e) {}
};

window.startExpedition = async function() {
    window.playSound('click'); 
    const btn = window.getEl('expedition-start-btn'); 
    if (btn) { 
        btn.disabled = true; 
        btn.textContent = "Отправляем..."; 
    }
    
    if (!currentExpeditionLocation) {
        currentExpeditionLocation = 'forest';
    }
    
    try {
        const res = await fetch(`${API_URL}/party/expedition/start`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, location: currentExpeditionLocation }) 
        });
        
        if (!res.ok) { 
            window.showToast("Ошибка БД! Пересоздайте пати!", "❌"); 
        } else { 
            window.showToast("Отряд выдвинулся в путь!", "🗺️"); 
        }
    } catch(e) { 
        window.showToast("Сбой сети", "❌"); 
    }
    
    if (btn) { 
        btn.disabled = false; 
        btn.textContent = "Отправить отряд"; 
    }
};

window.updateTimerVisuals = function(seconds) {
    let timerEl = window.getEl('expedition-timer'); 
    if (!timerEl) return;
    
    if (seconds <= 0) { 
        timerEl.textContent = "00:00:00"; 
    } else {
        let h = Math.floor(seconds / 3600).toString().padStart(2, '0'); 
        let m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0'); 
        let s = (seconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
    }
};

window.updateExpeditionUI = function(serverEndTime, score, loc, wolfHp, wolfMaxHp, serverTime) {
    const scene = window.getEl('expedition-scene'); 
    const petsContainer = window.getEl('expedition-pets-container'); 
    const wolfOverlay = window.getEl('wolf-overlay');
    const infoView = window.getEl('expedition-info-view'); 
    const activeView = window.getEl('expedition-active-view'); 
    const claimBtn = window.getEl('expedition-claim-btn');
    const timerEl = window.getEl('expedition-timer'); 
    const locSelector = window.getEl('leader-location-selector'); 
    const radarBadge = window.getEl('mega-radar-badge');
    
    if (!infoView || !activeView || !timerEl) {
        return; 
    }

    const safeWolfHp = wolfHp || 0; 
    const safeWolfMaxHp = wolfMaxHp || 1; 
    currentWolfHp = safeWolfHp;
    
    const sTime = serverTime || Math.floor(Date.now() / 1000);
    const isLobby = !serverEndTime || serverEndTime === 0;
    let secondsLeft = 0; 
    
    if (!isLobby) {
        secondsLeft = serverEndTime - sTime;
    }
    
    const isFinished = !isLobby && secondsLeft <= 0; 
    const isActive = !isLobby && secondsLeft > 0;

    if (radarBadge) {
        radarBadge.style.display = isMegaRadarActive ? 'block' : 'none';
    }

    let targetLoc = 'forest'; 
    if (isLobby) {
        targetLoc = currentExpeditionLocation || 'forest'; 
    } else {
        targetLoc = loc || 'forest';
    }
    
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
        if (scene) {
            scene.classList.remove('scrolling-bg'); 
        }
        if (wolfOverlay) {
            wolfOverlay.style.display = 'none';
        }
        
        let changeBtn = window.getEl('change-expedition-pet-btn'); 
        if (changeBtn) {
            changeBtn.style.display = 'inline-block';
        }
        
        infoView.style.display = 'block'; 
        activeView.style.display = 'none';
        
        let radarBtn = window.getEl('expedition-radar-btn'); 
        if (radarBtn) {
            radarBtn.style.display = isMegaRadarActive ? 'none' : 'block';
        }

        if (isPartyLeader) {
            if (locSelector) locSelector.style.display = 'flex';
            let startBtn = window.getEl('expedition-start-btn'); 
            if (startBtn) startBtn.style.display = 'inline-block';
            let waitMsg = window.getEl('expedition-waiting-msg'); 
            if (waitMsg) waitMsg.style.display = 'none';
        } else {
            if (locSelector) locSelector.style.display = 'none';
            let startBtn = window.getEl('expedition-start-btn'); 
            if (startBtn) startBtn.style.display = 'none';
            let waitMsg = window.getEl('expedition-waiting-msg'); 
            if (waitMsg) waitMsg.style.display = 'block';
        }
        
        window.calculatePreStartSynergy();
        
        if (expeditionInterval) { 
            clearInterval(expeditionInterval); 
            expeditionInterval = null; 
        }
        if (bonusSpawningInterval) { 
            clearInterval(bonusSpawningInterval); 
            bonusSpawningInterval = null; 
        }
        
    } else if (isActive) {
        let changeBtn = window.getEl('change-expedition-pet-btn'); 
        if (changeBtn) {
            changeBtn.style.display = 'none';
        }
        
        if (locSelector) {
            locSelector.style.display = 'none';
        }
        
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        let multEl = window.getEl('expedition-multiplier'); 
        if (multEl) {
            multEl.textContent = score;
        }
        
        if (claimBtn) {
            claimBtn.style.display = 'none';
        }

        if (safeWolfHp > 0) {
            if (wolfOverlay) {
                wolfOverlay.style.display = 'flex';
            }
            let wolfBar = window.getEl('wolf-hp-bar'); 
            if (wolfBar) {
                wolfBar.style.width = `${(safeWolfHp / safeWolfMaxHp) * 100}%`;
            }
            timerEl.style.color = '#ff3b30'; 
            if (scene) scene.classList.remove('scrolling-bg');
            if (bonusSpawningInterval) { 
                clearInterval(bonusSpawningInterval); 
                bonusSpawningInterval = null; 
            }
        } else {
            if (wolfOverlay) wolfOverlay.style.display = 'none';
            timerEl.style.color = '#34c759'; 
            if (scene) scene.classList.add('scrolling-bg');
            if (!bonusSpawningInterval) {
                bonusSpawningInterval = setInterval(window.spawnFlyingBonus, 8000);
            }
        }

        if (currentExpeditionEndTime !== serverEndTime) {
            currentExpeditionEndTime = serverEndTime; 
            let localTargetTime = Math.floor(Date.now() / 1000) + secondsLeft;
            
            if (expeditionInterval) {
                clearInterval(expeditionInterval);
            }
            window.updateTimerVisuals(secondsLeft);
            
            expeditionInterval = setInterval(() => {
                let nowLocal = Math.floor(Date.now() / 1000); 
                let diff = localTargetTime - nowLocal;
                
                if (diff <= 0) {
                    clearInterval(expeditionInterval); 
                    expeditionInterval = null; 
                    timerEl.textContent = "00:00:00";
                    if (currentWolfHp === 0 && claimBtn) {
                        claimBtn.style.display = 'block';
                    }
                    if (scene) {
                        scene.classList.remove('scrolling-bg');
                    }
                    if (bonusSpawningInterval) { 
                        clearInterval(bonusSpawningInterval); 
                        bonusSpawningInterval = null; 
                    }
                } else { 
                    window.updateTimerVisuals(diff); 
                }
            }, 1000);
        }
    } else if (isFinished) {
        currentExpeditionEndTime = 0; 
        if (scene) scene.classList.remove('scrolling-bg'); 
        if (wolfOverlay) wolfOverlay.style.display = 'none';
        
        let changeBtn = window.getEl('change-expedition-pet-btn'); 
        if (changeBtn) changeBtn.style.display = 'none';
        
        if (locSelector) locSelector.style.display = 'none';
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        timerEl.textContent = "00:00:00"; 
        let multEl = window.getEl('expedition-multiplier'); 
        if (multEl) multEl.textContent = score; 
        timerEl.style.color = '#34c759';
        
        if (safeWolfHp === 0 && claimBtn) {
            claimBtn.style.display = 'block';
        }
        
        if (expeditionInterval) { 
            clearInterval(expeditionInterval); 
            expeditionInterval = null; 
        }
        
        if (bonusSpawningInterval) { 
            clearInterval(bonusSpawningInterval); 
            bonusSpawningInterval = null; 
        }
    }
};

window.tapWolf = async function() {
    window.playSound('click'); 
    const img = window.getEl('wolf-img');
    if (img) { 
        img.classList.remove('wolf-hit'); 
        void img.offsetWidth; 
        img.classList.add('wolf-hit'); 
    }
    
    try { 
        await fetch(`${API_URL}/party/expedition/wolf_damage`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, user_id: window.getTgUser().id, damage: 1 }) 
        }); 
    } catch(e) {}
};

window.spawnFlyingBonus = function() {
    const scene = window.getEl('expedition-scene'); 
    if (!scene || !scene.classList.contains('scrolling-bg')) {
        return;
    }
    
    const b = document.createElement('div'); 
    b.className = 'flying-bonus'; 
    b.textContent = Math.random() > 0.5 ? '🦋' : '💰'; 
    b.style.bottom = (20 + Math.random() * 60) + 'px';
    
    b.onclick = () => { 
        window.playSound('money'); 
        walletBalance += 50; 
        window.saveData(); 
        window.updateBalanceUI(); 
        window.showToast('+50 монет!', 'img'); 
        
        if (b && b.parentNode) {
            b.remove(); 
        }
    };
    
    scene.appendChild(b); 
    
    setTimeout(() => { 
        if (b && b.parentNode) {
            b.remove(); 
        }
    }, 4000);
};

window.claimExpedition = async function() {
    window.playSound('money'); 
    let multEl = window.getEl('expedition-multiplier'); 
    let score = multEl ? parseInt(multEl.textContent) : 1;
    
    let locMultiplier = 100; 
    if (currentExpeditionLocation === 'mountains') locMultiplier = 300; 
    if (currentExpeditionLocation === 'space') locMultiplier = 500; 
    
    let vipMult = window.isVip() ? 1.2 : 1; 
    let radarMult = isMegaRadarActive ? 2 : 1;
    
    let uniqueMutants = new Set(collection.filter(p => petDatabase.mutant.includes(p))).size; 
    let mutantBonus = 1 + (uniqueMutants * 0.05);
    
    let stars = petStars[selectedAvatar] || 1;
    let starBonus = 1 + ((stars - 1) * 0.1); 

    const reward = Math.floor(score * locMultiplier * vipMult * radarMult * mutantBonus * starBonus); 
    
    let magicCount = 0; 
    currentPartyPlayersData.forEach(p => { 
        if (["dragon", "unicorn", "alien"].includes(p.avatar)) {
            magicCount++; 
        }
    });
    
    const sceneClass = window.getEl('expedition-scene') ? window.getEl('expedition-scene').className : '';
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
    window.saveData(); 
    window.updateBalanceUI();
    
    let msgBonus = uniqueMutants > 0 ? ` (Мутанты: +${uniqueMutants*5}%)` : '';
    if (stars > 1) {
        msgBonus += ` (⭐️${stars}: +${(stars-1)*10}%)`;
    }

    if (droppedShard) { 
        window.showToast(`Лут: +${window.formatNumber(reward)} монет${msgBonus} и ОСКОЛОК ПЕГАСА! 🧩`, "💰"); 
        window.fireConfetti(); 
    } else { 
        window.showToast(`Лут собран: +${window.formatNumber(reward)} монет${msgBonus}!`, "💰"); 
    }

    try { 
        await fetch(`${API_URL}/party/expedition/claim`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        }); 
    } catch(e) {}
    
    window.closeModal('expedition-modal'); 
    
    if (isPartyLeader) {
        window.requestStopMiniGame(); 
    }
};

// =============================================================
// ГЛОБАЛЬНЫЙ РЫНОК (MARKET)
// =============================================================
window.openMarketModal = async function() {
    window.playSound('click');
    window.openModal('market-modal');
    window.switchMarketTab('all');
    await window.loadMarket();
};

window.switchMarketTab = function(tab) {
    window.playSound('click');
    currentMarketTab = tab;
    
    document.querySelectorAll('#market-modal .tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    let activeBtn = window.getEl(`market-tab-${tab}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    window.loadMarket();
};

window.loadMarket = async function() {
    const grid = window.getEl('market-items-grid');
    if (!grid) {
        return;
    }
    
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
            const r = window.getPetRarity(lot.pet_id);
            const petName = PET_NAMES[lot.pet_id] || "Питомец";
            const stars = lot.pet_stars || 1;
            let starStr = stars > 1 ? `<div class="star-badge" style="top:5px; right:5px; left:auto;">⭐️${stars}</div>` : '';
            
            const isMyLot = lot.seller_id === String(window.getTgUser().id);
            let btnHtml = '';
            
            if (isMyLot) {
                btnHtml = `<button class="btn locked" style="padding: 8px; font-size: 12px; margin-top: 10px;">Твой лот</button>`;
            } else {
                const currIcon = lot.currency === 'coins' ? '💰' : '⭐️';
                btnHtml = `<button class="btn" style="background: #00A3FF; padding: 8px; font-size: 12px; margin-top: 10px; box-shadow:0 2px 10px rgba(0,163,255,0.4);" onclick="window.buyMarketLot('${lot.lot_id}', ${lot.price}, '${lot.currency}')">Купить за ${window.formatNumber(lot.price)} ${currIcon}</button>`;
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
};

window.buyMarketLot = async function(lotId, price, currency) {
    if (currency === 'coins' && walletBalance < price) {
        return window.showToast("Мало монет!", "❌");
    }
    
    if (currency === 'stars' && userStars < price) {
        return window.showToast("Мало звезд!", "❌");
    }
    
    window.playSound('click');
    
    try {
        const res = await fetch(`${API_URL}/market/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lot_id: lotId, buyer_id: String(window.getTgUser().id) })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            if (currency === 'coins') {
                walletBalance -= price;
            }
            if (currency === 'stars') {
                userStars -= price;
            }
            
            const boughtPet = data.lot.pet_id;
            const boughtStars = data.lot.pet_stars || 1;
            
            collection.push(boughtPet);
            
            if (!petStars[boughtPet] || petStars[boughtPet] < boughtStars) {
                petStars[boughtPet] = boughtStars;
            }
            
            window.saveData();
            window.updateBalanceUI();
            
            window.showToast(`Успешная покупка: ${PET_NAMES[boughtPet]}!`, "🎉");
            window.playSound('win');
            
            window.loadMarket();
        } else {
            window.showToast(data.detail, "❌");
            window.loadMarket(); 
        }
    } catch(e) {
        window.showToast("Ошибка покупки", "❌");
    }
};

window.openSellModal = function() {
    window.playSound('click');
    selectedPetForSale = null;
    
    const selector = window.getEl('sell-pet-selector');
    if (!selector) {
        return;
    }
    
    selector.innerHTML = '';
    
    const uniquePets = [...new Set(collection)];
    
    if (uniquePets.length === 0) {
        selector.innerHTML = "<div style='color:#888; font-size: 12px; padding: 10px;'>У вас нет петов для продажи.</div>";
        return;
    }
    
    uniquePets.forEach(pet => {
        const r = window.getPetRarity(pet);
        const div = document.createElement('div');
        div.className = `pet-slot ${r}`;
        div.style.width = '60px';
        div.style.height = '60px';
        div.style.flexShrink = '0';
        div.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot" onerror="this.src='assets/eggs/egg-default.png'">`;
        
        div.onclick = () => {
            window.playSound('click');
            selectedPetForSale = pet;
            
            document.querySelectorAll('#sell-pet-selector .pet-slot').forEach(el => {
                el.style.borderColor = 'transparent';
            });
            
            div.style.borderColor = '#00A3FF';
            
            const preview = window.getEl('selected-pet-to-sell');
            if (preview) {
                preview.style.display = 'block';
                window.getEl('sell-preview-img').src = `assets/pets/pet-${pet}.png`;
                window.getEl('sell-preview-name').textContent = PET_NAMES[pet];
                
                let stars = petStars[pet] || 1;
                window.getEl('sell-preview-stars').textContent = stars > 1 ? `⭐️${stars}` : '';
            }
            
            window.getEl('confirm-sell-btn').disabled = false;
        };
        selector.appendChild(div);
    });
    
    selectedPetForSale = null;
    window.getEl('selected-pet-to-sell').style.display = 'none';
    window.getEl('confirm-sell-btn').disabled = true;
    window.getEl('sell-price-input').value = '';
    
    window.openModal('sell-pet-modal');
};

window.submitSellPet = async function() {
    if (!selectedPetForSale) {
        return;
    }
    
    const priceInput = window.getEl('sell-price-input');
    const currency = window.getEl('sell-currency-select').value;
    const price = parseInt(priceInput.value);
    
    if (!price || price <= 0) {
        return window.showToast("Введите корректную цену!", "❌");
    }
    
    if (currency === 'coins' && price < 100) {
        return window.showToast("Минимальная цена 100 монет", "❌");
    }
    
    if (currency === 'stars' && price < 5) {
        return window.showToast("Минимальная цена 5 звезд", "❌");
    }
    
    window.playSound('click');
    const btn = window.getEl('confirm-sell-btn');
    btn.disabled = true;
    btn.textContent = "Публикация...";
    
    const user = window.getTgUser();
    let finalName = user.name;
    
    if (window.isVip()) {
        finalName += ' 👑';
    }
    
    if (mySyndicateId) {
        let tagEl = window.getEl('syn-view-tag');
        if (tagEl && tagEl.textContent) {
            finalName += ` ${tagEl.textContent}`;
        }
    }
    
    try {
        const res = await fetch(`${API_URL}/market/sell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                seller_id: user.id,
                seller_name: finalName,
                pet_id: selectedPetForSale,
                pet_stars: petStars[selectedPetForSale] || 1,
                price: price,
                currency: currency
            })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            const idx = collection.indexOf(selectedPetForSale);
            if (idx > -1) {
                collection.splice(idx, 1);
            }
            
            window.saveData();
            window.updateBalanceUI();
            
            window.showToast("Лот успешно создан!", "✅");
            window.closeModal('sell-pet-modal');
            window.loadMarket();
        } else {
            window.showToast(data.detail, "❌");
        }
    } catch(e) {
        window.showToast("Ошибка сети", "❌");
    }
    
    btn.disabled = false;
    btn.textContent = "Опубликовать";
};

// =============================================================
// НАСТРОЙКИ И ФОНОВЫЕ ПРОЦЕССЫ (РЫНОК)
// =============================================================
window.openSettings = function() {
    window.openModal('settings-modal');
    window.playSound('click');
};

window.checkMarketSales = async function() {
    try {
        const uid = String(window.getTgUser().id);
        let res = await fetch(`${API_URL}/market/rewards/${uid}`);
        
        if (!res.ok) {
            res = await fetch(`${API_URL}/api/market/rewards/${uid}`);
        }
        
        const data = await res.json();
        
        if (data.rewards && data.rewards.length > 0) {
            let gotCoins = 0;
            let gotStars = 0;
            
            data.rewards.forEach(r => {
                if (r.currency === 'coins') {
                    gotCoins += r.amount;
                }
                if (r.currency === 'stars') {
                    gotStars += r.amount;
                }
            });
            
            if (gotCoins > 0) { 
                walletBalance += gotCoins; 
                window.showToast(`Вашего пета купили! +${window.formatNumber(gotCoins)} 💰`, "🎉"); 
            }
            if (gotStars > 0) { 
                userStars += gotStars; 
                window.showToast(`Вашего пета купили! +${window.formatNumber(gotStars)} ⭐️`, "🎉"); 
            }
            
            window.saveData();
            window.updateBalanceUI();
            window.playSound('money');
        }
    } catch(e) {
        console.error("Ошибка проверки рынка", e);
    }
};

setInterval(window.checkMarketSales, 5000);
setTimeout(window.checkMarketSales, 1000);

// =============================================================
// ЗАПУСК ИГРЫ
// =============================================================
window.onload = window.initGame;