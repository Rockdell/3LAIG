/**
 * Animation
 */
class Animation {

	constructor(scene) {
        this.scene = scene;
        this.transfMatrix = mat4.create();
    }
    
    /* update(tm) {
        this.transfMatrix = tm;
    } */

    apply() {
        this.scene.multMatrix(this.transfMatrix);
    }
    
}
