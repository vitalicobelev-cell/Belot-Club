/* ==========================================================
   BELOT CLUB
   script.js
========================================================== */

"use strict";


/* ==========================================================
   SCREENS
========================================================== */

const startScreen =
    document.getElementById("startScreen");

const continueScreen =
    document.getElementById("continueScreen");

const registerScreen =
    document.getElementById("registerScreen");

const loadingScreen =
    document.getElementById("loadingScreen");

const gameScreen =
    document.getElementById("gameScreen");



/* ==========================================================
   START
========================================================== */

let selectedMode = 4;



/* ==========================================================
   MODE BUTTONS
========================================================== */

document
    .querySelectorAll(".mode-btn[data-mode]")

    .forEach(button=>{

        button.addEventListener(

            "click",

            ()=>{

                selectedMode = Number(

                    button.dataset.mode

                );

                checkSavedGame();

            }

        );

    });



/* ==========================================================
   PLAYER ROWS
========================================================== */

const rowPlayer1 =
    document.getElementById("rowPlayer1");

const rowPlayer2 =
    document.getElementById("rowPlayer2");

const rowPlayer3 =
    document.getElementById("rowPlayer3");

const rowPlayer4 =
    document.getElementById("rowPlayer4");



/* ==========================================================
   BACK BUTTONS
========================================================== */

const backToModes =
    document.getElementById("backToModes");

const backToContinue =
    document.getElementById("backToContinue");



backToModes.addEventListener(

    "click",

    ()=>{

        continueScreen.classList.add("hidden");

        startScreen.classList.remove("hidden");

    }

);



backToContinue.addEventListener(

    "click",

    ()=>{

        registerScreen.classList.add("hidden");

        startScreen.classList.remove("hidden");

    }

);



/* ==========================================================
   PLAYER COUNT
========================================================== */

function setupPlayerFields(mode){

    rowPlayer1.classList.remove("hidden");

    rowPlayer2.classList.remove("hidden");

    rowPlayer3.classList.remove("hidden");

    rowPlayer4.classList.remove("hidden");



    if(mode===2){

        rowPlayer3.classList.add("hidden");

        rowPlayer4.classList.add("hidden");

    }



    if(mode===3){

        rowPlayer4.classList.add("hidden");

    }

}



/* ==========================================================
   CHECK SAVE
========================================================== */

function checkSavedGame(){

    const saveName =

        "belot_save_" + selectedMode;

    const save =

        localStorage.getItem(saveName);



    startScreen.classList.add("hidden");



    if(save){

        continueScreen.classList.remove("hidden");

    }

    else{

        openRegister();

    }

}




/* ==========================================================
   SAVE NORMAL DEAL
========================================================== */

function saveDeal(){

    const enemy = Number(enemyPoints.value);

    const player = Number(playerPoints.value);

    const playerTeam = getCurrentTeam();

    const enemyTeam = playerTeam === 0 ? 1 : 0;

    addTeamScore(playerTeam,player);

    addTeamScore(enemyTeam,enemy);



    /* ----- Нет взяток ----- */

    if(enemy === 0 || player === 0){

        showConfirm(

            "У одной из сторон нет взяток.<br><br>Добавить победителям +10 ?",

            ()=>{

                if(enemy === 0){

                    addTeamScore(playerTeam,10);

                }

                else{

                    addTeamScore(enemyTeam,10);

                }

                addHistory(

                    `${App.players[App.currentPlayer].name}

🟠 ${App.gameValue}

${enemy}:${player}`

                );

                saveGame();

                checkGameEnd();

                finishDeal();

            }

        );

        return;

    }



    addHistory(

        `${App.players[App.currentPlayer].name}

🟠 ${App.gameValue}

${enemy}:${player}`

    );



    saveGame();

    checkGameEnd();

    finishDeal();

}



/* ==========================================================
   SAVE BOLT
========================================================== */

function saveBolt(){

    const playerTeam = getCurrentTeam();

    const enemyTeam = playerTeam === 0 ? 1 : 0;

    addBolt(playerTeam);

    addTeamScore(enemyTeam,App.gameValue);

    addHistory(

        `⚡ Болт

${App.players[App.currentPlayer].name}

+${App.gameValue} соперникам`

    );

    saveGame();

    checkGameEnd();

    finishDeal();

}



/* ==========================================================
   WRONG DEAL
========================================================== */

function saveWrongDeal(){

    const dealerTeam = getDealerTeam();

    App.teams[dealerTeam].score -= 10;

    renderTeams();

    addHistory(

        `❌ Неправильная раздача

${App.players[App.dealerIndex].name}

−10`

    );

    saveGame();

    finishDeal();

}
/* ==========================================================
   CONTINUE / NEW GAME
========================================================== */

const continueBtn =
    document.getElementById("continueBtn");

const restartBtn =
    document.getElementById("restartBtn");

/* ==========================================================
   CONTINUE GAME
========================================================== */

continueBtn.onclick = function(){

    continueScreen.classList.add("hidden");

    loadSavedGame();

};



/* ==========================================================
   NEW GAME
========================================================== */

restartBtn.onclick = function(){

    const saveName =

        "belot_save_" + selectedMode;

    localStorage.removeItem(saveName);



    continueScreen.classList.add("hidden");



    openRegister();

};








/* ==========================================================
   OPEN REGISTER
========================================================== */

function openRegister(){

    continueScreen.classList.add("hidden");

    registerScreen.classList.remove("hidden");

   setupPlayerFields(selectedMode);

}



/* ==========================================================
   LOAD GAME
========================================================== */

function loadSavedGame(){
   

    const saveName =

        "belot_save_" + selectedMode;

    const save =

        localStorage.getItem(saveName);

    if(!save){

        openRegister();

        return;

    }

    Object.assign(

        App,

        JSON.parse(save)

    );

    continueScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    renderPlayers();

    renderTeams();

    updateDealer();

    updateDealCounter();

    updateGameValue();

    renderTimer();

}


/* ==========================================================
   PLAYER REGISTRATION
========================================================== */

const startGameBtn =
    document.getElementById("startGameBtn");

const player1 =
    document.getElementById("player1");

const player2 =
    document.getElementById("player2");

const player3 =
    document.getElementById("player3");

const player4 =
    document.getElementById("player4");



/* ==========================================================
   PLAYER DATABASE
========================================================== */

let playersDB =

    JSON.parse(

        localStorage.getItem("belot_players")

    ) || [];



function savePlayersDB(){

    localStorage.setItem(

        "belot_players",

        JSON.stringify(playersDB)

    );

}



startGameBtn.addEventListener(

    "click",

    createNewGame

);



/* ==========================================================
   CREATE GAME
========================================================== */

function createNewGame(){

    const names = [

        player1.value.trim(),

        player2.value.trim(),

        player3.value.trim(),

        player4.value.trim()

    ];



    const requiredPlayers = selectedMode;



    for(let i=0;i<requiredPlayers;i++){

        if(names[i] === ""){

            alert(

                `Введите имя игрока №${i+1}`

            );

            return;

        }

    }


   /* ---------- Сохраняем новых игроков ---------- */

names.forEach(name=>{

    if(

        name!=="" &&

        !playersDB.includes(name)

    ){

        playersDB.push(name);

    }

});

savePlayersDB();
   

    App.mode = selectedMode;

    App.deal = 1;

    App.timer = 0;

    App.dealerIndex = 0;

    App.currentPlayer = 0;

    App.gameValue = 16;

    App.declarations = [];

    App.history = [];



    App.players = [];



    for(let i=0;i<requiredPlayers;i++){

        App.players.push({

            id:i+1,

            name:names[i]

        });

    }



    createTeams();

    openGame();

}


/* ==========================================================
   CREATE TEAMS
========================================================== */

function createTeams(){

    switch(App.mode){

        /* ---------- 2 PLAYERS ---------- */

        case 2:

            App.teams = [

                {
                    id:1,
                    players:[0],
                    score:0,
                    bolts:0
                },

                {
                    id:2,
                    players:[1],
                    score:0,
                    bolts:0
                }

            ];

            break;



        /* ---------- 3 PLAYERS ---------- */

        case 3:

            App.teams = [

                {
                    id:1,
                    players:[0],
                    score:0,
                    bolts:0
                },

                {
                    id:2,
                    players:[1,2],
                    score:0,
                    bolts:0
                }

            ];

            break;



        /* ---------- 4 PLAYERS ---------- */

        default:

            App.teams = [

                {

                    id:1,

                    players:[0,2],      // 1 и 3

                    score:0,

                    bolts:0

                },

                {

                    id:2,

                    players:[1,3],      // 2 и 4

                    score:0,

                    bolts:0

                }

            ];

    }

}



/* ==========================================================
   OPEN GAME
========================================================== */

function openGame(){

    registerScreen.classList.add("hidden");

    loadingScreen.classList.remove("hidden");



    setTimeout(()=>{

        loadingScreen.classList.add("hidden");

        gameScreen.classList.remove("hidden");



        renderPlayers();

        renderTeams();

        updateDealer();

        updateDealCounter();

        updateGameValue();

        renderTimer();



        saveGame();



    },700);

}



/* ==========================================================
   SAVE GAME
========================================================== */

function saveGame(){

    localStorage.setItem(

        "belot_save_" + App.mode,

        JSON.stringify(App)

    );

}



/* ==========================================================
   NEXT DEAL
========================================================== */

function nextDeal(){

    /* ---------- Следующая сдача ---------- */

    App.deal++;

    updateDealCounter();



    /* ---------- Следующий сдающий ---------- */

    App.dealerIndex++;

    if(App.dealerIndex >= App.players.length){

        App.dealerIndex = 0;

    }

    updateDealer();



    /* ---------- Играющий ---------- */

    App.currentPlayer = 0;

    currentPlayer.value = 0;



    /* ---------- Новая сдача ---------- */

    App.declarations = [];

    updateGameValue();



    enemyPoints.value = "";

    playerPoints.value = "";



    saveGame();

}



/* ==========================================================
   TEAM SCORE
========================================================== */

function addTeamScore(teamId,points){

    App.teams[teamId].score += points;

    renderTeams();

}



/* ==========================================================
   TEAM BOLT
========================================================== */

function addBolt(teamId){

    App.teams[teamId].bolts++;

    renderTeams();

}



/* ==========================================================
   SAVE AFTER EVERY HAND
========================================================== */

function finishDeal(){

    saveGame();

    nextDeal();

}



/* ==========================================================
   RESET GAME
========================================================== */

function deleteSavedGame(){

    localStorage.removeItem(

        "belot_save_" + App.mode

    );

}



/* ==========================================================
   GAME END
========================================================== */

function checkGameEnd(){

    if(App.teams[0].score >= 101){

        deleteSavedGame();

        alert("Победила Команда 1");

        return true;

    }

    if(App.teams[1].score >= 101){

        deleteSavedGame();

        alert("Победила Команда 2");

        return true;

    }

    return false;

}










/* ==========================================================
   APP
========================================================== */

const App = {

    mode: 4,

    deal: 1,

    timer: 0,

    dealerIndex: 0,

    currentPlayer: null,

    gameValue: 16,

    declarations: [],

    players: [],

    teams: [],

    history: []

};


/* ==========================================================
   ELEMENTS
========================================================== */

const dealerName =
    document.getElementById("dealerName");

const currentPlayer =
    document.getElementById("currentPlayer");

const team1Players =
    document.getElementById("team1Players");

const team2Players =
    document.getElementById("team2Players");

const team1Score =
    document.getElementById("team1Score");

const team2Score =
    document.getElementById("team2Score");

const team1Bolts =
    document.getElementById("team1Bolts");

const team2Bolts =
    document.getElementById("team2Bolts");

const gameCost =
    document.getElementById("gameCost");

const dealCounter =
    document.getElementById("dealCounter");

const saveBtn =
    document.getElementById("saveBtn");


/* ==========================================================
   INIT
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);


/* ==========================================================
   START
========================================================== */

function init(){

    demoGame();

    renderPlayers();

    renderTeams();

    updateDealer();

    updateDealCounter();

}



/* ==========================================================
   DEMO DATA
========================================================== */

function demoGame(){

    App.players = [

        {
            id:1,
            name:"Виталий"
        },

        {
            id:2,
            name:"Сергей"
        },

        {
            id:3,
            name:"Анастасия"
        },

        {
            id:4,
            name:"Алина"
        }

    ];


    App.teams = [

        {

            id:1,

            players:[0,1],

            score:312,

            bolts:1

        },

        {

            id:2,

            players:[2,3],

            score:284,

            bolts:0

        }

    ];


    App.currentPlayer = 0;

}



/* ==========================================================
   PLAYERS
========================================================== */

function renderPlayers(){

    currentPlayer.innerHTML = "";

    App.players.forEach((player,index)=>{

        const option = document.createElement("option");

        option.value = index;

        option.textContent = player.name;

        currentPlayer.appendChild(option);

    });

    currentPlayer.value = App.currentPlayer;

}



/* ==========================================================
   PLAYER CHANGED
========================================================== */

currentPlayer.addEventListener(

    "change",

    ()=>{

        App.currentPlayer = Number(currentPlayer.value);

    }

);

/* ==========================================================
   TEAMS
========================================================== */

function renderTeams(){

    /* ---------- TEAM 1 ---------- */

    team1Players.innerHTML = "";

    App.teams[0].players.forEach(index=>{

        const div = document.createElement("div");

        div.textContent = App.players[index].name;

        team1Players.appendChild(div);

    });

    team1Score.textContent =
        App.teams[0].score;

    team1Bolts.textContent =
        `⚡${App.teams[0].bolts}`;



    /* ---------- TEAM 2 ---------- */

    team2Players.innerHTML = "";

    App.teams[1].players.forEach(index=>{

        const div = document.createElement("div");

        div.textContent = App.players[index].name;

        team2Players.appendChild(div);

    });

    team2Score.textContent =
        App.teams[1].score;

    team2Bolts.textContent =
        `⚡${App.teams[1].bolts}`;

}



/* ==========================================================
   DEALER
========================================================== */

function updateDealer(){

    dealerName.textContent =
        App.players[App.dealerIndex].name;

}



/* ==========================================================
   DEAL NUMBER
========================================================== */

function updateDealCounter(){

    dealCounter.textContent =
        `№${App.deal}`;

}



/* ==========================================================
   TIMER
========================================================== */

let timerInterval = null;

const gameTimer =
    document.getElementById("gameTimer");



function startTimer(){

    if(timerInterval){

        clearInterval(timerInterval);

    }

    timerInterval = setInterval(()=>{

        App.timer++;

        renderTimer();

    },1000);

}



function renderTimer(){

    const hours = String(
        Math.floor(App.timer / 3600)
    ).padStart(2,"0");

    const minutes = String(
        Math.floor((App.timer % 3600) / 60)
    ).padStart(2,"0");

    const seconds = String(
        App.timer % 60
    ).padStart(2,"0");

    gameTimer.textContent =
        `${hours}:${minutes}:${seconds}`;

}



/* ==========================================================
   GAME VALUE
========================================================== */

function updateGameValue(){

    let declarations = 0;

    App.declarations.forEach(item=>{

        declarations += item.points;

    });

    App.gameValue = 16 + declarations;

    gameCost.textContent =
        `🟠 ${App.gameValue}`;

}



/* ==========================================================
   NEW DEAL
========================================================== */

function nextDeal(){

    App.deal++;

    updateDealCounter();

    App.dealerIndex++;

    if(App.dealerIndex >= App.players.length){

        App.dealerIndex = 0;

    }

    updateDealer();

    App.currentPlayer = 0;

    currentPlayer.value = 0;

    App.declarations = [];

    updateGameValue();

}



/* ==========================================================
   START TIMER
========================================================== */

startTimer();

updateGameValue();



/* ==========================================================
   SCORE PANEL
========================================================== */

const scorePanel =
    document.getElementById("scorePanel");

const historyModal =
    document.getElementById("historyModal");

const closeHistory =
    document.getElementById("closeHistory");

const historyContent =
    document.getElementById("historyContent");



/* ==========================================================
   OPEN HISTORY
========================================================== */

scorePanel.addEventListener(

    "click",

    openHistory

);



closeHistory.addEventListener(

    "click",

    closeHistoryModal

);



function openHistory(){

    renderHistory();

    historyModal.classList.remove("hidden");

}



function closeHistoryModal(){

    historyModal.classList.add("hidden");

}



/* ==========================================================
   HISTORY
========================================================== */

function renderHistory(){

    historyContent.innerHTML = "";

    if(App.history.length === 0){

        historyContent.innerHTML =

            `<div class="history-empty">

                История партии пока пуста

            </div>`;

        return;

    }

    App.history.forEach(item=>{

        const card = document.createElement("div");

        card.className = "history-card";

        card.innerHTML = `

            <div class="history-title">

                Сдача №${item.deal}

            </div>

            <div>

                ${item.text}

            </div>

        `;

        historyContent.appendChild(card);

    });

}



/* ==========================================================
   ADD HISTORY
========================================================== */

function addHistory(text){

    App.history.unshift({

        deal:App.deal,

        text:text

    });

}



/* ==========================================================
   SAVE
========================================================== */

const enemyPoints =
    document.getElementById("enemyPoints");

const playerPoints =
    document.getElementById("playerPoints");

const confirmModal =
    document.getElementById("confirmModal");

const confirmContent =
    document.getElementById("confirmContent");

const cancelSave =
    document.getElementById("cancelSave");

const confirmSave =
    document.getElementById("confirmSave");



saveBtn.addEventListener(

    "click",

    validateDeal

);



cancelSave.addEventListener(

    "click",

    ()=>{

        confirmModal.classList.add("hidden");

    }

);



/* ==========================================================
   VALIDATION
========================================================== */

function validateDeal(){

    const enemy =
        Number(enemyPoints.value || 0);

    const player =
        Number(playerPoints.value || 0);



    /* ---------- WRONG DEAL ---------- */

    if(enemy === 0 && player === 0){

        showConfirm(

            "❌ <b>Обнаружена неправильная раздача.</b><br><br>" +

            "Сдающему будет записан штраф <b>-10</b>.<br>" +

            "Очки сдачи записаны не будут.",

            saveWrongDeal

        );

        return;

    }



    /* ---------- BOLT ---------- */

    if(player === 0){

        showConfirm(

            "⚡ <b>Игра не сыграна.</b><br><br>" +

            "Записать болт играющей стороне?",

            saveBolt

        );

        return;

    }



    /* ---------- SCORE ---------- */

    if(enemy + player !== App.gameValue){

        alert(

            "Сумма очков должна быть равна стоимости игры."

        );

        return;

    }



    showConfirm(

        `

        <b>Проверка сдачи</b><br><br>

        Играет: ${App.players[App.currentPlayer].name}<br>

        🟠 Стоимость: ${App.gameValue}<br><br>

        Соперник: ${enemy}<br>

        Играющему: ${player}

        `,

        saveDeal

    );

}



/* ==========================================================
   CONFIRM WINDOW
========================================================== */

let confirmAction = null;

function showConfirm(html,action){

    confirmAction = action;

    confirmContent.innerHTML = html;

    confirmModal.classList.remove("hidden");

}



confirmSave.addEventListener(

    "click",

    ()=>{

        confirmModal.classList.add("hidden");

        if(confirmAction){

            confirmAction();

        }

    }

);



/* ==========================================================
   SAVE FUNCTIONS
========================================================== */

const toast =
    document.getElementById("toast");



/* ---------- NORMAL DEAL ---------- */

function saveDeal(){

    const enemy =
        Number(enemyPoints.value);

    const player =
        Number(playerPoints.value);

    addHistory(

        `${App.players[App.currentPlayer].name}
        | 🟠 ${App.gameValue}
        | ${enemy}:${player}`

    );

    finishDeal();

}



/* ---------- BOLT ---------- */

function saveBolt(){

    const team = getCurrentTeam();

    App.teams[team].bolts++;

    renderTeams();

    addHistory(

        `⚡ Болт
        (${App.players[App.currentPlayer].name})`

    );

    finishDeal();

}



/* ---------- WRONG DEAL ---------- */

function saveWrongDeal(){

    const dealerTeam =
        getDealerTeam();

    App.teams[dealerTeam].score -= 10;

    renderTeams();

    addHistory(

        `❌ Неправильная раздача

        🃏 ${App.players[App.dealerIndex].name}

        -10`

    );

    finishDeal();

}



/* ==========================================================
   HELPERS
========================================================== */

function getCurrentTeam(){

    for(let i=0;i<App.teams.length;i++){

        if(

            App.teams[i].players.includes(

                App.currentPlayer

            )

        ){

            return i;

        }

    }

    return 0;

}



function getDealerTeam(){

    for(let i=0;i<App.teams.length;i++){

        if(

            App.teams[i].players.includes(

                App.dealerIndex

            )

        ){

            return i;

        }

    }

    return 0;

}



/* ==========================================================
   CLEAR DEAL
========================================================== */

function clearDeal(){

    enemyPoints.value = "";

    playerPoints.value = "";

    showToast();

    nextDeal();

}




/* ==========================================================
   TOAST
========================================================== */

function showToast(){

    toast.textContent = "✔ Сохранено";

    toast.classList.remove("hidden");

    setTimeout(()=>{

        toast.classList.add("hidden");

    },1800);

}



/* ==========================================================
   INPUT VALIDATION
========================================================== */

enemyPoints.addEventListener(

    "input",

    validateInput

);

playerPoints.addEventListener(

    "input",

    validateInput

);



function validateInput(e){

    let value = e.target.value;

    /* только целые */

    value = value.replace(/\D/g,"");

    if(value === ""){

        e.target.value = "";

        return;

    }

    value = Number(value);

    /* диапазон */

    if(value < 0){

        value = 0;

    }

    if(value > App.gameValue){

        value = App.gameValue;

    }

    e.target.value = value;

}



/* ==========================================================
   CLOSE MODALS (CLICK OUTSIDE)
========================================================== */

document.querySelectorAll(".modal").forEach(modal=>{

    modal.addEventListener("click",(e)=>{

        if(e.target === modal){

            modal.classList.add("hidden");

        }

    });

});



/* ==========================================================
   ESC
========================================================== */

document.addEventListener(

    "keydown",

    (e)=>{

        if(e.key !== "Escape") return;

        document
            .querySelectorAll(".modal")
            .forEach(modal=>{

                modal.classList.add("hidden");

            });

    }

);



/* ==========================================================
   DEBUG
========================================================== */

console.log(

    "♠ BELOT CLUB loaded"

);
