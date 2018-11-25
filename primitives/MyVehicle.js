
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

        this.topDiskVertexes = this.generateControlVertexes(bottom, middle, top);
        this.topDisk = new MyPatch(scene, this.topDiskVertexes.length / 3, 3, 50, 50, this.topDiskVertexes);

        // Bot disk
        bottom = vec3.fromValues(-0.5, -0.2, 0);
        middle = vec3.fromValues(-0.75, -0.2, 0);
        top = vec3.fromValues(-1, 0, 0);

        this.botDiskVertexes = this.generateControlVertexes(bottom, middle, top);
        this.botDisk = new MyPatch(scene, this.botDiskVertexes.length / 3, 3, 50, 50, this.botDiskVertexes);

        // Top sphere
        bottom = vec3.fromValues(-0.5, 0.2, 0);
        middle = vec3.fromValues(-0.5, 0.7, 0);
        top = vec3.fromValues(0, 0.7, 0);

        this.topSphereVertexes = this.generateControlVertexes(bottom, middle, top);
        this.topSphere = new MyPatch(scene, this.topSphereVertexes.length / 3, 3, 50, 50, this.topSphereVertexes);

        // Bot sphere
        bottom = vec3.fromValues(0, -0.3, 0);
        middle = vec3.fromValues(-0.5, -0.3, 0);
        top = vec3.fromValues(-0.5, -0.2, 0);       
        
        this.botSphereVertexes = this.generateControlVertexes(bottom, middle, top);
        this.botSphere = new MyPatch(scene, this.botSphereVertexes.length / 3, 3, 50, 50, this.botSphereVertexes);
    }

    generateControlVertexes(bottom, middle, top) {

        let controlVertexes = [];

        let currAngle = 0;
        let anglePerLine = Math.PI / 24;

        do {
            controlVertexes.push({ x: bottom[0], y: bottom[1], z: bottom[2] });
            controlVertexes.push({ x: middle[0], y: middle[1], z: middle[2] });
            controlVertexes.push({ x: top[0], y: top[1], z: top[2] });

            bottom = this.rotateY(bottom, anglePerLine);
            middle = this.rotateY(middle, anglePerLine);
            top = this.rotateY(top, anglePerLine);

            currAngle += anglePerLine;

        } while (currAngle < 2 * Math.PI);
        
        return controlVertexes;
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