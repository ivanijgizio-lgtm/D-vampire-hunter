(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ---------- ИГРОВЫЕ КОНСТАНТЫ ----------
    const PROVINCE_DATA = [
        { id: 0, name: 'Англия', x: 80, y: 75, w: 110, h: 85, neighbors: [1, 4] },
        { id: 1, name: 'Швеция', x: 240, y: 55, w: 120, h: 100, neighbors: [0, 2, 5] },
        { id: 2, name: 'Польша', x: 390, y: 70, w: 130, h: 100, neighbors: [1, 3, 5, 6] },
        { id: 3, name: 'Пруссия', x: 560, y: 85, w: 115, h: 100, neighbors: [2, 6, 7] },
        { id: 4, name: 'Франция', x: 70, y: 200, w: 140, h: 115, neighbors: [0, 5, 9, 10] },
        { id: 5, name: 'Саксония', x: 250, y: 190, w: 125, h: 110, neighbors: [1, 2, 4, 6, 10] },
        { id: 6, name: 'Богемия', x: 410, y: 200, w: 125, h: 105, neighbors: [2, 3, 5, 7, 11] },
        { id: 7, name: 'Венгрия', x: 570, y: 220, w: 150, h: 105, neighbors: [3, 6, 8, 11, 12, 13] },
        { id: 8, name: 'Молдавия', x: 760, y: 235, w: 105, h: 100, neighbors: [7, 13, 14] },
        { id: 9, name: 'Кастилия', x: 40, y: 360, w: 125, h: 105, neighbors: [4, 10, 15] },
        { id: 10, name: 'Швабия', x: 205, y: 340, w: 130, h: 105, neighbors: [4, 5, 9, 11, 15, 16] },
        { id: 11, name: 'Бавария', x: 365, y: 340, w: 125, h: 105, neighbors: [6, 7, 10, 12] },
        { id: 12, name: 'Австрия', x: 520, y: 355, w: 130, h: 105, neighbors: [7, 11, 13, 15] },
        { id: 13, name: 'Трансильвания', x: 685, y: 375, w: 145, h: 115, neighbors: [7, 8, 12, 14, 17] },
        { id: 14, name: 'Валахия', x: 860, y: 385, w: 95, h: 100, neighbors: [8, 13, 17] },
        { id: 15, name: 'Папская область', x: 115, y: 490, w: 115, h: 105, neighbors: [9, 10, 12, 16] },
        { id: 16, name: 'Неаполь', x: 270, y: 480, w: 120, h: 110, neighbors: [10, 15, 17] },
        { id: 17, name: 'Османская империя', x: 430, y: 490, w: 260, h: 120, neighbors: [13, 14, 16] }
    ];

    const TOTAL_PROVINCES = PROVINCE_DATA.length;
    const PLAYER_START_ID = 13;
    const AI_START_IDS = [12, 15, 4];

    // 🔊 МУЗЫКА
    let audioCtx = null;
    let musicOn = true;
    let musicInterval = null;

    const DAY_MELODY = [
        [523.25, 0.15], [587.33, 0.15], [659.25, 0.2], [523.25, 0.15],
        [659.25, 0.15], [698.46, 0.15], [783.99, 0.3],
        [783.99, 0.15], [659.25, 0.15], [587.33, 0.2], [523.25, 0.3]
    ];

    const NIGHT_MELODY = [
        [220, 0.2], [277.18, 0.2], [329.63, 0.25], [220, 0.2],
        [277.18, 0.2], [329.63, 0.2], [369.99, 0.35],
        [329.63, 0.15], [277.18, 0.15], [246.94, 0.2], [220, 0.4]
    ];

    const VICTORY_MELODY = [
        [523.25, 0.1], [659.25, 0.1], [783.99, 0.1], [1046.5, 0.3],
        [783.99, 0.1], [1046.5, 0.3]
    ];

    // ---------- СОСТОЯНИЕ ИГРЫ ----------
    let gameState = {
        turn: 1,
        isNight: false,
        playerBlood: 3,
        aiFaith: 5,
        crusadeActive: 0,
        ghoulArmies: [],
        playerArmy: { location: PLAYER_START_ID, power: 12, maxPower: 12, vampireTurns: 0 },
        aiArmies: [
            { id: 0, location: 12, power: 8, name: 'Армия Вены' },
            { id: 1, location: 15, power: 10, name: 'Гвардия Рима' },
            { id: 2, location: 4, power: 7, name: 'Французский легион' }
        ],
        provinces: PROVINCE_DATA.map(p => ({
            ...p,
            owner: 'neutral',
            isDark: false,
            isHoly: false,
            vampireTurns: 0,
            hasCathedral: false
        })),
        gameOver: false,
        winner: null,
        messageLog: ['Дракула пробуждается в Трансильвании...']
    };

    // Инициализация владельцев
    gameState.provinces[PLAYER_START_ID].owner = 'player';
    gameState.provinces[PLAYER_START_ID].isDark = true;
    AI_START_IDS.forEach(id => {
        gameState.provinces[id].owner = 'ai';
        gameState.provinces[id].isHoly = true;
    });
    gameState.provinces[15].hasCathedral = true;

    // ---------- МУЗЫКАЛЬНЫЕ ФУНКЦИИ ----------
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playMelody(melody) {
        if (!audioCtx || !musicOn) return;
        const now = audioCtx.currentTime;
        let timeOffset = 0;
        melody.forEach(([freq, dur]) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + timeOffset);
            gain.gain.setValueAtTime(0.08, now + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + dur - 0.01);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + dur);
            timeOffset += dur;
        });
    }

    function startMusicLoop() {
        if (musicInterval) clearInterval(musicInterval);
        if (!musicOn || gameState.gameOver) return;
        const melody = gameState.isNight ? NIGHT_MELODY : DAY_MELODY;
        const loopDuration = melody.reduce((sum, [, dur]) => sum + dur, 0) * 1000 + 200;
        const playOnce = () => {
            if (!musicOn || gameState.gameOver) {
                clearInterval(musicInterval);
                return;
            }
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            playMelody(melody);
        };
        playOnce();
        musicInterval = setInterval(playOnce, loopDuration);
    }

    function stopMusic() {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    function toggleMusic() {
        musicOn = !musicOn;
        document.getElementById('musicToggleBtn').textContent = musicOn ? '🎵 МУЗЫКА' : '🔇 БЕЗ ЗВУКА';
        if (musicOn) startMusicLoop();
        else stopMusic();
    }

    function playVictoryMusic() {
        stopMusic();
        if (musicOn) {
            initAudio();
            playMelody(VICTORY_MELODY);
        }
    }

    // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
    function addLog(msg) {
        gameState.messageLog.unshift(msg);
        if (gameState.messageLog.length > 5) gameState.messageLog.pop();
        document.getElementById('logPanel').innerHTML = '📜 ' + gameState.messageLog.join(' &nbsp;|&nbsp; ');
    }

    function isAdjacent(provId1, provId2) {
        const p1 = gameState.provinces.find(p => p.id === provId1);
        return p1 ? p1.neighbors.includes(provId2) : false;
    }

    function getProvinceById(id) {
        return gameState.provinces.find(p => p.id === id);
    }

    function updateUI() {
        document.getElementById('turnDisplay').textContent = gameState.turn;
        document.getElementById('dayNightIcon').innerHTML = gameState.isNight ? '🌙 НОЧЬ' : '☀️ ДЕНЬ';
        document.getElementById('bloodAmount').textContent = gameState.playerBlood;
        document.getElementById('faithAmount').textContent = gameState.aiFaith;
        const darkCount = gameState.provinces.filter(p => p.owner === 'player').length;
        const percent = Math.floor((darkCount / TOTAL_PROVINCES) * 100);
        document.getElementById('capturePercent').textContent = percent + '%';
        document.getElementById('spawnGhoulBtn').disabled = gameState.playerBlood < 10 || gameState.gameOver;
    }

    // ---------- БОЕВЫЕ МОДИФИКАТОРЫ ----------
    function getCombatModifiers(attackerIsPlayer, defenderIsPlayer, provinceId) {
        const prov = getProvinceById(provinceId);
        let attackMod = 1.0;
        let defenseMod = 1.0;
        if (prov.isDark) {
            if (attackerIsPlayer) attackMod *= 10.0;
            if (defenderIsPlayer) defenseMod *= 10.0;
        }
        if (prov.isHoly) {
            if (attackerIsPlayer) attackMod *= 0.5;
            if (defenderIsPlayer) defenseMod *= 0.5;
            if (prov.hasCathedral) {
                if (attackerIsPlayer) attackMod *= 0.4;
            }
        }
        if (gameState.isNight) {
            if (attackerIsPlayer) attackMod *= 1.5;
        } else {
            if (attackerIsPlayer && prov.isHoly) attackMod *= 0.7;
        }
        if (gameState.crusadeActive > 0) {
            if (!attackerIsPlayer) attackMod *= 2.0;
            if (defenderIsPlayer) defenseMod *= 0.8;
        }
        return { attackMod, defenseMod };
    }

    function resolveBattle(attackerPower, defenderPower, provinceId, attackerIsPlayer) {
        const mods = getCombatModifiers(attackerIsPlayer, !attackerIsPlayer, provinceId);
        const finalAttack = Math.floor(attackerPower * mods.attackMod);
        const finalDefense = Math.floor(defenderPower * mods.defenseMod);
        addLog(`⚔️ Бой! Атака ${finalAttack} vs Защита ${finalDefense}`);
        return finalAttack > finalDefense;
    }

    function movePlayerToProvince(targetId) {
        if (gameState.gameOver) return;
        const currentLoc = gameState.playerArmy.location;
        if (!isAdjacent(currentLoc, targetId) && currentLoc !== targetId) {
            addLog('⛔ Эта провинция не граничит с вашей!');
            return false;
        }
        const targetProv = getProvinceById(targetId);
        if (targetProv.owner === 'player') {
            gameState.playerArmy.location = targetId;
            addLog(`🦇 Дракула переместился в ${targetProv.name}`);
            drawAll();
            return true;
        }
        let defenderPower = 0;
        if (targetProv.owner === 'ai') {
            const aiArmy = gameState.aiArmies.find(a => a.location === targetId);
            defenderPower = aiArmy ? aiArmy.power : 3;
        } else {
            defenderPower = 4;
        }
        const victory = resolveBattle(gameState.playerArmy.power, defenderPower, targetId, true);
        if (victory) {
            targetProv.owner = 'player';
            targetProv.isDark = true;
            targetProv.isHoly = false;
            targetProv.hasCathedral = false;
            targetProv.vampireTurns = 0;
            gameState.playerArmy.location = targetId;
            gameState.playerArmy.power = Math.min(gameState.playerArmy.maxPower, gameState.playerArmy.power + 1);
            addLog(`🩸 ${targetProv.name} захвачена Тьмой!`);
            gameState.aiArmies = gameState.aiArmies.filter(a => a.location !== targetId);
        } else {
            gameState.playerArmy.power -= 2;
            addLog(`💔 Атака на ${targetProv.name} провалилась. Дракула отступает.`);
            if (gameState.playerArmy.power <= 0) {
                gameState.gameOver = true;
                gameState.winner = 'ai';
                addLog('💀 Дракула повержен! Инквизиция торжествует.');
                stopMusic();
                playVictoryMusic();
            }
        }
        checkPlayerVictory();
        drawAll();
        updateUI();
        return true;
    }

    function aiTurn() {
        if (gameState.gameOver) return;
        gameState.aiFaith += gameState.provinces.filter(p => p.owner === 'ai' || (p.owner === 'neutral' && p.isHoly)).length;
        gameState.playerBlood += gameState.provinces.filter(p => p.owner === 'player').length;
        if (gameState.aiFaith >= 10 && gameState.crusadeActive <= 0) {
            gameState.aiFaith -= 10;
            gameState.crusadeActive = 3;
            addLog('✝️ Папа объявляет КРЕСТОВЫЙ ПОХОД!');
        }
        if (gameState.crusadeActive > 0) {
            gameState.crusadeActive--;
            if (gameState.crusadeActive === 0) addLog('🕊️ Крестовый поход завершён.');
        }
        if (gameState.aiFaith >= 8) {
            const holyCandidates = gameState.provinces.filter(p => p.owner === 'ai' && !p.hasCathedral && p.isHoly);
            if (holyCandidates.length > 0) {
                const target = holyCandidates[Math.floor(Math.random() * holyCandidates.length)];
                target.hasCathedral = true;
                gameState.aiFaith -= 8;
                addLog(`⛪ Возведён Собор в ${target.name}!`);
            }
        }
        gameState.aiArmies.forEach(army => {
            const currentProv = getProvinceById(army.location);
            const neighbors = currentProv.neighbors;
            const enemyNeighbors = neighbors.filter(id => getProvinceById(id)?.owner === 'player');
            if (enemyNeighbors.length > 0) {
                const targetId = enemyNeighbors[0];
                const targetProv = getProvinceById(targetId);
                let playerDefPower = gameState.playerArmy.location === targetId ? gameState.playerArmy.power : 5;
                const victory = resolveBattle(army.power, playerDefPower, targetId, false);
                if (victory) {
                    targetProv.owner = 'ai';
                    targetProv.isDark = false;
                    targetProv.isHoly = true;
                    army.location = targetId;
                    army.power = Math.min(army.power + 1, 15);
                    addLog(`🛡️ ${army.name} освободил(а) ${targetProv.name}!`);
                    if (gameState.playerArmy.location === targetId) {
                        gameState.playerArmy.power -= 3;
                        gameState.playerArmy.location = PLAYER_START_ID;
                        if (gameState.playerArmy.power <= 0) {
                            gameState.gameOver = true;
                            gameState.winner = 'ai';
                            addLog('💀 Дракула пал в бою!');
                            stopMusic();
                            playVictoryMusic();
                        }
                    }
                }
                return;
            }
            const darkProvs = gameState.provinces.filter(p => p.owner === 'player');
            if (darkProvs.length > 0) {
                const targetDark = darkProvs[0];
                const pathNeighbor = neighbors.find(n => isAdjacent(n, targetDark.id));
                if (pathNeighbor && getProvinceById(pathNeighbor).owner !== 'ai') {
                    army.location = pathNeighbor;
                    addLog(`🚩 ${army.name} выдвинулся к ${getProvinceById(pathNeighbor).name}`);
                }
            }
        });
        const playerProv = getProvinceById(gameState.playerArmy.location);
        if (playerProv && playerProv.isHoly) {
            gameState.playerArmy.vampireTurns = (gameState.playerArmy.vampireTurns || 0) + 1;
            if (gameState.playerArmy.vampireTurns > 2) {
                gameState.playerArmy.power -= 2;
                addLog('🔥 Святая земля жжёт Дракулу!');
            }
        } else {
            gameState.playerArmy.vampireTurns = 0;
        }
        checkPlayerVictory();
    }

    function checkPlayerVictory() {
        const owned = gameState.provinces.filter(p => p.owner === 'player').length;
        if (owned >= Math.floor(TOTAL_PROVINCES * 0.8) && !gameState.gameOver) {
            gameState.gameOver = true;
            gameState.winner = 'player';
            addLog('🦇 Дракула покорил Европу! Папа бежит в Новый Свет.');
            stopMusic();
            playVictoryMusic();
        }
    }

    function nextTurn() {
        if (gameState.gameOver) return;
        aiTurn();
        gameState.turn++;
        gameState.isNight = gameState.turn % 2 === 0;
        updateUI();
        drawAll();
        if (musicOn && !gameState.gameOver) startMusicLoop();
        if (gameState.gameOver) {
            document.getElementById('nextTurnBtn').disabled = true;
        }
    }

    function spawnGhoul() {
        if (gameState.playerBlood < 10 || gameState.gameOver) return;
        gameState.playerBlood -= 10;
        const darkProvs = gameState.provinces.filter(p => p.owner === 'player');
        if (darkProvs.length > 0) {
            const target = darkProvs[Math.floor(Math.random() * darkProvs.length)];
            gameState.ghoulArmies.push({ location: target.id, power: 3 });
            addLog(`🧟 Вурдалак призван в ${target.name}!`);
        }
        updateUI();
        drawAll();
    }

    // ---------- РИСОВАНИЕ (8-BIT PIXEL ART) ----------
    function drawPixelBackground() {
        ctx.fillStyle = '#dac29c';
        ctx.fillRect(0, 0, 1000, 700);
        for (let i = 0; i < 600; i++) {
            const x = Math.floor(Math.random() * 1000);
            const y = Math.floor(Math.random() * 700);
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 1000, Math.random() * 700);
            ctx.lineTo(Math.random() * 1000, Math.random() * 700);
            ctx.stroke();
        }
    }

    function drawProvince(prov) {
        const { x, y, w, h } = prov;
        ctx.save();
        ctx.shadowColor = '#00000040';
        ctx.shadowBlur = 6;
        if (prov.owner === 'player') {
            ctx.fillStyle = '#4a0e1c';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = 'rgba(180, 30, 30, 0.3)';
            for (let i = 0; i < 8; i++) {
                const dx = Math.floor(Math.random() * w);
                const dy = Math.floor(Math.random() * h);
                ctx.fillRect(x + dx, y + dy, 6, 6);
            }
        } else if (prov.owner === 'ai') {
            ctx.fillStyle = '#2e4a6b';
            ctx.fillRect(x, y, w, h);
            if (prov.isHoly) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
                for (let i = 0; i < 6; i++) {
                    const dx = Math.floor(Math.random() * w);
                    const dy = Math.floor(Math.random() * h);
                    ctx.fillRect(x + dx, y + dy, 5, 5);
                }
            }
        } else {
            ctx.fillStyle = '#5e5b52';
            ctx.fillRect(x, y, w, h);
        }
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#2f2416';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        ctx.font = 'bold 11px "Courier New"';
        ctx.fillStyle = '#fdf5e6';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(prov.name, x + 8, y + h - 8);
        ctx.shadowBlur = 0;
        if (prov.hasCathedral) {
            drawPixelCathedral(x + w/2 - 8, y + h/2 - 12);
        } else if (prov.owner === 'player') {
            drawPixelCastle(x + w/2 - 8, y + h/2 - 10);
        } else if (prov.owner === 'ai') {
            drawPixelCathedral(x + w/2 - 8, y + h/2 - 12);
        } else {
            drawPixelVillage(x + w/2 - 6, y + h/2 - 8);
        }
        ctx.restore();
    }

    function drawPixelCastle(cx, cy) {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(cx, cy+8, 16, 10);
        ctx.fillRect(cx-2, cy+4, 20, 6);
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(cx+4, cy+2, 8, 4);
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(cx+6, cy-2, 4, 6);
    }

    function drawPixelCathedral(cx, cy) {
        ctx.fillStyle = '#f5e6d3';
        ctx.fillRect(cx+2, cy+8, 12, 10);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(cx+6, cy, 4, 12);
        ctx.fillRect(cx, cy+4, 16, 4);
    }

    function drawPixelVillage(cx, cy) {
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(cx+2, cy+6, 8, 8);
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(cx, cy+2, 12, 6);
    }

    function drawDraculaSprite(x, y) {
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y, 10, 14);
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x-2, y+2, 4, 10);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(x+3, y-2, 4, 4);
    }

    function drawInquisitorSprite(x, y) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, 10, 14);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x+6, y+2, 4, 10);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x+2, y-3, 2, 6);
        ctx.fillRect(x+5, y-1, 2, 4);
    }

    function drawGhoulSprite(x, y) {
        ctx.fillStyle = '#2f4f2f';
        ctx.fillRect(x, y, 8, 10);
        ctx.fillStyle = '#556b2f';
        ctx.fillRect(x-1, y-2, 10, 4);
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x+2, y+2, 3, 3);
    }

    function drawUnits() {
        const playerLoc = getProvinceById(gameState.playerArmy.location);
        if (playerLoc) {
            const px = playerLoc.x + playerLoc.w/2 - 10;
            const py = playerLoc.y + playerLoc.h/2 - 15;
            drawDraculaSprite(px, py);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px "Courier New"';
            ctx.fillText(gameState.playerArmy.power, px + 14, py + 10);
        }
        gameState.aiArmies.forEach(army => {
            const loc = getProvinceById(army.location);
            if (loc) {
                const ax = loc.x + loc.w/2 + 5;
                const ay = loc.y + loc.h/2 - 18;
                drawInquisitorSprite(ax, ay);
                ctx.fillText(army.power, ax + 14, ay + 10);
            }
        });
        gameState.ghoulArmies.forEach(g => {
            const loc = getProvinceById(g.location);
            if (loc) {
                const gx = loc.x + 15;
                const gy = loc.y + loc.h - 25;
                drawGhoulSprite(gx, gy);
                ctx.fillText(g.power, gx + 12, gy + 8);
            }
        });
    }

    function drawAll() {
        drawPixelBackground();
        gameState.provinces.forEach(p => drawProvince(p));
        drawUnits();
        if (gameState.isNight) {
            ctx.fillStyle = 'rgba(10, 10, 30, 0.3)';
            ctx.fillRect(0, 0, 1000, 700);
        }
    }

    // ---------- ИНТЕРФЕЙС И СОБЫТИЯ ----------
    const tooltip = document.getElementById('tooltip');
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        let found = null;
        for (let p of gameState.provinces) {
            if (mouseX >= p.x && mouseX <= p.x + p.w && mouseY >= p.y && mouseY <= p.y + p.h) {
                found = p;
                break;
            }
        }
        if (found) {
            const ownerStr = found.owner === 'player' ? 'Вампиры' : (found.owner === 'ai' ? 'Инквизиция' : 'Нейтралы');
            tooltip.innerHTML = [
                `🏰 ${found.name}`,
                `👑 Владелец: ${ownerStr}`,
                `🌑 Тьма: ${found.isDark ? 'Да' : 'Нет'}`,
                `✝️ Святость: ${found.isHoly ? 'Да' : 'Нет'}`,
                `⛪ Собор: ${found.hasCathedral ? 'Да' : 'Нет'}`
            ].join('<br>');
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 20) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    });

    canvas.addEventListener('click', (e) => {
        if (gameState.gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        for (let p of gameState.provinces) {
            if (mouseX >= p.x && mouseX <= p.x + p.w && mouseY >= p.y && mouseY <= p.y + p.h) {
                movePlayerToProvince(p.id);
                break;
            }
        }
    });

    document.getElementById('nextTurnBtn').addEventListener('click', nextTurn);
    document.getElementById('spawnGhoulBtn').addEventListener('click', spawnGhoul);
    document.getElementById('musicToggleBtn').addEventListener('click', toggleMusic);

    // ---------- СТАРТ ИГРЫ ----------
    updateUI();
    drawAll();
    window.addEventListener('load', () => {
        if (musicOn) startMusicLoop();
    });
    addLog('🦇 Вампиры начинают вторжение. Инквизиция на страже.');
})();
