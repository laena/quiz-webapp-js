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

function requestAvatarChange(token, avatar) {
	sendMessage('avatarChangeRequest', {
		token: token, avatar: avatar
	});
}

function requestAvatar(token) {
	sendMessage('avatarRequest', { token: token });
}

function requestNewQuiz(token) {
	sendMessage('newQuizRequest', { token: token });
}

function requestNewQuestionInQuiz(token, quizToken) {
	sendMessage('newQuestionRequest', { token: token, quizToken: quizToken });
}

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

function requestRegistrationTrial(username, password, avatar) {
	sendMessage('tryRegistrationRequest', {
		username: username, password: password, avatar: avatar
	});
}

// Server Response events -------------------------------------------------- //


function registerForAvatarResponse(callback) {
	registerSocketCallback('avatarResponse', 
		function(data) { 
			callback(data['avatar']);
		}
	);
}

function registerForNewQuizResponse(callback) {
	registerSocketCallback('newQuizResponse', 
		function(data) { 
			callback(data['quizToken']);
		}
	);
}

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