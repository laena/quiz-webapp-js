var avatarElements = new Array();
function initializeAvatar() {
	if (localStorage.getItem('avatar') == null) {
		setDefaultAvatar();
	}
	else {
		avatarElements = JSON.parse(localStorage.getItem('avatar'));
		console.log(avatarElements);
	}
}

function setDefaultAvatar() {
	avatarElements[0] = [1, 6, 'body'];
	avatarElements[1] = [1, 6, 'eyes'];
	avatarElements[2] = [1, 6, 'mouth'];
	avatarElements[3] = [1, 5, 'hair'];
	avatarElements[4] = [1, 6, 'accessoire'];
	localStorage.setItem('avatar', JSON.stringify(avatarElements));	
}

window.onload = function() {
	initializeAvatar();
    refreshAvatar();
}

function refreshAvatar() {
	console.log("refreshAvatar");
	for(var i=0; i<avatarElements.length; i++) {
        drawImage(i);
    }
}

function drawImage(index) {
	console.log('.'+avatarElements[index]);
	$('.'+avatarElements[index][2]).attr('src', './avatars/' + avatarElements[index][2] + avatarElements[index][0] + '.png');
}

function previous(index) {
    avatarElements[index][0] = avatarElements[index][0] == 1 ? avatarElements[index][1] : --avatarElements[index][0];
    drawImage(index);
}

function next(index) {
    avatarElements[index][0] = avatarElements[index][0] == avatarElements[index][1] ? 1 : ++avatarElements[index][0];
    drawImage(index);
}

function getCurrentAvatar() {
	localStorage.setItem('avatar', JSON.stringify(avatarElements));
	return {
		body: avatarElements[0][0],
		eyes: avatarElements[1][0],
		mouth: avatarElements[2][0],
		hair: avatarElements[3][0],
		accessoire: avatarElements[4][0],
	}
}

function loadAvatar(avatar) {
	console.log("Loading avatar");
	avatarElements[0][0] = avatar.body;
	avatarElements[1][0] = avatar.eyes;
	avatarElements[2][0] = avatar.mouth;
	avatarElements[3][0] = avatar.hair;
	avatarElements[4][0] = avatar.accessoire;

	localStorage.setItem('avatar', JSON.stringify(avatarElements));
	refreshAvatar();
}