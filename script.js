// === НАСТРОЙКИ ===
const MODES = [
    { id: 'short', time: 10, xpReward: 250, egg: '🥚', title: '25 минут', sub: 'Шанс Легендарки: 1%', style: '' },
    { id: 'long', time: 20, xpReward: 1000, egg: '💎', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥', style: 'hardcore' }
];

const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

const ACHIEVEMENTS_DATA = [
    { id: 'first_hatch', title: 'Первый шаг', desc: 'Вырасти 1 питомца', goal: 1, reward: 100 },
    { id: 'rich_kid', title: 'Богач', desc: 'Заработай $1000', goal: 1000, type: 'money', reward: 500 },
    { id: 'collector', title: 'Коллекционер', desc: 'Собери 5 уникальных', goal: 5, type: 'unique', reward: 1000 },
    { id: 'hard_worker', title: 'Трудяга', desc: 'Вырасти 10 питомцев', goal: 10, reward: 2000 }
];

const QUESTS_DATA = [
    { id: 'sub_channel', title: 'Подписка', desc: 'Подпишись на канал', reward: 1000, type: 'link', url: 'https://t.me/focushatch' },
    { id: 'invite_friends', title: 'Друзья', desc: 'Пригласи 5 друзей', reward: 2000, type: 'invite', goal: 5 }
];

const SHOP_DATA = {
    themes: [
        { id: 'default', name: 'Тьма', price: 0, cssClass: '' },
        { id: 'forest', name: 'Лес', price: 500, cssClass: 'theme-forest' },
        { id: 'space', name: 'Космос', price: 2000, cssClass: 'theme-space' },
        { id: 'neon', name: 'Неон', price: 5000, cssClass: 'theme-neon' },
        { id: 'gold', name: 'Мажор', price: 10000, cssClass: 'theme-gold' }
    ],
    eggs: [
        { id: 'default', name: 'Стандарт', price: 0, skinClass: '' },
        { id: 'glow', name: 'Сияние', price: 1000, skinClass: 'skin-glow' },
        { id: 'ice', name: 'Лед', price: 3000, skinClass: 'skin-ice' },
        { id: 'glitch', name: 'Глюк', price: 7777, skinClass: 'skin-glitch' },
        { id: 'gold', name: 'Золото', price: 15000, skinClass: 'skin-gold' }
    ],
    boosters: [
        { id: 'luck', name: 'Зелье Удачи', price: 200, icon: '🍀', desc: 'Шанс x5' },
        { id: 'speed', name: 'Ускоритель', price: 500, icon: '⏳', desc: 'Время / 2' }
    ]
};

// === ПЕРЕМЕННЫЕ ===
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

// === ЗАГРУЗКА (С ПРОВЕРКОЙ НА NULL) ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
let walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
let activeTheme = localStorage.getItem('activeTheme') || 'default';
let activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';

// Статистика (с защитой)
let userStats = { hatched: 0, earned: 0, invites: 0 };
try {
    let saved = JSON.parse(localStorage.getItem('userStats'));
    if (saved) userStats = saved;
} catch(e) {}

// Бустеры (с защитой)
let myBoosters = { luck: 0, speed: 0 };
try {
    let savedBoosters = JSON.parse(localStorage.getItem('myBoosters'));
    if (savedBoosters) myBoosters = savedBoosters;
} catch(e) {}

let claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];
let claimedQuests = JSON.parse(localStorage.getItem('claimedQuests')) || [];
let isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';

// Активные бустеры в текущем раунде
let activeBoosters = { luck: false, speed: false };

// === ЭЛЕМЕНТЫ ===
const getEl = (id) => document.getElementById(id);
const eggDisplay = getEl('egg-display');
const timerDisplay = getEl('timer');
const mainBtn = getEl('main-btn');
const shareBtn = getEl('share-btn');
const collectionContainer = getEl('collection');
const xpBar = getEl('xp-bar');
const levelNumber = getEl('level-number');
const rankName = getEl('rank-name');
const totalMoneyDisplay = getEl('total-money');
const uniqueCountDisplay = getEl('unique-count');
const shopModal = getEl('shop-modal');
const shopItemsContainer = getEl('shop-items');
const petModal = getEl('pet-modal');
const achievementsModal = getEl('achievements-modal');
const achievementsList = getEl('achievements-list');
const settingsModal = getEl('settings-modal');
const inventoryArrow = getEl('inventory-arrow');
const modeTitle = getEl('mode-title');
const modeSub = getEl('mode-subtitle');
const prevBtn = getEl('prev-btn');
const nextBtn = getEl('next-btn');
const toastContainer = getEl('toast-container');
const achBadge = getEl('ach-badge');
const boostersPanel = getEl('boosters-panel');

let currentShopTab = 'themes';
let currentAchTab = 'achievements';
let selectedPetIndex = null;

// === УВЕДОМЛЕНИЯ ===
function showToast(message, icon = '🔔') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:18px">${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// === БАЛАНС И UI ===
function updateBalanceUI() {
    if(totalMoneyDisplay) totalMoneyDisplay.textContent = `💰 $${walletBalance.toLocaleString()}`;
    if(uniqueCountDisplay) uniqueCountDisplay.textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
    renderBoostersPanel();
}

function checkAchievements() {
    let uniqueCount = new Set(collection).size;
    let hasUnclaimed = false;
    ACHIEVEMENTS_DATA.forEach(ach => {
        if (claimedAchievements.includes(ach.id)) return; 
        if ((!ach.type && userStats.hatched >= ach.goal) || (ach.type === 'money' && userStats.earned >= ach.goal) || (ach.type === 'unique' && uniqueCount >= ach.goal)) hasUnclaimed = true;
    });
    QUESTS_DATA.forEach(q => { if (!claimedQuests.includes(q.id) && q.type === 'invite' && (userStats.invites || 0) >= q.goal) hasUnclaimed = true; });
    if (achBadge) achBadge.style.display = hasUnclaimed ? 'block' : 'none';
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getPetRarity(pet) {
    if (petDatabase.legendary.includes(pet)) return "legendary";
    if (petDatabase.rare.includes(pet)) return "rare";
    return "common";
}

// === БУСТЕРЫ UI ===
function renderBoostersPanel() {
    if(!boostersPanel) return;
    boostersPanel.innerHTML = '';
    
    // Защита от undefined
    if(!myBoosters.luck) myBoosters.luck = 0;
    if(!myBoosters.speed) myBoosters.speed = 0;

    const luckBtn = createBoosterBtn('luck', '🍀', myBoosters.luck, activeBoosters.luck);
    const speedBtn = createBoosterBtn('speed', '⏳', myBoosters.speed, activeBoosters.speed);
    
    boostersPanel.appendChild(luckBtn);
    boostersPanel.appendChild(speedBtn);
}

function createBoosterBtn(type, icon, count, isActive) {
    const div = document.createElement('div');
    div.className = `booster-slot ${isActive ? 'active' : ''} ${count === 0 ? 'empty' : ''}`;
    div.innerHTML = `${icon} <div class="booster-count">${count}</div>`;
    div.onclick = () => {
        if (count > 0 && !isRunning) {
            activeBoosters[type] = !activeBoosters[type];
            if(activeBoosters[type]) showToast(type === 'luck' ? "Удача повышена!" : "Время ускорено!", icon);
            renderBoostersPanel();
            updateUI(); 
        }
    };
    return div;
}

// === ИГРА ===
function updateUI() {
    const mode = MODES[currentModeIndex];
    if(!isRunning) { 
        let time = mode.time;
        if (activeBoosters.speed) time = Math.floor(time / 2);
        if(eggDisplay) eggDisplay.textContent = mode.egg; 
        if(timerDisplay) timerDisplay.textContent = formatTime(time); 
        applyEggSkin(); 
    }
    if(modeTitle) modeTitle.textContent = mode.title; 
    if(modeSub) modeSub.textContent = mode.sub;
}

function startTimer() {
    if (isRunning) return;
    if(timerInterval) clearInterval(timerInterval);

    const mode = MODES[currentModeIndex];
    timeLeft = activeBoosters.speed ? Math.floor(mode.time / 2) : mode.time;
    
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    if (eggDisplay) eggDisplay.textContent = mode.egg;
    isRunning = true;
    prevBtn.style.visibility='hidden'; nextBtn.style.visibility='hidden'; shareBtn.style.display='none';
    if(mainBtn) { mainBtn.textContent="Сдаться"; mainBtn.className="btn stop"; }
    applyEggSkin();
    if(eggDisplay) eggDisplay.classList.add('shaking');
    
    // Блокируем бустеры
    renderBoostersPanel();

    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent=formatTime(timeLeft);
        if(timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); isRunning=false;
    prevBtn.style.visibility='visible'; nextBtn.style.visibility='visible';
    if(mainBtn) { mainBtn.textContent="Начать фокус"; mainBtn.className="btn"; }
    if(eggDisplay) { eggDisplay.classList.remove('shaking'); applyEggSkin(); }
    updateUI(); 
    renderBoostersPanel(); 
    showToast("Фокус прерван!", "⚠️");
}

function finishTimer() {
    clearInterval(timerInterval); isRunning=false; 
    if(eggDisplay) eggDisplay.className = 'egg'; 
    if(mainBtn) { mainBtn.textContent="Ещё раз"; mainBtn.className="btn"; }
    if(shareBtn) shareBtn.style.display='block';
    prevBtn.style.visibility='visible'; nextBtn.style.visibility='visible';

    try {
        const mode = MODES[currentModeIndex];
        userXP+=mode.xpReward;
        if(userXP>=userLevel*200) { userXP-=userLevel*200; userLevel++; showToast(`Уровень повышен! Lvl ${userLevel}`, "🎉"); }
        localStorage.setItem('userXP', userXP); localStorage.setItem('userLevel', userLevel); updateLevelUI();

        userStats.hatched += 1;
        localStorage.setItem('userStats', JSON.stringify(userStats));

        let legendaryChance = mode.id === 'short' ? 1 : 5;
        let rareChance = mode.id === 'short' ? 15 : 30; 
        
        if (activeBoosters.luck) {
            legendaryChance *= 5; 
        }

        const chance = Math.random() * 100;
        let pool;
        if (chance < legendaryChance) pool = petDatabase.legendary;
        else if (chance < (legendaryChance + rareChance)) pool = petDatabase.rare;
        else pool = petDatabase.common;
        
        currentPet = pool[Math.floor(Math.random()*pool.length)];
        if(eggDisplay) eggDisplay.textContent = currentPet;
        collection.push(currentPet);
        localStorage.setItem('myCollection', JSON.stringify(collection));
        renderCollection(); 
        
        if(collectionContainer.classList.contains('hidden')) toggleInventory();
        
        // Списание
        if(activeBoosters.luck) { myBoosters.luck--; activeBoosters.luck = false; }
        if(activeBoosters.speed) { myBoosters.speed--; activeBoosters.speed = false; }
        localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
        
        const price = PRICES[getPetRarity(currentPet)];
        showToast(`Выпал питомец: ${currentPet} (+$${price})`, "🐣");
        updateBalanceUI();
        
        if (isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(200);
    } catch(e) { console.log(e); }
}

// === МАГАЗИН ===
window.switchShopTab = function(tab) {
    currentShopTab = tab;
    document.querySelectorAll('#shop-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
    renderShop();
}
function renderShop() {
    if(!shopItemsContainer) return;
    shopItemsContainer.innerHTML = '';
    const items = SHOP_DATA[currentShopTab];
    items.forEach(item => {
        const div = document.createElement('div');
        let btnHTML = '';
        if (currentShopTab === 'boosters') {
            btnHTML = `<button class="buy-btn" onclick="handleShopClick('${item.id}', ${item.price})">$${item.price}</button>`;
            div.innerHTML = `<div class="shop-item-icon">${item.icon}</div><div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#8e8e93;margin-bottom:5px">${item.desc}</div>${btnHTML}`;
        } else {
            const isOwned = ownedItems[currentShopTab].includes(item.id);
            const isActive = (currentShopTab === 'themes' && activeTheme === item.id) || (currentShopTab === 'eggs' && activeEggSkin === item.id);
            let btnClass = isOwned ? "buy-btn owned" : "buy-btn";
            if (!isOwned && walletBalance < item.price) btnClass += " locked";
            let btnText = isOwned ? (isActive ? "Выбрано" : "Выбрать") : `$${item.price}`;
            btnHTML = `<button class="${btnClass}" onclick="handleShopClick('${item.id}', ${item.price})">${btnText}</button>`;
            div.innerHTML = `<div class="shop-item-icon">${currentShopTab === 'themes' ? '🎨' : '🥚'}</div><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        }
        div.className = `shop-item`;
        shopItemsContainer.appendChild(div);
    });
}

window.handleShopClick = function(id, price) {
    if (currentShopTab === 'boosters') {
        if (walletBalance >= price) {
            walletBalance -= price; 
            localStorage.setItem('walletBalance', walletBalance);
            if (!myBoosters[id]) myBoosters[id] = 0;
            myBoosters[id]++;
            localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
            updateBalanceUI(); 
            showToast(`Куплено: ${id === 'luck' ? 'Удача' : 'Скорость'}`, "🧪");
        } else { showToast("Не хватает денег!", "🚫"); }
        return;
    }
    const isOwned = ownedItems[currentShopTab].includes(id);
    if (isOwned) {
        if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
        else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
        renderShop();
        showToast("Установлено!", "✨");
    } else {
        if (walletBalance >= price) {
            walletBalance -= price; localStorage.setItem('walletBalance', walletBalance);
            ownedItems[currentShopTab].push(id); localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
            if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
            else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
            updateBalanceUI(); renderShop();
            showToast("Куплено!", "🛍️");
        } else { showToast("Не хватает денег!", "🚫"); }
    }
};

// === ОСТАЛЬНЫЕ ФУНКЦИИ ===
window.switchAchTab = function(tab) {
    currentAchTab = tab;
    document.querySelectorAll('#achievements-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
    if (tab === 'achievements') renderAchievements(); else renderQuests();
}
function renderAchievements() {
    if(!achievementsList) return;
    achievementsList.innerHTML = '';
    let uniqueCount = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(ach => {
        let current = userStats.hatched;
        if (ach.type === 'money') current = userStats.earned;
        if (ach.type === 'unique') current = uniqueCount;
        const isClaimed = claimedAchievements.includes(ach.id);
        const isCompleted = current >= ach.goal;
        const div = document.createElement('div');
        div.className = `achievement-card ${isCompleted ? 'unlocked' : ''}`;
        let buttonHTML = '';
        if (isCompleted && !isClaimed) buttonHTML = `<button onclick="claimAchievement('${ach.id}', ${ach.reward})" style="padding:5px; background:#34c759; border:none; border-radius:5px; color:#fff; font-size:10px;">Забрать $${ach.reward}</button>`; 
        else if (isClaimed) buttonHTML = `<span style="font-size:16px;">✅</span>`;
        else buttonHTML = `<span style="font-size:12px; color:#8e8e93;">${current}/${ach.goal}</span>`;
        div.innerHTML = `<div class="ach-icon">${isCompleted ? '🏆' : '🔒'}</div><div class="ach-info"><p class="ach-title">${ach.title}</p><p class="ach-desc">${ach.desc}</p></div><div class="ach-action">${buttonHTML}</div>`;
        achievementsList.appendChild(div);
    });
}
function renderQuests() {
    if(!achievementsList) return;
    achievementsList.innerHTML = '';
    QUESTS_DATA.forEach(q => {
        const isClaimed = claimedQuests.includes(q.id);
        const div = document.createElement('div');
        div.className = `achievement-card ${isClaimed ? 'unlocked' : ''}`;
        let buttonHTML = '';
        if (isClaimed) { buttonHTML = `<span style="font-size:16px;">✅</span>`; } 
        else if (q.type === 'link') { buttonHTML = `<button id="btn-${q.id}" onclick="handleQuestClick('${q.id}', '${q.url}', ${q.reward})" style="padding:5px; background:#007aff; border:none; border-radius:5px; color:#fff; font-size:10px;">Выполнить</button>`; } 
        else if (q.type === 'invite') {
            let invites = userStats.invites || 0;
            if (invites >= q.goal) buttonHTML = `<button onclick="claimQuest('${q.id}', ${q.reward})" style="padding:5px; background:#34c759; border:none; border-radius:5px; color:#fff; font-size:10px;">Забрать $${q.reward}</button>`; 
            else buttonHTML = `<span style="font-size:12px; color:#8e8e93;">${invites}/${q.goal}</span>`;
        }
        div.innerHTML = `<div class="ach-icon">📜</div><div class="ach-info"><p class="ach-title">${q.title} (+$${q.reward})</p><p class="ach-desc">${q.desc}</p></div><div class="ach-action">${buttonHTML}</div>`;
        achievementsList.appendChild(div);
    });
}
window.handleQuestClick = function(id, url, reward) {
    if (window.Telegram.WebApp) window.Telegram.WebApp.openLink(url); else window.open(url, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) { btn.textContent = "Проверяю..."; btn.disabled = true; btn.style.background = "#8e8e93"; setTimeout(() => { claimQuest(id, reward); }, 4000); }
}
window.claimQuest = function(id, reward) {
    if (claimedQuests.includes(id)) return;
    claimedQuests.push(id); localStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
    walletBalance += reward; localStorage.setItem('walletBalance', walletBalance);
    showToast(`Квест выполнен! +$${reward}`, "📜"); updateBalanceUI(); renderQuests();
}
window.claimAchievement = function(id, reward) {
    if (claimedAchievements.includes(id)) return;
    claimedAchievements.push(id); localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    walletBalance += reward; localStorage.setItem('walletBalance', walletBalance);
    showToast(`Награда: +$${reward}`, "🏆"); updateBalanceUI(); renderAchievements();
}
function openPetModal(index) {
    selectedPetIndex = index;
    const pet = collection[index];
    const rarity = getPetRarity(pet);
    const price = PRICES[rarity];
    if(petModal) {
        petModal.style.display = 'flex';
        getEl('pet-detail-view').innerHTML = `<div class="pet-big-icon">${pet}</div><h3 class="pet-name">Питомец</h3><p class="pet-rarity ${rarity}">${rarity}</p><p class="pet-price">Цена продажи: $${price}</p><button onclick="sellPet()" class="btn sell-action">Продать</button>`;
    }
}
window.closePetModal = function() { if(petModal) petModal.style.display = 'none'; selectedPetIndex = null; }
window.sellPet = function() {
    if (selectedPetIndex === null) return;
    const pet = collection[selectedPetIndex];
    const price = PRICES[getPetRarity(pet)];
    walletBalance += price;
    userStats.earned += price; 
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    collection.splice(selectedPetIndex, 1);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    updateBalanceUI(); renderCollection(); closePetModal();
    showToast(`Продано за $${price}`, "💰");
    if (isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(50);
}
function applyTheme() { const t = SHOP_DATA.themes.find(x => x.id === activeTheme); document.body.className = t ? t.cssClass : ''; }
function applyEggSkin() { 
    if(!eggDisplay) return;
    const mode = MODES[currentModeIndex];
    const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 
    eggDisplay.className = 'egg'; 
    if (mode.style === 'hardcore') { eggDisplay.classList.add('diamond-egg'); } 
    else { if (s && s.skinClass && activeEggSkin !== 'default') eggDisplay.classList.add(s.skinClass); }
    if(isRunning) eggDisplay.classList.add('shaking'); 
}
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
// Events
if(getEl('open-shop-btn')) getEl('open-shop-btn').onclick = () => { if(shopModal) shopModal.style.display='flex'; switchShopTab('themes'); };
if(getEl('close-shop')) getEl('close-shop').onclick = () => { if(shopModal) shopModal.style.display='none'; };
if(getEl('open-settings-btn')) getEl('open-settings-btn').onclick = () => { if(settingsModal) settingsModal.style.display='flex'; };
if(getEl('close-settings')) getEl('close-settings').onclick = () => { if(settingsModal) settingsModal.style.display='none'; };
if(getEl('achievements-btn')) getEl('achievements-btn').onclick = () => { if(achievementsModal) achievementsModal.style.display='flex'; switchAchTab('achievements'); };
if(getEl('close-achievements')) getEl('close-achievements').onclick = () => { if(achievementsModal) achievementsModal.style.display='none'; };
if(getEl('vibration-toggle')) { getEl('vibration-toggle').checked = isVibrationOn; getEl('vibration-toggle').onchange = (e) => { isVibrationOn = e.target.checked; localStorage.setItem('isVibrationOn', isVibrationOn); }; }
if(getEl('reset-progress-btn')) getEl('reset-progress-btn').onclick = () => { if(confirm("Сбросить всё?")) { localStorage.clear(); location.reload(); } };

if(prevBtn) prevBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(nextBtn) nextBtn.onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
if(mainBtn) mainBtn.onclick = () => isRunning ? stopTimer() : startTimer();
if(shareBtn) shareBtn.onclick = () => {
    let uniqueCount = new Set(collection).size;
    if(!userStats.invites) userStats.invites = 0; userStats.invites++; localStorage.setItem('userStats', JSON.stringify(userStats)); checkAchievements();
    const text = `У меня ${uniqueCount} петов и $${walletBalance} в Focus Hatcher! Заходи.`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
};

// Init
applyTheme();
renderCollection();
updateLevelUI();
updateUI();