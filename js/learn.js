$(document).ready(function() {

    var seconds = 0;
    var shortTermSeconds = 0;
    var timeUp = false;
    var shortTimeUp = false;
    var cardFlipped = false;
    var decisionMade = false;
    var inShortTermReview = false;
    var inFinalReview = false;
    var lastRound = false;
    var duration = 10; // this should be 720 (= 12 min), if different changed for debugging purposes
    var shortTermDuration = 5; // this should be 18, if different changed for debugging purposes
    var jsonObj = [];
    var shortTermLearnedObj = [];
    var notLearnedObj = [];
    var learnedObj = [];
    var place = 0; // keeps track of which card is currently being learned
    var reviewPlace = 0; // similar to place, but in review objects
    var finalReviewPlace = 0;
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
        $.get("?getnewwords" + key, function(data) {

            jsonObj = JSON.parse(data);

            console.log("Request for new data has returned!");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            console.log("jsonObj.length = " + jsonObj.length);
            if (jsonObj.length < 20) {
                console.log("There are less than 20 cards left!");
                lastRound = true;
            }

            // remove newly returned cards that are identical to those on this session's not learned pile
            // counting backwards because then deleting from array will not affect counter!
            for (var i = notLearnedObj.length - 1; i >= 0; i--) {
                for (var j = jsonObj.length - 1; j >= 0; j--) {
                    if (notLearnedObj[i].id === jsonObj[j].id) { // this card already in the not learned pile in this session!
                        jsonObj.splice(j, 1); // so delete it from the jsonObj
                        j--; // jsonObj has become one element shorter, and the element at j-- has
                        // already been evaluated
                    }
                }
            }

            // remove newly returned cards that are identical to those on this session's learned pile
            for (var i = learnedObj.length - 1; i >= 0; i--) {
                for (var j = jsonObj.length - 1; j >= 0; j--) {
                    if (learnedObj[i].id === jsonObj[j].id) { // this card already in the  learned pile in this session!
                        jsonObj.splice(j, 1); // so delete it from the jsonObj
                        j--;
                    }
                }
            }

            // remove newly returned cards that are identical to those on this session's short term learned pile
            for (var i = shortTermLearnedObj.length - 1; i >= 0; i--) {
                for (var j = jsonObj.length - 1; j >= 0; j--) {
                    if (shortTermLearnedObj[i].id === jsonObj[j].id) { // this card already in the short term learned pile in this session!
                        jsonObj.splice(j, 1); // so delete it from the jsonObj
                    }
                }
            }

            for (var i = 0; i < jsonObj.length; i++) { // add newly retrieved cards to cards not yet learned in this session
                notLearnedObj.push(jsonObj[i]);
                // all the cards that are already in this session have been removed from jsonObj,
                // so only new cards will be added to the not learned pile
            }

        });
    }

    function retrieveCards(callback) {
        $.get("?getnewwords" + key, function(data) {
            jsonObj = JSON.parse(data);
            console.log("request data returned");
            console.log("data is: " + data);
            console.log("The number of cards returned are: " + jsonObj.length);

            if (jsonObj.length < 20) {
                console.log("There are less than 20 cards left!");
                lastRound = true;
            }

            for (var i = 0; i < jsonObj.length; i++) {
                notLearnedObj.push(jsonObj[i]);
            }

            // set up initial cards
            $('.review_word_front').text(notLearnedObj[place].front); // place = 0 at this point
            $('.review_word_back').text(notLearnedObj[place].back);
            $('.review_question').hide();
            $('.review_short_button').hide();
            $('.review_final_button').hide();
            $('.all_done_button').hide();
            $('.next_word_button').show();

            callback;
        });
    };

    function learnCards() {

        $('.next_word_button').on('click', function() {

            shortTermLearnedObj.push(notLearnedObj[place]);
            console.log('Card placed on short term learned pile: ' + JSON.stringify(shortTermLearnedObj[shortTermLearnedObj.length - 1])); // for debugging purposes
            place++;
            cardFlipped = false;
            if (!shortTimeUp) {
                $('.review_word_front').text(notLearnedObj[place].front);
                $('.review_word_back').text(notLearnedObj[place].back);

            }

            // check to see if new words are needed from the server
            if (place > (notLearnedObj.length - 4)) { // coming close to the end of the not learned pile!
                console.log("Space getting tight!");
                getNewWords();
            }
        });

        $('.review_short_button').on('click', function() {

            // send last shown card to the short term learned pile
            shortTermLearnedObj.push(notLearnedObj[place]);
            console.log('(Last) card placed on short term learned pile: ' + JSON.stringify(shortTermLearnedObj[shortTermLearnedObj.length - 1])); // for debugging purposes            
            $('.review_short_button').hide();
            reviewPlace = 0;
            place++;

            // set up initial review card
            $('.review_word_front').text(shortTermLearnedObj[reviewPlace].front);
            $('.review_word_back').text('Click here to reveal card...');
            decisionMade = false;
        });

        $('.review_final_button').on('click', function() {
            $('.review_final_button').hide();

            finalReviewPlace = 0;

            // set up initial review card
            $('.review_word_front').text(learnedObj[finalReviewPlace].front);
            $('.review_word_back').text('Click here to reveal card...');
            $('.review_word_front').show();
            $('.review_word_back').show();
            decisionMade = false;
            cardFlipped = false;

        })

        $('.review_word_back').on('click', function() {

            if (inShortTermReview && !cardFlipped) {
                $('.review_word_back').text(shortTermLearnedObj[reviewPlace].back);
                cardFlipped = true;
                $('.review_question').show();
            }

            if (inFinalReview && !cardFlipped) {
                $('.review_word_back').text(learnedObj[finalReviewPlace].back);
                cardFlipped = true;
                $('.review_question').show();
            }
        });

        $('#yes_btn').on('click', function() {
            if (inShortTermReview) {
                // add this card to the learned pile
                learnedObj.push(shortTermLearnedObj[reviewPlace]);
                console.log('Card placed on learned pile for final review: ' + JSON.stringify(shortTermLearnedObj[reviewPlace])); // for debugging purposes

                $('.review_question').hide();
                if (reviewPlace < shortTermLearnedObj.length - 1) {
                    reviewPlace++;

                    // set up new card for review
                    $('.review_word_front').text(shortTermLearnedObj[reviewPlace].front);
                    $('.review_word_back').text('Click here to reveal card...');
                    decisionMade = false;
                    cardFlipped = false;
                } else { // we have reached the end of the short term learned pile
                    console.log('We have reached the end of the short term learned pile!');
                    //  reviewPlace = 0;
                    inShortTermReview = false;

                    if (!timeUp) {
                        // set up new cards for learning
                        $('.review_word_front').text(notLearnedObj[place].front);
                        $('.review_word_back').text(notLearnedObj[place].back);
                        $('.next_word_button').show();
                        shortTimeUp = false;
                    }
                }

            }

            if (inFinalReview) {
                // update card on the server
                learnedObj[finalReviewPlace].batch++;
                learnedObj[finalReviewPlace].overdue = 0;
                learnedObj[finalReviewPlace].timestamp = calculateTimestamp().toString();
                $.get("?updatecard" + key + JSON.stringify(learnedObj[finalReviewPlace]));
                console.log("Card update sent to server: " + JSON.stringify(learnedObj[finalReviewPlace]));

                $('.review_question').hide();

                if (finalReviewPlace < learnedObj.length - 1) {
                    finalReviewPlace++;

                    // set up new card for review
                    $('.review_word_front').text(learnedObj[finalReviewPlace].front);
                    $('.review_word_back').text('Click here to reveal card...');
                    decisionMade = false;
                    cardFlipped = false;
                } else { // we have reached the end of the session!
                    console.log("All done! We have reached the end of this session!");
                    $('.review_word_front').hide();
                    $('.review_word_back').hide();
                    $('.all_done_button').show();

                }

            }
        });

        $('#no_btn').on('click', function() {
            if (inShortTermReview) {
                // return this card to the not learned pile
                notLearnedObj.push(shortTermLearnedObj[reviewPlace]);
                console.log('Card returned to not learned pile: ' + JSON.stringify(shortTermLearnedObj[reviewPlace])); // for debugging purposes

                $('.review_question').hide();
                if (reviewPlace < shortTermLearnedObj.length - 1) {
                    reviewPlace++;

                    // set up new card for review
                    $('.review_word_front').text(shortTermLearnedObj[reviewPlace].front);
                    $('.review_word_back').text('Click here to reveal card...');
                    decisionMade = false;
                    cardFlipped = false;
                } else { // we have reached the end of the short term learned pile
                    console.log('We have reached the end of the short term learned pile!');
                    //  reviewPlace = 0;
                    inShortTermReview = false;

                    shortTimeUp = false;
                    if (!timeUp) {
                        // set up new cards for learning
                        $('.review_word_front').text(notLearnedObj[place].front);
                        $('.review_word_back').text(notLearnedObj[place].back);
                        $('.next_word_button').show();
                    }
                }

            }

            if (inFinalReview) {
                $('.review_question').hide();
                console.log("Card discarded from session: " + JSON.stringify(learnedObj[finalReviewPlace]));

                if (finalReviewPlace < shortTermLearnedObj.length - 1) {

                    finalReviewPlace++;

                    // set up new card for review
                    $('.review_word_front').text(learnedObj[finalReviewPlace].front);
                    $('.review_word_back').text('Click here to reveal card...');
                    decisionMade = false;
                    cardFlipped = false;
                } else { // we have reached the end of the session!
                    console.log("All done! We have reached the end of this session!");
                    $('.review_word_front').hide();
                    $('.review_word_back').hide();
                    $('.all_done_button').show();

                }
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
                shortTermSeconds++;
            }
            if (shortTermSeconds > shortTermDuration) {
                shortTimeUp = true;
                console.log('Short time up!');

                if (!inFinalReview) { // if it's the last round, don't reset to 0
                    shortTermSeconds = 0;
                }
                if (shortTimeUp && !inShortTermReview && !inFinalReview) {
                    $('.next_word_button').hide();
                    $('.review_short_button').show();
                    inShortTermReview = true;
                }
            };
            if (seconds > duration) {
                if (!timeUp) { // for debugging purposes
                    console.log('Time is up!');
                }
                timeUp = true;

                $('#timer').hide();


                if (timeUp && !inFinalReview && !inShortTermReview) {
                    $('.next_word_button').hide();
                    $('.review_short_button').hide();
                    $('.review_word_front').hide();
                    $('.review_word_back').hide();
                    $('.review_final_button').show();
                    inFinalReview = true;
                }
                if (!cardFlipped) {
                    decisionMade = false; // to make sure user gets a chance to answer last question
                }
            };
            $('.timerstr').text("Time: " + Math.floor(seconds / 60) + ":" + (seconds % 60) + " Short: " + shortTermSeconds);

        }, 1000);
    }

    timer();


});