$(document).ready(function() {

    var seconds = 0;
    var shortTimeSeconds = 0;
    var timeUp = false;
    var shortTimeUp = false;
    var jsonObj;
    var place = 0; // keeps track of which card is currently being learned

    function calculateTimestamp() {
        return Math.round(Date.now() / 1000);
    }

    // when review.html is loaded, retrieve 
    function retrieveCards(callback) {
        $.get("?getwords", function(data) {
            jsonObj = JSON.parse(data);
            console.log("request data returned");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            // set up initial cards

            $('.review_word_front').text(jsonObj[place].front);
            $('.review_word_back').text("Click here to reveal card...");

            $('.review_word_back').on('click', function() {
                $('.review_word_back').text(jsonObj[place].back);
            });

            callback();
        });
    };

    function learnCards() {

        $('#yes_btn').on('click', function() {
            jsonObj[place].batch++;
            jsonObj[place].overdue = 0;
            jsonObj[place].timestamp = calculateTimestamp().toString();
            $.get("?updatecard" + JSON.stringify(jsonObj[place]));

            if (!shortTimeUp) {
                $('.review_word_front').text(jsonObj[place].front);
                $('.review_word_back').text("Click here to reveal card...");
            }

            place++;

            // for debugging purposes:
            console.log("The card has been updated to: " + JSON.stringify(jsonObj[place - 1]));
        });

        $('#no_btn').on('click', function() {
            place++;
        });
    }

    retrieveCards(learnCards);

    function timer() {
        setInterval(function() {
            seconds++;
            if (!shortTimeUp) {
                shortTimeSeconds++;
            }
            if (shortTimeSeconds > 18) {
                shortTimeUp = true;
                shortTimeSeconds = 0;
            };
            $('.timerstr').text("Time: " + Math.floor(seconds / 60) + ":" + (seconds % 60) + " Short: " + shortTimeSeconds);

        }, 1000);
    }

    timer();


});