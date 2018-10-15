/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinder extends CGFobject
{
	constructor(scene, base, top, height, slices, stacks)
	{
		super(scene);
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;
		this.initBuffers();
	};

	initBuffers() 
	{
		this.vertices = [];

		this.indices = [];

		this.normals = [];

		this.texCoords = [];

		this.drawFace();
			
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	//Tube
	drawFace()
	{
		var alpha = (2 * Math.PI) / this.slices;
		var stackRadiusInc = (this.top - this.base) / this.stacks;
		var stackHeight = this.height / this.stacks;
		var sliceHeight = 1.0 / this.slices;
		var ind = 0;
	
		for (let j = 0; j < this.stacks; j++)
		{
			let stackRadius = this.base + j * stackRadiusInc;
			let stackRadiusNext = this.base + (j + 1) * stackRadiusInc;

			for (let i = 0; i < this.slices; i++)
			{
				//Vertices
				var vx1 = stackRadius * Math.cos(i * alpha);
				var vx2 = stackRadius * Math.cos((i + 1) * alpha);
				var vx3 = stackRadiusNext * Math.cos(i * alpha);
				var vx4 = stackRadiusNext * Math.cos((i + 1) * alpha);

				var vy1 = stackRadius * Math.sin(i * alpha);
				var vy2 = stackRadius * Math.sin((i + 1) * alpha);
				var vy3 = stackRadiusNext * Math.sin(i * alpha);
				var vy4 = stackRadiusNext * Math.sin((i + 1) * alpha);

				var vz1 = j * stackHeight;
				var vz2 = (j + 1) * stackHeight;

				this.vertices.push(vx1, vy1, vz1);
				this.vertices.push(vx2, vy2, vz1);
				this.vertices.push(vx3, vy3, vz2);
				this.vertices.push(vx4, vy4, vz2);

				//Indexes
				this.indices.push(this.height > 0 ? ind : ind + 2, ind + 1, this.height > 0 ? ind + 2 : ind);
				this.indices.push(this.height > 0 ? ind + 3 : ind + 1, ind + 2, this.height > 0 ? ind + 1 : ind + 3);	
				ind += 4;
	
				//Normals
				this.normals.push(vx1, vy1, 0);
				this.normals.push(vx2, vy2, 0);
				this.normals.push(vx1, vy1, 0);
				this.normals.push(vx2, vy2, 0);

				//Texture Coordinates
				this.texCoords.push(sliceHeight * i, stackHeight * j);		
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
				this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
			}
		}

		//Top
		this.vertices.push(0.0, 0.0, this.height > 0 ? this.height : 0.0);
		this.normals.push(0.0, 0.0, 1.0);
		this.texCoords.push(0.5, 0.5);

		for(var i = 0; i < this.slices; i++) {
		
			var vx = this.top * Math.cos(i * alpha);
			var vy = this.top * Math.sin(i * alpha);

			//Vertices
			this.vertices.push(vx, vy, this.height > 0 ? this.height : 0.0);

			//Normals
			this.normals.push(0.0, 0.0, 1.0);
			
			//TexCoords
			this.texCoords.push(0.5 + 0.5 * vx, 0.5 - 0.5 * vy);	
		}

		for(var i = 1; i <= this.slices; i++) {
			//Indices
			this.indices.push(i == this.slices ? ind + 1 : (ind + i + 1), ind, ind + i);
		}

		//Base
		ind += this.slices + 1;

		this.vertices.push(0.0, 0.0, this.height > 0 ? 0.0 : this.height);
		this.normals.push(0.0, 0.0, 1.0);
		this.texCoords.push(0.5, 0.5);

		for(var i = 0; i < this.slices; i++) {
		
			var vx = this.base * Math.cos(i * alpha);
			var vy = this.base * Math.sin(i * alpha);

			//Vertices
			this.vertices.push(vx, vy, this.height > 0 ? 0.0 : this.height);

			//Normals
			this.normals.push(0.0, 0.0, -1.0);
			
			//TexCoords
			this.texCoords.push(0.5 + 0.5 * vx, 0.5 - 0.5 * vy);	
		}

		for(var i = 1; i <= this.slices; i++) {
			//Indices
			this.indices.push(ind + i, ind, i == this.slices ? ind + 1 : (ind + i + 1));
		}

	};

};
