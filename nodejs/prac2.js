var express = require('express');
var mysql = require('mysql2');
var bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({extended:true}))

var db = mysql.createConnection({
    host:"127.0.0.1" , 
    user:"root",
    password:"Kar",
    database:"employee"
})

db.connect((err) => {
    if(err) throw err;
    console.log("Connected to MySQL");
})

db.query("CREATE TABLE IF NOT EXISTS employee ( id INT , name VARCHAR(50) , salary INT )" ,
function(err){
    if(err) throw err;
    console.log("Table created or exists");
})

app.get("/send" , function(req,res){
    var rr = "<html><body>"
    rr += "<form method='POST' action='/thank'>"
    rr += "ID:<input type='number' name='id'><br>"
     rr += "NAME:<input type='text' name='name'><br>"
      rr += "SALARY:<input type='number' name='salary'><br>"
      rr += "<input type='submit' value='Send'>"
      rr += "</form>"
      rr += "<br><a href='/all'>View All Students</a>"
      rr += "</body></html>"
      res.send(rr);
})

app.post("/thank", function(req ,res){
    var id = parseInt(req.body.id)
    var name = req.body.name
    var salary = parseInt(req.body.salary)

    var sql = "INSERT INTO employee ( id , name ,  salary) VALUES ( ? , ? , ?) "
    
    db.query(sql , [id , name , salary] , function(err, result){
        if( err ){
            console.log("Insert Error:" , err);
        }
        console.log("Record inserted:" , result);
        res.send("Record inserted successfully");
    })
})

app.get("/all" , function(req , res){
    db.query(" SELECT * FROM employee" , function(err , result){
        if(err)throw err;
        console.log("Records fetched:" , result);

        var html = "<html><body>"
        html += "<h1>Employee Records</h1>"
        html += "<table border='1'>"
        html += "<tr><th>ID</th><th>Name</th><th>Salary</th></tr>"
        result.forEach(function(row){
            html += `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.salary}</td></tr>`;
        }) 
     html += "</table>"
     html += "<br><a href='/send'>Go Back to Form</a>"
     html += "</body></html>"
     res.send(html)
    })
})

app.listen(4000, function(){
    console.log("Server running at http://localhost:4000/send");
})
