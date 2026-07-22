// ================= ЗАГРУЗКА АССЕТОВ =================
const sprites = {
    player: new Image(), // Вампир (Игрок)
    ai: new Image(),     // Рыцарь Ватикана (ИИ)
    rider: new Image(),  // Всадник
};

// Убедитесь, что файлы лежат в одной папке
sprites.player.src = 'vampire.png';
sprites.ai.src = 'knight.png';
sprites.rider.src = 'rider.png';

// ================= ДАННЫЕ ИГРЫ =================
let game = {
    turn: 1, day: 1, gameOver: false,
    selectedProvinceId: null,
    fogOfWar: true,
    player: {
        ap: 2, maxAp: 2, gold: 10, blood: 10, elites: 0,
        army: { power: 3, location: 4 }
    },
    ai: {
        elites: 0, gold: 15, blood: 5,
        army: { power: 4, location: 1 },
        faith: 0 
    },
    provinces: [
        { id: 1, name: 'Бавария', owner: 'ai', x: 300, y: 150, garrison: 2, siegeBy: null, neighbors: [2, 9], buildings: ['church'], income: 2 },
        { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, garrison: 1, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2 },
        { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, garrison: 3, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: ['church'], income: 3 },
        { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, garrison: 4, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: ['dark_temple'], income: 3 },
        { id: 5, name: 'Валахия', owner: 'ai', x: 590, y: 320, garrison: 1, siegeBy: null, neighbors: [3, 4, 6, 7, 11], buildings: [], income: 2 },
        { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, garrison: 1, siegeBy: null, neighbors: [3, 5, 7, 12], buildings: [], income: 2 },
        { id: 7, name: 'Одесса', owner: 'ai', x: 680, y: 350, garrison: 1, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1 },
        { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, garrison: 1, siegeBy: null, neighbors: [3, 4, 9, 14], buildings: ['church'], income: 2 },
        { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, garrison: 2, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2 },
        { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, garrison: 1, siegeBy: null, neighbors: [4, 11], buildings: [], income: 1 },
        { id: 11, name: 'Болгария', owner: 'ai', x: 590, y: 430, garrison: 2, siegeBy: null, neighbors: [5, 10, 13, 15], buildings: [], income: 1 },
        { id: 12, name: 'Киевская Русь', owner: 'ai', x: 740, y: 200, garrison: 1, siegeBy: null, neighbors: [6, 7, 13], buildings: [], income: 1 },
        { id: 13, name: 'Крым', owner: 'ai', x: 720, y: 450, garrison: 1, siegeBy: null, neighbors: [7, 11, 12], buildings: [], income: 1 },
        { id: 14, name: 'Польша', owner: 'ai', x: 360, y: 100, garrison: 2, siegeBy: null, neighbors: [8, 9], buildings: ['church'], income: 2 },
        { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, garrison: 3, siegeBy: null, neighbors: [11], buildings: ['church', 'fortress'], income: 5 }
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
            let bloodBonus = 1, goldBonus = 1;
            if (prov.buildings.includes('feast_hall')) bloodBonus += 3;
            if (prov.buildings.includes('dark_temple')) goldBonus += 2;
            if (prov.buildings.includes('grave_factory')) { game.player.elites += 1; } 
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

function resolveCombat(attackerSide, targetProv) {
    let attackPower = 0;
    let defenderPower = targetProv.garrison;
    
    if (attackerSide === 'player') {
        attackPower = game.player.army.power + (game.player.elites * 2);
        if (targetProv.siegeBy === 'player') defenderPower -= 1;
    } else {
        attackPower = game.ai.army.power + (game.ai.elites * 2);
        if (targetProv.siegeBy === 'ai') defenderPower -= 1;
    }
    if (defenderPower < 1) defenderPower = 1; 

    if (attackPower > defenderPower) {
        const newOwner = attackerSide === 'player' ? 'player' : 'ai';
        log(`🏰 Захвачена провинция ${targetProv.name}!`, newOwner);
        targetProv.owner = newOwner;
        targetProv.garrison = Math.floor(attackPower / 2) + 1;
        targetProv.siegeBy = null;
        if (attackerSide === 'player') game.player.army.location = targetProv.id;
        else game.ai.army.location = targetProv.id;
        checkGameConditions();
        return true;
    } else {
        log(`🛡️ Атака отбита! Потеря гарнизона.`, attackerSide === 'player' ? 'player' : 'ai');
        targetProv.garrison -= Math.floor(attackPower / 2);
        if (targetProv.garrison < 1) targetProv.garrison = 1;
        return false;
    }
}

function buildStructure(type) {
    if (!canAct() || game.gameOver) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.owner !== 'player') return log('❌ Стройте только на своей территории!', 'system');

    if (type === 'dark_temple' && game.player.gold >= 15) {
        if (currentProv.buildings.includes('dark_temple')) return log('❌ Храм Тьмы уже есть.', 'system');
        game.player.gold -= 15;
        currentProv.buildings.push('dark_temple');
        log('🕯️ Возведен Храм Тьмы.', 'player');
    } else if (type === 'grave_factory' && game.player.blood >= 10 && game.player.gold >= 5) {
        if (currentProv.buildings.includes('grave_factory')) return log('❌ Фабрика гробов уже есть.', 'system');
        game.player.blood -= 10; game.player.gold -= 5;
        currentProv.buildings.push('grave_factory');
        log('⚰️ Построена Фабрика гробов.', 'player');
    } else if (type === 'feast_hall' && game.player.blood >= 8) {
        if (currentProv.buildings.includes('feast_hall')) return log('❌ Пировая зала уже есть.', 'system');
        game.player.blood -= 8;
        currentProv.buildings.push('feast_hall');
        log('🍷 Открыта Пировая зала.', 'player');
    } else {
        return log('❌ Недостаточно ресурсов.', 'system');
    }
    game.player.ap -= 1;
    updateUI();
}

function recruitEliteMTW() {
    if (!canAct()) return;
    if (game.player.gold < 5 || game.player.blood < 5) return log('❌ Нет золота/крови. Элита стоит 5 ед. каждого.', 'system');
    game.player.gold -= 5; game.player.blood -= 5;
    game.player.elites += 1;
    game.player.ap -= 1;
    log('🧛 Вампир-элитник в армии! Всего элиты: ' + game.player.elites, 'player');
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

// ================= ДЕЙСТВИЯ ИИ (ЭКСПАНСИЯ) =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    
    // 1. Строительство
    const aiArmyProv = game.provinces.find(p => p.id === game.ai.army.location);
    if (game.ai.gold >= 10 && aiArmyProv && aiArmyProv.owner === 'ai' && !aiArmyProv.buildings.includes('church')) {
        aiArmyProv.buildings.push('church');
        game.ai.gold -= 10;
        log('⛪ Ватикан построил Церковь в ' + aiArmyProv.name, 'ai');
    }

    // 2. Найм рыцарей
    if (game.ai.gold >= 5 && game.ai.blood >= 2) {
        game.ai.gold -= 5; game.ai.blood -= 2;
        game.ai.elites += 2;
        log('⚔️ Ватикан нанял 2-х Рыцарей Света.', 'ai');
    }

    // 3. Боевые действия (Агрессивное продвижение к игроку)
    if (aiArmyProv) {
        const neighbors = aiArmyProv.neighbors;
        // Ищем ближайшую провинцию игрока
        const targets = game.provinces.filter(p => neighbors.includes(p.id) && p.owner === 'player');
        
        if (targets.length > 0) {
            const target = targets[0]; 
            if (target.siegeBy === null) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан начал осаду ${target.name}!`, 'ai');
            } else {
                log(`⚔️ Ватикан штурмует ${target.name}`, 'ai');
                resolveCombat('ai', target);
                if (target.owner === 'ai') target.siegeBy = null; // Снимаем осаду при захвате
            }
        } else {
            // Если врагов рядом нет, ИИ двигает армию к соседней провинции с врагом
            const frontierTarget = game.provinces.find(p => p.owner === 'player' && p.neighbors.some(id => game.provinces.find(prov => prov.id === id && prov.owner === 'ai')));
            if (frontierTarget) {
                // Телепортируем армию в ближайшую соседнюю провинцию ИИ к врагу
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

// ================= КОНЕЦ ХОДА ИГРОКА =================
function endPlayerTurn() {
    if (game.gameOver) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai');
    
    collectIncome();
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
    const msg = winner === 'player' ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ!';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
    document.getElementById('bg-layer').style.opacity = '0.8';
    document.getElementById('bg-layer').style.backgroundImage = "url('bg_moon.jpg')";
    updateUI();
}

function canAct() { return !game.gameOver && game.player.ap > 0; }

// ================= ОТРИСОВКА КАРТЫ И ТУМАН ВОЙНЫ =================
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
        ctx.beginPath();
        const hSize = 45;
        for (let i = 0; i < 6; i++) {
            let angle = Math.PI / 3 * i - Math.PI / 6;
            let x = prov.x + hSize * Math.cos(angle);
            let y = prov.y + hSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        if (game.fogOfWar && !isVisible) {
            ctx.fillStyle = '#080302'; // Черный туман
            ctx.strokeStyle = '#080302';
            ctx.fill(); ctx.stroke();
            return;
        }

        if (prov.owner === 'player') { ctx.fillStyle = '#5a1616'; ctx.strokeStyle = '#d4af37'; }
        else if (prov.owner === 'ai') { ctx.fillStyle = '#2d2d2d'; ctx.strokeStyle = '#c9a84c'; }
        else { ctx.fillStyle = '#1a100c'; ctx.strokeStyle = '#3a2a25'; }

        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'center';
        ctx.fillText(prov.name, prov.x, prov.y - 10);
        ctx.fillStyle = '#aaa'; ctx.font = '9px Cinzel';
        let stats = `Гарн:${prov.garrison}`;
        if (prov.buildings && prov.buildings.length > 0) stats += ` [${prov.buildings.join(', ')}]`;
        ctx.fillText(stats, prov.x, prov.y + 15);

        // Осадные рамки
        if (prov.siegeBy === 'player') {
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        } else if (prov.siegeBy === 'ai') {
            ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80); ctx.setLineDash([]); ctx.lineWidth = 1;
        }
    });

    // Отрисовка армий (С защитой от "сломанных" спрайтов)
    const playerProv = game.provinces.find(p => p.id === game.player.army.location);
    const aiProv = game.provinces.find(p => p.id === game.ai.army.location);
    
    if (playerProv) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) {
            ctx.drawImage(sprites.player, playerProv.x - 20, playerProv.y - 40, 40, 60);
        } else {
            ctx.fillStyle = '#5c0000'; ctx.beginPath(); ctx.arc(playerProv.x, playerProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'white'; ctx.font = 'bold 10px Cinzel'; ctx.fillText('Армия Тьмы', playerProv.x, playerProv.y - 45);
    }

    if (aiProv) {
        if (sprites.ai.complete && sprites.ai.naturalWidth > 0) {
            ctx.drawImage(sprites.ai, aiProv.x - 20, aiProv.y - 40, 40, 60);
        } else {
            ctx.fillStyle = '#c9a84c'; ctx.beginPath(); ctx.arc(aiProv.x, aiProv.y, 15, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#e3dac9'; ctx.font = 'bold 10px Cinzel'; ctx.fillText('Армия Света', aiProv.x, aiProv.y - 45);
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.elites;
    document.getElementById('faith-counter').textContent = game.ai.faith;
    drawMap();
}

// ================= ОБРАБОТЧИКИ =================
document.getElementById('btn-recruit').addEventListener('click', recruitEliteMTW);
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiegeMTW);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

document.getElementById('build-grave').addEventListener('click', () => buildStructure('grave_factory'));
document.getElementById('build-feast').addEventListener('click', () => buildStructure('feast_hall'));
document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));

canvas.addEventListener('click', (e) => {
    if (game.gameOver) return;
    const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    for (let prov of game.provinces) {
        const dx = x - prov.x; const dy = y - prov.y;
        if (dx*dx + dy*dy < 2500) { handleProvinceClick(prov); break; }
    }
});

function handleProvinceClick(prov) {
    const isEnemy = prov.owner !== 'player' && prov.owner !== null;
    if (isEnemy && game.player.ap > 0) {
        if (prov.siegeBy === null) {
            prov.siegeBy = 'player'; game.player.army.location = prov.id;
            log(`🏰 ${prov.name} взят в осаду!`, 'player'); game.player.ap--;
        } else if (prov.siegeBy === 'player' && game.player.army.location === prov.id) {
            log(`💥 Штурм ${prov.name}!`, 'player');
            resolveCombat('player', prov);
            if (prov.owner === 'player') prov.siegeBy = null;
            game.player.ap--;
        } else log(`❌ Вы не можете атаковать эту провинцию прямо сейчас.`, 'system');
        updateUI();
    } else if (prov.owner === 'player') {
        game.selectedProvinceId = prov.id; updateUI();
    }
}

// ЗАПУСК
function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
gameLoop();
log('🌙 Добро пожаловать в Трансильванию. Ватикан готовит крестовый поход...', 'system');
collectIncome();
updateUI();
