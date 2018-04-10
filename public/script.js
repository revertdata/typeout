let apiURL = 'https://localhost:5000'

// Generate Username & Color
const dicAdj = ["adamant", "adroit", "amatory", "animistic", "antic", "arcadian", "arctic", "baleful", "bellicose", "bilious", "boorish", "calamitous", "caustic", "cerulean", "comely", "concomitant", "contumacious", "corpulent", "crapulous", "defamatory", "didactic", "silly", "dowdy", "efficacious", "effulgent", "egregious", "endemic", "equanimous", "execrable", "fastidious", "feckless", "fecund", "friable", "fulsome", "garrulous", "guileless", "gustatory", "heuristic", "histrionic", "hubristic", "incendiary", "insidious", "insolent", "creepy", "inveterate", "spooky", "irksome", "jocular", "judicious", "lachrymose", "limpid", "loquacious"];
const dicNoun = ["ninja", "chair", "pancake", "statue", "unicorn", "rainbow", "laser", "senor", "bunny", "captain", "nibblet", "cupcake", "carrot", "gnome", "glitter", "potato", "salad", "toejam", "curtain", "beet", "toilet", "exorcism", "egg", "mermaid", "lunch", "dragon", "jellybean", "snake", "doll", "bush", "cookie", "apple", "ice cream", "ukulele", "kazoo", "banjo", "vaccuum", "circus", "trampoline", "carousel", "carnival", "locomotive", "balloon", "mantis", "animator", "artisan", "artist", "colorist", "inker", "coppersmith", "director", "designer", "flatter", "stylist", "leadman", "limner"];
const dicColor = ["#90ee90", "#ffc0cb", "#ffa500", "#add8e6", "#d9f7b4", "#e1c0eb", "#64ebd1"];

function randomEl(list) {
	var i = Math.floor(Math.random() * list.length);
	return list[i];
}

function checkForMatch() {
	// fetch(`${apiURL}/chatsession`, {
	// 	method: 'get',
	// 	credentials: 'include'
	// }).then(function(res) {
	// 	if (res.status == 200) {
	// 		loading.visible = false;
	// 		chat.visible = true;
	// 	}
	// });
}

let landing = new Vue({
	el: '#landing-page',
	data: {
		visible: true,
		userName: `${randomEl(dicAdj)} ${randomEl(dicNoun)}`,
		userColor: dicColor[Math.floor(Math.random() * dicColor.length)]
	},
	methods: {
		generate: function() {
			this.userName = `${randomEl(dicAdj)} ${randomEl(dicNoun)}`;
			this.userColor = dicColor[Math.floor(Math.random() * dicColor.length)];
		},
		search: function() {
			this.visible = false;
			loading.visible = true;
			checkForMatch();
		}
	}
});

let loading = new Vue({
	el: '#loading-container-container',
	data: {
		visible: false
	}
});
