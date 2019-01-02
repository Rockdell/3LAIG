/**
 * MyBoardView
 */
class MyBoardView extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;

        let cellTexture = new CGFtexture(this.scene, "../scenes/images/cell.png");
        this.appearance = new CGFappearance(this.scene);
        this.appearance.setTexture(cellTexture);

        this.boardCell = new MyRectangle(scene, 0, -1, 1, 0);
    }

    display(BoardModel) {
        this.scene.pushMatrix();

            this.appearance.apply();

            this.scene.translate(0.5, 0, 0.5);
            this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);

            for (let i = 0; i < BoardModel.boardLength; i++) {
                for (let j = 0; j < BoardModel.boardLength; j++) {
                    this.scene.registerForPick((i + 1) + "" + (j + 1), this.boardCell);

                    this.scene.pushMatrix();
                        this.scene.translate(i, -j, 0);
                        this.boardCell.display();
                    this.scene.popMatrix();
                }
            }

        this.scene.popMatrix();
    }
}