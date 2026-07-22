// 1. Инициализация спрайтов и фона
const sprites = {
    player: new Image(), // Рыцарь Ватикана
    ai: new Image(),     // Вампир
    rider: new Image(),  // Всадник на коне
};

// Укажите здесь имена ваших загруженных изображений
sprites.player.src = 'knight.png';
sprites.ai.src = 'vampire.png';
sprites.rider.src = 'rider.png';

// 2. Состояние игры (исправлена структура)
let game = {
    turn: 1,
    day: 1,
    gameOver: false,
    selectedProvinceId: null,
    player: {
        ap: 2,
        maxAp: 2,
        gold: 5,
        blood: 5,
        elites: 0, // Глобальное поле элиты, исправлена ошибка №2
        army: { power: 2, location: 4 },
        provinces: []
    },
    ai: {
        elites: 0,
        army: { power: 2, location: 1 },
        provinces: []
    },
    // 3. Карта провинций (вдохновение Total War - полигоны Европы)
    provinces: [
        { id: 1, name: 'Бавария', owner: 'ai', x: 300, y: 200, garrison: 1, siegeBy: null },
        { id: 2, name: 'Австрия', owner: 'ai', x: 400, y: 220, garrison: 2, siegeBy: null },
        { id: 3, name: 'Венгрия', owner: 'ai', x: 480, y: 250, garrison: 1, siegeBy: null },
        { id: 4, name: 'Трансильвания', owner: 'player', x: 500, y: 300, garrison: 3, siegeBy: null, isPlayerStart: true },
        { id: 5, name: 'Валахия', owner: 'ai', x: 550, y: 340, garrison: 1, siegeBy: null },
        { id: 6, name: 'Молдавия', owner: 'ai', x: 580, y: 300, garrison: 2, siegeBy: null }
    ]
};

// Вспомогательная функция вывода в лог
function log(message, type = 'system') {
    const container = document.getElementById('log-container');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
}

// 4. Игровая механика (Исправление ошибки №1: Пассивный доход)
function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            game.player.gold += 2;
            game.player.blood += 1;
            if (prov.garrison) game.player.blood += prov.garrison; // Бонус за гарнизон
        } else if (prov.owner === 'ai') {
            game.ai.gold += 2;
            game.ai.blood += 1;
        }
    });
    updateUI();
}

// 5. Механика боя
function fight(attacker, defender) {
    let attackerPower = attacker.army.power + (attacker === game.player ? game.player.elites * 5 : game.ai.elites * 5);
    let defenderPower = defender.army.power + defender.garrison; // Гарнизон тоже обороняется
    
    log(`⚔️ Сила атаки: ${attackerPower} против ${defenderPower}`, 'system');
    return attackerPower > defenderPower;
}

// 6. Ошибка №2: Исправление найма элиты
function recruitElite() {
    if (!canAct()) return;
    if (game.player.gold < 3 || game.player.blood < 3) {
        log('❌ Недостаточно золота (3) и крови (3) для найма элиты!', 'system');
        return;
    }
    game.player.gold -= 3;
    game.player.blood -= 3;
    game.player.elites++; // Исправлено: увеличивается глобальный счетчик
    game.player.ap--;
    log('🧛‍♂️ Нанят элитный воин. Общая элита: ' + game.player.elites, 'player');
    updateUI();
}

// 7. Ошибка №4: Отмена осады и движение армии в ближайшую свою провинцию
function cancelSiege() {
    if (!canAct()) return;
    const currentProv = game.provinces.find(p => p.id === game.player.army.location);
    if (!currentProv || currentProv.siegeBy !== 'player') {
        log('❌ Армия не находится в осаде здесь.', 'system');
        return;
    }
    currentProv.siegeBy = null;
    
    // Исправлено: ищем ближайшую свою провинцию вместо жесткого id=13
    const playerProvs = game.provinces.filter(p => p.owner === 'player');
    if (playerProvs.length === 0) {
        log('💀 У вас нет провинций! Армия рассеяна.', 'system');
        gameOver('ai');
        return;
    }
    // Просто берем первую попавшуюся свою провинцию для выхода (можно заменить на поиск ближайшей по координатам)
    game.player.army.location = playerProvs[0].id; 
    log(`🚩 Осада снята. Армия отступила в ${playerProvs[0].name}`, 'player');
    game.player.ap--;
    updateUI();
}

// 8. Конец хода игрока (Ошибка №3: проверка на потерю провинций)
function endPlayerTurn() {
    if (game.gameOver) return;
    
    // Если у игрока 0 провинций, он проиграл
    if (game.provinces.filter(p => p.owner === 'player').length === 0) {
        gameOver('ai');
        return;
    }

    game.player.ap = game.player.maxAp;
    game.turn++;
    if (game.turn % 2 === 1) game.day++;
    log(`⏩ ХОД: ${game.turn} | ДЕНЬ: ${game.day}`, 'system');
    
    // Начисление дохода в начале хода игрока
    collectIncome();
    
    aiTurn();
}

// 9. Искусственный интеллект (ИИ)
function aiTurn() {
    log('🧛 ИИ делает ход...', 'ai');
    
    // Сбор дохода ИИ
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 3;
    
    // ИИ нанимает элиту, если есть деньги (исправлено, чтобы влияло на бой)
    if (game.ai.gold >= 5) {
        game.ai.elites++;
        game.ai.gold -= 5;
        log('🧛 ИИ нанял священника (элита ИИ +1)', 'ai');
    }

    // ИИ атакует ближайшую соседнюю провинцию игрока
    const aiProv = game.provinces.find(p => p.id === game.ai.army.location);
    const neighbors = game.provinces.filter(p => p.owner === 'player');
    
    if (neighbors.length > 0) {
        const target = neighbors[0]; // Упрощенно атакует первую доступную
        if (target.garrison === 0 && target.siegeBy === null) {
            log(`⚔️ ИИ атакует ${target.name}`, 'ai');
            if (fight(game.ai, game.player)) {
                target.owner = 'ai';
                target.garrison = 0;
                game.ai.army.location = target.id;
                log(`🏰 ИИ захватил ${target.name}!`, 'ai');
                checkGameConditions();
            } else {
                log(`🛡️ ИИ не смог захватить ${target.name}. Оборона устояла.`, 'ai');
                target.garrison -= 1; // Потери защитников
            }
        } else if (target.siegeBy !== 'ai') {
            target.siegeBy = 'ai';
            log(`🏰 ИИ начал осаду ${target.name}`, 'ai');
        }
    }
    updateUI();
    checkGameConditions();
}

// 10. Проверка условий победы/поражения
function checkGameConditions() {
    const playerProvinces = game.provinces.filter(p => p.owner === 'player').length;
    const aiProvinces = game.provinces.filter(p => p.owner === 'ai').length;
    
    if (playerProvinces === 0) gameOver('ai');
    if (aiProvinces === 0) gameOver('player');
    if (aiProvinces >= 10) gameOver('ai'); // Условие из скриншота
}

function gameOver(winner) {
    if (game.gameOver) return;
    game.gameOver = true;
    const msg = winner === 'player' ? 'ПОБЕДА! Империя Теней повержена!' : 'ПОРАЖЕНИЕ! Тьма поглотила ваши земли...';
    log(`💀 ${msg}`, winner === 'player' ? 'player' : 'ai');
    document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
    updateUI();
}

// 11. Проверка на возможность действия
function canAct() {
    return !game.gameOver && game.player.ap > 0 && !game.turnLock;
}

// 12. Отрисовка карты и юнитов на Canvas (Вдохновение Medieval Total War)
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем гексагональные провинции
    game.provinces.forEach(prov => {
        ctx.beginPath();
        // Создаем форму шестиугольника (упрощенная визуализация)
        const hSize = 40;
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
            ctx.fillStyle = '#5a1616'; // Темно-красный для игрока (как на скрине)
            ctx.strokeStyle = '#d4af37'; // Золотая кайма
        } else if (prov.owner === 'ai') {
            ctx.fillStyle = '#333333'; // Темно-серый для ИИ
            ctx.strokeStyle = '#666';
        } else {
            ctx.fillStyle = '#221a15';
            ctx.strokeStyle = '#3a2a25';
        }
        ctx.fill();
        ctx.stroke();
        
        // Подпись провинции
        ctx.fillStyle = '#d4af37';
        ctx.font = '10px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText(prov.name, prov.x, prov.y);
        
        // Отрисовка гарнизона
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Гарн:${prov.garrison}`, prov.x, prov.y + 15);

        // Отрисовка осады
        if (prov.siegeBy === 'player') {
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 4;
            ctx.strokeRect(prov.x - 30, prov.y - 30, 60, 60);
            ctx.lineWidth = 1;
        } else if (prov.siegeBy === 'ai') {
            ctx.strokeStyle = '#cc0000';
            ctx.lineWidth = 4;
            ctx.strokeRect(prov.x - 30, prov.y - 30, 60, 60);
            ctx.lineWidth = 1;
        }
    });

    // Отрисовка армий (Спрайты - Рыцарь, Вампир)
    const playerProv = game.provinces.find(p => p.id === game.player.army.location);
    const aiProv = game.provinces.find(p => p.id === game.ai.army.location);
    
    if (playerProv && sprites.player.complete) {
        ctx.drawImage(sprites.player, playerProv.x - 15, playerProv.y - 25, 30, 45);
        ctx.fillStyle = 'white';
        ctx.fillText('Армия', playerProv.x, playerProv.y - 30);
    } else if (playerProv) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(playerProv.x, playerProv.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    if (aiProv && sprites.ai.complete) {
        ctx.drawImage(sprites.ai, aiProv.x - 15, aiProv.y - 25, 30, 45);
        ctx.fillStyle = 'red';
        ctx.fillText('Армия ИИ', aiProv.x, aiProv.y - 30);
    } else if (aiProv) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(aiProv.x, aiProv.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 13. Обновление UI
function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.elites;
    drawMap();
}

// 14. Обработчики событий
document.getElementById('btn-recruit').addEventListener('click', recruitElite);
document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiege);
document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

// Обработка кликов по карте (Исправление ошибки №6 - использование алгоритма "Точка в полигоне")
canvas.addEventListener('click', (e) => {
    if (game.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Упрощенная проверка попадания (для демо, можно заменить на точный алгоритм Ray Casting)
    // Здесь мы используем квадратичную проверку вокруг центров провинций для удобства
    for (let prov of game.provinces) {
        const dx = x - prov.x;
        const dy = y - prov.y;
        if (dx*dx + dy*dy < 1600) { // Радиус 40px
            game.selectedProvinceId = prov.id;
            log(`📌 Выбрана провинция ${prov.name} (Владелец: ${prov.owner})`, 'system');
            handleProvinceClick(prov);
            break;
        }
    }
});

function handleProvinceClick(prov) {
    if (prov.owner === 'player' && prov.id === game.player.army.location) {
        // Если армия стоит в своей провинции
    } else if (prov.owner === 'ai' && game.player.ap > 0) {
        // Атака на провинцию ИИ
        if (prov.siegeBy === null) {
            prov.siegeBy = 'player';
            game.player.army.location = prov.id;
            log(`🏰 Начата осада ${prov.name}!`, 'player');
            game.player.ap--;
        } else if (prov.siegeBy === 'player') {
            log(`💥 ${prov.name} уже в осаде. Нажмите "ШТУРМ", чтобы атаковать.`, 'system');
        }
        updateUI();
    }
}

// 15. Запуск игры
// Периодическая перерисовка, если спрайты загружаются асинхронно
function gameLoop() {
    if (!game.gameOver) drawMap();
    requestAnimationFrame(gameLoop);
}

gameLoop();
log('🧛 Война теней начинается... Ваш ход!', 'system');
collectIncome(); // Первый сбор дохода
updateUI();
