// НАСТРОЙКИ
const focusTime = 25 * 60; // 25 минут в секундах
// Для тестов можешь пока оставить 10 секунд, если лень ждать:
// const focusTime = 10; 

let timeLeft = focusTime;
let timerInterval = null;
let isRunning = false;

// Исправленный список (панда теперь эмодзи)
const pets = ["🐣", "🐱", "🐶", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];

// Загрузка
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];

const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
const statusText = document.getElementById('status-text');

// Создаем контейнер коллекции, если нет
let collectionContainer = document.getElementById('collection');
if (!collectionContainer) {
    collectionContainer = document.createElement('div');
    collectionContainer.id = 'collection';
    document.querySelector('.container').appendChild(collectionContainer);
}

// Рендер коллекции (ТЕПЕРЬ КРАСИВЫЙ)
function renderCollection() {
    collectionContainer.innerHTML = ''; // Очищаем
    if (collection.length === 0) {
        collectionContainer.innerHTML = '<p style="font-size:12px; grid-column: span 4">Пока пусто...</p>';
        return;
    }
    // Переворачиваем, чтобы новые были сверху
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
    actionBtn.textContent = "Сдаться";
    actionBtn.classList.add('stop');
    eggDisplay.textContent = "🥚";
    eggDisplay.classList.add('shaking');
    statusText.textContent = "Фокус! Не закрывай...";

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
    eggDisplay.classList.remove('shaking');
    statusText.textContent = "Попробуй снова!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = focusTime;
    
    eggDisplay.classList.remove('shaking');
    
    // Логика рандома
    const randomPet = pets[Math.floor(Math.random() * pets.length)];
    eggDisplay.textContent = randomPet;
    
    collection.push(randomPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection();
    
    actionBtn.textContent = "Забрать награду";
    actionBtn.classList.remove('stop');
    statusText.textContent = `Ты получил: ${randomPet}`;
    
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200, 100, 200]);
}

// Старт
renderCollection();
updateDisplay();

actionBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
});