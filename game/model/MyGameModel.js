/**
 * MyGameModel
 */
class MyGameModel {

    constructor() {

        if (!MyGameModel.instance) {

            // Game Logic
            this.consecutive = null;
            this.b = null;
            this.o = null;
            this.currentPlayer = null;
            this.gameStarted = false;
            this.gameOver = false;

            // Models
            this.boardModel = new MyBoardModel();
            this.scoreBoardModel = new MyScoreBoardModel(0, 5, 0, 63);
            this.templatePiecesModels = [];
            this.piecesModels = [];

            // Default settings
            this.updateBoardSettings(5, 4)
            this.updateGameSettings('user', 'user');

            MyGameModel.instance = this;
        }
    }

    static getInstance() {
        return MyGameModel.instance;
    }
    
    getLastMove() {
        if (this.piecesModels.length === 0) {
            return 'pmove(_,_,_)';
        } else {
            let lastMove = this.piecesModels[this.piecesModels.length - 1];
            return `pmove(${lastMove.xf - 1},${lastMove.zf - 1},${lastMove.direction})`;
        }
    }

    updateBoardSettings(boardLength, consecutive) {

        console.log(boardLength + " + " + consecutive);

        this.boardModel.boardLength = boardLength || this.boardModel.boardLength;
        this.consecutive = consecutive || this.consecutive;

        console.log(this.boardModel.boardLength + " + " + this.consecutive);

        let cx = (this.boardModel.boardLength - 5) / 2 + 0.625 + 0.5;
        this.templatePiecesModels = [
            new MyPieceModel(cx, this.boardModel.boardLength + 1.5, "v", "b", 1),
            new MyPieceModel(cx + 1.25, this.boardModel.boardLength + 1.5, "h", "b", 2),
            new MyPieceModel(cx + 2.50, this.boardModel.boardLength + 1.5, "du", "b", 3),
            new MyPieceModel(cx + 3.75, this.boardModel.boardLength + 1.5, "dd", "b", 4),
            new MyPieceModel(cx + 3.75, -0.5, "v", "o", 1),
            new MyPieceModel(cx + 2.50, -0.5, "h", "o", 2),
            new MyPieceModel(cx + 1.25, -0.5, "du", "o", 3),
            new MyPieceModel(cx, -0.5, "dd", "o", 4)
        ];

        this.piecesModels = [];
    }

    updateGameSettings(b, o) {
        this.b = b;
        this.o = o;
        this.currentPlayer = 'b';
        this.gameStarted = false;
        this.gameOver = false;          //TODO Change later - player may not change game settings b4 starting new game
    }

    addPiece(move) {
        let moveInfo = move.match(/[^pmove(]([^)]+)/g)[0].split(',');

        // this.piecesModels.push(new MyPieceModel(parseInt(moveInfo[0]) + 1, parseInt(moveInfo[1]) + 1, moveInfo[2], this.currentPlayer))
        let nextPiece = new MyPieceModel(0, 0, moveInfo[2], this.currentPlayer);
        nextPiece.moveTo(parseInt(moveInfo[0]) + 1, parseInt(moveInfo[1]) + 1);
        this.piecesModels.push(nextPiece);
    }

    removePiece() {
        this.piecesModels.pop();
    }

}