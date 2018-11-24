
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

        let controlVertexes = [

			[[0, this.top, this.height, 1], [0, this.base, 0, 1]],

			[[this.top, this.top, this.height, 1], [this.base, this.base, 0, 1]],

			[[this.top, 0, this.height, 1], [this.base, 0, 0, 1]],

			// [ [this.top, -this.top, this.height, 1], [this.base, -this.base, 0, 1]],

			// [[0, -this.top, this.height, 1], [0, -this.base, 0, 1]],

			// [[-this.top, -this.top, this.height, 1], [-this.base, -this.base, 0, 1]],

			// [[-this.top, 0, this.height, 1], [-this.base, 0, 0, 1]],

			// [[-this.top, this.top, this.height, 1], [-this.base, this.base, 0, 1]],

			// [[0, this.top, this.height, 1], [0, this.base, 0, 1]]
		];

        // var alpha = (2 * Math.PI) / this.slices;
        // var stackRadiusInc = (this.top - this.base) / this.stacks;
        // var stackHeight = this.height / this.stacks;

		// for (let i = 0; i <= this.slices; i++) {

		// 	let partU = [];

		// 	let vx = Math.cos(i * alpha);
		// 	let vy = Math.sin(i * alpha);
				
		// 	for (let j = 0; j <= this.stacks; j++) {

		// 		let stackRadius = this.base + j * stackRadiusInc;

		// 		let vx1 = vx * stackRadius;
		// 		let vy1 = vy * stackRadius;
		// 		let vz1 = j * stackHeight;

		// 		partU.push([vx1, vy1, vz1, 1]);
		// 	}

		// 	controlVertexes.push(partU);
		// }

		return new CGFnurbsSurface(2, 1, controlVertexes);
    }

    display() {
        this.nurbs.display();
    }
}