function question(ID, text, answers, correctAnswer) {
	this.ID = ID;
	this.text = text;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}
// start up server
var http = require('http'), fs = require('fs');
var app = http.createServer(function (request, response) {
    fs.readFile("client.html", 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}).listen(1337);

var questions = new Array();
questions[0] = new question(0, "What is 5+5?",  [10, 11, 12], 0);
questions[1] = new question(1, "What is 5+6?",  [10, 11, 12], 1);

function checkResult(questionID, answerIndex){
	for (var i = 0; i < questions.length; ++i) {
		if (questions[i].ID == questionID) {
			return answerIndex == questions[i].correctAnswer;
		}
	}
}

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
    socket.on('next_question', function(data) {
    	var index = data['currentQuestion'];
    	if (index >= questions.length) return; // TODO error message
    	var current = questions[index];
        io.sockets.emit("question", { question: current.text, answers: current.answers });
    });

    socket.on('submit_answer', function(data) {
    	var answerIndex = data['answer'], questionID = data['questionID'];
    	boolean correct = checkResult(questionID, answerIndex);
        io.sockets.emit("result",{ result: correct ? "Correct" : "Wrong" });
    });
});