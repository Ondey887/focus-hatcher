// === НАСТРОЙКИ РЕЖИМОВ ===
const MODES = [
    { 
        id: 'short', 
        time: 10, // ТЕСТ: 10 сек (Релиз: 25 * 60)
        xpReward: 250, // Награда опытом
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Обычный шанс',
        color: '#34c759' 
    },
    { 
        id: 'long', 
        time: 20, // ТЕСТ: 20 сек (Релиз: 60 * 60)
        xpReward: 600, // Награда опытом (Бонус!)
        egg: '🪺', 
        title: '60 минут', 
        sub: 'Высокий шанс (x4) 🔥',
        color: '#ff9500' 
    }
];

// === ЗВАНИЯ ===
const RANKS = [
    "Новичок",           // 1-4
    "Искатель",          // 5-9
    "Укротитель Яиц",    // 10-14
    "Мастер Фокуса",     // 15-19
    "Ниндзя Времени",    // 20-29
    "Повелитель Дзена",  // 30-49
    "ЛЕГЕНДА"            // 50+
];

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
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

// Загрузка XP и Уровня
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

// Элементы уровней
const xpBar = document.getElementById('xp-bar');
const levelNumber = document.getElementById('level-number');
const rankName = document.getElementById('rank-name');

// === СИСТЕМА УРОВНЕЙ ===
function updateLevelUI() {
    // Формула: нужно 100 * уровень опыта для следующего (100, 200, 300...)
    const xpForNextLevel = userLevel * 200; 
    
    // Процент заполнения
    let percentage = (userXP / xpForNextLevel) * 100;
    if (percentage > 100) percentage = 100;
    
    xpBar.style.width = `${percentage}%`;
    levelNumber.textContent = `Lvl ${userLevel}`;
    
    // Звания (каждые 5 уровней новое звание)
    let rankIndex = Math.floor(userLevel / 5);
    if (rankIndex >= RANKS.length) rankIndex = RANKS.length - 1;
    rankName.textContent = RANKS[rankIndex];
}

function addXP(amount) {
    userXP += amount;
    
    // Проверка повышения уровня
    let xpNeeded = userLevel * 200;
    
    if (userXP >= xpNeeded) {
        userXP = userXP - xpNeeded; // Оставляем остаток
        userLevel++;
        statusText.textContent = `УРОВЕНЬ ПОВЫШЕН! Теперь ты Lvl ${userLevel} 🎉`;
        
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }
    
    // Сохранение
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();
}

// === ФУНКЦИИ ИНТЕРФЕЙСА ===
function updateUI() {
    const mode = MODES[currentModeIndex];
    if (!isRunning) {
        eggDisplay.textContent = mode.egg;
        timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time;
    }
    modeTitle.textContent = mode.title;
    modeSub.textContent = mode.sub;
    timerDisplay.style.color = mode.color;
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

// === ЛОГИКА ИГРЫ ===
function renderCollection() {
    collectionContainer.innerHTML = '';
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        slot.className = `pet-slot ${getPetRarity(pet)}`;
        slot.textContent = pet;
        collectionContainer.appendChild(slot);
    });
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
    statusText.textContent = "Набираем опыт...";

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
    statusText.textContent = "Опыт потерян!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    eggDisplay.classList.remove('shaking');
    
    const mode = MODES[currentModeIndex];
    
    // === ВЫДАЧА НАГРАДЫ XP ===
    addXP(mode.xpReward);
    
    // === ШАНСЫ ПИТОМЦЕВ ===
    const chance = Math.random() * 100;
    let pool, rarityName;

    if (mode.id === 'short') { 
        if (chance < 5) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; }
        else if (chance < 40) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    } else { 
        if (chance < 20) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; } 
        else if (chance < 70) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    }

    currentPet = pool[Math.floor(Math.random() * pool.length)];
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection();
    
    mainBtn.textContent = "Ещё раз";
    mainBtn.className = "btn";
    shareBtn.style.display = 'block';
    
    if (statusText.textContent.includes("УРОВЕНЬ ПОВЫШЕН")) {
        // Если уже написано про уровень, добавляем инфо про питомца через 2 сек
        setTimeout(() => {
             statusText.textContent = `${rarityName} Ты получил: ${currentPet}`;
        }, 2000);
    } else {
        statusText.textContent = `+${mode.xpReward} XP | ${rarityName}: ${currentPet}`;
    }
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ!") window.navigator.vibrate([100,50,100,50,500]);
        else window.navigator.vibrate([200]);
    }
    
    setTimeout(() => {
        prevBtn.style.visibility = 'visible';
        nextBtn.style.visibility = 'visible';
    }, 2000);
}

// === СОБЫТИЯ ===
prevBtn.addEventListener('click', switchMode);
nextBtn.addEventListener('click', switchMode);

mainBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
});

shareBtn.addEventListener('click', () => {
    const mode = MODES[currentModeIndex];
    const text = `Я ${RANKS[Math.floor(userLevel/5)] || "Новичок"} Lvl ${userLevel}! Высидел ${currentPet}. Заходи качаться!`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
});

// Старт
renderCollection();
updateLevelUI(); // Показываем уровень
updateUI();