$(document).ready(function() {

    var cardFlipped = false;
    var decisionMade = false;
    // if there are less than 20 overdue cards left - i.e. returned from the server,
    // it will be the last round of revisions
    var lastRound = false;
    var jsonObj;
    var place = 0; // keeps track of which card is currently being learned
    var key = localStorage.getItem('key');

    $(".logout").on('click', function() {
        localStorage.removeItem('key');
    });

    if (key != null) { // if there is no key return to index.html

        $.get("?validateJWT" + key, function(data) {
            if (data === "0") { // there is something wrong with the token. New login and token required
                localStorage.removeItem('key'); // key removed so new key will be generated
                console.log("User token existed, but was corrupt. Token removed & new login required.");
                location.href = "../index.html";
            }
            if (data === "1") { // valid token
                console.log("Logged in.");
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

    function calculateTimestamp() {
        return Math.round(Date.now() / 1000);
    }

    function getNewWords() {
        $.get("?getoverduewords" + key, function(data) {

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
        $.get("?getoverduewords" + key, function(data) {
            jsonObj = JSON.parse(data);
            console.log("request data returned");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            console.log("jsonObj.length = " + jsonObj.length);
            if (jsonObj.length < 20) {
                console.log("There are less than 20 cards left!");
                lastRound = true;
            }

            // set up initial cards
            if (jsonObj.length > 0) { // check to see if returned object has at least one card
                $('.review_word_front').text(jsonObj[place].front);
                $('.review_word_back').text("Click here to reveal card...");

            } else { // no cards to review!
                $('.review_word_front').text("All done! No cards to review.");
                $('.review_word_back').hide();

            }
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

            callback();
        });
    };

    function learnCards() {

        $('#yes_btn').on('click', function() {
            if (!decisionMade && cardFlipped) {

                jsonObj[place].batch++;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + key + JSON.stringify(jsonObj[place]));

                place++;

                // make sure that jsonObj contains an object at place
                // else this was the last card!
                if (!(jsonObj.length - 1 < place)) {
                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    decisionMade = false;
                    cardFlipped = false;
                } else { // this was the last card!
                    $('.review_word_front').text("All done! That was the last card.");
                    $('.review_word_back').hide();
                }

                $('.review_question').hide();

                // for debugging purposes:
                console.log("Decision made: yes");
                console.log("The card has been updated to: " + JSON.stringify(jsonObj[place - 1]));
                console.log("Place: " + place);
            }
        });

        $('#no_btn').on('click', function() {
            if (!decisionMade && cardFlipped) {

                jsonObj[place].batch = 0;
                jsonObj[place].overdue = 0;
                jsonObj[place].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + key + JSON.stringify(jsonObj[place]));

                place++;

                // make sure that jsonObj contains an object at place
                // else this was the last card!
                if (!(jsonObj.length - 1 < place)) {
                    $('.review_word_front').text(jsonObj[place].front);
                    $('.review_word_back').text("Click here to reveal card...");
                    cardFlipped = false;
                    decisionMade = false;
                } else { // this was the last card!
                    $('.review_word_front').text("All done! That was the last card.");
                    $('.review_word_back').hide();
                }

                $('.review_question').hide();

                // for debugging purposes:
                console.log("Decision made: no");
                console.log("The card has been updated to: " + JSON.stringify(jsonObj[place - 1]));
            }
        });
    }

    retrieveCards(learnCards);

});