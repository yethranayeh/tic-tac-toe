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
		events.on("turnSwitched", this.checkGameState.bind(this));
		events.on("newGameClicked", this.startFresh.bind(this));
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
		let boxID = 0;
		this.board.forEach((content) => {
			let gameBox = document.createElement("div");
			gameBox.classList.add("game-box");
			gameBox.id = boxID;
			boxes.push(gameBox);
			boxID++;
		});
		return boxes;
	},
	publishEvents: function () {
		this.boxes.forEach((box) => {
			box.addEventListener("click", function (e) {
				// BUGFIX [f62a534] - The if coniditon solves an unintended bug introduced with artificial computer turn delay.
				// The player was able to play multiple turns while waiting for the computer to play after the artificial delay.
				if (gameBoard.gameMode === "pvp" || gameBoard.currentSymbol === "x") {
					displayController.displayBoxInput(e.target);
					events.emit("playerPlayed");
				}
			});
		});
	},
	startFresh: function () {
		this.board = this.createBoard();
		this.gameMode = undefined;
		this.currentSymbol = "x";
	},
	switchTurn: function () {
		this.currentSymbol = this.currentSymbol === "x" ? "o" : "x";
		events.emit("turnSwitched");
	},
	rows: [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8]
	],
	columns: [
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8]
	],
	diagonals: [
		[0, 4, 8],
		[2, 4, 6]
	],
	hasWinningPattern: function (arr) {
		// Check for winning pattern
		for (let element of arr) {
			// console.log(`%cChecking element: [${element}]`, "color: yellow; text-decoration: underline;");
			let x = 0;
			let o = 0;
			element.forEach((index) => {
				if (this.board[index] === "x") {
					x++;
				} else if (this.board[index] === "o") {
					o++;
				}
			});
			// console.log(`%cResults: x(${x}) vs o(${o})`, "color: lightgreen; text-decoration: underline");
			if (x === 3) {
				return "x";
			} else if (o === 3) {
				return "o";
			}
		}
		return false;
	},
	checkGameState: function () {
		if (
			// If the board has 3 of "x" as it will be the first to reach 3, start checking for a winning pattern
			this.board.filter((n) => {
				return n === "x";
			}).length >= 3
		) {
			// Check rows, columns, diagonals for winning pattern
			if (this.hasWinningPattern(this.rows)) {
				events.emit("gameOver", this.hasWinningPattern(this.rows));
			} else if (this.hasWinningPattern(this.columns)) {
				events.emit("gameOver", this.hasWinningPattern(this.columns));
			} else if (this.hasWinningPattern(this.diagonals)) {
				events.emit("gameOver", this.hasWinningPattern(this.diagonals));
			} else if (
				// If there is no winning pattern, check if the board is full. If so, it is a draw. If not, the game continues
				this.board.every((n) => {
					return n === "x" || n === "o";
				})
			) {
				events.emit("gameOver", "draw");
			} else {
				return;
			}
		}
	}
};
gameBoard.init();

// Display Controller Module
const displayController = {
	init: function () {
		this.gameStates = document.querySelectorAll(".game-state");
		this.nameContainers = document.querySelectorAll(".input-indicator");
		this.initializeBoard();
		// events.on("startGameClicked", this.toggleInfoDisplayState.bind(this));
		events.on(
			"startGameClicked",
			function () {
				this.toggleButtonDisplayState(buttons.startGame);
			}.bind(this)
		);
		// events.on("startGameClicked", this.makeBoardAvailable.bind(this));
		// events.on("startGameClicked", this.switchTurnIndicator.bind(this));
		events.on("turnSwitched", this.switchTurnIndicator.bind(this));
		events.on("newGameClicked", this.clearBoard.bind(this));
		events.on("newGameClicked", this.toggleInfoDisplayState.bind(this));
		events.on(
			"newGameClicked",
			function () {
				this.toggleButtonDisplayState(buttons.startGame);
			}.bind(this)
		);
		events.on("newGameClicked", this.makeBoardAvailable.bind(this));
		events.on("gameOver", this.makeBoardAvailable.bind(this));
		events.on(
			"gameOver",
			function (result) {
				this.displayResult(result);
				this.toggleButtonDisplayState(buttons.newGame);
			}.bind(this)
		);
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
		this.toggleButtonDisplayState(buttons.newGame);
		this.makeBoardAvailable(true);
		this.gameStates[1].removeChild(this.gameStates[1].lastChild);
		console.clear();
	},
	displayBoxInput: function (target) {
		if (!target.parentNode.classList.contains("disabled") && !target.textContent) {
			// Add symbol of current turn to the box
			target.textContent = gameBoard.currentSymbol;
			// Adjust board array with turns played
			gameBoard.board[target.id] = gameBoard.currentSymbol;
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
	displayResult: function (result) {
		const winnerParagraph = document.createElement("p");
		winnerParagraph.classList.add("game-result");
		let gameResult;
		if (result === "x") {
			winnerParagraph.classList.add("win");
			gameResult = `${playerInfo.player.textContent} wins!`;
		} else if (result === "o") {
			if (playerInfo.opponent.textContent === "Computer") {
				winnerParagraph.classList.add("lose");
			} else {
				winnerParagraph.classList.add("win");
			}
			gameResult = `${playerInfo.opponent.textContent} wins!`;
		} else if (result === "draw") {
			winnerParagraph.classList.add("draw");
			gameResult = "It's a draw!";
		} else {
			alert("Uncaught result:", result, "Please contact the developer.");
		}
		winnerParagraph.textContent = gameResult;
		this.gameStates[1].appendChild(winnerParagraph);
	},
	setGameMode: function (input) {
		console.info("%csetGameMode", "color:aqua;font-style:italic;");
		// console.log("Input:", input);
		if (input === "pvp" || input === "pvpc") {
			// console.log("Calling displayController.makeBoardAvailable%c(true)", "color:aqua;font-style:italic;");
			// console.log("Calling displayController.toggleInfoDisplayState()");
			this.makeBoardAvailable(true);
			this.toggleInfoDisplayState();
		} else if (input === "newGame") {
			// console.log("Calling displayController.makeBoardAvailable%c(false)", "color:aqua;font-style:italic;");
			// console.log("Calling displayController.toggleInfoDisplayState()");
			this.makeBoardAvailable(false);
			this.toggleInfoDisplayState();
		}
	},
	toggleInfoDisplayState: function (eventPublisher) {
		console.info("%ctoggleInfoDisplayState", "color:aqua;font-style:italic;");

		// console.log("Toggling 'd-none' for ->", this.gameStates[1]);
		this.gameStates[1].classList.toggle("d-none"); // THIS IS PROBABLY UNNECESSARY. THE WINNER SHOULD HAVE A REVEALING ANIMATION, D-NONE IS TEMPORARY

		// Toggle background color and border for container
		this.nameContainers.forEach((container) => {
			container.classList.toggle("input-indicator");
		});

		// Toggle the visibility of game mode switch buttons
		playerInfo.modeSwitchBtns.forEach((btn) => {
			btn.classList.toggle("switch-mode");
		});

		// Toggle the blinking cursor animations
		// 	Player:
		playerInfo.player.classList.toggle("animate-text-editable");
		if (playerInfo.player.classList.contains("animate-text-editable")) {
			playerInfo.player.setAttribute("contenteditable", "true");
		} else {
			playerInfo.player.setAttribute("contenteditable", "false");
		}
		//	Opponent:
		if (playerInfo.editableInputs.length > 1) {
			console.warn("Moren than 1 editable");
			console.log("In this case, the animation would be toggled off.");
			playerInfo.opponent.classList.remove("animate-text-editable");
			playerInfo.opponent.setAttribute("contenteditable", "false");
			playerInfo.editableInputs.splice(1, 1);
		} else if (!(playerInfo.opponent.textContent === "Computer")) {
			console.log("Opponent:", playerInfo.opponent);
			playerInfo.opponent.classList.add("animate-text-editable");
			playerInfo.opponent.setAttribute("contenteditable", "true");
			playerInfo.editableInputs.push(playerInfo.opponent);
		}
	},
	toggleButtonDisplayState: function (button) {
		button.classList.toggle("btn-disappear");
	},
	makeBoardAvailable: function (bool) {
		console.info("%cmakeBoardAvailabe", "color:aqua;font-style:italic;");
		if (bool === true) {
			console.log("TRUE");
			gameBoard.DOM.classList.remove("disabled");
			this.switchTurnIndicator();
		} else {
			console.log("FALSE");
			gameBoard.DOM.classList.add("disabled");
			this.disableTurnIndicator();
		}
	},
	switchTurnIndicator: function () {
		console.info("%cswitchTurnIndicator", "color:aqua;font-style:italic;");
		if (!gameBoard.DOM.classList.contains("disabled")) {
			console.log("Board not disabled");
			if (gameBoard.currentSymbol === "x") {
				playerInfo.player.classList.add("turn-indicator");
				playerInfo.opponent.classList.remove("turn-indicator");
			} else {
				playerInfo.player.classList.remove("turn-indicator");
				playerInfo.opponent.classList.add("turn-indicator");
			}
		} else {
			console.log("Board disabled");
			this.disableTurnIndicator();
		}
	},
	disableTurnIndicator: function () {
		console.info("%cdisableTurnIndicator", "color:aqua;font-style:italic;");
		playerInfo.player.classList.remove("turn-indicator");
		playerInfo.opponent.classList.remove("turn-indicator");
	}
};
displayController.init();

// Player Info Module
const playerInfo = {
	init: function () {
		this.DOM = document.querySelector(".player-info");
		this.player = this.DOM.querySelector("#player");
		this.opponent = this.DOM.querySelector("#opponent");
		this.modeSwitchBtns = this.DOM.querySelectorAll("i");
		this.editableInputs = [this.player];
		this.publishEvents();
		// events.on("gameModeChanged", this.gameModeHandler.bind(this));
		events.on("startGameClicked", this.gameModeHandler.bind(this));
		events.on(
			"gameModeChanged",
			function (targetID) {
				this.switchMode(targetID);
			}.bind(this)
		);
	},
	gameModeHandler: function () {
		console.info("%cgameModeHandler", "color:aqua;font-style:italic;");
		let gameMode;
		const player = playerFactory(this.player.textContent);
		const opponent = playerFactory(this.opponent.textContent);
		// console.log("Player:", player, "Opponent:", opponent);
		if (!(opponent.playerName === "Computer")) {
			player.playerName = player.playerName ? player.playerName : "Player 1";
			opponent.playerName = opponent.playerName ? opponent.playerName : "Player 2";

			gameMode = "pvp";
			gameBoard.gameMode = "pvp";
			// console.warn(player.playerName, "vs", opponent.playerName, "in mode:", gameMode);
		} else if (opponent.playerName === "Computer") {
			player.playerName = player.playerName ? player.playerName : "Player";

			computer.init();

			gameMode = "pvpc";
			gameBoard.gameMode = "pvpc";
			// console.warn(player.playerName, "vs", opponent.playerName, "in mode:", gameMode);
		} else {
			console.error("No conditions met");
			console.info(`!opponent.playerName === "Computer" ->`, !opponent.playerName === "Computer");
			console.info(`opponent.playerName === "Computer" ->`, opponent.playerName === "Computer");
		}

		displayController.setGameMode(gameMode);
		displayController.displayPlayer(player);
		displayController.displayOpponent(opponent);
	},
	publishEvents: function () {
		this.modeSwitchBtns.forEach((btn) => {
			btn.addEventListener("click", function (e) {
				events.emit("gameModeChanged", e.target.id);
			});
		});
	},
	switchMode: function (e) {
		console.info("%cswitchMode", "color:aqua;font-style:italic;");
		// console.log(e);
		let currentOpponent = this.opponent.textContent;
		this.opponent.textContent = currentOpponent === "Computer" ? "Player 2" : "Computer";
		if (this.opponent.textContent === "Player 2") {
			this.opponent.setAttribute("contenteditable", "true");
			this.editableInputs.push(this.opponent);
			// console.log("Editable inputs changed:", this.editableInputs);
		} else {
			this.opponent.setAttribute("contenteditable", "false");
			this.editableInputs.splice(1, 1);
			// console.log("Editable inputs changed:", this.editableInputs);
		}
		this.opponent.classList.toggle("animate-text-editable");
	}
};
playerInfo.init();

// Buttons Module
const buttons = {
	init: function () {
		this.newGame = document.querySelector("#newGame");
		this.startGame = document.querySelector("#startGame");
		this.publishEvents();
	},
	publishEvents: function () {
		this.newGame.addEventListener("click", function (e) {
			events.emit("newGameClicked", e.target.id);
		});
		this.startGame.addEventListener("click", function (e) {
			events.emit("startGameClicked", e.target.id);
		});
	}
};
buttons.init();

// Computer Logic Module
const computer = {
	init: function () {
		events.on("playerPlayed", computer.playTurn);
		events.on("newGameClicked", this.turnOff.bind(this));
	},
	playTurn: function () {
		console.info("%cplayTurn", "color:aqua;font-style:italic;");
		// Only play turn if the symbol to be played is "o".
		// The if condition is a "bandaid" for the bug where player clicking on an already played box still gives the turn to computer, instead of playing for the next player input.
		// As a result, you could click on, for example, the first box and the computer would play "x" or "o" symbols on empty boxes on each click.
		if (gameBoard.currentSymbol === "o") {
			let randomBox = gameBoard.boxes[Math.floor(Math.random() * gameBoard.boxes.length)];
			while (
				!gameBoard.board.every((box) => {
					// checks gameBoard.board to see that NOT every index has value. If all elements have truthy values, does not run
					return box;
				}) &&
				randomBox.textContent // checks if target node has textContent. If it does, randomly chooses another node
			) {
				randomBox = gameBoard.boxes[Math.floor(Math.random() * gameBoard.boxes.length)];
			}
			// Random computer play time to add artificial "thinking" time before playing turn
			let min = 380;
			let max = 580;
			let computerPlayTime = Math.floor(min + Math.random() * (max + 1 - min));
			setTimeout(displayController.displayBoxInput, computerPlayTime, randomBox); // Sends automated and randomized computer input to display controller after delay
			// displayController.displayBoxInput(randomBox); // Sends automated and randomized computer input to display controller
		}
	},
	turnOff: function () {
		events.off("playerPlayed", computer.playTurn);
	}
};

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};
