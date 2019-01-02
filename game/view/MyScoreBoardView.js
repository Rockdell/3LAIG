/**
 * MyScoreBoardView
 */
class MyScoreBoardView extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;

        this.appearances = [];

        for (let i = 0; i <= 10; i++) {
            let tex = new CGFtexture(this.scene, `../scenes/images/number${i}.png`);
            this.app = new CGFappearance(this.scene);
            this.app.setTexture(tex);

            this.appearances.push(this.app);
        }

        this.scoreCell = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
    }

    applyAppearance(digit) {
        if (digit == ":")
            this.appearances[10].apply();
        else
            this.appearances[digit].apply();
    }

    display(ScoreBoardModel) {
        this.scene.pushMatrix();

            this.scene.translate(ScoreBoardModel.x, ScoreBoardModel.y, ScoreBoardModel.z);
            let time = ScoreBoardModel.getTimeArray();

            for (let i = 0; i < time.length; i++) {
                this.applyAppearance(time[i]);
                this.scene.translate(1, 0, 0);
                this.scoreCell.display();
            }

        this.scene.popMatrix();
    }
}