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
// 2. СТЕК МОДАЛЬНЫХ ОКОН
// =============================================================
let modalStack = [];

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

// =============================================================
// 3. КОНФЕТТИ И УТИЛИТЫ
// =============================================================
function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particles = [];
    const colors = ['#ff3b30', '#ffcc00', '#34c759', '#007aff', '#5856d6'];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            w: Math.random() * 10 + 5, h: Math.random() * 10 + 5,
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
    if(p === "god") return 'legendary';
    if(petDatabase.legendary.includes(p)) return 'legendary';
    if(petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}
function getPetImg(id) { return id === 'default' ? 'assets/ui/icon-profile.png' : `assets/pets/pet-${id}.png`; }
function hardReset() { if(confirm("Сбросить все?")) { localStorage.clear(); location.reload(); } }

// =============================================================
// КОНСТАНТЫ
// =============================================================
const API_URL = "https://focushatcher-ondey.amvera.io/api"; 

const MODES = [
    { id: 'short', timeOnline: 25 * 60, timeOffline: 6 * 3600, xpReward: 250, egg: 'default', title: '25 минут', sub: 'Шанс Легендарки: 1%' },
    { id: 'long', timeOnline: 60 * 60, timeOffline: 12 * 3600, xpReward: 1000, egg: 'diamond', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥' },
    { id: 'custom', timeOnline: 3600, timeOffline: 5 * 3600, xpReward: 500, egg: 'default', title: 'Кастомное яйцо', sub: 'Настрой редкость' }
];

let customEggConfig = { target: 'all', timeOnline: 3600, timeOffline: 5 * 3600 };
const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Мифик", "Создатель"];

const PET_NAMES = {
    "chick": "Цыпленок", "kitten": "Котенок", "puppy": "Щенок", "hamster": "Хомяк", "bunny": "Зайчик",
    "frog": "Лягушка", "bear": "Мишка", "koala": "Коала", "duck": "Утенок", "caterpillar": "Гусеница",
    "fox": "Лисенок", "panda": "Панда", "tiger": "Тигренок", "lion": "Львенок", "cow": "Коровка",
    "pig": "Свинка", "monkey": "Обезьянка", "owl": "Сова",
    "unicorn": "Единорог", "dragon": "Дракон", "alien": "Пришелец", "robot": "Робот", "dino": "Динозавр",
    "fireball": "Огонек", "god": "Бог Фокуса"
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
const ALL_PETS_FLAT = [...petDatabase.common, ...petDatabase.rare, ...petDatabase.legendary, "god"];
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
        { id: 'gold', name: 'Мажор', price: 10000, bgFile: 'assets/bg/bg-gold.jpg' }
    ],
    eggs: [
        { id: 'default', name: 'Стандарт', price: 0, img: 'assets/eggs/egg-default.png' },
        { id: 'glow', name: 'Сияние', price: 1000, img: 'assets/eggs/egg-glow.png' },
        { id: 'ice', name: 'Лед', price: 3000, img: 'assets/eggs/egg-ice.png' },
        { id: 'glitch', name: 'Глюк', price: 7777, img: 'assets/eggs/egg-glitch.png' },
        { id: 'gold', name: 'Золото', price: 15000, img: 'assets/eggs/egg-gold.png' }
    ],
    boosters: [
        { id: 'luck', name: 'Зелье Удачи', price: 200, icon: 'assets/ui/booster-luck.png', desc: 'Шанс x5' },
        { id: 'speed', name: 'Ускоритель', price: 500, icon: 'assets/ui/booster-speed.png', desc: 'Меньше времени' }
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
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

let collection = [], userXP = 0, userLevel = 1, walletBalance = 0;
let ownedItems = { themes: ['default'], eggs: ['default'] };
let activeTheme = 'default', activeEggSkin = 'default', selectedAvatar = 'default';
let userStats = { hatched: 0, earned: 0, invites: 0, crafts: 0 };
let myBoosters = { luck: 0, speed: 0 };
let claimedAchievements = [], claimedQuests = [], usedCodes = [];
let isVibrationOn = true, isSoundOn = false;

let currentModeIndex = 0, timerInterval = null, isRunning = false, timeLeft = 10;
let activeBoosters = { luck: false, speed: false };
let currentHatchMode = 'none'; 
let currentShopTab = 'themes', currentAchTab = 'achievements', selectedPet = null;

// =============================================================
// МУЛЬТИПЛЕЕР: ПЕРЕМЕННЫЕ
// =============================================================
let currentPartyCode = null;
let partyPollingInterval = null;
let isPartyLeader = false;
let currentActiveGame = 'none';
let currentPartyPlayersData = [];
let invitesPollingInterval = null;
let currentPendingInviteId = null;

function getTgUser() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        return {
            id: String(window.Telegram.WebApp.initDataUnsafe.user.id),
            name: window.Telegram.WebApp.initDataUnsafe.user.first_name
        };
    }
    if(!localStorage.getItem('fake_uid')) localStorage.setItem('fake_uid', 'user_' + Math.floor(Math.random()*10000));
    return { id: localStorage.getItem('fake_uid'), name: "Игрок" };
}

// =============================================================
// ИНИЦИАЛИЗАЦИЯ
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
    } catch(e) { console.error("Local Load Error", e); }

    checkBackgroundHatch(); checkTutorial();
    if (localStorage.getItem('tutorialSeen')) checkDailyReward();

    updateLevelUI(); updateBalanceUI(); applyTheme(); applyEggSkin(); updateUI(); 
    if (selectedAvatar !== 'default') { getEl('header-profile-btn').innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar">`; }
    
    if(getEl('vibration-toggle')) { getEl('vibration-toggle').checked = isVibrationOn; getEl('vibration-toggle').onchange = (e) => { isVibrationOn = e.target.checked; localStorage.setItem('isVibrationOn', isVibrationOn); playSound('click'); }; }
    if(getEl('sound-toggle')) { getEl('sound-toggle').checked = isSoundOn; getEl('sound-toggle').onchange = (e) => { isSoundOn = e.target.checked; localStorage.setItem('isSoundOn', isSoundOn); if(isSoundOn) playSound('click'); }; }
    
    loadFromCloud();
    apiSyncGlobalProfile();
    startInvitesPolling();
}

function loadFromCloud() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        const keys = ['walletBalance', 'userXP', 'userLevel', 'myCollection', 'ownedItems', 'activeTheme', 'activeEggSkin', 'userStats', 'myBoosters', 'claimedAchievements', 'claimedQuests', 'selectedAvatar'];
        Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
            if (err || !values) return;
            if (values.walletBalance) walletBalance = parseInt(values.walletBalance);
            if (values.userXP) userXP = parseInt(values.userXP);
            if (values.userLevel) userLevel = parseInt(values.userLevel);
            if (values.myCollection) collection = JSON.parse(values.myCollection);
            if (values.ownedItems) ownedItems = JSON.parse(values.ownedItems);
            if (values.activeTheme) activeTheme = values.activeTheme;
            if (values.activeEggSkin) activeEggSkin = values.activeEggSkin;
            if (values.selectedAvatar) selectedAvatar = values.selectedAvatar;
            if (values.userStats) userStats = {...userStats, ...JSON.parse(values.userStats)};
            if (values.myBoosters) myBoosters = {...myBoosters, ...JSON.parse(values.myBoosters)};
            if (values.claimedAchievements) claimedAchievements = JSON.parse(values.claimedAchievements);
            if (values.claimedQuests) claimedQuests = JSON.parse(values.claimedQuests);
            
            if (selectedAvatar !== 'default') { getEl('header-profile-btn').innerHTML = `<img src="assets/pets/pet-${selectedAvatar}.png" class="header-icon-img header-avatar">`; }
            updateBalanceUI(); updateLevelUI(); applyTheme(); applyEggSkin();
            saveData(); apiSyncGlobalProfile();
        });
    }
}

function saveData() {
    localStorage.setItem('walletBalance', walletBalance);
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

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        Telegram.WebApp.CloudStorage.setItem('walletBalance', walletBalance.toString());
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
    }
}

// =============================================================
// ПРОФИЛЬ И ДРУЗЬЯ
// =============================================================
async function apiSyncGlobalProfile() {
    const user = getTgUser();
    let netWorth = walletBalance;
    collection.forEach(pet => netWorth += PRICES[getPetRarity(pet)] || 0);
    try {
        await fetch(`${API_URL}/users/sync`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id, name: user.name, avatar: selectedAvatar,
                level: userLevel, earned: netWorth, hatched: userStats.hatched || 0
            })
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
        getEl('profile-stats-view').style.display = 'block';
        getEl('profile-friends-view').style.display = 'none';
    } else {
        getEl('profile-stats-view').style.display = 'none';
        getEl('profile-friends-view').style.display = 'block';
        getEl('my-friend-code').value = getTgUser().id;
        apiLoadFriends(); 
    }
}

function openProfile() {
    apiSyncGlobalProfile(); 
    getEl('profile-rank').textContent = RANKS[Math.floor(userLevel / 5)] || "Создатель";
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
    
    getEl('profile-stats-view').style.display = 'block';
    getEl('profile-friends-view').style.display = 'none';
    document.querySelectorAll('#profile-modal .tab-btn')[0].classList.add('active');
    document.querySelectorAll('#profile-modal .tab-btn')[1].classList.remove('active');

    openModal('profile-modal');
}

function copyMyCode() {
    const code = getEl('my-friend-code').value;
    navigator.clipboard.writeText(code).then(() => showToast("Код скопирован!", "📋"));
}

async function apiAddFriend() {
    playSound('click');
    const input = getEl('add-friend-input');
    const friendId = input.value.trim();
    if(!friendId || friendId === getTgUser().id) return showToast("Неверный ID", "❌");
    
    try {
        const res = await fetch(`${API_URL}/friends/add`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: getTgUser().id, friend_id: friendId })
        });
        const data = await res.json();
        if(data.status === 'success') {
            showToast("Друг добавлен!", "🤝");
            input.value = '';
            apiLoadFriends();
        } else {
            showToast(data.detail || "Ошибка", "❌");
        }
    } catch(e) { showToast("Ошибка сети", "❌"); }
}

async function apiLoadFriends() {
    const container = getEl('friends-list-container');
    container.innerHTML = '<div style="text-align:center; color:#888;">Загрузка...</div>';
    try {
        const res = await fetch(`${API_URL}/friends/list/${getTgUser().id}`);
        const data = await res.json();
        container.innerHTML = '';
        if(data.friends.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#888;">У вас пока нет друзей</div>';
            return;
        }
        data.friends.forEach(f => {
            const encodedFriend = encodeURIComponent(JSON.stringify(f));
            container.innerHTML += `
                <div class="achievement-card" style="cursor: pointer;" onclick="openFriendProfile('${encodedFriend}')">
                    <img src="${getPetImg(f.avatar)}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #007aff;">
                    <div class="ach-info">
                        <div class="ach-title">${f.name}</div>
                        <div class="ach-desc">Уровень ${f.level}</div>
                    </div>
                </div>
            `;
        });
    } catch(e) { container.innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>'; }
}

let currentViewingFriendId = null;

function openFriendProfile(encodedFriend) {
    playSound('click');
    const f = JSON.parse(decodeURIComponent(encodedFriend));
    currentViewingFriendId = f.user_id;
    
    getEl('fp-name').textContent = f.name;
    getEl('fp-avatar').src = getPetImg(f.avatar);
    getEl('fp-level').textContent = `Уровень ${f.level}`;
    getEl('fp-hatched').textContent = f.hatched || 0;
    getEl('fp-earned').textContent = f.earned || 0;

    if (currentPartyCode) {
        getEl('fp-invite-btn').style.display = 'block';
        getEl('fp-invite-hint').style.display = 'none';
    } else {
        getEl('fp-invite-btn').style.display = 'none';
        getEl('fp-invite-hint').style.display = 'block';
    }

    openModal('friend-profile-modal');
}

async function sendInviteToFriend() {
    playSound('click');
    if(!currentPartyCode || !currentViewingFriendId) return;
    const btn = getEl('fp-invite-btn');
    btn.textContent = "Отправляем..."; btn.disabled = true;
    
    try {
        await fetch(`${API_URL}/invites/send`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender_id: getTgUser().id, receiver_id: currentViewingFriendId, party_code: currentPartyCode })
        });
        showToast("Приглашение отправлено!", "💌");
    } catch(e) { showToast("Ошибка", "❌"); }
    
    setTimeout(() => { btn.textContent = "Позвать в свою Пати 🎮"; btn.disabled = false; closeModal('friend-profile-modal'); }, 1000);
}

// =============================================================
// БАЗОВЫЕ МЕНЮ И ПРОГРЕСС
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
    getEl('ach-badge').style.display = has ? 'block' : 'none';
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
    try {
        await fetch(`${API_URL}/party/join`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentPartyCode, user_id: getTgUser().id, name: getTgUser().name, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
    } catch(e) {}
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
    if (r.type === 'money') walletBalance += r.val;
    else if (r.type === 'booster') { if (!myBoosters[r.id]) myBoosters[r.id] = 0; myBoosters[r.id]++; } 
    else if (r.type === 'mixed') { walletBalance += r.money; if (!myBoosters[r.booster]) myBoosters[r.booster] = 0; myBoosters[r.booster]++; }
    s++; if (s >= 7) s = 0;
    localStorage.setItem('dailyStreak', s); localStorage.setItem('lastLoginDate', t);
    saveData(); updateBalanceUI(); showToast("Награда получена!", "📅"); closeModal('daily-modal'); playSound('money');
}

function openShop() { switchShopTab('themes'); openModal('shop-modal'); }
function openSettings() { openModal('settings-modal'); }
function openAch() { switchAchTab('achievements'); openModal('achievements-modal'); }

// =============================================================
// ТАЙМЕР И ФОКУС
// =============================================================
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning && currentHatchMode === 'online') stopTimer(true); 
});

function updateBalanceUI() {
    getEl('total-money').innerHTML = `<img src="assets/ui/coin.png" class="coin-img"> ${walletBalance}`;
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
    clearInterval(timerInterval); isRunning = false; localStorage.removeItem('hatchEndTime'); 
    getEl('main-btn').style.display = 'none'; getEl('start-buttons-container').style.display = 'flex';
    getEl('prev-btn').style.visibility = 'visible'; getEl('next-btn').style.visibility = 'visible';
    getEl('offline-warning').style.display = 'none';
    
    const eggDisplay = getEl('egg-display'); eggDisplay.className = 'egg-img'; eggDisplay.classList.remove('shaking'); 
    getEl('crack-overlay').className = 'crack-overlay'; getEl('hatched-info').style.display = 'none';
    
    updateUI(); renderBoostersPanel();
    if (failed) { showToast("Фокус прерван! Яйцо разбито...", "❌"); playSound('click'); } 
    else { showToast("Выращивание отменено", "⚠️"); }
}

function finishTimer(fromOffline = false) {
    clearInterval(timerInterval); isRunning = false; localStorage.removeItem('hatchEndTime');
    getEl('offline-warning').style.display = 'none'; getEl('main-btn').style.display = 'none';
    getEl('start-buttons-container').style.display = 'flex'; getEl('share-btn').style.display = 'block'; 
    getEl('prev-btn').style.visibility = 'visible'; getEl('next-btn').style.visibility = 'visible';
    getEl('crack-overlay').className = 'crack-overlay';

    const m = MODES[currentModeIndex]; userXP+=m.xpReward; 
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
// ЛАБОРАТОРИЯ, ИНВЕНТАРЬ И МАГАЗИН
// =============================================================
function openCraft() {
    const c = getEl('craft-list'); c.innerHTML = ''; let canCraft = false;
    [...petDatabase.common].forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        if(count >= 5) {
            canCraft = true; const r = getPetRarity(pet); const d = document.createElement('div'); d.className = `pet-slot ${r}`;
            d.innerHTML = `<img src="assets/pets/pet-${pet}.png" class="pet-img-slot"><div class="slot-count" style="background:#ff3b30">${count}/5</div>`;
            d.onclick = () => craftPet(pet); c.appendChild(d);
        }
    });
    if(!canCraft) c.innerHTML = '<p style="grid-column: span 4; color: #888;">Собери 5 одинаковых обычных петов, чтобы скрафтить редкого!</p>';
    openModal('craft-modal');
}
function craftPet(basePet) {
    if(confirm(`Соединить 5x ${PET_NAMES[basePet]}?`)) {
        let removed = 0;
        collection = collection.filter(p => {
            if(p === basePet && removed < 5) { removed++; return false; }
            return true;
        });
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
    const p=PRICES[getPetRarity(selectedPet)]; walletBalance+=p; userStats.earned+=p;
    collection.splice(idx,1); saveData(); updateBalanceUI(); 
    closeModal('pet-modal'); showToast(`Продано +${p}`, 'img'); playSound('money'); openInventory(); 
}

function switchShopTab(t) { currentShopTab=t; document.querySelectorAll('#shop-modal .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderShop(); playSound('click'); }
function renderShop() {
    const c=getEl('shop-items'); c.innerHTML='';
    SHOP_DATA[currentShopTab].forEach(item => {
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
function buyItem(id, price) {
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
function applyTheme() { 
    const t=SHOP_DATA.themes.find(x=>x.id===activeTheme); 
    if(t && t.bgFile) document.body.style.backgroundImage = `url('${t.bgFile}')`; else { document.body.style.backgroundImage = 'none'; document.body.style.backgroundColor = '#1c1c1e'; }
}
function applyEggSkin() { 
    const s=SHOP_DATA.eggs.find(x=>x.id===activeEggSkin); const egg=getEl('egg-display'); 
    if (s) egg.src = s.img; else egg.src = 'assets/eggs/egg-default.png';
    egg.className = 'egg-img'; if(isRunning) egg.classList.add('shaking'); 
}
function updateLevelUI() { const max=userLevel*200; let p=(userXP/max)*100; if(p>100)p=100; getEl('xp-bar').style.width=`${p}%`; getEl('level-number').textContent=`Lvl ${userLevel}`; let r=Math.floor(userLevel/5); getEl('rank-name').textContent=RANKS[Math.min(r,RANKS.length-1)] || "Создатель"; }


// =============================================================
// МУЛЬТИПЛЕЕР (РОУТЕР + ПАТИ)
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
    try {
        const res = await fetch(`${API_URL}/party/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: user.name, avatar: selectedAvatar, egg_skin: activeEggSkin })
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
    try {
        const res = await fetch(`${API_URL}/party/join`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, user_id: user.id, name: user.name, avatar: selectedAvatar, egg_skin: activeEggSkin })
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

async function apiLeaveParty() {
    playSound('click');
    const user = getTgUser();
    try {
        await fetch(`${API_URL}/party/leave`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: user.name, avatar: selectedAvatar, egg_skin: activeEggSkin })
        });
    } catch(e) {}
    currentPartyCode = null; clearInterval(partyPollingInterval);
    getEl('party-setup-view').style.display = 'block';
    getEl('party-active-view').style.display = 'none';
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
            const data = await res.json();
            
            isPartyLeader = (getTgUser().id === data.leader_id);
            currentPartyPlayersData = data.players; 
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
            if(modalStack.includes('expedition-modal')) updateExpeditionUI(data.expedition_end, data.expedition_score);
            
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
        forceCloseMiniGame(currentActiveGame); currentActiveGame = 'none'; updatePartyUI();
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
    if (modalId && !modalStack.includes(modalId)) openModal(modalId);
}

function forceCloseMiniGame(gameType) {
    let modalId = getModalIdForGame(gameType);
    if(bossTimerInterval) clearInterval(bossTimerInterval);
    if (modalId && modalStack.includes(modalId)) {
        closeModal(modalId); showToast("Лидер завершил игру", "ℹ️");
    }
}

// === ГОНКА ЯИЦ ===
let bossTimerInterval = null; let bossTimeLeft = 60; let bossIsDead = false;

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
    if(!getEl('tap-battle-grid').innerHTML) renderTapBattle(players);
    else {
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
    if (winner.user_id === myId) { fireConfetti(); showToast("ТЫ ПОБЕДИЛ В ГОНКЕ! +5000 монет", "🏆"); walletBalance += 5000; } 
    else { const damageDealt = 10000 - (me ? me.boss_hp : 10000); const reward = Math.floor(damageDealt * 0.1); showToast(`${winner.name} победил! Твой приз: +${reward} монет`, "💰"); walletBalance += reward; }
    saveData(); updateBalanceUI();
    if(isPartyLeader) setTimeout(() => requestStopMiniGame(), 3000);
}

// === МЕГА-ЯЙЦО ===
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

// === ЭКСПЕДИЦИЯ ===
let expeditionInterval = null;
async function startExpedition() {
    playSound('click');
    try {
        await fetch(`${API_URL}/party/expedition/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode }) });
        showToast("Отряд выдвинулся в путь!", "🗺️");
    } catch(e) {}
}
function updateExpeditionUI(endTime, score) {
    const now = Math.floor(Date.now() / 1000);
    const scene = getEl('expedition-scene');
    const petsContainer = getEl('expedition-pets-container');
    
    if(currentPartyPlayersData && petsContainer) {
        petsContainer.innerHTML = '';
        currentPartyPlayersData.forEach(p => {
            let isWalking = (endTime > now) ? 'walking-pet' : '';
            petsContainer.innerHTML += `<img src="assets/pets/pet-${p.avatar}.png" class="expedition-pet ${isWalking}">`;
        });
    }

    if (endTime > now) {
        scene.classList.add('scrolling-bg'); 
        getEl('change-expedition-pet-btn').style.display = 'none'; 
        getEl('expedition-info-view').style.display = 'none';
        getEl('expedition-active-view').style.display = 'block';
        getEl('expedition-multiplier').textContent = score;
        getEl('expedition-claim-btn').style.display = 'none';
        
        if(expeditionInterval) clearInterval(expeditionInterval);
        expeditionInterval = setInterval(() => {
            const t = Math.floor(Date.now() / 1000);
            if (endTime <= t) {
                clearInterval(expeditionInterval);
                getEl('expedition-timer').textContent = "00:00:00";
                getEl('expedition-claim-btn').style.display = 'block';
                scene.classList.remove('scrolling-bg');
            } else {
                let diff = endTime - t;
                let h = Math.floor(diff / 3600).toString().padStart(2, '0');
                let m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                let s = (diff % 60).toString().padStart(2, '0');
                getEl('expedition-timer').textContent = `${h}:${m}:${s}`;
            }
        }, 1000);
    } else if (endTime > 0 && endTime <= now) {
        scene.classList.remove('scrolling-bg'); 
        getEl('change-expedition-pet-btn').style.display = 'none';
        getEl('expedition-info-view').style.display = 'none';
        getEl('expedition-active-view').style.display = 'block';
        getEl('expedition-timer').textContent = "00:00:00";
        getEl('expedition-multiplier').textContent = score;
        getEl('expedition-claim-btn').style.display = 'block';
        if(expeditionInterval) clearInterval(expeditionInterval);
    } else {
        scene.classList.remove('scrolling-bg'); 
        getEl('change-expedition-pet-btn').style.display = 'inline-block';
        getEl('expedition-info-view').style.display = 'block';
        getEl('expedition-active-view').style.display = 'none';
        getEl('expedition-pre-score').textContent = score || 1; 
        
        if(isPartyLeader) {
            getEl('expedition-start-btn').style.display = 'inline-block';
            getEl('expedition-waiting-msg').style.display = 'none';
        } else {
            getEl('expedition-start-btn').style.display = 'none';
            getEl('expedition-waiting-msg').style.display = 'block';
        }
        if(expeditionInterval) clearInterval(expeditionInterval);
    }
}
async function claimExpedition() {
    playSound('money');
    const score = parseInt(getEl('expedition-multiplier').textContent);
    const reward = score * 500; 
    walletBalance += reward; saveData(); updateBalanceUI();
    showToast(`Лут собран: +${reward} монет!`, "💰");
    try { await fetch(`${API_URL}/party/expedition/claim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: currentPartyCode }) }); } catch(e) {}
    closeModal('expedition-modal');
    if(isPartyLeader) requestStopMiniGame(); 
}

window.onload = initGame;