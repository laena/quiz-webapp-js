define(["socketio"], function(io) {
	
	return {
		questionIndex: -1,           
		lastAnswer: -1,
		socketio: io.connect("127.0.0.1:1337"),

		init: function() {
			this.getQuestion();
			console.log(this.socketio);
		},

		run: function() {
			var me = this;
			this.socketio.on("new_question", 
				function(data) {
					$("#lbl_q").html(data['question']);
					for (var i=0; i < data['answers'].length; i++) {
						me.setButtonText(i, data['answers'][i]);
					}                   
					me.setButtonsDisabled(false);
					me.setNextButtonVisible(false);
					me.clearAnswers();
				}
				);

			this.socketio.on("result", 
				function(data) {
					me.setAnswer(me.lastAnswer, (data["result"] == 1));
					me.setNextButtonVisible(true);
				}
				);	
		},

		getQuestion: function() {
			++this.questionIndex;
			this.socketio.emit("get_next_question", {currentQuestion : this.questionIndex});
		},

		setButtonText: function(bID, text) {
			$("#btn_a" + bID).prev(".ui-btn-inner").children(".ui-btn-text").html(text);
		},

		setAnswer: function(bID, b) {
			$("#btn_a" + bID).attr("data-icon", b ? "check" : "delete");
			$("#btn_a" + bID).buttonMarkup("refresh");
		},

		clearAnswers: function() {
			for (var i = 0; i < 4; ++i) {
				$("#btn_a" + i).removeAttr("data-icon");
				$("#btn_a" + i).buttonMarkup("refresh");
			};          
		},

		setNextButtonVisible: function(b) {
			b ? $("#btn_next").parent().show() : $("#btn_next").parent().hide();
		},

		setButtonsDisabled: function(b) {
			for (var i = 0; i < 4; ++i) {
				$("#btn_a" + i).attr("disabled", b);
			};          
		},

		submitAnswer: function(index) {
			this.socketio.emit("submit_answer", {answer : index, questionID : this.questionIndex});
			this.lastAnswer = index;
			this.setButtonsDisabled(true);
		}
	};

});
