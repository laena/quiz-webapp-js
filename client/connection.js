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

function requestNewQuestion(userToken, questionIndex) {
	sendMessage('newQuestionRequest', {
		currentQuestion: questionIndex, userToken: userToken
	});
}

function requestAnswerVerfication(userToken, questionIndex, answerIndex) {
	sendMessage('verifyAnswerRequest', {
		answer: answerIndex, questionIndex: questionIndex, userToken: userToken
	});
}

function requestLoginTrial(username, password) {
	sendMessage('tryLoginRequest', {user: username, password: password});
}

function requestRegistrationTrial(username, password) {
	sendMessage('tryRegistrationRequest', {
		user: username, password: password
	});
}


// Server Response events -------------------------------------------------- //

function registerForNewQuestionResponse(callback) {
	registerSocketCallback('newQuestionResponse', 
		function(data) { 
			callback(data['question'], data['answers']);
		}
	);
}

function registerForVerifyAnswerResponse(callback) {
	registerSocketCallback('verifyAnswerResponse', 
		function(data) { 
			callback(data['result'] == 1);
		}
	);
}

function registerForTryLoginResponse(callback) {
	registerSocketCallback('tryLoginResponse', 
		function(data) { 
			callback(data['result'], data['userToken']);
		}
	);
}

function registerForTryRegistrationResponse(callback) {
	registerSocketCallback('tryRegistrationResponse', 
		function(data) { 
			callback(data['result']);
		}
	);
}

function registerForInvalidTokenResponse(callback) {
	registerSocketCallback('invalidTokenResponse', 
		function(data) { 
			callback(data['userToken']);
		}
	);
}
