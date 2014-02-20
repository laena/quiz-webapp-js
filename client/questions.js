var questionIndex = -1;
var lastAnswer = -1;

function initializeQuestionManagement() {
	registerForNewQuestionResponse(onNewQuestion);
    registerForVerifyAnswerResponse(onVerifyAnswer);
}

function showNewQuestion() {
    ++questionIndex;	
    requestNewQuestion(userToken, questionIndex);
}

function setAnswer(bID, b) {
    setButtonIcon('answerButton' + bID, b ? 'check': 'delete');
    setButtonTheme('answerButton' + bID, b ? 'c': 'b');
}

function clearAnswers() {
    for (var i = 0; i < 4; ++i) {
        setButtonIcon('answerButton' + i, '');
        setButtonTheme('answerButton' + i, 'a');
    };          
}

function setButtonsDisabled(b) {
    for (var i = 0; i < 4; ++i) {
        b ? disableButton('answerButton' + i): enableButton('answerButton' + i);
    };          
}

function submitAnswer(index) {
    requestAnswerVerfication(userToken, questionIndex, index);
    lastAnswer = index;
    setButtonsDisabled(true);
}

// Server response handling ------------------------------------------------ //

function onNewQuestion(question, answers) {
    if (!question || !answers) {
        questionIndex = -1;
        showPage('resultPage');
        return;
    }
    setElementText('questionTextLabel', question);
    for (var i=0; i < answers.length; i++) {
        setElementText('answerButton' + i, answers[i]);
    }                       
    setButtonsDisabled(false);
    hideButton('nextQuestionButton')
    clearAnswers();
}

function onVerifyAnswer(isCorrect) {
    setAnswer(lastAnswer, isCorrect);
    showButton('nextQuestionButton')
}

