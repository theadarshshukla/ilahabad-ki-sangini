import {
    loginReader,
    resendVerification,
    resetPassword
} from "./auth.js";

import {
    auth
} from "./firebase-config.js";


const form =
    document.getElementById(
        "loginForm"
    );

const message =
    document.getElementById(
        "message"
    );

const resendBtn =
    document.getElementById(
        "resendBtn"
    );

const resetBtn =
    document.getElementById(
        "resetBtn"
    );

const loader =
    document.getElementById(
        "loginLoader"
    );

const text =
    document.getElementById(
        "loginText"
    );


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        loader.style.display =
            "inline";

        text.style.display =
            "none";


        message.className =
            "message";

        message.textContent =
            "";


        try {

            await loginReader(
                email,
                password
            );


            window.location.href =
                "ebook.html";


        } catch (error) {

            console.error(error);


            if (
                error.message ===
                "EMAIL_NOT_VERIFIED"
            ) {

                message.className =
                    "message warning";

                message.textContent =
                    "पहले अपना email verify करें।";


                resendBtn.style.display =
                    "block";


                return;

            }


            let msg =
                "Login failed.";


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                msg =
                    "Email या password गलत है।";

            }


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                msg =
                    "यह email registered नहीं है।";

            }


            message.className =
                "message error";

            message.textContent =
                msg;

        }


        loader.style.display =
            "none";

        text.style.display =
            "inline";

    }
);


resendBtn.addEventListener(
    "click",
    async () => {

        try {

            await resendVerification();

            message.className =
                "message success";

            message.textContent =
                "Verification email दोबारा भेज दिया गया है।";

        } catch (error) {

            console.error(error);

            message.className =
                "message error";

            message.textContent =
                "Verification email भेजा नहीं जा सका।";

        }

    }
);


resetBtn.addEventListener(
    "click",
    async () => {

        const email =
            document.getElementById(
                "email"
            ).value.trim();


        if (!email) {

            message.className =
                "message warning";

            message.textContent =
                "पहले अपना email लिखें।";

            return;

        }


        try {

            await resetPassword(
                email
            );


            message.className =
                "message success";

            message.textContent =
                "Password reset email भेज दिया गया है।";

        } catch (error) {

            console.error(error);

            message.className =
                "message error";

            message.textContent =
                "Password reset नहीं हो सका।";

        }

    }
);