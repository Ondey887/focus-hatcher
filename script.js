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
// 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СТЕК ОКОН
// =============================================================
const API_URL = "https://focushatcher-ondey.amvera.io/api"; 
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

// Рулетка
let lastRouletteDate = ""; 
let boxAdsProgress = { epic: 0, mythic: 0 };
let currentBoxType = 'base';

// Секреты и кэш
let secretTaps = 0;
let secretTapTimer = null;
let forbesDataCache = null;
let currentForbesTab = 'global';

// Новые механики (ДНК, Паразиты, Уровни петов)
let dnaGrid = [];
let isStunned = false;
let parasiteInterval = null;
let petStars = {}; 
let activeContracts = { date: '', tasks: [] }; 

// =============================================================
// БЕЗОПАСНЫЙ ПАРСИНГ ДАННЫХ (ЗАЩИТА)
// =============================================================
function safeParse(val, def) {
    if (!val || val === 'undefined' || val === 'null') return def;
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
// 4. ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЯ 
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
            myBoosters = {luck: b.luck || 0, speed: b.speed || 0, bio: b.bio || 0};
            
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
    if(vibToggle) { 
        vibToggle.checked = isVibrationOn; 
        vibToggle.onchange = (e) => { 
            isVibrationOn = e.target.checked; 
            localStorage.setItem('isVibrationOn', isVibrationOn); 
            playSound('click'); 
        }; 
    }
    
    let soundToggle = getEl('sound-toggle');
    if(soundToggle) { 
        soundToggle.checked = isSoundOn; 
        soundToggle.onchange = (e) => { 
            isSoundOn = e.target.checked; 
            localStorage.setItem('isSoundOn', isSoundOn); 
            if(isSoundOn) playSound('click'); 
        }; 
    }
    
    const titleEl = getEl('main-title-secret');
    if (titleEl) {
        titleEl.onclick = () => {
            secretTaps++;
            if(secretTapTimer) clearTimeout(secretTapTimer);
            secretTapTimer = setTimeout(() => { secretTaps = 0; }, 1500);
            if(secretTaps >= 7) {
                secretTaps = 0;
                playSound('win');
                openModal('admin-modal');
            }
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
                
                if(values.pegasusShards) pegasusShards = parseInt(values.pegasusShards);
                if(values.userJokers) userJokers = parseInt(values.userJokers);
                if(values.myCollection) collection = safeParse(values.myCollection, []);
                if(values.ownedItems) ownedItems = safeParse(values.ownedItems, { themes: ['default'], eggs: ['default'] });
                if(values.activeTheme) activeTheme = values.activeTheme;
                if(values.activeEggSkin) activeEggSkin = values.activeEggSkin;
                if(values.selectedAvatar) selectedAvatar = values.selectedAvatar;
                
                if(values.userStats) userStats = {...userStats, ...safeParse(values.userStats, {})};
                
                if(values.myBoosters) {
                    let cb = safeParse(values.myBoosters, {});
                    myBoosters = { luck: cb.luck || 0, speed: cb.speed || 0, bio: cb.bio || 0 };
                }
                
                if(values.claimedAchievements) claimedAchievements = safeParse(values.claimedAchievements, []);
                if(values.claimedQuests) claimedQuests = safeParse(values.claimedQuests, []);
                if(values.vipEndTime) vipEndTime = parseInt(values.vipEndTime);
                if(values.hasSecondSlot) hasSecondSlot = values.hasSecondSlot === 'true';
                if(values.secondSlotEndTime) secondSlotEndTime = parseInt(values.secondSlotEndTime);
                if(values.lastRouletteDate) lastRouletteDate = values.lastRouletteDate;
                if(values.boxAdsProgress) boxAdsProgress = safeParse(values.boxAdsProgress, { epic: 0, mythic: 0 });
                if(values.petStars) petStars = safeParse(values.petStars, {});
                if(values.activeContracts) activeContracts = safeParse(values.activeContracts, { date: '', tasks: [] });

                let profileBtn = getEl('header-profile-btn');
                if (selectedAvatar !== 'default' && profileBtn) { 
                    profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
                }
                saveData(true); 
            } else if (userLevel > cloudLevel) {
                saveData(false); 
            }
        } else if (!err && (!values || !values.userLevel)) {
            if(userLevel > 1) saveData(false);
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
}// =============================================================
// КОНТРАКТЫ 2.0 (ЕЖЕДНЕВНЫЕ ЗАДАНИЯ)
// =============================================================
function checkContracts() {
    const today = new Date().toDateString();
    if(activeContracts.date !== today) {
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
    if(!activeContracts.tasks) return;
    let updated = false;
    activeContracts.tasks.forEach(t => {
        if(t.t === type && !t.c && t.p < t.g) {
            t.p += val;
            if(t.p > t.g) t.p = t.g;
            if(t.p === t.g && !t.notified) { 
                showToast('Контракт выполнен!', '📜'); 
                t.notified = true; 
                playSound('win');
            }
            updated = true;
        }
    });
    if(updated) saveData();
}

window.claimContract = function(idx) {
    let t = activeContracts.tasks[idx];
    if(t.c) return;
    t.c = true;
    if(t.r.t === 'money') walletBalance += t.r.v;
    if(t.r.t === 'stars') userStars += t.r.v;
    if(t.r.t === 'joker') userJokers += t.r.v;
    if(t.r.t === 'luck') myBoosters.luck = (myBoosters.luck||0) + t.r.v;
    if(t.r.t === 'speed') myBoosters.speed = (myBoosters.speed||0) + t.r.v;
    
    saveData(); 
    updateBalanceUI(); 
    renderQuests();
    showToast(`Награда получена!`, '🎁'); 
    playSound('money');
};

// =============================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (ДЛЯ ТУТОРИАЛА И НАГРАД)
// =============================================================
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
    if(!g) return;
    g.innerHTML = '';
    
    DAILY_REWARDS.forEach((r, i) => {
        const d = document.createElement('div');
        let st = ''; 
        if(i < curr) st = 'claimed'; 
        if(i === curr) st = 'active';
        
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
    if (s >= 7) s = 0;
    
    localStorage.setItem('dailyStreak', s); 
    localStorage.setItem('lastLoginDate', t);
    
    saveData(); 
    updateBalanceUI(); 
    showToast("Награда получена!", "📅"); 
    closeModal('daily-modal'); 
    playSound('money');
}

// =============================================================
// 4. ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЯ (ЗАЩИЩЕННАЯ ВЕРСИЯ)
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
            myBoosters = {luck: b.luck || 0, speed: b.speed || 0, bio: b.bio || 0};
            
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
    if(vibToggle) { 
        vibToggle.checked = isVibrationOn; 
        vibToggle.onchange = (e) => { 
            isVibrationOn = e.target.checked; 
            localStorage.setItem('isVibrationOn', isVibrationOn); 
            playSound('click'); 
        }; 
    }
    
    let soundToggle = getEl('sound-toggle');
    if(soundToggle) { 
        soundToggle.checked = isSoundOn; 
        soundToggle.onchange = (e) => { 
            isSoundOn = e.target.checked; 
            localStorage.setItem('isSoundOn', isSoundOn); 
            if(isSoundOn) playSound('click'); 
        }; 
    }
    
    const titleEl = getEl('main-title-secret');
    if (titleEl) {
        titleEl.onclick = () => {
            secretTaps++;
            if(secretTapTimer) clearTimeout(secretTapTimer);
            secretTapTimer = setTimeout(() => { secretTaps = 0; }, 1500);
            if(secretTaps >= 7) {
                secretTaps = 0;
                playSound('win');
                openModal('admin-modal');
            }
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
                
                if(values.pegasusShards) pegasusShards = parseInt(values.pegasusShards);
                if(values.userJokers) userJokers = parseInt(values.userJokers);
                if(values.myCollection) collection = safeParse(values.myCollection, []);
                if(values.ownedItems) ownedItems = safeParse(values.ownedItems, { themes: ['default'], eggs: ['default'] });
                if(values.activeTheme) activeTheme = values.activeTheme;
                if(values.activeEggSkin) activeEggSkin = values.activeEggSkin;
                if(values.selectedAvatar) selectedAvatar = values.selectedAvatar;
                
                if(values.userStats) userStats = {...userStats, ...safeParse(values.userStats, {})};
                
                if(values.myBoosters) {
                    let cb = safeParse(values.myBoosters, {});
                    myBoosters = { luck: cb.luck || 0, speed: cb.speed || 0, bio: cb.bio || 0 };
                }
                
                if(values.claimedAchievements) claimedAchievements = safeParse(values.claimedAchievements, []);
                if(values.claimedQuests) claimedQuests = safeParse(values.claimedQuests, []);
                if(values.vipEndTime) vipEndTime = parseInt(values.vipEndTime);
                if(values.hasSecondSlot) hasSecondSlot = values.hasSecondSlot === 'true';
                if(values.secondSlotEndTime) secondSlotEndTime = parseInt(values.secondSlotEndTime);
                if(values.lastRouletteDate) lastRouletteDate = values.lastRouletteDate;
                if(values.boxAdsProgress) boxAdsProgress = safeParse(values.boxAdsProgress, { epic: 0, mythic: 0 });
                
                if(values.petStars) petStars = safeParse(values.petStars, {});
                if(values.activeContracts) activeContracts = safeParse(values.activeContracts, { date: '', tasks: [] });

                let profileBtn = getEl('header-profile-btn');
                if (selectedAvatar !== 'default' && profileBtn) { 
                    profileBtn.innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar" onerror="this.src='assets/ui/icon-profile.png'">`; 
                }
                saveData(true); 
            } else if (userLevel > cloudLevel) {
                saveData(false); 
            }
        } else if (!err && (!values || !values.userLevel)) {
            if(userLevel > 1) saveData(false);
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
}// =============================================================
// 5. ИНТЕРФЕЙС И БАЗОВЫЕ ОКНА
// =============================================================
function applyTheme() { 
    if (activeTheme === 'matrix') {
        document.body.className = 'theme-matrix';
        document.body.style.backgroundImage = 'none';
        return;
    }
    document.body.className = '';
    const t = SHOP_DATA.themes.find(x => x.id === activeTheme); 
    if(t && t.bgFile) {
        document.body.style.backgroundImage = `url('${t.bgFile}')`; 
    } else { 
        document.body.style.backgroundImage = 'none'; 
        document.body.style.backgroundColor = '#1c1c1e'; 
    }
}

function applyEggSkin() { 
    const egg = getEl('egg-display'); 
    if(!egg) return;

    egg.className = 'egg-img'; 
    egg.classList.remove('egg-locked');
    
    const m = MODES[currentModeIndex] || MODES[0];

    if(userLevel < m.reqLevel) {
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
    
    if(isRunning) egg.classList.add('shaking'); 
}

function updateLevelUI() { 
    const max = userLevel * 200; 
    let p = (userXP / max) * 100; 
    if(p > 100) p = 100; 
    
    let xpBar = getEl('xp-bar'); 
    if(xpBar) xpBar.style.width = `${p}%`; 
    
    let numEl = getEl('level-number'); 
    if(numEl) numEl.textContent = `Lvl ${userLevel}`; 
    
    let r = Math.floor(userLevel / 5); 
    let rankEl = getEl('rank-name'); 
    if(rankEl) rankEl.textContent = RANKS[Math.min(r, RANKS.length-1)] || "Создатель"; 
}

function switchShopTab(t) { 
    currentShopTab = t; 
    document.querySelectorAll('#shop-modal .tab-btn').forEach(b => b.classList.remove('active')); 
    if(event && event.target) event.target.classList.add('active'); 
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
    if(!c) return;
    c.innerHTML = '';
    
    if(currentShopTab === 'premium') {
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
        if(currentShopTab === 'boosters') {
            btnHTML = `<button class="buy-btn" onclick="buyItem('${item.id}', '${item.price}')">${item.price} ${typeof item.price === 'number' ? '<img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">' : ''}</button>`;
            let iconContent = item.icon.includes('.png') ? `<img src="${item.icon}" class="shop-icon-img">` : `<div style="font-size: 50px; margin-bottom: 10px;">${item.icon}</div>`;
            d.innerHTML = `${iconContent}<div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888">${item.desc}</div>${btnHTML}`;
        } else if(currentShopTab === 'eggs') {
            const owned = ownedItems.eggs.includes(item.id); 
            const active = activeEggSkin === item.id;
            let cls = owned ? "buy-btn owned" : "buy-btn"; 
            if(!owned && walletBalance < item.price) cls += " locked"; 
            let txt = owned ? (active ? "Выбрано" : "Выбрать") : `${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML = `<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            d.innerHTML = `<img src="${item.img}" class="shop-icon-img"><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        } else {
            const owned = ownedItems.themes.includes(item.id); 
            const active = activeTheme === item.id;
            let cls = owned ? "buy-btn owned" : "buy-btn"; 
            if(!owned && walletBalance < item.price) cls += " locked"; 
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
            if (isVip()) vipEndTime += 30 * 24 * 60 * 60 * 1000;
            else vipEndTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
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
    if(typeof price === 'string' && price.includes('⭐️')) { 
        let starCost = parseInt(price);
        if (userStars >= starCost) {
            userStars -= starCost;
            if(!myBoosters[id]) myBoosters[id] = 0; 
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
    
    if(currentShopTab === 'boosters') {
        if(walletBalance >= price) { 
            walletBalance -= price; 
            if(!myBoosters[id]) myBoosters[id] = 0; 
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
    
    if(owned) {
        if(category === 'themes') { activeTheme = id; applyTheme(); } 
        else { activeEggSkin = id; applyEggSkin(); }
        saveData(); 
        renderShop(); 
        playSound('click');
    } else {
        if(walletBalance >= price) {
            walletBalance -= price; 
            ownedItems[category].push(id);
            if(category === 'themes') { activeTheme = id; applyTheme(); } 
            else { activeEggSkin = id; applyEggSkin(); }
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
    if(event && event.target) event.target.classList.add('active'); 
    if(t === 'achievements') renderAch(); 
    else renderQuests(); 
    playSound('click'); 
}

function renderAch() {
    const c = getEl('achievements-list'); 
    if(!c) return;
    c.innerHTML = ''; 
    let u = new Set(collection).size;
    
    ACHIEVEMENTS_DATA.forEach(a => {
        const claimed = claimedAchievements.includes(a.id); 
        let done = false; 
        
        if(a.type === 'money' && walletBalance >= a.goal) done = true;
        if(a.type === 'unique' && u >= a.goal) done = true;
        if(a.type === 'hatch' && userStats.hatched >= a.goal) done = true;
        if(!a.type && userStats.hatched >= a.goal) done = true;
        if(a.type === 'level' && userLevel >= a.goal) done = true;
        if(a.type === 'craft' && userStats.crafts >= a.goal) done = true;
        
        const d = document.createElement('div'); 
        d.className = `achievement-card ${done ? 'unlocked' : ''}`;
        
        let btn = ''; 
        if(done && !claimed) {
            btn = `<button class="buy-btn" onclick="claimAch('${a.id}',${a.reward})">Забрать ${a.reward} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`; 
        } else if(claimed) {
            btn = "✅"; 
        } else {
            btn = `<span style="font-size:12px;color:#888">Цель: ${a.goal}</span>`;
        }
        
        d.innerHTML = `<div class="ach-icon">${done ? '<img src="assets/ui/icon-trophy.png">' : '<img src="assets/ui/icon-lock.png">'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function claimAch(id, r) { 
    if(claimedAchievements.includes(id)) return; 
    claimedAchievements.push(id); 
    walletBalance += r; 
    saveData(); 
    updateBalanceUI(); 
    renderAch(); 
    showToast(`Награда +${r}`, 'img'); 
    playSound('money'); 
}

function handleShare() { 
    if(!userStats.invites) userStats.invites = 0; 
    userStats.invites++; 
    saveData(); 
    checkAchievements(); 
    const t = `У меня ${new Set(collection).size} петов в Focus Hatcher!`; 
    const u = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(t)}`; 
    if(window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(u); 
    else window.open(u, '_blank'); 
}

// =============================================================
// FORBES (ТОП БОГАЧЕЙ)
// =============================================================
async function openForbes() {
    playSound('click');
    openModal('forbes-modal');
    let flc = getEl('forbes-list-container');
    if(flc) flc.innerHTML = '<div style="text-align:center; color:#888; padding: 20px;">Синхронизация...</div>';
    
    await apiSyncGlobalProfile();
    
    try {
        const res = await fetch(`${API_URL}/forbes/${getTgUser().id}`);
        forbesDataCache = await res.json();
        renderForbesList(currentForbesTab);
    } catch(e) {
        if(flc) flc.innerHTML = '<div style="text-align:center; color:#ff3b30; padding: 20px;">Ошибка загрузки топа</div>';
    }
}

function switchForbesTab(tab) {
    playSound('click');
    currentForbesTab = tab;
    document.querySelectorAll('#forbes-modal .tab-btn').forEach(b => b.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
    renderForbesList(tab);
}

function renderForbesList(tab) {
    const container = getEl('forbes-list-container');
    if(!container) return;
    container.innerHTML = '';
    if(!forbesDataCache || !forbesDataCache[tab]) return;
    
    const list = forbesDataCache[tab];
    if(list.length === 0) {
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
    if(activeTab) activeTab.classList.add('active');
    
    let cost = 10; 
    let reqAds = 1;
    if(type === 'epic') { cost = 25; reqAds = 2; }
    if(type === 'mythic') { cost = 50; reqAds = 3; }
    
    let paidBtn = getEl('roulette-paid-btn');
    if(paidBtn) paidBtn.textContent = `Крутить за ${cost} ⭐️`;
    
    const today = new Date().toDateString();
    let freeBtn = getEl('roulette-free-btn');
    let adBtn = getEl('roulette-ad-btn');

    if (type === 'base' && lastRouletteDate !== today) {
        if(freeBtn) freeBtn.style.display = 'block';
        if(adBtn) adBtn.style.display = 'none';
        if(paidBtn) paidBtn.style.display = 'none';
    } else {
        if(freeBtn) freeBtn.style.display = 'none';
        if(adBtn) {
            adBtn.style.display = 'block';
            if (type !== 'base') {
                let watched = boxAdsProgress[type] || 0;
                adBtn.textContent = `Смотреть рекламу 📺 (${watched}/${reqAds})`;
            } else {
                adBtn.textContent = `Смотреть рекламу 📺`;
            }
        }
        if(paidBtn) paidBtn.style.display = 'block';
    }
    
    let boxColor = '#fff';
    if(type === 'epic') boxColor = '#00A3FF';
    if(type === 'mythic') boxColor = '#ffd700';
    
    let rBox = getEl('roulette-box');
    if(rBox) {
        rBox.style.filter = `drop-shadow(0 0 20px ${boxColor})`;
        rBox.textContent = '🎁';
    }
    let resText = getEl('roulette-result-text');
    if(resText) resText.textContent = '';
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
    if(!btn) return;
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
                    if (!boxAdsProgress[currentBoxType]) boxAdsProgress[currentBoxType] = 0;
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
    if(currentBoxType === 'epic') cost = 25;
    if(currentBoxType === 'mythic') cost = 50;

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
    if(!box || !resText) return;
    
    if(getEl('roulette-free-btn')) getEl('roulette-free-btn').disabled = true;
    if(getEl('roulette-ad-btn')) getEl('roulette-ad-btn').disabled = true;
    if(getEl('roulette-paid-btn')) getEl('roulette-paid-btn').disabled = true;
    document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.disabled = true);
    
    box.className = 'roulette-box roulette-spinning';
    resText.textContent = "Крутим...";
    
    setTimeout(() => {
        box.className = 'roulette-box';
        if(getEl('roulette-free-btn')) getEl('roulette-free-btn').disabled = false;
        if(getEl('roulette-ad-btn')) getEl('roulette-ad-btn').disabled = false;
        if(getEl('roulette-paid-btn')) getEl('roulette-paid-btn').disabled = false;
        document.querySelectorAll('#roulette-modal .tab-btn').forEach(b => b.disabled = false);
        
        let rnd = Math.random() * 100;
        let selectedPrize = null;
        let pool = ROULETTE_PRIZES[currentBoxType];
        
        for (let p of pool) {
            if (rnd < p.p) { selectedPrize = p; break; }
            rnd -= p.p;
        }
        if(!selectedPrize) selectedPrize = pool[0];
        
        playSound('win'); 
        fireConfetti();
        
        if (selectedPrize.t === 'legendary_random') {
            const randLeg = petDatabase.legendary[Math.floor(Math.random() * petDatabase.legendary.length)];
            collection.push(randLeg);
            showToast(`СУПЕР ПРИЗ! Легендарный ${PET_NAMES[randLeg]}!`, "🏆");
            box.textContent = "🐲";
            resText.textContent = `ДЖЕКПОТ: ${PET_NAMES[randLeg]}`;
        }
        else if (selectedPrize.t === 'money') { walletBalance += selectedPrize.v; showToast(`+${selectedPrize.v} монет!`, "💰"); box.textContent = "💰"; resText.textContent = `Выпало: ${selectedPrize.n}`; }
        else if (selectedPrize.t === 'stars') { userStars += selectedPrize.v; showToast(`+${selectedPrize.v} Звезд!`, "⭐️"); box.textContent = "⭐️"; resText.textContent = `Выпало: ${selectedPrize.n}`; }
        else if (selectedPrize.t === 'joker') { userJokers += selectedPrize.v; showToast(`Ген Мутации x${selectedPrize.v}!`, "🧬"); box.textContent = "🧬"; resText.textContent = `Выпало: ${selectedPrize.n}`; }
        else if (selectedPrize.t === 'shard') { pegasusShards += selectedPrize.v; showToast(`Осколок Пегаса x${selectedPrize.v}!`, "🧩"); box.textContent = "🦄"; resText.textContent = `Выпало: ${selectedPrize.n}`; }
        else if (selectedPrize.t === 'luck') { if (!myBoosters.luck) myBoosters.luck = 0; myBoosters.luck += selectedPrize.v; showToast(`Зелье удачи x${selectedPrize.v}!`, "🧪"); box.textContent = "🧪"; resText.textContent = `Выпало: ${selectedPrize.n}`; }
        else if (selectedPrize.t === 'speed') { if (!myBoosters.speed) myBoosters.speed = 0; myBoosters.speed += selectedPrize.v; showToast(`Ускоритель x${selectedPrize.v}!`, "⚡️"); box.textContent = "⚡️"; resText.textContent = `Выпало: ${selectedPrize.n}`; }

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
}// =============================================================
// 8.5 ВТОРОЙ СЛОТ (ОФФЛАЙН ИНКУБАТОР) И ФОНОВЫЙ ХЭТЧ
// =============================================================
function updateSecondSlotUI() {
    const panel = getEl('second-slot-panel');
    if (!panel) return;
    if(!hasSecondSlot) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';

    if(secondSlotEndTime > 0) {
        const now = Date.now();
        if(now >= secondSlotEndTime) {
            getEl('second-slot-idle').style.display = 'none';
            getEl('second-slot-active').style.display = 'none';
            getEl('second-slot-done').style.display = 'block';
            if(secondSlotInterval) { clearInterval(secondSlotInterval); secondSlotInterval = null; }
        } else {
            getEl('second-slot-idle').style.display = 'none';
            getEl('second-slot-active').style.display = 'block';
            getEl('second-slot-done').style.display = 'none';
            if(!secondSlotInterval) {
                secondSlotInterval = setInterval(() => {
                    const diff = Math.floor((secondSlotEndTime - Date.now()) / 1000);
                    if(diff <= 0) {
                        clearInterval(secondSlotInterval); secondSlotInterval = null;
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
        if(secondSlotInterval) { clearInterval(secondSlotInterval); secondSlotInterval = null; }
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
    let leg = 5; let rare = 30; let pool;
    const rnd = Math.random() * 100;
    if(rnd < leg) pool = petDatabase.legendary;
    else if(rnd < leg + rare) pool = petDatabase.rare;
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
        if(savedTarget) customEggConfig.target = savedTarget;
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

// =============================================================
// 12. МИНИ-ИГРА: МЕГА-ЯЙЦО
// =============================================================
async function apiAddMegaEggTime(seconds) {
    try { 
        await fetch(`${API_URL}/party/mega_egg/add`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode, seconds: seconds }) 
        }); 
    } catch(e) {}
}

function updateMegaEggUI(progress, target) {
    let p = (progress / target) * 100; 
    if(p > 100) p = 100;
    let meb = getEl('mega-egg-bar'); 
    if(meb) meb.style.width = `${p}%`;
    let met = getEl('mega-egg-text'); 
    if(met) met.textContent = `${Math.floor(progress/3600)} / ${Math.floor(target/3600)} Часов`;
    let mecb = getEl('mega-egg-claim-btn'); 
    if(mecb) mecb.style.display = (progress >= target) ? 'block' : 'none';
    
    const eggImg = getEl('mega-egg-img-display');
    if (eggImg) {
        if(p > 0 && p < 50) eggImg.className = 'mega-egg-img pulse-slow';
        else if(p >= 50 && p < 100) eggImg.className = 'mega-egg-img pulse-fast';
        else if(p >= 100) eggImg.className = 'mega-egg-img shake-crazy';
        else eggImg.className = 'mega-egg-img';
    }
}

async function claimMegaEgg() {
    playSound('win'); 
    fireConfetti();
    collection.push(petDatabase.legendary[Math.floor(Math.random() * petDatabase.legendary.length)]);
    walletBalance += 10000; 
    saveData(); 
    updateBalanceUI();
    showToast("МЕГА-ЯЙЦО РАСКОЛОТО! +10k Монет и Легендарка", "🌟");
    try { 
        await fetch(`${API_URL}/party/mega_egg/claim`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        }); 
    } catch(e) {}
    closeModal('mega-egg-modal');
}

// =============================================================
// 13. МИНИ-ИГРА: ЭКСПЕДИЦИЯ 2.0 
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
    if(farm_count >= 3) { score = Math.floor(score * 1.5); synergyText.push("🌾 Ферма (+50% лута)"); }
    if(pred_count >= 2) { synergyText.push("🐾 Хищники (-15% времени)"); }
    if(magic_count >= 1) { synergyText.push("✨ Магия (Выше шанс Осколка)"); }

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
    
    if(!infoView || !activeView || !timerEl) return; 

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
        if(scene) scene.classList.remove('scrolling-bg'); 
        if(wolfOverlay) wolfOverlay.style.display = 'none';
        
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if(changeBtn) changeBtn.style.display = 'inline-block';
        
        infoView.style.display = 'block'; 
        activeView.style.display = 'none';
        
        let radarBtn = getEl('expedition-radar-btn'); 
        if (radarBtn) radarBtn.style.display = isMegaRadarActive ? 'none' : 'block';

        if (isPartyLeader) {
            if(locSelector) locSelector.style.display = 'flex';
            let startBtn = getEl('expedition-start-btn'); 
            if(startBtn) startBtn.style.display = 'inline-block';
            let waitMsg = getEl('expedition-waiting-msg'); 
            if(waitMsg) waitMsg.style.display = 'none';
        } else {
            if(locSelector) locSelector.style.display = 'none';
            let startBtn = getEl('expedition-start-btn'); 
            if(startBtn) startBtn.style.display = 'none';
            let waitMsg = getEl('expedition-waiting-msg'); 
            if(waitMsg) waitMsg.style.display = 'block';
        }
        calculatePreStartSynergy();
        
        if (expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
        if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
    } else if (isActive) {
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if(changeBtn) changeBtn.style.display = 'none';
        
        if(locSelector) locSelector.style.display = 'none';
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        let multEl = getEl('expedition-multiplier'); 
        if(multEl) multEl.textContent = score;
        
        if(claimBtn) claimBtn.style.display = 'none';

        if (safeWolfHp > 0) {
            if(wolfOverlay) wolfOverlay.style.display = 'flex';
            let wolfBar = getEl('wolf-hp-bar'); 
            if(wolfBar) wolfBar.style.width = `${(safeWolfHp / safeWolfMaxHp) * 100}%`;
            timerEl.style.color = '#ff3b30'; 
            if(scene) scene.classList.remove('scrolling-bg');
            if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
        } else {
            if(wolfOverlay) wolfOverlay.style.display = 'none';
            timerEl.style.color = '#34c759'; 
            if(scene) scene.classList.add('scrolling-bg');
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
                    if(scene) scene.classList.remove('scrolling-bg');
                    if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
                } else { 
                    updateTimerVisuals(diff); 
                }
            }, 1000);
        }
    } else if (isFinished) {
        currentExpeditionEndTime = 0; 
        if(scene) scene.classList.remove('scrolling-bg'); 
        if(wolfOverlay) wolfOverlay.style.display = 'none';
        
        let changeBtn = getEl('change-expedition-pet-btn'); 
        if(changeBtn) changeBtn.style.display = 'none';
        
        if(locSelector) locSelector.style.display = 'none';
        infoView.style.display = 'none'; 
        activeView.style.display = 'block';
        
        timerEl.textContent = "00:00:00"; 
        let multEl = getEl('expedition-multiplier'); 
        if(multEl) multEl.textContent = score; 
        timerEl.style.color = '#34c759';
        
        if (safeWolfHp === 0 && claimBtn) claimBtn.style.display = 'block';
        if (expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
        if (bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
    }
}

async function tapWolf() {
    playSound('click'); 
    const img = getEl('wolf-img');
    if(img) { 
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
    if(!scene || !scene.classList.contains('scrolling-bg')) return;
    
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
        if(b && b.parentNode) b.remove(); 
    };
    scene.appendChild(b); 
    setTimeout(() => { if(b && b.parentNode) b.remove(); }, 4000);
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
    
    // БОНУС ЗВЕЗД В ЭКСПЕДИЦИИ
    let stars = petStars[selectedAvatar] || 1;
    let starBonus = 1 + ((stars - 1) * 0.1); 

    const reward = Math.floor(score * locMultiplier * vipMult * radarMult * mutantBonus * starBonus); 
    
    let magicCount = 0; 
    currentPartyPlayersData.forEach(p => { 
        if (["dragon", "unicorn", "alien"].includes(p.avatar)) magicCount++; 
    });
    
    const sceneClass = getEl('expedition-scene') ? getEl('expedition-scene').className : '';
    let shardChance = 0; 
    if(sceneClass.includes('space-bg')) shardChance += 25; 
    if(sceneClass.includes('mountains-bg')) shardChance += 5; 
    if(magicCount >= 1) shardChance += 15; 
    
    let droppedShard = false; 
    if(shardChance > 0 && (Math.random() * 100) < shardChance) { 
        pegasusShards += 1; 
        droppedShard = true; 
    }

    walletBalance += reward; 
    saveData(); 
    updateBalanceUI();
    
    let msgBonus = uniqueMutants > 0 ? ` (Мутанты: +${uniqueMutants*5}%)` : '';
    if(stars > 1) msgBonus += ` (⭐️${stars}: +${(stars-1)*10}%)`;

    if(droppedShard) { 
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
    if(isPartyLeader) requestStopMiniGame(); 
}

// =============================================================
// ЗАПУСК ИГРЫ
// =============================================================
window.onload = initGame;