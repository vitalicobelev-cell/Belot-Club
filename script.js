// Переключение экранов
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Главное меню → выбор режима
function startGame() {
  showScreen('mode');
}



  // Переключение экранов
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Главное меню → выбор режима
  function startGame() {
    showScreen('mode');
  }

  // Продолжить игру (если сохранено в localStorage)
  function continueGame() {
    let saved = localStorage.getItem('belotGame');
    if (saved) {
      loadGame(JSON.parse(saved));
      showScreen('game');
    } else {
      alert("Нет сохранённой игры!");
    }
  }

  // Показ правил
  function showRules() {
    alert("Правила: игра продолжается до 101 очка. Болты, неправильные раздачи и отсутствие взятки фиксируются как -10.");
  }

  // Назад в меню
  function goBackToMenu() {
    showScreen('menu');
  }

  // Назад в выбор режима
  function goBackToMode() {
    showScreen('mode');
  }

  // Домой из игры
  function goHome() {
    if (confirm("Вы уверены, что хотите выйти? Текущая игра будет потеряна.")) {
      localStorage.removeItem('belotGame');
      showScreen('menu');
    }
  }


// Текущий режим и список игроков
let currentMode = 0;
let players = [];

// Установка режима (2, 3 или 4 игрока)
function setMode(mode) {
  currentMode = mode;
  generatePlayerInputs(mode);
  showScreen('players');
}

// Генерация полей для ввода имён
function generatePlayerInputs(count) {
  let container = document.getElementById("playerInputs");
  container.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Игрок " + i;
    input.id = "player" + i;
    container.appendChild(input);
  }
}

// Добавление нового имени (сохраняется в localStorage)
function addNewName() {
  let newName = prompt("Введите новое имя:");
  if (newName) {
    let savedNames = JSON.parse(localStorage.getItem("belotNames") || "[]");
    if (!savedNames.includes(newName)) {
      savedNames.push(newName);
      localStorage.setItem("belotNames", JSON.stringify(savedNames));
      alert("Имя добавлено!");
    } else {
      alert("Такое имя уже есть.");
    }
  }
}

// Подтверждение списка игроков
function confirmPlayers() {
  players = [];
  for (let i = 1; i <= currentMode; i++) {
    let name = document.getElementById("player" + i).value.trim();
    if (!name) {
      alert("Введите имя для игрока " + i);
      return;
    }
    players.push(name);
  }
  startNewGame();
  showScreen('game');
}


// Таймер
let timerInterval = null;
let secondsElapsed = 0;
let timerRunning = false;

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById("timer").style.color = "red";
  } else {
    timerInterval = setInterval(updateTimer, 1000);
    timerRunning = true;
    document.getElementById("timer").style.color = "#FFD700";
  }
}

function updateTimer() {
  secondsElapsed++;
  let minutes = Math.floor(secondsElapsed / 60);
  let seconds = secondsElapsed % 60;
  document.getElementById("timer").innerText = `⏱ ${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// Автозаполнение очков соперника
let gamePoints = 16; // по умолчанию, можно менять при выборе объявлений

function autoFillOpponent() {
  let player = parseInt(document.getElementById("playerScore").value);
  if (!isNaN(player)) {
    let opponent = gamePoints - player;
    document.getElementById("opponentScore").value = opponent;
  }
}

// Проверка очков
function validateScores() {
  let player = parseInt(document.getElementById("playerScore").value);
  let opponent = parseInt(document.getElementById("opponentScore").value);

  if (isNaN(player) || isNaN(opponent)) {
    alert("Введите целые числа!");
    return;
  }
  if (player < 0 || opponent < 0) {
    alert("Очки не могут быть меньше 0!");
    return;
  }
  if (player > gamePoints || opponent > gamePoints) {
    alert("Очки не могут быть больше чем игра ("+gamePoints+")!");
    return;
  }
  if (player + opponent !== gamePoints) {
    alert("Сумма очков должна равняться "+gamePoints+"!");
    return;
  }

  // Подготовка подтверждения
  let text = `Команда 1: ${player} очков, Команда 2: ${opponent} очков.`;

  if (player === 0 && opponent === 0) {
    text = "❌ Неправильная раздача. Зафиксировать -10?";
  } else if (player < opponent) {
    text += " ⚡ Болт у команды 1. Зафиксировать?";
  } else if (opponent < player) {
    text += " ⚡ Болт у команды 2. Зафиксировать?";
  } else if (player === 0 || opponent === 0) {
    text += " 🚫 Нет взятки. Зафиксировать -10?";
  }

  document.getElementById("confirmationText").innerText = text;
  showScreen('confirmation');
}

// Очки команд и болты
let team1Score = 0;
let team2Score = 0;
let team1Bolts = 0;
let team2Bolts = 0;
let roundNumber = 1;

// Вернуться к вводу очков
function goBackToGame() {
  showScreen('game');
}

// Сохранение в историю
function saveToHistory() {
  let player = parseInt(document.getElementById("playerScore").value);
  let opponent = parseInt(document.getElementById("opponentScore").value);
  let eventText = document.getElementById("confirmationText").innerText;

  // Обновление очков
  team1Score += player;
  team2Score += opponent;

  // Проверка болтов
  if (eventText.includes("Болт у команды 1")) {
    team1Bolts++;
  }
  if (eventText.includes("Болт у команды 2")) {
    team2Bolts++;
  }

  // Проверка -10
  if (eventText.includes("Неправильная раздача") || eventText.includes("Нет взятки")) {
    if (player === 0 && opponent === 0) {
      team1Score -= 10;
      team2Score -= 10;
    } else if (player === 0) {
      team1Score -= 10;
    } else if (opponent === 0) {
      team2Score -= 10;
    }
  }

  // Обновление интерфейса
  document.getElementById("team1Score").innerText = team1Score;
  document.getElementById("team2Score").innerText = team2Score;
  document.getElementById("team1Bolts").innerText = team1Bolts;
  document.getElementById("team2Bolts").innerText = team2Bolts;

  // Добавление в таблицу истории
  let table = document.getElementById("historyTable");
  let row = table.insertRow();
  row.insertCell(0).innerText = roundNumber;
  row.insertCell(1).innerText = player;
  row.insertCell(2).innerText = opponent;
  row.insertCell(3).innerText = `${team1Bolts} - ${team2Bolts}`;
  row.insertCell(4).innerText = eventText;
  row.insertCell(5).innerText = document.getElementById("timer").innerText;

  // Проверка победы
  if (team1Score >= 101 || team2Score >= 101) {
    showVictory();
  } else {
    roundNumber++;
    document.getElementById("roundNumber").innerText = "Раздача: " + roundNumber;
    showScreen('game');
  }
}

// Показ истории
function showHistory() {
  showScreen('history');
}

// Закрыть историю
function closeHistory() {
  showScreen('game');
}

// Экран победы
function showVictory() {
  let text = team1Score >= 101 ? "Команда 1 набрала 101 очко!" : "Команда 2 набрала 101 очко!";
  document.getElementById("victoryText").innerText = text;
  document.getElementById("finalStats").innerText = 
    `Итог: Команда 1 — ${team1Score} очков, Команда 2 — ${team2Score} очков. Болты: ${team1Bolts} - ${team2Bolts}. Время: ${document.getElementById("timer").innerText}`;
  showScreen('victory');
}


// Запуск новой игры
function startNewGame() {
  team1Score = 0;
  team2Score = 0;
  team1Bolts = 0;
  team2Bolts = 0;
  roundNumber = 1;
  secondsElapsed = 0;
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById("timer").innerText = "⏱ 00:00";
  document.getElementById("team1Score").innerText = team1Score;
  document.getElementById("team2Score").innerText = team2Score;
  document.getElementById("team1Bolts").innerText = team1Bolts;
  document.getElementById("team2Bolts").innerText = team2Bolts;
  document.getElementById("roundNumber").innerText = "Раздача: " + roundNumber;
  document.getElementById("historyTable").innerHTML = "";
  document.getElementById("playerScore").value = "";
  document.getElementById("opponentScore").value = "";
  saveGame();
}

// Начать новую игру с экрана победы
function newGame() {
  startNewGame();
  showScreen('game');
}

// Сохранение состояния игры
function saveGame() {
  let gameState = {
    team1Score,
    team2Score,
    team1Bolts,
    team2Bolts,
    roundNumber,
    secondsElapsed,
    players,
    currentMode
  };
  localStorage.setItem("belotGame", JSON.stringify(gameState));
}

// Загрузка сохранённой игры
function loadGame(state) {
  team1Score = state.team1Score;
  team2Score = state.team2Score;
  team1Bolts = state.team1Bolts;
  team2Bolts = state.team2Bolts;
  roundNumber = state.roundNumber;
  secondsElapsed = state.secondsElapsed;
  players = state.players;
  currentMode = state.currentMode;

  document.getElementById("team1Score").innerText = team1Score;
  document.getElementById("team2Score").innerText = team2Score;
  document.getElementById("team1Bolts").innerText = team1Bolts;
  document.getElementById("team2Bolts").innerText = team2Bolts;
  document.getElementById("roundNumber").innerText = "Раздача: " + roundNumber;
  updateTimer();
}



