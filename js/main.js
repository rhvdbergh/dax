$(document).ready(function() {
    var loggedIn = false;
    var key = localStorage.getItem('key');

    console.log('Key: ' + key);
    if (key != null) { // there was something stored in the localStorage
        loggedIn = true;
    }

    if (!loggedIn) {
        /* $('#nav_btn_add').hide();
         $('#nav_btn_learn').hide();
         $('#nav_btn_review').hide();
         $('#nav_btn_account').hide(); */
    }

    $('.submit_login_btn').on('click', function() {

        // send login details to the server
        // at this stage, the server will create a new user if no email address
        // exists; in the future, there will be a sign-up form
        console.log('Submitted!');
    });

    // if the user login is successful:
    if (loggedIn) {
        $('.navbar-right').append("<li id='nav_btn_add'><a href='./html/add.html'>Add words</a></li>");
        $('.navbar-right').append("<li id='nav_btn_learn'><a href='./html/learn.html'>Learn</a></li>");
        $('.navbar-right').append("<li id='nav_btn_review'><a href='./html/review.html'>Review</a></li>");
        $('.navbar-right').append("<li id='nav_btn_account'><a href=''>Account</a></li>");
        $('.login_container').hide();
    }

});