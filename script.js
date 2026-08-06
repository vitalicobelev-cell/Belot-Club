/* ==========================================================
   BELOT CLUB
   Version 1.1
   Author: Vitaliy K.
   Logic: ChatGPT + Vitaliy
========================================================== */

/* ==========================================================
   1. CONSTANTS
========================================================== */

const PLAYERS_DB_KEY = "belot_players";
const SAVE_GAME_KEY  = "belot_save";
/* =========================================================
   SAVE KEYS
========================================================= */

const SAVE_KEY_4 = "belotClubSave4";
const SAVE_KEY_3 = "belotClubSave3";


/* ==========================================================
   2. GAME STATE
========================================================== */

const gameState = {

    mode: 4,                    // 3 или 4 игрока

    players: [],                // 3 или 4 игрока

    dealerIndex: 0,
    activePlayerIndex: 0,

    round: 1,

    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,

    baseGameValue: 16,
    announcementPoints: 0,      // объявления (без бэлы)
    gameValue: 16,

    team1: {
        score: 0,
        bolts: 0
    },

    team2: {
        score: 0,
        bolts: 0
    },

    history: [],

    savedAnnouncements: [],     // объявления текущей раздачи
    tempAnnouncements: []        // временные в модальном окне

};


/* ==========================================================
   3. PLAYERS DATABASE
========================================================== */

let playersDB = JSON.parse(localStorage.getItem(PLAYERS_DB_KEY)) || [];

/* ==========================================================
   4. DOM REFERENCES
========================================================== */

const screens          = document.querySelectorAll(".screen");

const menuScreen       = document.getElementById("menuScreen");
const modeScreen       = document.getElementById("modeScreen");
const playersScreen    = document.getElementById("playersScreen");
const historyScreen    = document.getElementById("historyScreen");
const victoryScreen    = document.getElementById("victoryScreen");

const gameScreen4      = document.getElementById("gameScreen4");
const gameScreen3      = document.getElementById("gameScreen3");

const playersContainer = document.getElementById("playersContainer");

const roundNumber      = document.getElementById("roundNumber");
const gameTimer        = document.getElementById("gameTimer");

const team1Players     = document.getElementById("team1Players");
const team2Players     = document.getElementById("team2Players");

const team1Score       = document.getElementById("team1Score");
const team2Score       = document.getElementById("team2Score");

const team1Bolts       = document.getElementById("team1Bolts");
const team2Bolts       = document.getElementById("team2Bolts");

const dealerName       = document.getElementById("dealerName");
const activePlayerSelect = document.getElementById("activePlayerSelect");

const gameValueEl      = document.getElementById("gameValue");
const announcementButton = document.getElementById("announcementButton");

const opponentScoreInput = document.getElementById("opponentScoreInput");
const playerScoreInput   = document.getElementById("playerScoreInput");

const historyBody      = document.getElementById("historyBody");


const continueGame4Button = document.getElementById("continueGame4Button");
const continueGame3Button = document.getElementById("continueGame3Button");

const continueScore4 = document.getElementById("continueScore4");
const continueScore3 = document.getElementById("continueScore3");

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

    const saveKey = mode === 3
        ? SAVE_KEY_3
        : SAVE_KEY_4;

    const save = localStorage.getItem(saveKey);

    if (!save) return false;

    const data = JSON.parse(save);

    Object.assign(gameState, data);

    return true;
}

/* =========================================================
   SAVE CURRENT GAME
========================================================= */

function saveCurrentGame() {

    const saveKey =
        gameState.mode === 3
            ? SAVE_KEY_3
            : SAVE_KEY_4;

    localStorage.setItem(
        saveKey,
        JSON.stringify(gameState)
    );

    updateContinueButtons();

}



/* =========================================================
   UPDATE CONTINUE BUTTONS
========================================================= */

function updateContinueButtons() {

    const save4 = localStorage.getItem(SAVE_KEY_4);
    const save3 = localStorage.getItem(SAVE_KEY_3);

    /* ---------- 4 players ---------- */

    if (save4) {

        continueGame4Button.disabled = false;

        try {

            const game = JSON.parse(save4);

            continueScore4.textContent =
                `${game.team1.score} : ${game.team2.score}`;

        } catch {

            continueScore4.textContent = "";

        }

    } else {

        continueGame4Button.disabled = true;
        continueScore4.textContent = "";

    }

    /* ---------- 3 players ---------- */

    if (save3) {

        continueGame3Button.disabled = false;

        try {

            const game = JSON.parse(save3);

            continueScore3.textContent =
                `${game.players[0].score} • ${game.players[1].score} • ${game.players[2].score}`;

        } catch {

            continueScore3.textContent = "Новая игра";

        }

    } else {

        continueGame3Button.disabled = true;
        continueScore3.textContent = "";

    }

}


function deleteSave() {

    const saveKey = gameState.mode === 3
        ? SAVE_KEY_3
        : SAVE_KEY_4;

    localStorage.removeItem(saveKey);

    updateContinueButtons();
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





function continueGame(mode) {

    if (!loadGame(mode)) {
        alert("Нет сохранённой игры.");
        return;
    }

    if (gameState.mode === 4) {

        buildActivePlayerList();
        updateDealer();
        updateGameValue();
        renderGame();

        showScreen(gameScreen4);

    } else {

        renderGame3();

        showScreen(gameScreen3);

    }

    startTimer();

}

/* =========================================================
   CONTINUE GAME
========================================================= */





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
   8. TIMER
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
    if (t4) {
        t4.classList.remove("timer-paused");
        t4.classList.add("timer-running");
    }
    if (t3) {
        t3.classList.remove("timer-paused");
        t3.classList.add("timer-running");
    }
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerRunning = false;

    const t4 = document.getElementById("gameTimer");
    const t3 = document.getElementById("gameTimer3");
    if (t4) {
        t4.classList.remove("timer-running");
        t4.classList.add("timer-paused");
    }
    if (t3) {
        t3.classList.remove("timer-running");
        t3.classList.add("timer-paused");
    }
}

function toggleTimer() {
    if (gameState.timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function updateTimer() {
    const min = String(Math.floor(gameState.timerSeconds / 60)).padStart(2, "0");
    const sec = String(gameState.timerSeconds % 60).padStart(2, "0");
    const el = document.getElementById("gameTimer");
    if (el) el.textContent = `⏱ ${min}:${sec}`;
}

function updateTimer3() {
    const min = String(Math.floor(gameState.timerSeconds / 60)).padStart(2, "0");
    const sec = String(gameState.timerSeconds % 60).padStart(2, "0");
    const el = document.getElementById("gameTimer3");
    if (el) el.textContent = `⏱ ${min}:${sec}`;
}

/* ==========================================================
   9. MODE SELECTION
========================================================== */

function selectMode(mode) {
    resetGame();
    gameState.mode = mode;
    createPlayersScreen(true); // очищаем имена
    showScreen(playersScreen);
}

/* ==========================================================
   10. PLAYERS SCREEN
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

        // === Поле с именем ===
        const field = document.createElement("div");
        field.className = "playerSelect";
        field.id = `playerSelect${i}`;
        field.dataset.value = currentValues[i] || "";

        if (currentValues[i]) {
            field.textContent = currentValues[i];
            field.style.color = "#ffffff";
        } else {
            field.textContent = "Выберите игрока";
            field.style.color = "#94a3b8";
        }

        // Клик по полю — открыть список
        field.addEventListener("click", () => {
            openPlayerPicker(i);
        });

        // === Кнопка очистки поля ===
        const clearBtn = document.createElement("button");
        clearBtn.className = "removePlayerButton";
        clearBtn.textContent = "❌";
        clearBtn.title = "Очистить поле";

        clearBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // чтобы не открывался список

            field.dataset.value = "";
            field.textContent = "Выберите игрока";
            field.style.color = "#94a3b8";

            // Обновляем остальные списки (имя снова становится доступным)
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
    if (!list) {
        alert("Ошибка: не найден playerPickerList");
        return;
    }
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

    // Кнопка Новый игрок
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
    const field = document.getElementById(`playerSelect${currentPickerIndex}`);
    if (!field) return;

    field.dataset.value = name;
    field.textContent = name;
    field.style.color = "#ffffff";

    closePlayerPicker();
    createPlayersScreen();
}

function deletePlayerFromDB(name) {
    if (!confirm(`Удалить «${name}» из базы?`)) return;

    playersDB = playersDB.filter(p => p !== name);
    savePlayersDatabase();

    // Очищаем поля, где был этот игрок
    for (let i = 0; i < gameState.mode; i++) {
        const el = document.getElementById(`playerSelect${i}`);
        if (el && el.dataset.value === name) {
            el.dataset.value = "";
            el.textContent = "Выберите игрока";
            el.style.color = "#94a3b8";
        }
    }

    openPlayerPicker(currentPickerIndex);
}

function closePlayerPicker() {
    const modal = document.getElementById("playerPickerModal");
    if (modal) modal.classList.remove("active");
    currentPickerIndex = null;
}

/* ==========================================================
   11. CONFIRM PLAYERS & START GAME
========================================================== */


function confirmPlayers() {

// Полный сброс новой игры
gameState.history = [];

gameState.round = 1;
gameState.timerSeconds = 0;

gameState.announcementPoints = 0;
gameState.baseGameValue = 16;
gameState.gameValue = 16;

resetAnnouncements();

if (gameState.mode === 4) {

    gameState.team1.score = 0;
    gameState.team2.score = 0;

    gameState.team1.bolts = 0;
    gameState.team2.bolts = 0;

} else {

    gameState.players = [];

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

            gameState.players.push({
                name: value
            });

        } else {

            gameState.players.push({
                name: value,
                score: 0,
                bolts: 0
            });

        }

    }

    // ---------- Сброс новой игры ----------

    gameState.round = 1;
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

    if (gameState.mode === 4) {

    fillTeams();
    buildActivePlayerList();
    updateDealer();
    updateGameValue();
    renderGame();

    showScreen(gameScreen4);

} else {

    buildActivePlayerList3();
    updateDealer3();
    updateGameValue3();
    renderGame3();

    showScreen(gameScreen3);

}

startTimer();

}

/* ==========================================================
   12. TEAMS
========================================================== */

function fillTeams() {

    if (gameState.mode === 4) {

        team1Players.innerHTML =
            `${gameState.players[0].name}<br>${gameState.players[2].name}`;

        team2Players.innerHTML =
            `${gameState.players[1].name}<br>${gameState.players[3].name}`;

    }

}

/* ==========================================================
   13. DEALER
========================================================== */

function updateDealer() {
    dealerName.textContent =
        gameState.players[gameState.dealerIndex].name;
}

function nextDealer() {
    gameState.dealerIndex++;
    if (gameState.dealerIndex >= gameState.players.length) {
        gameState.dealerIndex = 0;
    }
    updateDealer();
}

/* ==========================================================
   14. ACTIVE PLAYER
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
   15. ANNOUNCEMENTS DATA
========================================================== */

const announcements = [
    { name: "Тэрц",   points: 2,  multiple: true  },
    { name: "Бэла",   points: 2,  multiple: false },
    { name: "50",     points: 4,  multiple: true  },
    { name: "100",    points: 8,  multiple: true  },
    { name: "Каре",   points: 10, multiple: true  },
    { name: "Каре 9", points: 14, multiple: false },
    { name: "Каре В", points: 20, multiple: false }
];

  // теперь тоже идёт в стоимость игры

/* ==========================================================
   16. BUILD / RESET ANNOUNCEMENTS
========================================================== */

function buildAnnouncements() {
    gameState.savedAnnouncements = announcements.map(item => ({
        name: item.name,
        points: item.points,
        multiple: item.multiple,
        count: 0
    }));

    // Копия для временного редактирования в модалке
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
}

function resetAnnouncements() {
    gameState.savedAnnouncements.forEach(item => item.count = 0);
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
    gameState.announcementPoints = 0;
    gameState.gameValue = gameState.baseGameValue;
}

/* ==========================================================
   17. OPEN / CLOSE / APPLY ANNOUNCEMENTS
========================================================== */

function openAnnouncements() {
    // Копируем текущие сохранённые в временные
    gameState.tempAnnouncements = JSON.parse(JSON.stringify(gameState.savedAnnouncements));
    renderAnnouncementWindow();
    document.getElementById("announcementModal").classList.add("active");
}

function cancelAnnouncements() {
    // Просто закрываем, изменения не применяем
    document.getElementById("announcementModal").classList.remove("active");
}

function applyAnnouncements() {
    gameState.savedAnnouncements = JSON.parse(JSON.stringify(gameState.tempAnnouncements));
    recalculateAnnouncements();
    updateGameValue();
    updateGameValue3();
    document.getElementById("announcementModal").classList.remove("active");
}

/* ==========================================================
   18. RECALCULATE + UPDATE GAME VALUE
========================================================== */

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

    if (gameValueEl) {
        gameValueEl.textContent = `🟠 ${gameState.gameValue}`;
    }

    if (announcementButton) {
        announcementButton.textContent = `📣 (+${gameState.announcementPoints})`;
    }
}

/* ==========================================================
   19. RENDER ANNOUNCEMENT WINDOW
========================================================== */

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

        const value = document.createElement("span");
        value.className = "counterValue";
        value.textContent = item.count;

        const plus = document.createElement("button");
        plus.className = "counterButton";
        plus.textContent = "+";

        plus.onclick = () => {
            if (!item.multiple && item.count >= 1) return; // нельзя больше 1
            item.count++;
            value.textContent = item.count;
            updateAnnouncementPreview();
        };

        minus.onclick = () => {
            if (item.count === 0) return;
            item.count--;
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

/* ==========================================================
   20. PREVIEW В МОДАЛКЕ
========================================================== */

function updateAnnouncementPreview() {
    let bonus = 0;

    gameState.tempAnnouncements.forEach(item => {
        bonus += item.points * item.count;
    });

    const previewGameValue = gameState.baseGameValue + bonus;

    const previewGame  = document.getElementById("announcementTempGame");
    const previewCount = document.getElementById("announcementTempCount");

    if (previewGame)  previewGame.textContent  = previewGameValue;
    if (previewCount) previewCount.textContent = `📣 (+${bonus})`;
}



/* ==========================================================
   21. AUTO HINT (подсказка суммы)
========================================================== */

playerScoreInput.addEventListener("input", () => {
    const value = Number(playerScoreInput.value);
    if (Number.isNaN(value)) return;
    opponentScoreInput.placeholder = gameState.gameValue - value;
});

opponentScoreInput.addEventListener("input", () => {
    const value = Number(opponentScoreInput.value);
    if (Number.isNaN(value)) return;
    playerScoreInput.placeholder = gameState.gameValue - value;
});

/* ==========================================================
   22. SAVE ROUND (проверка ввода)
========================================================== */

function saveRound() {
gameState.activePlayerIndex = Number(activePlayerSelect.value);

    
    const playerPoints   = Number(playerScoreInput.value);
    const opponentPoints = Number(opponentScoreInput.value);

    if (Number.isNaN(playerPoints) || Number.isNaN(opponentPoints)) {
        alert("Введите очки.");
        return;
    }

    if (playerPoints < 0 || opponentPoints < 0) {
        alert("Очки не могут быть отрицательными.");
        return;
    }

    // 0 : 0 — неправильная раздача
    if (playerPoints === 0 && opponentPoints === 0) {
        processRound(0, 0);
        return;
    }

    // Играющий не может набрать 0 (если у соперника есть очки)
    if (playerPoints === 0 && opponentPoints > 0) {
        alert("Играющий не может набрать 0 очков.\nМинимум — 2.");
        return;
    }

    // Сумма должна быть равна стоимости игры
    if (playerPoints + opponentPoints !== gameState.gameValue) {
        alert(`Сумма очков должна быть ${gameState.gameValue}.`);
        return;
    }

        pendingRoundSnapshot = snapshotGameState();
    processRound(playerPoints, opponentPoints);

}

/* ==========================================================
   23. PROCESS ROUND (основная логика)
========================================================== */

function processRound(playerPoints, opponentPoints) {
    const active = Number(gameState.activePlayerIndex);

console.log(
    "activePlayerIndex =", gameState.activePlayerIndex,
    "name =", gameState.players[gameState.activePlayerIndex].name
);

const dealerName = gameState.players[gameState.dealerIndex].name;
const activeName = gameState.players[gameState.activePlayerIndex].name;

    // Определяем команду играющего
    let activeTeam;
    if (gameState.mode === 4) {
        activeTeam = (active === 0 || active === 2) ? 1 : 2;
    } else {
        // Режим 3 (пока упрощённо)
        activeTeam = active + 1;
    }

    let team1Delta = 0;
    let team2Delta = 0;
    let team1Note  = "";
    let team2Note  = "";
    let result     = "normal";

    /* ---------- 1. Неправильная раздача (0:0) ---------- */
    if (playerPoints === 0 && opponentPoints === 0) {
        result = "redeal";

        if (gameState.mode === 4) {
            if (gameState.dealerIndex === 0 || gameState.dealerIndex === 2) {
                team1Delta = -10;
                team1Note  = "-10 неправильная";
            } else {
                team2Delta = -10;
                team2Note  = "-10 неправильная";
            }
        }
        // Для режима 3 можно добавить позже
    }

    /* ---------- 2. Капот (нет взятки у соперника) ---------- */
    else if (opponentPoints === 0) {
        result = "capot";

        if (activeTeam === 1) {
            team1Delta = gameState.gameValue;
            team2Delta = -10;
            team2Note  = "-10 нет взятки";
        } else {
            team2Delta = gameState.gameValue;
            team1Delta = -10;
            team1Note  = "-10 нет взятки";
        }
    }

    /* ---------- 3. Болт ---------- */
    else if (playerPoints > 0 && playerPoints < Math.ceil(gameState.gameValue / 2)) {
        result = "bolt";

        if (activeTeam === 1) {
            gameState.team1.bolts++;
            team2Delta = gameState.gameValue;
            team1Note  = `⚡ ${playerPoints}`;
        } else {
            gameState.team2.bolts++;
            team1Delta = gameState.gameValue;
            team2Note  = `⚡ ${playerPoints}`;
        }
    }

    /* ---------- 4. Обычная игра ---------- */
    else {
        if (activeTeam === 1) {
            team1Delta = playerPoints;
            team2Delta = opponentPoints;
        } else {
            team2Delta = playerPoints;
            team1Delta = opponentPoints;
        }
    }

    /* ---------- 5. Три болта → -10 ---------- */
    
// Для команды 1
if (gameState.team1.bolts >= 3) {
    gameState.team1.score -= 10;
    gameState.team1.bolts = 0;

    if (team1Note) {
        team1Note += " ";
    }
    team1Note += " → -10";
}

// Для команды 2
if (gameState.team2.bolts >= 3) {
    gameState.team2.score -= 10;
    gameState.team2.bolts = 0;

    if (team2Note) {
        team2Note += " ";
    }
    team2Note += " → -10";
}

    /* ---------- 6. Начисляем очки ---------- */
    gameState.team1.score += team1Delta;
    gameState.team2.score += team2Delta;

    /* ---------- 7. История ---------- */
    addHistoryRow({
    round:     gameState.round,
    game:      gameState.gameValue,
    announce:  gameState.announcementPoints,
    team1:     team1Delta,
    team2:     team2Delta,
    team1Note: team1Note,
    team2Note: team2Note,
    team1Total: gameState.team1.score,   // ← добавили
    team2Total: gameState.team2.score,   // ← добавили
    dealer: dealerName,
active: activeName,

    result:    result
});

    /* ---------- 8. Следующая раздача ---------- */
    gameState.round++;
    nextDealer();

    // Сбрасываем объявления
    resetAnnouncements();
    updateGameValue();

    // Очищаем поля ввода
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
    } else {
        playSound('win');
        launchConfetti();
    }
}

/* ==========================================================
   24. CHECK WINNER + DRAW
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
   25. RENDER GAME (счёт, болты, раунд, таймер)
========================================================== */


    // Болты
    

function formatBolts(count) {
    if (!count || count <= 0) return "";
    return "⚡".repeat(Math.min(count, 3));
}



function renderGame() {
    // Номер раздачи
    if (roundNumber) {
        roundNumber.textContent = `#${gameState.round}`;
    }

    // Таймер
    updateTimer();

    // Счёт
    if (team1Score) team1Score.textContent = gameState.team1.score;
    if (team2Score) team2Score.textContent = gameState.team2.score;

    // Болты (в виде молний)
    if (team1Bolts) {
        team1Bolts.textContent = formatBolts(gameState.team1.bolts);
    }
    if (team2Bolts) {
        team2Bolts.textContent = formatBolts(gameState.team2.bolts);
    }
}

/* ==========================================================
   26. HISTORY
========================================================== */

function	 addHistoryRow(record) {
    gameState.history.push(record);
    renderHistory();
}

function renderHistory() {
    if (!historyBody) return;

    historyBody.innerHTML = "";

    // Заголовок таблицы (без колонки «Играет»)
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
            // ——— 3 игрока ———
            row.appendChild(createCell(item.round));
            row.appendChild(createCell(item.game || "—"));
            row.appendChild(createCell(
                item.announce > 0 ? `+${item.announce}` : "—"
            ));

            for (let i = 0; i < 3; i++) {
                const cell = document.createElement("td");
                const delta = item.deltas ? item.deltas[i] : 0;
                const total = item.totals ? item.totals[i] : 0;
                const note  = item.notes  ? (item.notes[i] || "") : "";
                const sign  = delta > 0 ? `+${delta}` : delta;

                // Корона у того, кто играл в этой раздаче
                const isActive = gameState.players[i] &&
                    item.active === gameState.players[i].name;
                const crown = isActive ? " 👑" : "";

                cell.innerHTML = `
                    <div>${crown}${sign}
<span class="historyTotal">(${total})</span></div>
                    <small class="historyPenalty">${note}</small>
                `;
                row.appendChild(cell);
            }

            row.appendChild(createCell(item.dealer || "—"));

        } else {
            // ——— 4 игрока ———
            row.appendChild(createCell(item.round));
            row.appendChild(createCell(item.game));
            row.appendChild(createCell(
                item.announce > 0 ? `+${item.announce}` : "—"
            ));

            // Какая команда играла
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
   27. HISTORY WINDOW
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
   28. WINNER
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

    document.getElementById("winnerTitle").textContent =
        `🏆 Победила команда ${team}`;

    document.getElementById("winnerText").textContent =
        `Игра окончена после ${gameState.round - 1} раздач`;

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

    document.getElementById("winnerTitle").textContent = `🤝 Ничья!`;
    document.getElementById("winnerText").textContent =
        `Обе команды набрали 101+ после ${gameState.round - 1} раздач`;

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
   30. RULES
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
<p>
Побеждает команда, первой набравшая <b>101</b> очко или больше.<br>
Если обе команды набрали 101+ в одной раздаче — <b>ничья</b>.<br>
Счёт может уходить в минус.
</p>

<h3>🃏 Стоимость игры</h3>
<ul>
    <li>Простая игра — <b>16</b></li>
    <li>Все объявления (включая Бэлу) прибавляются к стоимости игры.</li>
    <li>Пример: 16 + Бэла (+2) = <b>18</b></li>
</ul>

<h3>📣 Объявления</h3>
<p>
Тэрц, 50, 100 и Каре можно объявлять несколько раз.<br>
Каре 9, Каре Валетов и Бэла — только один раз.
</p>

<h3>⚡ Болт</h3>
<p>
Если играющий набрал меньше половины стоимости игры, но больше нуля —<br>
он получает болт, а все очки игры переходят соперникам.
</p>
<p>
После третьего болта: <b>⚡⚡⚡ → −10</b>, после чего болты обнуляются.
</p>

<h3>🚫 Нет взятки (Капот)</h3>
<p>
Если соперники набрали 0 — они получают штраф <b>-10</b>,<br>
а играющий получает все очки игры.
</p>

<h3>❌ Неправильная раздача</h3>
<p>
При результате <b>0 : 0</b> раздающий получает <b>-10</b>,<br>
очки игры никому не начисляются.
</p>
`;
}

/* ==========================================================
   31. RESET GAME (новая игра)
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

    // Сбрасываем объявления
    if (gameState.savedAnnouncements.length) {
        resetAnnouncements();
    }
}

/* ==========================================================
   32. INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    fillRules();
    buildAnnouncements();
    updateTimer();

    // Отключаем кнопку "Продолжить", если нет сохранения
    const continueBtn = document.getElementById("continueGameButton");
    if (continueBtn && localStorage.getItem(SAVE_GAME_KEY) === null) {
        continueBtn.disabled = true;
    }
updateContinueButtons();
});




/* =========================================================
   RENDER GAME 3 PLAYERS
========================================================= */

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

        const nameEl  = document.getElementById(`player${i + 1}TotalName3`);
        const scoreEl = document.getElementById(`player${i + 1}TotalScore3`);
        const boltsEl = document.getElementById(`player${i + 1}Bolts3`);

        if (nameEl)  nameEl.textContent  = player.name;
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

document.addEventListener("DOMContentLoaded", () => {
    const activeSelect3 = document.getElementById("activePlayerSelect3");
    if (activeSelect3) {
        activeSelect3.addEventListener("change", function () {
            gameState.activePlayerIndex = Number(this.value);
            updateInputLabels3();
        });
    }
    setupScoreHints3();
});

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
   SAVE ROUND 3
========================================================== */

function saveRound3() {
    gameState.activePlayerIndex =
        Number(document.getElementById("activePlayerSelect3").value);

    pendingRoundSnapshot = snapshotGameState();

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
    if (p1 === 0 && p2 === 0 && p3 === 0) {
        processRound3(0, 0, 0);
        return;
    }

    const active = gameState.activePlayerIndex;
    const scores = [p1, p2, p3];
    if (scores[active] === 0) {
        alert("Играющий не может набрать 0 очков.\nМинимум — 2.");
        return;
    }
    if (p1 + p2 + p3 !== gameState.gameValue) {
        alert(`Сумма очков должна быть ${gameState.gameValue}.`);
        return;
    }
    processRound3(p1, p2, p3);
}

/* ==========================================================
   PROCESS ROUND 3
========================================================== */

let pendingTieData = null;

function processRound3(p1, p2, p3) {
    const scores = [p1, p2, p3];
    const active = gameState.activePlayerIndex;
    const deltas = [0, 0, 0];
    const notes  = ["", "", ""];
    let result = "normal";

    // 0:0:0
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

    // Сыграл
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

    // Не сыграл → болт
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
        const third  = [0, 1, 2].find(i => i !== active && i !== winner);

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

    // Равные соперники — выбор
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
    } else {
        playSound('win');
        launchConfetti();
    }
}







function checkWinner3() {
    const reached = gameState.players
        .map((p, i) => ({ ...p, index: i }))
        .filter(p => p.score >= 101);

        if (reached.length === 0) return false;

    stopTimer();
    deleteSave();
    updateContinueButtons();
    showScreen(victoryScreen);

    if (reached.length === 1) {
        document.getElementById("winnerTitle").textContent =
            `🏆 Победил ${reached[0].name}`;
        document.getElementById("winnerText").textContent =
            `Игра окончена после ${gameState.round - 1} раздач`;
    } else {
        reached.sort((a, b) => b.score - a.score);
        if (reached[0].score > reached[1].score) {
            document.getElementById("winnerTitle").textContent =
                `🏆 Победил ${reached[0].name}`;
            document.getElementById("winnerText").textContent =
                `Наибольший счёт после ${gameState.round - 1} раздач`;
        } else {
            document.getElementById("winnerTitle").textContent = `🤝 Ничья!`;
            document.getElementById("winnerText").textContent =
                `Несколько игроков с одинаковым максимальным счётом`;
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

    const filledSum = values.reduce((s, v) => s + (v === null ? 0 : v), 0);
    const remaining = gameState.gameValue - filledSum;

    inputs.forEach((inp, i) => {
        if (values[i] !== null) {
            inp.placeholder = "";
        } else {
            inp.placeholder = remaining >= 0 ? String(remaining) : "";
        }
    });
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

document.addEventListener("DOMContentLoaded", setupScoreHints3);



/* ==========================================================
   CONFIRM ROUND + SOUNDS + CONFETTI
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
        if (gameState.mode === 3) {
            renderGame3();
        } else {
            if (typeof fillTeams === "function") fillTeams();
            buildActivePlayerList();
            updateDealer();
            updateGameValue();
            renderGame();
        }
        saveGame();
        updateContinueButtons();
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
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        // короткий тихий сигнал — «разблокировка» для iOS
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        audioUnlocked = true;
    } catch (e) {}
}

function playTone(freq, duration, type, gainValue) {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || "sine";
        osc.frequency.value = freq;

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(gainValue || 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
    } catch (e) {}
}

function playSound(name) {
    try {
        unlockAudio();

        if (name === "click") {
            playTone(800, 0.05, "square", 0.06);
        } else if (name === "ok") {
            playTone(523, 0.1, "sine", 0.12);
            setTimeout(() => playTone(784, 0.12, "sine", 0.1), 80);
        } else if (name === "bolt") {
            playTone(150, 0.18, "sawtooth", 0.14);
            setTimeout(() => playTone(100, 0.22, "sawtooth", 0.1), 120);
        } else if (name === "penalty") {
            playTone(200, 0.15, "triangle", 0.12);
            setTimeout(() => playTone(140, 0.2, "triangle", 0.1), 100);
        } else if (name === "win") {
            [523, 659, 784, 1046].forEach((f, i) => {
                setTimeout(() => playTone(f, 0.25, "sine", 0.12), i * 130);
            });
        }
    } catch (e) {}
}

// Разблокировка звука при первом касании (важно для iPad)
document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
document.addEventListener("click", unlockAudio, { once: true });




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

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (btn && !btn.disabled) {
            unlockAudio();
            playSound("click");
        }
    }, true);
});