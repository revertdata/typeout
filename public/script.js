let apiURL = 'https://localhost:5000'
var socket = new WebSocket('ws://localhost:5000');

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
	console.log(chat.messages);
}

socket.onmessage = function(event) {
	data = JSON.parse(event.data);
	if (data.status == 201) {

		if (data.action == 'paired') {
			loading.visible = false;
			chat.visible = true;

			chat.user.username = data.me;
			chat.pair.username = data.pair;
		} else if (data.action == 'message') {
			displayMessage(data);
		}
	}
}

function checkForMatch() {
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
			to: chat.pair.username,
			from: chat.user.username,
			msg: chat.message
		};

		displayMessage(data);
		socket.send(JSON.stringify(data));
	}
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
			username: ''
		},
		pair: {
			username: ''
		},
		message: '',
		messages: []
	},
	methods: {
		chat: function() {
			sendMessage(this.message);
			// console.log(this.message);
			this.message = '';
		},
		end: function() {
			// TODO
			this.message = '';
		},
		restart: function() {
			socket.close();
			this.pair.username = '';
			this.visible = false;
			landing.visible = true;
		}
	}
});
