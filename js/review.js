$(document).ready(function() {
    // when review.html is loaded, retrieve 
    $.get("?getword", function(data) {
        var jsonObj = JSON.parse(data);
        $('.review_word_front').append(jsonObj[0].front);
        $('.review_word_back').append(jsonObj[0].back);
        console.log("request data returned");
        console.log("data is: " + data);
    });
});