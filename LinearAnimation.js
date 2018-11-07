
/**
 * LinearAnimation
 */
class LinearAnimation extends Animation {

	constructor(scene, span, control_points) {

        if(control_points.length < 2) {
            console.error('Tried to make a Linear Animation with less than 2 control points!');
        }

        super(scene);
        this.span = span;
        this.control_points = control_points;

        this.total_time = 0;
        this.velocity = null;
        //this.cp_spans = [];
        this.current_direction = null;
        this.directions = [];
        this.cp_distances = [];

        //In RADIANS!
        this.vector_angles = [];

        this.calculate();        
    }

    calculate() {

        let total_distance = 0;

        //Calculates vector between 2 control points for all existent control points
        for(let i = 0; i < this.control_points.length - 1; i++) {
            
            let v1 = vec3.fromArray(this.control_points[i]);
            let v2 = vec3.fromArray(this.control_points[i + 1]);

            vec3.subtract(v2, v1);

            //Debug
            console.log("[" + [i] + "]: " + this.control_points[i][0] + " - " + this.control_points[i][1] + " - " + this.control_points[i][2]);
            console.log("[" + [i + 1] + "]: " + this.control_points[i + 1][0] + " - " + this.control_points[i + 1][1] + " - " + this.control_points[i + 1][2]);
            console.log("Length: " + vec3.length(v2));

            total_distance += vec3.length(v2);
            this.cp_distances.push(vec3.length(v2) + (i > 0) ? this.cp_distances[i - 1] : 0);

            vec3.normalize(v2, v2);
            this.directions.push(v2);

            if(i == 0)
                this.vector_angles.push(Math.acos(vec3.dot(vec3.fromValues(0,0,1), this.directions[0]) / (1.0 * vec3.length(this.directions[0]))));
            else
                this.vector_angles.push(Math.acos(vec3.dot(this.directions[i - 1], this.directions[i]) / (vec3.length(this.directions[i - 1])) * vec3.length(this.directions[i])));
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

        this.total_time += secondsElapsed;

        let distance_travelled = this.total_time * this.velocity;

        for(let i = 0; i < this.cp_distances.length; i++) {

            if(distance_travelled < this.cp_distances[i]) {

                if(this.current_direction != this.directions[i]) {
                    mat4.rotate(this.transfMatrix, this.transfMatrix, this.vector_angles[i], vec3.fromValues(0,1,0));
                    this.current_direction = this.directions[i];
                }

                break;
            } 
        }

        mat4.translate(this.transfMatrix, this.transfMatrix, vec3.scale(this.current_direction, this.velocity * secondsElapsed));
    }
    
    
}
