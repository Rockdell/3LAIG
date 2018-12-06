/**
 * MyPiece
 */
class MyPiece extends CGFobject {

    constructor(scene, direction) {
        super(scene);

        this.scene = scene;
        this.direction = direction;

        this.pieceTexture = new CGFtexture(this.scene, "../scenes/images/piece.png")
        this.heightMap = new CGFtexture(this.scene, "../scenes/images/pieceHeightMap.png");

        // this.topDisk = new MyCylinder2(this.scene, 1, 0, 0, 50, 50);

        this.topDisk = new CGFnurbsObject(this.scene, 30, 30, this.generateSurface());

        // let bottom = vec3.fromValues(-0.5, 0, 0);
        // let middle = vec3.fromValues(-0.4, 0.2, 0);
        // let middle2 = vec3.fromValues(-0.1, 0.2, 0);
        // let top = vec3.fromValues(0, 0.05, 0);

        // this.topDiskVertexes = this.generateControlVertexes(bottom, middle, middle2, top);
        // this.topDisk = new MyPatch(this.scene, this.topDiskVertexes.length / 3, 3, 50, 50, this.topDiskVertexes);

        this.shader = new CGFshader(this.scene.gl, "../shaders/terrain.glsl", "../shaders/fragment.glsl");
        this.shader.setUniformsValues({uSampler2: 1, uHeightScale: 1});
    }

    generateControlVertexes(bottom, middle, middle2, top) {

        let controlVertexes = [];

        let actualMiddle = middle;

        let currAngle = 0;
        let anglePerLine = Math.PI / 24;
        console.log(bottom[0]);
        do {
            controlVertexes.push({ xx: bottom[0], yy: bottom[1], zz: bottom[2] });
            controlVertexes.push({ xx: actualMiddle[0], yy: actualMiddle[1], zz: actualMiddle[2] });
            controlVertexes.push({ xx: top[0], yy: top[1], zz: top[2] });

            bottom = this.rotateY(bottom, anglePerLine);

            middle = this.rotateY(middle, anglePerLine);
            middle2 = this.rotateY(middle2, anglePerLine);

            let currAngleDegrees = (currAngle * 180) / Math.PI;
            console.log(currAngleDegrees);

            if((currAngleDegrees >= 20 && currAngleDegrees <= 160) || (currAngleDegrees >= 200 && currAngleDegrees <= 340))
                actualMiddle = vec3.fromValues(-0.1,0.2,0 );
            else
                actualMiddle = middle;

            top = this.rotateY(top, anglePerLine);

            currAngle += anglePerLine;

        } while (currAngle < 2 * Math.PI);
        
        return controlVertexes;
    }

    rotateY(vector, angle) {
        let out = vec3.fromValues(0, 0, 0);
        
        out[0] = vector[2] * Math.sin(angle) + vector[0] * Math.cos(angle);
        out[1] = vector[1];
        out[2] = vector[2] * Math.cos(angle) - vector[0] * Math.sin(angle);

        return out;
    }

    generateSurface() {

        let uParts = 20;
        // let vParts = 10;

        let controlVertexes = [];

        var alpha = Math.PI / uParts;

        // let x = -0.5, z = 0.5;

        for (let u = 0; u <= uParts; u++) {
            let tmp = [];

            // for (let v = 0; v <= vParts; v++) {
            //     tmp.push([x, 0, z, 1]);
            //     z -= 1 / index2;
            // }

            // tmp.push([Math.cos(Math.PI - u * alpha), 0, Math.sin(Math.PI - u * alpha), 1]);
            // tmp.push([Math.cos(Math.PI + u * alpha), 0, Math.sin(Math.PI + u * alpha), 1]);

            tmp.push([-Math.cos(u * alpha), 0, Math.sin(u * alpha), 1]);

            let tmp2 = Math.PI / 6;

            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(0 * tmp2), Math.cos(0 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(1 * tmp2), Math.cos(1 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(2 * tmp2), Math.cos(2 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(3 * tmp2), Math.cos(3 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(4 * tmp2), Math.cos(4 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(5 * tmp2), Math.cos(5 * tmp2) * Math.sin(u * alpha), 1]);
            tmp.push([-Math.cos(u * alpha), 0.6 * Math.sin(u * alpha) * Math.sin(6 * tmp2), Math.cos(6 * tmp2) * Math.sin(u * alpha), 1]);

            tmp.push([-Math.cos(u * alpha), 0, -Math.sin(u * alpha), 1]);

            controlVertexes.push(tmp);
            // x += 1 / index1;
            // z = 0.5;
        }

        console.log(controlVertexes);

        return new CGFnurbsSurface(uParts, 8, controlVertexes);
    }
    
    display() {
        this.pieceTexture.bind();
        this.heightMap.bind(1);
        this.scene.setActiveShader(this.shader);

        // this.scene.pushMatrix();
        //     this.scene.rotate(Math.PI / 2.0, 1, 0, 0);
            this.topDisk.display();
        // this.scene.popMatrix();


        this.scene.setActiveShader(this.scene.defaultShader);
    }
}