var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('mysql');
var qs = require('querystring');

// Create connection to MySQL database;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "generic"
});

console.log("Current time is: " + (Math.round(Date.now() / 1000)) + " in seconds from Unix epoch.");

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL.");
});

// create a temp_database if it doesn't exist, then select it
con.query("CREATE DATABASE IF NOT EXISTS temp_database", function(err, result) {
    if (err) throw err;
    console.log("Database temp_database exists.");
});

con.query("USE temp_database", function(err, result) {
    if (err) throw err;
    console.log("Database temp_database selected for use.");
});

// create a words table if it doesn't exist
con.query("CREATE TABLE IF NOT EXISTS words (id INT NOT NULL AUTO_INCREMENT, front TINYTEXT, back TINYTEXT, batch TINYINT, timestamp INT, PRIMARY KEY (id))", function(err, result) {
    if (err) throw err;
    console.log("Table words exists.");
});

// function as a file server on localhost:8080
// the file server will handle MySQL too
http.createServer(function(req, res) {

    // mainly for debugging purposes, requests are logged to the console
    console.log("Client made request for: " + req.url + " Request method was: " + req.method);

    // File handling

    // test if method used is post
    if (req.method === "POST") {
        fs.readFile("index.html", function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            };

                console.log("Will now write to MySQL database");
                var body = '';
                
                // set the values of body equal to the data of the POST received
                req.on('data', function (data) {
                    body += data;
                }); 

                // parse body data and extract text fields         
                req.on('end', function() {
                    var post = qs.parse(body);
                    console.log("Front text is: " + post.front_text);
                    console.log("Back text is: " + post.back_text);

                    // MySQL query handling
                    var sql = "INSERT INTO words (front, back, batch, timestamp) VALUES ('" + post.front_text + "', '" + post.back_text + "', " + "0, '" + (Math.round(Date.now() / 1000)).toString() + "')";
                    con.query(sql, function(err, result) {
                        if (err) throw err;
                        console.log("MySQL command: " + sql);
                    });
                });
            // return the user to the web page selected above (index.html):
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(data);
            return res.end();
        });
    };
    

    // test if the root domain was selected, or index without its extension was entered
    // if the above is true, return index.html
    if ((req.url === "/" || req.url === "/index") && req.method === "GET" ) {
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

    if ((req.url.indexOf('.html') != -1) && req.method === "GET") { // test to see if file has .html extension
        //__dirname returns the root directory
        fs.readFile(__dirname + req.url, function(err, data) {
            if (err) {
                res.writeHead(404, { 'content-type': 'text/html' });
                return res.end("404 not found");
            }
            //if file is found, return
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

}).listen(8080);


//////////// Time calculation /////////////////
// The time needs to be calculated from when the code was last learned
// The time used is a Unix epoch timestamp
// Cards need to be reviewed in:
// 1 day (86400 seconds)
// 3 days (259200 seconds)
// 7 days (604800 seconds)
// 14 days (1209600 seconds)
// 30 days (2592000 seconds)
// 90 days (7776000 seconds)
// 1 year (31536000 seconds)
// 3 years (94608000 seconds)