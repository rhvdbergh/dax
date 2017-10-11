$(document).ready(function() {


    var email = $('#signup_email');
    var emailVal = $('#signup_email_val');
    var psw = $('#signup_psw');
    var pswVal = $('#signup_psw_val');

    // check to see if both emails entered for usernames are the same
    function validateEmail() {
        if (email.val() != emailVal.val()) {
            emailVal.append("<script>document.getElementById('signup_email').setCustomValidity('Emails do not match!');");
        } else {
            emailVal.append("<script>document.getElementById('signup_email').setCustomValidity('');");
        }
    }

    // check to see if both passwords entered are the same
    function validatePsw() {
        if (psw.val() != pswVal.val()) {
            pswVal.append("<script>document.getElementById('signup_psw_val').setCustomValidity('Passwords do not match!');");
        } else {
            pswVal.append("<script>document.getElementById('signup_psw_val').setCustomValidity('');");
        }
    }

    psw.blur(validatePsw);
    pswVal.blur(validatePsw);

    email.blur(validateEmail);
    emailVal.blur(validateEmail);

});