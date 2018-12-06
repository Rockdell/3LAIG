
class MyCylinder2 extends CGFobject {

	constructor(scene, base, top, height, slices, stacks) {
		super(scene);

		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;

		this.initNurbs();
	}

	initNurbs() {
		this.nurbs = new CGFnurbsObject(this.scene, this.slices, this.stacks, this.generateSurface());
	}

	generateSurface() {

		var controlVertexes = [];

		var uControlPoints = 35;
		var alpha = (2 * Math.PI) / uControlPoints;

		for (let i = 0; i <= uControlPoints; i++) {

			let partU = [];

			let vx = Math.cos(i * alpha);
			let vy = Math.sin(i * alpha);

			if (this.height > 0) {
				partU.push([vx * this.base, vy * this.base, 0, 1]);
				partU.push([vx * this.top, vy * this.top, this.height, 1]);
			}
			else {
				partU.push([vx * this.top, vy * this.top, this.height, 1]);
				partU.push([vx * this.base, vy * this.base, 0, 1]);
			}

			controlVertexes.push(partU);
		}

		return new CGFnurbsSurface(uControlPoints, 1, controlVertexes);
	}

	display() {
		this.nurbs.display();
	}
}