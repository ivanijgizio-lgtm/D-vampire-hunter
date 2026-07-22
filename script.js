// ================= ЗАГРУЗКА АССЕТОВ =================
const sprites = {
    player: new Image(), // Вампир (Игрок)
    ai: new Image(),     // Рыцарь Ватикана (ИИ)
    rider: new Image(),  // Всадник
};

// Убедитесь, что имена файлов совпадают с папкой игры
sprites.player.src = 'vampire.png';
sprites.ai.src = 'knight.png';
sprites.rider.src = 'rider.png';

// ================= ДАННЫЕ ИГРЫ =================
let game = {
    turn: 1, day: 1, gameOver: false,
    selectedProvinceId: null,
    fogOfWar: true, // Включаем туман войны
    player: {
        id: 'vampire',
        ap: 2, maxAp: 2, gold: 10, blood: 10, elites: 0,
        army: { power: 3, location: 4 },
        provinces: []
    },
    ai: {
        id: 'vatican',
        elites: 0, gold: 15, blood: 5,
        army: { power: 4, location: 1 },
        provinces: [],
        // Добавляем влияние Церкви (для механики ИИ)
        faith: 0 
    },
    // Карта Центральной/Восточной Европы (соседние провинции для MTW-логики)
    provinces: [
        { id: 1, name: 'Бавария', owner: 'ai', x: 300, y: 150, garrison: 2, siegeBy: null, neighbors: [2, 9], buildings: ['church'], income: 2 },
        { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, garrison: 1, siegeBy: null, neighbors: [1, 3, 4, 9], buildings: [], income: 2 },
        { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 200, garrison: 3, siegeBy: null, neighbors: [2, 4, 5, 6, 8], buildings: ['church'], income: 3 },
        { id: 4, name: 'Трансильвания', owner: 'player', x: 530, y: 280, garrison: 4, siegeBy: null, neighbors: [2, 3, 5, 8, 10], buildings: ['dark_temple'], income: 3 }, // Дом Вампиров
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
        { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, garrison: 3, siegeBy: null, neighbors: [11], buildings: ['church', 'fortress'], income: 5 } // Цель для захвата
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

// 1. Пассивный доход + бонусы от построек (Исправлена механика накопления)
function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let bloodBonus = 1, goldBonus = 1;
            // Учет построек вампиров
            if (prov.buildings.includes('feast_hall')) bloodBonus += 3;
            if (prov.buildings.includes('dark_temple')) goldBonus += 2;
            if (prov.buildings.includes('grave_factory')) { game.player.elites += 1; } // Элита пассивно растет
            
            game.player.gold += prov.income + goldBonus;
            game.player.blood += prov.garrison + bloodBonus;

        } else if (prov.owner === 'ai') {
            let aiGoldBonus = 1;
            // Учет построек Ватикана
            if (prov.buildings.includes('church')) aiGoldBonus += 2;
            if (prov.buildings.includes('fortress')) aiGoldBonus += 3;
            
            game.ai.gold += prov.income + aiGoldBonus;
            game.ai.faith += 1; // Накапливаем Веру Ватикана
        }
    });
    updateUI();
}

// 2. Логика боя и захвата (Исправление, почему не захватывались)
function resolveCombat(attackerSide, targetProv) {
    let attackPower = 0;
    let defenderPower = targetProv.garrison;
    
    if (attackerSide === 'player') {
        attackPower = game.player.army.power + (game.player.elites * 2);
        // Если есть осада, она истощает гарнизон
        if (targetProv.siegeBy === 'player') defenderPower -= 1;
    } else {
        attackPower = game.ai.army.power + (game.ai.elites * 2);
        if (targetProv.siegeBy === 'ai') defenderPower -= 1;
    }

    // Ограничение, чтобы защита не уходила в минус
    if (defenderPower < 0) defenderPower = 1; 

    log(`⚔️ Сила атаки: ${attackPower} vs ${defenderPower} (Гарнизон)`, attackerSide === 'player' ? 'player' : 'ai');

    if (attackPower > defenderPower) {
        // Захват!
        const newOwner = attackerSide === 'player' ? 'player' : 'ai';
        log(`🏰 Захвачена провинция ${targetProv.name}!`, newOwner);
        targetProv.owner = newOwner;
        targetProv.garrison = Math.floor(attackPower / 2); // Остатки армии становятся гарнизоном
        targetProv.siegeBy = null;
        
        // Армия переезжает на новую провинцию
        if (attackerSide === 'player') game.player.army.location = targetProv.id;
        else game.ai.army.location = targetProv.id;
        
        checkGameConditions();
        return true;
    } else {
        log(`🛡️ Атака отбита! Защитники устояли, потеряв часть гарнизона.`, attackerSide === 'player' ? 'player' : 'ai');
        targetProv.garrison -= Math.floor(attackPower / 2);
        if (targetProv.garrison < 1) targetProv.garrison = 1; // Минимальный гарнизон
        return false;
    }
}

// 3. Исправление: Вывод армии из осады в ближайшую свою провинцию
function findClosestOwnedProvince(ownerId, fromId) {
    const ownerProvinces = game.provinces.filter(p => p.owner === ownerId);
    if (ownerProvinces.length === 0) return null;
    // Выбираем первую свою провинцию (можно усложнить до поиска ближайшей, но это слишком сложно для JS без библиотек)
    return ownerProvinces[0]; 
}

// ================= МЕХАНИКА ПОСТРОЕК И ДЕЙСТВИЙ (MTW) =================
function buildStructure(type) {
    if (!canAct() || game.gameOver) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.owner !== 'player') {
        log('❌ Стройте только на своей территории!', 'system');
        return;
    }

    // Цены на постройки, как в MTW (Дорого, но окупается)
    if (type === 'dark_temple' && game.player.gold >= 15) {
        if (currentProv.buildings.includes('dark_temple')) { log('❌ Здесь уже есть Храм Тьмы.', 'system'); return; }
        game.player.gold -= 15;
        currentProv.buildings.push('dark_temple');
        log('🕯️ Возведен Храм Тьмы (увеличивает золото).', 'player');
    } else if (type === 'grave_factory' && game.player.blood >= 10 && game.player.gold >= 5) {
        if (currentProv.buildings.includes('grave_factory')) { log('❌ Фабрика гробов уже есть.', 'system'); return; }
        game.player.blood -= 10; game.player.gold -= 5;
        currentProv.buildings.push('grave_factory');
        log('⚰️ Построена Фабрика гробов (элита растет сама).', 'player');
    } else if (type === 'feast_hall' && game.player.blood >= 8) {
        if (currentProv.buildings.includes('feast_hall')) { log('❌ Пировая зала уже есть.', 'system'); return; }
        game.player.blood -= 8;
        currentProv.buildings.push('feast_hall');
        log('🍷 Открыта Пировая зала (кровь капает быстрее).', 'player');
    } else {
        log('❌ Недостаточно ресурсов или постройка недоступна.', 'system');
        return;
    }
    game.player.ap -= 1;
    updateUI();
}

function recruitEliteMTW() {
    if (!canAct()) return;
    if (game.player.gold < 5 || game.player.blood < 5) {
        log('❌ Нет золота/крови. Элита стоит 5 ед. каждого.', 'system');
        return;
    }
    game.player.gold -= 5; game.player.blood -= 5;
    game.player.elites += 1; // Глобальная элита
    game.player.ap -= 1;
    log('🧛 Вампир-элитник присоединился к армии! Всего элиты: ' + game.player.elites, 'player');
    updateUI();
}

function cancelSiegeMTW() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.siegeBy !== 'player') {
        log('❌ Армия не осаждает эту провинцию.', 'system');
        return;
    }
    currentProv.siegeBy = null;
    // Ищем свою провинцию, куда отступать
    const playerProvs = game.provinces.filter(p => p.owner === 'player');
    if (playerProvs.length === 0) { gameOver('ai'); return; }
    // Отступление (исправлено для MTW: возвращаем в столицу или ближайшую свою)
    game.player.army.location = playerProvs[0].id;
    log(`🚩 Осада снята, армия отступила в ${playerProvs[0].name}.`, 'player');
    game.player.ap -= 1;
    updateUI();
}

// ================= ДЕЙСТВИЯ ИИ (ВАТИКАН) =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    
    // Сбор дохода в начале хода ИИ
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 2;
    const aiArmyProv = game.provinces.find(p => p.id === game.ai.army.location);

    // 1. ИИ строит церковь, если есть золото
    if (game.ai.gold >= 10 && aiArmyProv && aiArmyProv.owner === 'ai' && !aiArmyProv.buildings.includes('church')) {
        aiArmyProv.buildings.push('church');
        game.ai.gold -= 10;
        log('⛪ Ватикан построил Церковь в ' + aiArmyProv.name, 'ai');
    }

    // 2. ИИ нанимает элиту (Рыцари Света)
    if (game.ai.gold >= 5 && game.ai.blood >= 2) {
        game.ai.gold -= 5; game.ai.blood -= 2;
        game.ai.elites += 2; // ИИ нанимает сразу 2 рыцарей
        log('⚔️ Ватикан нанял 2-х Рыцарей Света (Элита +2)', 'ai');
    }

    // 3. ИИ атакует (Агрессивная экспансия, как в MTW)
    if (aiArmyProv) {
        // Находим все соседние провинции
        const neighbors = aiArmyProv.neighbors;
        // Фильтруем те, которые принадлежат игроку или нейтральные
        const targets = game.provinces.filter(p => neighbors.includes(p.id) && p.owner === 'player');
        
        if (targets.length > 0) {
            const target = targets[0]; // Атакует первую ближайшую
            // Если не осаждена — начинаем осаду
            if (target.siegeBy === null) {
                target.siegeBy = 'ai';
                log(`🏰 Ватикан начал осаду ${target.name}!`, 'ai');
            } else {
                // Если осаждена — штурмуем
                log(`⚔️ Ватикан штурмует ${target.name}`, 'ai');
                resolveCombat('ai', target);
                // Если провинцию отбили, армия уже переместилась в resolveCombat
            }
        } else {
            // Если врагов рядом нет, ИИ просто двигает армию к границе
            const frontierTargets = game.provinces.filter(p => p.owner !== 'ai' && p.neighbors.some(id => game.provinces.find(prov => prov.id === id && prov.owner === 'ai')));
            if (frontierTargets.length > 0) {
                // В MTW армии двигаются пошагово. Здесь мы просто телепортируем ИИ к ближайшему врагу для имитации глобальной стратегии
                const nearestEnemy = frontierTargets[0];
                const aiNeighborId = nearestEnemy.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === 'ai'));
                if (aiNeighborId) {
                    game.ai.army.location = aiNeighborId;
                    log(`🚩 Армия Ватикана подошла к границам ${nearestEnemy.name}`, 'ai');
                }
            }
        }
    }
    checkGameConditions();
    updateUI();
    // Переключение хода обратно на игрока происходит в конце хода
}

// ================= КОНЕЦ ХОДА ИГРОКА И ПРОВЕРКИ =================
function endPlayerTurn() {
    if (game.gameOver) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) {
        gameOver('ai');
        return;
    }
    
    // Начисление дохода
    collectIncome();
    game.player.ap = game.player.maxAp;
    game.turn++;
    if (game.turn % 2 === 1) game.day++;

    log(`⏩ НАЧАЛО ХОДА: ${game.turn} | ДЕНЬ: ${game.day}`, 'system');
    updateUI();
    
    // Убираем лишние AP, которые могли остаться
    game.player.ap = 2;
    
    // Передаем ход ИИ
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
    const msg = winner === 'player' ? '🏆 ПОБЕДА ВАМПИРОВ! Трансильвания правит Европой!' : '💀 ПОРАЖЕНИЕ! Рыцари Ватикана сожгли ваши земли!';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
    // Меняем фон на красную луну при поражении или победе (если загружена)
    document.getElementById('bg-layer').style.backgroundImage = "url('bg_moon.jpg')";
    updateUI();
}

function canAct() {
    return !game.gameOver && game.player.ap > 0;
}

// ================= РЕНДЕР (ОТРИСОВКА КАРТЫ И ТУМАН ВОЙНЫ) =================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Получаем список провинций игрока для тумана войны
    const playerVisibleProvIds = [];
    game.provinces.forEach(p => {
        if (p.owner === 'player') {
            playerVisibleProvIds.push(p.id);
            // Открываем соседние провинции для тумана войны
            p.neighbors.forEach(id => playerVisibleProvIds.push(id));
        }
    });

    game.provinces.forEach(prov => {
        // ТУМАН ВОЙНЫ: если провинция не видна, рисуем её темной и без деталей
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

        // Заливка цветом владельца
        if (prov.owner === 'player') {
            ctx.fillStyle = '#5a1616'; // Трансильвания (вампиры)
            ctx.strokeStyle = '#d4af37'; // Золотая кайма
        } else if (prov.owner === 'ai') {
            ctx.fillStyle = '#2d2d2d'; // Ватикан (темно-серый)
            ctx.strokeStyle = '#c9a84c'; // Золотая кайма Рима
        } else {
            ctx.fillStyle = '#1a100c';
            ctx.strokeStyle = '#3a2a25';
        }

        // Затемнение невидимых провинций (Туман войны)
        if (game.fogOfWar && !isVisible) {
            ctx.fillStyle = '#0a0605';
            ctx.strokeStyle = '#0a0605';
            ctx.fill();
            ctx.stroke();
            return; // Не рисуем детали
        }

        ctx.fill();
        ctx.stroke();
        
        // Детали UI провинции
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 11px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText(prov.name, prov.x, prov.y - 10);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '9px Cinzel';
        let stats = `Гарн:${prov.garrison}`;
        // Показываем постройки
        if (prov.buildings && prov.buildings.length > 0) {
            stats += ` [${prov.buildings.join(', ')}]`;
        }
        ctx.fillText(stats, prov.x, prov.y + 15);

        // Отрисовка осады
        if (prov.siegeBy === 'player') {
            ctx.strokeStyle = '#d4af37'; // Золотой квадрат осады вампиров
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80);
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        } else if (prov.siegeBy === 'ai') {
            ctx.strokeStyle = '#cc0000'; // Красный квадрат осады Ватикана
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(prov.x - 40, prov.y - 40, 80, 80);
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        }
    });

    // Отрисовка армий (Спрайты - Рыцарь Ватикана, Вампир)
    const playerProv = game.provinces.find(p => p.id === game.player.army.location);
    const aiProv = game.provinces.find(p => p.id === game.ai.army.location);
    
    // Игрок (Вампир)
    if (playerProv && sprites.player.complete) {
        ctx.drawImage(sprites.player, playerProv.x - 20, playerProv.y - 40, 40, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Cinzel';
        ctx.fillText('Армия Тьмы', playerProv.x, playerProv.y - 45);
    } else if (playerProv) {
        ctx.fillStyle = 'blue';
        ctx.beginPath(); ctx.arc(playerProv.x, playerProv.y, 10, 0, Math.PI * 2); ctx.fill();
    }

    // ИИ (Рыцарь Ватикана)
    if (aiProv && sprites.ai.complete) {
        ctx.drawImage(sprites.ai, aiProv.x - 20, aiProv.y - 40, 40, 60);
        ctx.fillStyle = '#e3dac9';
        ctx.font = 'bold 10px Cinzel';
        ctx.fillText('Армия Света', aiProv.x, aiProv.y - 45);
    } else if (aiProv) {
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(aiProv.x, aiProv.y, 10, 0, Math.PI * 2); ctx.fill();
    }
}

// ================= ОБНОВЛЕНИЕ ИНТЕРФЕЙСА =================
function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.elites;
    document.getElementById('faith-counter').textContent = game.ai.faith; // Отображаем веру Ватикана
    drawMap();
}

// ================= ОБРАБОТЧИКИ СОБЫТИЙ =================
document.getElementById('btn-recruit').addEventListener('click', recruitEliteMTW);
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiegeMTW);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

// Постройки
document.getElementById('build-grave').addEventListener('click', () => buildStructure('grave_factory'));
document.getElementById('build-feast').addEventListener('click', () => buildStructure('feast_hall'));
document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));

// Клик по карте (Выбор провинции для штурма/перемещения)
canvas.addEventListener('click', (e) => {
    if (game.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let prov of game.provinces) {
        const dx = x - prov.x;
        const dy = y - prov.y;
        if (dx*dx + dy*dy < 2500) { // Радиус клика увеличен
            handleProvinceClick(prov);
            break;
        }
    }
});

function handleProvinceClick(prov) {
    const isEnemy = prov.owner !== 'player' && prov.owner !== null;
    if (isEnemy && game.player.ap > 0) {
        // Штурм или начало осады
        if (prov.siegeBy === null) {
            prov.siegeBy = 'player';
            game.player.army.location = prov.id; // Двигаем армию
            log(`🏰 ${prov.name} взят в осаду!`, 'player');
            game.player.ap--;
        } else if (prov.siegeBy === 'player' && game.player.army.location === prov.id) {
            log(`💥 Штурм ${prov.name}!`, 'player');
            // Штурмуем
            resolveCombat('player', prov);
            if (prov.owner === 'player') {
                // Если захватили, снимаем осаду сами с себя
                prov.siegeBy = null;
            }
            game.player.ap--;
        } else {
            log(`❌ Вы не можете атаковать эту провинцию прямо сейчас.`, 'system');
        }
        updateUI();
    } else if (prov.owner === 'player') {
        log(`📌 Выбрана провинция ${prov.name}`, 'system');
        game.selectedProvinceId = prov.id;
        updateUI();
    }
}

// ================= ЗАПУСК ИГРЫ =================
function gameLoop() {
    if (!game.gameOver) drawMap();
    requestAnimationFrame(gameLoop);
}
gameLoop();
log('🌙 Добро пожаловать в Трансильванию. Рыцари Ватикана уже готовят крестовый поход...', 'system');
collectIncome(); // Первичный сбор дохода
updateUI();
