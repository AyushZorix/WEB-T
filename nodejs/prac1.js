var express = require('express');
var mysql = require('mysql2');
var bodyParser = require('body-parser');

var app = express(); 
var urlencodedParser = bodyParser.urlencoded({extended:true});

// MySQL connection
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Karmanya@1234',
    database: 'webtechlab'
});

db.connect((err) => {
    if(err) throw err;
    console.log("Connected to MySQL");
});

// Create table
db.query("CREATE TABLE IF NOT EXISTS student (roll INT, per FLOAT, name VARCHAR(50))",
function(err){
    if(err) throw err;
    console.log("Table created or exists");
});

// Show form
app.get('/send', function(req, res) {
    var rr = "<html><body>";
    rr += "<form method='POST' action='/thank'>";
    rr += "Roll Number: <input type='number' name='one'><br>";
    rr += "Percentage: <input type='number' name='two'><br>";
    rr += "Name: <input type='text' name='three'><br>";
    rr += "<input type='submit' value='Send'>";
    rr += "</form>";
    rr += "<br><a href='/students'>View All Students</a>";
    rr += "</body></html>";
    res.send(rr);
});

// Insert data
app.post('/thank', urlencodedParser, function(req, res) {
    var roll = parseInt(req.body.one);
    var per = parseFloat(req.body.two);
    var name = req.body.three;

    var sql = "INSERT INTO student (roll, per, name) VALUES (?, ?, ?)";

    db.query(sql, [roll, per, name], function(err, result) {
        if(err) {
            console.log("Insert Error:", err);
            res.send("Error inserting record");
            return;
        }
        console.log("Record inserted:", result);
        res.send(`Record inserted: ${name}<br><br><a href='/students'>View All Students</a>`);
    });
});

// View all
app.get('/students', function(req, res) {
    db.query("SELECT * FROM student", function(err, rows) {
        if(err) throw err;

        var html = "<html><body>";
        html += "<h2>All Students</h2>";
        html += "<table border='1' cellpadding='5'>";
        html += "<tr><th>Roll</th><th>Percentage</th><th>Name</th></tr>";

        rows.forEach(function(row) {
            html += `<tr><td>${row.roll}</td><td>${row.per}</td><td>${row.name}</td></tr>`;
        });

        html += "</table><br>";
        html += "<a href='/send'>Go Back to Form</a>";
        html += "</body></html>";

        res.send(html);
    });
});

app.listen(9001, function(){
    console.log("Server running at http://localhost:9001/send");
});
