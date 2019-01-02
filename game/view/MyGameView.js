/**
 * MyGameView
 */
class MyGameView {

    constructor(scene) {

        if (!MyGameView.instance) {
            this.scene = scene;
            this.boardView = new MyBoardView(scene);
            this.pieceView = new MyPieceView(scene);
            this.scoreBoardView = new MyScoreBoardView(scene);
            this.moveView = new MyMoveView(scene);
            MyGameView.instance = this;
        }
    }

    static getInstance() {
        return MyGameView.instance;
    }

    display() {

        this.boardView.display(MyGameModel.getInstance().boardModel);

        this.scoreBoardView.display(MyGameModel.getInstance().scoreBoardModel);

        //Update template pieces color
        MyGameModel.getInstance().updateTemplatePiecesColor();
        for (let index in MyGameModel.getInstance().templatePiecesModels) {
            this.pieceView.display(MyGameModel.getInstance().templatePiecesModels[index]);
        }

        for (let index in MyGameModel.getInstance().piecesModels) {
            this.pieceView.display(MyGameModel.getInstance().piecesModels[index]);
        }

        if (MyGameModel.getInstance().piecesModels.length > 0 && MyGameModel.getInstance().piecesModels[MyGameModel.getInstance().piecesModels.length - 1].animation == null) {
            for (let index in MyGameModel.getInstance().validMovesModels[MyGameModel.getInstance().validMovesModels.length - 1]) {
                this.moveView.display(MyGameModel.getInstance().validMovesModels[MyGameModel.getInstance().validMovesModels.length - 1][index]);
            }
        }
    }
}
