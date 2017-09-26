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

    /*
        // on submission of a new word, reset input fields
        $('#add_word_form').on('submit', function(e) {

            e.preventDefault();
            e.stopImmediatePropagation();
            setTimeout(function() { // setTimeout: make sure that the submission is delivered to the server before clearing values

                $('#front_input').val('');
                $('#back_input').val('');
                $('#front_input').focus();
            });
        }); */
});