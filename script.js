// =============================================================
// 1. ЛОВУШКА ОШИБОК
// =============================================================
const debugConsole = document.getElementById('debug-console');
window.onerror = function(msg, source, lineno) {
    debugConsole.style.display = 'block';
    debugConsole.innerHTML += `<div class="error-msg">❌ Ошибка: ${msg} (стр. ${lineno})</div>`;
    return false;
};

// =============================================================
// 2. АУДИО ДВИЖОК
// =============================================================
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
    } 
    else if (type === 'money') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    }
    else if (type === 'win') {
        playNote(523.25, now, 0.1); playNote(659.25, now + 0.1, 0.1); playNote(783.99, now + 0.2, 0.4);
    }
    else if (type === 'legendary') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(600, now + 1);
        gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 1.5);
        osc.start(now); osc.stop(now + 1.5);
    }
}

function playNote(freq, time, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0.01, time + duration);
    osc.start(time); osc.stop(time + duration);
}

// =============================================================
// 3. ВИЗУАЛЬНЫЕ ЭФФЕКТЫ (КОНФЕТТИ)
// =============================================================
function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
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
        if (particles.length > 0) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

// =============================================================
// 4. КОНСТАНТЫ
// =============================================================
const MODES = [
    { id: 'short', time: 10, xpReward: 250, egg: '🥚', title: '25 минут', sub: 'Шанс Легендарки: 1%', style: '' },
    { id: 'long', time: 20, xpReward: 1000, egg: '💎', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥', style: 'hardcore' }
];
const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

// НАГРАДЫ ЗА УРОВНИ (НОВОЕ!)
const LEVEL_REWARDS = {
    1: { title: "Новичок", reward: null },
    5: { title: "Искатель", reward: "1000 монет" },
    10: { title: "Укротитель", reward: "Уникальный Питомец: 🐲 God" },
    20: { title: "Мастер", reward: "5000 монет" },
    50: { title: "Бог Фокуса", reward: "???" }
};

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻", "🐨", "🐤", "🐛"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};
const ALL_PETS_FLAT = [...petDatabase.common, ...petDatabase.rare, ...petDatabase.legendary, "🐲 God"]; // Добавили бога
const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

const ACHIEVEMENTS_DATA = [
    { id: 'first_hatch', title: 'Первый шаг', desc: 'Вырасти 1 питомца', goal: 1, reward: 100 },
    { id: 'rich_kid', title: 'Богач', desc: 'Заработай $1000', goal: 1000, type: 'money', reward: 500 },
    { id: 'collector', title: 'Коллекционер', desc: 'Собери 5 уникальных', goal: 5, type: 'unique', reward: 1000 },
    { id: 'hard_worker', title: 'Трудяга', desc: 'Вырасти 10 питомцев', goal: 10, reward: 2000 }
];
const QUESTS_DATA = [
    { id: 'sub_channel', title: 'Подписка', desc: 'Подпишись на канал', reward: 1000, type: 'link', url: 'https://t.me/focushatch' },
    { id: 'invite_friends', title: 'Друзья', desc: 'Пригласи 5 друзей', reward: 2000, type: 'invite', goal: 5 }
];
const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма', price: 0, cssClass: '' },
        { id: 'forest', name: 'Лес', price: 500, cssClass: 'theme-forest' },
        { id: 'space', name: 'Космос', price: 2000, cssClass: 'theme-space' },
        { id: 'neon', name: 'Неон', price: 5000, cssClass: 'theme-neon' },
        { id: 'gold', name: 'Мажор', price: 10000, cssClass: 'theme-gold' }
    ],
    eggs: [
        { id: 'default', name: 'Стандарт', price: 0, skinClass: '' },
        { id: 'glow', name: 'Сияние', price: 1000, skinClass: 'skin-glow' },
        { id: 'ice', name: 'Лед', price: 3000, skinClass: 'skin-ice' },
        { id: 'glitch', name: 'Глюк', price: 7777, skinClass: 'skin-glitch' },
        { id: 'gold', name: 'Золото', price: 15000, skinClass: 'skin-gold' }
    ],
    boosters: [
        { id: 'luck', name: 'Зелье Удачи', price: 200, icon: '🍀', desc: 'Шанс x5' },
        { id: 'speed', name: 'Ускоритель', price: 500, icon: '⏳', desc: 'Время / 2' }
    ]
};
const DAILY_REWARDS = [
    { day: 1, type: 'money', val: 100, icon: '💰' }, { day: 2, type: 'money', val: 250, icon: '💰' }, { day: 3, type: 'money', val: 500, icon: '💰' },
    { day: 4, type: 'money', val: 1000, icon: '💰' }, { day: 5, type: 'money', val: 2000, icon: '💰' }, { day: 6, type: 'booster', id: 'speed', val: 1, icon: '⏳' }, { day: 7, type: 'mixed', money: 5000, booster: 'luck', icon: '🎁' }
];
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

// =============================================================
// 5. ПЕРЕМЕННЫЕ
// =============================================================
let collection = [], userXP = 0, userLevel = 1, walletBalance = 0;
let ownedItems = { themes: ['default'], eggs: ['default'] };
let activeTheme = 'default', activeEggSkin = 'default';
let userStats = { hatched: 0, earned: 0, invites: 0 };
let myBoosters = { luck: 0, speed: 0 };
let claimedAchievements = [], claimedQuests = [];
let isVibrationOn = true, isSoundOn = false;

let currentModeIndex = 0, timerInterval = null, isRunning = false, timeLeft = 10;
let activeBoosters = { luck: false, speed: false };
let currentShopTab = 'themes', currentAchTab = 'achievements', selectedPet = null;

// =============================================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================================
function getEl(id) { return document.getElementById(id); }
function closeModal(id) { getEl(id).style.display = 'none'; playSound('click'); }
function openShop() { getEl('shop-modal').style.display = 'flex'; switchShopTab('themes'); playSound('click'); }
function openSettings() { getEl('settings-modal').style.display = 'flex'; playSound('click'); }
function openAch() { getEl('achievements-modal').style.display = 'flex'; switchAchTab('achievements'); playSound('click'); }
function showToast(msg, icon='🔔') {
    const c = getEl('toast-container'); const d = document.createElement('div');
    d.className = 'toast'; d.innerHTML = `<span style="font-size:18px">${icon}</span> <span>${msg}</span>`;
    c.appendChild(d); setTimeout(() => { d.classList.add('fade-out'); setTimeout(()=>d.remove(), 300); }, 3000);
}
function formatTime(s) { return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`; }
function getPetRarity(p) {
    if(p === "🐲 God") return 'legendary';
    if(petDatabase.legendary.includes(p)) return 'legendary';
    if(petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}
function hardReset() { if(confirm("Сбросить все?")) { localStorage.clear(); location.reload(); } }

// === НОВОЕ: ОТКРЫТИЕ ОКНА УРОВНЕЙ ===
function openLevels() {
    playSound('click');
    const modal = getEl('levels-modal');
    const list = getEl('levels-list');
    list.innerHTML = '';
    
    // Генерируем список уровней
    for (let lvl = 1; lvl <= 50; lvl++) {
        if (!LEVEL_REWARDS[lvl]) continue; // Показываем только ключевые уровни
        
        const info = LEVEL_REWARDS[lvl];
        const isReached = userLevel >= lvl;
        const div = document.createElement('div');
        div.className = `level-item ${isReached ? 'active' : 'locked'}`;
        
        const status = isReached ? '✅' : '🔒';
        
        div.innerHTML = `
            <div class="rank-icon">${status}</div>
            <div class="rank-details">
                <div class="rank-title">Ур. ${lvl}: ${info.title}</div>
                <div class="rank-desc">Награда: ${info.reward || "Нет"}</div>
            </div>
        `;
        list.appendChild(div);
    }
    
    modal.style.display = 'flex';
}

// =============================================================
// 7. ИНИЦИАЛИЗАЦИЯ (С ЗАЩИТОЙ ОТ ЗАКРЫТИЯ)
// =============================================================
function initGame() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        window.Telegram.WebApp.setHeaderColor('#1c1c1e');
        window.Telegram.WebApp.setBackgroundColor('#1c1c1e');
    }

    try {
        collection = JSON.parse(localStorage.getItem('myCollection')) || [];
        userXP = parseInt(localStorage.getItem('userXP')) || 0;
        userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
        walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
        ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
        activeTheme = localStorage.getItem('activeTheme') || 'default';
        activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
        let s = JSON.parse(localStorage.getItem('userStats')); if(s) userStats = s;
        let b = JSON.parse(localStorage.getItem('myBoosters')); if(b) myBoosters = b;
        claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];
        claimedQuests = JSON.parse(localStorage.getItem('claimedQuests')) || [];
        isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';
        isSoundOn = localStorage.getItem('isSoundOn') === 'true';
    } catch(e) { console.error("Local Load Error", e); }

    checkDailyReward();
    updateLevelUI();
    renderCollection();
    applyTheme();
    updateUI();
    updateBalanceUI();
    
    if(getEl('vibration-toggle')) {
        getEl('vibration-toggle').checked = isVibrationOn;
        getEl('vibration-toggle').onchange = (e) => { 
            isVibrationOn = e.target.checked; 
            localStorage.setItem('isVibrationOn', isVibrationOn); 
            playSound('click');
        };
    }
    if(getEl('sound-toggle')) {
        getEl('sound-toggle').checked = isSoundOn;
        getEl('sound-toggle').onchange = (e) => { 
            isSoundOn = e.target.checked; 
            localStorage.setItem('isSoundOn', isSoundOn); 
            if(isSoundOn) playSound('click');
        };
    }

    loadFromCloud();
}

function loadFromCloud() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        const keys = ['walletBalance', 'userXP', 'userLevel', 'myCollection', 'ownedItems', 'activeTheme', 'activeEggSkin', 'userStats', 'myBoosters', 'claimedAchievements', 'claimedQuests'];
        Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
            if (err || !values) return;
            if (values.walletBalance) walletBalance = parseInt(values.walletBalance);
            if (values.userXP) userXP = parseInt(values.userXP);
            if (values.userLevel) userLevel = parseInt(values.userLevel);
            if (values.myCollection) collection = JSON.parse(values.myCollection);
            if (values.ownedItems) ownedItems = JSON.parse(values.ownedItems);
            if (values.activeTheme) activeTheme = values.activeTheme;
            if (values.activeEggSkin) activeEggSkin = values.activeEggSkin;
            if (values.userStats) userStats = JSON.parse(values.userStats);
            if (values.myBoosters) myBoosters = JSON.parse(values.myBoosters);
            if (values.claimedAchievements) claimedAchievements = JSON.parse(values.claimedAchievements);
            if (values.claimedQuests) claimedQuests = JSON.parse(values.claimedQuests);
            updateBalanceUI(); updateLevelUI(); renderCollection(); applyTheme(); applyEggSkin();
        });
    }
}

// === СОХРАНЕНИЕ ===
function saveData() {
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    localStorage.setItem('activeTheme', activeTheme);
    localStorage.setItem('activeEggSkin', activeEggSkin);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
    localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    localStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
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
        Telegram.WebApp.CloudStorage.setItem('userStats', JSON.stringify(userStats));
        Telegram.WebApp.CloudStorage.setItem('myBoosters', JSON.stringify(myBoosters));
        Telegram.WebApp.CloudStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
        Telegram.WebApp.CloudStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
    }
}

// =============================================================
// 8. ЛОГИКА ЕЖЕДНЕВНЫХ НАГРАД
// =============================================================
function checkDailyReward() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    let streak = parseInt(localStorage.getItem('dailyStreak')) || 0;
    if (lastLogin === today) return; 
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (lastLogin !== yesterday.toDateString()) streak = 0;
    renderDailyModal(streak);
    getEl('daily-modal').style.display = 'flex';
    playSound('win'); 
}
function renderDailyModal(curr) {
    const g = getEl('daily-grid'); g.innerHTML = '';
    DAILY_REWARDS.forEach((r, i) => {
        const d = document.createElement('div');
        let st = ''; if(i<curr) st='claimed'; if(i===curr) st='active';
        d.className = `daily-item ${st}`;
        let v = (r.type==='money'||r.type==='mixed') ? `$${r.money||r.val}` : '+1 Буст';
        d.innerHTML = `<div class="daily-day">День ${r.day}</div><div class="daily-icon">${st==='claimed'?'✅':r.icon}</div><div class="daily-val">${v}</div>`;
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
    localStorage.setItem('dailyStreak', s);
    localStorage.setItem('lastLoginDate', t);
    saveData(); updateBalanceUI(); showToast("Награда получена!", "📅");
    getEl('daily-modal').style.display = 'none';
    playSound('money');
}

// =============================================================
// 9. ОСНОВНАЯ ЛОГИКА
// =============================================================
function updateBalanceUI() {
    getEl('total-money').textContent = `💰 $${walletBalance}`;
    getEl('unique-count').textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
    renderBoostersPanel();
}
function checkAchievements() {
    let has = false;
    let u = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => { if(!claimedAchievements.includes(a.id)) { if((a.type==='money'&&userStats.earned>=a.goal)||(a.type==='unique'&&u>=a.goal)||(!a.type&&userStats.hatched>=a.goal)) has=true; } });
    QUESTS_DATA.forEach(q => { if(!claimedQuests.includes(q.id)&&q.type==='invite'&&(userStats.invites||0)>=q.goal) has=true; });
    getEl('ach-badge').style.display = has ? 'block' : 'none';
}
function renderBoostersPanel() {
    const p = getEl('boosters-panel'); p.innerHTML = '';
    p.appendChild(createBoosterBtn('luck', '🍀', myBoosters.luck||0, activeBoosters.luck));
    p.appendChild(createBoosterBtn('speed', '⏳', myBoosters.speed||0, activeBoosters.speed));
}
function createBoosterBtn(type, icon, count, isActive) {
    const d = document.createElement('div');
    d.className = `booster-slot ${isActive?'active':''} ${count===0?'empty':''}`;
    d.innerHTML = `${icon} <div class="booster-count">${count}</div>`;
    d.onclick = () => {
        if(count>0 && !isRunning) { 
            activeBoosters[type] = !activeBoosters[type]; 
            renderBoostersPanel(); updateUI(); 
            playSound('click');
        }
    };
    return d;
}
function prevMode() { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); playSound('click'); }}
function nextMode() { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); playSound('click'); }}
function updateUI() {
    const m = MODES[currentModeIndex];
    let t = m.time;
    if(activeBoosters.speed) t = Math.floor(t/2);
    if(!isRunning) { getEl('egg-display').textContent = m.egg; getEl('timer').textContent = formatTime(t); applyEggSkin(); }
    getEl('mode-title').textContent = m.title;
    getEl('mode-subtitle').textContent = m.sub;
}
function toggleTimer() { playSound('click'); if(isRunning) stopTimer(); else startTimer(); }
function startTimer() {
    const m = MODES[currentModeIndex];
    timeLeft = activeBoosters.speed ? Math.floor(m.time/2) : m.time;
    isRunning = true;
    getEl('timer').textContent = formatTime(timeLeft);
    getEl('main-btn').textContent = "Сдаться"; getEl('main-btn').className = "btn stop";
    getEl('share-btn').style.display = 'none'; getEl('prev-btn').style.visibility = 'hidden'; getEl('next-btn').style.visibility = 'hidden';
    
    getEl('egg-display').textContent = m.egg; 
    getEl('crack-overlay').className = 'crack-overlay'; // Сброс
    applyEggSkin(); getEl('egg-display').classList.add('shaking'); renderBoostersPanel();
    
    const totalTime = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--; getEl('timer').textContent = formatTime(timeLeft);
        
        // Трещины
        const progress = 1 - (timeLeft / totalTime);
        const overlay = getEl('crack-overlay');
        if (progress > 0.3 && progress < 0.6) overlay.className = 'crack-overlay crack-stage-1';
        else if (progress >= 0.6) overlay.className = 'crack-overlay crack-stage-2';

        if(timeLeft <= 0) finishTimer();
    }, 1000);
}
function stopTimer() {
    clearInterval(timerInterval); isRunning = false;
    getEl('main-btn').textContent = "Начать фокус"; getEl('main-btn').className = "btn";
    getEl('prev-btn').style.visibility = 'visible'; getEl('next-btn').style.visibility = 'visible';
    getEl('egg-display').classList.remove('shaking'); 
    getEl('crack-overlay').className = 'crack-overlay';
    applyEggSkin(); updateUI(); renderBoostersPanel();
    showToast("Фокус прерван", "⚠️");
}
function finishTimer() {
    clearInterval(timerInterval); isRunning = false;
    getEl('main-btn').textContent = "Еще раз"; getEl('main-btn').className = "btn";
    getEl('share-btn').style.display = 'block'; getEl('prev-btn').style.visibility = 'visible'; getEl('next-btn').style.visibility = 'visible';
    getEl('egg-display').className = 'egg';
    getEl('crack-overlay').className = 'crack-overlay';

    const m = MODES[currentModeIndex];
    userXP+=m.xpReward; 
    
    // === ЛОГИКА ПОВЫШЕНИЯ УРОВНЯ И ВЫДАЧИ УНИКАЛЬНОГО ПИТОМЦА ===
    if(userXP >= userLevel * 200) { 
        userXP -= userLevel * 200; 
        userLevel++; 
        showToast(`Lvl UP: ${userLevel}`, "🎉"); 
        playSound('win'); 
        
        // Проверка на уникальную награду (10 уровень)
        if (userLevel === 10) {
            collection.push("🐲 God");
            showToast("Получен: 🐲 God", "🎁");
        }
    }
    
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();

    userStats.hatched++;
    
    let leg=m.id==='short'?1:5; let rare=m.id==='short'?15:30;
    if(activeBoosters.luck) { leg*=5; myBoosters.luck--; activeBoosters.luck=false; }
    if(activeBoosters.speed) { myBoosters.speed--; activeBoosters.speed=false; }
    
    saveData(); 
    renderBoostersPanel();
    
    const rnd = Math.random()*100; let pool;
    if(rnd<leg) { pool=petDatabase.legendary; playSound('legendary'); }
    else if(rnd<leg+rare) { pool=petDatabase.rare; playSound('win'); }
    else { pool=petDatabase.common; playSound('win'); }
    
    const dropped = pool[Math.floor(Math.random()*pool.length)];
    collection.push(dropped);
    
    saveData();
    
    getEl('egg-display').textContent = dropped;
    fireConfetti();
    showToast(`Получено: ${dropped}`, "🐣");
    renderCollection(); updateBalanceUI();
    const col=getEl('collection'); if(col.classList.contains('hidden')) { col.classList.remove('hidden'); getEl('inventory-arrow').textContent="▲"; }
    if(isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(200);
}
function toggleInventory() { 
    playSound('click');
    const c=getEl('collection'); const a=getEl('inventory-arrow');
    if(c.classList.contains('hidden')) { c.classList.remove('hidden'); a.textContent="▲"; } else { c.classList.add('hidden'); a.textContent="▼"; }
}
function renderCollection() {
    const c=getEl('collection'); c.innerHTML='';
    ALL_PETS_FLAT.forEach(pet => {
        const count=collection.filter(p=>p===pet).length; const r=getPetRarity(pet); const d=document.createElement('div');
        if(count>0) {
            d.className=`pet-slot ${r}`; d.textContent=pet;
            if(count>1) { const b=document.createElement('div'); b.className='slot-count'; b.textContent=`x${count}`; d.appendChild(b); }
            d.onclick=()=>openPetModal(pet, true);
        } else {
            d.className=`pet-slot locked`; d.innerHTML=`<span class="pet-silhouette">${pet}</span>`; d.onclick=()=>openPetModal(pet, false);
        }
        c.appendChild(d);
    });
}
function openPetModal(pet, owned) {
    selectedPet=pet; const r=getPetRarity(pet); const p=PRICES[r]; playSound('click');
    getEl('pet-modal').style.display='flex';
    getEl('pet-detail-view').innerHTML = owned ? 
        `<div class="pet-big-icon">${pet}</div><h3 class="pet-name">Питомец</h3><p class="pet-rarity ${r}">${r}</p><p class="pet-price">Цена: $${p}</p><button class="btn sell-action" onclick="sellPet()">Продать ($${p})</button>` :
        `<div class="pet-big-icon" style="filter:brightness(0) opacity(0.3)">${pet}</div><h3 class="pet-name">???</h3><p class="pet-rarity ${r}">${r}</p><button class="btn" style="background:#333" onclick="closeModal('pet-modal')">Закрыть</button>`;
}
function sellPet() {
    if(!selectedPet) return; const idx=collection.indexOf(selectedPet); if(idx===-1)return;
    const p=PRICES[getPetRarity(selectedPet)]; walletBalance+=p; userStats.earned+=p;
    collection.splice(idx,1); saveData(); updateBalanceUI(); renderCollection(); closeModal('pet-modal'); showToast(`Продано +$${p}`, "💰"); playSound('money');
}
function switchShopTab(t) { currentShopTab=t; document.querySelectorAll('#shop-modal .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderShop(); playSound('click'); }
function renderShop() {
    const c=getEl('shop-items'); c.innerHTML='';
    SHOP_DATA[currentShopTab].forEach(item => {
        const d=document.createElement('div'); d.className='shop-item';
        let btnHTML='';
        if(currentShopTab==='boosters') {
            btnHTML=`<button class="buy-btn" onclick="buyItem('${item.id}',${item.price})">$${item.price}</button>`;
            d.innerHTML=`<div class="shop-item-icon">${item.icon}</div><div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888">${item.desc}</div>${btnHTML}`;
        } else {
            const owned=ownedItems[currentShopTab].includes(item.id);
            const active=(currentShopTab==='themes'&&activeTheme===item.id)||(currentShopTab==='eggs'&&activeEggSkin===item.id);
            let cls=owned?"buy-btn owned":"buy-btn"; if(!owned&&walletBalance<item.price)cls+=" locked";
            let txt=owned?(active?"Выбрано":"Выбрать"):`$${item.price}`;
            btnHTML=`<button class="${cls}" onclick="buyItem('${item.id}',${item.price})">${txt}</button>`;
            d.innerHTML=`<div class="shop-item-icon">${currentShopTab==='themes'?'🎨':'🥚'}</div><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        }
        c.appendChild(d);
    });
}
function buyItem(id, price) {
    if(currentShopTab==='boosters') {
        if(walletBalance>=price) { walletBalance-=price; if(!myBoosters[id])myBoosters[id]=0; myBoosters[id]++; saveData(); updateBalanceUI(); showToast("Куплено!", "🧪"); playSound('money'); } else showToast("Мало денег", "🚫");
        return;
    }
    const owned=ownedItems[currentShopTab].includes(id);
    if(owned) {
        if(currentShopTab==='themes') { activeTheme=id; applyTheme(); } else { activeEggSkin=id; applyEggSkin(); }
        saveData(); renderShop(); playSound('click');
    } else {
        if(walletBalance>=price) {
            walletBalance-=price; ownedItems[currentShopTab].push(id);
            if(currentShopTab==='themes') { activeTheme=id; applyTheme(); } else { activeEggSkin=id; applyEggSkin(); }
            saveData(); updateBalanceUI(); renderShop(); showToast("Куплено!", "🛍️"); playSound('money');
        } else showToast("Мало денег", "🚫");
    }
}
function switchAchTab(t) { currentAchTab=t; document.querySelectorAll('#achievements-modal .tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); if(t==='achievements')renderAch();else renderQuests(); playSound('click'); }
function renderAch() {
    const c=getEl('achievements-list'); c.innerHTML=''; let u=new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => {
        const claimed=claimedAchievements.includes(a.id);
        let done=false; if((a.type==='money'&&userStats.earned>=a.goal)||(a.type==='unique'&&u>=a.goal)||(!a.type&&userStats.hatched>=a.goal)) done=true;
        const d=document.createElement('div'); d.className=`achievement-card ${done?'unlocked':''}`;
        let btn=''; if(done&&!claimed)btn=`<button class="buy-btn" onclick="claimAch('${a.id}',${a.reward})">Забрать $${a.reward}</button>`; else if(claimed)btn="✅"; else btn=`<span style="font-size:12px;color:#888">Цель: ${a.goal}</span>`;
        d.innerHTML=`<div class="ach-icon">${done?'🏆':'🔒'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}
function renderQuests() {
    const c=getEl('achievements-list'); c.innerHTML='';
    QUESTS_DATA.forEach(q => {
        const claimed=claimedQuests.includes(q.id);
        const d=document.createElement('div'); d.className=`achievement-card ${claimed?'unlocked':''}`;
        let btn=''; if(claimed)btn="✅"; else if(q.type==='link')btn=`<button id="qbtn-${q.id}" class="buy-btn" style="background:#007aff" onclick="clickLink('${q.id}','${q.url}',${q.reward})">Выполнить</button>`; else if(q.type==='invite') { if((userStats.invites||0)>=q.goal)btn=`<button class="buy-btn" onclick="claimQuest('${q.id}',${q.reward})">Забрать $${q.reward}</button>`; else btn=`<span style="font-size:12px;color:#888">${userStats.invites||0}/${q.goal}</span>`; }
        d.innerHTML=`<div class="ach-icon">📜</div><div class="ach-info"><div class="ach-title">${q.title}</div><div class="ach-desc">${q.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}
function clickLink(id, u, r) { if(window.Telegram.WebApp)window.Telegram.WebApp.openLink(u); else window.open(u,'_blank'); const b=getEl(`qbtn-${id}`); if(b){b.textContent="Проверяю...";b.disabled=true;b.style.background="#555";setTimeout(()=>claimQuest(id,r),4000);}}
function claimAch(id, r) { if(claimedAchievements.includes(id))return; claimedAchievements.push(id); walletBalance+=r; saveData(); updateBalanceUI(); renderAch(); showToast(`Награда +$${r}`); playSound('money'); }
function claimQuest(id, r) { if(claimedQuests.includes(id))return; claimedQuests.push(id); walletBalance+=r; saveData(); updateBalanceUI(); renderQuests(); showToast(`Награда +$${r}`); playSound('money'); }
function handleShare() { if(!userStats.invites)userStats.invites=0; userStats.invites++; saveData(); checkAchievements(); const t=`У меня ${new Set(collection).size} петов в Focus Hatcher!`; const u=`https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(t)}`; if(window.Telegram.WebApp)window.Telegram.WebApp.openTelegramLink(u); else window.open(u,'_blank'); }
function saveData() {
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    localStorage.setItem('activeTheme', activeTheme);
    localStorage.setItem('activeEggSkin', activeEggSkin);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
    localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    localStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
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
        Telegram.WebApp.CloudStorage.setItem('userStats', JSON.stringify(userStats));
        Telegram.WebApp.CloudStorage.setItem('myBoosters', JSON.stringify(myBoosters));
        Telegram.WebApp.CloudStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
        Telegram.WebApp.CloudStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
    }
}
function applyTheme() { const t=SHOP_DATA.themes.find(x=>x.id===activeTheme); document.body.className=t?t.cssClass:''; }
function applyEggSkin() { const s=SHOP_DATA.eggs.find(x=>x.id===activeEggSkin); const egg=getEl('egg-display'); egg.className='egg'; if(MODES[currentModeIndex].style==='hardcore')egg.classList.add('diamond-egg'); else if(s&&s.skinClass&&activeEggSkin!=='default')egg.classList.add(s.skinClass); if(isRunning)egg.classList.add('shaking'); }
function updateLevelUI() { const max=userLevel*200; let p=(userXP/max)*100; if(p>100)p=100; getEl('xp-bar').style.width=`${p}%`; getEl('level-number').textContent=`Lvl ${userLevel}`; let r=Math.floor(userLevel/5); getEl('rank-name').textContent=RANKS[Math.min(r,RANKS.length-1)]; }

// ЗАПУСК ПОСЛЕ ЗАГРУЗКИ (ВАЖНО!)
window.onload = initGame;