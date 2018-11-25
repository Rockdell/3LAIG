/**
 * MyTerrain
 */
class MyTerrain extends MyPlane {

    constructor(scene, idTexture, idHeightMap, parts, heightScale) {
        super(scene, parts, parts);

        this.idTexture = idTexture;
        this.idHeightMap = idHeightMap
        this.heightScale = heightScale;

        this.texture = scene.graph.displayTextures[idTexture];
        this.heightmap = scene.graph.displayTextures[idHeightMap];
        this.shader = null;

        this.shader = new CGFshader(this.scene.gl, "../shaders/terrain.glsl", "../shaders/fragment.glsl");
        this.shader.setUniformsValues({uSampler2: 1, uHeightScale: this.heightScale});
    }

    display() {
        this.texture.bind();
        this.heightmap.bind(1);
        this.scene.setActiveShader(this.shader);

        this.nurbs.display();
        
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}