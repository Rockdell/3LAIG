/**
 * MyTorus
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject {

    constructor(scene, inner, outer, loops, slices) {

        super(scene);
        this.r = inner;
        this.R = outer;
        this.loops = loops;
        this.slices = slices;

        this.initBuffers();
    }

    initBuffers() {

        this.vertices = [];

        this.indices = [];

        this.normals = [];

        this.texCoords = [];

        this.drawFace();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    drawFace() {

        let teta = (2.0 * Math.PI) / this.loops;
        let delta = (2.0 * Math.PI) / this.slices;

        let sliceHeight = 1.0 / this.slices;
        let loopHeight = 1.0 / this.loops;
        let ind = 0;

        for (let j = 0; j < this.slices; j++) {

            for (let i = 0; i < this.loops; i++) {

                //Vertices
                var vx1 = (this.R + this.r * Math.cos(teta * i)) * Math.cos(delta * j);
                var vy1 = (this.R + this.r * Math.cos(teta * i)) * Math.sin(delta * j);
                var vz1 = this.r * Math.sin(teta * i);

                var vx2 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.cos(delta * j);
                var vy2 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.sin(delta * j);
                var vz2 = this.r * Math.sin(teta * (i + 1));

                var vx3 = (this.R + this.r * Math.cos(teta * i)) * Math.cos(delta * (j + 1));
                var vy3 = (this.R + this.r * Math.cos(teta * i)) * Math.sin(delta * (j + 1));
                //var vz3 = this.r * Math.sin(teta * i) == vz1

                var vx4 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.cos(delta * (j + 1));
                var vy4 = (this.R + this.r * Math.cos(teta * (i + 1))) * Math.sin(delta * (j + 1));
                //var vz4 = this.r * Math.sin(teta * (i + 1)) == vz2

                this.vertices.push(vx1, vy1, vz1);
                this.vertices.push(vx2, vy2, vz2);
                this.vertices.push(vx3, vy3, vz1);
                this.vertices.push(vx4, vy4, vz2);

                //Indexes
                this.indices.push(ind + 2, ind + 1, ind);
                this.indices.push(ind + 1, ind + 2, ind + 3);
                ind += 4;

                //Normals
                this.normals.push(vx1 - (this.R * Math.cos(j * delta)), vy1 - (this.R * Math.sin(j * delta)), vz1);
                this.normals.push(vx2 - (this.R * Math.cos(j * delta)), vy2 - (this.R * Math.sin(j * delta)), vz2);
                this.normals.push(vx3 - (this.R * Math.cos((j + 1) * delta)), vy3 - (this.R * Math.sin((j + 1) * delta)), vz1);
                this.normals.push(vx4 - (this.R * Math.cos((j + 1) * delta)), vy4 - (this.R * Math.sin((j + 1) * delta)), vz2);
               
                //Texture Coordinates
                this.texCoords.push(sliceHeight * j, loopHeight * i);
                this.texCoords.push(sliceHeight * j, loopHeight * (i + 1));
                this.texCoords.push(sliceHeight * (j + 1), loopHeight * i);
                this.texCoords.push(sliceHeight * (j + 1), loopHeight * (i + 1));
            }
        }
    }
}