var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"adidas",
    database: "sevents"
});

con.connect( (err) => {
    if (err) throw err;
    console.log("connected");
});

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send("aici");
});

app.get('/about', (req, res) => {
    res.send("about");
});

app.get('/user/listofusers', (req, res) => {
    con.query('SELECT * from user', (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/register',(req, res) => {
    console.log(req.body);
    var user = req.body;
    var sql = "INSERT IGNORE INTO user (email, password) VALUES ('" + user.email +"', '" + user.password + "')";
    con.query(sql,(err, result) => {
        if (err) throw err;
        console.log("number of records: " + result.affectedRows);
        res.send(result);
    });
});

app.post('/sEvents/login', (req, res) => {
    var user = req.body;
    var sql = "SELECT id FROM user where email ='" + user.email+"'";
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.listen(1337);



