var currentToken = null;

function initializeUserManagement() {
	registerForTryLoginResponse(onTryLoginResponse);
    registerForTryRegistrationResponse(onTryRegistrationResponse);
    registerForInvalidTokenResponse(onInvalidTokenResponse);
    registerForAvatarResponse(onAvatarResponse);
    acquireToken();
}

function acquireToken() {
	currentToken = localStorage.getItem('token');
    if (currentToken == null) {
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
    localStorage.removeItem('token');
    currentToken = null;
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
    if (getInputValue('registerPasswordInput') != 
        getInputValue('registerPasswordRepeatInput')) {
        setElementText('registerTextLabel', 
            'Passwords unequal.<br />Please try again:');
        setElementText('registerPasswordInput', '');
        setElementText('registerPasswordRepeatInput', '');
    } else {
        requestRegistrationTrial( 
            getInputValue('registerUsernameInput'),
            getInputValue('registerPasswordInput'),
            getCurrentAvatar()// TODO: something like defaultAvatar()
        );
    }    
}

function saveAvatar() {
    requestAvatarChange(currentToken, getCurrentAvatar());
}

// Server response handling ------------------------------------------------ //

function onTryLoginResponse(token, avatar) {
    console.log('onTryLoginResponse:' + token);
    if(token == null) {
        setElementText('loginTextLabel', 
            'Invalid login.<br />Please try again:');
    } else {
       currentToken = token;
       localStorage.setItem('token', token);
       closePopup('loginPopup');
       loadAvatar(avatar);
       showPage('startPage');
    }
}

function onTryRegistrationResponse(token) {
    console.log('onTryRegistrationResponse:' + token);
    if(token == null) {
        setElementText('registerTextLabel', 
            'Registration failed.<br />Please try again:');
    } else {
       currentToken = token;
       localStorage.setItem('token', token);
       closePopup('loginPopup');
       showPage('startPage'); 
    }
}

function onInvalidTokenResponse(token) {
	showPage('startPage');
	showPopupDelayed('loginPopup', 500);
}

function onAvatarResponse(avatar) {
    loadAvatar(avatar);
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