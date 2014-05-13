var themes = new Array();
themes['standard'] 	= '';
themes['terminal'] 	= '<link rel="stylesheet" href="css/themes/terminal.min.css" type="text/css" class="themeSheet"/>';
themes['pink'] 		= '<link rel="stylesheet" href="css/themes/pink.min.css" type="text/css" class="themeSheet"/>';
themes['meadow'] 	= '<link rel="stylesheet" href="css/themes/meadow.min.css" type="text/css" class="themeSheet"/>';

$(document).bind("ready", function() {
	getElementBy("themeSelect").change(function() {
	    updateTheme();
	});
});

function updateTheme() {
	loadTheme(getCurrentTheme());
}

function loadTheme(theme) {
	$('.themeSheet').remove();
	$('head').append(themes[theme]);
}

function getCurrentTheme() {
	return getElementBy('themeSelect').val();
}