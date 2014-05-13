var assert = require('assert');
var http = require('http');
var fs = require('fs');
var hat = require('hat');

var util = require('./util.js');
var storage = require('./storage.js');

// initialization ---------------------------------------------------------- //

storage.initializeStorage();

var server = createServer();
var io = initializeConnection(server);

function createServer() {
    return http.createServer(
        function (request, response) {
            console.log('REQUEST:  ' + request);
            console.log('RESPONSE: ' + response);
            response.writeHead(404);
            response.write('Not Found');
            response.end();
        }).listen(1337);
}

function initializeConnection(server) {
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function(socket) {
        socket.on('newQuestionRequest', handleNewQuestionRequest);
        socket.on('verifyAnswerRequest', handleVerifyAnswerRequest);
        socket.on('tryLoginRequest', handleTryLoginRequest);
        socket.on('tryRegistrationRequest', handleTryRegistrationRequest);
        socket.on('themeChangeRequest', handleThemeChangeRequest);
        socket.on('avatarChangeRequest', handleAvatarChangeRequest);
        socket.on('avatarRequest', handleAvatarRequest);
    });

    return io;
}

function send(message, parameters) {
    io.sockets.emit(message, parameters);
}

// request handling -------------------------------------------------------- //

function handleThemeChangeRequest(data) {
    console.log('ChangeThemeRequest:');
    console.log(data);
    checkToken(data['token'], function(user) {
        user.theme = data['theme'];
        console.log(user.theme);
        storage.storeUser(user);
    });
}

function handleAvatarChangeRequest(data) {
    console.log('ChangeAvatarRequest:');
    console.log(data);
    checkToken(data['token'], function(user) {
        user.avatar = data['avatar'];
        console.log(user.avatar);
        storage.storeUser(user);
    });
}

function handleAvatarRequest(data) {
    console.log('AvatarRequest:');
    console.log(data);
    checkToken(data['token'], function(user) {
        console.log(user.avatar);
        send('avatarResponse', { avatar: user.avatar });
    });
}

function handleNewQuestionRequest(data) {
    console.log('NewQuestionRequest:');
    console.log(data);
    checkToken(data['token'], function(user) {
        getNewQuestion(data['token'], function(question) {
            send('newQuestionResponse', { id: question.id, 
                question: question.question, answers: question.answers });
        })
    });
}

function handleVerifyAnswerRequest(data) {
    console.log('VerifyAnswerRequest:');
    console.log(data);
    checkToken(data['token'], function(user) {
        verifyAnswer(user, data['questionId'], data['answerIndex'],
            function(isCorrect) {
                send('verifyAnswerResponse', { result: isCorrect ? 1 : 0 });
            })
    });
}

function handleTryLoginRequest(data) {
    console.log('TryLoginRequest:');
    console.log(data);
    loginUser(data['username'], data['password'], function(token, avatar, theme) {
        send('tryLoginResponse', { token: token, avatar: avatar, theme: theme });
    });
}

function handleTryRegistrationRequest(data) {
    console.log('TryRegistrationRequest:');
    console.log(data);
    registerUser(data['username'], data['password'], data['avatar'], function(token) {
        send('tryRegistrationResponse', { token: token });
    });
}

// questions & answers ----------------------------------------------------- //

function getNewQuestion(token, callback) {
    storage.loadRandomQuestion(callback);
}

function verifyAnswer(user, questionId, answerIndex, callback) {
    storage.loadQuestionById(questionId, function(question) {
        var isCorrect = (question.correctAnswerIndex == answerIndex);
        updateScore(user, isCorrect);
        callback(isCorrect);
    });
}

// authentication ---------------------------------------------------------- //

function loginUser(username, password, callback) {
    storage.loadUserByName(username, function(user) {
        if(user && user.password == password) {
            callback(generateSessionToken(user), user.avatar, user.theme);
        } else {
            callback(null, null);
        }        
    });
}

function registerUser(username, password, avatar, callback) {
    storage.loadUserByName(username, function(user) {
        if(user) { // user already in the db -> new registration not possible
            callback(null);
        } else {
            user = storage.createUser(username, avatar, 'standard', password);
            storage.storeUser(user);
            callback(generateSessionToken(user));
        }
    });
}

function generateSessionToken(user) {
    user.token = hat();
    storage.storeUser(user);
    return user.token;
}

function checkToken(token, onValidCallback) {
    console.log('checkToken');
    var user = storage.loadUserByToken(token, function(user) {
        console.log(user);
        if(user) {
            onValidCallback(user);
        } else {
            send('invalidTokenResponse', { token: token });
        }
    });
}

// highscore --------------------------------------------------------------- //

function updateScore(user, isCorrect) {
    storage.loadScoreForUser(user, function(score) {
        if(score == null) { score = storage.createScore(user.username, 0, 0); }
        if(isCorrect) { score.correctAnswers++; }
        score.questionsAnswered++;
        storage.storeScore(score);
    });
}
