let timeLeft = 10; // Время в секундах (для теста 10 сек)
let defaultTime = 10; 
let timerInterval = null;
let isRunning = false;

const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
const statusText = document.getElementById('status-text');

// Функция форматирования времени (00:00)
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Обновление экрана
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

// Старт таймера
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    actionBtn.textContent = "Сдаться"; // Меняем кнопку
    actionBtn.classList.add('stop'); // Красим в красный
    eggDisplay.textContent = "🥚"; // Возвращаем яйцо
    eggDisplay.classList.add('shaking'); // Начинаем тряску
    statusText.textContent = "Не закрывай приложение...";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            finishTimer();
        }
    }, 1000);
}

// Остановка таймера (провал)
function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = defaultTime;
    updateDisplay();
    
    actionBtn.textContent = "Начать фокус";
    actionBtn.classList.remove('stop');
    eggDisplay.classList.remove('shaking');
    statusText.textContent = "Эх, яйцо остыло...";
}

// Успешное завершение
function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = defaultTime;
    
    eggDisplay.classList.remove('shaking');
    eggDisplay.textContent = "🐣"; // ВЫЛУПИЛСЯ!
    
    actionBtn.textContent = "Ещё раз";
    actionBtn.classList.remove('stop');
    statusText.textContent = "Поздравляю! Новый питомец!";
    
    // Вибрация телефона (сработает только в телефоне)
    if (window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
    }
}

// Обработчик кнопки
actionBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer(); // Если уже идет - останавливаем
    } else {
        startTimer(); // Если стоит - запускаем
    }
});

// Инициализация
updateDisplay();