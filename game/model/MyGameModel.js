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
            this.gameOver = true;
            this.timer = 30;

            // Models
            this.boardModel = new MyBoardModel();
            this.scoreBoardModel = new MyScoreBoardModel();
            this.templatePiecesModels = [];
            this.piecesModels = [];
            this.validMovesModels = [];

            // Default settings
            this.updateBoardSettings(5, 4)
            this.updateTimer(this.timer);
            
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

        this.boardModel.boardLength = boardLength || this.boardModel.boardLength;
        this.consecutive = consecutive || this.consecutive;

        this.scoreBoardModel.setPosition(this.boardModel.boardLength + 2, 0, this.boardModel.boardLength / 2.0 + 0.5);

        this.cz = (this.boardModel.boardLength - 5) / 2 + 0.625 + 0.5;

        this.templatePiecesModels = [
            new MyPieceModel(-1, this.cz, "v", "b", 1),
            new MyPieceModel(-1, this.cz + 1.25, "h", "b", 2),
            new MyPieceModel(-1, this.cz + 2.50, "du", "b", 3),
            new MyPieceModel(-1, this.cz + 3.75, "dd", "b", 4),
        ];

        this.piecesModels = [];
        this.validMovesModels = [];
    }

    updateTimer(timer) {
        this.timer = timer || this.timer;
        this.scoreBoardModel.setTimer(this.timer);
    }

    updateGameSettings(b, o) {
        this.b = b;
        this.o = o;
        this.currentPlayer = 'b';
        this.gameOver = true;
    }

    addPiece(move) {
        let moveInfo = move.match(/[^pmove(]([^)]+)/g)[0].split(',');

        let newZ;
        switch (moveInfo[2]) {
            case "v":
                newZ = this.cz;
                break;
            case "h":
                newZ = this.cz + 1.25;
                break;
            case "du":
                newZ = this.cz + 2.50;
                break;
            case "dd":
                newZ = this.cz + 3.75;
                break;
        }

        // this.setTemplateVisiblity(moveInfo[2], false);
        this.setTemplateVisiblity(moveInfo[2], true);

        let nextPiece = new MyPieceModel(-1, newZ, moveInfo[2], this.currentPlayer);
        nextPiece.moveTo(parseInt(moveInfo[0]) + 1, parseInt(moveInfo[1]) + 1);
        this.piecesModels.push(nextPiece);
    }

    removePiece() {
        this.piecesModels.pop();
    }

    addValidMoves(moves) {

        let currentValidMoves = [];

        let validMoves = moves.match(/(\d,\d)/g).filter(function(elem, index, self) { return index === self.indexOf(elem)});
        validMoves.forEach(move => {
            currentValidMoves.push(new MyMoveModel(move));
        });

        this.validMovesModels.push(currentValidMoves);
    }

    removeValidMoves() {
        this.validMovesModels.pop();
    }
    
    updateTemplatePiecesColor() {
        this.templatePiecesModels.forEach((element) => {
            element.setColor(this.currentPlayer);
        })
    }

    setTemplateVisiblity(direction, isVisible) {

        let index;
        switch (direction) {
            case "v":
                index = 0;
                break;
            case "h":
                index = 1;
                break;
            case "du":
                index = 2;
                break;
            case "dd":
                index = 3;
                break;
        }

        if (isVisible) {
            this.templatePiecesModels[index].scale(0, 1);
        }

        this.templatePiecesModels[index].setVisible(isVisible);  
    }
}