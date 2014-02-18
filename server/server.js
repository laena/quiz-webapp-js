var assert = require('assert');
var http = require('http');
var fs = require('fs');
var dbengine = require('tingodb')();
var qs = require('querystring');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function question(ID, text, answers, correctAnswer) {
    this.ID = ID;
    this.text = text;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
}

function user(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
}

// ------------------------------------------------------------------------- //
//                            database stuff                                 //
// ------------------------------------------------------------------------- //

var db = new dbengine.Db('./db', {});
var quizCollection = db.collection("quiz_db");

function fillDB() {        
    var questions = new Array();
    questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
    questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz :D"], 0);
    questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
    questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

    questions.forEach(function(question){
        quizCollection.update({ID: question.ID}, questionToDocument(question), {upsert:true});
    });
}

fillDB();

function loadQuestion(id, callback) {
    quizCollection.findOne({ID : id}, function(err, item) {
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
//                     authentication                                        //
// ------------------------------------------------------------------------- //

var userCollection = db.collection("user_db");

function loginUser(user, password, callback) {
    userCollection.findOne({username : user} , function(err, item) {
        if (err) {
            callback("unknown user");
            return;
        }
        console.log(item);
        callback(item.password == password);
    });
}

// ------------------------------------------------------------------------- //
//                     server communication stuff                            //
// ------------------------------------------------------------------------- //

// start up server
var app = http.createServer(function (request, response) {
    console.log(request);
    if (request.method == "POST") {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var posted = qs.parse(body);
            var username = posted["user"];
            var password = posted["password"];
            console.log(username, password);
            loginUser(username, password);
        });
    } else { // This should not happen
        response.writeHead(404);
        response.write("Not Found");
        response.end();
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

    socket.on('login_user', function(data) {
        loginUser(data['user'], data['password'], function(current) {
            io.sockets.emit("login_result", { result: current });
        });
    });
});