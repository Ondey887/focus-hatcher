// === НАСТРОЙКИ ===
// ПЕРЕД РЕЛИЗОМ: Замени 10 и 20 на (25 * 60) и (60 * 60)
const MODES = [
    { id: 'short', time: 10, xpReward: 250, egg: '🥚', title: '25 минут', sub: 'Шанс Легендарки: 1%' },
    { id: 'long', time: 20, xpReward: 1000, egg: '🪺', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥' }
];

const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма', price: 0, cssClass: '' },
        { id: 'forest', name: 'Лес', price: 500, cssClass: 'theme-forest' },
        { id: 'space', name: 'Космос', price: 2000, cssClass: 'theme-space' },
        { id: 'neon', name: 'Неон', price: 5000, cssClass: 'theme-neon' },
        { id: 'gold', name: 'Мажор', price: 10000, cssClass: 'theme-gold' }
    ],
    eggs: [
        { id: 'default', name: 'Обычное', price: 0, skinClass: '' },
        { id: 'glow', name: 'Сияние', price: 1000, skinClass: 'skin-glow' },
        { id: 'ice', name: 'Лед', price: 3000, skinClass: 'skin-ice' },
        { id: 'glitch', name: 'Глюк', price: 7777, skinClass: 'skin-glitch' },
        { id: 'gold', name: 'Золото', price: 15000, skinClass: 'skin-gold' }
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
const TOTAL_PETS_COUNT = 24;

// === ЗАГРУЗКА И МИГРАЦИЯ ЭКОНОМИКИ ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

// НОВОЕ: Реальный баланс кошелька
let walletBalance = parseInt(localStorage.getItem('walletBalance'));

// Если баланса нет (старый игрок), считаем капитал по коллекции и дарим его
if (isNaN(walletBalance)) {
    let migrationMoney = 0;
    collection.forEach(pet => {
        let r = getPetRarity(pet);
        migrationMoney += PRICES[r] || 10;
    });
    walletBalance = migrationMoney;
    localStorage.setItem('walletBalance', walletBalance);
}

// Магазин
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
const xpBar = getEl('xp-bar');
const levelNumber = getEl('level-number');
const rankName = getEl('rank-name');
const totalMoneyDisplay = getEl('total-money');
const uniqueCountDisplay = getEl('unique-count');
// Магазин
const shopModal = getEl('shop-modal');
const shopItemsContainer = getEl('shop-items');
// Пет Модалка
const petModal = getEl('pet-modal');
const inventoryArrow = getEl('inventory-arrow');
let selectedPetIndex = null;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

function updateBalanceUI() {
    totalMoneyDisplay.textContent = `💰 $${walletBalance.toLocaleString()}`;
    if (uniqueCountDisplay) {
        uniqueCountDisplay.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    }
}

// === ЛОГИКА ИНВЕНТАРЯ (Сворачивание) ===
window.toggleInventory = function() {
    if (collectionContainer.classList.contains('hidden')) {
        collectionContainer.classList.remove('hidden');
        inventoryArrow.textContent = "▼";
    } else {
        collectionContainer.classList.add('hidden');
        inventoryArrow.textContent = "▲";
    }
}

// === ЛОГИКА ПРОДАЖИ (Pet Inspector) ===
function openPetModal(index) {
    selectedPetIndex = index;
    const pet = collection[index];
    const rarity = getPetRarity(pet);
    const price = PRICES[rarity];
    const names = { common: "Обычный", rare: "Редкий", legendary: "ЛЕГЕНДАРНЫЙ" };

    petModal.style.display = 'flex';
    
    // Заполняем инфу
    getEl('pet-detail-view').innerHTML = `
        <div class="pet-big-icon">${pet}</div>
        <h3 class="pet-name">Питомец</h3>
        <p class="pet-rarity ${rarity}">${names[rarity]}</p>
        <p class="pet-price">Цена продажи: $${price}</p>
        <button onclick="sellPet()" class="btn sell-action">Продать за $${price}</button>
    `;
}

window.closePetModal = function() {
    petModal.style.display = 'none';
    selectedPetIndex = null;
}

window.sellPet = function() {
    if (selectedPetIndex === null) return;
    
    const pet = collection[selectedPetIndex];
    const price = PRICES[getPetRarity(pet)];
    
    // 1. Добавляем деньги
    walletBalance += price;
    localStorage.setItem('walletBalance', walletBalance);
    
    // 2. Удаляем из коллекции
    collection.splice(selectedPetIndex, 1);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    
    // 3. Обновляем интерфейс
    updateBalanceUI();
    renderCollection();
    closePetModal();
    
    // Звук монеток (вибрация)
    if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
}

function renderCollection() {
    if (!collectionContainer) return;
    collectionContainer.innerHTML = '';
    
    // Переворачиваем копию массива, чтобы новые были сверху, 
    // НО нам нужны правильные индексы для удаления.
    // Поэтому просто бежим с конца.
    for (let i = collection.length - 1; i >= 0; i--) {
        const pet = collection[i];
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet);
        
        slot.className = `pet-slot ${rarity}`;
        slot.textContent = pet;
        
        // Клик открывает модалку
        slot.onclick = () => openPetModal(i);
        
        collectionContainer.appendChild(slot);
    }
    updateBalanceUI();
}

// === ЛОГИКА МАГАЗИНА ===
window.switchShopTab = function(tab) {
    // ... тот же код ...
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderShop(tab);
}

function renderShop(tab = 'themes') {
    shopItemsContainer.innerHTML = '';
    const items = SHOP_DATA[tab];
    
    items.forEach(item => {
        const div = document.createElement('div');
        const isOwned = ownedItems[tab].includes(item.id);
        const isActive = (tab === 'themes' && activeTheme === item.id) || 
                         (tab === 'eggs' && activeEggSkin === item.id);
        
        let btnText = isOwned ? (isActive ? "Выбрано" : "Выбрать") : `$${item.price}`;
        let btnClass = isOwned ? "buy-btn owned" : "buy-btn";
        if (!isOwned && walletBalance < item.price) btnClass += " locked"; // Проверка Wallet

        div.className = `shop-item ${isActive ? 'active' : ''}`;
        div.innerHTML = `
            <div class="shop-item-icon">${tab === 'themes' ? '🎨' : '🥚'}</div>
            <div class="shop-item-name">${item.name}</div>
            <button class="${btnClass}" onclick="handleShopClick('${item.id}', ${item.price}, '${tab}')">${btnText}</button>
        `;
        shopItemsContainer.appendChild(div);
    });
}

window.handleShopClick = function(id, price, tab) {
    const isOwned = ownedItems[tab].includes(id);

    if (isOwned) {
        // Активация
        if (tab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
        else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
        renderShop(tab);
    } else {
        // Покупка
        if (walletBalance >= price) {
            walletBalance -= price; // Вычитаем из кошелька
            localStorage.setItem('walletBalance', walletBalance);
            
            ownedItems[tab].push(id);
            localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
            
            // Активируем
            if (tab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
            else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
            
            updateBalanceUI();
            renderShop(tab);
        } else {
            if (window.navigator.vibrate) window.navigator.vibrate([50, 50]);
        }
    }
};

// ... (Функции applyTheme, applyEggSkin, startTimer, stopTimer, finishTimer - ТЕ ЖЕ, что в прошлом коде) ...
// ВАЖНО: Вставь их сюда из прошлого ответа или я могу дать полный код, если нужно.

// === ВСЕ СТАРЫЕ ФУНКЦИИ (Сокращенно для вставки) ===
function applyTheme() { const t = SHOP_DATA.themes.find(x=>x.id===activeTheme); document.body.className=t?t.cssClass:''; }
function applyEggSkin() { const s = SHOP_DATA.eggs.find(x=>x.id===activeEggSkin); eggDisplay.className='egg'; if(isRunning) eggDisplay.classList.add('shaking'); if(s&&s.skinClass) eggDisplay.classList.add(s.skinClass); }
function formatTime(s) { const m=Math.floor(s/60).toString().padStart(2,'0'); const sc=(s%60).toString().padStart(2,'0'); return `${m}:${sc}`; }
function updateLevelUI() { /* ... старый код ... */ xpBar.style.width = `${(userXP/(userLevel*200))*100}%`; levelNumber.textContent=`Lvl ${userLevel}`; } 

// ОБНОВЛЕННЫЙ START TIMER (С возвратом яйца)
function startTimer() {
    if (isRunning) return;
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time; 
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (eggDisplay) eggDisplay.textContent = mode.egg; // ЯЙЦО!
    
    isRunning = true;
    prevBtn.style.visibility='hidden'; nextBtn.style.visibility='hidden'; shareBtn.style.display='none';
    mainBtn.textContent="Сдаться"; mainBtn.className="btn stop";
    
    applyEggSkin();
    eggDisplay.classList.add('shaking');
    statusText.textContent="Фармим...";

    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent=formatTime(timeLeft);
        if(timeLeft<=0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); isRunning=false;
    prevBtn.style.visibility='visible'; nextBtn.style.visibility='visible';
    mainBtn.textContent="Начать фокус"; mainBtn.className="btn";
    eggDisplay.classList.remove('shaking');
    updateUI();
}

function finishTimer() {
    clearInterval(timerInterval); isRunning=false; eggDisplay.classList.remove('shaking');
    const mode = MODES[currentModeIndex];
    
    // XP
    userXP+=mode.xpReward;
    if(userXP>=userLevel*200) { userXP-=userLevel*200; userLevel++; statusText.textContent=`LVL UP! ${userLevel}`; }
    localStorage.setItem('userXP', userXP); localStorage.setItem('userLevel', userLevel); updateLevelUI();

    // DROP
    const chance = Math.random()*100;
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
    currentPet = pool[Math.floor(Math.random()*pool.length)];
    eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); // Обновит и добавит клик
    
    mainBtn.textContent="Ещё раз"; mainBtn.className="btn";
    shareBtn.style.display='block';
    
    const price = PRICES[getPetRarity(currentPet)];
    statusText.textContent = `+${price}$ (стоимость) | ${rarityName}`;
    if(window.navigator.vibrate) window.navigator.vibrate(200);
    setTimeout(() => { prevBtn.style.visibility='visible'; nextBtn.style.visibility='visible'; }, 2000);
}

function updateUI() {
    const mode = MODES[currentModeIndex];
    if(!isRunning) { eggDisplay.textContent=mode.egg; timerDisplay.textContent=formatTime(mode.time); }
    getEl('mode-title').textContent=mode.title; getEl('mode-subtitle').textContent=mode.sub;
}

// LISTENERS
getEl('open-shop-btn').onclick = () => { getEl('shop-modal').style.display='flex'; switchShopTab('themes'); };
getEl('close-shop').onclick = () => getEl('shop-modal').style.display='none';
prevBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
nextBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
mainBtn.onclick = () => isRunning ? stopTimer() : startTimer();

// INIT
renderCollection();
updateLevelUI();
updateUI();
applyTheme();