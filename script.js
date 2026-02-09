// === НАСТРОЙКИ ===
// Пока ставим 10 секунд, чтобы ты быстро проверил.
// Перед рекламой друзьям поменяешь на 25 * 60
const focusTime = 10; 

let timeLeft = focusTime;
let timerInterval = null;
let isRunning = false;

// Список всех возможных питомцев
const pets = ["🐣", "🐱", "🐶", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];

// === ЗАГРУЗКА И ИСПРАВЛЕНИЕ ОШИБОК ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];

// АВТО-ФИКС: Проверяем, есть ли глючная "panda" текстом и меняем на смайлик
collection = collection.map(pet => {
    if (pet === "panda") return "🐼"; // Если нашли текст, меняем на эмодзи
    return pet; // Остальных не трогаем
});

// Сразу сохраняем исправленную версию обратно в телефон
localStorage.setItem('myCollection', JSON.stringify(collection));

// === ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ===
const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
const statusText = document.getElementById('status-text');

// Создаем контейнер для коллекции, если его нет
let collectionContainer = document.getElementById('collection');
if (!collectionContainer) {
    collectionContainer = document.createElement('div');
    collectionContainer.id = 'collection';
    // Добавляем стили для сетки прямо здесь, если в CSS не подхватилось
    collectionContainer.style.display = 'grid';
    collectionContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    collectionContainer.style.gap = '10px';
    collectionContainer.style.marginTop = '20px';
    document.querySelector('.container').appendChild(collectionContainer);
}

// === ФУНКЦИИ ===

// Функция отрисовки коллекции
function renderCollection() {
    collectionContainer.innerHTML = ''; // Очищаем перед отрисовкой
    
    if (collection.length === 0) {
        collectionContainer.innerHTML = '<p style="grid-column: span 5; font-size: 14px; opacity: 0.7;">Коллекция пуста...</p>';
        return;
    }

    // Рисуем каждого питомца (новые сверху - reverse)
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        slot.textContent = pet;
        slot.style.fontSize = '30px';
        slot.style.background = 'rgba(255,255,255,0.1)';
        slot.style.borderRadius = '8px';
        slot.style.padding = '10px';
        slot.style.textAlign = 'center';
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
    actionBtn.classList.add('stop'); // Красим кнопку в красный
    actionBtn.style.backgroundColor = "#ff3b30"; // Принудительно красим
    
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
    actionBtn.style.backgroundColor = "#007aff"; // Возвращаем синий
    
    eggDisplay.classList.remove('shaking');
    statusText.textContent = "Эх, сорвалось!";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = focusTime;
    
    eggDisplay.classList.remove('shaking');
    
    // Выбираем случайного питомца
    const randomPet = pets[Math.floor(Math.random() * pets.length)];
    eggDisplay.textContent = randomPet;
    
    // Добавляем в коллекцию и сохраняем
    collection.push(randomPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    
    // Обновляем экран
    renderCollection();
    
    actionBtn.textContent = "Забрать награду";
    actionBtn.classList.remove('stop');
    actionBtn.style.backgroundColor = "#34c759"; // Зеленый цвет победы
    
    statusText.textContent = `Поздравляю! Это ${randomPet}`;
    
    // Вибрация (работает на телефонах)
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАПУСКЕ ===
renderCollection(); // Показать коллекцию
updateDisplay();    // Показать таймер

// Обработчик кнопки
actionBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});