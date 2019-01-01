/**
 * MyGameView
 */
class MyGameView {

    constructor(scene) {

        if (!MyGameView.instance) {
            this.scene = scene;
            this.boardView = new MyBoardView(scene);
            this.pieceView = new MyPieceView(scene);
            MyGameView.instance = this;
        }

        //Default Board Size
        // this.boardSize = 5;
        // this.board = new MyBoard(scene, this.boardSize);

        // this.pieceID = {
        //     TOV: 0,
        //     TOH: 1,
        //     TODU: 2,
        //     TODD: 3,
        //     TBV: 4,
        //     TBH: 5,
        //     TBDU: 6,
        //     TBDD: 7,
        // };

        // this.orangeTemplatePieces = [
        //     this.pieceTemplateVertical = new MyPiece(scene, "v", "orange", this.pieceID.TOV),
        //     this.pieceTemplateHorizontal = new MyPiece(scene, "h", "orange", this.pieceID.TOH),
        //     this.pieceTemplatDiagUp = new MyPiece(scene, "du", "orange", this.pieceID.TODU),
        //     this.pieceTemplateDiagDown = new MyPiece(scene, "dd", "orange", this.pieceID.TODD)
        // ];

        // this.brownTemplatePieces = [
        //     this.pieceTemplateVertical = new MyPiece(scene, "v", "brown", this.pieceID.TBV),
        //     this.pieceTemplateHorizontal = new MyPiece(scene, "h", "brown", this.pieceID.TBH),
        //     this.pieceTemplatDiagUp = new MyPiece(scene, "du", "brown", this.pieceID.TBDU),
        //     this.pieceTemplateDiagDown = new MyPiece(scene, "dd", "brown", this.pieceID.TBDD)
        // ];
    }

    static getInstance() {
        return MyGameView.instance;
    }

    display() {

        // if (this.boardView == null)
        //     this.boardView = new MyBoardView(this.scene, GameModel.currentBoardLength);

        this.boardView.display(MyGameModel.getInstance().boardModel);

        for (let index in MyGameModel.getInstance().templatePiecesModels) {
            this.pieceView.display(MyGameModel.getInstance().templatePiecesModels[index]);
        }

        for (let index in MyGameModel.getInstance().piecesModels) {
            this.pieceView.display(MyGameModel.getInstance().piecesModels[index]);
        }

        // this.scene.pushMatrix();
        //     this.scene.translate(-3, 0, this.boardSize / 2.0 - 3.75, 1);
        //     this.orangeTemplatePieces.forEach((piece) => {
        //             this.scene.translate(0, 0, 1.3, 1);
        //             piece.display();
        //         });
        // this.scene.popMatrix();

        // this.scene.pushMatrix();
        //     this.scene.translate(this.boardSize + 2, 0, this.boardSize / 2.0 - 3.75, 1);
        //     this.brownTemplatePieces.forEach((piece) => {
        //             this.scene.translate(0, 0, 1.3, 1);
        //             piece.display();
        //         });
        // this.scene.popMatrix();

        // this.board.display();
    }
}
