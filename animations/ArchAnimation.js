/**
 * ArchAnimation
 */
class ArchAnimation extends Animation {

    constructor(scene, span, height, xi, zi, xf, zf) {
        super(scene, span);

        this.height = height;
        this.xi = xi;
        this.zi = zi;

        this.xf = xf;
        this.zf = zf;

        this.calculate();
    }

    calculate() {
        this.xVel = (this.xf - this.xi) / this.span;
        this.zVel = (this.zf - this.zi) / this.span;

        //h(t) = y0 + vy0*t + ay*t^2
        this.vy0 = (this.height - (-(9.8 / 2.0) * Math.pow(this.span / 2.0, 2.0))) / (this.span / 2.0);
    }

    getY(t) {
        return (this.vy0 * t - (9.8 / 2.0) * Math.pow(t, 2.0));
    }

    update(secondsElapsed) {

        console.log("Total time ARCH: " + this.total_time + " - time elapsed: " + secondsElapsed);

        if (!this.animating)
            return;

        if (this.total_time + secondsElapsed >= this.span) {
            //Calculates the time it takes to fully complete the animation and not go beyond the last control point
            secondsElapsed = this.span - this.total_time;
            this.animating = false;
        }

        // if (this.total_time < (this.span / 2.0)) {
        //     if ((this.total_time + secondsElapsed) >= (this.span / 2.0)) {
        //         let timeToReachTop = ((this.span / 2.0) - this.total_time);
        //         let movement = vec3.fromValues(this.xVel * timeToReachTop, this.yVel * timeToReachTop, this.zVel * timeToReachTop);
        //         this.translateMatrix(this.transfMatrix, movement);

        //         this.total_time += timeToReachTop;
        //         secondsElapsed -= timeToReachTop;
        //     }
        // }

        this.total_time += secondsElapsed;

        let movement = vec3.fromValues(this.xVel * secondsElapsed, this.getY(this.total_time), this.zVel * secondsElapsed);
        this.translateMatrix(this.transfMatrix, movement);
    }

}
