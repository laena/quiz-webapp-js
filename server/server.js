var assert = require('assert');
var http = require('http');
var fs = require('fs');
var dbengine = require('tingodb')();
var qs = require('querystring');
var hat = require('hat');

// ------------------------------------------------------------------------- //
//                            constructors                                   //
// ------------------------------------------------------------------------- //

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
var questionDB = require('./questions.js');
questionDB.initializeDB('quiz_db', db);

// ------------------------------------------------------------------------- //
//                            authentication                                 //
// ------------------------------------------------------------------------- //

var userCollection = db.collection('user_db');
userCollection.update({username: "admin"}, {username: "admin", password: "admin", token: null}, {upsert:true});

var activeTokens = {};
loadSessionTokens();

function loadSessionTokens() {

}

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
            activeTokens[token] = user;
            return callback(true, token); // success
        } else return callback(false, null); // invalid password
    });
}

function logoutUser(user, token, callback) {
    userCollection.findOne({username: user} , function(err, item) {
        if (err) {
            callback('unknown user', null);
            return;
        }
        else if (item.token != token) {
            console.log('Tokens different, this should not happen');
            return callback(false);
        }
        item.token = null;
        delete activeTokens.token;
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

function confirmToken(token) {
    var result = activeTokens[token] && (activeTokens[token] != null);
    console.log('Checking token: ' + token + '[' + result + ']');
    if (!result) {
        io.sockets.emit('invalidTokenResponse', { userToken: token });
    }
    return result;
}

// ------------------------------------------------------------------------- //
//                     server communication stuff                            //
// ------------------------------------------------------------------------- //

// start up server
var app = http.createServer(function (request, response) {
    console.log(request);
    response.writeHead(404);
    response.write('Not Found');
    response.end();
}).listen(1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {

    socket.on('newQuestionRequest', function(data) {
        console.log(data);
        questionDB.loadQuestion(data['currentQuestion'], function(current) {
            if (confirmToken(data['userToken'])) {
                if (current == null)
                    io.sockets.emit('newQuestionResponse', { question: null, answers: null }); // last question in quiz
                else
                    io.sockets.emit('newQuestionResponse', { question: current.text, answers: current.answers });                
            }
        });
    });

    socket.on('verifyAnswerRequest', function(data) {
        questionDB.loadQuestion(data['questionIndex'], function(current) {
            if (confirmToken(data['userToken']))
                io.sockets.emit('verifyAnswerResponse', { result: current.correctAnswer == data['answer'] ? 1: 0});
        });
    });

    socket.on('tryLoginRequest', function(data) {
        loginUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit('tryLoginResponse', { result: current, userToken: token});
        });
    });

    socket.on('tryRegistrationRequest', function(data) {
        registerUser(data['user'], data['password'], function(current, token) {
            io.sockets.emit('tryRegistrationResponse', { result: current });
        });
    });
});
