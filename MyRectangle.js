/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyRectangle extends CGFobject
{
	constructor(scene, x1, y1, x2, y2, minS, maxS, minT, maxT)
	{
        super(scene);
        
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

		this.minS = minS || 0.0;
		this.maxS = maxS || 1.0;
		this.minT = minT || 0.0;
		this.maxT = maxT || 1.0;
		
        this.initBuffers();
	};

	initBuffers() 
	{		
		this.vertices = [
				//Left lower
				this.x1, this.y1, 0,
				//Right lower
				this.x2, this.y1, 0,
				//Left upper
				this.x1, this.y2, 0,
				//Rigth upper
				this.x2, this.y2, 0
				];

		this.indices = [
				0, 1, 2, 
				3, 2, 1
				];

		this.normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
		];

		this.texCoords = [
			//Left lower
			this.minS, this.maxT,
			//Right lower
			this.maxS, this.maxT,
			//Left upper
			this.minS, this.minT,
			//Rigth upper
			this.maxS, this.minT
		];
			
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
