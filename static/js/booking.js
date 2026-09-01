/* =========================================================
   TurfX - Booking JavaScript
   File: static/js/booking.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeDatePicker();
    initializeSlotSelection();
    initializeBookingFilters();
    initializeEquipmentSelection();
    initializePriceCalculation();
    initializeBookingForm();
    initializePaymentMethod();
    initializeCoupon();
    initializeBookingQuantity();

});


/* =========================================================
   DATE SELECTION
   ========================================================= */

function initializeDatePicker() {

    const dateInput =
        document.querySelector("#bookingDate");

    if (!dateInput) {
        return;
    }

    dateInput.addEventListener("change", function () {

        const selectedDate =
            dateInput.value;

        if (!selectedDate) {
            return;
        }

        loadAvailableSlots(selectedDate);

    });

}


/* =========================================================
   LOAD AVAILABLE SLOTS
   ========================================================= */

function loadAvailableSlots(date) {

    const slotsContainer =
        document.querySelector("#slotsContainer");

    if (!slotsContainer) {
        return;
    }

    /*
       Backend API later connect pannalam.

       Example:
       /api/available-slots?date=2026-08-20
    */

    slotsContainer.dataset.selectedDate =
        date;

    updateBookingMessage(
        "Available slots loaded for " + date,
        "info"
    );

}


/* =========================================================
   SLOT SELECTION
   ========================================================= */

function initializeSlotSelection() {

    const slots =
        document.querySelectorAll(
            ".booking-slot"
        );

    slots.forEach(function (slot) {

        if (
            slot.classList.contains("booked") ||
            slot.classList.contains("disabled")
        ) {
            return;
        }

        slot.addEventListener(
            "click",
            function () {

                selectBookingSlot(slot);

            }
        );

    });

}


/* =========================================================
   SELECT SLOT
   ========================================================= */

function selectBookingSlot(slot) {

    const alreadySelected =
        slot.classList.contains("selected");

    /*
       Single slot booking.
       Multiple slots venumna indha logic later change pannalam.
    */

    document
        .querySelectorAll(
            ".booking-slot.selected"
        )
        .forEach(function (item) {

            item.classList.remove(
                "selected"
            );

        });

    if (!alreadySelected) {

        slot.classList.add(
            "selected"
        );

        const slotId =
            slot.dataset.slotId;

        const slotPrice =
            parseFloat(
                slot.dataset.price
            ) || 0;

        updateSelectedSlot(
            slotId,
            slotPrice
        );

    } else {

        clearSelectedSlot();

    }

}


/* =========================================================
   UPDATE SELECTED SLOT
   ========================================================= */

function updateSelectedSlot(
    slotId,
    price
) {

    const slotInput =
        document.querySelector(
            "#selectedSlot"
        );

    const priceInput =
        document.querySelector(
            "#slotPrice"
        );

    if (slotInput) {

        slotInput.value =
            slotId || "";

    }

    if (priceInput) {

        priceInput.value =
            price;

    }

    calculateBookingTotal();

}


/* =========================================================
   CLEAR SELECTED SLOT
   ========================================================= */

function clearSelectedSlot() {

    const slotInput =
        document.querySelector(
            "#selectedSlot"
        );

    const priceInput =
        document.querySelector(
            "#slotPrice"
        );

    if (slotInput) {
        slotInput.value = "";
    }

    if (priceInput) {
        priceInput.value = "0";
    }

    calculateBookingTotal();

}


/* =========================================================
   GET SELECTED SLOT
   ========================================================= */

function getSelectedSlot() {

    const selected =
        document.querySelector(
            ".booking-slot.selected"
        );

    if (!selected) {
        return null;
    }

    return {

        id:
            selected.dataset.slotId,

        price:
            parseFloat(
                selected.dataset.price
            ) || 0,

        start:
            selected.dataset.start || "",

        end:
            selected.dataset.end || ""

    };

}


/* =========================================================
   BOOKING FILTERS
   ========================================================= */

function initializeBookingFilters() {

    const searchInput =
        document.querySelector(
            "#bookingSearch"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {

            const value =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const rows =
                document.querySelectorAll(
                    "[data-booking-row]"
                );

            rows.forEach(function (row) {

                const text =
                    row.textContent
                        .toLowerCase();

                row.style.display =
                    text.includes(value)
                        ? ""
                        : "none";

            });

        }
    );

}


/* =========================================================
   EQUIPMENT SELECTION
   ========================================================= */

function initializeEquipmentSelection() {

    const equipmentItems =
        document.querySelectorAll(
            ".equipment-item"
        );

    equipmentItems.forEach(
        function (item) {

            const checkbox =
                item.querySelector(
                    'input[type="checkbox"]'
                );

            if (!checkbox) {
                return;
            }

            checkbox.addEventListener(
                "change",
                function () {

                    if (checkbox.checked) {

                        item.classList.add(
                            "selected"
                        );

                    } else {

                        item.classList.remove(
                            "selected"
                        );

                    }

                    calculateBookingTotal();

                }
            );

        }
    );

}


/* =========================================================
   EQUIPMENT TOTAL
   ========================================================= */

function calculateEquipmentTotal() {

    let total = 0;

    const selectedEquipment =
        document.querySelectorAll(
            ".equipment-item input[type='checkbox']:checked"
        );

    selectedEquipment.forEach(
        function (checkbox) {

            const item =
                checkbox.closest(
                    ".equipment-item"
                );

            if (!item) {
                return;
            }

            const price =
                parseFloat(
                    item.dataset.price
                ) || 0;

            const quantityInput =
                item.querySelector(
                    ".equipment-quantity"
                );

            const quantity =
                quantityInput
                    ? parseInt(
                        quantityInput.value
                    ) || 1
                    : 1;

            total +=
                price * quantity;

        }
    );

    return total;

}


/* =========================================================
   PRICE CALCULATION
   ========================================================= */

function initializePriceCalculation() {

    document
        .querySelectorAll(
            ".equipment-quantity"
        )
        .forEach(function (input) {

            input.addEventListener(
                "input",
                function () {

                    calculateBookingTotal();

                }
            );

        });

}


/* =========================================================
   BOOKING TOTAL
   ========================================================= */

function calculateBookingTotal() {

    const slotPrice =
        parseFloat(
            document.querySelector(
                "#slotPrice"
            )?.value
        ) || 0;

    const equipmentTotal =
        calculateEquipmentTotal();

    const quantity =
        parseInt(
            document.querySelector(
                "#bookingQuantity"
            )?.value
        ) || 1;

    const subtotal =
        (slotPrice * quantity) +
        equipmentTotal;

    const discount =
        parseFloat(
            document.querySelector(
                "#discountAmount"
            )?.value
        ) || 0;

    const taxRate =
        parseFloat(
            document.querySelector(
                "#taxRate"
            )?.value
        ) || 0;

    const taxableAmount =
        Math.max(
            subtotal - discount,
            0
        );

    const tax =
        taxableAmount *
        taxRate /
        100;

    const total =
        taxableAmount + tax;

    updatePriceElement(
        "#subtotal",
        subtotal
    );

    updatePriceElement(
        "#taxAmount",
        tax
    );

    updatePriceElement(
        "#discountDisplay",
        discount
    );

    updatePriceElement(
        "#bookingTotal",
        total
    );

    return total;

}


/* =========================================================
   UPDATE PRICE ELEMENT
   ========================================================= */

function updatePriceElement(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) {
        return;
    }

    element.textContent =
        formatCurrency(value);

}


/* =========================================================
   CURRENCY FORMAT
   ========================================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0)
            .toFixed(2);

}


/* =========================================================
   BOOKING QUANTITY
   ========================================================= */

function initializeBookingQuantity() {

    const quantity =
        document.querySelector(
            "#bookingQuantity"
        );

    if (!quantity) {
        return;
    }

    quantity.addEventListener(
        "input",
        function () {

            if (
                parseInt(
                    quantity.value
                ) < 1
            ) {

                quantity.value = 1;

            }

            calculateBookingTotal();

        }
    );

}


/* =========================================================
   INCREASE QUANTITY
   ========================================================= */

function increaseBookingQuantity() {

    const input =
        document.querySelector(
            "#bookingQuantity"
        );

    if (!input) {
        return;
    }

    const current =
        parseInt(input.value) || 1;

    input.value =
        current + 1;

    calculateBookingTotal();

}


/* =========================================================
   DECREASE QUANTITY
   ========================================================= */

function decreaseBookingQuantity() {

    const input =
        document.querySelector(
            "#bookingQuantity"
        );

    if (!input) {
        return;
    }

    const current =
        parseInt(input.value) || 1;

    if (current > 1) {

        input.value =
            current - 1;

    }

    calculateBookingTotal();

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

    form.addEventListener(
        "submit",
        function (event) {

            const date =
                document.querySelector(
                    "#bookingDate"
                );

            const selectedSlot =
                document.querySelector(
                    "#selectedSlot"
                );

            if (
                !date ||
                !date.value
            ) {

                event.preventDefault();

                updateBookingMessage(
                    "Please select a booking date.",
                    "error"
                );

                return;

            }

            if (
                !selectedSlot ||
                !selectedSlot.value
            ) {

                event.preventDefault();

                updateBookingMessage(
                    "Please select a time slot.",
                    "error"
                );

                return;

            }

            const total =
                calculateBookingTotal();

            if (total <= 0) {

                event.preventDefault();

                updateBookingMessage(
                    "Invalid booking amount.",
                    "error"
                );

                return;

            }

            const button =
                form.querySelector(
                    "[type='submit']"
                );

            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Processing...";

            }

        }
    );

}


/* =========================================================
   PAYMENT METHOD
   ========================================================= */

function initializePaymentMethod() {

    const methods =
        document.querySelectorAll(
            'input[name="payment_method"]'
        );

    methods.forEach(function (method) {

        method.addEventListener(
            "change",
            function () {

                updatePaymentMethod(
                    method.value
                );

            }
        );

    });

}


/* =========================================================
   UPDATE PAYMENT METHOD
   ========================================================= */

function updatePaymentMethod(
    method
) {

    document
        .querySelectorAll(
            ".payment-method-details"
        )
        .forEach(function (element) {

            element.style.display =
                "none";

        });

    const selected =
        document.querySelector(
            `[data-payment-method="${method}"]`
        );

    if (selected) {

        selected.style.display =
            "block";

    }

}


/* =========================================================
   COUPON
   ========================================================= */

function initializeCoupon() {

    const couponButton =
        document.querySelector(
            "#applyCoupon"
        );

    if (!couponButton) {
        return;
    }

    couponButton.addEventListener(
        "click",
        function () {

            applyCoupon();

        }
    );

}


/* =========================================================
   APPLY COUPON
   ========================================================= */

function applyCoupon() {

    const couponInput =
        document.querySelector(
            "#couponCode"
        );

    if (!couponInput) {
        return;
    }

    const code =
        couponInput.value
            .trim()
            .toUpperCase();

    if (!code) {

        updateBookingMessage(
            "Please enter a coupon code.",
            "error"
        );

        return;

    }

    /*
       Backend coupon validation
       later connect pannalam.
    */

    const discountInput =
        document.querySelector(
            "#discountAmount"
        );

    if (discountInput) {

        /*
           Demo purpose:
           backend connect pannumbothu
           actual discount amount varum.
        */

        discountInput.value = "0";

    }

    calculateBookingTotal();

    updateBookingMessage(
        "Coupon applied successfully.",
        "success"
    );

}


/* =========================================================
   REMOVE COUPON
   ========================================================= */

function removeCoupon() {

    const couponInput =
        document.querySelector(
            "#couponCode"
        );

    const discountInput =
        document.querySelector(
            "#discountAmount"
        );

    if (couponInput) {

        couponInput.value = "";

    }

    if (discountInput) {

        discountInput.value = "0";

    }

    calculateBookingTotal();

    updateBookingMessage(
        "Coupon removed.",
        "info"
    );

}


/* =========================================================
   BOOKING MESSAGE
   ========================================================= */

function updateBookingMessage(
    message,
    type = "info"
) {

    let container =
        document.querySelector(
            ".booking-message"
        );

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.className =
            "booking-message";

        const form =
            document.querySelector(
                "#bookingForm"
            );

        if (form) {

            form.prepend(
                container
            );

        } else {

            document.body.prepend(
                container
            );

        }

    }

    container.textContent =
        message;

    container.dataset.type =
        type;

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

    /*
       Backend API later connect pannalam.

       Example:
       POST /booking/cancel/<bookingId>
    */

    updateBookingMessage(
        "Booking cancellation requested.",
        "success"
    );

}


/* =========================================================
   BOOKING SUMMARY
   ========================================================= */

function updateBookingSummary() {

    const slot =
        getSelectedSlot();

    const slotName =
        document.querySelector(
            "#summarySlot"
        );

    const slotPrice =
        document.querySelector(
            "#summarySlotPrice"
        );

    if (!slot) {

        if (slotName) {
            slotName.textContent =
                "Not selected";
        }

        if (slotPrice) {
            slotPrice.textContent =
                formatCurrency(0);
        }

        return;

    }

    if (slotName) {

        slotName.textContent =
            slot.start +
            " - " +
            slot.end;

    }

    if (slotPrice) {

        slotPrice.textContent =
            formatCurrency(
                slot.price
            );

    }

}


/* =========================================================
   PRINT BOOKING RECEIPT
   ========================================================= */

function printBookingReceipt() {

    window.print();

}


/* =========================================================
   BOOKING CONFIRMATION
   ========================================================= */

function showBookingSuccess(
    bookingId
) {

    const message =
        bookingId
            ? "Booking confirmed. Booking ID: " +
              bookingId
            : "Booking confirmed successfully.";

    updateBookingMessage(
        message,
        "success"
    );

}


/* =========================================================
   DISABLE PAST DATES
   ========================================================= */

function disablePastBookingDates() {

    const dateInput =
        document.querySelector(
            "#bookingDate"
        );

    if (!dateInput) {
        return;
    }

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    dateInput.min =
        today;

}


/* =========================================================
   INITIALIZE PAST DATE CHECK
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        disablePastBookingDates();

    }
);


/* =========================================================
   TURFX BOOKING JS LOADED
   ========================================================= */

console.log(
    "TurfX Booking JS loaded successfully."
);
document.addEventListener("DOMContentLoaded", function () {

    const slots =
        document.querySelectorAll(".detail-slot");

    slots.forEach(function (slot) {

        if (slot.disabled) {
            return;
        }

        slot.addEventListener("click", function () {

            slots.forEach(function (item) {
                item.classList.remove("selected");
            });

            slot.classList.add("selected");

            const slotId =
                slot.dataset.slotId || "";

            const price =
                parseFloat(slot.dataset.price) || 0;

            const hiddenSlot =
                document.querySelector("#selectedSlot");

            const hiddenPrice =
                document.querySelector("#slotPrice");

            const summarySlot =
                document.querySelector("#summarySlot");

            const summaryPrice =
                document.querySelector("#summarySlotPrice");

            if (hiddenSlot) {
                hiddenSlot.value = slotId;
            }

            if (hiddenPrice) {
                hiddenPrice.value = price;
            }

            if (summarySlot) {
                summarySlot.textContent =
                    `${slot.dataset.start} - ${slot.dataset.end}`;
            }

            if (summaryPrice) {
                summaryPrice.textContent =
                    `₹${price.toFixed(2)}`;
            }

        });

    });

});
/* =========================================================
   BOOKING PAGE HELPERS
   ========================================================= */

function increaseBookingQuantityItem(button) {

    const item =
        button.closest(".equipment-item");

    if (!item) {
        return;
    }

    const input =
        item.querySelector(".equipment-quantity");

    if (!input) {
        return;
    }

    input.value =
        (parseInt(input.value) || 0) + 1;

    updateBookingEquipmentTotal();
}


function decreaseBookingQuantityItem(button) {

    const item =
        button.closest(".equipment-item");

    if (!item) {
        return;
    }

    const input =
        item.querySelector(".equipment-quantity");

    if (!input) {
        return;
    }

    const value =
        parseInt(input.value) || 0;

    input.value =
        Math.max(value - 1, 0);

    updateBookingEquipmentTotal();
}


function updateBookingEquipmentTotal() {

    let total = 0;

    document
        .querySelectorAll(".equipment-item")
        .forEach(function (item) {

            const price =
                parseFloat(item.dataset.price) || 0;

            const quantity =
                parseInt(
                    item.querySelector(
                        ".equipment-quantity"
                    )?.value
                ) || 0;

            total += price * quantity;
        });

    const element =
        document.querySelector("#equipmentTotal");

    if (element) {

        element.textContent =
            `₹${total.toFixed(2)}`;

    }

}
/* =========================================================
   PAYMENT METHOD SWITCHING
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const paymentMethods =
        document.querySelectorAll(
            'input[name="payment_method"]'
        );

    const upiPanel =
        document.querySelector(
            "#upiPaymentPanel"
        );

    const cardPanel =
        document.querySelector(
            "#cardPaymentPanel"
        );

    const cashPanel =
        document.querySelector(
            "#cashPaymentPanel"
        );

    paymentMethods.forEach(
        function (method) {

            method.addEventListener(
                "change",
                function () {

                    if (upiPanel) {
                        upiPanel.style.display =
                            "none";
                    }

                    if (cardPanel) {
                        cardPanel.style.display =
                            "none";
                    }

                    if (cashPanel) {
                        cashPanel.style.display =
                            "none";
                    }

                    if (method.value === "upi") {

                        if (upiPanel) {
                            upiPanel.style.display =
                                "block";
                        }

                    }

                    if (method.value === "card") {

                        if (cardPanel) {
                            cardPanel.style.display =
                                "block";
                        }

                    }

                    if (method.value === "cash") {

                        if (cashPanel) {
                            cashPanel.style.display =
                                "block";
                        }

                    }

                    document
                        .querySelectorAll(
                            ".payment-tab"
                        )
                        .forEach(
                            function (tab) {

                                tab.classList.remove(
                                    "active"
                                );

                            }
                        );

                    method
                        .closest(".payment-tab")
                        ?.classList.add("active");

                }
            );

        }
    );

});