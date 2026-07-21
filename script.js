(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // ---------- ПОЛИГОНЫ ПРОВИНЦИЙ ----------
  const provincesPoly = [
    { id: 0, name: 'Англия', neighbors: [1,4], points: [{x:85,y:55},{x:175,y:60},{x:195,y:115},{x:155,y:165},{x:75,y:155},{x:50,y:105}] },
    { id: 1, name: 'Швеция', neighbors: [0,2,5], points: [{x:205,y:25},{x:335,y:40},{x:355,y:115},{x:285,y:150},{x:215,y:125},{x:185,y:75}] },
    { id: 2, name: 'Польша', neighbors: [1,3,5,6], points: [{x:365,y:50},{x:495,y:65},{x:525,y:135},{x:455,y:170},{x:375,y:145},{x:345,y:95}] },
    { id: 3, name: 'Пруссия', neighbors: [2,6,7], points: [{x:535,y:75},{x:675,y:85},{x:695,y:145},{x:615,y:165},{x:545,y:135},{x:515,y:95}] },
    { id: 4, name: 'Франция', neighbors: [0,5,9,10], points: [{x:55,y:185},{x:165,y:190},{x:205,y:265},{x:155,y:325},{x:65,y:305},{x:25,y:235}] },
    { id: 5, name: 'Саксония', neighbors: [1,2,4,6,10], points: [{x:215,y:165},{x:315,y:175},{x:335,y:255},{x:265,y:305},{x:195,y:285},{x:175,y:215}] },
    { id: 6, name: 'Богемия', neighbors: [2,3,5,7,11], points: [{x:355,y:175},{x:465,y:185},{x:475,y:265},{x:415,y:305},{x:345,y:275},{x:325,y:215}] },
    { id: 7, name: 'Венгрия', neighbors: [3,6,8,11,12,13], points: [{x:525,y:195},{x:675,y:215},{x:705,y:285},{x:625,y:325},{x:535,y:295},{x:505,y:235}] },
    { id: 8, name: 'Молдавия', neighbors: [7,13,14], points: [{x:715,y:215},{x:825,y:235},{x:845,y:305},{x:775,y:335},{x:705,y:295}] },
    { id: 9, name: 'Кастилия', neighbors: [4,10,15], points: [{x:25,y:325},{x:105,y:335},{x:135,y:415},{x:95,y:465},{x:35,y:455},{x:5,y:385}] },
    { id: 10, name: 'Швабия', neighbors: [4,5,9,11,15,16], points: [{x:155,y:335},{x:235,y:345},{x:255,y:415},{x:205,y:475},{x:135,y:465},{x:115,y:395}] },
    { id: 11, name: 'Бавария', neighbors: [6,7,10,12], points: [{x:355,y:315},{x:425,y:325},{x:445,y:395},{x:375,y:435},{x:315,y:405},{x:305,y:355}] },
    { id: 12, name: 'Австрия', neighbors: [7,11,13,15], points: [{x:465,y:335},{x:555,y:345},{x:575,y:415},{x:495,y:455},{x:425,y:425},{x:415,y:375}] },
    { id: 13, name: 'Трансильвания', neighbors: [7,8,12,14,17], points: [{x:625,y:355},{x:755,y:375},{x:775,y:455},{x:685,y:495},{x:585,y:465},{x:575,y:395}] },
    { id: 14, name: 'Валахия', neighbors: [8,13,17], points: [{x:785,y:375},{x:885,y:395},{x:905,y:465},{x:825,y:495},{x:745,y:455}] },
    { id: 15, name: 'Папская обл.', neighbors: [9,10,12,16], points: [{x:95,y:485},{x:175,y:495},{x:185,y:555},{x:135,y:595},{x:75,y:585},{x:55,y:535}] },
    { id: 16, name: 'Неаполь', neighbors: [10,15,17], points: [{x:195,y:495},{x:285,y:505},{x:295,y:575},{x:225,y:605},{x:155,y:585},{x:145,y:535}] },
    { id: 17, name: 'Османская имп.', neighbors: [13,14,16], points: [{x:315,y:505},{x:545,y:525},{x:575,y:615},{x:445,y:645},{x:295,y:615},{x:275,y:555}] }
  ];

  function getCentroid(points) {
    let cx = 0, cy = 0;
    points.forEach(p => { cx += p.x; cy += p.y; });
    return { x: cx / points.length, y: cy / points.length };
  }

  // ---------- КОНСТАНТЫ ----------
  const START_POWER = 100;
  const PLAYER_START = 13;
  const AI_START = [12, 15, 4];
  const MAX_AP = 2;

  // ---------- СОСТОЯНИЕ ИГРЫ ----------
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
      ...p,
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
    aiAP: MAX_AP,
    currentPlayer: 'player'
  };

  // Инициализация
  game.provinces[PLAYER_START].owner = 'player';
  game.provinces[PLAYER_START].dark = true;
  AI_START.forEach(id => {
    game.provinces[id].owner = 'ai';
    game.provinces[id].holy = true;
  });
  game.provinces[15].cathedral = true;

  // ---------- УТИЛИТЫ ----------
  function addLog(msg) {
    game.log.unshift(msg);
    if (game.log.length > 5) game.log.pop();
    document.getElementById('logPanel').innerHTML = '📜 ' + game.log.join(' &nbsp;|&nbsp; ');
  }
  function getProv(id) { return game.provinces.find(p => p.id === id); }
  function isAdjacent(id1, id2) { return getProv(id1)?.neighbors.includes(id2); }

  // Бой
  function fight(attPower, defPower, provId, attIsPlayer) {
    const prov = getProv(provId);
    let attMod = 1.0, defMod = 1.0;
    if (prov.dark) { attIsPlayer ? attMod *= 10 : defMod *= 10; }
    if (prov.holy) { attIsPlayer ? attMod *= 0.5 : defMod *= 0.5; }
    if (prov.cathedral && !attIsPlayer) defMod *= 1.5;
    if (prov.darkChurch && attIsPlayer) defMod *= 1.4;
    if (game.night && attIsPlayer) attMod *= 1.5;
    if (!game.night && attIsPlayer && prov.holy) attMod *= 0.7;
    if (game.crusade > 0 && !attIsPlayer) attMod *= 2.0;
    const attRoll = attPower * attMod * (0.8 + Math.random() * 0.4);
    const defRoll = defPower * defMod * (0.8 + Math.random() * 0.4);
    return attRoll > defRoll;
  }

  function canAct() { return game.currentPlayer === 'player' && game.playerAP > 0 && !game.gameOver; }

  function spendPlayerAP() {
    game.playerAP--;
    updateUI();
    if (game.playerAP === 0) endPlayerTurn();
  }

  // ---------- ДЕЙСТВИЯ ИГРОКА ----------
  function movePlayer(targetId) {
    if (!canAct()) return;
    const curr = game.playerArmy.loc;
    if (!isAdjacent(curr, targetId) && curr !== targetId) {
      addLog('⛔ Не граничит с вашей провинцией!');
      return;
    }
    const tProv = getProv(targetId);
    if (tProv.owner === 'player') {
      game.playerArmy.loc = targetId;
      addLog(`🦇 Дракула в ${tProv.name}`);
      spendPlayerAP();
      draw();
      return;
    }
    let defPow = 25;
    if (tProv.owner === 'ai') {
      const aiA = game.aiArmies.find(a => a.loc === targetId);
      defPow = aiA ? aiA.power : 30;
    }
    const win = fight(game.playerArmy.power, defPow, targetId, true);
    if (win) {
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
    spendPlayerAP();
    checkVictory();
    draw();
    updateUI();
  }

  function feast() {
    if (!canAct() || game.blood < 5) return;
    if (!getProv(game.playerArmy.loc)?.dark) { addLog('🍷 Только на тёмной земле!'); return; }
    game.blood -= 5;
    game.playerArmy.power = Math.min(game.playerArmy.power + 20, 250);
    addLog('🍷 Кровавый пир! +20 силы.');
    spendPlayerAP(); draw();
  }

  function spawnServant() {
    if (!canAct() || game.blood < 5) return;
    game.blood -= 5;
    game.servants.push({ loc: game.playerArmy.loc, power: 12 });
    addLog('🧛 Слуги вампира призваны (сила 12).');
    spendPlayerAP(); draw();
  }

  function buildDarkChurch() {
    if (!canAct() || game.blood < 12) return;
    const p = getProv(game.playerArmy.loc);
    if (!p?.dark || p.darkChurch) { addLog('🕍 Нельзя построить здесь.'); return; }
    game.blood -= 12;
    p.darkChurch = true;
    addLog(`🕍 Церковь Ночи в ${p.name}!`);
    spendPlayerAP(); draw();
  }

  function endPlayerTurn() {
    game.playerAP = 0;
    game.currentPlayer = 'ai';
    game.aiAP = MAX_AP;
    updateUI();
    addLog('⚡ Ход Инквизиции...');
    setTimeout(() => aiPerformAction(MAX_AP), 600);
  }

  // ---------- ИИ (теперь атакует и нейтралов) ----------
  function aiPerformAction(apLeft) {
    if (game.gameOver) return;
    if (apLeft <= 0) {
      // Завершение хода ИИ
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

    let actionTaken = false;

    // 1. Атака вражеских (игрок) провинций
    for (let army of game.aiArmies) {
      const neighbors = getProv(army.loc).neighbors;
      const enemyNeighbors = neighbors.filter(id => getProv(id).owner === 'player');
      if (enemyNeighbors.length > 0) {
        let bestTarget = enemyNeighbors[0];
        let minDef = Infinity;
        enemyNeighbors.forEach(id => {
          let def = 20;
          if (game.playerArmy.loc === id) def = game.playerArmy.power;
          game.servants.filter(s => s.loc === id).forEach(serv => def += serv.power);
          if (def < minDef) { minDef = def; bestTarget = id; }
        });
        const tp = getProv(bestTarget);
        let defPower = 20;
        if (game.playerArmy.loc === bestTarget) defPower = game.playerArmy.power;
        game.servants.filter(s => s.loc === bestTarget).forEach(serv => defPower += serv.power);
        if (fight(army.power, defPower, bestTarget, false)) {
          tp.owner = 'ai'; tp.dark = false; tp.holy = true; tp.darkChurch = false;
          army.loc = bestTarget;
          army.power = Math.min(army.power + 10, 200);
          addLog(`🛡️ ИИ захватил ${tp.name}!`);
          if (game.playerArmy.loc === bestTarget) {
            game.playerArmy.power = Math.max(10, game.playerArmy.power - 30);
            game.playerArmy.loc = PLAYER_START;
          }
          game.servants = game.servants.filter(s => s.loc !== bestTarget);
        } else {
          addLog(`⚔️ ИИ безуспешно атаковал ${tp.name}.`);
        }
        actionTaken = true;
        break;
      }
    }

    // 2. Атака нейтральных провинций (новое!)
    if (!actionTaken) {
      for (let army of game.aiArmies) {
        const neutralNeighbors = getProv(army.loc).neighbors.filter(id => getProv(id).owner === 'neutral');
        if (neutralNeighbors.length > 0) {
          const target = neutralNeighbors[Math.floor(Math.random() * neutralNeighbors.length)];
          const tp = getProv(target);
          const defPower = 25; // гарнизон нейтралов
          if (fight(army.power, defPower, target, false)) {
            tp.owner = 'ai'; tp.holy = true; tp.dark = false;
            army.loc = target;
            army.power = Math.min(army.power + 5, 200);
            addLog(`🛡️ ИИ покорил нейтральную ${tp.name}!`);
          } else {
            addLog(`⚔️ ИИ не смог взять нейтральную ${tp.name}.`);
          }
          actionTaken = true;
          break;
        }
      }
    }

    // 3. Строительство собора
    if (!actionTaken && game.faith >= 10) {
      const candidates = game.provinces.filter(p => p.owner === 'ai' && !p.cathedral && p.holy);
      if (candidates.length > 0) {
        candidates[0].cathedral = true;
        game.faith -= 10;
        addLog(`⛪ ИИ построил собор в ${candidates[0].name}.`);
        actionTaken = true;
      }
    }

    // 4. Инквизиция
    if (!actionTaken && game.faith >= 8 && game.provinces.some(p => p.owner === 'player' && p.holy)) {
      game.faith -= 8;
      game.playerArmy.power = Math.max(10, game.playerArmy.power - 15);
      game.servants.forEach(s => s.power = Math.max(1, s.power - 5));
      addLog('🔥 Инквизиция! Вампиры теряют силы.');
      actionTaken = true;
    }

    // 5. Крестовый поход
    if (!actionTaken && game.faith >= 15 && game.crusade <= 0) {
      game.faith -= 15;
      game.crusade = 3;
      addLog('✝️ Крестовый поход! Атака удвоена на 3 хода.');
      actionTaken = true;
    }

    // 6. Перемещение к ближайшей вражеской или нейтральной провинции
    if (!actionTaken) {
      for (let army of game.aiArmies) {
        const targets = game.provinces.filter(p => p.owner === 'player' || p.owner === 'neutral');
        if (targets.length > 0) {
          // Выбираем случайную цель и ищем путь через соседа
          const target = targets[Math.floor(Math.random() * targets.length)];
          const path = getProv(army.loc).neighbors.find(n => isAdjacent(n, target.id) && getProv(n).owner !== 'ai');
          if (path) {
            army.loc = path;
            addLog(`🚩 Армия ИИ двинулась к ${getProv(path).name}.`);
            actionTaken = true;
            break;
          }
        }
      }
    }

    if (!actionTaken) apLeft = 0;
    else apLeft--;

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

  // ---------- РИСОВАНИЕ ----------
  function drawPoly(prov) {
    const pts = prov.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = prov.dark ? '#4a0e1c' : (prov.holy ? '#2e4a6b' : '#5e5b52');
    ctx.fill();
    ctx.strokeStyle = '#2f2416';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = 'bold 10px "Courier New"';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(prov.name, prov.centroid.x - 30, prov.centroid.y - 8);
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
    ctx.fillStyle = '#dac29c'; ctx.fillRect(0,0,1000,700);
    game.provinces.forEach(p => drawPoly(p));
    drawUnits();
    if (game.night) { ctx.fillStyle = 'rgba(10,10,30,0.3)'; ctx.fillRect(0,0,1000,700); }
  }

  // ---------- UI ----------
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

  // Тултип и клики
  const tooltip = document.getElementById('tooltip');
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (1000 / rect.width);
    const my = (e.clientY - rect.top) * (700 / rect.height);
    let found = null;
    for (let p of game.provinces) {
      const xs = p.points.map(pt => pt.x), ys = p.points.map(pt => pt.y);
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
      const xs = p.points.map(pt => pt.x), ys = p.points.map(pt => pt.y);
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

  // Музыка
  let audioCtx = null, musicOn = true;
  function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); }
  function playMelody(arr) {
    if (!audioCtx || !musicOn) return;
    const now = audioCtx.currentTime; let t = 0;
    arr.forEach(([f,d]) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.05, now+t); g.gain.exponentialRampToValueAtTime(0.001, now+t+d-0.01);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(now+t); o.stop(now+t+d); t+=d;
    });
  }
  document.getElementById('musicBtn').addEventListener('click', ()=>{
    musicOn = !musicOn;
    document.getElementById('musicBtn').textContent = musicOn ? '🎵' : '🔇';
  });
  setInterval(() => {
    if (musicOn && !game.gameOver) {
      initAudio();
      playMelody(game.night ? [[220,0.2],[277,0.2],[329,0.3]] : [[523,0.15],[587,0.15],[659,0.2]]);
    }
  }, 2500);

  // Старт
  updateUI();
  draw();
  addLog('🦇 Вампиры начинают вторжение. Инквизиция на страже.');
})();
