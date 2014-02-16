function question(ID, text, answers, correctAnswer) {
	this.ID = ID;
	this.text = text;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}

var questions = new Array();
questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz :D"], 0);
questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

function checkResult(questionID, answerIndex){
	for (var i = 0; i < questions.length; ++i) {
		if (questions[i].ID == questionID) {
			return answerIndex == questions[i].correctAnswer;
		}
	}
    return false;
}

// connect to database
var Db = require('tingodb')().Db;
var assert = require('assert');

var db = new Db('./db', {});
// Fetch a collection to insert document into
var collection = db.collection("batch_document_insert_collection_safe");
// Insert a single document
collection.insert([{hello:'world_safe1'}
  , {hello:'world_safe2'}], {w:1}, function(err, result) {
  assert.equal(null, err);

  // Fetch the document
  collection.findOne({hello:'world_safe2'}, function(err, item) {
    assert.equal(null, err);
    assert.equal('world_safe2', item.hello);
  })
});


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