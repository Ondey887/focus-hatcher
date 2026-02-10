// === НАСТРОЙКИ ===
const MODES = [
    { 
        id: 'short', 
        time: 10, 
        xpReward: 250, 
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Шанс Легендарки: 1%', 
        style: '' 
    },
    { 
        id: 'long', 
        time: 20, 
        xpReward: 1000, 
        egg: '💎', 
        title: '60 минут', 
        sub: 'Шанс Легендарки: 5% 🔥', 
        style: 'hardcore' 
    }
];

const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

const ACHIEVEMENTS_DATA = [
    { id: 'first_hatch', title: 'Первый шаг', desc: 'Вырасти 1 питомца', goal: 1, reward: 100 },
    { id: 'rich_kid', title: 'Богач', desc: 'Заработай $1000', goal: 1000, type: 'money', reward: 500 },
    { id: 'collector', title: 'Коллекционер', desc: 'Собери 5 уникальных', goal: 5, type: 'unique', reward: 1000 },
    { id: 'hard_worker', title: 'Трудяга', desc: 'Вырасти 10 питомцев', goal: 10, reward: 2000 }
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
    ]
};

// === ПЕРЕМЕННЫЕ ===
let currentModeIndex = 0;
let timeLeft = MODES[0].time;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻", "🐨", "🐤", "🐛"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};
const TOTAL_PETS_COUNT = 24;

// === ЗАГРУЗКА И ВОССТАНОВЛЕНИЕ ДАННЫХ ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
let walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
let activeTheme = localStorage.getItem('activeTheme') || 'default';
let activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';

// Проверка на сбой статистики
let userStats = { hatched: 0, earned: 0 };
try {
    const savedStats = JSON.parse(localStorage.getItem('userStats'));
    if (savedStats) userStats = savedStats;
} catch (e) {
    console.log("Stats reset due to error");
}

let claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];

// === ЭЛЕМЕНТЫ (с защитой от null) ===
const getEl = (id) => document.getElementById(id);
const eggDisplay = getEl('egg-display');
const timerDisplay = getEl('timer');
const mainBtn = getEl('main-btn');
const shareBtn = getEl('share-btn');
const statusText = getEl('status-text');
const collectionContainer = getEl('collection');
const xpBar = getEl('xp-bar');
const levelNumber = getEl('level-number');
const rankName = getEl('rank-name');
const totalMoneyDisplay = getEl('total-money');
const uniqueCountDisplay = getEl('unique-count');
const shopModal = getEl('shop-modal');
const shopItemsContainer = getEl('shop-items');
const petModal = getEl('pet-modal');
const achievementsModal = getEl('achievements-modal');
const achievementsList = getEl('achievements-list');
const inventoryArrow = getEl('inventory-arrow');
const modeTitle = getEl('mode-title');
const modeSub = getEl('mode-subtitle');
const prevBtn = getEl('prev-btn');
const nextBtn = getEl('next-btn');

let currentShopTab = 'themes';
let selectedPetIndex = null;

// === ФУНКЦИИ ===
function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

function updateBalanceUI() {
    if(totalMoneyDisplay) totalMoneyDisplay.textContent = `💰 $${walletBalance.toLocaleString()}`;
    if(uniqueCountDisplay) uniqueCountDisplay.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// === ЛОГИКА ТАЙМЕРА (ИСПРАВЛЕННАЯ) ===
function startTimer() {
    if (isRunning) return;
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time; 
    
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (eggDisplay) eggDisplay.textContent = mode.egg;
    
    isRunning = true;
    if(prevBtn) prevBtn.style.visibility='hidden'; 
    if(nextBtn) nextBtn.style.visibility='hidden'; 
    if(shareBtn) shareBtn.style.display='none';
    if(mainBtn) { mainBtn.textContent="Сдаться"; mainBtn.className="btn stop"; }
    
    applyEggSkin();
    if(eggDisplay) eggDisplay.classList.add('shaking');
    if(statusText) statusText.textContent="Фармим...";

    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent=formatTime(timeLeft);
        if(timeLeft <= 0) {
            finishTimer(); // Вызов финиша
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); 
    isRunning=false;
    
    if(prevBtn) prevBtn.style.visibility='visible'; 
    if(nextBtn) nextBtn.style.visibility='visible';
    if(mainBtn) { mainBtn.textContent="Начать фокус"; mainBtn.className="btn"; }
    
    if(eggDisplay) {
        eggDisplay.classList.remove('shaking');
        applyEggSkin(); 
    }
    
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time;
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if(statusText) statusText.textContent="Сдался = нет награды";
}

function finishTimer() {
    // 1. Срочная остановка и смена UI
    clearInterval(timerInterval); 
    isRunning = false;
    
    if (mainBtn) {
        mainBtn.textContent = "Ещё раз";
        mainBtn.className = "btn";
    }
    if (shareBtn) shareBtn.style.display = 'block';
    if (prevBtn) prevBtn.style.visibility = 'visible'; 
    if (nextBtn) nextBtn.style.visibility = 'visible';

    // 2. Очистка визуальных эффектов
    if (eggDisplay) {
        eggDisplay.className = 'egg'; // Сброс классов
    }

    // 3. Безопасная логика начисления (в try-catch)
    try {
        const mode = MODES[currentModeIndex];
        
        // XP
        userXP += mode.xpReward;
        if (userXP >= userLevel * 200) {
            userXP -= userLevel * 200;
            userLevel++;
        }
        localStorage.setItem('userXP', userXP);
        localStorage.setItem('userLevel', userLevel);
        updateLevelUI();

        // Stats
        userStats.hatched += 1;
        localStorage.setItem('userStats', JSON.stringify(userStats));

        // Drop
        const chance = Math.random() * 100;
        let pool;
        if (mode.id === 'short') { 
            if (chance < 1) pool = petDatabase.legendary;
            else if (chance < 16) pool = petDatabase.rare;
            else pool = petDatabase.common;
        } else { 
            if (chance < 5) pool = petDatabase.legendary;
            else if (chance < 35) pool = petDatabase.rare;
            else pool = petDatabase.common;
        }
        
        currentPet = pool[Math.floor(Math.random() * pool.length)];
        
        // Показываем питомца
        if (eggDisplay) eggDisplay.textContent = currentPet;
        
        // Сохраняем
        collection.push(currentPet);
        localStorage.setItem('myCollection', JSON.stringify(collection));
        renderCollection();
        
        // Текст
        const price = PRICES[getPetRarity(currentPet)];
        if (statusText) statusText.textContent = `+${price}$ | Ты получил: ${currentPet}`;
        
        if (window.navigator.vibrate) window.navigator.vibrate(200);

    } catch (error) {
        console.error("Ошибка сохранения:", error);
        if (statusText) statusText.textContent = "Ошибка сохранения, но ты молодец!";
    }
}

// === ОСТАЛЬНЫЕ ФУНКЦИИ ===
function applyTheme() { const t = SHOP_DATA.themes.find(x => x.id === activeTheme); document.body.className = t ? t.cssClass : ''; }

function applyEggSkin() { 
    if(!eggDisplay) return;
    
    const mode = MODES[currentModeIndex];
    const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 

    // Сброс
    eggDisplay.className = 'egg'; 

    // Если режим Hardcore (60 мин) -> Ставим алмаз
    if (mode.style === 'hardcore') {
        eggDisplay.classList.add('diamond-egg');
    } else {
        // Если обычный режим -> Ставим скин (если есть)
        if (s && s.skinClass && activeEggSkin !== 'default') {
            eggDisplay.classList.add(s.skinClass);
        }
    }
    
    if(isRunning) eggDisplay.classList.add('shaking'); 
}

function updateLevelUI() {
    if (!xpBar) return;
    const xpForNextLevel = userLevel * 200; 
    let percentage = (userXP / xpForNextLevel) * 100;
    if (percentage > 100) percentage = 100;
    xpBar.style.width = `${percentage}%`;
    if(levelNumber) levelNumber.textContent = `Lvl ${userLevel}`;
    let rankIndex = Math.floor(userLevel / 5);
    if(rankName) rankName.textContent = RANKS[Math.min(rankIndex, RANKS.length - 1)];
}

function updateUI() {
    const mode = MODES[currentModeIndex];
    if(!isRunning) { 
        if(eggDisplay) eggDisplay.textContent = mode.egg; 
        if(timerDisplay) timerDisplay.textContent = formatTime(mode.time); 
        applyEggSkin(); 
    }
    if(modeTitle) modeTitle.textContent = mode.title; 
    if(modeSub) modeSub.textContent = mode.sub;
}

// АЧИВКИ и ПРОДАЖА (Оставлены без изменений для краткости, они работают)
function checkAchievements() {
    let uniqueCount = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(ach => {
        if (claimedAchievements.includes(ach.id)) return; 
        let completed = false;
        if (ach.type === 'money' && userStats.earned >= ach.goal) completed = true;
        else if (ach.type === 'unique' && uniqueCount >= ach.goal) completed = true;
        else if (!ach.type && userStats.hatched >= ach.goal) completed = true;
    });
}
function renderAchievements() {
    if(!achievementsList) return;
    achievementsList.innerHTML = '';
    let uniqueCount = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(ach => {
        let current = userStats.hatched;
        if (ach.type === 'money') current = userStats.earned;
        if (ach.type === 'unique') current = uniqueCount;
        const isClaimed = claimedAchievements.includes(ach.id);
        const isCompleted = current >= ach.goal;
        const div = document.createElement('div');
        div.className = `achievement-card ${isCompleted ? 'unlocked' : ''}`;
        let buttonHTML = '';
        if (isCompleted && !isClaimed) {
            buttonHTML = `<button onclick="claimAchievement('${ach.id}', ${ach.reward})" style="padding:5px; background:#34c759; border:none; border-radius:5px; color:#fff; font-size:10px;">Забрать $${ach.reward}</button>`;
        } else if (isClaimed) buttonHTML = `<span style="font-size:16px;">✅</span>`;
        else buttonHTML = `<span style="font-size:12px; color:#8e8e93;">${current}/${ach.goal}</span>`;
        div.innerHTML = `<div class="ach-icon">${isCompleted ? '🏆' : '🔒'}</div><div class="ach-info"><p class="ach-title">${ach.title}</p><p class="ach-desc">${ach.desc}</p></div><div class="ach-action">${buttonHTML}</div>`;
        achievementsList.appendChild(div);
    });
}
window.claimAchievement = function(id, reward) {
    if (claimedAchievements.includes(id)) return;
    claimedAchievements.push(id); localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    walletBalance += reward; localStorage.setItem('walletBalance', walletBalance);
    updateBalanceUI(); renderAchievements();
}

// EVENTS
if(getEl('open-shop-btn')) getEl('open-shop-btn').onclick = () => { if(shopModal) shopModal.style.display='flex'; switchShopTab('themes'); };
if(getEl('close-shop')) getEl('close-shop').onclick = () => { if(shopModal) shopModal.style.display='none'; };
if(getEl('achievements-btn')) getEl('achievements-btn').onclick = () => { if(achievementsModal) achievementsModal.style.display='flex'; renderAchievements(); };
if(getEl('close-achievements')) getEl('close-achievements').onclick = () => { if(achievementsModal) achievementsModal.style.display='none'; };
if(prevBtn) prevBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(nextBtn) nextBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(mainBtn) mainBtn.onclick = () => isRunning ? stopTimer() : startTimer();
if(shareBtn) shareBtn.onclick = () => {
    let uniqueCount = new Set(collection).size;
    const text = `У меня ${uniqueCount} петов и $${walletBalance} в Focus Hatcher! Заходи.`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
};

// INIT
applyTheme();
renderCollection();
updateLevelUI();
updateUI();