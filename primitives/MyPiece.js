/**
 * MyPiece
 */
class MyPiece extends CGFobject {

    constructor(scene, direction) {
        super(scene);

        this.scene = scene;
        
        switch(direction) {
            case "v":
                this.direction = 0;
            break;
            case "h":
                this.direction = Math.PI / 2.0;
            break;
            case "du":
                this.direction = - Math.PI / 4.0;
            break;
            case "dd":
                this.direction = Math.PI / 4.0;
            break;
        }

        this.pieceTexture = new CGFtexture(this.scene, "../scenes/images/piece.png");
        this.pieceBotTexture = new CGFtexture(this.scene, "../scenes/images/pieceBot.png")
        this.heightMap = new CGFtexture(this.scene, "../scenes/images/pieceHeightMap.png");

        this.topDisk = new CGFnurbsObject(this.scene, 30, 30, this.generateSurface());

        this.shader = new CGFshader(this.scene.gl, "../shaders/pieceVertex.glsl", "../shaders/fragment.glsl");
        this.shader.setUniformsValues({uSampler2: 1});
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
    
    display() {

        this.scene.pushMatrix();

            this.scene.translate(0.5, 0.2, 0.5);
            this.scene.rotate(this.direction, 0, 1, 0);
            this.scene.scale(0.5, 0.5, 0.5);

            this.pieceBotTexture.bind();

            this.scene.pushMatrix();
                this.scene.rotate(Math.PI, 1, 0, 0);
                this.topDisk.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
                this.pieceTexture.bind();
                this.heightMap.bind(1);

                this.scene.setActiveShader(this.shader);
                    this.topDisk.display();
                this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.popMatrix();

        this.scene.popMatrix();
    }
}