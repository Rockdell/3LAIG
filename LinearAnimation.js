/**
 * LinearAnimation
 */
class LinearAnimation extends Animation {

	constructor(scene, span, control_points) {

        super(scene);
        this.span = span;

        this.control_points = [];
        for (let i = 0; i < control_points.length; i++)
            this.control_points.push(Object.values(control_points[i]));

        //console.log(this.control_points);

        this.animating = true;

        this.total_time = 0;
        this.velocity = null;
        //this.cp_spans = [];
        this.current_direction = null;
        this.directions = [];
        this.cp_distances = [];

        //In RADIANS!
        this.vector_angles = [];

        //Create Initial Matrix
        this.transfMatrix = mat4.create();
        mat4.translate(this.transfMatrix, this.transfMatrix, vec3.fromValues(this.control_points[0][0], this.control_points[0][1], this.control_points[0][2]));
   
        this.calculate();     
        
        console.log("***********************************");
        console.log("Total time: " + this.total_time);
        console.log("Velocity: " + this.velocity);
        console.log("Current direction: " + this.current_direction);
        console.log("Directions: " + this.directions);
        console.log("CP distances: " + this.cp_distances);
        console.log("Angles: " + this.vector_angles);
        console.log("***********************************");
    }

    calculate() {

        function angle(v2, v1) {
            console.log("Calculate angle between vectors: v1 = " + v1 + " - v2 = " + v2);
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
                console.error("Calculate angle between NULL vectors!");
                return null;
            }
        }

        let total_distance = 0;

        //Calculates vector between 2 control points for all existent control points
        for (let i = 0; i < this.control_points.length - 1; i++) {

            let v1 = vec3.fromValues(this.control_points[i][0], this.control_points[i][1], this.control_points[i][2]);
            let v2 = vec3.fromValues(this.control_points[i + 1][0], this.control_points[i + 1][1], this.control_points[i + 1][2]);

            //console.log(v2);
            vec3.subtract(v2, v2, v1);
            //console.log(v2);

            //Debug
            //console.log("[" + [i] + "]: " + this.control_points[i][0] + " - " + this.control_points[i][1] + " - " + this.control_points[i][2]);
            //console.log("[" + [i + 1] + "]: " + this.control_points[i + 1][0] + " - " + this.control_points[i + 1][1] + " - " + this.control_points[i + 1][2]);
            //console.log("Length: " + vec3.length(v2));

            total_distance += vec3.length(v2);
            this.cp_distances.push(vec3.length(v2) + ((i > 0) ? this.cp_distances[i - 1] : 0));

            //let newDirection = vec3.fromValues(0, v2[1], Math.sqrt(Math.pow(v2[0], 2.0) + Math.pow(v2[2], 2.0)));
            vec3.normalize(v2, v2);
            //console.log("norm: " + v2);
            this.directions.push(v2);

            // console.log(`${this.directions}`);

            if (i == 0)
                /* this.vector_angles.push(Math.acos(
                    vec2.dot(vec2.fromValues(0, 1), vec2.fromValues(this.directions[0][0], this.directions[0][2]))
                    / (1 .0 * vec2.length(vec2.fromValues(this.directions[0][0], this.directions[0][2])))));*/
                this.vector_angles.push(angle(vec2.fromValues(0, 1), vec2.fromValues(this.directions[0][0], this.directions[0][2])));
            else
                /*  this.vector_angles.push(Math.acos(
                     vec2.dot(vec2.fromValues(this.directions[i - 1][0], this.directions[i - 1][2]), vec2.fromValues(this.directions[i][0], this.directions[i][2]))
                     / (vec2.length(vec2.fromValues(this.directions[i - 1][0], this.directions[i - 1][2])) * vec2.length(vec2.fromValues(this.directions[i][0], this.directions[i][2]))))); */
                this.vector_angles.push(angle(vec2.fromValues(this.directions[i - 1][0], this.directions[i - 1][2]), vec2.fromValues(this.directions[i][0], this.directions[i][2])));
            //  console.log(`${this.directions}`);

            console.log("Calculated angle = " + this.vector_angles[i]);
        }

        this.velocity = total_distance / this.span;


        //this.velocity = cp_distances.reduce(function(a, b) { return a + b; 0}) / this.span;

 /*        for(let i = 0; this.cp_spans.length; i++) {
            this.cp_spans.push();
        }
        this.cp_spans.push(cp_distances[0]/this.velocity);
        this.cp_spans.push(cp_distances[1]/this.velocity + this.cp_spans[0]);
        this.cp_spans.push(cp_distances[2]/this.velocity + this.cp_spans[1]); */
    }

    update(secondsElapsed) {

        function equals(v1, v2) {
            return (v1 != null && v2 != null && v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2]);
        }

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

        let distance_travelled = this.total_time * this.velocity;

        //this.current_direction = vec3.clone(this.directions[0]);
        //console.log("update: " + this.directions);
         
        for (let i = 0; i < this.cp_distances.length; i++) {

            if (distance_travelled < this.cp_distances[i]) {
                
                console.log("CD = " + this.current_direction + " - D = " + this.directions[i]);

                if (!equals(this.current_direction, this.directions[i])) {

                    console.log("New line segment!");

                    //Move the object to the final control point of this segment (so it stays aligned with the course)
                    if(i != 0) {
                        let remainingDistance = vec3.fromValues(0, this.current_direction[1], Math.sqrt(Math.pow(this.current_direction[0], 2.0) + Math.pow(this.current_direction[2], 2.0)));
                        vec3.normalize(remainingDistance, remainingDistance);
                        vec3.scale(remainingDistance, remainingDistance, this.cp_distances[i - 1] - this.velocity * (this.total_time - secondsElapsed));
                        mat4.translate(this.transfMatrix, this.transfMatrix, remainingDistance);
                    }

                    mat4.rotateY(this.transfMatrix, this.transfMatrix, this.vector_angles[i]);
                    this.current_direction = vec3.clone(this.directions[i]);

                    if(i != 0) {
                        let fragmentToMove = vec3.fromValues(0, this.current_direction[1], Math.sqrt(Math.pow(this.current_direction[0], 2.0) + Math.pow(this.current_direction[2], 2.0)));
                        vec3.normalize(fragmentToMove, fragmentToMove);

                        vec3.scale(fragmentToMove, fragmentToMove, distance_travelled - this.cp_distances[i - 1]);

                        mat4.translate(this.transfMatrix, this.transfMatrix, fragmentToMove);
                        return;
                    }
                    
                }

                break;
            }
        }

        console.log("first dir: " + this.current_direction);

        let fragmentToMove = vec3.fromValues(0, this.current_direction[1], Math.sqrt(Math.pow(this.current_direction[0], 2.0) + Math.pow(this.current_direction[2], 2.0)));
        vec3.normalize(fragmentToMove, fragmentToMove);

        vec3.scale(fragmentToMove, fragmentToMove, this.velocity * secondsElapsed);
        console.log("fragmentToMove dir: " + fragmentToMove);

        //let test = vec3.fromValues(0, this.current_direction[1] * this.velocity);

        mat4.translate(this.transfMatrix, this.transfMatrix, fragmentToMove);
        console.log("----------------------------------------------");
    }

}
