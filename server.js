var assert = require('assert');
var http = require('http');
var fs = require('fs');
var dbengine = require('tingodb')();

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function question(ID, text, answers, correctAnswer) {
    this.ID = ID;
    this.text = text;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
}

// ------------------------------------------------------------------------- //
//                            database stuff                                 //
// ------------------------------------------------------------------------- //

var db = new dbengine.Db('./db', {});
var collection = db.collection("quiz_db");

function fillDB() {        
    var questions = new Array();
    questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
    questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz :D"], 0);
    questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
    questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

    questions.forEach(function(question){
        collection.insert(questionToDocument(question));
    });
}

collection.findOne({ID: 0}, function(err, item) {
    if(item == null) {
        fillDB();
    }
});

function loadQuestion(id, callback) {
    collection.findOne({ID: id}, function(err, item) {
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
//                     server communication stuff                            //
// ------------------------------------------------------------------------- //

// start up server
var app = http.createServer(function (request, response) {
    if (request.url == "/") {
        fs.readFile("client.html", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    } else if (request.url.endsWith(".js")) {
        fs.readFile("."+String(request.url), 'utf-8', function (error, data) {
            if (error == null) {
                response.writeHead(200, {'Content-Type': 'application/javascript'});
                response.write(data);
                response.end();
            } else {
                console.log(error);
                return;
            }
        });
    }
}).listen(1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {

    socket.on('get_next_question', function(data) {
        loadQuestion(data['currentQuestion'], function(current) {
            io.sockets.emit("new_question", { question: current.text, answers: current.answers });
        });
    });

    socket.on('submit_answer', function(data) {
        loadQuestion(data['questionID'], function(current) {
            io.sockets.emit("result", { result: current.correctAnswer == data['answer'] ? 1 : 0});
        });
    });
});