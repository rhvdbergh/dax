var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('mysql');

// Create connection to MySQL database;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "generic"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL.");
});

// function as a file server on localhost:8080
// the file server will handle MySQL too
http.createServer(function(req, res) {

    // mainly for debugging purposes, file requests are logged to the console
    console.log("File request made for: " + req.url);

    // test if the root domain was selected, or index without its extension was entered
    // if the above is true, return index.html
    if (req.url === "/" || req.url === "/index") {
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

    if (req.url.indexOf("\?") != -1) { // test to see if data is a query (submitted through a form)
        var q = url.parse(req.url, true);

        // since this was a query, qdata will hold the data submitted as an object
        // each element of the query is accessible through q.element
        var qdata = q.query;

        // test if 

        console.log("---> Data submitted through form: " + req.url);
        return;
    }

    if (req.url.indexOf('.html') != -1) { // test to see if file has .html extension
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