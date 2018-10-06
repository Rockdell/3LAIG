
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
        this.from = null;
        this.to = null;
    }

    setFrom(from) {
        this.from = from;
    }
    
    setTo(to) {
        this.to = to;
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