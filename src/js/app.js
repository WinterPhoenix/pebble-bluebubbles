var version = "1.3";

// Demo Mode, pretty much just used for taking screenshots in emulator
var demoMode = false;

var ajax = require("ajax");
var Feature = require("platform/feature");
var Platform = require("platform");
var Settings = require("settings");
var UI = require("ui");
var Vector2 = require("vector2");
var Voice = require("ui/voice");

Settings.config({url: "https://winterphoenix.github.io/pebble-bluebubbles/"},
	function() {
		console.log("Settings opened");
	},
	function(data) {
		console.log("Settings closed");

		if (!data.failed) {
			if (Settings.option("password") != "" && Settings.option("password") != null) {
				console.log("New password. Updating secret store...")
				Settings.data("password", Settings.option("password"))
			} else if (Settings.data("password") != null) {
				console.log("Password empty. Restoring value from secret store...")
				Settings.option("password", Settings.data("password"))
			}

			console.log("Settings updated: " + JSON.stringify(data.options));

			// TODO: If it's already loaded, tell the user to restart
			initApp();
		} else if (data.originalEvent.type != "webviewclosed") {
			console.error("Settings update failed: " + JSON.stringify(data));

			errorCard.subtitle("Error: Settings update failed");
			errorCard.body(data.response);
			errorCard.show();
		}
	}
);

// https://stackoverflow.com/a/8809472
function generateUUID() {
	var d = new Date().getTime();
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16;
		if (d > 0){
			r = (d + r)%16 | 0;
			d = Math.floor(d/16);
		} else {
			r = (d2 + r)%16 | 0;
			d2 = Math.floor(d2/16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

var addressToContactMap = {};
function getDisplayNameFromParticipants(participants) {
	var displayName = ""

	if (participants.length > 1) {
		for (var participantNum = 0; participantNum < participants.length; participantNum++) {
			var participantAddress = participants[participantNum].address;
			var participantName = participantAddress in addressToContactMap ? addressToContactMap[participantAddress].firstName : participantAddress;

			displayName += displayName == "" ? participantName : ", " + participantName;
		}
	} else {
		var participantAddress = participants[0].address;
		displayName = participantAddress in addressToContactMap ? addressToContactMap[participantAddress].displayName : participantAddress;
	}

	return displayName;
}

var monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dayOfWeekMap = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function getTimestampText(stampEpochTime) {
	var curTime = new Date();

	var todayMidnight = new Date();
	todayMidnight.setHours(0, 0, 0, 0);

	//var yesterdayMidnight = new Date();
	//yesterdayMidnight.setDate(curTime.getDate() - 1);
	//yesterdayMidnight.setHours(0, 0, 0, 0);

	var oneWeekAgo = new Date();
	oneWeekAgo.setDate(curTime.getDate() - 7);

	var beginningOfYear = new Date();
	beginningOfYear.setMonth(0, 1);
	beginningOfYear.setHours(0, 0, 0, 0);

	var stampDateTime = new Date(stampEpochTime);

	var dateNiceName;
	if (stampDateTime >= todayMidnight) {
		dateNiceName = "Today";
	} else if (stampDateTime >= oneWeekAgo) {
		dateNiceName = dayOfWeekMap[stampDateTime.getDay()];
	} else if (stampDateTime >= beginningOfYear) {
		dateNiceName = monthMap[stampDateTime.getMonth()] + " " + stampDateTime.getDate() + " at";
	} else {
		dateNiceName = monthMap[stampDateTime.getMonth()] + " " + stampDateTime.getDate() + ", " + stampDateTime.getFullYear() + " at";
	}

	var dateTimeHours = stampDateTime.getHours();
	var ampm = dateTimeHours >= 12 ? "PM" : "AM";
	dateTimeHours = dateTimeHours > 12 ? dateTimeHours - 12 : dateTimeHours;

	return dateNiceName + " " + (dateTimeHours == 0 ? 12 : dateTimeHours) + ":" + stampDateTime.getMinutes() + ampm;
}

// Polyfill
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var serverURL = null;
var serverPassword = null;
var intlCallingCode = null;
function validateSettings() {
	serverURL = Settings.option("url");
	serverPassword = Settings.option("password");
	intlCallingCode = Settings.option("callingCode");

	if (serverURL != null) {
		serverURL = serverURL.trim();
		serverURL = serverURL.endsWith("/") ? serverURL.substring(0, serverURL.length - 1) : serverURL;
	}
	if (serverPassword != null) {
		serverPassword = serverPassword.trim();
	}
	if (intlCallingCode != null) {
		intlCallingCode = intlCallingCode.trim();
	}

	// Make them null if they're empty
	serverURL = serverURL == "" ? null : serverURL;
	serverPassword = serverPassword == "" ? null : serverPassword;
	intlCallingCode = intlCallingCode == "" ? null : intlCallingCode;

	return serverURL != null && serverPassword != null && intlCallingCode != null;
}

// Populated when we initially "connect"
var serverInfo = {};

// TODO: Pull Request for Stage obj
UI.Window.prototype.clear = function() {
	var self = this;
	this.each(function(element) {
		self.remove(element);
		//delete element;
	});
}

var aboutCard = new UI.Card({
	title: "BlueBubbles",
	body: "Loading about card...",
	style: "small",
	scrollable: true
});

var connectCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Connecting..."
});

var fetchMessagesCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Fetching Messages..."
});

var fetchChatsCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Fetching Chats..."
});

var fetchContactsCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Fetching Contacts..."
});

var sendMsgCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "NAME ERROR",
	body: "MSG ERROR",
	style: "small",
	scrollable: true
});

var msgSentCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Message sent!",
	style: "small"
});

var errorCard = new UI.Card({
	title: "BlueBubbles",
	subtitle: "Error",
	body: "Something went wrong",
	style: "small",
	backgroundColor: "yellow",
	scrollable: true
});

function startTypingIndicator(chatGUID) {
	ajax(
		{
			url: serverURL + "/api/v1/chat/" + chatGUID + "/typing?password=" + serverPassword,
			method: "POST"
		}
	);
}

function stopTypingIndicator(chatGUID) {
	ajax(
		{
			url: serverURL + "/api/v1/chat/" + chatGUID + "/typing?password=" + serverPassword,
			method: "DELETE"
		}
	);
}

var mainMenuIsStale = false;
function sendMsg(chatGUID, chatName, msg) {
	console.log("Sending message to " + chatGUID + " (" + chatName + "): " + msg);

	sendMsgCard.subtitle("Sending to " + chatName + "...");
	sendMsgCard.body(msg);
	sendMsgCard.show();

	stopTypingIndicator(chatGUID);

	ajax(
		{
			url: serverURL + "/api/v1/message/text?password=" + serverPassword,
			method: "POST",
			type: "json",
			data: {
				chatGuid: chatGUID,
				tempGuid: generateUUID(), // Random UUID to ensure we don't send duplicates
				method: serverInfo["private_api"] == true ? "private-api" : "apple-script", // Use the better method if available
				message: msg,
			}
		},
		function(data) {
			if (data.status == 200) {
				console.log("Message sent");

				// Reload the conversation, mark the main menu as stale
				mainMenuIsStale = true;
				destroyChatWindow();
				msgSentCard.show();
				setTimeout(function() {
					showChatThread(chatGUID, chatName, 0);
					msgSentCard.hide();
				}, 1000);
			} else {
				console.error("Couldn't send message: " + JSON.stringify(data));

				errorCard.subtitle("Error: Couldn't send message");
				errorCard.body(data.error.type + ": " + data.error.message);
				errorCard.show();
			}

			sendMsgCard.hide();
		},
		function(data) {
			console.error("Couldn't send message: " + JSON.stringify(data));

			errorCard.subtitle("Error: Couldn't send message");
			errorCard.body(data.error.type + ": " + data.error.message);
			errorCard.show();

			sendMsgCard.hide();
		}
	);
}

function doReply(chatGUID, chatName) {
	// TODO: Aplite keyboard

	startTypingIndicator(chatGUID);

	Voice.dictate("start", true, function(data) {
		if (!data.failed) {
			sendMsg(chatGUID, chatName, data.transcription);
		} else {
			stopTypingIndicator(chatGUID);
			Voice.dictate("stop");

			// If they just cancelled it, don't show an error
			if (data.err != "systemAborted") {
				console.error("Voice dictation failed: " + JSON.stringify(data));

				errorCard.subtitle("Error: Voice dictation failed");
				errorCard.body(data.err);
				errorCard.show();
			}
		}
	});
}

var loadedMessagesCount = 0;
var allMessagesLoaded = false;
function loadChatThread(chatGUID, offset, callback) {
	if (demoMode) {
		callback([
			{displayName: "Alice Finnegan", text: "When do you want to get drinks?", dateCreated: new Date().getTime() - 3691000},
			{isFromMe: true, text: "Great, thanks!", dateCreated: new Date().getTime() - 7201000},
		]);
		return;
	}

	if (offset == 0) {
		fetchMessagesCard.show();
	}

	ajax(
		{
			url: serverURL + "/api/v1/chat/" + chatGUID + "/message?password=" + serverPassword + "&with=sms,handle&sort=DESC&limit=15&offset=" + offset,
			method: "GET",
			type: "json",
			cache: false
		},
		function(data) {
			if (data.status == 200) {
				var messages = data.data;

				// TODO: Is there a maximum number of items that can be displayed?
				loadedMessagesCount += data.metadata.count;
				allMessagesLoaded = loadedMessagesCount >= data.metadata.total;

				console.log("Loaded " + data.metadata.count + " messages for " + chatGUID);

				callback(messages);
			} else {
				console.error("Couldn't load messages: " + JSON.stringify(data));

				errorCard.subtitle("Error: Couldn't load messages");
				errorCard.body(data.error.type + ": " + data.error.message);
				errorCard.show();
			}

			fetchMessagesCard.hide();
		},
		function(data) {
			console.error("Couldn't load messages: " + JSON.stringify(data));

			errorCard.subtitle("Error: Couldn't load messages");
			errorCard.body(data.error.type + ": " + data.error.message);
			errorCard.show();

			fetchMessagesCard.hide();
		}
	);
}

var chatWindow;
var chatWindowConfig = {
	status: {
		color: "black",
		backgroundColor: "white"
	},
	backgroundColor: "white",
	scrollable: true,
	action: {
		// TODO: This should be an Action Menu instead (ex. the circle on notifications, more real estate)
		up: "images/action_icon_up.png",
		select: "images/action_icon_reply.png",
		down: "images/action_icon_down.png"
	}
};

var renderedMessagesCount = 0;
function destroyChatWindow() {
	chatWindow.hide();
	chatWindow.clear();
	loadedMessagesCount = 0;
	allMessagesLoaded = false;
	renderedMessagesCount = 0;
}

function showChatThread(chatGUID, chatName, offset) {
	loadChatThread(chatGUID, offset, function(messages) {
		// TODO: There doesn't seem to be a way to destroy elements (at least implemented on the JS side)?
		//if (!chatWindow) {
		chatWindow = new UI.Window(chatWindowConfig);
		chatWindow.on("click", "back", destroyChatWindow);
		chatWindow.on("click", "select", function() {
			doReply(chatGUID, chatName);
		});

		// TODO: Ideally we'd display things in chronological order (like in iMessage), but there doesn't seem to be a way to force the window to scroll (in this case to the bottom) from Pebble.js
		// TODO: Is there a way to figure out if the window is at the bottom of the scroll well? We could load messages when they're needed that way (and is why offset isn't used)...
		var chatWindowSize = chatWindow.size();
		var msgHeight = chatWindowSize.y * 0.75;

		// Run in reverse since we need to have the most recent messages at the top
		for (var i = 0; i < messages.length; i++) {
			var msg = messages[i];
			var displayName = msg.isFromMe ? "You" : demoMode ? msg.displayName : "";
			var text = msg.text != null ? msg.text : "";

			if (text == "") {
				if (msg.isAudioMessage) {
					text = "<Audio Message>"
				} else if (msg.attachments[0]) {
					text = "<" + msg.attachments.length + " Attachment(s)>"
				}
			}

			if (text != "") {
				if (displayName == "") {
					displayName = getDisplayNameFromParticipants([msg.handle]);
				}

				// BUG: If strings are too long, it crashes the app
				// 128 is arbitrary, just because it's not realistic we'll show more than it right now
				displayName = displayName.substring(0, 128);
				text = text.substring(0, 128);

				// There's a gap here to create the appearance of a separator
				var msgBackground = new UI.Rect({
					position: new Vector2(0, renderedMessagesCount * msgHeight + (renderedMessagesCount > 0 ? 2 : 0)),
					size: new Vector2(chatWindowSize.x, msgHeight - (renderedMessagesCount > 0 ? 4 : 2)),
					backgroundColor: msg.isFromMe ? Feature.color(chatGUID.lastIndexOf("iMessage") > -1 ? "#1982FC" : "#43CC47", "#000000") : "white"
				});
				chatWindow.add(msgBackground);

				var displayNameText = new UI.Text({
					position: new Vector2(2, renderedMessagesCount * msgHeight),
					size: new Vector2(chatWindowSize.x - 4, 18),
					font: "gothic-18-bold",
					text: displayName,
					textOverflow: "ellipsis",
					textAlign: Feature.round("right", "left"),
					color: msg.isFromMe ? Feature.color("black", "white") : "black"
				});
				chatWindow.add(displayNameText);

				var msgText = new UI.Text({
					position: new Vector2(2, renderedMessagesCount * msgHeight + 20),
					size: new Vector2(chatWindowSize.x - 4, msgHeight - 42),
					font: "gothic-18-bold",
					text: text,
					textOverflow: "ellipsis",
					textAlign: Feature.round("right", "left"),
					color: msg.isFromMe ? Feature.color("black", "white") : "black"
				});
				chatWindow.add(msgText);

				var timestampText = new UI.Text({
					position: new Vector2(2, renderedMessagesCount * msgHeight + msgHeight - 24),
					size: new Vector2(chatWindowSize.x - 4, 18),
					font: "gothic-18",
					text: getTimestampText(msg.dateCreated),
					textOverflow: "fill",
					textAlign: Feature.round("right", "left"),
					color: msg.isFromMe ? Feature.color("black", "white") : "black"
				});
				chatWindow.add(timestampText);

				renderedMessagesCount++;
			}
		}

		if (!allMessagesLoaded) {
			var loadMoreBackground = new UI.Rect({
				position: new Vector2(0, renderedMessagesCount * msgHeight + 2),
				size: new Vector2(chatWindowSize.x, 18),
				backgroundColor: "white"
			});
			chatWindow.add(loadMoreBackground);

			var loadMoreText = new UI.Text({
				position: new Vector2(2, renderedMessagesCount * msgHeight - 22),
				size: new Vector2(chatWindowSize.x - 2, 36),
				font: "leco-36-bold-numbers",
				text: "...",
				textAlign: "center",
				textOverflow: "ellipsis",
				color: "black"
			});
			chatWindow.add(loadMoreText);
		}

		chatWindow.backgroundColor("black"); // "separator"
		chatWindow.show();
	}, offset);
}

var contactsLoaded = false;
function loadContacts(callback) {
	fetchContactsCard.show();

	ajax(
		{
			url: serverURL + "/api/v1/contact?password=" + serverPassword,
			method: "GET",
			type: "json"
		},
		function(data) {
			var contacts = data.data;
			if (data.status == 200) {
				for (var contactNum = 0; contactNum < contacts.length; contactNum++) {
					var contact = contacts[contactNum];

					if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
						for (var numberNum = 0; numberNum < contact.phoneNumbers.length; numberNum++) {
							var phoneNumberInfo = contact.phoneNumbers[numberNum];
							var phoneNumber = phoneNumberInfo.address;
							phoneNumber = phoneNumber.replace(/[ \-\(\)]/g, ""); // Get rid of formatting garbage

							// Make all phone numbers well-formed international numbers, except shortcodes
							// TODO: There are billion edge cases here; this only semi-reliably works for the NANP (+1)
							if (phoneNumber.lastIndexOf("+") == -1 && phoneNumber.length == 10) {
								phoneNumber = intlCallingCode + phoneNumber;
							}

							addressToContactMap[phoneNumber] = contact;
						}
					}

					if (contact.emails && contact.emails.length > 0) {
						for (var emailNum = 0; emailNum < contact.emails.length; emailNum++) {
							var emailInfo = contact.emails[emailNum];
							addressToContactMap[emailInfo.address] = contact;
						}
					}
					
				}

				console.log("Loaded " + contacts.length + " contacts");

				contactsLoaded = true;
				callback(contacts);
			} else {
				console.error("Couldn't load contacts: " + JSON.stringify(data));

				errorCard.subtitle("Error: Couldn't load contacts");
				errorCard.body(data.error.type + ": " + data.error.message);
				errorCard.show();
			}

			fetchContactsCard.hide();
		},
		function(data) {
			console.error("Couldn't load contacts: " + JSON.stringify(data));

			errorCard.subtitle("Error: Couldn't load contacts");
			errorCard.body(data.error.type + ": " + data.error.message);
			errorCard.show();

			fetchContactsCard.hide();
		}
	);
}

var chatItems = [];
var loadedChatItemsCount = 0;
var allChatsLoaded = false;
function loadChats(callback, offset) {
	if (demoMode) {
		callback(chatItems);
		return;
	}

	fetchChatsCard.show();

	ajax(
		{
			url: serverURL + "/api/v1/chat/query?password=" + serverPassword,
			method: "POST",
			type: "json",
			cache: false,
			data: {
				// BUG: BlueBubbles will not return chats according to sort order with any sort of limit/offset
				//limit: 15,
				//offset: offset,
				with: [
					"lastmessage",
					"participants",
					"sms",
					"archived"
				],
				sort: "lastmessage"
			}
		},
		function(data) {
			if (data.status == 200) {
				var chats = data.data;

				for (var i = 0; i < chats.length; i++) {
					var chat = chats[i];
					var displayName = chat.displayName;
					var lastMessage = chat.lastMessage != null && chat.lastMessage.text != null ? chat.lastMessage.text : "";
	
					if (lastMessage != "") {
						if (displayName == "") {
							displayName = getDisplayNameFromParticipants(chat.participants);
						}

						// BUG: If strings are too long, it crashes the app
						// 128 is arbitrary, just because it's not realistic we'll show more than it right now
						displayName = displayName.substring(0, 128);
						lastMessage = lastMessage.substring(0, 128);

						chatItems.push({
							title: displayName,
							subtitle: lastMessage,
							guid: chat.guid
						});
					}
				}

				// TODO: Is there a maximum number of items that can be displayed?
				loadedChatItemsCount += data.metadata.count;
				allChatsLoaded = loadedChatItemsCount >= data.metadata.total;

				console.log("Loaded " + data.metadata.count + " chats");

				callback(chats);
			} else {
				console.error("Couldn't load chats: " + JSON.stringify(data));

				errorCard.subtitle("Error: Couldn't load chats");
				errorCard.body(data.error.type + ": " + data.error.message);
				errorCard.show();
			}

			fetchChatsCard.hide();
		},
		function(data) {
			console.error("Couldn't load chats: " + JSON.stringify(data));

			errorCard.subtitle("Error: Couldn't load chats");
			errorCard.body(data.error.type + ": " + data.error.message);
			errorCard.show();

			fetchChatsCard.hide();
		}
	);
}

var mainMenu;
var menuItemsBefore = [
	{
		title: "BlueBubbles",
		icon: "images/menu_icon.png",
		subtitle: "About"
	}
];
var menuItemsAfter = [
	{
		title: "Load more..."
	}
];

// TODO: "Failed to decode PNG image", crashes aplite
if (Platform.version() == "aplite") {
	delete menuItemsBefore[0].icon;
}

function loadMainMenuChats(offset) {
	var oldLoadMoreIndex = chatItems.length + 1;

	loadChats(function(chats) {
		var menuItems = menuItemsBefore.concat(chatItems, !allChatsLoaded ? menuItemsAfter : null);

		var destroyedOldMenu = false;
		if (mainMenu) {
			// BUG: This causes the menu to hide itself, exiting the app, even though we call show below??
			//mainMenu.items(0, menuItems);
			mainMenu.hide(); // the old one
			destroyedOldMenu = true;
		}

		mainMenu = new UI.Menu({
			sections: [{
				items: menuItems
			}],
			highlightBackgroundColor: Feature.color("#147EFB", "#000000"),
			highlightTextColor: "white"
		});
		mainMenu.on("show", function() {
			// Reload the chat list
			if (mainMenuIsStale) {
				mainMenuIsStale = false;
				chatItems = [];
				loadedChatItemsCount = 0;
				allChatsLoaded = false;
				loadMainMenuChats(0);
			}
		});

		mainMenu.on("select", function(e) {
			if (e.item.title == "BlueBubbles") {
				aboutCard.show();
			} else if (e.item.title == "Load more...") {
				showMainMenu(loadedChatItemsCount);
			} else {
				showChatThread(e.item.guid, e.item.title, 0);
				//doReply(e.item.guid, e.item.title);
			}
		});
	
		mainMenu.show();

		if (offset > 0 || destroyedOldMenu) {
			mainMenu.selection(0, destroyedOldMenu ? 1 : oldLoadMoreIndex);
		}
	}, offset);
}

function showMainMenu(offset) {
	if (contactsLoaded) {
		loadMainMenuChats(offset);
	} else {
		loadContacts(function(contacts) {
			loadMainMenuChats(offset);
		});
	}
}

function initApp() {
	if (validateSettings() == true) {
		console.log("Connecting to server: " + serverURL);
		connectCard.show();
		errorCard.hide();

		ajax(
			{
				url: serverURL + "/api/v1/server/info?password=" + serverPassword,
				method: "GET",
				type: "json"
			},
			function(data) {
				if (data.status == 200) {
					serverInfo = data.data;
					var serverInfoStr = "";

					for (var key in serverInfo) {
						var kvStr = key + ": " + serverInfo[key];
						serverInfoStr += serverInfoStr != "" ? "\n- " + kvStr : "- " + kvStr;
					}

					console.log("Got Server Info:\n" + serverInfoStr);
					aboutCard.body("Version: " + version + "\n\nAuthor:\nWinterPhoenix <github.com/WinterPhoenix>\n\nServer URL:\n" + serverURL + "\n\nServer Info:\n" + serverInfoStr);

					showMainMenu(0);
				} else {
					console.error("Couldn't connect to server: " + JSON.stringify(data));

					errorCard.subtitle("Error: Couldn't connect to server");
					errorCard.body("Make sure your server url and password are correct, Pebble has a connection to your phone, and that your phone has an internet connection.");
					errorCard.show();
				}

				connectCard.hide();
			},
			function(data) {
				console.error("Couldn't connect to server: " + JSON.stringify(data));

				errorCard.subtitle("Error: Couldn't connect to server");
				errorCard.body("Make sure your server url and password are correct, Pebble has a connection to your phone, and that your phone has an internet connection.");
				errorCard.show();

				connectCard.hide();
			}
		);
	} else {
		console.error("Settings unavailable/invalid");

		errorCard.subtitle("Error: Couldn't get settings");
		errorCard.body("Please open the Pebble app on your phone and configure BlueBubbles.");
		errorCard.show();
	}
}

function initAppDemo() {
	aboutCard.body("Version: " + version + "\n\nAuthor:\nWinterPhoenix <github.com/WinterPhoenix>\n\nServer Info:\nDemo Mode");

	contactsLoaded = true;
	chatItems = [
		{
			title: "Alice, Bob",
			subtitle: "When do you want to get drinks?",
			guid: "iMessage;"
		},
		{
			title: "Bill Lumbergh",
			subtitle: "Hello Peter. What's happening?",
			guid: "SMS;"
		},
		{
			title: "Misato Katsuragi",
			subtitle: "Get in the Eva.",
			guid: "iMessage;"
		},
	];

	showMainMenu(0);
}

if (!demoMode) {
	initApp();
} else {
	initAppDemo();
}
