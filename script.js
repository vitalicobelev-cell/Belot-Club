"use strict";

/* ==========================================================
   BELOT CLUB
   script.js
   Часть 1/10
==========================================================*/


/* ==========================================================
   APPLICATION
==========================================================*/

const App = {

    mode: 0,

    players: [],

    teams: [

        {
            score: 0,
            bolts: 0
        },

        {
            score: 0,
            bolts: 0
        }

    ],

    dealerIndex: 0,

    currentPlayer: 0,

    deal: 1,

    gameValue: 16,

    declarations: [],

    history: [],

    timer: 0

};



/* ==========================================================
   SCREENS
==========================================================*/

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
==========================================================*/

let selectedMode = 0;



/* ==========================================================
   BUTTONS
==========================================================*/

const continueBtn =
document.getElementById("continueGame");

const newGameBtn =
document.getElementById("newGame");

const backToModes =
document.getElementById("backToModes");

const backToContinue =
document.getElementById("backToContinue");



/* ==========================================================
   PLAYER INPUTS
==========================================================*/

const playerInputs = [

    document.getElementById("player1"),

    document.getElementById("player2"),

    document.getElementById("player3"),

    document.getElementById("player4")

];



const playerRows = [

    document.getElementById("rowPlayer1"),

    document.getElementById("rowPlayer2"),

    document.getElementById("rowPlayer3"),

    document.getElementById("rowPlayer4")

];



const playerLists = [

    document.getElementById("player1List"),

    document.getElementById("player2List"),

    document.getElementById("player3List"),

    document.getElementById("player4List")

];



/* ==========================================================
   LOCAL STORAGE
==========================================================*/

const PLAYERS_DB_KEY =

"belot_players";



let playersDB =

JSON.parse(

localStorage.getItem(

PLAYERS_DB_KEY

)

) || [];



function savePlayersDB(){

    localStorage.setItem(

        PLAYERS_DB_KEY,

        JSON.stringify(playersDB)

    );

}



function getSaveKey(){

    return "belot_save_" + selectedMode;

}








/* ==========================================================

   BELOT CLUB

   script.js

   Часть 2/10

==========================================================*/

/* ==========================================================

   MODE BUTTONS

==========================================================*/

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

   CHECK SAVE

==========================================================*/

function checkSavedGame(){

    const save =

    localStorage.getItem(

        getSaveKey()

    );

    startScreen.classList.add(

        "hidden"

    );

    if(save){

        continueScreen.classList.remove(

            "hidden"

        );

    }

    else{

        openRegister();

    }

}

/* ==========================================================

   REGISTER SCREEN

==========================================================*/

function openRegister(){

    continueScreen.classList.add(

        "hidden"

    );

    registerScreen.classList.remove(

        "hidden"

    );

    setupPlayerFields();

}

/* ==========================================================

   PLAYER COUNT

==========================================================*/

function setupPlayerFields(){

    playerRows.forEach(row=>{

        row.classList.remove(

            "hidden"

        );

    });

    if(selectedMode===2){

        playerRows[2].classList.add(

            "hidden"

        );

        playerRows[3].classList.add(

            "hidden"

        );

    }

    if(selectedMode===3){

        playerRows[3].classList.add(

            "hidden"

        );

    }

}

/* ==========================================================

   BACK BUTTONS

==========================================================*/

backToModes.onclick=()=>{

    continueScreen.classList.add(

        "hidden"

    );

    startScreen.classList.remove(

        "hidden"

    );

};

backToContinue.onclick=()=>{

    registerScreen.classList.add(

        "hidden"

    );

    startScreen.classList.remove(

        "hidden"

    );

};

/* ==========================================================

   CONTINUE GAME

==========================================================*/

continueBtn.onclick=()=>{

    loadSavedGame();

};

/* ==========================================================

   NEW GAME

==========================================================*/

newGameBtn.onclick=()=>{

    localStorage.removeItem(

        getSaveKey()

    );

    openRegister();

};







/* ==========================================================
   BELOT CLUB
   script.js
   Часть 3/10
==========================================================*/


/* ==========================================================
   PLAYER LISTS
==========================================================*/

function buildPlayerLists(){

    playerLists.forEach((list,index)=>{

        list.innerHTML="";

        playersDB.forEach(name=>{

            const item=document.createElement("div");

            item.className="player-item";

            item.textContent=name;

            item.onclick=()=>{

                playerInputs[index].value=name;

                hidePlayerLists();

            };

            list.appendChild(item);

        });



        const add=document.createElement("div");

        add.className="player-item";

        add.textContent="+ Новый игрок";



        add.onclick=()=>{

            hidePlayerLists();

            playerInputs[index].focus();

        };



        list.appendChild(add);

    });

}



/* ==========================================================
   SHOW / HIDE LISTS
==========================================================*/

function hidePlayerLists(){

    playerLists.forEach(list=>{

        list.classList.add("hidden");

    });

}



playerInputs.forEach((input,index)=>{

    input.addEventListener("focus",()=>{

        buildPlayerLists();

        hidePlayerLists();

        playerLists[index].classList.remove("hidden");

    });

});



document.addEventListener("click",e=>{

    if(

        !e.target.classList.contains("player-input") &&

        !e.target.classList.contains("player-item")

    ){

        hidePlayerLists();

    }

});



/* ==========================================================
   CREATE NEW GAME
==========================================================*/

function createNewGame(){

    const names=[];

    for(let i=0;i<selectedMode;i++){

        const name=playerInputs[i].value.trim();

        if(name===""){

            alert("Заполните всех игроков");

            return;

        }

        names.push(name);



        if(!playersDB.includes(name)){

            playersDB.push(name);

        }

    }



    savePlayersDB();



    App.mode=selectedMode;

    App.players=[];



    names.forEach(name=>{

        App.players.push({

            name:name

        });

    });



    App.teams=[

        {

            score:0,

            bolts:0

        },

        {

            score:0,

            bolts:0

        }

    ];



    App.history=[];

    App.deal=1;

    App.dealerIndex=0;

    App.currentPlayer=0;

    App.gameValue=16;

    App.declarations=[];

App.timer = 0;

createTeams();

startTimer();
   

    openGame();

}





/* ==========================================================
   BELOT CLUB
   script.js
   Часть 4/10
==========================================================*/


/* ==========================================================
   CREATE TEAMS
==========================================================*/

function createTeams(){

    switch(App.mode){

        /* ---------- 2 игрока ---------- */

        case 2:

            App.teams = [

                {

                    players:[0],

                    score:0,

                    bolts:0

                },

                {

                    players:[1],

                    score:0,

                    bolts:0

                }

            ];

            break;



        /* ---------- 3 игрока ---------- */

        case 3:

            App.teams = [

                {

                    players:[0],

                    score:0,

                    bolts:0

                },

                {

                    players:[1,2],

                    score:0,

                    bolts:0

                }

            ];

            break;



        /* ---------- 4 игрока ---------- */

        case 4:

            App.teams = [

                {

                    players:[0,2],

                    score:0,

                    bolts:0

                },

                {

                    players:[1,3],

                    score:0,

                    bolts:0

                }

            ];

            break;

    }

}



/* ==========================================================
   FIND PLAYER TEAM
==========================================================*/

function getPlayerTeam(playerIndex){

    for(let i=0;i<App.teams.length;i++){

        if(

            App.teams[i]

            .players

            .includes(playerIndex)

        ){

            return i;

        }

    }

    return 0;

}



/* ==========================================================
   CURRENT TEAM
==========================================================*/

function getCurrentTeam(){

    return getPlayerTeam(

        App.currentPlayer

    );

}



/* ==========================================================
   DEALER TEAM
==========================================================*/

function getDealerTeam(){

    return getPlayerTeam(

        App.dealerIndex

    );

}



/* ==========================================================
   TEAM SCORE
==========================================================*/

function addTeamScore(team,value){

    App.teams[team].score += value;

}



/* ==========================================================
   TEAM BOLT
==========================================================*/

function addBolt(team){

    App.teams[team].bolts++;

}



/* ==========================================================
   RESET SCORE
==========================================================*/

function resetScores(){

    App.teams.forEach(team=>{

        team.score = 0;

        team.bolts = 0;

    });

}




/* ==========================================================
   BELOT CLUB
   script.js
   Часть 5/10
==========================================================*/


/* ==========================================================
   OPEN GAME
==========================================================*/

function openGame(){

    registerScreen.classList.add("hidden");

    continueScreen.classList.add("hidden");

    loadingScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");



    renderPlayers();

    renderTeams();

    updateDealer();

    updateDealCounter();

    updateGameValue();

    renderTimer();



    saveGame();

}



/* ==========================================================
   LOAD GAME
==========================================================*/

function loadSavedGame(){

    const save = localStorage.getItem(

        getSaveKey()

    );



    if(!save){

        openRegister();

        return;

    }



    Object.assign(

        App,

        JSON.parse(save)

    );



    gameScreen.classList.remove("hidden");



    renderPlayers();

    renderTeams();

    updateDealer();

    updateDealCounter();

    updateGameValue();

    renderTimer();

   startTimer();
   
}



/* ==========================================================
   SAVE GAME
==========================================================*/

function saveGame(){

    localStorage.setItem(

        getSaveKey(),

        JSON.stringify(App)

    );

}



/* ==========================================================
   NEXT DEAL
==========================================================*/

function nextDeal(){

    App.deal++;



    App.dealerIndex++;



    if(

        App.dealerIndex>=App.players.length

    ){

        App.dealerIndex=0;

    }



    App.currentPlayer=0;



    App.declarations=[];

    App.gameValue=16;



    updateDealer();

    updateDealCounter();

    updateGameValue();



    saveGame();

}



/* ==========================================================
   GAME END
==========================================================*/

    function checkGameEnd(){

    if(

        App.teams[0].score>=101 ||

        App.teams[1].score>=101

    ){

        stopTimer();

        localStorage.removeItem(

            getSaveKey()

        );



        const winner =

        App.teams[0].score>=101

        ?1

        :2;



        alert(

            "Победила команда " +

            winner +

            "\n\n" +

            "Время партии: " +

            timerLabel.innerHTML

        );



        startScreen.classList.remove("hidden");

        gameScreen.classList.add("hidden");



        return true;

    }



    return false;

}


/* ==========================================================
   BELOT CLUB
   script.js
   Часть 6/10
==========================================================*/


/* ==========================================================
   SAVE DEAL
==========================================================*/

function saveDeal(){

    const enemy = Number(enemyPoints.value);

    const player = Number(playerPoints.value);



    if(

        isNaN(enemy) ||

        isNaN(player)

    ){

        alert("Введите очки.");

        return;

    }



    if(enemy<0 || player<0){

        alert("Очки не могут быть меньше нуля.");

        return;

    }



    if(enemy+player>App.gameValue){

        alert("Сумма очков больше стоимости игры.");

        return;

    }



    const playerTeam = getCurrentTeam();

    const enemyTeam =

        playerTeam===0 ? 1 : 0;



    /* ======================================
       НЕПРАВИЛЬНАЯ РАЗДАЧА
    ====================================== */

    if(enemy===0 && player===0){

        App.teams[

            getDealerTeam()

        ].score -= 10;



        App.history.push({

            deal:App.deal,

            type:"NR",

            dealer:App.dealerIndex,

            player:App.currentPlayer

        });



        renderTeams();

saveGame();

renderHistory();

checkGameEnd();

nextDeal();
       

        return;

    }



    /* ======================================
       НЕТ ВЗЯТОК
    ====================================== */

    if(enemy===0 || player===0){

        if(enemy===0){

            App.teams[playerTeam].score +=

                App.gameValue;

            App.teams[enemyTeam].score -=10;

        }

        else{

            App.teams[enemyTeam].score +=

                App.gameValue;

            App.teams[playerTeam].score -=10;

        }



        App.history.push({

            deal:App.deal,

            type:"NO_TRICKS",

            dealer:App.dealerIndex,

            player:App.currentPlayer,

            game:App.gameValue

        });



        renderTeams();

saveGame();

renderHistory();

checkGameEnd();

nextDeal();

        return;

    }



    /* ======================================
       БОЛТ
    ====================================== */

    if(

        player>0 &&

        player <

        Math.ceil(

            App.gameValue/2

        )

    ){

        addBolt(playerTeam);



        App.teams[enemyTeam].score +=

            App.gameValue;



        App.history.push({

            deal:App.deal,

            type:"BOLT",

            dealer:App.dealerIndex,

            player:App.currentPlayer,

            game:App.gameValue

        });



        renderTeams();

saveGame();

renderHistory();

checkGameEnd();

nextDeal();

        return;

    }



    /* ======================================
       ОБЫЧНАЯ ИГРА
    ====================================== */

    App.teams[playerTeam].score += player;

    App.teams[enemyTeam].score += enemy;



    App.history.push({

        deal:App.deal,

        type:"NORMAL",

        dealer:App.dealerIndex,

        player:App.currentPlayer,

        game:App.gameValue,

        team1:App.teams[0].score,

        team2:App.teams[1].score,

        enemy:enemy,

        playerScore:player

    });



   renderTeams();

saveGame();

renderHistory();

checkGameEnd();

nextDeal();

}



/* ==========================================================
   BELOT CLUB
   script.js
   Часть 7/10
==========================================================*/


/* ==========================================================
   HISTORY
==========================================================*/

function renderHistory(){

    const tbody =

    document.getElementById(

        "historyBody"

    );



    if(!tbody) return;



    tbody.innerHTML = "";



    App.history.forEach(item=>{

        const tr =

        document.createElement("tr");



        let team1="";

        let team2="";



        switch(item.type){

            case "NR":

                team1 =

                App.teams[0].score;

                team2 =

                App.teams[1].score;

                break;



            case "NO_TRICKS":

                team1 =

                App.teams[0].score;

                team2 =

                App.teams[1].score;

                break;



            case "BOLT":

                team1 =

                App.teams[0].score +

                " ⚡"+

                App.teams[0].bolts;

                team2 =

                App.teams[1].score +

                " ⚡"+

                App.teams[1].bolts;

                break;



            default:

                team1 = item.team1;

                team2 = item.team2;

        }



        tr.innerHTML = `

<td>${item.deal}</td>

<td>${item.game ?? "-"}</td>

<td>${team1}</td>

<td>${team2}</td>

<td>${App.players[item.dealer]?.name ?? ""}</td>

<td>${App.players[item.player]?.name ?? ""}</td>

`;



        tbody.appendChild(tr);

    });

}




/* ==========================================================
   TEAM PANELS
========================================================== */

function renderTeams(){

    if(App.mode===4){

        team1Name.innerHTML =

            App.players[0].name +

            " / " +

            App.players[2].name;



        team2Name.innerHTML =

            App.players[1].name +

            " / " +

            App.players[3].name;

    }



    if(App.mode===3){

        team1Name.innerHTML =

            App.players[0].name;



        team2Name.innerHTML =

            App.players[1].name +

            " / " +

            App.players[2].name;

    }



    if(App.mode===2){

        team1Name.innerHTML =

            App.players[0].name;



        team2Name.innerHTML =

            App.players[1].name;

    }



    team1Score.innerHTML =

        App.teams[0].score;



    team2Score.innerHTML =

        App.teams[1].score;



    team1Bolts.innerHTML =

        App.teams[0].bolts;



    team2Bolts.innerHTML =

        App.teams[1].bolts;

}




/* ==========================================================
   DEAL COUNTER
========================================================== */

function updateDealCounter(){

    dealCounter.innerHTML =

        "№ " + App.deal;

}



/* ==========================================================
   DEALER
========================================================== */

function updateDealer(){

    dealerName.innerHTML =

        App.players[App.dealerIndex].name;

}



/* ==========================================================
   GAME VALUE
========================================================== */

function updateGameValue(){

    gameValue.innerHTML =

        App.gameValue;

}



/* ==========================================================
   GAME VALUE
========================================================== */

function calculateGameValue(){

    let value = 16;

    App.declarations.forEach(item=>{

        value += item.points;

    });

    App.gameValue = value;

    updateGameValue();

}


/* ==========================================================
   DECLARATIONS
========================================================== */

function addDeclaration(name, points){

    App.declarations.push({

        name,

        points

    });

    calculateGameValue();

}



function clearDeclarations(){

    App.declarations = [];

    App.gameValue = 16;

    updateGameValue();

}



/* ==========================================================
   AUTO SECOND SCORE
========================================================== */

playerPoints.addEventListener(

    "input",

    ()=>{

        let p = Number(playerPoints.value);

        if(isNaN(p)) return;

        if(p<0) return;

        if(p>App.gameValue) return;

        enemyPoints.value =

            App.gameValue - p;

    }

);



enemyPoints.addEventListener(

    "input",

    ()=>{

        let e = Number(enemyPoints.value);

        if(isNaN(e)) return;

        if(e<0) return;

        if(e>App.gameValue) return;

        playerPoints.value =

            App.gameValue - e;

    }

);


function normalizeScore(){

    let p = Number(playerPoints.value);

    let e = Number(enemyPoints.value);



    if(p<0) p = 0;

    if(e<0) e = 0;



    if(p>App.gameValue)

        p = App.gameValue;



    if(e>App.gameValue)

        e = App.gameValue;



    playerPoints.value = p;

    enemyPoints.value = e;

}



/* ==========================================================
   BELOT CLUB
   script.js
   Часть 10/10
==========================================================*/


/* ==========================================================
   TIMER
==========================================================*/

let timerID = null;

function startTimer(){

    stopTimer();

    timerID = setInterval(()=>{

        App.timer++;

        renderTimer();

    },1000);

}

function stopTimer(){

    if(timerID){

        clearInterval(timerID);

        timerID = null;

    }

}

function renderTimer(){

    const min =

    Math.floor(App.timer/60);

    const sec =

    App.timer%60;

    timerLabel.innerHTML =

    String(min).padStart(2,"0") +

    ":" +

    String(sec).padStart(2,"0");

}


/* ==========================================================
   INIT
==========================================================*/

hidePlayerLists();

renderTimer();

















