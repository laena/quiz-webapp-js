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
            console.log(request);
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
    });

    return io;
}

function send(message, parameters) {
    io.sockets.emit(message, parameters);
}

// request handling -------------------------------------------------------- //

function handleNewQuestionRequest(data) {
    if(!checkToken(data['token'])) { return; }

    var question = getNewQuestion(data['token']);
    send('newQuestionResponse', { id: question.id, 
            question: question.question, answers: question.answers });
}

function handleVerifyAnswerRequest(data) {
    if(!checkToken(data['token'])) { return; }

    var isCorrect = verifyAnswer(data['token'], data['questionId'],
        data['answerIndex']);
    send('verifyAnswerResponse', { result: isCorrect ? 1 : 0 });
}

function handleTryLoginRequest(data) {
    var token = loginUser(data['username'], data['password']);
    send('tryLoginResponse', { token: token});
}

function handleTryRegistrationRequest(data) {
    var token = registerUser(data['username'], data['password']);
    send('tryRegistrationResponse', { token: token });
}

// questions & answers ----------------------------------------------------- //

function getNewQuestion(token) {
    return storage.loadRandomQuestion();
}

function verifyAnswer(token, questionId, answerIndex) {
    var question = storage.loadQuestionById(questionId);
    var isCorrect = (question.correctAnswerIndex == answerIndex);
    updateClientScore(token, isCorrect);
    return isCorrect;
}

// authentication ---------------------------------------------------------- //

function loginUser(username, password) {
    var user = storage.loadUserByName(username);
    return user == null || user.password != password ? null :
        generateSessionToken(user);
}

function registerUser(username, password) {
    var user = storage.loadUserByName(username);
    if(user) {
        return null;
    } else {
        user = storage.createUser(username, password);
        storage.storeUser(user);
        return loginUser(username, password);
    }
}

function generateSessionToken(user) {
    user.token = hat();
    storage.storeUser(user);
    return user.token;
}

function checkToken(token) {
    var user = storage.loadUserByToken(token);
    if(user == null) {
        send('invalidTokenResponse', { token: token });
        return false;
    }
    return true;
}

// highscore --------------------------------------------------------------- //

function updateClientScore(token, isCorrect) {
    var user = storage.loadUserByToken(token);
    var score = storage.loadScoreForUser(user);
    if(score == null) { score = storage.createScore(user.username, 0, 0); }
    if(isCorrect) { score.correctAnswers++; }
    score.questionsAnswered++;
    storage.storeScore(score);
}
