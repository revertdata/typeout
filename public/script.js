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

function checkForMatch() {
	socket.send(JSON.stringify({
		action: 'ident',
		username: landing.userName,
		color: landing.userColor
	}));

	socket.onmessage = function(event) {
		data = JSON.parse(event.data);
		if (data.status == 201) {
			loading.visible = false;
			chat.visible = true;
		}
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
		message: ''
	},
	methods: {
		chat: function() {
			// sendMessage()
			console.log(this.message);
			this.message = '';
		}
	}
});
