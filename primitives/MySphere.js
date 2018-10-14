/**
 * MySphere
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MySphere extends CGFobject
{
	constructor(scene, radius, slices, stacks)
	{
        super(scene);
        this.radius = radius;
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

	drawFace()
	{
		var alpha = (2 * Math.PI) / this.slices;
		var beta = Math.PI / this.stacks;
		var stackHeight;
		var stackHeight2;
		var sliceHeight = 1 / this.slices;
		var ind = 0;  

		for (let j = 0; j < this.stacks; j++)
		{
			for (let i = 0; i < this.slices; i++)
			{
				//Vertices
				stackHeight = this.radius * Math.cos(beta * j);
				stackHeight2 = this.radius * Math.cos(beta * (j + 1));
				var vz1 = stackHeight;
				var vz2 = stackHeight2;

				var stack_radius1 = Math.sqrt(this.radius * this.radius - vz1 * vz1);
				var stack_radius2 = Math.sqrt(this.radius * this.radius - vz2 * vz2);

				var vx1 = Math.cos(i * alpha);
				var vx2 = Math.cos((i + 1) * alpha);
				var vy1 = Math.sin(i * alpha);
				var vy2 = Math.sin((i + 1) * alpha);

				this.vertices.push(stack_radius1 * vx1, stack_radius1 * vy1, vz1);
				this.vertices.push(stack_radius1 * vx2, stack_radius1 * vy2, vz1);
				this.vertices.push(stack_radius2 * vx1, stack_radius2 * vy1, vz2);
				this.vertices.push(stack_radius2 * vx2, stack_radius2 * vy2, vz2);

				//Indexes
				this.indices.push(ind + 2, ind + 1, ind);
				this.indices.push(ind + 1, ind + 2, ind + 3);
				ind += 4;
	
				//Normals
				this.normals.push(vx1/this.radius, vy1/this.radius, vz1/this.radius);
				this.normals.push(vx2/this.radius, vy2/this.radius, vz1/this.radius);
				this.normals.push(vx1/this.radius, vy1/this.radius, vz2/this.radius);
				this.normals.push(vx2/this.radius, vy2/this.radius, vz2/this.radius);

				//Texture Coordinates
				stackHeight = 1 / this.stacks;

				this.texCoords.push(sliceHeight * i, stackHeight * j);
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
				this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
				this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
			}
		}

	// 	var alpha = (2 * Math.PI) / this.slices;
	// 	var beta = Math.PI / this.stacks;
	// 	var stackHeight;
	// 	var stackHeight2;
	// 	var sliceHeight = 1 / this.slices;
    //  var ind = 0;  
        
    //     //1 lado
	// 	for (let j = 0; j < this.stacks/2; j++)
	// 	{
	// 		for (let i = 0; i < this.slices; i++)
	// 		{
	// 			//Vertices
	// 			stackHeight = this.radius * Math.sin(beta * j);
	// 			stackHeight2 = this.radius * Math.sin(beta * (j + 1));
	// 			var vz1 = this.radius * Math.sin(beta * j);
	// 			var vz2 = this.radius * Math.sin(beta * (j + 1));

	// 			var stack_radius1 = Math.sqrt(this.radius * this.radius - vz1 * vz1);
	// 			var stack_radius2 = Math.sqrt(this.radius * this.radius - vz2 * vz2);

	// 			var vx1 = Math.cos(i * alpha);
	// 			var vx2 = Math.cos((i + 1) * alpha);
	// 			var vy1 = Math.sin(i * alpha);
	// 			var vy2 = Math.sin((i + 1) * alpha);

	// 			this.vertices.push(stack_radius1 * vx1, stack_radius1 * vy1, vz1);
	// 			this.vertices.push(stack_radius1 * vx2, stack_radius1 * vy2, vz1);
	// 			this.vertices.push(stack_radius2 * vx1, stack_radius2 * vy1, vz2);
	// 			this.vertices.push(stack_radius2 * vx2, stack_radius2 * vy2, vz2);

	// 			//Indexes
	// 			this.indices.push(ind, ind + 1, ind + 2);
	// 			this.indices.push(ind + 3, ind + 2, ind + 1);
	// 			ind += 4;
	
	// 			//Normals
	// 			this.normals.push(vx1/this.radius, vy1/this.radius, vz1/this.radius);
	// 			this.normals.push(vx2/this.radius, vy2/this.radius, vz1/this.radius);
	// 			this.normals.push(vx1/this.radius, vy1/this.radius, vz2/this.radius);
	// 			this.normals.push(vx2/this.radius, vy2/this.radius, vz2/this.radius);

	// 			//Texture Coordinates
	// 			this.texCoords.push(sliceHeight * i, stackHeight * j);
	// 			this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
	// 			this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
	// 			this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
	// 		}
    //     }
        
    //     //2 lado
    //     for (let j = 0; j < this.stacks/2; j++)
	// 	{
	// 		for (let i = 0; i < this.slices; i++)
	// 		{
	// 			//Vertices
	// 			stackHeight = this.radius * Math.sin(beta * j);
	// 			stackHeight2 = this.radius * Math.sin(beta * (j + 1));
				
	// 			var vz1 = -stackHeight;
	// 			var vz2 = -stackHeight2;

	// 			var stack_radius1 = Math.sqrt(this.radius * this.radius - vz1 * vz1);
	// 			var stack_radius2 = Math.sqrt(this.radius * this.radius - vz2 * vz2);

	// 			var vx1 = Math.cos(i * alpha);
	// 			var vx2 = Math.cos((i + 1) * alpha);
	// 			var vy1 = Math.sin(i * alpha);
	// 			var vy2 = Math.sin((i + 1) * alpha);

	// 			this.vertices.push(stack_radius1 * vx1, stack_radius1 * vy1, vz1);
	// 			this.vertices.push(stack_radius1 * vx2, stack_radius1 * vy2, vz1);
	// 			this.vertices.push(stack_radius2 * vx1, stack_radius2 * vy1, vz2);
	// 			this.vertices.push(stack_radius2 * vx2, stack_radius2 * vy2, vz2);

                
	// 			//Indexes
	// 			this.indices.push(ind + 2, ind + 1, ind);
	// 			this.indices.push(ind + 1, ind + 2, ind + 3);
	// 			ind += 4;
	
	// 			//Normals
	// 			this.normals.push(vx1/this.radius, vy1/this.radius, -vz1/this.radius);
	// 			this.normals.push(vx2/this.radius, vy2/this.radius, -vz1/this.radius);
	// 			this.normals.push(vx1/this.radius, vy1/this.radius, -vz2/this.radius);
	// 			this.normals.push(vx2/this.radius, vy2/this.radius, -vz2/this.radius);

	// 			//Texture Coordinates
	// 			this.texCoords.push(sliceHeight * i, stackHeight * j);
	// 			this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
	// 			this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
	// 			this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
	// 		}
    //     }

	//------------------------------------

		// var alpha = (2 * Math.PI) / this.slices;
		// var beta = Math.PI / this.stacks;
		// var stackHeight;
		// var stackHeight2;

        // var teta = (2.0 * Math.PI) / this.slices;
        // var delta =  Math.PI / this.stacks;

		// var stackHeight = 1.0 / this.stacks;
		// var sliceHeight = 1.0 / this.slices;
        // var ind = 0;
        
        // for (let j = 0; j < this.stacks; j++)
		// {
		// 	for (let i = 0; i < this.slices; i++)
		// 	{
		// 		//Vertices
		// 		var vx1 = this.r * Math.cos(teta * i) * Math.sin(delta * j);
		// 		var vz1 = this.r * Math.sin(teta * i) * Math.sin(delta * j);
        //         var vy1 = this.r * Math.sin(teta * i);

        //         var vx2 = this.r * Math.cos(teta * (i + 1)) * Math.sin(delta * j);
		// 		var vz2 = this.r * Math.sin(teta * (i + 1)) * Math.sin(delta * j);
        //         var vy2 = this.r * Math.sin(teta * (i + 1));

        //         var vx3 = this.r * Math.cos(teta * i) * Math.sin(delta * (j + 1));
		// 		var vz3 = this.r * Math.sin(teta * i) * Math.sin(delta * (j + 1));
        //         var vy3 = this.r * Math.sin(teta * i);

        //         var vx4 = this.r * Math.cos(teta * (i + 1)) * Math.sin(delta * (j + 1));
		// 		var vz4 = this.r * Math.sin(teta * (i + 1)) * Math.sin(delta * (j + 1));
        //         var vy4 = this.r * Math.sin(teta * (i + 1));

		// 		this.vertices.push(vx1, vy1, vz1);
		// 		this.vertices.push(vx2, vy2, vz2);
		// 		this.vertices.push(vx3, vy1, vz3);
		// 		this.vertices.push(vx4, vy2, vz4);

		// 		//Indexes
		// 		this.indices.push(ind, ind + 1, ind + 2);
		// 		this.indices.push(ind + 3, ind + 2, ind + 1);	
		// 		ind += 4;
	
        //         //Normals
        //         //Convert to versor
        //         vx1 /= this.r;
        //         vy1 /= this.r;
        //         vz1 /= this.r;

        //         vx2 /= this.r;
        //         vy2 /= this.r;
        //         vz2 /= this.r;           

        //         vx3 /= this.r;
        //         vy3 /= this.r;
        //         vz3 /= this.r;

        //         vx4 /= this.r;
        //         vy4 /= this.r;
        //         vz4 /= this.r;

		// 		this.normals.push(vx1, vy1, vz1);
		// 		this.normals.push(vx2, vy2, vz2);
		// 		this.normals.push(vx3, vy3, vz3);
		// 		this.normals.push(vx4, vy4, vz4);

		// 		//Texture Coordinates
		// 		this.texCoords.push(sliceHeight * i, stackHeight * j);
		// 		this.texCoords.push(sliceHeight * (i + 1), stackHeight * j);
		// 		this.texCoords.push(sliceHeight * i, stackHeight * (j + 1));
		// 		this.texCoords.push(sliceHeight * (i + 1), stackHeight * (j + 1));
		// 	}
		// }
	};
        

};
