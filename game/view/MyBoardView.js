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

        let supportTexture = new CGFtexture(this.scene, "../scenes/images/boardSupport.png");
        this.supportAppearance = new CGFappearance(this.scene);
        this.supportAppearance.setTexture(supportTexture);

        let selectedCellTexture = new CGFtexture(this.scene, "../scenes/images/selectedCell.png");
        this.selectedAppearance = new CGFappearance(this.scene);
        this.selectedAppearance.setTexture(selectedCellTexture);

        this.boardCell = new MyRectangle(scene, 0, -1, 1, 0);

        this.coffeeMug = new MyCoffeeMug(this.scene);
    }

    display(BoardModel) {
        this.scene.pushMatrix();
      
            this.scene.translate(0, -0.1, 0);
            // this.coffeeMug.display();            
            
            this.scene.translate(0.5, 0, 0.5);


            this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);

          

            this.scene.pushMatrix();
                this.supportAppearance.apply();
                this.scene.scale(1, 1, 0.5, 1);
                this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);
                
                for (let j = 0; j < 4; j++) {
                    if(j != 0)
                        this.scene.rotate(Math.PI / 2.0, 0, 1, 0);

                        for (let i = 0; i < BoardModel.boardLength; i++) {
                            if(i != 0)
                                this.scene.translate(1, 0, 0);

                            this.boardCell.display();
                        }

                    this.scene.translate(1, 0, 0);
                }
            this.scene.popMatrix();

            this.scene.translate(0, 0, 0.5, 1);
            for (let i = 0; i < BoardModel.boardLength; i++) {
                for (let j = 0; j < BoardModel.boardLength; j++) {
                    this.scene.registerForPick((i + 1) + "" + (j + 1), this.boardCell);

                    if (BoardModel.selectedCell == ((i + 1) + "" + (j + 1)))
                        this.selectedAppearance.apply();
                    else
                        this.appearance.apply();

                    this.scene.pushMatrix();
                        this.scene.translate(i, -j, 0);
                        this.boardCell.display();
                    this.scene.popMatrix();
                }
            }

        this.scene.popMatrix();
    }
}