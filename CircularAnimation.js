/**
 * CircularAnimation
 */
class CircularAnimation extends Animation {

	constructor(scene, span, center, radius, startang, rotang) {

        super(scene);
        this.span = span;
        this.center = center;
        this.radius = radius;
        this.startang = startang;
        this.rotang = rotang;

        this.animtaing = true;
        this.total_time = 0;

        this.angularVelocity = rotang / span;

        let startMatrix = mat4.create();
        mat4.translate(startMatrix, startMatrix, vec3.fromValues(center.x, center.y, center.z));
        mat4.rotateY(startMatrix, startMatrix, (startang * Math.PI) / 180.0);
        
        this.transfMatrix = startMatrix;

    }
    
    update(secondsElapsed) {

        console.log("Total time: " + this.total_time);

        //mat4.translate(this.transfMatrix, this.transfMatrix, vec3.fromValues(0.1,0,0));

        if (!this.animating)
            return;

        if (this.total_time + secondsElapsed >= this.span) {
            //Calculates the time it takes to fully complete the animation and not go beyond the last control point
            secondsElapsed = this.span - this.total_time;
            this.total_time = this.span;
            this.animating = false;
        }

        this.total_time += secondsElapsed;


    }

}
