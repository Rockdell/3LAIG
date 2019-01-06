/**
 * MyPiecesSupportView
 */
class MyPiecesSupportView {

    constructor(scene) {
        this.scene = scene;
        this.piecesSupport = new MyRectangle(scene, -0.5, -0.4, 0.5, 0.4);

        let supportTexture = new CGFtexture(this.scene, "../scenes/images/chair.jpg");
        this.supportAppearance = new CGFappearance(this.scene);
        this.supportAppearance.setTexture(supportTexture);
    }

    display() {
        
        //Template Pieces Support
        this.supportAppearance.apply();
        this.scene.pushMatrix();
            this.scene.translate(0, 0, MyGameModel.getInstance().boardModel.boardLength / 2.0 - (MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length) / 2.0, 1);

            this.scene.pushMatrix();
                this.scene.translate(-1, 0, 0.5, 1);
                this.scene.rotate(Math.PI, 0, 1, 0);
                this.piecesSupport.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-1, 0, 0.5 + MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length, 1);
                this.piecesSupport.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-0.5, 0, 0.5 + (MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length) / 2.0, 1);
                this.scene.rotate(Math.PI / 2.0, 0, 1, 0);
                this.scene.scale(MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length, 1, 1);
                this.piecesSupport.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-1.5, 0, 0.5 + (MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length) / 2.0, 1);
                this.scene.rotate(-Math.PI / 2.0, 0, 1, 0);
                this.scene.scale(MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length, 1, 1);
                this.piecesSupport.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-1, 0.4, 0.5 + (MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length) / 2.0, 1);
                this.scene.rotate(-Math.PI / 2.0, 0, 1, 0);
                this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);
                this.scene.scale(MyGameModel.getInstance().templatePiecesModels.length + 0.25 * MyGameModel.getInstance().templatePiecesModels.length, 1/0.8, 1);
                this.piecesSupport.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }
}
