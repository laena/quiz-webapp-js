function initializeHighscore() { }

function loadHighscores() {
	addHighscoreEntry(2, getCurrentDateAsString(), "Lena");
    addHighscoreEntry(3, getCurrentDateAsString(), "Frank");
    sortHighscores();
}

function addHighscoreEntry(score, date, player) {
	addRowToTable('highscoreTable', [score, date, player]);
}

function sortHighscores() {
    // TODO
}

function getCurrentDateAsString() {
    var today = new Date();
    var dd    = today.getDate();
    var mm    = today.getMonth() + 1; //January is 0!
    var yyyy  = today.getFullYear();

    if(dd < 10) { dd = '0' + dd; }
    if(mm < 10) { mm = '0' + mm; }

    return String(mm + '/' + dd + '/' + yyyy);
}