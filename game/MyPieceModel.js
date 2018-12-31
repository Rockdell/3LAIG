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
    }

    move(xf, zf) {
        this.x = xf;
        this.z = zf;
    }
}