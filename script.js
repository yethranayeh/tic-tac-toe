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
		// this.board is an array that is used to conveniently check the current game board state instead of interacting with the DOM
		this.board = this.createBoard(); // an array of 9 "false" values, which will be changed to "X" or "O" depending on input
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
		// Create node elements before adding to gameBoard.DOM
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
		// Restores the board to beginning state
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
		// arr parameter received will be "rows", "columns" or "diagonals" arrays from gameBoard
		// Check for winning pattern
		for (let element of arr) {
			// For each pattern, there is a counter for X and O. If the count of either is 3, that is a winning pattern.
			let x = 0;
			let o = 0;
			element.forEach((index) => {
				if (this.board[index] === "x") {
					x++;
				} else if (this.board[index] === "o") {
					o++;
				}
			});

			if (x === 3) {
				return ["x", element];
			} else if (o === 3) {
				return ["o", element];
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
				events.emit("gameOver", ["draw"]);
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
		events.on(
			"startGameClicked",
			function () {
				this.toggleButtonDisplayState(buttons.startGame);
			}.bind(this)
		);
		events.on("turnSwitched", this.switchTurnIndicator.bind(this));
		events.on("newGameClicked", this.clearBoard.bind(this));
		events.on("newGameClicked", this.toggleInfoDisplayState.bind(this));
		events.on(
			"newGameClicked",
			function () {
				this.toggleButtonDisplayState(buttons.startGame);
			}.bind(this)
		);
		events.on("newGameClicked", this.disableWinningHighlight.bind(this));
		events.on("newGameClicked", this.makeBoardAvailable.bind(this));
		events.on("gameOver", this.makeBoardAvailable.bind(this));
		events.on(
			"gameOver",
			function (result) {
				this.displayResult(result[0]);
				this.highlightWinningPattern(result[1]);
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
				// box.lastChild is the symbol placed on box (X or O). So, if the box contains a symbol, it will be cleared for next game
				box.removeChild(box.lastChild);
			}
		}

		this.toggleButtonDisplayState(buttons.newGame);
		this.makeBoardAvailable(true);

		// After the board is cleared, also remove game result text
		playerInfo.resultDOM.classList.add("results-none");
		// After clearing the board, remove the current icon class for game result, so the appropriate one can be added next time
		// Also remove game result classes from text so they can be re-added later
		playerInfo.resultIcon.setAttribute("class", "fas");
		playerInfo.resultText.setAttribute("class", "");
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
	setGameMode: function (input) {
		if (input === "pvp" || input === "pvpc") {
			this.makeBoardAvailable(true);
			this.toggleInfoDisplayState();
		} else if (input === "newGame") {
			this.makeBoardAvailable(false);
			this.toggleInfoDisplayState();
		}
	},
	toggleInfoDisplayState: function (eventPublisher) {
		// Toggle background color and border for container
		this.nameContainers.forEach((container) => {
			container.classList.toggle("input-indicator");
		});

		// Toggle the visibility of game mode switch buttons
		playerInfo.modeSwitchBtns.forEach((btn) => {
			btn.classList.toggle("switch-mode");
		});

		// Toggle the blinking cursor animations and content editable attributes
		// 	Player:
		playerInfo.player.classList.toggle("animate-text-editable");
		if (playerInfo.player.classList.contains("animate-text-editable")) {
			playerInfo.player.setAttribute("contenteditable", "true");
		} else {
			playerInfo.player.setAttribute("contenteditable", "false");
		}
		//	Opponent:
		// Since this is a toggle function, it checks the editableInputs array to see if there are more than 1 editable sections
		if (playerInfo.editableInputs.length > 1) {
			// More than 1 indicates that there is a player 2,
			playerInfo.opponent.classList.remove("animate-text-editable");
			playerInfo.opponent.setAttribute("contenteditable", "false");
			// As this is a toggle, the reason this condition block is executed is because the user switched from Player 2 to Computer,
			// So the second editable element is removed from array to indicate that the user wants Player vs Computer
			playerInfo.editableInputs.splice(1, 1);
		} else if (!(playerInfo.opponent.textContent === "Computer")) {
			playerInfo.opponent.classList.add("animate-text-editable");
			playerInfo.opponent.setAttribute("contenteditable", "true");
			// This condition block executes when user switches from Computer to Player 2,
			// As Player 2 allows name input, it is added to the editableInputs array
			playerInfo.editableInputs.push(playerInfo.opponent);
		}
	},
	toggleButtonDisplayState: function (button) {
		button.classList.toggle("btn-disappear");
	},
	makeBoardAvailable: function (bool) {
		// As the game starts, the board becomes clickable
		if (bool === true) {
			gameBoard.DOM.classList.remove("disabled");
			this.switchTurnIndicator();
		} else {
			gameBoard.DOM.classList.add("disabled");
			this.disableTurnIndicator();
		}
	},
	switchTurnIndicator: function () {
		// If board is NOT disabled, the game is on, so player turns should be displayed
		if (!gameBoard.DOM.classList.contains("disabled")) {
			// Depending on the current symbol, it basically switches it to the other
			if (gameBoard.currentSymbol === "x") {
				playerInfo.player.classList.add("turn-indicator");
				playerInfo.opponent.classList.remove("turn-indicator");
			} else {
				playerInfo.player.classList.remove("turn-indicator");
				playerInfo.opponent.classList.add("turn-indicator");
			}
		} else {
			// If board is disabled, no turn to play, so turn visuals should not be displayed
			this.disableTurnIndicator();
		}
	},
	disableTurnIndicator: function () {
		playerInfo.player.classList.remove("turn-indicator");
		playerInfo.opponent.classList.remove("turn-indicator");
	},
	displayResult: function (result) {
		// "results-none" is used to facilitate font-size animation, it is there when the results are not yet displayed
		playerInfo.resultDOM.classList.remove("results-none");
		// "game-result" class itself is useless, its purpose is to be used alongside "win", "lose", "draw". For example: "game-result win"
		playerInfo.resultText.classList.add("game-result");
		let gameResultText;
		if (result === "x") {
			playerInfo.resultText.classList.add("win");
			gameResultText = `${playerInfo.player.textContent} wins!`;
			playerInfo.resultIcon.classList.add("fa-trophy");
		} else if (result === "o") {
			if (playerInfo.opponent.textContent === "Computer") {
				playerInfo.resultText.classList.add("lose");
				playerInfo.resultIcon.classList.add("fa-heart-broken");
			} else {
				playerInfo.resultText.classList.add("win");
				playerInfo.resultIcon.classList.add("fa-trophy");
			}
			gameResultText = `${playerInfo.opponent.textContent} wins!`;
		} else if (result === "draw") {
			playerInfo.resultText.classList.add("draw");
			playerInfo.resultIcon.classList.add("fa-grip-lines");
			gameResultText = "It's a draw!";
		}
		playerInfo.resultText.textContent = gameResultText;
	},
	highlightWinningPattern: function (pattern) {
		// pattern parameter may be "undefined" because the result may be a draw, so when this is called, it will only run if there is a truthy pattern provided
		if (pattern) {
			pattern.forEach((index) => {
				gameBoard.boxes[index].classList.add("winner-animation");
			});
		}
	},
	disableWinningHighlight: function () {
		gameBoard.DOM.querySelectorAll(".winner-animation").forEach((node) => {
			node.classList.remove("winner-animation");
		});
	}
};
displayController.init();

// Player Info Module
const playerInfo = {
	init: function () {
		this.DOM = document.querySelector(".player-info");
		this.player = this.DOM.querySelector("#player");
		this.opponent = this.DOM.querySelector("#opponent");
		this.modeSwitchBtns = this.DOM.querySelectorAll(".player-container i");
		this.editableInputs = [this.player];
		this.resultDOM = this.DOM.querySelector(".results");
		this.resultIcon = this.DOM.querySelector("#resultIcon");
		this.resultText = this.DOM.querySelector("#result");
		this.publishEvents();
		events.on("startGameClicked", this.gameModeHandler.bind(this));
		events.on(
			"gameModeChanged",
			function (targetID) {
				this.switchMode(targetID);
			}.bind(this)
		);
	},
	gameModeHandler: function () {
		let gameMode;
		const player = playerFactory(this.player.textContent);
		const opponent = playerFactory(this.opponent.textContent);
		if (!(opponent.playerName === "Computer")) {
			player.playerName = player.playerName ? player.playerName : "Player 1";
			opponent.playerName = opponent.playerName ? opponent.playerName : "Player 2";

			gameMode = "pvp";
			gameBoard.gameMode = "pvp";
		} else if (opponent.playerName === "Computer") {
			player.playerName = player.playerName ? player.playerName : "Player";

			computer.init();

			gameMode = "pvpc";
			gameBoard.gameMode = "pvpc";
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
	switchMode: function () {
		let currentOpponent = this.opponent.textContent;
		this.opponent.textContent = currentOpponent === "Computer" ? "Player 2" : "Computer";
		if (this.opponent.textContent === "Player 2") {
			this.opponent.setAttribute("contenteditable", "true");
			// If the current mode selection is Player 2, add it to editableInputs array
			this.editableInputs.push(this.opponent);
		} else {
			this.opponent.setAttribute("contenteditable", "false");
			// If the current mode is Computer, remove index 1 element from editableInputs array
			this.editableInputs.splice(1, 1);
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
