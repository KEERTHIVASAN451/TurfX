/* =========================================================
   TurfX - Score JavaScript
   File: static/js/score.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeScoreSystem();

});


/* =========================================================
   INITIALIZE SCORE SYSTEM
   ========================================================= */

function initializeScoreSystem() {

    initializeScoreInputs();
    initializeRunButtons();
    initializeWicketButton();
    initializeExtraButtons();
    initializeUndoButton();
    initializeScoreSaveButton();
    initializeInningsControls();

    calculateScore();

}


/* =========================================================
   SCORE STATE
   ========================================================= */

let scoreState = {

    runs: 0,

    wickets: 0,

    overs: 0,

    balls: 0,

    ballsPerOver: 6,

    extras: 0,

    innings: 1,

    target: null

};


/* =========================================================
   SCORE INPUTS
   ========================================================= */

function initializeScoreInputs() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    inputs.forEach(function (input) {

        input.addEventListener(
            "input",
            function () {

                calculateScore();

            }
        );

    });

}


/* =========================================================
   RUN BUTTONS
   ========================================================= */

function initializeRunButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-run]"
        );

    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const runs =
                    parseInt(
                        button.dataset.run
                    );

                addRuns(runs);

            }
        );

    });

}


/* =========================================================
   ADD RUNS
   ========================================================= */

function addRuns(
    runs
) {

    runs =
        parseInt(runs) || 0;

    if (runs < 0) {
        return;
    }

    scoreState.runs +=
        runs;

    scoreState.balls++;

    updateOvers();

    addScoreHistory(
        "runs",
        runs
    );

    calculateScore();

}


/* =========================================================
   WICKET
   ========================================================= */

function initializeWicketButton() {

    const button =
        document.querySelector(
            "#wicketButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            addWicket();

        }
    );

}


/* =========================================================
   ADD WICKET
   ========================================================= */

function addWicket() {

    if (
        scoreState.wickets >=
        10
    ) {

        showScoreMessage(
            "All wickets are already down.",
            "error"
        );

        return;

    }

    scoreState.wickets++;

    scoreState.balls++;

    updateOvers();

    addScoreHistory(
        "wicket",
        0
    );

    calculateScore();

}


/* =========================================================
   EXTRAS
   ========================================================= */

function initializeExtraButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-extra]"
        );

    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const extra =
                    button.dataset.extra;

                addExtra(
                    extra
                );

            }
        );

    });

}


/* =========================================================
   ADD EXTRA
   ========================================================= */

function addExtra(
    type
) {

    let runs = 1;

    if (
        type ===
        "wide"
    ) {

        runs = 1;

    }

    if (
        type ===
        "no-ball"
    ) {

        runs = 1;

    }

    if (
        type ===
        "bye"
    ) {

        runs = 1;

    }

    if (
        type ===
        "leg-bye"
    ) {

        runs = 1;

    }

    scoreState.runs +=
        runs;

    scoreState.extras +=
        runs;

    /*
       Wide / No-ball does not
       count as legal delivery.
    */

    if (
        type ===
        "wide" ||
        type ===
        "no-ball"
    ) {

        addScoreHistory(
            type,
            runs
        );

    } else {

        scoreState.balls++;

        updateOvers();

        addScoreHistory(
            type,
            runs
        );

    }

    calculateScore();

}


/* =========================================================
   UPDATE OVERS
   ========================================================= */

function updateOvers() {

    scoreState.overs =
        Math.floor(
            scoreState.balls /
            scoreState.ballsPerOver
        );

}


/* =========================================================
   GET OVERS DISPLAY
   ========================================================= */

function getOversDisplay() {

    const completedOvers =
        Math.floor(
            scoreState.balls /
            scoreState.ballsPerOver
        );

    const balls =
        scoreState.balls %
        scoreState.ballsPerOver;

    return (
        completedOvers +
        "." +
        balls
    );

}


/* =========================================================
   UPDATE SCORE DISPLAY
   ========================================================= */

function calculateScore() {

    const score =
        document.querySelector(
            "#totalScore"
        );

    const wickets =
        document.querySelector(
            "#totalWickets"
        );

    const overs =
        document.querySelector(
            "#totalOvers"
        );

    const extras =
        document.querySelector(
            "#totalExtras"
        );

    if (score) {

        score.textContent =
            scoreState.runs;

    }

    if (wickets) {

        wickets.textContent =
            scoreState.wickets;

    }

    if (overs) {

        overs.textContent =
            getOversDisplay();

    }

    if (extras) {

        extras.textContent =
            scoreState.extras;

    }

    updateRunRate();

    checkTarget();

}


/* =========================================================
   RUN RATE
   ========================================================= */

function updateRunRate() {

    const element =
        document.querySelector(
            "#runRate"
        );

    if (!element) {
        return;
    }

    const balls =
        scoreState.balls;

    if (balls === 0) {

        element.textContent =
            "0.00";

        return;

    }

    const overs =
        balls /
        scoreState.ballsPerOver;

    const runRate =
        scoreState.runs /
        overs;

    element.textContent =
        runRate.toFixed(2);

}


/* =========================================================
   TARGET CHECK
   ========================================================= */

function checkTarget() {

    if (
        !scoreState.target
    ) {

        return;

    }

    const required =
        scoreState.target -
        scoreState.runs;

    const element =
        document.querySelector(
            "#runsRequired"
        );

    if (element) {

        element.textContent =
            Math.max(
                required,
                0
            );

    }

    if (
        scoreState.runs >=
        scoreState.target
    ) {

        showScoreMessage(
            "Target achieved! Innings completed.",
            "success"
        );

    }

}


/* =========================================================
   SET TARGET
   ========================================================= */

function setTarget(
    target
) {

    target =
        parseInt(target);

    if (
        !target ||
        target <= 0
    ) {

        return;

    }

    scoreState.target =
        target;

    checkTarget();

}


/* =========================================================
   SCORE HISTORY
   ========================================================= */

let scoreHistory = [];


function addScoreHistory(
    type,
    value
) {

    scoreHistory.push({

        type: type,

        value: value,

        runs:
            scoreState.runs,

        wickets:
            scoreState.wickets,

        balls:
            scoreState.balls,

        extras:
            scoreState.extras

    });

}


/* =========================================================
   UNDO
   ========================================================= */

function initializeUndoButton() {

    const button =
        document.querySelector(
            "#undoScore"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            undoLastScore();

        }
    );

}


/* =========================================================
   UNDO LAST SCORE
   ========================================================= */

function undoLastScore() {

    if (
        scoreHistory.length ===
        0
    ) {

        showScoreMessage(
            "Nothing to undo.",
            "info"
        );

        return;

    }

    scoreHistory.pop();

    const previous =
        scoreHistory[
            scoreHistory.length - 1
        ];

    if (!previous) {

        scoreState.runs = 0;

        scoreState.wickets = 0;

        scoreState.balls = 0;

        scoreState.extras = 0;

    } else {

        scoreState.runs =
            previous.runs;

        scoreState.wickets =
            previous.wickets;

        scoreState.balls =
            previous.balls;

        scoreState.extras =
            previous.extras;

    }

    updateOvers();

    calculateScore();

}


/* =========================================================
   SAVE SCORE
   ========================================================= */

function initializeScoreSaveButton() {

    const button =
        document.querySelector(
            "#saveScore"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            saveScore();

        }
    );

}


/* =========================================================
   SAVE SCORE
   ========================================================= */

function saveScore() {

    const scoreData = {

        runs:
            scoreState.runs,

        wickets:
            scoreState.wickets,

        overs:
            getOversDisplay(),

        balls:
            scoreState.balls,

        extras:
            scoreState.extras,

        innings:
            scoreState.innings

    };

    /*
       Backend later connect pannalam.

       Example:
       POST /api/score/save
    */

    console.log(
        "TurfX Score:",
        scoreData
    );

    showScoreMessage(
        "Score saved successfully.",
        "success"
    );

}


/* =========================================================
   INNINGS CONTROLS
   ========================================================= */

function initializeInningsControls() {

    const button =
        document.querySelector(
            "#nextInnings"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            startNextInnings();

        }
    );

}


/* =========================================================
   START NEXT INNINGS
   ========================================================= */

function startNextInnings() {

    scoreState.innings++;

    scoreState.runs = 0;

    scoreState.wickets = 0;

    scoreState.balls = 0;

    scoreState.extras = 0;

    scoreHistory = [];

    calculateScore();

    showScoreMessage(
        "New innings started.",
        "success"
    );

}


/* =========================================================
   RESET SCORE
   ========================================================= */

function resetScore() {

    const confirmed =
        window.confirm(
            "Reset the current score?"
        );

    if (!confirmed) {
        return;
    }

    scoreState.runs = 0;

    scoreState.wickets = 0;

    scoreState.balls = 0;

    scoreState.overs = 0;

    scoreState.extras = 0;

    scoreHistory = [];

    calculateScore();

}


/* =========================================================
   SCORE MESSAGE
   ========================================================= */

function showScoreMessage(
    message,
    type = "info"
) {

    let messageBox =
        document.querySelector(
            ".score-message"
        );

    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );

        messageBox.className =
            "score-message";

        document.body.appendChild(
            messageBox
        );

    }

    messageBox.textContent =
        message;

    messageBox.dataset.type =
        type;

    messageBox.classList.add(
        "show"
    );

    setTimeout(
        function () {

            messageBox.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =========================================================
   EXPORT SCORE DATA
   ========================================================= */

function getScoreData() {

    return {

        runs:
            scoreState.runs,

        wickets:
            scoreState.wickets,

        overs:
            getOversDisplay(),

        balls:
            scoreState.balls,

        extras:
            scoreState.extras,

        innings:
            scoreState.innings,

        target:
            scoreState.target

    };

}


/* =========================================================
   TURFX SCORE JS LOADED
   ========================================================= */

console.log(
    "TurfX Score JS loaded successfully."
);