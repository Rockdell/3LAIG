/**
 * MyTorus
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject
{
	constructor(scene, inner, outer, loops, slices)
	{
        super(scene);
        this.r = inner;
        this.R = outer;
        this.loops = loops;
        this.slices = slices;
        
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

	drawFace()
	{
        var teta = (2.0 * Math.PI) / this.loops;
        var delta = (2.0 * Math.PI) / this.slices;

		var stackHeight = 1.0 / this.slices;
		var sliceHeight = 1.0 / this.loops;
		var ind = 0;
	
		for (let j = 0; j < this.slices; j++)
		{
			for (let i = 0; i < this.loops; i++)
			{
				//Vertices
				var vx1 = (this.R + this.r * Math.cos(teta * i)) * Math.cos(delta * j);
				var vy1 = (this.R + this.r * Math.cos(teta * i)) * Math.sin(delta * j);
                var vz1 = this.r * Math.sin(teta * i);

                var vx2 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.cos(delta * j);
				var vy2 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.sin(delta * j);
                var vz2 = this.r * Math.sin(teta * (i + 1));

                var vx3 = (this.R + this.r * Math.cos(teta * i)) * Math.cos(delta * (j + 1));
				var vy3 = (this.R + this.r * Math.cos(teta * i)) * Math.sin(delta * (j + 1));
                //var vz3 = this.r * Math.sin(teta * i) == vz1

                var vx4 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.cos(delta * (j + 1));
				var vy4 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.sin(delta * (j + 1));
                //var vz4 = this.r * Math.sin(teta * (i + 1)) == vz2

				this.vertices.push(vx1, vy1, vz1);
				this.vertices.push(vx2, vy2, vz2);
				this.vertices.push(vx3, vy3, vz1);
				this.vertices.push(vx4, vy4, vz2);

				//Indexes
				this.indices.push(ind + 2, ind + 1, ind);
				this.indices.push(ind + 1, ind + 2, ind + 3);	
				ind += 4;
	
                //Normals
                var vx1 = this.r * Math.cos(teta * i) * Math.cos(delta * j);
                var vz1 = this.r * Math.sin(teta * i);
                var vy1 = this.r * Math.cos(teta * i) * Math.sin(delta * j);
                //Convert to versor
                var length = Math.sqrt(Math.pow(vx1, 2.0) + Math.pow(vy1, 2.0) + Math.pow(vz1, 2.0));
                vx1 /= length;
                vy1 /= length;
                vz1 /= length;

                var vx2 = this.r * Math.cos(teta * (i + 1)) * Math.cos(delta * j);
                var vz2 = this.r * Math.sin(teta * (i + 1));
                var vy2 = this.r * Math.cos(teta * (i + 1)) * Math.sin(delta * j);
                //Convert to versor
                length = Math.sqrt(Math.pow(vx2, 2.0) + Math.pow(vy2, 2.0) + Math.pow(vz2, 2.0));
                vx2 /= length;
                vy2 /= length;
                vz2 /= length;           

                var vx3 = this.r * Math.cos(teta * i) * Math.cos(delta * (j + 1));
                var vz3 = this.r * Math.sin(teta * i);
                var vy3 = this.r * Math.cos(teta * i) * Math.sin(delta * (j + 1));
                //Convert to versor
                length = Math.sqrt(Math.pow(vx3, 2.0) + Math.pow(vy3, 2.0) + Math.pow(vz3, 2.0));
                vx3 /= length;
                vy3 /= length;
                vz3 /= length;

                var vx4 = this.r * Math.cos(teta * (i + 1)) * Math.cos(delta * (j + 1));
                var vz4 = this.r * Math.sin(teta * (i + 1));
                var vy4 = this.r * Math.cos(teta * (i + 1)) * Math.sin(delta * (j + 1));
                //Convert to versor
                length = Math.sqrt(Math.pow(vx4, 2.0) + Math.pow(vy4, 2.0) + Math.pow(vz4, 2.0));
                vx4 /= length;
                vy4 /= length;
                vz4 /= length;

				this.normals.push(vx1, vy1, vz1);
				this.normals.push(vx2, vy2, vz2);
				this.normals.push(vx3, vy3, vz3);
				this.normals.push(vx4, vy4, vz4);

				//Texture Coordinates
				this.texCoords.push(sliceHeight * i, stackHeight * j);
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
				this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
			}
		}
	};

};
