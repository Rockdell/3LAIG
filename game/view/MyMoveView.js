/**
 * MyMoveView
 */
class MyMoveView {

    constructor(scene) {
        this.scene = scene;
        this.sphere = new MySphere(scene, 0.1, 10, 10);
    }

    display(MoveModel) {
        this.scene.pushMatrix();
            this.scene.translate(MoveModel.x, 0.2, MoveModel.z);
            this.sphere.display();
        this.scene.popMatrix();
    }
}
