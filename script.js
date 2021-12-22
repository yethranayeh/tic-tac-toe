/** @format */

// Game Board Module
const gameBoard = {
	init: function () {
		this.createBoard();
	},
	createBoard: function () {
		console.log("Create Board");
		return;
	}
};
gameBoard.init();

// Display Controller Module
const displayController = {};

// Player Factory
const playerFactory = (playerName) => {
	return { playerName };
};

const player = playerFactory("James");
console.log(player.playerName);
