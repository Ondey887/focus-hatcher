// === НАСТРОЙКИ ===
const focusTime = 10; // Пока 10 секунд для теста
// const focusTime = 25 * 60; // Версия для релиза

// Твоя ссылка на игру
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

let timeLeft = focusTime;
let timerInterval = null;
let isRunning = false;
let currentPet = null; // Запоминаем последнего выпавшего питомца

const pets = ["🐣", "🐱", "🐶", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];

// === ЗАГРУЗКА ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
// Фикс панды (оставляем на всякий случай)
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));
localStorage.setItem('myCollection', JSON.stringify(collection));

// === ЭЛЕМЕНТЫ ===
const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
const shareBtn = document.getElementById('share-btn'); // Кнопка поделиться
const statusText = document.getElementById('status-text');

// Создаем контейнер коллекции
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
        slot.className = 'pet-slot';
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
    
    // Прячем кнопку поделиться при новом старте
    shareBtn.style.display = 'none'; 
    
    actionBtn.textContent = "Сдаться";
    actionBtn.classList.add('stop');
    actionBtn.style.backgroundColor = "#ff3b30";
    
    eggDisplay.textContent = "🥚";
    eggDisplay.classList.add('shaking');
    statusText.textContent = "Тише... оно растет...";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            finishTimer();
        }
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
    statusText.textContent = "Эх, сорвалось!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = focusTime;
    
    eggDisplay.classList.remove('shaking');
    
    // Рандом
    currentPet = pets[Math.floor(Math.random() * pets.length)];
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection();
    
    actionBtn.textContent = "Ещё раз";
    actionBtn.classList.remove('stop');
    actionBtn.style.backgroundColor = "#007aff";
    
    // ПОКАЗЫВАЕМ КНОПКУ ПОДЕЛИТЬСЯ
    shareBtn.style.display = 'block';
    
    statusText.textContent = `Поздравляю! Это ${currentPet}`;
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
}

// === ИНИЦИАЛИЗАЦИЯ ===
renderCollection();
updateDisplay();

actionBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
});

// ОБРАБОТЧИК КНОПКИ ПОДЕЛИТЬСЯ
shareBtn.addEventListener('click', () => {
    const text = `Я высидел ${currentPet} за 25 минут фокуса! А ты сможешь? 🥚`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    
    // Открываем ссылку Телеграма
    if (window.Telegram.WebApp) {
        window.Telegram.WebApp.openTelegramLink(url);
    } else {
        window.open(url, '_blank');
    }
});