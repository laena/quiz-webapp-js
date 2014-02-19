function getElementBy(id) {
	return $('#' + id);
}

function setElementText(id, text) {
    getElementBy(id).html(text);
}

function showPage(id) {
	$('body').pagecontainer('change', getElementBy(id), {});
}


// Inputs ------------------------------------------------------------------ //

function getInputValue(id) {
	return getElementBy(id).val() ;
}

function registerOnKeyDown(id, keyCode, callback) {
    var onKeyDown = function(e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if(key == keyCode) { callback(); }
    };

	getElementBy(id).keydown(onKeyDown);
}


// Buttons ----------------------------------------------------------------- //

function enableButton(id) {
	getElementBy(id).attr('disabled', false);
}

function disableButton(id) {
	getElementBy(id).attr('disabled', true);
}

function hideButton(id) {
	getElementBy(id).hide();
}

function showButton(id) {
	getElementBy(id).show();
}

function setButtonIcon(id, icon) {
	getElementBy(id).buttonMarkup({icon: icon});
}

function setButtonTheme(id, theme) {
	getElementBy(id).buttonMarkup({theme: theme});
}


// Popups ------------------------------------------------------------------ //

function initializePopup(id) {
	getElementBy(id).popup();
}

function showPopupDelayed(id, delay) {
	var callback = function() { callback, 
		getElementBy(id).popup('open');
    };
	setTimeout(callback, delay); 
}

function showPopup(id) {
	showPopupDelayed(id, 100);
}

function closePopup(id) {
	getElementBy(id).popup('close');
}


// Tables ------------------------------------------------------------------ //

function addRowToTable(id, columnValues) {
	var content = '';
	for(var i=0; i<columnValues.length; i++) {
		content += '<td>' + columnValues[i] + '</td>';
	}
	getElementBy(id + ' tbody').append('<tr>' + content + '</tr>');
}