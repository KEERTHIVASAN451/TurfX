/* =========================================================
   TurfX - Charts JavaScript
   File: static/js/charts.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeCharts();

});


/* =========================================================
   INITIALIZE ALL CHARTS
   ========================================================= */

function initializeCharts() {

    initializeBookingChart();
    initializeRevenueChart();
    initializeUserChart();
    initializeTournamentChart();
    initializeSlotChart();

}


/* =========================================================
   CREATE CHART
   ========================================================= */

function createChart(
    canvasId,
    type,
    labels,
    data,
    label
) {

    const canvas =
        document.getElementById(canvasId);

    if (!canvas) {
        return null;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return null;

    }

    return new Chart(
        canvas,
        {
            type: type,

            data: {
                labels: labels,

                datasets: [
                    {
                        label: label,

                        data: data,

                        borderWidth: 2,

                        tension: 0.4,

                        fill: false
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {
                        beginAtZero: true
                    }

                }

            }

        }
    );

}


/* =========================================================
   BOOKING CHART
   ========================================================= */

function initializeBookingChart() {

    const canvas =
        document.getElementById(
            "bookingChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        getChartData(
            canvas,
            "labels"
        );

    const data =
        getChartData(
            canvas,
            "values"
        );

    createChart(
        "bookingChart",
        "line",
        labels,
        data,
        "Bookings"
    );

}


/* =========================================================
   REVENUE CHART
   ========================================================= */

function initializeRevenueChart() {

    const canvas =
        document.getElementById(
            "revenueChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        getChartData(
            canvas,
            "labels"
        );

    const data =
        getChartData(
            canvas,
            "values"
        );

    createChart(
        "revenueChart",
        "bar",
        labels,
        data,
        "Revenue"
    );

}


/* =========================================================
   USER CHART
   ========================================================= */

function initializeUserChart() {

    const canvas =
        document.getElementById(
            "userChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        getChartData(
            canvas,
            "labels"
        );

    const data =
        getChartData(
            canvas,
            "values"
        );

    createChart(
        "userChart",
        "line",
        labels,
        data,
        "Users"
    );

}


/* =========================================================
   TOURNAMENT CHART
   ========================================================= */

function initializeTournamentChart() {

    const canvas =
        document.getElementById(
            "tournamentChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        getChartData(
            canvas,
            "labels"
        );

    const data =
        getChartData(
            canvas,
            "values"
        );

    createChart(
        "tournamentChart",
        "bar",
        labels,
        data,
        "Tournaments"
    );

}


/* =========================================================
   SLOT OCCUPANCY CHART
   ========================================================= */

function initializeSlotChart() {

    const canvas =
        document.getElementById(
            "slotChart"
        );

    if (!canvas) {
        return;
    }

    const labels =
        getChartData(
            canvas,
            "labels"
        );

    const data =
        getChartData(
            canvas,
            "values"
        );

    createChart(
        "slotChart",
        "doughnut",
        labels,
        data,
        "Slot Usage"
    );

}


/* =========================================================
   GET DATA FROM CANVAS
   ========================================================= */

function getChartData(
    canvas,
    type
) {

    const value =
        canvas.dataset[type];

    if (!value) {
        return [];
    }

    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        console.error(
            "Invalid chart data:",
            error
        );

        return [];

    }

}


/* =========================================================
   UPDATE EXISTING CHART
   ========================================================= */

function updateChart(
    chart,
    labels,
    data
) {

    if (!chart) {
        return;
    }

    chart.data.labels =
        labels;

    chart.data.datasets[0].data =
        data;

    chart.update();

}


/* =========================================================
   DESTROY CHART
   ========================================================= */

function destroyChart(
    chart
) {

    if (!chart) {
        return;
    }

    chart.destroy();

}


/* =========================================================
   CREATE CUSTOM PIE CHART
   ========================================================= */

function createPieChart(
    canvasId,
    labels,
    data,
    label
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return null;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {

        return null;

    }

    return new Chart(
        canvas,
        {

            type: "pie",

            data: {

                labels: labels,

                datasets: [
                    {

                        label: label,

                        data: data,

                        borderWidth: 1

                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }
    );

}


/* =========================================================
   CREATE DOUGHNUT CHART
   ========================================================= */

function createDoughnutChart(
    canvasId,
    labels,
    data,
    label
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return null;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {

        return null;

    }

    return new Chart(
        canvas,
        {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [
                    {

                        label: label,

                        data: data,

                        borderWidth: 1

                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }
    );

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatChartCurrency(
    value
) {

    return "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN"
            );

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatChartNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   TURFX CHARTS LOADED
   ========================================================= */

console.log(
    "TurfX Charts JS loaded successfully."
);
/* =========================================================
   TURFX ADMIN REVENUE CHART
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const canvas =
            document.querySelector(
                "#adminRevenueChart"
            );

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const labels =
            JSON.parse(
                canvas.dataset.labels || "[]"
            );

        const values =
            JSON.parse(
                canvas.dataset.values || "[]"
            );

        new Chart(
            canvas,
            {
                type: "line",

                data: {
                    labels: labels,

                    datasets: [
                        {
                            label: "Revenue",

                            data: values,

                            tension: 0.35,

                            fill: true
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

    }
);