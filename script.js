// === НАСТРОЙКИ ===
// ПЕРЕД РЕЛИЗОМ: Замени 10 и 20 на (25 * 60) и (60 * 60)
const MODES = [
    { id: 'short', time: 10, xpReward: 250, egg: '🥚', title: '25 минут', sub: 'Шанс Легендарки: 1%' },
    { id: 'long', time: 20, xpReward: 1000, egg: '🪺', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥' }
];

const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

// === МАГАЗИН: ДАННЫЕ ===
const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма (Стандарт)', price: 0, cssClass: '' },
        { id: 'forest', name: 'Лесная Чаща', price: 500, cssClass: 'theme-forest' },
        { id: 'space', name: 'Космос', price: 2000, cssClass: 'theme-space' },
        { id: 'neon', name: 'Киберпанк', price: 5000, cssClass: 'theme-neon' },
        { id: 'gold', name: 'Мажор', price: 10000, cssClass: 'theme-gold' }
    ],
    eggs: [
        { id: 'default', name: 'Обычное', price: 0, skinClass: '' },
        { id: 'glow', name: 'Сияние', price: 1000, skinClass: 'skin-glow' },
        { id: 'ice', name: 'Ледяное', price: 3000, skinClass: 'skin-ice' },
        { id: 'glitch', name: 'Глюк', price: 7777, skinClass: 'skin-glitch' },
        { id: 'gold', name: 'Золотое', price: 15000, skinClass: 'skin-gold' }
    ]
};

let currentModeIndex = 0;
let timeLeft = MODES[0].time;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game"; 

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻", "🐨", "🐤", "🐛"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};
const TOTAL_PETS_COUNT = 24; // Примерно

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

// ЗАГРУЗКА МАГАЗИНА
// ownedItems = { themes: ['default'], eggs: ['default'] }
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
let activeTheme = localStorage.getItem('activeTheme') || 'default';
let activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';

// === ЭЛЕМЕНТЫ ===
const getEl = (id) => document.getElementById(id);
const eggDisplay = getEl('egg-display');
const timerDisplay = getEl('timer');
const mainBtn = getEl('main-btn');
const shareBtn = getEl('share-btn');
const statusText = getEl('status-text');
const collectionContainer = getEl('collection');
const modeTitle = getEl('mode-title');
const modeSub = getEl('mode-subtitle');
const prevBtn = getEl('prev-btn');
const nextBtn = getEl('next-btn');
const xpBar = getEl('xp-bar');
const levelNumber = getEl('level-number');
const rankName = getEl('rank-name');
const totalMoneyDisplay = getEl('total-money');
const uniqueCountDisplay = getEl('unique-count');
// Магазин
const shopModal = getEl('shop-modal');
const openShopBtn = getEl('open-shop-btn');
const closeShopBtn = getEl('close-shop');
const shopItemsContainer = getEl('shop-items');
let currentShopTab = 'themes';

// === ЛОГИКА ===
function calculateMoney() {
    let total = 0;
    collection.forEach(pet => {
        total += PRICES[getPetRarity(pet)] || 0;
    });
    // Вычитаем потраченное (если бы мы хранили баланс отдельно, но у нас Net Worth)
    // ВНИМАНИЕ: Сейчас у нас система "Капитал = Стоимость коллекции". 
    // Чтобы сделать ТРАТУ денег, нам нужно хранить "Потрачено".
    let spent = parseInt(localStorage.getItem('moneySpent')) || 0;
    let available = total - spent;
    
    totalMoneyDisplay.textContent = `💰 $${available.toLocaleString()}`;
    if (uniqueCountDisplay) {
        uniqueCountDisplay.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    }
    return available;
}

// === ЛОГИКА МАГАЗИНА ===
function openShop() {
    shopModal.style.display = 'flex';
    renderShop();
}

function closeShop() {
    shopModal.style.display = 'none';
}

function switchShopTab(tab) {
    currentShopTab = tab;
    // Обновляем кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderShop();
}

function renderShop() {
    shopItemsContainer.innerHTML = '';
    const items = SHOP_DATA[currentShopTab];
    const money = calculateMoney();

    items.forEach(item => {
        const div = document.createElement('div');
        const isOwned = ownedItems[currentShopTab].includes(item.id);
        const isActive = (currentShopTab === 'themes' && activeTheme === item.id) || 
                         (currentShopTab === 'eggs' && activeEggSkin === item.id);
        
        let btnText = isOwned ? (isActive ? "Выбрано" : "Выбрать") : `$${item.price}`;
        let btnClass = isOwned ? "buy-btn owned" : "buy-btn";
        if (!isOwned && money < item.price) btnClass += " locked";

        div.className = `shop-item ${isActive ? 'active' : ''}`;
        div.innerHTML = `
            <div class="shop-item-icon">${currentShopTab === 'themes' ? '🎨' : '🥚'}</div>
            <div class="shop-item-name">${item.name}</div>
            <button class="${btnClass}" onclick="handleShopClick('${item.id}', ${item.price})">${btnText}</button>
        `;
        shopItemsContainer.appendChild(div);
    });
}

window.handleShopClick = function(id, price) {
    const isOwned = ownedItems[currentShopTab].includes(id);
    const money = calculateMoney();

    if (isOwned) {
        // Активируем
        if (currentShopTab === 'themes') {
            activeTheme = id;
            localStorage.setItem('activeTheme', id);
            applyTheme();
        } else {
            activeEggSkin = id;
            localStorage.setItem('activeEggSkin', id);
            applyEggSkin();
        }
        renderShop();
    } else {
        // Покупаем
        if (money >= price) {
            let spent = parseInt(localStorage.getItem('moneySpent')) || 0;
            localStorage.setItem('moneySpent', spent + price);
            
            ownedItems[currentShopTab].push(id);
            localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
            
            // Сразу активируем
            if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
            else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
            
            calculateMoney(); // Обновить баланс
            renderShop();
            
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        } else {
            if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]); // Ошибка
            alert("Не хватает денег! Выращивай больше питомцев.");
        }
    }
};

// ПРИМЕНЕНИЕ СТИЛЕЙ
function applyTheme() {
    const theme = SHOP_DATA.themes.find(t => t.id === activeTheme);
    document.body.className = theme ? theme.cssClass : '';
}

function applyEggSkin() {
    const skin = SHOP_DATA.eggs.find(s => s.id === activeEggSkin);
    // Удаляем старые классы скинов
    eggDisplay.className = 'egg'; 
    if (isRunning) eggDisplay.classList.add('shaking');
    if (skin && skin.skinClass) eggDisplay.classList.add(skin.skinClass);
}

// === СИСТЕМА УРОВНЕЙ И СТАРТ ===
function updateLevelUI() {
    if (!xpBar) return;
    const xpForNextLevel = userLevel * 200; 
    let percentage = (userXP / xpForNextLevel) * 100;
    if (percentage > 100) percentage = 100;
    xpBar.style.width = `${percentage}%`;
    levelNumber.textContent = `Lvl ${userLevel}`;
    let rankIndex = Math.floor(userLevel / 5);
    rankName.textContent = RANKS[Math.min(rankIndex, RANKS.length - 1)];
}

function addXP(amount) {
    userXP += amount;
    if (userXP >= userLevel * 200) {
        userXP -= userLevel * 200;
        userLevel++;
        if (statusText) statusText.textContent = `УРОВЕНЬ ПОВЫШЕН! Lvl ${userLevel} 🎉`;
    }
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();
}

function updateUI() {
    const mode = MODES[currentModeIndex];
    if (!isRunning) {
        if (eggDisplay) eggDisplay.textContent = mode.egg;
        if (timerDisplay) timerDisplay.textContent = formatTime(mode.time);
        timeLeft = mode.time;
    }
    if (modeTitle) modeTitle.textContent = mode.title;
    if (modeSub) modeSub.textContent = mode.sub;
}

function switchMode() {
    if (isRunning) return; 
    currentModeIndex = currentModeIndex === 0 ? 1 : 0;
    if (eggDisplay) {
        eggDisplay.style.transform = "scale(0.5)";
        setTimeout(() => { updateUI(); eggDisplay.style.transform = "scale(1)"; }, 150);
    } else { updateUI(); }
}

function renderCollection() {
    if (!collectionContainer) return;
    collectionContainer.innerHTML = '';
    [...collection].reverse().forEach(pet => {
        const slot = document.createElement('div');
        slot.className = `pet-slot ${getPetRarity(pet)}`;
        slot.textContent = pet;
        collectionContainer.appendChild(slot);
    });
    calculateMoney();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    if (isRunning) return;
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time; 
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (eggDisplay) eggDisplay.textContent = mode.egg;
    
    isRunning = true;
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.visibility = 'hidden';
    if (shareBtn) shareBtn.style.display = 'none';
    if (mainBtn) { mainBtn.textContent = "Сдаться"; mainBtn.className = "btn stop"; }
    
    // ПРИМЕНЯЕМ СКИН
    applyEggSkin(); 
    if (eggDisplay) eggDisplay.classList.add('shaking');
    if (statusText) statusText.textContent = "Фармим...";

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (prevBtn) prevBtn.style.visibility = 'visible';
    if (nextBtn) nextBtn.style.visibility = 'visible';
    if (mainBtn) { mainBtn.textContent = "Начать фокус"; mainBtn.className = "btn"; }
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    updateUI(); 
    if (statusText) statusText.textContent = "Сдался = нет награды";
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (eggDisplay) eggDisplay.classList.remove('shaking');
    const mode = MODES[currentModeIndex];
    addXP(mode.xpReward);
    const chance = Math.random() * 100;
    let pool, rarityName;
    if (mode.id === 'short') { 
        if (chance < 1) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; }
        else if (chance < 16) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    } else { 
        if (chance < 5) { pool = petDatabase.legendary; rarityName = "ЛЕГЕНДАРНЫЙ"; } 
        else if (chance < 35) { pool = petDatabase.rare; rarityName = "Редкий"; }
        else { pool = petDatabase.common; rarityName = "Обычный"; }
    }
    currentPet = pool[Math.floor(Math.random() * pool.length)];
    if (eggDisplay) eggDisplay.textContent = currentPet;
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); 
    if (mainBtn) { mainBtn.textContent = "Ещё раз"; mainBtn.className = "btn"; }
    if (shareBtn) shareBtn.style.display = 'block';
    const price = PRICES[getPetRarity(currentPet)];
    if (statusText && !statusText.textContent.includes("УРОВЕНЬ")) statusText.textContent = `+${price}$ | ${rarityName}: ${currentPet}`;
    if (window.navigator.vibrate) {
        if (rarityName === "ЛЕГЕНДАРНЫЙ") window.navigator.vibrate([100,50,100,50,500,50,500]);
        else window.navigator.vibrate([200]);
    }
    setTimeout(() => { if (prevBtn) prevBtn.style.visibility = 'visible'; if (nextBtn) nextBtn.style.visibility = 'visible'; }, 2000);
}

// LISTENERS
if (openShopBtn) openShopBtn.addEventListener('click', openShop);
if (closeShopBtn) closeShopBtn.addEventListener('click', closeShop);
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const money = calculateMoney(); 
        let uniqueCount = new Set(collection).size;
        const text = `У меня ${uniqueCount} петов и $${money} в Focus Hatcher! Заходи.`;
        const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
        if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
        else window.open(url, '_blank');
    });
}
if (prevBtn) prevBtn.addEventListener('click', switchMode);
if (nextBtn) nextBtn.addEventListener('click', switchMode);
if (mainBtn) mainBtn.addEventListener('click', () => isRunning ? stopTimer() : startTimer());

// INIT
renderCollection();
updateLevelUI();
updateUI();
applyTheme(); // Применить тему при запуске