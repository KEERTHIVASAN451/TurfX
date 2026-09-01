/* =========================================================
   TurfX - Admin JavaScript
   File: static/js/admin.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeAdminSidebar();
    initializeAdminFilters();
    initializeSlotManagement();
    initializeBookingActions();
    initializeNotifications();
    initializeConfirmActions();
    initializeTableSelection();
    initializeAutoRefresh();

});


/* =========================================================
   ADMIN SIDEBAR
   ========================================================= */

function initializeAdminSidebar() {

    const sidebarToggle = document.querySelector("#sidebarToggle");
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (sidebarToggle && sidebar) {

        sidebarToggle.addEventListener("click", function () {

            sidebar.classList.toggle("active");

            if (overlay) {
                overlay.classList.toggle("active");
            }

        });

    }

    if (overlay) {

        overlay.addEventListener("click", function () {

            sidebar.classList.remove("active");
            overlay.classList.remove("active");

        });

    }

}


/* =========================================================
   ADMIN FILTERS
   ========================================================= */

function initializeAdminFilters() {

    const filterInputs = document.querySelectorAll(
        "[data-admin-filter]"
    );

    filterInputs.forEach(function (input) {

        input.addEventListener("input", function () {

            const value = input.value.toLowerCase();

            const targetSelector = input.dataset.adminFilter;

            const rows = document.querySelectorAll(
                targetSelector
            );

            rows.forEach(function (row) {

                const text = row.textContent.toLowerCase();

                if (text.includes(value)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }

            });

        });

    });

}


/* =========================================================
   DATE FILTER
   ========================================================= */

function filterByDate(date) {

    const rows = document.querySelectorAll(
        "[data-booking-date]"
    );

    rows.forEach(function (row) {

        const rowDate = row.dataset.bookingDate;

        if (!date || rowDate === date) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


/* =========================================================
   STATUS FILTER
   ========================================================= */

function filterByStatus(status) {

    const rows = document.querySelectorAll(
        "[data-status]"
    );

    rows.forEach(function (row) {

        const rowStatus = row.dataset.status;

        if (!status || status === "all" || rowStatus === status) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


/* =========================================================
   SLOT MANAGEMENT
   ========================================================= */

function initializeSlotManagement() {

    const slots = document.querySelectorAll(
        ".admin-slot"
    );

    slots.forEach(function (slot) {

        slot.addEventListener("click", function () {

            if (
                slot.classList.contains("booked") ||
                slot.classList.contains("disabled")
            ) {
                return;
            }

            slot.classList.toggle("selected");

        });

    });

}


/* =========================================================
   SELECT ALL SLOTS
   ========================================================= */

function selectAllSlots() {

    const slots = document.querySelectorAll(
        ".admin-slot:not(.booked):not(.disabled)"
    );

    slots.forEach(function (slot) {

        slot.classList.add("selected");

    });

}


/* =========================================================
   CLEAR SELECTED SLOTS
   ========================================================= */

function clearSelectedSlots() {

    const slots = document.querySelectorAll(
        ".admin-slot.selected"
    );

    slots.forEach(function (slot) {

        slot.classList.remove("selected");

    });

}


/* =========================================================
   GET SELECTED SLOTS
   ========================================================= */

function getSelectedSlots() {

    const selectedSlots = [];

    document
        .querySelectorAll(".admin-slot.selected")
        .forEach(function (slot) {

            selectedSlots.push(
                slot.dataset.slotId || slot.textContent.trim()
            );

        });

    return selectedSlots;

}


/* =========================================================
   CHANGE SLOT STATUS
   ========================================================= */

function updateSlotStatus(status) {

    const selectedSlots = document.querySelectorAll(
        ".admin-slot.selected"
    );

    selectedSlots.forEach(function (slot) {

        slot.classList.remove(
            "available",
            "booked",
            "disabled",
            "selected"
        );

        slot.classList.add(status);

    });

}


/* =========================================================
   BOOKING ACTIONS
   ========================================================= */

function initializeBookingActions() {

    document
        .querySelectorAll("[data-booking-action]")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const action = button.dataset.bookingAction;

                const bookingId =
                    button.dataset.bookingId;

                handleBookingAction(
                    action,
                    bookingId,
                    button
                );

            });

        });

}


/* =========================================================
   HANDLE BOOKING ACTION
   ========================================================= */

function handleBookingAction(action, bookingId, button) {

    if (!bookingId) {
        showAdminAlert(
            "Booking ID missing.",
            "error"
        );

        return;
    }

    if (action === "approve") {

        confirmAdminAction(
            "Approve this booking?",
            function () {

                updateBookingUI(
                    bookingId,
                    "confirmed",
                    button
                );

            }
        );

    }


    if (action === "reject") {

        confirmAdminAction(
            "Reject this booking?",
            function () {

                updateBookingUI(
                    bookingId,
                    "rejected",
                    button
                );

            }
        );

    }


    if (action === "cancel") {

        confirmAdminAction(
            "Cancel this booking?",
            function () {

                updateBookingUI(
                    bookingId,
                    "cancelled",
                    button
                );

            }
        );

    }

}


/* =========================================================
   UPDATE BOOKING UI
   ========================================================= */

function updateBookingUI(
    bookingId,
    status,
    button
) {

    const row = button.closest(
        "[data-booking-row]"
    );

    if (row) {

        const statusElement =
            row.querySelector(
                "[data-booking-status]"
            );

        if (statusElement) {

            statusElement.textContent =
                formatAdminStatus(status);

            statusElement.dataset.status =
                status;

        }

        row.dataset.status = status;

    }

    showAdminAlert(
        "Booking " + bookingId +
        " updated successfully.",
        "success"
    );

}


/* =========================================================
   FORMAT STATUS
   ========================================================= */

function formatAdminStatus(status) {

    return status
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function initializeNotifications() {

    document
        .querySelectorAll("[data-notification-read]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const item =
                        button.closest(
                            ".admin-notification"
                        );

                    if (item) {

                        item.classList.remove(
                            "unread"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   MARK ALL NOTIFICATIONS READ
   ========================================================= */

function markAllNotificationsRead() {

    document
        .querySelectorAll(
            ".admin-notification.unread"
        )
        .forEach(function (item) {

            item.classList.remove("unread");

        });

    updateNotificationCount();

}


/* =========================================================
   NOTIFICATION COUNT
   ========================================================= */

function updateNotificationCount() {

    const unreadCount =
        document.querySelectorAll(
            ".admin-notification.unread"
        ).length;

    const badge =
        document.querySelector(
            "[data-notification-count]"
        );

    if (badge) {

        badge.textContent =
            unreadCount;

        if (unreadCount === 0) {

            badge.style.display =
                "none";

        } else {

            badge.style.display =
                "inline-flex";

        }

    }

}


/* =========================================================
   CONFIRM ACTIONS
   ========================================================= */

function initializeConfirmActions() {

    document
        .querySelectorAll(
            "[data-confirm-action]"
        )
        .forEach(function (element) {

            element.addEventListener(
                "click",
                function (event) {

                    const message =
                        element.dataset.confirmAction ||
                        "Are you sure?";

                    if (!confirm(message)) {

                        event.preventDefault();

                    }

                }
            );

        });

}


/* =========================================================
   CUSTOM CONFIRM
   ========================================================= */

function confirmAdminAction(
    message,
    callback
) {

    const result = window.confirm(
        message
    );

    if (result && typeof callback === "function") {

        callback();

    }

}


/* =========================================================
   TABLE SELECT ALL
   ========================================================= */

function initializeTableSelection() {

    const selectAll =
        document.querySelector(
            "#selectAll"
        );

    if (!selectAll) {
        return;
    }

    selectAll.addEventListener(
        "change",
        function () {

            const checkboxes =
                document.querySelectorAll(
                    ".row-checkbox"
                );

            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        selectAll.checked;

                }
            );

        }
    );

}


/* =========================================================
   GET SELECTED TABLE ROWS
   ========================================================= */

function getSelectedRows() {

    const selected = [];

    document
        .querySelectorAll(
            ".row-checkbox:checked"
        )
        .forEach(function (checkbox) {

            selected.push(
                checkbox.value
            );

        });

    return selected;

}


/* =========================================================
   BULK ACTION
   ========================================================= */

function bulkAction(action) {

    const selected =
        getSelectedRows();

    if (selected.length === 0) {

        showAdminAlert(
            "Please select at least one item.",
            "warning"
        );

        return;

    }

    confirmAdminAction(
        "Apply this action to " +
        selected.length +
        " selected item(s)?",

        function () {

            showAdminAlert(
                "Bulk action completed.",
                "success"
            );

        }
    );

}


/* =========================================================
   ADMIN ALERT
   ========================================================= */

function showAdminAlert(
    message,
    type = "info"
) {

    let alertContainer =
        document.querySelector(
            ".admin-alert-container"
        );

    if (!alertContainer) {

        alertContainer =
            document.createElement(
                "div"
            );

        alertContainer.className =
            "admin-alert-container";

        document.body.appendChild(
            alertContainer
        );

    }

    const alert =
        document.createElement(
            "div"
        );

    alert.className =
        "admin-alert admin-alert-" +
        type;

    alert.textContent =
        message;

    alertContainer.appendChild(
        alert
    );

    setTimeout(function () {

        alert.classList.add(
            "hide"
        );

        setTimeout(function () {

            alert.remove();

        }, 300);

    }, 3000);

}


/* =========================================================
   SEARCH ADMIN TABLE
   ========================================================= */

function searchAdminTable(
    inputId,
    tableId
) {

    const input =
        document.getElementById(
            inputId
        );

    const table =
        document.getElementById(
            tableId
        );

    if (!input || !table) {
        return;
    }

    input.addEventListener(
        "input",
        function () {

            const search =
                input.value.toLowerCase();

            const rows =
                table.querySelectorAll(
                    "tbody tr"
                );

            rows.forEach(
                function (row) {

                    const text =
                        row.textContent
                            .toLowerCase();

                    row.style.display =
                        text.includes(search)
                            ? ""
                            : "none";

                }
            );

        }
    );

}


/* =========================================================
   PRICE INPUT
   ========================================================= */

function calculateAdminPrice() {

    const basePrice =
        parseFloat(
            document.querySelector(
                "#basePrice"
            )?.value
        ) || 0;

    const tax =
        parseFloat(
            document.querySelector(
                "#tax"
            )?.value
        ) || 0;

    const discount =
        parseFloat(
            document.querySelector(
                "#discount"
            )?.value
        ) || 0;

    const taxAmount =
        basePrice * tax / 100;

    const discountAmount =
        basePrice * discount / 100;

    const total =
        basePrice +
        taxAmount -
        discountAmount;

    const totalElement =
        document.querySelector(
            "#totalPrice"
        );

    if (totalElement) {

        totalElement.textContent =
            total.toFixed(2);

    }

    return total;

}


/* =========================================================
   TOGGLE ELEMENT
   ========================================================= */

function toggleAdminElement(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    if (
        element.style.display ===
        "none"
    ) {

        element.style.display = "";

    } else {

        element.style.display =
            "none";

    }

}


/* =========================================================
   EXPORT TABLE
   ========================================================= */

function exportAdminTable(
    tableId,
    filename = "turfx-report.csv"
) {

    const table =
        document.getElementById(
            tableId
        );

    if (!table) {
        return;
    }

    const rows =
        table.querySelectorAll(
            "tr"
        );

    const csv = [];

    rows.forEach(function (row) {

        const cells =
            row.querySelectorAll(
                "th, td"
            );

        const rowData = [];

        cells.forEach(
            function (cell) {

                let value =
                    cell.innerText
                        .replace(/"/g, '""')
                        .replace(/\n/g, " ");

                rowData.push(
                    '"' + value + '"'
                );

            }
        );

        csv.push(
            rowData.join(",")
        );

    });

    const blob =
        new Blob(
            [csv.join("\n")],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   AUTO REFRESH
   ========================================================= */

function initializeAutoRefresh() {

    const refreshElement =
        document.querySelector(
            "[data-auto-refresh]"
        );

    if (!refreshElement) {
        return;
    }

    const seconds =
        parseInt(
            refreshElement.dataset.autoRefresh
        );

    if (
        !seconds ||
        seconds < 5
    ) {
        return;
    }

    setInterval(
        function () {

            refreshElement.dispatchEvent(
                new CustomEvent(
                    "adminRefresh"
                )
            );

        },
        seconds * 1000
    );

}


/* =========================================================
   MANUAL PAGE REFRESH
   ========================================================= */

function refreshAdminPage() {

    window.location.reload();

}


/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function scrollAdminToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   ADMIN LOGOUT CONFIRMATION
   ========================================================= */

function confirmAdminLogout() {

    const result =
        window.confirm(
            "Are you sure you want to logout?"
        );

    if (result) {

        window.location.href =
            "/logout";

    }

}


/* =========================================================
   CONSOLE MESSAGE
   ========================================================= */

console.log(
    "TurfX Admin JS loaded successfully."
);
/* =========================================================
   ADMIN BOOKING MANAGEMENT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAdminBookings();

    }
);


function initializeAdminBookings() {

    const search =
        document.querySelector(
            "#adminBookingSearch"
        );

    const statusFilter =
        document.querySelector(
            "#adminBookingStatusFilter"
        );

    const dateFilter =
        document.querySelector(
            "#adminBookingDate"
        );

    const clearButton =
        document.querySelector(
            "#clearBookingFilters"
        );

    const rows =
        document.querySelectorAll(
            "[data-booking-row]"
        );


    function filterBookings() {

        const query =
            search
                ? search.value
                    .toLowerCase()
                    .trim()
                : "";

        const status =
            statusFilter
                ? statusFilter.value
                : "all";

        const date =
            dateFilter
                ? dateFilter.value
                : "";


        let visibleCount = 0;


        rows.forEach(
            function (row) {

                const text =
                    row.textContent
                        .toLowerCase();

                const rowStatus =
                    row.dataset.status || "";

                const rowDate =
                    row.dataset.date || "";


                const matchesSearch =
                    !query ||
                    text.includes(query);

                const matchesStatus =
                    status === "all" ||
                    rowStatus === status;

                const matchesDate =
                    !date ||
                    rowDate === date;


                const visible =
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate;


                row.style.display =
                    visible
                        ? ""
                        : "none";


                if (visible) {
                    visibleCount++;
                }

            }
        );


        const result =
            document.querySelector(
                "#bookingResultText"
            );

        if (result) {

            result.textContent =
                `Showing ${visibleCount} booking${visibleCount === 1 ? "" : "s"}`;

        }

    }


    if (search) {
        search.addEventListener(
            "input",
            filterBookings
        );
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            filterBookings
        );
    }


    if (dateFilter) {
        dateFilter.addEventListener(
            "change",
            filterBookings
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (search) {
                    search.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "all";
                }

                if (dateFilter) {
                    dateFilter.value = "";
                }

                filterBookings();

            }
        );

    }


    /* =====================================================
       VIEW BOOKING
       ===================================================== */

    document
        .querySelectorAll(
            "[data-booking-view]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const row =
                            button.closest(
                                "[data-booking-row]"
                            );

                        if (!row) {
                            return;
                        }

                        const cells =
                            row.querySelectorAll("td");

                        const bookingId =
                            cells[0]
                                ?.textContent
                                .trim();

                        const customer =
                            cells[1]
                                ?.textContent
                                .trim();

                        const turf =
                            cells[2]
                                ?.textContent
                                .trim();

                        const date =
                            cells[3]
                                ?.textContent
                                .trim();

                        const slot =
                            cells[4]
                                ?.textContent
                                .trim();

                        const amount =
                            cells[5]
                                ?.textContent
                                .trim();

                        const status =
                            cells[6]
                                ?.textContent
                                .trim();


                        setText(
                            "#modalBookingId",
                            bookingId
                        );

                        setText(
                            "#modalCustomer",
                            customer
                        );

                        setText(
                            "#modalTurf",
                            turf
                        );

                        setText(
                            "#modalDate",
                            date
                        );

                        setText(
                            "#modalSlot",
                            slot
                        );

                        setText(
                            "#modalAmount",
                            amount
                        );

                        setText(
                            "#modalStatus",
                            status
                        );


                        openAdminBookingModal();

                    }
                );

            }
        );


    /* =====================================================
       CONFIRM BOOKING
       ===================================================== */

    document
        .querySelectorAll(
            "[data-booking-confirm]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const row =
                            button.closest(
                                "[data-booking-row]"
                            );

                        if (!row) {
                            return;
                        }

                        row.dataset.status =
                            "confirmed";

                        const status =
                            row.querySelector(
                                ".admin-status"
                            );

                        if (status) {

                            status.className =
                                "admin-status confirmed";

                            status.textContent =
                                "Confirmed";

                        }

                        button.remove();

                        showAdminMessage(
                            "Booking confirmed successfully.",
                            "success"
                        );

                    }
                );

            }
        );


    /* =====================================================
       CANCEL BOOKING
       ===================================================== */

    document
        .querySelectorAll(
            "[data-booking-cancel]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const confirmed =
                            window.confirm(
                                "Are you sure you want to cancel this booking?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        const row =
                            button.closest(
                                "[data-booking-row]"
                            );

                        if (!row) {
                            return;
                        }

                        row.dataset.status =
                            "cancelled";

                        const status =
                            row.querySelector(
                                ".admin-status"
                            );

                        if (status) {

                            status.className =
                                "admin-status cancelled";

                            status.textContent =
                                "Cancelled";

                        }

                        button.remove();

                        showAdminMessage(
                            "Booking cancelled successfully.",
                            "success"
                        );

                    }
                );

            }
        );


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    document
        .querySelectorAll(
            "#closeBookingModal, #closeBookingModalFooter"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    closeAdminBookingModal
                );

            }
        );


    const modal =
        document.querySelector(
            "#adminBookingModal"
        );

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    closeAdminBookingModal();

                }

            }
        );

    }


    /* =====================================================
       EXPORT CSV
       ===================================================== */

    const exportButton =
        document.querySelector(
            "#exportBookings"
        );

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportBookingsAsCSV
        );

    }

}


function openAdminBookingModal() {

    const modal =
        document.querySelector(
            "#adminBookingModal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function closeAdminBookingModal() {

    const modal =
        document.querySelector(
            "#adminBookingModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {
        element.textContent =
            value;
    }

}


function exportBookingsAsCSV() {

    const rows =
        document.querySelectorAll(
            "[data-booking-row]"
        );

    const csv = [
        [
            "Booking ID",
            "Customer",
            "Turf",
            "Date",
            "Slot",
            "Amount",
            "Status"
        ]
    ];


    rows.forEach(
        function (row) {

            if (
                row.style.display === "none"
            ) {
                return;
            }

            const cells =
                row.querySelectorAll("td");

            csv.push(
                Array.from(cells)
                    .slice(0, 7)
                    .map(
                        function (cell) {

                            return `"${cell.textContent
                                .trim()
                                .replace(/"/g, '""')}"`;

                        }
                    )
            );

        }
    );


    const blob =
        new Blob(
            [
                csv
                    .map(
                        row => row.join(",")
                    )
                    .join("\n")
            ],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "turfx-bookings.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =========================================================
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(
    message,
    type = "info"
) {

    let box =
        document.querySelector(
            ".admin-toast"
        );

    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.className =
            "admin-toast";

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
        2500
    );

}