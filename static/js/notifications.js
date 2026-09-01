/* =========================================================
   TurfX - Notification Center
   File: static/js/notification.js
   ========================================================= */


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeNotificationFilters();
        updateUnreadCount();

    }
);


/* =========================================================
   FILTERS
   ========================================================= */

function initializeNotificationFilters() {

    const buttons =
        document.querySelectorAll(
            ".notification-filter"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    button.classList.add(
                        "active"
                    );

                    filterNotifications(
                        button.dataset.filter
                    );

                }
            );

        }
    );

}


/* =========================================================
   FILTER NOTIFICATIONS
   ========================================================= */

function filterNotifications(
    filter
) {

    const notifications =
        document.querySelectorAll(
            ".admin-notification"
        );

    notifications.forEach(
        function (notification) {

            const type =
                notification.dataset.type;

            const isUnread =
                notification.classList.contains(
                    "unread"
                );

            let show = true;

            if (filter === "unread") {

                show =
                    isUnread;

            } else if (
                filter !== "all"
            ) {

                show =
                    type === filter;

            }

            notification.style.display =
                show
                    ? ""
                    : "none";

        }
    );

}


/* =========================================================
   MARK ONE READ
   ========================================================= */

function markNotificationRead(
    button
) {

    const notification =
        button.closest(
            ".admin-notification"
        );

    if (!notification) {
        return;
    }

    notification.classList.remove(
        "unread"
    );

    const dot =
        notification.querySelector(
            ".notification-new-dot"
        );

    if (dot) {
        dot.remove();
    }

    button.textContent =
        "Read";

    button.disabled =
        true;

    button.classList.add(
        "disabled"
    );

    updateUnreadCount();

}


/* =========================================================
   MARK ALL READ
   ========================================================= */

function markAllNotificationsRead() {

    const notifications =
        document.querySelectorAll(
            ".admin-notification"
        );

    notifications.forEach(
        function (notification) {

            notification.classList.remove(
                "unread"
            );

            const dot =
                notification.querySelector(
                    ".notification-new-dot"
                );

            if (dot) {
                dot.remove();
            }

            const button =
                notification.querySelector(
                    ".notification-read-btn"
                );

            if (button) {

                button.textContent =
                    "Read";

                button.disabled =
                    true;

                button.classList.add(
                    "disabled"
                );

            }

        }
    );

    updateUnreadCount();

    showNotificationMessage(
        "All notifications marked as read.",
        "success"
    );

}


/* =========================================================
   CLEAR READ
   ========================================================= */

function clearReadNotifications() {

    const notifications =
        document.querySelectorAll(
            ".admin-notification"
        );

    let removed = 0;

    notifications.forEach(
        function (notification) {

            if (
                !notification.classList.contains(
                    "unread"
                )
            ) {

                notification.remove();

                removed++;

            }

        }
    );

    updateUnreadCount();

    showNotificationMessage(
        removed > 0
            ? `${removed} read notification(s) cleared.`
            : "No read notifications to clear.",
        "success"
    );

}


/* =========================================================
   REMOVE ONE
   ========================================================= */

function removeNotification(
    button
) {

    const notification =
        button.closest(
            ".admin-notification"
        );

    if (!notification) {
        return;
    }

    notification.remove();

    updateUnreadCount();

}


/* =========================================================
   UNREAD COUNT
   ========================================================= */

function updateUnreadCount() {

    const unread =
        document.querySelectorAll(
            ".admin-notification.unread"
        ).length;

    const counter =
        document.querySelector(
            "#unreadNotificationCount"
        );

    if (counter) {

        counter.textContent =
            unread;

    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showNotificationMessage(
    message,
    type = "info"
) {

    let box =
        document.querySelector(
            ".notification-toast"
        );

    if (box) {
        box.remove();
    }

    box =
        document.createElement(
            "div"
        );

    box.className =
        "notification-toast";

    box.textContent =
        message;

    box.style.position =
        "fixed";

    box.style.right =
        "20px";

    box.style.bottom =
        "20px";

    box.style.zIndex =
        "10000";

    box.style.padding =
        "12px 16px";

    box.style.borderRadius =
        "8px";

    box.style.fontSize =
        "11px";

    box.style.fontWeight =
        "700";

    box.style.color =
        "#ffffff";

    box.style.background =
        type === "success"
            ? "#16a34a"
            : "#334155";

    document.body.appendChild(
        box
    );

    setTimeout(
        function () {

            box.remove();

        },
        3000
    );

}