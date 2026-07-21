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
        revealed: new Set(),
        provinces: provincesPoly.map(p => ({
            ...p,
            centroid: centroid(p.points),
            owner: 'neutral',
            garrison: 30,
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
            armies: [{ location: 15, power: 100 }],
            elites: 1
        }
    };

    // Стартовые владения
    game.provinces[13].owner = 'player';
    game.provinces[13].garrison = 50;
    game.provinces[13].elite = 5;
    game.provinces[15].owner = 'ai';
    game.provinces[15].garrison = 40;
    game.provinces[15].elite = 1;
    game.provinces[15].buildings.push('cathedral');

    // Туман войны
    function revealProvince(id) {
        if (game.revealed.has(id)) return;
        game.revealed.add(id);
        getProv(id).neighbors.forEach(n => game.revealed.add(n));
    }
    revealProvince(13);

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
    function fight(attPower, defPower, provId, isPlayer) {
        const prov = getProv(provId);
        let attMod = 1, defMod = 1;
        if (prov.buildings.includes('cathedral') && !isPlayer) defMod *= 1.5;
        if (prov.buildings.includes('cemetery') && isPlayer) attMod *= 1.3;
        if (prov.siegeTurns >= 3) defMod *= 0.5;
        if (game.night && isPlayer) attMod *= 1.3;
        if (game.crusade > 0 && !isPlayer) attMod *= 2;
        const att = attPower * attMod * (0.8 + Math.random() * 0.4);
        const def = defPower * defMod * (0.8 + Math.random() * 0.4);
        return att > def;
    }

    function canAct() { return game.currentPlayer === 'player' && game.playerAP > 0 && !game.gameOver; }
    function spendAP() { game.playerAP--; updateUI(); if (game.playerAP === 0) endPlayerTurn(); }

    // ========== ДЕЙСТВИЯ ИГРОКА ==========
    function moveArmy(targetId) {
        if (!canAct()) return;
        if (!isAdjacent(game.player.army.location, targetId)) { addLog('⛔ Не граничит'); return; }
        const prov = getProv(targetId);
        if (prov.siegeBy === 'player') {
            addLog('⚔️ Уже осаждаем. Используйте штурм.');
            return;
        }
        if (prov.owner === 'player') {
            game.player.army.location = targetId;
            revealProvince(targetId);
            addLog(`🦇 Армия в ${prov.name}`);
            spendAP(); draw(); return;
        }
        // Начать осаду
        prov.siegeBy = 'player';
        prov.siegeTurns = 1;
        game.player.army.location = targetId; // перемещаем армию на осаждаемую провинцию
        addLog(`⚔️ Начата осада ${prov.name} (1/3).`);
        spendAP(); draw();
    }

    function assault() {
        const prov = getProv(game.player.army.location);
        if (!prov || prov.siegeBy !== 'player') { addLog('Нет активной осады.'); return; }
        if (!canAct()) return;
        let defPower = prov.garrison + prov.elite * 5;
        const success = fight(game.player.army.power + game.player.elites * 5, defPower, prov.id, true);
        if (success) {
            prov.owner = 'player';
            prov.garrison = 20;
            prov.elite = 0;
            prov.siegeTurns = 0;
            prov.siegeBy = null;
            revealProvince(prov.id);
            addLog(`🩸 ${prov.name} захвачена штурмом!`);
        } else {
            game.player.army.power = Math.max(10, game.player.army.power - 15);
            addLog(`💔 Штурм провален, потери -15.`);
            if (game.player.army.power <= 0) gameOver('ai');
        }
        spendAP(); draw();
    }

    function cancelSiege() {
        const prov = getProv(game.player.army.location);
        if (!prov || prov.siegeBy !== 'player') { addLog('Нет активной осады.'); return; }
        prov.siegeTurns = 0;
        prov.siegeBy = null;
        // Отступаем в столицу или предыдущую? Упростим: возвращаем в столицу Трансильванию
        game.player.army.location = 13;
        addLog(`🚫 Осада ${prov.name} снята, армия отступила.`);
        draw(); updateUI();
    }

    function feast() {
        if (!canAct() || game.blood < 5) return;
        game.blood -= 5;
        game.player.army.power = Math.min(game.player.army.power + 20, 200);
        addLog('🍷 Кровавый пир! +20 силы.');
        spendAP(); draw();
    }

    function raid() {
        const prov = getProv(game.player.army.location);
        if (!canAct() || prov.owner !== 'player') { addLog('Только в своей провинции.'); return; }
        if (prov.garrison < 10) { addLog('Слишком мало гарнизона.'); return; }
        prov.garrison -= 10;
        game.blood += 3;
        addLog(`🔥 Погром в ${prov.name}! +3 крови, -10 гарнизона.`);
        spendAP(); draw();
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

    function endPlayerTurn() {
        // Автоматическое продвижение осад
        game.provinces.forEach(p => {
            if (p.siegeBy === 'player') {
                p.siegeTurns++;
                p.garrison = Math.max(0, p.garrison - Math.floor(p.garrison * 0.2));
                if (p.siegeTurns >= 3 || p.garrison <= 0) {
                    p.owner = 'player';
                    p.garrison = 10;
                    p.elite = 0;
                    p.siegeTurns = 0;
                    p.siegeBy = null;
                    if (game.player.army.location !== p.id) game.player.army.location = p.id;
                    revealProvince(p.id);
                    addLog(`🏰 ${p.name} сдался после осады!`);
                }
            }
        });
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

        game.provinces.filter(p => p.owner === 'ai').forEach(p => {
            if (game.faith >= 12 && !p.buildings.includes('cathedral')) {
                p.buildings.push('cathedral');
                game.faith -= 12;
                addLog(`⛪ Собор в ${p.name}`);
            }
        });

        if (game.faith >= 15) {
            const aiProvs = game.provinces.filter(p => p.owner === 'ai');
            if (aiProvs.length) {
                aiProvs[0].elite++;
                game.faith -= 15;
                addLog('✝️ Верховный священник призван.');
            }
        }

        game.ai.armies.forEach(army => {
            const current = getProv(army.location);
            const targets = current.neighbors.filter(id => {
                const p = getProv(id);
                return p.owner !== 'ai' && !p.siegeBy;
            }).sort((a,b) => getProv(a).garrison - getProv(b).garrison);
            if (targets.length) {
                const targetId = targets[0];
                const tProv = getProv(targetId);
                let defPower = tProv.garrison + tProv.elite * 5;
                if (tProv.owner === 'player' && game.player.army.location === targetId) {
                    defPower = game.player.army.power + game.player.elites * 5 + tProv.garrison;
                }
                if (army.power > defPower * 0.6) {
                    const success = fight(army.power + game.ai.elites * 5, defPower, targetId, false);
                    if (success) {
                        tProv.owner = 'ai';
                        tProv.garrison = 20;
                        tProv.elite = 0;
                        army.location = targetId;
                        addLog(`🛡️ Ватикан захватил ${tProv.name}`);
                        if (game.player.army.location === targetId) {
                            game.player.army.power = Math.max(10, game.player.army.power - 20);
                            game.player.army.location = 13;
                            if (game.player.army.power <= 0) gameOver('ai');
                        }
                    }
                }
            }
        });

        if (game.faith >= 20 && game.crusade <= 0) {
            game.faith -= 20; game.crusade = 3;
            addLog('✝️ Крестовый поход!');
        }
        if (game.crusade > 0) game.crusade--;

        if (game.provinces.filter(p => p.owner === 'ai').length >= 10) gameOver('ai');

        game.currentPlayer = 'player';
        game.playerAP = MAX_AP;
        game.turn++;
        game.night = game.turn % 2 === 0;
        updateUI(); draw();
    }

    function gameOver(winner) {
        game.gameOver = true; game.winner = winner;
        addLog(winner === 'player' ? '🦇 Дракула победил!' : '✝️ Ватикан восторжествовал!');
        updateUI();
    }

    // ========== 16-БИТНАЯ ГРАФИКА ==========
    function drawMap() {
        // Пергаментный фон с текстурой
        ctx.fillStyle = '#dac29c';
        ctx.fillRect(0,0,1000,700);
        for (let i=0;i<500;i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.04})`;
            ctx.fillRect(Math.random()*1000, Math.random()*700, 2,2);
        }
        // Угловой орнамент
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.strokeRect(10,10,980,680);
        // Компас
        ctx.fillStyle = '#5c4033';
        ctx.beginPath(); ctx.arc(50, 50, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 16px "Courier New"'; ctx.fillText('N', 43, 55);
    }

    function drawProvince(prov) {
        const pts = prov.points;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        if (!game.revealed.has(prov.id)) {
            ctx.fillStyle = '#2a2319';
            ctx.fill();
            ctx.strokeStyle = '#1a130c';
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
        }
        // Освещённая провинция
        ctx.fillStyle = prov.owner==='player'?'#5a1822':(prov.owner==='ai'?'#1e3a5f':'#4d4a3f');
        ctx.fill();
        ctx.strokeStyle = '#2f2416';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Название с тенью
        ctx.font = 'bold 11px "Courier New"';
        ctx.fillStyle = '#fdf5e6';
        ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
        ctx.fillText(prov.name, prov.centroid.x-22, prov.centroid.y-6);
        ctx.shadowBlur = 0;
        // Иконки построек и элиты
        const cx = prov.centroid.x, cy = prov.centroid.y;
        if (prov.buildings.includes('cathedral')) {
            drawCathedral(cx-8, cy-18);
        }
        if (prov.buildings.includes('cemetery')) {
            drawCemetery(cx-6, cy+8);
        }
        if (prov.elite > 0) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace';
            ctx.fillText(prov.elite, cx+12, cy-16);
        }
        if (prov.garrison > 0) {
            ctx.fillStyle = '#ccc'; ctx.font = '9px monospace';
            ctx.fillText(prov.garrison, cx-22, cy+14);
        }
        if (prov.siegeBy) {
            ctx.fillStyle = '#ff6600'; ctx.font = 'bold 14px monospace';
            ctx.fillText('⚔️', cx-10, cy-24);
        }
    }

    function drawCathedral(x, y) {
        ctx.fillStyle = '#b89b7b';
        ctx.fillRect(x, y+4, 16, 10);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(x+6, y-2, 4, 10);
        ctx.fillRect(x, y+2, 16, 3);
    }

    function drawCemetery(x, y) {
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(x+2, y, 12, 8);
        ctx.fillStyle = '#2f2f2f';
        ctx.fillRect(x, y-2, 2, 6);
        ctx.fillRect(x+12, y-2, 2, 6);
    }

    function drawUnits() {
        // Армия игрока
        if (game.revealed.has(game.player.army.location)) {
            const pl = getProv(game.player.army.location);
            drawVampireKnight(pl.centroid.x-14, pl.centroid.y-28);
            ctx.fillStyle = 'white'; ctx.font = 'bold 10px monospace';
            ctx.fillText(game.player.army.power, pl.centroid.x+4, pl.centroid.y-18);
        }
        // Армия ИИ
        game.ai.armies.forEach(a => {
            if (game.revealed.has(a.location)) {
                const loc = getProv(a.location);
                drawInquisitor(loc.centroid.x+4, loc.centroid.y-26);
                ctx.fillText(a.power, loc.centroid.x+18, loc.centroid.y-18);
            }
        });
    }

    function drawVampireKnight(x, y) {
        // Чёрный рыцарь с красным плащом
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x, y+2, 14, 16); // тело
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x-2, y+4, 18, 6); // плащ
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(x+2, y-4, 10, 6); // шлем
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x+8, y-2, 3, 3); // глаз
    }

    function drawInquisitor(x, y) {
        // Белый рыцарь с синим крестом
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x, y+2, 14, 16);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x-2, y+4, 18, 6);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x+2, y-4, 10, 6);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x+6, y-2, 2, 8);
        ctx.fillRect(x+2, y+2, 10, 2);
    }

    function draw() {
        drawMap();
        game.provinces.forEach(drawProvince);
        drawUnits();
        if (game.night) { ctx.fillStyle = 'rgba(10,10,30,0.25)'; ctx.fillRect(0,0,1000,700); }
    }

    // ========== UI ==========
    function updateUI() {
        document.getElementById('turnDisplay').textContent = game.turn;
        document.getElementById('dayNightIcon').innerHTML = game.night ? '🌙 НОЧЬ' : '☀️ ДЕНЬ';
        document.getElementById('bloodAmount').textContent = game.blood;
        document.getElementById('faithAmount').textContent = game.faith;
        document.getElementById('capturePercent').textContent = Math.floor(game.provinces.filter(p=>p.owner==='player').length/game.provinces.length*100)+'%';
        document.getElementById('playerAP').textContent = game.playerAP;
        const isPlayerTurn = game.currentPlayer === 'player' && !game.gameOver;
        document.getElementById('feastBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 5;
        document.getElementById('raidBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || getProv(game.player.army.location).owner !== 'player';
        document.getElementById('buildBtn').disabled = !isPlayerTurn || game.playerAP <= 0;
        document.getElementById('recruitBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 15;
        const siegeProv = getProv(game.player.army.location);
        const inSiege = siegeProv && siegeProv.siegeBy === 'player';
        document.getElementById('siegeBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || !inSiege;
        document.getElementById('cancelSiegeBtn').disabled = !isPlayerTurn || !inSiege;
    }

    // События
    canvas.addEventListener('click', e => {
        if (game.gameOver || game.currentPlayer !== 'player' || game.playerAP <= 0) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (1000 / rect.width);
        const my = (e.clientY - rect.top) * (700 / rect.height);
        for (let p of game.provinces) {
            const xs = p.points.map(pt=>pt[0]), ys = p.points.map(pt=>pt[1]);
            if (mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys)) {
                if (game.revealed.has(p.id)) moveArmy(p.id);
                else addLog('🌫️ Территория скрыта туманом войны.');
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
        if (found && game.revealed.has(found.id)) {
            const owner = found.owner==='player'?'Вампиры':(found.owner==='ai'?'Ватикан':'Нейтралы');
            tooltip.innerHTML = `${found.name} (👥${found.garrison} ⭐${found.elite})<br>${owner}`;
            tooltip.style.display='block';
            tooltip.style.left=e.clientX+15+'px';
            tooltip.style.top=e.clientY-40+'px';
        } else tooltip.style.display='none';
    });

    document.getElementById('siegeBtn').addEventListener('click', assault);
    document.getElementById('cancelSiegeBtn').addEventListener('click', cancelSiege);
    document.getElementById('feastBtn').addEventListener('click', feast);
    document.getElementById('raidBtn').addEventListener('click', raid);
    document.getElementById('buildBtn').addEventListener('click', buildStructure);
    document.getElementById('recruitBtn').addEventListener('click', recruitElite);
    document.getElementById('endTurnBtn').addEventListener('click', endPlayerTurn);
    document.getElementById('closeBuildBtn').addEventListener('click', () => document.getElementById('buildModal').style.display = 'none');

    // ========== АУДИО ==========
    let audioCtx = null, musicOn = false, audioInit = false;
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
    document.addEventListener('click', () => { if (!audioInit) { initAudio(); musicOn = true; audioInit = true; } }, { once: true });
    document.getElementById('musicBtn').addEventListener('click', () => {
        if (!audioInit) { initAudio(); audioInit = true; }
        musicOn = !musicOn;
        document.getElementById('musicBtn').textContent = musicOn ? '🎵' : '🔇';
    });
    setInterval(() => {
        if (musicOn && audioCtx && !game.gameOver) {
            playMelody(game.night ? [[220,0.2],[277,0.2],[329,0.3]] : [[523,0.15],[587,0.15],[659,0.2]]);
        }
    }, 2500);

    updateUI(); draw();
    addLog('Грядёт война теней...');
})();
