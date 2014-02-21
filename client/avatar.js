var currentHead = 1;
var currentFace = 3;
var currentHat = 1;

var NUM_HEADS = 3;
var NUM_FACES = 3;
var NUM_HATS = 3;

AvatarElement = {
    HEAD: 'head',
    FACE: 'face',
    HAT: 'hat'
}

var canvas = 'avatarCanvas';
var c = null;

window.onload = function() {
	c = document.getElementById(canvas);
	var dims = getDimensions();
  	c.width = dims.width - 4;
    c.height= dims.height - 4;

  	drawImage(AvatarElement.HEAD, currentHead);
	drawImage(AvatarElement.FACE, currentFace);
}

function drawImage(elementType, index) {
	var context = c.getContext('2d');
	if (context) {
		var img = new Image();
		img.src = "./images/" + elementType + "/" + index + ".png";
		img.onload = function(err) {
			context.drawImage(img, 0, 0);
		};
	}
}

function displayNextHead() {
	drawImage(AvatarElement.HEAD, currentHead == NUM_HATS ? 1 : ++currentHead);
	drawImage(AvatarElement.FACE, currentFace);
}

function displayPreviousHead() {
	drawImage(AvatarElement.HEAD, currentHead == 1 ? NUM_HATS : --currentHead);
	drawImage(AvatarElement.FACE, currentFace);	
}

function displayNextFace() {
	drawImage(AvatarElement.FACE, currentFace == NUM_FACES ? 1 : ++currentFace);
}

function displayPreviousFace() {
	drawImage(AvatarElement.FACE, currentFace == 1 ? NUM_FACES : --currentFace);
}

function getDimensions() {
	var 
		width = $(window).width(),
		height = $(window).height(),
		hHeight = $('header').outerHeight() || 0,
		fHeight = $('footer').outerHeight() || 0;
	return {
      width: width,
      height: height - hHeight - fHeight
    };
}