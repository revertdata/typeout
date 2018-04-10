var myName = window.prompt('hi. what\'s your name?');
var messageInput = document.querySelector("#message-input");
var messageLog = document.querySElector("#message-log");
var sendButton = document.querySelector("#send-button");

var logWords = function (message) {
	messageLog.innerHTML = '';
	words.forEach(function(word) {
		var el = document.createElement('div');
		el.innerHTML = word;
		messageLog.appendChild(el);
	});
};

var killWord = function() {
	var message = messageInput.value;
	for (var i=0; i < words.length; i++) {
		if (words[i] == word) {
			delete words[i];
			break;
		}
	}
	messageInput.value = '';
	logWords();
}

messageInput.onkeydown = function (event) {
	if (event.which == '13') {
		killWord();
	}
};

var socket = new WebSocket('ws://144.38.197.198:8080');
var words = [];

socket.onopen = function(event) {
	alert("You're now connected to the server.  Be careful out there.");

};

socket.onmessage = function (event) {
	console.log("Message received", event);
	logWords(event.data);
};
