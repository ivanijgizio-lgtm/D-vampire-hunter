// ================= ЗАГРУЗКА АССЕТОВ =================
const sprites = {
    player: new Image(), ai: new Image(), werewolf: new Image(),
    highVampire: new Image(), inquisitor: new Image()
};
sprites.player.src = './assets/vampir.webp';
sprites.ai.src = './assets/knight.gif';
sprites.werewolf.src = './assets/werewolf-character.webp';
sprites.highVampire.src = './assets/high_vampire.png.png'; 
sprites.inquisitor.src = './assets/inquisitor.png.png';

// ================= ЛОР-ЭНЦИКЛОПЕДИЯ =================
const BUILD_LORE = {
    'build': "🏗️ СТРОИТЬ: Возводите тёмные сооружения, усиливающие вашу мощь и влияние на население.",
    'recruit': "🧛 ПРИЗВАТЬ: Найдите подходящих солдат и слуг для своей армии Тьмы.",
    'garrison': "🛡️ ГАРНИЗОН: Перемещайте войска между активной армией и гарнизоном провинции.",
    'cemetery': "🪦 Кладбище: Дарует +5 крови за ход.",
    'barracks': "⚔️ Казармы Lv1: Без них обычные войска не могут быть призваны.",
    'barracks_lv2': "⚔️⬆️ Казармы Lv2: Открывает призыв Рыцарей Тьмы.",
    'ritual': "🕯️ Храм Тьмы: +5 поддержки Тьмы, +3 лояльности. Открывает найм Лордов.",
    'dungeon': "⛓️ Тюрьма: +10 поддержки Тьмы, -5 лояльности.",
    'executions': "🪓 Казни: +15 поддержки Тьмы, -10 лояльности, -200 населения.",
    'ball': "🎭 Бал Вампиров: +20 поддержки Тьмы, +5 лояльности, -200 населения.",
    'center': "🧛 Центр Обращения: +10 поддержки Тьмы, +5 лояльности, +100 населения.",
    'citadel': "🏰 Цитадель: Дарует право нанимать Сборщиков душ.",
    'wall': "🧱 Стены: Защита от вторжений. +1 к укреплениям провинции.",
    'castle': "🏰 Замок: +2 укрепления, +20 гарнизона.",
    'market': "🏪 Рынок: Позволяет обменивать ресурсы 1 раз в ход.",
    'infantry': "🗡️ Пехота: Основа любой армии.",
    'archer': "🏹 Лучники: Меткие стрелки, сеющие хаос на расстоянии.",
    'cavalry': "🐴 Кавалерия: Быстрые всадники для фланговых атак.",
    'knights': "⚔️ Рыцари Тьмы: Элитные бойцы в тяжёлой броне.",
    'lord': "👑 Верховный Лорд: Бессмертный генерал. Без него нельзя штурмовать.",
    'soul_collector': "💀 Сборщик душ: Приносит 50 золота каждый ход."
};
const LORD_NAMES = ["Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Графиня Морвен", "Владыка Варгос", "Лорд Мортис", "Принц Теней", "Леди Вэйн", "Генерал Кровавый Клык", "Некромант Зерет"];

// ================= ДАННЫЕ ИГРЫ =================
function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false, armyBattleActive: false,
        tutorialStep: 0, fogOfWar: true, selectedProvinceId: null,
        pendingActionProvId: null, enemyArmyTarget: null,
        weather: { lightning: false, rain: false, sunset: false },
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10, lords: [], 
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 4 },
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false },
            marketUsed: false, allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            hasCitadel: false, hasSoulCollector: false,
        },
        ai: { gold: 100, blood: 5, generals: { inquisitor: 5 }, mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 40 }, faith: 0 },
        werewolf: { gold: 50, blood: 10, generals: { alpha: 3 }, mobileArmy: { infantry: 30, archer: 5, cavalry: 10, location: 45 } },
        provinces: [
            { id: 1, name: 'Ватикан', owner: 'ai', x: 235, y: 170, aiGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [17, 19], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 5, ai: 90, werewolf: 5 }, population: 5000, slaveIncome: 0, fortification: 3, terrain: 'plains', terrainBonus: 0, loyalty: 100 },
            { id: 2, name: 'Австрия', owner: 'ai', x: 410, y: 180, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 16, 24], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 3, name: 'Венгрия', owner: 'ai', x: 500, y: 190, aiGarrison: { infantry: 15, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [2, 4, 5, 27, 28], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 20, ai: 70, werewolf: 10 }, population: 4000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 4, name: 'Трансильвания', owner: 'player', x: 510, y: 260, playerGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 3, 5, 8, 25], buildings: [{type:'dark_temple', lvl:1}], income: 3, support: { player: 80, ai: 5, werewolf: 15 }, population: 4500, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 100 },
            { id: 5, name: 'Валахия', owner: 'ai', x: 580, y: 290, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 6, 7, 26], buildings: [], income: 2, support: { player: 30, ai: 45, werewolf: 25 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 240, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [3, 5, 7, 12, 13], buildings: [], income: 2, support: { player: 40, ai: 40, werewolf: 20 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 70 },
            { id: 7, name: 'Одесса', owner: 'ai', x: 660, y: 340, aiGarrison: { infantry: 5, archer: 3 }, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, support: { player: 45, ai: 30, werewolf: 25 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 240, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [3, 4, 9, 24], buildings: [{type:'church', lvl:1}], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, support: { player: 30, ai: 60, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, aiGarrison: { infantry: 5, cavalry: 5 }, siegeBy: null, neighbors: [4, 11, 25], buildings: [], income: 1, support: { player: 50, ai: 30, werewolf: 20 }, population: 1000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 50 },
            { id: 11, name: 'Болгария', owner: 'ai', x: 580, y: 420, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [5, 10, 13, 15, 29], buildings: [], income: 1, support: { player: 40, ai: 40, werewolf: 20 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 50 },
            { id: 12, name: 'Киевская Русь', owner: 'ai', x: 720, y: 180, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [6, 7, 13, 35], buildings: [], income: 1, support: { player: 15, ai: 80, werewolf: 5 }, population: 1800, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 13, name: 'Крым', owner: 'ai', x: 700, y: 430, aiGarrison: { infantry: 5, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [6, 7, 11, 12], buildings: [], income: 1, support: { player: 35, ai: 50, werewolf: 15 }, population: 1200, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 14, name: 'Польша', owner: 'ai', x: 370, y: 110, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [8, 9, 39, 16], buildings: [{type:'church', lvl:1}], income: 2, support: { player: 10, ai: 80, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, aiGarrison: { infantry: 20, archer: 10, cavalry: 5 }, siegeBy: null, neighbors: [11, 29], buildings: [{type:'church', lvl:1}, {type:'fortress', lvl:1}], income: 5, support: { player: 5, ai: 90, werewolf: 5 }, population: 6000, slaveIncome: 0, fortification: 3, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 16, name: 'Венеция', owner: 'ai', x: 290, y: 190, aiGarrison: { infantry: 15, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [1, 9, 14, 17, 24], buildings: [], income: 3, support: { player: 15, ai: 80, werewolf: 5 }, population: 3500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 90 },
            { id: 17, name: 'Хорватия', owner: 'ai', x: 390, y: 290, aiGarrison: { infantry: 10, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [1, 16, 18, 25], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 0, terrain: 'river', terrainBonus: 1, loyalty: 80 },
            { id: 18, name: 'Босния', owner: 'ai', x: 450, y: 310, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [17, 21, 25, 27], buildings: [], income: 2, support: { player: 25, ai: 35, werewolf: 40 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 19, name: 'Ломбардия', owner: 'werewolf', x: 220, y: 130, aiGarrison: { infantry: 10, archer: 2 }, siegeBy: null, neighbors: [1, 20, 16], buildings: [], income: 1, support: { player: 10, ai: 20, werewolf: 70 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 60 },
            { id: 20, name: 'Карпаты', owner: 'werewolf', x: 480, y: 150, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [21, 22, 3], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 3000, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 70 },
            { id: 21, name: 'Дикая пуща', owner: 'werewolf', x: 560, y: 170, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [20, 22, 5, 18, 27], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 2500, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 60 },
            { id: 22, name: 'Пруссия', owner: 'ai', x: 560, y: 90, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [20, 21, 39], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 23, name: 'Германия', owner: 'ai', x: 310, y: 100, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [14, 38, 22], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 24, name: 'Бавария', owner: 'ai', x: 370, y: 220, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [2, 9, 16, 8], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 25, name: 'Греция', owner: 'ai', x: 540, y: 440, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [10, 11, 4, 18], buildings: [], income: 2, support: { player: 30, ai: 50, werewolf: 20 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 50 },
            { id: 26, name: 'Балканы', owner: 'ai', x: 600, y: 380, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [5, 11, 25], buildings: [], income: 2, support: { player: 40, ai: 40, werewolf: 20 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 27, name: 'Словакия', owner: 'ai', x: 490, y: 230, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [3, 18, 21, 8], buildings: [], income: 1, support: { player: 30, ai: 60, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 28, name: 'Моравия', owner: 'ai', x: 450, y: 150, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [3, 14, 20, 27], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 30, name: 'Франция', owner: 'ai', x: 170, y: 180, aiGarrison: { infantry: 20 }, siegeBy: null, neighbors: [31, 32, 1, 33, 34], buildings: [{type:'church', lvl:1}], income: 4, support: { player: 10, ai: 80, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 31, name: 'Бретань', owner: 'ai', x: 110, y: 160, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [30, 33, 36], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 32, name: 'Бургундия', owner: 'ai', x: 220, y: 210, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [30, 16, 1], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 33, name: 'Аквитания', owner: 'ai', x: 150, y: 250, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [30, 31, 34], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 34, name: 'Испания', owner: 'ai', x: 130, y: 330, aiGarrison: { infantry: 15, cavalry: 5 }, siegeBy: null, neighbors: [30, 33, 36, 37], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 10, ai: 80, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 36, name: 'Португалия', owner: 'ai', x: 80, y: 300, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [31, 34, 37], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 37, name: 'Англия', owner: 'ai', x: 70, y: 130, aiGarrison: { infantry: 15, archer: 5 }, siegeBy: null, neighbors: [36, 40], buildings: [{type:'church', lvl:1}], income: 4, support: { player: 10, ai: 80, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 38, name: 'Шотландия', owner: 'ai', x: 60, y: 70, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [37], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 39, name: 'Ирландия', owner: 'ai', x: 20, y: 110, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [37], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 40, name: 'Дания', owner: 'ai', x: 270, y: 30, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [39, 41, 14, 23], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 41, name: 'Швеция', owner: 'ai', x: 260, y: -10, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [40, 42], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 42, name: 'Норвегия', owner: 'ai', x: 180, y: -20, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [41, 39], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 43, name: 'Финляндия', owner: 'ai', x: 410, y: -10, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [41, 35], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 44, name: 'Прибалтика', owner: 'ai', x: 460, y: 40, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [35, 14, 23], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 45, name: 'Северные земли', owner: 'werewolf', x: 560, y: -20, aiGarrison: { infantry: 10, cavalry: 3 }, siegeBy: null, neighbors: [22, 41, 35], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 60 },
        ]
    };
}
let game = getDefaultGame();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const fogCanvas = document.getElementById('fog-canvas');
const fogCtx = fogCanvas.getContext('2d');

// ================= ТУМАН ВОЙНЫ (Анимация) =================
let fogParticles = [];
for(let i=0; i<40; i++) {
    fogParticles.push({
        x: Math.random() * 680,
        y: Math.random() * 550,
        r: 30 + Math.random() * 70,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
    });
}
function drawFog() {
    fogCtx.clearRect(0, 0, 680, 550);
    fogParticles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if(p.x < -100) p.x = 780; if(p.x > 780) p.x = -100;
        if(p.y < -100) p.y = 650; if(p.y > 650) p.y = -100;
        
        let gradient = fogCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, 'rgba(20, 25, 40, 0.4)');
        gradient.addColorStop(0.6, 'rgba(5, 6, 8, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        fogCtx.fillStyle = gradient;
        fogCtx.beginPath();
        fogCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fogCtx.fill();
    });
    requestAnimationFrame(drawFog);
}
drawFog();

// ================= МУЗЫКА И ТУТОРИАЛ =================
function playBackgroundMusic() { const bgm = document.getElementById('bgm'); if (bgm) { bgm.volume = 0.4; bgm.load(); bgm.play().catch(e => {}); } }
function advanceTutorial(step) { /* Без изменений, сокращено для краткости */ if (step === 0 && game.tutorialStep === 0) { game.tutorialStep = 1; setTimeout(() => showTutorialStep(1), 100); } else if (step === 1 && game.tutorialStep === 1) { game.tutorialStep = 2; setTimeout(() => showTutorialStep(2), 100); } else if (step === 2 && game.tutorialStep === 2) { game.tutorialStep = 3; setTimeout(() => showTutorialStep(3), 100); } else if (step === 3 && game.tutorialStep === 3) { game.tutorialStep = 4; showTutorialStep(4); } }
function showTutorialStep(step) { /* ... */ }

// ================= СТАРТ И СОХРАНЕНИЕ =================
function initGame() { document.getElementById('start-menu').style.display = 'none'; document.getElementById('game-container').style.display = 'flex'; if (!loadGame()) { game = getDefaultGame(); for(let i=0; i<5; i++) { addNewLordToPlayer(); } setTimeout(() => showTutorialStep(0), 500); } else { if (game.tutorialStep < 4) game.tutorialStep = 4; } playBackgroundMusic(); updateUI(); log('🦇 Дракула пробудился! Европа ждёт завоевателя.', 'system'); }
function restartGame() { const bgm = document.getElementById('bgm'); if (bgm) { bgm.pause(); bgm.currentTime = 0; } localStorage.removeItem('VampireWarSave'); game = getDefaultGame(); game.gameOver = false; document.getElementById('gameover-modal').style.display = 'none'; document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = false); document.getElementById('start-menu').style.display = 'flex'; document.getElementById('game-container').style.display = 'none'; log('🔄 Перерождение...', 'system'); updateUI(); }
function saveGame() { try { localStorage.setItem('VampireWarSave', JSON.stringify(game)); } catch (e) {} }
function loadGame() { try { const saved = localStorage.getItem('VampireWarSave'); if (saved) { const parsed = JSON.parse(saved); if (parsed.provinces && parsed.provinces.length === game.provinces.length) { game = parsed; return true; } else { localStorage.removeItem('VampireWarSave'); } } } catch (e) {} return false; }

// ================= БОЕВЫЕ И ЭКОНОМИЧЕСКИЕ МЕХАНИКИ =================
function getTotalTroops(armyObj) { return (armyObj.infantry || 0) + (armyObj.archer || 0) + (armyObj.cavalry || 0); }
function log(msg, type = 'system') { const container = document.getElementById('log-container'); if (!container) return; const entry = document.createElement('div'); entry.className = `log-entry ${type}`; if (type === 'ai') { const d = ["Ватикан: Еретики сгорят!", "Ватикан: Господь с нами!"]; msg = d[Math.floor(Math.random() * d.length)] + " " + msg; } else if (type === 'werewolf') { const d = ["Оборотни: Полнолуние близко!", "Оборотни: Кровь зовёт!"]; msg = d[Math.floor(Math.random() * d.length)] + " " + msg; } entry.textContent = msg; container.appendChild(entry); container.scrollTop = container.scrollHeight; }
function ensureArmyLocation() { let locProv = game.provinces.find(p => p.id === game.player.mobileArmy.location); if (!locProv || locProv.owner !== 'player') { let fallback = game.provinces.find(p => p.owner === 'player'); if (fallback) { game.player.mobileArmy.location = fallback.id; } } }
function isNightTime() { return game.turn % 2 !== 0; }
function getRandomLordName() { return LORD_NAMES[Math.floor(Math.random() * LORD_NAMES.length)]; }
function addNewLordToPlayer() { const name = getRandomLordName(); game.player.lords.push({ name: name, battles: 0 }); log(`🧛 Лорд "${name}" примкнул к вашей армии!`, 'player'); }
function getLordBonus() { let attackBonus = 0; game.player.lords.forEach(l => { if (l.battles >= 2 && l.battles < 5) attackBonus += 0.1; else if (l.battles >= 5) attackBonus += 0.2; }); return attackBonus; }
function processLordsAfterBattle(isVictory, isAttacker) { if (!isAttacker) return; let aliveLords = []; game.player.lords.forEach(l => { if (isVictory) { l.battles += 1; aliveLords.push(l); } else { log(`💀 Лорд "${l.name}" погиб в бою!`, 'player'); } }); game.player.lords = aliveLords; }
function calcArmyPower(army, isPlayer) { let totalPower = ((army.infantry||0) * 5) + ((army.archer||0) * 8) + ((army.cavalry||0) * 10); let generalBonus = 1; if (isPlayer) { if (game.player.techs.militaryReform) generalBonus += 0.1; generalBonus += getLordBonus(); } else { generalBonus = 1.2; } return Math.floor(totalPower * generalBonus); }
function collectIncome() { game.provinces.forEach(prov => { /* ... доход провинций ... */ }); if (game.player.hasSoulCollector) { game.player.gold += 50; log(`💀 Сборщик душ принес 50 золота.`, 'player'); } updateUI(); }
function updateSupport() { game.provinces.forEach(p => { if (!p.owner) return; let owner = p.owner; if (owner === 'player') p.support.player = Math.min(100, p.support.player + 1); else if (owner === 'ai') p.support.ai = Math.min(100, p.support.ai + 1); else if (owner === 'werewolf') p.support.werewolf = Math.min(100, p.support.werewolf + 1); let ownerSupport = p.support[owner] || 0; if (ownerSupport < 20 && Math.random() < 0.2) { p.owner = null; p.playerGarrison = {}; p.aiGarrison = {}; log(`💥 Бунт в ${p.name}!`, 'system'); checkGameConditions(); } }); }
function executeArmyBattle(attackerSide, targetSide) { /* Логика битвы армий, без изменений */ }
function checkCaptureRequirements(attackerSide, targetProv) { let attIsPlayer = attackerSide === 'player'; let army = attIsPlayer ? game.player.mobileArmy : (attackerSide === 'ai' ? game.ai.mobileArmy : game.werewolf.mobileArmy); let totalTroops = getTotalTroops(army); let elites = attIsPlayer ? game.player.lords.length : (attackerSide === 'ai' ? game.ai.generals.inquisitor : game.werewolf.generals.alpha); if (totalTroops < 1) return log('❌ В армии нет войск!', 'system') && false; if (elites < 1) { log(`❌ У вас нет Лордов для командования штурмом!`, attIsPlayer ? 'player' : 'system'); return false; } return true; }
function executeBattle(attackerSide, targetProv) { /* Логика штурма провинций, без изменений */ }
function showSurrenderModal(prov) { /* Выбор истребление/порабощение/обращение, без изменений */ }
function closeSurrenderModal() { document.getElementById('surrender-modal').style.display = 'none'; game.surrenderActive = false; checkGameConditions(); updateUI(); }
function getTargetProvForAction() { let prov = game.provinces.find(p => p.id === game.selectedProvinceId); if (prov && prov.owner === 'player') return prov; prov = game.provinces.find(p => p.id === game.player.mobileArmy.location); if (prov && prov.owner === 'player') return prov; return null; }

// ================= СТРОИТЕЛЬСТВО И НАЙМ =================
function buildStructure(type) { /* Логика построек с новыми зданиями (citadel, executions, etc) - без изменений */ }
function recruitTroops(type) { /* Логика найма с soul_collector - без изменений */ }
function moveTroops(amount, toGarrison = true) { /* Логика гарнизона - без изменений */ }
function cancelSiege() { /* Логика снятия осады - без изменений */ }
function openDiplomacy() { document.getElementById('diplomacy-modal').style.display = 'flex'; }
function openMarket() { document.getElementById('market-modal').style.display = 'flex'; }
function openTech() { document.getElementById('tech-modal').style.display = 'flex'; }
function closeDiplomacy() { document.getElementById('diplomacy-modal').style.display = 'none'; }
function closeMarket() { document.getElementById('market-modal').style.display = 'none'; }
function closeTech() { document.getElementById('tech-modal').style.display = 'none'; }

// ================= ХОД И ПОГОДА =================
function endPlayerTurn() { if (game.gameOver || game.battleActive || game.surrenderActive || game.armyBattleActive) return; if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai'); game.player.marketUsed = false; collectIncome(); updateSupport(); game.player.ap = game.player.maxAp; game.turn++; if (game.turn % 2 === 1) game.day++; log(`⏩ ХОД ${game.turn}. ${isNightTime() ? '🌙 НОЧЬ' : '☀️ ДЕНЬ'}.`, 'system'); checkWeather(); aiTurn(); saveGame(); updateUI(); }
function checkGameConditions() { const pCount = game.provinces.filter(p => p.owner === 'player').length; const aiCount = game.provinces.filter(p => p.owner === 'ai').length; const wCount = game.provinces.filter(p => p.owner === 'werewolf').length; if (pCount === 0) return gameOver('ai'); if (aiCount === 0 && wCount === 0) return gameOver('player'); }
function gameOver(winner) { if (game.gameOver) return; game.gameOver = true; document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true); document.getElementById('bg-layer').style.opacity = '0.8'; const modal = document.getElementById('gameover-modal'); modal.style.display = 'flex'; saveGame(); }
function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive && !game.surrenderActive && !game.armyBattleActive; }
function checkWeather() { if (game.turn % 20 === 0) { startSunset(); } if (game.turn % 10 === 0) { game.weather.rain = true; setTimeout(() => { game.weather.rain = false; }, 8000); } if (game.turn % 5 === 0) { game.weather.lightning = true; setTimeout(() => { game.weather.lightning = false; }, 6000); } }
function startSunset() { const overlay = document.getElementById('sunset-overlay'); if (!overlay) return; overlay.style.display = 'block'; overlay.style.opacity = '0'; setTimeout(() => { overlay.style.opacity = '1'; }, 100); setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => { overlay.style.display = 'none'; }, 2000); }, 15000); }

// ================= ИИ =================
function aiTurn() { /* Логика ИИ - без изменений */ }

// ================= ОТРИСОВКА КАРТЫ (ГЛАВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ) =================
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let isRaining = game.weather.rain;
    let isLightning = game.weather.lightning;
    let isNight = isNightTime();
    
    const playerVisible = []; game.provinces.forEach(p => { if (p.owner === 'player') { playerVisible.push(p.id); p.neighbors.forEach(n => playerVisible.push(n)); } });
    const currArmyProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);

    game.provinces.forEach(p => {
        const isVis = !game.fogOfWar || playerVisible.includes(p.id) || p.owner === 'player';
        ctx.beginPath(); const s = 45;
        for (let i=0; i<6; i++) { let a = Math.PI/3 * i - Math.PI/6; let x = p.x + s * Math.cos(a), y = p.y + s * Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
        ctx.closePath(); 

        if (!isVis) { 
            ctx.fillStyle='#080302'; 
            ctx.strokeStyle='rgba(0,0,0,0.8)'; 
            ctx.lineWidth=2; 
            ctx.fill(); ctx.stroke(); 
            return; 
        }

        // Базовый цвет + синева для дождя
        let baseColor = p.owner === 'player' ? (isNight ? '#101728' : '#1a2440') : (p.owner === 'ai' ? (isNight ? '#0f0f12' : '#1a1a20') : (p.owner === 'werewolf' ? (isNight ? '#0a1a10' : '#0f2015') : '#08080a'));
        if (isRaining) baseColor = blendColor(baseColor, '#4a5b9a', 0.1);

        // Градиент (Выпуклый ландшафт)
        let gradient = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, s);
        gradient.addColorStop(0, lightenColor(baseColor, 15)); 
        gradient.addColorStop(1, baseColor);
        ctx.fillStyle = gradient;
        
        // Обводка (Толстая черная рамка, вырезанная из бумаги)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.fill(); ctx.stroke();

        // Текст
        ctx.fillStyle = '#b8c0d0'; ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'center'; ctx.fillText(p.name, p.x, p.y-20);
        ctx.fillStyle = '#808ca0'; ctx.font = '9px Cinzel'; ctx.fillText(`🧛${Math.round(p.support.player)}% ⛪${Math.round(p.support.ai)}%`, p.x, p.y-5); ctx.fillText(`🐺${Math.round(p.support.werewolf)}%`, p.x, p.y+7);
        let g = p.owner === 'player' ? p.playerGarrison : p.aiGarrison; let gCount = getTotalTroops(g || {}); if (gCount > 0) ctx.fillText(`🛡️Гарн:${gCount}`, p.x, p.y+20);
        if (p.fortification > 0) { ctx.fillStyle = '#4a5b9a'; ctx.font = '8px monospace'; ctx.fillText("▓".repeat(Math.min(p.fortification, 5)), p.x - 15, p.y+30); }
        
        // Золотая рамка выбора
        if (p.id === game.selectedProvinceId && p.owner === 'player') { ctx.strokeStyle = '#4a5b9a'; ctx.lineWidth = 4; ctx.setLineDash([3, 3]); ctx.strokeRect(p.x - 45, p.y - 45, 90, 90); ctx.setLineDash([]); ctx.lineWidth = 1; }
        if (p.siegeBy === 'player') { ctx.strokeStyle='#4a5b9a'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
        else if (p.siegeBy === 'ai') { ctx.strokeStyle='#808ca0'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
        else if (p.siegeBy === 'werewolf') { ctx.strokeStyle='#3d4d3d'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
    });

    // Отрисовка Юнитов (Армий)
    const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    const wProv = game.provinces.find(p => p.id === game.werewolf.mobileArmy.location);
    let pOff = 0, aOff = 0, wOff = 0;
    if (pProv && aProv && pProv.id === aProv.id) { pOff = -20; aOff = 20; }
    if (pProv && wProv && pProv.id === wProv.id) { pOff = -20; wOff = 20; }
    if (aProv && wProv && aProv.id === wProv.id) { aOff = -20; wOff = 20; }
    
    function drawArmy(prov, offset, sprite, armyObj, label, isPlayer) {
        if (!prov || getTotalTroops(armyObj) === 0) return;
        let x = prov.x + offset, y = prov.y - 15;

        // Тень и свечение
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;

        // Свечение, если есть Лорды
        if (isPlayer && game.player.lords.length > 0) {
            ctx.shadowColor = 'rgba(74, 91, 154, 0.6)';
            ctx.shadowBlur = 20;
        }

        // Обрезка спрайта
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.clip();
        if (sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, x - 20, y - 45, 40, 60);
        } else { ctx.fillStyle='#1a2440'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();

        ctx.shadowBlur = 0;
        ctx.fillStyle='#b8c0d0'; ctx.font='bold 10px Cinzel'; 
        ctx.fillText(`${label} ${getTotalTroops(armyObj)}`, x, y-48);
    }

    drawArmy(pProv, pOff, sprites.player, game.player.mobileArmy, '🧛', true);
    drawArmy(aProv, aOff, sprites.ai, game.ai.mobileArmy, '⛪', false);
    drawArmy(wProv, wOff, sprites.werewolf, game.werewolf.mobileArmy, '🐺', false);

    ctx.shadowBlur = 0;

    // Молнии (Вспышка)
    if (isLightning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Сами зигзаги молний рисуются в drawWeather
    }
}

// ================= ВСПОМОГАТЕЛЬНЫЕ ЦВЕТОВЫЕ ФУНКЦИИ =================
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function lightenColor(hex, percent) {
    let rgb = hexToRgb(hex);
    if (!rgb) return hex;
    let r = Math.min(255, rgb.r + percent);
    let g = Math.min(255, rgb.g + percent);
    let b = Math.min(255, rgb.b + percent);
    return rgbToHex(r, g, b);
}
function blendColor(hex, hex2, percent) {
    let rgb1 = hexToRgb(hex), rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return hex;
    let r = Math.floor(rgb1.r + (rgb2.r - rgb1.r) * percent);
    let g = Math.floor(rgb1.g + (rgb2.g - rgb1.g) * percent);
    let b = Math.floor(rgb1.b + (rgb2.b - rgb1.b) * percent);
    return rgbToHex(r, g, b);
}

function drawWeather() {
    if (game.weather.rain) {
        ctx.strokeStyle = 'rgba(150, 180, 200, 0.3)';
        ctx.lineWidth = 1;
        for(let i=0; i<100; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x+4, y+15);
            ctx.stroke();
        }
    }
    if (game.weather.lightning) {
        for(let i=0; i<3; i++) {
            let startX = 100 + Math.random() * 500;
            let startY = 20;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let prevX = startX, prevY = startY;
            for(let j=0; j<6; j++) {
                let nextX = prevX + (Math.random() - 0.5) * 70;
                let nextY = prevY + 20 + Math.random() * 40;
                ctx.lineTo(nextX, nextY);
                prevX = nextX; prevY = nextY;
            }
            ctx.stroke();
        }
    }
}

function updateUI() {
    ensureArmyLocation();
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.lords.length;
    const faithFill = document.getElementById('faith-bar-fill'); let faithPct = Math.min(100, game.ai.faith);
    faithFill.style.width = faithPct + '%'; if (faithPct >= 80) faithFill.style.background = '#4a5b9a'; else faithFill.style.background = '#808ca0';
    document.getElementById('faith-text').textContent = `${game.ai.faith} / 100`;

    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const assaultBtn = document.getElementById('btn-assault');
    if (prov && prov.siegeBy === 'player' && game.player.ap > 0 && game.player.lords.length > 0 && !game.gameOver) { assaultBtn.disabled = false; } else { assaultBtn.disabled = true; }
    drawMap();
}

// ================= ОБРАБОТЧИКИ КЛИКОВ (Упрощены для краткости) =================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('VampireWarSave'); game = getDefaultGame(); initGame(); });
    document.getElementById('btn-load-game').addEventListener('click', initGame);
    document.getElementById('btn-restart').addEventListener('click', () => { document.getElementById('gameover-modal').style.display = 'none'; restartGame(); });
    document.getElementById('btn-gameover-restart').addEventListener('click', restartGame);

    // Dropdowns and other buttons logic...

    // Обработчики кнопок и карты
    document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiege);
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);
    document.getElementById('btn-garrison-add').addEventListener('click', () => moveTroops(10, true));
    document.getElementById('btn-garrison-take').addEventListener('click', () => moveTroops(10, false));
    
    // Recruits
    document.getElementById('recruit-inf').addEventListener('click', () => recruitTroops('infantry'));
    document.getElementById('recruit-arch').addEventListener('click', () => recruitTroops('archer'));
    document.getElementById('recruit-cav').addEventListener('click', () => recruitTroops('cavalry'));
    document.getElementById('recruit-knights').addEventListener('click', () => recruitTroops('knights'));
    document.getElementById('recruit-lord').addEventListener('click', () => recruitTroops('lord'));
    document.getElementById('recruit-soul').addEventListener('click', () => recruitTroops('soul_collector'));

    // Builds
    document.getElementById('build-cemetery').addEventListener('click', () => buildStructure('cemetery'));
    document.getElementById('build-barracks').addEventListener('click', () => buildStructure('barracks'));
    document.getElementById('build-barracks-2').addEventListener('click', () => buildStructure('barracks_lv2'));
    document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));
    document.getElementById('build-dungeon').addEventListener('click', () => buildStructure('dungeon'));
    document.getElementById('build-executions').addEventListener('click', () => buildStructure('executions'));
    document.getElementById('build-ball').addEventListener('click', () => buildStructure('ball'));
    document.getElementById('build-center').addEventListener('click', () => buildStructure('center'));
    document.getElementById('build-citadel').addEventListener('click', () => buildStructure('citadel'));
    document.getElementById('build-wall').addEventListener('click', () => buildStructure('wall'));
    document.getElementById('build-castle').addEventListener('click', () => buildStructure('castle'));
    document.getElementById('build-market').addEventListener('click', () => buildStructure('market'));

    // Canvas click handlers...
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return; 
        let found = null;
        for (let p of game.provinces) { if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) { found = p; break; } }
        if (found) {
            tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 20) + 'px';
            let gCount = found.owner === 'player' ? getTotalTroops(found.playerGarrison||{}) : getTotalTroops(found.aiGarrison||{});
            tooltip.innerHTML = `<b style="color:#b8c0d0;">${found.name}</b><br>🧛 Поддержка Тьмы: ${Math.round(found.support.player)}%<br>⛪ Поддержка Ватикана: ${Math.round(found.support.ai)}%<br>🐺 Поддержка Оборотней: ${Math.round(found.support.werewolf)}%<br>🛡️ Гарнизон: ${gCount}<br>👥 Население: ${found.population}<br>🏰 Укрепления: ${found.fortification}`;
        } else tooltip.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
        if (game.gameOver || game.battleActive || game.surrenderActive || game.armyBattleActive) return;
        if (game.player.ap === 0) return log('❌ У вас нет очков действий.', 'system');
        const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top;
        for (let p of game.provinces) { if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) { /* Обработка клика по провинциям... */ } }
    });

    gameLoop();
});

function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
