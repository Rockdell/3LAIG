/**
 * MyTriangle
 */
class MyTriangle extends CGFobject {

    constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, lengthS, lengthT) {

        super(scene);

        this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;

        this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;

        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

        this.u = lengthS || 1.0;
        this.v = lengthT || 1.0;

        this.initBuffers();
    }

    initBuffers() {

        this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3,
        ];

        this.indices = [
            0, 1, 2,
        ];

        //Calculate Normal to plane
        /*
        --> Vectors 
            (a2, b2, c2) -> A
            (a1, b1, c1) -> B
            (a3, b3, c3) -> C
        */
    
        let a = vec3.fromValues(this.x1 - this.x3, this.y1 - this.y3, this.z1 - this.z3);
        let b = vec3.fromValues(this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1);
        let c = vec3.fromValues(this.x3 - this.x2, this.y3 - this.y2, this.z3 - this.z2);

        //Cross product of these vectors equals the plane's normal
        let cp = vec3.create();
        vec3.cross(cp, a, b);

        //Turn into versor (length = 1)
        vec3.normalize(cp, cp);

        this.normals = [];
        for(let i = 0; i < 4; i++) {
            this.normals.push(cp[0], cp[1], cp[2]);
        }

        //TextCoords calculations
        let lengthA = vec3.length(a);
        let lengthB = vec3.length(b);
        let lengthC = vec3.length(c);

        //cos(beta)
        let cosb = (lengthA * lengthA - lengthB * lengthB + lengthC * lengthC) / (2.0 * lengthA * lengthC);
        let sinb = Math.sqrt(1 - cosb * cosb);

        //Texture Coordinates -> P0, P1, P2
        this.p0u = lengthC - lengthA * cosb;
        this.p0v = 0;

        this.p1u = 0;
        this.p1v = lengthA * sinb;

        this.p2u = lengthC;
        this.p2v = lengthA * sinb;

        this.texCoords = [
            this.p0u, this.p0v,
            this.p1u, this.p1v,
            this.p2u, this.p2v
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTextST(ls, lt) {
        this.u = ls;
        this.v = lt;

        this.texCoords = [
            this.p0u / ls, this.p0v / lt,
            this.p1u / ls, this.p1v / lt,
            this.p2u / ls, this.p2v / lt
        ];

        this.updateTexCoordsGLBuffers();
    }
}
