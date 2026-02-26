// =============================================================
// 1. ЛОВУШКА ОШИБОК И ЗВУК
// =============================================================
const debugConsole = document.getElementById('debug-console');
window.onerror = function(msg, source, lineno) {
    debugConsole.style.display = 'block';
    debugConsole.innerHTML += `<div class="error-msg">❌ ${msg} (стр. ${lineno})</div>`;
    return false;
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = new AudioContext();

function playSound(type) {
    if (!isSoundOn) return;
    if (audioCtx.state === 'suspended') audioCtx.resume(); 
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'money') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'win') {
        playNote(523.25, now, 0.1); playNote(659.25, now + 0.1, 0.1); playNote(783.99, now + 0.2, 0.4);
    } else if (type === 'legendary') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(600, now + 1);
        gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 1.5);
        osc.start(now); osc.stop(now + 1.5);
    }
}

function playNote(freq, time, duration) {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, time); gain.gain.linearRampToValueAtTime(0.01, time + duration);
    osc.start(time); osc.stop(time + duration);
}

// =============================================================
// 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СТЕК ОКОН
// =============================================================
const API_URL = "https://focushatcher-ondey.amvera.io/api"; 
let modalStack = [];

let collection = [], userXP = 0, userLevel = 1, walletBalance = 0, userStars = 0, pegasusShards = 0;
let userJokers = 0; 
let ownedItems = { themes: ['default'], eggs: ['default'] };
let activeTheme = 'default', activeEggSkin = 'default', selectedAvatar = 'default';
let userStats = { hatched: 0, earned: 0, invites: 0, crafts: 0 };
let myBoosters = { luck: 0, speed: 0 };
let claimedAchievements = [], claimedQuests = [], usedCodes = [];
let isVibrationOn = true, isSoundOn = false;

let vipEndTime = 0;
let hasSecondSlot = false;
let secondSlotEndTime = 0;

let currentModeIndex = 0, timerInterval = null, isRunning = false, timeLeft = 10;
let activeBoosters = { luck: false, speed: false };
let currentHatchMode = 'none'; 
let currentShopTab = 'themes', currentAchTab = 'achievements', selectedPet = null;
let customEggConfig = { target: 'all', timeOnline: 3600, timeOffline: 5 * 3600 };
let resurrectCountdownInterval = null;
let secondSlotInterval = null;

let currentPartyCode = null;
let partyPollingInterval = null;
let isPartyLeader = false;
let currentActiveGame = 'none';
let currentPartyPlayersData = [];
let invitesPollingInterval = null;
let currentPendingInviteId = null;

let currentExpeditionLocation = 'forest'; 
let currentExpeditionEndTime = 0; 
let bossTimerInterval = null; 
let bossTimeLeft = 60; 
let bossIsDead = false;
let expeditionInterval = null;
let bonusSpawningInterval = null;
let currentWolfHp = 0;
let isMegaRadarActive = false; 
let lastRouletteDate = ""; 

function openModal(id) {
    playSound('click');
    if(modalStack.length > 0 && modalStack[modalStack.length - 1] === id) return;
    if (modalStack.length > 0) {
        const prevEl = document.getElementById(modalStack[modalStack.length - 1]);
        if(prevEl) prevEl.style.display = 'none';
    }
    const el = document.getElementById(id);
    if(el) { el.style.display = 'flex'; modalStack.push(id); }
}

function closeModal(id) {
    playSound('click');
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    modalStack = modalStack.filter(m => m !== id);
    if (modalStack.length > 0) {
        const prevEl = document.getElementById(modalStack[modalStack.length - 1]);
        if(prevEl) prevEl.style.display = 'flex';
    }
}

function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particles = [];
    const colors = ['#ff3b30', '#ffcc00', '#34c759', '#007aff', '#5856d6'];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2, w: Math.random() * 10 + 5, h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20 - 10, grav: 0.5
        });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, index) => {
            p.x += p.vx; p.y += p.vy; p.vy += p.grav;
            ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h);
            if (p.y > canvas.height) particles.splice(index, 1);
        });
        if (particles.length > 0) requestAnimationFrame(draw); else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

function getEl(id) { return document.getElementById(id); }
function showToast(msg, icon='🔔') {
    const c = getEl('toast-container'); const d = document.createElement('div');
    let content = icon === 'img' ? `<img src="assets/ui/coin.png"> <span>${msg}</span>` : `<span>${icon}</span> <span>${msg}</span>`;
    d.className = 'toast'; d.innerHTML = content;
    c.appendChild(d); setTimeout(() => { d.classList.add('fade-out'); setTimeout(()=>d.remove(), 300); }, 3000);
}
function formatTime(s) { 
    if(s >= 3600) return `${Math.floor(s/3600)}ч ${Math.floor((s%3600)/60).toString().padStart(2,'0')}м`;
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`; 
}
function getPetRarity(p) {
    if(p === "god" || p === "pegasus") return 'legendary';
    if(petDatabase.legendary.includes(p)) return 'legendary';
    if(petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}
function getPetImg(id) { return id === 'default' ? 'assets/ui/icon-profile.png' : `assets/pets/pet-${id}.png`; }
function hardReset() { if(confirm("Сбросить все?")) { localStorage.clear(); location.reload(); } }

function getTgUser() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        return { id: String(window.Telegram.WebApp.initDataUnsafe.user.id), name: window.Telegram.WebApp.initDataUnsafe.user.first_name };
    }
    if(!localStorage.getItem('fake_uid')) localStorage.setItem('fake_uid', 'user_' + Math.floor(Math.random()*10000));
    return { id: localStorage.getItem('fake_uid'), name: "Игрок" };
}

function isVip() {
    return Date.now() < vipEndTime;
}

// =============================================================
// 3. БАЗЫ ДАННЫХ И КОНСТАНТЫ
// =============================================================
const MODES = [
    { id: 'short', timeOnline: 25 * 60, timeOffline: 6 * 3600, xpReward: 250, egg: 'default', title: '25 минут', sub: 'Шанс Легендарки: 1%' },
    { id: 'long', timeOnline: 60 * 60, timeOffline: 12 * 3600, xpReward: 1000, egg: 'diamond', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥' },
    { id: 'custom', timeOnline: 3600, timeOffline: 5 * 3600, xpReward: 500, egg: 'default', title: 'Кастомное яйцо', sub: 'Настрой редкость' }
];

const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Мифик", "Создатель"];

const PET_NAMES = {
    "chick": "Цыпленок", "kitten": "Котенок", "puppy": "Щенок", "hamster": "Хомяк", "bunny": "Зайчик",
    "frog": "Лягушка", "bear": "Мишка", "koala": "Коала", "duck": "Утенок", "caterpillar": "Гусеница",
    "fox": "Лисенок", "panda": "Панда", "tiger": "Тигренок", "lion": "Львенок", "cow": "Коровка",
    "pig": "Свинка", "monkey": "Обезьянка", "owl": "Сова",
    "unicorn": "Единорог", "dragon": "Дракон", "alien": "Пришелец", "robot": "Робот", "dino": "Динозавр",
    "fireball": "Огонек", "god": "Бог Фокуса", "pegasus": "Мифический Пегас"
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
    legendary: ["unicorn", "dragon", "alien", "robot", "dino", "fireball"]
};
const ALL_PETS_FLAT = [...petDatabase.common, ...petDatabase.rare, ...petDatabase.legendary, "god", "pegasus"];
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
        { id: 'speed', name: 'Ускоритель', price: 9990, icon: 'assets/ui/booster-speed.png', desc: 'Меньше времени' }
    ]
};

const DAILY_REWARDS = [
    { day: 1, type: 'money', val: 100 }, { day: 2, type: 'money', val: 250 }, { day: 3, type: 'money', val: 500 },
    { day: 4, type: 'money', val: 1000 }, { day: 5, type: 'money', val: 2000 }, { day: 6, type: 'booster', id: 'speed', val: 1 }, { day: 7, type: 'mixed', money: 5000, booster: 'luck' }
];
const PROMO_CODES = {
    'START2026': { type: 'money', val: 1000 },
    'SPEED': { type: 'booster', id: 'speed', val: 5 },
    'SECRET': { type: 'money', val: 5000 }
};

const ROULETTE_PRIZES = [
    { n: "1000 Монет", t: 'money', v: 1000, p: 40 },
    { n: "5000 Монет", t: 'money', v: 5000, p: 20 },
    { n: "Бустер Удачи", t: 'luck', v: 1, p: 15 },
    { n: "Ген Мутации", t: 'joker', v: 1, p: 10 },
    { n: "10 Звезд", t: 'stars', v: 10, p: 10 },
    { n: "Осколок Пегаса", t: 'shard', v: 1, p: 5 }
];

// =============================================================
// 4. ИНИЦИАЛИЗАЦИЯ И СОХРАНЕНИЯ
// =============================================================
function initGame() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand(); window.Telegram.WebApp.enableClosingConfirmation();
        window.Telegram.WebApp.setHeaderColor('#1c1c1e'); window.Telegram.WebApp.setBackgroundColor('#1c1c1e');
    }
    try {
        collection = JSON.parse(localStorage.getItem('myCollection')) || [];
        userXP = parseInt(localStorage.getItem('userXP')) || 0;
        userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
        walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
        userStars = parseInt(localStorage.getItem('userStars')) || 0;
        pegasusShards = parseInt(localStorage.getItem('pegasusShards')) || 0; 
        userJokers = parseInt(localStorage.getItem('userJokers')) || 0; 
        ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
        activeTheme = localStorage.getItem('activeTheme') || 'default';
        activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
        selectedAvatar = localStorage.getItem('selectedAvatar') || 'default'; 
        let s = JSON.parse(localStorage.getItem('userStats')); if(s) userStats = {...userStats, ...s};
        let b = JSON.parse(localStorage.getItem('myBoosters')); if(b) myBoosters = {luck: b.luck||0, speed: b.speed||0};
        claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];
        claimedQuests = JSON.parse(localStorage.getItem('claimedQuests')) || [];
        usedCodes = JSON.parse(localStorage.getItem('usedCodes')) || [];
        isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';
        isSoundOn = localStorage.getItem('isSoundOn') === 'true';
        
        vipEndTime = parseInt(localStorage.getItem('vipEndTime')) || 0;
        hasSecondSlot = localStorage.getItem('hasSecondSlot') === 'true';
        secondSlotEndTime = parseInt(localStorage.getItem('secondSlotEndTime')) || 0;
        lastRouletteDate = localStorage.getItem('lastRouletteDate') || "";

    } catch(e) { console.error("Local Load Error", e); }

    checkBackgroundHatch(); checkTutorial();
    if (localStorage.getItem('tutorialSeen')) checkDailyReward();

    updateLevelUI(); updateBalanceUI(); applyTheme(); applyEggSkin(); updateUI(); 
    if (selectedAvatar !== 'default') { getEl('header-profile-btn').innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar">`; }
    
    if(getEl('vibration-toggle')) { getEl('vibration-toggle').checked = isVibrationOn; getEl('vibration-toggle').onchange = (e) => { isVibrationOn = e.target.checked; localStorage.setItem('isVibrationOn', isVibrationOn); playSound('click'); }; }
    if(getEl('sound-toggle')) { getEl('sound-toggle').checked = isSoundOn; getEl('sound-toggle').onchange = (e) => { isSoundOn = e.target.checked; localStorage.setItem('isSoundOn', isSoundOn); if(isSoundOn) playSound('click'); }; }
    
    updateSecondSlotUI();
    loadFromCloud();
    apiSyncGlobalProfile();
    startInvitesPolling();
}

function loadFromCloud() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        const keys = ['walletBalance', 'userStars', 'userXP', 'userLevel', 'myCollection', 'ownedItems', 'activeTheme', 'activeEggSkin', 'userStats', 'myBoosters', 'claimedAchievements', 'claimedQuests', 'selectedAvatar', 'pegasusShards', 'vipEndTime', 'hasSecondSlot', 'secondSlotEndTime', 'userJokers', 'lastRouletteDate'];
        Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
            if (err || !values) return;
            if (values.walletBalance) walletBalance = parseInt(values.walletBalance);
            if (values.userStars) userStars = parseInt(values.userStars);
            if (values.userXP) userXP = parseInt(values.userXP);
            if (values.userLevel) userLevel = parseInt(values.userLevel);
            if (values.pegasusShards) pegasusShards = parseInt(values.pegasusShards);
            if (values.userJokers) userJokers = parseInt(values.userJokers);
            if (values.myCollection) collection = JSON.parse(values.myCollection);
            if (values.ownedItems) ownedItems = JSON.parse(values.ownedItems);
            if (values.activeTheme) activeTheme = values.activeTheme;
            if (values.activeEggSkin) activeEggSkin = values.activeEggSkin;
            if (values.selectedAvatar) selectedAvatar = values.selectedAvatar;
            if (values.userStats) userStats = {...userStats, ...JSON.parse(values.userStats)};
            if (values.myBoosters) myBoosters = {...myBoosters, ...JSON.parse(values.myBoosters)};
            if (values.claimedAchievements) claimedAchievements = JSON.parse(values.claimedAchievements);
            if (values.claimedQuests) claimedQuests = JSON.parse(values.claimedQuests);
            
            if (values.vipEndTime) vipEndTime = parseInt(values.vipEndTime);
            if (values.hasSecondSlot) hasSecondSlot = values.hasSecondSlot === 'true';
            if (values.secondSlotEndTime) secondSlotEndTime = parseInt(values.secondSlotEndTime);
            if (values.lastRouletteDate) lastRouletteDate = values.lastRouletteDate;

            if (selectedAvatar !== 'default') { getEl('header-profile-btn').innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar">`; }
            
            updateBalanceUI(); updateLevelUI(); applyTheme(); applyEggSkin(); updateSecondSlotUI();
            saveData(); apiSyncGlobalProfile();
        });
    }
}

function saveData() {
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

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
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
    }
}

// =============================================================
// 5. ИНТЕРФЕЙС И БАЗОВЫЕ ОКНА
// =============================================================
function applyTheme() { 
    if (activeTheme === 'matrix') {
        document.body.className = 'theme-matrix';
        document.body.style.backgroundImage = 'none';
        return;
    }
    document.body.className = '';
    const t=SHOP_DATA.themes.find(x=>x.id===activeTheme); 
    if(t && t.bgFile) document.body.style.backgroundImage = `url('${t.bgFile}')`; else { document.body.style.backgroundImage = 'none'; document.body.style.backgroundColor = '#1c1c1e'; }
}

function applyEggSkin() { 
    const egg=getEl('egg-display'); 
    if (activeEggSkin === 'holo') {
        egg.className = 'egg-img holo-egg';
        egg.src = 'assets/eggs/egg-ice.png';
        if(isRunning) egg.classList.add('shaking'); 
        return;
    }
    const s=SHOP_DATA.eggs.find(x=>x.id===activeEggSkin); 
    if (s) egg.src = s.img; else egg.src = 'assets/eggs/egg-default.png';
    egg.className = 'egg-img'; if(isRunning) egg.classList.add('shaking'); 
}

function updateLevelUI() { 
    const max=userLevel*200; let p=(userXP/max)*100; if(p>100)p=100; 
    getEl('xp-bar').style.width=`${p}%`; 
    getEl('level-number').textContent=`Lvl ${userLevel}`; 
    let r=Math.floor(userLevel/5); 
    getEl('rank-name').textContent=RANKS[Math.min(r,RANKS.length-1)] || "Создатель"; 
}

function switchShopTab(t) { 
    currentShopTab=t; document.querySelectorAll('#shop-modal .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderShop(); playSound('click'); 
}

function renderShop() {
    const c=getEl('shop-items'); c.innerHTML='';
    
    // ПРЕМИУМ МАГАЗИН ЗА ЗВЕЗДЫ
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
        const d=document.createElement('div'); d.className='shop-item';
        let btnHTML='';
        if(currentShopTab==='boosters') {
            btnHTML=`<button class="buy-btn" onclick="buyItem('${item.id}',${item.price})">${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`;
            d.innerHTML=`<img src="${item.icon}" class="shop-icon-img"><div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888">${item.desc}</div>${btnHTML}`;
        } else if(currentShopTab==='eggs') {
            const owned=ownedItems.eggs.includes(item.id); const active=activeEggSkin===item.id;
            let cls=owned?"buy-btn owned":"buy-btn"; if(!owned&&walletBalance<item.price)cls+=" locked"; let txt=owned?(active?"Выбрано":"Выбрать") : `${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML=`<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            d.innerHTML=`<img src="${item.img}" class="shop-icon-img"><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        } else {
            const owned=ownedItems.themes.includes(item.id); const active=activeTheme===item.id;
            let cls=owned?"buy-btn owned":"buy-btn"; if(!owned&&walletBalance<item.price)cls+=" locked"; let txt=owned?(active?"Выбрано":"Выбрать"):`${item.price} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle">`;
            btnHTML=`<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            let icon = item.bgFile ? `<img src="${item.bgFile}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;margin-bottom:5px">` : `<div style="width:60px;height:60px;background:#333;border-radius:10px;margin-bottom:5px"></div>`;
            d.innerHTML=`${icon}<div class="shop-item-name">${item.name}</div>${btnHTML}`;
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
    if(typeof price === 'string') { showToast("Это покупается за Звезды!", "⭐️"); return; }
    if(currentShopTab==='boosters') {
        if(walletBalance>=price) { walletBalance-=price; if(!myBoosters[id])myBoosters[id]=0; myBoosters[id]++; saveData(); updateBalanceUI(); showToast("Куплено!", "🧪"); playSound('money'); } else showToast("Мало денег", "🚫");
        return;
    }
    const category = currentShopTab; const owned=ownedItems[category].includes(id);
    if(owned) {
        if(category==='themes') { activeTheme=id; applyTheme(); } else { activeEggSkin=id; applyEggSkin(); }
        saveData(); renderShop(); playSound('click');
    } else {
        if(walletBalance>=price) {
            walletBalance-=price; ownedItems[category].push(id);
            if(category==='themes') { activeTheme=id; applyTheme(); } else { activeEggSkin=id; applyEggSkin(); }
            saveData(); updateBalanceUI(); renderShop(); showToast("Куплено!", "🛍️"); playSound('money');
        } else showToast("Мало денег", "🚫");
    }
}

function switchAchTab(t) { currentAchTab=t; document.querySelectorAll('#achievements-modal .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); if(t==='achievements')renderAch();else renderQuests(); playSound('click'); }

function renderAch() {
    const c=getEl('achievements-list'); c.innerHTML=''; let u=new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => {
        const claimed=claimedAchievements.includes(a.id); let done=false; 
        if(a.type==='money' && walletBalance >= a.goal) done = true;
        if(a.type==='unique' && u >= a.goal) done = true;
        if(a.type==='hatch' && userStats.hatched >= a.goal) done = true;
        if(!a.type && userStats.hatched >= a.goal) done = true;
        if(a.type==='level' && userLevel >= a.goal) done = true;
        if(a.type==='craft' && userStats.crafts >= a.goal) done = true;
        const d=document.createElement('div'); d.className=`achievement-card ${done?'unlocked':''}`;
        let btn=''; if(done&&!claimed)btn=`<button class="buy-btn" onclick="claimAch('${a.id}',${a.reward})">Забрать ${a.reward} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`; else if(claimed)btn="✅"; else btn=`<span style="font-size:12px;color:#888">Цель: ${a.goal}</span>`;
        d.innerHTML=`<div class="ach-icon">${done?'<img src="assets/ui/icon-trophy.png">':'<img src="assets/ui/icon-lock.png">'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function renderQuests() {
    const c=getEl('achievements-list'); c.innerHTML='';
    QUESTS_DATA.forEach(q => {
        const claimed=claimedQuests.includes(q.id); const d=document.createElement('div'); d.className=`achievement-card ${claimed?'unlocked':''}`;
        let btn=''; if(claimed)btn="✅"; else if(q.type==='link')btn=`<button id="qbtn-${q.id}" class="buy-btn" style="background:#007aff" onclick="clickLink('${q.id}','${q.url}',${q.reward})">Выполнить</button>`; else if(q.type==='invite') { if((userStats.invites||0)>=q.goal)btn=`<button class="buy-btn" onclick="claimQuest('${q.id}',${q.reward})">Забрать ${q.reward} <img src="assets/ui/coin.png" style="width:12px;vertical-align:middle"></button>`; else btn=`<span style="font-size:12px;color:#888">${userStats.invites||0}/${q.goal}</span>`; }
        d.innerHTML=`<div class="ach-icon">📜</div><div class="ach-info"><div class="ach-title">${q.title}</div><div class="ach-desc">${q.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function clickLink(id, u, r) { if(window.Telegram.WebApp)window.Telegram.WebApp.openLink(u); else window.open(u,'_blank'); const b=getEl(`qbtn-${id}`); if(b){b.textContent="Проверяю...";b.disabled=true;b.style.background="#555";setTimeout(()=>claimQuest(id,r),4000);}}
function claimAch(id, r) { if(claimedAchievements.includes(id))return; claimedAchievements.push(id); walletBalance+=r; saveData(); updateBalanceUI(); renderAch(); showToast(`Награда +${r}`, 'img'); playSound('money'); }
function claimQuest(id, r) { if(claimedQuests.includes(id))return; claimedQuests.push(id); walletBalance+=r; saveData(); updateBalanceUI(); renderQuests(); showToast(`Награда +${r}`, 'img'); playSound('money'); }
function handleShare() { if(!userStats.invites)userStats.invites=0; userStats.invites++; saveData(); checkAchievements(); const t=`У меня ${new Set(collection).size} петов в Focus Hatcher!`; const u=`https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(t)}`; if(window.Telegram.WebApp)window.Telegram.WebApp.openTelegramLink(u); else window.open(u,'_blank'); }

// =============================================================
// РУЛЕТКА F2P УДЕРЖАНИЕ
// =============================================================
function openRouletteModal() {
    getEl('roulette-result-text').textContent = "";
    getEl('roulette-box').className = 'roulette-box';
    const today = new Date().toDateString();
    
    if (lastRouletteDate !== today) {
        getEl('roulette-free-btn').style.display = 'block';
        getEl('roulette-paid-btn').style.display = 'none';
    } else {
        getEl('roulette-free-btn').style.display = 'none';
        getEl('roulette-paid-btn').style.display = 'block';
    }
    openModal('roulette-modal');
}

function spinRoulette(isFree) {
    if (!isFree) {
        if (userStars < 10) {
            showToast("Недостаточно Звезд!", "❌");
            return;
        }
        userStars -= 10;
        updateBalanceUI();
    } else {
        lastRouletteDate = new Date().toDateString();
        getEl('roulette-free-btn').style.display = 'none';
        getEl('roulette-paid-btn').style.display = 'block';
    }
    
    playSound('click');
    saveData();
    
    const box = getEl('roulette-box');
    const resText = getEl('roulette-result-text');
    
    getEl('roulette-paid-btn').disabled = true;
    box.className = 'roulette-box roulette-spinning';
    resText.textContent = "Крутим...";
    
    setTimeout(() => {
        box.className = 'roulette-box';
        getEl('roulette-paid-btn').disabled = false;
        
        let rnd = Math.random() * 100;
        let selectedPrize = null;
        for (let p of ROULETTE_PRIZES) {
            if (rnd < p.p) { selectedPrize = p; break; }
            rnd -= p.p;
        }
        if(!selectedPrize) selectedPrize = ROULETTE_PRIZES[0];
        
        playSound('win');
        fireConfetti();
        
        if (selectedPrize.t === 'money') { walletBalance += selectedPrize.v; showToast(`+${selectedPrize.v} монет!`, "💰"); box.textContent = "💰"; }
        else if (selectedPrize.t === 'stars') { userStars += selectedPrize.v; showToast(`+${selectedPrize.v} Звезд!`, "⭐️"); box.textContent = "⭐️"; }
        else if (selectedPrize.t === 'joker') { userJokers += selectedPrize.v; showToast(`Ген Мутации!`, "🧬"); box.textContent = "🧬"; }
        else if (selectedPrize.t === 'shard') { pegasusShards += selectedPrize.v; showToast(`Осколок Пегаса!`, "🧩"); box.textContent = "🦄"; }
        else if (selectedPrize.t === 'luck') { if (!myBoosters.luck) myBoosters.luck=0; myBoosters.luck += selectedPrize.v; showToast(`Зелье удачи!`, "🧪"); box.textContent = "🧪"; }
        else if (selectedPrize.t === 'speed') { if (!myBoosters.speed) myBoosters.speed=0; myBoosters.speed += selectedPrize.v; showToast(`Ускоритель!`, "⚡️"); box.textContent = "⚡️"; }

        resText.textContent = `Выпало: ${selectedPrize.n}`;
        saveData();
        updateBalanceUI();
    }, 2000);
}

// =============================================================
// 6. ПРОФИЛЬ И ДРУЗЬЯ
// =============================================================
async function apiSyncGlobalProfile() {
    const user = getTgUser(); let netWorth = walletBalance; collection.forEach(pet => netWorth += PRICES[getPetRarity(pet)] || 0);
    let finalName = user.name;
    if (isVip()) finalName += ' 👑'; 
    
    try {
        await fetch(`${API_URL}/users/sync`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: finalName, avatar: selectedAvatar, level: userLevel, earned: netWorth, hatched: userStats.hatched || 0 })
        });
    } catch(e) {}
}

function startInvitesPolling() {
    if(invitesPollingInterval) clearInterval(invitesPollingInterval);
    invitesPollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_URL}/invites/check/${getTgUser().id}`);
            const data = await res.json();
            if (data.has_invite && !modalStack.includes('incoming-invite-modal')) {
                currentPendingInviteId = data.invite.id;
                getEl('invite-sender-name').textContent = data.invite.sender_name;
                getEl('invite-sender-avatar').src = getPetImg(data.invite.sender_avatar);
                getEl('incoming-invite-modal').setAttribute('data-party', data.invite.party_code);
                playSound('win');
                openModal('incoming-invite-modal');
            }
        } catch(e) {}
    }, 5000);
}

async function declineInvite() {
    if(currentPendingInviteId) {
        try { await fetch(`${API_URL}/invites/clear`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: String(currentPendingInviteId) }) }); } catch(e) {}
    }
    closeModal('incoming-invite-modal');
}

async function acceptInvite() {
    const code = getEl('incoming-invite-modal').getAttribute('data-party');
    await declineInvite(); 
    if(currentPartyCode) await apiLeaveParty();
    getEl('party-code-input').value = code;
    await apiJoinParty(code);
    openModal('party-modal');
}

function switchProfileTab(tab) {
    document.querySelectorAll('#profile-modal .tab-btn').forEach(b=>b.classList.remove('active')); 
    event.target.classList.add('active'); playSound('click');
    if(tab === 'stats') {
        getEl('profile-stats-view').style.display = 'block'; getEl('profile-friends-view').style.display = 'none';
    } else {
        getEl('profile-stats-view').style.display = 'none'; getEl('profile-friends-view').style.display = 'block';
        getEl('my-friend-code').value = getTgUser().id; apiLoadFriends(); 
    }
}

function openProfile() {
    apiSyncGlobalProfile(); 
    getEl('profile-rank').textContent = RANKS[Math.floor(userLevel / 5)] || "Создатель";
    if (isVip()) getEl('profile-rank').innerHTML += ' <span style="color:#ffd700">👑 PRO</span>';
    
    getEl('profile-level').textContent = `Уровень ${userLevel}`;
    getEl('stat-hatched').textContent = userStats.hatched || 0;
    getEl('stat-unique').textContent = new Set(collection).size;
    getEl('stat-invites').textContent = userStats.invites || 0;
    let netWorth = walletBalance;
    collection.forEach(pet => netWorth += PRICES[getPetRarity(pet)] || 0);
    ownedItems.themes.forEach(t => { const item = SHOP_DATA.themes.find(x=>x.id===t); if(item) netWorth += item.price; });
    ownedItems.eggs.forEach(e => { const item = SHOP_DATA.eggs.find(x=>x.id===e); if(item) netWorth += item.price; });
    getEl('stat-earned').textContent = netWorth; 
    getEl('profile-avatar').src = getPetImg(selectedAvatar);
    
    getEl('profile-stats-view').style.display = 'block'; getEl('profile-friends-view').style.display = 'none';
    document.querySelectorAll('#profile-modal .tab-btn')[0].classList.add('active');
    document.querySelectorAll('#profile-modal .tab-btn')[1].classList.remove('active');
    openModal('profile-modal');
}

function copyMyCode() {
    const code = getEl('my-friend-code').value;
    navigator.clipboard.writeText(code).then(() => showToast("Код скопирован!", "📋"));
}

async function apiAddFriend() {
    playSound('click'); const input = getEl('add-friend-input'); const friendId = input.value.trim();
    if(!friendId || friendId === getTgUser().id) return showToast("Неверный ID", "❌");
    try {
        const res = await fetch(`${API_URL}/friends/add`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: getTgUser().id, friend_id: friendId })
        });
        const data = await res.json();
        if(data.status === 'success') { showToast("Друг добавлен!", "🤝"); input.value = ''; apiLoadFriends(); } 
        else { showToast(data.detail || "Ошибка", "❌"); }
    } catch(e) { showToast("Ошибка сети", "❌"); }
}

async function apiLoadFriends() {
    const container = getEl('friends-list-container'); container.innerHTML = '<div style="text-align:center; color:#888;">Загрузка...</div>';
    try {
        const res = await fetch(`${API_URL}/friends/list/${getTgUser().id}`); const data = await res.json();
        container.innerHTML = '';
        if(data.friends.length === 0) { container.innerHTML = '<div style="text-align:center; color:#888;">У вас пока нет друзей</div>'; return; }
        data.friends.forEach(f => {
            const encodedFriend = encodeURIComponent(JSON.stringify(f));
            container.innerHTML += `
                <div class="achievement-card" style="cursor: pointer;" onclick="openFriendProfile('${encodedFriend}')">
                    <img src="${getPetImg(f.avatar)}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #007aff;">
                    <div class="ach-info"><div class="ach-title">${f.name}</div><div class="ach-desc">Уровень ${f.level}</div></div>
                </div>
            `;
        });
    } catch(e) { container.innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>'; }
}

let currentViewingFriendId = null;
function openFriendProfile(encodedFriend) {
    playSound('click'); const f = JSON.parse(decodeURIComponent(encodedFriend)); currentViewingFriendId = f.user_id;
    getEl('fp-name').textContent = f.name; getEl('fp-avatar').src = getPetImg(f.avatar);
    getEl('fp-level').textContent = `Уровень ${f.level}`; getEl('fp-hatched').textContent = f.hatched || 0; getEl('fp-earned').textContent = f.earned || 0;
    if (currentPartyCode) { getEl('fp-invite-btn').style.display = 'block'; getEl('fp-invite-hint').style.display = 'none'; } 
    else { getEl('fp-invite-btn').style.display = 'none'; getEl('fp-invite-hint').style.display = 'block'; }
    openModal('friend-profile-modal');
}

async function sendInviteToFriend() {
    playSound('click'); if(!currentPartyCode || !currentViewingFriendId) return;
    const btn = getEl('fp-invite-btn'); btn.textContent = "Отправляем..."; btn.disabled = true;
    try {
        await fetch(`${API_URL}/invites/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender_id: getTgUser().id, receiver_id: currentViewingFriendId, party_code: currentPartyCode }) });
        showToast("Приглашение отправлено!", "💌");
    } catch(e) { showToast("Ошибка", "❌"); }
    setTimeout(() => { btn.textContent = "Позвать в свою Пати 🎮"; btn.disabled = false; closeModal('friend-profile-modal'); }, 1000);
}

// =============================================================
// 7. ДОПОЛНИТЕЛЬНЫЕ ОКНА И НАГРАДЫ
// =============================================================
function openLevels() {
    const list = getEl('levels-list'); list.innerHTML = '';
    for (let lvl = 1; lvl <= 100; lvl++) {
        if (!LEVEL_REWARDS[lvl]) continue;
        const info = LEVEL_REWARDS[lvl]; const isReached = userLevel >= lvl;
        const status = isReached ? `<img src="assets/ui/icon-check.png" style="width:20px">` : `<img src="assets/ui/icon-lock.png" style="width:20px">`;
        const div = document.createElement('div'); div.className = `level-item ${isReached ? 'active' : 'locked'}`;
        let rewardText = info.reward || "Нет";
        if(rewardText && rewardText.includes("монет")) rewardText = rewardText.replace("монет", `<img src="assets/ui/coin.png" style="width:16px;vertical-align:middle">`);
        div.innerHTML = `<div class="rank-icon">${status}</div><div class="rank-details"><div class="rank-title">Ур. ${lvl}: ${info.title}</div><div class="rank-desc">Награда: ${rewardText}</div></div>`;
        list.appendChild(div);
    }
    openModal('levels-modal');
}

function checkAchievements() {
    let has = false; let u = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => { 
        if(!claimedAchievements.includes(a.id)) { 
            if(a.type==='money' && walletBalance >= a.goal) has = true;
            if(a.type==='unique' && u >= a.goal) has = true;
            if(a.type==='hatch' && userStats.hatched >= a.goal) has = true;
            if(!a.type && userStats.hatched >= a.goal) has = true;
            if(a.type==='level' && userLevel >= a.goal) has = true;
            if(a.type==='craft' && userStats.crafts >= a.goal) has = true;
        } 
    });
    QUESTS_DATA.forEach(q => { if(!claimedQuests.includes(q.id)&&q.type==='invite'&&(userStats.invites||0)>=q.goal) has=true; });
    
    // БЕЗОПАСНАЯ ПРОВЕРКА КНОПКИ АЧИВОК
    const badge = getEl('ach-badge');
    if (badge) badge.style.display = has ? 'block' : 'none';
}

function openAvatarSelector() {
    const list = getEl('avatar-list'); list.innerHTML = '';
    const uniquePets = [...new Set(collection)];
    if (uniquePets.length === 0) { list.innerHTML = "<p style='color:#888; grid-column:span 4;'>Сначала выбей питомца!</p>"; }
    uniquePets.forEach(pet => {
        const div = document.createElement('div');
        div.className = `avatar-item ${selectedAvatar === pet ? 'selected' : ''}`;
        div.innerHTML = `<img src="assets/pets/pet-${pet}.png">`;
        div.onclick = () => {
            selectedAvatar = pet; saveData();
            getEl('profile-avatar').src = getPetImg(pet);
            getEl('header-profile-btn').innerHTML = `<img src="assets/pets/pet-${pet}.png" class="header-icon-img header-avatar">`;
            if(currentPartyCode) apiUpdatePlayerAvatar();
            closeModal('avatar-modal'); showToast("Аватар изменен!");
        };
        list.appendChild(div);
    });
    openModal('avatar-modal');
}

async function apiUpdatePlayerAvatar() {
    let finalName = getTgUser().name;
    if (isVip()) finalName += ' 👑';
    try { await fetch(`${API_URL}/party/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin }) }); } catch(e) {}
}

function openPromo() { openModal('promo-modal'); }
function activatePromo() {
    const input = getEl('promo-input'); const code = input.value.toUpperCase().trim();
    if (usedCodes.includes(code)) { showToast("Уже активирован!", "🚫"); return; }
    if (PROMO_CODES[code]) {
        const reward = PROMO_CODES[code];
        if (reward.type === 'money') { walletBalance += reward.val; showToast(`+${reward.val}`, 'img'); } 
        else if (reward.type === 'booster') { if (!myBoosters[reward.id]) myBoosters[reward.id] = 0; myBoosters[reward.id] += reward.val; showToast(`+${reward.val} буст`, 'img'); }
        usedCodes.push(code); saveData(); updateBalanceUI(); playSound('win'); closeModal('promo-modal'); input.value = "";
    } else { showToast("Неверный код", "❌"); }
}

function checkTutorial() { if (!localStorage.getItem('tutorialSeen')) openModal('tutorial-modal'); }
window.closeTutorial = function() { localStorage.setItem('tutorialSeen', 'true'); closeModal('tutorial-modal'); checkDailyReward(); }

function checkDailyReward() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    let streak = parseInt(localStorage.getItem('dailyStreak')) || 0;
    if (lastLogin === today) return; 
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (lastLogin !== yesterday.toDateString()) streak = 0;
    renderDailyModal(streak); openModal('daily-modal'); playSound('win'); 
}
function renderDailyModal(curr) {
    const g = getEl('daily-grid'); g.innerHTML = '';
    DAILY_REWARDS.forEach((r, i) => {
        const d = document.createElement('div');
        let st = ''; if(i<curr) st='claimed'; if(i===curr) st='active';
        d.className = `daily-item ${st}`;
        let iconHTML = '';
        if (r.type === 'money') iconHTML = `<img src="assets/ui/coin.png" class="daily-icon-img">`;
        else if (r.type === 'booster' && r.id === 'speed') iconHTML = `<img src="assets/ui/booster-speed.png" class="daily-icon-img">`;
        else if (r.type === 'mixed') iconHTML = `<img src="assets/ui/icon-trophy.png" class="daily-icon-img">`; 
        let v = (r.type==='money'||r.type==='mixed') ? `+${r.money||r.val}` : '+1 Буст';
        d.innerHTML = `<div class="daily-day">День ${r.day}</div>${iconHTML}<div class="daily-val">${v}</div>`;
        g.appendChild(d);
    });
}
window.claimDaily = function() {
    let s = parseInt(localStorage.getItem('dailyStreak')) || 0;
    const t = new Date().toDateString();
    const l = localStorage.getItem('lastLoginDate');
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (l && l !== y.toDateString()) s = 0;
    const r = DAILY_REWARDS[s];
    
    let bonusMult = isVip() ? 1.2 : 1;
    
    if (r.type === 'money') walletBalance += Math.floor(r.val * bonusMult);
    else if (r.type === 'booster') { if (!myBoosters[r.id]) myBoosters[r.id] = 0; myBoosters[r.id]++; } 
    else if (r.type === 'mixed') { walletBalance += Math.floor(r.money * bonusMult); if (!myBoosters[r.booster]) myBoosters[r.booster] = 0; myBoosters[r.booster]++; }
    s++; if (s >= 7) s = 0;
    localStorage.setItem('dailyStreak', s); localStorage.setItem('lastLoginDate', t);
    saveData(); updateBalanceUI(); showToast("Награда получена!", "📅"); closeModal('daily-modal'); playSound('money');
}

function openShop() { switchShopTab('themes'); openModal('shop-modal'); }
function openSettings() { openModal('settings-modal'); }
function openAch() { switchAchTab('achievements'); openModal('achievements-modal'); }

// ТЕСТОВЫЕ ПОКУПКИ ЗВЕЗД
function openBuyStarsModal() {
    openModal('buy-stars-modal');
}
function buyStarsTest(amount) {
    playSound('money');
    userStars += amount;
    saveData();
    updateBalanceUI();
    showToast(`Куплено ${amount} Звезд! (Тест)`, '⭐️');
    closeModal('buy-stars-modal');
}

// =============================================================
// 8. БАЗОВЫЙ ТАЙМЕР И ФОКУС
// =============================================================
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning && currentHatchMode === 'online') stopTimer(true); 
});

function updateBalanceUI() {
    getEl('total-money').innerHTML = `<img src="assets/ui/coin.png" class="coin-img"> ${walletBalance}`;
    let starsEl = getEl('total-stars');
    if(starsEl) starsEl.innerHTML = `<span style="font-size: 20px; margin-right: 4px;">⭐️</span> ${userStars} <span style="font-size: 14px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 8px; margin-left: 5px;">+</span>`;
    getEl('unique-count').textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
    renderBoostersPanel();
}

function renderBoostersPanel() {
    const p = getEl('boosters-panel'); p.innerHTML = '';
    p.appendChild(createBoosterBtn('luck', 'assets/ui/booster-luck.png', myBoosters.luck||0, activeBoosters.luck));
    p.appendChild(createBoosterBtn('speed', 'assets/ui/booster-speed.png', myBoosters.speed||0, activeBoosters.speed));
}

function createBoosterBtn(type, img, count, isActive) {
    const d = document.createElement('div');
    d.className = `booster-slot ${isActive?'active':''} ${count===0?'empty':''}`;
    d.innerHTML = `<img src="${img}"> <div class="booster-count">${count}</div>`;
    d.onclick = () => {
        if(count>0 && !isRunning) { 
            activeBoosters[type] = !activeBoosters[type]; 
            renderBoostersPanel(); updateUI(); playSound('click');
        }
    };
    return d;
}

function prevMode() { if(!isRunning) { currentModeIndex--; if(currentModeIndex<0) currentModeIndex=MODES.length-1; updateUI(); playSound('click'); }}
function nextMode() { if(!isRunning) { currentModeIndex++; if(currentModeIndex>=MODES.length) currentModeIndex=0; updateUI(); playSound('click'); }}

function openCustomEggModal() { updateCustomEggTimes(); openModal('custom-egg-modal'); }
function updateCustomEggTimes() {
    const r = getEl('custom-rarity-select').value;
    if(r==='all') { customEggConfig.timeOnline=3600; customEggConfig.timeOffline=5*3600; }
    else if(r==='common') { customEggConfig.timeOnline=3600; customEggConfig.timeOffline=6*3600; }
    else if(r==='rare') { customEggConfig.timeOnline=2*3600; customEggConfig.timeOffline=7*3600; }
    else if(r==='legendary') { customEggConfig.timeOnline=3*3600; customEggConfig.timeOffline=8*3600; }
    getEl('custom-egg-times').textContent = `Онлайн: ${customEggConfig.timeOnline/3600} ч | Оффлайн: ${customEggConfig.timeOffline/3600} ч`;
}
function saveCustomEgg() {
    customEggConfig.target = getEl('custom-rarity-select').value;
    closeModal('custom-egg-modal');
    updateUI();
}

function updateUI() {
    const m = MODES[currentModeIndex];
    let t = currentModeIndex === 2 ? customEggConfig.timeOnline : m.timeOnline;
    
    if(activeBoosters.speed) {
        if (currentModeIndex === 0) t = 20 * 60; 
        else if (currentModeIndex === 1) t = 45 * 60; 
        else t = Math.floor(t * 0.7); 
    }

    if(!isRunning) { 
        const eggDisplay = getEl('egg-display');
        eggDisplay.className = 'egg-img'; 
        if (m.egg === 'diamond') eggDisplay.src = 'assets/eggs/egg-diamond.png';
        else applyEggSkin();
        getEl('timer').textContent = formatTime(t); 
        getEl('hatched-info').style.display = 'none';
        getEl('custom-egg-btn').style.display = currentModeIndex === 2 ? 'block' : 'none';
    }
    
    getEl('mode-title').textContent = m.title;
    getEl('mode-subtitle').innerHTML = currentModeIndex === 2 ? `Настрой редкость <span style="font-size:10px;">(${customEggConfig.target})</span>` : m.sub;
}

// -------------------------------------------------------------
// ВТОРОЙ ИНКУБАТОР (ОФФЛАЙН СЛОТ 2)
// -------------------------------------------------------------
function updateSecondSlotUI() {
    const panel = getEl('second-slot-panel');
    if (!panel) return;
    
    if(!hasSecondSlot) {
        panel.style.display = 'none';
        return;
    }
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
    const m = MODES[currentModeIndex];
    let time = currentModeIndex === 2 ? customEggConfig.timeOffline : m.timeOffline;
    secondSlotEndTime = Date.now() + (time * 1000);
    saveData();
    updateSecondSlotUI();
}

function claimSecondSlot() {
    playSound('win');
    secondSlotEndTime = 0;
    
    let leg = 5; let rare = 30;
    let pool;
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
            timeLeft = 0; finishTimer(true); localStorage.removeItem('hatchEndTime'); showToast("Яйцо из инкубатора готово!", "🤖");
        } else {
            timeLeft = Math.round((hatchEndTime - now) / 1000); startTimer('offline', true); 
        }
    }
}

function startTimer(mode, isResuming = false) {
    currentHatchMode = mode; const m = MODES[currentModeIndex]; let baseTime = 0;
    
    if (!isResuming) {
        if (currentModeIndex === 2) baseTime = mode === 'online' ? customEggConfig.timeOnline : customEggConfig.timeOffline;
        else baseTime = mode === 'online' ? m.timeOnline : m.timeOffline;

        if (activeBoosters.speed) {
            if (currentModeIndex === 0 && mode === 'online') baseTime = 20 * 60; 
            else if (currentModeIndex === 1 && mode === 'online') baseTime = 45 * 60;
            else baseTime = Math.floor(baseTime * 0.7); 
            myBoosters.speed--; activeBoosters.speed = false;
        }
        timeLeft = baseTime;
        
        if (mode === 'offline') {
            localStorage.setItem('hatchEndTime', Date.now() + timeLeft * 1000);
            localStorage.setItem('hatchEggType', currentModeIndex);
            if(currentModeIndex === 2) localStorage.setItem('hatchTarget', customEggConfig.target);
            saveData();
        }
    }
    
    isRunning = true;
    getEl('timer').textContent = formatTime(timeLeft);
    getEl('start-buttons-container').style.display = 'none';
    getEl('main-btn').style.display = 'block'; getEl('main-btn').textContent = "Сдаться"; getEl('main-btn').className = "btn stop";
    getEl('share-btn').style.display = 'none'; getEl('prev-btn').style.visibility = 'hidden'; getEl('next-btn').style.visibility = 'hidden';
    getEl('hatched-info').style.display = 'none'; getEl('custom-egg-btn').style.display = 'none';
    if (mode === 'online') getEl('offline-warning').style.display = 'block';

    if (!isResuming) {
        if (m.egg === 'diamond') getEl('egg-display').src = 'assets/eggs/egg-diamond.png';
        else applyEggSkin();
        getEl('crack-overlay').className = 'crack-overlay'; 
    }
    
    getEl('egg-display').className = 'egg-img shaking'; renderBoostersPanel();
    
    const totalTime = isResuming ? timeLeft : baseTime; 
    
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--; getEl('timer').textContent = formatTime(timeLeft);
        const progress = 1 - (timeLeft / totalTime);
        const overlay = getEl('crack-overlay');
        if (progress > 0.25 && progress < 0.5) overlay.className = 'crack-overlay crack-stage-1';
        else if (progress >= 0.5 && progress < 0.75) overlay.className = 'crack-overlay crack-stage-2';
        else if (progress >= 0.75) overlay.className = 'crack-overlay crack-stage-3';
        if(timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer(failed = false) {
    clearInterval(timerInterval); 
    isRunning = false;
    
    if (failed) {
        getEl('resurrect-modal').style.display = 'flex';
        let resTime = 20; 
        getEl('resurrect-timer').textContent = resTime;
        
        if (resurrectCountdownInterval) clearInterval(resurrectCountdownInterval);
        resurrectCountdownInterval = setInterval(() => {
            resTime--;
            getEl('resurrect-timer').textContent = resTime;
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
        getEl('resurrect-modal').style.display = 'none';
        showToast("Яйцо спасено! Продолжаем фокус.", "✨");
        
        startTimer(currentHatchMode, true);
    } else {
        showToast("Недостаточно Звезд!", "❌");
        openBuyStarsModal();
    }
}

function confirmFail(wasInterrupted = true) {
    clearInterval(resurrectCountdownInterval);
    getEl('resurrect-modal').style.display = 'none';
    
    localStorage.removeItem('hatchEndTime'); 
    getEl('main-btn').style.display = 'none'; 
    getEl('start-buttons-container').style.display = 'flex';
    getEl('prev-btn').style.visibility = 'visible'; 
    getEl('next-btn').style.visibility = 'visible';
    getEl('offline-warning').style.display = 'none';
    
    const eggDisplay = getEl('egg-display'); 
    eggDisplay.className = 'egg-img'; 
    eggDisplay.classList.remove('shaking'); 
    getEl('crack-overlay').className = 'crack-overlay'; 
    getEl('hatched-info').style.display = 'none';
    
    updateUI(); 
    renderBoostersPanel();
    
    if (wasInterrupted) { 
        showToast("Яйцо разбито...", "❌"); 
        playSound('click'); 
    } else { 
        showToast("Выращивание отменено", "⚠️"); 
    }
}

function finishTimer(fromOffline = false) {
    clearInterval(timerInterval); isRunning = false; localStorage.removeItem('hatchEndTime');
    getEl('offline-warning').style.display = 'none'; getEl('main-btn').style.display = 'none';
    getEl('start-buttons-container').style.display = 'flex'; getEl('share-btn').style.display = 'block'; 
    getEl('prev-btn').style.visibility = 'visible'; getEl('next-btn').style.visibility = 'visible';
    getEl('crack-overlay').className = 'crack-overlay';

    let vipMult = isVip() ? 1.2 : 1;
    const m = MODES[currentModeIndex]; userXP += Math.floor(m.xpReward * vipMult); 
    
    if(userXP >= userLevel * 200) { 
        userXP -= userLevel * 200; userLevel++; 
        showToast(`Lvl UP: ${userLevel}`, "🎉"); playSound('win'); 
        if (LEVEL_REWARDS[userLevel] && LEVEL_REWARDS[userLevel].reward && LEVEL_REWARDS[userLevel].reward.includes('Уникальный')) {
            if(userLevel===50) { collection.push("god"); showToast("Получен: 🐲 God", "🎁"); }
        }
    }
    localStorage.setItem('userXP', userXP); localStorage.setItem('userLevel', userLevel); updateLevelUI();
    userStats.hatched++;

    apiSyncGlobalProfile();

    if (currentPartyCode && !fromOffline) {
        const timeSpent = currentModeIndex === 2 ? customEggConfig.timeOnline : m.timeOnline;
        apiAddMegaEggTime(timeSpent);
    }
    
    let pool;
    if (currentModeIndex === 2 && customEggConfig.target !== 'all') {
        pool = petDatabase[customEggConfig.target]; playSound(customEggConfig.target === 'legendary' ? 'legendary' : 'win');
    } else {
        let leg = m.id==='short'?1:5; let rare=m.id==='short'?15:30;
        if(activeBoosters.luck) { leg*=5; myBoosters.luck--; activeBoosters.luck=false; }
        const rnd = Math.random()*100;
        if(rnd<leg) { pool=petDatabase.legendary; playSound('legendary'); }
        else if(rnd<leg+rare) { pool=petDatabase.rare; playSound('win'); }
        else { pool=petDatabase.common; playSound('win'); }
    }
    
    const dropped = pool[Math.floor(Math.random()*pool.length)]; collection.push(dropped); saveData();
    
    const eggDisplay = getEl('egg-display');
    eggDisplay.src = `assets/pets/pet-${dropped}.png`; eggDisplay.className = `hatched-img ${getPetRarity(dropped)}`;
    
    const infoBox = getEl('hatched-info'); getEl('hatched-name').textContent = PET_NAMES[dropped] || "Питомец";
    const rarityElem = getEl('hatched-rarity'); rarityElem.textContent = getPetRarity(dropped); rarityElem.className = getPetRarity(dropped);
    infoBox.style.display = 'block';
    
    fireConfetti(); showToast(`Получено!`, "🐣"); updateBalanceUI();
    if(isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(200);
}

// =============================================================
// 9. ЛАБОРАТОРИЯ (СИНТЕЗ И ПЕГАС)
// =============================================================
function openCraft() {
    getEl('pegasus-shards-count').textContent = pegasusShards;
    getEl('joker-count-display').textContent = userJokers;
    
    if(pegasusShards >= 10) {
        getEl('craft-pegasus-btn').className = "btn";
        getEl('craft-pegasus-btn').style.background = "#ffd700";
        getEl('craft-pegasus-btn').style.color = "black";
    } else {
        getEl('craft-pegasus-btn').className = "btn locked";
    }

    const c = getEl('craft-list'); c.innerHTML = ''; let canCraft = false;
    [...petDatabase.common].forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        if(count >= 5) {
            canCraft = true; const r = getPetRarity(pet); const d = document.createElement('div'); d.className = `pet-slot ${r}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot"><div class="slot-count" style="background:#ff3b30">${count}/5</div>`;
            d.onclick = () => craftPet(pet, 0); c.appendChild(d);
        } else if (count > 0 && count < 5 && userJokers >= (5 - count)) {
            canCraft = true; const r = getPetRarity(pet); const d = document.createElement('div'); d.className = `pet-slot ${r}`;
            d.style.borderColor = '#00A3FF';
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot"><div class="slot-count" style="background:#00A3FF">+${5-count} 🧬</div>`;
            d.onclick = () => craftPet(pet, 5 - count); c.appendChild(d);
        }
    });
    if(!canCraft) c.innerHTML = '<p style="grid-column: span 4; color: #888; font-size: 12px;">Собери 5 одинаковых обычных петов или используй Ген Мутации!</p>';
    openModal('craft-modal');
}

function craftPegasus() {
    if(pegasusShards >= 10) {
        pegasusShards -= 10;
        collection.push("pegasus");
        saveData(); updateBalanceUI();
        playSound('win'); fireConfetti();
        showToast("МИФИК СОЗДАН: Пегас! 🦄", "🌟");
        openCraft();
    } else {
        showToast("Не хватает осколков!", "❌");
    }
}

function craftPet(basePet, jokersUsed = 0) {
    let msg = jokersUsed > 0 ? `Соединить ${5 - jokersUsed}x ${PET_NAMES[basePet]} и ${jokersUsed}x 🧬 Джокер?` : `Соединить 5x ${PET_NAMES[basePet]}?`;
    
    if(confirm(msg)) {
        let removed = 0;
        collection = collection.filter(p => {
            if(p === basePet && removed < (5 - jokersUsed)) { removed++; return false; }
            return true;
        });
        
        if (jokersUsed > 0) {
            userJokers -= jokersUsed;
        }

        let newPet = petDatabase.rare[Math.floor(Math.random() * petDatabase.rare.length)];
        showToast(`Успех! Получен Редкий петомец`, '🧪'); playSound('win');
        collection.push(newPet); if(!userStats.crafts) userStats.crafts = 0; userStats.crafts++;
        saveData(); updateBalanceUI(); 
        openInventory(); openCraft();
    }
}

function openInventory() {
    const container = document.getElementById('collection-container'); 
    if(!container) return; container.innerHTML = ''; 
    ALL_PETS_FLAT.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const r = getPetRarity(pet); const d = document.createElement('div');
        if(count > 0) {
            d.className = `pet-slot ${r}`; d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot">`;
            if(count > 1) { const b = document.createElement('div'); b.className = 'slot-count'; b.textContent = `x${count}`; d.appendChild(b); }
            d.onclick = () => openPetModal(pet, true);
        } else {
            d.className = `pet-slot locked`; d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot">`;
            d.onclick = () => openPetModal(pet, false);
        }
        container.appendChild(d);
    });
    openModal('inventory-modal');
}

function openPetModal(pet, owned) {
    selectedPet=pet; const r=getPetRarity(pet); const p=PRICES[r];
    const petName = PET_NAMES[pet] || "Питомец";
    getEl('pet-detail-view').innerHTML = owned ? 
        `<img src="assets/pets/pet-${pet}.png" class="pet-img-big">
         <h3 class="pet-name">${petName}</h3><p class="pet-rarity ${r}">${r}</p><p class="pet-price">Цена: ${p} <img src="assets/ui/coin.png" style="width:16px;vertical-align:middle"></p>
         <button class="btn sell-action" onclick="sellPet()">Продать ${p}</button>` : 
        `<img src="assets/pets/pet-${pet}.png" class="pet-img-big" style="filter:brightness(0) opacity(0.3)">
         <h3 class="pet-name">???</h3><p class="pet-rarity ${r}">${r}</p><button class="btn" style="background:#333" onclick="closeModal('pet-modal')">Закрыть</button>`;
    openModal('pet-modal');
}

function sellPet() {
    if(!selectedPet) return; const idx=collection.indexOf(selectedPet); if(idx===-1)return;
    let basePrice = PRICES[getPetRarity(selectedPet)];
    let finalPrice = isVip() ? Math.floor(basePrice * 1.2) : basePrice;
    walletBalance += finalPrice; userStats.earned += finalPrice;
    collection.splice(idx,1); saveData(); updateBalanceUI(); 
    closeModal('pet-modal'); showToast(`Продано +${finalPrice}`, 'img'); playSound('money'); openInventory(); 
}

function toggleInventory() { openInventory(); }

// =============================================================
// 10. МУЛЬТИПЛЕЕР: БАЗОВЫЕ ФУНКЦИИ (ПАТИ)
// =============================================================

function openPartyModal() {
    if (currentPartyCode) {
        getEl('party-setup-view').style.display = 'none';
        getEl('party-active-view').style.display = 'block';
        startPartyPolling(); 
    } else {
        getEl('party-setup-view').style.display = 'block';
        getEl('party-active-view').style.display = 'none';
    }
    openModal('party-modal');
}

async function apiCreateParty() {
    playSound('click');
    const btn = event.target; btn.textContent = "Создаем сервер...";
    const user = getTgUser();
    
    let finalName = user.name;
    if (isVip()) finalName += ' 👑';

    try {
        const res = await fetch(`${API_URL}/party/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        const data = await res.json();
        currentPartyCode = data.partyCode;
        getEl('current-party-code').textContent = currentPartyCode;
        getEl('party-setup-view').style.display = 'none';
        getEl('party-active-view').style.display = 'block';
        showToast("Пати создано! Ты лидер 👑", "🎮");
        startPartyPolling();
    } catch (e) { showToast("Ошибка сервера", "❌"); }
    btn.textContent = "Создать Пати";
}

async function apiJoinParty(prefilledCode = null) {
    playSound('click');
    const code = prefilledCode || getEl('party-code-input').value.trim();
    if(code.length < 4) return showToast("Неверный код", "❌");
    const user = getTgUser();
    
    let finalName = user.name;
    if (isVip()) finalName += ' 👑';

    try {
        const res = await fetch(`${API_URL}/party/join`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, user_id: user.id, name: finalName, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
        if(res.ok) {
            currentPartyCode = code;
            getEl('current-party-code').textContent = currentPartyCode;
            getEl('party-setup-view').style.display = 'none';
            getEl('party-active-view').style.display = 'block';
            showToast("Успешный вход!", "✅");
            startPartyPolling();
        } else showToast("Пати не найдено", "❌");
    } catch(e) { showToast("Ошибка соединения", "❌"); }
}

async function apiLeaveParty(localOnly = false) {
    if(!localOnly) playSound('click');
    const user = getTgUser();
    
    if(!localOnly) {
        try {
            await fetch(`${API_URL}/party/leave`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, name: user.name, avatar: selectedAvatar, egg_skin: activeEggSkin })
            });
        } catch(e) {}
    }

    currentPartyCode = null; 
    isPartyLeader = false;
    currentActiveGame = 'none';
    isMegaRadarActive = false; 
    
    clearInterval(partyPollingInterval);
    if(bossTimerInterval) clearInterval(bossTimerInterval);
    if(expeditionInterval) clearInterval(expeditionInterval);
    if(bonusSpawningInterval) clearInterval(bonusSpawningInterval);

    ['tap-boss-modal', 'mega-egg-modal', 'expedition-modal'].forEach(m => {
        if(modalStack.includes(m)) closeModal(m);
    });

    getEl('party-setup-view').style.display = 'block';
    getEl('party-active-view').style.display = 'none';
    getEl('return-game-btn').style.display = 'none';
}

function renderPartyPlayers(players) {
    const container = getEl('party-players-list'); container.innerHTML = '';
    const header = document.querySelector('#party-active-view h3');
    if (header && players.length) header.innerHTML = `Игроки <span id="leader-badge" style="color: #ffd700; font-size: 12px; display: ${isPartyLeader ? 'inline' : 'none'};">(Вы Лидер 👑)</span>`;
    players.forEach(p => {
        container.innerHTML += `<div class="player-slot"><div class="player-avatar-circle"><img src="assets/pets/pet-${p.avatar}.png"></div><div class="player-name">${p.name}</div></div>`;
    });
}

function startPartyPolling() {
    if(partyPollingInterval) clearInterval(partyPollingInterval);
    partyPollingInterval = setInterval(async () => {
        if(!currentPartyCode) return;
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
            
            if(modalStack.includes('tap-boss-modal')) {
                updateTapBattleUI(data.players);
                let winner = data.players.find(p => p.boss_hp <= 0);
                if(winner && !bossIsDead) handleTapBattleEnd(winner, data.players);
            }

            if(modalStack.includes('mega-egg-modal')) updateMegaEggUI(data.mega_progress, data.mega_target);
            
            if(modalStack.includes('expedition-modal')) {
                updateExpeditionUI(data.expedition_end, data.expedition_score, data.expedition_location, data.wolf_hp, data.wolf_max_hp, data.server_time);
            }
            
        } catch(e) {}
    }, 2000);
}

function updatePartyUI() {
    if (isPartyLeader) {
        getEl('party-leader-controls').style.display = 'block';
        getEl('party-member-controls').style.display = 'none';
        if (currentActiveGame !== 'none') {
            getEl('cancel-game-btn').style.display = 'block';
            getEl('party-leader-controls').style.opacity = '0.5';
            getEl('party-leader-controls').style.pointerEvents = 'none';
        } else {
            getEl('cancel-game-btn').style.display = 'none';
            getEl('party-leader-controls').style.opacity = '1';
            getEl('party-leader-controls').style.pointerEvents = 'auto';
        }
    } else {
        getEl('party-leader-controls').style.display = 'none';
        getEl('cancel-game-btn').style.display = 'none';
        getEl('party-member-controls').style.display = 'block';
        if (currentActiveGame !== 'none') getEl('party-member-controls').innerHTML = `Игра "<b>${getGameName(currentActiveGame)}</b>" запущена!`;
        else getEl('party-member-controls').innerHTML = "⏳ Ожидание лидера...";
    }
    
    if (currentActiveGame !== 'none' && !modalStack.includes(getModalIdForGame(currentActiveGame))) {
        getEl('return-game-btn').style.display = 'block';
    } else {
        getEl('return-game-btn').style.display = 'none';
    }
}

function getGameName(type) {
    if(type === 'tap_boss') return "Гонка Яиц";
    if(type === 'mega_egg') return "Мега-Яйцо";
    if(type === 'expedition') return "Экспедиция";
    return "Неизвестно";
}

function getModalIdForGame(type) {
    if(type === 'tap_boss') return 'tap-boss-modal';
    if(type === 'mega_egg') return 'mega-egg-modal';
    if(type === 'expedition') return 'expedition-modal';
    return '';
}

async function requestStartMiniGame(gameType) {
    if(!isPartyLeader) return;
    playSound('click');
    try {
        const res = await fetch(`${API_URL}/party/set_game`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: gameType })
        });
        if (res.ok) {
            currentActiveGame = gameType; forceOpenMiniGame(gameType); updatePartyUI();
        }
    } catch(e) { showToast("Ошибка сервера", "❌"); }
}

async function requestStopMiniGame() {
    if(!isPartyLeader) return;
    playSound('click');
    try {
        await fetch(`${API_URL}/party/set_game`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, game_name: 'none' })
        });
        forceCloseMiniGame(currentActiveGame); 
        currentActiveGame = 'none'; 
        updatePartyUI();
    } catch(e) {}
}

function forceOpenMiniGame(gameType) {
    let modalId = getModalIdForGame(gameType);
    if(gameType === 'tap_boss') { 
        bossTimeLeft = 60; bossIsDead = false; 
        getEl('tap-battle-grid').innerHTML = ''; 
        if(bossTimerInterval) clearInterval(bossTimerInterval);
        bossTimerInterval = setInterval(() => {
            bossTimeLeft -= 0.1; const timerEl = getEl('boss-timer'); if(timerEl) timerEl.textContent = bossTimeLeft.toFixed(1);
            if (bossTimeLeft <= 0 && !bossIsDead) {
                clearInterval(bossTimerInterval);
                if(currentPartyPlayersData && currentPartyPlayersData.length > 0) {
                    let winner = currentPartyPlayersData.reduce((prev, curr) => prev.boss_hp < curr.boss_hp ? prev : curr);
                    handleTapBattleEnd(winner, currentPartyPlayersData);
                } else { closeModal('tap-boss-modal'); }
            }
        }, 100);
    }
    
    if(gameType === 'expedition') {
        calculatePreStartSynergy(); 
        if(isPartyLeader) {
            let locSel = getEl('leader-location-selector');
            if (locSel) locSel.style.display = 'flex';
            if (!currentExpeditionLocation) selectExpeditionLocation('forest'); 
        } else {
            let locSel = getEl('leader-location-selector');
            if (locSel) locSel.style.display = 'none';
        }
    }

    if (modalId && !modalStack.includes(modalId)) openModal(modalId);
}

function forceCloseMiniGame(gameType) {
    let modalId = getModalIdForGame(gameType);
    if(bossTimerInterval) { clearInterval(bossTimerInterval); bossTimerInterval = null; }
    if(bonusSpawningInterval) { clearInterval(bonusSpawningInterval); bonusSpawningInterval = null; }
    if(expeditionInterval) { clearInterval(expeditionInterval); expeditionInterval = null; }
    
    if (modalId && modalStack.includes(modalId)) {
        closeModal(modalId); showToast("Лидер завершил игру", "ℹ️");
    }
}

// =============================================================
// 11. МИНИ-ИГРА: ГОНКА ЯИЦ
// =============================================================
function renderTapBattle(players) {
    const grid = getEl('tap-battle-grid'); const myId = getTgUser().id; grid.innerHTML = '';
    players.forEach(p => {
        const isMe = p.user_id === myId; const hpPercent = (p.boss_hp / 10000) * 100;
        let eggSkin = p.egg_skin || 'default'; const item = SHOP_DATA.eggs.find(x => x.id === eggSkin);
        const eggImg = item ? item.img : 'assets/eggs/egg-default.png';
        grid.innerHTML += `
            <div class="tap-cell ${isMe ? 'me' : ''}" id="cell-${p.user_id}">
                <div class="tap-cell-name">${p.name} ${isMe ? '(Ты)' : ''}</div>
                <div class="tap-cell-hp-bg"><div class="tap-cell-hp-fill" id="hp-fill-${p.user_id}" style="width: ${hpPercent}%"></div></div>
                <div class="tap-cell-hp-text" id="hp-text-${p.user_id}">${p.boss_hp}/10000</div>
                <img src="${eggImg}" class="tap-cell-egg" id="egg-img-${p.user_id}" ${isMe ? 'onclick="tapMyEgg()"' : ''}>
            </div>
        `;
    });
}

function updateTapBattleUI(players) {
    const grid = getEl('tap-battle-grid');
    if(!grid.innerHTML || grid.children.length !== players.length) {
        renderTapBattle(players);
    } else {
        players.forEach(p => {
            const hpText = getEl(`hp-text-${p.user_id}`); const hpFill = getEl(`hp-fill-${p.user_id}`);
            if(hpText && hpFill) { hpText.textContent = `${p.boss_hp}/10000`; hpFill.style.width = `${(p.boss_hp / 10000) * 100}%`; }
        });
    }
}

async function tapMyEgg() {
    if (bossTimeLeft <= 0 || bossIsDead) return; playSound('click');
    let damage = 1; const r = getPetRarity(selectedAvatar); if(r === 'rare') damage = 5; if(r === 'legendary') damage = 20;
    const myId = getTgUser().id; const img = getEl(`egg-img-${myId}`);
    if(img) { img.classList.remove('boss-hit-anim'); void img.offsetWidth; img.classList.add('boss-hit-anim'); }
    const hpText = getEl(`hp-text-${myId}`); const hpFill = getEl(`hp-fill-${myId}`);
    if(hpText && hpFill) {
        let currentHp = parseInt(hpText.textContent.split('/')[0]); currentHp -= damage; if(currentHp < 0) currentHp = 0;
        hpText.textContent = `${currentHp}/10000`; hpFill.style.width = `${(currentHp / 10000) * 100}%`;
    }
    try { await fetch(`${API_URL}/party/damage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode, user_id: myId, damage: damage }) }); } catch(e) {}
}

function handleTapBattleEnd(winner, players) {
    if(bossIsDead) return; bossIsDead = true; clearInterval(bossTimerInterval); playSound('win');
    const myId = getTgUser().id; const me = players.find(p => p.user_id === myId);
    
    let vipMult = isVip() ? 1.2 : 1;
    
    if (winner.user_id === myId) { 
        let prize = Math.floor(5000 * vipMult);
        fireConfetti(); showToast(`ТЫ ПОБЕДИЛ! +${prize} монет`, "🏆"); walletBalance += prize; 
    } else { 
        const damageDealt = 10000 - (me ? me.boss_hp : 10000); 
        const reward = Math.floor(damageDealt * 0.1 * vipMult); 
        showToast(`${winner.name} победил! Твой приз: +${reward} монет`, "💰"); walletBalance += reward; 
    }
    saveData(); updateBalanceUI();
    if(isPartyLeader) setTimeout(() => requestStopMiniGame(), 3000);
}

// =============================================================
// 12. МИНИ-ИГРА: МЕГА-ЯЙЦО
// =============================================================
async function apiAddMegaEggTime(seconds) {
    try { await fetch(`${API_URL}/party/mega_egg/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode, seconds: seconds }) }); } catch(e) {}
}

function updateMegaEggUI(progress, target) {
    let p = (progress / target) * 100; if(p>100) p=100;
    getEl('mega-egg-bar').style.width = `${p}%`;
    getEl('mega-egg-text').textContent = `${Math.floor(progress/3600)} / ${Math.floor(target/3600)} Часов`;
    getEl('mega-egg-claim-btn').style.display = (progress >= target) ? 'block' : 'none';
    const eggImg = getEl('mega-egg-img-display');
    if (eggImg) {
        if(p > 0 && p < 50) eggImg.className = 'mega-egg-img pulse-slow';
        else if(p >= 50 && p < 100) eggImg.className = 'mega-egg-img pulse-fast';
        else if(p >= 100) eggImg.className = 'mega-egg-img shake-crazy';
        else eggImg.className = 'mega-egg-img';
    }
}

async function claimMegaEgg() {
    playSound('win'); fireConfetti();
    collection.push(petDatabase.legendary[Math.floor(Math.random() * petDatabase.legendary.length)]);
    walletBalance += 10000; saveData(); updateBalanceUI();
    showToast("МЕГА-ЯЙЦО РАСКОЛОТО! +10k Монет и Легендарка", "🌟");
    try { await fetch(`${API_URL}/party/mega_egg/claim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode }) }); } catch(e) {}
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
    let score = 0; let farm_count = 0; let pred_count = 0; let magic_count = 0;
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
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: currentPartyCode }) 
        });
    } catch(e) {}
}

async function startExpedition() {
    playSound('click');
    const btn = getEl('expedition-start-btn');
    if (btn) { btn.disabled = true; btn.textContent = "Отправляем..."; }
    
    if (!currentExpeditionLocation) currentExpeditionLocation = 'forest';

    try {
        const res = await fetch(`${API_URL}/party/expedition/start`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
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
    
    if (btn) { btn.disabled = false; btn.textContent = "Отправить отряд"; }
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

    if (radarBadge) {
        radarBadge.style.display = isMegaRadarActive ? 'block' : 'none';
    }

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
            petsContainer.innerHTML += `<img src="assets/pets/pet-${p.avatar}.png" class="expedition-pet ${isWalking}">`;
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
            if (!bonusSpawningInterval) {
                bonusSpawningInterval = setInterval(spawnFlyingBonus, 8000);
            }
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
                    clearInterval(expeditionInterval); expeditionInterval = null;
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
        
        if (safeWolfHp === 0 && claimBtn) {
            claimBtn.style.display = 'block';
        }

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
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
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
        walletBalance += 50; saveData(); updateBalanceUI();
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
    const reward = Math.floor(score * locMultiplier * vipMult * radarMult); 
    
    let magicCount = 0;
    currentPartyPlayersData.forEach(p => { if (["dragon", "unicorn", "alien"].includes(p.avatar)) magicCount++; });
    
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

    walletBalance += reward; saveData(); updateBalanceUI();
    
    if(droppedShard) {
        showToast(`Лут: +${reward} монет и ОСКОЛОК ПЕГАСА! 🧩`, "💰");
        fireConfetti();
    } else {
        showToast(`Лут собран: +${reward} монет!`, "💰");
    }

    try { await fetch(`${API_URL}/party/expedition/claim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode }) }); } catch(e) {}
    closeModal('expedition-modal');
    if(isPartyLeader) requestStopMiniGame(); 
}

window.onload = initGame;