const auth = firebase.auth();

const $ = id => document.getElementById(id);

const message = $("message");
const authArea = $("authArea");
const verifyArea = $("verifyArea");
const verifyEmail = $("verifyEmail");


function showMessage(text, error = false){

    message.textContent = text;

    message.className =
        "message show" +
        (error ? " error" : "");
}


function clearMessage(){

    message.textContent = "";

    message.className = "message";
}


function isGmail(email){

    return /^[^\s@]+@gmail\.com$/i
        .test(email.trim());
}


function showLogin(){

    $("loginTab")
        .classList.add("active");

    $("signupTab")
        .classList.remove("active");

    $("loginForm")
        .classList.add("active");

    $("signupForm")
        .classList.remove("active");

    authArea.style.display = "block";

    verifyArea.classList.remove("show");

    clearMessage();
}


function showSignup(){

    $("signupTab")
        .classList.add("active");

    $("loginTab")
        .classList.remove("active");

    $("signupForm")
        .classList.add("active");

    $("loginForm")
        .classList.remove("active");

    authArea.style.display = "block";

    verifyArea.classList.remove("show");

    clearMessage();
}


function showVerification(user){

    authArea.style.display = "none";

    verifyArea.classList.add("show");

    verifyEmail.textContent =
        user.email;

    showMessage(
        "Verification email भेज दिया गया है। Gmail inbox और spam folder check करें।"
    );
}


async function createAccount(){

    const email =
        $("signupEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        $("signupPassword")
            .value;

    const confirm =
        $("signupConfirm")
            .value;


    if(!isGmail(email)){

        throw new Error(
            "केवल valid @gmail.com address इस्तेमाल करें।"
        );
    }


    if(password.length < 6){

        throw new Error(
            "Password कम से कम 6 characters का होना चाहिए।"
        );
    }


    if(password !== confirm){

        throw new Error(
            "दोनों passwords match नहीं कर रहे हैं।"
        );
    }


    const result =
        await auth
            .createUserWithEmailAndPassword(
                email,
                password
            );


    await result.user
        .sendEmailVerification();


    showVerification(
        result.user
    );
}


async function loginUser(){

    const email =
        $("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        $("loginPassword")
            .value;


    if(!isGmail(email)){

        throw new Error(
            "केवल valid @gmail.com address इस्तेमाल करें।"
        );
    }


    const result =
        await auth
            .signInWithEmailAndPassword(
                email,
                password
            );


    /*
       Firebase cached emailVerified
       value को refresh करें.
    */

    await result.user.reload();


    const user =
        auth.currentUser;


    /*
       सबसे important check.
    */

    if(!user || !user.emailVerified){

        showVerification(user);

        showMessage(
            "आपका Gmail अभी verified नहीं है। पहले verification link खोलें।",
            true
        );

        return;
    }


    /*
       केवल verified user यहाँ आएगा.
    */

    window.location.replace(
        "ebook.html"
    );
}


async function checkVerification(){

    const user =
        auth.currentUser;


    if(!user){

        showLogin();

        showMessage(
            "कृपया पहले login करें।",
            true
        );

        return;
    }


    /*
       Firebase server से user
       information refresh करें.
    */

    await user.reload();


    const freshUser =
        auth.currentUser;


    if(
        freshUser &&
        freshUser.emailVerified
    ){

        window.location.replace(
            "ebook.html"
        );

        return;
    }


    showMessage(
        "Email अभी verify नहीं हुआ है। Gmail में भेजे गए verification link को खोलें।",
        true
    );
}


async function resendVerification(){

    const user =
        auth.currentUser;


    if(!user){

        showLogin();

        return;
    }


    await user.reload();


    if(auth.currentUser.emailVerified){

        window.location.replace(
            "ebook.html"
        );

        return;
    }


    await auth.currentUser
        .sendEmailVerification();


    showMessage(
        "Verification email दोबारा भेज दिया गया है।"
    );
}


/* LOGIN TAB */

$("loginTab")
    .addEventListener(
        "click",
        showLogin
    );


/* SIGNUP TAB */

$("signupTab")
    .addEventListener(
        "click",
        showSignup
    );


/* LOGIN */

$("loginForm")
    .addEventListener(
        "submit",
        async function(event){

            event.preventDefault();

            const button =
                $("loginBtn");

            button.disabled = true;

            clearMessage();

            try{

                await loginUser();

            }catch(error){

                showMessage(
                    error.message ||
                    "Login failed.",
                    true
                );

            }finally{

                button.disabled = false;

            }

        }
    );


/* SIGNUP */

$("signupForm")
    .addEventListener(
        "submit",
        async function(event){

            event.preventDefault();

            const button =
                $("signupBtn");

            button.disabled = true;

            clearMessage();

            try{

                await createAccount();

            }catch(error){

                showMessage(
                    error.message ||
                    "Account creation failed.",
                    true
                );

            }finally{

                button.disabled = false;

            }

        }
    );


/* RESEND */

$("resendBtn")
    .addEventListener(
        "click",
        async function(){

            try{

                await resendVerification();

            }catch(error){

                showMessage(
                    error.message ||
                    "Verification email नहीं भेजा जा सका।",
                    true
                );

            }

        }
    );


/* CHECK */

$("checkBtn")
    .addEventListener(
        "click",
        async function(){

            try{

                await checkVerification();

            }catch(error){

                showMessage(
                    error.message ||
                    "Verification check failed.",
                    true
                );

            }

        }
    );


/*
   IMPORTANT:

   यहाँ deliberately कोई ऐसा code नहीं है:

   auth.onAuthStateChanged(user => {
       if(user) ebook.html
   });

   इसलिए auth.html खोलते ही existing Firebase
   session के कारण automatic ebook redirect नहीं होगा.
*/