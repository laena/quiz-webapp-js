module.exports = {

    initializeStorage: function() { initialize(); },

    createQuestion: function() { return new question(arguments); },
    loadRandomQuestion: function() { return getRandomQuestion(); },
    loadQuestionById: function(id) { return getQuestionById(id); },
    storeQuestion: function(question) { updateQuestion(question); },

    createUser: function() { return new user(arguments); },
    loadUserByName: function(username) { return getUserByName(username); },
    loadUserByToken: function(token) { return getUserByToken(token); },
    storeUser: function(user) { updateUser(user); },

    createScore: function() { return new score(arguments); },
    loadScoreForUser: function(user) { return getScoreForUser(user); },
    storeScore: function(score) { updateScore(score); }
};

var util = require('./util.js');

// database ---------------------------------------------------------------- //

var dbengine = require('tingodb')();
var db = new dbengine.Db('./db', {});

function initialize() {
    initializeQuestionCache();
    initializeUserCache();
    initializeScoreCache();
}

function initializeCache(cache, table, mapperFunction, id, afterwards) {
    var documents = table.find();
    documents.each(function(err, document) {
        if(document) {            
            var value = mapperFunction(document);
            cache[value[id]] = value;
        } else {
            if(afterwards) { afterwards(); }
        }
    });
    return cache;
}

// questions --------------------------------------------------------------- //

var questionDbTable = db.collection("questions");
var questionCache = new Array();

function question(arguments) {
  this.language = arguments[0];
  this.category = arguments[1];
  this.question = arguments[2];
  this.answers = arguments[3];
  this.correctAnswerIndex = arguments[4];
}

function questionToDocument(question) {
    return {
        language: question.language,
        category: question.category,
        question: question.question,
        answers: question.answers,
        correctAnswerIndex: question.correctAnswerIndex,
    };
}

function documentToQuestion(doc, id) {
    var result = new question([doc.language, doc.category, doc.question, 
        doc.answers, doc.correctAnswerIndex]
    );
    result.id = id;
    return result;
}

function initializeQuestionCache() {
    var documents = questionDbTable.find();
    var i=0;
    documents.each(function(err, document) {
        if(document) {
            questionCache[i] = documentToQuestion(document, i);
            ++i;
        }
    });
}

function getRandomQuestion() {
    return questionCache[Math.floor(questionCache.length * Math.random())];
}

function getQuestionById(id) {
    return questionCache[id];
}

function updateQuestion(question) {
    if(question.id == undefined) { question.id = questionCache.length; }
    questionCache[question.id] = question;
    questionDbTable.update({question: question.question}, 
        questionToDocument(question), {upsert:true});
}

// users ------------------------------------------------------------------- //

var userDbTable = db.collection("users");
var userCache = new Object();
var tokenToUserMap = new Object();

function user(arguments) {
    this.username = arguments[0];
    this.password = arguments[1];
    this.token = arguments[2];
}

function userToDocument(user) {
    return { username: user.username, password: user.password, 
        token: user.token
    };
}

function documentToUser(doc) {
    return new user([doc.username, doc.password, doc.token]);
}

function initializeUserCache() {
    initializeCache(userCache, userDbTable, documentToUser, 
        'username', function() {
            util.iterate(userCache, function(username, user) {
                if(user.token != null) { tokenToUserMap[user.token] = user; }
            });
    });
}

function getUserByName(username) {
    return userCache[username];
}

function getUserByToken(token) {
    return tokenToUserMap[token];
}

function updateUser(user) {
    delete tokenToUserMap[user.token];
    userCache[user.username] = user;
    userDbTable.update({username: user.username}, userToDocument(user), 
        {upsert:true});
    tokenToUserMap[user.token] = user;
}

// highscore --------------------------------------------------------------- //

var scoreDbTable = db.collection("scores");
var scoreCache = new Object();

function score(arguments) {
    this.username = arguments[0];
    this.correctAnswers = arguments[1];
    this.questionsAnswered = arguments[2];
}

function scoreToDocument(score) {
    return { username: score.username, correctAnswers: score.correctAnswers, 
        questionsAnswered: score.questionsAnswered
    };
}

function documentToScore(doc) {
    return new score([doc.username, doc.correctAnswers, doc.questionsAnswered]);
}

function initializeScoreCache() {
    initializeCache(scoreCache, scoreDbTable, documentToScore, 'username');
}

function getScoreForUser(user) {
    return scoreCache[user.username];
}

function updateScore(score) {
    scoreCache[score.username] = score;
    scoreDbTable.update({username: user.username}, scoreToDocument(score), 
        {upsert:true});
}