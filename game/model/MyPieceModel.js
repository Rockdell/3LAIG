/**
 * MyPieceModel
 */
class MyPieceModel {

    constructor(xi, zi, direction, color, pickingID) {
        this.x = xi;
        this.yDefault = 0.5;
        this.z = zi;
        this.xf = null;
        this.zf = null;
        this.direction = direction;
        this.color = color;
        this.pickingID = pickingID;

        this.animation = null;

        this.show = true;
        this.selected = false;
    }

    setColor(color) {
        this.color = color;
    }

    setVisible(isVisible) {
        this.show = isVisible;
    }

    moveTo(xf, zf) {
        this.xf = xf;
        this.zf = zf;
        this.animation = new ArchAnimation(MyGameView.getInstance().scene, 1.5, 2, this.x, this.z, this.xf, this.zf);
        this.animation.animating = true;

        this.handleAnimation(0.000001);

        // this.x = xf;
        // this.z = zf;
    }

    scale(initialScale, endScale) {
        this.xf = this.x;
        this.zf = this.z;
        this.animation = new ScaleAnimation(MyGameView.getInstance().scene, 0.6, this.x, 0, this.z, initialScale, endScale);
        this.animation.animating = true;

        this.handleAnimation(0.000001);
    }

    handleAnimation(elapsedTime) {
        if (this.animation != null) {
            if (this.animation.animating == true)
                this.animation.update(elapsedTime);
            else {
                // MyGameModel.getInstance().setTemplateVisiblity(this.direction, true);
                this.x = this.xf;
                this.z = this.zf;
                this.animation = null;
            }
        }
    }
}