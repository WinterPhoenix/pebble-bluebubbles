function submitSettings() {
	var formElem = document.getElementById("form");
	var urlElem = document.getElementById("url");
	var passwordElem = document.getElementById("password");
	var callingCodeElem = document.getElementById("callingCode");

	urlElem.className = urlElem.validity.valid ? "" : "invalid";
	passwordElem.className = passwordElem.validity.valid ? "" : "invalid";
	callingCodeElem.className = callingCodeElem.validity.valid ? "" : "invalid";

	if (!formElem.checkValidity()) {
		return false;
	}

	var settings = [];
	settings.url = urlElem.value;
	settings.password = passwordElem.value;
	settings.callingCode = callingCodeElem.value;

	window.location.href = "pebblejs://close#" + encodeURIComponent(JSON.stringify(settings));
}

// Pebble app gives us what the existing values are, so let's use them
function initFields() {
	var settings = window.location.hash.substring(1);
	settings = decodeURIComponent(settings);
	settings = JSON.parse(settings);

	if (settings.url != null) {
		document.getElementById("url").value = settings.url;
	}

	// Password is secret, we shouldn't display it

	document.getElementById("callingCode").value = settings.callingCode != null ? settings.callingCode : "+1";
}
initFields();
