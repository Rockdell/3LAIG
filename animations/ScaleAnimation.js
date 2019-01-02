/**
 * ScaleAnimation
 */
class ScaleAnimation extends Animation {

    constructor(scene, span, xf, yf, zf, initialScale, endScale) {

        super(scene, span);

        this.xf = xf;
        this.yf = yf;
        this.zf = zf;

        this.scaleVel = (endScale - initialScale) / this.span;
    }

    update(secondsElapsed) {

        // console.log("Total time SCALAR: " + this.total_time + " - time elapsed: " + secondsElapsed + " - scale: " + this.scaleVel * this.total_time);

        if (!this.animating)
            return;

        if (this.total_time + secondsElapsed >= this.span) {
            //Calculates the time it takes to fully complete the animation and not go beyond the last control point
            secondsElapsed = this.span - this.total_time;
            this.animating = false;
        }

        this.total_time += secondsElapsed;

        let nextMatrix = mat4.create();
        this.translateMatrix(nextMatrix, vec3.fromValues(this.xf, this.yf, this.zf));
        this.scaleMatrix(nextMatrix, vec3.fromValues(this.scaleVel * this.total_time, this.scaleVel * this.total_time, this.scaleVel * this.total_time));

        this.transfMatrix = nextMatrix;
    }

}
