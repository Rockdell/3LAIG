
ç/**
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

        this.velocities = [];

        this.calculate();        
    }

    calculate() {

        let spanPerSegment = (this.control_points.length - 1) / this.span;

        for(let i = 0; i < this.control_points.length - 1; i++) {
            
            let v1 = vec3.fromArray(this.control_points[i]);
            let v2 = vec3.fromArray(this.control_points[i + 1]);

            let v3 = vec3.create();
            vec3.subtract(v2, v1, v3);

            let vel = vec3.length(v3) / spanPerSegment;

            this.velocities.push(vel);
        }

        this.velocities.push

    }

    update() {

        for(let cp in control_points) {



        }

    }
    
    
}
