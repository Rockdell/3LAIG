
class MyMaterial {

    constructor(id, shininess) {
        this.id = id;
        this.shininess = shininess;
        this.emission = null;
        this.ambient = null;
        this.diffuse = null;
        this.specular = null;
    }

    setEmission(emission) {
        this.emission = emission;
    }

    setAmbient(ambient) {
        this.ambient = ambient;
    }

    setDiffuse(diffuse) {
        this.diffuse = diffuse;
    }
    
    setSpecular(specular) {
        this.specular = specular;
    }
}