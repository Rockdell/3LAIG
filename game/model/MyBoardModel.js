/**
 * MyBoardModel
 */
class MyBoardModel {

    constructor(boardLength) {
        this.boards = [];
        this.boardLength = boardLength;
    }

    getBoard() {
        return this.boards[this.boards.length - 1];
    }

    update(newBoard) {
        this.boards.push(newBoard);
    }

    removePiece() {
        this.boards.pop();
    }
}