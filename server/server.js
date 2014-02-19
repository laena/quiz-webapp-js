var assert = require('assert');
var http = require('http');
var fs = require('fs');
var dbengine = require('tingodb')();
var qs = require('querystring');
var hat = require('hat');

// ------------------------------------------------------------------------- //
//                            utility stuff                                  //
// ------------------------------------------------------------------------- //

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function removeByValue(array, value) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] === value) array.splice(i, 1);
    }
}

// ------------------------------------------------------------------------- //
//                            constructors                                   //
// ------------------------------------------------------------------------- //


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
    questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz:D"], 0);
    questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
    questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

    questions.forEach(function(question){
        quizCollection.update({ID: question.ID}, questionToDocument(question), {upsert:true});
    });
}

fillDBIfEmpty();

function loadQuestion(id, callback) {
    quizCollection.findOne({ID: id}, function(err, item) {
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
userCollection.update({username: "admin"}, {username: "admin", password: "admin", token: null}, {upsert:true});

var activeTokens = new Array();

function loginUser(user, password, callback) {
    userCollection.findOne({username: user} , function(err, item) {
        console.log(item);
        if (err) {
            console.log(err);
            callback("unknown user", null);
            return;
        }
        else if (item.password == password) {
            var token = generateUserToken(user);
            activeTokens.push(token);
            return callback(true, token); // success
        } else return callback(false, null); // invalid password
    });
}

function logoutUser(user, token, callback) {
    userCollection.findOne({username: user} , function(err, item) {
        if (err) {
            callback("unknown user", null);
            return;
        }
        else if (item.token != token) {
            console.log("Tokens different, this should not happen");
            return callback(false);
        }
        item.token = null;
        activeTokens.removeByValue(token);
        return callback(true);
    });
}

function registerUser(user, password, callback) {
    userCollection.findOne({username: user} , function(err, item) {
        if (err == null && item != null) {
            return callback(false);
        } else {
            userCollection.save({username: user, password: password}, {save:true});
            callback(true);
        }
    });
}

function generateUserToken(user) {
    var token = hat();
    userCollection.update({username: user}, { $set: { token: token } }, {});
    return token;
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

    socket.on('newQuestionRequest', function(data) {
        loadQuestion(data['currentQuestion'], function(current) {
            if (confirmToken(data['userToken'])) {
                io.sockets.emit("newQuestionResponse", { question: current.text, answers: current.answers });                
            }
        });
    });

    socket.on('verifyAnswerRequest', function(data) {
        loadQuestion(data['questionIndex'], function(current) {
            if (confirmToken(data['userToken']))
                io.sockets.emit("verifyAnswerResponse", { result: current.correctAnswer == data['answer'] ? 1: 0});
        });
    });

    socket.on('tryLoginRequest', function(data) {
        loginUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit("tryLoginResponse", { result: current, userToken: token});
        });
    });

    socket.on('tryRegistrationRequest', function(data) {
        registerUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit("tryRegistrationResponse", { result: current });
        });
    });
});

function confirmToken(token) {
    var result = activeTokens.indexOf(token) != -1;
    console.log("Checking token: " + token + '[' + result + ']');
    if(!result) {
        io.sockets.emit("invalidTokenResponse", { userToken: token });
    }
    return result;
}