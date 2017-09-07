//function as a file server on localhost:8080
var http = require('http');
var fs = require('fs');
var url = require('url');

http.createServer(function(req, res) {

    // mainly for debugging purposes, file requests are logged to the console
    console.log("File request made for: " + req.url);

    if (req.url.indexOf('.html') != -1) { //test to see if file has .html extension
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

    if (req.url.indexOf('.css') != -1) { //test to see if file has .css extension
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

    if (req.url.indexOf('.js') != -1) { //test to see if file has .js extension
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


// Create connection to MySQL database;
/*
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "generic"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL.");
});
*/