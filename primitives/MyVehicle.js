
class MyVehicle extends CGFobject {

    constructor(scene) {
        super(scene);

        this.scene = scene;
        this.npartsU = 50;
        this.npartsV = 50;

        this.createVehicleParts();
        this.createVehicleAppearance();
    }

    createVehicleParts() {

        // Top Disk
        let bottom = vec3.fromValues(-1, 0, 0);
        let middle = vec3.fromValues(-0.75, 0.2, 0);
        let top = vec3.fromValues(-0.5, 0.2, 0);

        this.topDiskVertexes = this.generateControlVertexes(bottom, middle, top);
        this.topDisk = new MyPatch(this.scene, this.topDiskVertexes.length / 3, 3, 50, 50, this.topDiskVertexes);

        // Bot disk
        bottom = vec3.fromValues(-0.5, -0.2, 0);
        middle = vec3.fromValues(-0.75, -0.2, 0);
        top = vec3.fromValues(-1, 0, 0);

        this.botDiskVertexes = this.generateControlVertexes(bottom, middle, top);
        this.botDisk = new MyPatch(this.scene, this.botDiskVertexes.length / 3, 3, 50, 50, this.botDiskVertexes);

        // Top sphere
        bottom = vec3.fromValues(-0.5, 0.2, 0);
        middle = vec3.fromValues(-0.5, 0.7, 0);
        top = vec3.fromValues(0, 0.7, 0);

        this.topSphereVertexes = this.generateControlVertexes(bottom, middle, top);
        this.topSphere = new MyPatch(this.scene, this.topSphereVertexes.length / 3, 3, 50, 50, this.topSphereVertexes);

        // Bot sphere
        bottom = vec3.fromValues(0, -0.3, 0);
        middle = vec3.fromValues(-0.5, -0.3, 0);
        top = vec3.fromValues(-0.5, -0.2, 0);       
        
        this.botSphereVertexes = this.generateControlVertexes(bottom, middle, top);
        this.botSphere = new MyPatch(this.scene, this.botSphereVertexes.length / 3, 3, 50, 50, this.botSphereVertexes);

        // Ray
        this.ray = new MyCylinder2(this.scene, 0.1, 0.3, 4, 50, 50);
    }

    generateControlVertexes(bottom, middle, top) {

        let controlVertexes = [];

        let currAngle = 0;
        let anglePerLine = Math.PI / 24;

        do {
            controlVertexes.push({ xx: bottom[0], yy: bottom[1], zz: bottom[2] });
            controlVertexes.push({ xx: middle[0], yy: middle[1], zz: middle[2] });
            controlVertexes.push({ xx: top[0], yy: top[1], zz: top[2] });

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

    createVehicleAppearance() {

        this.cockpitAppearance = new CGFappearance(this.scene);
        this.cockpitAppearance.loadTexture("../scenes/images/cockpit.png");

        this.rayAppearance = new CGFappearance(this.scene);
        this.rayAppearance.setAmbient(0, 0.0, 0.0, 0.0);
        this.rayAppearance.setDiffuse(0.0, 0.0, 0.0, 0.0);
        this.rayAppearance.setSpecular(0.0, 0.0, 0.0, 0.0);
        this.rayAppearance.setEmission(0.6, 0.8, 1.0, 0.5);
        this.rayAppearance.setShininess(1);

    }
    
    display()  {

        this.scene.pushMatrix();

            this.topDisk.display();
            this.botDisk.display();
            this.botSphere.display();

            this.cockpitAppearance.apply();
            this.topSphere.display();

            this.rayAppearance.apply();
            this.scene.rotate(Math.PI / 2.0, 1, 0, 0);
            this.ray.display();
            
        this.scene.popMatrix();
    }
}