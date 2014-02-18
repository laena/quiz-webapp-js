var questionIndex = -1;
var lastAnswer = -1;
var socketio = io.connect("127.0.0.1:1337");

var userToken = null;

function client_init() {
	$("#pop_login").popup();
	$("#pop_register").popup();	

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
				setText("#lbl_login", "Invalid user name<br />Please try again:");
			} else if (data["result"]) {
				userToken = data["userToken"];
				localStorage.setItem("userToken", userToken);
				$("#pop_login").popup("close");
				$("body").pagecontainer("change", "#p_start", {});
				getQuestion();
			} else {
				setText("#lbl_login", "Invalid password<br />Please try again:");
			}
		}
	);

	socketio.on("register_result", 
		function(data) {
			if (data["result"] == true) {
				setText("#lbl_login", "Registration successful.<br/>Please sign in:");
				backToLogin();
			} else {
				setText("#lbl_register", "Registration failed.<br/>Please try again:");
			}
		}
	);	

	$('#inp_user').keydown( function(e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if(key == 13) {
        	loginUser();
        }
    });

    $('#inp_passwd').keydown( function(e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if(key == 13) {
        	loginUser();
        }
    });

	userToken = localStorage.getItem("userToken");
	if (userToken == null) {
		$("body").pagecontainer("change", "#p_login", {});
		setTimeout(showLogin, 500);
	} else  {
		console.log("user token:" + userToken);
		getQuestion();
	}
}

function getQuestion() {
	++questionIndex;
	socketio.emit("get_next_question", {currentQuestion : questionIndex, userToken : userToken});
}

function setText(id, text) {
	$(id).html(text);
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
}

function logoutUser() {
	localStorage.removeItem("userToken");
	userToken = null;
	console.log("logging out");
	setTimeout(showLogin, 500);
}

function showLogin() {
	$("#pop_login").popup("open");
}

function showRegister() {
	$("#pop_login").popup("close");
	setTimeout(function() {
		$("#pop_register").popup("open");
	}, 100);
}

function backToLogin() {
	$("#pop_register").popup("close");
	setTimeout(function() {
		$("#pop_login").popup("open");
	}, 100);	
}

function registerUser() {
	if ($("#inp_passwd_reg").val() != $("#inp_passwd_reg_rptd").val()) {
		setText("#lbl_register", "Passwords unequal.<br />Please try again:");
		setText("#inp_passwd_reg", "");
		setText("#inp_passwd_reg_rptd", "");
	} else {
		socketio.emit("register_user", {user : $("#inp_user_reg").val(), password : $("#inp_passwd_reg").val()});
	}	
}