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
    if (err) throw err.stack;
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
    var user = req.body;
    con.query("INSERT IGNORE INTO user (email, password) VALUES (?, ?)",[user.email, user.password],(err, result) => {
        if (err) throw err;
        //console.log("number of records: " + result.affectedRows);
        res.send(result);
    });
});

app.post('/sEvents/login', (req, res) => {
    var user = req.body;
    con.query("SELECT id FROM user WHERE email = ? and password = ?",[user.email, user.password], (err, result) => {
        if (err) throw err;
        //console.log(result);
        res.send(result);
    });
});

app.post('/sEvents/getUserData', (req, res) => {
    var user = req.body;
    con.query("SELECT * FROM user WHERE email = ?", [user.email], (err, result) => {
        if (err) throw err;
        //console.log(result);
        res.send(result);
    });
});

app.post('/sEvents/saveUserData', (req, res) => {
    var user = req.body;
    con.query("UPDATE user SET firstname = ?, lastname = ? , gender = ?, age = ? WHERE email = ?",
        [user.firstname, user.lastname, user.gender, user.age, user.email]), (err, result) => {
        if (err) throw err;
        //console.log(result);
        res.send(result);
    }
});

app.get('/sEvents/listOfEvents', (req, res) => {
    con.query("SELECT * from event",(err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/listOfFriends', (req, res) => {
    var user = req.body;
    con.query("SELECT U.firstname, U.lastname FROM User U, user_friend_rel F WHERE U.id = F.id_friend and F.id_friend in (SELECT id_friend from user_friend_rel X, USER Y where X.id_user = (SELECT id from user WHERE email = ?))",[user.email], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.listen(1337);



