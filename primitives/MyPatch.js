
class MyPatch extends CGFobject {

    constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoints) {
        super(scene);

        this.scene = scene;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.controlPoints =  controlPoints;

        this.initNurbs();
    }

    initNurbs() {
        this.nurbs = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface());
    }

    generateSurface() {

        let controlVertexes = [];

        for(let u = 0; u < this.npointsU; u++) {
            let tmp = [];

            for(let v = 0; v < this.npointsV; u++) {
                let cp = this.controlPoints[u][v];
                tmp.push([cp.x, cp.y, cp.z, 1])
            }

            controlVertexes.push(tmp);
        }

        return new CGFnurbsSurface(this.npointsU - 1, this.npointsV - 1, controlVertexes);
    }

    display() {
        this.nurbs.display();
    }
}