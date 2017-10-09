var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('mysql');
var qs = require('querystring');
var jwt = require('jsonwebtoken');

var jwtSecret = "sh1bb0l3th"; // secret to encode and decode JSON Web Tokens
var jwtExpiry = "7d"; // expiry date of web tokens; should be "7d"

// example of how to use jwt
// var token = jwt.sign({ 'foo': 'bar', }, 'shhhh');
// console.log('Token: ' + token);
// var decoded = jwt.verify(token, 'shhhh');
// console.log('Decoded token: ' + decoded.foo);

// current working mysql database and table
// for debugging purposes
var currentDatabase = "vocabspace";
var mainDB = "vocabspace"; // value should be "vocabspace"
var currentTable = "userinfo";

// Create connection to MySQL database;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "generic"
});

console.log("Current time is: " + calculateTimestamp() + " in seconds from Unix epoch.");

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL.");
});

// create a database if it doesn't exist, then select it
function createDB(dbName, callback) {
    var sql = "CREATE DATABASE IF NOT EXISTS " + dbName;
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Database " + dbName + " exists.");
        callback;
    });
}

function useDB(dbName, callback) {
    var sql = "USE " + dbName;
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Database " + dbName + " selected for use.");
        callback;
    });

}

createDB(currentDatabase);

// create a table if it doesn't exist
// overdue column functions as a boolean column where 0 = false, 1 = true;
function createCardsTable(tableName, callback) {
    var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (id INT NOT NULL AUTO_INCREMENT, front TINYTEXT, back TINYTEXT, batch TINYINT DEFAULT 0, timestamp INT, overdue INT DEFAULT 0, PRIMARY KEY (id))"
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Table " + tableName + " exists.");
        callback;
    });
}

// for debugging purposes
useDB('rhvdberghatgmaildotcom');
// for debugging purposes
createCardsTable('testtable');

function createUserInfoTable(tableName, callback) {
    var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (id INT NOT NULL AUTO_INCREMENT, username TINYTEXT, psw TINYTEXT, currenttable TINYTEXT, PRIMARY KEY (id))"
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Table " + tableName + " exists.");
        callback;
    });
}

useDB(mainDB);
createUserInfoTable(currentTable);

// helper-function for building sql string for calculating overdue timestamps
function buildBatchSQLQuery(myBatch, time) {

    var timeInterval = 0;

    switch (myBatch) {
        case 0:
            timeInterval = 86400;
            break;
        case 1:
            timeInterval = 259200;
            break;
        case 2:
            timeInterval = 604800;
            break;
        case 3:
            timeInterval = 1209600;
            break;
        case 4:
            timeInterval = 2592000;
            break;
        case 5:
            timeInterval = 7776000;
            break;
        case 6:
            timeInterval = 31536000;
            break;
        case 7:
            timeInterval = 94608000;
            break;
        default:
            0;
    }

    return "(batch = " + myBatch + ") AND (" + time + " - timestamp > " + timeInterval + ")";
}

//////////// Time calculation /////////////////
// The time needs to be calculated from when the word was last learned
// The time used is a Unix epoch timestamp (in seconds)
// Cards need to be reviewed in:
// 1 day (86400 seconds)
// 3 days (259200 seconds)
// 7 days (604800 seconds)
// 14 days (1209600 seconds)
// 30 days (2592000 seconds)
// 90 days (7776000 seconds)
// 1 year (31536000 seconds)
// 3 years (94608000 seconds)

// function to run through the table once and update all the timestamps that are overdue
function calculateOverdue(tableName, callback) {
    currentTime = calculateTimestamp();
    var sql = "UPDATE " + tableName + " SET overdue = 1 WHERE (";
    // loop through batches and build sql query
    for (var i = 0; i < 7; i++) {
        sql += buildBatchSQLQuery(i, currentTime) + ") OR (";
    }
    // add final line of sql query
    sql += buildBatchSQLQuery(7, currentTime) + ")";

    con.query(sql, function(err, results, fields) {
        if (err) throw err;
        console.log("Overdue words in table " + tableName + " updated.");
        callback;
    });

}

function calculateTimestamp() {
    return Math.round(Date.now() / 1000);
}

// calculate overdue timestamps and update "overdue" column in MySQL
// calculateOverdue(currentTable);

// this function returns the number of words in the table without having to count
// rather, the information is retrieved once from the INFORMATION_SCHEMA.TABLES table
function getNumWords(dbName, tableName, callback) {

    var numWords = 0;

    var sql = "SELECT table_rows FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + dbName + "' AND table_name = '" + tableName + "'";

    con.query(sql, function(err, result) {
        if (err) throw err;

        console.log("Number of words in " + tableName + " table: " + result[0].table_rows);
        numWords = result[0].table_rows;

    });
    return numWords;
}

// getNumWords(currentDatabase, currentTable);

// act as a file server on localhost:8080
// the file server will handle MySQL too
http.createServer(function(req, res) {

    // mainly for debugging purposes, requests are logged to the console
    console.log("Client made request for: " + req.url + " Request method was: " + req.method);

    function sendCards(myCards) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        console.log("myCards within send: " + myCards);
        res.write(JSON.stringify(myCards));
        return res.end();
    }

    // this function retrieves a random overdue card from the database to review
    function getRandomOverdueCards(tableName, db, callback) {
        // if there are less than 20 overdue cards, only the overdue cards will be returned
        useDB(db);
        var sql = "SELECT * FROM " + tableName + " WHERE overdue = 1 ORDER BY RAND() LIMIT 20";
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("Your random cards are: " + JSON.stringify(result));
            callback(result);
        });
    }

    function getRandomBatch0Cards(tableName, db, callback) {
        // if there are less than 20 batch 0 cards, only the correct number of cards will be returned
        var sql = "SELECT * FROM " + tableName + " WHERE batch = 0 ORDER BY RAND() LIMIT 20";
        useDB(db);
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("Your random cards are: " + JSON.stringify(result));
            callback(result);
        });
    }

    // if request is for new word cards, send cards as JSON 
    if ((req.url.indexOf('?getoverduewords') != -1) && req.method === "GET") { // test if query was submitted

        keyStr = req.url.slice(req.url.indexOf('?getoverduewords') + '?getoverduewords'.length);
        validateJWT(keyStr, function(userinfo) {
            if (userinfo.name) { // a valid JSON object was received

                // retrieve the current card table
                useDB(mainDB);
                var currentCardTable = '';
                var sql = "SELECT currenttable FROM userinfo WHERE username = '" + userinfo.name + "'";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    var currentCardTable = result[0].currenttable;
                    console.log("currentCardTable = " + currentCardTable);

                    // set the database to be used
                    var db = userinfo.name.replace(/@/g, 'at');
                    var db = db.replace(/\./g, 'dot');
                    console.log("db: " + db);

                    getRandomOverdueCards(currentCardTable, db, sendCards);
                    useDB(mainDB);
                });
            } else {
                console.log("Something went wrong! No overdue words returned.");
            }
        });
    };

    if ((req.url.indexOf('?getnewwords') != -1) && req.method === "GET") { // test if query was submitted

        keyStr = req.url.slice(req.url.indexOf('?getnewwords') + '?getnewwords'.length);
        validateJWT(keyStr, function(userinfo) {
            if (userinfo.name) { // a valid JSON object was received

                // retrieve the current card table
                useDB(mainDB);
                var currentCardTable = '';
                var sql = "SELECT currenttable FROM userinfo WHERE username = '" + userinfo.name + "'";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    var currentCardTable = result[0].currenttable;
                    console.log("currentCardTable = " + currentCardTable);

                    // set the database to be used
                    var db = userinfo.name.replace(/@/g, 'at');
                    var db = db.replace(/\./g, 'dot');
                    console.log("db: " + db);

                    getRandomBatch0Cards(currentCardTable, db, sendCards);
                    useDB(mainDB);
                });
            } else {
                console.log("Something went wrong! No overdue words returned.");
            }
        });
    }

    // validation of jwt
    // // possible responses:
    // 0 token invalid, malformed token, etc
    // if a JSON object is returned with .name, user is logged in
    // 2 token expired
    // 3 user does not exist or wrong password entered
    function validateJWT(keyStr, callback) {
        jwt.verify(keyStr, jwtSecret, function(err, decoded) {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    callback(2);
                } else {
                    callback(0);
                }
            }
            // check to see if there is a user in the userinfo table with the name and password
            var sql = "SELECT * FROM userinfo WHERE username = '" + decoded.name + "' AND psw = '" + decoded.psw + "' LIMIT 1;";
            useDB(mainDB);
            con.query(sql, function(err, result) {
                if (err) throw err;
                if (result.length > 0) { // the username and password exist and match
                    callback(decoded);
                } else {
                    callback(3);
                }
            });
        });
        //   });

    }

    // possible responses:
    // 0 token invalid, malformed token, etc
    // 1 token valid
    // 2 token expired
    // 3 user does not exist or wrong password entered
    if ((req.url.indexOf('?validateJWT') != -1) && req.method === "GET") { // test if query was submitted

        console.log("Request for JWT validation received.");
        // keyStr is the jwt
        keyStr = req.url.slice(req.url.indexOf('?validateJWT') + '?validateJWT'.length);
        console.log("keyStr = " + keyStr);

        validateJWT(keyStr, function(validationResponse) {
            console.log('validationResponse is: ' + JSON.stringify(validationResponse));
            if (validationResponse.name) { // a JSON object was returned, so user logged in!
                console.log("User logged in successfully!");
                res.writeHead(200, { 'content-type': 'text/html' });
                res.write("1");
                return res.end();
            } else {
                switch (validationResponse) {
                    case 0:
                        console.log("Something wrong with the user token.");
                        res.writeHead(200, { 'content-type': 'text/html' });
                        res.write("0");
                        return res.end();
                        break;
                    case 2:
                        console.log("Token Expired; New login required.");
                        res.writeHead(200, { 'content-type': 'text/html' });
                        res.write("2");
                        return res.end();
                        break;
                    case 3:
                        console.log("User does not exist or wrong password entered.");
                        res.writeHead(200, { 'content-type': 'text/html' });
                        res.write("3");
                        return res.end();
                        break;
                    default:
                        console.log("Something wrong with the user token.");
                        res.writeHead(200, { 'content-type': 'text/html' });
                        res.write("0");
                        return res.end();
                        break;
                }
            }

        });
    }

    function updateCard(tableName, db, card) {
        console.log("JSON passed to updateCard: " + JSON.stringify(card));
        sql = "UPDATE " + tableName + " SET batch = " + card.batch + ", timestamp = " + card.timestamp + ", overdue = " + card.overdue + " WHERE id = " + card.id;
        useDB(db);
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("Card updated!");
        });

    }

    // if there is a request to update a card, do the following:
    if ((req.url.indexOf('?updatecard') != -1) && req.method === "GET") { // test if query was submitted

        console.log("Request to update word received; JSON = " + req.url);
        var jsonStart = req.url.indexOf('{');
        // extract JSON string and change %22 back to "
        var str_withoutQuote = req.url.substring(jsonStart).replace(/%22/g, '"');
        // change %20 back to " "
        str = str_withoutQuote.replace(/%20/g, " ");
        console.log("JSON string received: " + str);

        keyStr = req.url.slice(req.url.indexOf('?updatecard') + '?updatecard'.length, req.url.indexOf('{'));
        console.log('req.url in ?updatecard request is: ' + req.url);
        console.log('keyStr in ?updatecard request is: ' + keyStr);
        validateJWT(keyStr, function(userinfo) {
            if (userinfo.name) { // a valid JSON object was received

                // retrieve the current card table

                var currentCardTable = '';
                var sql = "SELECT currenttable FROM userinfo WHERE username = '" + userinfo.name + "'";
                useDB(mainDB);
                con.query(sql, function(err, result) {
                    if (err) throw err;
                    var currentCardTable = result[0].currenttable;
                    console.log("currentCardTable = " + currentCardTable);

                    // set the database to be used
                    var db = userinfo.name.replace(/@/g, 'at');
                    var db = db.replace(/\./g, 'dot');
                    console.log("db: " + db);

                    updateCard(currentCardTable, db, JSON.parse(str));

                    useDB(mainDB);
                });
            } else {
                console.log("Something went wrong! Card not updated.");
            }
        });
        res.end();
    }

    // File handling

    // test if method used is post
    if (req.method === "POST") {
        console.log("Request url: " + req.url); // for debugging purposes
        var readurl = '';
        if (req.url === '/' || req.url === '/index') {
            readurl = './index.html';
        } else {
            readurl = '.' + req.url;
        }
        fs.readFile(readurl, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            };

            var body = '';

            // set the values of body equal to the data of the POST received
            req.on('data', function(data) {
                body += data;
            });

            // parse body data and extract text fields         
            req.on('end', function() {

                var post = qs.parse(body);

                // test to see if the POST request was to update a card
                // if the parsed data contains .front_text, this must be a card
                if (post.front_text) {
                    validateJWT(post.key, function(userinfo) {
                        if (userinfo.name) { // jwt is valid, continue with update
                            console.log("Will now write to MySQL database");
                            console.log("Front text is: " + post.front_text);
                            console.log("Back text is: " + post.back_text);
                            console.log("Key is: " + post.key);

                            // retrieve the current card table
                            useDB(mainDB);
                            var currentCardTable = '';
                            var sql = "SELECT currenttable FROM userinfo WHERE username = '" + userinfo.name + "'";
                            con.query(sql, function(err, result) {
                                if (err) throw err;

                                var currentCardTable = result[0].currenttable;
                                console.log("currentCardTable = " + currentCardTable);
                                // set the database to be used
                                var db = userinfo.name.replace(/@/g, 'at');
                                var db = db.replace(/\./g, 'dot');
                                console.log("db: " + db);
                                useDB(db);

                                // MySQL query handling
                                var sql = "INSERT INTO " + currentCardTable + " (front, back, timestamp) VALUES ('" + post.front_text + "', '" + post.back_text + "', '" + calculateTimestamp().toString() + "')";

                                con.query(sql, function(err, result) {
                                    if (err) throw err;
                                    console.log("MySQL command: " + sql);
                                    useDB(mainDB);
                                    // return the user to the web page selected above (html/add.html):
                                    res.writeHead(200, { 'content-type': 'text/html' });
                                    res.write(data);
                                    return res.end();
                                });
                            });
                        } else { //jwt was invalid
                            // user has been logged out, return to index.html!
                            res.writeHead(200, { 'content-type': 'text/html' });
                            res.write("<script>location.href='../index.html';</script>");
                            return res.end();
                        }
                    });
                    // else test if POST request was to log in
                    // if the parsed data contains a .uname field, this must be a login attempt
                } else if (post.uname) {
                    console.log("Login request received.")
                    console.log("User login query received. Username: " + post.uname + " Password: " + post.psw);

                    currentDatabase = "vocabspace";
                    currentTable = "userinfo";
                    // generate jwt key which will expire in jwtExpiry amount of days (should be 7)
                    var jwtKey = jwt.sign({ 'name': post.uname, 'psw': post.psw }, jwtSecret, { expiresIn: jwtExpiry });
                    console.log('JWT generated: ' + jwtKey);
                    // return the user to the web page selected above (html/add.html):
                    // add to the document a script with a jwt as login key
                    res.writeHead(200, { 'content-type': 'text/html' });
                    res.write(data + "<script>localStorage.setItem('key', '" + jwtKey + "');</script>");
                    console.log("Sending login script back");
                    return res.end();
                }
            });

        });
    };

    // test if the root domain was selected, or index without its extension was entered
    // if the above is true, return index.html
    // this will not include queries, as queries will always have .html added
    if ((req.url === "/" || req.url === "/index") && req.method === "GET") {
        fs.readFile("index.html", function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            };
            //if file is found, return:
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            return res.end();
        });
    }

    if ((req.url.indexOf('.html') != -1) && (req.method === "GET") && !(req.url.indexOf('?') != -1)) { // test to see if file has .html extension
        //__dirname returns the root directory
        fs.readFile(__dirname + req.url, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            }
            //if file is found
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            return res.end();
        });
    }

    if ((req.url.indexOf('.css') != -1) && req.method === "GET") { //test to see if file has .css extension
        fs.readFile(__dirname + req.url, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            }
            //if file is found, return
            res.writeHead(200, { 'content-type': 'text/css' });
            res.write(data);
            return res.end();
        });
    }

    if ((req.url.indexOf('.js') != -1) && req.method === "GET") { //test to see if file has .js extension
        fs.readFile(__dirname + req.url, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            }
            //if file is found, return
            res.writeHead(200, { 'content-type': 'text/javascript' });
            res.write(data);
            return res.end();
        });
    }

    if ((req.url.indexOf('.ico') != -1) && req.method === "GET") { //test to see if file has .js extension
        fs.readFile(__dirname + req.url, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            }
            //if file is found, return
            res.writeHead(200, { 'content-type': 'image/x-icon' });
            res.write(data);
            return res.end();
        });
    }

}).listen(8080);