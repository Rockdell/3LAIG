
class MyLight {

    constructor(id, enabled) {
        this.id = id;
        this.enabled = enabled;
        this.location = null;
        this.ambient = null;
        this.diffuse = null
        this.specular = null;
    }

    setLocation(xyz) {
        this.location = xyz;
    }

    setAmbient(rgba) {
        this.ambient = rgba;
    }

    setDiffuse(rgba) {
        this.diffuse = rgba;
    }

    setSpecular(rgba) {
        this.specular = rgba;
    }
}

class MyOmni extends MyLight {

    constructor(id, enabled) {
        super(id, enabled);
    }
}

class MySpot extends MyLight {

    constructor(id, enabled, angle, exponent) {
        super(id, enabled);

        this.angle = angle;
        this.exponent = exponent;
        this.target = null;
    }

    setTarget(xyz) {
        this.target = xyz;
    }
}