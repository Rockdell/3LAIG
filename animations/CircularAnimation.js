/**
 * CircularAnimation
 */
class CircularAnimation extends Animation {

	constructor(scene, span, center, radius, startang, rotang) {

        super(scene, span);
        this.center = center;
        this.radius = radius;

        //Converted to Radians
        this.startang = startang * (Math.PI / 180.0);
        this.rotang = rotang * (Math.PI / 180.0);

        //In RAD/S
        this.angularVelocity = (rotang * (Math.PI / 180.0)) / span;

    }
    
    update(secondsElapsed) {

        //console.log("Total time CIRCULAR: " + this.total_time + " - time elapsed: " + secondsElapsed);

        if (!this.animating)
            return;

        if (this.total_time + secondsElapsed >= this.span) {
            //Calculates the time it takes to fully complete the animation and not go beyond the last control point
            secondsElapsed = this.span - this.total_time;
            this.animating = false;
        }

        this.total_time += secondsElapsed;

        let nextMatrix = mat4.create();
        this.translateMatrix(nextMatrix, vec3.fromValues(this.center[0], this.center[1], this.center[2]));
        this.rotateYMatrix(nextMatrix, (this.startang + this.angularVelocity * this.total_time));
        this.translateMatrix(nextMatrix, vec3.fromValues(this.radius, 0, 0));

        this.transfMatrix = nextMatrix;
    }

}
