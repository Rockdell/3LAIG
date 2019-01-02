/**
 * MyBoardModel
 */
class MyBoardModel {

    constructor(boardLength) {
        this.board = null;
        this.boardLength = boardLength;
    }

    update(newBoard) {
        this.board = newBoard;
    }
}