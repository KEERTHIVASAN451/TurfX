/* =========================================================
   TurfX - Main JavaScript
   File: static/js/script.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTurfX();
        initializeLandingPage();
        initializeLandingNavbar();
        initializeLoginParallax();

    }
);


/* =========================================================
   INITIALIZE TURFX
   ========================================================= */

function initializeTurfX() {

    initializeMobileMenu();
    initializeDropdowns();
    initializeModals();
    initializeTabs();
    initializePasswordToggle();
    initializeConfirmButtons();
    initializeAutoHideAlerts();
    initializeScrollTop();
    initializeSearch();
    initializeForms();

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuButton =
        document.querySelector(
            "#menuToggle"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "active"
            );

        }
    );

}


/* =========================================================
   DROPDOWN
   ========================================================= */

function initializeDropdowns() {

    const dropdownButtons =
        document.querySelectorAll(
            "[data-dropdown]"
        );


    dropdownButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const target =
                        document.querySelector(
                            button.dataset.dropdown
                        );


                    if (!target) {
                        return;
                    }


                    target.classList.toggle(
                        "show"
                    );

                }
            );

        }
    );


    document.addEventListener(
        "click",
        function () {

            document
                .querySelectorAll(
                    ".dropdown-menu.show"
                )
                .forEach(
                    function (menu) {

                        menu.classList.remove(
                            "show"
                        );

                    }
                );

        }
    );

}


/* =========================================================
   MODALS
   ========================================================= */

function initializeModals() {

    const openButtons =
        document.querySelectorAll(
            "[data-modal-open]"
        );


    openButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const modal =
                        document.querySelector(
                            button.dataset.modalOpen
                        );


                    if (modal) {

                        modal.classList.add(
                            "show"
                        );

                    }

                }
            );

        }
    );


    const closeButtons =
        document.querySelectorAll(
            "[data-modal-close]"
        );


    closeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const modal =
                        button.closest(
                            ".modal"
                        );


                    if (modal) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {

                event.target.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   TABS
   ========================================================= */

function initializeTabs() {

    const tabButtons =
        document.querySelectorAll(
            "[data-tab]"
        );


    tabButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const tabName =
                        button.dataset.tab;


                    const group =
                        button.dataset.tabGroup ||
                        "default";


                    document
                        .querySelectorAll(
                            `[data-tab-group="${group}"]`
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            `[data-tab-content="${tabName}"]`
                        )
                        .forEach(
                            function (content) {

                                content.classList.add(
                                    "active"
                                );

                            }
                        );

                }
            );

        }
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function initializePasswordToggle() {

    const buttons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        document.querySelector(
                            button.dataset.passwordToggle
                        );


                    if (!target) {
                        return;
                    }


                    if (
                        target.type ===
                        "password"
                    ) {

                        target.type =
                            "text";

                        button.textContent =
                            "Hide";

                    } else {

                        target.type =
                            "password";

                        button.textContent =
                            "Show";

                    }

                }
            );

        }
    );

}


/* =========================================================
   CONFIRM BUTTONS
   ========================================================= */

function initializeConfirmButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-confirm]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    const message =
                        button.dataset.confirm ||
                        "Are you sure?";


                    const confirmed =
                        window.confirm(
                            message
                        );


                    if (!confirmed) {

                        event.preventDefault();

                    }

                }
            );

        }
    );

}


/* =========================================================
   AUTO HIDE ALERTS
   ========================================================= */

function initializeAutoHideAlerts() {

    const alerts =
        document.querySelectorAll(
            ".alert[data-auto-hide]"
        );


    alerts.forEach(
        function (alert) {

            setTimeout(
                function () {

                    alert.classList.add(
                        "hide"
                    );

                },
                4000
            );

        }
    );

}


/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function initializeScrollTop() {

    const button =
        document.querySelector(
            "#scrollTop"
        );


    if (!button) {
        return;
    }


    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY >
                300
            ) {

                button.classList.add(
                    "show"
                );

            } else {

                button.classList.remove(
                    "show"
                );

            }

        }
    );


    button.addEventListener(
        "click",
        function () {

            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    const searchInputs =
        document.querySelectorAll(
            "[data-search]"
        );


    searchInputs.forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    const query =
                        input.value
                            .toLowerCase()
                            .trim();


                    const targetSelector =
                        input.dataset.search;


                    const items =
                        document.querySelectorAll(
                            targetSelector
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
    );

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

function initializeForms() {

    const forms =
        document.querySelectorAll(
            "form[data-loading]"
        );


    forms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function () {

                    const button =
                        form.querySelector(
                            'button[type="submit"]'
                        );


                    if (!button) {
                        return;
                    }


                    button.disabled =
                        true;


                    button.dataset.originalText =
                        button.textContent;


                    button.textContent =
                        "Please wait...";

                }
            );

        }
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoader() {

    const loader =
        document.querySelector(
            "#pageLoader"
        );


    if (loader) {

        loader.classList.add(
            "show"
        );

    }

}


function hideLoader() {

    const loader =
        document.querySelector(
            "#pageLoader"
        );


    if (loader) {

        loader.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   GLOBAL MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "info"
) {

    let container =
        document.querySelector(
            "#globalMessage"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "globalMessage";


        document.body.appendChild(
            container
        );

    }


    container.textContent =
        message;


    container.dataset.type =
        type;


    container.classList.add(
        "show"
    );


    setTimeout(
        function () {

            container.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {

    return "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        );

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return date;

    }


    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   TIME FORMAT
   ========================================================= */

function formatTime(
    date
) {

    if (!date) {
        return "";
    }


    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return date;

    }


    return value.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay = 300
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                function () {

                    callback(
                        ...args
                    );

                },
                delay
            );

    };

}


/* =========================================================
   COPY TO CLIPBOARD
   ========================================================= */

function copyToClipboard(
    text
) {

    if (!text) {
        return;
    }


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)
            .then(
                function () {

                    showMessage(
                        "Copied successfully.",
                        "success"
                    );

                }
            )
            .catch(
                function () {

                    showMessage(
                        "Unable to copy.",
                        "error"
                    );

                }
            );

        return;
    }


    showMessage(
        "Clipboard access unavailable.",
        "error"
    );

}


/* =========================================================
   TOGGLE ELEMENT
   ========================================================= */

function toggleElement(
    selector
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.classList.toggle(
        "show"
    );

}


/* =========================================================
   AJAX / FETCH HELPER
   ========================================================= */

async function sendRequest(
    url,
    options = {}
) {

    try {

        const response =
            await fetch(
                url,
                {
                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    ...options
                }
            );


        if (!response.ok) {

            throw new Error(
                "Request failed."
            );

        }


        return await response.json();

    } catch (error) {

        console.error(
            "TurfX Request Error:",
            error
        );


        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );


        return null;

    }

}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function goTo(
    url
) {

    if (!url) {
        return;
    }


    window.location.href =
        url;

}


/* =========================================================
   LOGOUT CONFIRMATION
   ========================================================= */

function confirmLogout(
    url
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );


    if (confirmed) {

        window.location.href =
            url || "/logout";

    }

}


/* =========================================================
   TURFX LANDING PAGE
   ========================================================= */

function initializeLandingPage() {

    const introScreen =
        document.querySelector(
            "#introScreen"
        );

    const videoScreen =
        document.querySelector(
            "#videoScreen"
        );

    const mainSite =
        document.querySelector(
            "#mainSite"
        );

    const playButton =
        document.querySelector(
            "#letsPlayButton"
        );

    const introVideo =
        document.querySelector(
            "#introVideo"
        );


    if (
        !introScreen ||
        !videoScreen ||
        !mainSite ||
        !playButton ||
        !introVideo
    ) {

        return;

    }


    const introSeen =
        sessionStorage.getItem(
            "turfxIntroSeen"
        );


    if (
        introSeen === "true"
    ) {

        revealMainSite();

        return;

    }


    document.body.style.overflow =
        "hidden";


    playButton.addEventListener(
        "click",
        function () {

            startTurfXExperience(
                introScreen,
                videoScreen,
                mainSite,
                introVideo
            );

        }
    );

}


function startTurfXExperience(
    introScreen,
    videoScreen,
    mainSite,
    introVideo
) {

    sessionStorage.setItem(
        "turfxIntroSeen",
        "true"
    );


    introScreen.classList.add(
        "hide"
    );


    setTimeout(
        function () {

            videoScreen.classList.add(
                "show"
            );


            try {

                const playPromise =
                    introVideo.play();


                if (
                    playPromise &&
                    typeof playPromise.then ===
                    "function"
                ) {

                    playPromise.catch(
                        function (error) {

                            console.error(
                                "Video playback issue:",
                                error
                            );


                            revealMainSite();

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Video error:",
                    error
                );


                revealMainSite();

            }


            setTimeout(
                function () {

                    revealMainSite();


                    videoScreen.classList.remove(
                        "show"
                    );


                    try {

                        introVideo.pause();

                        introVideo.currentTime =
                            0;

                    } catch (error) {

                        console.log(
                            "Video cleanup:",
                            error
                        );

                    }

                },
                2000
            );

        },
        450
    );

}


function revealMainSite() {

    const introScreen =
        document.querySelector(
            "#introScreen"
        );

    const videoScreen =
        document.querySelector(
            "#videoScreen"
        );

    const mainSite =
        document.querySelector(
            "#mainSite"
        );


    if (introScreen) {

        introScreen.classList.add(
            "hide"
        );

    }


    if (videoScreen) {

        videoScreen.classList.remove(
            "show"
        );

    }


    if (mainSite) {

        mainSite.classList.add(
            "show"
        );

    }


    document.body.style.overflow =
        "auto";

}


/* =========================================================
   LANDING NAVBAR SCROLL
   ========================================================= */

function initializeLandingNavbar() {

    const navbar =
        document.querySelector(
            ".home-navbar"
        );


    if (!navbar) {
        return;
    }


    function updateNavbar() {

        if (
            window.scrollY > 40
        ) {

            navbar.style.background =
                "rgba(2, 6, 23, .92)";

        } else {

            navbar.style.background =
                "rgba(2, 6, 23, .65)";

        }

    }


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );


    updateNavbar();

}


/* =========================================================
   LOGIN - CINEMATIC LEFT PARALLAX
   ========================================================= */

function initializeLoginParallax() {

    const showcase =
        document.querySelector(
            ".login-showcase"
        );


    if (!showcase) {
        return;
    }


    const photo =
        showcase.querySelector(
            ".login-parallax-photo"
        );

    const glow =
        showcase.querySelector(
            ".login-parallax-glow"
        );

    const copy =
        showcase.querySelector(
            ".login-showcase-copy"
        );

    const brand =
        showcase.querySelector(
            ".login-brand"
        );


    if (!photo) {
        return;
    }


    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;


    function animateParallax() {

        currentX +=
            (targetX - currentX) * 0.06;


        currentY +=
            (targetY - currentY) * 0.06;


        photo.style.transform =
            `translate3d(
                ${currentX}px,
                ${currentY}px,
                0
            ) scale(1.10)`;


        if (glow) {

            glow.style.transform =
                `translate3d(
                    ${currentX * -0.65}px,
                    ${currentY * -0.65}px,
                    0
                )`;

        }


        if (copy) {

            copy.style.transform =
                `translate3d(
                    ${currentX * 0.07}px,
                    ${currentY * 0.07}px,
                    0
                )`;

        }


        if (brand) {

            brand.style.transform =
                `translate3d(
                    ${currentX * 0.03}px,
                    ${currentY * 0.03}px,
                    0
                )`;

        }


        requestAnimationFrame(
            animateParallax
        );

    }


    function resetParallax() {

        targetX = 0;
        targetY = 0;

    }


    showcase.addEventListener(
        "mousemove",
        function (event) {

            if (
                window.innerWidth <= 900
            ) {

                return;

            }


            const rect =
                showcase.getBoundingClientRect();


            const x =
                (
                    event.clientX -
                    rect.left
                ) / rect.width;


            const y =
                (
                    event.clientY -
                    rect.top
                ) / rect.height;


            targetX =
                (x - 0.5) * 12;


            targetY =
                (y - 0.5) * 8;

        }
    );


    showcase.addEventListener(
        "mouseleave",
        resetParallax
    );


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth <= 900
            ) {

                resetParallax();

            }

        }
    );


    animateParallax();

}


/* =========================================================
   TURFX READY
   ========================================================= */

console.log(
    "TurfX Main JS loaded successfully."
);



/* =========================================================
   TURFX - WELCOME SUCCESS CELEBRATION
   ========================================================= */

function showTurfXWelcome() {

    if (
        document.querySelector(
            "#turfWelcomeOverlay"
        )
    ) {
        return;
    }


    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "turfWelcomeOverlay";


    overlay.innerHTML = `

        <div class="welcome-particles"></div>

        <div class="welcome-content">

            <span class="welcome-mini">
                WELCOME TO
            </span>

            <h1>
                WELCOME
            </h1>

            <p>
                Your TurfX journey starts here.
            </p>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    createWelcomeConfetti();


    document.body.style.overflow =
        "hidden";


    requestAnimationFrame(
        function () {

            overlay.classList.add(
                "active"
            );

        }
    );


    setTimeout(
        function () {

            overlay.classList.add(
                "exit"
            );


            setTimeout(
                function () {

                    overlay.remove();

                    document.body.style.overflow =
                        "auto";

                },
                700
            );

        },
        2200
    );

}


function createWelcomeConfetti() {

    const container =
        document.querySelector(
            "#turfWelcomeOverlay .welcome-particles"
        );


    if (!container) {
        return;
    }


    const symbols = [
        "✦",
        "✧",
        "◆",
        "◇",
        "●",
        "★"
    ];


    for (
        let i = 0;
        i < 42;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "welcome-confetti";


        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.setProperty(
            "--x",
            `${(Math.random() - .5) * 280}px`
        );


        particle.style.setProperty(
            "--delay",
            `${Math.random() * .35}s`
        );


        particle.style.setProperty(
            "--duration",
            `${1.5 + Math.random() * 1.7}s`
        );


        container.appendChild(
            particle
        );

    }

}


/* =========================================================
   AUTO SHOW AFTER REGISTRATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const welcomeFlag =
            sessionStorage.getItem(
                "turfxWelcome"
            );


        if (
            welcomeFlag === "true"
        ) {

            sessionStorage.removeItem(
                "turfxWelcome"
            );


            setTimeout(
                function () {

                    showTurfXWelcome();

                },
                100
            );

        }

    }
);

/* =========================================================
   TURFX - LOGIN SUCCESS WELCOME
   ========================================================= */

function showTurfXWelcome() {

    if (
        document.querySelector(
            "#turfWelcomeOverlay"
        )
    ) {
        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "turfWelcomeOverlay";


    overlay.innerHTML = `

        <div class="welcome-particles"></div>

        <div class="welcome-content">

            <span class="welcome-mini">
                WELCOME TO
            </span>

            <h1>
                WELCOME
            </h1>

            <p>
                Welcome to your TurfX experience.
            </p>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    createWelcomeConfetti();


    document.body.style.overflow =
        "hidden";


    requestAnimationFrame(
        function () {

            overlay.classList.add(
                "active"
            );

        }
    );


    setTimeout(
        function () {

            overlay.classList.add(
                "exit"
            );


            setTimeout(
                function () {

                    overlay.remove();

                    document.body.style.overflow =
                        "auto";

                },
                700
            );

        },
        2200
    );

}


/* =========================================================
   CREATE CONFETTI
   ========================================================= */

function createWelcomeConfetti() {

    const container =
        document.querySelector(
            "#turfWelcomeOverlay .welcome-particles"
        );


    if (!container) {
        return;
    }


    const symbols = [
        "✦",
        "✧",
        "◆",
        "◇",
        "★",
        "●"
    ];


    const colors = [
        "#60a5fa",
        "#38bdf8",
        "#4ade80",
        "#a78bfa",
        "#fbbf24",
        "#f472b6"
    ];


    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "welcome-confetti";


        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        particle.style.setProperty(
            "--x",
            `${(Math.random() - 0.5) * 420}px`
        );


        particle.style.setProperty(
            "--duration",
            `${1.4 + Math.random() * 1.8}s`
        );


        particle.style.setProperty(
            "--delay",
            `${Math.random() * 0.5}s`
        );


        container.appendChild(
            particle
        );

    }

}


/* =========================================================
   CHECK LOGIN SUCCESS
   ========================================================= */

function initializeWelcomeAnimation() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const welcome =
        params.get(
            "welcome"
        );


    if (
        welcome !== "1"
    ) {
        return;
    }


    /*
       Remove ?welcome=1 from
       browser URL.
    */

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );


    setTimeout(
        function () {

            showTurfXWelcome();

        },
        120
    );

}


/* =========================================================
   INITIALIZE WELCOME
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeWelcomeAnimation();

    }
);