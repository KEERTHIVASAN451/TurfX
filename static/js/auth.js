/* =========================================================
   TurfX - Authentication JavaScript
   File: static/js/auth.js
   ========================================================= */


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeAuth();

});


/* =========================================================
   INITIALIZE AUTH SYSTEM
   ========================================================= */

function initializeAuth() {

    initializePasswordToggle();
    initializePasswordStrength();
    initializePasswordMatch();

    initializeLoginValidation();
    initializeRegisterValidation();

    initializeForgotPassword();
    initializeResetPassword();

    initializeOTP();

    initializeRememberMe();

    initializeLoadingForms();

}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

function initializePasswordToggle() {

    const buttons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );

    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    button.dataset.passwordToggle;

                const input =
                    document.getElementById(
                        targetId
                    );

                if (!input) {
                    return;
                }

                if (
                    input.type === "password"
                ) {

                    input.type = "text";

                    button.textContent = "Hide";

                } else {

                    input.type = "password";

                    button.textContent = "Show";

                }

            }
        );

    });

}


/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

function initializePasswordStrength() {

    const password =
        document.querySelector("#password");

    const strengthBar =
        document.querySelector("#passwordStrength");

    const strengthText =
        document.querySelector(
            "#passwordStrengthText"
        );

    if (!password) {
        return;
    }

    password.addEventListener(
        "input",
        function () {

            const value =
                password.value;

            const strength =
                calculatePasswordStrength(
                    value
                );

            if (strengthBar) {

                strengthBar.style.width =
                    strength + "%";

            }

            if (!strengthText) {
                return;
            }

            if (strength === 0) {

                strengthText.textContent = "";

            } else if (strength < 40) {

                strengthText.textContent =
                    "Weak password";

            } else if (strength < 70) {

                strengthText.textContent =
                    "Medium password";

            } else if (strength < 90) {

                strengthText.textContent =
                    "Strong password";

            } else {

                strengthText.textContent =
                    "Very strong password";

            }

        }
    );

}


/* =========================================================
   CALCULATE PASSWORD STRENGTH
   ========================================================= */

function calculatePasswordStrength(
    password
) {

    if (!password) {
        return 0;
    }

    let score = 0;

    if (password.length >= 6) {
        score += 20;
    }

    if (password.length >= 8) {
        score += 20;
    }

    if (/[a-z]/.test(password)) {
        score += 15;
    }

    if (/[A-Z]/.test(password)) {
        score += 15;
    }

    if (/[0-9]/.test(password)) {
        score += 15;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score += 15;
    }

    return Math.min(score, 100);

}


/* =========================================================
   PASSWORD MATCH
   ========================================================= */

function initializePasswordMatch() {

    const password =
        document.querySelector("#password");

    const confirmPassword =
        document.querySelector(
            "#confirmPassword"
        );

    const message =
        document.querySelector(
            "#passwordMatchMessage"
        );

    if (
        !password ||
        !confirmPassword
    ) {
        return;
    }

    confirmPassword.addEventListener(
        "input",
        function () {

            if (!message) {
                return;
            }

            if (
                password.value ===
                confirmPassword.value
            ) {

                message.textContent =
                    "Passwords match";

                message.style.color =
                    "#16a34a";

            } else {

                message.textContent =
                    "Passwords do not match";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}


/* =========================================================
   LOGIN VALIDATION
   ========================================================= */

function initializeLoginValidation() {

    const form =
        document.querySelector(
            "#loginForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            clearAuthErrors();

            const email =
                document.querySelector(
                    "#email"
                );

            const password =
                document.querySelector(
                    "#password"
                );

            let valid = true;

            if (
                !email ||
                !isValidEmail(
                    email.value
                )
            ) {

                showFieldError(
                    email,
                    "Enter a valid email address."
                );

                valid = false;

            }

            if (
                !password ||
                password.value.trim() === ""
            ) {

                showFieldError(
                    password,
                    "Enter your password."
                );

                valid = false;

            }

            if (!valid) {

                event.preventDefault();

            }

        }
    );

}


/* =========================================================
   REGISTER VALIDATION
   ========================================================= */

function initializeRegisterValidation() {

    const form =
        document.querySelector(
            "#registerForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            clearAuthErrors();

            const name =
                document.querySelector(
                    "#name"
                );

            const email =
                document.querySelector(
                    "#email"
                );

            const phone =
                document.querySelector(
                    "#phone"
                );

            const password =
                document.querySelector(
                    "#password"
                );

            const confirmPassword =
                document.querySelector(
                    "#confirmPassword"
                );

            const terms =
                document.querySelector(
                    "#terms"
                );

            let valid = true;

            if (
                !name ||
                name.value.trim().length < 2
            ) {

                showFieldError(
                    name,
                    "Enter your full name."
                );

                valid = false;

            }

            if (
                !email ||
                !isValidEmail(
                    email.value
                )
            ) {

                showFieldError(
                    email,
                    "Enter a valid email address."
                );

                valid = false;

            }

            if (
                phone &&
                phone.value.trim() !== "" &&
                !isValidPhone(
                    phone.value
                )
            ) {

                showFieldError(
                    phone,
                    "Enter a valid phone number."
                );

                valid = false;

            }

            if (
                !password ||
                password.value.length < 6
            ) {

                showFieldError(
                    password,
                    "Password must contain at least 6 characters."
                );

                valid = false;

            }

            if (
                !confirmPassword ||
                confirmPassword.value !==
                password.value
            ) {

                showFieldError(
                    confirmPassword,
                    "Passwords do not match."
                );

                valid = false;

            }

            if (
                terms &&
                !terms.checked
            ) {

                showAuthMessage(
                    "Please accept the Terms and Conditions.",
                    "error"
                );

                valid = false;

            }

            if (!valid) {

                event.preventDefault();

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD VALIDATION
   ========================================================= */

function initializeForgotPassword() {

    const form =
        document.querySelector(
            "#forgotPasswordForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            clearAuthErrors();

            const email =
                document.querySelector(
                    "#email"
                );

            if (
                !email ||
                !isValidEmail(
                    email.value
                )
            ) {

                event.preventDefault();

                showFieldError(
                    email,
                    "Enter a valid email address."
                );

            }

        }
    );

}


/* =========================================================
   RESET PASSWORD VALIDATION
   ========================================================= */

function initializeResetPassword() {

    const form =
        document.querySelector(
            "#resetPasswordForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            clearAuthErrors();

            const password =
                document.querySelector(
                    "#password"
                );

            const confirmPassword =
                document.querySelector(
                    "#confirmPassword"
                );

            let valid = true;

            if (
                !password ||
                password.value.length < 6
            ) {

                showFieldError(
                    password,
                    "Password must contain at least 6 characters."
                );

                valid = false;

            }

            if (
                !confirmPassword ||
                confirmPassword.value !==
                password.value
            ) {

                showFieldError(
                    confirmPassword,
                    "Passwords do not match."
                );

                valid = false;

            }

            if (!valid) {

                event.preventDefault();

            }

        }
    );

}


/* =========================================================
   OTP SYSTEM
   ========================================================= */

function initializeOTP() {

    const otpInputs =
        document.querySelectorAll(
            ".otp-input"
        );

    const hiddenOtp =
        document.querySelector(
            "#otpValue"
        );

    const resendButton =
        document.querySelector(
            "#resendOTP"
        );

    if (!otpInputs.length) {
        return;
    }


    /* ---------- Input Handling ---------- */

    otpInputs.forEach(
        function (input, index) {

            input.addEventListener(
                "input",
                function () {

                    input.value =
                        input.value.replace(
                            /\D/g,
                            ""
                        );

                    updateHiddenOTP();

                    if (
                        input.value &&
                        index <
                        otpInputs.length - 1
                    ) {

                        otpInputs[
                            index + 1
                        ].focus();

                    }

                }
            );


            /* ---------- Backspace ---------- */

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Backspace" &&
                        !input.value &&
                        index > 0
                    ) {

                        otpInputs[
                            index - 1
                        ].focus();

                    }

                }
            );


            /* ---------- Paste OTP ---------- */

            input.addEventListener(
                "paste",
                function (event) {

                    event.preventDefault();

                    const pasted =
                        (
                            event.clipboardData ||
                            window.clipboardData
                        )
                        .getData("text")
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            otpInputs.length
                        );

                    pasted
                        .split("")
                        .forEach(
                            function (
                                digit,
                                digitIndex
                            ) {

                                if (
                                    otpInputs[
                                        digitIndex
                                    ]
                                ) {

                                    otpInputs[
                                        digitIndex
                                    ].value =
                                        digit;

                                }

                            }
                        );

                    updateHiddenOTP();

                    const lastIndex =
                        Math.min(
                            pasted.length,
                            otpInputs.length
                        ) - 1;

                    if (
                        lastIndex >= 0
                    ) {

                        otpInputs[
                            lastIndex
                        ].focus();

                    }

                }
            );

        }
    );


    /* ---------- OTP Form ---------- */

    const form =
        document.querySelector(
            'form[action="/verify-otp"]'
        );

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                updateHiddenOTP();

                const otp =
                    getOTPValue();

                if (
                    otp.length !==
                    otpInputs.length
                ) {

                    event.preventDefault();

                    showAuthMessage(
                        "Please enter the complete OTP.",
                        "error"
                    );

                    return;

                }

            }
        );

    }


    /* ---------- Resend ---------- */

    if (resendButton) {

        startOTPResendTimer(
            60
        );

        resendButton.addEventListener(
            "click",
            function () {

                resendOTP();

            }
        );

    }


    /* ---------- Hidden OTP ---------- */

    function updateHiddenOTP() {

        if (!hiddenOtp) {
            return;
        }

        hiddenOtp.value =
            Array.from(
                otpInputs
            )
            .map(
                function (input) {
                    return input.value;
                }
            )
            .join("");

    }

}


/* =========================================================
   GET OTP VALUE
   ========================================================= */

function getOTPValue() {

    const otpInputs =
        document.querySelectorAll(
            ".otp-input"
        );

    return Array.from(
        otpInputs
    )
    .map(
        function (input) {
            return input.value;
        }
    )
    .join("");

}


/* =========================================================
   OTP RESEND TIMER
   ========================================================= */

function startOTPResendTimer(
    seconds
) {

    const timerElement =
        document.querySelector(
            "#otpTimer"
        );

    const resendButton =
        document.querySelector(
            "#resendOTP"
        );

    if (
        !timerElement ||
        !resendButton
    ) {
        return;
    }

    let remaining =
        seconds;

    resendButton.disabled =
        true;

    timerElement.textContent =
        remaining;

    const interval =
        setInterval(
            function () {

                remaining--;

                timerElement.textContent =
                    remaining;

                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        interval
                    );

                    resendButton.disabled =
                        false;

                    timerElement.textContent =
                        "0";

                }

            },
            1000
        );

}


/* =========================================================
   RESEND OTP
   ========================================================= */

function resendOTP() {

    const resendButton =
        document.querySelector(
            "#resendOTP"
        );

    if (!resendButton) {
        return;
    }

    /*
       Backend API later connect pannalam.
       Example:
       POST /resend-otp
    */

    showAuthMessage(
        "A new OTP has been requested.",
        "success"
    );

    startOTPResendTimer(
        60
    );

}


/* =========================================================
   REMEMBER ME
   ========================================================= */

function initializeRememberMe() {

    const checkbox =
        document.querySelector(
            "#rememberMe"
        );

    if (!checkbox) {
        return;
    }

    const saved =
        localStorage.getItem(
            "turfxRememberMe"
        );

    checkbox.checked =
        saved === "true";

    checkbox.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "turfxRememberMe",
                checkbox.checked
            );

        }
    );

}


/* =========================================================
   LOADING FORMS
   ========================================================= */

function initializeLoadingForms() {

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
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email.trim()
        );

}


/* =========================================================
   PHONE VALIDATION
   ========================================================= */

function isValidPhone(
    phone
) {

    const cleaned =
        phone.replace(
            /[\s\-()+]/g,
            ""
        );

    return /^\d{10,15}$/.test(
        cleaned
    );

}


/* =========================================================
   SHOW FIELD ERROR
   ========================================================= */

function showFieldError(
    input,
    message
) {

    if (!input) {
        return;
    }

    input.classList.add(
        "input-error"
    );

    const existing =
        input.parentElement.querySelector(
            ".auth-error"
        );

    if (existing) {

        existing.remove();

    }

    const error =
        document.createElement(
            "small"
        );

    error.className =
        "auth-error";

    error.textContent =
        message;

    input.parentElement.appendChild(
        error
    );

}


/* =========================================================
   CLEAR ERRORS
   ========================================================= */

function clearAuthErrors() {

    document
        .querySelectorAll(
            ".auth-error"
        )
        .forEach(
            function (error) {

                error.remove();

            }
        );

    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(
            function (input) {

                input.classList.remove(
                    "input-error"
                );

            }
        );

}


/* =========================================================
   GLOBAL AUTH MESSAGE
   ========================================================= */

function showAuthMessage(
    message,
    type = "info"
) {

    let box =
        document.querySelector(
            ".auth-message"
        );

    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.className =
            "auth-message";

        const form =
            document.querySelector(
                "form"
            );

        if (form) {

            form.prepend(
                box
            );

        } else {

            document.body.prepend(
                box
            );

        }

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
        3500
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function confirmLogout(
    logoutUrl = "/logout"
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );

    if (confirmed) {

        window.location.href =
            logoutUrl;

    }

}


/* =========================================================
   AUTH JS READY
   ========================================================= */

console.log(
    "TurfX Authentication JavaScript loaded successfully."
);