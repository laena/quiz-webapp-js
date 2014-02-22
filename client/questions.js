var questionIndex = -1;
var lastAnswer = -1;

function initializeQuestionManagement() {
	registerForNewQuestionResponse(onNewQuestion);
    registerForNewQuizResponse(onNewQuiz);
    registerForVerifyAnswerResponse(onVerifyAnswer);
    registerForQuizEndedResponse(onQuizEnded);
}

function showNewQuiz() {    
    requestNewQuiz(currentToken);
}

function showNewQuestion() {
    ++questionIndex;	
    requestNewQuestion(currentToken, questionIndex);
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
    requestAnswerVerfication(currentToken, questionIndex, index);
    lastAnswer = index;
    setButtonsDisabled(true);
}

function showResultPage(score) {
    setElementText('congratsLabel', 'Congratulations ' + score.user + '!');
    setElementText('scoreLabel', 
        'You correctly answered ' + score.correctAnswers + 
        ' out of ' + score.questionsAnswered + ' questions.');
    showPage('resultPage');
}

// Server response handling ------------------------------------------------ //

function onNewQuestion(id, question, answers) {
    questionIndex = id;
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

function onQuizEnded(score) {
    showResultPage(score);   
}

function onNewQuiz(quizToken) {
    requestNewQuestionInQuiz(currentToken, quizToken);
}