// ================= ЗАГРУЗКА АССЕТОВ =================
const sprites = {
    player: new Image(), ai: new Image(),
    highVampire: new Image(), inquisitor: new Image()
};
sprites.player.src = './assets/vampir.webp';
sprites.ai.src = './assets/knight.gif';
sprites.highVampire.src = './assets/high_vampire.png.png'; 
sprites.inquisitor.src = './assets/inquisitor.png.png';

// ================= ДАННЫЕ ИГРЫ =================
function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false, 
        fogOfWar: true, pendingActionProvId: null,
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10,
            generals: { highVampire: 5 },
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 4 }
        },
        ai: {
            gold: 100, blood: 5,
            generals: { inquisitor: 5 },
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 1 },
            faith: 0
        },
        provinces: [
            { id: 1, name: 'Ватикан', owner: 'ai', x: 300, y: 150, aiGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 9], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 100, population: 5000, playerSupport: 10, aiSupport: 90, slaveIncome: 0 },
            { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2, loyalty: 80, population: 3000, playerSupport: 20, aiSupport: 80, slaveIncome: 0 },
            { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, aiGarrison: { infantry: 15, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: [{type:'church', lvl:1}], income: 3, loyalty: 80, population: 4000, playerSupport: 15, aiSupport: 85, slaveIncome: 0 },
            { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, playerGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: [{type:'dark_temple', lvl:1}], income: 3, loyalty: 100, population: 4500, playerSupport: 90, aiSupport: 10, slaveIncome: 0 },
            { id: 5, name: 'Валахия', owner: 'ai', x: 590, y: 320, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 6, 7, 11], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 40, aiSupport: 60, slaveIncome: 0 },
            { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [3, 5, 7, 12], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 30, aiSupport: 70, slaveIncome: 0 },
            { id: 7, name: 'Одесса', owner: 'ai', x: 680, y: 350, aiGarrison: { infantry: 5, archer: 3 }, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, loyalty: 60, population: 1500, playerSupport: 50, aiSupport: 50, slaveIncome: 0 },
            { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [3, 4, 9, 14], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 70, population: 2500, playerSupport: 25, aiSupport: 75, slaveIncome: 0 },
            { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, loyalty: 60, population: 2000, playerSupport: 30, aiSupport: 70, slaveIncome: 0 },
            { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, aiGarrison: { infantry: 5, cavalry: 5 }, siegeBy: null, neighbors: [4, 11], buildings: [], income: 1, loyalty: 50, population: 1000, playerSupport: 50, aiSupport: 50, slaveIncome: 0 },
            { id: 11, name: 'Болгария', owner: 'ai', x: 590, y: 430, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [5, 10, 13, 15], buildings: [], income: 1, loyalty: 50, population: 1500, playerSupport: 45, aiSupport: 55, slaveIncome: 0 },
            { id: 12, name: 'Киевская Русь', owner: 'ai', x: 740, y: 200, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [6, 7, 13], buildings: [], income: 1, loyalty: 60, population: 1800, playerSupport: 20, aiSupport: 80, slaveIncome: 0 },
            { id: 13, name: 'Крым', owner: 'ai', x: 720, y: 450, aiGarrison: { infantry: 5, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [7, 11, 12], buildings: [], income: 1, loyalty: 60, population: 1200, playerSupport: 35, aiSupport: 65, slaveIncome: 0 },
            { id: 14, name: 'Польша', owner: 'ai', x: 360, y: 100, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [8, 9], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 70, population: 2500, playerSupport: 15, aiSupport: 85, slaveIncome: 0 },
            { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, aiGarrison: { infantry: 20, archer: 10, cavalry: 5 }, siegeBy: null, neighbors: [11], buildings: [{type:'church', lvl:1}, {type:'fortress', lvl:1}], income: 5, loyalty: 80, population: 6000, playerSupport: 10, aiSupport: 90, slaveIncome: 0 }
        ]
    };
}
let game = getDefaultGame();

// ================= ДРОПДАУНЫ (ИСПРАВЛЕНА ОШИБКА С ПРОПАДАНИЕМ) =================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.parentElement.querySelector('.dropdown-content');
            // Закрыть все другие открытые меню
            document.querySelectorAll('.dropdown-content.open').forEach(el => {
                if (el !== content) el.classList.remove('open');
            });
            content.classList.toggle('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.open').forEach(el => el.classList.remove('open'));
        }
    });
});

// ================= АВТОСОХРАНЕНИЕ =================
function saveGame() { try { localStorage.setItem('VampireWarSave', JSON.stringify(game)); } catch (e) {} }
function loadGame() {
    try {
        const saved = localStorage.getItem('VampireWarSave');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.provinces && parsed.provinces.length === game.provinces.length) {
                game = parsed; return true;
            } else {
                localStorage.removeItem('VampireWarSave'); // Сброс несовместимых сохранений
            }
        }
    } catch (e) { log('Ошибка загрузки сохранения', 'system'); }
    return false;
}

// ================= ЛОГИКА ИГРЫ =================
function log(msg, type = 'system') {
    const container = document.getElementById('log-container');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    if (type === 'ai') {
        const d = ["Ватикан: Еретики сгорят!", "Ватикан: Господь с нами!", "Ватикан: Инквизиция не дремлет!"];
        msg = d[Math.floor(Math.random() * d.length)] + " " + msg;
    }
    entry.textContent = msg;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
}

function getTotalTroops(armyObj) { return (armyObj.infantry || 0) + (armyObj.archer || 0) + (armyObj.cavalry || 0); }

function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let gBonus = 1, bBonus = 1, slaveBonus = (prov.slaveIncome || 0);
            prov.buildings.forEach(b => {
                if (b.type === 'feast_hall') bBonus += (b.lvl === 1 ? 3 : 6);
                if (b.type === 'dark_temple') gBonus += (b.lvl === 1 ? 2 : 5);
                if (b.type === 'dungeon') gBonus += 2;
                if (b.type === 'castle') gBonus += 3;
            });
            game.player.gold += prov.income + gBonus + slaveBonus; 
            game.player.blood += 1 + bBonus;
        } else if (prov.owner === 'ai') {
            let aiGold = 1;
            prov.buildings.forEach(b => {
                if (b.type === 'church') aiGold += (b.lvl === 1 ? 2 : 5);
                if (b.type === 'fortress') aiGold += (b.lvl === 1 ? 3 : 6);
            });
            game.ai.gold += prov.income + aiGold;
            game.ai.faith += Math.floor(prov.population / 1000);
        }
    });
    updateUI();
}

function updateLoyalty() {
    game.provinces.forEach(p => {
        if (!p.owner) return;
        let change = -1;
        p.buildings.forEach(b => {
            if (p.owner === 'player') {
                if (b.type === 'dark_temple') change += (b.lvl === 1 ? 3 : 5);
                if (b.type === 'feast_hall') change += (b.lvl === 1 ? 4 : 8);
                if (b.type === 'castle') change += 2;
            } else {
                if (b.type === 'church') change += (b.lvl === 1 ? 3 : 5);
                if (b.type === 'fortress') change += (b.lvl === 1 ? 4 : 8);
            }
        });
        p.loyalty = Math.min(100, Math.max(0, p.loyalty + change));
        if (p.loyalty < 20 && Math.random() < 0.3) { p.owner = null; p.playerGarrison = {}; p.aiGarrison = {}; log(`💥 Бунт в ${p.name}!`, 'system'); }
    });
}

// ================= БИТВА И ЗАХВАТ =================
function executeBattle(attackerSide, targetProv) {
    game.battleActive = true;
    let attIsPlayer = attackerSide === 'player';
    let attackerArmy = attIsPlayer ? game.player.mobileArmy : game.ai.mobileArmy;
    
    let attackerLosses = Math.floor(Math.random() * 16) + 10; 
    let defenderLosses = Math.floor(Math.random() * 11) + 5;

    let totalAtt = getTotalTroops(attackerArmy);
    let defenderGarrison = attIsPlayer ? targetProv.aiGarrison : targetProv.playerGarrison;
    let totalDef = getTotalTroops(defenderGarrison || {});

    let units = ['infantry', 'archer', 'cavalry'];
    let attLeft = attackerLosses;
    units.forEach(type => {
        let count = attackerArmy[type] || 0;
        let take = Math.floor(attackerLosses * (count / totalAtt));
        take = Math.min(take, count);
        attackerArmy[type] = Math.max(0, count - take);
        attLeft -= take;
    });
    if (attLeft > 0 && totalAtt > 0) {
        let inf = attackerArmy.infantry || 0;
        attackerArmy.infantry = Math.max(0, inf - attLeft);
    }

    if (defenderGarrison && totalDef > 0) {
        let defLeft = defenderLosses;
        units.forEach(type => {
            let count = defenderGarrison[type] || 0;
            let take = Math.floor(defenderLosses * (count / totalDef));
            take = Math.min(take, count);
            defenderGarrison[type] = Math.max(0, count - take);
            defLeft -= take;
        });
        if (defLeft > 0 && totalDef > 0) {
            let inf = defenderGarrison.infantry || 0;
            defenderGarrison.infantry = Math.max(0, inf - defLeft);
        }
    }

    let newDefTotal = getTotalTroops(defenderGarrison || {});
    log(`⚔️ Ваши потери: ${attackerLosses}. Гарнизон врага: ${defenderLosses}.`, attIsPlayer ? 'player' : 'ai');
    
    if (newDefTotal <= 0) {
        log(`🏰 Провинция ${targetProv.name} захвачена!`, attIsPlayer ? 'player' : 'ai');
        targetProv.owner = attIsPlayer ? 'player' : 'ai';
        targetProv.siegeBy = null;
        targetProv.aiGarrison = {};
        targetProv.playerGarrison = {};
        let remainingTroops = getTotalTroops(attackerArmy);
        let transfer = Math.floor(remainingTroops / 2);
        let tempGarrison = { infantry: transfer, archer: 0, cavalry: 0 };
        if (attIsPlayer) {
            targetProv.playerGarrison = tempGarrison;
            game.player.mobileArmy.infantry = Math.max(0, game.player.mobileArmy.infantry - transfer);
            game.player.mobileArmy.location = targetProv.id;
        } else {
            targetProv.aiGarrison = tempGarrison;
            game.ai.mobileArmy.infantry = Math.max(0, game.ai.mobileArmy.infantry - transfer);
            game.ai.mobileArmy.location = targetProv.id;
        }
        game.battleActive = false;
        showSurrenderModal(targetProv);
    } else {
        log(`🛡️ Атака отбита!`, 'system');
        if (attIsPlayer && game.player.generals.highVampire > 0) game.player.generals.highVampire -= 1;
        else if (!attIsPlayer && game.ai.generals.inquisitor > 0) game.ai.generals.inquisitor -= 1;
        game.battleActive = false;
        checkGameConditions();
        updateUI();
    }
}

// ================= СУДЬБА ПРОВИНЦИИ =================
function showSurrenderModal(prov) {
    if (game.surrenderActive) return;
    game.surrenderActive = true;
    document.getElementById('surrender-modal').style.display = 'flex';
    const r = document.getElementById('surrender-result');
    r.textContent = "";

    document.getElementById('btn-exterminate').onclick = () => {
        game.player.gold += 1000; game.player.blood += 500;
        prov.loyalty = 10; prov.population = Math.floor(prov.population / 4);
        log(`💀 Истребление! +1000 золота, +500 крови.`, 'player');
        r.textContent = "Кровь льется рекой!";
        closeSurrenderModal();
    };

    document.getElementById('btn-enslave').onclick = () => {
        game.player.gold += 500; game.player.blood += 200;
        prov.loyalty = 30; prov.slaveIncome = 3;
        log(`⛓️ Порабощение! +500 золота, +200 крови. Доход +3 золота/ход.`, 'player');
        r.textContent = "Рабы выкуют вам золото.";
        closeSurrenderModal();
    };

    document.getElementById('btn-convert').onclick = () => {
        prov.loyalty += 20;
        if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 };
        prov.playerGarrison.infantry += 10;
        prov.population = Math.floor(prov.population * 1.2);
        log(`🧛 Обращение! +20 лояльности, +10 гарнизона.`, 'player');
        r.textContent = "Новые слуги тьмы!";
        closeSurrenderModal();
    };
    updateUI();
}

function closeSurrenderModal() {
    document.getElementById('surrender-modal').style.display = 'none';
    game.surrenderActive = false;
    checkGameConditions();
    updateUI();
}

// ================= СТРОИТЕЛЬСТВО И АРМИЯ =================
function buildStructure(type, lvl = 1) {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Стройте только в своей провинции.', 'system');
    let cost = 0, name = "";
    if (type === 'dark_temple') { cost = 25; name = 'Храм Тьмы'; }
    else if (type === 'grave_factory') { cost = (lvl === 1 ? 30 : 50); name = `Фабрика гробов Lv${lvl}`; }
    else if (type === 'feast_hall') { cost = (lvl === 1 ? 20 : 40); name = `Пир. зал Lv${lvl}`; }
    else if (type === 'dungeon') { cost = 15; name = 'Тюрьма'; }
    else if (type === 'castle') { cost = 40; name = 'Замок'; }

    if (game.player.gold < cost) return log(`❌ Нужно ${cost} золота.`, 'system');
    if (type === 'grave_factory' || type === 'feast_hall') {
        const existing = prov.buildings.find(b => b.type === type);
        if (!existing) return log(`❌ Сначала постройте Lv1.`, 'system');
        if (existing.lvl >= lvl) return log(`❌ Уже есть ${name}.`, 'system');
        existing.lvl = lvl;
    } else {
        if (prov.buildings.find(b => b.type === type)) return log(`❌ Уже есть.`, 'system');
        prov.buildings.push({ type, lvl: 1 });
    }
    game.player.gold -= cost;
    if (type === 'grave_factory') { game.player.generals.highVampire += (lvl === 1 ? 2 : 5); }
    log(`🏗️ Построен ${name}!`, 'player');
    game.player.ap -= 1; updateUI();
}

function recruitTroops(type) {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Армия должна стоять в своей провинции.', 'system');
    const u = { infantry: { cost: 10, count: 5 }, archer: { cost: 15, count: 5 }, cavalry: { cost: 20, count: 3 } }[type];
    if (game.player.gold < u.cost) return log(`❌ Нужно ${u.cost} золота.`, 'system');
    game.player.gold -= u.cost;
    game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + u.count;
    log(`🧟 Призвано +${u.count} войск.`, 'player');
    game.player.ap -= 1; updateUI();
}

// ================= ГАРНИЗОН И ОСАДА =================
function moveTroops(amount, toGarrison = true) {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Только в своей провинции.', 'system');
    if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 };
    let mobile = game.player.mobileArmy;
    let garrison = prov.playerGarrison;

    const unitTypes = ['infantry', 'archer', 'cavalry'];
    let totalMobile = getTotalTroops(mobile);
    if (totalMobile === 0 && toGarrison) return log('❌ В армии нет войск.', 'system');
    if (getTotalTroops(garrison) === 0 && !toGarrison) return log('❌ В гарнизоне нет войск.', 'system');

    let remaining = amount;
    let srcTotal = toGarrison ? totalMobile : getTotalTroops(garrison);
    
    unitTypes.forEach(type => {
        let srcCount = toGarrison ? (mobile[type] || 0) : (garrison[type] || 0);
        let take = Math.floor(amount * (srcCount / srcTotal));
        take = Math.min(take, srcCount);
        take = Math.min(take, remaining);
        
        if (toGarrison) {
            mobile[type] = Math.max(0, (mobile[type] || 0) - take);
            garrison[type] = (garrison[type] || 0) + take;
        } else {
            garrison[type] = Math.max(0, (garrison[type] || 0) - take);
            mobile[type] = (mobile[type] || 0) + take;
        }
        remaining -= take;
    });
    log(`${toGarrison ? '⬆️' : '⬇️'} ${amount} бойцов перемещено.`, 'player');
    game.player.ap -= 1; updateUI();
}

function cancelSiege() {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.siegeBy !== 'player') return log('❌ Армия не осаждает.', 'system');
    prov.siegeBy = null;
    const pProvs = game.provinces.filter(p => p.owner === 'player');
    game.player.mobileArmy.location = pProvs.length > 0 ? pProvs[0].id : 4;
    log(`🚩 Осада снята, отступление.`, 'player');
    game.player.ap -= 1; updateUI();
}

// ================= УМНЫЙ ИИ =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    const aiProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);

    if (game.ai.gold >= 10 && aiProv && aiProv.owner === 'ai') {
        let c = aiProv.buildings.find(b => b.type === 'church');
        if (!c) { aiProv.buildings.push({type:'church', lvl:1}); game.ai.gold-=10; game.ai.generals.inquisitor+=2; log('⛪ Церковь построена!', 'ai'); }
        else if (c.lvl === 1 && game.ai.gold >= 20) { c.lvl = 2; game.ai.gold-=20; game.ai.generals.inquisitor+=5; log('⛪ Собор построен!', 'ai'); }
    }
    if (game.ai.gold >= 20) { game.ai.mobileArmy.cavalry += 3; game.ai.gold -= 20; }
    if (game.ai.gold >= 15) { game.ai.mobileArmy.archer += 5; game.ai.gold -= 15; }
    while (game.ai.gold >= 10) { game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10; }

    if (aiProv && aiProv.owner === 'ai') {
        let targets = game.provinces.filter(p => aiProv.neighbors.includes(p.id) && p.owner === 'player');
        if (targets.length > 0) {
            let target = targets[0];
            if (target.siegeBy === null && getTotalTroops(game.ai.mobileArmy) > 0) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан осадил ${target.name}.`, 'ai');
            } else if (target.siegeBy === 'ai' && getTotalTroops(game.ai.mobileArmy) > 5) {
                let aLoss = Math.floor(Math.random() * 16) + 10;
                let dLoss = Math.floor(Math.random() * 11) + 5;
                let attArmy = game.ai.mobileArmy;
                let defGar = target.playerGarrison || {infantry:0};
                let totalAtt = getTotalTroops(attArmy);
                let units = ['infantry', 'archer', 'cavalry'];
                units.forEach(type => {
                    let c = attArmy[type] || 0; let take = Math.floor(aLoss * (c / totalAtt));
                    take = Math.min(take, c); attArmy[type] = Math.max(0, c - take);
                });
                let totalDef = getTotalTroops(defGar);
                units.forEach(type => {
                    let c = defGar[type] || 0; let take = Math.floor(dLoss * (c / totalDef));
                    take = Math.min(take, c); defGar[type] = Math.max(0, c - take);
                });
                if (getTotalTroops(defGar) <= 0) {
                    target.owner = 'ai'; 
                    target.aiGarrison = { infantry: Math.floor(getTotalTroops(attArmy)/2), archer: 0, cavalry: 0 };
                    target.siegeBy = null;
                    game.ai.mobileArmy.infantry = Math.floor(game.ai.mobileArmy.infantry / 2);
                    game.ai.mobileArmy.location = target.id;
                    log(`🏰 Ватикан захватил ${target.name}!`, 'ai');
                } else {
                    if (game.ai.generals.inquisitor > 0) game.ai.generals.inquisitor -= 1;
                    log(`🛡️ Штурм Ватикана отбит!`, 'ai');
                }
            }
        } else {
            let frontier = game.provinces.find(p => p.owner === 'player' && p.neighbors.some(id => game.provinces.find(pr => pr.id === id && pr.owner === 'ai')));
            if (frontier) {
                let moveToId = frontier.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === 'ai'));
                if (moveToId) game.ai.mobileArmy.location = moveToId;
            }
        }
    }
    game.ai.faith += 5;
    checkGameConditions(); updateUI();
}

// ================= КОНЕЦ ХОДА =================
function endPlayerTurn() {
    if (game.gameOver || game.battleActive || game.surrenderActive) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai');
    
    collectIncome(); updateLoyalty(); game.player.ap = game.player.maxAp;
    game.turn++; if (game.turn % 2 === 1) game.day++;
    log(`⏩ ХОД ${game.turn}. ДЕНЬ ${game.day}`, 'system');
    aiTurn();
    saveGame();
    updateUI();
}

function checkGameConditions() {
    const pCount = game.provinces.filter(p => p.owner === 'player').length;
    const aiCount = game.provinces.filter(p => p.owner === 'ai').length;
    if (pCount === 0) gameOver('ai');
    else if (aiCount === 0) gameOver('player');
    if (game.ai.faith >= 100) {
        log('🔥 КРЕСТОВЫЙ ПОХОД! Ватикан призывает все силы!', 'ai');
        game.ai.mobileArmy.infantry += 150; game.ai.mobileArmy.cavalry += 20; game.ai.generals.inquisitor += 10; game.ai.faith = 0;
    }
}

function gameOver(winner) {
    if (game.gameOver) return;
    game.gameOver = true;
    const msg = winner === 'player' ? '🏆 ТЬМА ПОБЕДИЛА!' : '💀 ПОРАЖЕНИЕ! Трансильвания пала.';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true);
    document.getElementById('bg-layer').style.opacity = '0.8';
    saveGame();
}
function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive && !game.surrenderActive; }

// ================= ОТРИСОВКА КАРТЫ =================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const playerVisible = [];
    game.provinces.forEach(p => { if (p.owner === 'player') { playerVisible.push(p.id); p.neighbors.forEach(n => playerVisible.push(n)); } });
    
    game.provinces.forEach(p => {
        const isVis = !game.fogOfWar || playerVisible.includes(p.id) || p.owner === 'player';
        ctx.beginPath(); const s = 45;
        for (let i=0; i<6; i++) {
            let a = Math.PI/3 * i - Math.PI/6;
            let x = p.x + s * Math.cos(a), y = p.y + s * Math.sin(a);
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath();
        if (!isVis) { ctx.fillStyle='#080302'; ctx.strokeStyle='#080302'; ctx.fill(); ctx.stroke(); return; }
        
        ctx.fillStyle = p.owner === 'player' ? '#8b1a1a' : (p.owner === 'ai' ? '#4a4a4a' : '#2a1a1a');
        ctx.strokeStyle = p.owner === 'player' ? '#d4af37' : (p.owner === 'ai' ? '#c9a84c' : '#3a2a25');
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y-20);
        ctx.fillStyle = '#aaa'; ctx.font = '10px Cinzel';
        ctx.fillText(`Лояль:${Math.round(p.loyalty)}`, p.x, p.y);

        let g = p.owner === 'player' ? p.playerGarrison : p.aiGarrison;
        let gCount = getTotalTroops(g || {});
        if (gCount > 0) ctx.fillText(`🛡️Гарн:${gCount}`, p.x, p.y+15);

        if (p.siegeBy === 'player') { ctx.strokeStyle='#d4af37'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
        else if (p.siegeBy === 'ai') { ctx.strokeStyle='#cc0000'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
    });

    const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    
    if (pProv) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) ctx.drawImage(sprites.player, pProv.x-20, pProv.y-45, 40, 60);
        else { ctx.fillStyle='#5c0000'; ctx.beginPath(); ctx.arc(pProv.x, pProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#fff'; ctx.font='bold 10px Cinzel';
        ctx.fillText(`🧛 ${getTotalTroops(game.player.mobileArmy)}`, pProv.x, pProv.y-48);
        if (game.player.generals.highVampire > 0) {
            if (sprites.highVampire.complete && sprites.highVampire.naturalWidth > 0) ctx.drawImage(sprites.highVampire, pProv.x-25, pProv.y-65, 20, 25);
            else ctx.fillText(`🧛🌟 ${game.player.generals.highVampire}`, pProv.x-30, pProv.y-60);
        }
    }

    if (aProv) {
        if (sprites.ai.complete && sprites.ai.naturalWidth > 0) ctx.drawImage(sprites.ai, aProv.x-20, aProv.y-45, 40, 60);
        else { ctx.fillStyle='#c9a84c'; ctx.beginPath(); ctx.arc(aProv.x, aProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#e3dac9'; ctx.font='bold 10px Cinzel';
        ctx.fillText(`⛪ ${getTotalTroops(game.ai.mobileArmy)}`, aProv.x, aProv.y-48);
        if (game.ai.generals.inquisitor > 0) {
            if (sprites.inquisitor.complete && sprites.inquisitor.naturalWidth > 0) ctx.drawImage(sprites.inquisitor, aProv.x-25, aProv.y-65, 20, 25);
            else ctx.fillText(`⚜️ ${game.ai.generals.inquisitor}`, aProv.x-30, aProv.y-60);
        }
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.generals.highVampire;
    
    const faithFill = document.getElementById('faith-bar-fill');
    let faithPct = Math.min(100, game.ai.faith);
    faithFill.style.width = faithPct + '%';
    if (faithPct >= 80) faithFill.style.background = '#b30000';
    else faithFill.style.background = '#aaa';
    document.getElementById('faith-text').textContent = `${game.ai.faith} / 100`;

    // Исправление: Активация кнопки ШТУРМ
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const assaultBtn = document.getElementById('btn-assault');
    if (prov && prov.siegeBy === 'player' && game.player.ap > 0 && game.player.generals.highVampire > 0 && !game.gameOver) {
        assaultBtn.disabled = false;
    } else {
        assaultBtn.disabled = true;
    }
    drawMap();
}

// ================= ОБРАБОТЧИКИ КЛИКОВ =================
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiege);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);
document.getElementById('btn-garrison-add').addEventListener('click', () => moveTroops(10, true));
document.getElementById('btn-garrison-take').addEventListener('click', () => moveTroops(10, false));

document.getElementById('recruit-inf').addEventListener('click', () => recruitTroops('infantry'));
document.getElementById('recruit-arch').addEventListener('click', () => recruitTroops('archer'));
document.getElementById('recruit-cav').addEventListener('click', () => recruitTroops('cavalry'));

document.getElementById('build-grave').addEventListener('click', () => buildStructure('grave_factory', 1));
document.getElementById('build-grave-2').addEventListener('click', () => buildStructure('grave_factory', 2));
document.getElementById('build-feast').addEventListener('click', () => buildStructure('feast_hall', 1));
document.getElementById('build-feast-2').addEventListener('click', () => buildStructure('feast_hall', 2));
document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));
document.getElementById('build-castle').addEventListener('click', () => buildStructure('castle'));

document.getElementById('btn-siege').addEventListener('click', () => {
    if (!game.pendingActionProvId) return;
    let prov = game.provinces.find(p => p.id === game.pendingActionProvId);
    if (!prov || game.player.ap === 0) return;
    game.player.mobileArmy.location = prov.id;
    prov.siegeBy = 'player';
    game.player.ap -= 1;
    game.pendingActionProvId = null;
    document.getElementById('action-modal').style.display = 'none';
    log(`🚩 Провинция ${prov.name} взята в осаду.`, 'player');
    updateUI();
});

document.getElementById('btn-assault-now').addEventListener('click', () => {
    if (!game.pendingActionProvId) return;
    let prov = game.provinces.find(p => p.id === game.pendingActionProvId);
    if (!prov || game.player.ap === 0) return;
    game.player.mobileArmy.location = prov.id;
    game.player.ap -= 1;
    game.pendingActionProvId = null;
    document.getElementById('action-modal').style.display = 'none';
    executeBattle('player', prov);
});

document.getElementById('btn-assault').addEventListener('click', () => {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.siegeBy !== 'player') return log('❌ Не осаждена.', 'system');
    if (game.player.generals.highVampire < 1) return log('❌ Нужен Верховный Вампир для штурма!', 'player');
    game.player.ap -= 1;
    executeBattle('player', prov);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let found = null;
    for (let p of game.provinces) {
        if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) { found = p; break; }
    }
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    if (found) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY - 20) + 'px';
        let gCount = found.owner === 'player' ? getTotalTroops(found.playerGarrison||{}) : getTotalTroops(found.aiGarrison||{});
        tooltip.innerHTML = `<b style="color:#d4af37;">${found.name}</b><br>Лояльность: ${Math.round(found.loyalty)}<br>Гарнизон: ${gCount}<br>Население: ${found.population}`;
    } else tooltip.style.display = 'none';
});

canvas.addEventListener('click', (e) => {
    if (game.gameOver || game.battleActive || game.surrenderActive) return;
    if (game.player.ap === 0) return log('❌ У вас нет очков действий.', 'system');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    for (let p of game.provinces) {
        if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) {
            const curr = game.provinces.find(pr => pr.id === game.player.mobileArmy.location);
            if ((p.owner === 'ai' || p.owner === null) && game.player.ap > 0) {
                if (!curr.neighbors.includes(p.id)) return log('❌ Слишком далеко! Ходите по соседним провинциям.', 'system');
                if (getTotalTroops(game.player.mobileArmy) === 0) return log('❌ У вас нет войск для вторжения.', 'system');
                
                game.pendingActionProvId = p.id;
                document.getElementById('action-desc').textContent = `Ваша армия вошла в провинцию «${p.name}». Что вы хотите сделать?`;
                document.getElementById('action-modal').style.display = 'flex';
                break;
            } else if (p.owner === 'player' && p.id !== curr.id) {
                if (!curr.neighbors.includes(p.id)) return log('❌ Слишком далеко!', 'system');
                game.player.mobileArmy.location = p.id;
                game.player.ap -= 1;
                log(`🏰 Армия передислоцировалась в ${p.name}.`, 'player');
                updateUI(); break;
            }
        }
    }
});

// ================= ЗАПУСК =================
if (!loadGame()) {
    game = getDefaultGame();
}
function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
gameLoop();
log('🌙 Князь Тьмы, ваши войска готовы! Ватикан наращивает веру...', 'system');
collectIncome(); updateUI();
