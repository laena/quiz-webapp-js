var questionIndex = -1;
var lastAnswer = -1;
var socketio = io.connect("127.0.0.1:1337");

function client_init() {
	socketio.on("new_question", 
		function(data) {
			$("#lbl_q").html(data['question']);
			for (var i=0; i < data['answers'].length; i++) {
				setButtonText(i, data['answers'][i]);
			}                   
			setButtonsDisabled(false);
			setNextButtonVisible(false);
			clearAnswers();
		}
	);

	socketio.on("result", 
		function(data) {
			setAnswer(lastAnswer, (data["result"] == 1));
			setNextButtonVisible(true);
		}
	);

	getQuestion();
}

function getQuestion() {
	++questionIndex;
	socketio.emit("get_next_question", {currentQuestion : questionIndex});
}

function setButtonText(bID, text) {
	$("#btn_a" + bID).html(text);
}

function setAnswer(bID, b) {
	$("#btn_a" + bID).buttonMarkup({icon: b ? "check" : "delete"});
}

function clearAnswers() {
	for (var i = 0; i < 4; ++i) {
		$("#btn_a" + i).buttonMarkup({icon: ""});
	};          
}

function setNextButtonVisible(b) {
	b ? $("#btn_next").show() : $("#btn_next").hide();
}

function setButtonsDisabled(b) {
	for (var i = 0; i < 4; ++i) {
		$("#btn_a" + i).attr("disabled", b);
	};          
}

function submitAnswer(index) {
	socketio.emit("submit_answer", {answer : index, questionID : questionIndex});
	lastAnswer = index;
	setButtonsDisabled(true);
}

function loginUser(user, password) {
	$("form#form_login").submit();
	//socketio.emit("login_user", {user : user, password : password});
}