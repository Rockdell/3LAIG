/**
 * MyBoard
 */
class MyBoard extends CGFobject {

    constructor(scene, sideLength) {
        super(scene);

        this.scene = scene;
        this.sideLength = sideLength;
        this.cellTexture = new CGFtexture(this.scene, "../scenes/images/cell.png");

        this.boardCell = new MyRectangle(scene, 0, -1, 1, 0);
    }

    
    display() {
        this.scene.pushMatrix();
            this.cellTexture.bind();

            this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);

            for (let i = 0; i < this.sideLength; i++) {
                for (let j = 0; j < this.sideLength; j++) {
                    this.scene.pushMatrix();
                        this.scene.translate(i, -j, 0);
                        this.boardCell.display();
                    this.scene.popMatrix();
                }
            }

        this.scene.popMatrix();
    }
}