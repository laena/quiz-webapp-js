var themes = new Array();
themes['standard'] = '';
themes['terminal'] = '<link rel="stylesheet" href="css/themes/terminal.min.css" type="text/css" class="themeSheet"/>';
themes['pink'] = '<link rel="stylesheet" href="css/themes/pink.min.css" type="text/css" class="themeSheet"/>';
themes['meadow'] = '<link rel="stylesheet" href="css/themes/meadow.min.css" type="text/css" class="themeSheet"/>';

$(document).bind("ready", function() {
	$("#themeSelect").change(function() {
	    updateTheme();
	});
});

function updateTheme() {
	var selected =  $('#themeSelect').val();
	$('.themeSheet').remove();
	$('head').append(themes[selected]);
}