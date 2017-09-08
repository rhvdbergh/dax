$(document).ready(function() {

    // on submission of a new word, reset input fields
    $('#add_word_form').on('submit', function() {
        $('#front_input').val('');
        $('#back_input').val('');
        $('#front_input').focus();
    });






});