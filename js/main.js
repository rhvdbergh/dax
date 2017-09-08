$(document).ready(function() {

    // on submission of a new word, reset input fields
    $('#add_word_form').on('submit', function() {
        setTimeout(function() { // setTimeout: make sure that the submission is delivered to the server before clearing values
            $('#front_input').val('');
            $('#back_input').val('');
            $('#front_input').focus();
        });
    });
});