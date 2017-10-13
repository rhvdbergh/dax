$(document).ready(function() {
    var loggedIn = false;
    var key = localStorage.getItem('key');
    var currenttable = localStorage.getItem('currenttable');

    $('.submit_login_btn').on('click', function() {

        // send login details to the server
        // at this stage, the server will create a new user if no email address
        // exists; in the future, there will be a sign-up form
        console.log('Submitted!');
        // check to see if the login is valid
    });

    if (key != null) { // if there is no key, leave loggedIn = false

        $.get("?validateJWT" + key, function(data) {
            if (data === "0") { // there is something wrong with the token. New login and token required
                localStorage.removeItem('key'); // key removed so new key will be generated
                console.log("User token existed, but was corrupt. Token removed & new login required.");
            }
            if (data === "1") { // valid token
                loggedIn = true;
            }
            if (data === "2") { // token has expired
                console.log("Token has expired. New login required.");
            }
            doLoginLogic();
        });
    } else {
        doLoginLogic();
    }

    function doLoginLogic() {

        if (!loggedIn) {
            $('.login_container').append("<input type='email' placeholder='Email' name='uname' required>");
            $('.login_container').append("<input type='password' placeholder='Password' name='psw' required>");
            $('.login_container').append("<button type='submit' class='submit_login_btn' name='login_btn' value='login_btn'>Login</button>");
            $('.login_container').append("<p class='centered'>or</p>");
            $('.signup_container').append("<a href='./html/signup.html' class='submit_signup_btn'>Sign up</a>");
            $('.create_table_container').hide();
        }

        // if the user login is successful:
        if (loggedIn) {
            $('.navbar-right').append("<li id='nav_btn_add'><a href='./html/add.html'>Add words</a></li>");
            $('.navbar-right').append("<li id='nav_btn_learn'><a href='./html/learn.html'>Learn</a></li>");
            $('.navbar-right').append("<li id='nav_btn_review'><a href='./html/review.html'>Review</a></li>");
            // the logout button removes the localStorage key - the script is appended here
            $('.navbar-right').append("<li class='logout'><a href='./index.html'>Logout</a></li><script>$('.logout').on('click', function() {localStorage.removeItem('key');});</script>");
            //  $('.navbar-right').append("<li id='nav_btn_account'><a href=''>Account</a></li>");
            $('.login_and_signup_container').hide();
            if (currenttable === null || currenttable != "" || currenttable != "none") { // the user doesn't appear to have any tables, and no table is selected
                $('.create_table_container').show();
                $('.create_table_container').append("<button type='submit' class='create_table_btn' name='create_table_btn' value='create_table_btn'>Create a new set of cards</script>");
            }
        }
    }
});