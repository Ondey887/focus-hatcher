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

// === ДАННЫЕ ===
let collection = JSON.parse(localStorage.getItem('myCollection')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
let walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
let activeTheme = localStorage.getItem('activeTheme') || 'default';
let activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
let userStats = { hatched: 0, earned: 0, invites: 0 };
try { let s = JSON.parse(localStorage.getItem('userStats')); if(s) userStats = s; } catch(e){}
let myBoosters = { luck: 0, speed: 0 };
try { let b = JSON.parse(localStorage.getItem('myBoosters')); if(b) myBoosters = b; } catch(e){}
let claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];
let claimedQuests = JSON.parse(localStorage.getItem('claimedQuests')) || [];
let isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';

let currentModeIndex = 0;
let timeLeft = MODES[0].time;
let timerInterval = null;
let isRunning = false;
let currentPet = null;
let activeBoosters = { luck: false, speed: false };
let currentShopTab = 'themes';
let currentAchTab = 'achievements';
let selectedPet = null; // Для модалки (теперь храним символ)

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻", "🐨", "🐤", "🐛"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};
// Полный список для энциклопедии
const ALL_PETS_FLAT = [...petDatabase.common, ...petDatabase.rare, ...petDatabase.legendary];
const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const getEl = (id) => document.getElementById(id);

function showToast(message, icon = '🔔') {
    const container = getEl('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:18px">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
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

// === ОСНОВНАЯ ЛОГИКА ===
function initGame() {
    updateLevelUI();
    renderCollection(); // Теперь рендерит Энциклопедию
    applyTheme();
    updateUI();
    updateBalanceUI();
    
    // События
    getEl('open-shop-btn').onclick = () => { getEl('shop-modal').style.display='flex'; switchShopTab('themes'); };
    getEl('close-shop').onclick = () => getEl('shop-modal').style.display='none';
    getEl('open-settings-btn').onclick = () => getEl('settings-modal').style.display='flex';
    getEl('close-settings').onclick = () => getEl('settings-modal').style.display='none';
    getEl('achievements-btn').onclick = () => { getEl('achievements-modal').style.display='flex'; switchAchTab('achievements'); };
    getEl('close-achievements').onclick = () => getEl('achievements-modal').style.display='none';
    
    getEl('prev-btn').onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
    getEl('next-btn').onclick = () => { if(!isRunning) { currentModeIndex=currentModeIndex===0?1:0; updateUI(); }};
    getEl('main-btn').onclick = () => isRunning ? stopTimer() : startTimer();
    
    getEl('inventory-btn').onclick = toggleInventory;
    
    getEl('share-btn').onclick = () => {
        if(!userStats.invites) userStats.invites = 0; userStats.invites++; localStorage.setItem('userStats', JSON.stringify(userStats)); checkAchievements();
        const text = `У меня ${new Set(collection).size} петов в Focus Hatcher!`;
        const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
        if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url); else window.open(url, '_blank');
    };
    
    if(getEl('vibration-toggle')) { 
        getEl('vibration-toggle').checked = isVibrationOn; 
        getEl('vibration-toggle').onchange = (e) => { isVibrationOn = e.target.checked; localStorage.setItem('isVibrationOn', isVibrationOn); }; 
    }
    getEl('reset-progress-btn').onclick = () => { if(confirm("Сбросить всё?")) { localStorage.clear(); location.reload(); } };
}

function updateBalanceUI() {
    getEl('total-money').textContent = `💰 $${walletBalance.toLocaleString()}`;
    getEl('unique-count').textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
    renderBoostersPanel();
}

function checkAchievements() {
    let hasUnclaimed = false;
    let uniqueCount = new Set(collection).size;
    
    ACHIEVEMENTS_DATA.forEach(ach => {
        if (!claimedAchievements.includes(ach.id)) {
            let completed = false;
            if (ach.type === 'money' && userStats.earned >= ach.goal) completed = true;
            else if (ach.type === 'unique' && uniqueCount >= ach.goal) completed = true;
            else if (!ach.type && userStats.hatched >= ach.goal) completed = true;
            if(completed) hasUnclaimed = true;
        }
    });
    QUESTS_DATA.forEach(q => {
        if (!claimedQuests.includes(q.id)) {
            if (q.type === 'invite' && (userStats.invites || 0) >= q.goal) hasUnclaimed = true;
        }
    });
    getEl('ach-badge').style.display = hasUnclaimed ? 'block' : 'none';
}

// === ЭНЦИКЛОПЕДИЯ (НОВАЯ ЛОГИКА) ===
window.toggleInventory = function() {
    const col = getEl('collection');
    const arrow = getEl('inventory-arrow');
    if (col.classList.contains('hidden')) {
        col.classList.remove('hidden');
        arrow.textContent = "▼";
    } else {
        col.classList.add('hidden');
        arrow.textContent = "▲";
    }
}

function renderCollection() {
    const container = getEl('collection');
    container.innerHTML = '';
    
    // Проходим по ВСЕМ возможным питомцам
    ALL_PETS_FLAT.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const rarity = getPetRarity(pet);
        const slot = document.createElement('div');
        
        if (count > 0) {
            // Открыт
            slot.className = `pet-slot ${rarity}`;
            slot.textContent = pet;
            if (count > 1) {
                const badge = document.createElement('div');
                badge.className = 'slot-count';
                badge.textContent = `x${count}`;
                slot.appendChild(badge);
            }
            slot.onclick = () => openPetModal(pet, true);
        } else {
            // Закрыт (Силуэт)
            slot.className = `pet-slot locked`;
            const sil = document.createElement('span');
            sil.className = 'pet-silhouette';
            sil.textContent = pet;
            slot.appendChild(sil);
            slot.onclick = () => openPetModal(pet, false);
        }
        container.appendChild(slot);
    });
    
    updateBalanceUI();
}

function openPetModal(pet, isOwned) {
    selectedPet = pet;
    const rarity = getPetRarity(pet);
    const price = PRICES[rarity];
    const rarityNames = { common: "Обычный", rare: "Редкий", legendary: "ЛЕГЕНДА" };
    
    getEl('pet-modal').style.display = 'flex';
    
    if (isOwned) {
        getEl('pet-detail-view').innerHTML = `
            <div class="pet-big-icon">${pet}</div>
            <h3 class="pet-name">Питомец</h3>
            <p class="pet-rarity ${rarity}">${rarityNames[rarity]}</p>
            <p class="pet-price">Цена: $${price}</p>
            <button onclick="sellPet()" class="btn sell-action">Продать ($${price})</button>
        `;
    } else {
        getEl('pet-detail-view').innerHTML = `
            <div class="pet-big-icon" style="filter: brightness(0) opacity(0.3);">${pet}</div>
            <h3 class="pet-name">???</h3>
            <p class="pet-rarity ${rarity}">Редкость: ${rarityNames[rarity]}</p>
            <p class="pet-price" style="color: #8e8e93;">Не пойман</p>
            <button onclick="closePetModal()" class="btn" style="background: #3a3a3c;">Закрыть</button>
        `;
    }
}

window.closePetModal = function() { getEl('pet-modal').style.display = 'none'; selectedPet = null; }

window.sellPet = function() {
    if (!selectedPet) return;
    
    // Находим индекс первого такого питомца
    const index = collection.indexOf(selectedPet);
    if (index === -1) return; // Ошибка
    
    const price = PRICES[getPetRarity(selectedPet)];
    walletBalance += price;
    userStats.earned += price; 
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    
    collection.splice(index, 1);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    
    updateBalanceUI(); 
    renderCollection(); 
    closePetModal();
    showToast(`Продано за $${price}`, "💰");
    if (isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(50);
}

// === БУСТЕРЫ ===
function renderBoostersPanel() {
    const panel = getEl('boosters-panel');
    if(!panel) return;
    panel.innerHTML = '';
    const luckBtn = createBoosterBtn('luck', '🍀', myBoosters.luck || 0, activeBoosters.luck);
    const speedBtn = createBoosterBtn('speed', '⏳', myBoosters.speed || 0, activeBoosters.speed);
    panel.appendChild(luckBtn);
    panel.appendChild(speedBtn);
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
        getEl('egg-display').textContent = mode.egg; 
        getEl('timer').textContent = formatTime(time); 
        applyEggSkin(); 
    }
    getEl('mode-title').textContent = mode.title; 
    getEl('mode-subtitle').textContent = mode.sub;
}

function startTimer() {
    if (isRunning) return;
    if(timerInterval) clearInterval(timerInterval);
    const mode = MODES[currentModeIndex];
    timeLeft = activeBoosters.speed ? Math.floor(mode.time / 2) : mode.time;
    
    getEl('timer').textContent = formatTime(timeLeft);
    getEl('egg-display').textContent = mode.egg;
    isRunning = true;
    
    getEl('prev-btn').style.visibility='hidden'; 
    getEl('next-btn').style.visibility='hidden'; 
    getEl('share-btn').style.display='none';
    getEl('main-btn').textContent="Сдаться"; 
    getEl('main-btn').className="btn stop";
    
    applyEggSkin();
    getEl('egg-display').classList.add('shaking');
    renderBoostersPanel();

    timerInterval = setInterval(() => {
        timeLeft--;
        getEl('timer').textContent=formatTime(timeLeft);
        if(timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); isRunning=false;
    getEl('prev-btn').style.visibility='visible'; 
    getEl('next-btn').style.visibility='visible';
    getEl('main-btn').textContent="Начать фокус"; 
    getEl('main-btn').className="btn";
    getEl('egg-display').classList.remove('shaking'); 
    applyEggSkin();
    updateUI(); 
    renderBoostersPanel(); 
    showToast("Фокус прерван!", "⚠️");
}

function finishTimer() {
    clearInterval(timerInterval); isRunning=false; 
    getEl('egg-display').className = 'egg'; 
    getEl('main-btn').textContent="Ещё раз"; 
    getEl('main-btn').className="btn";
    getEl('share-btn').style.display='block';
    getEl('prev-btn').style.visibility='visible'; 
    getEl('next-btn').style.visibility='visible';

    try {
        const mode = MODES[currentModeIndex];
        userXP+=mode.xpReward;
        if(userXP>=userLevel*200) { userXP-=userLevel*200; userLevel++; showToast(`Уровень повышен! Lvl ${userLevel}`, "🎉"); }
        localStorage.setItem('userXP', userXP); localStorage.setItem('userLevel', userLevel); updateLevelUI();

        userStats.hatched += 1;
        localStorage.setItem('userStats', JSON.stringify(userStats));

        // Списание бустеров
        let legendaryChance = mode.id === 'short' ? 1 : 5;
        let rareChance = mode.id === 'short' ? 15 : 30; 
        if (activeBoosters.luck) { legendaryChance *= 5; myBoosters.luck--; activeBoosters.luck = false; }
        if (activeBoosters.speed) { myBoosters.speed--; activeBoosters.speed = false; }
        localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
        renderBoostersPanel();

        // Дроп
        const chance = Math.random() * 100;
        let pool;
        if (chance < legendaryChance) pool = petDatabase.legendary;
        else if (chance < (legendaryChance + rareChance)) pool = petDatabase.rare;
        else pool = petDatabase.common;
        
        currentPet = pool[Math.floor(Math.random()*pool.length)];
        getEl('egg-display').textContent = currentPet;
        collection.push(currentPet);
        localStorage.setItem('myCollection', JSON.stringify(collection));
        renderCollection(); 
        
        if(getEl('collection').classList.contains('hidden')) toggleInventory();
        
        const price = PRICES[getPetRarity(currentPet)];
        showToast(`Выпал питомец: ${currentPet} (+$${price})`, "🐣");
        updateBalanceUI();
        
        if (isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(200);
    } catch(e) { console.log(e); }
}

// === МАГАЗИН, ВКЛАДКИ И ПРОЧЕЕ (Оставлено как было, но вставь целиком для гарантии) ===
window.switchShopTab = function(tab) {
    currentShopTab = tab;
    document.querySelectorAll('#shop-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
    renderShop();
}
function renderShop() {
    const container = getEl('shop-items');
    container.innerHTML = '';
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
        container.appendChild(div);
    });
}
window.handleShopClick = function(id, price) {
    if (currentShopTab === 'boosters') {
        if (walletBalance >= price) {
            walletBalance -= price; localStorage.setItem('walletBalance', walletBalance);
            if (!myBoosters[id]) myBoosters[id] = 0; myBoosters[id]++; localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
            updateBalanceUI(); showToast(`Куплено: ${id === 'luck' ? 'Удача' : 'Скорость'}`, "🧪");
        } else { showToast("Не хватает денег!", "🚫"); }
        return;
    }
    const isOwned = ownedItems[currentShopTab].includes(id);
    if (isOwned) {
        if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
        else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
        renderShop(); showToast("Установлено!", "✨");
    } else {
        if (walletBalance >= price) {
            walletBalance -= price; localStorage.setItem('walletBalance', walletBalance);
            ownedItems[currentShopTab].push(id); localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
            if (currentShopTab === 'themes') { activeTheme = id; localStorage.setItem('activeTheme', id); applyTheme(); }
            else { activeEggSkin = id; localStorage.setItem('activeEggSkin', id); applyEggSkin(); }
            updateBalanceUI(); renderShop(); showToast("Куплено!", "🛍️");
        } else { showToast("Не хватает денег!", "🚫"); }
    }
};

window.switchAchTab = function(tab) {
    currentAchTab = tab;
    document.querySelectorAll('#achievements-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event.target) event.target.classList.add('active');
    if (tab === 'achievements') renderAchievements(); else renderQuests();
}
function renderAchievements() {
    const container = getEl('achievements-list');
    container.innerHTML = '';
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
        container.appendChild(div);
    });
}
function renderQuests() {
    const container = getEl('achievements-list');
    container.innerHTML = '';
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
        container.appendChild(div);
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

// ЗАПУСК (ВАЖНО!)
window.onload = initGame;