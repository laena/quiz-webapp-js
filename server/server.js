var assert = require('assert');
var http = require('http');
var fs = require('fs');
var dbengine = require('tingodb')();
var qs = require('querystring');
var hat = require('hat');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function question(ID, text, answers, correctAnswer) {
    this.ID = ID;
    this.text = text;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
}

function user(ID, username, password, email) {
    this.ID = ID;
    this.username = username;
    this.password = password;
    this.email = email;
}

// ------------------------------------------------------------------------- //
//                            database stuff                                 //
// ------------------------------------------------------------------------- //

var db = new dbengine.Db('./db', {});
var quizCollection = db.collection("quiz_db");

function fillDBIfEmpty() {        
    var questions = new Array();
    questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
    questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz :D"], 0);
    questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
    questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

    questions.forEach(function(question){
        quizCollection.update({ID: question.ID}, questionToDocument(question), {upsert:true});
    });
}

fillDBIfEmpty();

function loadQuestion(id, callback) {
    quizCollection.findOne({ID : id}, function(err, item) {
        if (err) {
            console.log("Cannot find Question with ID: " + id);
            return;
        }
        callback(documentToQuestion(item));
     })
}

function questionToDocument(question) {
    return {ID: question.ID, text: question.text, answers: question.answers, correctAnswer: question.correctAnswer};
}

function documentToQuestion(doc) {
    return new question(doc.ID, doc.text, doc.answers, doc.correctAnswer);
}

// ------------------------------------------------------------------------- //
//                            authentication                                 //
// ------------------------------------------------------------------------- //

var userCollection = db.collection("user_db");
userCollection.update({username : "admin"}, {username : "admin", password : "admin"}, {upsert:true});

var activeTokens = new Array();

function loginUser(user, password, callback) {
    userCollection.findOne({username : user} , function(err, item) {
        if (err) {
            callback("unknown user", null);
            return;
        }
        console.log(item);
        if (item.password == password) {
            var token = generateUserToken(user);
            activeTokens.push(token);
            console.log("active tokens: " + token);
            callback(true, token); // success
        } else return callback(false, null); // invalid password
    });
}

function registerUser(user, password, callback) {
    userCollection.findOne({username : user} , function(err, item) {
        if (err == null && item != null) {
            return callback(false);
            return;
        } else {
            userCollection.save({username : user, password : password}, {save:true});
            callback(true);
        }
    });
}

function generateUserToken(user) {
    return hat();
}

// ------------------------------------------------------------------------- //
//                     server communication stuff                            //
// ------------------------------------------------------------------------- //

// start up server
var app = http.createServer(function (request, response) {
    console.log(request);
    response.writeHead(404);
    response.write("Not Found");
    response.end();
}).listen(1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {

    socket.on('get_next_question', function(data) {
        loadQuestion(data['currentQuestion'], function(current) {
            if (checkToken(data['userToken']))
                io.sockets.emit("new_question", { question: current.text, answers: current.answers });
        });
    });

    socket.on('submit_answer', function(data) {
        loadQuestion(data['questionID'], function(current) {
            if (checkToken(data['userToken']))
                io.sockets.emit("result", { result: current.correctAnswer == data['answer'] ? 1 : 0});
        });
    });

    socket.on('login_user', function(data) {
        loginUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit("login_result", { result : current, userToken : token});
        });
    });

    socket.on('register_user', function(data) {
        registerUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit("register_result", { result : current });
        });
    });
});

function checkToken(token) {
    console.log("Checking token: " + token);
    return activeTokens.indexOf(token) != -1;
}