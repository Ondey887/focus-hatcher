// === ЛОВУШКА ОШИБОК ===
const debugConsole = document.getElementById('debug-console');
window.onerror = function(msg, source, lineno) {
    debugConsole.style.display = 'block';
    debugConsole.innerHTML += `<div class="error-msg">❌ Ошибка: ${msg} (стр. ${lineno})</div>`;
    return false;
};

// === ГЛОБАЛЬНЫЕ КОНСТАНТЫ ===
const MODES = [
    { id: 'short', time: 10, xpReward: 250, egg: '🥚', title: '25 минут', sub: 'Шанс Легендарки: 1%', style: '' },
    { id: 'long', time: 20, xpReward: 1000, egg: '💎', title: '60 минут', sub: 'Шанс Легендарки: 5% 🔥', style: 'hardcore' }
];
const PRICES = { common: 15, rare: 150, legendary: 5000 };
const RANKS = ["Новичок", "Искатель", "Укротитель", "Мастер", "Ниндзя", "Легенда", "Бог Фокуса"];

const petDatabase = {
    common: ["🐣", "🐱", "🐶", "🐹", "🐰", "🐸", "🐻", "🐨", "🐤", "🐛"],
    rare: ["🦊", "🐼", "🐯", "🦁", "🐮", "🐷", "🐵", "🦉"],
    legendary: ["🦄", "🐲", "👽", "🤖", "🦖", "🔥"]
};
const ALL_PETS_FLAT = [...petDatabase.common, ...petDatabase.rare, ...petDatabase.legendary];
const TOTAL_PETS_COUNT = ALL_PETS_FLAT.length;

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
    themes: [ { id: 'default', name: 'Тьма', price: 0, cssClass: '' }, { id: 'forest', name: 'Лес', price: 500, cssClass: 'theme-forest' }, { id: 'space', name: 'Космос', price: 2000, cssClass: 'theme-space' }, { id: 'neon', name: 'Неон', price: 5000, cssClass: 'theme-neon' }, { id: 'gold', name: 'Мажор', price: 10000, cssClass: 'theme-gold' } ],
    eggs: [ { id: 'default', name: 'Стандарт', price: 0, skinClass: '' }, { id: 'glow', name: 'Сияние', price: 1000, skinClass: 'skin-glow' }, { id: 'ice', name: 'Лед', price: 3000, skinClass: 'skin-ice' }, { id: 'glitch', name: 'Глюк', price: 7777, skinClass: 'skin-glitch' }, { id: 'gold', name: 'Золото', price: 15000, skinClass: 'skin-gold' } ],
    boosters: [ { id: 'luck', name: 'Зелье Удачи', price: 200, icon: '🍀', desc: 'Шанс x5' }, { id: 'speed', name: 'Ускоритель', price: 500, icon: '⏳', desc: 'Время / 2' } ]
};
const botLink = "https://t.me/FocusHatcher_Ondey_bot/game";

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ ===
let collection = [];
let userXP = 0;
let userLevel = 1;
let walletBalance = 0;
let ownedItems = { themes: ['default'], eggs: ['default'] };
let activeTheme = 'default';
let activeEggSkin = 'default';
let userStats = { hatched: 0, earned: 0, invites: 0 };
let myBoosters = { luck: 0, speed: 0 };
let claimedAchievements = [];
let claimedQuests = [];
let isVibrationOn = true;

let currentModeIndex = 0;
let timerInterval = null;
let isRunning = false;
let timeLeft = MODES[0].time;
let activeBoosters = { luck: false, speed: false };
let currentShopTab = 'themes';
let currentAchTab = 'achievements';
let selectedPet = null;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getEl(id) { return document.getElementById(id); }
function closeModal(id) { getEl(id).style.display = 'none'; }
function openShop() { getEl('shop-modal').style.display = 'flex'; switchShopTab('themes'); }
function openSettings() { getEl('settings-modal').style.display = 'flex'; }
function openAch() { getEl('achievements-modal').style.display = 'flex'; switchAchTab('achievements'); }
function showToast(msg, icon='🔔') {
    const c = getEl('toast-container');
    const d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = `<span style="font-size:18px">${icon}</span> <span>${msg}</span>`;
    c.appendChild(d);
    setTimeout(() => { d.classList.add('fade-out'); setTimeout(()=>d.remove(), 300); }, 3000);
}
function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}
function getPetRarity(p) {
    if(petDatabase.legendary.includes(p)) return 'legendary';
    if(petDatabase.rare.includes(p)) return 'rare';
    return 'common';
}
function hardReset() {
    if(confirm("Сбросить все сохранения? Это исправит зависания.")) {
        localStorage.clear();
        location.reload();
    }
}

// === ФУНКЦИЯ ЗАПУСКА ===
function initGame() {
    try {
        collection = JSON.parse(localStorage.getItem('myCollection')) || [];
        userXP = parseInt(localStorage.getItem('userXP')) || 0;
        userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
        walletBalance = parseInt(localStorage.getItem('walletBalance')) || 0;
        ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { themes: ['default'], eggs: ['default'] };
        activeTheme = localStorage.getItem('activeTheme') || 'default';
        activeEggSkin = localStorage.getItem('activeEggSkin') || 'default';
        
        let s = JSON.parse(localStorage.getItem('userStats'));
        if(s) userStats = s;
        
        let b = JSON.parse(localStorage.getItem('myBoosters'));
        if(b) myBoosters = b;
        
        claimedAchievements = JSON.parse(localStorage.getItem('claimedAchievements')) || [];
        claimedQuests = JSON.parse(localStorage.getItem('claimedQuests')) || [];
        isVibrationOn = localStorage.getItem('isVibrationOn') !== 'false';
    } catch(e) {
        console.error("Data load error", e);
    }

    updateLevelUI();
    renderCollection();
    applyTheme();
    updateUI();
    updateBalanceUI();
    
    if(getEl('vibration-toggle')) {
        getEl('vibration-toggle').checked = isVibrationOn;
        getEl('vibration-toggle').onchange = (e) => { isVibrationOn = e.target.checked; localStorage.setItem('isVibrationOn', isVibrationOn); };
    }
}

function updateBalanceUI() {
    getEl('total-money').textContent = `💰 $${walletBalance}`;
    getEl('unique-count').textContent = `Коллекция: ${new Set(collection).size} / ${TOTAL_PETS_COUNT}`;
    checkAchievements();
    renderBoostersPanel();
}

function checkAchievements() {
    let hasUnclaimed = false;
    let uniqueCount = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => {
        if(!claimedAchievements.includes(a.id)) {
            let done = false;
            if(a.type === 'money' && userStats.earned >= a.goal) done = true;
            else if(a.type === 'unique' && uniqueCount >= a.goal) done = true;
            else if(!a.type && userStats.hatched >= a.goal) done = true;
            if(done) hasUnclaimed = true;
        }
    });
    QUESTS_DATA.forEach(q => {
        if(!claimedQuests.includes(q.id)) {
            if(q.type === 'invite' && (userStats.invites||0) >= q.goal) hasUnclaimed = true;
        }
    });
    getEl('ach-badge').style.display = hasUnclaimed ? 'block' : 'none';
}

function renderBoostersPanel() {
    const p = getEl('boosters-panel');
    p.innerHTML = '';
    let l = myBoosters.luck || 0;
    let s = myBoosters.speed || 0;
    p.appendChild(createBoosterBtn('luck', '🍀', l, activeBoosters.luck));
    p.appendChild(createBoosterBtn('speed', '⏳', s, activeBoosters.speed));
}

function createBoosterBtn(type, icon, count, isActive) {
    const d = document.createElement('div');
    d.className = `booster-slot ${isActive ? 'active' : ''} ${count===0 ? 'empty' : ''}`;
    d.innerHTML = `${icon} <div class="booster-count">${count}</div>`;
    d.onclick = () => {
        if(count > 0 && !isRunning) {
            activeBoosters[type] = !activeBoosters[type];
            renderBoostersPanel();
            updateUI();
        }
    };
    return d;
}

function prevMode() { if(!isRunning) { currentModeIndex = currentModeIndex===0 ? 1 : 0; updateUI(); } }
function nextMode() { if(!isRunning) { currentModeIndex = currentModeIndex===0 ? 1 : 0; updateUI(); } }

function updateUI() {
    const m = MODES[currentModeIndex];
    let t = m.time;
    if(activeBoosters.speed) t = Math.floor(t / 2);
    if(!isRunning) {
        getEl('egg-display').textContent = m.egg;
        getEl('timer').textContent = formatTime(t);
        applyEggSkin();
    }
    getEl('mode-title').textContent = m.title;
    getEl('mode-subtitle').textContent = m.sub;
}

function toggleTimer() {
    if(isRunning) stopTimer(); else startTimer();
}

function startTimer() {
    const m = MODES[currentModeIndex];
    timeLeft = activeBoosters.speed ? Math.floor(m.time / 2) : m.time;
    isRunning = true;
    getEl('timer').textContent = formatTime(timeLeft);
    getEl('main-btn').textContent = "Сдаться";
    getEl('main-btn').className = "btn stop";
    getEl('share-btn').style.display = 'none';
    getEl('prev-btn').style.visibility = 'hidden';
    getEl('next-btn').style.visibility = 'hidden';
    
    // === ИСПРАВЛЕНИЕ ЗДЕСЬ ===
    // Перед началом тряски возвращаем эмодзи яйца!
    getEl('egg-display').textContent = m.egg;
    
    applyEggSkin();
    getEl('egg-display').classList.add('shaking');
    renderBoostersPanel();

    timerInterval = setInterval(() => {
        timeLeft--;
        getEl('timer').textContent = formatTime(timeLeft);
        if(timeLeft <= 0) finishTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval); isRunning = false;
    getEl('main-btn').textContent = "Начать фокус";
    getEl('main-btn').className = "btn";
    getEl('prev-btn').style.visibility = 'visible';
    getEl('next-btn').style.visibility = 'visible';
    getEl('egg-display').classList.remove('shaking');
    applyEggSkin();
    updateUI();
    renderBoostersPanel();
    showToast("Фокус прерван", "⚠️");
}

function finishTimer() {
    clearInterval(timerInterval); isRunning = false;
    getEl('main-btn').textContent = "Еще раз";
    getEl('main-btn').className = "btn";
    getEl('share-btn').style.display = 'block';
    getEl('prev-btn').style.visibility = 'visible';
    getEl('next-btn').style.visibility = 'visible';
    getEl('egg-display').className = 'egg';

    const m = MODES[currentModeIndex];
    
    userXP += m.xpReward;
    if(userXP >= userLevel * 200) { userXP -= userLevel * 200; userLevel++; showToast(`Lvl UP: ${userLevel}`, "🎉"); }
    localStorage.setItem('userXP', userXP);
    localStorage.setItem('userLevel', userLevel);
    updateLevelUI();

    userStats.hatched++;
    localStorage.setItem('userStats', JSON.stringify(userStats));

    let legChance = m.id === 'short' ? 1 : 5;
    let rareChance = m.id === 'short' ? 15 : 30;
    
    if(activeBoosters.luck) { legChance *= 5; myBoosters.luck--; activeBoosters.luck = false; }
    if(activeBoosters.speed) { myBoosters.speed--; activeBoosters.speed = false; }
    localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
    renderBoostersPanel();

    const rnd = Math.random() * 100;
    let pool;
    if(rnd < legChance) pool = petDatabase.legendary;
    else if(rnd < legChance + rareChance) pool = petDatabase.rare;
    else pool = petDatabase.common;

    const dropped = pool[Math.floor(Math.random() * pool.length)];
    collection.push(dropped);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    
    getEl('egg-display').textContent = dropped;
    showToast(`Получено: ${dropped}`, "🐣");
    
    renderCollection();
    updateBalanceUI();
    
    const colDiv = getEl('collection');
    if(colDiv.classList.contains('hidden')) {
        colDiv.classList.remove('hidden');
        getEl('inventory-arrow').textContent = "▲";
    }
    
    if(isVibrationOn && window.navigator.vibrate) window.navigator.vibrate(200);
}

function toggleInventory() {
    const c = getEl('collection');
    const a = getEl('inventory-arrow');
    if(c.classList.contains('hidden')) { c.classList.remove('hidden'); a.textContent="▲"; }
    else { c.classList.add('hidden'); a.textContent="▼"; }
}

function renderCollection() {
    const c = getEl('collection');
    c.innerHTML = '';
    ALL_PETS_FLAT.forEach(pet => {
        const count = collection.filter(p => p === pet).length;
        const rarity = getPetRarity(pet);
        const d = document.createElement('div');
        if(count > 0) {
            d.className = `pet-slot ${rarity}`;
            d.textContent = pet;
            if(count > 1) { const b = document.createElement('div'); b.className='slot-count'; b.textContent = `x${count}`; d.appendChild(b); }
            d.onclick = () => openPetModal(pet, true);
        } else {
            d.className = `pet-slot locked`;
            d.innerHTML = `<span class="pet-silhouette">${pet}</span>`;
            d.onclick = () => openPetModal(pet, false);
        }
        c.appendChild(d);
    });
}

function openPetModal(pet, owned) {
    selectedPet = pet;
    const r = getPetRarity(pet);
    const price = PRICES[r];
    const modal = getEl('pet-modal');
    const view = getEl('pet-detail-view');
    modal.style.display = 'flex';
    if(owned) {
        view.innerHTML = `<div class="pet-big-icon">${pet}</div><h3 class="pet-name">Питомец</h3><p class="pet-rarity ${r}">${r}</p><p class="pet-price">Цена: $${price}</p><button class="btn sell-action" onclick="sellPet()">Продать ($${price})</button>`;
    } else {
        view.innerHTML = `<div class="pet-big-icon" style="filter:brightness(0) opacity(0.3)">${pet}</div><h3 class="pet-name">???</h3><p class="pet-rarity ${r}">${r}</p><button class="btn" style="background:#333" onclick="closeModal('pet-modal')">Закрыть</button>`;
    }
}

function sellPet() {
    if(!selectedPet) return;
    const idx = collection.indexOf(selectedPet);
    if(idx === -1) return;
    const price = PRICES[getPetRarity(selectedPet)];
    walletBalance += price;
    userStats.earned += price;
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    collection.splice(idx, 1);
    localStorage.setItem('myCollection', JSON.stringify(collection));
    updateBalanceUI(); renderCollection(); closeModal('pet-modal'); showToast(`Продано +$${price}`, "💰");
}

function switchShopTab(tab) {
    currentShopTab = tab;
    document.querySelectorAll('#shop-modal .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderShop();
}

function renderShop() {
    const c = getEl('shop-items');
    c.innerHTML = '';
    SHOP_DATA[currentShopTab].forEach(item => {
        const d = document.createElement('div');
        d.className = 'shop-item';
        let btnHTML = '';
        if(currentShopTab === 'boosters') {
            btnHTML = `<button class="buy-btn" onclick="buyItem('${item.id}', ${item.price})">$${item.price}</button>`;
            d.innerHTML = `<div class="shop-item-icon">${item.icon}</div><div class="shop-item-name">${item.name}</div><div style="font-size:10px;color:#888">${item.desc}</div>${btnHTML}`;
        } else {
            const owned = ownedItems[currentShopTab].includes(item.id);
            const active = (currentShopTab==='themes' && activeTheme===item.id) || (currentShopTab==='eggs' && activeEggSkin===item.id);
            let cls = owned ? "buy-btn owned" : "buy-btn";
            if(!owned && walletBalance < item.price) cls += " locked";
            let txt = owned ? (active?"Выбрано":"Выбрать") : `$${item.price}`;
            btnHTML = `<button class="${cls}" onclick="buyItem('${item.id}', ${item.price})">${txt}</button>`;
            d.innerHTML = `<div class="shop-item-icon">${currentShopTab==='themes'?'🎨':'🥚'}</div><div class="shop-item-name">${item.name}</div>${btnHTML}`;
        }
        c.appendChild(d);
    });
}

function buyItem(id, price) {
    if(currentShopTab === 'boosters') {
        if(walletBalance >= price) {
            walletBalance -= price;
            if(!myBoosters[id]) myBoosters[id] = 0;
            myBoosters[id]++;
            saveData(); updateBalanceUI(); showToast("Куплено!", "🧪");
        } else showToast("Мало денег", "🚫");
        return;
    }
    const owned = ownedItems[currentShopTab].includes(id);
    if(owned) {
        if(currentShopTab === 'themes') { activeTheme = id; applyTheme(); }
        else { activeEggSkin = id; applyEggSkin(); }
        saveData(); renderShop();
    } else {
        if(walletBalance >= price) {
            walletBalance -= price;
            ownedItems[currentShopTab].push(id);
            if(currentShopTab === 'themes') { activeTheme = id; applyTheme(); }
            else { activeEggSkin = id; applyEggSkin(); }
            saveData(); updateBalanceUI(); renderShop(); showToast("Куплено!", "🛍️");
        } else showToast("Мало денег", "🚫");
    }
}

function switchAchTab(tab) {
    currentAchTab = tab;
    document.querySelectorAll('#achievements-modal .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if(tab === 'achievements') renderAch(); else renderQuests();
}

function renderAch() {
    const c = getEl('achievements-list'); c.innerHTML = '';
    let u = new Set(collection).size;
    ACHIEVEMENTS_DATA.forEach(a => {
        const claimed = claimedAchievements.includes(a.id);
        let done = false;
        if(a.type === 'money' && userStats.earned >= a.goal) done = true;
        else if(a.type === 'unique' && u >= a.goal) done = true;
        else if(!a.type && userStats.hatched >= a.goal) done = true;
        
        const d = document.createElement('div');
        d.className = `achievement-card ${done ? 'unlocked' : ''}`;
        let btn = '';
        if(done && !claimed) btn = `<button class="buy-btn" onclick="claimAch('${a.id}', ${a.reward})">Забрать $${a.reward}</button>`;
        else if(claimed) btn = "✅";
        else btn = `<span style="font-size:12px;color:#888">Цель: ${a.goal}</span>`;
        d.innerHTML = `<div class="ach-icon">${done?'🏆':'🔒'}</div><div class="ach-info"><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function renderQuests() {
    const c = getEl('achievements-list'); c.innerHTML = '';
    QUESTS_DATA.forEach(q => {
        const claimed = claimedQuests.includes(q.id);
        const d = document.createElement('div');
        d.className = `achievement-card ${claimed ? 'unlocked' : ''}`;
        let btn = '';
        if(claimed) btn = "✅";
        else if(q.type === 'link') btn = `<button id="qbtn-${q.id}" class="buy-btn" style="background:#007aff" onclick="clickLink('${q.id}', '${q.url}', ${q.reward})">Выполнить</button>`;
        else if(q.type === 'invite') {
            if((userStats.invites||0) >= q.goal) btn = `<button class="buy-btn" onclick="claimQuest('${q.id}', ${q.reward})">Забрать $${q.reward}</button>`;
            else btn = `<span style="font-size:12px;color:#888">${userStats.invites||0}/${q.goal}</span>`;
        }
        d.innerHTML = `<div class="ach-icon">📜</div><div class="ach-info"><div class="ach-title">${q.title}</div><div class="ach-desc">${q.desc}</div></div><div>${btn}</div>`;
        c.appendChild(d);
    });
}

function clickLink(id, url, reward) {
    if(window.Telegram.WebApp) window.Telegram.WebApp.openLink(url); else window.open(url, '_blank');
    const b = getEl(`qbtn-${id}`);
    if(b) { b.textContent = "Проверяю..."; b.disabled = true; b.style.background = "#555"; setTimeout(() => claimQuest(id, reward), 4000); }
}

function claimAch(id, reward) {
    if(claimedAchievements.includes(id)) return;
    claimedAchievements.push(id); walletBalance += reward;
    saveData(); updateBalanceUI(); renderAch(); showToast(`Награда +$${reward}`);
}

function claimQuest(id, reward) {
    if(claimedQuests.includes(id)) return;
    claimedQuests.push(id); walletBalance += reward;
    saveData(); updateBalanceUI(); renderQuests(); showToast(`Награда +$${reward}`);
}

function handleShare() {
    if(!userStats.invites) userStats.invites = 0; 
    userStats.invites++; 
    saveData(); checkAchievements();
    const text = `У меня ${new Set(collection).size} петов в Focus Hatcher!`;
    const url = `https://t.me/share/url?url=${botLink}&text=${encodeURIComponent(text)}`;
    if (window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url); else window.open(url, '_blank');
}

function saveData() {
    localStorage.setItem('walletBalance', walletBalance);
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    localStorage.setItem('activeTheme', activeTheme);
    localStorage.setItem('activeEggSkin', activeEggSkin);
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('myBoosters', JSON.stringify(myBoosters));
    localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    localStorage.setItem('claimedQuests', JSON.stringify(claimedQuests));
}

function applyTheme() { const t = SHOP_DATA.themes.find(x => x.id === activeTheme); document.body.className = t ? t.cssClass : ''; }

function applyEggSkin() { 
    const s = SHOP_DATA.eggs.find(x => x.id === activeEggSkin); 
    const egg = getEl('egg-display');
    egg.className = 'egg'; 
    if(MODES[currentModeIndex].style === 'hardcore') egg.classList.add('diamond-egg'); 
    else if(s && s.skinClass && activeEggSkin !== 'default') egg.classList.add(s.skinClass); 
    if(isRunning) egg.classList.add('shaking'); 
}

function updateLevelUI() {
    const max = userLevel * 200; 
    let p = (userXP / max) * 100;
    if(p > 100) p = 100;
    getEl('xp-bar').style.width = `${p}%`;
    getEl('level-number').textContent = `Lvl ${userLevel}`;
    let r = Math.floor(userLevel / 5);
    getEl('rank-name').textContent = RANKS[Math.min(r, RANKS.length-1)];
}

// ЗАПУСК ПОСЛЕ ЗАГРУЗКИ (ВАЖНО!)
window.onload = initGame;