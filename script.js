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

// === ЗАГРУЗКА И ДАННЫЕ ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
collection = collection.map(pet => (pet === "panda" ? "🐼" : pet));
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

// Кошелек
let walletBalance = parseInt(localStorage.getItem('walletBalance'));
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

// === ПОИСК ЭЛЕМЕНТОВ (Безопасный) ===
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
const shopModal = getEl('shop-modal');
const shopItemsContainer = getEl('shop-items');
const petModal = getEl('pet-modal');
const inventoryArrow = getEl('inventory-arrow');
const modeTitle = getEl('mode-title');
const modeSub = getEl('mode-subtitle');
const prevBtn = getEl('prev-btn');
const nextBtn = getEl('next-btn');

let currentShopTab = 'themes';
let selectedPetIndex = null;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

function updateBalanceUI() {
    if(totalMoneyDisplay) totalMoneyDisplay.textContent = `💰 $${walletBalance.toLocaleString()}`;
    if(uniqueCountDisplay) uniqueCountDisplay.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// === ИНВЕНТАРЬ ===
window.toggleInventory = function() {
    if (!collectionContainer) return;
    if (collectionContainer.classList.contains('hidden')) {
        collectionContainer.classList.remove('hidden');
        if(inventoryArrow) inventoryArrow.textContent = "▼";
    } else {
        collectionContainer.classList.add('hidden');
        if(inventoryArrow) inventoryArrow.textContent = "▲";
    }
}

function renderCollection() {
    if (!collectionContainer) return;
    collectionContainer.innerHTML = '';
    
    for (let i = collection.length - 1; i >= 0; i--) {
        const pet = collection[i];
        const slot = document.createElement('div');
        const rarity = getPetRarity(pet);
        slot.className = `pet-slot ${rarity}`;
        slot.textContent = pet;
        slot.onclick = () => openPetModal(i);
        collectionContainer.appendChild(slot);
    }
    updateBalanceUI();
}

// === ПРОДАЖА ПИТОМЦА ===
function openPetModal(index) {
    selectedPetIndex = index;
    const pet = collection[index];
    const rarity = getPetRarity(pet);
    const price = PRICES[rarity];
    const names = { common: "Обычный", rare: "Редкий", legendary: "ЛЕГЕНДАРНЫЙ" };

    if(petModal) {
        petModal.style.display = 'flex';
        getEl('pet-detail-view').innerHTML = `
            <div class="pet-big-icon">${pet}</div>
            <h3 class="pet-name">Питомец</h3>
            <p class="pet-rarity ${rarity}">${names[rarity]}</p>
            <p class="pet-price">Цена продажи: $${price}</p>
            <button onclick="sellPet()" class="btn sell-action">Продать за $${price}</button>
        `;
    }
}

window.closePetModal = function() {
    if(petModal) petModal.style.display = 'none';
    selectedPetIndex = null;
}

window.sellPet = function() {
    if (selectedPetIndex === null) return;
    const pet = collection[selectedPetIndex];
    const price = PRICES[getPetRarity(pet)];
    
    walletBalance += price;
    localStorage.setItem('walletBalance', walletBalance);
    
    collection.splice(selectedPetIndex, 1);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    
    updateBalanceUI();
    renderCollection();
    closePetModal();
    if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
}

// === МАГАЗИН ===
window.switchShopTab = function(tab) {
    currentShopTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
    renderShop();
}

function renderShop() {
    if(!shopItemsContainer) return;
    shopItemsContainer.innerHTML = '';
    const items = SHOP_DATA[currentShopTab];
    
    items.forEach(item => {
        const div = document.createElement('div');
        const isOwned = ownedItems[currentShopTab].includes(item.id);
        const isActive = (currentShopTab === 'themes' && activeTheme === item.id) || 
                         (currentShopTab === 'eggs' && activeEggSkin === item.id);
        
        let btnText = isOwned ? (isActive ? "Выбрано" : "Выбрать") : `$${item.price}`;
        let btnClass = isOwned ? "buy-btn owned" : "buy-btn";
        if (!isOwned && walletBalance < item.price) btnClass += " locked";

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

    if (isOwned) {
        if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
        else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
        renderShop();
    } else {
        if (walletBalance >= price) {
            walletBalance -= price;
            localStorage.setItem('walletBalance', walletBalance);
            ownedItems[currentShopTab].push(id);
            localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
            
            if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
            else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
            
            updateBalanceUI();
            renderShop();
        } else {
            if (window.navigator.vibrate) window.navigator.vibrate([50, 50]);
        }
    }
};

function applyTheme() { 
    const t = SHOP_DATA.themes.find(x => x.id === activeTheme); 
    document.body.className = t ? t.cssClass : ''; 
}

function applyEggSkin() { 
    const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 
    if(eggDisplay) {
        eggDisplay.className = 'egg'; 
        if(isRunning) eggDisplay.classList.add('shaking'); 
        if(s && s.skinClass) eggDisplay.classList.add(s.skinClass); 
    }
}

// === УРОВНИ ===
function updateLevelUI() {
    if (!xpBar) return;
    const xpForNextLevel = userLevel * 200; 
    let percentage = (userXP / xpForNextLevel) * 100;
    if (percentage > 100) percentage = 100;
    xpBar.style.width = `${percentage}%`;
    if(levelNumber) levelNumber.textContent = `Lvl ${userLevel}`;
    let rankIndex = Math.floor(userLevel / 5);
    if(rankName) rankName.textContent = RANKS[Math.min(rankIndex, RANKS.length - 1)];
}

// === ОСНОВНОЙ ЦИКЛ ИГРЫ ===
function updateUI() {
    const mode = MODES[currentModeIndex];
    if(!isRunning) { 
        if(eggDisplay) eggDisplay.textContent = mode.egg; 
        if(timerDisplay) timerDisplay.textContent = formatTime(mode.time); 
    }
    if(modeTitle) modeTitle.textContent = mode.title; 
    if(modeSub) modeSub.textContent = mode.sub;
}

function startTimer() {
    if (isRunning) return;
    const mode = MODES[currentModeIndex];
    timeLeft = mode.time; 
    
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (eggDisplay) eggDisplay.textContent = mode.egg;
    
    isRunning = true;
    if(prevBtn) prevBtn.style.visibility='hidden'; 
    if(nextBtn) nextBtn.style.visibility='hidden'; 
    if(shareBtn) shareBtn.style.display='none';
    if(mainBtn) { mainBtn.textContent="Сдаться"; mainBtn.className="btn stop"; }
    
    applyEggSkin();
    if(eggDisplay) eggDisplay.classList.add('shaking');
    if(statusText) statusText.textContent="Фармим...";

    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent=formatTime(timeLeft);
        if(timeLeft<=0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); isRunning=false;
    if(prevBtn) prevBtn.style.visibility='visible'; 
    if(nextBtn) nextBtn.style.visibility='visible';
    if(mainBtn) { mainBtn.textContent="Начать фокус"; mainBtn.className="btn"; }
    if(eggDisplay) eggDisplay.classList.remove('shaking');
    updateUI();
    if(statusText) statusText.textContent="Сдался = нет награды";
}

function finishTimer() {
    clearInterval(timerInterval); isRunning=false; 
    if(eggDisplay) eggDisplay.classList.remove('shaking');
    const mode = MODES[currentModeIndex];
    
    userXP+=mode.xpReward;
    if(userXP>=userLevel*200) { userXP-=userLevel*200; userLevel++; if(statusText) statusText.textContent=`LVL UP! ${userLevel}`; }
    localStorage.setItem('userXP', userXP); localStorage.setItem('userLevel', userLevel); updateLevelUI();

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
    if(eggDisplay) eggDisplay.textContent = currentPet;
    
    collection.push(currentPet);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    renderCollection(); 
    
    if(mainBtn) { mainBtn.textContent="Ещё раз"; mainBtn.className="btn"; }
    if(shareBtn) shareBtn.style.display='block';
    
    const price = PRICES[getPetRarity(currentPet)];
    if(statusText) statusText.textContent = `+${price}$ | ${rarityName}`;
    if(window.navigator.vibrate) window.navigator.vibrate(200);
    setTimeout(() => { if(prevBtn) prevBtn.style.visibility='visible'; if(nextBtn) nextBtn.style.visibility='visible'; }, 2000);
}

// === ПОДКЛЮЧЕНИЕ СОБЫТИЙ (Event Listeners) ===
if(getEl('open-shop-btn')) getEl('open-shop-btn').onclick = () => { if(shopModal) shopModal.style.display='flex'; switchShopTab('themes'); };
if(getEl('close-shop')) getEl('close-shop').onclick = () => { if(shopModal) shopModal.style.display='none'; };
if(prevBtn) prevBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(nextBtn) nextBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(mainBtn) mainBtn.onclick = () => isRunning ? stopTimer() : startTimer();
if(shareBtn) shareBtn.onclick = () => {
    let uniqueCount = new Set(collection).size;
    const text = `У меня ${uniqueCount} петов и $${walletBalance} в Focus Hatcher! Заходи.`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
};

// === ИНИЦИАЛИЗАЦИЯ ===
// Эти функции запускаются при старте, чтобы всё работало
applyTheme(); // Красим фон (Космос/Лес)
renderCollection(); // Рисуем инвентарь
updateLevelUI(); // Рисуем уровень
updateUI(); // Рисуем таймер
