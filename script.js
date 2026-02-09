// === НАСТРОЙКИ ===
const focusTime = 25 * 60; // 25 минут (1500 секунд)
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

let timeLeft = focusTime;
let timerInterval = null;
let isRunning = false;
let currentPet = null;

// === БАЗА ДАННЫХ ПИТОМЦЕВ ===
// Мы разделили их по редкости, чтобы знать, какой цвет давать
const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐻", "🐨"], // Обычные
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷"],         // Редкие
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖"]           // ЛЕГЕНДАРНЫЕ
};

// Функция определения редкости по смайлику (чтобы раскрасить инвентарь)
function getPetRarity(petEmoji) {
    if (petDatabase.legendary.includes(petEmoji)) return "legendary";
    if (petDatabase.rare.includes(petEmoji)) return "rare";
    return "common";
}

// === ЗАГРУЗКА ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
// Фикс панды (на всякий случай оставляем)
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));

// === ЭЛЕМЕНТЫ ===
const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
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
    // Рисуем с учетом редкости
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet); // Узнаем редкость
        
        slot.className = `pet-slot ${rarity}`; // Добавляем класс (common/rare/legendary)
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

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    shareBtn.style.display = 'none'; 
    actionBtn.textContent = "Сдаться";
    actionBtn.classList.add('stop');
    actionBtn.style.backgroundColor = "#ff3b30";
    eggDisplay.textContent = "🥚";
    eggDisplay.classList.add('shaking');
    statusText.textContent = "Магия происходит...";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = focusTime;
    updateDisplay();
    actionBtn.textContent = "Начать фокус";
    actionBtn.classList.remove('stop');
    actionBtn.style.backgroundColor = "#007aff";
    eggDisplay.classList.remove('shaking');
    statusText.textContent = "Попробуй снова!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = focusTime;
    eggDisplay.classList.remove('shaking');
    
    // === ЛОГИКА ШАНСОВ ===
    const chance = Math.random() * 100; // Число от 0 до 100
    let rarityPool;
    let rarityName;

    if (chance < 10) { // 10% шанс (0-10)
        rarityPool = petDatabase.legendary;
        rarityName = "ЛЕГЕНДАРНЫЙ!";
    } else if (chance < 40) { // 30% шанс (10-40)
        rarityPool = petDatabase.rare;
        rarityName = "Редкий!";
    } else { // 60% шанс (40-100)
        rarityPool = petDatabase.common;
        rarityName = "Обычный";
    }

    // Выбираем случайного из пула
    currentPet = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection();
    
    actionBtn.textContent = "Ещё раз";
    actionBtn.classList.remove('stop');
    actionBtn.style.backgroundColor = "#007aff";
    shareBtn.style.display = 'block';
    
    statusText.textContent = `${rarityName} Ты получил: ${currentPet}`;
    
    // Вибрация: если легендарка — долгая вибрация
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ!") window.navigator.vibrate([100, 50, 100, 50, 500]);
        else window.navigator.vibrate([200, 100, 200]);
    }
}

// === ЗАПУСК ===
renderCollection();
updateDisplay();

actionBtn.addEventListener('click', () => { if (isRunning) stopTimer(); else startTimer(); });

shareBtn.addEventListener('click', () => {
    // В тексте теперь тоже пишем, если это легендарка
    const rarity = getPetRarity(currentPet);
    let extraText = "";
    if (rarity === "legendary") extraText = "🔥 МНЕ ВЫПАЛА ЛЕГЕНДАРКА! ";
    
    const text = `${extraText}Я получил ${currentPet} за 25 минут фокуса! Сможешь повторить?`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
});