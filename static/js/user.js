/* =========================================================
   TurfX - User JavaScript
   File: static/js/user.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeUser();
});


/* =========================================================
   MAIN INITIALIZER
   ========================================================= */

function initializeUser() {

    initializeTurfSearch();
    initializeTurfFilters();
    initializeSlotSelection();
    initializeBookingForm();
    initializeEquipment();
    initializeProfile();
    initializeNotifications();
    initializeSettings();
    initializeTeamActions();

    setMinimumBookingDate();
    updateBookingSummary();

    initializeEquipmentSearch();
    initializeTeamSearch();
    initializeTeamLogoPreview();
    initializeProfilePhotoPreview();

    initializeUserAppearance();
}


/* =========================================================
   TURF SEARCH
   ========================================================= */

function initializeTurfSearch() {

    const searchInput =
        document.querySelector("#turfSearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {
            filterTurfs();
        }
    );
}


function filterTurfs() {

    const searchInput =
        document.querySelector("#turfSearch");

    const locationInput =
        document.querySelector("#locationFilter");

    const query =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const selectedLocation =
        locationInput
            ? locationInput.value.toLowerCase()
            : "";


    const cards =
        document.querySelectorAll(
            ".turf-card, .turf-result-card"
        );


    cards.forEach(function (card) {

        const text =
            card.textContent.toLowerCase();

        const location =
            (
                card.dataset.location ||
                ""
            ).toLowerCase();


        const matchesSearch =
            !query ||
            text.includes(query);

        const matchesLocation =
            !selectedLocation ||
            location === selectedLocation;


        card.style.display =
            matchesSearch && matchesLocation
                ? ""
                : "none";

    });
}


/* =========================================================
   TURF FILTERS
   ========================================================= */

function initializeTurfFilters() {

    const filterButtons =
        document.querySelectorAll(
            "[data-turf-filter]"
        );

    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const filter =
                    (
                        button.dataset.turfFilter ||
                        "all"
                    ).toLowerCase();


                filterButtons.forEach(
                    function (item) {
                        item.classList.remove("active");
                    }
                );

                button.classList.add("active");


                const cards =
                    document.querySelectorAll(
                        ".turf-card, .turf-result-card"
                    );


                cards.forEach(function (card) {

                    if (filter === "all") {

                        card.style.display = "";

                        return;
                    }


                    const category =
                        (
                            card.dataset.category ||
                            ""
                        ).toLowerCase();


                    card.style.display =
                        category.includes(filter)
                            ? ""
                            : "none";

                });

            }
        );

    });
}


/* =========================================================
   SLOT SELECTION
   ========================================================= */

function initializeSlotSelection() {

    const slots =
        document.querySelectorAll(
            ".slot, .detail-slot"
        );

    if (!slots.length) {
        return;
    }


    const selectedSlot =
        document.querySelector(
            "#selectedSlot"
        );

    const bookingPrice =
        document.querySelector(
            "#bookingPrice"
        );

    const slotPrice =
        document.querySelector(
            "#slotPrice"
        );


    slots.forEach(function (slot) {

        if (slot.disabled) {
            return;
        }


        slot.addEventListener(
            "click",
            function () {

                if (
                    slot.classList.contains(
                        "booked"
                    )
                ) {
                    return;
                }


                slots.forEach(function (item) {

                    item.classList.remove(
                        "selected"
                    );

                });


                slot.classList.add(
                    "selected"
                );


                const slotValue =
                    slot.dataset.slotId ||
                    slot.dataset.slot ||
                    slot.textContent.trim();


                const price =
                    parseFloat(
                        slot.dataset.price || "0"
                    ) || 0;


                if (selectedSlot) {

                    selectedSlot.value =
                        slotValue;

                }


                if (slotPrice) {

                    slotPrice.value =
                        price;

                }


                if (bookingPrice) {

                    bookingPrice.textContent =
                        formatUserCurrency(price);

                }


                updateBookingSummary();

            }
        );

    });
}


/* =========================================================
   BOOKING FORM
   ========================================================= */

function initializeBookingForm() {

    const form =
        document.querySelector(
            "#bookingForm"
        );

    if (!form) {
        return;
    }


    const dateInput =
        document.querySelector(
            "#bookingDate"
        );


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            function () {

                updateBookingSummary();

            }
        );

    }


    form.addEventListener(
        "submit",
        function (event) {

            const date =
                document.querySelector(
                    "#bookingDate"
                )?.value || "";


            const slot =
                document.querySelector(
                    "#selectedSlot"
                )?.value || "";


            if (!date) {

                event.preventDefault();

                showUserMessage(
                    "Please select a booking date.",
                    "error"
                );

                return;
            }


            if (!slot) {

                event.preventDefault();

                showUserMessage(
                    "Please select a time slot.",
                    "error"
                );

                return;
            }

        }
    );
}


/* =========================================================
   BOOKING DATE
   ========================================================= */

function setMinimumBookingDate() {

    const dateInput =
        document.querySelector(
            "#bookingDate"
        );

    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.min =
        `${year}-${month}-${day}`;
}


/* =========================================================
   BOOKING SUMMARY
   ========================================================= */

function updateBookingSummary() {

    const date =
        document.querySelector(
            "#bookingDate"
        )?.value || "";


    const selectedSlot =
        document.querySelector(
            "#selectedSlot"
        )?.value || "";


    const selectedDetailSlot =
        document.querySelector(
            ".detail-slot.selected"
        );


    const dateDisplay =
        document.querySelector(
            "#summaryDate"
        );


    const slotDisplay =
        document.querySelector(
            "#summarySlot"
        );


    const bookingSlotDisplay =
        document.querySelector(
            "#bookingSlotDisplay"
        );


    if (dateDisplay) {

        dateDisplay.textContent =
            date || "Select date";

    }


    if (slotDisplay) {

        if (selectedDetailSlot) {

            const start =
                selectedDetailSlot.dataset.start ||
                "";

            const end =
                selectedDetailSlot.dataset.end ||
                "";

            slotDisplay.textContent =
                start && end
                    ? `${start} - ${end}`
                    : selectedSlot || "Not selected";

        } else {

            slotDisplay.textContent =
                selectedSlot || "Not selected";

        }

    }


    if (bookingSlotDisplay && selectedDetailSlot) {

        const start =
            selectedDetailSlot.dataset.start ||
            "";

        const end =
            selectedDetailSlot.dataset.end ||
            "";


        if (start && end) {

            bookingSlotDisplay.textContent =
                `${start} - ${end}`;

        }

    }
}


/* =========================================================
   EQUIPMENT
   ========================================================= */

function initializeEquipment() {

    const items =
        document.querySelectorAll(
            ".equipment-item, .booking-equipment-item"
        );


    if (!items.length) {
        return;
    }


    items.forEach(function (item) {

        const increase =
            item.querySelector(
                "[data-increase]"
            );


        const decrease =
            item.querySelector(
                "[data-decrease]"
            );


        const quantity =
            item.querySelector(
                ".equipment-quantity"
            );


        if (!quantity) {
            return;
        }


        if (increase) {

            increase.addEventListener(
                "click",
                function () {

                    const current =
                        parseInt(
                            quantity.value ||
                            quantity.textContent ||
                            "0"
                        ) || 0;


                    setEquipmentQuantity(
                        quantity,
                        current + 1
                    );


                    updateEquipmentTotal();

                }
            );

        }


        if (decrease) {

            decrease.addEventListener(
                "click",
                function () {

                    const current =
                        parseInt(
                            quantity.value ||
                            quantity.textContent ||
                            "0"
                        ) || 0;


                    setEquipmentQuantity(
                        quantity,
                        Math.max(
                            0,
                            current - 1
                        )
                    );


                    updateEquipmentTotal();

                }
            );

        }

    });


    updateEquipmentTotal();
}


/* =========================================================
   EQUIPMENT QUANTITY
   ========================================================= */

function setEquipmentQuantity(
    element,
    value
) {

    if (!element) {
        return;
    }


    if (
        element.tagName === "INPUT"
    ) {

        element.value =
            value;

    } else {

        element.textContent =
            value;

    }

}


/* =========================================================
   EQUIPMENT TOTAL
   ========================================================= */

function updateEquipmentTotal() {

    let total =
        0;


    const items =
        document.querySelectorAll(
            ".equipment-item, .booking-equipment-item"
        );


    items.forEach(function (item) {

        const quantityElement =
            item.querySelector(
                ".equipment-quantity"
            );


        if (!quantityElement) {
            return;
        }


        const quantity =
            parseInt(
                quantityElement.value ||
                quantityElement.textContent ||
                "0"
            ) || 0;


        const price =
            parseFloat(
                item.dataset.price || "0"
            ) || 0;


        total +=
            quantity * price;

    });


    const totalElement =
        document.querySelector(
            "#equipmentTotal"
        );


    const bookingTotalElement =
        document.querySelector(
            "#equipmentBookingTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            formatUserCurrency(total);

    }


    if (bookingTotalElement) {

        bookingTotalElement.textContent =
            formatUserCurrency(total);

    }


    updateBookingFinalTotal(
        total
    );
}


/* =========================================================
   BOOKING FINAL TOTAL
   ========================================================= */

function updateBookingFinalTotal(
    equipmentTotal = 0
) {

    const totalElement =
        document.querySelector(
            "#bookingFinalTotal"
        );


    if (!totalElement) {
        return;
    }


    const turfPriceElement =
        document.querySelector(
            "#slotPrice"
        );


    let turfPrice =
        parseFloat(
            turfPriceElement?.value || "0"
        ) || 0;


    if (!turfPrice) {

        turfPrice = 1000;

    }


    const discountElement =
        document.querySelector(
            "#bookingDiscount"
        );


    let discount =
        0;


    if (discountElement) {

        const text =
            discountElement.textContent
                .replace(/[^\d.]/g, "");


        discount =
            parseFloat(text) || 0;

    }


    const total =
        Math.max(
            0,
            turfPrice +
            equipmentTotal -
            discount
        );


    totalElement.textContent =
        formatUserCurrency(
            total
        );
}


/* =========================================================
   TEAM ACTIONS
   ========================================================= */

function initializeTeamActions() {

    const createTeamForm =
        document.querySelector(
            "#createTeamForm"
        );


    if (createTeamForm) {

        createTeamForm.addEventListener(
            "submit",
            function (event) {

                const name =
                    document.querySelector(
                        "#teamName"
                    )?.value.trim();


                if (!name) {

                    event.preventDefault();

                    showUserMessage(
                        "Please enter team name.",
                        "error"
                    );

                }

            }
        );

    }


    const joinButtons =
        document.querySelectorAll(
            "[data-join-team]"
        );


    joinButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const teamId =
                    button.dataset.joinTeam;


                if (!teamId) {
                    return;
                }


                showUserMessage(
                    "Join request sent successfully.",
                    "success"
                );

            }
        );

    });

}


/* =========================================================
   TEAM JOIN BY CODE
   ========================================================= */

function joinTeamByCode() {

    const input =
        document.querySelector(
            "#teamCode"
        );


    if (!input) {
        return;
    }


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (!code) {

        showUserMessage(
            "Please enter a team code.",
            "error"
        );

        return;
    }


    showUserMessage(
        "Join request sent successfully.",
        "success"
    );
}


function requestToJoinTeam(
    teamName
) {

    showUserMessage(
        `Join request sent to ${teamName}.`,
        "success"
    );

}


/* =========================================================
   TEAM SEARCH
   ========================================================= */

function initializeTeamSearch() {

    const search =
        document.querySelector(
            "#teamSearch"
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


            document
                .querySelectorAll(
                    ".discover-team-card"
                )
                .forEach(
                    function (card) {

                        const name =
                            (
                                card.dataset.teamName ||
                                card.textContent
                            )
                            .toLowerCase();


                        card.style.display =
                            name.includes(query)
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   TEAM LOGO PREVIEW
   ========================================================= */

function initializeTeamLogoPreview() {

    const input =
        document.querySelector(
            "#teamLogo"
        );


    const preview =
        document.querySelector(
            "#teamLogoPreview"
        );


    if (!input || !preview) {
        return;
    }


    input.addEventListener(
        "change",
        function () {

            const file =
                input.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showUserMessage(
                    "Please select an image file.",
                    "error"
                );

                input.value =
                    "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.innerHTML =

                        `<img src="${event.target.result}"
                              alt="Team Logo"
                              style="width:100%;
                                     height:100%;
                                     object-fit:cover;
                                     border-radius:13px;">`;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   PROFILE
   ========================================================= */

function initializeProfile() {

    const profileForm =
        document.querySelector(
            "#profileForm"
        );


    if (!profileForm) {
        return;
    }


    profileForm.addEventListener(
        "submit",
        function (event) {

            const name =
                document.querySelector(
                    "#profileName"
                )?.value.trim();


            const email =
                document.querySelector(
                    "#profileEmail"
                )?.value.trim();


            if (!name) {

                event.preventDefault();

                showUserMessage(
                    "Name is required.",
                    "error"
                );

                return;
            }


            if (
                email &&
                !isValidUserEmail(email)
            ) {

                event.preventDefault();

                showUserMessage(
                    "Please enter a valid email.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   PROFILE PHOTO PREVIEW
   ========================================================= */

function initializeProfilePhotoPreview() {

    const input =
        document.querySelector(
            "#profilePhoto"
        );


    const preview =
        document.querySelector(
            ".profile-photo"
        );


    if (!input || !preview) {
        return;
    }


    input.addEventListener(
        "change",
        function () {

            const file =
                input.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showUserMessage(
                    "Please select an image file.",
                    "error"
                );

                input.value =
                    "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.innerHTML =

                        `<img src="${event.target.result}"
                              alt="Profile"
                              style="width:100%;
                                     height:100%;
                                     object-fit:cover;
                                     border-radius:50%;">`;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function initializeNotifications() {

    const markButtons =
        document.querySelectorAll(
            "[data-mark-read]"
        );


    markButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const notification =
                        button.closest(
                            ".notification-item"
                        );


                    if (notification) {

                        notification.classList.remove(
                            "unread"
                        );

                    }


                    button.textContent =
                        "Read";

                }
            );

        }
    );

}


function markAllNotificationsRead() {

    const notifications =
        document.querySelectorAll(
            ".notification-item"
        );


    notifications.forEach(
        function (item) {

            item.classList.remove(
                "unread"
            );

        }
    );


    showUserMessage(
        "All notifications marked as read.",
        "success"
    );

}


/* =========================================================
   SETTINGS - OLD DATA-ATTRIBUTE SUPPORT
   ========================================================= */

function initializeSettings() {

    const toggles =
        document.querySelectorAll(
            "[data-setting-toggle]"
        );


    toggles.forEach(
        function (toggle) {

            toggle.addEventListener(
                "change",
                function () {

                    const setting =
                        toggle.dataset.settingToggle;


                    console.log(
                        "Setting changed:",
                        setting,
                        toggle.checked
                    );

                }
            );

        }
    );

}


/* =========================================================
   APPEARANCE SETTINGS
   ========================================================= */

function initializeUserAppearance() {

    loadAppearanceSettings();

    setupDarkMode();

    setupCompactLayout();

    setupAccentColors();

    setupFontSizes();

    setupAnimations();

    setupSidebarStyle();

    setupAppearanceReset();

}


/* =========================================================
   LOAD APPEARANCE
   ========================================================= */

function loadAppearanceSettings() {

    const darkMode =
        localStorage.getItem(
            "turfxDarkMode"
        ) === "true";


    const compactLayout =
        localStorage.getItem(
            "turfxCompactLayout"
        ) === "true";


    const animationsSaved =
        localStorage.getItem(
            "turfxAnimations"
        );


    const animationsEnabled =
        animationsSaved !== "false";


    const accent =
        localStorage.getItem(
            "turfxAccent"
        ) || "green";


    const fontSize =
        localStorage.getItem(
            "turfxFontSize"
        ) || "medium";


    const sidebarStyle =
        localStorage.getItem(
            "turfxSidebar"
        ) || "expanded";


    applyDarkMode(
        darkMode
    );

    applyCompactLayout(
        compactLayout
    );

    applyAnimations(
        animationsEnabled
    );

    applyAccentColor(
        accent
    );

    applyFontSize(
        fontSize
    );

    applySidebarStyle(
        sidebarStyle
    );


    const darkToggle =
        document.querySelector(
            "#darkModeToggle"
        );

    if (darkToggle) {

        darkToggle.checked =
            darkMode;

    }


    const compactToggle =
        document.querySelector(
            "#compactLayoutToggle"
        );

    if (compactToggle) {

        compactToggle.checked =
            compactLayout;

    }


    const animationToggle =
        document.querySelector(
            "#animationsToggle"
        );

    if (animationToggle) {

        animationToggle.checked =
            animationsEnabled;

    }

}


/* =========================================================
   DARK MODE
   ========================================================= */

function setupDarkMode() {

    const toggle =
        document.querySelector(
            "#darkModeToggle"
        );


    if (!toggle) {
        return;
    }


    toggle.addEventListener(
        "change",
        function () {

            const enabled =
                toggle.checked;


            localStorage.setItem(
                "turfxDarkMode",
                String(enabled)
            );


            applyDarkMode(
                enabled
            );


            showAppearanceSaved();

        }
    );

}


function applyDarkMode(
    enabled
) {

    document.body.classList.toggle(
        "user-dark-mode",
        enabled
    );

}


/* =========================================================
   COMPACT LAYOUT
   ========================================================= */

function setupCompactLayout() {

    const toggle =
        document.querySelector(
            "#compactLayoutToggle"
        );


    if (!toggle) {
        return;
    }


    toggle.addEventListener(
        "change",
        function () {

            const enabled =
                toggle.checked;


            localStorage.setItem(
                "turfxCompactLayout",
                String(enabled)
            );


            applyCompactLayout(
                enabled
            );


            showAppearanceSaved();

        }
    );

}


function applyCompactLayout(
    enabled
) {

    document.body.classList.toggle(
        "user-compact-mode",
        enabled
    );

}


/* =========================================================
   ACCENT COLOR
   ========================================================= */

function setupAccentColors() {

    document
        .querySelectorAll(
            ".accent-option"
        )
        .forEach(
            function (option) {

                option.addEventListener(
                    "click",
                    function () {

                        const accent =
                            option.dataset.accent;


                        if (!accent) {
                            return;
                        }


                        localStorage.setItem(
                            "turfxAccent",
                            accent
                        );


                        applyAccentColor(
                            accent
                        );


                        showAppearanceSaved();

                    }
                );

            }
        );

}


function applyAccentColor(
    accent
) {

    const allowed =
        [
            "green",
            "blue",
            "purple",
            "orange"
        ];


    if (
        !allowed.includes(
            accent
        )
    ) {

        accent =
            "green";

    }


    document.body.classList.remove(
        "accent-green",
        "accent-blue",
        "accent-purple",
        "accent-orange"
    );


    document.body.classList.add(
        `accent-${accent}`
    );


    document
        .querySelectorAll(
            ".accent-option"
        )
        .forEach(
            function (option) {

                option.classList.toggle(
                    "active",
                    option.dataset.accent ===
                    accent
                );

            }
        );

}


/* =========================================================
   FONT SIZE
   ========================================================= */

function setupFontSizes() {

    document
        .querySelectorAll(
            ".font-option"
        )
        .forEach(
            function (option) {

                option.addEventListener(
                    "click",
                    function () {

                        const size =
                            option.dataset.fontSize;


                        if (!size) {
                            return;
                        }


                        localStorage.setItem(
                            "turfxFontSize",
                            size
                        );


                        applyFontSize(
                            size
                        );


                        showAppearanceSaved();

                    }
                );

            }
        );

}


function applyFontSize(
    size
) {

    const allowed =
        [
            "small",
            "medium",
            "large"
        ];


    if (
        !allowed.includes(
            size
        )
    ) {

        size =
            "medium";

    }


    document.body.classList.remove(
        "user-font-small",
        "user-font-medium",
        "user-font-large"
    );


    document.body.classList.add(
        `user-font-${size}`
    );


    document
        .querySelectorAll(
            ".font-option"
        )
        .forEach(
            function (option) {

                option.classList.toggle(
                    "active",
                    option.dataset.fontSize ===
                    size
                );

            }
        );

}


/* =========================================================
   ANIMATIONS
   ========================================================= */

function setupAnimations() {

    const toggle =
        document.querySelector(
            "#animationsToggle"
        );


    if (!toggle) {
        return;
    }


    toggle.addEventListener(
        "change",
        function () {

            const enabled =
                toggle.checked;


            localStorage.setItem(
                "turfxAnimations",
                String(enabled)
            );


            applyAnimations(
                enabled
            );


            showAppearanceSaved();

        }
    );

}


function applyAnimations(
    enabled
) {

    document.body.classList.toggle(
        "user-no-animations",
        !enabled
    );

}


/* =========================================================
   SIDEBAR STYLE
   ========================================================= */

function setupSidebarStyle() {

    document
        .querySelectorAll(
            ".sidebar-option"
        )
        .forEach(
            function (option) {

                option.addEventListener(
                    "click",
                    function () {

                        const style =
                            option.dataset.sidebarStyle;


                        if (
                            style !== "expanded" &&
                            style !== "compact"
                        ) {
                            return;
                        }


                        localStorage.setItem(
                            "turfxSidebar",
                            style
                        );


                        applySidebarStyle(
                            style
                        );


                        showAppearanceSaved();

                    }
                );

            }
        );

}


function applySidebarStyle(
    style
) {

    if (
        style !== "expanded" &&
        style !== "compact"
    ) {

        style =
            "expanded";

    }


    document.body.classList.toggle(
        "user-sidebar-compact",
        style === "compact"
    );


    document
        .querySelectorAll(
            ".sidebar-option"
        )
        .forEach(
            function (option) {

                option.classList.toggle(
                    "active",
                    option.dataset.sidebarStyle ===
                    style
                );

            }
        );

}


/* =========================================================
   RESET APPEARANCE
   ========================================================= */

function setupAppearanceReset() {

    const button =
        document.querySelector(
            "#resetAppearance"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "turfxDarkMode"
            );

            localStorage.removeItem(
                "turfxCompactLayout"
            );

            localStorage.removeItem(
                "turfxAnimations"
            );

            localStorage.removeItem(
                "turfxAccent"
            );

            localStorage.removeItem(
                "turfxFontSize"
            );

            localStorage.removeItem(
                "turfxSidebar"
            );


            applyDarkMode(
                false
            );

            applyCompactLayout(
                false
            );

            applyAnimations(
                true
            );

            applyAccentColor(
                "green"
            );

            applyFontSize(
                "medium"
            );

            applySidebarStyle(
                "expanded"
            );


            const darkToggle =
                document.querySelector(
                    "#darkModeToggle"
                );

            const compactToggle =
                document.querySelector(
                    "#compactLayoutToggle"
                );

            const animationToggle =
                document.querySelector(
                    "#animationsToggle"
                );


            if (darkToggle) {

                darkToggle.checked =
                    false;

            }


            if (compactToggle) {

                compactToggle.checked =
                    false;

            }


            if (animationToggle) {

                animationToggle.checked =
                    true;

            }


            showAppearanceSaved();

        }
    );

}


/* =========================================================
   CANCEL BOOKING
   ========================================================= */

function cancelBooking(
    bookingId
) {

    if (!bookingId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmed) {
        return;
    }


    showUserMessage(
        "Booking cancellation requested.",
        "success"
    );

}


/* =========================================================
   DOWNLOAD TICKET
   ========================================================= */

function downloadTicket(
    ticketUrl
) {

    if (!ticketUrl) {

        showUserMessage(
            "Ticket is not available.",
            "error"
        );

        return;
    }


    window.open(
        ticketUrl,
        "_blank"
    );

}


/* =========================================================
   EQUIPMENT SEARCH
   ========================================================= */

function initializeEquipmentSearch() {

    const search =
        document.querySelector(
            "#equipmentSearch"
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


            document
                .querySelectorAll(
                    ".user-equipment-card"
                )
                .forEach(
                    function (card) {

                        const name =
                            (
                                card.dataset.equipmentName ||
                                card.textContent
                            )
                            .toLowerCase();


                        card.style.display =
                            name.includes(query)
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidUserEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatUserCurrency(
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
   USER MESSAGE
   ========================================================= */

function showUserMessage(
    message,
    type = "info"
) {

    let box =
        document.querySelector(
            ".user-message"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.className =
            "user-message";


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


    clearTimeout(
        window.turfxUserMessageTimer
    );


    window.turfxUserMessageTimer =
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
   APPEARANCE SAVE MESSAGE
   ========================================================= */

function showAppearanceSaved() {

    const status =
        document.querySelector(
            "#appearanceSaveStatus"
        );


    if (!status) {
        return;
    }


    status.textContent =
        "✓ Saved automatically";


    status.style.color =
        "#16a34a";


    clearTimeout(
        window.turfxAppearanceSaveTimer
    );


    window.turfxAppearanceSaveTimer =
        setTimeout(
            function () {

                status.textContent =
                    "Changes are saved automatically";

                status.style.color =
                    "";

            },
            1800
        );

}


/* =========================================================
   USER JS READY
   ========================================================= */

console.log(
    "TurfX User JS loaded successfully."
);