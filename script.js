let timeLeft = 10; // 10 секунд для теста
const defaultTime = 10; 
let timerInterval = null;
let isRunning = false;

// Список возможных питомцев (пока просто эмодзи)
const pets = ["🐣", "🐱", "🐶", "🐹", "🐰", "🦊", "🐻", "panda"];

// Загружаем коллекцию из памяти телефона
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];

const eggDisplay = document.getElementById('egg-display');
const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('action-btn');
const statusText = document.getElementById('status-text');

// Создаем блок для коллекции (если его нет в HTML, создадим через JS)
const collectionContainer = document.createElement('div');
collectionContainer.id = 'collection';
collectionContainer.style.marginTop = '20px';
collectionContainer.style.fontSize = '24px';
document.querySelector('.container').appendChild(collectionContainer);

// Функция обновления коллекции на экране
function renderCollection() {
    collectionContainer.innerHTML = '<h3>Моя коллекция:</h3>' + collection.join(' ');
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
    statusText.textContent = "Не закрывай, яйцо греется...";

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
    timeLeft = defaultTime;
    updateDisplay();
    
    actionBtn.textContent = "Начать фокус";
    actionBtn.classList.remove('stop');
    eggDisplay.classList.remove('shaking');
    statusText.textContent = "Яйцо остыло :(";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = defaultTime;
    
    eggDisplay.classList.remove('shaking');
    
    // Выбираем случайного питомца
    const randomPet = pets[Math.floor(Math.random() * pets.length)];
    eggDisplay.textContent = randomPet;
    
    // Сохраняем в коллекцию
    collection.push(randomPet);
    localStorage.setItem('myCollection', JSON.stringify(collection)); // МАГИЯ СОХРАНЕНИЯ
    renderCollection();
    
    actionBtn.textContent = "Ещё раз";
    actionBtn.classList.remove('stop');
    statusText.textContent = `Ура! Новый питомец: ${randomPet}`;
    
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
}

// Инициализация
renderCollection(); // Показать коллекцию при запуске
updateDisplay();

actionBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
});