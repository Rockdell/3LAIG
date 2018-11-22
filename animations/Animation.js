/**
 * Animation
 */
class Animation {

    constructor(scene, span) {
        this.scene = scene;
        this.span = span;
        this.animating = false;
        //this.finalMatrixApplied = false;
        this.total_time = 0;
        this.transfMatrix = mat4.create();
    }

    scaleVector(v, s) {
        vec3.scale(v,v,s);
    }

    translateMatrix(m, v) {
        mat4.translate(m, m, v);
    }

    rotateYMatrix(m, r) {
        mat4.rotateY(m, m, r);
    }

    update(secondsElapsed) {
        console.error("Animation: Shouldn't be calling this function!");
    }

    apply() {

        /* if(this.finalMatrixApplied)
            return;

        if(!this.animating)
            this.finalMatrixApplied = true; */

        if (!this.animating)
            return;

        this.scene.multMatrix(this.transfMatrix);
    }

}
