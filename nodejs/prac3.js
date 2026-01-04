const express = require("express");
var bodyParser = require('body-parser');
var mysql = require("mysql2");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// DB CONNECTION
var db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: ""
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

// CREATE DATABASE
db.query("CREATE DATABASE IF NOT EXISTS library", function (err) {
    if (err) throw err;
    console.log("Database ready");
});

// USE DATABASE
db.changeUser({ database: "library" });

// CREATE ONE TABLE ONLY
db.query(`
    CREATE TABLE IF NOT EXISTS book (
        id INT PRIMARY KEY,
        name VARCHAR(50),
        author VARCHAR(50),
        price INT,
        quantity INT DEFAULT 0
    )
`, function (err) {
    if (err) throw err;
    console.log("Table ready");
});


// ============================
// 📌 FORM — ADD BOOK
// ============================
app.get("/send", function (req, res) {
    var rr = "<html><body>";
    rr += "<h2>Add Book</h2>";
    rr += "<form method='POST' action='/thank'>";
    rr += "ID: <input type='number' name='id'><br>";
    rr += "NAME: <input type='text' name='name'><br>";
    rr += "AUTHOR: <input type='text' name='author'><br>";
    rr += "PRICE: <input type='number' name='price'><br>";
    rr += "QUANTITY: <input type='number' name='quantity'><br>";
    rr += "<input type='submit' value='Add Book'>";
    rr += "</form>";

    rr += "<br><a href='/all'>View All Books</a>";
    rr += "<br><a href='/delete'>Delete Book</a>";
    rr += "<br><a href='/update'>Update Quantity</a>";

    rr += "</body></html>";
    res.send(rr);
});


// ============================
// 📌 INSERT BOOK
// ============================
app.post("/thank", function (req, res) {
    var { id, name, author, price, quantity } = req.body;

    var sql = "INSERT INTO book VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [id, name, author, price, quantity], function (err, result) {
        if (err) {
            console.log("Insert Error:", err);
            return res.send("Error inserting record.");
        }

        res.send("<h2>Book added successfully</h2><br><a href='/send'>Back</a>");
    });
});


// ============================
// 📌 VIEW ALL BOOKS
// ============================
app.get("/all", function (req, res) {
    db.query("SELECT * FROM book", function (err, result) {
        if (err) throw err;

        var html = `
            <h1>All Books</h1>
            <table border='1'>
            <tr><th>ID</th><th>Name</th><th>Author</th><th>Price</th><th>Qty</th></tr>
        `;

        result.forEach((row) => {
            html += `<tr>
                        <td>${row.id}</td>
                        <td>${row.name}</td>
                        <td>${row.author}</td>
                        <td>${row.price}</td>
                        <td>${row.quantity}</td>
                    </tr>`;
        });

        html += "</table><br><a href='/send'>Back</a>";
        res.send(html);
    });
});


// ============================
// 📌 DELETE BOOK BY ID
// ============================
app.get("/delete", function (req, res) {
    var html = `
        <h2>Delete Book</h2>
        <form method='POST' action='/deleteBook'>
            ID: <input name='id' type='number'>
            <input type='submit' value='Delete'>
        </form>
        <br><a href='/send'>Back</a>
    `;
    res.send(html);
});

app.post("/deleteBook", function (req, res) {
    var id = req.body.id;

    db.query("DELETE FROM book WHERE id = ?", [id], function (err) {
        if (err) throw err;
        res.send("<h2>Book Deleted</h2><br><a href='/send'>Back</a>");
    });
});


// ============================
// 📌 UPDATE QUANTITY
// ============================
app.get("/update", function (req, res) {
    var html = `
        <h2>Update Book Quantity</h2>
        <form method='POST' action='/updateQty'>
            Book ID: <input name='id' type='number'><br>
            New Quantity: <input name='quantity' type='number'><br>
            <input type='submit' value='Update'>
        </form>
        <br><a href='/send'>Back</a>
    `;
    res.send(html);
});

app.post("/updateQty", function (req, res) {
    var { id, quantity } = req.body;

    db.query("UPDATE book SET quantity = ? WHERE id = ?", [quantity, id], function (err) {
        if (err) throw err;
        res.send("<h2>Quantity Updated</h2><br><a href='/send'>Back</a>");
    });
});


// ============================
// SERVER START
// ============================
app.listen(9002, function () {
    console.log("Server running at http://localhost:9002/send");
});
