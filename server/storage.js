module.exports = {

    initializeStorage: function() { initialize(); },

    createQuestion: function() { return new question(arguments); },
    loadRandomQuestion: function(callback) { 
        return getRandomQuestion(callback); },
    loadQuestionById: function(id, callback) { 
        return getQuestionById(id, callback); },
    storeQuestion: function(question) { updateQuestion(question); },

    createUser: function() { return new user(arguments); },
    loadUserByName: function(username, callback) { 
        return getUserByName(username, callback); },
    loadUserByToken: function(token, callback) { 
        return getUserByToken(token, callback); },
    storeUser: function(user) { updateUser(user); },

    createScore: function() { return new score(arguments); },
    loadScoreForUser: function(user, callback) { 
        return getScoreForUser(user, callback); },
    storeScore: function(score) { updateScore(score); }
};

var util = require('./util.js');

// database ---------------------------------------------------------------- //

var dbengine = require('tingodb')();
var db = new dbengine.Db('./db', {});

function initialize() { }

function foreach(table, documentCallback, finalCallback) {
    var documents = table.find();
    documents.each(function(err, document) {
        if(err) { 
            console.log(err);
        } else {
            if(document) {            
                documentCallback(document);
            } else {
                finalCallback();
            }
        }
    });
}

function find(table, condition, callback) {
    table.findOne(condition, function(err, document) {
        if(err) { 
            console.log(err);
            callback(null);
        } else {            
            callback(document);
        }
    });
}

// questions --------------------------------------------------------------- //

var questionDbTable = db.collection("questions");

function question(arguments) {
  this.language = arguments[0];
  this.category = arguments[1];
  this.question = arguments[2];
  this.answers = arguments[3];
  this.correctAnswerIndex = arguments[4];

  this.id = arguments.length > 5 ? arguments[5] : -1;
}

function questionToDocument(question) {
    return { language: question.language, 
        category: question.category, question: question.question, 
        answers: question.answers,
        correctAnswerIndex: question.correctAnswerIndex };
}

function documentToQuestion(doc) {
    if(doc) {
        return new question([doc.language, doc.category, doc.question, 
            doc.answers, doc.correctAnswerIndex, doc._id]);
    } else {
        return null;
    }
}

var questionCache = new Array();
var questionCacheLastUpdate = -1;

function getRandomQuestion(callback) {
    if(questionCacheLastUpdate == -1 || 
        Date.now() - questionCacheLastUpdate > 1000 * 60 * 20 /* 20 min */) {
        questionCache = new Array();
        foreach(questionDbTable, function(doc) {
                questionCache[questionCache.length] = documentToQuestion(doc);
            }, function() {
                questionCacheLastUpdate = Date.now();
                getRandomQuestion(callback);
            });
    } else {
        callback(questionCache[Math.floor(
            questionCache.length * Math.random())]);
    }
}

function getQuestionById(id, callback) {
    find(questionDbTable, {_id: id}, function(document) {
        callback(documentToQuestion(document));
    });
}

function updateQuestion(question) {
    if(question.id == -1) {
        questionDbTable.insert(questionToDocument(question));
    } else {
        questionDbTable.update({_id: question.id}, 
            questionToDocument(question));
    }
}

// users ------------------------------------------------------------------- //

var userDbTable = db.collection("users");

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
    if(doc) {
        return new user([doc.username, doc.password, doc.token]);
    } else {
        return null;
    }
}

function getUserByName(username, callback) {
    find(userDbTable, {username: username}, function(document) {
        callback(documentToUser(document));
    });
}

function getUserByToken(token, callback) {
    find(userDbTable, {token: token}, function(document) {
        callback(documentToUser(document));
    });
}

function updateUser(user) {
    userDbTable.update({username: user.username}, userToDocument(user), 
        {upsert:true});
}

// highscore --------------------------------------------------------------- //

var scoreDbTable = db.collection("scores");

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
    if(doc) {
        return new score([doc.username, doc.correctAnswers, 
            doc.questionsAnswered]);
    } else {
        return null;
    }
}

function getScoreForUser(user, callback) {
    find(scoreDbTable, {username: user.username}, function(document) {
        callback(documentToScore(document));
    });
}

function updateScore(score) {
    scoreDbTable.update({username: user.username}, scoreToDocument(score), 
        {upsert:true});
}

// quiz --------------------------------------------------------------- //

var quizDbTable = db.collection("quizzes");

function quiz(arguments) {
    quiz.beginTime = arguments[0];
    quiz.token = arguments[1];
    quiz.type = arguments[2]
}

function quizToDocument(quiz) {
    return { beginTime: quiz.beginTime, token: quiz.token, type: quiz.type };
}

function documentToQuiz(doc) {
    return new quiz([doc.beginTime, doc.token, doc.type]);
}

function updateQuiz(quiz) {
    quizDbTable.update({beginTime: quiz.beginTime}, quizToDocument(quiz), 
        {upsert:true});
}