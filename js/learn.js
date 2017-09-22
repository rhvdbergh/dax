var seconds = 0;
var timeUp = false;
var shortTimeUp = false;
var jsonObj;

$(document).ready(function() {
    // when review.html is loaded, retrieve 
    $.get("?getwords", function(data) {
        jsonObj = JSON.parse(data);

        // set up initial cards
        $('.review_word_front').append(jsonObj[0].front);
        $('.review_word_back').append("Click here to reveal card...");

        $('.review_word_back').on('click', function() {
            $('.review_word_back').text(jsonObj[0].back);
        });

        $('#yes_btn').on('click', function() {

        });

        console.log("request data returned");
        console.log("data is: " + data);
        console.log("The number of cards returned are: " + jsonObj.length)


    });

    function timer() {
        setInterval(function() {
            seconds++;
            $('.timerstr').text(Math.floor(seconds / 60) + ":" + (seconds % 60));
        }, 1000);
    }

    timer();


});