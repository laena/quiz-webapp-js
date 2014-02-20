module.exports = {

	initializeDB: function(databaseName, db) {
		quizCollection = db.collection(databaseName);
		fillDBIfEmpty(quizCollection);
	},

	loadQuestion: function(id, callback) {
		if (!quizCollection || quizCollection == null) {
			console.log("Quiz collection not loaded");
			callback(null);
			return;
		}
		quizCollection.findOne({ID: id}, function(err, item) {
			if (err || !item || item == undefined) {
				console.log("Cannot find Question with ID: " + id);
				callback(null);
				return;
			}
			callback(documentToQuestion(item));
		})
	}
};

var quizCollection = null;

function question(ID, text, answers, correctAnswer) {
	this.ID = ID;
	this.text = text;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}

function questionToDocument(question) {
	return {ID: question.ID, text: question.text, answers: question.answers, correctAnswer: question.correctAnswer};
}

function documentToQuestion(doc) {
	return new question(doc.ID, doc.text, doc.answers, doc.correctAnswer);
}

function fillDBIfEmpty(quizCollection) {        
	var questions = new Array();
	questions[0] = new question(0, "What is 5+5?",  ["10", "11", "12", "Dogge"], 0);
	questions[1] = new question(1, "What can dogs not do?",  ["Look up!", "Cheat!", "Your Mother!", "B Cutzz:D"], 0);
	questions[2] = new question(2, "What's in it for me?",  ["Dunno", "Your Mother!", "Chocolate?", "Beer"], 0);
	questions[3] = new question(3, "What let the dogs out?",  ["You", "U", "OO", "Who!"], 3);

	questions.forEach(function(question){
		quizCollection.update({ID: question.ID}, questionToDocument(question), {upsert:true});
	});
}