/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject
{
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, lengthS, lengthT)
	{
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
	};

	initBuffers() 
	{		
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
        var a1 = this.x2 - this.x1; 
        var b1 = this.y2 - this.y1; 
        var c1 = this.z2 - this.z1; 

        var a2 = this.x3 - this.x1; 
        var b2 = this.y3 - this.y1; 
        var c2 = this.z3 - this.z1; 

        //Cross product of these vectors equals the plane's normal
        var a = b1 * c2 - b2 * c1; 
        var b = a2 * c1 - a1 * c2; 
        var c = a1 * b2 - b1 * a2; 

        //Turn into versor (length = 1)
        var length = Math.sqrt(a * a + b * b + c * c);
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
        var a3 = this.x3 - this.x2;
        var b3 = this.y3 - this.y2;
        var c3 = this.z3 - this.z2;

        var lengthA = Math.sqrt(a2 * a2 + b2 * b2 + c2 * c2);
        var lengthB = Math.sqrt(a1 * a1 + b1 * b1 + c1 * c1);
        var lengthC = Math.sqrt(a3 * a3 + b3 * b3 + c3 * c3);

        //cos(beta)
        var cosb = (lengthA * lengthA - lengthB * lengthB + lengthC * lengthC) / (2.0 * lengthA * lengthC);
        var sinb = Math.sqrt(1 - cosb * cosb);

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

		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    };
    
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
};