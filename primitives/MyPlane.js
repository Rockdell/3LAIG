/**
 * MyPlane
 */
class MyPlane extends CGFobject {

    constructor(scene, npartsU, npartsV) {
        super(scene);

        this.scene = scene;
        this.npartsU = npartsU;
        this.npartsV = npartsV;

        this.nurbs = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.generateSurface());
    }

    generateSurface() {

        const index1 = 1, index2 = 1;

        let controlVertexes = [];

        let x = -0.5, z = 0.5;

        for (let u = 0; u < index1 + 1; u++) {
            let tmp = [];

            for (let v = 0; v < index2 + 1; v++) {
                tmp.push([x, 0, z, 1]);
                z -= 1 / index2;
            }

            controlVertexes.push(tmp);
            x += 1 / index1;
            z = 0.5;
        }

        return new CGFnurbsSurface(index1, index2, controlVertexes);
    }

    display() {
        this.nurbs.display();
    }
}