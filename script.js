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
		this.gameMode = undefined;
		this.currentSymbol = "x";
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
				events.emit("playerPlayed");
			});
		});
	},
	switchTurn: function () {
		console.log(this.currentSymbol, "played...");
		// let opponent;
		// if (this.gameMode === "pvp") {
		// 	opponent = "player2";
		// } else if (this.gameMode === "pvpc") {
		// 	opponent = "computer";
		// }
		this.currentSymbol = this.currentSymbol === "x" ? "o" : "x";
		console.log("Next turn:", this.currentSymbol);
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
		if (!target.parentNode.classList.contains("disabled") && !target.textContent) {
			target.textContent = gameBoard.currentSymbol;
			// Switch turn every time a box is clicked
			gameBoard.switchTurn();
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
		buttons.newGame.classList.add("d-none");
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
		let player;
		let opponent;
		if (input === "pvp") {
			player = playerFactory(prompt("Player 1 Name:"));
			opponent = playerFactory(prompt("Player 2 Name:"));
			gameBoard.gameMode = "pvp";
		} else if (input === "pvpc") {
			player = playerFactory(prompt("Player Name:"));
			opponent = playerFactory("Computer");
			gameBoard.gameMode = "pvpc";
			computer.init();
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

// Buttons Module
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

// Computer Logic Module
const computer = {
	init: function () {
		events.on("playerPlayed", this.playTurn.bind(this));
	},
	playTurn: function () {
		emptyBox: for (let box of gameBoard.boxes) {
			if (!box.textContent) {
				// box.textContent = gameBoard.currentSymbol;
				console.log("Sending box to be filled:", box);
				displayController.displayBoxInput(box);
				// gameBoard.switchTurn();
				break emptyBox;
			}
		}
	}
};

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};
