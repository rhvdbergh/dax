$(document).ready(function() {

    var seconds = 0;
    var shortTimeSeconds = 0;
    var timeUp = false;
    var shortTimeUp = false;
    var cardFlipped = false;
    var decisionMade = false;
    var lastround = false;
    var timeDuration = 10; // this should be 720 (= 12 min), if different changed for debugging purposes
    var shortTimeDuration = 5; // this should be 18, if different changed for debugging purposes
    var jsonObj = [];
    var shortTermLearnedObj = [];
    var notLearnedObj = [];
    var learnedObj = [];
    var place = 0; // keeps track of which card is currently being learned

    function calculateTimestamp() {
        return Math.round(Date.now() / 1000);
    }

    function getNewWords() {
        $.get("?getoverduewords", function(data) {

            // save present card, so user does not go out of sync
            var currentCard = jsonObj[place];
            jsonObj = JSON.parse(data);

            place = 0;

            console.log("Request for new data has returned!");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            // check if the currentCard is among the cards returned
            // if so, remove the card from the returned cards and place it "on top" at place 0
            var currentCardReturned = false; // check to see if currentCard is among cards returned
            for (var i = 0; i < jsonObj.length; i++) {
                if (jsonObj[i].id === currentCard.id) {
                    console.log("Old card already in set returned, card is: " + currentCard.id + " position is " + i);
                    jsonObj.splice(i, 1); // take the currentCard out of the pile
                    jsonObj.splice(0, 0, currentCard); // place currentCard at place 0

                    currentCardReturned = true;
                    console.log("After splice / insert, set of cards = " + JSON.stringify(jsonObj));
                }
            }

            if (!currentCardReturned) { // currentCard was not among the batch returned
                jsonObj[0] = currentCard; // so replace the first card at place 0 with currentCard
            }

            console.log("jsonObj.length = " + jsonObj.length);
            if (jsonObj.length < 20) {
                console.log("There are less than 20 cards left!");
                lastRound = true;
            }
        });
    }

    function retrieveCards(callback) {
        $.get("?getnewwords", function(data) {
            jsonObj = JSON.parse(data);
            console.log("request data returned");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            // set up initial cards

            $('.review_word_front').text(jsonObj[place].front);
            $('.review_word_back').text("Click here to reveal card...");
            $('.review_question').hide();

            $('.review_word_back').on('click', function() {

                // check to see if new words are needed from the server
                if (place > 17) {
                    console.log("Space getting tight!");
                    getNewWords();
                }

                if (!decisionMade) {
                    $('.review_word_back').text(jsonObj[place].back);
                    cardFlipped = true;
                    $('.review_question').show();
                }
            });

            callback;
        });
    };

    function learnCards() {

        $('#yes_btn').on('click', function() {
            if ((!shortTimeUp || !decisionMade) && cardFlipped) {
                shortTermLearnedObj.push(jsonObj[place]);
                /*
                jsonObj[place].batch++;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + JSON.stringify(jsonObj[place]));
                */
                place++;

                // only if not shortTimeUp will the user have a next decision  
                // else the last decision was made, so decisionMade = true
                // also, only if short time is not up yet will new card be shown
                if (!shortTimeUp) {

                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    decisionMade = false;
                    cardFlipped = false;

                } else {
                    decisionMade = true;
                }

                $('.review_question').hide();

                // for debugging purposes:
                console.log("Decision made: yes");
                console.log("The card " + JSON.stringify(jsonObj[place - 1]) + " has been placed back on the 'learned' pile.");
                console.log("Place: " + place);
            }
        });

        $('#no_btn').on('click', function() {
            if ((!shortTimeUp || !decisionMade) && cardFlipped) {

                notLearnedObj.push(jsonObj[place]);
                /*
                jsonObj[place].batch = 0;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + JSON.stringify(jsonObj[place]));
                */
                place++;

                // only if not shortTimeUp will the user have a next decision  
                // else the last decision was made, so decisionMade = true
                // also, only if short time is not up yet will new card be shown
                if (!shortTimeUp) {

                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    cardFlipped = false;
                    decisionMade = false;

                } else {
                    decisionMade = true;
                }

                $('.review_question').hide();

                // for debugging purposes:
                console.log("Decision made: no");
                console.log("The card " + JSON.stringify(jsonObj[place - 1]) + " has been placed back on the 'not learned' pile.");
            }
        });
    }

    retrieveCards(learnCards());

    function timer() {
        setInterval(function() {
            if (!timeUp) {
                seconds++;
            }
            if (!shortTimeUp) {
                shortTimeSeconds++;
            }
            if (shortTimeSeconds > shortTimeDuration) {
                shortTimeUp = true;
                console.log('Short time up!');
                shortTimeSeconds = 0;
                if (!cardFlipped) {
                    decisionMade = false; // to make sure user gets a chance to answer last question
                }
            };
            if (seconds > timeDuration) {
                timeUp = true;
                seconds = 0;
                $('#timer').hide();
                console.log('Time is up!');
                if (!cardFlipped) {
                    decisionMade = false; // to make sure user gets a chance to answer last question
                }
            };
            $('.timerstr').text("Time: " + Math.floor(seconds / 60) + ":" + (seconds % 60) + " Short: " + shortTimeSeconds);

        }, 1000);
    }

    timer();


});