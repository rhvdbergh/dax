$(document).ready(function() {

    var seconds = 0;
    var shortTimeSeconds = 0;
    var timeUp = false;
    var shortTimeUp = false;
    var cardFlipped = false;
    var decisionMade = false;
    var shortTimeDuration = 2; // this should be 18, if different changed for debugging purposes
    var jsonObj;
    var place = 0; // keeps track of which card is currently being learned

    function calculateTimestamp() {
        return Math.round(Date.now() / 1000);
    }

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
                if (!decisionMade) {
                    $('.review_word_back').text(jsonObj[place].back);
                    cardFlipped = true;
                }
            });

            callback();
        });
    };

    function learnCards() {

        $('#yes_btn').on('click', function() {
            if ((!shortTimeUp || !decisionMade) && cardFlipped) {

                jsonObj[place].batch++;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + JSON.stringify(jsonObj[place]));

                place++;

                // only if not shortTimeUp will the user have a next decision  
                // else the last decision was made, so decisionMade = true
                // also, only if short time is not up yet will new card be shown
                if (!shortTimeUp) {

                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    decisionMade = false;
                    cardFlipped = false;

                }


                decisionMade = true;

                // for debugging purposes:
                console.log("Decision made: yes");
                console.log("The card has been updated to: " + JSON.stringify(jsonObj[place - 1]) + "at " + shortTimeSeconds + " seconds");
            }
        });

        $('#no_btn').on('click', function() {
            if ((!shortTimeUp || !decisionMade) && cardFlipped) {

                jsonObj[place].batch = 0;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + JSON.stringify(jsonObj[place]));

                place++;

                // only if not shortTimeUp will the user have a next decision  
                // else the last decision was made, so decisionMade = true
                // also, only if short time is not up yet will new card be shown
                if (!shortTimeUp) {

                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    cardFlipped = false;
                    decisionMade = false;
                }


                decisionMade = true;

                // for debugging purposes:
                console.log("Decision made: no");
                console.log("The card has been updated to: " + JSON.stringify(jsonObj[place - 1]) + "at " + shortTimeSeconds + " seconds");

            }
        });
    }

    retrieveCards(learnCards);

    function timer() {
        setInterval(function() {
            seconds++;
            if (!shortTimeUp) {
                shortTimeSeconds++;
            }
            if (shortTimeSeconds > shortTimeDuration) {
                shortTimeUp = true;
                shortTimeSeconds = 0;
                if (!cardFlipped) {
                    decisionMade = false; // to make sure user gets a chance to answer last question
                }
            };
            $('.timerstr').text("Time: " + Math.floor(seconds / 60) + ":" + (seconds % 60) + " Short: " + shortTimeSeconds);

        }, 1000);
    }

    timer();


});