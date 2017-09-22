/* Fills a SQL table "wopds" in "temp_database"
// Careful! This app will delete the table "words" in "temp_database"
// and replace the table with new data!
//
*/

var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('mysql');
var qs = require('querystring');

// current working mysql database and table
var currentDatabase = "temp_database";
var currentTable = "words";

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

// create a database if it doesn't exist, then select it
var sql = "CREATE DATABASE IF NOT EXISTS " + currentDatabase;
con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Database " + currentDatabase + " exists.");
});

var sql = "USE " + currentDatabase;
con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Database " + currentDatabase + " selected for use.");
});

// delete table
var sql = "DROP TABLE words";
con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Table deleted!");
});
// create a table 
// overdue column functions as a boolean column where 0 = false, 1 = true;
var sql = "CREATE TABLE words (id INT NOT NULL AUTO_INCREMENT, front TINYTEXT, back TINYTEXT, batch TINYINT DEFAULT 0, timestamp INT, overdue INT DEFAULT 0, PRIMARY KEY (id))"
con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Table " + currentTable + " exists.");
});

function calculateTimestamp() {
    return Math.round(Date.now() / 1000);
}

// populate table with random values
// this takes some time!
function populate(callback) {
    for (var i = 1; i < 10001; i++) {
        var rndfront = "front" + i;
        var rndback = "back" + i;
        var rndbatch = Math.floor(Math.random() * 8);
        var rndoverdue = Math.round(Math.random());

        var sql = "INSERT INTO words (front, back, batch, timestamp, overdue) VALUES ('" + rndfront + "', '" + rndback + "', " + rndbatch + ", '" + calculateTimestamp().toString() + "', " + rndoverdue + ")";
        con.query(sql, function(err, result) {
            if (err) throw err;

        });
        console.log(i + " = " + sql);
    }
}

populate(function() {
    console.log("Table filled!");
});