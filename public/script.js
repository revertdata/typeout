var HOST = location.origin.replace(/^http/, 'ws');
var socket = new WebSocket(HOST);

// Generate Username & Color
const colors = ["#90ee90", "#ffc0cb", "#ffa500", "#add8e6", "#d9f7b4", "#e1c0eb", "#64ebd1"];

function randomEl(list) {
	var i = Math.floor(Math.random() * list.length);
	return list[i];
}

function generateUser() {
	return fetch("https://randomuser.me/api", {
		method: 'get',
		dataType: 'json'
	}).then(function (res) {
		return res.json();
	}).then(function (data) {
		landing.userName = data['results'][0]['login']['username'].replace(/[0-9]/g, '');
		landing.userColor = colors[Math.floor(Math.random() * colors.length)];
	});
}

function setDate() {
	d = new Date()
	h = d.getHours();
	m = d.getMinutes();
	return `${((h < 10)?"0":"") + h}:${((m < 10)?"0":"") + m}`;
}

function displayMessage(data) {
	chat.messages.push(data);
}

socket.onmessage = function(event) {
	data = JSON.parse(event.data);
	if (data.status == 200) {

		if (data.action == 'paired') {
			loading.visible = false;
			chat.visible = true;

			chat.user = {
				ID: data.me,
				username: data.username,
				color: data.userColor
			};
			chat.pair = {
				ID: data.pair,
				username: data.pairname,
				color: data.pairColor
			};
			chat.message = '';
			chat.messages = [];
			chat.ended = {
				status: false,
				class: 'enabled',
				message: ''
			};


		} else if (data.action == 'message') {
			displayMessage(data);
		} else if (data.action == 'disconnected') {
			chat.ended = data.message.message;
		}
	}
}

function checkForMatch() {
	chat.ended = {
		status: false,
		class: 'enabled',
		message: ''
	};

	socket.send(JSON.stringify({
		action: 'ident',
		username: landing.userName,
		color: landing.userColor
	}));
}

function sendMessage() {
	if (chat.message != '') {
		data = {
			action: 'sendmsg',
			time: setDate(),
			to: chat.pair.ID,
			from: chat.user.ID,
			message: chat.message
		};

		displayMessage(data);
		socket.send(JSON.stringify(data));
	}
}

function disconnect() {
	data = {
		action: 'disconnect',
		message: chat.ended,
		user: chat.user.ID,
		pair: chat.pair.ID
	}

	socket.send(JSON.stringify(data));
}

let landing = new Vue({
	el: '#landing-page',
	data: {
		visible: true,
		userName: '',
		userColor: colors[Math.floor(Math.random() * colors.length)]
	},
	methods: {
		generate: function() {
			generateUser();
		},
		search: function() {
			this.visible = false;
			loading.visible = true;
			checkForMatch();
		}
	},
	created: function() {
		generateUser();
	}
});

let loading = new Vue({
	el: '#loading-container-container',
	data: {
		visible: false
	}
});

let chat = new Vue({
	el: '#chat-page',
	data: {
		visible: false,
		user: {
			ID: '',
			username: '',
			color: ''
		},
		pair: {
			ID: '',
			username: '',
			color: ''
		},
		message: '',
		messages: [],
		ended: {
			status: false,
			class: 'enabled',
			message: ''
		}
	},
	methods: {
		chat: function() {
			if (this.message != '') {
				sendMessage(this.message);
				this.message = '';
			}
		},
		end: function() {
			this.ended = {
				status: true,
				class: 'disabled',
				message: this.user.username + " disconnected the chat."
			}

			disconnect();
		},
		restart: function() {
			this.ended = {
				status: true,
				class: 'disabled',
				message: this.user.username + " has left the chat."
			}

			disconnect();

			this.visible = false;
			landing.visible = true;
		}
	}
});
