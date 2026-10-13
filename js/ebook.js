(function () {

    "use strict";

    const loader = document.getElementById(
        "ebook-loader"
    );

    const reader = document.getElementById(
        "ebook-reader"
    );

    function showLoader() {

        if (loader) {
            loader.classList.remove("hide");
        }

    }

    function hideLoader() {

        if (loader) {
            loader.classList.add("hide");
        }

    }

    function denyAccess() {

        if (reader) {
            reader.style.display = "none";
        }

        window.location.replace(
            "auth.html"
        );

    }

    function startReader() {

        if (!reader) {
            return;
        }

        reader.style.display = "block";

        if (typeof initializeFlipbook === "function") {

            initializeFlipbook();

        } else {

            console.error(
                "initializeFlipbook() not found."
            );

        }

    }

    showLoader();

    BookAuth.onAuthStateChanged(
        function (user) {

            if (!user) {

                denyAccess();
                return;

            }

            if (!user.emailVerified) {

                BookAuth.logout()
                    .finally(denyAccess);

                return;

            }

            startReader();

        }
    );

})();