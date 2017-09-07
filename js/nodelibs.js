//function as a file server on localhost:8080
var http = require('http');
var fs = require('fs');
var url = require('url');

http.createServer(function(req, res) {
    var filename = "." + q.pathname;
    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404, { 'content-type': 'text/html' });
            return res.end("404 not found");
        }
        res.writeHead(200, { 'content-type': 'text/html' });
        res.write(data);
        return res.end;

    });
}).listen(8080);


// Create connection to MySQL database;
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