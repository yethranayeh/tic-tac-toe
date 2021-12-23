/** @format */
// PubSub by learncodeacademy
const events = {
	events: {},
	on: function (eventName, fn) {
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(fn);
	},
	off: function (eventName, fn) {
		if (this.events[eventName]) {
			for (var i = 0; i < this.events[eventName].length; i++) {
				if (this.events[eventName][i] === fn) {
					this.events[eventName].splice(i, 1);
					break;
				}
			}
		}
	},
	emit: function (eventName, data) {
		if (this.events[eventName]) {
			this.events[eventName].forEach(function (fn) {
				fn(data);
			});
		}
	}
};

// Game Board Module
const gameBoard = {
	init: function () {
		this.board = this.createBoard();
		this.DOM = document.querySelector(".game-board");
		this.boxes = this.createBoxes();
		this.publishEvents();
	},
	createBoard: function () {
		let board = [];
		for (let i = 9; i > 0; i--) {
			board.push(false);
		}
		return board;
	},
	createBoxes: function () {
		let boxes = [];
		this.board.forEach((content) => {
			let gameBox = document.createElement("div");
			gameBox.classList.add("game-box");
			boxes.push(gameBox);
		});
		return boxes;
	},
	publishEvents: function () {
		this.boxes.forEach((box) => {
			box.addEventListener("click", function (e) {
				displayController.displayBoxInput(e.target);
			});
		});
	}
};
gameBoard.init();

// Display Controller Module
const displayController = {
	init: function () {
		this.gameStates = document.querySelectorAll(".game-state");
		this.inputForm = document.querySelector("form");
		this.initializeBoard();
		events.on("newGameClicked", this.clearBoard.bind(this));
		events.on("newGameClicked", this.toggleDisplayState.bind(this));
		events.on("newGameClicked", this.makeBoardAvailable.bind(this));
	},
	initializeBoard: function () {
		for (let box of gameBoard.boxes) {
			gameBoard.DOM.appendChild(box);
		}
	},
	clearBoard: function () {
		for (let box of gameBoard.boxes) {
			if (box.lastChild) {
				box.removeChild(box.lastChild);
			}
		}
	},
	displayBoxInput: function (target) {
		if (!target.parentNode.classList.contains("disabled")) {
			let boxContent = document.createElement("p");
			boxContent.textContent = "x";
			target.appendChild(boxContent);
		}
	},
	displayPlayer: function (player) {
		playerInfo.player.textContent = player.playerName;
	},
	displayOpponent: function (opponent) {
		playerInfo.opponent.textContent = opponent ? opponent.playerName : "Computer";
	},
	getPlayerInput: function (input) {
		if (input === "pvp" || input === "pvpc") {
			this.makeBoardAvailable(true);
			this.toggleDisplayState();
		} else if (input === "newGame") {
			this.makeBoardAvailable(false);
			this.toggleDisplayState();
		}
	},
	toggleDisplayState: function () {
		this.gameStates.forEach((state) => {
			state.classList.toggle("d-none");
		});
		this.inputForm.classList.toggle("d-none");
		this.inputForm.querySelectorAll("input").forEach((input) => {
			input.checked = false;
		});
	},
	makeBoardAvailable: function (bool) {
		if (bool === true) {
			gameBoard.DOM.classList.remove("disabled");
		} else {
			gameBoard.DOM.classList.add("disabled");
		}
	}
};
displayController.init();

// Player Info Module
const playerInfo = {
	init: function () {
		this.DOM = document.querySelector(".player-info");
		this.player = this.DOM.querySelector("#player");
		this.opponent = this.DOM.querySelector("#opponent");
		this.gameModeInputs = this.DOM.querySelectorAll("input");
		this.publishEvents();
		events.on("gameModeChanged", this.gameModeHandler.bind(this));
	},
	gameModeHandler: function (input) {
		if (input === "pvp") {
			var player = playerFactory(prompt("Player 1 Name:"));
			var opponent = playerFactory(prompt("Player 2 Name:"));
		} else if (input === "pvpc") {
			var player = playerFactory(prompt("Player Name:"));
			var opponent = playerFactory("Computer");
		}
		displayController.getPlayerInput(input);
		displayController.displayPlayer(player);
		displayController.displayOpponent(opponent);
	},
	publishEvents: function () {
		this.gameModeInputs.forEach((input) => {
			input.addEventListener("click", function (e) {
				events.emit("gameModeChanged", e.target.id);
			});
		});
	}
};
playerInfo.init();

const buttons = {
	init: function () {
		this.publishEvents();
	},
	newGame: document.querySelector("#newGame"),
	publishEvents: function () {
		this.newGame.addEventListener("click", function (e) {
			events.emit("newGameClicked", e.target.id);
		});
	}
};
buttons.init();

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};
