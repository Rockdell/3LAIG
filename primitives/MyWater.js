class MyWater extends MyPlane {

    constructor(scene, idTexture, idWaveMap, parts, heigthScale, texScale) {
        super(scene, parts, parts);

        this.idTexture = idTexture;
        this.idHeightMap = idWaveMap
        this.heigthScale = heigthScale;
        this.texScale = texScale;

        this.texture = scene.graph.displayTextures[idTexture];
        this.wavemap = scene.graph.displayTextures[idWaveMap];
        this.initialTime = Date.now();
        this.shader = null;

        this.initShaders();
    }

    initShaders() {
        this.shader = new CGFshader(this.scene.gl, "../shaders/water.glsl", "../shaders/fragment.glsl");
        this.shader.setUniformsValues({uSampler2: 1, uHeightScale: this.heigthScale, uTexScale: this.texScale});
    }

    display() {
        this.texture.bind();
        this.wavemap.bind(1);
        this.scene.setActiveShader(this.shader);

        let currentTime = (Date.now() - this.initialTime) / (1000 * 5);
        this.shader.setUniformsValues({uTimeScale: currentTime});
        this.nurbs.display();
        
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}