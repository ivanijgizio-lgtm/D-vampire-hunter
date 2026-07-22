// ================= ЗАГРУЗКА АССЕТОВ (Добавлены новые иконки) =================
const sprites = {
    player: new Image(), ai: new Image(), 
    highVampire: new Image(), inquisitor: new Image()
};
sprites.player.src = './assets/vampir.webp';
sprites.ai.src = './assets/knight.gif';
sprites.highVampire.src = './assets/high_vampire.png'; // Добавьте картинку в assets
sprites.inquisitor.src = './assets/inquisitor.png';    // Добавьте картинку в assets

// ================= ДАННЫЕ ИГРЫ =================
let game = {
    turn: 1, day: 1, gameOver: false, battleActive: false,
    selectedProvinceId: null, fogOfWar: true,
    player: {
        ap: 2, maxAp: 2, gold: 100, blood: 10,
        // Мобильная армия (атака)
        mobileArmy: { troops: 100, highVampires: 5, location: 4 }
    },
    ai: {
        gold: 100, blood: 5,
        // Мобильная армия ИИ (атака)
        mobileArmy: { troops: 100, inquisitors: 5, location: 1 },
        faith: 0
    },
    provinces: [
        // Добавлены поля: playerGarrison, aiGarrison, population, playerSupport, aiSupport
        { id: 1, name: 'Ватикан', owner: 'ai', x: 300, y: 150, aiGarrison: 30, siegeBy: null, neighbors: [2, 9], buildings: ['church'], income: 2, loyalty: 100, population: 5000, playerSupport: 10, aiSupport: 90 },
        { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, aiGarrison: 15, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2, loyalty: 80, population: 3000, playerSupport: 20, aiSupport: 80 },
        { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, aiGarrison: 20, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: ['church'], income: 3, loyalty: 80, population: 4000, playerSupport: 15, aiSupport: 85 },
        { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, playerGarrison: 30, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: ['dark_temple'], income: 3, loyalty: 100, population: 4500, playerSupport: 90, aiSupport: 10 },
        { id: 5, name: 'Валахия', owner: 'ai', x: 590, y: 320, aiGarrison: 15, siegeBy: null, neighbors: [3, 4, 6, 7, 11], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 40, aiSupport: 60 },
        { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, aiGarrison: 10, siegeBy: null, neighbors: [3, 5, 7, 12], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 30, aiSupport: 70 },
        { id: 7, name: 'Одесса', owner: 'ai', x: 680, y: 350, aiGarrison: 10, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, loyalty: 60, population: 1500, playerSupport: 50, aiSupport: 50 },
        { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, aiGarrison: 10, siegeBy: null, neighbors: [3, 4, 9, 14], buildings: ['church'], income: 2, loyalty: 70, population: 2500, playerSupport: 25, aiSupport: 75 },
        { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, aiGarrison: 10, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, loyalty: 60, population: 2000, playerSupport: 30, aiSupport: 70 },
        { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, aiGarrison: 10, siegeBy: null, neighbors: [4, 11], buildings: [], income: 1, loyalty: 50, population: 1000, playerSupport: 50, aiSupport: 50 },
        { id: 11, name: 'Болгария', owner: 'ai', x: 590, y: 430, aiGarrison: 15, siegeBy: null, neighbors: [5, 10, 13, 15], buildings: [], income: 1, loyalty: 50, population: 1500, playerSupport: 45, aiSupport: 55 },
        { id: 12, name: 'Киевская Русь', owner: 'ai', x: 740, y: 200, aiGarrison: 10, siegeBy: null, neighbors: [6, 7, 13], buildings: [], income: 1, loyalty: 60, population: 1800, playerSupport: 20, aiSupport: 80 },
        { id: 13, name: 'Крым', owner: 'ai', x: 720, y: 450, aiGarrison: 10, siegeBy: null, neighbors: [7, 11, 12], buildings: [], income: 1, loyalty: 60, population: 1200, playerSupport: 35, aiSupport: 65 },
        { id: 14, name: 'Польша', owner: 'ai', x: 360, y: 100, aiGarrison: 15, siegeBy: null, neighbors: [8, 9], buildings: ['church'], income: 2, loyalty: 70, population: 2500, playerSupport: 15, aiSupport: 85 },
        { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, aiGarrison: 20, siegeBy: null, neighbors: [11], buildings: ['church', 'fortress'], income: 5, loyalty: 80, population: 6000, playerSupport: 10, aiSupport: 90 }
    ]
};

// ================= ЛОГИКА ИГРЫ =================
function log(msg, type = 'system') {
    const container = document.getElementById('log-container');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = msg;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
}

function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let goldBonus = 1, bloodBonus = 1;
            if (prov.buildings.includes('feast_hall')) bloodBonus += 3;
            if (prov.buildings.includes('dark_temple')) goldBonus += 2;
            if (prov.buildings.includes('dungeon')) goldBonus += 2; 
            if (prov.buildings.includes('castle')) goldBonus += 3; // Замок приносит золото

            game.player.gold += prov.income + goldBonus;
            game.player.blood += (prov.playerGarrison || 0) + bloodBonus;
        } else if (prov.owner === 'ai') {
            let aiGoldBonus = 1;
            if (prov.buildings.includes('church')) aiGoldBonus += 2;
            if (prov.buildings.includes('fortress')) aiGoldBonus += 3;
            game.ai.gold += prov.income + aiGoldBonus;
            game.ai.faith += 1;
        }
    });
    updateUI();
}

// Лояльность и бунты
function updateLoyalty() {
    game.provinces.forEach(prov => {
        if (prov.owner !== null) {
            let change = -1;
            if (prov.owner === 'player') {
                if (prov.buildings.includes('dark_temple')) change += 3;
                if (prov.buildings.includes('feast_hall')) change += 4;
                if (prov.buildings.includes('dungeon')) change += 1;
                if (prov.buildings.includes('castle')) change += 2;
            } else {
                if (prov.buildings.includes('church')) change += 3;
                if (prov.buildings.includes('fortress')) change += 4;
            }
            prov.loyalty = Math.min(100, Math.max(0, prov.loyalty + change));
            if (prov.loyalty < 20 && Math.random() < 0.3) {
                prov.owner = null;
                prov.playerGarrison = 0; prov.aiGarrison = 0;
                log(`💥 Бунт в провинции ${prov.name}! Она стала нейтральной.`, 'system');
            }
        }
    });
}

// ================= СИСТЕМА БИТВЫ И ЗАХВАТА =================
function showBattleModal(attackerSide, targetProv) {
    if (game.battleActive) return;
    game.battleActive = true;

    const modal = document.getElementById('battle-modal');
    const aName = document.getElementById('attacker-name');
    const dName = document.getElementById('defender-name');
    const aStats = document.getElementById('attacker-stats');
    const dStats = document.getElementById('defender-stats');
    const resultDiv = document.getElementById('battle-result');
    const btnResolve = document.getElementById('battle-resolve-btn');
    const btnClose = document.getElementById('battle-close-btn');

    let attTroops, attElites, defTroops, defGarrison;
    let attIsPlayer = (attackerSide === 'player');

    if (attIsPlayer) {
        attTroops = game.player.mobileArmy.troops; attElites = game.player.mobileArmy.highVampires;
        // Проверка на необходимость элиты для захвата!
        if (attElites < 1) {
            log('❌ У вас нет Верховных Вампиров! Невозможно командовать осадой и захватить провинцию.', 'player');
            game.battleActive = false; modal.style.display = "none"; return;
        }
    } else {
        attTroops = game.ai.mobileArmy.troops; attElites = game.ai.mobileArmy.inquisitors;
        if (attElites < 1) {
            log('❌ У Ватикана нет Инквизиторов, они не могут захватить провинцию.', 'ai');
            game.battleActive = false; modal.style.display = "none"; return;
        }
    }

    // Защитники (Сумма гарнизона + мобильной армии, если она стоит в этой провинции)
    defGarrison = targetProv.owner === 'player' ? targetProv.playerGarrison || 0 : targetProv.aiGarrison || 0;
    if (targetProv.owner === 'player' && game.player.mobileArmy.location === targetProv.id) defGarrison += game.player.mobileArmy.troops;
    if (targetProv.owner === 'ai' && game.ai.mobileArmy.location === targetProv.id) defGarrison += game.ai.mobileArmy.troops;
    defTroops = defGarrison;

    aName.textContent = attIsPlayer ? "🧛 Армия Тьмы" : "⛪ Ватикан";
    dName.textContent = `${targetProv.name} (Защитники)`;
    aStats.textContent = `Войск: ${attTroops} | Элит: ${attElites}`;
    dStats.textContent = `Гарнизон: ${defTroops}`;
    resultDiv.textContent = "";
    btnResolve.style.display = "inline-block";
    btnClose.style.display = "none";
    modal.style.display = "flex";

    btnResolve.onclick = function() {
        // 1. Боевой расчет
        let attackPower = attTroops + (attElites * 20);
        let defensePower = defTroops;

        let attLosses = Math.floor(defensePower / 3) + Math.floor(Math.random() * 5);
        let defLosses = Math.floor(attackPower / 4) + Math.floor(Math.random() * 5);

        attTroops = Math.max(1, attTroops - attLosses);
        defTroops = Math.max(1, defTroops - defLosses);

        if (attIsPlayer) {
            game.player.mobileArmy.troops = attTroops;
        } else {
            game.ai.mobileArmy.troops = attTroops;
        }

        // 2. Проверка на Захват (с учетом лояльности, популяции и сторонников)
        let captureChance = 0.3; // База 30%
        if (targetProv.loyalty < 30) captureChance = 0.9; // Если лояльность низкая - 90%
        else if (targetProv.loyalty < 60) captureChance = 0.6; // Средняя - 60%
        
        // Корректировка на поддержку
        let supportMod = 0;
        if (attIsPlayer) supportMod = targetProv.playerSupport / 100;
        else supportMod = targetProv.aiSupport / 100;
        captureChance += (supportMod * 0.3);
        captureChance = Math.min(0.95, Math.max(0.1, captureChance));

        let captured = false;
        let msg = "";

        if (defTroops <= 1) {
            captured = true;
            msg = `🏆 Победа! Потери: ${attLosses}. Вражеский гарнизон уничтожен.`;
        } else {
            if (Math.random() < captureChance) {
                captured = true;
                msg = `🏆 Захват! Лояльность провинции позволила сломить сопротивление. Потери: ${attLosses}.`;
            } else {
                captured = false;
                msg = `⛔ Осада продолжается! Жители не поддерживают вас. Атака отбита (потери ${attLosses}).`;
            }
        }

        if (captured) {
            // Смена владельца
            let newOwner = attIsPlayer ? 'player' : 'ai';
            targetProv.owner = newOwner;
            targetProv.loyalty = 50; // После захвата лояльность падает
            targetProv.siegeBy = null;
            targetProv.playerGarrison = 0;
            targetProv.aiGarrison = 0;
            // Забираем часть армии в гарнизон, обновляем позицию армии
            let transfer = Math.floor(attTroops / 2) + 1;
            if (attIsPlayer) {
                targetProv.playerGarrison = transfer;
                game.player.mobileArmy.troops = Math.floor(attTroops / 2);
                game.player.mobileArmy.location = targetProv.id;
                log(`🏰 ${targetProv.name} захвачена вами!`, 'player');
            } else {
                targetProv.aiGarrison = transfer;
                game.ai.mobileArmy.troops = Math.floor(attTroops / 2);
                game.ai.mobileArmy.location = targetProv.id;
                log(`🏰 ${targetProv.name} захвачена Ватиканом!`, 'ai');
            }
        } else {
            // Оборона устояла
            let defOwner = targetProv.owner;
            if (defOwner === 'player') targetProv.playerGarrison = Math.max(1, defTroops);
            else targetProv.aiGarrison = Math.max(1, defTroops);
            // Потеря атакующими элиты (1 элитник погибает при неудаче)
            if (attIsPlayer && game.player.mobileArmy.highVampires > 0) game.player.mobileArmy.highVampires -= 1;
            else if (!attIsPlayer && game.ai.mobileArmy.inquisitors > 0) game.ai.mobileArmy.inquisitors -= 1;
        }

        aStats.textContent = `Войск: ${attTroops} | Элит: ${attElites}`;
        dStats.textContent = `Гарнизон: ${defTroops}`;
        resultDiv.textContent = msg;
        
        btnResolve.style.display = "none";
        btnClose.style.display = "inline-block";

        btnClose.onclick = function() {
            modal.style.display = "none";
            game.battleActive = false;
            checkGameConditions();
            updateUI();
        };
    };
}

// ================= СТРОИТЕЛЬСТВО =================
function buildStructure(type) {
    if (!canAct() || game.gameOver) return;
    const currentProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!currentProv || currentProv.owner !== 'player') return log('❌ Стройте только в своей провинции, где стоит армия.', 'system');

    let cost = 0, name = "";
    if (type === 'dark_temple') { cost = 25; name = 'Храм Тьмы'; } 
    else if (type === 'grave_factory') { cost = 30; name = 'Фабрика гробов'; }
    else if (type === 'feast_hall') { cost = 20; name = 'Пиршественный зал'; }
    else if (type === 'dungeon') { cost = 15; name = 'Тюрьма'; }
    else if (type === 'castle') { cost = 40; name = 'Замок'; }

    if (game.player.gold < cost) return log(`❌ Недостаточно золота. Нужно ${cost}.`, 'system');
    if (currentProv.buildings.includes(type)) return log(`❌ Здесь уже есть ${name}.`, 'system');

    game.player.gold -= cost;
    currentProv.buildings.push(type);
    
    if (type === 'grave_factory') {
        game.player.mobileArmy.highVampires += 2; 
        log(`⚰️ Построена Фабрика гробов! +2 Верховных Вампира.`, 'player');
    } else if (type === 'castle') {
        currentProv.playerGarrison = (currentProv.playerGarrison || 0) + 20;
        currentProv.loyalty += 5;
        log(`🏰 Возведен Замок! Гарнизон +20, лояльность +5.`, 'player');
    } else if (type === 'dark_temple') {
        log(`🕯️ Возведен Храм Тьмы.`, 'player');
    } else if (type === 'feast_hall') {
        log(`🍷 Пиршественный зал готов.`, 'player');
    } else if (type === 'dungeon') {
        log(`⛓️ Тюрьма построена.`, 'player');
    }
    game.player.ap -= 1;
    updateUI();
}

// ================= УПРАВЛЕНИЕ АРМИЕЙ =================
function recruitTroops() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!currentProv || currentProv.owner !== 'player') return log('❌ Армия должна стоять в своей провинции.', 'system');
    if (game.player.gold < 10) return log('❌ Не хватает золота! 10 золота за призыв.', 'system');
    
    game.player.gold -= 10;
    game.player.mobileArmy.troops += 10;
    log(`🧟 Призвано +10 воинов в армию. Текущая численность: ${game.player.mobileArmy.troops}`, 'player');
    game.player.ap -= 1;
    updateUI();
}

// Перемещение между мобильной армией и гарнизоном
function moveTroopsFromMobileToGarrison() {
    if (!canAct() || game.gameOver) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Гарнизон пополняется только в своих провинциях.', 'system');
    if (game.player.mobileArmy.troops < 10) return log('❌ В мобильной армии слишком мало бойцов. Нужно минимум 10.', 'system');
    
    game.player.mobileArmy.troops -= 10;
    if (!prov.playerGarrison) prov.playerGarrison = 0;
    prov.playerGarrison += 10;
    log(`⬆️ 10 бойцов оставлены в гарнизоне ${prov.name}.`, 'player');
    game.player.ap -= 1;
    updateUI();
}

function moveTroopsFromGarrisonToMobile() {
    if (!canAct() || game.gameOver) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Вы можете призвать гарнизон только находясь в своей провинции.', 'system');
    if (!prov.playerGarrison || prov.playerGarrison < 10) return log('❌ В гарнизоне недостаточно бойцов (нужно минимум 10).', 'system');
    
    prov.playerGarrison -= 10;
    game.player.mobileArmy.troops += 10;
    log(`⬇️ 10 бойцов призваны из гарнизона ${prov.name} в мобильную армию.`, 'player');
    game.player.ap -= 1;
    updateUI();
}

function cancelSiegeMTW() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!currentProv || currentProv.siegeBy !== 'player') return log('❌ Армия не осаждает эту провинцию.', 'system');
    currentProv.siegeBy = null;
    const playerProvs = game.provinces.filter(p => p.owner === 'player');
    if (playerProvs.length === 0) return gameOver('ai');
    game.player.mobileArmy.location = playerProvs[0].id;
    log(`🚩 Осада снята, отступление в ${playerProvs[0].name}.`, 'player');
    game.player.ap -= 1;
    updateUI();
}

// ================= ДЕЙСТВИЯ ИИ =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    
    const aiArmyProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    if (game.ai.gold >= 10 && aiArmyProv && aiArmyProv.owner === 'ai' && !aiArmyProv.buildings.includes('church')) {
        aiArmyProv.buildings.push('church');
        game.ai.gold -= 10;
        game.ai.mobileArmy.inquisitors += 2;
        log('⛪ Ватикан построил Церковь и нанял +2 Инквизитора.', 'ai');
    }

    if (game.ai.gold >= 5) {
        let count = Math.floor(game.ai.gold / 5);
        game.ai.gold -= count * 5;
        game.ai.mobileArmy.troops += count * 5;
    }

    if (aiArmyProv) {
        const targets = game.provinces.filter(p => aiArmyProv.neighbors.includes(p.id) && p.owner === 'player');
        if (targets.length > 0) {
            const target = targets[0]; 
            if (target.siegeBy === null) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан начал осаду ${target.name}!`, 'ai');
            } else {
                log(`⚔️ Штурм Ватикана против ${target.name}`, 'ai');
                // Для ИИ используем упрощенный расчет, чтобы не открывать модалку игроку в его ход
                let atkTroops = game.ai.mobileArmy.troops;
                let defTroops = target.playerGarrison || 1;
                let atkElites = game.ai.mobileArmy.inquisitors;

                if (atkElites >= 1) {
                    let losses = Math.floor(defTroops / 3);
                    game.ai.mobileArmy.troops = Math.max(1, atkTroops - losses);
                    target.playerGarrison = Math.max(1, defTroops - Math.floor(atkTroops / 3));

                    let capChance = target.loyalty < 40 ? 0.8 : 0.3;
                    if (Math.random() < capChance && target.playerGarrison <= 1) {
                        target.owner = 'ai';
                        target.aiGarrison = Math.floor(game.ai.mobileArmy.troops / 2) + 1;
                        game.ai.mobileArmy.location = target.id;
                        target.siegeBy = null;
                        game.ai.mobileArmy.troops = Math.floor(game.ai.mobileArmy.troops / 2);
                        log(`🏰 Ватикан захватил ${target.name}!`, 'ai');
                    }
                }
            }
        } else {
            const frontierTarget = game.provinces.find(p => p.owner === 'player' && p.neighbors.some(id => game.provinces.find(prov => prov.id === id && prov.owner === 'ai')));
            if (frontierTarget) {
                const moveToId = frontierTarget.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === 'ai'));
                if (moveToId) {
                    game.ai.mobileArmy.location = moveToId;
                    log(`🚩 Армия Ватикана выдвинулась к ${frontierTarget.name}`, 'ai');
                }
            }
        }
    }
    checkGameConditions();
    updateUI();
}

// ================= КОНЕЦ ХОДА =================
function endPlayerTurn() {
    if (game.gameOver) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai');
    if (game.battleActive) return log('Сначала завершите битву!', 'system');
    
    const pArmyProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (pArmyProv && pArmyProv.owner === 'player' && pArmyProv.siegeBy === 'ai') {
        pArmyProv.siegeBy = null;
        log('🚩 Осада Ватикана снята, враг отступил.', 'player');
    }

    collectIncome();
    updateLoyalty();
    game.player.ap = game.player.maxAp;
    game.turn++;
    if (game.turn % 2 === 1) game.day++;

    log(`⏩ НАЧАЛО ХОДА: ${game.turn} | ДЕНЬ: ${game.day}`, 'system');
    updateUI();
    aiTurn();
}

function checkGameConditions() {
    const pCount = game.provinces.filter(p => p.owner === 'player').length;
    const aiCount = game.provinces.filter(p => p.owner === 'ai').length;
    if (pCount === 0) gameOver('ai');
    else if (aiCount === 0) gameOver('player');
}

function gameOver(winner) {
    if (game.gameOver) return;
    game.gameOver = true;
    const msg = winner === 'player' ? '🏆 ВСЯ ЕВРОПА ПРИНАДЛЕЖИТ ТЬМЕ!' : '💀 ТРАНСИЛЬВАНИЯ ПАЛА! Инквизиция победила.';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true);
    document.getElementById('bg-layer').style.opacity = '0.8';
    updateUI();
}

function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive; }

// ================= ОТРИСОВКА КАРТЫ =================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const playerVisibleProvIds = [];
    game.provinces.forEach(p => {
        if (p.owner === 'player') {
            playerVisibleProvIds.push(p.id);
            p.neighbors.forEach(id => playerVisibleProvIds.push(id));
        }
    });

    game.provinces.forEach(prov => {
        const isVisible = !game.fogOfWar || playerVisibleProvIds.includes(prov.id) || prov.owner === 'player';
        ctx.beginPath(); const hSize = 45;
        for (let i = 0; i < 6; i++) {
            let angle = Math.PI / 3 * i - Math.PI / 6;
            let x = prov.x + hSize * Math.cos(angle);
            let y = prov.y + hSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        if (game.fogOfWar && !isVisible) {
            ctx.fillStyle = '#080302'; ctx.strokeStyle = '#080302';
            ctx.fill(); ctx.stroke(); return;
        }

        if (prov.owner === 'player') { ctx.fillStyle = '#5a1616'; ctx.strokeStyle = '#d4af37'; }
        else if (prov.owner === 'ai') { ctx.fillStyle = '#2d2d2d'; ctx.strokeStyle = '#c9a84c'; }
        else { ctx.fillStyle = '#1a100c'; ctx.strokeStyle = '#3a2a25'; }
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'center';
        ctx.fillText(prov.name, prov.x, prov.y - 20);
        ctx.fillStyle = '#aaa'; ctx.font = '9px Cinzel';
        let stats = `Лояль:${Math.round(prov.loyalty)}`;
        ctx.fillText(stats, prov.x, prov.y);

        // Отрисовка Гарнизона (Статичная армия)
        let garrisonTroops = prov.owner === 'player' ? (prov.playerGarrison || 0) : (prov.aiGarrison || 0);
        if (garrisonTroops > 0) {
            ctx.font = '9px Cinzel';
            ctx.fillStyle = '#aaa';
            ctx.fillText(`🛡️ Гарн: ${garrisonTroops}`, prov.x, prov.y + 15);
        }

        if (prov.siegeBy === 'player') {
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        } else if (prov.siegeBy === 'ai') {
            ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        }
    });

    // Отрисовка Мобильной армии (Динамичная иконка)
    const playerProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const aiProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    
    if (playerProv) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) {
            ctx.drawImage(sprites.player, playerProv.x - 20, playerProv.y - 45, 40, 60);
        } else {
            ctx.fillStyle = '#5c0000'; ctx.beginPath(); ctx.arc(playerProv.x, playerProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'white'; ctx.font = 'bold 10px Cinzel'; 
        ctx.fillText(`🧛 ${game.player.mobileArmy.troops}`, playerProv.x, playerProv.y - 48);
        ctx.fillText(`Элит:${game.player.mobileArmy.highVampires}`, playerProv.x, playerProv.y - 58);
    }

    if (aiProv) {
        if (sprites.ai.complete && sprites.ai.naturalWidth > 0) {
            ctx.drawImage(sprites.ai, aiProv.x - 20, aiProv.y - 45, 40, 60);
        } else {
            ctx.fillStyle = '#c9a84c'; ctx.beginPath(); ctx.arc(aiProv.x, aiProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#e3dac9'; ctx.font = 'bold 10px Cinzel';
        ctx.fillText(`⛪ ${game.ai.mobileArmy.troops}`, aiProv.x, aiProv.y - 48);
        ctx.fillText(`Инкв:${game.ai.mobileArmy.inquisitors}`, aiProv.x, aiProv.y - 58);
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.mobileArmy.highVampires;
    document.getElementById('faith-counter').textContent = game.ai.faith;
    drawMap();
}

// ================= ОБРАБОТЧИКИ =================
document.getElementById('btn-recruit').addEventListener('click', recruitTroops);
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiegeMTW);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);
document.getElementById('btn-garrison-add').addEventListener('click', moveTroopsFromMobileToGarrison);
document.getElementById('btn-garrison-take').addEventListener('click', moveTroopsFromGarrisonToMobile);

document.getElementById('build-grave').addEventListener('click', () => buildStructure('grave_factory'));
document.getElementById('build-feast').addEventListener('click', () => buildStructure('feast_hall'));
document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));
document.getElementById('build-dungeon').addEventListener('click', () => buildStructure('dungeon'));
document.getElementById('build-castle').addEventListener('click', () => buildStructure('castle'));

// ШТУРМ (Исправлено: теперь активируется по кнопке и вызывает модалку)
document.getElementById('btn-assault').addEventListener('click', () => {
    if (game.gameOver || game.battleActive) return;
    const currentProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!currentProv || currentProv.siegeBy !== 'player') {
        return log('❌ Ваша армия не осаждает эту провинцию.', 'system');
    }
    // Запускаем битву
    showBattleModal('player', currentProv);
    // Не тратим AP на ШТУРМ, он тратится при движении
    updateUI();
});

// Обработка клика по карте
canvas.addEventListener('click', (e) => {
    if (game.gameOver || game.battleActive) return;
    const rect = canvas.getBoundingClientRect(); 
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    for (let prov of game.provinces) {
        const dx = x - prov.x; const dy = y - prov.y;
        if (dx*dx + dy*dy < 2500) { handleProvinceClick(prov); break; }
    }
});

function handleProvinceClick(prov) {
    const isEnemy = prov.owner === 'ai';
    // Если вражеская провинция и армия рядом, двигаем армию
    if (isEnemy && game.player.ap > 0 && game.player.mobileArmy.troops > 0) {
        const currProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
        if (!currProv.neighbors.includes(prov.id)) return log('❌ Слишком далеко!', 'system');

        game.player.mobileArmy.location = prov.id;
        game.player.ap -= 1;
        log(`🏰 Армия Тьмы выдвинулась в ${prov.name}.`, 'player');
        
        if (prov.aiGarrison > 0 || prov.playerGarrison > 0) {
            prov.siegeBy = 'player';
            log(`🏰 Начата осада ${prov.name}! Нажмите "ШТУРМ" для битвы.`, 'player');
        } else {
            // Если гарнизона нет, то сразу без боя захватываем
            prov.owner = 'player';
            prov.siegeBy = null;
            prov.aiGarrison = 0;
            prov.playerGarrison = 10;
            log(`🏰 Пустая провинция ${prov.name} захвачена!`, 'player');
        }
        updateUI();
    } else if (prov.owner === 'player') {
        log(`📌 Выбрана ${prov.name}. Гарнизон: ${prov.playerGarrison || 0}`, 'system');
        game.selectedProvinceId = prov.id; 
        updateUI();
    }
}

// ЗАПУСК
function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
gameLoop();
log('🌙 Трансильвания ждет! У вас 100 воинов и 5 Верховных вампиров. Ватикан наступает.', 'system');
collectIncome();
updateUI();
