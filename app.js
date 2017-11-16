var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"adidas",
    database: "sevents"
},{multipleStatements: true});

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

app.post('/sEvents/user/events/listOfEvents', (req, res) => {
    var user = req.body;
    con.query("SELECT E.id, E.name, T.type_event, L.location FROM event E, event_location L, event_type T, user_event U WHERE U.id_user = ? AND U.id_event = E.id AND E.id = L.id_event and E.id = T.id_event",[user.userId],(err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/events/userJoinedEvents', (req, res) => {
    var user = req.body;
    con.query("SELECT E.name, T.type_event, L.location FROM event E, event_location L, event_type T, event_participants P WHERE P.id_participant = ?  AND P.id_event = E.id AND E.id = L.id_event AND E.id = T.id_event",[user.userId],(err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/listOfFriends', (req, res) => {
    var user = req.body;
    con.query("SELECT DISTINCT U.firstname, U.lastname, U.id FROM User U, user_friend F WHERE U.id = F.id_friend AND F.id_friend in (SELECT id_friend FROM user_friend X, USER Y WHERE X.id_user = (SELECT id FROM user WHERE email = ?) AND X.status = 4)",[user.email], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/removeFriend', (req, res) => {
    var user = req.body;
    con.query("DELETE from user_friend_rel WHERE id_user = ? AND id_friend = ?", [user.userId, user.friendId], (err, result) => {
        if (err) throw err;
        con.query("DELETE from user_friend_rel WHERE id_user = ? AND id_friend = ?", [user.friendId, user.userId], (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
});

app.post('/sEvents/user/searchForFriend', (req, res) => {
    var user = req.body;
    con.query("SELECT firstname, lastname, id from user WHERE email = ?", [user.email], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/addFriend', (req, res) => {

    var user = req.body;
    con.query("INSERT IGNORE INTO user_friend (id_user, id_friend, status) VALUES (?, ? , 2)", [user.userId, user.friendId], (err, result) => {
        if (err) throw err;
        con.query("INSERT IGNORE INTO user_friend (id_user, id_friend, status) VALUES (?, ? , 3)", [user.friendId, user.userId], (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });

});

app.post('/sEvents/user/getListOfFriendRequestSent', (req, res) => {
    var user = req.body;
    con.query("SELECT u.firstname, u.lastname, u.id FROM user u , user_friend f WHERE u.id = f.id_user and f.id_friend = ? and f.status = ? ",[user.userId, user.type], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/cancelRequest', (req, res) => {
    var user = req.body;
    con.query("DELETE from user_friend WHERE id_user = ? AND id_friend = ?", [user.userId, user.friendId], (err, result) => {
        if (err) throw err;
        con.query("DELETE from user_friend WHERE id_user = ? AND id_friend = ?", [user.friendId, user.userId], (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
});


app.post('/sEvents/user/acceptFriendRequest', (req, res) => {
    var user = req.body;
    con.query("UPDATE user_friend SET status = 4 WHERE id_user = ? AND id_friend = ?  and (status = 2 OR status = 3)", [user.userId, user.friendId], (err, result) => {
        if (err) throw err;
        con.query("UPDATE user_friend SET status = 4 WHERE id_user = ? AND id_friend = ?  and (status = 2 OR status = 3)", [user.friendId, user.userId], (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
});

app.post('/sEvents/user/events/cancelEvents', (req, res) => {
    var user = req.body;
    con.query("DELETE FROM event_participants WHERE id_event = ?", [user.eventId], (err, result) => {
        if (err) throw err;
        con.query("DELETE FROM user_event WHERE id_user = ? AND id_event = ?", [user.userId, user.eventId], (err, result) => {
            if (err) throw err;
            con.query("DELETE FROM event_location WHERE id_event = ?", [user.eventId], (err, result) => {
                if (err) throw err;
                con.query("DELETE FROM event_type WHERE id_event = ?", [user.eventId], (err, result) => {
                    if (err) throw err;
                    con.query("DELETE FROM event WHERE id = ?", [user.eventId], (err, result) => {
                        if (err) throw err;
                        res.send(result);
                    });
                });
            });
        });
    });
});

app.post('/sEvents/user/events/createEvent', (req, res) => {
    var event = req.body;
    con.query("INSERT INTO event (name) VALUES (?)",[event.name], (err, result) => {
        if (err) throw err;
        var eventId = result.insertId;
        con.query("INSERT INTO event_location VALUES(?, ?)", [eventId, event.location], (err, result) => {
            if (err) throw err;
            con.query("INSERT INTO event_type VALUES(?, ?)", [eventId, event.type], (err, result) => {
                if (err) throw err;
                con.query("INSERT INTO user_event VALUES(?, ?)", [event.userId, eventId], (err, result) => {
                    if (err) throw err;
                    con.query("INSERT INTO event_participants VALUES(?, ?, ?)", [eventId, event.userId, 10], (err, result) => {
                        if (err) throw err;
                        res.send(result);
                    });
                });
            });
        });
    });
});

app.post('/sEvents/user/events/searchForEvent', (req, res) => {
    var event = req.body;
    con.query("SELECT E.id, E.name, T.type_event, L.location FROM event E, event_type T, event_location L WHERE E.id = T.id_event AND E.id = L.id_event AND E.name = ?", [event.name], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/sEvents/user/events/joinEvent', (req, res) => {
    var event = req.body;
    con.query("INSERT INTO event_participants VALUES (?,?,3)", [event.eventId, event.userId], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.listen(1337);

