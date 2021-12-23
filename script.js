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
	},
	createBoard: function () {
		let board = [];
		for (let i = 9; i > 0; i--) {
			board.push(false);
		}
		return board;
	}
};
gameBoard.init();

// Display Controller Module
const displayController = {
	init: function () {
		this.gameStates = document.querySelectorAll(".game-state");
		this.inputForm = document.querySelector("form");
		this.displayBoard();
	},
	displayBoard: function () {
		gameBoard.board.forEach((content) => {
			let gameBox = document.createElement("div");
			gameBox.classList.add("game-box");
			let gameBoxContent = document.createElement("p");
			gameBoxContent.textContent = content ? content : "";
			gameBox.appendChild(gameBoxContent);
			gameBoard.DOM.appendChild(gameBox);
		});
		this.boxes = gameBoard.DOM.querySelectorAll(".game-box");
		console.log(this.boxes);
	},
	displayPlayer: function (player) {
		playerInfo.player.textContent = player.playerName;
	},
	displayOpponent: function (opponent) {
		playerInfo.opponent.textContent = opponent ? opponent.playerName : "Computer";
	},
	getPlayerInput: function (input) {
		if (input === "pvp" || input === "pvpc") {
			gameBoard.DOM.classList.remove("disabled");
			this.toggleDisplayState();
		} else if (input === "newGame") {
			gameBoard.DOM.classList.add("disabled");
			this.toggleDisplayState();
		}
	},
	toggleDisplayState: function () {
		this.gameStates.forEach((state) => {
			state.classList.toggle("d-none");
		});
		this.inputForm.classList.toggle("d-none");
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
		events.on("gameModeChanged", this.gameModeHandler.bind(this));
		this.publishEvents();
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

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};
