/**
 * MyScoreBoardView
 */
class MyScoreBoardView extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;

        this.appearances = [];

        for (let i = 0; i <= 11; i++) {
            let tex = new CGFtexture(this.scene, `../scenes/images/number${i}.png`);
            this.app = new CGFappearance(this.scene);
            this.app.setTexture(tex);

            this.appearances.push(this.app);
        }

        let supportTex = new CGFtexture(this.scene, '../scenes/images/scoreBoardSupport.png');
        this.supportApp = new CGFappearance(this.scene);
        this.supportApp.setTexture(supportTex);

        this.scoreCell = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
        this.lateralLeftSupport = new MyTriangle(scene, 0.59, -0.81, 0.0, 0.59, 0.81, 0.0, -0.59, -0.81, 0.0, 1.0, 1.0);
        this.lateralRightSupport = new MyTriangle(scene, -0.59, -0.81, 0.0, 0.59, 0.81, 0.0, 0.59, -0.81, 0.0, 1.0, 1.0);
        this.backSupport = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
    }

    applyAppearance(digit) {
        if (digit == ":")
            this.appearances[10].apply();
        else if (digit == "..")
            this.appearances[11].apply();
        else
            this.appearances[digit].apply();
    }

    display(ScoreBoardModel) {
        
        this.scene.pushMatrix();

            this.scene.translate(ScoreBoardModel.x, ScoreBoardModel.y, ScoreBoardModel.z);

            this.scene.pushMatrix();
                this.supportApp.apply();
                this.scene.translate(0.29, 0.7, 2.5);
                this.lateralLeftSupport.display();
                this.scene.translate(0, 0, -5);
                this.lateralRightSupport.display();
            this.scene.popMatrix();

            this.scene.rotate(-Math.PI / 2.0, 0, 1, 0);

            this.scene.pushMatrix();
                this.supportApp.apply();
                this.scene.translate(0, 0.7, -0.88);
                this.scene.rotate(Math.PI, 0, 1, 0);
                this.scene.scale(5, 1.62, 1);
                this.backSupport.display();
            this.scene.popMatrix();

            this.scene.translate(-3, 0.3, 0);
            this.scene.rotate(-Math.PI / 5.0, 1, 0, 0);
            
            let time = ScoreBoardModel.getTimeArray();
            for (let i = 0; i < time.length; i++) {
                this.applyAppearance(time[i]);
                this.scene.translate(1, 0, 0);
                this.scoreCell.display();
            }

            this.scene.translate(-5, 1, 0);
            let gamesWon = ScoreBoardModel.getGamesWonArray();
            for (let i = 0; i < gamesWon.length; i++) {
                this.applyAppearance(gamesWon[i]);
                this.scene.translate(1, 0, 0);
                this.scoreCell.display();
            }

        this.scene.popMatrix();
    }
}