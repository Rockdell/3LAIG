/**
 * MyPieceModel
 */
class MyPieceModel {

    constructor(xi, zi, direction, color, pickingID) {
        this.x = xi;
        this.z = zi;
        this.direction = direction;
        this.color = color;
        this.pickingID = pickingID;

        this.animation = null;
    }

    moveTo(xf, zf) {
        this.animation = new ArchAnimation(MyGameView.getInstance().scene, 1.5, 2, this.x, this.z, xf, zf);
        this.animation.animating = true;

        // this.x = xf;
        // this.z = zf;
    }

    handleAnimation(elapsedTime) {
        if (this.animation != null) {
            if (this.animation.animating == true)
                this.animation.update(elapsedTime);
            else {
                this.x = this.animation.xf;
                this.z = this.animation.zf;
                this.animation = null;
            }
        }
    }
}