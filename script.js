/* ==========================================================
   BELOT CLUB
   Version 1.2
   Author: Vitaliy K.
   Logic: ChatGPT + Vitaliy
========================================================== */

/* ==========================================================
   SETTINGS
========================================================== */

const SETTINGS_KEY = "belot_settings";

const defaultSettings = {
    soundEnabled: true,
    theme: "blue"
};

let settings = loadSettings();

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...defaultSettings, ...parsed };
        }
    } catch (e) {}
    return { ...defaultSettings };
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
}

function applyTheme(theme) {
    // Проверяем, является ли тема пользовательской
    if (theme && theme.startsWith('custom_')) {
        const index = parseInt(theme.split('_')[1]);
        const themes = loadCustomThemes();
        if (themes[index]) {
            applyThemeColors(themes[index].colors);
            document.body.className = 'theme-custom';
            // Сохраняем идентификатор
            try {
                localStorage.setItem('belot_theme', theme);
            } catch (e) {}
            // Обновляем превью в настройках
            updateSettingsUI();
            return;
        } else {
            // Если тема не найдена, сбрасываем на blue
            settings.theme = 'blue';
            saveSettings();
            applyTheme('blue');
            return;
        }
    }

    // Стандартные темы
    document.body.className = `theme-${theme}`;
    const preview = document.getElementById("themePreview");
    if (preview) {
        const themes = {
            blue: "🔵 Синяя",
            graphite: "⚪ Графитовая",
            black: "⚫ Чёрная",
            "light-blue": "☀️ Светло-синяя",
            "light-gray": "🌤️ Светло-серая",
            cream: "🧈 Кремовая",
            emerald: "🟢 Изумрудная",
            neon: "💜 Неоновая"
        };
        preview.textContent = themes[theme] || "🔵 Синяя";
    }
    document.querySelectorAll(".themeBtn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    try {
        localStorage.setItem('belot_theme', theme);
    } catch (e) {}
    updateSettingsUI();
}

const savedTheme = localStorage.getItem('belot_theme');
if (savedTheme && savedTheme !== settings.theme) {
    settings.theme = savedTheme;
    applyTheme(savedTheme);
} else {
    applyTheme(settings.theme);
}

/* ==========================================================
   ПОЛЬЗОВАТЕЛЬСКИЕ ТЕМЫ
========================================================== */

const CUSTOM_THEMES_KEY = "belot_custom_themes";

// Загружаем пользовательские темы
function loadCustomThemes() {
    try {
        const data = localStorage.getItem(CUSTOM_THEMES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

// Сохраняем список тем
function saveCustomThemes(themes) {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
    renderCustomThemesList();
}

// Отображаем список в настройках
function renderCustomThemesList() {
    const container = document.getElementById("customThemesList");
    if (!container) return;
    const themes = loadCustomThemes();
    if (themes.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.9rem;">Нет сохранённых тем</span>';
        return;
    }
    container.innerHTML = themes.map((theme, idx) => {
        const isActive = settings.theme === `custom_${idx}`;
        return `
            <div class="customThemeItem ${isActive ? 'active' : ''}" onclick="applyCustomTheme(${idx})">
                <span class="themeName">${theme.name}</span>
                <div class="themeActions">
                    <button onclick="event.stopPropagation(); editCustomTheme(${idx})" title="Редактировать">✏️</button>
                    <button class="deleteBtn" onclick="event.stopPropagation(); deleteCustomTheme(${idx})" title="Удалить">✕</button>
                </div>
            </div>
        `;
    }).join('');
}

// Открыть редактор (для новой или для редактирования)
function openThemeEditor(index = null) {
    const modal = document.getElementById("themeEditorModal");
    const nameInput = document.getElementById("themeNameInput");
    const colors = {
        bgPrimary: document.getElementById("colorBgPrimary"),
        bgCard: document.getElementById("colorBgCard"),
        textPrimary: document.getElementById("colorTextPrimary"),
        textAccent: document.getElementById("colorTextAccent"),
        primary: document.getElementById("colorPrimary"),
        border: document.getElementById("colorBorder"),
    };

    if (index !== null) {
        // Редактирование существующей темы
        const themes = loadCustomThemes();
        const theme = themes[index];
        if (!theme) return;
        nameInput.value = theme.name;
        colors.bgPrimary.value = theme.colors.bgPrimary;
        colors.bgCard.value = theme.colors.bgCard;
        colors.textPrimary.value = theme.colors.textPrimary;
        colors.textAccent.value = theme.colors.textAccent;
        colors.primary.value = theme.colors.primary;
        colors.border.value = theme.colors.border;
        // Сохраняем индекс для обновления
        modal.dataset.editIndex = index;
    } else {
        // Новая тема – берём цвета из текущей темы
        const current = getCurrentThemeColors();
        nameInput.value = "";
        colors.bgPrimary.value = current.bgPrimary || "#0d2342";
        colors.bgCard.value = current.bgCard || "#1a3a5d";
        colors.textPrimary.value = current.textPrimary || "#ffffff";
        colors.textAccent.value = current.textAccent || "#ffd54d";
        colors.primary.value = current.primary || "#1d4ed8";
        colors.border.value = current.border || "#264f78";
        delete modal.dataset.editIndex;
    }

    // Обновляем превью при каждом изменении цвета
    const inputs = Object.values(colors);
    inputs.forEach(inp => {
        inp.removeEventListener('input', updateThemePreview);
        inp.addEventListener('input', updateThemePreview);
    });
    updateThemePreview();

    modal.classList.add("active");
}

// Обновить превью-макет
function updateThemePreview() {
    const card = document.getElementById("themePreviewCard");
    if (!card) return;
    const bgPrimary = document.getElementById("colorBgPrimary").value;
    const bgCard = document.getElementById("colorBgCard").value;
    const textPrimary = document.getElementById("colorTextPrimary").value;
    const textAccent = document.getElementById("colorTextAccent").value;
    const primary = document.getElementById("colorPrimary").value;
    const border = document.getElementById("colorBorder").value;

    // Применяем временные стили к превью
    card.style.setProperty('--bg-primary', bgPrimary);
    card.style.setProperty('--bg-card', bgCard);
    card.style.setProperty('--text-primary', textPrimary);
    card.style.setProperty('--text-accent', textAccent);
    card.style.setProperty('--primary', primary);
    card.style.setProperty('--border-color', border);

    // Дополнительно обновляем элементы в превью
    card.querySelector('.previewTitle').style.color = textAccent;
    card.querySelector('.previewText').style.color = textPrimary;
    card.querySelector('.previewAccent').style.color = textAccent;
    card.querySelector('.previewButton').style.background = primary;
    card.querySelector('.previewBorder').style.borderColor = border;
    // Фон карточки
    card.style.background = bgPrimary;
    card.style.borderColor = border;
    const block = card.querySelector('.previewBlock');
    if (block) {
        block.style.background = bgCard;
        block.style.borderColor = border;
    }
}

// Получить цвета текущей темы (для предзаполнения)
function getCurrentThemeColors() {
    // Считываем из активной темы
    const computed = getComputedStyle(document.body);
    return {
        bgPrimary: computed.getPropertyValue('--bg-primary').trim() || '#0d2342',
        bgCard: computed.getPropertyValue('--bg-card').trim() || '#1a3a5d',
        textPrimary: computed.getPropertyValue('--text-primary').trim() || '#ffffff',
        textAccent: computed.getPropertyValue('--text-accent').trim() || '#ffd54d',
        primary: computed.getPropertyValue('--primary').trim() || '#1d4ed8',
        border: computed.getPropertyValue('--border-color').trim() || '#264f78',
    };
}

// Применить цвета (без сохранения в настройки)
function applyThemeColors(colors) {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-card', colors.bgCard);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-accent', colors.textAccent);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--border-color', colors.border);
    // Для остальных переменных используем fallback стандартной темы (blue)
    // Можно задать производные, но для простоты оставим как есть
    // При желании можно добавить вычисление вторичных цветов
}

// Сохранить пользовательскую тему
function saveCustomTheme() {
    const nameInput = document.getElementById("themeNameInput");
    const name = nameInput.value.trim();
    if (!name) {
        alert("Введите название темы.");
        return;
    }

    const colors = {
        bgPrimary: document.getElementById("colorBgPrimary").value,
        bgCard: document.getElementById("colorBgCard").value,
        textPrimary: document.getElementById("colorTextPrimary").value,
        textAccent: document.getElementById("colorTextAccent").value,
        primary: document.getElementById("colorPrimary").value,
        border: document.getElementById("colorBorder").value,
    };

    const themes = loadCustomThemes();
    const modal = document.getElementById("themeEditorModal");
    const editIndex = modal.dataset.editIndex;

    if (editIndex !== undefined && editIndex !== null) {
        // Редактируем существующую
        const idx = parseInt(editIndex);
        if (!isNaN(idx) && themes[idx]) {
            themes[idx].name = name;
            themes[idx].colors = colors;
        }
    } else {
        // Новая тема
        themes.push({ name, colors });
    }

    saveCustomThemes(themes);
    closeThemeEditor();
    // Применяем сохранённую тему (последнюю)
    applyCustomTheme(themes.length - 1);
    showToast('Тема сохранена! ✅');
}

// Применить пользовательскую тему по индексу
function applyCustomTheme(index) {
    const themes = loadCustomThemes();
    if (!themes[index]) return;
    const theme = themes[index];
    // Сохраняем идентификатор как "custom_индекс"
    settings.theme = `custom_${index}`;
    // Применяем цвета
    applyThemeColors(theme.colors);
    document.body.className = 'theme-custom';
    saveSettings();
    renderCustomThemesList();
    updateSettingsUI();
    showToast(`Тема "${theme.name}" применена`);
}

// Удалить пользовательскую тему
function deleteCustomTheme(index) {
    if (!confirm("Удалить эту тему?")) return;
    const themes = loadCustomThemes();
    if (!themes[index]) return;
    themes.splice(index, 1);
    saveCustomThemes(themes);
    // Если активная была удалена – переключаем на стандартную
    if (settings.theme === `custom_${index}`) {
        settings.theme = 'blue';
        applyTheme('blue');
        saveSettings();
    }
    renderCustomThemesList();
    updateSettingsUI();
    showToast('Тема удалена');
}

// Редактировать тему
function editCustomTheme(index) {
    openThemeEditor(index);
}

// Закрыть редактор
function closeThemeEditor() {
    document.getElementById("themeEditorModal").classList.remove("active");
}

/* ==========================================================
   1. CONSTANTS
========================================================== */


const PLAYERS_DB_KEY = "belot_players";
const SAVE_KEY_4 = "belotClubSave4";
const SAVE_KEY_3 = "belotClubSave3";

/* ==========================================================
   2. GAME STATE
========================================================== */

const gameState = {
    mode: 4,
    players: [],
    dealerIndex: 0,
    activePlayerIndex: 0,
    round: 1,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    baseGameValue: 16,
    announcementPoints: 0,
    gameValue: 16,
    team1: { score: 0, bolts: 0 },
    team2: { score: 0, bolts: 0 },
    history: [],
    savedAnnouncements: [],
    tempAnnouncements: [],
    firstRoundDealerSet: false
};

// Массив снапшотов для Undo
let stateSnapshots = [];

/* ==========================================================
   3. PLAYERS DATABASE
========================================================== */

let playersDB = JSON.parse(localStorage.getItem(PLAYERS_DB_KEY)) || [];

/* ==========================================================
   4. DOM REFERENCES
========================================================== */

const screens = document.querySelectorAll(".screen");
const menuScreen = document.getElementById("menuScreen");
const modeScreen = document.getElementById("modeScreen");
const playersScreen = document.getElementById("playersScreen");
const historyScreen = document.getElementById("historyScreen");
const victoryScreen = document.getElementById("victoryScreen");
const gameScreen4 = document.getElementById("gameScreen4");
const gameScreen3 = document.getElementById("gameScreen3");
const playersContainer = document.getElementById("playersContainer");
const roundNumber = document.getElementById("roundNumber");
const gameTimer = document.getElementById("gameTimer");
const team1Players = document.getElementById("team1Players");
const team2Players = document.getElementById("team2Players");
const team1Score = document.getElementById("team1Score");
const team2Score = document.getElementById("team2Score");
const team1Bolts = document.getElementById("team1Bolts");
const team2Bolts = document.getElementById("team2Bolts");
const dealerName = document.getElementById("dealerName");
const activePlayerSelect = document.getElementById("activePlayerSelect");
const gameValueEl = document.getElementById("gameValue");
const announcementButton = document.getElementById("announcementButton");
const opponentScoreInput = document.getElementById("opponentScoreInput");
const playerScoreInput = document.getElementById("playerScoreInput");
const historyBody = document.getElementById("historyBody");
const continueGame4Button = document.getElementById("continueGame4Button");
const continueGame3Button = document.getElementById("continueGame3Button");
const continueScore4 = document.getElementById("continueScore4");
const continueScore3 = document.getElementById("continueScore3");
const dealerPickerModal = document.getElementById("dealerPickerModal");
const dealerPickerList = document.getElementById("dealerPickerList");
const changeDealerBtn4 = document.getElementById("changeDealerBtn4");
const changeDealerBtn3 = document.getElementById("changeDealerBtn3");

/* ==========================================================
   5. STORAGE
========================================================== */

function savePlayersDatabase() {
    localStorage.setItem(PLAYERS_DB_KEY, JSON.stringify(playersDB));
}

function saveGame() {
    const saveKey = gameState.mode === 3 ? SAVE_KEY_3 : SAVE_KEY_4;
    localStorage.setItem(saveKey, JSON.stringify(gameState));
    updateContinueButtons();
}

function loadGame(mode = 4) {
    const saveKey = mode === 3 ? SAVE_KEY_3 : SAVE_KEY_4;
    const save = localStorage.getItem(saveKey);
    if (!save) return false;
    const data = JSON.parse(save);
    Object.assign(gameState, data);
    if (!gameState.players || gameState.players.length === 0) return false;
    stateSnapshots = [];
    return true;
}

function deleteSave() {
    const saveKey = gameState.mode === 3 ? SAVE_KEY_3 : SAVE_KEY_4;
    localStorage.removeItem(saveKey);
    updateContinueButtons();
}

function updateContinueButtons() {
    const save4 = localStorage.getItem(SAVE_KEY_4);
    const save3 = localStorage.getItem(SAVE_KEY_3);
    if (save4) {
        continueGame4Button.disabled = false;
        try {
            const game = JSON.parse(save4);
            continueScore4.textContent = `${game.team1.score} : ${game.team2.score}`;
        } catch {
            continueScore4.textContent = "";
        }
    } else {
        continueGame4Button.disabled = true;
        continueScore4.textContent = "";
    }
    if (save3) {
        continueGame3Button.disabled = false;
        try {
            const game = JSON.parse(save3);
            continueScore3.textContent = `${game.players[0].score} • ${game.players[1].score} • ${game.players[2].score}`;
        } catch {
            continueScore3.textContent = "";
        }
    } else {
        continueGame3Button.disabled = true;
        continueScore3.textContent = "";
    }
}

/* ==========================================================
   6. SCREENS
========================================================== */

function showScreen(screen) {
    screens.forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
}

/* ==========================================================
   7. MENU
========================================================== */

function startGame() {
    showScreen(modeScreen);
}

function backToMenu() {
    stopTimer();
    showScreen(menuScreen);
}

/* ==========================================================
   8. CONTINUE GAME
========================================================== */

function continueGame(mode) {
    if (!loadGame(mode)) {
        alert("Нет сохранённой игры.");
        return;
    }
    if (gameState.mode === 4) {
        fillTeams();
        buildActivePlayerList();
        updateDealer();
        updateGameValue();
        renderGame();
        updateScoreLabels4();
        showScreen(gameScreen4);
    } else {
        renderGame3();
        showScreen(gameScreen3);
    }
    startTimer();
    updateChangeDealerButtons();
}

/* ==========================================================
   9. GAME MENU
========================================================== */

function openGameMenu() {
    document.getElementById("gameMenuModal").classList.add("active");
}

function closeGameMenu() {
    document.getElementById("gameMenuModal").classList.remove("active");
}

function saveAndExit() {
    saveGame();
    closeGameMenu();
    backToMenu();
}

function exitWithoutSaving() {
    if (confirm("Выйти без сохранения?")) {
        deleteSave();
        closeGameMenu();
        backToMenu();
    }
}

/* ==========================================================
   10. TIMER
========================================================== */

function startTimer() {
    stopTimer();
    gameState.timerRunning = true;
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds++;
        updateTimer();
        updateTimer3();
    }, 1000);
    const t4 = document.getElementById("gameTimer");
    const t3 = document.getElementById("gameTimer3");
    if (t4) { t4.classList.remove("timer-paused"); t4.classList.add("timer-running"); }
    if (t3) { t3.classList.remove("timer-paused"); t3.classList.add("timer-running"); }
    updateTimer();
    updateTimer3();
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerRunning = false;
    const t4 = document.getElementById("gameTimer");
    const t3 = document.getElementById("gameTimer3");
    if (t4) { t4.classList.remove("timer-running"); t4.classList.add("timer-paused"); }
    if (t3) { t3.classList.remove("timer-running"); t3.classList.add("timer-paused"); }
    updateTimer();
    updateTimer3();
}

function toggleTimer() {
    playSound('click');
    if (gameState.timerRunning) stopTimer();
    else startTimer();
}

function updateTimer() {
    const min = String(Math.floor(gameState.timerSeconds / 60)).padStart(2, "0");
    const sec = String(gameState.timerSeconds % 60).padStart(2, "0");
    const el = document.getElementById("gameTimer");
    if (el) {
        const icon = gameState.timerRunning ? "⏸️" : "▶️";
        el.textContent = `${icon} ⏱ ${min}:${sec}`;
    }
}

function updateTimer3() {
    const min = String(Math.floor(gameState.timerSeconds / 60)).padStart(2, "0");
    const sec = String(gameState.timerSeconds % 60).padStart(2, "0");
    const el = document.getElementById("gameTimer3");
    if (el) {
        const icon = gameState.timerRunning ? "⏸️" : "▶️";
        el.textContent = `${icon} ⏱ ${min}:${sec}`;
    }
}

/* ==========================================================
   11. MODE SELECTION
========================================================== */

function selectMode(mode) {
    resetGame();
    gameState.mode = mode;
    createPlayersScreen(true);
    showScreen(playersScreen);
}

/* ==========================================================
   12. PLAYERS SCREEN
========================================================== */

let currentPickerIndex = null;

function createPlayersScreen(forceClear = false) {
    const currentValues = [];
    if (!forceClear) {
        for (let i = 0; i < gameState.mode; i++) {
            const el = document.getElementById(`playerSelect${i}`);
            currentValues[i] = el ? el.dataset.value || "" : "";
        }
    }
    playersContainer.innerHTML = "";
    for (let i = 0; i < gameState.mode; i++) {
        const row = document.createElement("div");
        row.className = "playerRow";
        const field = document.createElement("div");
        field.className = "playerSelect";
        field.id = `playerSelect${i}`;
        field.dataset.value = currentValues[i] || "";
        if (currentValues[i]) {
            field.textContent = currentValues[i];
            field.style.color = "var(--text-primary)";
        } else {
            field.textContent = "Выберите игрока";
            field.style.color = "var(--text-muted)";
        }
        field.addEventListener("click", () => openPlayerPicker(i));
        const clearBtn = document.createElement("button");
        clearBtn.className = "removePlayerButton";
        clearBtn.textContent = "❌";
        clearBtn.title = "Очистить поле";
        clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            field.dataset.value = "";
            field.textContent = "Выберите игрока";
            field.style.color = "var(--text-muted)";
            createPlayersScreen();
        });
        row.appendChild(field);
        row.appendChild(clearBtn);
        playersContainer.appendChild(row);
    }
}

function openPlayerPicker(index) {
    currentPickerIndex = index;
    const list = document.getElementById("playerPickerList");
    if (!list) return;
    list.innerHTML = "";
    const selectedNames = [];
    for (let i = 0; i < gameState.mode; i++) {
        if (i === index) continue;
        const el = document.getElementById(`playerSelect${i}`);
        if (el && el.dataset.value) selectedNames.push(el.dataset.value);
    }
    playersDB.forEach(name => {
        if (selectedNames.includes(name)) return;
        const row = document.createElement("div");
        row.className = "pickerRow";
        const nameEl = document.createElement("div");
        nameEl.className = "pickerName";
        nameEl.textContent = name;
        nameEl.addEventListener("click", () => selectPlayer(name));
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "pickerDelete";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deletePlayerFromDB(name);
        });
        row.appendChild(nameEl);
        row.appendChild(deleteBtn);
        list.appendChild(row);
    });
    const newRow = document.createElement("div");
    newRow.className = "pickerRow newPlayerRow";
    newRow.innerHTML = `<div class="pickerName">➕ Новый игрок</div>`;
    newRow.addEventListener("click", () => {
        const newName = prompt("Имя нового игрока:");
        if (!newName || !newName.trim()) return;
        const playerName = newName.trim();
        if (!playersDB.includes(playerName)) {
            playersDB.push(playerName);
            playersDB.sort();
            savePlayersDatabase();
        }
        selectPlayer(playerName);
    });
    list.appendChild(newRow);
    document.getElementById("playerPickerModal").classList.add("active");
}

function selectPlayer(name) {
    playSound('click');
    const field = document.getElementById(`playerSelect${currentPickerIndex}`);
    if (!field) return;
    field.dataset.value = name;
    field.textContent = name;
    field.style.color = "var(--text-primary)";
    closePlayerPicker();
    createPlayersScreen();
}

function deletePlayerFromDB(name) {
    if (!confirm(`Удалить «${name}» из базы?`)) return;
    playersDB = playersDB.filter(p => p !== name);
    savePlayersDatabase();
    for (let i = 0; i < gameState.mode; i++) {
        const el = document.getElementById(`playerSelect${i}`);
        if (el && el.dataset.value === name) {
            el.dataset.value = "";
            el.textContent = "Выберите игрока";
            el.style.color = "var(--text-muted)";
        }
    }
    openPlayerPicker(currentPickerIndex);
}

function closePlayerPicker() {
    document.getElementById("playerPickerModal").classList.remove("active");
    currentPickerIndex = null;
}

/* ==========================================================
   13. CONFIRM PLAYERS & START GAME
========================================================== */

function confirmPlayers() {
    gameState.history = [];
    stateSnapshots = [];
    gameState.round = 1;
    gameState.timerSeconds = 0;
    gameState.announcementPoints = 0;
    gameState.baseGameValue = 16;
    gameState.gameValue = 16;
    gameState.firstRoundDealerSet = false;
    resetAnnouncements();
    if (gameState.mode === 4) {
        gameState.team1.score = 0;
        gameState.team2.score = 0;
        gameState.team1.bolts = 0;
        gameState.team2.bolts = 0;
    }
    gameState.players = [];
    for (let i = 0; i < gameState.mode; i++) {
        const field = document.getElementById(`playerSelect${i}`);
        const value = field ? field.dataset.value : "";
        if (!value) {
            alert("Выберите всех игроков.");
            return;
        }
        if (gameState.mode === 4) {
            gameState.players.push({ name: value });
        } else {
            gameState.players.push({ name: value, score: 0, bolts: 0 });
        }
    }
    gameState.dealerIndex = 0;
    gameState.activePlayerIndex = 1;
    gameState.timerSeconds = 0;
    gameState.announcementPoints = 0;
    gameState.baseGameValue = 16;
    gameState.gameValue = 16;
    gameState.history = [];
    if (gameState.mode === 4) {
        gameState.team1.score = 0;
        gameState.team2.score = 0;
        gameState.team1.bolts = 0;
        gameState.team2.bolts = 0;
    } else {
        gameState.players.forEach(player => {
            player.score = 0;
            player.bolts = 0;
        });
    }
    resetAnnouncements();
    showDealerPicker();
}

/* ==========================================================
   14. DEALER PICKER
========================================================== */

function showDealerPicker() {
    if (!dealerPickerList) return;
    dealerPickerList.innerHTML = "";
    gameState.players.forEach((player, index) => {
        const row = document.createElement("div");
        row.className = "pickerRow";
        row.innerHTML = `<div class="pickerName">${player.name}</div>`;
        row.addEventListener("click", () => selectDealer(index));
        dealerPickerList.appendChild(row);
    });
    dealerPickerModal.classList.add("active");
}

function selectDealer(index) {
    gameState.dealerIndex = index;
    gameState.firstRoundDealerSet = true;
    closeDealerPicker();
    if (gameState.mode === 4) {
        fillTeams();
        buildActivePlayerList();
        updateDealer();
        updateGameValue();
        renderGame();
        updateScoreLabels4();
        showScreen(gameScreen4);
    } else {
        buildActivePlayerList3();
        updateDealer3();
        updateGameValue3();
        renderGame3();
        showScreen(gameScreen3);
    }
    startTimer();
    updateChangeDealerButtons();
    saveGame();
}

function closeDealerPicker() {
    dealerPickerModal.classList.remove("active");
}

/* ==========================================================
   15. TEAMS
========================================================== */

function fillTeams() {
    if (gameState.mode === 4 && gameState.players.length >= 4) {
        team1Players.innerHTML = `${gameState.players[0].name}<br>${gameState.players[2].name}`;
        team2Players.innerHTML = `${gameState.players[1].name}<br>${gameState.players[3].name}`;
    }
}

/* ==========================================================
   16. DEALER
========================================================== */

function updateDealer() {
    dealerName.textContent = gameState.players[gameState.dealerIndex].name;
}

function nextDealer() {
    gameState.dealerIndex++;
    if (gameState.dealerIndex >= gameState.players.length) {
        gameState.dealerIndex = 0;
    }
    updateDealer();
}

/* ==========================================================
   17. ACTIVE PLAYER
========================================================== */

function buildActivePlayerList() {
    activePlayerSelect.innerHTML = "";
    gameState.players.forEach((player, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = player.name;
        activePlayerSelect.appendChild(option);
    });
    activePlayerSelect.selectedIndex = gameState.activePlayerIndex;
}

/* ==========================================================
   18. ANNOUNCEMENTS DATA
========================================================== */

const announcements = [
    { name: "Тэрц",   points: 2,  multiple: true  },
    { name: "Бэла",   points: 2,  multiple: false },
    { name: "50",     points: 5,  multiple: true  },
    { name: "100",    points: 10, multiple: true  },
    { name: "Каре",   points: 10, multiple: true  },
    { name: "Каре 9", points: 14, multiple: false },
    { name: "Каре В", points: 20, multiple: false }
];

function buildAnnouncements() {
    gameState.savedAnnouncements = announcements.map(item => ({
        name: item.name,
        points: item.points,
        multiple: item.multiple,
        count: 0
    }));
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
}

function resetAnnouncements() {
    gameState.savedAnnouncements.forEach(item => item.count = 0);
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
    gameState.announcementPoints = 0;
    gameState.gameValue = gameState.baseGameValue;
}

/* ==========================================================
   19. OPEN / CLOSE / APPLY ANNOUNCEMENTS
========================================================== */

function openAnnouncements() {
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
    renderAnnouncementWindow();
    document.getElementById("announcementModal").classList.add("active");
}

function cancelAnnouncements() {
    document.getElementById("announcementModal").classList.remove("active");
}

function applyAnnouncements() {
    gameState.savedAnnouncements = JSON.parse(JSON.stringify(gameState.tempAnnouncements));
    recalculateAnnouncements();
    updateGameValue();
    updateGameValue3();
    updateScoreHints();
    updateScoreHints3();
    document.getElementById("announcementModal").classList.remove("active");
    if (gameState.mode === 4) {
        document.getElementById("opponentScoreInput")?.focus();
    } else {
        document.getElementById("player1ScoreInput3")?.focus();
    }
}

function recalculateAnnouncements() {
    let total = 0;
    gameState.savedAnnouncements.forEach(item => {
        total += item.points * item.count;
    });
    gameState.announcementPoints = total;
    gameState.gameValue = gameState.baseGameValue + total;
}

function updateGameValue() {
    gameState.gameValue = gameState.baseGameValue + gameState.announcementPoints;
    if (gameValueEl) gameValueEl.textContent = `🟠 ${gameState.gameValue}`;
    if (announcementButton) announcementButton.textContent = `📣 (+${gameState.announcementPoints})`;
}

function renderAnnouncementWindow() {
    const list = document.getElementById("announcementList");
    if (!list) return;
    list.innerHTML = "";
    gameState.tempAnnouncements.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "announcementRow";
        const title = document.createElement("div");
        title.className = "announcementTitle";
        title.textContent = `${item.name} (+${item.points})`;
        const counter = document.createElement("div");
        counter.className = "announcementCounter";
        const minus = document.createElement("button");
        minus.className = "counterButton";
        minus.textContent = "−";
        minus.onclick = () => {
            if (item.count === 0) return;
            item.count--;
            value.textContent = item.count;
            updateAnnouncementPreview();
        };
        const value = document.createElement("span");
        value.className = "counterValue";
        value.textContent = item.count;
        const plus = document.createElement("button");
        plus.className = "counterButton";
        plus.textContent = "+";
        plus.onclick = () => {
            if (!item.multiple && item.count >= 1) return;
            item.count++;
            value.textContent = item.count;
            updateAnnouncementPreview();
        };
        counter.appendChild(minus);
        counter.appendChild(value);
        counter.appendChild(plus);
        row.appendChild(title);
        row.appendChild(counter);
        list.appendChild(row);
    });
    updateAnnouncementPreview();
}

function updateAnnouncementPreview() {
    let bonus = 0;
    gameState.tempAnnouncements.forEach(item => {
        bonus += item.points * item.count;
    });
    const previewGameValue = gameState.baseGameValue + bonus;
    const previewGame = document.getElementById("announcementTempGame");
    const previewCount = document.getElementById("announcementTempCount");
    if (previewGame) previewGame.textContent = previewGameValue;
    if (previewCount) previewCount.textContent = `📣 (+${bonus})`;
}

/* ==========================================================
   20. SCORE HINTS (для 4 игроков)
========================================================== */

function updateScoreHints() {
    const playerVal = playerScoreInput.value !== "" ? Number(playerScoreInput.value) : null;
    const opponentVal = opponentScoreInput.value !== "" ? Number(opponentScoreInput.value) : null;
    const gameVal = gameState.gameValue;

    if (playerVal !== null && opponentVal !== null && !isNaN(playerVal) && !isNaN(opponentVal) && playerVal >= 0 && opponentVal >= 0) {
        if (playerVal + opponentVal === gameVal) {
            playerScoreInput.placeholder = "";
            opponentScoreInput.placeholder = "";
        }
    } else if (playerVal !== null && !isNaN(playerVal) && playerVal >= 0) {
        const remainder = gameVal - playerVal;
        opponentScoreInput.placeholder = remainder >= 0 ? String(remainder) : "";
        playerScoreInput.placeholder = "";
    } else if (opponentVal !== null && !isNaN(opponentVal) && opponentVal >= 0) {
        const remainder = gameVal - opponentVal;
        playerScoreInput.placeholder = remainder >= 0 ? String(remainder) : "";
        opponentScoreInput.placeholder = "";
    } else {
        playerScoreInput.placeholder = "";
        opponentScoreInput.placeholder = "";
    }
}

playerScoreInput.addEventListener("input", updateScoreHints);
opponentScoreInput.addEventListener("input", updateScoreHints);

/* ==========================================================
   21. SAVE ROUND (4 players)
========================================================== */

function saveRound() {
    gameState.activePlayerIndex = Number(activePlayerSelect.value);
    const playerPoints = Number(playerScoreInput.value);
    const opponentPoints = Number(opponentScoreInput.value);

    if (Number.isNaN(playerPoints) || Number.isNaN(opponentPoints)) {
        alert("Введите очки.");
        return;
    }
    if (playerPoints < 0 || opponentPoints < 0) {
        alert("Очки не могут быть отрицательными.");
        return;
    }

    stateSnapshots.push(snapshotGameState());

    if (playerPoints === 0 && opponentPoints === 0) {
        processRound(0, 0);
        return;
    }

    if (playerPoints === 0 && opponentPoints > 0) {
        alert("Играющий не может набрать 0 очков.\nМинимум — 2.");
        stateSnapshots.pop();
        return;
    }

    if (playerPoints + opponentPoints !== gameState.gameValue) {
        alert(`Сумма очков должна быть ${gameState.gameValue}.`);
        stateSnapshots.pop();
        return;
    }

    pendingRoundSnapshot = snapshotGameState();
    processRound(playerPoints, opponentPoints);
}

/* ==========================================================
   22. PROCESS ROUND (4 players)
========================================================== */

function processRound(playerPoints, opponentPoints) {
    const active = Number(gameState.activePlayerIndex);
    const dealerName = gameState.players[gameState.dealerIndex].name;
    const activeName = gameState.players[gameState.activePlayerIndex].name;

    let activeTeam;
    if (gameState.mode === 4) {
        activeTeam = (active === 0 || active === 2) ? 1 : 2;
    } else {
        activeTeam = active + 1;
    }

    let team1Delta = 0;
    let team2Delta = 0;
    let team1Note = "";
    let team2Note = "";
    let result = "normal";

    if (playerPoints === 0 && opponentPoints === 0) {
        result = "redeal";
        if (gameState.dealerIndex === 0 || gameState.dealerIndex === 2) {
            team1Delta = -10;
            team1Note = "-10 неправильная";
        } else {
            team2Delta = -10;
            team2Note = "-10 неправильная";
        }
    }
    else if (opponentPoints === 0) {
        result = "capot";
        if (activeTeam === 1) {
            team1Delta = gameState.gameValue;
            team2Delta = -10;
            team2Note = "-10 нет взятки";
        } else {
            team2Delta = gameState.gameValue;
            team1Delta = -10;
            team1Note = "-10 нет взятки";
        }
    }
    else if (playerPoints > 0 && playerPoints < Math.ceil(gameState.gameValue / 2)) {
        result = "bolt";
        if (activeTeam === 1) {
            gameState.team1.bolts++;
            team2Delta = gameState.gameValue;
            team1Note = `⚡ ${playerPoints}`;
        } else {
            gameState.team2.bolts++;
            team1Delta = gameState.gameValue;
            team2Note = `⚡ ${playerPoints}`;
        }
    }
    else {
        if (activeTeam === 1) {
            team1Delta = playerPoints;
            team2Delta = opponentPoints;
        } else {
            team2Delta = playerPoints;
            team1Delta = opponentPoints;
        }
    }

    if (gameState.team1.bolts >= 3) {
        gameState.team1.score -= 10;
        gameState.team1.bolts = 0;
        if (team1Note) team1Note += " ";
        team1Note += " → -10";
    }
    if (gameState.team2.bolts >= 3) {
        gameState.team2.score -= 10;
        gameState.team2.bolts = 0;
        if (team2Note) team2Note += " ";
        team2Note += " → -10";
    }

    gameState.team1.score += team1Delta;
    gameState.team2.score += team2Delta;

    addHistoryRow({
        round: gameState.round,
        game: gameState.gameValue,
        announce: gameState.announcementPoints,
        team1: team1Delta,
        team2: team2Delta,
        team1Note: team1Note,
        team2Note: team2Note,
        team1Total: gameState.team1.score,
        team2Total: gameState.team2.score,
        dealer: dealerName,
        active: activeName,
        result: result
    });

    gameState.round++;
    nextDealer();
    resetAnnouncements();
    updateGameValue();

    playerScoreInput.value = "";
    opponentScoreInput.value = "";
    playerScoreInput.placeholder = "";
    opponentScoreInput.placeholder = "";

    renderGame();
    saveGame();

    const hadWinner = checkWinner();
    if (!hadWinner) {
        showRoundConfirm();
        playSound(lastRoundResultSound());
        setTimeout(() => {
            activePlayerSelect.focus();
            setTimeout(() => playerScoreInput.focus(), 100);
            setTimeout(() => opponentScoreInput.focus(), 200);
        }, 300);
    } else {
        playSound('win');
        launchConfetti();
    }
    updateChangeDealerButtons();
}

/* ==========================================================
   23. CHECK WINNER + DRAW
========================================================== */

function checkWinner() {
    const s1 = gameState.team1.score;
    const s2 = gameState.team2.score;
    if (s1 >= 101 && s2 >= 101) {
        showDraw();
        return true;
    }
    if (s1 >= 101) {
        showWinner(1);
        return true;
    }
    if (s2 >= 101) {
        showWinner(2);
        return true;
    }
    return false;
}

/* ==========================================================
   24. RENDER GAME (4 players)
========================================================== */

function formatBolts(count) {
    if (!count || count <= 0) return "";
    return "⚡".repeat(Math.min(count, 3));
}

function renderGame() {
    if (roundNumber) roundNumber.textContent = `#${gameState.round}`;
    updateTimer();
    if (team1Score) team1Score.textContent = gameState.team1.score;
    if (team2Score) team2Score.textContent = gameState.team2.score;
    if (team1Bolts) team1Bolts.textContent = formatBolts(gameState.team1.bolts);
    if (team2Bolts) team2Bolts.textContent = formatBolts(gameState.team2.bolts);
    updateScoreLabels4();
    updateChangeDealerButtons();
}

function updateScoreLabels4() {
    const active = gameState.activePlayerIndex;
    if (gameState.players.length < 4) return;
    const p = gameState.players;
    let playerNames = [];
    let opponentNames = [];
    if (active === 0 || active === 2) {
        playerNames = [p[0].name, p[2].name];
        opponentNames = [p[1].name, p[3].name];
    } else {
        playerNames = [p[1].name, p[3].name];
        opponentNames = [p[0].name, p[2].name];
    }
    const opponentNamesEl = document.getElementById("opponentNames4");
    const playerNamesEl = document.getElementById("playerNames4");
    if (opponentNamesEl) opponentNamesEl.textContent = opponentNames.join(' & ');
    if (playerNamesEl) playerNamesEl.textContent = playerNames.join(' & ');
}

function updateChangeDealerButtons() {
    const show = (gameState.history.length === 0);
    if (changeDealerBtn4) changeDealerBtn4.style.display = show ? "inline-block" : "none";
    if (changeDealerBtn3) changeDealerBtn3.style.display = show ? "inline-block" : "none";
}

function changeDealer() {
    if (gameState.history.length > 0) {
        alert("Нельзя сменить раздающего после первой раздачи.");
        return;
    }
    showDealerPicker();
}

/* ==========================================================
   25. HISTORY
========================================================== */

function addHistoryRow(record) {
    gameState.history.push(record);
    renderHistory();
}

function renderHistory() {
    if (!historyBody) return;
    historyBody.innerHTML = "";
    const thead = document.querySelector("#historyTable thead tr");
    if (thead) {
        if (gameState.mode === 3 && gameState.players.length === 3) {
            thead.innerHTML = `
                <th>#</th>
                <th>Игра</th>
                <th>📣</th>
                <th>${gameState.players[0].name}</th>
                <th>${gameState.players[1].name}</th>
                <th>${gameState.players[2].name}</th>
                <th>Раздаёт</th>
            `;
        } else {
            let team1Header = "Ком.1";
            let team2Header = "Ком.2";
            if (gameState.players && gameState.players.length >= 4) {
                team1Header = `${gameState.players[0].name}<br>${gameState.players[2].name}`;
                team2Header = `${gameState.players[1].name}<br>${gameState.players[3].name}`;
            }
            thead.innerHTML = `
                <th>#</th>
                <th>Игра</th>
                <th>📣</th>
                <th>${team1Header}</th>
                <th>${team2Header}</th>
                <th>Раздаёт</th>
            `;
        }
    }
    gameState.history.forEach(item => {
        const row = document.createElement("tr");
        if (gameState.mode === 3) {
            row.appendChild(createCell(item.round));
            row.appendChild(createCell(item.game || "—"));
            row.appendChild(createCell(item.announce > 0 ? `+${item.announce}` : "—"));
            for (let i = 0; i < 3; i++) {
                const cell = document.createElement("td");
                const delta = item.deltas ? item.deltas[i] : 0;
                const total = item.totals ? item.totals[i] : 0;
                const note = item.notes ? (item.notes[i] || "") : "";
                const sign = delta > 0 ? `+${delta}` : delta;
                const isActive = gameState.players[i] && item.active === gameState.players[i].name;
                const crown = isActive ? " 👑" : "";
                cell.innerHTML = `
                    <div>${crown}${sign} <span class="historyTotal">(${total})</span></div>
                    <small class="historyPenalty">${note}</small>
                `;
                row.appendChild(cell);
            }
            row.appendChild(createCell(item.dealer || "—"));
        } else {
            row.appendChild(createCell(item.round));
            row.appendChild(createCell(item.game));
            row.appendChild(createCell(item.announce > 0 ? `+${item.announce}` : "—"));
            let activeTeam = 0;
            if (gameState.players && gameState.players.length >= 4 && item.active) {
                const idx = gameState.players.findIndex(p => p.name === item.active);
                if (idx === 0 || idx === 2) activeTeam = 1;
                else if (idx === 1 || idx === 3) activeTeam = 2;
            }
            const team1Cell = document.createElement("td");
            const sign1 = item.team1 > 0 ? `+${item.team1}` : item.team1;
            const crown1 = activeTeam === 1 ? " 👑" : "";
            team1Cell.innerHTML = `
                <div>${crown1}${sign1} <span class="historyTotal">(${item.team1Total})</span></div>
                <small class="historyPenalty">${item.team1Note || ""}</small>
            `;
            row.appendChild(team1Cell);
            const team2Cell = document.createElement("td");
            const sign2 = item.team2 > 0 ? `+${item.team2}` : item.team2;
            const crown2 = activeTeam === 2 ? " 👑" : "";
            team2Cell.innerHTML = `
                <div>${crown2}${sign2} <span class="historyTotal">(${item.team2Total})</span></div>
                <small class="historyPenalty">${item.team2Note || ""}</small>
            `;
            row.appendChild(team2Cell);
            row.appendChild(createCell(item.dealer));
        }
        historyBody.appendChild(row);
    });
}

function createCell(value) {
    const td = document.createElement("td");
    td.textContent = value;
    return td;
}

/* ==========================================================
   26. HISTORY WINDOW
========================================================== */

function openHistory() {
    renderHistory();
    showScreen(historyScreen);
}

function closeHistory() {
    if (gameState.mode === 4) {
        showScreen(gameScreen4);
    } else {
        showScreen(gameScreen3);
    }
}

/* ==========================================================
   27. WINNER
========================================================== */

function showWinner(team) {
    stopTimer();
    deleteSave();
    updateContinueButtons();
    showScreen(victoryScreen);
    const p = gameState.players;
    const t1Names = p.length >= 4 ? `${p[0].name} & ${p[2].name}` : "Команда 1";
    const t2Names = p.length >= 4 ? `${p[1].name} & ${p[3].name}` : "Команда 2";
    const timerText = document.getElementById("gameTimer")?.textContent || "⏱ 00:00";
    document.getElementById("winnerTitle").textContent = `🏆 Победила команда ${team}`;
    document.getElementById("winnerText").textContent = `Игра окончена после ${gameState.round - 1} раздач`;
    const win1 = team === 1 ? " victoryTeamWin" : "";
    const win2 = team === 2 ? " victoryTeamWin" : "";
    document.getElementById("victoryStatistics").innerHTML = `
        <div class="victoryTeams">
            <div class="victoryTeam${win1}">
                <div class="victoryTeamLeft">
                    <div class="victoryTeamTitle">Команда 1</div>
                    <div class="victoryTeamNames">${t1Names}</div>
                </div>
                <div class="victoryTeamRight">
                    <div class="victoryTeamScore">${gameState.team1.score}</div>
                    <div class="victoryTeamBolts">${formatBolts(gameState.team1.bolts) || ""}</div>
                </div>
            </div>
            <div class="victoryTeam${win2}">
                <div class="victoryTeamLeft">
                    <div class="victoryTeamTitle">Команда 2</div>
                    <div class="victoryTeamNames">${t2Names}</div>
                </div>
                <div class="victoryTeamRight">
                    <div class="victoryTeamScore">${gameState.team2.score}</div>
                    <div class="victoryTeamBolts">${formatBolts(gameState.team2.bolts) || ""}</div>
                </div>
            </div>
        </div>
        <div class="victoryTimer">${timerText}</div>
    `;
}

function showDraw() {
    stopTimer();
    deleteSave();
    updateContinueButtons();
    showScreen(victoryScreen);
    const p = gameState.players;
    const t1Names = p.length >= 4 ? `${p[0].name} & ${p[2].name}` : "Команда 1";
    const t2Names = p.length >= 4 ? `${p[1].name} & ${p[3].name}` : "Команда 2";
    const timerText = document.getElementById("gameTimer")?.textContent || "⏱ 00:00";
    document.getElementById("winnerTitle").textContent = "🤝 Ничья!";
    document.getElementById("winnerText").textContent = `Обе команды набрали 101+ после ${gameState.round - 1} раздач`;
    document.getElementById("victoryStatistics").innerHTML = `
        <div class="victoryTeams">
            <div class="victoryTeam">
                <div class="victoryTeamLeft">
                    <div class="victoryTeamTitle">Команда 1</div>
                    <div class="victoryTeamNames">${t1Names}</div>
                </div>
                <div class="victoryTeamRight">
                    <div class="victoryTeamScore">${gameState.team1.score}</div>
                    <div class="victoryTeamBolts">${formatBolts(gameState.team1.bolts) || ""}</div>
                </div>
            </div>
            <div class="victoryTeam">
                <div class="victoryTeamLeft">
                    <div class="victoryTeamTitle">Команда 2</div>
                    <div class="victoryTeamNames">${t2Names}</div>
                </div>
                <div class="victoryTeamRight">
                    <div class="victoryTeamScore">${gameState.team2.score}</div>
                    <div class="victoryTeamBolts">${formatBolts(gameState.team2.bolts) || ""}</div>
                </div>
            </div>
        </div>
        <div class="victoryTimer">${timerText}</div>
    `;
}

/* ==========================================================
   28. RULES
========================================================== */

function openRules() {
    document.getElementById("rulesModal").classList.add("active");
}

function closeRules() {
    document.getElementById("rulesModal").classList.remove("active");
}

function fillRules() {
    const rules = document.getElementById("rulesContent");
    if (!rules) return;
    rules.innerHTML = `
        <h3>🎯 Цель игры</h3>
        <p>Побеждает команда (или игрок в режиме 3), первой набравшая <b>101</b> очко или больше.<br>
        Если обе команды набрали 101+ в одной раздаче — <b>ничья</b>.<br>
        Счёт может уходить в минус.</p>

        <h3>🃏 Раздача (4 игрока)</h3>
        <p>Каждому игроку раздаётся по <b>3</b> карты. Затем открывается <b>козырь</b> (верхняя карта колоды).<br>
        Игроки по очереди решают: <b>играть в эту масть</b> или <b>пас</b>.<br>
        Если все пасуют, выбирается <b>другая масть</b> (по соглашению за столом).<br>
        После этого раздаются оставшиеся <b>3</b> карты каждому.<br>
        В колоде используются карты от <b>9</b> до <b>Т</b> (туз).</p>

        <h3>🃏 Раздача (3 игрока)</h3>
        <p>Каждому игроку раздаётся по <b>5</b> карт. Затем объявляется <b>козырь</b> (по выбору игрока, который выиграл торг).<br>
        После этого раздаются оставшиеся <b>3</b> карты каждому.<br>
        В колоде также от <b>9</b> до <b>Т</b>.<br>
        <b>Важно:</b> последнему сопернику (не играющему) добавляется <b>1 балл</b> за «прикуп» (по желанию).</p>

        <h3>🃏 Стоимость игры</h3>
        <p>Базовая стоимость игры — <b>16</b> очков.<br>
        Каждое объявление добавляет свои очки к стоимости.<br>
        <b>Пример:</b> 16 + Тэрц (+2) + Бэла (+2) = <b>20</b></p>

        <h3>📣 Объявления</h3>
        <p>Объявления можно делать <b>до</b> начала розыгрыша.<br>
        Они влияют на стоимость игры и записываются в историю.</p>
        <table class="rulesTable">
            <tr><th>Название</th><th>Очки</th><th>Можно повторить</th><th>Описание</th></tr>
            <tr><td><b>Тэрц</b></td><td>+2</td><td>✅ Да</td><td>Три карты одной масти подряд (9,10,В)</td></tr>
            <tr><td><b>Бэла</b></td><td>+2</td><td>❌ Нет</td><td>Король и Дама одной масти</td></tr>
            <tr><td><b>50</b></td><td>+5</td><td>✅ Да</td><td>50 очков за взятки</td></tr>
            <tr><td><b>100</b></td><td>+10</td><td>✅ Да</td><td>100 очков за взятки</td></tr>
            <tr><td><b>Каре</b></td><td>+10</td><td>✅ Да</td><td>Четыре карты одного достоинства (кроме 9 и В)</td></tr>
            <tr><td><b>Каре 9</b></td><td>+14</td><td>❌ Нет</td><td>Четыре девятки</td></tr>
            <tr><td><b>Каре В</b></td><td>+20</td><td>❌ Нет</td><td>Четыре валета</td></tr>
        </table>

        <h3>⚡ Болт</h3>
        <p>Если играющий набрал <b>меньше половины</b> стоимости игры, но <b>больше нуля</b> —<br>
        он получает болт, а все очки игры переходят соперникам.</p>
        <p><b>3 болта → −10 очков</b>, после чего болты обнуляются.</p>

        <h3>🚫 Нет взятки (Капот)</h3>
        <p>Если соперники набрали <b>0</b> очков — они получают штраф <b>-10</b>,<br>
        а играющий получает все очки игры.</p>

        <h3>❌ Неправильная раздача</h3>
        <p>При результате <b>0 : 0</b> (все игроки набрали 0) —<br>
        раздающий получает <b>-10</b>, очки игры никому не начисляются.</p>

        <h3>👑 Кто играет</h3>
        <p>В режиме <b>4 игрока</b>: играет один игрок, его партнёр — в той же команде.<br>
        В режиме <b>3 игрока</b>: играет один игрок, соперники — двое других.</p>
        <p>Играющий <b>обязан</b> набрать хотя бы 2 очка (если соперники не набрали 0).</p>
    `;
}

/* ==========================================================
   29. RESET GAME
========================================================== */

function resetGame() {
    stopTimer();
    gameState.mode = 0;
    gameState.players = [];
    gameState.round = 1;
    gameState.dealerIndex = 0;
    gameState.activePlayerIndex = 0;
    gameState.timerSeconds = 0;
    gameState.baseGameValue = 16;
    gameState.gameValue = 16;
    gameState.announcementPoints = 0;
    gameState.team1.score = 0;
    gameState.team2.score = 0;
    gameState.team1.bolts = 0;
    gameState.team2.bolts = 0;
    gameState.history = [];
    stateSnapshots = [];
    gameState.firstRoundDealerSet = false;
    if (gameState.savedAnnouncements.length) {
        resetAnnouncements();
    }
}

/* ==========================================================
   30. INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    fillRules();
    buildAnnouncements();
    updateTimer();
    updateContinueButtons();
    updateChangeDealerButtons();
    renderCustomThemesList();

    const select4 = document.getElementById("activePlayerSelect");
    if (select4) {
        select4.addEventListener("change", function() {
            gameState.activePlayerIndex = Number(this.value);
            updateScoreLabels4();
            updateScoreHints();
            document.getElementById("announcementButton")?.focus();
        });
    }

    const select3 = document.getElementById("activePlayerSelect3");
    if (select3) {
        select3.addEventListener("change", function() {
            gameState.activePlayerIndex = Number(this.value);
            updateInputLabels3();
            updateScoreHints3();
            document.getElementById("announcementButton3")?.focus();
        });
    }

    setupScoreHints3();
});

/* ==========================================================
   31. RENDER GAME 3 PLAYERS
========================================================== */

function renderGame3() {
    const rn = document.getElementById("roundNumber3");
    if (rn) rn.textContent = "#" + gameState.round;
    updateTimer3();
    updateDealer3();
    updateGameValue3();
    buildActivePlayerList3();
    updatePlayersPanel3();
    updateInputLabels3();
    setupScoreHints3();
    updateChangeDealerButtons();
}

function updateDealer3() {
    const el = document.getElementById("dealerName3");
    if (el && gameState.players[gameState.dealerIndex]) {
        el.textContent = gameState.players[gameState.dealerIndex].name;
    }
}

function updateGameValue3() {
    const gv = document.getElementById("gameValue3");
    if (gv) gv.textContent = `🟠 ${gameState.gameValue}`;
    const btn = document.getElementById("announcementButton3");
    if (btn) btn.textContent = `📣 (+${gameState.announcementPoints})`;
}

function updatePlayersPanel3() {
    for (let i = 0; i < 3; i++) {
        const player = gameState.players[i];
        if (!player) continue;
        const nameEl = document.getElementById(`player${i + 1}TotalName3`);
        const scoreEl = document.getElementById(`player${i + 1}TotalScore3`);
        const boltsEl = document.getElementById(`player${i + 1}Bolts3`);
        if (nameEl) nameEl.textContent = player.name;
        if (scoreEl) scoreEl.textContent = player.score;
        if (boltsEl) boltsEl.textContent = formatBolts(player.bolts);
    }
}

function buildActivePlayerList3() {
    const select = document.getElementById("activePlayerSelect3");
    if (!select) return;
    select.innerHTML = "";
    gameState.players.forEach((player, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = player.name;
        select.appendChild(option);
    });
    select.value = gameState.activePlayerIndex;
}

function updateInputLabels3() {
    for (let i = 0; i < 3; i++) {
        const label = document.getElementById(`playerLabel${i + 1}3`);
        if (!label || !gameState.players[i]) continue;
        let text = gameState.players[i].name;
        if (i === gameState.activePlayerIndex) text += " 👑";
        label.textContent = text;
    }
}


/* ==========================================================
   32. SAVE ROUND 3
========================================================== */

function saveRound3() {
    gameState.activePlayerIndex = Number(document.getElementById("activePlayerSelect3").value);

    const p1 = Number(document.getElementById("player1ScoreInput3").value);
    const p2 = Number(document.getElementById("player2ScoreInput3").value);
    const p3 = Number(document.getElementById("player3ScoreInput3").value);

    if (Number.isNaN(p1) || Number.isNaN(p2) || Number.isNaN(p3)) {
        alert("Введите очки всех игроков.");
        return;
    }
    if (p1 < 0 || p2 < 0 || p3 < 0) {
        alert("Очки не могут быть отрицательными.");
        return;
    }

    stateSnapshots.push(snapshotGameState());

    if (p1 === 0 && p2 === 0 && p3 === 0) {
        processRound3(0, 0, 0);
        return;
    }

    const active = gameState.activePlayerIndex;
    const scores = [p1, p2, p3];
    if (scores[active] === 0) {
        alert("Играющий не может набрать 0 очков.\nМинимум — 2.");
        stateSnapshots.pop();
        return;
    }
    if (p1 + p2 + p3 !== gameState.gameValue) {
        alert(`Сумма очков должна быть ${gameState.gameValue}.`);
        stateSnapshots.pop();
        return;
    }

    pendingRoundSnapshot = snapshotGameState();
    processRound3(p1, p2, p3);
}

/* ==========================================================
   33. PROCESS ROUND 3
========================================================== */

let pendingTieData = null;

function processRound3(p1, p2, p3) {
    const scores = [p1, p2, p3];
    const active = gameState.activePlayerIndex;
    const deltas = [0, 0, 0];
    const notes = ["", "", ""];
    let result = "normal";

    if (p1 === 0 && p2 === 0 && p3 === 0) {
        result = "redeal";
        const dealer = gameState.dealerIndex;
        gameState.players[dealer].score -= 10;
        deltas[dealer] = -10;
        notes[dealer] = "-10 неправильная";
        finishRound3(deltas, notes, result);
        return;
    }

    const activePoints = scores[active];
    let maxOpponent = -1;
    let topOpponents = [];

    for (let i = 0; i < 3; i++) {
        if (i === active) continue;
        if (scores[i] > maxOpponent) {
            maxOpponent = scores[i];
            topOpponents = [i];
        } else if (scores[i] === maxOpponent) {
            topOpponents.push(i);
        }
    }

    const played = activePoints >= maxOpponent;

    if (played) {
        for (let i = 0; i < 3; i++) {
            deltas[i] = scores[i];
            gameState.players[i].score += scores[i];
            if (i !== active && scores[i] === 0) {
                gameState.players[i].score -= 10;
                deltas[i] -= 10;
                notes[i] = "-10 нет взятки";
            }
        }
        finishRound3(deltas, notes, result);
        return;
    }

    result = "bolt";
    gameState.players[active].bolts++;
    notes[active] = `⚡ ${activePoints}`;

    if (gameState.players[active].bolts >= 3) {
        gameState.players[active].score -= 10;
        gameState.players[active].bolts = 0;
        notes[active] += " → -10";
        deltas[active] -= 10;
    }

    if (topOpponents.length === 1) {
        const winner = topOpponents[0];
        const third = [0, 1, 2].find(i => i !== active && i !== winner);

        deltas[winner] = scores[winner] + activePoints;
        gameState.players[winner].score += deltas[winner];

        deltas[third] = scores[third];
        gameState.players[third].score += scores[third];

        if (scores[winner] === 0) {
            gameState.players[winner].score -= 10;
            deltas[winner] -= 10;
            notes[winner] = (notes[winner] || "") + "-10 нет взятки";
        }
        if (scores[third] === 0) {
            gameState.players[third].score -= 10;
            deltas[third] -= 10;
            notes[third] = (notes[third] || "") + "-10 нет взятки";
        }
        finishRound3(deltas, notes, result);
        return;
    }

    pendingTieData = { scores, active, activePoints, topOpponents, deltas, notes, result };
    showTieChoiceModal(topOpponents);
}

function showTieChoiceModal(opponents) {
    const container = document.getElementById("tieChoiceButtons");
    if (!container) return;
    container.innerHTML = "";
    const names = opponents.map(i => gameState.players[i].name);
    const btn1 = document.createElement("button");
    btn1.className = "primaryButton";
    btn1.textContent = `Очки играющего → ${names[0]}`;
    btn1.onclick = () => resolveTie(opponents[0]);
    container.appendChild(btn1);
    const btn2 = document.createElement("button");
    btn2.className = "primaryButton";
    btn2.textContent = `Очки играющего → ${names[1]}`;
    btn2.onclick = () => resolveTie(opponents[1]);
    container.appendChild(btn2);
    const btn3 = document.createElement("button");
    btn3.className = "primaryButton";
    btn3.textContent = "Разделить очки играющего поровну";
    btn3.onclick = () => resolveTie("split");
    container.appendChild(btn3);
    document.getElementById("tieChoiceModal").classList.add("active");
}

function closeTieChoiceModal() {
    document.getElementById("tieChoiceModal").classList.remove("active");
    pendingTieData = null;
}

function resolveTie(choice) {
    if (!pendingTieData) return;
    const { scores, active, activePoints, topOpponents, deltas, notes, result } = pendingTieData;
    topOpponents.forEach(i => {
        deltas[i] = scores[i];
        gameState.players[i].score += scores[i];
    });
    if (choice === "split") {
        const half = activePoints / 2;
        topOpponents.forEach(i => {
            deltas[i] += half;
            gameState.players[i].score += half;
        });
    } else {
        deltas[choice] += activePoints;
        gameState.players[choice].score += activePoints;
    }
    topOpponents.forEach(i => {
        if (scores[i] === 0) {
            gameState.players[i].score -= 10;
            deltas[i] -= 10;
            notes[i] = (notes[i] || "") + "-10 нет взятки";
        }
    });
    closeTieChoiceModal();
    finishRound3(deltas, notes, result);
}

function finishRound3(deltas, notes, result) {
    const totals = gameState.players.map(p => p.score);
    addHistoryRow({
        round: gameState.round,
        game: gameState.gameValue,
        announce: gameState.announcementPoints,
        deltas: [...deltas],
        totals: [...totals],
        notes: [...notes],
        dealer: gameState.players[gameState.dealerIndex].name,
        active: gameState.players[gameState.activePlayerIndex].name,
        result: result
    });
    gameState.round++;
    nextDealer();
    resetAnnouncements();
    updateGameValue3();
    document.getElementById("player1ScoreInput3").value = "";
    document.getElementById("player2ScoreInput3").value = "";
    document.getElementById("player3ScoreInput3").value = "";
    document.getElementById("player1ScoreInput3").placeholder = "";
    document.getElementById("player2ScoreInput3").placeholder = "";
    document.getElementById("player3ScoreInput3").placeholder = "";
    renderGame3();
    saveGame();
    const hadWinner = checkWinner3();
    if (!hadWinner) {
        showRoundConfirm();
        playSound(lastRoundResultSound());
        setTimeout(() => {
            const sel = document.getElementById("activePlayerSelect3");
            if (sel) sel.focus();
            setTimeout(() => {
                const firstInput = document.getElementById("player1ScoreInput3");
                if (firstInput) firstInput.focus();
            }, 100);
        }, 300);
    } else {
        playSound('win');
        launchConfetti();
    }
    updateChangeDealerButtons();
}

function checkWinner3() {
    const reached = gameState.players.map((p, i) => ({ ...p, index: i })).filter(p => p.score >= 101);
    if (reached.length === 0) return false;
    stopTimer();
    deleteSave();
    updateContinueButtons();
    showScreen(victoryScreen);
    if (reached.length === 1) {
        document.getElementById("winnerTitle").textContent = `🏆 Победил ${reached[0].name}`;
        document.getElementById("winnerText").textContent = `Игра окончена после ${gameState.round - 1} раздач`;
    } else {
        reached.sort((a, b) => b.score - a.score);
        if (reached[0].score > reached[1].score) {
            document.getElementById("winnerTitle").textContent = `🏆 Победил ${reached[0].name}`;
            document.getElementById("winnerText").textContent = `Наибольший счёт после ${gameState.round - 1} раздач`;
        } else {
            document.getElementById("winnerTitle").textContent = "🤝 Ничья!";
            document.getElementById("winnerText").textContent = "Несколько игроков с одинаковым максимальным счётом";
        }
    }
    const timerText = document.getElementById("gameTimer3")?.textContent || "⏱ 00:00";
    const winnerName = reached.length === 1 ? reached[0].name :
        (reached[0].score > (reached[1]?.score ?? -1) ? reached[0].name : null);
    let cards = `<div class="victoryTeams">`;
    gameState.players.forEach(p => {
        const isWin = winnerName && p.name === winnerName;
        cards += `
            <div class="victoryTeam${isWin ? " victoryTeamWin" : ""}">
                <div class="victoryTeamLeft">
                    <div class="victoryTeamNames">${p.name}</div>
                </div>
                <div class="victoryTeamRight">
                    <div class="victoryTeamScore">${p.score}</div>
                    <div class="victoryTeamBolts">${formatBolts(p.bolts) || ""}</div>
                </div>
            </div>`;
    });
    cards += `</div><div class="victoryTimer">${timerText}</div>`;
    document.getElementById("victoryStatistics").innerHTML = cards;
    return true;
}

/* ==========================================================
   SCORE HINTS 3 (только когда два поля заполнены)
========================================================== */

function updateScoreHints3() {
    const inputs = [
        document.getElementById("player1ScoreInput3"),
        document.getElementById("player2ScoreInput3"),
        document.getElementById("player3ScoreInput3")
    ];
    if (!inputs[0]) return;
    const values = inputs.map(inp => {
        const v = Number(inp.value);
        return (Number.isNaN(v) || inp.value === "") ? null : v;
    });
    const filledCount = values.filter(v => v !== null).length;
    if (filledCount === 2) {
        const filledSum = values.reduce((s, v) => s + (v !== null ? v : 0), 0);
        const remaining = gameState.gameValue - filledSum;
        inputs.forEach((inp, i) => {
            if (values[i] === null) {
                inp.placeholder = remaining >= 0 ? String(remaining) : "?";
            } else {
                inp.placeholder = "";
            }
        });
    } else {
        inputs.forEach(inp => inp.placeholder = "");
    }
}

function setupScoreHints3() {
    const ids = ["player1ScoreInput3", "player2ScoreInput3", "player3ScoreInput3"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.dataset.hintBound === "1") return;
        el.dataset.hintBound = "1";
        el.addEventListener("input", updateScoreHints3);
    });
}

/* ==========================================================
   34. CONFIRM ROUND + SOUNDS + CONFETTI
========================================================== */

let pendingRoundSnapshot = null;

function snapshotGameState() {
    return JSON.parse(JSON.stringify({
        mode: gameState.mode,
        players: gameState.players,
        dealerIndex: gameState.dealerIndex,
        activePlayerIndex: gameState.activePlayerIndex,
        round: gameState.round,
        timerSeconds: gameState.timerSeconds,
        baseGameValue: gameState.baseGameValue,
        announcementPoints: gameState.announcementPoints,
        gameValue: gameState.gameValue,
        team1: gameState.team1,
        team2: gameState.team2,
        history: gameState.history,
        savedAnnouncements: gameState.savedAnnouncements
    }));
}

function restoreGameState(snap) {
    if (!snap) return;
    Object.assign(gameState, JSON.parse(JSON.stringify(snap)));
    recalculateAnnouncements();
    updateGameValue();
    updateGameValue3();
}

function showRoundConfirm() {
    const content = document.getElementById("confirmRoundContent");
    const modal = document.getElementById("confirmRoundModal");
    if (!content || !modal) return;
    const last = gameState.history[gameState.history.length - 1];
    if (!last) {
        modal.classList.add("active");
        content.innerHTML = "<p>Раздача сохранена.</p>";
        return;
    }
    let html = "";
    if (gameState.mode === 3) {
        html += `<div class="confirmRoundList">`;
        for (let i = 0; i < 3; i++) {
            const name = gameState.players[i]?.name || `Игрок ${i + 1}`;
            const delta = last.deltas ? last.deltas[i] : 0;
            const total = last.totals ? last.totals[i] : gameState.players[i]?.score;
            const note = last.notes ? (last.notes[i] || "") : "";
            const sign = delta > 0 ? `+${delta}` : delta;
            const crown = last.active === name ? " 👑" : "";
            html += `
                <div class="confirmRoundRow">
                    <span>${crown}${name}</span>
                    <span class="confirmDelta">${sign}</span>
                    <span class="confirmTotal">(${total})</span>
                </div>
                ${note ? `<div class="confirmNote">${note}</div>` : ""}
            `;
        }
        html += `</div>`;
        if (last.result === "bolt") html += `<p class="confirmBadge">⚡ Болт</p>`;
        if (last.result === "redeal") html += `<p class="confirmBadge">❌ Неправильная раздача</p>`;
        if (last.result === "capot") html += `<p class="confirmBadge">🚫 Капот</p>`;
    } else {
        const p = gameState.players;
        const t1 = p.length >= 4 ? `${p[0].name} & ${p[2].name}` : "Команда 1";
        const t2 = p.length >= 4 ? `${p[1].name} & ${p[3].name}` : "Команда 2";
        const s1 = last.team1 > 0 ? `+${last.team1}` : last.team1;
        const s2 = last.team2 > 0 ? `+${last.team2}` : last.team2;
        html += `<div class="confirmRoundList">
            <div class="confirmRoundRow">
                <span>${t1}</span>
                <span class="confirmDelta">${s1}</span>
                <span class="confirmTotal">(${last.team1Total})</span>
            </div>
            ${last.team1Note ? `<div class="confirmNote">${last.team1Note}</div>` : ""}
            <div class="confirmRoundRow">
                <span>${t2}</span>
                <span class="confirmDelta">${s2}</span>
                <span class="confirmTotal">(${last.team2Total})</span>
            </div>
            ${last.team2Note ? `<div class="confirmNote">${last.team2Note}</div>` : ""}
        </div>`;
        if (last.result === "bolt") html += `<p class="confirmBadge">⚡ Болт</p>`;
        if (last.result === "redeal") html += `<p class="confirmBadge">❌ Неправильная раздача</p>`;
        if (last.result === "capot") html += `<p class="confirmBadge">🚫 Капот</p>`;
        html += `<p style="opacity:0.8;margin-top:8px;font-size:0.9rem;">Играл: ${last.active || "—"}</p>`;
    }
    content.innerHTML = html;
    modal.classList.add("active");
}

function cancelRoundConfirm() {
    playSound('click');
    if (pendingRoundSnapshot) {
        restoreGameState(pendingRoundSnapshot);
        pendingRoundSnapshot = null;
        if (stateSnapshots.length > 0) stateSnapshots.pop();
        if (gameState.mode === 3) {
            renderGame3();
        } else {
            fillTeams();
            buildActivePlayerList();
            updateDealer();
            updateGameValue();
            renderGame();
            updateScoreLabels4();
        }
        saveGame();
        updateContinueButtons();
        showToast('Раздача отменена ↩️');
    }
    document.getElementById("confirmRoundModal")?.classList.remove("active");
}

function confirmRoundApply() {
    playSound('click');
    pendingRoundSnapshot = null;
    document.getElementById("confirmRoundModal")?.classList.remove("active");
}

function lastRoundResultSound() {
    const last = gameState.history[gameState.history.length - 1];
    if (!last) return 'click';
    if (last.result === "bolt") return 'bolt';
    if (last.result === "capot" || last.result === "redeal") return 'penalty';
    return 'ok';
}

/* ==========================================================
   35. UNDO LAST ROUND (с звуком отмены)
========================================================== */

function undoLastRound() {
    if (stateSnapshots.length === 0) {
        alert("Нет раздач для отмены.");
        return;
    }
    if (!confirm("Отменить последнюю раздачу?")) return;
    playSound('click');
    const snap = stateSnapshots.pop();
    restoreGameState(snap);
    saveGame();
    updateContinueButtons();
    if (gameState.mode === 3) {
        renderGame3();
    } else {
        fillTeams();
        buildActivePlayerList();
        updateDealer();
        updateGameValue();
        renderGame();
        updateScoreLabels4();
    }
    showToast('Последняя раздача отменена ↩️');
    closeGameMenu();
    document.getElementById("historyScreen")?.classList.remove("active");
    if (gameState.mode === 4) {
        document.getElementById("gameScreen4")?.classList.add("active");
    } else {
        document.getElementById("gameScreen3")?.classList.add("active");
    }
}

/* ==========================================================
   36. AUDIO
========================================================== */

let audioCtx = null;
let audioUnlocked = false;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function unlockAudio() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        audioUnlocked = true;
    } catch (e) {}
}

function playTone(freq, duration, type = "sine", gainValue = 0.12, delay = 0) {
    if (!settings.soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.05);
    } catch (e) {}
}

function playClick() {
    playTone(1200, 0.04, "square", 0.05);
}

function playOk() {
    playTone(523, 0.12, "sine", 0.1);
    setTimeout(() => playTone(659, 0.12, "sine", 0.08), 80);
    setTimeout(() => playTone(784, 0.15, "sine", 0.07), 160);
}

function playBolt() {
    playTone(180, 0.2, "sawtooth", 0.1);
    setTimeout(() => playTone(120, 0.25, "sawtooth", 0.08), 150);
    setTimeout(() => playTone(80, 0.3, "sawtooth", 0.06), 300);
}

function playPenalty() {
    playTone(400, 0.15, "triangle", 0.1);
    setTimeout(() => playTone(300, 0.2, "triangle", 0.08), 120);
    setTimeout(() => playTone(200, 0.25, "triangle", 0.06), 250);
}

function playWin() {
    const notes = [523, 659, 784, 1046, 784, 659, 523];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, "sine", 0.1), i * 100);
    });
}

function playDraw() {
    playTone(440, 0.15, "sine", 0.1);
    setTimeout(() => playTone(440, 0.15, "sine", 0.08), 150);
    setTimeout(() => playTone(440, 0.25, "sine", 0.06), 300);
}

function playSound(name) {
    if (!settings.soundEnabled) return;
    unlockAudio();
    switch (name) {
        case 'click': playClick(); break;
        case 'ok': playOk(); break;
        case 'bolt': playBolt(); break;
        case 'penalty': playPenalty(); break;
        case 'win': playWin(); break;
        case 'draw': playDraw(); break;
        default: playClick();
    }
}

document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
document.addEventListener("click", unlockAudio, { once: true });

/* ==========================================================
   37. CONFETTI
========================================================== */

function launchConfetti() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#ffd54d", "#1d4ed8", "#ff6b6b", "#4ade80", "#ffffff", "#f472b6"];
    const pieces = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 80,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 3,
        vx: -2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4
    }));
    let frames = 0;
    function tick() {
        frames++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (frames < 120) requestAnimationFrame(tick);
        else canvas.remove();
    }
    requestAnimationFrame(tick);
}

/* ==========================================================
   SETTINGS UI (дополненная функция updateSettingsUI)
========================================================== */

let pendingTheme = settings.theme;

function openSettings() {
    pendingTheme = settings.theme;
    updateSettingsUI();
    document.getElementById("settingsModal").classList.add("active");
}

function closeSettings() {
    document.getElementById("settingsModal").classList.remove("active");
    applyTheme(settings.theme);
    updateSettingsUI();
}

function applySettings() {
    settings.theme = pendingTheme;
    saveSettings();
    applyTheme(settings.theme);
    updateSettingsUI();
    playSound('ok');
    showToast('Настройки сохранены! ✅');
}

function selectTheme(theme) {
    pendingTheme = theme;
    // Применяем стандартную тему для предпросмотра (без сохранения)
    applyTheme(theme);
    updateSettingsUI();
    playSound('click');
}

function updateSettingsUI() {
    // Звук
    const toggle = document.getElementById("soundToggle");
    if (toggle) {
        toggle.textContent = settings.soundEnabled ? "Вкл" : "Выкл";
        toggle.classList.toggle("active", settings.soundEnabled);
    }

    // Тема - предпросмотр (для стандартных)
    const preview = document.getElementById("themePreview");
    if (preview) {
        let displayName = "";
        if (settings.theme && settings.theme.startsWith('custom_')) {
            const idx = parseInt(settings.theme.split('_')[1]);
            const themes = loadCustomThemes();
            if (themes[idx]) {
                displayName = `🎨 ${themes[idx].name}`;
            } else {
                displayName = "🎨 Пользовательская";
            }
        } else {
            const themes = {
                blue: "🔵 Синяя",
                graphite: "⚪ Графитовая",
                black: "⚫ Чёрная",
                "light-blue": "☀️ Светло-синяя",
                "light-gray": "🌤️ Светло-серая",
                cream: "🧈 Кремовая",
                emerald: "🟢 Изумрудная",
                neon: "💜 Неоновая"
            };
            displayName = themes[settings.theme] || "🔵 Синяя";
        }
        preview.textContent = displayName;
    }

    // Подсветка стандартных кнопок
    document.querySelectorAll(".themeBtn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === settings.theme);
    });

    // Список пользовательских тем
    renderCustomThemesList();

    // Подсветка активной пользовательской темы в списке
    document.querySelectorAll(".customThemeItem").forEach(item => {
        // Уже обработано в renderCustomThemesList через класс active
    });
}

function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    saveSettings();
    updateSettingsUI();
    if (settings.soundEnabled) {
        playSound('click');
    }
}

function setTheme(theme) {
    pendingTheme = theme;
    settings.theme = theme;
    saveSettings();
    applyTheme(theme);
    updateSettingsUI();
    playSound('click');
}

/* ==========================================================
   TOAST
========================================================== */

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/* ==========================================================
   ГЛОБАЛЬНЫЙ ОБРАБОТЧИК КЛИКОВ ДЛЯ ЗВУКА
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (btn && !btn.disabled) {
            unlockAudio();
            playSound("click");
        }
    }, true);
});
