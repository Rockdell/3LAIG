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
            this.pov = { player: 'b', target: Math.PI, angle: Math.PI };
            MyGameView.instance = this;
        }
    }

    static getInstance() {
        return MyGameView.instance;
    }

    rotateCamera() {

        if (this.pov.angle === this.pov.target) return;

        let angle = this.pov.angle > this.pov.target ? - Math.PI / 100 : Math.PI / 100;

        if (this.pov.angle > this.pov.target) {
            if (this.pov.angle + angle < this.pov.target) angle = this.pov.target - this.pov.angle;
        } else {
            if (this.pov.angle + angle > this.pov.target) angle = this.pov.target - this.pov.angle;
        }

        this.scene.camera.orbit(CGFcameraAxis.Y, angle);
        this.pov.angle += angle;
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

        if (!MyGameModel.getInstance().gameOver && 
            MyGameModel.getInstance().piecesModels.length > 0 && 
            MyGameModel.getInstance().piecesModels[MyGameModel.getInstance().piecesModels.length - 1].animation == null) {
            for (let index in MyGameModel.getInstance().validMovesModels[MyGameModel.getInstance().validMovesModels.length - 1]) {
                this.moveView.display(MyGameModel.getInstance().validMovesModels[MyGameModel.getInstance().validMovesModels.length - 1][index]);
            }
        }

        if (MyGameController.getInstance().replayPlaying)
            this.pov.target = Math.PI / 2;
        else
            this.pov.target = MyGameModel.getInstance().currentPlayer === 'b' ? Math.PI : 0;

        this.rotateCamera();
    }
}
