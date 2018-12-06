/**
 * MyPatch
 */
class MyPatch extends CGFobject {

    constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoints) {
        super(scene);

        this.scene = scene;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.controlPoints =  controlPoints;

        this.sphere = new MySphere(scene, 0.1, 10, 10);

        this.nurbs = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface());
    }

    generateSurface() {

        let index = 0;

        let controlVertexes = [];
        
        for(let u = 0; u < this.npointsU; u++) {
            let tmp = [];

            for(let v = 0; v < this.npointsV; v++) {
                let cp = this.controlPoints[index++];
                tmp.push([cp.xx, cp.yy, cp.zz, 1])
            }
            controlVertexes.push(tmp);
        }
        
        return new CGFnurbsSurface(this.npointsU - 1, this.npointsV - 1, controlVertexes);
    }

    display() {
        this.nurbs.display();
    }
}