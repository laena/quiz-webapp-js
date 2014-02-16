function question(ID, text, answers, correctAnswer) {
	this.ID = ID;
	this.text = text;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}

function checkResult(questionID, answerIndex){
	for (var i = 0; i < questions.length; ++i) {
		if (questions[i].ID == questionID) {
			return answerIndex == questions[i].correctAnswer;
		}
	}
    return false;
}

function questionToDocument(question) {
    return {ID: question.ID, text: question.text, answers: question.answers, correctAnswer: question.correctAnswer};
}

function checkError(err) {
  if (err != null)
    console.log(err);
  assert.equal(null, err);
}

// save data in database
var Db = require('tingodb')().Db;
var assert = require('assert');

var db = new Db('./db', {});
var collection = db.collection("quiz_db");

var questions = new Array();
questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz :D"], 0);
questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

questions.forEach(function(question){
    collection.save(questionToDocument(question), checkError);
});

function loadQuestions(collection) {
    dbquestions = new Array();
    var cursor = collection.find({ID:0}, function(err, doc){
        checkError(err);
        doc.each(function(entry){
            console.log(entry.ID);
            dbquestions.push("...");
        });
    });
    return dbquestions;
}

// start up server
var http = require('http');
var fs = require('fs');
var app = http.createServer(function (request, response) {
    fs.readFile("client.html", 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}).listen(1337);

questions = loadQuestions(collection);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
    socket.on('get_next_question', function(data) {
    	var index = data['currentQuestion'];
    	if (index >= questions.length) return; // TODO error message
    	var current = questions[index];
        io.sockets.emit("new_question", { question: current.text, answers: current.answers });
    });

    socket.on('submit_answer', function(data) {
    	var answerIndex = data['answer'];
        var questionID = data['questionID'];
    	var correct = checkResult(questionID, answerIndex);
        io.sockets.emit("result", { result: correct ? 1 : 0});
    });
});