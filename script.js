/** @format */

// Game Board Module
const gameBoard = {
	init: function () {
		this.board = this.createBoard();
	},
	createBoard: function () {
		return ["x", "o", false, "o", "x", "o", false, "o", "x"];
	}
};
gameBoard.init();

// Display Controller Module
const displayController = {
	init: function () {
		this.playerInfo = document.querySelector(".player-info");
		this.board = document.querySelector(".game-board");
		this.displayBoard();
	},
	displayBoard: function () {
		gameBoard.board.forEach((content) => {
			let gameBox = document.createElement("div");
			gameBox.classList.add("game-box");
			let gameBoxContent = document.createElement("p");
			gameBoxContent.textContent = content ? content : "";
			gameBox.appendChild(gameBoxContent);
			this.board.appendChild(gameBox);
		});
		this.boxes = this.board.querySelectorAll(".game-box");
		console.log(this.boxes);
	},
	displayPlayer: function (player) {
		let playerDOM = this.playerInfo.querySelector("#player");
		playerDOM.textContent = player.playerName;
	},
	displayOpponent: function (opponent) {
		let opponentDOM = this.playerInfo.querySelector("#opponent");
		opponentDOM.textContent = opponent ? opponent : "Computer22";
	},
	setPlayerInput: function () {
		return;
	}
};
displayController.init();

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};

const player = playerFactory("James");
displayController.displayPlayer(player);
displayController.displayOpponent();
