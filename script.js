/* ==========================================================
   BELOT CLUB
   Version 1.0
   Author: Vitaliy K.
   Logic: ChatGPT + Vitaliy
========================================================== */

/* ==========================================================
   LOCAL STORAGE
========================================================== */

const PLAYERS_DB_KEY = "belot_players";
const SAVE_GAME_KEY = "belot_save";

/* ==========================================================
   GAME STATE
========================================================== */

const gameState = {

    mode: 0,

    players: [],

    dealerIndex: 0,

    activePlayerIndex: 0,

    round: 1,

    timerSeconds: 0,

    timerRunning: false,

    timerInterval: null,

    baseGameValue: 16,

    announcementPoints: 0,

    announcementText: "",

    gameValue: 16,

    team1:{

        score:0,
        bolts:0,
        history:[]

    },

    team2:{

        score:0,
        bolts:0,
        history:[]

    },

    history:[]

};

/* ==========================================================
   PLAYERS DATABASE
========================================================== */

let playersDB =
JSON.parse(localStorage.getItem(PLAYERS_DB_KEY)) || [];

/* ==========================================================
   DOM
========================================================== */

const screens=document.querySelectorAll(".screen");

const menuScreen=document.getElementById("menuScreen");
const modeScreen=document.getElementById("modeScreen");
const playersScreen=document.getElementById("playersScreen");
const historyScreen=document.getElementById("historyScreen");
const victoryScreen=document.getElementById("victoryScreen");

const gameScreen4=document.getElementById("gameScreen4");
const gameScreen3=document.getElementById("gameScreen3");

const playersContainer=document.getElementById("playersContainer");

const roundNumber=document.getElementById("roundNumber");
const gameTimer=document.getElementById("gameTimer");

const team1Players=document.getElementById("team1Players");
const team2Players=document.getElementById("team2Players");

const team1Score=document.getElementById("team1Score");
const team2Score=document.getElementById("team2Score");

const team1Bolts=document.getElementById("team1Bolts");
const team2Bolts=document.getElementById("team2Bolts");

const dealerName=document.getElementById("dealerName");

const activePlayerSelect=document.getElementById("activePlayerSelect");

const gameValue=document.getElementById("gameValue");

const announcementButton=document.getElementById("announcementButton");

const opponentScoreInput=document.getElementById("opponentScoreInput");

const playerScoreInput=document.getElementById("playerScoreInput");

const historyBody=document.getElementById("historyBody");

/* ==========================================================
   STORAGE
========================================================== */

function savePlayersDatabase(){

    localStorage.setItem(
        PLAYERS_DB_KEY,
        JSON.stringify(playersDB)
    );

}

function saveGame(){

    localStorage.setItem(

        SAVE_GAME_KEY,

        JSON.stringify(gameState)

    );

}

function loadGame(){

    const save=
    localStorage.getItem(SAVE_GAME_KEY);

    if(!save){

        return false;

    }

    const data=JSON.parse(save);

    Object.assign(gameState,data);

    return true;

}

function deleteSave(){

    localStorage.removeItem(SAVE_GAME_KEY);

}

/* ==========================================================
   SCREENS
========================================================== */

function showScreen(screen){

    screens.forEach(item=>{

        item.classList.remove("active");

    });

    screen.classList.add("active");

}

/* ==========================================================
   MENU
========================================================== */

function startGame(){

    showScreen(modeScreen);

}

function backToMenu(){

    stopTimer();

    showScreen(menuScreen);

}

function continueGame(){

    if(!loadGame()){

        alert("Нет сохранённой игры.");

        return;

    }

    renderGame();

    startTimer();

    if(gameState.mode===4){

        showScreen(gameScreen4);

    }

    else{

        showScreen(gameScreen3);

    }

}

function openGameMenu(){

    document
    .getElementById("gameMenuModal")
    .classList
    .add("active");

}

function closeGameMenu(){

    document
    .getElementById("gameMenuModal")
    .classList
    .remove("active");

}

function saveAndExit(){

    saveGame();

    closeGameMenu();

    backToMenu();

}

function exitWithoutSaving(){

    if(confirm("Выйти без сохранения?")){

        deleteSave();

        closeGameMenu();

        backToMenu();

    }

}

/* ==========================================================
   TIMER
========================================================== */

function startTimer(){

    stopTimer();

    gameState.timerRunning=true;

    gameState.timerInterval=setInterval(()=>{

        gameState.timerSeconds++;

        updateTimer();

    },1000);

}

function stopTimer(){

    clearInterval(gameState.timerInterval);

    gameState.timerRunning=false;

}

function toggleTimer(){

    if(gameState.timerRunning){

        stopTimer();

    }

    else{

        startTimer();

    }

}

function updateTimer(){

    const min=
    String(Math.floor(gameState.timerSeconds/60))
    .padStart(2,"0");

    const sec=
    String(gameState.timerSeconds%60)
    .padStart(2,"0");

    gameTimer.textContent=`⏱ ${min}:${sec}`;

}

/* ==========================================================
   RENDER
========================================================== */

function renderGame(){

    roundNumber.textContent=`#${gameState.round}`;

    updateTimer();

}

/* ==========================================================
   MODE
========================================================== */

function selectMode(mode){

    gameState.mode=mode;

    createPlayersScreen();

    showScreen(playersScreen);

}

/* ==========================================================
   PLAYERS
========================================================== */

function createPlayersScreen(){

    playersContainer.innerHTML="";

    for(let i=0;i<gameState.mode;i++){

        const row=document.createElement("div");
        row.className="playerRow";

        const select=document.createElement("select");

        select.className="playerSelect";
        select.id=`playerSelect${i}`;

        const empty=document.createElement("option");

        empty.value="";
        empty.textContent="Выберите игрока";

        select.appendChild(empty);

        playersDB.forEach(name=>{

            const option=document.createElement("option");

            option.value=name;
            option.textContent=name;

            select.appendChild(option);

        });

        const add=document.createElement("option");

        add.value="__NEW__";
        add.textContent="➕ Новый игрок";

        select.appendChild(add);

        select.addEventListener("change",()=>{

            if(select.value!=="__NEW__"){

                return;

            }

            const newName=prompt("Имя игрока");

            if(!newName){

                select.value="";
                return;

            }

            const playerName=newName.trim();

            if(playerName===""){

                select.value="";
                return;

            }

            if(!playersDB.includes(playerName)){

                playersDB.push(playerName);

                playersDB.sort();

                savePlayersDatabase();

            }

            createPlayersScreen();

        });

        const remove=document.createElement("button");

        remove.className="removePlayerButton";

        remove.textContent="❌";

        remove.title="Удалить игрока";

        remove.addEventListener("click",()=>{

            const selected=select.value;

            if(selected===""){

                alert("Сначала выберите имя.");

                return;

            }

            if(!confirm(`Удалить ${selected} ?`)){

                return;

            }

            playersDB=
            playersDB.filter(player=>player!==selected);

            savePlayersDatabase();

            createPlayersScreen();

        });

        row.appendChild(select);

        row.appendChild(remove);

        playersContainer.appendChild(row);

    }

}

/* ==========================================================
   START GAME
========================================================== */

function confirmPlayers(){

    gameState.players=[];

    for(let i=0;i<gameState.mode;i++){

        const value=document
        .getElementById(`playerSelect${i}`)
        .value;

        if(value===""){

            alert("Выберите всех игроков.");

            return;

        }

        gameState.players.push(value);

    }

    gameState.round=1;

    gameState.dealerIndex=0;

    gameState.activePlayerIndex=1;

    gameState.timerSeconds=0;

    gameState.team1.score=0;
    gameState.team2.score=0;

    gameState.team1.bolts=0;
    gameState.team2.bolts=0;

    gameState.team1.history=[];
    gameState.team2.history=[];

    gameState.history=[];

    gameState.announcementPoints=0;
    gameState.announcementText="";

    gameState.baseGameValue=16;
    gameState.gameValue=16;

    fillTeams();

    buildActivePlayerList();

    updateDealer();

    updateGameValue();

    renderGame();

    startTimer();

    if(gameState.mode===4){

        showScreen(gameScreen4);

    }

    else{

        showScreen(gameScreen3);

    }

}

/* ==========================================================
   TEAMS
========================================================== */

function fillTeams(){

    if(gameState.mode===4){

        team1Players.innerHTML=
        `${gameState.players[0]}<br>${gameState.players[2]}`;

        team2Players.innerHTML=
        `${gameState.players[1]}<br>${gameState.players[3]}`;

    }

}

/* ==========================================================
   DEALER
========================================================== */

function updateDealer(){

    dealerName.textContent=
    gameState.players[
        gameState.dealerIndex
    ];

}

function nextDealer(){

    gameState.dealerIndex++;

    if(gameState.dealerIndex>=gameState.players.length){

        gameState.dealerIndex=0;

    }

    updateDealer();

}

/* ==========================================================
   ACTIVE PLAYER
========================================================== */

function buildActivePlayerList(){

    activePlayerSelect.innerHTML="";

    gameState.players.forEach((player,index)=>{

        const option=document.createElement("option");

        option.value=index;
        option.textContent=player;

        activePlayerSelect.appendChild(option);

    });

    activePlayerSelect.selectedIndex=
    gameState.activePlayerIndex;

}

activePlayerSelect.addEventListener("change",()=>{

    gameState.activePlayerIndex=
    Number(activePlayerSelect.value);

});

/* ==========================================================
   ANNOUNCEMENTS
========================================================== */

function openAnnouncements(){

    document
    .getElementById("announcementModal")
    .classList
    .add("active");

}

function closeAnnouncements(){

    document
    .getElementById("announcementModal")
    .classList
    .remove("active");

}

function applyAnnouncements(){

    updateGameValue();

    closeAnnouncements();

}

function updateGameValue(){

    gameState.gameValue=
    gameState.baseGameValue+
    gameState.announcementPoints;

    gameValue.textContent=
    `🟠 ${gameState.gameValue}`;

    announcementButton.textContent=
    `📣 (+${gameState.announcementPoints})`;

}

/* ==========================================================
   AUTO HINT
========================================================== */

playerScoreInput.addEventListener("input",()=>{

    const value=
    Number(playerScoreInput.value);

    if(Number.isNaN(value)){

        return;

    }

    opponentScoreInput.placeholder=
    gameState.gameValue-value;

});

opponentScoreInput.addEventListener("input",()=>{

    const value=
    Number(opponentScoreInput.value);

    if(Number.isNaN(value)){

        return;

    }

    playerScoreInput.placeholder=
    gameState.gameValue-value;

});

/* ==========================================================
   SAVE ROUND
========================================================== */

function saveRound(){

    const playerPoints =
        Number(playerScoreInput.value);

    const opponentPoints =
        Number(opponentScoreInput.value);

    if(
        Number.isNaN(playerPoints) ||
        Number.isNaN(opponentPoints)
    ){
        alert("Введите очки.");
        return;
    }

    if(
        playerPoints < 0 ||
        opponentPoints < 0
    ){
        alert("Очки не могут быть отрицательными.");
        return;
    }

    if(
        playerPoints + opponentPoints !== gameState.gameValue
    ){
        alert(
            `Сумма должна быть ${gameState.gameValue}.`
        );
        return;
    }

    processRound(
        playerPoints,
        opponentPoints
    );

}

/* ==========================================================
   PROCESS ROUND
========================================================== */

function processRound(
    playerPoints,
    opponentPoints
){

    const active =
        Number(gameState.activePlayerIndex);

    let activeTeam;

    if(gameState.mode===4){

        activeTeam =
            active===0 || active===2
            ? 1
            : 2;

    }else{

        activeTeam = active + 1;

    }

    let team1Delta = 0;
    let team2Delta = 0;

    let team1Note = "";
    let team2Note = "";

    let result = "normal";

    /* --------------------------------------
       НЕПРАВИЛЬНАЯ РАЗДАЧА
    -------------------------------------- */

    if(
        playerPoints===0 &&
        opponentPoints===0
    ){

        result="redeal";

        if(gameState.mode===4){

            if(
                gameState.dealerIndex===0 ||
                gameState.dealerIndex===2
            ){

                team1Delta=-10;
                team1Note="-10 неправильная";

            }else{

                team2Delta=-10;
                team2Note="-10 неправильная";

            }

        }

    }

    /* --------------------------------------
       НЕТ ВЗЯТКИ
    -------------------------------------- */

    else if(opponentPoints===0){

        result="capot";

        if(activeTeam===1){

            team1Delta=
                gameState.gameValue;

            team2Delta=-10;

            team2Note="-10 нет взятки";

        }else{

            team2Delta=
                gameState.gameValue;

            team1Delta=-10;

            team1Note="-10 нет взятки";

        }

    }

    /* --------------------------------------
       БОЛТ
    -------------------------------------- */

    else if(

        playerPoints>0 &&
        playerPoints<
        Math.ceil(
            gameState.gameValue/2
        )

    ){

        result="bolt";

        if(activeTeam===1){

            gameState.team1.bolts++;

            team2Delta=
                gameState.gameValue;

            team1Note=
                `⚡ ${playerPoints}`;

        }else{

            gameState.team2.bolts++;

            team1Delta=
                gameState.gameValue;

            team2Note=
                `⚡ ${playerPoints}`;

        }

    }

    /* --------------------------------------
       ОБЫЧНАЯ ИГРА
    -------------------------------------- */

    else{

        if(activeTeam===1){

            team1Delta=
                playerPoints;

            team2Delta=
                opponentPoints;

        }else{

            team2Delta=
                playerPoints;

            team1Delta=
                opponentPoints;

        }

    }

    /* --------------------------------------
       3 БОЛТА
    -------------------------------------- */

    if(gameState.team1.bolts>=3){

        gameState.team1.score-=10;

        gameState.team1.bolts=0;

        if(team1Note!==""){

            team1Note+=" ";

        }

        team1Note+="⚡⚡⚡ → -10";

    }

    if(gameState.team2.bolts>=3){

        gameState.team2.score-=10;

        gameState.team2.bolts=0;

        if(team2Note!==""){

            team2Note+=" ";

        }

        team2Note+="⚡⚡⚡ → -10";

    }

    /* --------------------------------------
       ПРИБАВЛЯЕМ ОЧКИ
    -------------------------------------- */

    gameState.team1.score+=team1Delta;

    gameState.team2.score+=team2Delta;

    /* --------------------------------------
       ИСТОРИЯ
    -------------------------------------- */

    addHistoryRow({

        round:
            gameState.round,

        game:
            gameState.gameValue,

        announce:
            gameState.announcementPoints,

        team1:
            team1Delta,

        team2:
            team2Delta,

        team1Note:
            team1Note,

        team2Note:
            team2Note,

        dealer:
            gameState.players[
                gameState.dealerIndex
            ],

        active:
            gameState.players[
                gameState.activePlayerIndex
            ],

        result:
            result

    });

    /* --------------------------------------
       СЛЕДУЮЩАЯ РАЗДАЧА
    -------------------------------------- */

    gameState.round++;

    nextDealer();

    gameState.announcementPoints=0;

    updateGameValue();

    playerScoreInput.value="";
    opponentScoreInput.value="";

    playerScoreInput.placeholder="";
    opponentScoreInput.placeholder="";

    renderGame();

    saveGame();

    checkWinner();

}

/* ==========================================================
   SCORE RENDER
========================================================== */

function renderGame(){

    roundNumber.textContent=
        `#${gameState.round}`;

    updateTimer();

    team1Score.textContent=
        gameState.team1.score;

    team2Score.textContent=
        gameState.team2.score;

    team1Bolts.textContent=
        `⚡${gameState.team1.bolts}`;

    team2Bolts.textContent=
        `⚡${gameState.team2.bolts}`;

}

/* ==========================================================
   WINNER
========================================================== */

function checkWinner(){

    if(
        gameState.team1.score>=101
    ){

        showWinner(1);

        return;

    }

    if(
        gameState.team2.score>=101
    ){

        showWinner(2);

        return;

    }

}







