
//idtexture, idheightmap, parts heightscale

class MyTerrain extends MyPlane {

    constructor(scene, idTexture, idHeightMap, parts, heigthScale) {
        super(scene, parts, parts);

        this.idTexture = idTexture;
        this.idHeightMap = idHeightMap
        this.heigthScale = heigthScale;

        this.texture = scene.displayTextures[idTexture];
        this.shader = null;

        this.initShaders();
    }

    initShader() {
        this.shader = new CGFshader(this.gl, ".vert", ".frag");
        this.shader.setUniformsValues({uSampler2: this.heigthScale});
    }

    display() {
        this.scene.setActiveShader(this.shader);
        this.nurbs.display();            
        this.scene.setActiveShader(this.defaultShader);
    }
}