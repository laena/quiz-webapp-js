var socketio;

function initializeConnection() {
	socketio = io.connect('127.0.0.1:1337');
}

function registerSocketCallback(messageName, callback) {
	socketio.on(messageName, callback);
}

function sendMessage(messageName, parameters) {
	socketio.emit(messageName, parameters);
}

// Server Requests --------------------------------------------------------- //

function requestNewQuestion(token) {
	sendMessage('newQuestionRequest', { token: token });
}

function requestAnswerVerfication(token, questionId, answerIndex) {
	sendMessage('verifyAnswerRequest', {
		token: token, questionId: questionId, answerIndex: answerIndex
	});
}

function requestLoginTrial(username, password) {
	sendMessage('tryLoginRequest', {username: username, password: password});
}

function requestRegistrationTrial(username, password) {
	sendMessage('tryRegistrationRequest', {
		username: username, password: password
	});
}


// Server Response events -------------------------------------------------- //

function registerForNewQuestionResponse(callback) {
	registerSocketCallback('newQuestionResponse', 
		function(data) { 
			callback(data['id'], data['question'], data['answers']);
		}
	);
}

function registerForVerifyAnswerResponse(callback) {
	registerSocketCallback('verifyAnswerResponse', 
		function(data) { callback(data['result'] == 1); }
	);
}

function registerForTryLoginResponse(callback) {
	registerSocketCallback('tryLoginResponse', 
		function(data) { callback(data['token']); }
	);
}

function registerForTryRegistrationResponse(callback) {
	registerSocketCallback('tryRegistrationResponse', 
		function(data) { callback(data['token']); }
	);
}

function registerForInvalidTokenResponse(callback) {
	registerSocketCallback('invalidTokenResponse', 
		function(data) { callback(data['token']);}
	);
}

function registerForQuizEndedResponse(callback) {
	registerSocketCallback('quizEndedResponse', 
		function(data) { callback(data['score']);}
	);
}