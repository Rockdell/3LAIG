/**
 * MyCircle
 */

class MyCircle extends CGFobject
{
	constructor(scene, slices)
	{
		super(scene);
		this.slices = slices;
		this.initBuffers();
	};

	initBuffers() 
	{
		this.vertices = [0.0, 0.0, 1.0];

		this.indices = [];

		this.normals = [0.0, 0.0, 1.0];

		this.texCoords = [0.5, 0.5];

		this.drawFace();
			
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	drawFace()
	{
		this.alpha = (2 * Math.PI) / this.slices;

		for(var i = 0; i < this.slices; i++) {
		
			var vx = Math.cos(i * this.alpha);
			var vy = Math.sin(i * this.alpha);

			//Vertices
			this.vertices.push(vx, vy, 1.0);

			//Normals
			this.normals.push(0.0, 0.0, 1.0);
			
			//TexCoords
			this.texCoords.push(0.5 + 0.5 * vx, 0.5 - 0.5 * vy);	
		}

		for(var i = 1; i <= this.slices; i++) {
			//Indices
			this.indices.push(i == this.slices ? 1 : (i + 1), 0, i);
		}
	};

};