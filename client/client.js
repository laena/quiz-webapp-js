var questionIndex = -1;
var lastAnswer = -1;
var socketio = io.connect("127.0.0.1:1337");

var userToken = null;

function getCurrentDate() {
	var today 	= new Date();
	var dd 		= today.getDate();
	var mm 		= today.getMonth()+1; //January is 0!
	var yyyy 	= today.getFullYear();

	if(dd<10) dd = '0'+dd; 
	if(mm<10) mm = '0'+mm;

	return String(mm+'/'+dd+'/'+yyyy);
}

function initializeClient() {
	$("#loginPopup").popup();
	$("#registerPopup").popup();	

	socketio.on("new_question", 
		function(data) {
			$("#questionTextLabel").html(data['question']);
			for (var i=0; i < data['answers'].length; i++) {
				setText("#answerButton" + i, data['answers'][i]);
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
				setText("#loginTextLabel", "Invalid username.<br />Please try again:");
			} else if (data["result"]) {
				userToken = data["userToken"];
				localStorage.setItem("userToken", userToken);
				$("#loginPopup").popup("close");
				$("body").pagecontainer("change", "#startPage", {});
				requestNewQuestion();
			} else {
				setText("#loginTextLabel", "Invalid password.<br />Please try again:");
			}
		}
	);

	socketio.on("register_result", 
		function(data) {
			if (data["result"] == true) {
				setText("#loginTextLabel", "Registration successful.<br/>Please sign in:");
				returnToLogin();
			} else {
				setText("#registerTextLabel", "Registration failed.<br/>Please try again:");
			}
		}
	);	

	$('#loginUsernameInput').keydown( function(e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if(key == 13) {
        	tryToLoginUser();
        }
    });

    $('#loginPasswordInput').keydown( function(e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if(key == 13) {
        	tryToLoginUser();
        }
    });

	userToken = localStorage.getItem("userToken");
	if (userToken == null) {
		$("body").pagecontainer("change", "#loginPopup", {});
		setTimeout(showLoginPopup, 500);
	} else  {
		console.log("user token:" + userToken);
		requestNewQuestion();
	}

	addHighscoreEntry(2, getCurrentDate(), "Lena");
	addHighscoreEntry(3, getCurrentDate(), "Frank");
	sortHighscores();
}

function requestNewQuestion() {
	++questionIndex;
	socketio.emit("get_next_question", {currentQuestion : questionIndex, userToken : userToken});
}

function setText(id, text) {
	$(id).html(text);
}

function setAnswer(bID, b) {
	$("#answerButton" + bID).buttonMarkup({icon: b ? "check" : "delete"});
	$("#answerButton" + bID).buttonMarkup({theme: b ? "c" : "b"});
}

function clearAnswers() {
	for (var i = 0; i < 4; ++i) {
		$("#answerButton" + i).buttonMarkup({icon: ""});
		$("#answerButton" + i).buttonMarkup({theme: "a"});
	};          
}

function setNextButtonVisible(b) {
	b ? $("#nextQuestionButton").show() : $("#nextQuestionButton").hide();
}

function setButtonsDisabled(b) {
	for (var i = 0; i < 4; ++i) {
		$("#answerButton" + i).attr("disabled", b);
	};          
}

function submitAnswer(index) {
	socketio.emit("submit_answer", {answer : index, questionID : questionIndex, userToken : userToken});
	lastAnswer = index;
	setButtonsDisabled(true);
}

function tryToLoginUser() {
	socketio.emit("login_user", {user : $("#loginUsernameInput").val(), password : $("#loginPasswordInput").val()});	
}

function logoutUser() {
	localStorage.removeItem("userToken");
	userToken = null;
	console.log("logging out");
	setTimeout(showLoginPopup, 500);
}

function showLoginPopup() {
	$("#loginPopup").popup("open");
}

function showRegistrationPopup() {
	$("#loginPopup").popup("close");
	setTimeout(function() {
		$("#registerPopup").popup("open");
	}, 100);
}

function returnToLogin() {
	$("#registerPopup").popup("close");
	setTimeout(function() {
		$("#loginPopup").popup("open");
	}, 100);	
}

function tryToRegisterUser() {
	if ($("#registerPasswordInput").val() != $("#registerPasswordRepeatInput").val()) {
		setText("#registerTextLabel", "Passwords unequal.<br />Please try again:");
		setText("#registerPasswordInput", "");
		setText("#registerPasswordRepeatInput", "");
	} else {
		socketio.emit("register_user", {user : $("#registerUsernameInput").val(), password : $("#registerPasswordInput").val()});
	}	
}

function addHighscoreEntry(score, date, player) {
	$("#highscoreTable tbody").append($("<tr>\n")
 		.append("<td>" + score + "</td>\n")
 		.append("<td>" + date + "</td>\n")
 		.append("<td>" + player + "</td>\n")
 		.append("</tr>"));
	$($("#highscoreTable")).table( "refresh" );
}

function sortHighscores() {
	// TODO
}