/**
 * LinearAnimation
 */
class LinearAnimation extends Animation {

	constructor(scene, span, control_points) {

        super(scene, span);

        //Transform object into array
        this.control_points = [];
        for (let i = 0; i < control_points.length; i++)
            this.control_points.push(Object.values(control_points[i]));

        this.velocity = null;
        this.current_segment = 0;

        //New directions considering that the object will always move towards positive Z because of the rotation inflicted over the axis!
        this.directions = [];

        this.cp_distances = [];

        //In RADIANS!
        this.vector_angles = [];
   
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

        let total_distance = 0;
        let aux_directions = [];

        //Calculates vector between 2 control points for all existent control points
        for (let i = 0; i < this.control_points.length - 1; i++) {

            let v1 = vec3.fromValues(this.control_points[i][0], this.control_points[i][1], this.control_points[i][2]);
            let v2 = vec3.fromValues(this.control_points[i + 1][0], this.control_points[i + 1][1], this.control_points[i + 1][2]);

            //Calculate (at pairs) each segment vector
            vec3.subtract(v2, v2, v1);

            //Sum to total distance
            total_distance += vec3.length(v2);

            //Distances from the START POSITION till that control point (distance(cp[0] -> cp[i])) ou seja, cp[i] < cp[i+1]
            this.cp_distances.push(vec3.length(v2) + ((i > 0) ? this.cp_distances[i - 1] : 0));
            
            aux_directions.push(v2);

            if (i == 0)
                this.vector_angles.push(angle(vec2.fromValues(0, 1), vec2.fromValues(aux_directions[0][0], aux_directions[0][2])));
            else
                this.vector_angles.push(angle(vec2.fromValues(aux_directions[i - 1][0], aux_directions[i - 1][2]), vec2.fromValues(aux_directions[i][0], aux_directions[i][2])));
        }

        //Transform normal axis directions into directions in the rotated axis.
        for (let i = 0; i < aux_directions.length; i++) {
            let aux_vec = vec3.fromValues(0, aux_directions[i][1], Math.sqrt(Math.pow(aux_directions[i][0], 2.0) + Math.pow(aux_directions[i][2], 2.0)))
            this.directions.push(vec3.normalize(aux_vec, aux_vec));
        }

        //Already attributes the animation's velocity and the current direction the object will take, which will obviously be the direction of the first segment
        this.velocity = total_distance / this.span;
    }

    update(secondsElapsed) {

        function equals(v1, v2) {
            return (v1 != null && v2 != null && v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2]);
        }

        //console.log("Total time LINEAR: " + this.total_time + " - time elapsed: " + secondsElapsed);

        if (!this.animating)
            return;

        if (this.total_time + secondsElapsed >= this.span) {
            //Calculates the time it takes to fully complete the animation and not go beyond the last control point
            secondsElapsed = this.span - this.total_time;

            //Next time we call update the animation has already been completed
            this.animating = false;
        }

        //Apply the first rotation for the first segment
        if (this.total_time == 0) {
            this.translateMatrix(this.transfMatrix, vec3.fromValues(this.control_points[0][0], this.control_points[0][1], this.control_points[0][2]));
            this.rotateYMatrix(this.transfMatrix, this.vector_angles[this.current_segment]);
        }

        this.total_time += secondsElapsed;

        let distance_travelled = this.total_time * this.velocity;

        if (distance_travelled >= this.cp_distances[this.current_segment] && this.total_time != this.span) {

            //Move the object to the final control point of this segment (so it stays aligned with the course)
            let remainingDistance = vec3.clone(this.directions[this.current_segment]);
            let distanceToFinishSegment = this.cp_distances[this.current_segment] - this.velocity * (this.total_time - secondsElapsed);
            
            this.scaleVector(remainingDistance, distanceToFinishSegment);
            this.translateMatrix(this.transfMatrix, remainingDistance);

            let timeAlreadyTravelled = distanceToFinishSegment / this.velocity;
            secondsElapsed -= timeAlreadyTravelled;

            this.current_segment++;

            this.rotateYMatrix(this.transfMatrix, this.vector_angles[this.current_segment]);
        }

        let fragmentToMove = vec3.clone(this.directions[this.current_segment]);
        this.scaleVector(fragmentToMove, this.velocity * secondsElapsed);
        this.translateMatrix(this.transfMatrix, fragmentToMove);
    }

}
