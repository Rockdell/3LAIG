/**
 * MyMoveView
 */
class MyMoveView {

    constructor(scene) {
        this.scene = scene;
        this.sphere = new MySphere(scene, 0.1, 10, 10);
    }

    display(MoveModel) {

        MyGameModel.getInstance().currentPlayer == "o" ? MyGameView.getInstance().pieceView.appearanceBotOrange.apply() :  MyGameView.getInstance().pieceView.appearanceBotBrown.apply();

        this.scene.pushMatrix();
            this.scene.translate(MoveModel.x, 0.2, MoveModel.z);
            this.sphere.display();
        this.scene.popMatrix();
    }
}
