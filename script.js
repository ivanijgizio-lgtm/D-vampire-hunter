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

    // ... (остальной код из оригинального ответа без изменений)
    // Важно: весь JavaScript код из предыдущего ответа поместить сюда.
    // Для краткости здесь он не повторён полностью, но вы должны скопировать его.
})();
