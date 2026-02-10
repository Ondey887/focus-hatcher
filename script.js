// === НАСТРОЙКИ (ТЕСТОВОЕ ВРЕМЯ) ===
// ПЕРЕД РЕЛИЗОМ: Замени 10 и 20 на (25 * 60) и (60 * 60)
const MODES = [
    { 
        id: 'short', 
        time: 10, 
        xpReward: 250, 
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Шанс Легендарки: 1%' 
    },
    { 
        id: 'long', 
        time: 20, 
        xpReward: 1000, 
        egg: '🪺', 
        title: '60 минут', 
        sub: 'Шанс Легендарки: 5% 🔥' 
    }
];

// === ЭКОНОМИКА ===
const PRICES = {
    common: 15,
    rare: 150,
    legendary: 5000
};

const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

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

// Всего уникальных существ
const TOTAL_PETS_COUNT = petDatabase.common.length + petDatabase.rare.length + petDatabase.legendary.length;

function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

// Загрузка
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

// Элементы (безопасный поиск)
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
const uniqueCountDisplay = getEl('unique-count');

// === ЛОГИКА ===

function calculateStats() {
    if (!totalMoneyDisplay) return;
    let totalMoney = 0;
    let uniquePets = new Set(collection);
    
    collection.forEach(pet => {
        const rarity = getPetRarity(pet);
        totalMoney += PRICES[rarity] || 0;
    });
    
    totalMoneyDisplay.textContent = `💰 $${totalMoney.toLocaleString()}`;
    if (uniqueCountDisplay) {
        uniqueCountDisplay.textContent = `Коллекция: ${uniquePets.size} / ${TOTAL_PETS_COUNT}`;
    }
    return totalMoney;
}

function updateLevelUI() {
    if (!xpBar) return;
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
    }
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();
}

function updateUI() {
    const mode = MODES[currentModeIndex];
    if (!isRunning) {
        if (eggDisplay) eggDisplay.textContent = mode.egg;
        if (timerDisplay) timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time; // Сброс времени при обновлении интерфейса
    }
    if (modeTitle) modeTitle.textContent = mode.title;
    if (modeSub) modeSub.textContent = mode.sub;
}

function switchMode() {
    if (isRunning) return; 
    currentModeIndex = currentModeIndex === 0 ? 1 : 0;
    if (eggDisplay) {
        eggDisplay.style.transform = "scale(0.5)";
        setTimeout(() => { updateUI(); eggDisplay.style.transform = "scale(1)"; }, 150);
    } else { updateUI(); }
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
    calculateStats();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    if (isRunning) return;
    
    // === ИСПРАВЛЕНИЕ БАГА ТУТ ===
    // Принудительно сбрасываем время на старте!
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time; 
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    // ============================
    
    isRunning = true;
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.visibility = 'hidden';
    if (shareBtn) shareBtn.style.display = 'none';
    
    if (mainBtn) {
        mainBtn.textContent = "Сдаться";
        mainBtn.className = "btn stop";
    }
    if (eggDisplay) eggDisplay.classList.add('shaking');
    if (statusText) statusText.textContent = "Фармим...";

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
    if (mainBtn) { mainBtn.textContent = "Начать фокус"; mainBtn.className = "btn"; }
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    
    updateUI(); // Это тоже вернет время в норму
    
    if (statusText) statusText.textContent = "Сдался = нет награды";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    
    const mode = MODES[currentModeIndex];
    addXP(mode.xpReward);
    
    const chance = Math.random() * 100;
    let pool, rarityName;

    // ШАНСЫ
    if (mode.id === 'short') { 
        if (chance < 1) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; }
        else if (chance < 16) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    } else { 
        if (chance < 5) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; } 
        else if (chance < 35) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    }

    currentPet = pool[Math.floor(Math.random() * pool.length)];
    if (eggDisplay) eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); 
    
    if (mainBtn) { mainBtn.textContent = "Ещё раз"; mainBtn.className = "btn"; }
    if (shareBtn) shareBtn.style.display = 'block';
    
    const price = PRICES[getPetRarity(currentPet)];
    
    if (statusText && !statusText.textContent.includes("УРОВЕНЬ")) {
        statusText.textContent = `+${price}$ | ${rarityName}: ${currentPet}`;
    }
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ") window.navigator.vibrate([100,50,100,50,500,50,500]);
        else window.navigator.vibrate([200]);
    }
    
    setTimeout(() => {
        if (prevBtn) prevBtn.style.visibility = 'visible';
        if (nextBtn) nextBtn.style.visibility = 'visible';
    }, 2000);
}

// Event Listeners
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const totalMoney = calculateStats(); 
        let uniqueCount = new Set(collection).size;
        const text = `Я собрал ${uniqueCount}/20 питомцев и заработал $${totalMoney}! Выпал ${currentPet}. Догоняй!`;
        const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
        if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
        else window.open(url, '_blank');
    });
}
if (prevBtn) prevBtn.addEventListener('click', switchMode);
if (nextBtn) nextBtn.addEventListener('click', switchMode);
if (mainBtn) mainBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());

// Init
renderCollection();
updateLevelUI();
updateUI();
