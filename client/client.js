var questionIndex = -1;
var lastAnswer = -1;
var socketio = io.connect("127.0.0.1:1337");

var userToken = null;

function client_init() {
	$( "#pop_login" ).popup();	

	socketio.on("new_question", 
		function(data) {
			$("#lbl_q").html(data['question']);
			for (var i=0; i < data['answers'].length; i++) {
				setText("#btn_a" + i, data['answers'][i]);
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

	socketio.on("login_result", 
		function(data) {
			if (data["result"] == "unknown user") {
				setTimeout(showInvalidLogin, 200);
			} else if (data["result"]) {
				userToken = data["userToken"];
				$("body").pagecontainer("change", "#p_start", {});
			} else {
				setTimeout(showInvalidLogin, 200);
			}
		}
	);	

	setTimeout(showLogin, 500);

	userToken = localStorage.getItem("userToken");
	if (userToken == null)
		$("body").pagecontainer("change", "#p_login", {});
	else
		getQuestion();
}

function getQuestion() {
	++questionIndex;
	socketio.emit("get_next_question", {currentQuestion : questionIndex, userToken : userToken});
}

function setText(id, text) {
	$( id ).html(text);
}

function setAnswer(bID, b) {
	$("#btn_a" + bID).buttonMarkup({icon: b ? "check" : "delete"});
	$("#btn_a" + bID).buttonMarkup({theme: b ? "c" : "b"});
}

function clearAnswers() {
	for (var i = 0; i < 4; ++i) {
		$("#btn_a" + i).buttonMarkup({icon: ""});
		$("#btn_a" + i).buttonMarkup({theme: "a"});
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
	socketio.emit("submit_answer", {answer : index, questionID : questionIndex, userToken : userToken});
	lastAnswer = index;
	setButtonsDisabled(true);
}

function loginUser() {
	socketio.emit("login_user", {user : $("#inp_user").val(), password : $("#inp_passwd").val()});
	$( "#pop_login" ).popup("close");
	console.log("logging in: " + $("#inp_user").val() + " / " + $("#inp_passwd").val());
}

function logoutUser() {
	localStorage.setItem("session", null);
	userToken = null;
	console.log("logging out");
}

function showLogin() {
	setText("#lbl_login", "Please login:");
	$( "#pop_login" ).popup("open");
}

function showInvalidLogin() {
	console.log("here");
	setText("#lbl_login", "Invalid Login<br />Please try again:");
	$( "#pop_login" ).popup("open");
}

function setSession(token) {
	console.log("setting session token: " + token);
	localStorage.setItem("session", token);
	$("body").pagecontainer("change", "#p_quiz", {});
}