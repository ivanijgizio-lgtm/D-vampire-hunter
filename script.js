(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ---------- ПОЛИГОНЫ ПРОВИНЦИЙ ----------
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

    function getCentroid(poly) {
        let cx = 0, cy = 0;
        poly.forEach(p => { cx += p[0]; cy += p[1]; });
        return { x: cx / poly.length, y: cy / poly.length };
    }

    const START_POWER = 100;
    const PLAYER_START = 13;
    const AI_START = [12, 15, 4];
    const MAX_AP = 2;

    let game = {
        turn: 1,
        night: false,
        blood: 3,
        faith: 5,
        crusade: 0,
        servants: [],
        playerArmy: { loc: PLAYER_START, power: START_POWER },
        aiArmies: [
            { id: 0, loc: 12, power: START_POWER },
            { id: 1, loc: 15, power: START_POWER },
            { id: 2, loc: 4, power: START_POWER }
        ],
        provinces: provincesPoly.map(p => ({
            id: p.id,
            name: p.name,
            neighbors: p.neighbors,
            points: p.points,
            centroid: getCentroid(p.points),
            owner: 'neutral',
            dark: false,
            holy: false,
            cathedral: false,
            darkChurch: false
        })),
        gameOver: false,
        winner: null,
        log: ['Дракула пробуждается в Трансильвании...'],
        playerAP: MAX_AP,
        currentPlayer: 'player'
    };

    game.provinces[PLAYER_START].owner = 'player';
    game.provinces[PLAYER_START].dark = true;
    AI_START.forEach(id => {
        game.provinces[id].owner = 'ai';
        game.provinces[id].holy = true;
    });
    game.provinces[15].cathedral = true;

    function addLog(msg) {
        game.log.unshift(msg);
        if (game.log.length > 5) game.log.pop();
        document.getElementById('logPanel').innerHTML = '📜 ' + game.log.join(' &nbsp;|&nbsp; ');
    }
    function getProv(id) { return game.provinces.find(p => p.id === id); }
    function isAdjacent(a, b) { return getProv(a)?.neighbors.includes(b); }

    function fight(att, def, provId, attIsPlayer) {
        const prov = getProv(provId);
        let am = 1.0, dm = 1.0;
        if (prov.dark) attIsPlayer ? am *= 10 : dm *= 10;
        if (prov.holy) attIsPlayer ? am *= 0.5 : dm *= 0.5;
        if (prov.cathedral && !attIsPlayer) dm *= 1.5;
        if (prov.darkChurch && attIsPlayer) dm *= 1.4;
        if (game.night && attIsPlayer) am *= 1.5;
        if (!game.night && attIsPlayer && prov.holy) am *= 0.7;
        if (game.crusade > 0 && !attIsPlayer) am *= 2.0;
        return (att * am * (0.8 + Math.random() * 0.4)) > (def * dm * (0.8 + Math.random() * 0.4));
    }

    function canAct() { return game.currentPlayer === 'player' && game.playerAP > 0 && !game.gameOver; }
    function spendAP() {
        game.playerAP--;
        updateUI();
        if (game.playerAP === 0) endPlayerTurn();
    }

    function movePlayer(targetId) {
        if (!canAct()) return;
        if (!isAdjacent(game.playerArmy.loc, targetId) && game.playerArmy.loc !== targetId) {
            addLog('⛔ Не граничит с вашей провинцией!');
            return;
        }
        const tProv = getProv(targetId);
        if (tProv.owner === 'player') {
            game.playerArmy.loc = targetId;
            addLog(`🦇 Дракула в ${tProv.name}`);
            spendAP(); draw(); return;
        }
        let defPow = 25;
        if (tProv.owner === 'ai') {
            const ai = game.aiArmies.find(a => a.loc === targetId);
            defPow = ai ? ai.power : 30;
        }
        if (fight(game.playerArmy.power, defPow, targetId, true)) {
            tProv.owner = 'player'; tProv.dark = true; tProv.holy = false; tProv.cathedral = false;
            game.playerArmy.loc = targetId;
            game.playerArmy.power = Math.min(game.playerArmy.power + 15, 250);
            game.aiArmies = game.aiArmies.filter(a => a.loc !== targetId);
            game.blood += 2;
            addLog(`🩸 Захвачена ${tProv.name}! +15 силы, +2 крови.`);
        } else {
            game.playerArmy.power = Math.max(10, game.playerArmy.power - 25);
            addLog(`💔 Поражение. Дракула теряет 25 воинов.`);
            if (game.playerArmy.power <= 10) {
                game.gameOver = true; game.winner = 'ai';
                addLog('💀 Дракула разбит!');
            }
        }
        spendAP(); checkVictory(); draw(); updateUI();
    }

    function feast() {
        if (!canAct() || game.blood < 5) return;
        if (!getProv(game.playerArmy.loc)?.dark) { addLog('🍷 Только на тёмной земле!'); return; }
        game.blood -= 5;
        game.playerArmy.power = Math.min(game.playerArmy.power + 20, 250);
        addLog('🍷 Кровавый пир! +20 силы.');
        spendAP(); draw();
    }

    function spawnServant() {
        if (!canAct() || game.blood < 5) return;
        game.blood -= 5;
        game.servants.push({ loc: game.playerArmy.loc, power: 12 });
        addLog('🧛 Слуги вампира призваны (сила 12).');
        spendAP(); draw();
    }

    function buildDarkChurch() {
        if (!canAct() || game.blood < 12) return;
        const p = getProv(game.playerArmy.loc);
        if (!p?.dark || p.darkChurch) { addLog('🕍 Нельзя построить здесь.'); return; }
        game.blood -= 12;
        p.darkChurch = true;
        addLog(`🕍 Церковь Ночи в ${p.name}!`);
        spendAP(); draw();
    }

    function endPlayerTurn() {
        game.playerAP = 0;
        game.currentPlayer = 'ai';
        updateUI();
        addLog('⚡ Ход Инквизиции...');
        setTimeout(() => aiPerformAction(MAX_AP), 600);
    }

    function aiPerformAction(apLeft) {
        if (game.gameOver) return;
        if (apLeft <= 0) {
            game.currentPlayer = 'player';
            game.playerAP = MAX_AP;
            game.turn++;
            game.night = game.turn % 2 === 0;
            if (game.crusade > 0) game.crusade--;
            game.blood += game.provinces.filter(p => p.owner === 'player').length +
                game.provinces.filter(p => p.owner === 'player' && p.darkChurch).length * 2;
            game.faith += game.provinces.filter(p => p.owner === 'ai').length * 2;
            updateUI(); draw(); checkVictory();
            return;
        }

        let acted = false;

        for (let army of game.aiArmies) {
            const neutrals = getProv(army.loc).neighbors.filter(id => getProv(id).owner === 'neutral');
            if (neutrals.length > 0) {
                const target = neutrals[Math.floor(Math.random() * neutrals.length)];
                if (fight(army.power, 28, target, false)) {
                    const tp = getProv(target);
                    tp.owner = 'ai'; tp.holy = true; tp.dark = false;
                    army.loc = target;
                    army.power = Math.min(army.power + 8, 200);
                    addLog(`🛡️ ИИ покорил нейтральную ${tp.name}!`);
                } else {
                    addLog(`⚔️ ИИ не смог взять ${getProv(target).name}.`);
                }
                acted = true; break;
            }
        }

        if (!acted) {
            for (let army of game.aiArmies) {
                const enemies = getProv(army.loc).neighbors.filter(id => getProv(id).owner === 'player');
                if (enemies.length > 0) {
                    let best = enemies[0], minDef = Infinity;
                    enemies.forEach(id => {
                        let def = 20;
                        if (game.playerArmy.loc === id) def = game.playerArmy.power;
                        game.servants.filter(s => s.loc === id).forEach(s => def += s.power);
                        if (def < minDef) { minDef = def; best = id; }
                    });
                    let defPow = 20;
                    if (game.playerArmy.loc === best) defPow = game.playerArmy.power;
                    game.servants.filter(s => s.loc === best).forEach(s => defPow += s.power);
                    if (fight(army.power, defPow, best, false)) {
                        const tp = getProv(best);
                        tp.owner = 'ai'; tp.dark = false; tp.holy = true; tp.darkChurch = false;
                        army.loc = best;
                        army.power = Math.min(army.power + 10, 200);
                        addLog(`🛡️ ИИ захватил ${tp.name}!`);
                        if (game.playerArmy.loc === best) {
                            game.playerArmy.power = Math.max(10, game.playerArmy.power - 30);
                            game.playerArmy.loc = PLAYER_START;
                        }
                        game.servants = game.servants.filter(s => s.loc !== best);
                    } else {
                        addLog(`⚔️ ИИ атаковал ${getProv(best).name}, но безуспешно.`);
                    }
                    acted = true; break;
                }
            }
        }

        if (!acted && game.faith >= 10) {
            const candidates = game.provinces.filter(p => p.owner === 'ai' && !p.cathedral && p.holy);
            if (candidates.length) {
                candidates[0].cathedral = true;
                game.faith -= 10;
                addLog(`⛪ Собор в ${candidates[0].name}.`);
                acted = true;
            }
        }

        if (!acted && game.faith >= 8 && game.provinces.some(p => p.owner === 'player' && p.holy)) {
            game.faith -= 8;
            game.playerArmy.power = Math.max(10, game.playerArmy.power - 15);
            game.servants.forEach(s => s.power = Math.max(1, s.power - 5));
            addLog('🔥 Инквизиция!');
            acted = true;
        }

        if (!acted && game.faith >= 15 && game.crusade <= 0) {
            game.faith -= 15; game.crusade = 3;
            addLog('✝️ Крестовый поход!');
            acted = true;
        }

        if (!acted) {
            for (let army of game.aiArmies) {
                const targets = game.provinces.filter(p => p.owner !== 'ai');
                if (targets.length) {
                    const target = targets[Math.floor(Math.random() * targets.length)];
                    const next = getProv(army.loc).neighbors.find(n => isAdjacent(n, target.id) && getProv(n).owner !== 'ai');
                    if (next) {
                        army.loc = next;
                        addLog(`🚩 Армия ИИ двинулась к ${getProv(next).name}.`);
                        acted = true; break;
                    }
                }
            }
        }

        if (!acted) apLeft = 0; else apLeft--;
        setTimeout(() => aiPerformAction(apLeft), 500);
    }

    function checkVictory() {
        const owned = game.provinces.filter(p => p.owner === 'player').length;
        if (owned >= Math.floor(game.provinces.length * 0.8)) {
            game.gameOver = true; game.winner = 'player';
            addLog('🦇 Дракула покорил Европу!');
        } else if (game.playerArmy.power <= 0) {
            game.gameOver = true; game.winner = 'ai';
            addLog('💀 Дракула пал.');
        }
        if (game.gameOver) updateUI();
    }

    function drawMap() {
        ctx.fillStyle = '#dac29c';
        ctx.fillRect(0, 0, 1000, 700);
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
            ctx.fillRect(Math.random() * 1000, Math.random() * 700, 2, 2);
        }
        ctx.fillStyle = '#5c4033';
        ctx.beginPath(); ctx.arc(50, 50, 25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d4af37'; ctx.font = 'bold 16px "Courier New"';
        ctx.fillText('N', 43, 55);
    }

    function drawProvince(prov) {
        const pts = prov.points;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.fillStyle = prov.dark ? '#4a0e1c' : (prov.holy ? '#2e4a6b' : '#5e5b52');
        ctx.fill();
        ctx.strokeStyle = '#2f2416'; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = 'bold 10px "Courier New"';
        ctx.fillStyle = '#fdf5e6';
        ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
        ctx.fillText(prov.name, prov.centroid.x - 25, prov.centroid.y - 8);
        ctx.shadowBlur = 0;
        const cx = prov.centroid.x, cy = prov.centroid.y;
        if (prov.cathedral) {
            ctx.fillStyle = '#f5e6d3'; ctx.fillRect(cx-5, cy+5, 10, 8);
            ctx.fillStyle = '#d4af37'; ctx.fillRect(cx-1, cy-2, 2, 8);
        } else if (prov.darkChurch) {
            ctx.fillStyle = '#4a0e1c'; ctx.fillRect(cx-6, cy+2, 12, 10);
            ctx.fillStyle = '#8b0000'; ctx.fillRect(cx-2, cy-4, 4, 8);
        } else if (prov.owner === 'player') {
            ctx.fillStyle = '#3a3a3a'; ctx.fillRect(cx-6, cy+4, 12, 8);
            ctx.fillStyle = '#8b0000'; ctx.fillRect(cx, cy, 6, 6);
        } else if (prov.owner === 'ai') {
            ctx.fillStyle = '#d4af37'; ctx.fillRect(cx-4, cy+2, 8, 10);
        } else {
            ctx.fillStyle = '#8b7355'; ctx.fillRect(cx-4, cy+4, 8, 6);
        }
    }

    function drawUnits() {
        const pl = getProv(game.playerArmy.loc);
        ctx.fillStyle = '#111'; ctx.fillRect(pl.centroid.x-15, pl.centroid.y-25, 14, 16);
        ctx.fillStyle = '#8b0000'; ctx.fillRect(pl.centroid.x-20, pl.centroid.y-20, 8, 12);
        ctx.fillStyle = 'white'; ctx.font = 'bold 10px monospace';
        ctx.fillText(game.playerArmy.power, pl.centroid.x+5, pl.centroid.y-18);
        game.servants.forEach(s => {
            const loc = getProv(s.loc);
            ctx.fillStyle = '#2f4f2f'; ctx.fillRect(loc.centroid.x-20, loc.centroid.y+5, 10, 10);
            ctx.fillText(s.power, loc.centroid.x-15, loc.centroid.y+20);
        });
        game.aiArmies.forEach(a => {
            const loc = getProv(a.loc);
            ctx.fillStyle = '#f0f0f0'; ctx.fillRect(loc.centroid.x+5, loc.centroid.y-20, 12, 14);
            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(loc.centroid.x+12, loc.centroid.y-18, 6, 12);
            ctx.fillText(a.power, loc.centroid.x+18, loc.centroid.y-15);
        });
    }

    function draw() {
        drawMap();
        game.provinces.forEach(drawProvince);
        drawUnits();
        if (game.night) { ctx.fillStyle = 'rgba(10,10,30,0.3)'; ctx.fillRect(0,0,1000,700); }
    }

    function updateUI() {
        document.getElementById('turnDisplay').textContent = game.turn;
        document.getElementById('dayNightIcon').innerHTML = game.night ? '🌙 НОЧЬ' : '☀️ ДЕНЬ';
        document.getElementById('bloodAmount').textContent = game.blood;
        document.getElementById('faithAmount').textContent = game.faith;
        const owned = game.provinces.filter(p => p.owner === 'player').length;
        document.getElementById('capturePercent').textContent = Math.floor(owned / game.provinces.length * 100) + '%';
        document.getElementById('playerAP').textContent = game.playerAP;
        const isPlayerTurn = game.currentPlayer === 'player' && !game.gameOver;
        document.getElementById('feastBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 5 || !getProv(game.playerArmy.loc)?.dark;
        document.getElementById('servantBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 5;
        document.getElementById('churchBtn').disabled = !isPlayerTurn || game.playerAP <= 0 || game.blood < 12 || !getProv(game.playerArmy.loc)?.dark || getProv(game.playerArmy.loc)?.darkChurch;
        document.getElementById('endTurnBtn').disabled = !isPlayerTurn;
    }

    const tooltip = document.getElementById('tooltip');
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (1000 / rect.width);
        const my = (e.clientY - rect.top) * (700 / rect.height);
        let found = null;
        for (let p of game.provinces) {
            const xs = p.points.map(pt => pt[0]), ys = p.points.map(pt => pt[1]);
            if (mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys)) {
                found = p; break;
            }
        }
        if (found) {
            const owner = found.owner === 'player' ? 'Вампиры' : (found.owner === 'ai' ? 'Инквизиция' : 'Нейтралы');
            tooltip.innerHTML = `${found.name}<br>👑 ${owner}<br>🌑 Тьма: ${found.dark?'Да':'Нет'}<br>✝️ Святость: ${found.holy?'Да':'Нет'}<br>⛪ Собор: ${found.cathedral?'Да':'Нет'}<br>🕍 Ц.Ночи: ${found.darkChurch?'Да':'Нет'}`;
            tooltip.style.display = 'block';
            tooltip.style.left = e.clientX + 15 + 'px';
            tooltip.style.top = e.clientY - 40 + 'px';
        } else tooltip.style.display = 'none';
    });

    canvas.addEventListener('click', e => {
        if (game.gameOver || game.currentPlayer !== 'player' || game.playerAP <= 0) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (1000 / rect.width);
        const my = (e.clientY - rect.top) * (700 / rect.height);
        for (let p of game.provinces) {
            const xs = p.points.map(pt => pt[0]), ys = p.points.map(pt => pt[1]);
            if (mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys)) {
                movePlayer(p.id);
                break;
            }
        }
    });

    document.getElementById('feastBtn').addEventListener('click', feast);
    document.getElementById('servantBtn').addEventListener('click', spawnServant);
    document.getElementById('churchBtn').addEventListener('click', buildDarkChurch);
    document.getElementById('endTurnBtn').addEventListener('click', endPlayerTurn);

    let audioCtx = null, musicOn = false, audioInitialized = false;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
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
    document.addEventListener('click', function firstClickInit() {
        if (!audioInitialized) {
            initAudio();
            musicOn = true;
            document.getElementById('musicBtn').textContent = '🎵';
        }
    }, { once: true });

    document.getElementById('musicBtn').addEventListener('click', () => {
        if (!audioInitialized) initAudio();
        musicOn = !musicOn;
        document.getElementById('musicBtn').textContent = musicOn ? '🎵' : '🔇';
    });

    setInterval(() => {
        if (musicOn && audioCtx && !game.gameOver) {
            playMelody(game.night ? [[220,0.2],[277,0.2],[329,0.3]] : [[523,0.15],[587,0.15],[659,0.2]]);
        }
    }, 2500);

    updateUI();
    draw();
    addLog('🦇 Вампиры начинают вторжение. Инквизиция на страже.');
})();
