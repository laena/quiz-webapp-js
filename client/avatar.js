var avatarElements = new Array();
avatarElements[0] = [1, 6, 'body'];
avatarElements[1] = [1, 6, 'eyes'];
avatarElements[2] = [1, 6, 'mouth'];
avatarElements[3] = [1, 5, 'hair'];
avatarElements[4] = [1, 6, 'accessoire'];

window.onload = function() {
    for(var i=0; i<avatarElements.length; i++) {
        drawImage(i);
    }
}

function drawImage(index) {
	$('#'+avatarElements[index][2]).attr('src', './avatars/' + avatarElements[index][2] + avatarElements[index][0] + '.png');
}

function previous(index) {
    avatarElements[index][0] = avatarElements[index][0] == 1 ? avatarElements[index][1] : --avatarElements[index][0];
    drawImage(index);
}

function next(index) {
    avatarElements[index][0] = avatarElements[index][0] == avatarElements[index][1] ? 1 : ++avatarElements[index][0];
    drawImage(index);
}