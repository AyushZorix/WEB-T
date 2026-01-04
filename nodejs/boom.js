var express = require('express');
var mysql = require("mysql2");
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

var db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: ""
});

// 1. Connect
db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// 2. Create database
db.query("CREATE DATABASE IF NOT EXISTS train", function (err) {
    if (err) throw err;
    console.log("Database created or exists");

    // Use database
    db.changeUser({ database: "train" });

    // 3. Create table
    db.query(
        "CREATE TABLE IF NOT EXISTS train (id INT, name VARCHAR(50))",
        function (err) {
            if (err) throw err;
            console.log("Table ready");
        }
    );
});


// FORM
app.get("/send", function (req, res) {
    var rr = "<html><body>";
    rr += "<form method='POST' action='/thank'>";
    rr += "ID:<input type='number' name='id'><br>";
    rr += "NAME:<input type='text' name='name'><br>";
    rr += "<input type='submit' value='Send'>";
    rr += "<br><a href='/all'>View All trains</a>";
    rr += "</form>";
    rr += "</body></html>";
    res.send(rr);
});


// INSERT
app.post("/thank", function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var sql = "INSERT INTO train (id, name) VALUES (?, ?)";

    db.query(sql, [id, name], function (err) {
        if (err) throw err;
        console.log("Record inserted");
    });

    res.send("Thank you for sending the data!");
});


// SHOW ALL
app.get("/all", function (req, res) {
    db.query("SELECT * FROM train", function (err, result) {
        if (err) throw err;

        var html = `
        <html><body><table border='1'>
        <tr><th>ID</th><th>Name</th></tr>
        `;

        result.forEach(row => {
            html += `<tr><td>${row.id}</td><td>${row.name}</td></tr>`;
        });

        html += "</table></body></html>";
        res.send(html);
    });
});


// RUN SERVER
app.listen(9002, function () {
    console.log("Server running at http://localhost:9002/send");
});
