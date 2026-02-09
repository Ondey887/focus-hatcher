// === НАСТРОЙКИ (ТЕСТОВЫЙ РЕЖИМ) ===
// Чтобы сделать РЕАЛЬНОЕ время, замени цифры:
// const SHORT_TIME = 25 * 60; 
// const LONG_TIME = 60 * 60;

const SHORT_TIME = 10; // Тест: 10 секунд вместо 25 мин
const LONG_TIME = 20;  // Тест: 20 секунд вместо 60 мин

const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

let timeLeft = SHORT_TIME;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
let currentMode = 'short'; // 'short' или 'long'

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐻", "🐨", "🐸"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥", "💎"]
};

// Функция определения редкости
function getPetRarity(petEmoji) {
    if (petDatabase.legendary.includes(petEmoji)) return "legendary";
    if (petDatabase.rare.includes(petEmoji)) return "rare";
    return "common";
}

// === ЗАГРУЗКА ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

// === ЭЛЕМЕНТЫ ===
const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const modeSelection = document.getElementById('mode-selection'); // Блок с кнопками выбора
const giveUpBtn = document.getElementById('give-up-btn'); // Кнопка сдаться
const shareBtn = document.getElementById('share-btn');
const statusText = document.getElementById('status-text');

let collectionContainer = document.getElementById('collection');
if (!collectionContainer) {
    collectionContainer = document.createElement('div');
    collectionContainer.id = 'collection';
    document.querySelector('.container').appendChild(collectionContainer);
}

// === ФУНКЦИИ ===
function renderCollection() {
    collectionContainer.innerHTML = '';
    if (collection.length === 0) {
        collectionContainer.innerHTML = '<p style="grid-column: span 5; font-size: 14px; opacity: 0.7;">Коллекция пуста...</p>';
        return;
    }
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet);
        slot.className = `pet-slot ${rarity}`;
        slot.textContent = pet;
        collectionContainer.appendChild(slot);
    });
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

// ГЛАВНАЯ ФУНКЦИЯ ЗАПУСКА
window.selectMode = function(minutes) {
    if (isRunning) return;
    
    // Определяем режим
    if (minutes === 25) {
        timeLeft = SHORT_TIME;
        currentMode = 'short';
        eggDisplay.textContent = "🥚";
    } else {
        timeLeft = LONG_TIME;
        currentMode = 'long';
        eggDisplay.textContent = "🪺"; // Другое яйцо!
    }
    
    isRunning = true;
    
    // Переключаем интерфейс
    modeSelection.style.display = 'none'; // Скрываем выбор
    giveUpBtn.style.display = 'block'; // Показываем кнопку "Сдаться"
    shareBtn.style.display = 'none';
    
    eggDisplay.classList.add('shaking');
    statusText.textContent = currentMode === 'short' ? "Фокус 25 минут..." : "ХАРДКОР! Не сдавайся!";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Возвращаем интерфейс обратно
    modeSelection.style.display = 'flex';
    giveUpBtn.style.display = 'none';
    
    eggDisplay.classList.remove('shaking');
    eggDisplay.textContent = "🥚";
    timeLeft = 0;
    updateDisplay();
    statusText.textContent = "Эх, яйцо остыло!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    eggDisplay.classList.remove('shaking');
    
    // === МАТЕМАТИКА ШАНСОВ ===
    const chance = Math.random() * 100;
    let rarityPool, rarityName;

    // ШАНСЫ ЗАВИСЯТ ОТ РЕЖИМА
    if (currentMode === 'short') {
        // Обычный режим (25 мин): 60% Обычный, 35% Редкий, 5% Легендарный
        if (chance < 5) { rarityPool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; }
        else if (chance < 40) { rarityPool = petDatabase.rare; rarityName = "Редкий!"; }
        else { rarityPool = petDatabase.common; rarityName = "Обычный"; }
    } else {
        // Хардкор режим (60 мин): 30% Обычный, 50% Редкий, 20% Легендарный
        if (chance < 20) { rarityPool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ!"; }
        else if (chance < 70) { rarityPool = petDatabase.rare; rarityName = "Редкий!"; }
        else { rarityPool = petDatabase.common; rarityName = "Обычный"; }
    }

    currentPet = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection();
    
    // Показываем кнопки финала
    giveUpBtn.style.display = 'none'; // Скрываем сдаться
    // Кнопку "выбрать режим" НЕ показываем сразу, чтобы игрок насладился победой.
    // Вместо этого добавим кнопку "Ещё раз" (или используем логику перезагрузки, но пока так):
    
    // Лайфхак: Просто возвращаем выбор режимов, чтобы играть снова
    setTimeout(() => {
        modeSelection.style.display = 'flex'; 
        statusText.textContent = "Сыграем еще?";
    }, 3000); // Через 3 секунды меню вернется само

    shareBtn.style.display = 'block';
    
    statusText.textContent = `${rarityName} Ты получил: ${currentPet}`;
    
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ!") window.navigator.vibrate([100, 50, 100, 50, 500]);
        else window.navigator.vibrate([200, 100, 200]);
    }
}

// === ЗАПУСК ===
renderCollection();
// Навешиваем обработчик на кнопку "Сдаться"
giveUpBtn.addEventListener('click', stopTimer);

// Кнопка поделиться
shareBtn.addEventListener('click', () => {
    const rarity = getPetRarity(currentPet);
    let extraText = "";
    if (rarity === "legendary") extraText = "🔥 МНЕ ВЫПАЛА ЛЕГЕНДАРКА! ";
    
    // Пишем, сколько времени потратили
    const timeSpent = currentMode === 'short' ? "25 минут" : "ЧАС";
    
    const text = `${extraText}Я получил ${currentPet} за ${timeSpent} работы! Сможешь повторить?`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
});