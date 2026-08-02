/* ==========================================================
   BELOT CLUB - GAME CONTROLLER
   ========================================================== */

// Состояние приложения
let gameState = {
  mode: 0, // 2, 3, 4 игрока
  players: [], // Массив имен игроков
  team1Score: 0,
  team2Score: 0,
  team1Bolts: 0,
  team2Bolts: 0,
  roundNumber: 1,
  gameValue: 16,
  timerSeconds: 0,
  history: []
};

// База игроков (localStorage)
const PLAYERS_DB_KEY = "belot_players";
let playersDB = JSON.parse(localStorage.getItem(PLAYERS_DB_KEY)) || [];

function savePlayersDB() {
  localStorage.setItem(PLAYERS_DB_KEY, JSON.stringify(playersDB));
}

function getGameSaveKey() {
  return "belot_save_" + gameState.mode;
}

// ========================================================
// ЭКРАНЫ И ПЕРЕКЛЮЧЕНИЕ
// ========================================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
  }
}

// ========================================================
// ГЛАВНОЕ МЕНЮ
// ========================================================

function startGame() {
  showScreen('mode');
}

function continueGame() {
  const saved = localStorage.getItem(getGameSaveKey());
  if (saved) {
    gameState = JSON.parse(saved);
    startTimer();
    renderGameScreen();
    showScreen('game');
  } else {
    alert("Нет сохранённой игры!");
  }
}

function goBackToMenu() {
  showScreen('menu');
}

function showRules() {
  alert("Правила: игра продолжается до 101 очка. Болты, неправильные раздачи и отсутствие взятки фиксируются как штрафы.");
}

// ========================================================
// ВЫБОР РЕЖИМА
// ========================================================

function setMode(mode) {
  gameState.mode = mode;
  showPlayerInputs();
  showScreen('players');
}

function goBackToMode() {
  showScreen('mode');
}

// ========================================================
// ЭКРАН ВВОДА ИМЁН ИГРОКОВ
// ========================================================

function showPlayerInputs() {
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';

  for (let i = 1; i <= gameState.mode; i++) {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '1em';

    const label = document.createElement('label');
    label.textContent = `Игрок ${i}: `;
    label.style.marginRight = '0.5em';
    label.style.fontWeight = 'bold';

    const select = document.createElement('select');
    select.id = `player${i}`;
    select.style.padding = '0.5em';
    select.style.border = '2px solid #FFD700';
    select.style.backgroundColor = '#1A1F2E';
    select.style.color = '#FFD700';
    select.style.borderRadius = '6px';
    select.style.cursor = 'pointer';

    // Опция "Выбрать имя"
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Выберите имя --';
    select.appendChild(emptyOption);

    // Сохранённые имена
    playersDB.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    // Опция "Добавить нового"
    const addOption = document.createElement('option');
    addOption.value = 'ADD_NEW';
    addOption.textContent = '➕ Добавить нового';
    select.appendChild(addOption);

    select.addEventListener('change', (e) => {
      if (e.target.value === 'ADD_NEW') {
        const newName = prompt('Введите имя нового игрока:');
        if (newName && newName.trim() !== '') {
          const trimmedName = newName.trim();
          if (!playersDB.includes(trimmedName)) {
            playersDB.push(trimmedName);
            savePlayersDB();
          }
          select.value = trimmedName;
          showPlayerInputs();
        } else {
          select.value = '';
        }
      }
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  }
}

function confirmPlayers() {
  const selectedPlayers = [];

  for (let i = 1; i <= gameState.mode; i++) {
    const select = document.getElementById(`player${i}`);
    const name = select.value.trim();

    if (!name) {
      alert(`Выберите имя для игрока ${i}`);
      return;
    }

    selectedPlayers.push(name);

    // Сохраняем в базу, если новый
    if (!playersDB.includes(name)) {
      playersDB.push(name);
      savePlayersDB();
    }
  }

  // Инициализируем игру
  gameState.players = selectedPlayers;
  gameState.team1Score = 0;
  gameState.team2Score = 0;
  gameState.team1Bolts = 0;
  gameState.team2Bolts = 0;
  gameState.roundNumber = 1;
  gameState.gameValue = 16;
  gameState.timerSeconds = 0;
  gameState.history = [];

  startTimer();
  renderGameScreen();
  showScreen('game');
  saveGameState();
}

// ========================================================
// ИГРОВОЙ ЭКРАН
// ========================================================

function renderGameScreen() {
  // Обновляем информацию о раундах
  document.getElementById('roundNumber').textContent = `Раздача: ${gameState.roundNumber}`;

  // Обновляем счёт команд
  document.getElementById('team1Score').textContent = gameState.team1Score;
  document.getElementById('team2Score').textContent = gameState.team2Score;
  document.getElementById('team1Bolts').textContent = gameState.team1Bolts;
  document.getElementById('team2Bolts').textContent = gameState.team2Bolts;

  // Обновляем стоимость игры
  document.getElementById('gameValue').textContent = gameState.gameValue;

  // Очищаем поля ввода очков
  document.getElementById('playerScore').value = '';
  document.getElementById('opponentScore').value = '';
}

// ========================================================
// ТАЙМЕР
// ========================================================

let timerInterval = null;

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    gameState.timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function toggleTimer() {
  const timerElement = document.getElementById('timer');
  if (timerInterval) {
    stopTimer();
    timerElement.style.color = '#FF4444';
  } else {
    startTimer();
    timerElement.style.color = '#FFD700';
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(gameState.timerSeconds / 60);
  const seconds = gameState.timerSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  document.getElementById('timer').textContent = `⏱ ${timeStr}`;
}

// ========================================================
// ОЧКИ
// ========================================================

function autoFillOpponentScore() {
  const playerScore = parseInt(document.getElementById('playerScore').value) || 0;
  if (playerScore >= 0 && playerScore <= gameState.gameValue) {
    document.getElementById('opponentScore').value = gameState.gameValue - playerScore;
  }
}

function validateScores() {
  const playerScore = parseInt(document.getElementById('playerScore').value);
  const opponentScore = parseInt(document.getElementById('opponentScore').value);

  if (isNaN(playerScore) || isNaN(opponentScore)) {
    alert('Введите целые числа!');
    return;
  }

  if (playerScore < 0 || opponentScore < 0) {
    alert('Очки не могут быть отрицательными!');
    return;
  }

  if (playerScore + opponentScore !== gameState.gameValue) {
    alert(`Сумма очков должна быть ${gameState.gameValue}!`);
    return;
  }

  // Определяем результат раунда
  let resultText = `Раздача ${gameState.roundNumber}: Играющий ${playerScore}, Противник ${opponentScore}`;

  // Неправильная раздача
  if (playerScore === 0 && opponentScore === 0) {
    gameState.team1Score -= 10;
    gameState.team2Score -= 10;
    resultText += ' ❌ Неправильная раздача!';
  }
  // Нет взятки
  else if (playerScore === 0 || opponentScore === 0) {
    if (playerScore === 0) {
      gameState.team2Score += gameState.gameValue;
      gameState.team1Score -= 10;
      resultText += ' 🚫 Нет взятки у играющего!';
    } else {
      gameState.team1Score += gameState.gameValue;
      gameState.team2Score -= 10;
      resultText += ' 🚫 Нет взятки у противника!';
    }
  }
  // Болт (менее половины)
  else if (playerScore < Math.ceil(gameState.gameValue / 2)) {
    gameState.team1Bolts++;
    gameState.team2Score += gameState.gameValue;
    resultText += ' ⚡ БОЛТ у играющего!';
  }
  // Обычная игра
  else {
    gameState.team1Score += playerScore;
    gameState.team2Score += opponentScore;
    resultText += ' ✓ Обычная раздача';
  }

  // Проверяем три болта
  if (gameState.team1Bolts >= 3) {
    gameState.team1Score -= 10;
    gameState.team1Bolts = 0;
    resultText += ' (3 болта = -10)';
  }
  if (gameState.team2Bolts >= 3) {
    gameState.team2Score -= 10;
    gameState.team2Bolts = 0;
    resultText += ' (3 болта = -10)';
  }

  // Сохраняем в историю
  gameState.history.push(resultText);

  // Обновляем интерфейс
  renderGameScreen();
  saveGameState();

  // Проверяем победу
  if (gameState.team1Score >= 101 || gameState.team2Score >= 101) {
    showVictoryScreen();
    return;
  }

  // Следующая раздача
  gameState.roundNumber++;
  gameState.gameValue = 16;
  document.getElementById('playerScore').value = '';
  document.getElementById('opponentScore').value = '';
  renderGameScreen();
}

// ========================================================
// ИСТОРИЯ И ЭКРАНЫ
// ========================================================

function showHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';

  if (gameState.history.length === 0) {
    historyList.innerHTML = '<p>История пуста</p>';
  } else {
    gameState.history.forEach(record => {
      const p = document.createElement('p');
      p.textContent = record;
      p.style.padding = '0.5em';
      p.style.borderBottom = '1px solid #FFD700';
      historyList.appendChild(p);
    });
  }

  showScreen('history');
}

function closeHistory() {
  showScreen('game');
}

function showVictoryScreen() {
  stopTimer();
  const winner = gameState.team1Score >= 101 ? 'Команда 1' : 'Команда 2';
  const score1 = gameState.team1Score;
  const score2 = gameState.team2Score;
  const time = document.getElementById('timer').textContent;

  document.getElementById('victoryText').textContent = `${winner} набрала 101+ очко!`;
  document.getElementById('finalStats').textContent =
    `Команда 1: ${score1} очков (⚡ ${gameState.team1Bolts}) | Команда 2: ${score2} очков (⚡ ${gameState.team2Bolts}) | Время: ${time}`;

  localStorage.removeItem(getGameSaveKey());
  showScreen('victory');
}

function startNewGame() {
  gameState.roundNumber = 1;
  gameState.team1Score = 0;
  gameState.team2Score = 0;
  gameState.team1Bolts = 0;
  gameState.team2Bolts = 0;
  gameState.gameValue = 16;
  gameState.timerSeconds = 0;
  gameState.history = [];
  gameState.mode = 0;
  gameState.players = [];

  stopTimer();
  localStorage.removeItem(getGameSaveKey());
  showScreen('menu');
}

function goHome() {
  if (confirm('Вы уверены? Текущая игра будет потеряна.')) {
    startNewGame();
  }
}

// ========================================================
// СОХРАНЕНИЕ И ЗАГРУЗКА
// ========================================================

function saveGameState() {
  localStorage.setItem(getGameSaveKey(), JSON.stringify(gameState));
}

// ========================================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем таймер при загрузке
  updateTimerDisplay();

  // Слушаем события для автозаполнения очков
  const playerScoreInput = document.getElementById('playerScore');
  const opponentScoreInput = document.getElementById('opponentScore');

  if (playerScoreInput) {
    playerScoreInput.addEventListener('input', autoFillOpponentScore);
  }

  if (opponentScoreInput) {
    opponentScoreInput.addEventListener('input', () => {
      const opponentScore = parseInt(opponentScoreInput.value) || 0;
      if (opponentScore >= 0 && opponentScore <= gameState.gameValue) {
        playerScoreInput.value = gameState.gameValue - opponentScore;
      }
    });
  }
});
