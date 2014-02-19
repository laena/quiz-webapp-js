var userToken = null;

function initializeUserManagement() {
	registerForTryLoginResponse(onTryLoginResponse);
    registerForTryRegistrationResponse(onTryRegistrationResponse);
    registerForInvalidTokenResponse(onInvaildUserToken);

    acquireUserToken();
}

function acquireUserToken() {
	userToken = localStorage.getItem('userToken');
    if (userToken == null) {
        showPopupDelayed('loginPopup', 500);
    }
}

function tryToLoginUser() {
    requestLoginTrial(
        getInputValue('loginUsernameInput'), 
        getInputValue('loginPasswordInput')
    );
}

function logoutUser() {
    localStorage.removeItem('userToken');
    userToken = null;
    console.log('logging out');
    showPopupDelayed('loginPopup', 500);
}

function showRegistrationPopup() {
    closePopup('loginPopup');
    showPopup('registerPopup');
}

function returnToLogin() {
    closePopup('registerPopup');
    showPopup('loginPopup');
}

function tryToRegisterUser() {
    if (getInputValue('registerPasswordInput') != getInputValue('registerPasswordRepeatInput')) {
        setElementText('registerTextLabel', 'Passwords unequal.<br />Please try again:');
        setElementText('registerPasswordInput', '');
        setElementText('registerPasswordRepeatInput', '');
    } else {
        requestRegistrationTrial( 
            getInputValue('registerUsernameInput'),
            getInputValue('registerPasswordInput')
        );
    }    
}


// Server response handling ------------------------------------------------ //

function onTryLoginResponse(result, userToken) {
    if (result == 'unknown user') {
        setElementText('loginTextLabel', 
        	'Invalid username.<br />Please try again:');
    } else if (result) {
        userToken = userToken;
        localStorage.setItem('userToken', userToken);
        closePopup('loginPopup');
        showPage('startPage');
    } else {
        setElementText('loginTextLabel', 
        	'Invalid password.<br />Please try again:');
    }
}

function onTryRegistrationResponse(successful) {
    if (successful) {
        setElementText('loginTextLabel', 
        	'Registration successful.<br/>Please sign in:');
        returnToLogin();
    } else {
        setElementText('registerTextLabel', 
        	'Registration failed.<br/>Please try again:');
    }
}

function onInvaildUserToken(userToken) {
	showPage('startPage');
	showPopupDelayed('loginPopup', 500);
}


// purely GUI related ------------------------------------------------------ //

function initializeGUI() {
    initializePopup('loginPopup');
    initializePopup('registerPopup');

    initializeInputCallbacks();
}

function initializeInputCallbacks() {
    registerOnKeyDown('loginUsernameInput', 13, tryToLoginUser);
    registerOnKeyDown('loginPasswordInput', 13, tryToLoginUser);

    registerOnKeyDown('registerUsernameInput', 13, tryToRegisterUser);
    registerOnKeyDown('registerPasswordInput', 13, tryToRegisterUser);
    registerOnKeyDown('registerPasswordRepeatInput', 13, tryToRegisterUser);
}