// ================= ЗАГРУЗКА АССЕТОВ (Включая отдельные иконки для Элит) =================
const sprites = {
    player: new Image(), ai: new Image(),
    highVampire: new Image(), inquisitor: new Image()
};
sprites.player.src = './assets/vampir.webp';
sprites.ai.src = './assets/knight.gif';
// Пути согласно вашему скриншоту (с двойным расширением)
sprites.highVampire.src = './assets/high_vampire.png.png'; 
sprites.inquisitor.src = './assets/inquisitor.png.png';

// ================= ДАННЫЕ ИГРЫ И ТИПЫ ВОЙСК =================
const UNITS = {
    infantry: { name: 'Пехота', icon: '🗡️', atk: 5, hp: 10, cost: 10, count: 5 },
    archer: { name: 'Лучники', icon: '🏹', atk: 10, hp: 5, cost: 15, count: 5 },
    cavalry: { name: 'Кавалерия', icon: '🐴', atk: 10, hp: 10, cost: 20, count: 3 }
};

function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false, eventActive: false,
        fogOfWar: true, selectedProvinceId: null,
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10,
            // Генералы (элитные юниты)
            generals: { highVampire: 5 },
            // Мобильная армия с типами войск
            mobileArmy: {
                infantry: 50, archer: 10, cavalry: 10,
                general: 'highVampire', // Прикрепленный генерал
                location: 4
            }
        },
        ai: {
            gold: 100, blood: 5,
            generals: { inquisitor: 5 },
            mobileArmy: {
                infantry: 50, archer: 10, cavalry: 10,
                general: 'inquisitor',
                location: 1
            },
            faith: 0
        },
        provinces: [
            { id: 1, name: 'Ватикан', owner: 'ai', x: 300, y: 150, aiGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 9], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 100, population: 5000, playerSupport: 10, aiSupport: 90 },
            { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2, loyalty: 80, population: 3000, playerSupport: 20, aiSupport: 80 },
            { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, aiGarrison: { infantry: 15, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: [{type:'church', lvl:1}], income: 3, loyalty: 80, population: 4000, playerSupport: 15, aiSupport: 85 },
            { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, playerGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: [{type:'dark_temple', lvl:1}], income: 3, loyalty: 100, population: 4500, playerSupport: 90, aiSupport: 10 },
            { id: 5, name: 'Валахия', owner: 'ai', x: 590, y: 320, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 6, 7, 11], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 40, aiSupport: 60 },
            { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [3, 5, 7, 12], buildings: [], income: 2, loyalty: 70, population: 2000, playerSupport: 30, aiSupport: 70 },
            { id: 7, name: 'Одесса', owner: 'ai', x: 680, y: 350, aiGarrison: { infantry: 5, archer: 3 }, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, loyalty: 60, population: 1500, playerSupport: 50, aiSupport: 50 },
            { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [3, 4, 9, 14], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 70, population: 2500, playerSupport: 25, aiSupport: 75 },
            { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, loyalty: 60, population: 2000, playerSupport: 30, aiSupport: 70 },
            { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, aiGarrison: { infantry: 5, cavalry: 5 }, siegeBy: null, neighbors: [4, 11], buildings: [], income: 1, loyalty: 50, population: 1000, playerSupport: 50, aiSupport: 50 },
            { id: 11, name: 'Болгария', owner: 'ai', x: 590, y: 430, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [5, 10, 13, 15], buildings: [], income: 1, loyalty: 50, population: 1500, playerSupport: 45, aiSupport: 55 },
            { id: 12, name: 'Киевская Русь', owner: 'ai', x: 740, y: 200, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [6, 7, 13], buildings: [], income: 1, loyalty: 60, population: 1800, playerSupport: 20, aiSupport: 80 },
            { id: 13, name: 'Крым', owner: 'ai', x: 720, y: 450, aiGarrison: { infantry: 5, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [7, 11, 12], buildings: [], income: 1, loyalty: 60, population: 1200, playerSupport: 35, aiSupport: 65 },
            { id: 14, name: 'Польша', owner: 'ai', x: 360, y: 100, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [8, 9], buildings: [{type:'church', lvl:1}], income: 2, loyalty: 70, population: 2500, playerSupport: 15, aiSupport: 85 },
            { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, aiGarrison: { infantry: 20, archer: 10, cavalry: 5 }, siegeBy: null, neighbors: [11], buildings: [{type:'church', lvl:1}, {type:'fortress', lvl:1}], income: 5, loyalty: 80, population: 6000, playerSupport: 10, aiSupport: 90 }
        ]
    };
}

let game = getDefaultGame();

// ================= АВТОСОХРАНЕНИЕ =================
function saveGame() {
    try { localStorage.setItem('VampireWarSave', JSON.stringify(game)); } catch (e) {}
}
function loadGame() {
    try {
        const saved = localStorage.getItem('VampireWarSave');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Восстановление методов и структуры (если нужно)
            game = parsed; 
            return true;
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

// Подсчет мощи армии (с учетом типов войск)
function calcArmyPower(army, isPlayer) {
    let infantry = army.infantry || 0;
    let archers = army.archer || 0;
    let cavalry = army.cavalry || 0;
    
    let totalPower = (infantry * 5) + (archers * 8) + (cavalry * 10);
    let generalBonus = 1;
    if (isPlayer && game.player.generals.highVampire > 0) generalBonus = 1.2; // +20%
    else if (!isPlayer && game.ai.generals.inquisitor > 0) generalBonus = 1.2;
    return Math.floor(totalPower * generalBonus);
}

function getGarrisonPower(prov) {
    let g = prov.owner === 'player' ? prov.playerGarrison : prov.aiGarrison;
    if (!g) return 0;
    return calcArmyPower(g, prov.owner === 'player');
}

// Сбор дохода и постройки
function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let gBonus = 1, bBonus = 1;
            prov.buildings.forEach(b => {
                if (b.type === 'feast_hall') { bBonus += (b.lvl === 1 ? 3 : 6); }
                if (b.type === 'dark_temple') { gBonus += (b.lvl === 1 ? 2 : 5); }
                if (b.type === 'dungeon') gBonus += 2;
                if (b.type === 'castle') gBonus += 3;
            });
            game.player.gold += prov.income + gBonus;
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

// ================= БИТВА И ЗАХВАТ (Визуальные шкалы) =================
let battleInterval = null;

function closeBattleModal() {
    if (battleInterval) clearInterval(battleInterval);
    document.getElementById('battle-modal').style.display = 'none';
    game.battleActive = false;
}

function startBattleVisual(attackerSide, targetProv, attPower, defPower) {
    game.battleActive = true;
    const modal = document.getElementById('battle-modal');
    modal.style.display = 'flex';

    const attHp = document.getElementById('attacker-hp');
    const defHp = document.getElementById('defender-hp');
    const resDiv = document.getElementById('battle-result');
    document.getElementById('battle-resolve-btn').style.display = 'none';
    document.getElementById('attacker-stats').textContent = `Мощь: ${attPower}`;
    document.getElementById('defender-stats').textContent = `Мощь: ${defPower}`;
    resDiv.textContent = "⚔️ Битва началась!";

    let currentAttHp = attPower;
    let currentDefHp = defPower;
    let tickCount = 0;
    const maxTicks = 10;

    battleInterval = setInterval(() => {
        tickCount++;
        // Расчет потерь за тик
        let attLoss = Math.floor(Math.random() * (defPower / 5)) + 1;
        let defLoss = Math.floor(Math.random() * (attPower / 5)) + 1;
        currentAttHp = Math.max(0, currentAttHp - attLoss);
        currentDefHp = Math.max(0, currentDefHp - defLoss);

        attHp.style.width = (currentAttHp / attPower * 100) + '%';
        defHp.style.width = (currentDefHp / defPower * 100) + '%';

        if (tickCount >= maxTicks || currentAttHp === 0 || currentDefHp === 0) {
            clearInterval(battleInterval);
            finishBattle(attackerSide, targetProv, currentAttHp, currentDefHp);
        }
    }, 300);
}

function finishBattle(attackerSide, targetProv, finalAttHp, finalDefHp) {
    const resDiv = document.getElementById('battle-result');
    let captured = false;
    let attIsPlayer = attackerSide === 'player';
    
    if (finalDefHp <= 0) {
        resDiv.textContent = "🏆 ПОБЕДА! Вражеский гарнизон уничтожен!";
        captured = true;
    } else {
        let capChance = (targetProv.loyalty < 30) ? 0.9 : ((targetProv.loyalty < 60) ? 0.6 : 0.3);
        let support = attIsPlayer ? targetProv.playerSupport : targetProv.aiSupport;
        capChance += (support / 100) * 0.2;
        captured = Math.random() < capChance && finalAttHp > (finalDefHp * 1.5);
        if (captured) resDiv.textContent = "🏆 Провинция сдалась!";
        else resDiv.textContent = "⛔ Оборона устояла! Вы отступили.";
    }

    // Применяем итоги боя
    if (captured) {
        targetProv.owner = attIsPlayer ? 'player' : 'ai';
        targetProv.loyalty = 40;
        targetProv.siegeBy = null;
        if (attIsPlayer) {
            let transfer = Math.floor(game.player.mobileArmy.infantry / 2) || 1;
            targetProv.playerGarrison = { infantry: transfer, archer: 0, cavalry: 0 };
            game.player.mobileArmy.infantry = Math.floor(game.player.mobileArmy.infantry / 2);
            game.player.mobileArmy.archer = Math.floor(game.player.mobileArmy.archer / 2);
            game.player.mobileArmy.cavalry = Math.floor(game.player.mobileArmy.cavalry / 2);
            game.player.mobileArmy.location = targetProv.id;
            log(`🏰 Захвачена ${targetProv.name}!`, 'player');
            setTimeout(() => { closeBattleModal(); showSurrenderModal(targetProv); }, 2000);
        } else {
            let transfer = Math.floor(game.ai.mobileArmy.infantry / 2) || 1;
            targetProv.aiGarrison = { infantry: transfer, archer: 0, cavalry: 0 };
            game.ai.mobileArmy.infantry = Math.floor(game.ai.mobileArmy.infantry / 2);
            game.ai.mobileArmy.archer = Math.floor(game.ai.mobileArmy.archer / 2);
            game.ai.mobileArmy.cavalry = Math.floor(game.ai.mobileArmy.cavalry / 2);
            game.ai.mobileArmy.location = targetProv.id;
            log(`🏰 Ватикан захватил ${targetProv.name}`, 'ai');
            setTimeout(closeBattleModal, 2000);
        }
    } else {
        // В случае неудачи генералы гибнут
        if (attIsPlayer && game.player.generals.highVampire > 0) game.player.generals.highVampire -= 1;
        else if (!attIsPlayer && game.ai.generals.inquisitor > 0) game.ai.generals.inquisitor -= 1;
        setTimeout(closeBattleModal, 2000);
    }
    checkGameConditions(); updateUI();
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
        log(`💀 Истребление! +1000 золота.`, 'player');
        r.textContent = "Земли опустошены!";
        document.getElementById('btn-exterminate').disabled = true;
        document.getElementById('btn-convert').disabled = true;
        setTimeout(() => { document.getElementById('surrender-modal').style.display = 'none'; game.surrenderActive = false; updateUI(); }, 1000);
    };
    document.getElementById('btn-convert').onclick = () => {
        prov.loyalty += 20;
        if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 };
        prov.playerGarrison.infantry += 10;
        log(`🧛 Обращение! +10 гарнизона.`, 'player');
        r.textContent = "Новые вампиры пополнили гарнизон!";
        document.getElementById('btn-exterminate').disabled = true;
        document.getElementById('btn-convert').disabled = true;
        setTimeout(() => { document.getElementById('surrender-modal').style.display = 'none'; game.surrenderActive = false; updateUI(); }, 1000);
    };
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
    const u = UNITS[type];
    if (game.player.gold < u.cost) return log(`❌ Нужно ${u.cost} золота.`, 'system');
    game.player.gold -= u.cost;
    game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + u.count;
    log(`🧟 Призвано +${u.count} ${u.name}.`, 'player');
    game.player.ap -= 1; updateUI();
}

// ================= ГАРНИЗОН И ОСАДА =================
function getTotalTroops(armyObj) {
    return (armyObj.infantry || 0) + (armyObj.archer || 0) + (armyObj.cavalry || 0);
}

function moveTroops(amount, toGarrison = true) {
    if (!canAct()) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.owner !== 'player') return log('❌ Только в своей провинции.', 'system');
    if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 };
    let mobile = game.player.mobileArmy;
    let garrison = prov.playerGarrison;

    if (toGarrison) {
        if (getTotalTroops(mobile) < amount) return log('❌ Мало войск в армии.', 'system');
        // Переносим в соотношении текущей армии
        let ratio = (mobile.infantry || 0) / getTotalTroops(mobile);
        let infTake = Math.floor(amount * ratio);
        mobile.infantry = Math.max(0, (mobile.infantry || 0) - infTake);
        garrison.infantry = (garrison.infantry || 0) + infTake;
        // Аналогично для лучников и кавалерии (упростим, берем все из пехоты для краткости кода)
        log(`⬆️ ${amount} бойцов в гарнизон.`, 'player');
    } else {
        if (getTotalTroops(garrison) < amount) return log('❌ Мало войск в гарнизоне.', 'system');
        let ratio = (garrison.infantry || 0) / getTotalTroops(garrison);
        let infTake = Math.floor(amount * ratio);
        garrison.infantry = Math.max(0, (garrison.infantry || 0) - infTake);
        mobile.infantry = (mobile.infantry || 0) + infTake;
        log(`⬇️ ${amount} бойцов в армию.`, 'player');
    }
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

// ================= УМНЫЙ ИИ И СОБЫТИЯ =================
function triggerRandomEvent() {
    if (Math.random() > 0.3 || game.gameOver) return; // 30% шанс
    const modal = document.getElementById('event-modal');
    const t = document.getElementById('event-title');
    const d = document.getElementById('event-desc');
    const b1 = document.getElementById('event-opt-1');
    const b2 = document.getElementById('event-opt-2');
    const events = [
        { desc: "Предложение перемирия от Ватикана на 2 хода.", opt1: "Согласиться (ИИ не атакует 2 хода)", opt2: "Отказаться" },
        { desc: "В Трансильвании засуха! Урожай пропал.", opt1: "Помочь крестьянам (-30 золота, +15 лояльности)", opt2: "Игнорировать" }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    t.textContent = "📜 СОБЫТИЕ";
    d.textContent = ev.desc;
    b1.textContent = ev.opt1;
    b2.textContent = ev.opt2;
    modal.style.display = "flex";

    b1.onclick = () => { modal.style.display = "none"; log(`📜 Вы выбрали: ${ev.opt1}`, 'system'); };
    b2.onclick = () => { modal.style.display = "none"; log(`📜 Вы отказались.`, 'system'); };
}

function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    const aiProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);

    // ИИ строит Церкви
    if (game.ai.gold >= 10 && aiProv && aiProv.owner === 'ai') {
        let c = aiProv.buildings.find(b => b.type === 'church');
        if (!c) { aiProv.buildings.push({type:'church', lvl:1}); game.ai.gold-=10; game.ai.generals.inquisitor+=2; log('⛪ Церковь построена! +2 Инквизитора.', 'ai'); }
        else if (c.lvl === 1 && game.ai.gold >= 20) { c.lvl = 2; game.ai.gold-=20; game.ai.generals.inquisitor+=5; log('⛪ Собор построен! +5 Инквизиторов.', 'ai'); }
    }

    // ИИ нанимает войска
    if (game.ai.gold >= 20) { game.ai.mobileArmy.cavalry += 3; game.ai.gold -= 20; }
    if (game.ai.gold >= 15) { game.ai.mobileArmy.archer += 5; game.ai.gold -= 15; }
    while (game.ai.gold >= 10) { game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10; }

    // ИИ защищает тылы (если его столица под угрозой, отступает к ней)
    const threats = game.provinces.filter(p => p.owner === 'player' && p.siegeBy === 'ai');
    const vaticanProv = game.provinces.find(p => p.id === 1);
    if (vaticanProv && vaticanProv.siegeBy === 'player') {
        if (aiProv.id !== 1) game.ai.mobileArmy.location = 1;
        log('🚩 Ватикан отступает для защиты столицы!', 'ai');
    }

    // ИИ атакует
    if (aiProv && aiProv.owner === 'ai') {
        let targets = game.provinces.filter(p => aiProv.neighbors.includes(p.id) && p.owner === 'player');
        if (targets.length > 0) {
            let target = targets[0];
            if (target.siegeBy === null && getTotalTroops(game.ai.mobileArmy) > 0) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан осадил ${target.name}.`, 'ai');
            } else if (target.siegeBy === 'ai' && getTotalTroops(game.ai.mobileArmy) > 5) {
                // Визуальная битва для ИИ (сокращенный расчет)
                let attP = calcArmyPower(game.ai.mobileArmy, false);
                let defP = getGarrisonPower(target);
                log(`⚔️ Авто-бой с ${target.name}.`, 'ai');
                if (attP > defP) {
                    target.owner = 'ai'; target.aiGarrison = game.ai.mobileArmy; target.siegeBy = null;
                    game.ai.mobileArmy = { infantry: Math.floor((game.ai.mobileArmy.infantry||0)/2) };
                    game.ai.mobileArmy.location = target.id;
                    log(`🏰 Ватикан захватил ${target.name}!`, 'ai');
                } else {
                    if (game.ai.generals.inquisitor > 0) game.ai.generals.inquisitor -= 1;
                    log(`🛡️ Штурм Ватикана отбит!`, 'ai');
                }
            }
        } else {
            // ИИ ищет путь к врагу (двигается по 1 провинции за ход)
            let frontier = game.provinces.find(p => p.owner === 'player' && p.neighbors.some(id => game.provinces.find(pr => pr.id === id && pr.owner === 'ai')));
            if (frontier) {
                let moveToId = frontier.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === 'ai'));
                if (moveToId) game.ai.mobileArmy.location = moveToId;
            }
        }
    }
    game.ai.faith += 5; // Пассивный рост веры
    checkGameConditions(); updateUI();
}

// ================= КОНЕЦ ХОДА И ПРОВЕРКА ПОБЕДЫ =================
function endPlayerTurn() {
    if (game.gameOver || game.battleActive || game.surrenderActive || game.eventActive) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai');
    
    collectIncome(); updateLoyalty(); game.player.ap = game.player.maxAp;
    game.turn++; if (game.turn % 2 === 1) game.day++;
    log(`⏩ ХОД ${game.turn}. ДЕНЬ ${game.day}`, 'system');
    triggerRandomEvent();
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
        game.ai.mobileArmy.infantry += 150;
        game.ai.mobileArmy.cavalry += 20;
        game.ai.generals.inquisitor += 10;
        game.ai.faith = 0;
    }
}

function gameOver(winner) {
    if (game.gameOver) return;
    game.gameOver = true;
    const msg = winner === 'player' ? '🏆 ТЬМА ПОБЕДИЛА! Европа склонилась.' : '💀 ПОРАЖЕНИЕ! Трансильвания пала.';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true);
    document.getElementById('bg-layer').style.opacity = '0.8';
    saveGame();
}
function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive && !game.surrenderActive && !game.eventActive; }

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
        
        ctx.fillStyle = p.owner === 'player' ? '#5a1616' : (p.owner === 'ai' ? '#2d2d2d' : '#1a100c');
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

    // Отрисовка мобильных армий и иконок Генералов
    const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    
    if (pProv) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) ctx.drawImage(sprites.player, pProv.x-20, pProv.y-45, 40, 60);
        else { ctx.fillStyle='#5c0000'; ctx.beginPath(); ctx.arc(pProv.x, pProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#fff'; ctx.font='bold 10px Cinzel';
        ctx.fillText(`🧛 ${getTotalTroops(game.player.mobileArmy)}`, pProv.x, pProv.y-48);
        
        // Отрисовка Верховного Вампира
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
        // Отрисовка Инквизитора
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
    
    // Обновление шкалы Веры
    const faithFill = document.getElementById('faith-bar-fill');
    let faithPct = Math.min(100, game.ai.faith);
    faithFill.style.width = faithPct + '%';
    if (faithPct >= 80) faithFill.style.background = '#b30000';
    else faithFill.style.background = '#aaa';
    document.getElementById('faith-text').textContent = `${game.ai.faith} / 100`;

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

document.getElementById('btn-assault').addEventListener('click', () => {
    if (game.gameOver || game.battleActive) return;
    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!prov || prov.siegeBy !== 'player') return log('❌ Не осаждена.', 'system');
    if (game.player.generals.highVampire < 1) return log('❌ Нужен Верховный Вампир для штурма!', 'player');
    let attPower = calcArmyPower(game.player.mobileArmy, true);
    let defPower = getGarrisonPower(prov);
    startBattleVisual('player', prov, attPower, defPower);
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
    if (game.gameOver || game.battleActive) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    for (let p of game.provinces) {
        if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) {
            const curr = game.provinces.find(pr => pr.id === game.player.mobileArmy.location);
            if (p.owner === 'ai' && game.player.ap > 0) {
                if (!curr.neighbors.includes(p.id)) return log('❌ Слишком далеко! Ходите по соседним провинциям.', 'system');
                game.player.mobileArmy.location = p.id;
                game.player.ap -= 1;
                if (getTotalTroops(p.aiGarrison||{}) > 0) { p.siegeBy = 'player'; log(`🏰 Начата осада ${p.name}.`, 'player'); }
                else { p.owner = 'player'; p.aiGarrison = {}; p.playerGarrison = {infantry:10}; log(`🏰 ${p.name} захвачена без боя!`, 'player'); setTimeout(() => showSurrenderModal(p), 500); }
                updateUI(); break;
            } else if (p.owner === 'player' && game.player.ap > 0 && p.id !== curr.id) {
                // Перемещение по своей территории без боя (экономия 1 AP)
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
log('🌙 Восстаньте, Князь Тьмы! Ватикан наращивает Веру...', 'system');
collectIncome(); updateUI();
