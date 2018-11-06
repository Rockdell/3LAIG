/**
 * MySphere
 */
class MySphere extends CGFobject {

	constructor(scene, radius, slices, stacks) {

		super(scene);
		this.radius = radius;
		this.slices = slices;
		this.stacks = stacks;
		this.initBuffers();
	}

	initBuffers() {

		this.vertices = [];

		this.indices = [];

		this.normals = [];

		this.texCoords = [];

		this.drawFace();

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	drawFace() {

		let alpha = (2 * Math.PI) / this.slices;
		let beta = Math.PI / this.stacks;
		let stackHeight;
		let stackHeight2;
		let sliceHeight = 1 / this.slices;
		let ind = 0;

		for (let j = 0; j < this.stacks; j++) {

			for (let i = 0; i < this.slices; i++) {

				//Vertices
				stackHeight = this.radius * Math.cos(beta * j);
				stackHeight2 = this.radius * Math.cos(beta * (j + 1));
				let vz1 = stackHeight;
				let vz2 = stackHeight2;

				let stack_radius1 = Math.sqrt(this.radius * this.radius - vz1 * vz1);
				let stack_radius2 = Math.sqrt(this.radius * this.radius - vz2 * vz2);

				let vx1 = Math.cos(i * alpha);
				let vx2 = Math.cos((i + 1) * alpha);
				let vy1 = Math.sin(i * alpha);
				let vy2 = Math.sin((i + 1) * alpha);

				this.vertices.push(stack_radius1 * vx1, stack_radius1 * vy1, vz1);
				this.vertices.push(stack_radius1 * vx2, stack_radius1 * vy2, vz1);
				this.vertices.push(stack_radius2 * vx1, stack_radius2 * vy1, vz2);
				this.vertices.push(stack_radius2 * vx2, stack_radius2 * vy2, vz2);

				//Indexes
				this.indices.push(ind + 2, ind + 1, ind);
				this.indices.push(ind + 1, ind + 2, ind + 3);
				ind += 4;

				//Normals
				this.normals.push(vx1 / this.radius, vy1 / this.radius, vz1 / this.radius);
				this.normals.push(vx2 / this.radius, vy2 / this.radius, vz1 / this.radius);
				this.normals.push(vx1 / this.radius, vy1 / this.radius, vz2 / this.radius);
				this.normals.push(vx2 / this.radius, vy2 / this.radius, vz2 / this.radius);

				//Texture Coordinates
				stackHeight = 1 / this.stacks;

				this.texCoords.push(1 - sliceHeight * i, 1 - stackHeight * j);
				this.texCoords.push(1 - sliceHeight * (i + 1), 1 - stackHeight * j);
				this.texCoords.push(1 - sliceHeight * i, 1 - stackHeight * (j + 1));
				this.texCoords.push(1 - sliceHeight * (i + 1), 1 - stackHeight * (j + 1));
			}
		}
	}
}
