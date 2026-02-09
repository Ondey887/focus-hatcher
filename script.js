// === НАСТРОЙКИ (ТЕСТОВОЕ ВРЕМЯ) ===
// ПЕРЕД РЕЛИЗОМ: Замени 10 и 20 на (25 * 60) и (60 * 60)
const MODES = [
    { 
        id: 'short', 
        time: 10, // 10 секунд
        xpReward: 250, 
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Обычный шанс'
    },
    { 
        id: 'long', 
        time: 20, // 20 секунд
        xpReward: 600, 
        egg: '🪺', 
        title: '60 минут', 
        sub: 'Высокий шанс (x4) 🔥'
    }
];

// === ЦЕНЫ ЗА ПИТОМЦЕВ ===
const PRICES = {
    common: 10,       // Обычный = $10
    rare: 50,         // Редкий = $50
    legendary: 1000   // Легендарный = $1000
};

const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда"];

let currentModeIndex = 0;
let timeLeft = MODES[0].time;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};

function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

// === ЗАГРУЗКА ДАННЫХ ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
// Фикс панды
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

// === БЕЗОПАСНЫЙ ПОИСК ЭЛЕМЕНТОВ ===
// (Если элемента нет, скрипт не сломается)
const getEl = (id) => document.getElementById(id);

const eggDisplay = getEl('egg-display');
const timerDisplay = getEl('timer');
const mainBtn = getEl('main-btn');
const shareBtn = getEl('share-btn');
const statusText = getEl('status-text');
const collectionContainer = getEl('collection');
const modeTitle = getEl('mode-title');
const modeSub = getEl('mode-subtitle');
const prevBtn = getEl('prev-btn');
const nextBtn = getEl('next-btn');
const xpBar = getEl('xp-bar');
const levelNumber = getEl('level-number');
const rankName = getEl('rank-name');
const totalMoneyDisplay = getEl('total-money');

// === ПОДСЧЕТ ДЕНЕГ ===
function calculateMoney() {
    if (!totalMoneyDisplay) return; // Защита от ошибки
    let total = 0;
    collection.forEach(pet => {
        const rarity = getPetRarity(pet);
        total += PRICES[rarity] || 0;
    });
    totalMoneyDisplay.textContent = `💰 ${total.toLocaleString()}`;
    return total;
}

// === СИСТЕМА УРОВНЕЙ ===
function updateLevelUI() {
    if (!xpBar || !levelNumber || !rankName) return;
    
    const xpForNextLevel = userLevel * 200; 
    let percentage = (userXP / xpForNextLevel) * 100;
    if (percentage > 100) percentage = 100;
    
    xpBar.style.width = `${percentage}%`;
    levelNumber.textContent = `Lvl ${userLevel}`;
    
    let rankIndex = Math.floor(userLevel / 5);
    if (rankIndex >= RANKS.length) rankIndex = RANKS.length - 1;
    rankName.textContent = RANKS[rankIndex];
}

function addXP(amount) {
    userXP += amount;
    let xpNeeded = userLevel * 200;
    
    if (userXP >= xpNeeded) {
        userXP = userXP - xpNeeded;
        userLevel++;
        if (statusText) statusText.textContent = `УРОВЕНЬ ПОВЫШЕН! Lvl ${userLevel} 🎉`;
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }
    
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();
}

// === ИНТЕРФЕЙС ===
function updateUI() {
    const mode = MODES[currentModeIndex];
    if (!isRunning) {
        if (eggDisplay) eggDisplay.textContent = mode.egg;
        if (timerDisplay) timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time;
    }
    if (modeTitle) modeTitle.textContent = mode.title;
    if (modeSub) modeSub.textContent = mode.sub;
}

function switchMode() {
    if (isRunning) return; 
    currentModeIndex = currentModeIndex === 0 ? 1 : 0;
    
    if (eggDisplay) {
        eggDisplay.style.transform = "scale(0.5)";
        setTimeout(() => {
            updateUI();
            eggDisplay.style.transform = "scale(1)";
        }, 150);
    } else {
        updateUI();
    }
}

function renderCollection() {
    if (!collectionContainer) return;
    collectionContainer.innerHTML = '';
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet);
        slot.className = `pet-slot ${rarity}`;
        slot.textContent = pet;
        collectionContainer.appendChild(slot);
    });
    calculateMoney();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.visibility = 'hidden';
    if (shareBtn) shareBtn.style.display = 'none';
    
    if (mainBtn) {
        mainBtn.textContent = "Сдаться";
        mainBtn.className = "btn stop";
    }
    
    if (eggDisplay) eggDisplay.classList.add('shaking');
    if (statusText) statusText.textContent = "Фармим капитал...";

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (prevBtn) prevBtn.style.visibility = 'visible';
    if (nextBtn) nextBtn.style.visibility = 'visible';
    
    if (mainBtn) {
        mainBtn.textContent = "Начать фокус";
        mainBtn.className = "btn";
    }
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    updateUI(); 
    if (statusText) statusText.textContent = "Потеряно время = потеряны деньги!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    
    const mode = MODES[currentModeIndex];
    addXP(mode.xpReward);
    
    const chance = Math.random() * 100;
    let pool, rarityName;

    if (mode.id === 'short') { 
        if (chance < 5) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; }
        else if (chance < 40) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    } else { 
        if (chance < 20) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; } 
        else if (chance < 70) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    }

    currentPet = pool[Math.floor(Math.random() * pool.length)];
    if (eggDisplay) eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); 
    
    if (mainBtn) {
        mainBtn.textContent = "Ещё раз";
        mainBtn.className = "btn";
    }
    if (shareBtn) shareBtn.style.display = 'block';
    
    const price = PRICES[getPetRarity(currentPet)];
    
    if (statusText && !statusText.textContent.includes("УРОВЕНЬ")) {
        statusText.textContent = `+${price}$ | ${rarityName}: ${currentPet}`;
    }
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ") window.navigator.vibrate([100,50,100,50,500]);
        else window.navigator.vibrate([200]);
    }
    
    setTimeout(() => {
        if (prevBtn) prevBtn.style.visibility = 'visible';
        if (nextBtn) nextBtn.style.visibility = 'visible';
    }, 2000);
}

// === ОБРАБОТЧИКИ СОБЫТИЙ (Защита от ошибок) ===
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const totalMoney = calculateMoney(); 
        const text = `💰 Мой капитал: $${totalMoney}! Высидел ${currentPet}. Сможешь богаче?`;
        const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
        
        if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
        else window.open(url, '_blank');
    });
}

if (prevBtn) prevBtn.addEventListener('click', switchMode);
if (nextBtn) nextBtn.addEventListener('click', switchMode);

if (mainBtn) {
    mainBtn.addEventListener('click', () => {
        if (isRunning) stopTimer();
        else startTimer();
    });
}

// ЗАПУСК
renderCollection();
updateLevelUI();
updateUI();
