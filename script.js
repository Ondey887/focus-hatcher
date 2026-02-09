// === НАСТРОЙКИ РЕЖИМОВ ===
const MODES = [
    { 
        id: 'short', 
        time: 10, // ТЕСТ: 10 сек (В релизе поставь: 25 * 60)
        egg: '🥚', 
        title: '25 минут', 
        sub: 'Обычный шанс',
        color: '#34c759' // Зеленый
    },
    { 
        id: 'long', 
        time: 20, // ТЕСТ: 20 сек (В релизе поставь: 60 * 60)
        egg: '🪺', 
        title: '60 минут', 
        sub: 'Высокий шанс (x4) 🔥',
        color: '#ff9500' // Оранжевый
    }
];

let currentModeIndex = 0; // 0 - это первый режим
let timeLeft = MODES[0].time;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; // ТВОЯ ССЫЛКА

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

// Загрузка
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

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

// === ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ===
function updateUI() {
    const mode = MODES[currentModeIndex];
    if (!isRunning) {
        eggDisplay.textContent = mode.egg;
        timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time;
    }
    modeTitle.textContent = mode.title;
    modeSub.textContent = mode.sub;
    timerDisplay.style.color = mode.color; // Меняем цвет цифр
}

function switchMode() {
    if (isRunning) return; // Нельзя переключать во время таймера
    
    // Переключаем туда-сюда (0 -> 1 -> 0)
    currentModeIndex = currentModeIndex === 0 ? 1 : 0;
    
    // Анимация
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
    
    // Прячем стрелки
    prevBtn.style.visibility = 'hidden';
    nextBtn.style.visibility = 'hidden';
    shareBtn.style.display = 'none';
    
    mainBtn.textContent = "Сдаться";
    mainBtn.className = "btn stop";
    
    eggDisplay.classList.add('shaking');
    statusText.textContent = "Не закрывай приложение...";

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Возвращаем стрелки
    prevBtn.style.visibility = 'visible';
    nextBtn.style.visibility = 'visible';
    
    mainBtn.textContent = "Начать фокус";
    mainBtn.className = "btn";
    
    eggDisplay.classList.remove('shaking');
    updateUI(); // Сброс
    statusText.textContent = "Эх, сорвалось!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    eggDisplay.classList.remove('shaking');
    
    // Шансы
    const mode = MODES[currentModeIndex];
    const chance = Math.random() * 100;
    let pool, rarityName;

    if (mode.id === 'short') { // 25 мин
        if (chance < 5) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; }
        else if (chance < 40) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    } else { // 60 мин (Хардкор)
        if (chance < 20) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; } // Шанс x4
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
    
    statusText.textContent = `${rarityName} Ты получил: ${currentPet}`;
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ!") window.navigator.vibrate([100,50,100,50,500]);
        else window.navigator.vibrate([200]);
    }
    
    // Вернем стрелки через 2 секунды
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
    const rarity = getPetRarity(currentPet);
    let extra = rarity === "legendary" ? "🔥 ЛЕГЕНДАРКА! " : "";
    const text = `${extra}Я высидел ${currentPet} за ${mode.title}! А ты сможешь?`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
});

// Старт
renderCollection();
updateUI();