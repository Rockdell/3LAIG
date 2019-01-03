/**
 * MyPieceView
 */
class MyPieceView extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;

        let pieceBotTextureOrange = new CGFtexture(this.scene, "../scenes/images/orangePieceBot.png");
        this.appearanceBotOrange = new CGFappearance(this.scene);
        this.appearanceBotOrange.setTexture(pieceBotTextureOrange);

        let pieceBotTextureBrown = new CGFtexture(this.scene, "../scenes/images/brownPieceBot.png");
        this.appearanceBotBrown = new CGFappearance(this.scene);
        this.appearanceBotBrown.setTexture(pieceBotTextureBrown);

        let pieceTopTextureOrange = new CGFtexture(this.scene, "../scenes/images/orangePieceTop.png");
        this.appearanceTopOrange = new CGFappearance(this.scene);
        this.appearanceTopOrange.setTexture(pieceTopTextureOrange);

        let pieceTopTextureBrown = new CGFtexture(this.scene, "../scenes/images/brownPieceTop.png");
        this.appearanceTopBrown = new CGFappearance(this.scene);
        this.appearanceTopBrown.setTexture(pieceTopTextureBrown);

        let selectedPieceTop = new CGFtexture(this.scene, "../scenes/images/selectedPieceTop.png");
        this.selectedTopAppearance = new CGFappearance(this.scene);
        this.selectedTopAppearance.setTexture(selectedPieceTop);

        let selectedPieceBot = new CGFtexture(this.scene, "../scenes/images/selectedPieceBot.png");
        this.selectedBotAppearance = new CGFappearance(this.scene);
        this.selectedBotAppearance.setTexture(selectedPieceBot);

        this.halfPiece = new CGFnurbsObject(this.scene, 30, 30, this.generateSurface());
    }

    generateSurface() {

        let uParts = 20;

        let controlVertexes = [];

        var alpha = Math.PI / uParts;

        for (let u = 0; u <= uParts; u++) {
            let tmp = [];

            tmp.push([-Math.cos(u * alpha), 0, Math.sin(u * alpha), 1]);

            let tmp2 = Math.PI / 6;

            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(0 * tmp2), Math.cos(0 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(1 * tmp2), Math.cos(1 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(2 * tmp2), Math.cos(2 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(3 * tmp2), Math.cos(3 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(4 * tmp2), Math.cos(4 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(5 * tmp2), Math.cos(5 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(6 * tmp2), Math.cos(6 * tmp2) * Math.sin(u * alpha), 1]);

            tmp.push([-Math.cos(u * alpha), 0, -Math.sin(u * alpha), 1]);

            controlVertexes.push(tmp);
        }

        return new CGFnurbsSurface(uParts, 8, controlVertexes);
    }

    display(PieceModel) {

        if(PieceModel.show) {

            this.scene.pushMatrix();

                if (PieceModel.pickingID != null)
                    this.scene.registerForPick(PieceModel.pickingID, this.halfPiece);
                else 
                    this.scene.registerForPick("", this.halfPiece);

                let direction;
                switch (PieceModel.direction) {
                    case "v":
                        direction = 0;
                        break;
                    case "h":
                        direction = Math.PI / 2.0;
                        break;
                    case "du":
                        direction = - Math.PI / 4.0;
                        break;
                    case "dd":
                        direction = Math.PI / 4.0;
                        break;
                }

                if (PieceModel.animation != null)
                    PieceModel.animation.apply();
                else
                    this.scene.translate(PieceModel.x, 0.1, PieceModel.z);

                this.scene.rotate(direction, 0, 1, 0);
                this.scene.scale(0.5, 0.5, 0.5);

                this.scene.pushMatrix();
                
                    if(!PieceModel.selected)
                        PieceModel.color == "o" ? this.appearanceTopOrange.apply() : this.appearanceTopBrown.apply();
                    else
                        this.selectedTopAppearance.apply();

                    this.halfPiece.display();
                this.scene.popMatrix();

                this.scene.pushMatrix();

                    if(!PieceModel.selected)
                        PieceModel.color == "o" ? this.appearanceBotOrange.apply() : this.appearanceBotBrown.apply();
                    else
                        this.selectedBotAppearance.apply();

                    this.scene.rotate(Math.PI, 1, 0, 0);
                    this.halfPiece.display();

                this.scene.popMatrix();
                
            this.scene.popMatrix();
        }
    }
}