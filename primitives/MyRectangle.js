/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyRectangle extends CGFobject {

	constructor(scene, x1, y1, x2, y2, ls, lt) {

		super(scene);

		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.ls = ls || 1.0;
		this.lt = lt || 1.0;

		this.initBuffers();
	}

	initBuffers() {

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
			0, this.lt,
			//Right lower
			this.ls, this.lt,
			//Left upper
			0, 0,
			//Rigth upper
			this.ls, 0
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	updateTextST(ls, lt) {

		this.texCoords = [
			//Left lower
			0, 1/lt,
			//Right lower
			1/ls, 1/lt,
			//Left upper
			0, 0,
			//Rigth upper
			1/ls, 0
		];

		this.updateTexCoordsGLBuffers();
	}
}
