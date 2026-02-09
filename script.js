// === НАСТРОЙКИ ===
const MODES = [
    { 
        id: 'short', 
        time: 10, // ТЕСТ (Релиз: 25*60)
        xpReward: 250, 
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Обычный шанс'
    },
    { 
        id: 'long', 
        time: 20, // ТЕСТ (Релиз: 60*60)
        xpReward: 600, 
        egg: '🪺', 
        title: '60 минут', 
        sub: 'Высокий шанс (x4) 🔥'
    }
];

// === ЦЕНЫ (ЭКОНОМИКА) ===
const PRICES = {
    common: 10,
    rare: 50,
    legendary: 1000
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

// === ЗАГРУЗКА ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

// Элементы
const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const mainBtn = document.getElementById('main-btn');
const shareBtn = document.getElementById('share-btn');
const statusText = document.getElementById('status-text');
const collectionContainer = document.getElementById('collection');
const modeTitle = document.getElementById('mode-title');
const modeSub = document.getElementById('mode-subtitle');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const xpBar = document.getElementById('xp-bar');
const levelNumber = document.getElementById('level-number');
const rankName = document.getElementById('rank-name');
const totalMoneyDisplay = document.getElementById('total-money'); // Элемент денег

// === ФУНКЦИЯ ПОДСЧЕТА ДЕНЕГ ===
function calculateMoney() {
    let total = 0;
    collection.forEach(pet => {
        const rarity = getPetRarity(pet);
        total += PRICES[rarity];
    });
    // Форматируем число (например 1500 -> 1,500)
    totalMoneyDisplay.textContent = `💰 ${total.toLocaleString()}`;
    return total;
}

// === СИСТЕМА УРОВНЕЙ ===
function updateLevelUI() {
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
        statusText.textContent = `УРОВЕНЬ ПОВЫШЕН! Lvl ${userLevel} 🎉`;
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
        eggDisplay.textContent = mode.egg;
        timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time;
    }
    modeTitle.textContent = mode.title;
    modeSub.textContent = mode.sub;
    // timerDisplay.style.color = mode.color; <--- УДАЛИЛИ ЭТУ СТРОКУ, ЧТОБЫ БЫЛ БЕЛЫЙ
}

function switchMode() {
    if (isRunning) return; 
    currentModeIndex = currentModeIndex === 0 ? 1 : 0;
    eggDisplay.style.transform = "scale(0.5)";
    setTimeout(() => {
        updateUI();
        eggDisplay.style.transform = "scale(1)";
    }, 150);
}

function renderCollection() {
    collectionContainer.innerHTML = '';
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet);
        slot.className = `pet-slot ${rarity}`;
        slot.textContent = pet;
        collectionContainer.appendChild(slot);
    });
    // Пересчитываем деньги при каждой отрисовке
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
    prevBtn.style.visibility = 'hidden';
    nextBtn.style.visibility = 'hidden';
    shareBtn.style.display = 'none';
    
    mainBtn.textContent = "Сдаться";
    mainBtn.className = "btn stop";
    
    eggDisplay.classList.add('shaking');
    statusText.textContent = "Фармим капитал...";

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    prevBtn.style.visibility = 'visible';
    nextBtn.style.visibility = 'visible';
    mainBtn.textContent = "Начать фокус";
    mainBtn.className = "btn";
    eggDisplay.classList.remove('shaking');
    updateUI(); 
    statusText.textContent = "Потеряно время = потеряны деньги!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    eggDisplay.classList.remove('shaking');
    
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
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); // Это обновит и деньги тоже!
    
    mainBtn.textContent = "Ещё раз";
    mainBtn.className = "btn";
    shareBtn.style.display = 'block';
    
    // Показываем цену выпавшего
    const price = PRICES[getPetRarity(currentPet)];
    
    if (!statusText.textContent.includes("УРОВЕНЬ")) {
        statusText.textContent = `+${price}$ | ${rarityName}: ${currentPet}`;
    }
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ") window.navigator.vibrate([100,50,100,50,500]);
        else window.navigator.vibrate([200]);
    }
    
    setTimeout(() => {
        prevBtn.style.visibility = 'visible';
        nextBtn.style.visibility = 'visible';
    }, 2000);
}

// === ШЕРИНГ (Добавляем инфу про деньги) ===
shareBtn.addEventListener('click', () => {
    const totalMoney = calculateMoney(); // Получаем текущую сумму
    const text = `💰 Мой капитал: $${totalMoney}! Высидел ${currentPet}. Сможешь богаче?`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
});

// Старт
renderCollection();
updateLevelUI();
updateUI();