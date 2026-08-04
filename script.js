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

/* ==========================================================
   2. GAME STATE
========================================================== */

const gameState = {
    mode: 0,                    // 3 или 4
    players: [],
    dealerIndex: 0,
    activePlayerIndex: 0,
    round: 1,

    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,

    baseGameValue: 16,
    announcementPoints: 0,      // очки объявлений (без бэлы)
    gameValue: 16,              // base + announcementPoints

    team1: {
        score: 0,
        bolts: 0
    },
    team2: {
        score: 0,
        bolts: 0
    },

    history: [],
    savedAnnouncements: [],     // текущие объявления раунда
    tempAnnouncements: []       // временные в модалке
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

/* ==========================================================
   5. STORAGE
========================================================== */

function savePlayersDatabase() {
    localStorage.setItem(PLAYERS_DB_KEY, JSON.stringify(playersDB));
}

function saveGame() {
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));

    const continueBtn = document.getElementById("continueGameButton");
    if (continueBtn) continueBtn.disabled = false;
}

function loadGame() {
    const save = localStorage.getItem(SAVE_GAME_KEY);
    if (!save) return false;

    const data = JSON.parse(save);
    Object.assign(gameState, data);
    return true;
}

function deleteSave() {
    localStorage.removeItem(SAVE_GAME_KEY);

    const continueBtn = document.getElementById("continueGameButton");
    if (continueBtn) continueBtn.disabled = true;
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

function continueGame() {
    if (!loadGame()) {
        alert("Нет сохранённой игры.");
        return;
    }

    buildActivePlayerList();
    updateDealer();
    updateGameValue();
    renderGame();
    startTimer();

    if (gameState.mode === 4) {
        showScreen(gameScreen4);
    } else {
        showScreen(gameScreen3);
    }
}

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
    stopTimer(); // на всякий случай очищаем

    gameState.timerRunning = true;
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds++;
        updateTimer();
    }, 1000);

    gameTimer.classList.remove("timer-paused");
    gameTimer.classList.add("timer-running");
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerRunning = false;

    gameTimer.classList.remove("timer-running");
    gameTimer.classList.add("timer-paused");
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
    gameTimer.textContent = `⏱ ${min}:${sec}`;
}


/* ==========================================================
   9. MODE SELECTION
========================================================== */

function selectMode(mode) {
    gameState.mode = mode;
    createPlayersScreen();
    showScreen(playersScreen);
}

/* ==========================================================
   10. PLAYERS SCREEN
========================================================== */

let currentPickerIndex = null;


function createPlayersScreen() {
    const currentValues = [];
    for (let i = 0; i < gameState.mode; i++) {
        const el = document.getElementById(`playerSelect${i}`);
        currentValues[i] = el ? el.dataset.value || "" : "";
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
    gameState.players = [];

    for (let i = 0; i < gameState.mode; i++) {
        const field = document.getElementById(`playerSelect${i}`);
        
        // Теперь берём значение из dataset
        const value = field ? field.dataset.value : "";

        if (!value) {
            alert("Выберите всех игроков.");
            return;
        }

        gameState.players.push(value);
    }

    // Сброс состояния новой игры
    gameState.round = 1;
    gameState.dealerIndex = 0;
    gameState.activePlayerIndex = 1;
    gameState.timerSeconds = 0;

    gameState.team1.score = 0;
    gameState.team2.score = 0;
    gameState.team1.bolts = 0;
    gameState.team2.bolts = 0;

    gameState.history = [];
    gameState.announcementPoints = 0;
    gameState.baseGameValue = 16;
    gameState.gameValue = 16;

    resetAnnouncements();

    fillTeams();
    buildActivePlayerList();
    updateDealer();
    updateGameValue();
    renderGame();
    startTimer();

    if (gameState.mode === 4) {
        showScreen(gameScreen4);
    } else {
        showScreen(gameScreen3);
    }
}

/* ==========================================================
   12. TEAMS
========================================================== */

function fillTeams() {
    if (gameState.mode === 4) {
        team1Players.innerHTML = `${gameState.players[0]}<br>${gameState.players[2]}`;
        team2Players.innerHTML = `${gameState.players[1]}<br>${gameState.players[3]}`;
    }
    // Для режима 3 можно будет доработать позже
}

/* ==========================================================
   13. DEALER
========================================================== */

function updateDealer() {
    dealerName.textContent = gameState.players[gameState.dealerIndex];
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
        option.textContent = player;
        activePlayerSelect.appendChild(option);
    });

    activePlayerSelect.selectedIndex = gameState.activePlayerIndex;
}

// Слушатель (вешается один раз)
activePlayerSelect.addEventListener("change", () => {
    gameState.activePlayerIndex = Number(activePlayerSelect.value);
});



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
    // Сохраняем то, что выбрали
    gameState.savedAnnouncements = JSON.parse(JSON.stringify(gameState.tempAnnouncements));
    recalculateAnnouncements();
    updateGameValue();
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

    processRound(playerPoints, opponentPoints);
}

/* ==========================================================
   23. PROCESS ROUND (основная логика)
========================================================== */

function processRound(playerPoints, opponentPoints) {
    const active = Number(gameState.activePlayerIndex);

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
    dealer:    gameState.players[gameState.dealerIndex],
    active:    gameState.players[gameState.activePlayerIndex],
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

    // Проверяем победителя / ничью
    checkWinner();
}

/* ==========================================================
   24. CHECK WINNER + DRAW
========================================================== */

function checkWinner() {
    const s1 = gameState.team1.score;
    const s2 = gameState.team2.score;

    if (s1 >= 101 && s2 >= 101) {
        showDraw();
        return;
    }

    if (s1 >= 101) {
        showWinner(1);
        return;
    }

    if (s2 >= 101) {
        showWinner(2);
        return;
    }
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

function addHistoryRow(record) {
    gameState.history.push(record);
    renderHistory();
}

function renderHistory() {
    if (!historyBody) return;

    historyBody.innerHTML = "";

    gameState.history.forEach(item => {
        const row = document.createElement("tr");

        // №
        row.appendChild(createCell(item.round));

        // Стоимость игры
        row.appendChild(createCell(item.game));

        // Объявления
        row.appendChild(createCell(
            item.announce > 0 ? `+${item.announce}` : "—"
        ));

        // Команда 1
        const team1Cell = document.createElement("td");
        const sign1 = item.team1 > 0 ? `+${item.team1}` : item.team1;
        team1Cell.innerHTML = `
            <div>${sign1} <span class="historyTotal">(${item.team1Total})</span></div>
            <small class="historyPenalty">${item.team1Note || ""}</small>
        `;
        row.appendChild(team1Cell);

        // Команда 2
        const team2Cell = document.createElement("td");
        const sign2 = item.team2 > 0 ? `+${item.team2}` : item.team2;
        team2Cell.innerHTML = `
            <div>${sign2} <span class="historyTotal">(${item.team2Total})</span></div>
            <small class="historyPenalty">${item.team2Note || ""}</small>
        `;
        row.appendChild(team2Cell);

        // Раздающий
        row.appendChild(createCell(item.dealer));

        // Играющий
        row.appendChild(createCell(item.active));

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
    showScreen(victoryScreen);

    document.getElementById("winnerTitle").textContent =
        `🏆 Победила команда ${team}`;

    document.getElementById("winnerText").textContent =
        `Игра окончена после ${gameState.round - 1} раздач`;

    document.getElementById("victoryStatistics").innerHTML = `
        <p>Команда 1: <b>${gameState.team1.score}</b></p>
        <p>Болты: ${gameState.team1.bolts}</p>
        <br>
        <p>Команда 2: <b>${gameState.team2.score}</b></p>
        <p>Болты: ${gameState.team2.bolts}</p>
        <br>
        <p>Время игры: <b>${gameTimer.textContent}</b></p>
    `;
}

/* ==========================================================
   29. DRAW (ничья)
========================================================== */

function showDraw() {
    stopTimer();
    deleteSave();
    showScreen(victoryScreen);

    document.getElementById("winnerTitle").textContent =
        `🤝 Ничья!`;

    document.getElementById("winnerText").textContent =
        `Обе команды набрали 101+ очков после ${gameState.round - 1} раздач`;

    document.getElementById("victoryStatistics").innerHTML = `
        <p>Команда 1: <b>${gameState.team1.score}</b></p>
        <p>Болты: ${gameState.team1.bolts}</p>
        <br>
        <p>Команда 2: <b>${gameState.team2.score}</b></p>
        <p>Болты: ${gameState.team2.bolts}</p>
        <br>
        <p>Время игры: <b>${gameTimer.textContent}</b></p>
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
    deleteSave();

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
});








