
class MyView {

    constructor(id, near, far) {
        this.id = id;
        this.near = near;
        this.far = far;
    }
}

class MyPerspective extends MyView {

    constructor(id, near, far, angle) {
        super(id, near, far);
        this.angle = angle;
    }

    setFrom(x, y, z) {
        this.from_x = x;
        this.from_y = y;
        this.from_z = z;
    }

    setTo(x, y, z) {
        this.to_x = x;
        this.to_y = y;
        this.to_z = z;
    }
}

class MyOrtho extends MyView {

    constructor(id, near, far, left, right, top, bottom) {
        super(id, near, far);
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
}