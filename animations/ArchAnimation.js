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

        this.a = 4.9;

        this.rotationsPerSecond = (Math.round(this.span) * 2) / this.span;

        this.calculate();
    }

    calculate() {

        function angle(v2, v1) {
            //console.log("Calculate angle between vectors: v1 = " + v1 + " - v2 = " + v2);
            if (v1 !== null && v2 != null) {
                if (!((v1[0] === 0 && v1[1] === 0) || (v2[0] === 0 && v2[1] === 0))) {
                    let dot = vec2.dot(v1, v2);                 // dot product
                    let det = v1[0] * v2[1] - v1[1] * v2[0];    // determinant
                    return Math.atan2(det, dot);
                }
                else
                    return 0;
            }
            else {
                console.error("Tried to calculate angle with NULL vectors!");
                return null;
            }
        }

        this.xVel = (this.xf - this.xi) / this.span;
        this.zVel = (this.zf - this.zi) / this.span;

        this.angleY = angle(vec2.fromValues(0,1), vec2.fromValues(this.xf - this.xi, this.zf - this.zi));
        this.velocity = Math.sqrt(Math.pow(this.xf - this.xi, 2.0) + Math.pow(this.zf - this.zi, 2.0)) / this.span;

        this.anglePerSecond = this.rotationsPerSecond * (2.0 * Math.PI);

        //h(t) = y0 + vy0*t + ay*t^2
        // this.vy0 = (this.height - (-(this.a / 2.0) * Math.pow(this.span / 2.0, 2.0))) / (this.span / 2.0);
        this.vy0 = (this.a / 2.0) * this.span;
    }

    getY(t) {
        return (this.vy0 * t - (this.a / 2.0) * Math.pow(t, 2.0));
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

        let nextMatrix = mat4.create();
        this.translateMatrix(nextMatrix, vec3.fromValues(0.5, 0, 0.5));
        this.rotateYMatrix(nextMatrix, this.angleY);
        this.translateMatrix(nextMatrix, vec3.fromValues(-0.5, 0, -0.5));
        this.translateMatrix(nextMatrix, vec3.fromValues(0, this.getY(this.total_time), this.velocity * this.total_time));
        // this.translateMatrix(nextMatrix, vec3.fromValues(this.xVel * this.total_time, this.getY(this.total_time), this.zVel * this.total_time));
        this.translateMatrix(nextMatrix, vec3.fromValues(0.5, 0, 0.5));
        this.rotateXMatrix(nextMatrix, this.anglePerSecond * this.total_time);
        this.translateMatrix(nextMatrix, vec3.fromValues(-0.5, 0, -0.5));

        this.transfMatrix = nextMatrix;
    }

}
