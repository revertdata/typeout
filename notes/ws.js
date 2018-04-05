var myName = window.prompt('hi. what\'s your name?');
var messageInput = document.querySelector("#message-input");
var messageLog = document.querySElector("#message-log");
var sendButton = document.querySelector("#send-button");

var logMessage = function (message) {
    var el = document.createElement('div');
    el.innerHTML = message;
    messageLog.appendChild(el);
};

sendButton.onclick = function() {
    var message = messageInput.value;
    // TODO: Send the message...
    socket.send(myName + " says: " + message);
    logMessage(">>> " + message);
};

var socket = new WebSocket('ws://144.38.197.198:8080');

socket.onopen = function(event) {
    alert("You're now connected to the server.  Be careful out there.");
    socket.send(myName + " has joined.");

};

socket.onmessage = function (event) {
    console.log("Message received", event);
    logMessage(event.data);
};
