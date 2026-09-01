/* =========================================================
   TurfX - QR Scanner
   File: static/js/qr.js
   ========================================================= */

let turfxQrScanner = null;
let qrScannerRunning = false;
let lastScannedValue = "";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeQRScanner();

    }
);


/* =========================================================
   INITIALIZE SCANNER
   ========================================================= */

function initializeQRScanner() {

    const reader =
        document.querySelector(
            "#qrReader"
        );

    if (!reader) {
        return;
    }

    const startButton =
        document.querySelector(
            '[onclick="startQRScanner()"]'
        );

    if (startButton) {

        startButton.addEventListener(
            "click",
            function () {

                startQRScanner();

            }
        );

    }

}


/* =========================================================
   START SCANNER
   ========================================================= */

function startQRScanner() {

    if (qrScannerRunning) {
        return;
    }

    const reader =
        document.querySelector(
            "#qrReader"
        );

    if (!reader) {
        return;
    }

    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        updateQRStatus(
            "QR scanner library could not be loaded.",
            "error"
        );

        return;

    }

    turfxQrScanner =
        new Html5Qrcode(
            "qrReader"
        );

    const config = {
        fps: 10,
        qrbox: {
            width: 230,
            height: 230
        }
    };


    turfxQrScanner
        .start(
            {
                facingMode: "environment"
            },
            config,
            onQRScanSuccess,
            onQRScanError
        )
        .then(
            function () {

                qrScannerRunning =
                    true;

                updateQRStatus(
                    "Scanner active. Point camera at QR code.",
                    "waiting"
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "QR scanner error:",
                    error
                );

                updateQRStatus(
                    "Camera access failed. Please allow camera permission.",
                    "error"
                );

            }
        );

}


/* =========================================================
   STOP SCANNER
   ========================================================= */

function stopQRScanner() {

    if (
        !turfxQrScanner ||
        !qrScannerRunning
    ) {
        return;
    }

    turfxQrScanner
        .stop()
        .then(
            function () {

                turfxQrScanner.clear();

                qrScannerRunning =
                    false;

                updateQRStatus(
                    "Scanner stopped.",
                    "waiting"
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Could not stop scanner:",
                    error
                );

            }
        );

}


/* =========================================================
   SUCCESS
   ========================================================= */

function onQRScanSuccess(
    decodedText
) {

    if (
        decodedText ===
        lastScannedValue
    ) {
        return;
    }

    lastScannedValue =
        decodedText;

    updateQRStatus(
        "QR code detected successfully.",
        "success"
    );

    processQRCode(
        decodedText
    );

}


/* =========================================================
   SCAN ERROR
   ========================================================= */

function onQRScanError(
    errorMessage
) {

    // Ignore normal frame-by-frame scan failures.
}


/* =========================================================
   PROCESS QR CODE
   ========================================================= */

function processQRCode(
    qrValue
) {

    let bookingId =
        qrValue;

    /*
       Demo accepted QR formats:

       BK001
       TXN-BK001
       https://turfx.local/ticket/BK001
    */

    const match =
        qrValue.match(
            /(BK\d+)/i
        );

    if (match) {

        bookingId =
            match[1].toUpperCase();

    }


    const booking =
        getDemoBooking(
            bookingId
        );

    if (!booking) {

        updateQRStatus(
            "Invalid or unknown QR ticket.",
            "error"
        );

        showQRVerificationError();

        return;

    }

    showBookingVerification(
        booking
    );

}


/* =========================================================
   DEMO BOOKING DATA
   ========================================================= */

function getDemoBooking(
    bookingId
) {

    const bookings = {

        BK001: {
            customer: "Arun Kumar",
            initials: "AK",
            bookingId: "BK001",
            turf: "TurfX Arena",
            date: "23 Aug 2026",
            slot: "06:00 PM - 07:00 PM",
            payment: "Paid",
            amount: "₹1,000"
        },

        BK002: {
            customer: "Rahul",
            initials: "RH",
            bookingId: "BK002",
            turf: "Champions Turf",
            date: "23 Aug 2026",
            slot: "07:00 PM - 08:00 PM",
            payment: "Paid",
            amount: "₹1,000"
        },

        BK003: {
            customer: "Vignesh",
            initials: "VG",
            bookingId: "BK003",
            turf: "TurfX Arena",
            date: "23 Aug 2026",
            slot: "08:00 PM - 09:00 PM",
            payment: "Paid",
            amount: "₹1,200"
        }

    };


    return bookings[
        bookingId
    ] || null;

}


/* =========================================================
   SHOW BOOKING
   ========================================================= */

function showBookingVerification(
    booking
) {

    const card =
        document.querySelector(
            "#qrVerificationCard"
        );

    const details =
        document.querySelector(
            "#qrBookingDetails"
        );

    if (card) {

        card.classList.add(
            "hidden"
        );

    }

    if (details) {

        details.classList.remove(
            "hidden"
        );

    }


    setText(
        "#qrCustomerAvatar",
        booking.initials
    );

    setText(
        "#qrCustomerName",
        booking.customer
    );

    setText(
        "#qrBookingId",
        "#" + booking.bookingId
    );

    setText(
        "#qrTurfName",
        booking.turf
    );

    setText(
        "#qrBookingDate",
        booking.date
    );

    setText(
        "#qrBookingSlot",
        booking.slot
    );

    setText(
        "#qrPaymentStatus",
        booking.payment
    );

    setText(
        "#qrBookingAmount",
        booking.amount
    );

    setText(
        "#qrEntryTime",
        "Not checked in"
    );

}


/* =========================================================
   INVALID QR
   ========================================================= */

function showQRVerificationError() {

    const card =
        document.querySelector(
            "#qrVerificationCard"
        );

    const details =
        document.querySelector(
            "#qrBookingDetails"
        );

    if (details) {

        details.classList.add(
            "hidden"
        );

    }

    if (!card) {
        return;
    }

    card.classList.remove(
        "hidden"
    );

    card.innerHTML = `

        <div class="qr-verification-icon">
            ❌
        </div>

        <h3>
            Invalid QR Ticket
        </h3>

        <p>
            This QR code is invalid, expired or
            does not belong to a TurfX booking.
        </p>

    `;

}


/* =========================================================
   CONFIRM CHECK-IN
   ========================================================= */

function confirmQRCheckIn() {

    const bookingId =
        document.querySelector(
            "#qrBookingId"
        )?.textContent;

    if (!bookingId) {
        return;
    }

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    setText(
        "#qrEntryTime",
        time
    );

    const status =
        document.querySelector(
            "#qrBookingStatus"
        );

    if (status) {

        status.textContent =
            "CHECKED IN";

        status.style.background =
            "#dcfce7";

        status.style.color =
            "#166534";

    }

    updateQRStatus(
        "Customer checked in successfully.",
        "success"
    );

    showAdminAlert(
        `${bookingId} check-in completed.`,
        "success"
    );

}


/* =========================================================
   CLEAR RESULT
   ========================================================= */

function clearQRResult() {

    lastScannedValue =
        "";

    const card =
        document.querySelector(
            "#qrVerificationCard"
        );

    const details =
        document.querySelector(
            "#qrBookingDetails"
        );

    if (details) {

        details.classList.add(
            "hidden"
        );

    }

    if (card) {

        card.classList.remove(
            "hidden"
        );

        card.innerHTML = `

            <div class="qr-verification-icon">
                🎟️
            </div>

            <h3>
                No Ticket Scanned
            </h3>

            <p>
                Scan a valid TurfX booking QR
                to view customer and slot details.
            </p>

        `;

    }

    updateQRStatus(
        "Ready for next scan.",
        "waiting"
    );

}


/* =========================================================
   DEMO SCAN
   ========================================================= */

function simulateQRScan() {

    processQRCode(
        "BK001"
    );

    updateQRStatus(
        "Demo QR scanned successfully.",
        "success"
    );

}


/* =========================================================
   UPDATE STATUS
   ========================================================= */

function updateQRStatus(
    message,
    type
) {

    const status =
        document.querySelector(
            "#qrScanStatus"
        );

    if (!status) {
        return;
    }

    status.className =
        "qr-scan-status " +
        type;

    status.innerHTML = `

        <span class="qr-status-dot"></span>

        ${message}

    `;

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

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


/* =========================================================
   ADMIN ALERT FALLBACK
   ========================================================= */

function showAdminAlert(
    message,
    type = "info"
) {

    if (
        typeof window.showAdminAlert ===
        "function" &&
        window.showAdminAlert !==
        showAdminAlert
    ) {

        window.showAdminAlert(
            message,
            type
        );

        return;

    }

    let alertBox =
        document.querySelector(
            ".admin-qr-alert"
        );

    if (!alertBox) {

        alertBox =
            document.createElement(
                "div"
            );

        alertBox.className =
            "admin-qr-alert";

        alertBox.style.position =
            "fixed";

        alertBox.style.right =
            "20px";

        alertBox.style.bottom =
            "20px";

        alertBox.style.zIndex =
            "10000";

        alertBox.style.padding =
            "12px 16px";

        alertBox.style.borderRadius =
            "8px";

        alertBox.style.background =
            "#16a34a";

        alertBox.style.color =
            "#ffffff";

        alertBox.style.fontSize =
            "12px";

        document.body.appendChild(
            alertBox
        );

    }

    alertBox.textContent =
        message;

    setTimeout(
        function () {

            alertBox.remove();

        },
        3000
    );

}


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (qrScannerRunning) {

            stopQRScanner();

        }

    }
);