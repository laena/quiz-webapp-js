define(["jquery", "jquerymobile", "socket.io"], function(jquery, jquerymobile, io) {
    return {
        run: function() {
            console.log("hello");
            $(document).ready(getQuestion);

            var socketio = io.connect("127.0.0.1:1337");

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
                    if(data["result"] == 1) {
                        setAnswer(lastAnswer, true);
                    } else {
                        setAnswer(lastAnswer, false);
                    }                   

                    setNextButtonVisible(true);
                }
                );

            var questionIndex = -1;            
            function getQuestion() {
                ++questionIndex;
                socketio.emit("get_next_question", {currentQuestion : questionIndex});
            }

            function setButtonText(bID, text) {
                $("#btn_a" + bID).prev(".ui-btn-inner").children(".ui-btn-text").html(text);
            }

            function setAnswer(bID, b) {
                $("#btn_a" + bID).attr("data-icon", b ? "check" : "delete");
                $("#btn_a" + bID).buttonMarkup("refresh");
            }

            function clearAnswers() {
                for (var i = 0; i < 4; ++i) {
                    $("#btn_a" + i).removeAttr("data-icon");
                    $("#btn_a" + i).buttonMarkup("refresh");
                };          
            }

            function setNextButtonVisible(b) {
                if(b) {
                    $("#btn_next").parent().show(); 
                } else {
                    $("#btn_next").parent().hide();
                }
            }

            function setButtonsDisabled(b) {
                for (var i = 0; i < 4; ++i) {
                    $("#btn_a" + i).attr("disabled", b);
                };          
            }

            var lastAnswer = -1
            function submitAnswer(index) {
                socketio.emit("submit_answer", {answer : index, questionID : questionIndex});

                lastAnswer = index;

                setButtonsDisabled(true);
            }
        }
    };

});
