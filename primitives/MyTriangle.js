/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
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
        (a1, b1, c1) -> B
        (a2, b2, c2) -> A
        */
        let a1 = this.x2 - this.x1;
        let b1 = this.y2 - this.y1;
        let c1 = this.z2 - this.z1;

        let a2 = this.x3 - this.x1;
        let b2 = this.y3 - this.y1;
        let c2 = this.z3 - this.z1;

        //Cross product of these vectors equals the plane's normal
        let a = b1 * c2 - b2 * c1;
        let b = a2 * c1 - a1 * c2;
        let c = a1 * b2 - b1 * a2;

        //Turn into versor (length = 1)
        let length = Math.sqrt(a * a + b * b + c * c);
        a /= length;
        b /= length;
        c /= length;

        this.normals = [
            a, b, c,
            a, b, c,
            a, b, c,
            a, b, c
        ];

        //TextCoords calculations
        /*
        --> Missing Vector
        (a3, b3, c3) -> C
        */
        let a3 = this.x3 - this.x2;
        let b3 = this.y3 - this.y2;
        let c3 = this.z3 - this.z2;

        let lengthA = Math.sqrt(a2 * a2 + b2 * b2 + c2 * c2);
        let lengthB = Math.sqrt(a1 * a1 + b1 * b1 + c1 * c1);
        let lengthC = Math.sqrt(a3 * a3 + b3 * b3 + c3 * c3);

        //cos(beta)
        let cosb = (lengthA * lengthA - lengthB * lengthB + lengthC * lengthC) / (2.0 * lengthA * lengthC);
        let sinb = Math.sqrt(1 - cosb * cosb);

        //Texture Coordinates -> P0, P1, P2
        this.p0u = lengthC - lengthA * cosb;
        this.p0v = this.v - lengthA * sinb;

        this.p1u = 0;
        this.p1v = this.v;

        this.p2u = lengthC;
        this.p2v = this.v;

        this.texCoords = [
            this.p0u, this.p0v,
            this.p1u, this.p1v,
            this.p2u, this.p2v
        ];

        // console.log(this.p0u + " - " + this.p0v);
        // console.log(this.p1u + " - " + this.p1v);
        // console.log(this.p2u + " - " + this.p2v);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTextST(ls, lt) {
        this.u = ls;
        this.v = lt;

        this.texCoords = [
            this.p0u * ls, this.p0v * lt,
            this.p1u * ls, this.p1v * lt,
            this.p2u * ls, this.p2v * lt
        ];

        this.updateTexCoordsGLBuffers();
    }
}
