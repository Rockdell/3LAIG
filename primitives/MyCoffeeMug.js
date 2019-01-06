/**
 * MyCoffeeMug
 */
class MyCoffeeMug extends CGFobject {

	constructor(scene) {
		super(scene);
		
		this.mug = new MyCylinder(scene, 0.4, 0.4, 0.8, 30, 30);
		this.handle = new MyCylinder(scene, 0.2, 0.2, 0.1, 30, 30);
		this.circle = new MyCircle(scene, 30);

		let coffee = new CGFtexture(this.scene, "../scenes/images/coffee_drink.jpg");
        this.coffeeAppearance = new CGFappearance(this.scene);
		this.coffeeAppearance.setTexture(coffee);
		
		let mug = new CGFtexture(this.scene, "../scenes/images/coffee_mug.png");
        this.mugAppearance = new CGFappearance(this.scene);
        this.mugAppearance.setTexture(mug);
	}

	display() {
		this.scene.pushMatrix();

			this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);
			this.mugAppearance.apply();
			this.mug.display();

			this.scene.pushMatrix();
				this.scene.rotate(-Math.PI / 2.0, 1, 0, 0);
				this.scene.translate(0.4, -0.4, -0.05, 1);
				this.handle.display();
			this.scene.popMatrix();

			this.coffeeAppearance.apply();
			this.scene.translate(0, 0, -0.195, 1);
			this.scene.scale(0.36, 0.36, 1);
			this.circle.display();

		this.scene.popMatrix();
	}

}
