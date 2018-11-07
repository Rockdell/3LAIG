
class MyCilinder2 {

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
        this.nurbs = new CGFnurbsObject();
    }

    generateSurface() {

        var alpha = (2 * Math.PI) / this.slices;
        var stackRadiusInc = (this.top - this.base) / this.stacks;
        var stackHeight = this.height / this.stacks;

        for (let j = 0; j < this.stacks; j++) {
			let stackRadius = this.base + j * stackRadiusInc;
			let stackRadiusNext = this.base + (j + 1) * stackRadiusInc;

			for (let i = 0; i < this.slices; i++) {
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
			}
		}


    }

    display() {
        this.nurbs.display();
    }
}