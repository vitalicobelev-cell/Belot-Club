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

// Список сохранённых имён
let savedNames = JSON.parse(localStorage.getItem("belotNames") || "[]");

// Установка режима (2, 3 или 4 игрока)
function setMode(mode) {
  currentMode = mode;
  generatePlayerInputs(mode);
  showScreen('players');
}

// Генерация полей для выбора игроков
function generatePlayerInputs(count) {
  const container = document.getElementById("playerInputs");
  container.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const wrapper = document.createElement("div");
    wrapper.style.margin = "0.5em";

    const label = document.createElement("label");
    label.innerText = "Игрок " + i + ": ";
    label.style.marginRight = "0.5em";

    const select = document.createElement("select");
    select.id = "player" + i;
    select.style.padding = "0.5em";
    select.style.border = "2px solid #FFD700";
    select.style.backgroundColor = "#1A1F2E";
    select.style.color = "#FFD700";
    select.style.borderRadius = "6px";

    // Добавляем сохранённые имена
    savedNames.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    // Кнопка "Добавить нового"
    const addOption = document.createElement("option");
    addOption.value = "add";
    addOption.textContent = "➕ Добавить нового";
    select.appendChild(addOption);

    // Обработка добавления нового имени
    select.addEventListener("change", e => {
      if (e.target.value === "add") {
        const newName = prompt("Введите новое имя:");
        if (newName && !savedNames.includes(newName)) {
          savedNames.push(newName);
          localStorage.setItem("belotNames", JSON.stringify(savedNames));
          generatePlayerInputs(count); // перерисовать список
        } else if (savedNames.includes(newName)) {
          alert("Такое имя уже есть.");
        }
      }
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  }
}

// Подтверждение выбранных игроков
function confirmPlayers() {
  players = [];
  for (let i = 1; i <= currentMode; i++) {
    const name = document.getElementById("player" + i).value;
    if (!name || name === "add") {
      alert("Выберите имя для игрока " + i);
      return;
    }
    players.push(name);
  }
  startNewGame();
  showScreen("game");
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
  document.getElementById("timer").innerText =
    `⏱ ${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// Автозаполнение очков соперника
let gamePoints = 16; // по умолчанию

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

  // Штрафы
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

  // Три болта = -10
  if (team1Bolts >= 3) {
    team1Score -= 10;
    team1Bolts = 0;
  }
  if (team2Bolts >= 3) {
    team2Score -= 10;
    team2Bolts = 0;
  }

  // Обновление интерфейса
  document.getElementById("team1Score").innerText = team1Score;
  document.getElementById("team2Score").innerText = team2Score;
  document.getElementById("team1Bolts").innerText = team1Bolts;
  document.getElementById("team2Bolts").innerText = team2Bolts;

  // Добавление в таблицу истории
  let table = document.getElementById("history
