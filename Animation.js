/**
 * Animation
 */
class Animation {

	constructor(scene) {
        this.scene = scene;
        this.transfMatrix = null;
    }
    
    update(tm) {
        this.transfMatrix = tm;
    }

    apply() {
        this.scene.multMatrix(this.transfMatrix);
    }
    
}
