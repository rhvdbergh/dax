$(document).ready(function() {

    var key = localStorage.getItem('key');
    var currenttable = localStorage.getItem('currenttable');

    $(".logout").on('click', function() {
        localStorage.removeItem('key');
    });

    if (currenttable === null || currenttable === "" || currenttable === "null") {
        location.href = "../index.html";
    } else {

        $('.add_word_container').append("<input id='front_input' type='text' placeholder='Enter front side' name='front_text' required autofocus>");
        $('.add_word_container').append("<input id='back_input' type='text' placeholder='Enter back side' name='back_text' required>");
        $('.add_word_container').append("<button id='submit_new_word_button' type='submit'>Submit new word</button>");
    }

    // if there is no key return to index.html
    if (key != null) {
        $.get("?validateJWT" + key, function(data) {

            if (data === "0") { // there is something wrong with the token. New login and token required
                localStorage.removeItem('key'); // key removed so new key will be generated
                console.log("User token existed, but was corrupt. Token removed & new login required.");
                location.href = "../index.html";
            }
            if (data === "1") { // valid token
                console.log("Logged in.");
                // make sure to send the key along with the card to validate each entry!
                $('.add_word_container').append("<input type='hidden' name = key value = '" + key + "'>");
            }
            if (data === "2") { // token has expired
                console.log("Token has expired. New login required.");
                location.href = "../index.html";
            }
            if (data === "3") { // user does not exist or wrong password entered
                console.log("User does not existed or wrong password was entered.");
                location.href = "../index.html";
            }
        });
    } else {

        location.href = "../index.html";

    }

});