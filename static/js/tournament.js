/* =========================================================
   TurfX - Tournament JavaScript
   File: static/js/tournament.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeTournament();

});


/* =========================================================
   INITIALIZE TOURNAMENT
   ========================================================= */

function initializeTournament() {

    initializeTournamentForm();
    initializeTeamRegistration();
    initializeTeamSelection();
    initializeFixtureControls();
    initializePointsTable();
    initializePlayingXI();
    initializeToss();
    initializeTournamentFilters();
    initializeTournamentTabs();

}


/* =========================================================
   TOURNAMENT FORM
   ========================================================= */

function initializeTournamentForm() {

    const form =
        document.querySelector(
            "#tournamentForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            const name =
                document.querySelector(
                    "#tournamentName"
                )?.value.trim();

            const startDate =
                document.querySelector(
                    "#startDate"
                )?.value;

            const endDate =
                document.querySelector(
                    "#endDate"
                )?.value;

            if (!name) {

                event.preventDefault();

                showTournamentMessage(
                    "Tournament name is required.",
                    "error"
                );

                return;

            }

            if (
                startDate &&
                endDate &&
                endDate < startDate
            ) {

                event.preventDefault();

                showTournamentMessage(
                    "End date cannot be before start date.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   TEAM REGISTRATION
   ========================================================= */

function initializeTeamRegistration() {

    const button =
        document.querySelector(
            "#registerTeam"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            registerTeam();

        }
    );

}


/* =========================================================
   REGISTER TEAM
   ========================================================= */

function registerTeam() {

    const teamName =
        document.querySelector(
            "#teamName"
        )?.value.trim();

    if (!teamName) {

        showTournamentMessage(
            "Enter team name.",
            "error"
        );

        return;

    }

    /*
       Backend later connect pannalam.

       Example:
       POST /tournament/register
    */

    showTournamentMessage(
        "Team registered successfully.",
        "success"
    );

}


/* =========================================================
   TEAM SELECTION
   ========================================================= */

function initializeTeamSelection() {

    const checkboxes =
        document.querySelectorAll(
            ".team-checkbox"
        );

    const selectedCount =
        document.querySelector(
            "#selectedTeamCount"
        );

    checkboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                function () {

                    const selected =
                        document.querySelectorAll(
                            ".team-checkbox:checked"
                        );

                    if (selectedCount) {

                        selectedCount.textContent =
                            selected.length;

                    }

                }
            );

        }
    );

}


/* =========================================================
   SELECT ALL TEAMS
   ========================================================= */

function selectAllTeams() {

    const checkboxes =
        document.querySelectorAll(
            ".team-checkbox"
        );

    checkboxes.forEach(
        function (checkbox) {

            checkbox.checked =
                true;

        }
    );

    updateSelectedTeamCount();

}


/* =========================================================
   DESELECT ALL TEAMS
   ========================================================= */

function deselectAllTeams() {

    const checkboxes =
        document.querySelectorAll(
            ".team-checkbox"
        );

    checkboxes.forEach(
        function (checkbox) {

            checkbox.checked =
                false;

        }
    );

    updateSelectedTeamCount();

}


/* =========================================================
   UPDATE TEAM COUNT
   ========================================================= */

function updateSelectedTeamCount() {

    const selected =
        document.querySelectorAll(
            ".team-checkbox:checked"
        );

    const counter =
        document.querySelector(
            "#selectedTeamCount"
        );

    if (counter) {

        counter.textContent =
            selected.length;

    }

}


/* =========================================================
   FIXTURE CONTROLS
   ========================================================= */

function initializeFixtureControls() {

    const generateButton =
        document.querySelector(
            "#generateFixtures"
        );

    if (!generateButton) {
        return;
    }

    generateButton.addEventListener(
        "click",
        function () {

            generateFixtures();

        }
    );

}


/* =========================================================
   GENERATE FIXTURES
   ========================================================= */

function generateFixtures() {

    const teams =
        Array.from(
            document.querySelectorAll(
                ".team-checkbox:checked"
            )
        ).map(
            function (checkbox) {

                return (
                    checkbox.dataset.team ||
                    checkbox.value
                );

            }
        );

    if (teams.length < 2) {

        showTournamentMessage(
            "At least 2 teams are required.",
            "error"
        );

        return;

    }

    const fixtures =
        [];

    for (
        let i = 0;
        i < teams.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < teams.length;
            j++
        ) {

            fixtures.push({

                team1:
                    teams[i],

                team2:
                    teams[j]

            });

        }

    }

    displayFixtures(
        fixtures
    );

}


/* =========================================================
   DISPLAY FIXTURES
   ========================================================= */

function displayFixtures(
    fixtures
) {

    const container =
        document.querySelector(
            "#fixtureList"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    fixtures.forEach(
        function (fixture, index) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "fixture-item";

            item.innerHTML = `

                <span>
                    Match ${index + 1}
                </span>

                <strong>
                    ${escapeTournamentText(fixture.team1)}
                </strong>

                <span>
                    VS
                </span>

                <strong>
                    ${escapeTournamentText(fixture.team2)}
                </strong>

            `;

            container.appendChild(
                item
            );

        }
    );

    showTournamentMessage(
        fixtures.length +
        " fixtures generated.",
        "success"
    );

}


/* =========================================================
   POINTS TABLE
   ========================================================= */

function initializePointsTable() {

    const rows =
        document.querySelectorAll(
            ".points-row"
        );

    rows.forEach(
        function (row) {

            calculateTeamPoints(
                row
            );

        }
    );

}


/* =========================================================
   CALCULATE TEAM POINTS
   ========================================================= */

function calculateTeamPoints(
    row
) {

    const wins =
        parseInt(
            row.dataset.wins
        ) || 0;

    const draws =
        parseInt(
            row.dataset.draws
        ) || 0;

    const losses =
        parseInt(
            row.dataset.losses
        ) || 0;

    const points =
        wins * 2 +
        draws;

    const played =
        wins +
        draws +
        losses;

    const playedElement =
        row.querySelector(
            ".played"
        );

    const pointsElement =
        row.querySelector(
            ".points"
        );

    if (playedElement) {

        playedElement.textContent =
            played;

    }

    if (pointsElement) {

        pointsElement.textContent =
            points;

    }

}


/* =========================================================
   SORT POINTS TABLE
   ========================================================= */

function sortPointsTable() {

    const table =
        document.querySelector(
            "#pointsTable"
        );

    if (!table) {
        return;
    }

    const tbody =
        table.querySelector(
            "tbody"
        );

    if (!tbody) {
        return;
    }

    const rows =
        Array.from(
            tbody.querySelectorAll(
                "tr"
            )
        );

    rows.sort(
        function (a, b) {

            const pointsA =
                parseInt(
                    a.querySelector(
                        ".points"
                    )?.textContent
                ) || 0;

            const pointsB =
                parseInt(
                    b.querySelector(
                        ".points"
                    )?.textContent
                ) || 0;

            return (
                pointsB -
                pointsA
            );

        }
    );

    rows.forEach(
        function (row, index) {

            tbody.appendChild(
                row
            );

            const position =
                row.querySelector(
                    ".position"
                );

            if (position) {

                position.textContent =
                    index + 1;

            }

        }
    );

}


/* =========================================================
   PLAYING XI
   ========================================================= */

function initializePlayingXI() {

    const players =
        document.querySelectorAll(
            ".player-checkbox"
        );

    const counter =
        document.querySelector(
            "#playingXICount"
        );

    players.forEach(
        function (player) {

            player.addEventListener(
                "change",
                function () {

                    const selected =
                        document.querySelectorAll(
                            ".player-checkbox:checked"
                        );

                    if (
                        selected.length >
                        11
                    ) {

                        player.checked =
                            false;

                        showTournamentMessage(
                            "Playing XI can contain only 11 players.",
                            "error"
                        );

                    }

                    if (counter) {

                        counter.textContent =
                            document.querySelectorAll(
                                ".player-checkbox:checked"
                            ).length;

                    }

                }
            );

        }
    );

}


/* =========================================================
   SAVE PLAYING XI
   ========================================================= */

function savePlayingXI() {

    const players =
        Array.from(
            document.querySelectorAll(
                ".player-checkbox:checked"
            )
        ).map(
            function (player) {

                return (
                    player.dataset.player ||
                    player.value
                );

            }
        );

    if (
        players.length !==
        11
    ) {

        showTournamentMessage(
            "Select exactly 11 players.",
            "error"
        );

        return;

    }

    /*
       Backend later connect pannalam.

       Example:
       POST /tournament/playing-xi
    */

    showTournamentMessage(
        "Playing XI saved successfully.",
        "success"
    );

}


/* =========================================================
   TOSS
   ========================================================= */

function initializeToss() {

    const buttons =
        document.querySelectorAll(
            "[data-toss]"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const choice =
                        button.dataset.toss;

                    handleToss(
                        choice
                    );

                }
            );

        }
    );

}


/* =========================================================
   HANDLE TOSS
   ========================================================= */

function handleToss(
    choice
) {

    const result =
        document.querySelector(
            "#tossResult"
        );

    if (!result) {
        return;
    }

    result.textContent =
        "Toss: " +
        choice;

}


/* =========================================================
   TOURNAMENT FILTER
   ========================================================= */

function initializeTournamentFilters() {

    const search =
        document.querySelector(
            "#tournamentSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        function () {

            const query =
                search.value
                    .toLowerCase()
                    .trim();

            const items =
                document.querySelectorAll(
                    ".tournament-item"
                );

            items.forEach(
                function (item) {

                    const text =
                        item.textContent
                            .toLowerCase();

                    item.style.display =
                        text.includes(
                            query
                        )
                            ? ""
                            : "none";

                }
            );

        }
    );

}


/* =========================================================
   TOURNAMENT TABS
   ========================================================= */

function initializeTournamentTabs() {

    const buttons =
        document.querySelectorAll(
            "[data-tournament-tab]"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset
                            .tournamentTab;

                    document
                        .querySelectorAll(
                            ".tournament-tab"
                        )
                        .forEach(
                            function (tab) {

                                tab.classList.remove(
                                    "active"
                                );

                            }
                        );

                    document
                        .querySelectorAll(
                            ".tournament-tab-content"
                        )
                        .forEach(
                            function (content) {

                                content.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    const content =
                        document.querySelector(
                            target
                        );

                    if (content) {

                        content.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   TOURNAMENT STATUS
   ========================================================= */

function updateTournamentStatus(
    status
) {

    const element =
        document.querySelector(
            "#tournamentStatus"
        );

    if (!element) {
        return;
    }

    element.textContent =
        status;

    element.dataset.status =
        status
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startTournamentCountdown(
    targetDate
) {

    const element =
        document.querySelector(
            "#tournamentCountdown"
        );

    if (!element) {
        return;
    }

    const target =
        new Date(
            targetDate
        ).getTime();

    if (
        Number.isNaN(target)
    ) {

        return;

    }

    const timer =
        setInterval(
            function () {

                const now =
                    new Date().getTime();

                const distance =
                    target -
                    now;

                if (
                    distance <=
                    0
                ) {

                    clearInterval(
                        timer
                    );

                    element.textContent =
                        "Tournament Started";

                    return;

                }

                const days =
                    Math.floor(
                        distance /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );

                const hours =
                    Math.floor(
                        (
                            distance %
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        ) /
                        (
                            1000 *
                            60 *
                            60
                        )
                    );

                const minutes =
                    Math.floor(
                        (
                            distance %
                            (
                                1000 *
                                60 *
                                60
                            )
                        ) /
                        (
                            1000 *
                            60
                        )
                    );

                const seconds =
                    Math.floor(
                        (
                            distance %
                            (
                                1000 *
                                60
                            )
                        ) /
                        1000
                    );

                element.textContent =
                    days +
                    "d " +
                    hours +
                    "h " +
                    minutes +
                    "m " +
                    seconds +
                    "s";

            },
            1000
        );

}


/* =========================================================
   DELETE TOURNAMENT
   ========================================================= */

function deleteTournament(
    tournamentId
) {

    if (!tournamentId) {
        return;
    }

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this tournament?"
        );

    if (!confirmed) {
        return;
    }

    /*
       Backend later connect pannalam.

       Example:
       DELETE /tournament/<id>
    */

    showTournamentMessage(
        "Tournament deletion requested.",
        "success"
    );

}


/* =========================================================
   ESCAPE TEXT
   ========================================================= */

function escapeTournamentText(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* =========================================================
   TOURNAMENT MESSAGE
   ========================================================= */

function showTournamentMessage(
    message,
    type = "info"
) {

    let box =
        document.querySelector(
            ".tournament-message"
        );

    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.className =
            "tournament-message";

        document.body.appendChild(
            box
        );

    }

    box.textContent =
        message;

    box.dataset.type =
        type;

    box.classList.add(
        "show"
    );

    setTimeout(
        function () {

            box.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =========================================================
   TURFX TOURNAMENT JS LOADED
   ========================================================= */

console.log(
    "TurfX Tournament JS loaded successfully."
);
