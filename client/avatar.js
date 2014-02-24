AvatarElement = {
    BODY: 'Body',
    EYES: 'Eyes',
    HAIR: 'Hair',
    ACCESSOIRE: 'Accessoire',
    MOUTH: 'Mouth'
}

var NUM_BODIES = 6;
var NUM_ACCESSOIRES = 6;
var NUM_EYES = 6;
var NUM_MOUTHS = 6;
var NUM_HAIRS = 5;

var currentBody = 1;
var currentAccessoire = 1;
var currentEyes = 1;
var currentMouths = 1;
var currentHair = 1;

window.onload = function() {
	drawAvatar();
}

function drawImage(elementType, index) {
	$('#'+elementType).attr('src', './avatars/' + elementType + index + '.png');
}

function getCurrentAvatar() {
	return new avatar(currentBody, currentAccessoire, currentEyes, currentMouths, currentHair);
}

// Button handling ------------------------------------------------ //

function previousBody() {
	currentBody = currentBody == 1 ? NUM_BODIES : --currentBody;
	drawImage(AvatarElement.BODY, currentBody);
}

function nextBody() {
	currentBody = currentBody == NUM_BODIES ? 1 : ++currentBody;
	drawImage(AvatarElement.BODY, currentBody);
}

function previousAccessoire() {
	currentAccessoire = currentAccessoire == 1 ? NUM_ACCESSOIRES : --currentAccessoire;
	drawImage(AvatarElement.ACCESSOIRE, currentAccessoire);
}

function nextAccessoire() {
	currentAccessoire = currentAccessoire == NUM_ACCESSOIRES ? 1 : ++currentAccessoire;
	drawImage(AvatarElement.ACCESSOIRE, currentAccessoire);
}

function previousHair() {
	currentAccessoire = currentAccessoire == 1 ? NUM_ACCESSOIRES : --currentAccessoire;
	drawImage(AvatarElement.HAIR, currentAccessoire);
}

function nextHair() {
	currentAccessoire = currentAccessoire == NUM_ACCESSOIRES ? 1 : ++currentAccessoire;
	drawImage(AvatarElement.HAIR, currentAccessoire);
}

function previousEyes() {
	currentEyes = currentEyes == 1 ? NUM_EYES : --currentEyes;
	drawImage(AvatarElement.EYES, currentEyes);
}

function nextEyes() {
	currentEyes = currentEyes == NUM_EYES ? 1 : ++currentEyes;
	drawImage(AvatarElement.EYES, currentEyes);
}

function drawAvatar() {
	drawImage(AvatarElement.BODY, currentBody);
	drawImage(AvatarElement.ACCESSOIRE, currentAccessoire);
	drawImage(AvatarElement.MOUTH, currentMouths);
	drawImage(AvatarElement.EYES, currentEyes);
	drawImage(AvatarElement.HAIR, currentHair);
}

function avatar(body, accessoire, eyes, mouth, hair) {
	this.body = body;
	this.accessoire = accessoire;
	this.eyes = eyes;
	this.mouth = mouth;
	this.hair = hair;
}