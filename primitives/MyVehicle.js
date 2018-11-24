
class MyVehicle extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;
        this.npartsU = 50;
        this.npartsV = 50;

        // Top Disk
        let bottom = vec3.fromValues(-1, 0, 0);
        let middle = vec3.fromValues(-0.75, 0.2, 0);
        let top = vec3.fromValues(-0.5, 0.2, 0);
        this.topDisk = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface(bottom, middle, top));

        // Bot disk
        bottom = vec3.fromValues(-0.5, -0.2, 0);
        middle = vec3.fromValues(-0.75, -0.2, 0);
        top = vec3.fromValues(-1, 0, 0);
        this.botDisk = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface(bottom, middle, top));

        // Top sphere
        bottom = vec3.fromValues(-0.5, 0.2, 0);
        middle = vec3.fromValues(-0.5, 0.7, 0);
        top = vec3.fromValues(0, 0.7, 0);
        this.topSphere = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface(bottom, middle, top));

        // Bot sphere (replace with cylinder2)
        bottom = vec3.fromValues(0, -0.3, 0);
        middle = vec3.fromValues(-0.5, -0.3, 0);
        top = vec3.fromValues(-0.5, -0.2, 0);        
        this.botSphere = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface(bottom, middle, top));
    }

    generateSurface(bottom, middle, top) {

        let controlVertexes = [];

        let currAngle = 0;
        let anglePerLine = Math.PI / 24;

        do {
            let nextControlPoint = [
                [bottom[0], bottom[1], bottom[2], 1],
                [middle[0], middle[1], middle[2], 1],
                [top[0], top[1], top[2], 1]
            ];

            controlVertexes.push(nextControlPoint)

            bottom = this.rotateY(bottom, anglePerLine);
            middle = this.rotateY(middle, anglePerLine);
            top = this.rotateY(top, anglePerLine);

            currAngle += anglePerLine;

        } while (currAngle < 2 * Math.PI);
        
        return new CGFnurbsSurface(controlVertexes.length - 1, 2, controlVertexes);
    }

    rotateY(vector, angle) {
        let out = vec3.fromValues(0, 0, 0);
        
        out[0] = vector[2] * Math.sin(angle) + vector[0] * Math.cos(angle);
        out[1] = vector[1];
        out[2] = vector[2] * Math.cos(angle) - vector[0] * Math.sin(angle);

        return out;
    }
    
    display() {
        this.topDisk.display();
        this.botDisk.display();
        this.topSphere.display();
        this.botSphere.display();
    }
}