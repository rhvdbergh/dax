var loggedIn = false;

$(document).ready(function() {
    if (!loggedIn) {
        $('#nav_btn_add').hide();
        $('#nav_btn_learn').hide();
        $('#nav_btn_review').hide();
        $('#nav_btn_account').hide();
    }

    $('#submit_login_btn').on('click', function() {

        // send login details to the server
        // at this stage, the server will create a new user if no email address
        // exists; in the future, there will be a sign-up form
        console.log('Submitted!');
    });
});