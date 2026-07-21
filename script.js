(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ========== КАРТА ЕВРОПЫ (полигоны) ==========
    const provincesPoly = [
        { id: 0, name: 'Англия', neighbors: [1,4], points: [[85,55],[175,60],[195,115],[155,165],[75,155],[50,105]] },
        { id: 1, name: 'Швеция', neighbors: [0,2,5], points: [[205,25],[335,40],[355,115],[285,150],[215,125],[185,75]] },
        { id: 2, name: 'Польша', neighbors: [1,3,5,6], points: [[365,50],[495,65],[525,135],[455,170],[375,145],[345,95]] },
        { id: 3, name: 'Пруссия', neighbors: [2,6,7], points: [[535,75],[675,85],[695,145],[615,165],[545,135],[515,95]] },
        { id: 4, name: 'Франция', neighbors: [0,5,9,10], points: [[55,185],[165,190],[205,265],[155,325],[65,305],[25,235]] },
        { id: 5, name: 'Саксония', neighbors: [1,2,4,6,10], points: [[215,165],[315,175],[335,255],[265,305],[195,285],[175,215]] },
        { id: 6, name: 'Богемия', neighbors: [2,3,5,7,11], points: [[355,175],[465,185],[475,265],[415,305],[345,275],[325,215]] },
        { id: 7, name: 'Венгрия', neighbors: [3,6,8,11,12,13], points: [[525,195],[675,215],[705,285],[625,325],[535,295],[505,235]] },
        { id: 8, name: 'Молдавия', neighbors: [7,13,14], points: [[715,215],[825,235],[845,305],[775,335],[705,295]] },
        { id: 9, name: 'Кастилия', neighbors: [4,10,15], points: [[25,325],[105,335],[135,415],[95,465],[35,455],[5,385]] },
        { id: 10, name: 'Швабия', neighbors: [4,5,9,11,15,16], points: [[155,335],[235,345],[255,415],[205,475],[135,465],[115,395]] },
        { id: 11, name: 'Бавария', neighbors: [6,7,10,12], points: [[355,315],[425,325],[445,395],[375,435],[315,405],[305,355]] },
        { id: 12, name: 'Австрия', neighbors: [7,11,13,15], points: [[465,335],[555,345],[575,415],[495,455],[425,425],[415,375]] },
        { id: 13, name: 'Трансильвания', neighbors: [7,8,12,14,17], points: [[625,355],[755,375],[775,455],[685,495],[585,465],[575,395]] },
        { id: 14, name: 'Валахия', neighbors: [8,13,17], points: [[785,375],[885,395],[905,465],[825,495],[745,455]] },
        { id: 15, name: 'Папская обл.', neighbors: [9,10,12,16], points: [[95,485],[175,495],[185,555],[135,595],[75,585],[55,535]] },
        { id: 16, name: 'Неаполь', neighbors: [10,15,17], points: [[195,495],[285,505],[295,575],[225,605],[155,585],[145,535]] },
        { id: 17, name: 'Османская имп.', neighbors: [13,14,16], points: [[315,505],[545,525],[575,615],[445,645],[295,615],[275,555]] }
    ];

    function centroid(poly) {
        let x = 0, y = 0;
        poly.forEach(p => { x += p[0]; y += p[1]; });
        return { x: x / poly.length, y: y / poly.length };
    }

    const MAX_AP = 2;

    // ========== СОСТОЯНИЕ ИГРЫ ==========
    let game = {
        turn: 1,
        night: false,
        blood: 5, faith: 5,
        crusade: 0,
        playerAP: MAX_AP,
        currentPlayer: 'player',
        gameOver: false, winner: null,
        log: [],
        provinces: provincesPoly.map(p => ({
            ...p,
            centroid: centroid(p.points),
            owner: 'neutral',
            garrison: 20,
            elite: 0,
            buildings: [],
            siegeTurns: 0,
            siegeBy: null
        })),
        player: {
            army: { location: 13, power: 100 },
            elites: 5
        },
        ai: {
            armies: [
                { location: 12, power: 100 },
                { location: 15, power: 100 },
                { location: 4, power: 100 }
            ],
            elites: 5
        }
    };

    // Стартовые владения
    game.provinces[13].owner = 'player';
    game.provinces[13].garrison = 50;
    game.provinces[13].elite = 5;
    [12, 15, 4].forEach(id => {
        game.provinces[id].owner = 'ai';
        game.provinces[id].garrison = 40;
        game.provinces[id].elite = 1;
    });
    game.provinces[15].buildings.push('cathedral');

    function addLog(msg) {
        game.log.unshift(msg);
        if (game.log.length > 4) game.log.pop();
        document.getElementById('logPanel').innerHTML = '📜 ' + game.log.join(' &nbsp;|&nbsp; ');
    }

    function getProv(id) { return game.provinces.find(p => p.id === id); }
    function isAdjacent(a, b) { return getProv(a)?.neighbors.includes(b); }

    // ========== РЕСУРСЫ ==========
    function collectIncome() {
        game.provinces.forEach(p => {
            if (p.owner === 'player') {
                game.blood += 1;
                if (p.buildings.includes('cemetery')) game.blood += 2;
                if (p.buildings.includes('coffin_factory')) game.blood += 3;
            } else if (p.owner === 'ai') {
                game.faith += 1;
                if (p.buildings.includes('cathedral')) game.faith += 3;
            }
        });
    }

    // ========== БОЙ ==========
    function fight(attacker, defender, provId, isPlayerAttacking) {
        const prov = getProv(provId);
        let attPower = attacker.power + attacker.elites * 5;
        let defPower = defender.power + defender.elites * 5 + prov.garrison;
        let attMod = 1, defMod = 1;
        if (prov.buildings.includes('cathedral') && !isPlayerAttacking) defMod *= 1.5;
        if (prov.buildings.includes('cemetery') && isPlayerAttacking) attMod *= 1.3;
        if (prov.siegeTurns >= 3) defMod *= 0.5;
        if (game.night && isPlayerAttacking) attMod *= 1.3;
        if (game.crusade > 0 && !isPlayerAttacking) attMod *= 2;
        const attRoll = attPower * attMod * (0.8 + Math.random() * 0.4);
        const defRoll = defPower * defMod * (0.8 + Math.random() * 0.4);
        return attRoll > defRoll;
    }

    function canAct() { return game.currentPlayer === 'player' && game.playerAP > 0 && !game.gameOver; }
    function spendAP() { game.playerAP--; updateUI(); if (game.playerAP === 0) endPlayerTurn(); }

    // ========== ДЕЙСТВИЯ ИГРОКА ==========
    function moveArmy(targetId) {
        if (!canAct()) return;
        if (!isAdjacent(game.player.army.location, targetId)) { addLog('⛔ Не граничит'); return; }
        const prov = getProv(targetId);
        // Снимаем осаду, если армия уходит
        if (prov.siegeBy === 'player') {
            prov.siegeTurns = 0;
            prov.siegeBy = null;
            addLog(`Осада ${prov.name} снята.`);
        }
        if (prov.owner === 'player') {
            game.player.army.location = targetId;
            addLog(`🦇 Армия в ${prov.name}`);
            spendAP(); draw(); return;
        }
        if (prov.owner === 'neutral' || prov.owner === 'ai') {
            if (prov.garrison === 0 && prov.elite === 0) {
                prov.owner = 'player';
                prov.garrison = 20;
                game.player.army.location = targetId;
                addLog(`🩸 ${prov.name} захвачена без боя.`);
                spendAP(); draw(); return;
            }
            // Начать осаду
            prov.siegeBy = 'player';
            prov.siegeTurns++;
            addLog(`⚔️ Осада ${prov.name} (ход ${prov.siegeTurns}/3).`);
            spendAP(); draw();
        }
    }

    function assault(targetId) {
        if (!canAct()) return;
        const prov = getProv(targetId);
        if (!prov || prov.siegeBy !== 'player') { addLog('Нет активной осады.'); return; }
        const defender = { power: 20, elites: prov.elite || 0 };
        if (fight(game.player, defender, targetId, true)) {
            prov.owner = 'player';
            prov.garrison = 20;
            prov.elite = 0;
            prov.siegeTurns = 0;
            prov.siegeBy = null;
            game.player.army.location = targetId;
            addLog(`🩸 ${prov.name} захвачена штурмом!`);
        } else {
            game.player.army.power = Math.max(20, game.player.army.power - 20);
            addLog(`💔 Штурм провален, потери -20.`);
            if (game.player.army.power <= 0) gameOver('ai');
        }
        spendAP(); draw();
    }

    function buildStructure() {
        if (!canAct()) return;
        const prov = getProv(game.player.army.location);
        if (prov.owner !== 'player') { addLog('Только в своей провинции.'); return; }
        document.getElementById('buildModal').style.display = 'block';
        updateBuildModal();
    }

    function updateBuildModal() {
        const list = document.getElementById('buildList');
        list.innerHTML = '';
        const prov = getProv(game.player.army.location);
        const buildings = [
            { id: 'cemetery', name: '🪦 Кладбище (+2 крови/ход)', cost: 10, check: p => !p.buildings.includes('cemetery') },
            { id: 'coffin_factory', name: '⚰️ Завод гробов (+3 крови/ход)', cost: 20, check: p => !p.buildings.includes('coffin_factory') }
        ];
        buildings.forEach(b => {
            const btn = document.createElement('button');
            btn.textContent = `${b.name} (${b.cost} крови)`;
            btn.disabled = !b.check(prov) || game.blood < b.cost || !canAct();
            btn.addEventListener('click', () => {
                if (b.check(prov) && game.blood >= b.cost && canAct()) {
                    game.blood -= b.cost;
                    prov.buildings.push(b.id);
                    addLog(`Построено: ${b.name} в ${prov.name}`);
                    updateBuildModal();
                    updateUI();
                    spendAP();
                    draw();
                }
            });
            list.appendChild(btn);
        });
    }

    function recruitElite() {
        if (!canAct() || game.blood < 15) return;
        const prov = getProv(game.player.army.location);
        if (prov.owner !== 'player') { addLog('Только на своей земле.'); return; }
        game.blood -= 15;
        prov.elite++;
        addLog(`🧛 Верховный вампир нанят в ${prov.name}.`);
        spendAP(); draw();
    }

    function endPlayerTurn() {
        game.playerAP = 0;
        game.currentPlayer = 'ai';
        updateUI();
        addLog('⚡ Ход Ватикана...');
        setTimeout(aiTurn, 800);
    }

    // ========== ИИ ==========
    function aiTurn() {
        if (game.gameOver) return;
        collectIncome();

        // Строительство
        game.provinces.filter(p => p.owner === 'ai').forEach(p => {
            if (game.faith >= 12 && !p.buildings.includes('cathedral')) {
                p.buildings.push('cathedral');
                game.faith -= 12;
                addLog(`⛪ Собор в ${p.name}`);
            }
        });

        // Найм элиты
        if (game.faith >= 15) {
            const aiProvs = game.provinces.filter(p => p.owner === 'ai');
            if (aiProvs.length) {
                aiProvs[0].elite++;
                game.faith -= 15;
                addLog('✝️ Верховный священник призван.');
            }
        }

        // Армии ИИ
        game.ai.armies.forEach(army => {
            const current = getProv(army.location);
            const targets = current.neighbors.filter(id => {
                const p = getProv(id);
                return p.owner !== 'ai';
            });
            if (targets.length) {
                const targetId = targets[Math.floor(Math.random() * targets.length)];
                const tProv = getProv(targetId);
                let defPower = tProv.garrison + tProv.elite * 5;
                if (tProv.owner === 'player' && game.player.army.location === targetId) defPower = game.player.army.power + game.player.elites * 5;
                // ИИ атакует смелее
                if (army.power > defPower * 0.6) {
                    const defender = { power: tProv.owner === 'player' ? game.player.army.power : 20, elites: tProv.elite || 0 };
                    if (fight(army, defender, targetId, false)) {
                        tProv.owner = 'ai';
                        tProv.garrison = 20;
                        tProv.elite = 0;
                        army.location = targetId;
                        addLog(`🛡️ Ватикан захватил ${tProv.name}`);
                        if (tProv.owner === 'player' && game.player.army.location === targetId) {
                            game.player.army.power = Math.max(20, game.player.army.power - 30);
                            game.player.army.location = 13; // отступление
                            if (game.player.army.power <= 0) gameOver('ai');
                        }
                    }
                }
            }
        });

        // Крестовый поход
        if (game.faith >= 20 && game.crusade <= 0) {
            game.faith -= 20;
            game.crusade = 3;
            addLog('✝️ Крестовый поход!');
        }
        if (game.crusade > 0) game.crusade--;

        if (game.provinces.filter(p => p.owner === 'ai').length >= 12) gameOver('ai');

        game.currentPlayer = 'player';
        game.playerAP = MAX_AP;
        game.turn++;
        game.night = game.turn % 2 === 0;
        updateUI(); draw();
    }

    function gameOver(winner) {
        game.gameOver = true;
        game.winner = winner;
        addLog(winner === 'player' ? '🦇 Дракула победил!' : '✝️ Ватикан восторжествовал!');
        updateUI();
    }

    // ========== РИСОВАНИЕ ==========
    function drawMap() {
        ctx.fillStyle = '#dac29c'; ctx.fillRect(0,0,1000,700);
        for (let i=0;i<300;i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.05})`;
            ctx.fillRect(Math.random()*1000, Math.random()*700, 2,2);
        }
    }

    function drawProvince(prov) {
        const pts = prov.points;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.fillStyle = prov.owner==='player'?'#4a0e1c':(prov.owner==='ai'?'#2e4a6b':'#5e5b52');
        ctx.fill(); ctx.strokeStyle='#2f2416'; ctx.lineWidth=3; ctx.stroke();
        ctx.font='bold 10px "Courier New"'; ctx.fillStyle='white'; ctx.shadowColor='black'; ctx.shadowBlur=3;
        ctx.fillText(prov.name, prov.centroid.x-20, prov.centroid.y-5);
        ctx.shadowBlur=0;
        const cx = prov.centroid.x, cy = prov.centroid.y;
        if (prov.buildings.includes('cathedral')) { ctx.fillStyle='gold'; ctx.fillRect(cx-6,cy-15,12,12); }
        if (prov.buildings.includes('cemetery')) { ctx.fillStyle='gray'; ctx.fillRect(cx-4,cy+10,8,6); }
        if (prov.elite>0) { ctx.fillStyle='white'; ctx.font='bold 12px monospace'; ctx.fillText(prov.elite, cx+10, cy-15); }
        if (prov.garrison>0) { ctx.fillStyle='lightgray'; ctx.font='8px monospace'; ctx.fillText(prov.garrison, cx-20, cy+15); }
    }

    function drawUnits() {
        const pLoc = getProv(game.player.army.location);
        ctx.fillStyle='black'; ctx.fillRect(pLoc.centroid.x-10, pLoc.centroid.y-20, 20, 15);
        ctx.fillStyle='white'; ctx.font='bold 10px monospace'; ctx.fillText(game.player.army.power, pLoc.centroid.x+5, pLoc.centroid.y-15);
        game.ai.armies.forEach(a => {
            const loc = getProv(a.location);
            ctx.fillStyle='white'; ctx.fillRect(loc.centroid.x+5, loc.centroid.y-18, 16, 14);
            ctx.fillText(a.power, loc.centroid.x+15, loc.centroid.y-15);
        });
    }

    function draw() { drawMap(); game.provinces.forEach(drawProvince); drawUnits(); if (game.night) { ctx.fillStyle='rgba(10,10,30,0.3)'; ctx.fillRect(0,0,1000,700); } }

    function updateUI() {
        document.getElementById('turnDisplay').textContent = game.turn;
        document.getElementById('dayNightIcon').innerHTML = game.night ? '🌙 НОЧЬ' : '☀️ ДЕНЬ';
        document.getElementById('bloodAmount').textContent = game.blood;
        document.getElementById('faithAmount').textContent = game.faith;
        document.getElementById('capturePercent').textContent = Math.floor(game.provinces.filter(p=>p.owner==='player').length/game.provinces.length*100)+'%';
        document.getElementById('playerAP').textContent = game.playerAP;
        const isPlayerTurn = game.currentPlayer === 'player' && !game.gameOver;
        document.getElementById('buildBtn').disabled = !isPlayerTurn || game.playerAP <= 0;
        document.getElementById('recruitBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 15;
        document.getElementById('siegeBtn').disabled = !isPlayerTurn || game.playerAP <= 0;
    }

    // ========== СОБЫТИЯ ==========
    canvas.addEventListener('click', e => {
        if (game.gameOver || game.currentPlayer !== 'player' || game.playerAP <= 0) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (1000 / rect.width);
        const my = (e.clientY - rect.top) * (700 / rect.height);
        for (let p of game.provinces) {
            const xs = p.points.map(pt=>pt[0]), ys = p.points.map(pt=>pt[1]);
            if (mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys)) {
                moveArmy(p.id);
                break;
            }
        }
    });

    const tooltip = document.getElementById('tooltip');
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (1000 / rect.width);
        const my = (e.clientY - rect.top) * (700 / rect.height);
        let found = null;
        for (let p of game.provinces) {
            const xs = p.points.map(pt=>pt[0]), ys = p.points.map(pt=>pt[1]);
            if (mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys)) {
                found = p; break;
            }
        }
        if (found) {
            const owner = found.owner==='player'?'Вампиры':(found.owner==='ai'?'Ватикан':'Нейтралы');
            tooltip.innerHTML = `${found.name} (👥${found.garrison} ⭐${found.elite})<br>${owner}`;
            tooltip.style.display='block';
            tooltip.style.left=e.clientX+15+'px';
            tooltip.style.top=e.clientY-40+'px';
        } else tooltip.style.display='none';
    });

    document.getElementById('siegeBtn').addEventListener('click', () => {
        const prov = getProv(game.player.army.location);
        if (prov && prov.siegeBy === 'player') assault(prov.id);
    });
    document.getElementById('buildBtn').addEventListener('click', buildStructure);
    document.getElementById('recruitBtn').addEventListener('click', recruitElite);
    document.getElementById('endTurnBtn').addEventListener('click', endPlayerTurn);
    document.getElementById('closeBuildBtn').addEventListener('click', () => document.getElementById('buildModal').style.display = 'none');

    // ========== АУДИО ==========
    let audioCtx = null, musicOn = false, initialized = false;
    function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); }
    function playMelody(arr) {
        if (!audioCtx || !musicOn) return;
        const now = audioCtx.currentTime; let t = 0;
        arr.forEach(([f,d]) => {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.type = 'square'; o.frequency.value = f;
            g.gain.setValueAtTime(0.05, now+t);
            g.gain.exponentialRampToValueAtTime(0.001, now+t+d-0.01);
            o.connect(g); g.connect(audioCtx.destination);
            o.start(now+t); o.stop(now+t+d); t+=d;
        });
    }
    document.addEventListener('click', () => { if (!initialized) { initAudio(); musicOn = true; initialized = true; } }, { once: true });
    document.getElementById('musicBtn').addEventListener('click', () => {
        if (!initialized) { initAudio(); initialized = true; }
        musicOn = !musicOn;
        document.getElementById('musicBtn').textContent = musicOn ? '🎵' : '🔇';
    });
    setInterval(() => {
        if (musicOn && audioCtx && !game.gameOver) {
            playMelody(game.night ? [[220,0.2],[277,0.2],[329,0.3]] : [[523,0.15],[587,0.15],[659,0.2]]);
        }
    }, 2500);

    updateUI(); draw(); addLog('Грядёт война теней...');
})();
