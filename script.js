// ================= ЗАГРУЗКА АССЕТОВ =================
const sprites = {
    player: new Image(), ai: new Image(), rider: new Image()
};
sprites.player.src = './assets/vampir.webp';
sprites.ai.src = './assets/knight.gif';
sprites.rider.src = './assets/knight.gif';

// ================= ДАННЫЕ ИГРЫ =================
let game = {
    turn: 1, day: 1, gameOver: false, battleActive: false,
    selectedProvinceId: null,
    fogOfWar: true,
    player: {
        ap: 2, maxAp: 2, gold: 100, blood: 10, highVampires: 5,
        army: { troops: 100, elites: 5, location: 4 }
    },
    ai: {
        elites: 5, gold: 100, blood: 5, inquisitors: 5,
        army: { troops: 100, elites: 5, location: 1 },
        faith: 0
    },
    // Лояльность добавлена в провинции. 100 = идеально, < 30 = риск бунта
    provinces: [
        { id: 1, name: 'Ватикан (Бавария)', owner: 'ai', x: 300, y: 150, garrison: 30, siegeBy: null, neighbors: [2, 9], buildings: ['church'], income: 2, loyalty: 100 },
        { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, garrison: 15, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2, loyalty: 80 },
        { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, garrison: 20, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: ['church'], income: 3, loyalty: 80 },
        { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, garrison: 30, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: ['dark_temple'], income: 3, loyalty: 100 },
        { id: 5, name: 'Валахия', owner: 'ai', x: 590, y: 320, garrison: 15, siegeBy: null, neighbors: [3, 4, 6, 7, 11], buildings: [], income: 2, loyalty: 70 },
        { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, garrison: 10, siegeBy: null, neighbors: [3, 5, 7, 12], buildings: [], income: 2, loyalty: 70 },
        { id: 7, name: 'Одесса', owner: 'ai', x: 680, y: 350, garrison: 10, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, loyalty: 60 },
        { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, garrison: 10, siegeBy: null, neighbors: [3, 4, 9, 14], buildings: ['church'], income: 2, loyalty: 70 },
        { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, garrison: 10, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, loyalty: 60 },
        { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, garrison: 10, siegeBy: null, neighbors: [4, 11], buildings: [], income: 1, loyalty: 50 },
        { id: 11, name: 'Болгария', owner: 'ai', x: 590, y: 430, garrison: 15, siegeBy: null, neighbors: [5, 10, 13, 15], buildings: [], income: 1, loyalty: 50 },
        { id: 12, name: 'Киевская Русь', owner: 'ai', x: 740, y: 200, garrison: 10, siegeBy: null, neighbors: [6, 7, 13], buildings: [], income: 1, loyalty: 60 },
        { id: 13, name: 'Крым', owner: 'ai', x: 720, y: 450, garrison: 10, siegeBy: null, neighbors: [7, 11, 12], buildings: [], income: 1, loyalty: 60 },
        { id: 14, name: 'Польша', owner: 'ai', x: 360, y: 100, garrison: 15, siegeBy: null, neighbors: [8, 9], buildings: ['church'], income: 2, loyalty: 70 },
        { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, garrison: 20, siegeBy: null, neighbors: [11], buildings: ['church', 'fortress'], income: 5, loyalty: 80 }
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

// 1. Экономика и доход
function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let goldBonus = 1, bloodBonus = 1;
            if (prov.buildings.includes('feast_hall')) bloodBonus += 3;
            if (prov.buildings.includes('dark_temple')) goldBonus += 2;
            if (prov.buildings.includes('dungeon')) goldBonus += 2; // Тюрьма дает доход от инквизиции

            game.player.gold += prov.income + goldBonus;
            game.player.blood += prov.garrison + bloodBonus;
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

// 2. Лояльность провинций (бунты)
function updateLoyalty() {
    game.provinces.forEach(prov => {
        if (prov.owner !== null) {
            let change = 0;
            if (prov.owner === 'player') {
                change = -1; // Естественное падение лояльности
                if (prov.buildings.includes('dark_temple')) change += 3;
                if (prov.buildings.includes('feast_hall')) change += 4;
                if (prov.buildings.includes('dungeon')) change += 1;
            } else {
                change = -1;
                if (prov.buildings.includes('church')) change += 3;
                if (prov.buildings.includes('fortress')) change += 4;
            }
            prov.loyalty = Math.min(100, Math.max(0, prov.loyalty + change));
            
            // Бунт!
            if (prov.loyalty < 20 && Math.random() < 0.3) {
                prov.owner = null;
                prov.garrison = Math.floor(prov.garrison / 2); // Люди дезертируют
                log(`💥 Бунт в провинции ${prov.name}! Она стала нейтральной.`, 'system');
            }
        }
    });
}

// 3. Система битв (Модальное окно)
function showBattleModal(attackerSide, defenderSide, targetProv) {
    if (game.battleActive) return;
    game.battleActive = true;

    const modal = document.getElementById('battle-modal');
    const title = document.getElementById('battle-title');
    const aName = document.getElementById('attacker-name');
    const dName = document.getElementById('defender-name');
    const aStats = document.getElementById('attacker-stats');
    const dStats = document.getElementById('defender-stats');
    const resultDiv = document.getElementById('battle-result');
    const btnResolve = document.getElementById('battle-resolve-btn');
    const btnClose = document.getElementById('battle-close-btn');

    let attTroops, attElites, defTroops;
    let attIsPlayer = (attackerSide === 'player');

    if (attIsPlayer) {
        attTroops = game.player.army.troops; attElites = game.player.army.elites;
    } else {
        attTroops = game.ai.army.troops; attElites = game.ai.army.elites;
    }
    defTroops = targetProv.garrison;

    aName.textContent = attIsPlayer ? "🧛 Армия Тьмы" : "⛪ Ватикан";
    dName.textContent = `${targetProv.name} (Защитники)`;
    aStats.textContent = `Войск: ${attTroops} | Элиты: ${attElites}`;
    dStats.textContent = `Гарнизон: ${defTroops}`;
    resultDiv.textContent = "";
    btnResolve.style.display = "inline-block";
    btnClose.style.display = "none";
    modal.style.display = "flex";

    btnResolve.onclick = function() {
        // Расчет боя
        let attackPower = attTroops + (attElites * 10);
        let defensePower = defTroops;

        let attLosses = Math.floor(defensePower / 2) + Math.floor(Math.random() * 5);
        let defLosses = Math.floor(attackPower / 4) + Math.floor(Math.random() * 5);

        attTroops = Math.max(1, attTroops - attLosses);
        defTroops = Math.max(1, defTroops - defLosses);

        if (attIsPlayer) {
            game.player.army.troops = attTroops;
        } else {
            game.ai.army.troops = attTroops;
        }

        // Победа
        let winner = null;
        if (defTroops <= 1) {
            winner = attIsPlayer ? "player" : "ai";
            resultDiv.textContent = `🏆 Победа! Потери атакующих: ${attLosses}. Защитники уничтожены.`;
        } else {
            if (attTroops < 10) {
                winner = (attIsPlayer ? "ai" : "player");
                resultDiv.textContent = `💀 Отступление! Атакующие потеряли ${attLosses} и отступили.`;
            } else {
                resultDiv.textContent = `⏳ Ничья! Атакующие потеряли ${attLosses}, защитники потеряли ${defLosses}. Осада продолжается.`;
            }
        }

        aStats.textContent = `Войск: ${attTroops} | Элиты: ${attElites}`;
        dStats.textContent = `Гарнизон: ${defTroops}`;
        
        btnResolve.style.display = "none";
        btnClose.style.display = "inline-block";

        // Применяем результаты после закрытия
        btnClose.onclick = function() {
            modal.style.display = "none";
            game.battleActive = false;
            
            if (winner === 'player') {
                targetProv.owner = 'player';
                targetProv.garrison = Math.floor(attTroops / 2) + 1;
                game.player.army.location = targetProv.id;
                targetProv.siegeBy = null;
                game.player.army.troops = Math.floor(attTroops / 2);
                log(`🏰 ${targetProv.name} захвачена!`, 'player');
            } else if (winner === 'ai') {
                targetProv.owner = 'ai';
                targetProv.garrison = Math.floor(attTroops / 2) + 1;
                game.ai.army.location = targetProv.id;
                targetProv.siegeBy = null;
                game.ai.army.troops = Math.floor(attTroops / 2);
                log(`🏰 ${targetProv.name} захвачена Ватиканом!`, 'ai');
            } else {
                // Ничья, если атаковал игрок
                if (attIsPlayer) {
                    targetProv.garrison = Math.max(1, defTroops);
                    game.player.army.troops = Math.max(1, attTroops);
                }
            }
            checkGameConditions();
            updateUI();
        };
    };
}

// 4. Логика строительства и войск
function buildStructure(type) {
    if (!canAct() || game.gameOver) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.owner !== 'player') return log('❌ Стройте только в своей провинции!', 'system');

    let cost = 0, name = "";
    if (type === 'dark_temple') { cost = 25; name = 'Храм Тьмы'; } 
    else if (type === 'grave_factory') { cost = 30; name = 'Фабрика гробов'; }
    else if (type === 'feast_hall') { cost = 20; name = 'Пиршественный зал'; }
    else if (type === 'dungeon') { cost = 15; name = 'Тюрьма инквизиции'; }

    if (game.player.gold < cost) return log(`❌ Недостаточно золота. Нужно ${cost}.`, 'system');
    if (currentProv.buildings.includes(type)) return log(`❌ Здесь уже есть ${name}.`, 'system');

    game.player.gold -= cost;
    currentProv.buildings.push(type);
    
    if (type === 'grave_factory') {
        game.player.highVampires += 2; // Элитные вампиры
        log(`⚰️ Построена Фабрика гробов! +2 Верховных Вампира.`, 'player');
    } else if (type === 'dark_temple') {
        log(`🕯️ Возведен Храм Тьмы! Лояльность растет.`, 'player');
    } else if (type === 'feast_hall') {
        log(`🍷 Пиршественный зал готов! Лояльность сильно растет.`, 'player');
    } else if (type === 'dungeon') {
        log(`⛓️ Тюрьма инквизиции! + доход и лояльность.`, 'player');
    }
    game.player.ap -= 1;
    updateUI();
}

// 5. Наём и призыв армии
function recruitTroops() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.owner !== 'player') return log('❌ Армия должна стоять в своей провинции.', 'system');
    if (game.player.gold < 5) return log('❌ Не хватает золота! 5 золота за призыв 5 войск.', 'system');
    
    game.player.gold -= 5;
    game.player.army.troops += 10; // За 5 золота призываем 10 пехотинцев
    log(`🧟 Призвано +10 воинов тьмы в армию. Текущая численность: ${game.player.army.troops}`, 'player');
    game.player.ap -= 1;
    updateUI();
}

function cancelSiegeMTW() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.siegeBy !== 'player') return log('❌ Армия не осаждает эту провинцию.', 'system');
    currentProv.siegeBy = null;
    const playerProvs = game.provinces.filter(p => p.owner === 'player');
    if (playerProvs.length === 0) return gameOver('ai');
    game.player.army.location = playerProvs[0].id;
    log(`🚩 Осада снята, отступление в ${playerProvs[0].name}.`, 'player');
    game.player.ap -= 1;
    updateUI();
}

// ================= ДЕЙСТВИЯ ИИ =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    
    // ИИ строит церкви, чтобы получать инквизиторов
    const aiArmyProv = game.provinces.find(p => p.id === game.ai.army.location);
    if (game.ai.gold >= 10 && aiArmyProv && aiArmyProv.owner === 'ai' && !aiArmyProv.buildings.includes('church')) {
        aiArmyProv.buildings.push('church');
        game.ai.gold -= 10;
        game.ai.inquisitors += 2; // За постройку церкви +2 инквизитора
        log('⛪ Ватикан построил Церковь и нанял +2 Инквизитора.', 'ai');
    }

    // ИИ нанимает много рыцарей
    if (game.ai.gold >= 5) {
        let count = Math.floor(game.ai.gold / 5);
        game.ai.gold -= count * 5;
        game.ai.army.troops += count * 5;
        log(`⚔️ Ватикан пополнил армию на ${count * 5} рыцарей.`, 'ai');
    }

    // Военная экспансия
    if (aiArmyProv) {
        const targets = game.provinces.filter(p => aiArmyProv.neighbors.includes(p.id) && p.owner === 'player');
        if (targets.length > 0) {
            const target = targets[0]; 
            if (target.siegeBy === null) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан начал осаду ${target.name}!`, 'ai');
            } else {
                // Вместо автомата - вызываем сражение для ИИ (или авто-расчет)
                // Чтобы игрок видел битву, вызываем модалку.
                // Но для ИИ удобнее авто-бой в фоне:
                log(`⚔️ Авто-бой Ватикана против ${target.name}`, 'ai');
                let atkPower = game.ai.army.troops + (game.ai.inquisitors * 10);
                let defPower = target.garrison;
                
                let lossesAtt = Math.floor(defPower / 2);
                let lossesDef = Math.floor(atkPower / 2);
                
                game.ai.army.troops = Math.max(1, game.ai.army.troops - lossesAtt);
                target.garrison = Math.max(1, target.garrison - lossesDef);

                if (target.garrison <= 1) {
                    target.owner = 'ai';
                    target.garrison = Math.floor(game.ai.army.troops / 2) + 1;
                    game.ai.army.location = target.id;
                    target.siegeBy = null;
                    game.ai.army.troops = Math.floor(game.ai.army.troops / 2);
                    log(`🏰 Ватикан захватил ${target.name}!`, 'ai');
                }
            }
        } else {
            // Движение ИИ
            const frontierTarget = game.provinces.find(p => p.owner === 'player' && p.neighbors.some(id => game.provinces.find(prov => prov.id === id && prov.owner === 'ai')));
            if (frontierTarget) {
                const moveToId = frontierTarget.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === 'ai'));
                if (moveToId) {
                    game.ai.army.location = moveToId;
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
    
    // Пропуск хода снимает все осады врага, если армия стоит в своей провинции
    const pArmyProv = game.provinces.find(p => p.id === game.player.army.location);
    if (pArmyProv && pArmyProv.owner === 'player' && pArmyProv.siegeBy === 'ai') {
        pArmyProv.siegeBy = null;
        log('🚩 Осада Ватикана снята, враг отступил.', 'player');
    }

    collectIncome();
    updateLoyalty(); // Проверяем лояльность
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
    const msg = winner === 'player' ? '🏆 ПОБЕДА ВАМПИРОВ! Европа во тьме.' : '💀 ПОРАЖЕНИЕ! Инквизиция сожгла Трансильванию.';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true);
    document.getElementById('bg-layer').style.opacity = '0.8';
    updateUI();
}

function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive; }

// ================= ОТРИСОВКА КАРТЫ И АРМИЙ =================
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
        let stats = `Гар:${prov.garrison} | Лояль:${Math.round(prov.loyalty)}`;
        if (prov.buildings && prov.buildings.length > 0) stats += ` 🏛️${prov.buildings.length}`;
        ctx.fillText(stats, prov.x, prov.y + 5);

        if (prov.siegeBy === 'player') {
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        } else if (prov.siegeBy === 'ai') {
            ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        }
    });

    // Отрисовка армий с численностью
    const playerProv = game.provinces.find(p => p.id === game.player.army.location);
    const aiProv = game.provinces.find(p => p.id === game.ai.army.location);
    
    if (playerProv) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) {
            ctx.drawImage(sprites.player, playerProv.x - 20, playerProv.y - 45, 40, 60);
        } else {
            ctx.fillStyle = '#5c0000'; ctx.beginPath(); ctx.arc(playerProv.x, playerProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'white'; ctx.font = 'bold 10px Cinzel'; 
        ctx.fillText(`🧛 ${game.player.army.troops}`, playerProv.x, playerProv.y - 48);
        ctx.fillText(`Тьма`, playerProv.x, playerProv.y - 60);
    }

    if (aiProv) {
        if (sprites.ai.complete && sprites.ai.naturalWidth > 0) {
            ctx.drawImage(sprites.ai, aiProv.x - 20, aiProv.y - 45, 40, 60);
        } else {
            ctx.fillStyle = '#c9a84c'; ctx.beginPath(); ctx.arc(aiProv.x, aiProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#e3dac9'; ctx.font = 'bold 10px Cinzel';
        ctx.fillText(`⛪ ${game.ai.army.troops}`, aiProv.x, aiProv.y - 48);
        ctx.fillText(`Ватикан`, aiProv.x, aiProv.y - 60);
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.highVampires;
    document.getElementById('faith-counter').textContent = game.ai.faith;
    drawMap();
}

// ================= ОБРАБОТЧИКИ =================
document.getElementById('btn-recruit').addEventListener('click', recruitTroops);
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiegeMTW);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

document.getElementById('build-grave').addEventListener('click', () => buildStructure('grave_factory'));
document.getElementById('build-feast').addEventListener('click', () => buildStructure('feast_hall'));
document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));
document.getElementById('build-dungeon').addEventListener('click', () => buildStructure('dungeon'));

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
    // Если это вражеская провинция, армия движется туда
    if (isEnemy && game.player.ap > 0 && game.player.army.troops > 0) {
        const currProv = game.provinces.find(p => p.id === game.player.army.location);
        if (!currProv.neighbors.includes(prov.id)) return log('❌ Слишком далеко!', 'system');

        game.player.army.location = prov.id;
        game.player.ap -= 1;
        log(`🏰 Армия Тьмы выдвинулась в ${prov.name}.`, 'player');
        
        if (prov.garrison > 0) {
            prov.siegeBy = 'player';
            log(`🏰 Начата осада ${prov.name}!`, 'player');
        } else {
            // Битва, если нет гарнизона
            showBattleModal('player', 'ai', prov);
        }
        updateUI();
    } else if (prov.owner === 'player') {
        log(`📌 Выбрана провинция ${prov.name}. Армия здесь.`, 'system');
        game.selectedProvinceId = prov.id; 
        updateUI();
    }
}

// ЗАПУСК
function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
gameLoop();
log('🌙 Добро пожаловать в Трансильванию. Ватикан уже собирает армию в 100 рыцарей!', 'system');
collectIncome();
updateUI();
